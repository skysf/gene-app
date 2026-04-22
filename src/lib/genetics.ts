export type MutationMode = "substitution" | "insertion" | "deletion";

export type MutationInputs = {
  sequence: string;
  mode: MutationMode;
  index: number;
  replacementBase: string;
  insertionBases: string;
  deletionLength: number;
};

const CODON_TABLE: Record<string, string> = {
  UUU: "Phe",
  UUC: "Phe",
  UUA: "Leu",
  UUG: "Leu",
  UCU: "Ser",
  UCC: "Ser",
  UCA: "Ser",
  UCG: "Ser",
  UAU: "Tyr",
  UAC: "Tyr",
  UAA: "Stop",
  UAG: "Stop",
  UGU: "Cys",
  UGC: "Cys",
  UGA: "Stop",
  UGG: "Trp",
  CUU: "Leu",
  CUC: "Leu",
  CUA: "Leu",
  CUG: "Leu",
  CCU: "Pro",
  CCC: "Pro",
  CCA: "Pro",
  CCG: "Pro",
  CAU: "His",
  CAC: "His",
  CAA: "Gln",
  CAG: "Gln",
  CGU: "Arg",
  CGC: "Arg",
  CGA: "Arg",
  CGG: "Arg",
  AUU: "Ile",
  AUC: "Ile",
  AUA: "Ile",
  AUG: "Met",
  ACU: "Thr",
  ACC: "Thr",
  ACA: "Thr",
  ACG: "Thr",
  AAU: "Asn",
  AAC: "Asn",
  AAA: "Lys",
  AAG: "Lys",
  AGU: "Ser",
  AGC: "Ser",
  AGA: "Arg",
  AGG: "Arg",
  GUU: "Val",
  GUC: "Val",
  GUA: "Val",
  GUG: "Val",
  GCU: "Ala",
  GCC: "Ala",
  GCA: "Ala",
  GCG: "Ala",
  GAU: "Asp",
  GAC: "Asp",
  GAA: "Glu",
  GAG: "Glu",
  GGU: "Gly",
  GGC: "Gly",
  GGA: "Gly",
  GGG: "Gly",
};

export const DNA_BASES = ["A", "T", "C", "G"] as const;

export const HBB_NORMAL_SEQUENCE = "ATGGTGCATCTGACTCCTGAGGAGAAGTCT";
export const HBB_SICKLE_SEQUENCE = "ATGGTGCATCTGACTCCTGTGGAGAAGTCT";
export const SICKLE_MUTATION_INDEX = 19;
export const HBB_FRAGMENT_LENGTH = HBB_NORMAL_SEQUENCE.length;

export function sanitizeDnaInput(value: string) {
  return value.toUpperCase().replace(/[^ATCG]/g, "");
}

export function splitIntoCodons(sequence: string) {
  const codons: string[] = [];

  for (let index = 0; index < sequence.length; index += 3) {
    codons.push(sequence.slice(index, index + 3));
  }

  return codons;
}

export function toMrna(codingDna: string) {
  return codingDna.replaceAll("T", "U");
}

export function translateMrna(mrna: string) {
  const aminoAcids: string[] = [];

  for (const codon of splitIntoCodons(mrna)) {
    if (codon.length < 3) {
      break;
    }

    const aminoAcid = CODON_TABLE[codon] ?? "???";
    aminoAcids.push(aminoAcid);

    if (aminoAcid === "Stop") {
      break;
    }
  }

  return aminoAcids;
}

export function formatAminoAcids(aminoAcids: string[]) {
  return aminoAcids.length === 0 ? "尚未形成完整密码子" : aminoAcids.join(" - ");
}

export function applyMutationToDna({
  sequence,
  mode,
  index,
  replacementBase,
  insertionBases,
  deletionLength,
}: MutationInputs) {
  const safeIndex = Math.max(0, Math.min(index, sequence.length - 1));

  if (mode === "substitution") {
    return (
      sequence.slice(0, safeIndex) +
      sanitizeDnaInput(replacementBase || sequence[safeIndex]) +
      sequence.slice(safeIndex + 1)
    );
  }

  if (mode === "insertion") {
    const payload = sanitizeDnaInput(insertionBases) || "A";
    return sequence.slice(0, safeIndex) + payload + sequence.slice(safeIndex);
  }

  const safeDeletionLength = Math.max(1, Math.min(deletionLength, sequence.length - safeIndex));
  return sequence.slice(0, safeIndex) + sequence.slice(safeIndex + safeDeletionLength);
}

type MutationSummary = {
  dnaBefore: string;
  dnaAfter: string;
  mrnaBefore: string;
  mrnaAfter: string;
  proteinBeforeList: string[];
  proteinAfterList: string[];
  proteinBefore: string;
  proteinAfter: string;
  classification: string;
  explanation: string;
};

function findStopIndex(aminoAcids: string[]) {
  return aminoAcids.findIndex((item) => item === "Stop");
}

export function summarizeMutation(
  originalDna: string,
  mutatedDna: string,
  mode: MutationMode,
): MutationSummary {
  const mrnaBefore = toMrna(originalDna);
  const mrnaAfter = toMrna(mutatedDna);
  const proteinBeforeList = translateMrna(mrnaBefore);
  const proteinAfterList = translateMrna(mrnaAfter);
  const proteinBefore = formatAminoAcids(proteinBeforeList);
  const proteinAfter = formatAminoAcids(proteinAfterList);

  const lengthDelta = mutatedDna.length - originalDna.length;
  const sameProtein = proteinBeforeList.join("|") === proteinAfterList.join("|");
  const stopBefore = findStopIndex(proteinBeforeList);
  const stopAfter = findStopIndex(proteinAfterList);
  const earlyStopIntroduced =
    stopAfter !== -1 && (stopBefore === -1 || stopAfter < stopBefore);

  let classification = "结果待观察";
  let explanation = "你可以继续比较突变前后的密码子和氨基酸。";

  if (lengthDelta !== 0 && Math.abs(lengthDelta) % 3 !== 0) {
    classification = "移码突变";
    explanation =
      "增添或缺失的碱基数不是 3 的倍数，阅读框整体后移，后续多个密码子都会改变，因此通常影响更大。";
  } else if (sameProtein) {
    classification = "沉默突变";
    explanation =
      "虽然 DNA 序列发生了变化，但对应的密码子仍然编码同一种氨基酸，所以蛋白质一级结构没有明显变化。";
  } else if (mode === "substitution") {
    if (earlyStopIntroduced) {
      classification = "无义突变";
      explanation =
        "单个碱基替换把某个密码子变成终止信号，翻译会提前结束，蛋白质因此被截短。这一类按惯例只涵盖碱基替换。";
    } else {
      classification = "错义突变";
      explanation =
        "替换改变了某个密码子所对应的氨基酸，这可能进一步影响蛋白质的结构和功能。";
    }
  } else if (mode === "insertion") {
    classification = "整码插入";
    explanation = earlyStopIntroduced
      ? "插入的碱基数是 3 的倍数，阅读框没有整体移动，但插入后的新密码子中出现了终止信号，翻译会提前结束。此时通常不称为无义突变（该术语仅指碱基替换），但效果包含蛋白质被截短。"
      : "插入的碱基数是 3 的倍数，阅读框没有整体移动，但会额外插入新的氨基酸。";
  } else if (mode === "deletion") {
    classification = "整码缺失";
    explanation = earlyStopIntroduced
      ? "缺失的碱基数是 3 的倍数，阅读框没有整体移动，但删除后在拼接处形成了新的终止密码子，翻译会提前结束。此时通常不称为无义突变（该术语仅指碱基替换），但效果包含蛋白质被截短。"
      : "缺失的碱基数是 3 的倍数，阅读框没有整体移动，但会缺少一段氨基酸。";
  }

  return {
    dnaBefore: originalDna,
    dnaAfter: mutatedDna,
    mrnaBefore,
    mrnaAfter,
    proteinBeforeList,
    proteinAfterList,
    proteinBefore,
    proteinAfter,
    classification,
    explanation,
  };
}

