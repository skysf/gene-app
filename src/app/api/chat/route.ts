import { NextResponse } from "next/server";
import {
  BIOLOGY_REFUSAL_MESSAGE,
  type BiologyChatContext,
  type ChatMessage,
} from "@/lib/chat";

type ProviderName = "bailian" | "kimi";

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

const CONTEXT_FOLLOW_UP = /为什么|如何|怎么|这次|当前|这个结果|请解释|再简单/i;

const providers = {
  bailian: {
    baseUrl: process.env.DASHSCOPE_BASE_URL ?? "https://dashscope.aliyuncs.com/compatible-mode/v1",
    model: process.env.DASHSCOPE_MODEL ?? "qwen-plus",
    apiKey: process.env.DASHSCOPE_API_KEY,
  },
  kimi: {
    baseUrl: process.env.MOONSHOT_BASE_URL ?? "https://api.moonshot.cn/v1",
    model: process.env.MOONSHOT_MODEL ?? "kimi-k2.5",
    apiKey: process.env.MOONSHOT_API_KEY,
  },
} as const;

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      messages?: ChatMessage[];
      context?: BiologyChatContext;
    };

    const messages = Array.isArray(payload.messages) ? payload.messages : [];
    const context = payload.context;
    const latestUserMessage = [...messages]
      .reverse()
      .find((message) => message.role === "user")?.content;

    if (!latestUserMessage) {
      return NextResponse.json(
        { answer: "请先输入一个生物相关问题。" },
        { status: 400 },
      );
    }

    if (!shouldAllowBiologyQuestion(latestUserMessage, context)) {
      return NextResponse.json({
        answer: BIOLOGY_REFUSAL_MESSAGE,
        providerUsed: "local-guard",
      });
    }

    const orderedProviders = getProviderOrder();
    const availableProviders = orderedProviders.filter(
      (provider) => providers[provider].apiKey,
    );

    if (availableProviders.length === 0) {
      return NextResponse.json({
        answer:
          "AI 助手已经准备好接口结构，但当前环境还没有配置百炼或 Kimi 的 API Key。你可以先继续使用离线模拟器。",
        providerUsed: "local-fallback",
      });
    }

    const systemPrompt = buildSystemPrompt(context);
    const upstreamMessages = [
      { role: "system", content: systemPrompt },
      ...messages.slice(-8).map((message) => ({
        role: message.role,
        content: message.content,
      })),
    ];

    const errors: string[] = [];

    for (const provider of availableProviders) {
      try {
        const answer = await callProvider(provider, upstreamMessages);
        return NextResponse.json({
          answer,
          providerUsed: provider,
        });
      } catch (error) {
        errors.push(`${provider}: ${formatError(error)}`);
      }
    }

    return NextResponse.json(
      {
        answer:
          "这次没有成功从 AI 服务拿到回复。你可以稍后重试，或者继续使用离线模拟器进行探究。",
        providerUsed: "unavailable",
        errors,
      },
      { status: 502 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        answer: "请求格式没有解析成功，请稍后再试一次。",
        error: formatError(error),
      },
      { status: 400 },
    );
  }
}

function getProviderOrder(): ProviderName[] {
  const preferred = process.env.AI_PROVIDER === "kimi" ? "kimi" : "bailian";
  return preferred === "kimi" ? ["kimi", "bailian"] : ["bailian", "kimi"];
}

function shouldAllowBiologyQuestion(
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

function buildSystemPrompt(context?: BiologyChatContext) {
  const contextLines = [
    context?.moduleTitle ? `当前模块：${context.moduleTitle}` : "",
    context?.note ? `教学场景：${context.note}` : "",
    context?.mutationLabel ? `当前突变标签：${context.mutationLabel}` : "",
    context?.dnaBefore ? `DNA（突变前）：${context.dnaBefore}` : "",
    context?.dnaAfter ? `DNA（突变后）：${context.dnaAfter}` : "",
    context?.mrnaBefore ? `mRNA（突变前）：${context.mrnaBefore}` : "",
    context?.mrnaAfter ? `mRNA（突变后）：${context.mrnaAfter}` : "",
    context?.proteinBefore ? `蛋白质（突变前）：${context.proteinBefore}` : "",
    context?.proteinAfter ? `蛋白质（突变后）：${context.proteinAfter}` : "",
    context?.environment ? `当前环境：${context.environment}` : "",
    context?.generationSummary ? `当前模拟摘要：${context.generationSummary}` : "",
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

async function callProvider(
  provider: ProviderName,
  messages: { role: string; content: string }[],
) {
  const config = providers[provider];

  if (!config.apiKey) {
    throw new Error(`${provider} API key missing`);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);

  try {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages,
        max_tokens: 700,
        stream: false,
        ...(provider === "kimi" && config.model.startsWith("kimi-k2.5")
          ? { thinking: { type: "disabled" } }
          : {}),
      }),
      signal: controller.signal,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error?.message ?? data?.message ?? `${provider} request failed`);
    }

    const answer = extractAnswer(data);

    if (!answer) {
      throw new Error(`${provider} returned empty content`);
    }

    return answer;
  } finally {
    clearTimeout(timeout);
  }
}

function extractAnswer(data: unknown) {
  const content = (
    data as {
      choices?: Array<{
        message?: {
          content?: string | Array<{ type?: string; text?: string }>;
        };
      }>;
    }
  )?.choices?.[0]?.message?.content;

  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((item) => item.text ?? "")
      .filter(Boolean)
      .join("\n");
  }

  return "";
}

function formatError(error: unknown) {
  return error instanceof Error ? error.message : "unknown error";
}

