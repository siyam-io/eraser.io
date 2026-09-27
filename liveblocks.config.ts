import type { JsonObject, LiveList, LiveObject } from "@liveblocks/client";

/**
 * Ambient type declarations for Liveblocks.
 *
 * These are picked up globally by @liveblocks/client, so `useStorage` and
 * `useMutation` infer the shapes below without any explicit generics.
 */
declare global {
  interface Liveblocks {
    /** Short-lived, per-connection data. Never persisted. */
    Presence: {
      /** Pointer position in viewport percentages (0-100), or null when idle. */
      cursor: { x: number; y: number } | null;
      /** Which half of the split view the user is working in. */
      activePanel: "document" | "canvas" | null;
    };

    /** Durable, synced state. This is the real-time source of truth. */
    Storage: {
      /** Excalidraw elements. List order is the canvas z-order. */
      whiteboardElements: LiveList<JsonObject>;
      /** Editor.js blocks. List order is the document block order. */
      documentBlocks: LiveList<JsonObject>;
      /** Monotonic counter used to reject stale writes to MongoDB. */
      meta: LiveObject<{ revision: number }>;
    };

    UserMeta: {
      id: string;
      info: {
        name: string;
        avatar?: string;
        /** Stable per-user colour, derived server-side from the email. */
        color: string;
      };
    };
  }
}

export {};
