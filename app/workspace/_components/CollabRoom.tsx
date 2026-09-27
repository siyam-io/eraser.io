"use client";

import { ClientSideSuspense, LiveblocksProvider, RoomProvider } from "@liveblocks/react";
import { LiveList, LiveObject } from "@liveblocks/client";
import { useMemo, type ReactNode } from "react";
import Loader from "@/app/(routes)/dashboard/_components/Loader";
import { parseStoredArray } from "@/lib/collab";

type Props = {
  /** The file id doubles as the Liveblocks room id. */
  filedId: string;
  /** The Mongo snapshot, used only to seed a brand new room. */
  document?: string | null;
  whiteboard?: string | null;
  children: ReactNode;
};

/**
 * Joins the Liveblocks room for a single file.
 *
 * `initialStorage` is applied by Liveblocks only when the room is created, so
 * an already-live room keeps the in-memory CRDT state and the Mongo snapshot
 * is never used to clobber a session that is in progress.
 *
 * Liveblocks v3 requires explicit Live structure wrappers – plain arrays and
 * objects are NOT auto-converted into LiveList/LiveObject.
 */
export default function CollabRoom({ filedId, document, whiteboard, children }: Props) {
  const initialStorage = useMemo(
    () => ({
      whiteboardElements: new LiveList(parseStoredArray(whiteboard)),
      documentBlocks: new LiveList(parseStoredArray(document)),
      meta: new LiveObject({ revision: 0 }),
    }),
    // Only reseed when we switch files; a room is created once per file.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filedId]
  );

  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
      <RoomProvider
        id={filedId}
        initialPresence={{ cursor: null, activePanel: null }}
        initialStorage={initialStorage as any}
      >
        <ClientSideSuspense
          fallback={
            <div className="flex h-full w-full items-center justify-center">
              <Loader />
            </div>
          }
        >
          {children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}
