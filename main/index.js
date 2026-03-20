'use strict';

const { app, BrowserWindow, ipcMain } = require('electron');
const path   = require('path');
const fs     = require('fs');
const http   = require('http');
const os     = require('os');
const WebSocket = require('ws');

// ──────────────────────────────────────────────
//  CONFIG
// ──────────────────────────────────────────────
const OLLAMA_HOST      = process.env.OLLAMA_HOST || 'http://localhost:11434';
const WS_PORT          = 8765;
const POLL_INTERVAL_MS = 3000;
const IS_DEV           = process.argv.includes('--dev');

// プロファイルJSONの保存先: ~/local-model-avatar/avatar-profiles.json
// macOS/Linux: ~/local-model-avatar/avatar-profiles.json
// Windows:     %USERPROFILE%\local-model-avatar\avatar-profiles.json
function profilesFilePath() {
  return path.join(os.homedir(), 'local-model-avatar', 'avatar-profiles.json');
}

let mainWindow = null;
let wss        = null;
let pollTimer  = null;
const reqCounts = {};

// ──────────────────────────────────────────────
//  PROFILE PERSISTENCE
// ──────────────────────────────────────────────

/** 全プロファイルを読み込む。ファイルがなければ {} を返す */
function loadProfiles() {
  try {
    const fp = profilesFilePath();
    if (!fs.existsSync(fp)) return {};
    const raw = fs.readFileSync(fp, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('[Profiles] load error:', e.message);
    return {};
  }
}

/** 全プロファイルを保存する */
function saveProfiles(profiles) {
  try {
    const fp = profilesFilePath();
    fs.mkdirSync(path.dirname(fp), { recursive: true });
    fs.writeFileSync(fp, JSON.stringify(profiles, null, 2), 'utf8');
    console.log(`[Profiles] saved ${Object.keys(profiles).length} profiles → ${fp}`);
  } catch (e) {
    console.error('[Profiles] save error:', e.message);
  }
}

// ──────────────────────────────────────────────
//  OLLAMA HTTP HELPERS
// ──────────────────────────────────────────────
function ollamaGet(endpoint) {
  return new Promise((resolve, reject) => {
    const req = http.get(`${OLLAMA_HOST}${endpoint}`, { timeout: 5000 }, res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch (e) { reject(new Error('JSON parse: ' + e.message)); }
      });
    });
    req.on('error',   reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

function ollamaChat(modelName, prompt, timeoutMs = 90000) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: modelName,
      stream: true,
      options: { temperature: 0.9, num_predict: 400 },
      messages: [{ role: 'user', content: prompt }],
    });

    const url = new URL(`${OLLAMA_HOST}/api/chat`);
    const options = {
      hostname: url.hostname,
      port:     url.port || 11434,
      path:     '/api/chat',
      method:   'POST',
      headers: {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
      timeout: timeoutMs,
    };

    let fullText = '';
    const req = http.request(options, res => {
      res.setEncoding('utf8');
      res.on('data', chunk => {
        chunk.split('\n').forEach(line => {
          if (!line.trim()) return;
          try {
            const obj = JSON.parse(line);
            if (obj.message?.content) fullText += obj.message.content;
          } catch (_) {}
        });
      });
      res.on('end',   () => resolve(fullText.trim()));
      res.on('error', reject);
    });
    req.on('error',   reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('chat timeout')); });
    req.write(body);
    req.end();
  });
}

// ──────────────────────────────────────────────
//  SELF-IMAGE INTERVIEW
// ──────────────────────────────────────────────
const INTERVIEW_PROMPT = `You are being asked to describe your own personality and appearance as a pixel art character.
Answer ONLY with a valid JSON object. No explanation, no markdown, no code block.

Describe yourself honestly based on your actual characteristics, training data, and identity.
Be creative and make your character unique and recognizable:

{
  "skinTone": "#hex (your character's skin color, can be fantasy colors too)",
  "hairColor": "#hex (reflects your identity/origin)",
  "primaryColor": "#hex (main clothing color that represents you)",
  "accentColor": "#hex (trim or detail color, clearly contrasting with primaryColor)",
  "eyeColor": "#hex",
  "bodyType": "normal or tall or round",
  "accessory": "none or glasses or hat or scarf or headband",
  "personality": "calm or energetic or intellectual or mysterious",
  "nameLabel": "2-4 chars, a symbol or abbreviation that represents you best",
  "selfDescription": "one sentence about your personality in Japanese"
}`;

/**
 * モデルのサイズ(GB)に応じてタイムアウトを動的計算する
 * 基準: 3B以下 → 90秒, 以降 1GBごとに +20秒, 上限 600秒(10分)
 */
function calcTimeout(sizeGB) {
  const base  = 90_000;                          // 90秒（小モデル基準）
  const extra = Math.max(0, (sizeGB - 3)) * 20_000; // 3GB超は1GBごとに+20秒
  return Math.min(base + extra, 600_000);        // 上限10分
}

async function interviewModel(modelName, sizeGB = 3) {
  const timeoutMs = calcTimeout(sizeGB);
  console.log(`[Interview] Starting: ${modelName} (${sizeGB}GB, timeout=${timeoutMs/1000}s)`);
  const raw = await ollamaChat(modelName, INTERVIEW_PROMPT, timeoutMs);
  console.log(`[Interview] Raw (${modelName}):`, raw.substring(0, 300));

  const match = raw.match(/\{[\s\S]*?\}/);
  if (!match) throw new Error('No JSON in response');

  const p = JSON.parse(match[0]);
  return {
    skinTone:        p.skinTone        || '#FFCBA4',
    hairColor:       p.hairColor       || '#4a3728',
    primaryColor:    p.primaryColor    || '#2266CC',
    accentColor:     p.accentColor     || '#44AAFF',
    eyeColor:        p.eyeColor        || '#1a1a2a',
    bodyType:        ['normal','tall','round'].includes(p.bodyType) ? p.bodyType : 'normal',
    accessory:       ['none','glasses','hat','scarf','headband'].includes(p.accessory) ? p.accessory : 'none',
    personality:     ['calm','energetic','intellectual','mysterious'].includes(p.personality) ? p.personality : 'calm',
    nameLabel:       (p.nameLabel || modelName.split(':')[0].substring(0,3)).substring(0,4),
    selfDescription: p.selfDescription || '',
    generatedAt:     new Date().toISOString(),
    generatedBy:     modelName,
  };
}

// ──────────────────────────────────────────────
//  SYSTEM METRICS
// ──────────────────────────────────────────────
let _prevCpu = null;

function getCpuPercent() {
  const cpus   = os.cpus();
  const totals = cpus.reduce((acc, c) => {
    const t = Object.values(c.times).reduce((s, v) => s + v, 0);
    return { idle: acc.idle + c.times.idle, total: acc.total + t };
  }, { idle: 0, total: 0 });

  if (!_prevCpu) { _prevCpu = totals; return 0; }
  const dIdle  = totals.idle  - _prevCpu.idle;
  const dTotal = totals.total - _prevCpu.total;
  _prevCpu = totals;
  return dTotal === 0 ? 0 : Math.round((1 - dIdle / dTotal) * 100);
}

function getMemMB() {
  return Math.round((os.totalmem() - os.freemem()) / 1024 / 1024);
}

// ──────────────────────────────────────────────
//  STATE COLLECTION
// ──────────────────────────────────────────────
async function collectState() {
  let models = [], runningModels = [], ollamaAvailable = false;

  try {
    const res = await ollamaGet('/api/tags');
    models = res.models || [];
    ollamaAvailable = true;
  } catch (_) {
    models = [
      { name: 'llama3.2:latest', size: 2_100_000_000 },
      { name: 'mistral:latest',  size: 4_100_000_000 },
      { name: 'phi3:latest',     size: 2_300_000_000 },
    ];
  }

  if (ollamaAvailable) {
    try { const r = await ollamaGet('/api/ps'); runningModels = r.models || []; } catch (_) {}
  }

  const cpuUsage   = getCpuPercent();
  const memUsageMB = getMemMB();
  const now        = Date.now();

  const modelStates = models.map((m, i) => {
    const running = runningModels.find(r => r.name === m.name);
    if (!reqCounts[m.name]) reqCounts[m.name] = 0;

    let status = 'idle';
    if (ollamaAvailable) {
      if (!running) status = 'idle';
      else if (cpuUsage > 70) status = 'busy';
      else status = 'loading';
    } else {
      const s = ['idle','idle','busy','loading'];
      status = s[Math.abs(Math.floor(Math.sin(now/8000+i*2.1)*100)) % s.length];
    }

    return {
      id:           `model-${i}`,
      name:         m.name,
      status,
      cpuUsage:     Math.max(0, Math.min(100, ollamaAvailable
        ? cpuUsage + Math.round(Math.random()*10-5)
        : Math.round(20+Math.random()*55))),
      memoryGB:     Math.round(m.size/1024/1024/1024*10)/10,
      requestPerMin:reqCounts[m.name] + Math.floor(Math.random()*5),
      sizeGB:       Math.round(m.size/1024/1024/1024*10)/10,
    };
  });

  return {
    ollamaAvailable, models: modelStates, timestamp: now,
    systemMetrics: {
      cpuUsage, memUsageMB,
      totalMemMB: Math.round(os.totalmem()/1024/1024),
      platform: os.platform(),
      hostname: os.hostname(),
    },
  };
}

// ──────────────────────────────────────────────
//  WEBSOCKET
// ──────────────────────────────────────────────
function startWsServer() {
  wss = new WebSocket.Server({ port: WS_PORT }, () => {
    console.log(`[WS] ws://localhost:${WS_PORT}`);
  });
  wss.on('connection', async ws => {
    try { ws.send(JSON.stringify(await collectState())); } catch (_) {}
    ws.on('error', e => console.error('[WS] client error', e.message));
  });
  wss.on('error', e => console.error('[WS] server error', e.message));
}

function broadcast(data) {
  if (!wss) return;
  const p = JSON.stringify(data);
  wss.clients.forEach(c => { if (c.readyState === WebSocket.OPEN) c.send(p); });
}

// ──────────────────────────────────────────────
//  POLLING
// ──────────────────────────────────────────────
async function startPolling() {
  pollTimer = setInterval(async () => {
    try {
      const state = await collectState();
      broadcast(state);
      if (mainWindow && !mainWindow.isDestroyed())
        mainWindow.webContents.send('state-update', state);
    } catch (e) { console.error('[Poll]', e.message); }
  }, POLL_INTERVAL_MS);
}

// ──────────────────────────────────────────────
//  WINDOW
// ──────────────────────────────────────────────
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280, height: 820, minWidth: 900, minHeight: 600,
    backgroundColor: '#0d0d1a',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    frame: process.platform !== 'darwin',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (IS_DEV) mainWindow.webContents.openDevTools({ mode: 'detach' });
  });
  mainWindow.on('closed', () => { mainWindow = null; });
  mainWindow.on('close', e => {
    if (process.platform === 'darwin' && !app.isQuiting) {
      e.preventDefault(); mainWindow.hide();
    }
  });
}

// ──────────────────────────────────────────────
//  IPC HANDLERS
// ──────────────────────────────────────────────
ipcMain.handle('get-initial-state', async () => collectState());
ipcMain.handle('get-app-version',   () => app.getVersion());
ipcMain.handle('get-platform',      () => process.platform);
ipcMain.handle('get-profiles-path', () => profilesFilePath());

// ── プロファイル 読み込み ──────────────────────
ipcMain.handle('load-profiles', () => {
  const profiles = loadProfiles();
  console.log(`[Profiles] loaded ${Object.keys(profiles).length} entries`);
  return profiles;
});

// ── プロファイル 保存（差分マージ）────────────
ipcMain.handle('save-profiles', (_e, profiles) => {
  // 既存ファイルとマージして保存（他で変更された分を消さない）
  const existing = loadProfiles();
  const merged   = { ...existing, ...profiles };
  saveProfiles(merged);
  return { ok: true, count: Object.keys(merged).length };
});

// ── プロファイル 1件削除（再生成のため）────────
ipcMain.handle('delete-profile', (_e, modelName) => {
  const profiles = loadProfiles();
  delete profiles[modelName];
  saveProfiles(profiles);
  console.log(`[Profiles] deleted: ${modelName}`);
  return { ok: true };
});

// ── プロファイル 全件削除 ──────────────────────
ipcMain.handle('delete-all-profiles', () => {
  saveProfiles({});
  console.log('[Profiles] all deleted');
  return { ok: true };
});

// ── モデルインタビュー ─────────────────────────
ipcMain.handle('interview-model', async (_e, modelName, sizeGB) => {
  try {
    const profile = await interviewModel(modelName, sizeGB || 3);
    // 即座にファイルにも書き込む（レンダラーのsave-profilesと二重保存になるが安全側）
    const profiles = loadProfiles();
    profiles[modelName] = profile;
    saveProfiles(profiles);
    return { ok: true, profile };
  } catch (e) {
    console.error(`[Interview] Failed: ${modelName}`, e.message);
    return { ok: false, error: e.message };
  }
});

// ──────────────────────────────────────────────
//  APP LIFECYCLE
// ──────────────────────────────────────────────
app.whenReady().then(async () => {
  startWsServer();
  await startPolling();
  createWindow();
  app.on('activate', () => {
    if (!mainWindow) createWindow(); else mainWindow.show();
  });
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('before-quit', () => {
  app.isQuiting = true;
  if (pollTimer) clearInterval(pollTimer);
  if (wss)       wss.close();
});
