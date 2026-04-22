export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type BiologyChatContext = {
  module: string;
  moduleTitle: string;
  note?: string;
  dnaBefore?: string;
  dnaAfter?: string;
  mrnaBefore?: string;
  mrnaAfter?: string;
  proteinBefore?: string;
  proteinAfter?: string;
  mutationLabel?: string;
  environment?: string;
  generationSummary?: string;
};

export const BIOLOGY_REFUSAL_MESSAGE =
  "我目前只回答生物相关问题，尤其是基因突变、遗传、细胞、蛋白质合成和自然选择等内容。你可以继续问我当前实验结果或高中生物课堂里的问题。";

