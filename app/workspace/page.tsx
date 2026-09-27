import { redirect } from "next/navigation";

/**
 * Root workspace route.
 * Redirects to /api/workspace-start, which verifies existing guest/user files
 * or provisions a new one, sets the session cookie, and lands directly on /workspace/[id].
 */
export default function WorkspaceRootPage() {
  redirect("/api/workspace-start");
}
