"use client";

import React, { useState, useEffect } from "react";
import WorkspaceHeader from "../_components/WorkspaceHeader";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { LayoutTemplate, Maximize2, Minimize2, Pencil } from "lucide-react";

const EditorComponent = dynamic(() => import("../_components/EditorComponent"), { ssr: false });
const Whiteboard = dynamic(() => import("../_components/Whiteboard"), { ssr: false });

export default function WorkspacePage() {
  const { filedId } = useParams();
  const [commandToSave, setcommandToSave] = useState<boolean>(false);
  const [fileData, setFileData] = useState<any>(null);
  const [maximizedPanel, setMaximizedPanel] = useState<'none' | 'document' | 'canvas'>('none');

  useEffect(() => {
    const fetchFile = async () => {
      if (filedId) {
        const res = await fetch(`/api/files/${filedId}`);
        if (res.ok) {
          const result = await res.json();
          setFileData(result);
          // Record the open so this file shows up under "Recent".
          fetch(`/api/files/${filedId}/open`, { method: "POST" }).catch(() => {});
        }
      }
    };
    fetchFile();
  }, [filedId]);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0E0E0E] overflow-hidden font-sans">
      <WorkspaceHeader 
        setcommandToSave={setcommandToSave} 
        fileName={fileData?.fileName} 
      />
      
      <div className="flex-1 h-[calc(100vh-3.5rem)] w-full">
        <PanelGroup direction="horizontal" className="h-full w-full">
          {/* Document Panel */}
          {maximizedPanel !== 'canvas' && (
            <Panel defaultSize={maximizedPanel === 'document' ? 100 : 40} minSize={20} className="h-full bg-[#090909] flex flex-col relative transition-all duration-300">
              <div className="absolute top-4 left-6 z-10 flex items-center justify-between w-[calc(100%-3rem)] pointer-events-none">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900/60 backdrop-blur-md rounded-md border border-zinc-800 shadow-sm">
                  <Pencil size={12} className="text-blue-400" />
                  <h2 className="text-zinc-300 text-[10px] font-bold uppercase tracking-widest">Document</h2>
                </div>
                <button 
                  onClick={() => setMaximizedPanel(maximizedPanel === 'document' ? 'none' : 'document')}
                  className="pointer-events-auto p-1.5 bg-zinc-900/60 hover:bg-zinc-800 backdrop-blur-md rounded-md border border-zinc-800 shadow-sm text-zinc-400 hover:text-white transition-colors"
                  title={maximizedPanel === 'document' ? "Restore Split View" : "Maximize Document"}
                >
                  {maximizedPanel === 'document' ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar mt-14">
                <EditorComponent 
                  filedId={filedId} 
                  commandToSave={commandToSave}   
                  setcommandToSave={setcommandToSave}
                />
              </div>
            </Panel>
          )}

          {/* Resizer */}
          {maximizedPanel === 'none' && (
            <PanelResizeHandle className="w-1.5 bg-zinc-800/80 hover:bg-blue-600 transition-colors cursor-col-resize active:bg-blue-500 z-50 flex items-center justify-center">
              <div className="h-8 w-0.5 bg-zinc-600 rounded-full" />
            </PanelResizeHandle>
          )}

          {/* Whiteboard Panel */}
          {maximizedPanel !== 'document' && (
            <Panel defaultSize={maximizedPanel === 'canvas' ? 100 : 60} minSize={30} className="h-full relative bg-[#121212] transition-all duration-300">
              <div className="absolute top-4 left-4 z-10 flex items-center justify-between w-[calc(100%-2rem)] pointer-events-none">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900/60 backdrop-blur-md rounded-md border border-zinc-800 shadow-sm">
                  <LayoutTemplate size={12} className="text-purple-400" />
                  <h2 className="text-zinc-300 text-[10px] font-bold uppercase tracking-widest">Canvas</h2>
                </div>
                <button 
                  onClick={() => setMaximizedPanel(maximizedPanel === 'canvas' ? 'none' : 'canvas')}
                  className="pointer-events-auto p-1.5 bg-zinc-900/60 hover:bg-zinc-800 backdrop-blur-md rounded-md border border-zinc-800 shadow-sm text-zinc-400 hover:text-white transition-colors"
                  title={maximizedPanel === 'canvas' ? "Restore Split View" : "Maximize Canvas"}
                >
                  {maximizedPanel === 'canvas' ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                </button>
              </div>
              <div className="h-full w-full">
                {/* @ts-ignore */}
                <Whiteboard 
                  filedId={filedId} 
                  commandToSave={commandToSave} 
                  setcommandToSave={setcommandToSave}
                />
              </div>
            </Panel>
          )}
        </PanelGroup>
      </div>
    </div>
  );
}
