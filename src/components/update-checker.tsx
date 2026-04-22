"use client";

import { useEffect, useState } from "react";
import { checkForUpdates, type UpdateHandle } from "@/lib/updater";
import { isTauriRuntime } from "@/lib/runtime";

type UiState =
  | { phase: "idle" }
  | { phase: "available"; update: UpdateHandle }
  | {
      phase: "installing";
      update: UpdateHandle;
      downloaded: number;
      total: number | null;
    }
  | { phase: "error"; message: string };

export function UpdateChecker() {
  const [state, setState] = useState<UiState>({ phase: "idle" });
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!isTauriRuntime()) return;
    let cancelled = false;
    (async () => {
      const update = await checkForUpdates();
      if (cancelled || !update) return;
      setState({ phase: "available", update });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.phase === "idle" || dismissed) return null;

  if (state.phase === "error") {
    return (
      <div className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-xl rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="flex-1">{state.message}</div>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="shrink-0 rounded-full border border-rose-300 bg-white px-3 py-1 text-xs text-rose-700"
          >
            关闭
          </button>
        </div>
      </div>
    );
  }

  if (state.phase === "installing") {
    const pct =
      state.total && state.total > 0
        ? Math.min(100, Math.round((state.downloaded / state.total) * 100))
        : null;
    return (
      <div className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-xl rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-800 shadow-lg">
        正在下载更新 {pct !== null ? `${pct}%` : `${Math.round(state.downloaded / 1024)} KB`}...
      </div>
    );
  }

  const update = state.update;
  return (
    <div className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-xl rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 shadow-lg">
      <div className="flex flex-wrap items-start gap-3">
        <div className="flex-1">
          <p className="text-sm font-semibold">
            发现新版本 v{update.info.version}
            <span className="ml-2 font-normal text-emerald-700">
              当前 v{update.info.currentVersion}
            </span>
          </p>
          {update.info.notes ? (
            <p className="mt-1 max-h-24 overflow-y-auto text-xs leading-5 text-emerald-800/90 whitespace-pre-wrap">
              {update.info.notes}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-semibold text-emerald-800"
          >
            稍后
          </button>
          <button
            type="button"
            onClick={async () => {
              setState({
                phase: "installing",
                update,
                downloaded: 0,
                total: null,
              });
              try {
                await update.downloadAndInstall((downloaded, total) => {
                  setState({
                    phase: "installing",
                    update,
                    downloaded,
                    total,
                  });
                });
              } catch (error) {
                setState({
                  phase: "error",
                  message:
                    (error as Error)?.message || "更新安装失败，稍后再试。",
                });
              }
            }}
            className="rounded-full bg-emerald-700 px-3 py-1 text-xs font-semibold text-white"
          >
            立即更新
          </button>
        </div>
      </div>
    </div>
  );
}
