export type SelectionInputs = {
  sickleAlleleFrequency: number;
  generations: number;
  populationSize: number;
  fitnessAA: number;
  fitnessAS: number;
  fitnessSS: number;
};

export type SelectionRow = {
  generation: number;
  alleleA: number;
  alleleS: number;
  genotypeAA: number;
  genotypeAS: number;
  genotypeSS: number;
  countAA: number;
  countAS: number;
  countSS: number;
};

export const environmentPresets = {
  malaria: {
    label: "有疟疾环境",
    description: "杂合子往往更有生存优势，因此 HbS 等位基因可能被保留下来。",
    fitnessAA: 0.88,
    fitnessAS: 1,
    fitnessSS: 0.18,
  },
  classroom: {
    label: "无疟疾环境",
    description: "HbA 纯合个体更占优势，HbS 等位基因通常会逐渐减少。",
    fitnessAA: 1,
    fitnessAS: 0.93,
    fitnessSS: 0.18,
  },
} as const;

export function simulateSelection({
  sickleAlleleFrequency,
  generations,
  populationSize,
  fitnessAA,
  fitnessAS,
  fitnessSS,
}: SelectionInputs) {
  const rows: SelectionRow[] = [];
  let q = clamp(sickleAlleleFrequency, 0, 1);
  let p = 1 - q;

  for (let generation = 0; generation <= generations; generation += 1) {
    const genotypeAA = p ** 2;
    const genotypeAS = 2 * p * q;
    const genotypeSS = q ** 2;

    rows.push({
      generation,
      alleleA: p,
      alleleS: q,
      genotypeAA,
      genotypeAS,
      genotypeSS,
      countAA: Math.round(genotypeAA * populationSize),
      countAS: Math.round(genotypeAS * populationSize),
      countSS: Math.round(genotypeSS * populationSize),
    });

    const weightedAA = genotypeAA * fitnessAA;
    const weightedAS = genotypeAS * fitnessAS;
    const weightedSS = genotypeSS * fitnessSS;
    const total = weightedAA + weightedAS + weightedSS;

    p = (weightedAA + weightedAS / 2) / total;
    q = 1 - p;
  }

  return rows;
}

export function summarizeSelection(rows: SelectionRow[], environmentLabel: string) {
  const start = rows[0];
  const end = rows.at(-1);

  if (!start || !end) {
    return "请先设置参数，再观察种群中等位基因频率的变化。";
  }

  const delta = end.alleleS - start.alleleS;
  const direction =
    Math.abs(delta) < 0.01 ? "基本保持稳定" : delta > 0 ? "整体上升" : "整体下降";

  return `在${environmentLabel}下，HbS 等位基因频率从 ${start.alleleS.toFixed(2)} 变化到 ${end.alleleS.toFixed(2)}，${direction}。这说明自然选择影响的是不同基因型的生存机会，最终会反映到种群中的基因频率上。`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

