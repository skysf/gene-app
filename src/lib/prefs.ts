import { isTauriRuntime } from "./runtime";

const STORE_FILE = "settings.json";
const LS_PREFIX = "gene-app:";

type StoreHandle = {
  get<T>(key: string): Promise<T | undefined>;
  set(key: string, value: unknown): Promise<void>;
  save(): Promise<void>;
};

let storePromise: Promise<StoreHandle> | null = null;

async function openStore(): Promise<StoreHandle> {
  const mod = await import("@tauri-apps/plugin-store");
  const store = await mod.load(STORE_FILE, { autoSave: true, defaults: {} });
  return store as unknown as StoreHandle;
}

function getStore(): Promise<StoreHandle> {
  if (!storePromise) storePromise = openStore();
  return storePromise;
}

export async function getPref<T>(key: string, fallback: T): Promise<T> {
  if (isTauriRuntime()) {
    try {
      const store = await getStore();
      const value = await store.get<T>(key);
      return value === undefined || value === null ? fallback : value;
    } catch (error) {
      console.error(`store.get(${key}) failed:`, error);
      return fallback;
    }
  }

  try {
    const raw = window.localStorage.getItem(LS_PREFIX + key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function setPref<T>(key: string, value: T): Promise<void> {
  if (isTauriRuntime()) {
    try {
      const store = await getStore();
      await store.set(key, value);
    } catch (error) {
      console.error(`store.set(${key}) failed:`, error);
    }
    return;
  }

  try {
    window.localStorage.setItem(LS_PREFIX + key, JSON.stringify(value));
  } catch (error) {
    console.error(`localStorage.set(${key}) failed:`, error);
  }
}
