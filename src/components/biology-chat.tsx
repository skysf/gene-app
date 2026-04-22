"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import type { BiologyChatContext, ChatMessage } from "@/lib/chat";
import { explainError, streamChatCompletion } from "@/lib/openrouter";
import { useSettings } from "@/lib/settings-context";

type BiologyChatProps = {
  title?: string;
  exampleQuestions: string[];
  context: BiologyChatContext;
};

const INITIAL_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "我可以解释当前页面里的生物概念和实验结果。你可以直接问我“为什么这次突变会这样”或“请结合当前图表解释”。",
};

export function BiologyChat({
  title = "AI 生物助手",
  exampleQuestions,
  context,
}: BiologyChatProps) {
  const { settings, ready, hasApiKey } = useSettings();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [draft, setDraft] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const abortRef = useRef<AbortController | null>(null);

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

  useEffect(
    () => () => {
      abortRef.current?.abort();
    },
    [],
  );

  async function sendMessage(nextContent: string) {
    const content = nextContent.trim();

    if (!content || isPending) {
      return;
    }

    if (!hasApiKey || !settings.apiKey) {
      setMessages((current) => [
        ...current,
        { role: "user", content },
        {
          role: "assistant",
          content:
            "还没有配置 OpenRouter API Key。请打开右上角的“设置”填写你的 Key 后再试。",
        },
      ]);
      setDraft("");
      return;
    }

    const userMessage: ChatMessage = { role: "user", content };
    const placeholder: ChatMessage = { role: "assistant", content: "" };
    const historyForModel = [...messages, userMessage];

    setMessages([...messages, userMessage, placeholder]);
    setDraft("");
    setIsPending(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await streamChatCompletion({
        apiKey: settings.apiKey,
        model: settings.model,
        baseUrl: settings.baseUrl,
        messages: historyForModel,
        context,
        signal: controller.signal,
        onChunk: (delta) => {
          setMessages((current) => {
            const last = current[current.length - 1];
            if (!last || last.role !== "assistant") return current;
            const copy = current.slice(0, -1);
            copy.push({ ...last, content: last.content + delta });
            return copy;
          });
        },
      });

      setMessages((current) => {
        const last = current[current.length - 1];
        if (last && last.role === "assistant" && last.content.length === 0) {
          const copy = current.slice(0, -1);
          copy.push({
            role: "assistant",
            content: "（模型这次没有返回内容，稍后再试一次。）",
          });
          return copy;
        }
        return current;
      });
    } catch (error) {
      const detail =
        explainError(error) || "这次请求没有成功，稍后再试一次。";
      if (!detail) return; // aborted
      setMessages((current) => {
        const last = current[current.length - 1];
        const copy = current.slice(0, -1);
        if (last && last.role === "assistant" && last.content.length === 0) {
          copy.push({ role: "assistant", content: detail });
        } else if (last) {
          copy.push(last);
          copy.push({ role: "assistant", content: detail });
        }
        return copy;
      });
    } finally {
      setIsPending(false);
      abortRef.current = null;
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await sendMessage(draft);
  }

  function renderStatusBanner() {
    if (!ready) {
      return (
        <div className="mt-4 rounded-2xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-600">
          正在读取设置...
        </div>
      );
    }
    if (!isOnline) {
      return (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
          当前离线，AI 不可用；模拟器其他模块仍可继续使用。
        </div>
      );
    }
    if (!hasApiKey) {
      return (
        <div className="mt-4 flex items-start justify-between gap-3 rounded-2xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-800">
          <span>还没有配置 OpenRouter API Key。</span>
          <Link
            href="/settings"
            className="shrink-0 rounded-full bg-sky-700 px-3 py-1 text-[11px] font-semibold text-white"
          >
            去设置
          </Link>
        </div>
      );
    }
    return (
      <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">
        已连接 OpenRouter · 模型 {settings.model}
      </div>
    );
  }

  function renderPanelBody(options?: {
    mobileClose?: boolean;
    desktopCollapse?: boolean;
  }) {
    return (
      <>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-stone-900">{title}</p>
            <p className="mt-1 text-xs leading-6 text-stone-600">
              只回答生物相关问题，优先结合当前实验页面解释。
            </p>
          </div>
          <div className="flex items-center gap-2">
            {options?.desktopCollapse ? (
              <button
                type="button"
                onClick={() => setIsDesktopCollapsed(true)}
                className="hidden min-h-10 items-center rounded-full border border-stone-200 bg-white px-3 text-xs font-semibold text-stone-700 transition hover:border-stone-400 lg:inline-flex"
              >
                收起
              </button>
            ) : null}
            {options?.mobileClose ? (
              <button
                type="button"
                onClick={() => setIsMobileOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 text-stone-600 lg:hidden"
              >
                关
              </button>
            ) : null}
          </div>
        </div>

        {renderStatusBanner()}

        <div className="mt-4 flex flex-wrap gap-2">
          {exampleQuestions.map((question) => (
            <button
              key={question}
              type="button"
              onClick={() => setDraft(question)}
              className="rounded-full border border-stone-200 bg-white px-3 py-2 text-left text-xs leading-5 text-stone-700 transition hover:border-stone-400"
            >
              {question}
            </button>
          ))}
        </div>

        <div className="scrollbar-subtle mt-4 flex-1 space-y-3 overflow-y-auto pr-1">
          {messages.map((message, index) => (
            <article
              key={`${message.role}-${index}`}
              className={`rounded-[1.3rem] px-4 py-3 text-sm leading-7 ${
                message.role === "assistant"
                  ? "bg-white text-stone-800"
                  : "bg-gradient-to-br from-emerald-500 to-teal-600 text-white"
              }`}
            >
              <p className="mb-1 text-[11px] font-semibold tracking-[0.18em] uppercase opacity-70">
                {message.role === "assistant" ? "AI" : "你"}
              </p>
              <p className="whitespace-pre-wrap">
                {message.content ||
                  (isPending && index === messages.length - 1
                    ? "正在整理生物解释..."
                    : "")}
              </p>
            </article>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={4}
            placeholder="例如：为什么这次缺失会造成移码？"
            className="w-full resize-none rounded-[1.2rem] border border-stone-200 bg-white px-4 py-3 text-sm leading-7 text-stone-900 outline-none transition focus:border-emerald-400"
          />
          <button
            type="submit"
            disabled={!isOnline || isPending || !draft.trim() || !hasApiKey}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-emerald-700 px-4 text-sm font-semibold text-white transition enabled:hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-stone-300"
          >
            {isPending ? "生成中..." : "发送生物问题"}
          </button>
        </form>
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsMobileOpen(true)}
        className="fixed right-4 bottom-5 z-30 inline-flex min-h-12 items-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 px-5 text-sm font-semibold text-white shadow-lg hover:from-emerald-600 hover:to-teal-700 lg:hidden"
      >
        AI 助手
      </button>

      <div
        className={`hidden shrink-0 transition-all duration-300 lg:sticky lg:top-28 lg:block ${
          isDesktopCollapsed ? "lg:w-[5.5rem]" : "lg:w-[22rem]"
        }`}
      >
        {isDesktopCollapsed ? (
          <aside className="surface-card rounded-[1.5rem] p-3 shadow-soft">
            <button
              type="button"
              onClick={() => setIsDesktopCollapsed(false)}
              className="flex w-full flex-col items-center gap-4 rounded-[1.25rem] border border-stone-200 bg-white/78 px-2 py-4 text-center transition hover:border-stone-400"
            >
              <span className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 px-3 py-2 text-sm font-bold text-white">
                AI
              </span>
              <span className="text-sm font-semibold leading-5 text-stone-800">
                展开助手
              </span>
              <span
                className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                  isOnline
                    ? "bg-emerald-50 text-emerald-800"
                    : "bg-amber-50 text-amber-800"
                }`}
              >
                {isOnline ? "联网" : "离线"}
              </span>
            </button>
          </aside>
        ) : (
          <aside className="surface-card flex h-[calc(100vh-9rem)] max-h-[860px] flex-col rounded-[1.75rem] p-4 shadow-soft">
            {renderPanelBody({ desktopCollapse: true })}
          </aside>
        )}
      </div>

      <aside
        className={`surface-card fixed inset-x-3 bottom-3 top-24 z-40 flex flex-col rounded-[1.75rem] p-4 shadow-soft transition duration-300 lg:hidden ${
          isMobileOpen
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-8 opacity-0"
        }`}
      >
        {renderPanelBody({ mobileClose: true })}
      </aside>
    </>
  );
}
