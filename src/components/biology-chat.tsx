"use client";

import { FormEvent, useEffect, useState } from "react";
import type { BiologyChatContext, ChatMessage } from "@/lib/chat";

type BiologyChatProps = {
  title?: string;
  exampleQuestions: string[];
  context: BiologyChatContext;
};

export function BiologyChat({
  title = "AI 生物助手",
  exampleQuestions,
  context,
}: BiologyChatProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [draft, setDraft] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "我可以解释当前页面里的生物概念和实验结果。你可以直接问我“为什么这次突变会这样”或“请结合当前图表解释”。",
    },
  ]);

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

  async function sendMessage(nextContent: string) {
    const content = nextContent.trim();

    if (!content || isPending) {
      return;
    }

    const nextMessages = [...messages, { role: "user" as const, content }];
    setMessages(nextMessages);
    setDraft("");
    setIsPending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: nextMessages,
          context,
        }),
      });

      const payload = (await response.json()) as { answer?: string };
      const answer =
        payload.answer ??
        "暂时没有拿到模型回复。你可以继续围绕当前实验页面问我生物问题。";

      setMessages((current) => [...current, { role: "assistant", content: answer }]);
    } catch (error) {
      console.error(error);
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "这次联网请求没有成功。你仍然可以继续使用离线模拟器，也可以稍后再试一次。",
        },
      ]);
    } finally {
      setIsPending(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await sendMessage(draft);
  }

  function renderPanelBody(options?: { mobileClose?: boolean; desktopCollapse?: boolean }) {
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

        <div
          className={`mt-4 rounded-2xl border px-3 py-2 text-xs font-semibold ${
            isOnline
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-amber-200 bg-amber-50 text-amber-800"
          }`}
        >
          {isOnline
            ? "联网时可调用百炼 / Kimi"
            : "当前离线中，AI 不可用，但模拟器仍可继续使用"}
        </div>

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
                  : "bg-stone-950 text-white"
              }`}
            >
              <p className="mb-1 text-[11px] font-semibold tracking-[0.18em] uppercase opacity-70">
                {message.role === "assistant" ? "AI" : "你"}
              </p>
              <p>{message.content}</p>
            </article>
          ))}
          {isPending ? (
            <article className="rounded-[1.3rem] bg-white px-4 py-3 text-sm text-stone-600">
              正在整理生物解释...
            </article>
          ) : null}
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
            disabled={!isOnline || isPending || !draft.trim()}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-emerald-700 px-4 text-sm font-semibold text-white transition enabled:hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-stone-300"
          >
            发送生物问题
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
        className="fixed right-4 bottom-5 z-30 inline-flex min-h-12 items-center rounded-full bg-stone-950 px-5 text-sm font-semibold text-white shadow-lg lg:hidden"
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
              <span className="rounded-2xl bg-stone-950 px-3 py-2 text-sm font-bold text-white">
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
