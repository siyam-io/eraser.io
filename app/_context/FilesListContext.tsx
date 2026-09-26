import { createContext } from "react";
import type { FileView } from "@/app/hooks/useTeamFiles";

export interface FileListContextValue {
  /** Currently selected team id. */
  getFiles: string | undefined;
  setGetFiles: (teamId: string | undefined) => void;
  /** Active sidebar view: all / recent / starred / archived. */
  view: FileView;
  setView: (view: FileView) => void;
}

export const FileListContext = createContext<FileListContextValue>({
  getFiles: undefined,
  setGetFiles: () => {},
  view: "all",
  setView: () => {},
});
