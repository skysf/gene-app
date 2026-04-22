import {
  HBB_NORMAL_SEQUENCE,
  HBB_SICKLE_SEQUENCE,
  SICKLE_MUTATION_INDEX,
  formatAminoAcids,
  toMrna,
  translateMrna,
} from "@/lib/genetics";

export type SickleCaseStep = {
  id: string;
  title: string;
  focus: string;
  explanation: string;
  normalSequence?: string;
  mutantSequence?: string;
  highlightStart?: number;
  highlightEnd?: number;
  normalProtein?: string;
  mutantProtein?: string;
};

export const sickleCaseSteps: SickleCaseStep[] = [
  {
    id: "cells",
    title: "先看红细胞形态差异",
    focus: "从性状入手",
    explanation:
      "正常红细胞更圆、更柔软，容易通过毛细血管；镰状红细胞更弯、更硬，容易堵塞微小血管。",
  },
  {
    id: "dna",
    title: "定位 DNA 中的关键替换",
    focus: "从编码链看突变",
    explanation:
      "在这个教学片段中，我们看到第 20 位碱基发生替换（GAG → GTG）。该片段节选自 HBB 基因前 30 个碱基，对应参考序列 NM_000518.5 的起始区域。",
    normalSequence: HBB_NORMAL_SEQUENCE,
    mutantSequence: HBB_SICKLE_SEQUENCE,
    highlightStart: SICKLE_MUTATION_INDEX - 1,
    highlightEnd: SICKLE_MUTATION_INDEX + 1,
  },
  {
    id: "mrna",
    title: "转录后，mRNA 密码子也会变化",
    focus: "DNA -> mRNA",
    explanation:
      "编码链中的 GAG 在转录后对应 mRNA 中的 GAG，而突变后变成 GUG，于是后续翻译的氨基酸也会跟着改变。",
    normalSequence: toMrna(HBB_NORMAL_SEQUENCE),
    mutantSequence: toMrna(HBB_SICKLE_SEQUENCE),
    highlightStart: SICKLE_MUTATION_INDEX - 1,
    highlightEnd: SICKLE_MUTATION_INDEX + 1,
  },
  {
    id: "protein",
    title: "氨基酸从谷氨酸变成缬氨酸",
    focus: "mRNA -> 蛋白质",
    explanation:
      "正常序列翻译后这段蛋白质中包含 Glu（谷氨酸），突变后相同位置变成 Val（缬氨酸）。Glu 带负电、亲水，Val 疏水；在低氧状态下，改变后的 β 链会让血红蛋白互相聚合形成长链，把红细胞拉成镰刀形。教科书习惯记作 β6 Glu→Val（成熟链从 Val 起数），临床 HGVS 写作 p.Glu7Val（从起始甲硫氨酸起数），指的都是同一个位点。",
    normalProtein: formatAminoAcids(translateMrna(toMrna(HBB_NORMAL_SEQUENCE))),
    mutantProtein: formatAminoAcids(translateMrna(toMrna(HBB_SICKLE_SEQUENCE))),
  },
  {
    id: "selection",
    title: "把视角拉到自然选择",
    focus: "从个体走向种群",
    explanation:
      "这个突变会给个体带来风险，但在特定环境下，杂合子可能更有生存优势，因此该等位基因不会简单地马上消失。",
  },
];

export const chatExamples = {
  cases: [
    "为什么一个碱基变化就可能影响红细胞形态？",
    "DNA、mRNA 和氨基酸之间的关系是什么？",
    "镰状细胞贫血为什么会和自然选择联系起来？",
  ],
  lab: [
    "为什么这次增添会造成移码？",
    "替换和缺失对蛋白质的影响有什么不同？",
    "请结合当前实验结果，用更简单的话解释一次。",
  ],
  evolution: [
    "为什么自然选择会改变等位基因频率？",
    "杂合子优势是什么意思？",
    "请结合当前图表，总结 HbS 频率变化趋势。",
  ],
} as const;
