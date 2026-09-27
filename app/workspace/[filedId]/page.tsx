import WorkspaceClient from "../_components/WorkspaceClient";
import { isLiveblocksConfigured } from "@/lib/liveblocks";
import { resolveIdentity } from "@/lib/identity";
import { getFileAccess, toErrorResponse } from "@/lib/access";

export type FileLoadResult =
  | {
      ok: true;
      data: Record<string, unknown>;
      accessLevel: "owner" | "edit" | "view";
      isGuest: boolean;
    }
  | {
      ok: false;
      errorStatus: number;
      accessLevel: "owner" | "edit" | "view" | null;
      isGuest: boolean;
    };

export async function loadFile(filedId: string): Promise<FileLoadResult> {
  // Both of these are server-only decisions: whether real-time collaboration
  // is available (it depends on the Liveblocks secret) and whether the visitor
  // is an anonymous guest. Neither can be inferred safely in the client.
  const identity = await resolveIdentity();

  try {
    const { file, level } = await getFileAccess(identity?.value ?? null, filedId);

    if (!level) {
      return {
        ok: false,
        errorStatus: 404,
        accessLevel: null as any,
        isGuest: identity?.isGuest ?? false,
      };
    }

    const plainData = JSON.parse(JSON.stringify(file));
    return {
      ok: true,
      data: plainData,
      accessLevel: level,
      isGuest: identity?.isGuest ?? false,
    };
  } catch (error) {
    const response = toErrorResponse(error);
    return {
      ok: false,
      errorStatus: response.status,
      accessLevel: null as any,
      isGuest: identity?.isGuest ?? false,
    };
  }
}

type Props = { params: Promise<{ filedId: string }> };

export default async function WorkspacePage({ params }: Props) {
  const { filedId } = await params;

  const file = await loadFile(filedId);

  return (
    <WorkspaceClient
      filedId={filedId}
      collabEnabled={isLiveblocksConfigured()}
      isGuest={file.isGuest}
      accessLevel={file.accessLevel}
      fileData={file.ok ? file.data : null}
      errorStatus={file.ok ? null : file.errorStatus}
    />
  );
}
