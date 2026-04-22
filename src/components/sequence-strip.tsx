import { splitIntoCodons } from "@/lib/genetics";

type SequenceStripProps = {
  label: string;
  sequence: string;
  highlightStart?: number;
  highlightEnd?: number;
  accent?: "emerald" | "sky" | "amber";
};

const accentClass = {
  emerald: {
    badge: "border-emerald-200 bg-emerald-50 text-emerald-900",
    chip: "border-emerald-200 bg-emerald-50/80 text-emerald-900",
    chipActive: "border-emerald-300 bg-emerald-100 text-emerald-950",
  },
  sky: {
    badge: "border-sky-200 bg-sky-50 text-sky-900",
    chip: "border-sky-200 bg-sky-50/80 text-sky-900",
    chipActive: "border-sky-300 bg-sky-100 text-sky-950",
  },
  amber: {
    badge: "border-amber-200 bg-amber-50 text-amber-900",
    chip: "border-amber-200 bg-amber-50/80 text-amber-900",
    chipActive: "border-amber-300 bg-amber-100 text-amber-950",
  },
} as const;

export function SequenceStrip({
  label,
  sequence,
  highlightStart,
  highlightEnd,
  accent = "emerald",
}: SequenceStripProps) {
  const codons = splitIntoCodons(sequence);
  const highlightCodonIndex =
    highlightStart !== undefined && highlightEnd !== undefined
      ? Math.floor(highlightStart / 3)
      : undefined;
  const highlightedSegment =
    highlightStart !== undefined && highlightEnd !== undefined
      ? sequence.slice(highlightStart, highlightEnd + 1)
      : undefined;
  const colors = accentClass[accent];

  return (
    <section className="min-w-0 overflow-hidden rounded-[1.5rem] border border-stone-200 bg-white/88 p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-stone-900">{label}</p>
          <p className="mt-1 text-xs leading-6 text-stone-500">
            {highlightedSegment
              ? `当前高亮关键密码子 ${highlightedSegment}`
              : `共 ${sequence.length} 个碱基`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${colors.badge}`}
          >
            共 {sequence.length} 个碱基
          </span>
          {highlightedSegment ? (
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${colors.chipActive}`}
            >
              关键片段 {highlightedSegment}
            </span>
          ) : null}
        </div>
      </div>
      <div className="scrollbar-subtle mt-4 overflow-x-auto pb-2">
        <div className="inline-flex gap-2">
          {sequence.split("").map((base, index) => {
            const isHighlighted =
              highlightStart !== undefined &&
              highlightEnd !== undefined &&
              index >= highlightStart &&
              index <= highlightEnd;

            return (
              <div
                key={`${label}-${index}`}
                className={`flex h-16 w-12 shrink-0 flex-col items-center justify-center rounded-2xl border text-sm font-semibold transition ${
                  isHighlighted
                    ? "border-amber-300 bg-amber-100 text-amber-950"
                    : "border-stone-200 bg-stone-50 text-stone-800"
                }`}
              >
                <span className="font-mono text-lg">{base}</span>
                <span className="mt-1 text-[11px] font-medium text-stone-500">
                  {index + 1}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {codons.map((codon, index) => {
          const isHighlighted = highlightCodonIndex === index;

          return (
            <span
              key={`${label}-codon-${index}`}
              className={`rounded-full border px-3 py-1 font-mono text-xs font-semibold ${
                isHighlighted ? colors.chipActive : colors.chip
              }`}
            >
              {codon}
            </span>
          );
        })}
      </div>
    </section>
  );
}
