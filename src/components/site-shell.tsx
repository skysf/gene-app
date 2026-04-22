"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NetworkStatus } from "@/components/network-status";

const navigation = [
  { href: "/", label: "首页" },
  { href: "/cases", label: "典型案例" },
  { href: "/lab", label: "突变实验台" },
  { href: "/evolution", label: "自然选择" },
];

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.12),transparent_24%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.10),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.08),transparent_28%)]">
      <header className="sticky top-0 z-40 border-b border-stone-200/70 bg-[rgba(246,242,233,0.82)] backdrop-blur-xl">
        <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="rounded-[1.85rem] border border-white/70 bg-white/62 p-4 shadow-soft backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <Link href="/" className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-[1.35rem] bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-bold text-white shadow-sm">
                  DNA
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-[0.26em] text-stone-500 uppercase">
                    Gene Explorer
                  </p>
                  <p className="font-serif text-lg text-stone-900 sm:text-xl">
                    基因突变教学模拟器
                  </p>
                </div>
              </Link>

              <div className="flex flex-wrap items-center gap-3">
                <div className="hidden rounded-full border border-stone-200 bg-white/75 px-3 py-1.5 text-xs font-semibold text-stone-600 lg:inline-flex">
                  平板优先 · 离线可用 · 联网 AI 解释
                </div>
                <NetworkStatus />
                <Link
                  href="/settings"
                  className={`inline-flex min-h-9 items-center rounded-full border px-3 text-xs font-semibold transition ${
                    pathname === "/settings" || pathname.startsWith("/settings/")
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : "border-stone-200 bg-white/78 text-stone-700 hover:border-stone-400"
                  }`}
                >
                  设置
                </Link>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <nav className="flex flex-wrap gap-2">
                {navigation.map((item) => {
                  const isActive =
                    item.href === "/"
                      ? pathname === item.href
                      : pathname === item.href || pathname.startsWith(`${item.href}/`);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-semibold transition ${
                        isActive
                          ? "border-emerald-600 bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
                          : "border-stone-200 bg-white/78 text-stone-700 hover:border-stone-400 hover:bg-white hover:text-stone-900"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="rounded-full border border-amber-200 bg-amber-50/85 px-4 py-2 text-xs font-semibold text-amber-900">
                从 DNA 到种群，用同一条因果链讲清基因突变
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {children}
      </main>

      <footer className="pb-8 pt-2">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="surface-card grid gap-4 rounded-[1.85rem] p-5 sm:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="text-sm font-semibold tracking-[0.2em] text-stone-500 uppercase">
                Classroom Ready
              </p>
              <p className="mt-3 font-serif text-2xl text-stone-900">
                为中国高中生物课堂准备的交互式讲解界面
              </p>
              <p className="mt-3 text-sm leading-7 text-stone-600">
                支持 iPad、Android 平板与电脑浏览器使用。模拟器主体支持离线缓存，AI 生物问答助手需要联网。
              </p>
            </div>

            <div className="grid gap-3">
              <div className="rounded-[1.35rem] border border-stone-200 bg-white/80 px-4 py-3 text-sm text-stone-700">
                典型案例适合课堂演示，自由实验和自然选择适合学生自主探究。
              </div>
              <div className="rounded-[1.35rem] border border-stone-200 bg-white/80 px-4 py-3 text-sm text-stone-700">
                当前版本默认中文表达，优先把 DNA、mRNA、蛋白质和性状的联系讲清楚。
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
