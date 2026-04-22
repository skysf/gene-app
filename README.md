# 基因突变教学模拟器 · Gene App

面向中国高中生的交互式生物教学桌面应用。覆盖 **基因突变、镰状细胞贫血、自然选择** 三大核心模块，内置 AI 助手，可结合当前实验页面做概念解释。

> 人教版《遗传与进化》里从"一个碱基变了"讲到"种群基因频率偏移"，这条因果链用黑板很难讲清楚——本项目把 DNA、mRNA、密码子、氨基酸和表型变化做成可点击的可视化，让学生先看到"发生了什么"，再用 AI 问"为什么"。

## 下载

去 [Releases 页面](https://github.com/skysf/gene-app/releases/latest) 下载最新版：

| 平台 | 文件 |
| --- | --- |
| macOS (Apple Silicon) | `Gene App_<version>_aarch64.dmg` |
| Windows (x64) | `Gene App_<version>_x64-setup.exe` |

### 首次打开被系统拦截？

因为没有支付 Apple / Microsoft 的开发者认证费（这是小范围自用工具），系统会显示"无法验证开发者"的警告。这 **不是病毒**，是未签名应用的默认待遇。

**macOS**：右键 `Gene App.app` → 打开 → 再次点击"打开"。只需做一次。
或者命令行：
```bash
xattr -d com.apple.quarantine "/Applications/Gene App.app"
```

**Windows**：SmartScreen 弹窗选 **"更多信息" → "仍要运行"**。只需做一次。

## 配置 AI 助手

AI 功能使用 OpenRouter，你需要自备 API Key（**BYOK**）。

1. 去 [openrouter.ai/keys](https://openrouter.ai/keys) 注册账号并创建一个 Key
2. 打开 app 右上角 **设置**
3. 粘贴 Key → 保存 → 点"测试连接"确认有效
4. 选择模型（默认 Claude Sonnet 4.6，也有 GPT-5.2 / Haiku / Gemini Flash 几个档位）

Key 通过 **OS 系统钥匙串**（macOS Keychain / Windows Credential Manager）保存，不会上传到任何服务器。聊天记录只存你本机。

## 四个核心模块

### 🧬 镰状细胞贫血案例
分步走查"正常红细胞 → HBB 基因第 6 位点突变 → 血红蛋白 Glu→Val → 细胞形态改变 → 疟疾适应优势"的完整因果链，每一步配一个"再简单一点"按钮。

### 🔬 自定义突变实验台
手动对 DNA 序列做 **替换 / 增添 / 缺失**，实时看 mRNA 转录、密码子翻译、氨基酸变化。自动判定沉默 / 错义 / 无义 / 移码四类。

### 📊 自然选择模拟
设定初始等位基因频率 + 不同基因型的相对生存率 + 世代数，观察种群频率演化。支持"有 / 无疟疾压力"对照，直观呈现 HbS 杂合优势平衡。

### 🤖 AI 生物问答
只回答生物相关问题，自动结合当前页面上下文（突变前后序列、当前密码子、模拟参数）。流式输出，支持更换模型。

## 自动更新

每次启动 app 会检查 [GitHub Releases](https://github.com/skysf/gene-app/releases) 的 `latest.json`，有新版本时弹绿色 banner 一键更新。更新包用 [minisign](https://jedisct1.github.io/minisign/) 签名，防中间人替换。

## 开发

需要环境：**Node.js 20+** · **Rust 1.77+** · macOS 需装 Xcode Command Line Tools。

```bash
# 克隆
git clone https://github.com/skysf/gene-app.git
cd gene-app
npm install

# 浏览器里纯前端热重载
npm run dev          # http://localhost:1953

# Tauri 开发模式（原生窗口 + 热重载 + 能调 keychain）
npm run tauri:dev

# 打当前平台的 release 安装包
npm run tauri:build
# 产物在 src-tauri/target/release/bundle/
```

跨平台打包走 GitHub Actions（`.github/workflows/release.yml`），`git tag v* && git push origin v*` 触发。

## 技术栈

- **前端**：Next.js 16（静态导出）+ React 19 + TypeScript + Tailwind CSS v4
- **桌面壳**：Tauri v2 (Rust)
- **AI 接入**：OpenRouter（用户自备 Key，浏览器直连流式 SSE）
- **存储**：OS keychain（Key）+ tauri-plugin-store（模型 / baseUrl 偏好）
- **签名 & 自动更新**：minisign + tauri-plugin-updater
- **发布**：GitHub Actions matrix（`macos-14` + `windows-latest`）

## 项目结构

```
src/
  app/           Next.js 页面（首页、案例、实验台、自然选择、设置）
  components/    React 组件（图表、实验台、AI 助手面板、更新 banner）
  lib/           纯逻辑（genetics、evolution、openrouter、secrets、store）
src-tauri/
  src/           Rust 侧（keychain 命令 + 插件注册）
  tauri.conf.json  窗口/打包/更新配置
plan/            开发计划（active / done）
.github/workflows/
  check.yml      PR lint + cargo check
  release.yml    tag push 触发的跨平台打包
```

## 免责声明

- 本工具面向高中生物教学，**不提供医疗诊断或临床建议**
- AI 回答由第三方大模型生成，可能存在错误，**请老师核验后再用于教学**
- 本项目为个人教育目的开发，发布在 [MIT License](LICENSE) 之下

## 反馈

bug 或建议欢迎 [开 issue](https://github.com/skysf/gene-app/issues)。
