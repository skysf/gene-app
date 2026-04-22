import { useId } from "react";
import type { SelectionRow } from "@/lib/evolution";

type FrequencyChartProps = {
  rows: SelectionRow[];
  equilibriumQ?: number;
};

export function FrequencyChart({ rows, equilibriumQ }: FrequencyChartProps) {
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
        <div className="flex flex-wrap gap-3 text-xs font-semibold">
          <span className="inline-flex items-center gap-2 text-sky-700">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
            HbA
          </span>
          <span className="inline-flex items-center gap-2 text-amber-700">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            HbS
          </span>
          {equilibriumQ !== undefined ? (
            <span className="inline-flex items-center gap-2 text-emerald-700">
              <span className="inline-block h-0 w-4 border-t-2 border-dashed border-emerald-500" />
              HbS 平衡频率 q*
            </span>
          ) : null}
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
        {equilibriumQ !== undefined && equilibriumQ > 0 && equilibriumQ < 1 ? (
          <g>
            <line
              x1={padding}
              x2={width - padding}
              y1={projectY(equilibriumQ)}
              y2={projectY(equilibriumQ)}
              stroke="#10b981"
              strokeWidth="2"
              strokeDasharray="6 4"
            />
            <rect
              x={width - padding - 86}
              y={projectY(equilibriumQ) - 22}
              width="82"
              height="18"
              rx="9"
              fill="#d1fae5"
            />
            <text
              x={width - padding - 6}
              y={projectY(equilibriumQ) - 9}
              textAnchor="end"
              fontSize="11"
              fontWeight="600"
              fill="#065f46"
            >
              q* ≈ {equilibriumQ.toFixed(2)}
            </text>
          </g>
        ) : null}
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

type GenotypeTrajectoryProps = {
  rows: SelectionRow[];
};

export function GenotypeTrajectory({ rows }: GenotypeTrajectoryProps) {
  const chartId = useId().replaceAll(":", "");

  if (rows.length === 0) {
    return null;
  }

  const width = 560;
  const height = 220;
  const padding = 28;
  const maxGeneration = rows.at(-1)?.generation ?? 1;

  const projectX = (generation: number) =>
    padding + ((width - padding * 2) * generation) / Math.max(maxGeneration, 1);
  const projectY = (value: number) => height - padding - (height - padding * 2) * value;

  const series = [
    { key: "AA", label: "HbA/HbA", color: "#0ea5e9", getter: (r: SelectionRow) => r.genotypeAA },
    { key: "AS", label: "HbA/HbS", color: "#10b981", getter: (r: SelectionRow) => r.genotypeAS },
    { key: "SS", label: "HbS/HbS", color: "#f59e0b", getter: (r: SelectionRow) => r.genotypeSS },
  ] as const;

  return (
    <div className="surface-card rounded-[1.6rem] p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-stone-500 uppercase">
            分基因型看
          </p>
          <h3 className="mt-2 text-lg font-semibold text-stone-900">三种基因型频率变化</h3>
          <p className="text-sm text-stone-600">同一条时间轴上同时看三种基因型的起伏</p>
        </div>
        <div className="flex flex-wrap gap-3 text-xs font-semibold">
          {series.map((item) => (
            <span key={item.key} className="inline-flex items-center gap-2 text-stone-700">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              {item.label}
            </span>
          ))}
        </div>
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="mt-4 h-[220px] w-full rounded-3xl bg-stone-50"
        role="img"
        aria-label="三种基因型频率变化图"
      >
        <rect x="0" y="0" width={width} height={height} rx="26" fill="#fafaf9" />
        {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
          <g key={`gtick-${chartId}-${tick}`}>
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
        {series.map((item) => {
          const points = rows
            .map((row) => `${projectX(row.generation)},${projectY(item.getter(row))}`)
            .join(" ");
          return (
            <g key={`line-${chartId}-${item.key}`}>
              <polyline
                points={points}
                fill="none"
                stroke={item.color}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {rows.map((row) => (
                <circle
                  key={`pt-${chartId}-${item.key}-${row.generation}`}
                  cx={projectX(row.generation)}
                  cy={projectY(item.getter(row))}
                  r="2.5"
                  fill={item.color}
                />
              ))}
            </g>
          );
        })}
        {[0, Math.round(maxGeneration / 2), maxGeneration].map((tick) => (
          <text
            key={`gx-${chartId}-${tick}`}
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
