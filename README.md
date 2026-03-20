# ⚡ Ollama Desktop

<div align="center">

**[日本語](#-日本語) ・ [中文](#-中文) ・ [English](#-english)**

</div>

---

# 🇯🇵 日本語

OllamaのローカルLLMをリアルタイムで**ドット絵キャラクター**として可視化するElectronデスクトップアプリです。  
各モデルが「自分はどんなキャラクターか」を自己申告し、その回答をもとに個性的なアバターを自動生成します。

## 📸 特徴

- **自己紹介アバター生成** — 各モデルに自分のイメージを聞き、回答をピクセルアートに変換
- **リアルタイム状態監視** — CPU・メモリ・稼働状況をキャラクターの動きで表現
- **アバター永続化** — 生成済みプロファイルを `~/local-model-avatar/avatar-profiles.json` に保存
- **全体 / 個別 再生成** — ボタンまたは右クリックメニューで再生成可能
- **ワンダリング** — キャラクターが床の上をランダムに歩き回る
- **3言語対応** — 日本語 / 中文 / English をアプリ内で切り替え可能

## 🎮 キャラクターの状態

| 状態 | 動作 | 条件 |
|------|------|------|
| `idle`    | ソファでZzz | 待機中 |
| `busy`    | デスクでタイピング | CPU高負荷・推論実行中 |
| `loading` | 本を読む | モデル読み込み中 |
| `error`   | 頭を抱える | 接続エラー・異常 |

## 🚀 セットアップ

### 前提条件

| ツール | バージョン |
|--------|-----------|
| Node.js | 18 以上 |
| npm     | 9 以上   |
| Ollama  | 任意（なくてもデモ動作） |

### インストール & 起動

```bash
# 依存パッケージをインストール
npm install

# 通常起動
npm start

# 開発モード（DevTools付き）
npm run dev
```

### Ollamaと接続する場合

```bash
# 別ターミナルでOllamaを起動
ollama serve

# モデルを追加（例）
ollama pull llama3.2
ollama pull mistral
ollama pull phi3
```

アプリは `http://localhost:11434` に自動接続します。Ollamaが起動していない場合は**デモモード**で動作します。

## 🎨 アバター自動生成のしくみ

初回起動時、または新しいモデルが検出されると、そのモデル自身に次の質問をします：

> 「あなたはどんなピクセルアートキャラクターですか？髪の色・服の色・体型・アクセサリーをJSONで答えてください」

モデルの回答（JSON）をパースしてキャンバスに描画します。

```json
{
  "skinTone":      "#FFCBA4",
  "hairColor":     "#3322bb",
  "primaryColor":  "#CC2277",
  "accentColor":   "#FF88CC",
  "eyeColor":      "#1a1a2a",
  "bodyType":      "tall",
  "accessory":     "scarf",
  "personality":   "mysterious",
  "nameLabel":     "MST",
  "selfDescription": "フランスの優雅さを持つ、謎めいたアシスタント"
}
```

APIが応答しない場合はモデル名のハッシュからフォールバックプロファイルを生成します。

### タイムアウト（モデルサイズ連動）

| モデルサイズ | タイムアウト |
|-------------|------------|
| 〜3GB | 90秒 |
| 7B（〜4GB） | 110秒 |
| 13B（〜8GB） | 190秒 |
| 70B（〜40GB） | 最大600秒 |

## 💾 アバターの保存先

```
macOS / Linux : ~/local-model-avatar/avatar-profiles.json
Windows       : %USERPROFILE%\local-model-avatar\avatar-profiles.json
```

## 🏗 アーキテクチャ

```
ollama-electron/
 ├── main/index.js       Ollama APIポーリング・WebSocket・IPC・ファイル永続化
 ├── preload/index.js    Context Bridge（セキュアなIPC公開）
 └── renderer/
     ├── index.html      UIレイアウト・言語切り替えボタン
     ├── style.css       テーマ・アニメーション
     └── app.js          i18n辞書・Canvas描画・ワンダーシステム・状態管理
```

### データフロー

```
Ollama API (/api/tags, /api/ps)
    ↓ 3秒ごと
Main Process（状態加工・判定・IPC送信）
    ↓                          ↓
Renderer（Canvas描画）     WebSocket（外部ツール向け）
    ↓
requestAnimationFrame ループ（ワンダリング + キャラ描画）
```

## ⚙️ 環境変数

| 変数 | デフォルト | 説明 |
|------|-----------|------|
| `OLLAMA_HOST` | `http://localhost:11434` | Ollama APIのURL |

```bash
OLLAMA_HOST=http://192.168.1.10:11434 npm start
```

## 📦 配布ビルド

```bash
npm install --save-dev electron-builder
npx electron-builder --mac    # DMG
npx electron-builder --win    # NSIS
npx electron-builder --linux  # AppImage
```

## 🖥 動作確認済み環境

- macOS 14（Apple Silicon / Intel）
- Windows 11
- Ubuntu 22.04

## 🗺 ロードマップ

- [ ] モデル間の会話演出
- [ ] 感情パラメータシステム
- [ ] GPU使用率表示（nvidia-smi / Metal）
- [ ] システムトレイ常駐
- [ ] 音声エフェクト

## 📄 ライセンス

MIT

---

# 🇨🇳 中文

这是一款基于 Electron 的桌面应用，将 Ollama 本地 LLM 的运行状态以**像素艺术角色**的形式实时可视化。  
每个模型会"自我介绍"，根据其回答自动生成专属头像。

## 📸 功能特点

- **自我介绍头像生成** — 向每个模型询问其形象，并将回答转换为像素艺术
- **实时状态监控** — 通过角色动作直观展示 CPU、内存、运行状态
- **头像持久化** — 已生成的配置文件保存至 `~/local-model-avatar/avatar-profiles.json`
- **全量 / 单个重新生成** — 可通过按钮或右键菜单重新生成
- **漫步系统** — 角色在地板上随机漫步
- **三语言支持** — 支持日语 / 中文 / 英语切换

## 🎮 角色状态

| 状态 | 动作 | 触发条件 |
|------|------|---------|
| `idle`    | 在沙发上打盹（Zzz） | 待机中 |
| `busy`    | 在桌子前打字 | CPU高负载・推理运行中 |
| `loading` | 读书 | 模型加载中 |
| `error`   | 抱头苦恼 | 连接错误・异常 |

## 🚀 快速开始

### 前提条件

| 工具 | 版本 |
|------|------|
| Node.js | 18 或以上 |
| npm     | 9 或以上  |
| Ollama  | 可选（无也可演示） |

### 安装与启动

```bash
# 安装依赖
npm install

# 普通启动
npm start

# 开发模式（含 DevTools）
npm run dev
```

### 连接 Ollama

```bash
# 在另一个终端启动 Ollama
ollama serve

# 拉取模型（示例）
ollama pull llama3.2
ollama pull mistral
ollama pull phi3
```

应用将自动连接 `http://localhost:11434`。若 Ollama 未运行，则以**演示模式**运行。

## 🎨 头像自动生成原理

首次启动或检测到新模型时，会向该模型发送如下提问：

> "请用 JSON 描述你的像素艺术角色形象：发色、服装颜色、体型、配件等"

解析模型的回答（JSON）后绘制到画布上。

```json
{
  "skinTone":      "#FFCBA4",
  "hairColor":     "#3322bb",
  "primaryColor":  "#CC2277",
  "accentColor":   "#FF88CC",
  "eyeColor":      "#1a1a2a",
  "bodyType":      "tall",
  "accessory":     "scarf",
  "personality":   "mysterious",
  "nameLabel":     "MST",
  "selfDescription": "フランスの優雅さを持つ、謎めいたアシスタント"
}
```

若 API 无响应，则根据模型名称的哈希值生成备用配置文件。

### 超时设置（与模型大小关联）

| 模型大小 | 超时时间 |
|---------|---------|
| 〜3GB | 90秒 |
| 7B（〜4GB） | 110秒 |
| 13B（〜8GB） | 190秒 |
| 70B（〜40GB） | 最长600秒 |

## 💾 头像保存位置

```
macOS / Linux : ~/local-model-avatar/avatar-profiles.json
Windows       : %USERPROFILE%\local-model-avatar\avatar-profiles.json
```

## 🏗 架构

```
ollama-electron/
 ├── main/index.js       Ollama API 轮询・WebSocket・IPC・文件持久化
 ├── preload/index.js    Context Bridge（安全的 IPC 暴露）
 └── renderer/
     ├── index.html      UI 布局・语言切换按钮
     ├── style.css       主题・动画
     └── app.js          i18n 字典・Canvas 绘制・漫步系统・状态管理
```

### 数据流

```
Ollama API (/api/tags, /api/ps)
    ↓ 每3秒
Main Process（状态处理・判断・IPC 发送）
    ↓                          ↓
Renderer（Canvas 绘制）    WebSocket（供外部工具使用）
    ↓
requestAnimationFrame 循环（漫步 + 角色绘制）
```

## ⚙️ 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `OLLAMA_HOST` | `http://localhost:11434` | Ollama API 地址 |

```bash
OLLAMA_HOST=http://192.168.1.10:11434 npm start
```

## 📦 发布构建

```bash
npm install --save-dev electron-builder
npx electron-builder --mac    # DMG
npx electron-builder --win    # NSIS
npx electron-builder --linux  # AppImage
```

## 🖥 已验证环境

- macOS 14（Apple Silicon / Intel）
- Windows 11
- Ubuntu 22.04

## 🗺 路线图

- [ ] 模型间对话演出
- [ ] 情感参数系统
- [ ] GPU 使用率显示（nvidia-smi / Metal）
- [ ] 系统托盘常驻
- [ ] 音效支持

## 📄 许可证

MIT

---

# 🇺🇸 English

An Electron desktop app that visualizes the status of Ollama local LLMs as **pixel art characters** in real time.  
Each model introduces itself and its answer is used to automatically generate a unique avatar.

## 📸 Features

- **Self-introduction avatar generation** — Each model is asked to describe its own character; the answer is rendered as pixel art
- **Real-time status monitoring** — CPU, memory, and running state visualized through character animations
- **Avatar persistence** — Generated profiles are saved to `~/local-model-avatar/avatar-profiles.json`
- **Full / individual regeneration** — Regenerate via button or right-click context menu
- **Wandering system** — Characters walk around the floor randomly
- **Trilingual UI** — Switch between Japanese / Chinese / English inside the app

## 🎮 Character States

| State | Animation | Trigger |
|-------|-----------|---------|
| `idle`    | Napping on sofa (Zzz) | Standby |
| `busy`    | Typing at desk | High CPU · inference running |
| `loading` | Reading a book | Model loading |
| `error`   | Head in hands | Connection error · anomaly |

## 🚀 Getting Started

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 18 or later |
| npm     | 9 or later  |
| Ollama  | Optional (demo mode works without it) |

### Install & Run

```bash
# Install dependencies
npm install

# Start normally
npm start

# Development mode (with DevTools)
npm run dev
```

### Connecting to Ollama

```bash
# Start Ollama in another terminal
ollama serve

# Pull models (examples)
ollama pull llama3.2
ollama pull mistral
ollama pull phi3
```

The app connects automatically to `http://localhost:11434`. If Ollama is not running, it falls back to **demo mode**.

## 🎨 How Avatar Generation Works

On first launch, or when a new model is detected, the app sends each model the following question:

> "Please describe your pixel art character appearance as JSON: hair color, clothing color, body type, accessory, etc."

The model's JSON response is parsed and drawn to the canvas.

```json
{
  "skinTone":      "#FFCBA4",
  "hairColor":     "#3322bb",
  "primaryColor":  "#CC2277",
  "accentColor":   "#FF88CC",
  "eyeColor":      "#1a1a2a",
  "bodyType":      "tall",
  "accessory":     "scarf",
  "personality":   "mysterious",
  "nameLabel":     "MST",
  "selfDescription": "フランスの優雅さを持つ、謎めいたアシスタント"
}
```

If the model does not respond, a fallback profile is generated deterministically from the model name's hash.

### Timeout (scales with model size)

| Model size | Timeout |
|-----------|---------|
| ~3 GB | 90 sec |
| 7B (~4 GB) | 110 sec |
| 13B (~8 GB) | 190 sec |
| 70B (~40 GB) | up to 600 sec |

## 💾 Avatar Save Location

```
macOS / Linux : ~/local-model-avatar/avatar-profiles.json
Windows       : %USERPROFILE%\local-model-avatar\avatar-profiles.json
```

## 🏗 Architecture

```
ollama-electron/
 ├── main/index.js       Ollama API polling · WebSocket · IPC · file persistence
 ├── preload/index.js    Context Bridge (secure IPC exposure)
 └── renderer/
     ├── index.html      UI layout · language switcher
     ├── style.css       Themes · animations
     └── app.js          i18n dictionary · Canvas rendering · wander system · state management
```

### Data Flow

```
Ollama API (/api/tags, /api/ps)
    ↓ every 3 sec
Main Process (state processing · IPC push)
    ↓                             ↓
Renderer (Canvas drawing)     WebSocket (for external tools)
    ↓
requestAnimationFrame loop (wandering + character rendering)
```

## ⚙️ Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `OLLAMA_HOST` | `http://localhost:11434` | Ollama API URL |

```bash
OLLAMA_HOST=http://192.168.1.10:11434 npm start
```

## 📦 Distribution Build

```bash
npm install --save-dev electron-builder
npx electron-builder --mac    # DMG
npx electron-builder --win    # NSIS installer
npx electron-builder --linux  # AppImage
```

## 🖥 Tested Environments

- macOS 14 (Apple Silicon / Intel)
- Windows 11
- Ubuntu 22.04

## 🗺 Roadmap

- [ ] Model-to-model conversation animation
- [ ] Emotion parameter system
- [ ] GPU usage display (nvidia-smi / Metal)
- [ ] System tray support
- [ ] Sound effects

## 📄 License

MIT
