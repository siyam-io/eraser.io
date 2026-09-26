"use client";

import { useEffect, useRef, useState } from "react";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Paragraph from "@editorjs/paragraph";
import CodeTool from "@editorjs/code";
import ImageTool from "@editorjs/image";
import Table from "@editorjs/table";
import Quote from "@editorjs/quote";

import { toast } from "sonner";
import Loader from "@/app/(routes)/dashboard/_components/Loader";

export default function EditorComponent({ filedId, commandToSave, setcommandToSave }: any) {
  const editorRef = useRef<EditorJS | null>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [fileData, setFileData] = useState<any>(null);
  const editorHolder = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [now, setnow] = useState<any>();

  useEffect(() => {
    setnow(Date.now() + (performance.now() % 1));
  }, [commandToSave]);

  const fetchFile = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/files/${filedId}`);
      if (!res.ok) throw new Error("File not found");
      const result = await res.json();
      setFileData(result);
    } catch (error) {
      toast.error("Failed to load file");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFile();
  }, [filedId]);

  useEffect(() => {
    if (!editorRef.current && editorHolder.current && fileData !== null) {
      let parsedData = { blocks: [] };
      try {
        if (fileData.document) {
          const temp = JSON.parse(fileData.document);
          if (temp && typeof temp === "object" && "blocks" in temp) {
            parsedData = temp;
          }
        }
      } catch (error) {}

      const editor = new EditorJS({
        holder: editorHolder.current,
        data: parsedData as any,
        placeholder: "Start typing here to create your document...",
        tools: {
          header: {
            // @ts-expect-error Editor.js tool typings require a config arg that the plugin constructor does not declare
            class: Header,
            config: {
              placeholder: 'Enter a heading',
              levels: [1, 2, 3, 4],
              defaultLevel: 2
            }
          },
          paragraph: Paragraph,
          list: List,
          code: CodeTool,
          table: Table,
          quote: Quote,
        },
        onReady: () => {
          editorRef.current = editor;
          setIsEditorReady(true);
        },
      });

      return () => {
        editorRef.current?.destroy();
        editorRef.current = null;
      };
    }
  }, [fileData]);

  const handleSave = async () => {
    if (!filedId || !editorRef.current) return;
    try {
      const content = await editorRef.current.save();
      await fetch(`/api/files/${filedId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document: JSON.stringify(content), editedAt: new Date() })
      });
      toast.success("Document saved successfully");
      setcommandToSave(false);
    } catch (error) {
      console.error("Failed to save:", error);
    }
  };

  useEffect(() => {
    if (commandToSave) handleSave();
  }, [commandToSave]);

  if (loading) return <div className="p-8 flex justify-center"><Loader /></div>;

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
