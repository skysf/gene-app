import { isTauriRuntime } from "./runtime";

const SERVICE = "gene-app";
const ACCOUNT = "openrouter";
const LS_KEY = "gene-app:apiKey";

type InvokeFn = <T>(cmd: string, args?: Record<string, unknown>) => Promise<T>;

let cachedInvoke: InvokeFn | null = null;

async function tauriInvoke(): Promise<InvokeFn> {
  if (cachedInvoke) return cachedInvoke;
  const mod = await import("@tauri-apps/api/core");
  cachedInvoke = mod.invoke as InvokeFn;
  return cachedInvoke;
}

export async function getApiKey(): Promise<string | null> {
  if (isTauriRuntime()) {
    try {
      const invoke = await tauriInvoke();
      const value = await invoke<string | null>("secret_get", {
        service: SERVICE,
        account: ACCOUNT,
      });
      return value && value.length > 0 ? value : null;
    } catch (error) {
      console.error("keyring get failed:", error);
      return null;
    }
  }

  try {
    const value = window.localStorage.getItem(LS_KEY);
    return value && value.length > 0 ? value : null;
  } catch {
    return null;
  }
}

export async function setApiKey(value: string): Promise<void> {
  if (isTauriRuntime()) {
    const invoke = await tauriInvoke();
    await invoke<void>("secret_set", {
      service: SERVICE,
      account: ACCOUNT,
      password: value,
    });
    return;
  }

  try {
    window.localStorage.setItem(LS_KEY, value);
  } catch (error) {
    console.error("localStorage set failed:", error);
  }
}

export async function deleteApiKey(): Promise<void> {
  if (isTauriRuntime()) {
    const invoke = await tauriInvoke();
    await invoke<void>("secret_delete", {
      service: SERVICE,
      account: ACCOUNT,
    });
    return;
  }

  try {
    window.localStorage.removeItem(LS_KEY);
  } catch (error) {
    console.error("localStorage delete failed:", error);
  }
}
