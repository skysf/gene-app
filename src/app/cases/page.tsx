import { BiologyChat } from "@/components/biology-chat";
import { SickleCaseExplorer } from "@/components/sickle-case-explorer";
import { chatExamples } from "@/lib/content";
import {
  HBB_NORMAL_SEQUENCE,
  HBB_SICKLE_SEQUENCE,
  summarizeMutation,
} from "@/lib/genetics";

export default function CasesPage() {
  const summary = summarizeMutation(HBB_NORMAL_SEQUENCE, HBB_SICKLE_SEQUENCE, "substitution");

  return (
    <div className="flex min-w-0 flex-col gap-6 lg:flex-row lg:items-start xl:gap-8">
      <div className="min-w-0 flex-1">
        <SickleCaseExplorer />
      </div>
      <BiologyChat
        exampleQuestions={[...chatExamples.cases]}
        context={{
          module: "cases",
          moduleTitle: "镰状细胞贫血案例",
          note: "学生正在查看镰状细胞贫血案例的分步讲解。",
          dnaBefore: summary.dnaBefore,
          dnaAfter: summary.dnaAfter,
          mrnaBefore: summary.mrnaBefore,
          mrnaAfter: summary.mrnaAfter,
          proteinBefore: summary.proteinBefore,
          proteinAfter: summary.proteinAfter,
          mutationLabel: summary.classification,
        }}
      />
    </div>
  );
}
