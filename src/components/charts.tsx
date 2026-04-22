import { useId } from "react";
import type { SelectionRow } from "@/lib/evolution";

type FrequencyChartProps = {
  rows: SelectionRow[];
};

export function FrequencyChart({ rows }: FrequencyChartProps) {
  const chartId = useId().replaceAll(":", "");

  if (rows.length === 0) {
    return null;
  }

  const width = 560;
  const height = 250;
  const padding = 28;
  const maxGeneration = rows.at(-1)?.generation ?? 1;

  const projectX = (generation: number) =>
    padding + ((width - padding * 2) * generation) / Math.max(maxGeneration, 1);
  const projectY = (value: number) => height - padding - (height - padding * 2) * value;

  const lineA = rows
    .map((row) => `${projectX(row.generation)},${projectY(row.alleleA)}`)
    .join(" ");
  const lineS = rows
    .map((row) => `${projectX(row.generation)},${projectY(row.alleleS)}`)
    .join(" ");
  const areaA = `${padding},${height - padding} ${lineA} ${projectX(maxGeneration)},${height - padding}`;
  const areaS = `${padding},${height - padding} ${lineS} ${projectX(maxGeneration)},${height - padding}`;

  return (
    <div className="surface-card rounded-[1.6rem] p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-stone-500 uppercase">
            变化轨迹
          </p>
          <h3 className="mt-2 text-lg font-semibold text-stone-900">等位基因频率变化</h3>
          <p className="text-sm text-stone-600">HbA 与 HbS 在多个世代中的变化轨迹</p>
        </div>
        <div className="flex gap-3 text-xs font-semibold">
          <span className="inline-flex items-center gap-2 text-sky-700">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
            HbA
          </span>
          <span className="inline-flex items-center gap-2 text-amber-700">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            HbS
          </span>
        </div>
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="mt-4 h-[250px] w-full rounded-3xl bg-stone-50"
        role="img"
        aria-label="等位基因频率变化图"
      >
        <defs>
          <linearGradient id={`${chartId}-sky`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`${chartId}-amber`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect
          x="0"
          y="0"
          width={width}
          height={height}
          rx="26"
          fill="#fafaf9"
        />
        {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
          <g key={tick}>
            <line
              x1={padding}
              x2={width - padding}
              y1={projectY(tick)}
              y2={projectY(tick)}
              stroke="#d6d3d1"
              strokeDasharray="4 6"
            />
            <text x={8} y={projectY(tick) + 4} fontSize="11" fill="#57534e">
              {tick.toFixed(2)}
            </text>
          </g>
        ))}
        <polygon points={areaA} fill={`url(#${chartId}-sky)`} />
        <polygon points={areaS} fill={`url(#${chartId}-amber)`} />
        <polyline
          points={lineA}
          fill="none"
          stroke="#0ea5e9"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline
          points={lineS}
          fill="none"
          stroke="#f59e0b"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {rows.map((row) => (
          <g key={`point-a-${row.generation}`}>
            <circle cx={projectX(row.generation)} cy={projectY(row.alleleA)} r="3.5" fill="#0ea5e9" />
            <circle cx={projectX(row.generation)} cy={projectY(row.alleleS)} r="3.5" fill="#f59e0b" />
          </g>
        ))}
        {[0, Math.round(maxGeneration / 2), maxGeneration].map((tick) => (
          <text
            key={`x-${tick}`}
            x={projectX(tick)}
            y={height - 6}
            textAnchor={tick === 0 ? "start" : tick === maxGeneration ? "end" : "middle"}
            fontSize="11"
            fill="#78716c"
          >
            {tick} 代
          </text>
        ))}
      </svg>
    </div>
  );
}

type GenotypeBarsProps = {
  row: SelectionRow;
};

export function GenotypeBars({ row }: GenotypeBarsProps) {
  const entries = [
    { label: "HbA/HbA", value: row.genotypeAA, count: row.countAA, tone: "bg-sky-500" },
    { label: "HbA/HbS", value: row.genotypeAS, count: row.countAS, tone: "bg-emerald-500" },
    { label: "HbS/HbS", value: row.genotypeSS, count: row.countSS, tone: "bg-amber-500" },
  ];

  return (
    <div className="surface-card rounded-[1.6rem] p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-stone-500 uppercase">
            结构拆解
          </p>
          <h3 className="mt-2 text-lg font-semibold text-stone-900">
            第 {row.generation} 代的基因型组成
          </h3>
        </div>
        <span className="rounded-full border border-stone-200 bg-white/80 px-3 py-1 text-xs font-semibold text-stone-600">
          总频率约 1.00
        </span>
      </div>
      <div className="mt-5 space-y-4">
        {entries.map((entry) => (
          <div key={entry.label} className="rounded-[1.25rem] border border-stone-200 bg-white/82 p-4">
            <div className="mb-3 flex items-center justify-between gap-3 text-sm">
              <span className="font-semibold text-stone-800">{entry.label}</span>
              <span className="text-stone-600">
                频率 {entry.value.toFixed(2)} · 约 {entry.count} 人
              </span>
            </div>
            <div className="h-4 rounded-full bg-stone-100">
              <div
                className={`h-4 rounded-full ${entry.tone}`}
                style={{ width: `${Math.max(entry.value * 100, 6)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
