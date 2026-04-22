"use client";

import { useState } from "react";
import { SequenceStrip } from "@/components/sequence-strip";
import {
  DNA_BASES,
  HBB_NORMAL_SEQUENCE,
  HBB_SICKLE_SEQUENCE,
  MutationMode,
  SICKLE_MUTATION_INDEX,
  applyMutationToDna,
  sanitizeDnaInput,
  summarizeMutation,
} from "@/lib/genetics";

const modeLabels: Record<MutationMode, string> = {
  substitution: "替换",
  insertion: "增添",
  deletion: "缺失",
};

export function MutationWorkbench() {
  const [mode, setMode] = useState<MutationMode>("substitution");
  const [index, setIndex] = useState(SICKLE_MUTATION_INDEX);
  const [replacementBase, setReplacementBase] = useState("T");
  const [insertionBases, setInsertionBases] = useState("A");
  const [deletionLength, setDeletionLength] = useState(1);

  const mutatedSequence = applyMutationToDna({
    sequence: HBB_NORMAL_SEQUENCE,
    mode,
    index,
    replacementBase,
    insertionBases,
    deletionLength,
  });

  const summary = summarizeMutation(HBB_NORMAL_SEQUENCE, mutatedSequence, mode);
  const insertionPayload = sanitizeDnaInput(insertionBases) || "A";
  const lengthDelta = mutatedSequence.length - HBB_NORMAL_SEQUENCE.length;
  const beforeHighlightEnd =
    mode === "deletion"
      ? Math.min(index + deletionLength - 1, HBB_NORMAL_SEQUENCE.length - 1)
      : index;
  const afterHighlight = getAfterHighlight({
    mode,
    index,
    mutatedLength: mutatedSequence.length,
    insertionLength: insertionPayload.length,
  });
  const focusNotes = getWorkbenchFocus({
    mode,
    replacementBase,
    insertionPayload,
    deletionLength,
    index,
    summary: summary.classification,
  });

  function resetExperiment() {
    setMode("substitution");
    setIndex(SICKLE_MUTATION_INDEX);
    setReplacementBase("T");
    setInsertionBases("A");
    setDeletionLength(1);
  }

  function loadSicklePreset() {
    setMode("substitution");
    setIndex(SICKLE_MUTATION_INDEX);
    setReplacementBase(HBB_SICKLE_SEQUENCE[SICKLE_MUTATION_INDEX] ?? "T");
  }

  return (
    <div className="space-y-6">
      <article className="surface-card rounded-[1.85rem] p-6 sm:p-7">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold tracking-[0.18em] text-emerald-700 uppercase">
              自由探究模式
            </p>
            <h2 className="mt-3 font-serif text-3xl text-stone-900 sm:text-[2.2rem]">
              自定义突变实验台
            </h2>
            <p className="mt-4 text-base leading-8 text-stone-700">
              这里把 DNA 编码链、mRNA 和氨基酸放进同一个观察界面。你可以自由切换替换、增添和缺失，直接看到一次操作如何沿着分子链条继续传递。
            </p>
            <p className="mt-3 rounded-[1.2rem] border border-amber-200 bg-amber-50/85 px-4 py-3 text-xs leading-6 text-amber-900">
              教学简化提示：本台使用 HBB 基因起始的 30 个碱基教学片段（完整 HBB 基因约 1600 bp，含 3 个外显子）。为了让学生直接观察「一次修改如何传递到氨基酸」，我们只展示编码链视角；真实转录是以模板链为模板进行的。
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[28rem]">
            <MetricBadge label="当前操作" value={modeLabels[mode]} tone="emerald" />
            <MetricBadge label="操作位置" value={`第 ${index + 1} 位`} tone="sky" />
            <MetricBadge
              label="序列长度变化"
              value={lengthDelta === 0 ? "不变" : `${lengthDelta > 0 ? "+" : ""}${lengthDelta}`}
              tone="amber"
            />
          </div>
        </div>
      </article>

      <div className="grid gap-6 xl:grid-cols-[minmax(20rem,23rem)_minmax(0,1fr)]">
        <section className="surface-card rounded-[1.75rem] p-5">
          <div>
            <p className="text-sm font-semibold tracking-[0.18em] text-stone-500 uppercase">
              实验控制台
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-stone-900">先决定这次怎么改序列</h3>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {(["substitution", "insertion", "deletion"] as MutationMode[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setMode(item)}
                className={`min-h-11 rounded-full px-4 text-sm font-semibold transition ${
                  mode === item
                    ? "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
                    : "border border-stone-200 bg-white text-stone-700 hover:border-stone-400"
                }`}
              >
                {modeLabels[item]}
              </button>
            ))}
          </div>

          <div className="mt-5 grid gap-4">
            <ControlCard title={`操作位置：第 ${index + 1} 位碱基`}>
              <input
                type="range"
                min={1}
                max={HBB_NORMAL_SEQUENCE.length}
                value={index + 1}
                onChange={(event) => setIndex(Number(event.target.value) - 1)}
                className="accent-emerald-700"
              />
            </ControlCard>

            {mode === "substitution" ? (
              <ControlCard title="替换成哪个碱基">
                <div className="flex flex-wrap gap-2">
                  {DNA_BASES.map((base) => (
                    <button
                      key={base}
                      type="button"
                      onClick={() => setReplacementBase(base)}
                      className={`min-h-11 min-w-11 rounded-2xl px-4 text-sm font-semibold transition ${
                        replacementBase === base
                          ? "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
                          : "border border-stone-200 bg-stone-50 text-stone-700 hover:border-stone-400"
                      }`}
                    >
                      {base}
                    </button>
                  ))}
                </div>
              </ControlCard>
            ) : null}

            {mode === "insertion" ? (
              <ControlCard title="要插入的碱基串">
                <input
                  value={insertionBases}
                  onChange={(event) => setInsertionBases(sanitizeDnaInput(event.target.value))}
                  placeholder="例如 A 或 ATG"
                  className="min-h-12 rounded-2xl border border-stone-200 px-4 text-sm outline-none focus:border-emerald-400"
                />
                {insertionBases.length === 0 ? (
                  <span className="text-xs text-amber-700">
                    输入为空，将默认插入 A 作为演示
                  </span>
                ) : (
                  <span className="text-xs text-stone-500">
                    当前插入 {insertionBases}（{insertionBases.length} 个碱基）
                  </span>
                )}
              </ControlCard>
            ) : null}

            {mode === "deletion" ? (
              <ControlCard title="删除几个碱基">
                <input
                  type="range"
                  min={1}
                  max={3}
                  value={deletionLength}
                  onChange={(event) => setDeletionLength(Number(event.target.value))}
                  className="accent-emerald-700"
                />
                <span className="text-xs text-stone-500">当前删除 {deletionLength} 个碱基</span>
              </ControlCard>
            ) : null}

            <ControlCard title="快捷操作">
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={loadSicklePreset}
                  className="inline-flex min-h-11 items-center rounded-full bg-amber-500 px-4 text-sm font-semibold text-white transition hover:bg-amber-400"
                >
                  一键加载镰状细胞突变
                </button>
                <button
                  type="button"
                  onClick={resetExperiment}
                  className="inline-flex min-h-11 items-center rounded-full border border-stone-200 bg-stone-50 px-4 text-sm font-semibold text-stone-700 transition hover:border-stone-400 hover:bg-white"
                >
                  重置实验
                </button>
              </div>
            </ControlCard>
          </div>
        </section>

        <section className="grid gap-5">
          <article className="rounded-[1.6rem] border border-emerald-200 bg-[linear-gradient(180deg,rgba(236,253,245,0.96),rgba(210,250,229,0.86))] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-emerald-900">
                  判定结果 · 按蛋白质影响分类（拓展）
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-emerald-950">
                  {summary.classification}
                </h3>
              </div>
              <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-emerald-900">
                基于当前操作自动判断
              </span>
            </div>
            <p className="mt-3 text-sm leading-7 text-emerald-950/85">{summary.explanation}</p>
            <p className="mt-3 rounded-[1rem] border border-emerald-100 bg-white/70 px-3 py-2 text-xs leading-6 text-emerald-900/80">
              人教版必修2 正文按 DNA 变化将基因突变分为「替换 / 增添 / 缺失」；沉默、错义、无义、移码是按蛋白质影响的进阶分类，其中「无义突变」按惯例只涵盖碱基替换。
            </p>
          </article>

          <article className="surface-card rounded-[1.75rem] p-5">
            <div>
              <p className="text-sm font-semibold tracking-[0.18em] text-stone-500 uppercase">
                当前链路观察
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-stone-900">从转录一直看到翻译</h3>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <SummaryPanel
                title="转录后的 mRNA"
                badge={`突变类型：${modeLabels[mode]}`}
                before={summary.mrnaBefore}
                after={summary.mrnaAfter}
              />
              <SummaryPanel
                title="翻译后的氨基酸序列"
                badge={`操作位置：第 ${index + 1} 位`}
                before={summary.proteinBefore}
                after={summary.proteinAfter}
              />
            </div>
          </article>

          <article className="surface-card rounded-[1.75rem] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold tracking-[0.18em] text-stone-500 uppercase">
                  实验提示
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-stone-900">这次操作最值得看什么</h3>
              </div>
              <span className="rounded-full border border-stone-200 bg-white/80 px-3 py-1 text-xs font-semibold text-stone-600">
                让学生先看关键位点，再看整条链
              </span>
            </div>

            <div className="mt-5 grid gap-3">
              {focusNotes.map((item) => (
                <p
                  key={item}
                  className="rounded-[1.2rem] border border-stone-200 bg-white/82 px-4 py-3 text-sm leading-7 text-stone-700"
                >
                  {item}
                </p>
              ))}
            </div>
          </article>
        </section>
      </div>

      <article className="surface-card rounded-[1.75rem] p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold tracking-[0.18em] text-stone-500 uppercase">
              序列对比观察窗
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-stone-900">把操作放回整条 DNA 里看</h3>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-stone-600">
              先盯住操作位点，再结合完整序列观察这次修改是否改变了关键密码子和阅读框。
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <MetricBadge label="原始长度" value={`${summary.dnaBefore.length}`} tone="emerald" />
            <MetricBadge label="突变后长度" value={`${summary.dnaAfter.length}`} tone="amber" />
          </div>
        </div>

        <div className="mt-5 grid gap-5">
        <SequenceStrip
          label="原始 DNA 编码链"
          sequence={summary.dnaBefore}
          highlightStart={index}
          highlightEnd={beforeHighlightEnd}
          accent="emerald"
        />
        <SequenceStrip
          label="突变后 DNA 编码链"
          sequence={summary.dnaAfter}
          highlightStart={afterHighlight.start}
          highlightEnd={afterHighlight.end}
          accent="amber"
        />
        </div>
      </article>
    </div>
  );
}

function getAfterHighlight({
  mode,
  index,
  mutatedLength,
  insertionLength,
}: {
  mode: MutationMode;
  index: number;
  mutatedLength: number;
  insertionLength: number;
}) {
  if (mode === "substitution") {
    return { start: index, end: index };
  }

  if (mode === "insertion") {
    return {
      start: Math.min(index, mutatedLength - 1),
      end: Math.min(index + insertionLength - 1, mutatedLength - 1),
    };
  }

  const anchor = Math.max(0, Math.min(index, mutatedLength - 1));
  return { start: anchor, end: anchor };
}

function getWorkbenchFocus({
  mode,
  replacementBase,
  insertionPayload,
  deletionLength,
  index,
  summary,
}: {
  mode: MutationMode;
  replacementBase: string;
  insertionPayload: string;
  deletionLength: number;
  index: number;
  summary: string;
}) {
  if (mode === "substitution") {
    return [
      `当前会把第 ${index + 1} 位碱基替换成 ${replacementBase}，优先观察该位点所在密码子是否改变。`,
      `如果只改动一个密码子但氨基酸不同，通常会落到“错义突变”这一类。`,
      `再往下看时，重点不是序列变没变，而是蛋白质性质有没有跟着改变。`,
    ];
  }

  if (mode === "insertion") {
    return [
      `当前会在第 ${index + 1} 位附近插入 ${insertionPayload}，先比较序列长度是否变化。`,
      `若插入碱基数不是 3 的倍数，阅读框通常会整体后移，后续多个密码子都可能改写。`,
      `现在的自动判定结果是“${summary}”，可以结合下方 DNA 与 mRNA 一起验证。`,
    ];
  }

  return [
    `当前会从第 ${index + 1} 位开始删除 ${deletionLength} 个碱基，优先观察缺失范围。`,
    `如果缺失数不是 3 的倍数，后续阅读框很容易整体改变，影响通常比单纯替换更大。`,
    `看结果时别只盯删除点本身，也要顺着后面的密码子继续往下看。`,
  ];
}

function MetricBadge({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "emerald" | "sky" | "amber";
}) {
  const toneClasses = {
    emerald: "border-emerald-200 bg-emerald-50/85 text-emerald-950",
    sky: "border-sky-200 bg-sky-50/85 text-sky-950",
    amber: "border-amber-200 bg-amber-50/85 text-amber-950",
  } as const;

  return (
    <div className={`rounded-[1.25rem] border px-4 py-3 ${toneClasses[tone]}`}>
      <p className="text-[11px] font-semibold tracking-[0.18em] uppercase opacity-75">{label}</p>
      <p className="mt-1 text-base font-semibold">{value}</p>
    </div>
  );
}

function ControlCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-3 rounded-[1.35rem] border border-stone-200 bg-white/85 p-4">
      <span className="text-sm font-semibold text-stone-800">{title}</span>
      {children}
    </label>
  );
}

function SummaryPanel({
  title,
  badge,
  before,
  after,
}: {
  title: string;
  badge: string;
  before: string;
  after: string;
}) {
  return (
    <article className="min-w-0 rounded-[1.4rem] border border-stone-200 bg-white/82 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="text-sm font-semibold text-stone-900">{title}</p>
        <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-600">
          {badge}
        </span>
      </div>
      <div className="mt-4 grid gap-3">
        <SummaryValue label="正常" value={before} />
        <SummaryValue label="突变后" value={after} />
      </div>
    </article>
  );
}

function SummaryValue({ label, value }: { label: string; value: string }) {
  return (
    <section className="min-w-0 rounded-[1.1rem] border border-stone-200 bg-stone-50/85 px-3 py-3">
      <p className="text-xs font-semibold text-stone-500">{label}</p>
      <p className="mt-2 min-w-0 font-mono text-sm leading-7 text-stone-800 break-words [overflow-wrap:anywhere]">
        {value}
      </p>
    </section>
  );
}
