"use client";

import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type Props = {
  filedId: any;
  commandToSave: boolean;
  setcommandToSave: (value: boolean) => void;
};

export default function Whiteboard({
  filedId,
  commandToSave,
  setcommandToSave,
}: Props) {
  const [updateWhite, setUpdateWhiteBord] = useState<any>();
  const [fileData, setFileData] = useState<any>(null);

  const handleUpdate = async () => {
    try {
      await fetch(`/api/files/${filedId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whiteboard: JSON.stringify(updateWhite) })
      });
      toast.success("file updated");
      setcommandToSave(false);
      console.log("✅ Whiteboard saved");
    } catch (err) {
      console.error("❌ Save error:", err);
    }
  };

  useEffect(() => {
    commandToSave && handleUpdate();
  }, [commandToSave]);

  const fetchFile = async () => {
    try {
      const res = await fetch(`/api/files/${filedId}`);
      if (!res.ok) throw new Error("File not found");
      const result = await res.json();
      setFileData(result);
    } catch (error) {
      console.error("❌ Failed to fetch file:", error);
      toast.error("Failed to load file");
    }
  };

  useEffect(() => {
    fetchFile();
  }, []);

  const myObj = useMemo(() => {
    try {
      return fileData?.whiteboard ? JSON.parse(fileData.whiteboard) : null;
    } catch (err) {
      console.error("Invalid JSON in whiteboard:", err);
      return null;
    }
  }, [fileData]);

  return (
    <div className="h-full w-full">
      {fileData && (
        <Excalidraw
          initialData={{
            elements: myObj
          }}
          onChange={(excalidrawElements) =>
            // @ts-ignore
            setUpdateWhiteBord(excalidrawElements)
          }
          theme="dark"
        />
      )}
    </div>
  );
}
