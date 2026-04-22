"use client";

import { useEffect, useState } from "react";

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const sync = () => setIsOnline(window.navigator.onLine);

    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);

    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm ${
        isOnline
          ? "border-emerald-200 bg-emerald-50/90 text-emerald-800"
          : "border-amber-200 bg-amber-50/90 text-amber-800"
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${
          isOnline ? "bg-emerald-500" : "bg-amber-500"
        }`}
      />
      {isOnline ? "当前联网中" : "当前离线中"}
    </div>
  );
}
