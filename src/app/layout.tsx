import type { Metadata, Viewport } from "next";
import { PwaRegistrar } from "@/components/pwa-registrar";
import { SiteShell } from "@/components/site-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "基因突变教学模拟器",
  description:
    "面向中国高中生的基因突变、镰状细胞贫血和自然选择互动教学工具。",
  applicationName: "基因突变教学模拟器",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "基因突变教学模拟器",
  },
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
        <PwaRegistrar />
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
