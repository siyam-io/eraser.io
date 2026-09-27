import { Liveblocks } from "@liveblocks/node";

let client: Liveblocks | null = null;

/**
 * Returns the server-side Liveblocks client.
 *
 * Constructed lazily so that a missing `LIVEBLOCKS_SECRET_KEY` (local dev,
 * CI, or a deploy that hasn't been configured yet) fails inside the auth
 * route with a clear message instead of crashing at module load time.
 */
export function getLiveblocksServer(): Liveblocks {
  if (client) return client;

  const secret = process.env.LIVEBLOCKS_SECRET_KEY;
  if (!secret) {
    throw new Error(
      "LIVEBLOCKS_SECRET_KEY is not set. Add it to .env to enable real-time collaboration."
    );
  }

  client = new Liveblocks({ secret });
  return client;
}

export const isLiveblocksConfigured = () => Boolean(process.env.LIVEBLOCKS_SECRET_KEY);
