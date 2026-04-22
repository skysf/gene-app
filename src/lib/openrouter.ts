import type { BiologyChatContext, ChatMessage } from "./chat";
import { BIOLOGY_REFUSAL_MESSAGE } from "./chat";

const BIOLOGY_KEYWORDS = [
  /基因/i,
  /突变/i,
  /遗传/i,
  /生物/i,
  /细胞/i,
  /DNA/i,
  /RNA/i,
  /蛋白/i,
  /氨基酸/i,
  /自然选择/i,
  /进化/i,
  /红细胞/i,
  /镰状/i,
  /密码子/i,
  /转录/i,
  /翻译/i,
  /免疫/i,
  /酶/i,
  /光合/i,
  /呼吸作用/i,
  /减数/i,
  /有丝分裂/i,
];

const CONTEXT_FOLLOW_UP =
  /为什么|如何|怎么|这次|当前|这个结果|请解释|再简单/i;

export const DEFAULT_OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

export type OpenRouterErrorKind =
  | "auth"
  | "rate_limit"
  | "server"
  | "network"
  | "refusal"
  | "empty"
  | "parse"
  | "aborted"
  | "unknown";

export class OpenRouterError extends Error {
  readonly kind: OpenRouterErrorKind;
  readonly status?: number;

  constructor(message: string, kind: OpenRouterErrorKind, status?: number) {
    super(message);
    this.name = "OpenRouterError";
    this.kind = kind;
    this.status = status;
  }
}

export function shouldAllowBiologyQuestion(
  input: string,
  context?: BiologyChatContext,
) {
  if (BIOLOGY_KEYWORDS.some((keyword) => keyword.test(input))) {
    return true;
  }

  if (context?.module && CONTEXT_FOLLOW_UP.test(input)) {
    return true;
  }

  return false;
}

export function buildSystemPrompt(context?: BiologyChatContext) {
  const contextLines = [
    context?.moduleTitle ? `当前模块：${context.moduleTitle}` : "",
    context?.note ? `教学场景：${context.note}` : "",
    context?.mutationLabel ? `当前突变标签：${context.mutationLabel}` : "",
    context?.dnaBefore ? `DNA（突变前）：${context.dnaBefore}` : "",
    context?.dnaAfter ? `DNA（突变后）：${context.dnaAfter}` : "",
    context?.mrnaBefore ? `mRNA（突变前）：${context.mrnaBefore}` : "",
    context?.mrnaAfter ? `mRNA（突变后）：${context.mrnaAfter}` : "",
    context?.proteinBefore
      ? `蛋白质（突变前）：${context.proteinBefore}`
      : "",
    context?.proteinAfter
      ? `蛋白质（突变后）：${context.proteinAfter}`
      : "",
    context?.environment ? `当前环境：${context.environment}` : "",
    context?.generationSummary
      ? `当前模拟摘要：${context.generationSummary}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  return [
    "你是一名面向中国高中生的生物课堂助手。",
    "你只能回答生物相关问题，优先回答基因突变、遗传、细胞、蛋白质合成、自然选择与进化。",
    "请用简洁中文作答，优先结合当前实验上下文解释，不要泛泛而谈。",
    "如果问题偏离生物主题，请礼貌拒答并把话题拉回生物课堂。",
    "不要提供医疗诊断，不要假装进行临床建议。",
    "如果学生表述模糊，可以先解释当前页面结果，再提示他比较突变前后的密码子或图表趋势。",
    contextLines ? `当前上下文：\n${contextLines}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

export type StreamChatParams = {
  apiKey: string;
  model: string;
  baseUrl?: string;
  messages: ChatMessage[];
  context?: BiologyChatContext;
  signal?: AbortSignal;
  onChunk: (text: string) => void;
  historyLimit?: number;
  maxTokens?: number;
};

export async function streamChatCompletion(
  params: StreamChatParams,
): Promise<void> {
  const {
    apiKey,
    model,
    baseUrl = DEFAULT_OPENROUTER_BASE_URL,
    messages,
    context,
    signal,
    onChunk,
    historyLimit = 8,
    maxTokens = 700,
  } = params;

  const latestUser = [...messages]
    .reverse()
    .find((message) => message.role === "user")?.content;

  if (!latestUser) {
    throw new OpenRouterError("请先输入一个生物相关问题。", "empty");
  }

  if (!shouldAllowBiologyQuestion(latestUser, context)) {
    onChunk(BIOLOGY_REFUSAL_MESSAGE);
    return;
  }

  const upstreamMessages = [
    { role: "system" as const, content: buildSystemPrompt(context) },
    ...messages.slice(-historyLimit).map((message) => ({
      role: message.role,
      content: message.content,
    })),
  ];

  let response: Response;
  try {
    response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://github.com/skysf/gene-app",
        "X-Title": "Gene App",
      },
      body: JSON.stringify({
        model,
        stream: true,
        messages: upstreamMessages,
        max_tokens: maxTokens,
      }),
      signal,
    });
  } catch (error) {
    if ((error as { name?: string })?.name === "AbortError") {
      throw new OpenRouterError("已取消", "aborted");
    }
    throw new OpenRouterError(
      (error as Error).message || "网络请求失败",
      "network",
    );
  }

  if (!response.ok) {
    const detail = await extractErrorDetail(response);
    throw new OpenRouterError(detail, classifyStatus(response.status), response.status);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new OpenRouterError("响应体为空", "parse");
  }

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      let lineEnd: number;
      while ((lineEnd = buffer.indexOf("\n")) !== -1) {
        const rawLine = buffer.slice(0, lineEnd);
        buffer = buffer.slice(lineEnd + 1);
        const line = rawLine.trim();

        if (!line || line.startsWith(":")) continue;
        if (!line.startsWith("data:")) continue;

        const payload = line.slice(5).trim();
        if (payload === "[DONE]") return;

        let parsed: unknown;
        try {
          parsed = JSON.parse(payload);
        } catch {
          continue;
        }

        const delta = (
          parsed as {
            choices?: Array<{ delta?: { content?: string | null } }>;
          }
        )?.choices?.[0]?.delta?.content;

        if (typeof delta === "string" && delta.length > 0) {
          onChunk(delta);
        }
      }
    }
  } catch (error) {
    if ((error as { name?: string })?.name === "AbortError") {
      throw new OpenRouterError("已取消", "aborted");
    }
    throw error;
  }
}

async function extractErrorDetail(response: Response) {
  try {
    const data = await response.json();
    const message =
      (data as { error?: { message?: string } })?.error?.message ??
      (data as { message?: string })?.message;
    if (typeof message === "string" && message.length > 0) return message;
  } catch {}
  return `HTTP ${response.status}`;
}

function classifyStatus(status: number): OpenRouterErrorKind {
  if (status === 401 || status === 403) return "auth";
  if (status === 429) return "rate_limit";
  if (status >= 500) return "server";
  return "unknown";
}

export function explainError(error: unknown): string {
  if (error instanceof OpenRouterError) {
    switch (error.kind) {
      case "auth":
        return "API Key 无效或已过期，请到设置里检查 OpenRouter Key。";
      case "rate_limit":
        return "OpenRouter 返回限流（429），稍等一会再试。";
      case "server":
        return `OpenRouter 服务端暂时不可用（${error.status ?? "5xx"}），稍后重试。`;
      case "network":
        return "联网请求没有成功，检查一下网络。";
      case "empty":
        return error.message;
      case "aborted":
        return "";
      case "refusal":
      case "parse":
      case "unknown":
      default:
        return error.message || "这次请求没有成功，稍后再试一次。";
    }
  }

  return "这次请求没有成功，稍后再试一次。";
}
