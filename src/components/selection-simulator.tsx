"use client";

import { useState } from "react";
import { FrequencyChart, GenotypeBars } from "@/components/charts";
import {
  environmentPresets,
  simulateSelection,
  summarizeSelection,
} from "@/lib/evolution";

type PresetKey = keyof typeof environmentPresets;

export function SelectionSimulator() {
  const [preset, setPreset] = useState<PresetKey>("malaria");
  const [sickleAlleleFrequency, setSickleAlleleFrequency] = useState(0.12);
  const [generations, setGenerations] = useState(12);
  const [populationSize, setPopulationSize] = useState(200);
  const [fitnessAA, setFitnessAA] = useState<number>(
    environmentPresets.malaria.fitnessAA,
  );
  const [fitnessAS, setFitnessAS] = useState<number>(
    environmentPresets.malaria.fitnessAS,
  );
  const [fitnessSS, setFitnessSS] = useState<number>(
    environmentPresets.malaria.fitnessSS,
  );
  const [focusGeneration, setFocusGeneration] = useState(generations);

  function applyPreset(nextPreset: PresetKey) {
    const target = environmentPresets[nextPreset];
    setPreset(nextPreset);
    setFitnessAA(target.fitnessAA);
    setFitnessAS(target.fitnessAS);
    setFitnessSS(target.fitnessSS);
  }

  const rows = simulateSelection({
    sickleAlleleFrequency,
    generations,
    populationSize,
    fitnessAA,
    fitnessAS,
    fitnessSS,
  });

  const activeGeneration = Math.min(focusGeneration, generations);
  const focusRow = rows[activeGeneration] ?? rows.at(-1) ?? rows[0];
  const lastRow = rows.at(-1) ?? rows[0];
  const summary = summarizeSelection(rows, environmentPresets[preset].label);
  const focusNotes = [
    `当前环境是“${environmentPresets[preset].label}”，先看三种基因型的相对生存率差异。`,
    `把观察代数切到第 ${focusRow?.generation ?? 0} 代时，优先比较 HbA/HbA、HbA/HbS 和 HbS/HbS 的比例。`,
    `最后再回到频率曲线，确认 HbS 是持续上升、下降，还是在某个范围附近保持。`,
  ];

  return (
    <div className="space-y-6">
      <article className="surface-card rounded-[1.85rem] p-6 sm:p-7">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold tracking-[0.18em] text-sky-700 uppercase">
              种群层面的探究
            </p>
            <h2 className="mt-3 font-serif text-3xl text-stone-900 sm:text-[2.2rem]">
              自然选择与基因频率
            </h2>
            <p className="mt-4 text-base leading-8 text-stone-700">
              这个模块把“不同基因型存活率不同”转换成可以观察的频率变化。你可以切换环境预设，再调整生存率、种群规模和初始频率，看 HbA / HbS 会不会长期维持在不同水平。
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[30rem]">
            <MetricBadge
              label="当前环境"
              value={environmentPresets[preset].label}
              tone="sky"
            />
            <MetricBadge
              label="末代 HbS 频率"
              value={(lastRow?.alleleS ?? 0).toFixed(2)}
              tone="amber"
            />
            <MetricBadge label="模拟世代" value={`${generations} 代`} tone="emerald" />
          </div>
        </div>
      </article>

      <div className="grid gap-6 xl:grid-cols-[minmax(20rem,23rem)_minmax(0,1fr)]">
        <section className="surface-card rounded-[1.75rem] p-5">
          <div>
            <p className="text-sm font-semibold tracking-[0.18em] text-stone-500 uppercase">
              参数控制台
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-stone-900">先决定这群体处在什么环境里</h3>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {(Object.keys(environmentPresets) as PresetKey[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => applyPreset(key)}
                className={`min-h-11 rounded-full px-4 text-sm font-semibold transition ${
                  preset === key
                    ? "bg-stone-950 text-white"
                    : "border border-stone-200 bg-white text-stone-700 hover:border-stone-400"
                }`}
              >
                {environmentPresets[key].label}
              </button>
            ))}
          </div>

          <p className="mt-4 rounded-[1.4rem] border border-sky-200 bg-sky-50/80 p-4 text-sm leading-7 text-sky-950/85">
            {environmentPresets[preset].description}
          </p>

          <div className="mt-5 grid gap-5">
            <SliderField
              label="初始 HbS 等位基因频率"
              value={sickleAlleleFrequency}
              min={0.01}
              max={0.6}
              step={0.01}
              onChange={setSickleAlleleFrequency}
            />
            <SliderField
              label="模拟世代数"
              value={generations}
              min={4}
              max={30}
              step={1}
              onChange={setGenerations}
              valueFormatter={(value) => `${value} 代`}
            />
            <SliderField
              label="种群规模"
              value={populationSize}
              min={60}
              max={600}
              step={10}
              onChange={setPopulationSize}
              valueFormatter={(value) => `${value} 人`}
            />
            <SliderField
              label="HbA/HbA 生存率"
              value={fitnessAA}
              min={0.1}
              max={1}
              step={0.01}
              onChange={setFitnessAA}
            />
            <SliderField
              label="HbA/HbS 生存率"
              value={fitnessAS}
              min={0.1}
              max={1}
              step={0.01}
              onChange={setFitnessAS}
            />
            <SliderField
              label="HbS/HbS 生存率"
              value={fitnessSS}
              min={0.05}
              max={1}
              step={0.01}
              onChange={setFitnessSS}
            />
          </div>
        </section>

        <section className="grid gap-5">
          <article className="surface-card rounded-[1.75rem] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold tracking-[0.18em] text-stone-500 uppercase">
                  观察提示
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-stone-900">用同一条线索读图</h3>
              </div>
              <span className="rounded-full border border-stone-200 bg-white/80 px-3 py-1 text-xs font-semibold text-stone-600">
                环境 → 适应度 → 基因型 → 等位基因频率
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

          <FrequencyChart rows={rows} />
          {focusRow ? <GenotypeBars row={focusRow} /> : null}

          <article className="rounded-[1.55rem] border border-amber-200 bg-[linear-gradient(180deg,rgba(255,251,235,0.96),rgba(253,243,214,0.84))] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-amber-900">当前观察代数</p>
                <p className="text-sm text-amber-900/80">
                  你可以拖动滑块查看不同世代的基因型组成。
                </p>
              </div>
              <span className="rounded-full bg-white/80 px-3 py-1 text-sm font-semibold text-amber-900">
                第 {focusRow?.generation ?? 0} 代
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={generations}
              value={activeGeneration}
              onChange={(event) => setFocusGeneration(Number(event.target.value))}
              className="mt-4 w-full accent-amber-600"
            />
            <p className="mt-4 text-sm leading-7 text-amber-950/90">{summary}</p>
          </article>
        </section>
      </div>
    </div>
  );
}

type SliderFieldProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  valueFormatter?: (value: number) => string;
};

function SliderField({
  label,
  value,
  min,
  max,
  step,
  onChange,
  valueFormatter,
}: SliderFieldProps) {
  return (
    <label className="grid gap-3 rounded-[1.25rem] border border-stone-200 bg-white/85 p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-stone-800">{label}</span>
        <span className="text-sm font-semibold text-stone-600">
          {valueFormatter ? valueFormatter(value) : value.toFixed(2)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="accent-sky-700"
      />
    </label>
  );
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
