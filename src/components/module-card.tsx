import Link from "next/link";

const toneClasses = {
  amber: {
    shell: "border-amber-200 bg-amber-50/80",
    badge: "bg-amber-100 text-amber-900",
    link: "text-amber-900",
  },
  emerald: {
    shell: "border-emerald-200 bg-emerald-50/80",
    badge: "bg-emerald-100 text-emerald-900",
    link: "text-emerald-900",
  },
  sky: {
    shell: "border-sky-200 bg-sky-50/80",
    badge: "bg-sky-100 text-sky-900",
    link: "text-sky-900",
  },
} as const;

type ModuleCardProps = {
  href: string;
  eyebrow: string;
  title: string;
  summary: string;
  bullets: string[];
  tone: keyof typeof toneClasses;
};

export function ModuleCard({
  href,
  eyebrow,
  title,
  summary,
  bullets,
  tone,
}: ModuleCardProps) {
  const colors = toneClasses[tone];

  return (
    <Link
      href={href}
      className={`group flex h-full flex-col rounded-[1.75rem] border p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${colors.shell}`}
    >
      <span
        className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold tracking-[0.18em] uppercase ${colors.badge}`}
      >
        {eyebrow}
      </span>
      <h2 className="mt-4 font-serif text-2xl text-stone-900">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-stone-700">{summary}</p>
      <ul className="mt-5 space-y-2 text-sm leading-7 text-stone-700">
        {bullets.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
      <span className={`mt-6 text-sm font-semibold ${colors.link}`}>
        进入模块 →
      </span>
    </Link>
  );
}
