import type { JsonObject, LiveList } from "@liveblocks/client";

/**
 * Shared helpers for the real-time layer.
 *
 * Both collaborative surfaces (Excalidraw and Editor.js) store their items in
 * a LiveList where the list order doubles as the render order (canvas z-order
 * and document block order respectively). The lists are the source of truth
 * while a room is live; MongoDB is only written by the debounced persistence
 * layer.
 */

/** Palette used to colour collaborator cursors and avatar rings. */
const USER_COLORS = [
  "#3B82F6",
  "#8B5CF6",
  "#EC4899",
  "#F59E0B",
  "#10B981",
  "#EF4444",
  "#06B6D4",
  "#A855F7",
];

/**
 * Deterministically maps a user to a colour so the same person gets the same
 * cursor colour in every session and on every client.
 */
export function colorForUser(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return USER_COLORS[Math.abs(hash) % USER_COLORS.length];
}

/**
 * Parses the stringified JSON stored in Mongo into an array of items.
 * Returns an empty array for missing/corrupt/legacy-shaped data so a bad
 * record degrades into "empty document" instead of crashing the room.
 */
export function parseStoredArray(raw: unknown): JsonObject[] {
  if (typeof raw !== "string" || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as JsonObject[];
    // Legacy shape: Editor.js documents were stored as `{ blocks: [...] }`.
    if (parsed && typeof parsed === "object" && Array.isArray((parsed as any).blocks)) {
      return (parsed as any).blocks as JsonObject[];
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Strips `undefined`/functions so the value satisfies Liveblocks' LSON rules.
 * Excalidraw elements in particular carry optional fields set to undefined.
 */
export function toStorable<T>(value: T): JsonObject {
  return JSON.parse(JSON.stringify(value ?? null)) as JsonObject;
}

/** Excalidraw bumps `version` on every mutation, which we use for LWW merges. */
const elementVersion = (element: any): number =>
  typeof element?.version === "number" ? element.version : 0;

/** Stable content hash for an Editor.js block (used to detect real edits). */
export function blockSignature(block: any): string {
  const { data, type } = block ?? {};
  return JSON.stringify({ type, data });
}

/**
 * Applies local Excalidraw element mutations to the shared list.
 *
 * Merge rules:
 * - Elements the local user deleted are removed from the room.
 * - For the same id, the higher Excalidraw `version` wins (last write wins
 *   per element, never per document).
 * - An element a peer already positioned is left alone unless ours is a
 *   genuinely newer mutation, so two people dragging different shapes don't
 *   fight over list indices.
 */
export function pushElementsToList(list: LiveList<JsonObject>, elements: readonly any[]) {
  // Build a map of what the local scene looks like.
  const localById = new Map<string, any>();
  for (const el of elements) {
    if (el?.id) localById.set(el.id as string, el);
  }

  // Pass 1: Update existing items in the list, remove items that the local
  // scene no longer contains (user deleted them).
  const existingIds = new Set<string>();
  for (let i = list.length - 1; i >= 0; i--) {
    const current = list.get(i) as any;
    const id = current?.id as string | undefined;
    if (!id) { list.delete(i); continue; }

    const localEl = localById.get(id);
    if (!localEl) {
      // Element was deleted locally — remove from shared list.
      list.delete(i);
      continue;
    }

    existingIds.add(id);

    // Only overwrite when the local version is genuinely newer.
    const localVer  = typeof localEl.version === "number" ? localEl.version : 0;
    const remoteVer = typeof current.version  === "number" ? current.version  : 0;
    if (localVer >= remoteVer) {
      list.set(i, toStorable(localEl));
    }
  }

  // Pass 2: Append any elements that are brand new (not yet in the list).
  for (const el of elements) {
    if (el?.id && !existingIds.has(el.id as string)) {
      list.push(toStorable(el));
    }
  }
}

/**
 * Merges the room's elements into the local Excalidraw scene.
 */
export function mergeRemoteElements(
  remote: readonly Record<string, any>[],
  local: readonly any[],
  _previouslyKnownIds?: ReadonlySet<string>
): any[] {
  const localById = new Map<string, any>(local.map((element) => [element.id, element]));
  const merged: any[] = [];
  const seen = new Set<string>();

  for (const remoteElement of remote) {
    const id = remoteElement.id as string;
    seen.add(id);
    const localElement = localById.get(id);

    if (!localElement) {
      merged.push(remoteElement);
      continue;
    }

    const localVer = typeof localElement.version === "number" ? localElement.version : 0;
    const remoteVer = typeof remoteElement.version === "number" ? remoteElement.version : 0;
    const localNonce = typeof localElement.versionNonce === "number" ? localElement.versionNonce : 0;
    const remoteNonce = typeof remoteElement.versionNonce === "number" ? remoteElement.versionNonce : 0;

    const localIsNewer =
      localVer > remoteVer ||
      (localVer === remoteVer && localNonce !== remoteNonce);

    merged.push(localIsNewer ? localElement : remoteElement);
  }

  for (const localElement of local) {
    if (!seen.has(localElement.id)) {
      merged.push(localElement);
    }
  }

  return merged;
}

/**
 * Applies local Editor.js block mutations to the shared list.
 *
 * Editor.js has no CRDT identity for a block beyond its id, so blocks are
 * compared by content signature and the remainder of the same id/position
 * rules as the canvas.
 */
export function pushBlocksToList(list: LiveList<JsonObject>, blocks: readonly any[]) {
  const localIds = new Set(blocks.map((block) => block.id as string));

  for (let i = list.length - 1; i >= 0; i--) {
    const current = list.get(i);
    if (!current || !localIds.has(current.id as string)) list.delete(i);
  }

  for (let i = 0; i < blocks.length; i++) {
    const next = toStorable(blocks[i]);
    const current = list.get(i);

    if (current && current.id === next.id) {
      if (blockSignature(current) !== blockSignature(next)) list.set(i, next);
      continue;
    }

    const existingIndex = list.findIndex((block) => block.id === next.id);
    if (existingIndex > -1) {
      const existing = list.get(existingIndex);
      if (existing && blockSignature(existing) !== blockSignature(next)) {
        list.set(existingIndex, next);
      }
      continue;
    }

    // LiveList.insert takes (element, index).
    list.insert(next, i);
  }
}

/**
 * Merges the room's blocks into the local document. Remote order always wins,
 * because block ordering is the one thing Editor.js cannot patch in place
 * (the whole document is re-rendered on remote changes).
 */
export function mergeRemoteBlocks(
  remote: readonly Record<string, any>[],
  local: readonly any[],
  previouslyKnownIds: ReadonlySet<string>
): any[] {
  const remoteIds = new Set(remote.map((block) => block.id as string));
  const merged = [...remote];

  for (const localBlock of local) {
    if (remoteIds.has(localBlock.id)) continue;
    if (previouslyKnownIds.has(localBlock.id)) continue;
    merged.push(localBlock);
  }

  return merged;
}

/** True when two element/block arrays are identical in id, order and content. */
export function sameContent(
  a: readonly any[],
  b: readonly any[],
  signature: (item: any) => string
): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i]?.id !== b[i]?.id) return false;
    if (signature(a[i]) !== signature(b[i])) return false;
  }
  return true;
}

/** Signature for Excalidraw elements: checks version, nonce, deletion and spatial bounds */
export const elementSignature = (element: any): string =>
  `${element?.id ?? ""}:${element?.version ?? 0}:${element?.versionNonce ?? 0}:${element?.isDeleted ? 1 : 0}:${element?.x ?? 0}:${element?.y ?? 0}:${element?.width ?? 0}:${element?.height ?? 0}`;
