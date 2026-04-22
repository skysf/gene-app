# Tauri 桌面化改造计划

创建时间：2026-04-22

## 目标

把现有 Next.js 教学 app 改造为 **macOS (Apple Silicon) + Windows** 桌面安装包，用户自带 OpenRouter API key（BYOK），取消服务端依赖。

## 最终决策

| 项 | 决定 |
| --- | --- |
| 壳子 | Tauri v2 |
| Next.js 模式 | 静态导出 `output: 'export'` |
| 目标平台 | macOS aarch64 + Windows x86_64 |
| 代码签名 | 不签名（自用分发） |
| 自动更新 | `tauri-plugin-updater` + 公开 GitHub Releases |
| API key 存储 | OS keychain（`tauri-plugin-stronghold` 或 `tauri-plugin-keyring`） |
| 模型选择 | 预设 3–4 个模型 + 自定义输入框 |
| 本地数据 | `tauri-plugin-store`（JSON 文件） |
| AI 提供方 | OpenRouter（浏览器端直连，CORS 已支持） |

## 现状审查

### 阻塞静态导出的文件（必须处理）

- `src/app/api/chat/route.ts` — Route Handler，静态导出不支持。**删除**，其逻辑下沉到客户端 `src/lib/openrouter.ts`。

### 可删除（PWA 相关，桌面版用不到）

- `src/components/pwa-registrar.tsx`
- `src/app/offline/page.tsx`
- `src/app/manifest.ts`
- `public/sw.js`（如存在）
- `src/app/layout.tsx` 里对 `PwaRegistrar` 的引用

### 需要改造

- `src/components/biology-chat.tsx` — `fetch("/api/chat")` 改成直连 OpenRouter，读取 keychain 里的 key；文案"联网时可调用百炼 / Kimi"换成 OpenRouter。
- `src/lib/chat.ts` — 保留 `ChatMessage` / `BiologyChatContext` / 关键词拦截逻辑，新增 `buildSystemPrompt()`（从 route.ts 搬过来）和 `callOpenRouter()`。
- `src/components/network-status.tsx` — 保留（AI 仍需要联网）。
- `next.config.ts` — 加 `output: 'export'`, `images: { unoptimized: true }`。
- `package.json` — 加 `"export": "next build"` 脚本（Next 16 的 export 已合并到 build）；加 Tauri CLI。

### 不影响静态导出

- `src/app/page.tsx`、`cases/`、`evolution/`、`lab/` 均为客户端/静态页面。
- `src/lib/{content,evolution,genetics}.ts` 纯逻辑，无服务端依赖。

## 改造步骤

### Phase 1 — Next.js 静态化

> 动手前先读 `node_modules/next/dist/docs/` 里 Next 16 静态导出相关文档（AGENTS.md 要求）。

1. 修改 `next.config.ts`：
   ```ts
   const nextConfig: NextConfig = {
     output: "export",
     images: { unoptimized: true },
   };
   ```
2. 删除 `src/app/api/chat/route.ts` 及其父目录 `src/app/api/chat/`、`src/app/api/`。
3. 删除 PWA 相关：`src/components/pwa-registrar.tsx`、`src/app/offline/page.tsx`、`src/app/manifest.ts`、`public/sw.js`；删掉 `layout.tsx` 里 `<PwaRegistrar />`。
4. 删除 `.env.example` 里 Bailian/Moonshot 配置（改成说明桌面版用 keychain，不再需要 .env）。
5. 跑 `npm run build` 验证能生成 `out/`。

### Phase 2 — AI 调用迁移到客户端

新建 `src/lib/openrouter.ts`：

- `streamChatCompletion({ apiKey, model, messages, signal })` — 用 `fetch` 调 `https://openrouter.ai/api/v1/chat/completions`，带 `stream: true`，返回 async iterator of 文本 chunk。
- 关键词拦截 `shouldAllowBiologyQuestion()` 和 `buildSystemPrompt()` 从原 route.ts 搬过来。
- header 带上 `HTTP-Referer: https://github.com/<你>/gene-app`、`X-OpenRouter-Title: Gene App`（可选，为了上 leaderboard；不上也无所谓，桌面 app 通常无所谓）。

改 `src/components/biology-chat.tsx`：

- 从新 settings store 读 `apiKey` / `selectedModel`，没有 key 时按钮提示"请先到设置里填 OpenRouter API Key"。
- 改成 streaming 渲染（逐 chunk append 到最后一条 assistant message）。
- 断网 / 401 / 429 / 5xx 各给一条明确的用户提示。

### Phase 3 — 设置 UI（API key + 模型选择）

新页面 `src/app/settings/page.tsx`（或抽屉式组件，看 site-shell 现在结构决定）：

- **API Key 区**：密码输入框（可切换显示）+ "保存到系统 keychain" + "删除" + "测试连接"（用最便宜的模型发一个 ping request）。
- **模型选择区**：预设 radio + "自定义"输入框。
- 预设列表（初稿，后续可调）：
  1. `anthropic/claude-sonnet-4-6` — 默认，推理 & 中文质量均衡
  2. `openai/gpt-5.2` — 备选主力
  3. `anthropic/claude-haiku-4-5` — 便宜档（快速响应/高用量场景）
  4. `google/gemini-2.5-flash` — 最便宜档
  5. 自定义 — 用户手填 OpenRouter 模型 ID

### Phase 4 — Tauri v2 壳集成

> 动手前先确认 Tauri v2 latest 文档（`tauri.app/v2`）。

1. 装工具链：Rust（rustup）+ `@tauri-apps/cli`：
   ```
   npm i -D @tauri-apps/cli @tauri-apps/api
   npx tauri init
   ```
2. 配置 `src-tauri/tauri.conf.json`：
   - `build.frontendDist`: `"../out"`
   - `build.devUrl`: `"http://localhost:1953"`
   - `build.beforeDevCommand`: `"npm run dev"`
   - `build.beforeBuildCommand`: `"npm run build"`
   - `app.windows[0]`: 标题、1280×800 初始尺寸、最小 960×640
   - `bundle.targets`: `["app", "dmg", "nsis"]`（mac 打 .app + .dmg，Win 打 NSIS 安装包）
   - `bundle.identifier`: `com.<你>.gene-app`
3. 加 npm 脚本：`"tauri": "tauri"`, `"tauri:dev": "tauri dev"`, `"tauri:build": "tauri build"`.
4. `.gitignore` 加 `src-tauri/target/` 和 `out/`.
5. 图标：`npx tauri icon path/to/icon.png`（需要一张 ≥ 1024×1024 的 PNG；可以先用 `public/icon.svg` 转一张）。

### Phase 5 — API key 存到 keychain

候选：

- **`tauri-plugin-stronghold`** — IOTA Stronghold，加密保险库，功能强但 API 重。
- **`tauri-plugin-keyring`**（社区插件，基于 `keyring-rs`）— 直接用系统 keychain（macOS Keychain / Windows Credential Manager），API 轻巧，**推荐**。

实施：

1. 在 `src-tauri/Cargo.toml` 加依赖，`lib.rs` 注册插件。
2. `src-tauri/capabilities/default.json` 里允许前端调 `keyring:set-password` / `get-password` / `delete-password`。
3. 前端 `src/lib/secrets.ts` 封装：`getApiKey()` / `setApiKey(value)` / `deleteApiKey()`，服务名 `gene-app`，账号固定 `openrouter`。
4. 在 Tauri 之外（web 环境）fallback 到"不可用"，方便 `next dev` 开发时不崩（开发时可以用 sessionStorage，明确标注只是开发调试）。

### Phase 6 — 其他持久化用 Store plugin

1. `cargo add tauri-plugin-store`，注册插件。
2. `src/lib/store.ts` 封装 `@tauri-apps/plugin-store` 的 `load('settings.json')`，存：
   - `selectedModel`（string）
   - `chatHistory`（按 module 分组的历史会话）
   - `mutationWorkbenchState`（可选，看你要不要持久化实验台进度）
3. 写入时 debounce 300ms，避免频繁落盘。

### Phase 7 — 自动更新

1. 生成签名密钥对：`npx tauri signer generate -w ~/.tauri/gene-app.key`（私钥密码别丢；私钥放 GitHub Secrets）。
2. `tauri.conf.json` 的 `plugins.updater`：
   ```json
   {
     "active": true,
     "endpoints": ["https://github.com/<你>/<repo>/releases/latest/download/latest.json"],
     "pubkey": "<生成的公钥>",
     "dialog": true
   }
   ```
3. `cargo add tauri-plugin-updater`，前端在启动时调 `check()` → `downloadAndInstall()`。
4. 发布流程由 GitHub Action 自动生成 `latest.json` + 签名更新包（见 Phase 8）。

### Phase 8 — GitHub Actions 打包与发布

新建 `.github/workflows/release.yml`，矩阵：

- `macos-14`（Apple Silicon，aarch64）
- `windows-latest`（x86_64）

用 `tauri-apps/tauri-action@v0`，触发方式用 `push tag v*`。Secrets 需要：

- `TAURI_SIGNING_PRIVATE_KEY`
- `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`
- `GITHUB_TOKEN`（自带）

Action 会：

1. 在两个 runner 上 `npm ci && npm run build && tauri build`
2. 把 `.dmg` / `.exe` / 签名 / `latest.json` 一起推到 GitHub Release
3. updater 从 `latest.json` 拿到新版本信息和下载地址

## 风险 & 待定

1. **OpenRouter 国内网络**：国内访问 `openrouter.ai` 偶尔抽风。必要时可让用户在设置里改 `baseUrl`（比如走自建代理）。
2. **Tauri WebView 的 fetch CORS**：Tauri v2 默认 webview 是系统 WebView（mac 是 WKWebView，Win 是 WebView2），fetch 走正常 CORS。OpenRouter 已支持 CORS，应该可以直连；如果遇到问题，备选是在 Rust 侧加一个 `#[tauri::command] async fn openrouter_chat(...)`，绕开 CORS。
3. **首次启动无 key 的引导**：要不要做一个强制引导流程（首次启动直接跳 settings）？—— 建议做。
4. **模型列表会过时**：预设硬编码的模型 id 可能 6 个月后 OpenRouter 改名/下架。要不要加一个"从 OpenRouter 拉模型列表"的按钮（GET `https://openrouter.ai/api/v1/models`）？—— 建议 v1.1 再加，v1 先硬编码 4 个 + 自定义输入框就够。
5. **更新检查节奏**：启动时查一次 + 手动"检查更新"按钮；不做后台轮询。

## 交付里程碑

- **M1** — Phase 1+2 完成，`npm run build` 能出 `out/`，浏览器里 chat 能直连 OpenRouter（用临时硬编码 key 测试）。
- **M2** — Phase 3+4+5 完成，`tauri dev` 能起来，设置页能写 keychain，chat 能从 keychain 读 key 跑通。
- **M3** — Phase 6 完成，关闭重开 app 设置/历史都在。
- **M4** — Phase 7+8 完成，push tag 触发 GitHub Action，产出 `.dmg` + `.exe`，updater 能自检并安装新版本。

## 开始前还需用户确认

1. **GitHub 仓库已公开？** 如果还没建，我在实现 Phase 8 前会先让你建好。
2. **bundle identifier**：默认用 `com.skyludata.gene-app` 可以吗？（反向域名风格，任意起就行）

---

**附注**：`plan/active/done/` 是一个空子目录（可能是 `6ff16b8` 提交时误建的），不影响本计划；是否清理由你决定。

---

## 2026-04-22 实施进度

### ✅ 已完成（代码侧）

- **Phase 1**：`next.config.ts` 加 `output: 'export'`；删除 `/api/chat`、`pwa-registrar.tsx`、`offline/page.tsx`、`manifest.ts`、`public/sw.js`、`.env.example`；`layout.tsx` 去掉 PWA 相关。
- **Phase 2**：新增 `src/lib/openrouter.ts`（SSE 流式 + 关键词拦截 + system prompt + `OpenRouterError` 分类），重写 `biology-chat.tsx` 走直连 + 流式增量渲染。
- **Phase 3**：新页面 `src/app/settings/page.tsx`，支持 API Key 输入/保存/删除、测试连接、4 个预设模型 + 自定义、自定义 baseUrl。site-shell header 加了"设置"入口。
- **Phase 4**：`tauri init --ci` 脚手架完成，`src-tauri/tauri.conf.json` 已配：`productName=Gene App`、identifier `com.skyludata.gene-app`、窗口 1280×820（min 960×640）、bundle targets `[app, dmg, nsis]`。`package.json` 加了 `tauri:dev` / `tauri:build` 脚本。`.gitignore` 加了 `src-tauri/target` / `src-tauri/gen/schemas`。
- **Phase 5**：`src-tauri/src/secrets.rs` 三个 Tauri command（`secret_get/set/delete`），用 `keyring = "3"` crate 直接访问 macOS Keychain / Windows Credential Manager。`src/lib/secrets.ts` + `src/lib/runtime.ts` 做 Tauri 检测，浏览器环境 fallback 到 localStorage。
- **Phase 6**：`tauri-plugin-store` 在 `lib.rs` 注册；`src/lib/prefs.ts` 统一读写 `model` / `baseUrl`（Tauri 时走 store，浏览器时走 localStorage）。`settings-context.tsx` 全面替换为异步加载。
- **Phase 7**：`tauri-plugin-updater` 已加入 Cargo 和 `lib.rs`（desktop-only cfg gate）；`src/lib/updater.ts` + `src/components/update-checker.tsx` 启动时自动检查，弹出绿色 banner 提示"立即更新 / 稍后"，下载进度条齐全。
- **Phase 8**：`.github/workflows/release.yml` 已就位——tag `v*` push 触发，matrix `macos-14 (aarch64)` + `windows-latest (x86_64)`，用 `tauri-apps/tauri-action@v0` 产出 `.dmg` / `.exe` + `latest.json`，release 默认为 draft。

### ⚠️ 需用户自己做的事

下面这些我不能代做，按顺序完成就能发布第一版：

1. **安装 Rust 工具链**（本地想跑 `tauri dev` 才要；只靠 CI 打包可跳过）：
   ```
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

2. **建公开 GitHub 仓库**，把本地 push 上去。比如 `skysf/gene-app`。

3. **生成 Tauri 签名密钥对**（不装 Rust 也能执行，纯 node 脚本）：
   ```
   npx tauri signer generate -w ~/.tauri/gene-app.key
   ```
   会输出公钥（一串 base64），顺手把密码记好（私钥会加密保存）。

4. **把公钥填进 `src-tauri/tauri.conf.json`**（新增 `plugins.updater` 块）——打开文件在 `bundle` 同级加：
   ```json
   "plugins": {
     "updater": {
       "endpoints": [
         "https://github.com/skysf/gene-app/releases/latest/download/latest.json"
       ],
       "pubkey": "<粘贴你刚生成的公钥>",
       "dialog": false
     }
   }
   ```
   > 注意：没填 pubkey 之前，CI 构建带 updater 的版本会失败；代码里的自动检查也会 silent 跳过。

5. **在 GitHub 仓库 Settings → Secrets and variables → Actions 加两条 secret**：
   - `TAURI_SIGNING_PRIVATE_KEY` —— `cat ~/.tauri/gene-app.key` 的完整内容
   - `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` —— 你刚设的那个密码

6. **给第一版打 tag 并 push**：
   ```
   git tag v0.1.0
   git push origin v0.1.0
   ```
   `release.yml` 会触发，mac 和 windows runner 各自打完包后推成 **draft release**。进 Releases 页面检查产物，改好 changelog 后点 Publish。

7. **（可选）换 app 图标**：现在用的是 Tauri 默认图标。准备一张 ≥1024×1024 的 PNG：
   ```
   npx tauri icon path/to/your-icon.png
   ```
   会覆盖 `src-tauri/icons/` 下的全套。

### 🔧 已知待验证项

以下几处因本地没 Rust，仅靠 TS/JSON 层面验证通过（`npm run build` 成功），第一次 `tauri dev` 可能还要微调：

- `src-tauri/src/lib.rs` 里用了 `#[cfg(desktop)]` cfg gate——Tauri v2 有这个，但若 cargo 报未知 cfg，就换成 `#[cfg(not(any(target_os = "ios", target_os = "android")))]`。
- `keyring = "3"` 的 `Error::NoEntry` 变体名和 `delete_credential()` 方法在 crates.io 发布版本里应该还叫这名，如果 v3 又改名了就改成 `delete_password()`。
- `src-tauri/capabilities/default.json` 只启用了 `core:default` / `store:default` / `updater:default`，没为自定义命令 `secret_get/set/delete` 显式申明权限——v2 里应用级 command 默认不需要 capability entry，若第一次跑真机时报"command not allowed"，再加 inline 权限。

### 🧭 用户可继续自助的微调

- **预设模型列表**在 `src/lib/settings-context.tsx` 的 `MODEL_PRESETS`，直接改字符串就行。
- **默认 system prompt** 在 `src/lib/openrouter.ts` 的 `buildSystemPrompt()`。
- **窗口初始大小**在 `src-tauri/tauri.conf.json` 的 `app.windows[0]`。
