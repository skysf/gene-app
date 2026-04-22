import Link from "next/link";
import { ModuleCard } from "@/components/module-card";

export default function Home() {
  return (
    <div className="space-y-10">
      <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-[radial-gradient(circle_at_top_left,_rgba(237,182,98,0.35),_transparent_38%),linear-gradient(135deg,_#fff9ee_0%,_#f0f7ff_52%,_#eaf4eb_100%)] p-6 shadow-sm sm:p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.9fr] lg:items-end">
          <div className="space-y-6">
            <p className="text-sm font-semibold tracking-[0.28em] text-amber-800 uppercase">
              面向中国高中生的生物互动课堂
            </p>
            <div className="space-y-4">
              <h1 className="max-w-3xl font-serif text-4xl leading-tight text-stone-900 sm:text-5xl lg:text-6xl">
                在网页上看见
                <span className="text-emerald-800"> 基因突变 </span>
                如何一步步影响蛋白质与种群。
              </h1>
              <p className="max-w-2xl text-base leading-8 text-stone-700 sm:text-lg">
                这个版本围绕镰状细胞贫血、自定义突变实验台和自然选择模拟展开，
                支持 iPad、Android 平板与电脑浏览器。核心模拟器可缓存后离线使用，
                AI 生物问答助手在联网时提供解释与追问引导。
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/cases"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-stone-950 px-6 text-sm font-semibold text-white transition hover:bg-stone-800"
              >
                先看典型案例
              </Link>
              <Link
                href="/lab"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-stone-300 bg-white/80 px-6 text-sm font-semibold text-stone-900 transition hover:border-stone-500 hover:bg-white"
              >
                进入自由探究
              </Link>
            </div>
          </div>
          <div className="grid gap-4 rounded-[1.75rem] border border-white/70 bg-white/75 p-5 backdrop-blur">
            <div className="rounded-3xl border border-emerald-100 bg-emerald-50/80 p-4">
              <p className="text-sm font-semibold text-emerald-900">课堂特点</p>
              <p className="mt-2 text-sm leading-7 text-emerald-900/80">
                从 DNA 碱基变化一路看到 mRNA、密码子、氨基酸和性状变化，不再只停留在文字描述。
              </p>
            </div>
            <div className="rounded-3xl border border-sky-100 bg-sky-50/90 p-4">
              <p className="text-sm font-semibold text-sky-900">离线边界</p>
              <p className="mt-2 text-sm leading-7 text-sky-900/80">
                首次联网缓存后，案例、突变实验和自然选择模块可离线继续使用；AI 聊天需要联网。
              </p>
            </div>
            <div className="rounded-3xl border border-amber-100 bg-amber-50/90 p-4">
              <p className="text-sm font-semibold text-amber-900">教师可直接用</p>
              <p className="mt-2 text-sm leading-7 text-amber-900/80">
                默认中文表达、平板触控优先、适合大屏演示，也适合学生一人一台设备自主探究。
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <ModuleCard
          href="/cases"
          title="镰状细胞贫血案例"
          eyebrow="模块 A"
          summary="用一步步展开的典型案例串起基因、蛋白质和性状变化。"
          bullets={[
            "对比正常与镰状红细胞形态",
            "突出 GAG -> GTG 的关键密码子改变",
            "配套课堂讲解和学生自读说明",
          ]}
          tone="amber"
        />
        <ModuleCard
          href="/lab"
          title="自定义突变实验台"
          eyebrow="模块 B"
          summary="自由进行替换、增添、缺失，实时观察转录和翻译结果。"
          bullets={[
            "编码链视角，降低上手门槛",
            "自动判断沉默、错义、无义与移码",
            "支持一键加载镰状细胞突变预设",
          ]}
          tone="emerald"
        />
        <ModuleCard
          href="/evolution"
          title="自然选择与基因频率"
          eyebrow="模块 C"
          summary="观察环境压力与生存率变化如何改写种群中的等位基因频率。"
          bullets={[
            "可切换疟疾环境预设",
            "折线图和柱状图同步变化",
            "给出课堂提问线索与趋势解释",
          ]}
          tone="sky"
        />
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[1.75rem] border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-2xl text-stone-900">推荐的课堂使用流程</h2>
          <div className="mt-5 grid gap-4">
            {[
              {
                title: "1. 用典型案例建立直觉",
                body: "先在案例页里看清楚一个碱基变化如何影响氨基酸，再连接到红细胞形态和健康表现。",
              },
              {
                title: "2. 让学生自己动手改序列",
                body: "在实验台中尝试替换、增添和缺失，观察哪些会引发移码，哪些只是改动了一个氨基酸。",
              },
              {
                title: "3. 把视角拉到种群层面",
                body: "在自然选择模块中切换环境，讨论为什么某些不利基因不会立刻消失。",
              },
            ].map((item) => (
              <article
                key={item.title}
                className="rounded-3xl border border-stone-200 bg-stone-50 p-4"
              >
                <h3 className="text-base font-semibold text-stone-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-7 text-stone-700">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
        <div className="rounded-[1.75rem] border border-stone-200 bg-[#1f3a5f] p-6 text-white shadow-sm">
          <p className="text-sm font-semibold tracking-[0.2em] text-sky-200 uppercase">
            AI 生物助手
          </p>
          <h2 className="mt-3 font-serif text-2xl">限定在生物课堂范围内回答。</h2>
          <ul className="mt-5 space-y-3 text-sm leading-7 text-sky-50/90">
            <li>只回答生物相关问题，优先中国高中生物课程范围。</li>
            <li>会结合当前实验上下文，解释“为什么这次突变会这样”。</li>
            <li>联网时可用，断网时会提示学生继续使用离线模拟器。</li>
          </ul>
          <div className="mt-6 rounded-3xl bg-white/10 p-4 text-sm leading-7 text-sky-50/85">
            首版将接入阿里云百炼与 Kimi，通过统一的 `/api/chat` 接口代理，前端不直接暴露 API Key。
          </div>
        </div>
      </section>
    </div>
  );
}
