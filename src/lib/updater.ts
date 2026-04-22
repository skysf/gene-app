import { isTauriRuntime } from "./runtime";

export type UpdateInfo = {
  version: string;
  currentVersion: string;
  notes: string | null;
  date: string | null;
};

export type UpdateHandle = {
  info: UpdateInfo;
  downloadAndInstall: (
    onProgress?: (downloaded: number, total: number | null) => void,
  ) => Promise<void>;
};

export async function checkForUpdates(): Promise<UpdateHandle | null> {
  if (!isTauriRuntime()) return null;

  try {
    const mod = await import("@tauri-apps/plugin-updater");
    const update = await mod.check();
    if (!update) return null;

    return {
      info: {
        version: update.version,
        currentVersion: update.currentVersion,
        notes: update.body ?? null,
        date: update.date ?? null,
      },
      downloadAndInstall: async (onProgress) => {
        let total: number | null = null;
        let downloaded = 0;
        await update.downloadAndInstall((event) => {
          if (event.event === "Started") {
            total = event.data.contentLength ?? null;
            onProgress?.(0, total);
          } else if (event.event === "Progress") {
            downloaded += event.data.chunkLength;
            onProgress?.(downloaded, total);
          }
        });
      },
    };
  } catch (error) {
    console.error("updater check failed:", error);
    return null;
  }
}
