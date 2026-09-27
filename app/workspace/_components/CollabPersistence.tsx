"use client";

import { useMutation, useStorage } from "@liveblocks/react";
import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";

/** How long the room must be quiet before the CRDT state is flushed to Mongo. */
const DEBOUNCE_MS = 5000;

type Props = {
  filedId: string;
  /** Set by the Save button, which forces an immediate flush. */
  commandToSave: boolean;
  onSaved: () => void;
};

/**
 * Persists the live whiteboard CRDT state back to MongoDB.
 */
export default function CollabPersistence({ filedId, commandToSave, onSaved }: Props) {
  const elements = useStorage((root) => root.whiteboardElements);

  // Refs keep `persist` stable while still reading the newest state.
  const elementsRef = useRef(elements);
  elementsRef.current = elements;

  const inFlight = useRef(false);
  const hydrated = useRef(false);

  // Revisions are wall-clock based so that the `pagehide` beacon produces a fresh revision.
  const bumpRevision = useMutation(({ storage }) => {
    try {
      const meta = storage?.get("meta");
      if (!meta) return Date.now();
      const next = Math.max((meta.get("revision") ?? 0) + 1, Date.now());
      meta.set("revision", next);
      return next;
    } catch {
      return Date.now();
    }
  }, []);

  const persist = useCallback(
    async ({ silent = false }: { silent?: boolean } = {}) => {
      if (inFlight.current) return;
      if (elementsRef.current === null) return;
      inFlight.current = true;

      try {
        let revision = Date.now();
        try {
          revision = bumpRevision();
        } catch {
          // If storage is still initializing, use timestamp revision
        }
        const res = await fetch(`/api/files/${filedId}/collab-sync`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            revision,
            whiteboard: JSON.stringify(elementsRef.current),
          }),
        });

        if (res.status === 404 || res.status === 403) {
          // View-only visitor or non-editable file: skip persistence silently
          return;
        }

        if (!res.ok) {
          if (!silent) toast.error("Couldn't save the latest changes");
          return;
        }
        onSaved();
      } catch (error) {
        if (!silent) {
          console.error("[collab] failed to persist room state:", error);
          toast.error("Couldn't save the latest changes");
        }
      } finally {
        inFlight.current = false;
      }
    },
    [bumpRevision, filedId, onSaved]
  );

  // Debounce: flush 5s after the last storage mutation.
  useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true;
      return;
    }

    const timer = setTimeout(() => persist({ silent: true }), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [elements, persist]);

  // The Save button bypasses the debounce.
  useEffect(() => {
    if (commandToSave) void persist();
  }, [commandToSave, persist]);

  // Best-effort final flush when the tab goes away.
  useEffect(() => {
    const flush = () => {
      const payload = JSON.stringify({
        revision: Date.now(),
        whiteboard: JSON.stringify(elementsRef.current),
      });

      navigator.sendBeacon?.(
        `/api/files/${filedId}/collab-sync`,
        new Blob([payload], { type: "application/json" })
      );
    };

    window.addEventListener("pagehide", flush);
    return () => window.removeEventListener("pagehide", flush);
  }, [filedId]);

  return null;
}
