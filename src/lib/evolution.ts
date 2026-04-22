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
    description:
      "参考 Allison 等经典研究：HbA/HbS 杂合子在疟疾压力下最占优势（生存率约 1.0），HbA 纯合受疟疾影响略降，HbS 纯合因镰状细胞病重度贫血生存率很低。等位基因会趋于平衡态。",
    fitnessAA: 0.88,
    fitnessAS: 1,
    fitnessSS: 0.18,
  },
  classroom: {
    label: "无疟疾 · 缺乏医疗",
    description:
      "没有疟疾时，HbA/HbS 和 HbA/HbA 都不再有额外优势，杂合子反而轻微不利，HbS 纯合仍然因贫血严重生存率很低（未考虑现代医疗支持）。HbS 会被逐渐淘汰。",
    fitnessAA: 1,
    fitnessAS: 0.93,
    fitnessSS: 0.18,
  },
  modern: {
    label: "无疟疾 · 现代医疗",
    description:
      "现代医疗（输血、羟基脲、造血干细胞移植）大幅改善 HbS 纯合患者的存活与生育，整体选择压力变弱，频率变化更慢。",
    fitnessAA: 1,
    fitnessAS: 0.98,
    fitnessSS: 0.6,
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

export type SelectionEquilibrium =
  | {
      type: "overdominance";
      qStar: number;
      note: string;
    }
  | {
      type: "directionalLossS";
      note: string;
    }
  | {
      type: "directionalLossA";
      note: string;
    }
  | {
      type: "underdominance";
      note: string;
    }
  | {
      type: "neutral";
      note: string;
    };

export function computeEquilibrium(
  fitnessAA: number,
  fitnessAS: number,
  fitnessSS: number,
): SelectionEquilibrium {
  const denom = 2 * fitnessAS - fitnessAA - fitnessSS;

  if (fitnessAS > fitnessAA && fitnessAS > fitnessSS && denom > 0) {
    const qStar = (fitnessAS - fitnessAA) / denom;
    return {
      type: "overdominance",
      qStar,
      note: `杂合子生存率最高，HbS 频率会在约 ${qStar.toFixed(2)} 处趋于稳定（平衡态 q*）。`,
    };
  }

  if (fitnessAA === fitnessAS && fitnessAS === fitnessSS) {
    return {
      type: "neutral",
      note: "三种基因型生存率相同，不存在自然选择压力，基因频率只会在随机变化中漂移。",
    };
  }

  if (fitnessAS < fitnessAA && fitnessAS < fitnessSS) {
    return {
      type: "underdominance",
      note: "杂合子生存率最低，这是不稳定的平衡——初始频率决定最后哪个等位基因被保留。",
    };
  }

  if (fitnessAA >= fitnessAS && fitnessSS <= fitnessAS) {
    return {
      type: "directionalLossS",
      note: "HbA 更占优势，HbS 会长期被淘汰，频率趋于 0。",
    };
  }

  return {
    type: "directionalLossA",
    note: "HbS 更占优势，HbA 会长期被淘汰，HbS 频率趋于 1。",
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

