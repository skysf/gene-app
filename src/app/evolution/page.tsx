import { BiologyChat } from "@/components/biology-chat";
import { SelectionSimulator } from "@/components/selection-simulator";
import { chatExamples } from "@/lib/content";
import {
  environmentPresets,
  simulateSelection,
  summarizeSelection,
} from "@/lib/evolution";

export default function EvolutionPage() {
  const rows = simulateSelection({
    sickleAlleleFrequency: 0.12,
    generations: 12,
    populationSize: 200,
    fitnessAA: environmentPresets.malaria.fitnessAA,
    fitnessAS: environmentPresets.malaria.fitnessAS,
    fitnessSS: environmentPresets.malaria.fitnessSS,
  });

  return (
    <div className="flex min-w-0 flex-col gap-6 lg:flex-row lg:items-start xl:gap-8">
      <div className="min-w-0 flex-1">
        <SelectionSimulator />
      </div>
      <BiologyChat
        exampleQuestions={[...chatExamples.evolution]}
        context={{
          module: "evolution",
          moduleTitle: "自然选择与基因频率",
          note: "学生正在观察不同环境下 HbA / HbS 等位基因频率的变化。",
          environment: environmentPresets.malaria.label,
          generationSummary: summarizeSelection(rows, environmentPresets.malaria.label),
        }}
      />
    </div>
  );
}
