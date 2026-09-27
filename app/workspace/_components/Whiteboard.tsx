"use client";

import dynamic from "next/dynamic";
import "@excalidraw/excalidraw/index.css";
import { useMutation, useStorage } from "@liveblocks/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  elementSignature,
  mergeRemoteElements,
  parseStoredArray,
  pushElementsToList,
  sameContent,
} from "@/lib/collab";
import Loader from "@/app/(routes)/dashboard/_components/Loader";

// Dynamic import with SSR disabled stops browser-level event thrashing on mount
const Excalidraw = dynamic(
  () => import("@excalidraw/excalidraw").then((mod) => mod.Excalidraw),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-[#121212]">
        <Loader />
      </div>
    ),
  }
);

type Props = {
  filedId: any;
  collabEnabled: boolean;
  commandToSave: boolean;
  setcommandToSave: (value: boolean) => void;
  /** True for a link-holder with view-only rights. */
  readOnly?: boolean;
};

/** The subset the single-user canvas needs. */
type StandaloneProps = Pick<
  Props,
  "filedId" | "commandToSave" | "setcommandToSave" | "readOnly"
>;

export default function Whiteboard(props: Props) {
  return props.collabEnabled ? (
    <CollaborativeWhiteboard filedId={props.filedId} readOnly={props.readOnly} />
  ) : (
    <StandaloneWhiteboard
      filedId={props.filedId}
      readOnly={props.readOnly}
      commandToSave={props.commandToSave}
      setcommandToSave={props.setcommandToSave}
    />
  );
}

/**
 * Multiplayer canvas.
 */
function CollaborativeWhiteboard({
  filedId,
  readOnly = false,
}: {
  filedId: any;
  readOnly?: boolean;
}) {
  const elements = useStorage((root) => root.whiteboardElements);

  // Store Excalidraw API in a ref instead of state to prevent re-render cycles
  const excalidrawAPIRef = useRef<any>(null);

  /** Set while applying remote changes to prevent echo */
  const isRemoteUpdate = useRef(false);
  /** Track IDs known by the room */
  const knownIds = useRef<Set<string>>(new Set());
  /** Stable ref to elements so handleChange doesn't recreate on each sync */
  const elementsRef = useRef(elements);
  /** Cache the last array pushed to Liveblocks */
  const lastPushedElementsRef = useRef<readonly any[] | null>(null);

  useEffect(() => {
    elementsRef.current = elements;
  }, [elements]);

  const pushElements = useMutation(({ storage }, updated: readonly any[]) => {
    try {
      let list = storage?.get("whiteboardElements") as any;
      if (!list) {
        console.warn("[collab] whiteboardElements is null/undefined in storage");
        return;
      }

      if (typeof list.get !== "function") {
        console.warn("[collab] whiteboardElements is a plain array – upgrading to LiveList");
        const { LiveList: LL } = require("@liveblocks/client");
        const seed = Array.isArray(list) ? [...list] : [];
        const newList = new LL(seed);
        storage.set("whiteboardElements", newList);
        list = newList;
      }

      pushElementsToList(list, updated);
    } catch (err) {
      console.error("[collab] pushElementsToList error:", err);
    }
  }, []);

  // Excalidraw reads initialData once at mount
  const initialElementsRef = useRef<readonly any[] | null>(null);
  if (initialElementsRef.current === null && elements !== null) {
    initialElementsRef.current = elements;
  }

  // Stable reference so Excalidraw does not detect object reference changes
  const initialData = useMemo(
    () => ({ elements: initialElementsRef.current ?? [] }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleChange = useCallback(
    (updated: readonly any[]) => {
      if (isRemoteUpdate.current) return;
      if (readOnly) return;
      if (!elementsRef.current) return;

      const currentStorage = elementsRef.current;
      if (
        sameContent(updated, currentStorage, elementSignature) ||
        (lastPushedElementsRef.current &&
          sameContent(updated, lastPushedElementsRef.current, elementSignature))
      ) {
        return;
      }

      lastPushedElementsRef.current = updated;
      pushElements(updated);
    },
    [pushElements, readOnly]
  );

  // Sync changes from Liveblocks into Excalidraw
  useEffect(() => {
    const api = excalidrawAPIRef.current;
    if (!api || elements === null) return;

    const remote = elements;
    const local = (api.getSceneElements() ?? []) as readonly any[];
    const merged = mergeRemoteElements(remote, local, knownIds.current);

    if (!sameContent(merged, local, elementSignature)) {
      isRemoteUpdate.current = true;
      api.updateScene({ elements: merged });
      lastPushedElementsRef.current = merged;

      const timer = setTimeout(() => {
        isRemoteUpdate.current = false;
      }, 60);

      return () => clearTimeout(timer);
    }

    knownIds.current = new Set(remote.map((element: any) => element.id as string));
  }, [elements]);

  void filedId;

  if (elements === null) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#121212]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <Excalidraw
        excalidrawAPI={(api) => {
          excalidrawAPIRef.current = api;
        }}
        initialData={initialData}
        onChange={handleChange as any}
        viewModeEnabled={readOnly}
        theme="dark"
      />
    </div>
  );
}

/** Original save-on-click canvas, unchanged, for when Liveblocks is absent. */
function StandaloneWhiteboard({
  filedId,
  commandToSave,
  setcommandToSave,
  readOnly = false,
}: StandaloneProps) {
  const [updateWhite, setUpdateWhiteBord] = useState<any>();
  const [fileData, setFileData] = useState<any>(null);

  const handleUpdate = async () => {
    try {
      await fetch(`/api/files/${filedId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whiteboard: JSON.stringify(updateWhite) }),
      });
      toast.success("file updated");
      setcommandToSave(false);
    } catch (err) {
      console.error("❌ Save error:", err);
    }
  };

  useEffect(() => {
    if (commandToSave) handleUpdate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commandToSave]);

  const fetchFile = async () => {
    try {
      const res = await fetch(`/api/files/${filedId}`);
      if (!res.ok) throw new Error("File not found");
      setFileData(await res.json());
    } catch (error) {
      console.error("❌ Failed to fetch file:", error);
      toast.error("Failed to load file");
    }
  };

  useEffect(() => {
    fetchFile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initialElements = useMemo(
    () => parseStoredArray(fileData?.whiteboard),
    [fileData]
  );

  return (
    <div className="h-full w-full">
      {fileData && (
        <Excalidraw
          initialData={{ elements: initialElements as any }}
          onChange={(excalidrawElements) => setUpdateWhiteBord(excalidrawElements)}
          viewModeEnabled={readOnly}
          theme="dark"
        />
      )}
    </div>
  );
}