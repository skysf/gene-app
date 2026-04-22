import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "基因突变教学模拟器",
    short_name: "基因模拟器",
    description: "用于中国高中生课堂的基因突变与自然选择互动模拟器。",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f2e9",
    theme_color: "#f4efe4",
    lang: "zh-CN",
    icons: [
      {
        src: "/icon.svg",
        sizes: "512x512",
        type: "image/svg+xml",
      },
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}

