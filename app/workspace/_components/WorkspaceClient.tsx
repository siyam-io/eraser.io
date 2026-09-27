"use client";

import { useState, useEffect, type ReactNode } from "react";
import WorkspaceHeader from "./WorkspaceHeader";
import dynamic from "next/dynamic";
import CollabRoom from "./CollabRoom";
import CollabPersistence from "./CollabPersistence";
import GuestBanner from "./GuestBanner";
import PresenceLayer from "./PresenceLayer";
import Loader from "@/app/(routes)/dashboard/_components/Loader";

const Whiteboard = dynamic(() => import("./Whiteboard"), { ssr: false });

type Props = {
  filedId: string;
  /** False when LIVEBLOCKS_SECRET_KEY is absent: the workspace stays usable. */
  collabEnabled: boolean;
  /** True for an anonymous session, which shows the sign-up prompt. */
  isGuest: boolean;
  /** Resolved on the server; null means not yet known (initial client render only). */
  accessLevel?: "owner" | "edit" | "view" | null;
  /** Pre-loaded file data from the server; null means not available yet. */
  fileData?: Record<string, unknown> | null;
  /** HTTP status returned by the server, or null if the server did not fail. */
  errorStatus?: number | null;
};

export default function WorkspaceClient({
  filedId,
  collabEnabled,
  isGuest,
  accessLevel,
  fileData,
  errorStatus,
}: Props) {
  const [commandToSave, setcommandToSave] = useState<boolean>(false);
  const [revision, setRevision] = useState(0);
  const [serverFileData] = useState<Record<string, unknown> | null>(
    fileData ?? null,
  );
  const [serverAccessLevel] = useState<"owner" | "edit" | "view" | null>(
    accessLevel ?? null,
  );
  const [serverErrorStatus] = useState<number | null>(errorStatus ?? null);
  const [fileDataClient, setFileDataClient] = useState<Record<string, unknown> | null>(
    fileData ?? null,
  );
  const [accessError, setAccessError] = useState<number | null>(null);

  useEffect(() => {
    const fetchFile = async () => {
      if (!filedId) return;
      const res = await fetch(`/api/files/${filedId}`);
      if (res.ok) {
        const result = await res.json();
        setFileDataClient(result as unknown as Record<string, unknown>);
        fetch(`/api/files/${filedId}/open`, { method: "POST" }).catch(() => {});
      } else {
        if (serverErrorStatus === null) {
          setAccessError(res.status);
        }
      }
    };
    fetchFile();
  }, [filedId, serverErrorStatus]);

  const effectiveAccessLevel: "owner" | "edit" | "view" =
    serverAccessLevel ??
    ((fileDataClient?.accessLevel as "owner" | "edit" | "view") || "edit");

  const readOnly = effectiveAccessLevel === "view";

  const handleSaved = () => {
    setcommandToSave(false);
    setRevision((value) => value + 1);
  };

  const shell = (children: ReactNode) => (
    <div className="flex flex-col h-screen w-screen bg-[#0E0E0E] overflow-hidden font-sans">
      {children}
    </div>
  );

  function extractString(val: unknown): string | undefined {
    if (val === null || val === undefined) return undefined;
    if (typeof val === "string") return val;
    return undefined;
  }

  const canvasView = (
    <>
      <WorkspaceHeader
        setcommandToSave={setcommandToSave}
        fileName={extractString(serverFileData?.fileName) ?? extractString(fileData?.fileName)}
        collabEnabled={collabEnabled}
        savedRevision={revision}
        saving={commandToSave}
        filedId={filedId}
        accessLevel={serverAccessLevel ?? undefined}
      />

      <div className="flex-1 h-[calc(100vh-3.5rem)] w-full relative bg-[#121212]">
        <Whiteboard
          filedId={filedId}
          collabEnabled={collabEnabled}
          readOnly={readOnly}
          commandToSave={commandToSave}
          setcommandToSave={setcommandToSave}
        />
      </div>
    </>
  );

  const hasFatalError =
    (serverErrorStatus !== null && serverFileData === null && !fileDataClient) ||
    (accessError !== null && !fileDataClient && !serverFileData);

  if (hasFatalError) {
    const status = serverErrorStatus ?? accessError;
    return shell(
      <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-6 text-center">
        <h1 className="text-zinc-200 text-lg font-semibold">
          {status === 401 || status === 404
            ? "This workspace isn't available"
            : "Something went wrong"}
        </h1>
        <p className="max-w-md text-sm leading-relaxed text-zinc-500">
          {status === 401 || status === 404
            ? "The link may be private, expired, or deleted. Ask the owner to share it again with link access enabled."
            : `The server returned ${status}. Try reloading the page.`}
        </p>
      </div>,
    );
  }

  const content = isGuest ? (
    <>
      <GuestBanner />
      {canvasView}
    </>
  ) : (
    canvasView
  );

  if (!collabEnabled) return shell(content);

  if (!serverFileData && !fileDataClient) {
    return shell(
      <div className="flex h-full w-full items-center justify-center">
        <Loader />
      </div>,
    );
  }

  const whiteboard1 = extractString(serverFileData?.whiteboard);
  const whiteboard2 = extractString(fileDataClient?.whiteboard);
  const whiteboardContent = whiteboard1 ?? whiteboard2;

  return shell(
    <CollabRoom
      filedId={filedId}
      whiteboard={whiteboardContent ?? ""}
    >
      <PresenceLayer />
      {!readOnly && (
        <CollabPersistence
          filedId={filedId}
          commandToSave={commandToSave}
          onSaved={handleSaved}
        />
      )}
      {content}
    </CollabRoom>
  );
}
