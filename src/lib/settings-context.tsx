"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { DEFAULT_OPENROUTER_BASE_URL } from "./openrouter";
import {
  deleteApiKey as deleteStoredApiKey,
  getApiKey as getStoredApiKey,
  setApiKey as setStoredApiKey,
} from "./secrets";
import { getPref, setPref } from "./prefs";

export const DEFAULT_MODEL = "anthropic/claude-sonnet-4-6";

export const MODEL_PRESETS: Array<{
  id: string;
  label: string;
  hint: string;
}> = [
  {
    id: "anthropic/claude-sonnet-4-6",
    label: "Claude Sonnet 4.6",
    hint: "默认推荐，中文质量与解释力强",
  },
  {
    id: "openai/gpt-5.2",
    label: "GPT-5.2",
    hint: "备选主力，推理稳定",
  },
  {
    id: "anthropic/claude-haiku-4-5",
    label: "Claude Haiku 4.5",
    hint: "便宜档，速度快，日常够用",
  },
  {
    id: "google/gemini-2.5-flash",
    label: "Gemini 2.5 Flash",
    hint: "最便宜档，回答更短",
  },
];

export type AppSettings = {
  apiKey: string | null;
  model: string;
  baseUrl: string;
};

type SettingsContextValue = {
  settings: AppSettings;
  ready: boolean;
  hasApiKey: boolean;
  setApiKey: (value: string | null) => Promise<void>;
  setModel: (value: string) => Promise<void>;
  setBaseUrl: (value: string) => Promise<void>;
};

const DEFAULT_SETTINGS: AppSettings = {
  apiKey: null,
  model: DEFAULT_MODEL,
  baseUrl: DEFAULT_OPENROUTER_BASE_URL,
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [apiKey, model, baseUrl] = await Promise.all([
        getStoredApiKey(),
        getPref<string>("model", DEFAULT_MODEL),
        getPref<string>("baseUrl", DEFAULT_OPENROUTER_BASE_URL),
      ]);
      if (cancelled) return;
      setSettings({
        apiKey,
        model: model || DEFAULT_MODEL,
        baseUrl: baseUrl || DEFAULT_OPENROUTER_BASE_URL,
      });
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setApiKey = useCallback(async (value: string | null) => {
    if (value && value.length > 0) {
      await setStoredApiKey(value);
    } else {
      await deleteStoredApiKey();
    }
    setSettings((cur) => ({ ...cur, apiKey: value }));
  }, []);

  const setModel = useCallback(async (value: string) => {
    await setPref("model", value);
    setSettings((cur) => ({ ...cur, model: value }));
  }, []);

  const setBaseUrl = useCallback(async (value: string) => {
    const normalized =
      value.trim().replace(/\/$/, "") || DEFAULT_OPENROUTER_BASE_URL;
    await setPref("baseUrl", normalized);
    setSettings((cur) => ({ ...cur, baseUrl: normalized }));
  }, []);

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      ready,
      hasApiKey: Boolean(settings.apiKey && settings.apiKey.length > 0),
      setApiKey,
      setModel,
      setBaseUrl,
    }),
    [settings, ready, setApiKey, setModel, setBaseUrl],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used within <SettingsProvider>");
  }
  return ctx;
}
