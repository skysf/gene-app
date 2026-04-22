"use client";

import { useState } from "react";
import { sickleCaseSteps, type SickleCaseStep } from "@/lib/content";
import { SequenceStrip } from "@/components/sequence-strip";
import { HBB_NORMAL_SEQUENCE, HBB_SICKLE_SEQUENCE, toMrna } from "@/lib/genetics";

const comparisonToneClasses = {
  sky: {
    shell:
      "border-sky-200 bg-[linear-gradient(180deg,rgba(240,249,255,0.96),rgba(231,243,255,0.84))]",
    badge: "bg-sky-100 text-sky-900",
    text: "text-sky-950/85",
  },
  emerald: {
    shell:
      "border-emerald-200 bg-[linear-gradient(180deg,rgba(236,253,245,0.96),rgba(219,248,235,0.84))]",
    badge: "bg-emerald-100 text-emerald-900",
    text: "text-emerald-950/85",
  },
  amber: {
    shell:
      "border-amber-200 bg-[linear-gradient(180deg,rgba(255,251,235,0.96),rgba(253,243,214,0.84))]",
    badge: "bg-amber-100 text-amber-900",
    text: "text-amber-950/85",
  },
} as const;

export function SickleCaseExplorer() {
  const [activeStep, setActiveStep] = useState(0);
  const step = sickleCaseSteps[activeStep];
  const progress = ((activeStep + 1) / sickleCaseSteps.length) * 100;
  const boardMeta = getBoardMeta(step);
  const highlights = getStepHighlights(step);

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(16rem,18rem)_minmax(0,1fr)]">
      <aside className="surface-card rounded-[1.75rem] p-4 xl:sticky xl:top-28">
        <div className="rounded-[1.4rem] border border-white/70 bg-white/65 p-4">
          <p className="text-sm font-semibold tracking-[0.18em] text-stone-500 uppercase">
            案例步骤
          </p>
          <p className="mt-2 text-sm leading-7 text-stone-600">
            从细胞外观一路追到 DNA、mRNA、蛋白质，再把视角拉到自然选择。
          </p>
          <div className="mt-4 h-2 rounded-full bg-stone-200">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#0f766e_0%,#d97706_100%)] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <div className="mt-4 grid gap-3">
          {sickleCaseSteps.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveStep(index)}
              className={`rounded-[1.35rem] border px-4 py-4 text-left transition ${
                activeStep === index
                  ? "border-emerald-600 bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-soft"
                  : "border-stone-200 bg-white/82 text-stone-800 hover:border-stone-400 hover:bg-white"
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-sm font-semibold ${
                    activeStep === index
                      ? "bg-white/12 text-white"
                      : "bg-stone-100 text-stone-700"
                  }`}
                >
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold tracking-[0.18em] uppercase opacity-70">
                    {item.focus}
                  </p>
                  <p className="mt-2 text-sm font-semibold leading-6">{item.title}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </aside>

      <section className="min-w-0 space-y-5">
        <article className="surface-card overflow-hidden rounded-[1.75rem] p-6 sm:p-7">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">
                  步骤 {activeStep + 1} / {sickleCaseSteps.length}
                </span>
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                  {step.focus}
                </span>
              </div>
              <h2 className="mt-4 font-serif text-3xl text-stone-900 sm:text-[2.2rem]">
                {step.title}
              </h2>
              <p className="mt-4 text-base leading-8 text-stone-700">{step.explanation}</p>
            </div>

            <div className="grid gap-2 rounded-[1.5rem] border border-stone-200 bg-white/70 p-4 xl:max-w-sm">
              <p className="text-xs font-semibold tracking-[0.18em] text-stone-500 uppercase">
                当前要点
              </p>
              {highlights.map((item) => (
                <p
                  key={item}
                  className="rounded-2xl border border-stone-200 bg-stone-50/90 px-3 py-3 text-sm leading-6 text-stone-700"
                >
                  {item}
                </p>
              ))}
            </div>
          </div>
        </article>

        <article className="surface-card min-w-0 rounded-[1.75rem] p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold tracking-[0.18em] text-stone-500 uppercase">
                {boardMeta.eyebrow}
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-stone-900">{boardMeta.title}</h3>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-stone-600">
                {boardMeta.description}
              </p>
            </div>
            <span className="rounded-full border border-stone-200 bg-white/80 px-3 py-1 text-xs font-semibold text-stone-600">
              保持同一观察框架
            </span>
          </div>
          <div className="mt-6 min-w-0">{renderStepBoard(step)}</div>
        </article>

        <article className="surface-card rounded-[1.75rem] p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold tracking-[0.18em] text-stone-500 uppercase">
                本案例的课堂串联
              </p>
              <h3 className="mt-2 font-serif text-2xl text-stone-900">
                把当前一步放回完整因果链
              </h3>
            </div>
            <span className="rounded-full bg-gradient-to-r from-emerald-500 to-sky-500 px-3 py-1 text-xs font-semibold text-white">
              DNA -&gt; mRNA -&gt; 蛋白质 -&gt; 性状 -&gt; 种群
            </span>
          </div>

          <div className="mt-6 grid gap-3">
            <LessonLinkCard
              label="正常 DNA 编码链片段"
              value={HBB_NORMAL_SEQUENCE}
              tone="emerald"
            />
            <LessonLinkCard
              label="突变后编码链片段"
              value={HBB_SICKLE_SEQUENCE}
              tone="amber"
            />
            <LessonLinkCard
              label="对应 mRNA 对比"
              value={`${toMrna(HBB_NORMAL_SEQUENCE)} / ${toMrna(HBB_SICKLE_SEQUENCE)}`}
              tone="sky"
            />
          </div>

          <p className="mt-5 rounded-[1.5rem] bg-gradient-to-br from-emerald-700 to-teal-800 px-5 py-4 text-sm leading-7 text-emerald-50">
            这是一个典型的点突变示例。它本身属于替换导致的错义突变，但它的影响可以延伸到蛋白质性质、细胞形态，甚至进一步联系到种群中的自然选择。
          </p>
        </article>
      </section>
    </div>
  );
}

function getBoardMeta(step: SickleCaseStep) {
  switch (step.id) {
    case "cells":
      return {
        eyebrow: "并排对比",
        title: "先把可见的形态差异看稳",
        description: "无论后面看到多复杂的分子信息，都先回到一个问题：为什么红细胞外观会变得不一样。",
      };
    case "dna":
      return {
        eyebrow: "追到 DNA",
        title: "把关键替换锁定在同一段序列里",
        description: "这里先看编码链中的具体碱基位置，再把高亮片段和完整序列联系起来。",
      };
    case "mrna":
      return {
        eyebrow: "继续追踪",
        title: "比较转录后密码子的变化",
        description: "先盯住同一个关键密码子，再观察它在完整 mRNA 片段中的位置和上下文。",
      };
    case "protein":
      return {
        eyebrow: "落到蛋白质",
        title: "比较同一位置的氨基酸结果",
        description: "这里不只是看到名字变化，更要意识到氨基酸性质改变会继续影响蛋白质与细胞表现。",
      };
    default:
      return {
        eyebrow: "拉高视角",
        title: "把个体变化推到种群层面",
        description: "最后一步把分子与性状的差异放进环境压力里，理解为什么某个等位基因不会简单地立刻消失。",
      };
  }
}

function getStepHighlights(step: SickleCaseStep) {
  switch (step.id) {
    case "cells":
      return [
        "先建立“正常更圆更柔软、镰状更弯更硬”的直觉。",
        "把外观差异和通过毛细血管的能力联系起来。",
        "为后续追溯分子原因留出问题意识。",
      ];
    case "dna":
      return [
        "关键变化集中在同一个密码子对应的 3 个碱基上。",
        "正常片段是 GAG，突变后变成 GTG。",
        "先看局部，再看完整编码链位置。",
      ];
    case "mrna":
      return [
        "DNA 改变后，转录出的 mRNA 密码子也同步改变。",
        "关键密码子从 GAG 变成 GUG。",
        "这一步是连接 DNA 与蛋白质的桥。",
      ];
    case "protein":
      return [
        "最终被改写的是同一位置上的氨基酸。",
        "谷氨酸变成缬氨酸，性质不再相同。",
        "蛋白质性质变化会继续传递到细胞层面。",
      ];
    default:
      return [
        "自然选择看的不是单个分子，而是生存和繁殖结果。",
        "环境不同，某种基因型的优势也会不同。",
        "因此不利等位基因也可能在种群中继续存在。",
      ];
  }
}

function renderStepBoard(step: SickleCaseStep) {
  if (step.id === "cells") {
    return (
      <div className="grid gap-5 lg:grid-cols-2">
        <ComparisonPanel
          tone="sky"
          label="正常对照"
          title="正常红细胞"
          summary="更接近双凹圆盘形，柔软、富有弹性，更容易携带氧气并通过细小血管。"
          bullets={[
            "整体轮廓更圆，受挤压后更容易恢复。",
            "通过毛细血管时形变能力更强。",
            "运输氧气的过程更稳定。",
          ]}
        >
          <div className="flex flex-wrap gap-3">
            {[...Array(4)].map((_, index) => (
              <div
                key={`normal-${index}`}
                className="h-[4.5rem] w-[4.5rem] rounded-full border-4 border-sky-400 bg-white/95 shadow-[inset_0_8px_18px_rgba(14,165,233,0.12)]"
              />
            ))}
          </div>
        </ComparisonPanel>

        <ComparisonPanel
          tone="amber"
          label="突变表现"
          title="镰状红细胞"
          summary="更容易弯曲成镰刀样，刚性更大，可能堵塞毛细血管并引起贫血等症状。"
          bullets={[
            "轮廓拉长、弯曲，更难顺畅穿过细管。",
            "细胞更硬，堆积时更容易造成阻塞。",
            "形态改变是后面分子变化的外显结果。",
          ]}
        >
          <div className="flex flex-wrap gap-3">
            {[...Array(4)].map((_, index) => (
              <div
                key={`sickle-${index}`}
                className={`h-[4.5rem] w-[4.5rem] border-4 border-amber-400 bg-white/95 shadow-[inset_0_8px_18px_rgba(245,158,11,0.12)] ${
                  index % 2 === 0
                    ? "rounded-[70%_18%_74%_24%/48%_22%_78%_52%] rotate-[-12deg]"
                    : "rounded-[24%_74%_18%_70%/52%_78%_22%_48%] rotate-[10deg]"
                }`}
              />
            ))}
          </div>
        </ComparisonPanel>
      </div>
    );
  }

  if (step.normalSequence && step.mutantSequence) {
    const spotlight = getSequenceSpotlight(step);

    return (
      <div className="grid gap-5">
        {spotlight ? (
          <article className="rounded-[1.5rem] border border-amber-200 bg-amber-50/78 p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold text-amber-900">{spotlight.title}</p>
                <p className="mt-2 text-sm leading-7 text-amber-950/85">
                  {spotlight.description}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <SpotlightTag label={spotlight.normalLabel} value={spotlight.normalValue} />
                <SpotlightTag label={spotlight.mutantLabel} value={spotlight.mutantValue} />
              </div>
            </div>
          </article>
        ) : null}

        <div className="grid gap-4">
          <SequenceStrip
            label={step.id === "mrna" ? "正常 mRNA 序列" : "正常 DNA 序列"}
            sequence={step.normalSequence}
            highlightStart={step.highlightStart}
            highlightEnd={step.highlightEnd}
            accent="emerald"
          />
          <SequenceStrip
            label={step.id === "mrna" ? "突变后 mRNA 序列" : "突变后 DNA 序列"}
            sequence={step.mutantSequence}
            highlightStart={step.highlightStart}
            highlightEnd={step.highlightEnd}
            accent="amber"
          />
        </div>
      </div>
    );
  }

  if (step.normalProtein && step.mutantProtein) {
    return (
      <div className="grid gap-5">
        <article className="rounded-[1.5rem] border border-amber-200 bg-amber-50/78 p-4">
          <p className="text-sm font-semibold text-amber-900">关键替换结果</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <SpotlightTag label="正常氨基酸" value="Glu" />
            <SpotlightTag label="突变后氨基酸" value="Val" />
          </div>
          <p className="mt-3 text-sm leading-7 text-amber-950/85">
            这一步把密码子变化真正翻译成氨基酸层面的差异，也就是后续蛋白质性质改变的起点。
          </p>
        </article>

        <div className="grid gap-5 lg:grid-cols-2">
          <ComparisonPanel
            tone="emerald"
            label="正常翻译"
            title="正常蛋白片段"
            summary="同一段 mRNA 在正常情况下翻译出的氨基酸顺序。"
            bullets={[
              "关键位置保持 Glu。",
              "整体序列作为对照基准。",
              "便于和突变后结果并排比较。",
            ]}
          >
            <p className="rounded-[1.25rem] border border-white/70 bg-white/80 p-4 font-mono text-sm leading-7 text-emerald-950">
              {step.normalProtein}
            </p>
          </ComparisonPanel>

          <ComparisonPanel
            tone="amber"
            label="突变翻译"
            title="突变后蛋白片段"
            summary="同一位置的氨基酸改写后，蛋白质片段的性质也会跟着变化。"
            bullets={[
              "关键位置被改成 Val。",
              "虽然只变一个位置，影响可能继续放大。",
              "这是连接分子与性状差异的关键一步。",
            ]}
          >
            <p className="rounded-[1.25rem] border border-white/70 bg-white/80 p-4 font-mono text-sm leading-7 text-amber-950">
              {step.mutantProtein}
            </p>
          </ComparisonPanel>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      <article className="rounded-[1.5rem] border border-sky-200 bg-sky-50/82 p-5">
        <p className="text-sm font-semibold text-sky-900">为什么不会马上消失？</p>
        <p className="mt-3 text-sm leading-7 text-sky-950/85">
          自然选择比较的是不同基因型在特定环境中的存活与繁殖结果，而不是单纯给某个突变贴上“好”或“坏”的标签。
        </p>
      </article>

      <div className="grid gap-4 lg:grid-cols-3">
        {[
          {
            title: "个体层面",
            body: "纯合突变会带来明显健康风险，这就是我们在前面看到的性状后果。",
          },
          {
            title: "环境层面",
            body: "在存在疟疾压力的环境中，杂合子可能拥有额外生存优势。",
          },
          {
            title: "种群层面",
            body: "不同基因型的适应度不同，等位基因频率就可能长期维持在某个范围内。",
          },
        ].map((item) => (
          <article
            key={item.title}
            className="rounded-[1.4rem] border border-stone-200 bg-white/82 p-4"
          >
            <p className="text-sm font-semibold text-stone-900">{item.title}</p>
            <p className="mt-2 text-sm leading-7 text-stone-700">{item.body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function getSequenceSpotlight(step: SickleCaseStep) {
  if (
    !step.normalSequence ||
    !step.mutantSequence ||
    step.highlightStart === undefined ||
    step.highlightEnd === undefined
  ) {
    return null;
  }

  const normalValue = step.normalSequence.slice(step.highlightStart, step.highlightEnd + 1);
  const mutantValue = step.mutantSequence.slice(step.highlightStart, step.highlightEnd + 1);

  if (step.id === "mrna") {
    return {
      title: "关键 mRNA 密码子",
      description: `第 ${step.highlightStart + 1}-${step.highlightEnd + 1} 位对应的 mRNA 密码子从 ${normalValue} 改成 ${mutantValue}，翻译结果也会跟着改变。`,
      normalLabel: "正常 mRNA",
      normalValue,
      mutantLabel: "突变后 mRNA",
      mutantValue,
    };
  }

  return {
    title: "关键 DNA 密码子",
    description: `第 ${step.highlightStart + 1}-${step.highlightEnd + 1} 位形成的关键片段从 ${normalValue} 变成 ${mutantValue}，这是本案例里真正触发后续连锁变化的起点。`,
    normalLabel: "正常 DNA",
    normalValue,
    mutantLabel: "突变后 DNA",
    mutantValue,
  };
}

function ComparisonPanel({
  tone,
  label,
  title,
  summary,
  bullets,
  children,
}: {
  tone: keyof typeof comparisonToneClasses;
  label: string;
  title: string;
  summary: string;
  bullets: string[];
  children?: React.ReactNode;
}) {
  const styles = comparisonToneClasses[tone];

  return (
    <article className={`rounded-[1.5rem] border p-5 ${styles.shell}`}>
      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${styles.badge}`}>
        {label}
      </span>
      <h4 className="mt-3 text-xl font-semibold text-stone-900">{title}</h4>
      <p className={`mt-2 text-sm leading-7 ${styles.text}`}>{summary}</p>
      {children ? <div className="mt-5">{children}</div> : null}
      <div className="mt-5 grid gap-2">
        {bullets.map((item) => (
          <p
            key={item}
            className={`rounded-2xl border border-white/70 bg-white/80 px-3 py-3 text-sm leading-6 ${styles.text}`}
          >
            {item}
          </p>
        ))}
      </div>
    </article>
  );
}

function SpotlightTag({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.15rem] border border-amber-200 bg-white/88 px-4 py-3">
      <p className="text-[11px] font-semibold tracking-[0.18em] text-stone-500 uppercase">
        {label}
      </p>
      <p className="mt-1 font-mono text-lg font-semibold text-stone-900">{value}</p>
    </div>
  );
}

function LessonLinkCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: keyof typeof comparisonToneClasses;
}) {
  const styles = comparisonToneClasses[tone];

  return (
    <article className={`rounded-[1.35rem] border p-4 ${styles.shell}`}>
      <p className="text-sm font-semibold text-stone-900">{label}</p>
      <p className={`mt-2 break-all font-mono text-sm leading-7 ${styles.text}`}>{value}</p>
    </article>
  );
}
