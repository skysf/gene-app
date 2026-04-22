"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import {
  DEFAULT_MODEL,
  MODEL_PRESETS,
  useSettings,
} from "@/lib/settings-context";
import { DEFAULT_OPENROUTER_BASE_URL } from "@/lib/openrouter";

type TestState =
  | { status: "idle" }
  | { status: "pending" }
  | { status: "ok"; message: string }
  | { status: "error"; message: string };

export default function SettingsPage() {
  const {
    settings,
    ready,
    hasApiKey,
    setApiKey,
    setModel,
    setBaseUrl,
  } = useSettings();

  const [apiKeyDraft, setApiKeyDraft] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [customModel, setCustomModel] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [baseUrlDraft, setBaseUrlDraft] = useState(DEFAULT_OPENROUTER_BASE_URL);
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [test, setTest] = useState<TestState>({ status: "idle" });

  useEffect(() => {
    if (!ready) return;
    const isPreset = MODEL_PRESETS.some((p) => p.id === settings.model);
    setUseCustom(!isPreset);
    setCustomModel(isPreset ? "" : settings.model);
    setBaseUrlDraft(settings.baseUrl);
  }, [ready, settings.model, settings.baseUrl]);

  useEffect(() => {
    if (!saveToast) return;
    const timer = window.setTimeout(() => setSaveToast(null), 2200);
    return () => window.clearTimeout(timer);
  }, [saveToast]);

  async function handleSaveKey(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = apiKeyDraft.trim();
    if (!trimmed) return;
    await setApiKey(trimmed);
    setApiKeyDraft("");
    setSaveToast("API Key 已保存");
    setTest({ status: "idle" });
  }

  async function handleDeleteKey() {
    const confirmed = window.confirm("确定要删除已保存的 API Key 吗？");
    if (!confirmed) return;
    await setApiKey(null);
    setSaveToast("API Key 已删除");
    setTest({ status: "idle" });
  }

  async function handleSelectPreset(id: string) {
    setUseCustom(false);
    setCustomModel("");
    await setModel(id);
    setSaveToast("已更新模型");
  }

  async function handleCommitCustomModel() {
    const trimmed = customModel.trim();
    if (!trimmed) return;
    await setModel(trimmed);
    setSaveToast("已更新模型");
  }

  async function handleCommitBaseUrl() {
    await setBaseUrl(baseUrlDraft);
    setSaveToast("已更新 API 地址");
  }

  async function handleResetBaseUrl() {
    setBaseUrlDraft(DEFAULT_OPENROUTER_BASE_URL);
    await setBaseUrl(DEFAULT_OPENROUTER_BASE_URL);
    setSaveToast("已恢复默认 API 地址");
  }

  async function handleTestConnection() {
    if (!settings.apiKey) {
      setTest({ status: "error", message: "请先保存 API Key 再测试。" });
      return;
    }
    setTest({ status: "pending" });
    try {
      const response = await fetch(`${settings.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${settings.apiKey}`,
          "HTTP-Referer": "https://github.com/skysf/gene-app",
          "X-Title": "Gene App",
        },
        body: JSON.stringify({
          model: settings.model,
          messages: [{ role: "user", content: "ping" }],
          max_tokens: 1,
          stream: false,
        }),
      });

      if (response.ok) {
        setTest({
          status: "ok",
          message: `连接成功 · 模型 ${settings.model} 可用`,
        });
        return;
      }

      let detail = `HTTP ${response.status}`;
      try {
        const data = await response.json();
        const msg =
          (data as { error?: { message?: string } })?.error?.message ||
          (data as { message?: string })?.message;
        if (msg) detail = msg;
      } catch {}
      setTest({ status: "error", message: detail });
    } catch (error) {
      setTest({
        status: "error",
        message:
          (error as Error)?.message || "网络请求失败，检查一下网络连接。",
      });
    }
  }

  const activeModel = settings.model || DEFAULT_MODEL;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.26em] text-stone-500 uppercase">
            Settings
          </p>
          <h1 className="mt-1 font-serif text-3xl text-stone-900">设置</h1>
          <p className="mt-2 text-sm leading-7 text-stone-600">
            AI 通过 OpenRouter 调用，你需要自带 API Key。Key 仅保存在本机，不会上传到任何服务器。
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex min-h-10 items-center rounded-full border border-stone-200 bg-white px-4 text-sm font-semibold text-stone-700 transition hover:border-stone-400"
        >
          返回首页
        </Link>
      </header>

      {saveToast ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800">
          {saveToast}
        </div>
      ) : null}

      <section className="surface-card space-y-4 rounded-[1.75rem] p-6 shadow-soft">
        <div>
          <h2 className="font-serif text-xl text-stone-900">OpenRouter API Key</h2>
          <p className="mt-1 text-sm leading-6 text-stone-600">
            去{" "}
            <a
              href="https://openrouter.ai/keys"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-emerald-700 underline underline-offset-2"
            >
              openrouter.ai/keys
            </a>{" "}
            创建一个 Key，粘贴到下方保存。
          </p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white/80 p-4">
          <p className="text-xs font-semibold tracking-[0.18em] text-stone-500 uppercase">
            当前状态
          </p>
          <p className="mt-1 text-sm font-semibold text-stone-800">
            {hasApiKey ? (
              <span className="text-emerald-700">
                已保存（末尾 ...{settings.apiKey!.slice(-6)}）
              </span>
            ) : (
              <span className="text-amber-700">未配置</span>
            )}
          </p>
        </div>

        <form onSubmit={handleSaveKey} className="space-y-3">
          <label className="block text-sm font-semibold text-stone-800">
            新的 API Key
            <div className="mt-2 flex gap-2">
              <input
                type={showApiKey ? "text" : "password"}
                value={apiKeyDraft}
                onChange={(event) => setApiKeyDraft(event.target.value)}
                placeholder="sk-or-v1-..."
                autoComplete="off"
                spellCheck={false}
                className="min-h-11 flex-1 rounded-full border border-stone-200 bg-white px-4 font-mono text-sm text-stone-900 outline-none transition focus:border-emerald-400"
              />
              <button
                type="button"
                onClick={() => setShowApiKey((v) => !v)}
                className="inline-flex min-h-11 shrink-0 items-center rounded-full border border-stone-200 bg-white px-3 text-xs font-semibold text-stone-700 transition hover:border-stone-400"
              >
                {showApiKey ? "隐藏" : "显示"}
              </button>
            </div>
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={!apiKeyDraft.trim()}
              className="inline-flex min-h-11 items-center rounded-full bg-emerald-700 px-4 text-sm font-semibold text-white transition enabled:hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-stone-300"
            >
              保存
            </button>
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={!hasApiKey || test.status === "pending"}
              className="inline-flex min-h-11 items-center rounded-full border border-stone-200 bg-white px-4 text-sm font-semibold text-stone-700 transition enabled:hover:border-stone-400 disabled:cursor-not-allowed disabled:text-stone-400"
            >
              {test.status === "pending" ? "测试中..." : "测试连接"}
            </button>
            <button
              type="button"
              onClick={handleDeleteKey}
              disabled={!hasApiKey}
              className="inline-flex min-h-11 items-center rounded-full border border-rose-200 bg-white px-4 text-sm font-semibold text-rose-700 transition enabled:hover:border-rose-400 disabled:cursor-not-allowed disabled:text-stone-400"
            >
              删除 Key
            </button>
          </div>
        </form>

        {test.status === "ok" ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
            {test.message}
          </div>
        ) : null}
        {test.status === "error" ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">
            {test.message}
          </div>
        ) : null}
      </section>

      <section className="surface-card space-y-4 rounded-[1.75rem] p-6 shadow-soft">
        <div>
          <h2 className="font-serif text-xl text-stone-900">模型选择</h2>
          <p className="mt-1 text-sm leading-6 text-stone-600">
            当前使用：
            <span className="ml-1 rounded-full bg-stone-100 px-2 py-0.5 font-mono text-xs text-stone-800">
              {activeModel}
            </span>
          </p>
        </div>

        <div className="space-y-2">
          {MODEL_PRESETS.map((preset) => {
            const isActive = !useCustom && settings.model === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset.id)}
                className={`flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                  isActive
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-stone-200 bg-white hover:border-stone-400"
                }`}
              >
                <span
                  className={`mt-1 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                    isActive
                      ? "border-emerald-600 bg-emerald-600"
                      : "border-stone-300"
                  }`}
                >
                  {isActive ? (
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  ) : null}
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-semibold text-stone-900">
                    {preset.label}
                  </span>
                  <span className="mt-0.5 block text-xs leading-5 text-stone-600">
                    {preset.hint}
                  </span>
                  <span className="mt-0.5 block font-mono text-[11px] text-stone-500">
                    {preset.id}
                  </span>
                </span>
              </button>
            );
          })}

          <div
            className={`rounded-2xl border px-4 py-3 transition ${
              useCustom
                ? "border-emerald-500 bg-emerald-50"
                : "border-stone-200 bg-white"
            }`}
          >
            <label className="flex items-start gap-3">
              <input
                type="radio"
                name="model-preset"
                checked={useCustom}
                onChange={() => setUseCustom(true)}
                className="mt-1"
              />
              <span className="flex-1">
                <span className="block text-sm font-semibold text-stone-900">
                  自定义模型
                </span>
                <span className="mt-0.5 block text-xs leading-5 text-stone-600">
                  填入 OpenRouter 上任意模型 ID，例如
                  <code className="ml-1 rounded bg-stone-100 px-1 font-mono text-[11px]">
                    mistralai/mistral-large-2411
                  </code>
                </span>
              </span>
            </label>

            {useCustom ? (
              <div className="mt-3 flex gap-2">
                <input
                  value={customModel}
                  onChange={(event) => setCustomModel(event.target.value)}
                  placeholder="provider/model-id"
                  spellCheck={false}
                  className="min-h-11 flex-1 rounded-full border border-stone-200 bg-white px-4 font-mono text-sm text-stone-900 outline-none transition focus:border-emerald-400"
                />
                <button
                  type="button"
                  onClick={handleCommitCustomModel}
                  disabled={!customModel.trim() || customModel.trim() === settings.model}
                  className="inline-flex min-h-11 shrink-0 items-center rounded-full bg-emerald-700 px-4 text-sm font-semibold text-white transition enabled:hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-stone-300"
                >
                  使用
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="surface-card space-y-4 rounded-[1.75rem] p-6 shadow-soft">
        <div>
          <h2 className="font-serif text-xl text-stone-900">高级：API 地址</h2>
          <p className="mt-1 text-sm leading-6 text-stone-600">
            默认直连 OpenRouter。如果你走自建代理或镜像，可以改这里。
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            value={baseUrlDraft}
            onChange={(event) => setBaseUrlDraft(event.target.value)}
            spellCheck={false}
            className="min-h-11 flex-1 rounded-full border border-stone-200 bg-white px-4 font-mono text-sm text-stone-900 outline-none transition focus:border-emerald-400"
          />
          <button
            type="button"
            onClick={handleCommitBaseUrl}
            disabled={baseUrlDraft.trim() === settings.baseUrl || !baseUrlDraft.trim()}
            className="inline-flex min-h-11 items-center rounded-full bg-emerald-700 px-4 text-sm font-semibold text-white transition enabled:hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-stone-300"
          >
            保存
          </button>
          <button
            type="button"
            onClick={handleResetBaseUrl}
            className="inline-flex min-h-11 items-center rounded-full border border-stone-200 bg-white px-4 text-sm font-semibold text-stone-700 transition hover:border-stone-400"
          >
            恢复默认
          </button>
        </div>
      </section>
    </div>
  );
}
