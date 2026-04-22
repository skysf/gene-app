import type { Metadata, Viewport } from "next";
import { SiteShell } from "@/components/site-shell";
import { UpdateChecker } from "@/components/update-checker";
import { SettingsProvider } from "@/lib/settings-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "基因突变教学模拟器",
  description:
    "面向中国高中生的基因突变、镰状细胞贫血和自然选择互动教学工具。",
  applicationName: "基因突变教学模拟器",
};

export const viewport: Viewport = {
  themeColor: "#f4efe4",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full">
        <SettingsProvider>
          <SiteShell>{children}</SiteShell>
          <UpdateChecker />
        </SettingsProvider>
      </body>
    </html>
  );
}
