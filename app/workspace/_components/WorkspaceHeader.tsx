import { Button } from "@/components/ui/button";
import { Folder, Pencil, Save, Users, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import { useOthers, useSelf } from "@liveblocks/react";
import { useKindeBrowserClient } from "@/app/hooks/useKindeBrowserClientMock";
import ShareDialog from "./ShareDialog";

type Props = {
  setcommandToSave: (value: boolean) => void;
  fileName?: string;
  collabEnabled?: boolean;
  /** Bumped every time the room state is flushed to MongoDB. */
  savedRevision?: number;
  saving?: boolean;
  filedId?: string;
  /** What the current visitor may do with this file. */
  accessLevel?: "owner" | "edit" | "view";
};

export default function WorkspaceHeader({
  setcommandToSave,
  fileName,
  collabEnabled = false,
  savedRevision = 0,
  saving = false,
  filedId,
  accessLevel,
}: Props) {
  const router = useRouter();
  const { isAuthenticated, user } = useKindeBrowserClient();

  const handleSyncToAccount = () => {
    toast.info("Redirecting to sign up to sync your workspace...");
    router.push(
      `/register?callbackUrl=${encodeURIComponent(`/workspace/${filedId}`)}`,
    );
  };

  return (
    <header className="flex items-center justify-between h-[60px] w-full px-5 border-b border-zinc-800/80 bg-[#0a0a0a]/95 backdrop-blur-md text-white shadow-sm z-50 relative">
      <div className="flex items-center gap-5">
        {/* Logo / Back */}
        <div
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="flex -space-x-2.5 mix-blend-screen opacity-90 group-hover:opacity-100 transition-opacity">
            <div className="w-5 h-5 rounded-full bg-[#D02020]" />
            <div className="w-5 h-5 bg-[#1040C0]" />
            <div className="w-5 h-5 bg-[#F0C020] [clip-path:polygon(50%_0%,0%_100%,100%_100%)]" />
          </div>
        </div>

        <div className="h-5 w-[1px] bg-zinc-700/80 rounded-full" />

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[13px] font-medium tracking-wide">
          <div
            className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer px-2 py-1 rounded-md hover:bg-zinc-800/50"
            onClick={() => router.push("/dashboard")}
          >
            <Folder size={14} />
            <span>Workspace</span>
          </div>
          <span className="text-zinc-600">/</span>
          <div className="flex items-center gap-2 px-2 py-1 bg-zinc-800/40 rounded-md border border-zinc-700/50 text-zinc-200">
            <span className="truncate max-w-[200px]">
              {fileName || "Untitled Canvas"}
            </span>
            {collabEnabled ? (
              <span
                key={savedRevision}
                className={`text-[10px] font-medium ${
                  saving ? "text-amber-400" : "text-green-500"
                }`}
                title={
                  saving ? "Flushing changes to storage" : "All changes saved"
                }
              >
                {saving ? "Saving…" : "Autosaved"}
              </span>
            ) : (
              <div
                className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"
                title="Saved to cloud"
              />
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-5">
        {/* Active Users */}
        {collabEnabled ? (
          <LiveCollaborators />
        ) : (
          <StaticCollaborators picture={user?.picture} />
        )}

        <div className="flex items-center gap-3">
          {/* Read-only visitors have nothing to save, so the control is hidden
              rather than shown-but-dead. */}
          {accessLevel && accessLevel !== "view" && (
            <Button
              onClick={() => setcommandToSave(true)}
              variant="outline"
              className="h-8 px-4 text-xs font-semibold bg-transparent hover:bg-zinc-800 text-zinc-300 hover:text-white gap-2 transition-all border-zinc-700/60 rounded-lg"
            >
              <Save size={14} className="text-zinc-400" />
              Save now
            </Button>
          )}

          {accessLevel === "owner" && filedId ? (
            <ShareDialog filedId={filedId} />
          ) : accessLevel && accessLevel !== "owner" ? (
            <div
              className="flex h-8 items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 text-[11px] font-semibold text-amber-300"
              title="You are viewing this file through a shared link"
            >
              <Pencil size={12} />
              {accessLevel === "edit"
                ? "Shared · can edit"
                : "Shared · view only"}
            </div>          ) : !isAuthenticated ? (
            <button
              type="button"
              onClick={handleSyncToAccount}
              className="inline-flex items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-[11px] font-semibold text-amber-300 hover:bg-amber-500/20 transition-colors"
              title="Sync your guest workspace to a permanent account"
            >
              <LogIn size={12} />
              Sync to Account
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}

/** Real presence: everyone currently connected to this file's room. */
function LiveCollaborators() {
  const self = useSelf();
  const others = useOthers();

  const people = [
    ...(self ? [{ id: self.id, info: self.info }] : []),
    ...others.map((other) => ({ id: other.id, info: other.info })),
  ];
  const shown = people.slice(0, 3);
  const extra = people.length - shown.length;

  return (
    <div
      className="hidden sm:flex items-center -space-x-2.5 mr-2"
      title="Active collaborators"
    >
      {shown.map((person, index) => (
        <div
          key={`${person.id}-${index}`}
          className="h-7 w-7 rounded-full border-2 overflow-hidden shadow-sm relative hover:z-50 hover:scale-110 transition-transform cursor-pointer bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-white"
          style={{
            borderColor: "#0a0a0a",
            zIndex: 20 - index,
            backgroundColor: person.info?.color,
          }}
          title={person.info?.name}
        >
          {person.info?.avatar ? (
            <Image
              src={person.info.avatar}
              alt={person.info?.name || "collaborator"}
              width={28}
              height={28}
              className="object-cover"
              unoptimized
            />
          ) : (
            (person.info?.name || "?").charAt(0).toUpperCase()
          )}
        </div>
      ))}
      {extra > 0 && (
        <div className="h-7 w-7 rounded-full border-2 border-[#0a0a0a] bg-indigo-500 flex items-center justify-center text-[10px] font-bold text-white z-10 shadow-sm relative hover:z-50 hover:scale-110 transition-transform cursor-pointer">
          +{extra}
        </div>
      )}
    </div>
  );
}

/** Decorative placeholder for when collaboration is not configured. */
function StaticCollaborators({ picture }: { picture?: string | null }) {
  return (
    <div
      className="hidden sm:flex items-center -space-x-2.5 mr-2"
      title="Active collaborators"
    >
      <div className="h-7 w-7 rounded-full border-2 border-[#0a0a0a] overflow-hidden shadow-sm relative z-20 hover:z-50 hover:scale-110 transition-transform cursor-pointer">
        <Image
          src={picture || "/fallback.png"}
          alt="user"
          width={28}
          height={28}
          className="object-cover"
        />
      </div>
      <div className="h-7 w-7 rounded-full border-2 border-[#0a0a0a] bg-zinc-800 flex items-center justify-center text-zinc-500 z-10 shadow-sm relative">
        <Users size={12} />
      </div>
    </div>
  );
}
