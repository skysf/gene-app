import { BiologyChat } from "@/components/biology-chat";
import { MutationWorkbench } from "@/components/mutation-workbench";
import { chatExamples } from "@/lib/content";
import { HBB_NORMAL_SEQUENCE, HBB_SICKLE_SEQUENCE, summarizeMutation } from "@/lib/genetics";

export default function LabPage() {
  const preview = summarizeMutation(HBB_NORMAL_SEQUENCE, HBB_SICKLE_SEQUENCE, "substitution");

  return (
    <div className="flex min-w-0 flex-col gap-6 lg:flex-row lg:items-start xl:gap-8">
      <div className="min-w-0 flex-1">
        <MutationWorkbench />
      </div>
      <BiologyChat
        exampleQuestions={[...chatExamples.lab]}
        context={{
          module: "lab",
          moduleTitle: "自定义突变实验台",
          note: "学生正在替换、增添或缺失 DNA 编码链中的碱基。",
          dnaBefore: preview.dnaBefore,
          dnaAfter: preview.dnaAfter,
          mrnaBefore: preview.mrnaBefore,
          mrnaAfter: preview.mrnaAfter,
          proteinBefore: preview.proteinBefore,
          proteinAfter: preview.proteinAfter,
          mutationLabel: preview.classification,
        }}
      />
    </div>
  );
}
