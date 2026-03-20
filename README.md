# ⚡ Ollama Desktop (Electron版)

OllamaローカルLLMの稼働状況を**ドット絵キャラクター**でリアルタイム可視化する  
Electronデスクトップアプリです。

**初回起動時に Anthropic API でモデルごとの個性を自動生成し、差別化されたアバターを描画します。**

---

## 🚀 セットアップ

### 前提条件
| ツール | バージョン |
|--------|-----------|
| Node.js | 18 以上 |
| npm     | 9 以上   |
| Ollama  | 任意（なくてもデモ動作） |

### インストール & 起動

```bash
npm install
npm start        # 通常起動
npm run dev      # DevTools付き
```

### Ollamaを使う場合

```bash
ollama serve     # 別ターミナルで起動
ollama pull llama3.2
ollama pull mistral
```

---

## 🎨 AIアバター自動生成

初回起動時（またはモデルが新たに追加されたとき）、Anthropic API を使って  
**各モデルの個性・カラースキーム・アクセサリー**を自動生成します。

| モデル | 生成される個性の例 |
|--------|-----------------|
| llama3.2 | 茶色系・丸みのある体型・アースカラー |
| mistral  | パープル系・長身・マフラー付き |
| phi3     | ブルー系・眼鏡・インテリ風 |
| gemma2   | Googleカラー・ヘッドバンド・元気系 |
| qwen     | 赤金系・帽子・学者風 |
| deepseek | ダークシアン・ミステリアス |

### 生成される個性パラメータ

```json
{
  "skinTone":    "#FFCBA4",   // 肌の色
  "hairColor":   "#4a3728",   // 髪の色
  "primaryColor":"#2266CC",   // 服のメインカラー
  "accentColor": "#44AAFF",   // アクセント・ライン色
  "eyeColor":    "#1a1a2a",   // 目の色
  "bodyType":    "normal",    // normal / tall / round
  "accessory":   "glasses",   // none / glasses / hat / scarf / headband
  "personality": "intellectual", // calm / energetic / intellectual / mysterious
  "nameLabel":   "Φ3"         // 頭上に表示するバッジ
}
```

**APIなしでも動作します** — APIが使えない場合、モデル名から決定論的にプロファイルを生成するフォールバックが動きます。

---

## 🎮 キャラクター状態

| 状態 | 動作 |
|------|------|
| `idle`    | ソファでZzz（個性カラーのソファ） |
| `busy`    | タイピング（モニター画面もアクセントカラー） |
| `loading` | 本を読む（本の色も個性で変化） |
| `error`   | 頭を抱える |

---

## 🏗 アーキテクチャ

```
main/index.js        Ollama API polling + WebSocket + IPC
preload/index.js     Context Bridge
renderer/
  index.html         UI layout + scan overlay
  style.css          Themes + animations
  app.js
    ├─ generateAvatarProfile()   Anthropic API → JSON個性
    ├─ deterministicProfile()    APIなし時フォールバック
    ├─ drawCharacter()           Canvas API ドット絵
    ├─ scanAndGenerateProfiles() 初回スキャン + progress表示
    └─ renderLoop()              requestAnimationFrame
```

---

## ⚙️ 環境変数

```bash
OLLAMA_HOST=http://192.168.1.10:11434 npm start
```

---

## 📦 ビルド

```bash
npm install --save-dev electron-builder
npx electron-builder --mac    # DMG
npx electron-builder --win    # NSIS
npx electron-builder --linux  # AppImage
```

---

## 📄 ライセンス

MIT

OllamaローカルLLMの稼働状況を**ドット絵キャラクター**でリアルタイム可視化する  
Electronデスクトップアプリです。

---

## 🚀 セットアップ

### 前提条件
| ツール | バージョン |
|--------|-----------|
| Node.js | 18 以上 |
| npm     | 9 以上   |
| Ollama  | 任意（なくてもデモ動作） |

### インストール & 起動

```bash
# 1. 依存パッケージをインストール
npm install

# 2. 通常起動
npm start

# 3. 開発モード（DevToolsあり）
npm run dev
```

### Ollamaを使う場合（実モデル監視）

```bash
# 別ターミナルでOllamaを起動
ollama serve

# モデルを追加
ollama pull llama3.2
ollama pull mistral
ollama pull phi3
```

アプリはOllama API (`http://localhost:11434`) に自動接続します。  
Ollamaが起動していない場合は **デモモード** で動作します。

---

## 🎮 キャラクター状態

| 状態       | キャラクターの動作      | 条件                          |
|-----------|----------------------|------------------------------|
| `idle`    | ソファでくつろぐ（Zzz） | 非実行中                      |
| `busy`    | デスクでタイピング      | CPU > 70% または推論実行中     |
| `loading` | 本を読む              | モデルロード中                  |
| `error`   | 頭を抱える（！マーク）  | 接続エラー・異常                |

---

## 🏗 アーキテクチャ

```
ollama-electron/
 ├── main/
 │   └── index.js          # Electron Main Process
 │                           ├─ BrowserWindow 管理
 │                           ├─ Ollama API ポーリング (3秒ごと)
 │                           ├─ WebSocket サーバー (port 8765)
 │                           └─ IPC ハンドラー
 │
 ├── preload/
 │   └── index.js          # Context Bridge (セキュアなIPC)
 │
 └── renderer/
     ├── index.html        # UI レイアウト
     ├── style.css         # テーマ・アニメーション
     └── app.js            # PixiJS不要Canvas描画 + 状態管理
```

### データフロー

```
Ollama API (/api/tags, /api/ps)
    ↓ 3秒ごと
Main Process (状態加工・判定)
    ↓ IPC (ipcMain → ipcRenderer)     ↓ WebSocket (port 8765)
Renderer (app.js)              外部ブラウザ / 他ツール
    ↓
Canvas API ドット絵レンダリング
    ↓
requestAnimationFrame ループ
```

---

## ⚙️ 環境変数

| 変数 | デフォルト | 説明 |
|------|-----------|------|
| `OLLAMA_HOST` | `http://localhost:11434` | Ollama API URL |

カスタム例：
```bash
OLLAMA_HOST=http://192.168.1.10:11434 npm start
```

---

## 🖥 動作確認済み環境

- macOS 14 (Apple Silicon / Intel)
- Windows 11
- Ubuntu 22.04

---

## 📦 配布用ビルド

```bash
# electron-builder をインストール
npm install --save-dev electron-builder

# Mac (DMG)
npx electron-builder --mac

# Windows (NSIS インストーラー)
npx electron-builder --win

# Linux (AppImage)
npx electron-builder --linux
```

---

## 🗺 ロードマップ

- [ ] モデル間の会話演出
- [ ] 感情パラメータシステム
- [ ] GPU使用率表示 (nvidia-smi / Metal)
- [ ] システムトレイ常駐
- [ ] 音声エフェクト
- [ ] テーマカスタマイズ

---

## 📄 ライセンス

MIT
