import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5 rounded-[1.75rem] border border-stone-200 bg-white p-8 text-center shadow-sm">
      <p className="text-sm font-semibold tracking-[0.2em] text-stone-500 uppercase">
        离线模式
      </p>
      <h1 className="font-serif text-4xl text-stone-900">当前没有网络连接。</h1>
      <p className="text-base leading-8 text-stone-700">
        如果你之前已经打开过这个应用，案例页、突变实验台和自然选择模块一般仍可以继续使用。AI 聊天需要联网才能调用。
      </p>
      <div className="flex flex-col justify-center gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex min-h-12 items-center justify-center rounded-full bg-stone-950 px-5 text-sm font-semibold text-white"
        >
          返回首页
        </Link>
        <Link
          href="/lab"
          className="inline-flex min-h-12 items-center justify-center rounded-full border border-stone-200 px-5 text-sm font-semibold text-stone-700"
        >
          打开突变实验台
        </Link>
      </div>
    </div>
  );
}

