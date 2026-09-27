"use client";

import { useEffect, useRef, useState } from "react";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Paragraph from "@editorjs/paragraph";
import CodeTool from "@editorjs/code";
import Table from "@editorjs/table";
import Quote from "@editorjs/quote";
import { useMutation, useStorage } from "@liveblocks/react";

import { toast } from "sonner";
import Loader from "@/app/(routes)/dashboard/_components/Loader";
import {
  blockSignature,
  mergeRemoteBlocks,
  parseStoredArray,
  pushBlocksToList,
  sameContent,
} from "@/lib/collab";

type Props = {
  filedId: any;
  collabEnabled: boolean;
  commandToSave: boolean;
  setcommandToSave: (value: boolean) => void;
  /** True for a link-holder with view-only rights. */
  readOnly?: boolean;
};

/** The subset the single-user editor needs. */
type StandaloneProps = Pick<
  Props,
  "filedId" | "commandToSave" | "setcommandToSave" | "readOnly"
>;

/** How long typing must pause before a block change is broadcast. */
const PUSH_DEBOUNCE_MS = 400;

// Editor.js tool typings disagree with the plugin constructors' signatures, so
// the map is intentionally loose (previously suppressed per-tool with ts-expect-error).
const editorTools: Record<string, any> = {
  header: {
    class: Header,
    config: {
      placeholder: "Enter a heading",
      levels: [1, 2, 3, 4],
      defaultLevel: 2,
    },
  },
  paragraph: Paragraph,
  list: List,
  code: CodeTool,
  table: Table,
  quote: Quote,
};

export default function EditorComponent(props: Props) {
  return props.collabEnabled ? (
    <CollaborativeEditor filedId={props.filedId} readOnly={props.readOnly} />
  ) : (
    <StandaloneEditor
      filedId={props.filedId}
      readOnly={props.readOnly}
      commandToSave={props.commandToSave}
      setcommandToSave={props.setcommandToSave}
    />
  );
}

/**
 * Multiplayer document.
 *
 * Editor.js has no CRDT binding, so collaboration is done at block level: we
 * diff `editor.save()` against the shared list and broadcast only real block
 * changes. Incoming changes are applied with `render()`, which is skipped
 * while the local user is mid-edit (deferred until they blur) so remote
 * updates never yank the caret out from under them.
 */
function CollaborativeEditor({ filedId, readOnly = false }: { filedId: any; readOnly?: boolean }) {
  const editorRef = useRef<EditorJS | null>(null);
  const editorHolder = useRef<HTMLDivElement>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);

  const blocks = useStorage((root) => root.documentBlocks);

  const knownIds = useRef<Set<string>>(new Set());
  const pendingRemote = useRef<any[] | null>(null);
  const pushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pushBlocks = useMutation(({ storage }, updated: readonly any[]) => {
    try {
      const list = storage?.get("documentBlocks");
      if (!list) return;
      pushBlocksToList(list, updated);
    } catch (err) {
      console.warn("[collab] storage not ready for document mutation:", err);
    }
  }, []);

  const schedulePush = useRef(() => {});
  schedulePush.current = () => {
    if (pushTimer.current) clearTimeout(pushTimer.current);
    pushTimer.current = setTimeout(async () => {
      pushTimer.current = null;
      const editor = editorRef.current;
      if (!editor) return;
      if (blocks === null) return;
      try {
        const data = await editor.save();
        pushBlocks(data.blocks ?? []);
      } catch (error) {
        console.error("[collab] failed to broadcast document change:", error);
      }
    }, PUSH_DEBOUNCE_MS);
  };

  // Excalidraw and Editor.js both only read their initial data once.
  const initialBlocksRef = useRef<readonly any[] | null>(null);
  if (initialBlocksRef.current === null && blocks !== null) {
    initialBlocksRef.current = blocks;
  }

  useEffect(() => {
    if (editorRef.current || !editorHolder.current) return;


    const editor = new EditorJS({
      holder: editorHolder.current,
      data: { blocks: initialBlocksRef.current as any },
      placeholder: "Start typing here to create your document...",
      tools: editorTools,
      // Read-only visitors can still watch live edits arrive, but never
      // broadcast any of their own.
      readOnly,
      onChange: readOnly ? undefined : () => schedulePush.current(),
      onReady: () => {
        editorRef.current = editor;
        setIsEditorReady(true);
      },
    });

    return () => {
      if (pushTimer.current) clearTimeout(pushTimer.current);
      editorRef.current?.destroy();
      editorRef.current = null;
    };
  }, []);

  const applyRemote = async (remote: readonly any[]) => {
    const editor = editorRef.current;
    if (!editor) return;

    const snapshot = await editor.save();
    if (editorRef.current !== editor) return;

    const local = snapshot.blocks ?? [];
    if (sameContent(remote, local, blockSignature)) return;

    if (editorHolder.current?.contains(document.activeElement)) {
      // Mid-edit: hold the update until the user stops typing.
      pendingRemote.current = [...remote];
      return;
    }

    pendingRemote.current = null;
    await editor.render({ blocks: [...remote] } as any);
  };

  useEffect(() => {
    if (!isEditorReady) return;

    const remote = blocks ?? [];
    knownIds.current = new Set(remote.map((block) => block.id as string));
    void applyRemote(remote);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks, isEditorReady]);

  // Flush any deferred remote change once the user leaves the block.
  const handleBlur = () => {
    const deferred = pendingRemote.current;
    if (deferred) void applyRemote(deferred);
  };

  void filedId;

  if (blocks === null) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#090909]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="w-full h-full text-zinc-200" onBlur={handleBlur}>
      <div
        id="editorjs"
        className="prose prose-invert prose-blue max-w-[800px] mx-auto px-8 md:px-16 py-10 outline-none editor-container"
        ref={editorHolder}
      />
    </div>
  );
}

/** Original save-on-click editor, unchanged, for when Liveblocks is absent. */
function StandaloneEditor({
  filedId,
  commandToSave,
  setcommandToSave,
  readOnly = false,
}: StandaloneProps) {
  const editorRef = useRef<EditorJS | null>(null);
  const [fileData, setFileData] = useState<any>(null);
  const editorHolder = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  const fetchFile = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/files/${filedId}`);
      if (!res.ok) throw new Error("File not found");
      setFileData(await res.json());
    } catch (error) {
      toast.error("Failed to load file");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filedId]);

  useEffect(() => {
    if (!editorRef.current && editorHolder.current && fileData !== null) {
      const editor = new EditorJS({
        holder: editorHolder.current,
        data: { blocks: parseStoredArray(fileData.document) } as any,
        placeholder: "Start typing here to create your document...",
        tools: editorTools,
        readOnly,
        onReady: () => {
          editorRef.current = editor;
        },
      });

      return () => {
        editorRef.current?.destroy();
        editorRef.current = null;
      };
    }
  }, [fileData]);

  const handleSave = async () => {
    if (!filedId || !editorRef.current || readOnly) return;
    try {
      const content = await editorRef.current.save();
      await fetch(`/api/files/${filedId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document: JSON.stringify(content), editedAt: new Date() }),
      });
      toast.success("Document saved successfully");
      setcommandToSave(false);
    } catch (error) {
      console.error("Failed to save:", error);
    }
  };

  useEffect(() => {
    if (commandToSave) handleSave();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commandToSave]);

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="w-full h-full text-zinc-200">
      <div
        id="editorjs"
        className="prose prose-invert prose-blue max-w-[800px] mx-auto px-8 md:px-16 py-10 outline-none editor-container"
        ref={editorHolder}
      />
    </div>
  );
}
