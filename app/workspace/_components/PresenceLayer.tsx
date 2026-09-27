"use client";

import { useMyPresence, useOthers, useUpdateMyPresence } from "@liveblocks/react";
import { useEffect, useRef } from "react";

type Panel = "document" | "canvas";

/**
 * Broadcasts the local pointer position as viewport percentages.
 *
 * Percentages rather than pixels so collaborators on a different window size
 * or panel split still land in roughly the right place. Updates are coalesced
 * into one presence write per animation frame to keep the socket quiet.
 */
export function useTrackCursor(activePanel: Panel) {
  const updateMyPresence = useUpdateMyPresence();
  const frame = useRef<number | null>(null);
  const latest = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const flush = () => {
      frame.current = null;
      const point = latest.current;
      if (!point) return;
      updateMyPresence({
        cursor: point,
        activePanel,
      });
    };

    const onPointerMove = (event: PointerEvent) => {
      latest.current = {
        x: (event.clientX / window.innerWidth) * 100,
        y: (event.clientY / window.innerHeight) * 100,
      };
      if (frame.current === null) frame.current = requestAnimationFrame(flush);
    };

    const onPointerLeave = () => {
      latest.current = null;
      updateMyPresence({ cursor: null, activePanel });
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, [updateMyPresence, activePanel]);
}

/** Floating cursors for everyone else in the room. */
export default function PresenceLayer() {
  const others = useOthers();
  // `useMyPresence` keeps the local user's own presence in this component's
  // dependency graph so the overlay re-renders as the room roster changes.
  useMyPresence();

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      {others.map((other) => {
        const cursor = other.presence?.cursor;
        if (!cursor) return null;

        const info = other.info;
        const color = info?.color || "#3B82F6";
        const label = info?.name || "Guest";

        return (
          <div
            key={other.connectionId}
            className="absolute transition-transform duration-75 ease-out"
            style={{
              left: `${cursor.x}%`,
              top: `${cursor.y}%`,
              transform: "translate(-2px, -2px)",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path
                d="M2 1.5 15.5 8.2l-5.6 1.3-2.4 5.6L2 1.5Z"
                fill={color}
                stroke="#0a0a0a"
                strokeWidth="1"
                strokeLinejoin="round"
              />
            </svg>
            <span
              className="ml-3 -mt-1 inline-block max-w-[140px] truncate rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-white shadow-sm"
              style={{ backgroundColor: color }}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
