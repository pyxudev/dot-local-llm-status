/* ════════════════════════════════════════════════
   OLLAMA DESKTOP — app.js
   日本語 / 中文 / English  三言語対応
   ════════════════════════════════════════════════ */
'use strict';

// ──────────────────────────────────────────────
//  I18N  国際化辞書
// ──────────────────────────────────────────────
const LANGS = {
  ja: {
    // サイドバー
    system:      'SYSTEM',
    models:      'モデル数',
    active:      '稼働中',
    memory:      'メモリ',
    modelsLabel: 'MODELS',
    regenAll:    '全再生成',
    regenAllTitle:'全モデルのアバターを再生成',
    info:        'INFO',
    platform:    'Platform',
    updated:     '更新',
    uptime:      '稼働時間',
    cache:       'キャッシュ',
    // オーバーレイ
    connecting:       'Ollamaに接続中...',
    connectSub:       'ollama serve が起動しているか確認してください',
    interviewTitle:   '💬 自己紹介タイム',
    // コンテキストメニュー
    ctxRegen:    'このアバターを再生成',
    ctxDelete:   'キャッシュを削除',
    generatedAt: '生成日時',
    notYet:      'まだ生成されていません',
    // ログメッセージ
    startup:          'Ollama Desktop 起動中...',
    ipcConnected:     'Electron IPC に接続しました',
    ollamaConnected:  (n, c) => `✓ Ollama 接続 (${n}モデル) — キャッシュ: ${c}件`,
    ollamaDemo:       '⚠ Ollama 未接続 — デモモードで動作中',
    initFailed:       '初期状態の取得に失敗: ',
    noElectron:       'Electron 環境外 — WebSocket を試みます',
    wsConnected:      'WebSocket 接続',
    wsDisconnected:   'WebSocket 切断 — 5秒後に再接続',
    demoMode:         'デモモードで動作中',
    cacheLoaded:      (n) => `💾 ${n}件のアバターをキャッシュから読み込みました`,
    cacheLoadErr:     'プロファイル読み込みエラー: ',
    cacheDeleted:     (n) => `🗑 [${n}] キャッシュを削除しました`,
    cacheAllDeleted:  '🗑 全アバターキャッシュを削除しました',
    interviewing:     (n) => `💬 [${n}] 自己紹介をお願いしています...`,
    interviewDone:    (n, d) => `✨ [${n}] 「${d}」`,
    interviewFailed:  (n) => `⚠ [${n}] 応答なし → フォールバック適用`,
    scanStart:        (n, r) => `🔍 ${n}体にインタビュー${r ? '（再生成）' : ''}開始`,
    scanProgress:     (n, i, t) => `「${n}」に自己紹介を依頼中 (${i}/${t})`,
    scanDone:         '✓ 全員の自己紹介が完了しました！',
    scanDoneLog:      (n) => `✅ アバター生成完了 (${n}体)`,
    regenOne:         (n) => `🔄 [${n}] 再生成します`,
    regenAllConfirm:  '全モデルのアバターを再生成しますか？\n（キャッシュが削除されます）',
    statusIdle:       ['休憩中...', 'スタンバイ'],
    statusBusy:       ['フル稼働！', '処理中！'],
    statusLoading:    ['読込中', '準備中...'],
    statusError:      ['エラー！', '異常検知'],
    // ツールチップ
    ttCpu:    'CPU',
    ttVram:   'VRAM',
    ttRpm:    'RPM',
    ttStatus: 'STATUS',
  },

  zh: {
    system:      'SYSTEM',
    models:      '模型数',
    active:      '运行中',
    memory:      '内存',
    modelsLabel: 'MODELS',
    regenAll:    '全部重生',
    regenAllTitle:'重新生成所有模型的头像',
    info:        'INFO',
    platform:    '平台',
    updated:     '更新时间',
    uptime:      '运行时长',
    cache:       '缓存',
    connecting:       '正在连接 Ollama...',
    connectSub:       '请确认 ollama serve 已启动',
    interviewTitle:   '💬 自我介绍时间',
    ctxRegen:    '重新生成此头像',
    ctxDelete:   '删除缓存',
    generatedAt: '生成时间',
    notYet:      '尚未生成',
    startup:          'Ollama Desktop 启动中...',
    ipcConnected:     '已连接 Electron IPC',
    ollamaConnected:  (n, c) => `✓ Ollama 已连接 (${n} 个模型) — 缓存: ${c} 条`,
    ollamaDemo:       '⚠ Ollama 未连接 — 演示模式运行中',
    initFailed:       '获取初始状态失败: ',
    noElectron:       '非 Electron 环境 — 尝试 WebSocket',
    wsConnected:      'WebSocket 已连接',
    wsDisconnected:   'WebSocket 断开 — 5秒后重连',
    demoMode:         '演示模式运行中',
    cacheLoaded:      (n) => `💾 已从缓存加载 ${n} 条头像数据`,
    cacheLoadErr:     '读取缓存错误: ',
    cacheDeleted:     (n) => `🗑 [${n}] 缓存已删除`,
    cacheAllDeleted:  '🗑 已删除所有头像缓存',
    interviewing:     (n) => `💬 [${n}] 正在请求自我介绍...`,
    interviewDone:    (n, d) => `✨ [${n}] 「${d}」`,
    interviewFailed:  (n) => `⚠ [${n}] 无响应 → 使用默认头像`,
    scanStart:        (n, r) => `🔍 开始对 ${n} 个模型进行采访${r ? '（重新生成）' : ''}`,
    scanProgress:     (n, i, t) => `正在请求「${n}」自我介绍 (${i}/${t})`,
    scanDone:         '✓ 所有模型自我介绍完成！',
    scanDoneLog:      (n) => `✅ 头像生成完毕 (${n} 个)`,
    regenOne:         (n) => `🔄 [${n}] 正在重新生成`,
    regenAllConfirm:  '确定要重新生成所有模型的头像吗？\n（将删除现有缓存）',
    statusIdle:       ['休息中...', '待机中'],
    statusBusy:       ['全力运行！', '处理中！'],
    statusLoading:    ['加载中', '准备中...'],
    statusError:      ['发生错误！', '异常检测'],
    ttCpu:    'CPU',
    ttVram:   'VRAM',
    ttRpm:    'RPM',
    ttStatus: '状态',
  },

  en: {
    system:      'SYSTEM',
    models:      'Models',
    active:      'Active',
    memory:      'Memory',
    modelsLabel: 'MODELS',
    regenAll:    'Regen All',
    regenAllTitle:'Regenerate all model avatars',
    info:        'INFO',
    platform:    'Platform',
    updated:     'Updated',
    uptime:      'Uptime',
    cache:       'Cache',
    connecting:       'Connecting to Ollama...',
    connectSub:       'Please make sure ollama serve is running',
    interviewTitle:   '💬 Self-Introduction',
    ctxRegen:    'Regenerate this avatar',
    ctxDelete:   'Delete cache',
    generatedAt: 'Generated',
    notYet:      'Not generated yet',
    startup:          'Ollama Desktop starting...',
    ipcConnected:     'Connected to Electron IPC',
    ollamaConnected:  (n, c) => `✓ Ollama connected (${n} models) — Cache: ${c}`,
    ollamaDemo:       '⚠ Ollama not running — Demo mode',
    initFailed:       'Failed to get initial state: ',
    noElectron:       'Non-Electron env — trying WebSocket',
    wsConnected:      'WebSocket connected',
    wsDisconnected:   'WebSocket disconnected — reconnecting in 5s',
    demoMode:         'Running in demo mode',
    cacheLoaded:      (n) => `💾 Loaded ${n} avatar(s) from cache`,
    cacheLoadErr:     'Cache load error: ',
    cacheDeleted:     (n) => `🗑 [${n}] Cache deleted`,
    cacheAllDeleted:  '🗑 All avatar caches deleted',
    interviewing:     (n) => `💬 [${n}] Requesting self-introduction...`,
    interviewDone:    (n, d) => `✨ [${n}] "${d}"`,
    interviewFailed:  (n) => `⚠ [${n}] No response → using fallback`,
    scanStart:        (n, r) => `🔍 Interviewing ${n} model(s)${r ? ' (regen)' : ''}`,
    scanProgress:     (n, i, t) => `Asking "${n}" to introduce itself (${i}/${t})`,
    scanDone:         '✓ All introductions complete!',
    scanDoneLog:      (n) => `✅ Avatar generation complete (${n})`,
    regenOne:         (n) => `🔄 [${n}] Regenerating`,
    regenAllConfirm:  'Regenerate all model avatars?\n(Existing cache will be deleted)',
    statusIdle:       ['Resting...', 'Standby'],
    statusBusy:       ['Working hard!', 'Processing!'],
    statusLoading:    ['Loading', 'Getting ready...'],
    statusError:      ['Error!', 'Anomaly detected'],
    ttCpu:    'CPU',
    ttVram:   'VRAM',
    ttRpm:    'RPM',
    ttStatus: 'STATUS',
  },
};

// 現在の言語（localStorage で永続化）
let currentLang = localStorage.getItem('ollama-desktop-lang') || 'ja';
function t(key, ...args) {
  const dict = LANGS[currentLang] || LANGS.ja;
  const val  = dict[key] ?? LANGS.ja[key] ?? key;
  return typeof val === 'function' ? val(...args) : val;
}

/** data-i18n 属性を持つ全 DOM 要素を現在言語で更新 */
function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    el.title = t(el.getAttribute('data-i18n-title'));
  });
  // html lang 属性
  document.documentElement.lang = currentLang === 'zh' ? 'zh-Hans' : currentLang;
  // lang ボタンのアクティブ状態
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === currentLang);
  });
}

function switchLang(lang) {
  currentLang = lang;
  localStorage.setItem('ollama-desktop-lang', lang);
  applyI18n();
}

// ──────────────────────────────────────────────
//  PIXEL ART ENGINE  32×32 / 4px per dot
// ──────────────────────────────────────────────
const S=4,CW=128,CH=128,GW=CW/S,GH=CH/S;

function dpx(ctx,x,y,c){if(x<0||y<0||x>=GW||y>=GH)return;ctx.fillStyle=c;ctx.fillRect(x*S,y*S,S,S);}
function drect(ctx,x,y,w,h,c){if(w<=0||h<=0)return;ctx.fillStyle=c;const x0=Math.max(0,x)*S,y0=Math.max(0,y)*S,x1=Math.min(GW,x+w)*S,y1=Math.min(GH,y+h)*S;if(x1>x0&&y1>y0)ctx.fillRect(x0,y0,x1-x0,y1-y0);}
function dhl(ctx,x,y,w,c){drect(ctx,x,y,w,1,c);}
function dvl(ctx,x,y,h,c){drect(ctx,x,y,1,h,c);}
function shade(hex,amt){const n=parseInt((hex||'#888888').replace('#',''),16);const r=Math.max(0,Math.min(255,(n>>16)+amt)),g=Math.max(0,Math.min(255,((n>>8)&0xFF)+amt)),b=Math.max(0,Math.min(255,(n&0xFF)+amt));return`#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;}

function drawSofa(ctx,x,y,c1,c2){drect(ctx,x,y,26,5,c1);drect(ctx,x,y+5,26,4,c2);drect(ctx,x+1,y+6,24,2,shade(c2,-20));drect(ctx,x,y,3,9,c1);drect(ctx,x+23,y,3,9,c1);drect(ctx,x+2,y+9,2,2,'#111128');drect(ctx,x+22,y+9,2,2,'#111128');}
function drawDesk(ctx,x,y){drect(ctx,x,y,26,2,'#9e6a42');drect(ctx,x,y+2,26,3,'#7a4e2c');drect(ctx,x+1,y+5,3,6,'#7a4e2c');drect(ctx,x+22,y+5,3,6,'#7a4e2c');}
function drawMonitor(ctx,x,y,blink,accent){drect(ctx,x,y,13,10,'#1e1e30');drect(ctx,x+1,y+1,11,8,'#404060');drect(ctx,x+2,y+2,9,6,'#08182e');if(blink){dhl(ctx,x+3,y+3,3,accent);dhl(ctx,x+3,y+4,6,accent);dhl(ctx,x+3,y+5,2,accent);}drect(ctx,x+5,y+10,3,2,'#404060');dhl(ctx,x+3,y+12,7,'#404060');}
function drawKeyboard(ctx,x,y,frame,accent){drect(ctx,x,y,12,3,'#181828');for(let k=0;k<10;k++)dpx(ctx,x+1+k,y+1,(k+Math.floor(frame/6))%4===0?accent:'#3a3a6a');}
function drawBook(ctx,x,y,primary,accent){drect(ctx,x,y,10,8,primary);dvl(ctx,x+5,y,8,shade(primary,-30));dhl(ctx,x,y,10,accent);for(let l=1;l<7;l++){dhl(ctx,x+1,y+l,3,'#FFF0D0');dhl(ctx,x+6,y+l,3,'#FFF0D0');}}

function drawAccessory(ctx,ox,oy,type,primary,accent){
  if(type==='glasses'){drect(ctx,ox+2,oy+3,2,2,'rgba(150,220,255,0.35)');drect(ctx,ox+5,oy+3,2,2,'rgba(150,220,255,0.35)');dhl(ctx,ox+2,oy+3,2,accent);dhl(ctx,ox+5,oy+3,2,accent);dpx(ctx,ox+4,oy+3,accent);}
  else if(type==='hat'){dhl(ctx,ox+1,oy,8,primary);drect(ctx,ox+2,oy-2,6,2,primary);dhl(ctx,ox+2,oy-1,6,accent);}
  else if(type==='scarf'){drect(ctx,ox+1,oy+5,8,2,primary);dhl(ctx,ox+1,oy+5,8,accent);dvl(ctx,ox+8,oy+6,2,primary);}
  else if(type==='headband'){dhl(ctx,ox+2,oy+1,6,accent);}
}

function drawHead(ctx,ox,oy,prof,eyeType){
  const{skinTone:skin,hairColor:hair,eyeColor:eye,accentColor:accent,primaryColor:primary,accessory,bodyType}=prof;
  const wide=bodyType==='round',hw=wide?10:8,hx=wide?ox:ox+1;
  drect(ctx,hx+1,oy+1,hw-2,5,skin);dhl(ctx,hx+2,oy,hw-2,hair);dvl(ctx,hx+1,oy+1,3,hair);dvl(ctx,hx+hw-2,oy+1,3,hair);dhl(ctx,hx+3,oy+5,4,'#CC7755');
  const ex=hx+2;
  if(eyeType==='normal'){dpx(ctx,ex,oy+3,eye);dpx(ctx,ex+3,oy+3,eye);}
  else if(eyeType==='focus'){dhl(ctx,ex,oy+3,2,eye);dhl(ctx,ex+3,oy+3,2,eye);}
  else if(eyeType==='narrow'){dpx(ctx,ex,oy+3,eye);dpx(ctx,ex+2,oy+3,eye);}
  else if(eyeType==='sleep'){dhl(ctx,ex,oy+3,2,eye);dhl(ctx,ex+3,oy+3,2,eye);}
  else if(eyeType==='cross'){dpx(ctx,ex,oy+2,'#FF3333');dpx(ctx,ex+1,oy+3,'#FF3333');dpx(ctx,ex+2,oy+4,'#FF3333');dpx(ctx,ex+2,oy+2,'#FF3333');dpx(ctx,ex,oy+4,'#FF3333');dpx(ctx,ex+3,oy+2,'#FF3333');dpx(ctx,ex+4,oy+3,'#FF3333');dpx(ctx,ex+5,oy+4,'#FF3333');dpx(ctx,ex+5,oy+2,'#FF3333');dpx(ctx,ex+3,oy+4,'#FF3333');}
  drawAccessory(ctx,hx,oy,accessory,primary,accent);
}

function drawSitting(ctx,ox,oy,prof){
  const{skinTone:skin,primaryColor:shirt,accentColor:accent,bodyType}=prof;
  const rnd=bodyType==='round',bw=rnd?12:8;
  drect(ctx,ox+4,oy+6,2,2,skin);drect(ctx,ox+(rnd?0:1),oy+8,bw,6,shirt);dhl(ctx,ox+(rnd?1:2),oy+9,bw-2,accent);
  dvl(ctx,ox+(rnd?-1:0),oy+8,5,skin);dvl(ctx,ox+bw+(rnd?1:1),oy+8,5,skin);
  drect(ctx,ox+1,oy+14,bw-2,3,'#2d2d50');drect(ctx,ox+1,oy+17,3,4,'#2d2d50');drect(ctx,ox+(rnd?6:5),oy+17,3,4,'#2d2d50');
  drect(ctx,ox+(rnd?0:0),oy+20,4,2,'#111125');drect(ctx,ox+(rnd?5:4),oy+20,4,2,'#111125');
}
function drawTyping(ctx,ox,oy,prof,frame){
  const{skinTone:skin,primaryColor:shirt,accentColor:accent,bodyType}=prof;
  const tall=bodyType==='tall',ta=Math.floor(frame/6)%2,ly=oy+13+(tall?1:0);
  drect(ctx,ox+4,oy+6,2,2,skin);drect(ctx,ox+1,oy+8,8,tall?6:5,shirt);dhl(ctx,ox+2,oy+9,6,accent);
  drect(ctx,ox-1,oy+9+ta,2,4,skin);drect(ctx,ox+9,oy+9-ta,2,4,skin);
  drect(ctx,ox+1,ly,8,3,'#2d2d50');drect(ctx,ox+1,ly+3,3,4,'#2d2d50');drect(ctx,ox+6,ly+3,3,4,'#2d2d50');
  drect(ctx,ox+0,ly+6,4,2,'#111125');drect(ctx,ox+5,ly+6,4,2,'#111125');
}

function drawNameBadge(ctx,x,y,label,bg){
  if(!label)return;const bw=Math.min(label.length*4+2,14);drect(ctx,x,y,bw,4,bg);
  ctx.save();ctx.font=`${S-1}px "Press Start 2P",monospace`;ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(label.substring(0,4),(x+bw/2)*S,(y+2)*S);ctx.restore();
}

function drawIdle(ctx,prof,f){const bob=Math.sin(f*.04)>0?0:1;drawSofa(ctx,3,19,shade(prof.primaryColor,-50),shade(prof.primaryColor,-30));drawSitting(ctx,11,8-bob,prof);drawHead(ctx,11,8-bob,prof,'sleep');const zp=Math.floor(f/28)%3;if(zp>=1){dpx(ctx,23,6,prof.accentColor);dpx(ctx,24,5,prof.accentColor);dpx(ctx,25,4,prof.accentColor);}if(zp>=2){dpx(ctx,26,3,prof.accentColor);dpx(ctx,27,2,prof.accentColor);}drawNameBadge(ctx,13,3-bob,prof.nameLabel,prof.accentColor);}
function drawBusy(ctx,prof,f){drawDesk(ctx,2,18);drawMonitor(ctx,9,4,Math.floor(f/6)%2===0,prof.accentColor);drawKeyboard(ctx,7,17,f,prof.accentColor);drawTyping(ctx,11,3,prof,f);drawHead(ctx,11,3,prof,'focus');drawNameBadge(ctx,13,-1,prof.nameLabel,prof.accentColor);}
function drawLoading(ctx,prof,f){const bob=Math.floor(f/28)%2;drawSofa(ctx,3,19,shade(prof.primaryColor,-50),shade(prof.primaryColor,-30));drawBook(ctx,11,13-bob,prof.primaryColor,prof.accentColor);const ox=11,oy=8-bob,{skinTone:skin,primaryColor:shirt,accentColor:accent}=prof;drect(ctx,ox+4,oy+6,2,2,skin);drect(ctx,ox+1,oy+8,8,6,shirt);dhl(ctx,ox+2,oy+9,6,accent);dvl(ctx,ox+0,oy+8,7,skin);dvl(ctx,ox+9,oy+8,7,skin);drect(ctx,ox+1,oy+14,8,3,'#2d2d50');drect(ctx,ox+1,oy+17,3,4,'#2d2d50');drect(ctx,ox+6,oy+17,3,4,'#2d2d50');drect(ctx,ox+0,oy+20,4,2,'#111125');drect(ctx,ox+5,oy+20,4,2,'#111125');drawHead(ctx,ox,oy,prof,'narrow');drawNameBadge(ctx,13,oy-4,prof.nameLabel,prof.accentColor);}
function drawError(ctx,prof,f){const shk=(Math.floor(f/5)%3)-1;drawSofa(ctx,3+shk,19,shade(prof.primaryColor,-50),shade(prof.primaryColor,-30));const ox=11+shk,oy=7,{skinTone:skin,primaryColor:shirt,accentColor:accent}=prof;drect(ctx,ox+4,oy+6,2,2,skin);drect(ctx,ox+1,oy+8,8,6,shirt);dhl(ctx,ox+2,oy+9,6,accent);drect(ctx,ox-1,oy+2,2,7,skin);drect(ctx,ox+9,oy+2,2,7,skin);drect(ctx,ox+1,oy+14,8,3,'#2d2d50');drect(ctx,ox+1,oy+17,3,4,'#2d2d50');drect(ctx,ox+6,oy+17,3,4,'#2d2d50');drect(ctx,ox+0,oy+20,4,2,'#111125');drect(ctx,ox+5,oy+20,4,2,'#111125');drawHead(ctx,ox,oy,prof,'cross');if(Math.floor(f/12)%2===0){drect(ctx,ox+3,oy-6,4,3,'#FF2222');dpx(ctx,ox+5,oy-5,'#FFF');drect(ctx,ox+3,oy-2,4,2,'#FF2222');dpx(ctx,ox+5,oy-1,'#FFF');}drawNameBadge(ctx,ox+3,oy-9,prof.nameLabel,prof.accentColor);}

function drawInterviewing(canvas,modelName,f){
  const ctx=canvas.getContext('2d');ctx.clearRect(0,0,CW,CH);drect(ctx,1,1,30,30,'#0a0a18');drect(ctx,2,2,28,28,'#10102a');drect(ctx,4,3,24,10,'#1a2a4a');drect(ctx,5,4,22,8,'#223366');dpx(ctx,8,13,'#1a2a4a');dpx(ctx,9,14,'#1a2a4a');const dot=Math.floor(f/15)%4;for(let i=0;i<3;i++)drect(ctx,11+i*4,7,2,2,i<dot?'#00e5ff':'#223366');drect(ctx,10,16,12,5,'#1a1a30');drect(ctx,12,12,8,4,'#1a1a30');dpx(ctx,13,11,'#1a1a30');dpx(ctx,18,11,'#1a1a30');dhl(ctx,14,11,4,'#1a1a30');if(Math.floor(f/20)%2===0){drect(ctx,22,12,4,5,'#ffd600');dpx(ctx,23,13,'#0a0a18');dpx(ctx,24,13,'#0a0a18');dpx(ctx,25,14,'#0a0a18');dpx(ctx,23,15,'#0a0a18');dpx(ctx,24,15,'#0a0a18');dpx(ctx,24,16,'#0a0a18');}ctx.save();ctx.font=`${S-1}px monospace`;ctx.fillStyle='#6080b0';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(modelName.split(':')[0].substring(0,9),16*S,27*S);ctx.restore();
}

function drawCharacter(canvas,status,profile,f){
  const ctx=canvas.getContext('2d');ctx.clearRect(0,0,CW,CH);const prof=profile||DEFAULT_PROFILE;
  if(status==='idle')         drawIdle(ctx,prof,f);
  else if(status==='busy')    drawBusy(ctx,prof,f);
  else if(status==='loading') drawLoading(ctx,prof,f);
  else if(status==='error')   drawError(ctx,prof,f);
}

// ──────────────────────────────────────────────
//  PROFILE STORE
// ──────────────────────────────────────────────
const DEFAULT_PROFILE={skinTone:'#FFCBA4',hairColor:'#4a3728',primaryColor:'#2266CC',accentColor:'#44AAFF',eyeColor:'#1a1a2a',bodyType:'normal',accessory:'none',personality:'calm',nameLabel:'???',selfDescription:''};
const avatarProfiles={};

async function loadProfilesFromDisk(){
  if(typeof window.electronAPI==='undefined')return;
  try{const saved=await window.electronAPI.loadProfiles();Object.assign(avatarProfiles,saved);const count=Object.keys(saved).length;if(count>0)log(t('cacheLoaded',count));}catch(e){log(t('cacheLoadErr')+e.message);}
}
async function saveProfileToDisk(modelName,profile){
  if(typeof window.electronAPI==='undefined')return;
  try{await window.electronAPI.saveProfiles({[modelName]:profile});}catch(e){console.error('save profile error:',e);}
}
async function deleteProfileFromDisk(modelName){
  delete avatarProfiles[modelName];
  if(typeof window.electronAPI==='undefined')return;
  try{await window.electronAPI.deleteProfile(modelName);log(t('cacheDeleted',modelName.split(':')[0]));}catch(e){console.error('delete profile error:',e);}
}
async function deleteAllProfilesFromDisk(){
  Object.keys(avatarProfiles).forEach(k=>delete avatarProfiles[k]);
  if(typeof window.electronAPI==='undefined')return;
  try{await window.electronAPI.deleteAllProfiles();log(t('cacheAllDeleted'));}catch(e){console.error('delete all profiles error:',e);}
}

function sanitizeProfile(p){
  return{skinTone:p.skinTone||DEFAULT_PROFILE.skinTone,hairColor:p.hairColor||DEFAULT_PROFILE.hairColor,primaryColor:p.primaryColor||DEFAULT_PROFILE.primaryColor,accentColor:p.accentColor||DEFAULT_PROFILE.accentColor,eyeColor:p.eyeColor||DEFAULT_PROFILE.eyeColor,bodyType:['normal','tall','round'].includes(p.bodyType)?p.bodyType:'normal',accessory:['none','glasses','hat','scarf','headband'].includes(p.accessory)?p.accessory:'none',personality:['calm','energetic','intellectual','mysterious'].includes(p.personality)?p.personality:'calm',nameLabel:(p.nameLabel||'???').substring(0,4),selfDescription:p.selfDescription||'',generatedAt:p.generatedAt||new Date().toISOString(),generatedBy:p.generatedBy||''};
}
function fallbackProfile(modelName){
  let hash=0;for(const ch of modelName)hash=(hash*31+ch.charCodeAt(0))&0xFFFFFF;
  const h1=((hash>>16)&0xFF).toString(16).padStart(2,'0'),h2=((hash>>8)&0xFF).toString(16).padStart(2,'0'),h3=(hash&0xFF).toString(16).padStart(2,'0');
  return{...DEFAULT_PROFILE,hairColor:`#${h1}${h2}${h3}`,primaryColor:`#${h2}${h3}${h1}`,accentColor:`#${h3}${h1}${h2}`,nameLabel:modelName.split(':')[0].substring(0,3).toUpperCase(),generatedAt:new Date().toISOString()};
}

// ──────────────────────────────────────────────
//  INTERVIEW ENGINE
// ──────────────────────────────────────────────
let interviewing=new Set(),scanRunning=false;

const SELF_IMAGE_PROMPT=`You are being asked to describe your own personality and appearance as a pixel art character.
Answer ONLY with a valid JSON object. No explanation, no markdown, no code block.

Describe yourself honestly based on your actual characteristics, training data, and identity. Be creative and unique:

{
  "skinTone": "#hex",
  "hairColor": "#hex",
  "primaryColor": "#hex (main clothing)",
  "accentColor": "#hex (contrasting trim)",
  "eyeColor": "#hex",
  "bodyType": "normal or tall or round",
  "accessory": "none or glasses or hat or scarf or headband",
  "personality": "calm or energetic or intellectual or mysterious",
  "nameLabel": "2-4 chars symbol/abbreviation",
  "selfDescription": "one sentence in Japanese"
}`;

async function interviewOneModel(model){
  if(interviewing.has(model.id))return;
  interviewing.add(model.id);renderSidebar();
  log(t('interviewing',model.name.split(':')[0]));
  try{
    let profile=null;
    if(typeof window.electronAPI!=='undefined'){
      const result=await window.electronAPI.interviewModel(model.name,model.sizeGB||model.memoryGB||3);
      if(result.ok&&result.profile)profile=sanitizeProfile(result.profile);
    }else{
      const resp=await fetch('http://localhost:11434/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:model.name,stream:false,options:{temperature:0.9,num_predict:400},messages:[{role:'user',content:SELF_IMAGE_PROMPT}]})});
      const data=await resp.json();const raw=data.message?.content||'';const m=raw.match(/\{[\s\S]*?\}/);
      if(m)profile=sanitizeProfile(JSON.parse(m[0]));
    }
    if(profile){
      avatarProfiles[model.name]=profile;
      await saveProfileToDisk(model.name,profile);
      log(t('interviewDone',model.name.split(':')[0],profile.selfDescription||profile.personality));
    }else throw new Error('no profile');
  }catch(e){
    avatarProfiles[model.name]=fallbackProfile(model.name);
    await saveProfileToDisk(model.name,avatarProfiles[model.name]);
    log(t('interviewFailed',model.name.split(':')[0]));
  }finally{
    interviewing.delete(model.id);renderSidebar();
    updateSlotData(appState.models.find(m=>m.id===model.id)||model);
  }
}

async function scanModels(models,forceRegen=false){
  if(scanRunning)return;
  const targets=forceRegen?models:models.filter(m=>!avatarProfiles[m.name]&&!interviewing.has(m.id));
  if(targets.length===0)return;
  scanRunning=true;
  const overlay=$id('scan-overlay'),bar=$id('scan-bar'),sub=$id('scan-sub');
  if(overlay)overlay.classList.remove('hidden');
  log(t('scanStart',targets.length,forceRegen));
  if(forceRegen)await deleteAllProfilesFromDisk();
  for(let i=0;i<targets.length;i++){
    const m=targets[i];
    if(sub)sub.textContent=t('scanProgress',m.name.split(':')[0],i+1,targets.length);
    if(bar)bar.style.width=`${Math.round((i/targets.length)*100)}%`;
    await interviewOneModel(m);
    if(bar)bar.style.width=`${Math.round(((i+1)/targets.length)*100)}%`;
  }
  if(sub)sub.textContent=t('scanDone');
  if(bar)bar.style.width='100%';
  setTimeout(()=>{if(overlay)overlay.classList.add('hidden');scanRunning=false;log(t('scanDoneLog',targets.length));renderSidebar();},1000);
}

async function regenOne(model){
  if(interviewing.has(model.id))return;
  log(t('regenOne',model.name.split(':')[0]));
  await deleteProfileFromDisk(model.name);
  await interviewOneModel(model);
}

// ──────────────────────────────────────────────
//  APP STATE
// ──────────────────────────────────────────────
let appState={models:[],ollamaAvailable:false,systemMetrics:{}};
let selectedId=null,frames={},startTime=Date.now(),rafRunning=false,prevStatuses={},cleanupIpc=null,ctxTarget=null;

// ── WANDER SYSTEM ──────────────────────────────
const wanderState={};
const CHAR_W=148,CHAR_H=160,FLOOR_H=110,SPEED_MIN=0.18,SPEED_MAX=0.55;

function getSceneBounds(){const scene=document.getElementById('office-scene');if(!scene)return{w:800,floorY:400};const r=scene.getBoundingClientRect();return{w:r.width,floorY:r.height-FLOOR_H};}

function initWander(modelId,sceneW){
  const margin=CHAR_W/2,x=margin+Math.random()*Math.max(0,sceneW-CHAR_W),vx=(Math.random()<.5?1:-1)*(SPEED_MIN+Math.random()*(SPEED_MAX-SPEED_MIN));
  wanderState[modelId]={x,vx,pauseUntil:0};
}

function tickWander(now){
  const{w}=getSceneBounds(),margin=CHAR_W/2,xMin=margin,xMax=w-margin;
  Object.entries(wanderState).forEach(([id,ws])=>{
    if(now<ws.pauseUntil)return;
    ws.x+=ws.vx;
    if(ws.x<=xMin){ws.x=xMin;ws.vx=SPEED_MIN+Math.random()*(SPEED_MAX-SPEED_MIN);if(Math.random()<.3)ws.pauseUntil=now+1000+Math.random()*3000;}
    else if(ws.x>=xMax){ws.x=xMax;ws.vx=-(SPEED_MIN+Math.random()*(SPEED_MAX-SPEED_MIN));if(Math.random()<.3)ws.pauseUntil=now+1000+Math.random()*3000;}
    if(Math.random()<.008){ws.vx=-ws.vx*(0.8+Math.random()*.4);ws.vx=Math.max(SPEED_MIN,Math.min(SPEED_MAX,Math.abs(ws.vx)))*Math.sign(ws.vx);if(Math.random()<.3)ws.pauseUntil=now+500+Math.random()*2500;}
    const slot=document.getElementById(`slot-${id}`);
    if(slot){const{floorY}=getSceneBounds();slot.style.left=`${ws.x-CHAR_W/2}px`;slot.style.top=`${floorY-CHAR_H+FLOOR_H}px`;const flip=document.getElementById(`flip-${id}`);const pause=now<ws.pauseUntil;if(flip)flip.style.transform=(!pause&&ws.vx<0)?'scaleX(-1)':'scaleX(1)';}
  });
}

function syncWanderModels(models){
  const{w}=getSceneBounds();models.forEach(m=>{if(!wanderState[m.id])initWander(m.id,w);});
  const ids=new Set(models.map(m=>m.id));Object.keys(wanderState).forEach(id=>{if(!ids.has(id))delete wanderState[id];});
}

// ── DEMO DATA ──────────────────────────────────
const DEMO_MODELS=[{id:'dm0',name:'llama3.2:latest',sizeGB:2.1},{id:'dm1',name:'mistral:latest',sizeGB:4.1},{id:'dm2',name:'phi3:latest',sizeGB:2.3},{id:'dm3',name:'gemma2:latest',sizeGB:5.4}];
let demoStatuses=['idle','busy','loading','idle'];
function genDemoState(){if(Math.random()<.14){const i=Math.floor(Math.random()*DEMO_MODELS.length);const s=['idle','busy','loading','error'];demoStatuses[i]=s[Math.floor(Math.random()*s.length)];}return{ollamaAvailable:false,timestamp:Date.now(),models:DEMO_MODELS.map((m,i)=>({...m,status:demoStatuses[i],cpuUsage:Math.round(20+Math.random()*55),memoryGB:m.sizeGB,requestPerMin:Math.floor(Math.random()*14)})),systemMetrics:{cpuUsage:20,memUsageMB:8000,totalMemMB:16384,platform:'demo',hostname:'localhost'}};}

// ──────────────────────────────────────────────
//  DOM HELPERS
// ──────────────────────────────────────────────
function $id(id){return document.getElementById(id);}
function log(msg){const bar=$id('log-scroll'),el=document.createElement('div');el.className='log-line';const n=new Date(),tt=`${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}:${String(n.getSeconds()).padStart(2,'0')}`;el.innerHTML=`<span class="log-t">${tt}</span>${msg}`;bar.appendChild(el);bar.scrollTop=bar.scrollHeight;while(bar.children.length>60)bar.removeChild(bar.firstChild);}
function formatGB(v){return`${(+v||0).toFixed(1)}GB`;}
function fmtDate(iso){if(!iso)return'--';try{const d=new Date(iso);return`${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;}catch(_){return'--';}}

// ──────────────────────────────────────────────
//  CONTEXT MENU
// ──────────────────────────────────────────────
function showCtxMenu(e,model){
  e.preventDefault();ctxTarget=model;
  const menu=$id('ctx-menu');
  $id('ctx-model-name').textContent=model.name.split(':')[0];
  const prof=avatarProfiles[model.name];
  const ga=$id('ctx-generated-at');
  if(ga)ga.textContent=prof?.generatedAt?`${t('generatedAt')}: ${fmtDate(prof.generatedAt)}`:t('notYet');
  const regenItem=$id('ctx-regen');
  if(regenItem)regenItem.style.opacity=interviewing.has(model.id)?'.4':'1';
  const mx=Math.min(e.clientX,window.innerWidth-220),my=Math.min(e.clientY,window.innerHeight-160);
  menu.style.left=mx+'px';menu.style.top=my+'px';menu.classList.remove('hidden');
}
function hideCtxMenu(){$id('ctx-menu').classList.add('hidden');ctxTarget=null;}

// ──────────────────────────────────────────────
//  SLOT
// ──────────────────────────────────────────────
function createSlot(m){
  const slot=document.createElement('div');slot.className='char-slot';slot.id=`slot-${m.id}`;
  slot.onclick=()=>{selectedId=m.id;renderSidebar();};slot.oncontextmenu=(e)=>showCtxMenu(e,m);

  const tt=document.createElement('div');tt.className='char-tooltip';
  tt.innerHTML=`
    <div class="tt-name">${m.name}</div>
    <div class="tt-row"><span data-i18n="ttCpu">${t('ttCpu')}</span>   <span class="tt-val" id="tt-cpu-${m.id}">--</span></div>
    <div class="tt-row"><span data-i18n="ttVram">${t('ttVram')}</span>  <span class="tt-val" id="tt-mem-${m.id}">--</span></div>
    <div class="tt-row"><span data-i18n="ttRpm">${t('ttRpm')}</span>   <span class="tt-val" id="tt-rpm-${m.id}">--</span></div>
    <div class="tt-row"><span data-i18n="ttStatus">${t('ttStatus')}</span><span class="tt-val" id="tt-st-${m.id}">--</span></div>
    <div class="tt-self hidden" id="tt-self-${m.id}">
      <div class="tt-self-text" id="tt-desc-${m.id}"></div>
    </div>`;

  const flip=document.createElement('div');flip.id=`flip-${m.id}`;flip.style.cssText='display:block;transform-origin:center bottom;';
  const body=document.createElement('div');body.className=`char-body anim-${m.status}`;body.id=`body-${m.id}`;
  const canvas=document.createElement('canvas');canvas.width=CW;canvas.height=CH;canvas.className='char-canvas';canvas.id=`canvas-${m.id}`;
  body.appendChild(canvas);flip.appendChild(body);

  const tag=document.createElement('div');tag.className='char-nametag';tag.id=`tag-${m.id}`;tag.textContent=m.name.split(':')[0].substring(0,14);

  slot.appendChild(tt);slot.appendChild(flip);slot.appendChild(tag);
  frames[m.id]=0;return slot;
}

function updateSlotData(m){
  if(!m)return;const g=id=>document.getElementById(id);
  const cpu=g(`tt-cpu-${m.id}`);if(cpu)cpu.textContent=`${m.cpuUsage}%`;
  const mem=g(`tt-mem-${m.id}`);if(mem)mem.textContent=formatGB(m.memoryGB||m.sizeGB||0);
  const rpm=g(`tt-rpm-${m.id}`);if(rpm)rpm.textContent=m.requestPerMin;
  const st =g(`tt-st-${m.id}`); if(st) st.textContent=m.status.toUpperCase();
  const body=g(`body-${m.id}`); if(body)body.className=`char-body anim-${m.status}`;
  const prof=avatarProfiles[m.name];
  const tag=g(`tag-${m.id}`);if(tag)tag.style.borderColor=prof?prof.accentColor:'#28285a';
  const selfRow=g(`tt-self-${m.id}`),desc=g(`tt-desc-${m.id}`);
  if(selfRow&&desc){if(prof?.selfDescription){selfRow.classList.remove('hidden');desc.textContent=`「${prof.selfDescription}」`;}else{selfRow.classList.add('hidden');}}
}

// ──────────────────────────────────────────────
//  MAIN RENDER
// ──────────────────────────────────────────────
function applyState(newState){
  const models=newState.models||[];
  models.forEach(m=>{
    const prev=prevStatuses[m.id];
    if(prev&&prev!==m.status){
      const arr=t(`status${m.status.charAt(0).toUpperCase()+m.status.slice(1)}`)||[];
      log(`[${m.name.split(':')[0]}] → ${m.status.toUpperCase()} ${arr[Math.floor(Math.random()*arr.length)]||''}`);
    }
    prevStatuses[m.id]=m.status;
  });
  appState=newState;
  const container=$id('chars');
  const keep=new Set(models.map(m=>`slot-${m.id}`));
  [...container.children].forEach(c=>{if(!keep.has(c.id))c.remove();});
  models.forEach(m=>{if(!document.getElementById(`slot-${m.id}`))container.appendChild(createSlot(m));updateSlotData(m);});
  syncWanderModels(models);
  renderSidebar();renderTitlebar();
  if(!scanRunning&&newState.ollamaAvailable){const fresh=models.filter(m=>!avatarProfiles[m.name]&&!interviewing.has(m.id));if(fresh.length>0)scanModels(models,false);}
  if(!newState.ollamaAvailable)models.forEach(m=>{if(!avatarProfiles[m.name])avatarProfiles[m.name]=fallbackProfile(m.name);});
  if(!rafRunning){rafRunning=true;renderLoop();}
}

function renderSidebar(){
  const models=appState.models||[],sys=appState.systemMetrics||{};
  $id('mc-models').textContent=models.length;
  $id('mc-active').textContent=models.filter(m=>m.status==='busy'||m.status==='loading').length;
  $id('mc-cpu').textContent=sys.cpuUsage!=null?`${sys.cpuUsage}%`:'--%';
  $id('mc-mem').textContent=sys.memUsageMB!=null?`${Math.round(sys.memUsageMB/1024*10)/10}GB`:'-- GB';

  const list=$id('model-list');list.innerHTML='';
  models.forEach(m=>{
    const prof=avatarProfiles[m.name],isInt=interviewing.has(m.id),isCached=!!prof?.generatedAt;
    const item=document.createElement('div');item.className=`ml-item${selectedId===m.id?' active':''}`;item.onclick=()=>{selectedId=m.id;renderSidebar();};
    const dotStyle=prof?`background:${prof.primaryColor};box-shadow:0 0 5px ${prof.primaryColor}`:'';
    item.innerHTML=`<div class="ml-dot dot-${m.status}" style="${dotStyle}"></div><span class="ml-name">${m.name.split(':')[0]}</span>${isInt?`<span style="font-size:10px;color:#ffd600">💬</span>`:isCached?`<span class="ml-cached-badge" title="${t('generatedAt')}: ${fmtDate(prof.generatedAt)}">✓</span><button class="ml-regen-btn" data-id="${m.id}" title="${t('ctxRegen')}">↺</button>`:`<span class="ml-size">${formatGB(m.sizeGB||m.memoryGB||0)}</span>`}`;
    const rb=item.querySelector('.ml-regen-btn');if(rb)rb.onclick=async(e)=>{e.stopPropagation();if(!scanRunning)await regenOne(m);};
    list.appendChild(item);
  });

  const btnAll=$id('btn-regen-all');
  if(btnAll){
    btnAll.disabled=scanRunning||interviewing.size>0;
    btnAll.onclick=async()=>{if(scanRunning||interviewing.size>0)return;if(!confirm(t('regenAllConfirm')))return;await scanModels(appState.models,true);};
  }
  $id('inf-platform').textContent=sys.platform||'--';
  $id('inf-updated').textContent=new Date(appState.timestamp||Date.now()).toLocaleTimeString(currentLang==='en'?'en-US':currentLang==='zh'?'zh-CN':'ja-JP');
}

function renderTitlebar(){
  const badge=$id('connection-badge');
  if(appState.ollamaAvailable){badge.textContent='● ONLINE';badge.className='badge badge-online';}
  else{badge.textContent='● DEMO';badge.className='badge badge-demo';}
}

// ──────────────────────────────────────────────
//  RENDER LOOP
// ──────────────────────────────────────────────
function renderLoop(){
  const now=performance.now();
  tickWander(now);
  (appState.models||[]).forEach(m=>{
    const canvas=document.getElementById(`canvas-${m.id}`);if(!canvas)return;
    frames[m.id]=(frames[m.id]||0)+1;
    if(interviewing.has(m.id))drawInterviewing(canvas,m.name,frames[m.id]);
    else drawCharacter(canvas,m.status,avatarProfiles[m.name],frames[m.id]);
  });
  requestAnimationFrame(renderLoop);
}

setInterval(()=>{
  const s=Math.floor((Date.now()-startTime)/1000),el=$id('inf-uptime');
  if(el)el.textContent=`${String(Math.floor(s/3600)).padStart(2,'0')}:${String(Math.floor((s%3600)/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
},1000);

// ──────────────────────────────────────────────
//  CONNECTION
// ──────────────────────────────────────────────
async function connectElectron(){
  if(typeof window.electronAPI==='undefined')return false;
  log(t('ipcConnected'));
  const ver=await window.electronAPI.getAppVersion().catch(()=>'1.0.0');
  const vb=$id('version-badge');if(vb)vb.textContent=`v${ver}`;
  try{const fp=await window.electronAPI.getProfilesPath();const row=$id('profiles-path-row'),el=$id('inf-profiles-path');if(row&&el&&fp){row.style.display='flex';el.textContent=fp.replace(/\\/g,'/').split('/').slice(-2).join('/');el.title=fp;}}catch(_){}
  await loadProfilesFromDisk();
  try{
    const state=await window.electronAPI.getInitialState();
    applyState(state);
    const cached=Object.keys(avatarProfiles).length;
    log(state.ollamaAvailable?t('ollamaConnected',state.models.length,cached):t('ollamaDemo'));
  }catch(e){log(t('initFailed')+e.message);}
  cleanupIpc=window.electronAPI.onStateUpdate(state=>applyState(state));
  return true;
}

function connectWS(){
  try{
    const ws=new WebSocket('ws://localhost:8765');
    ws.onopen=()=>log(t('wsConnected'));
    ws.onmessage=e=>{try{applyState(JSON.parse(e.data));}catch(_){}};
    ws.onclose=()=>{log(t('wsDisconnected'));setTimeout(connectWS,5000);};
    ws.onerror=()=>{};
  }catch(_){}
}

let demoLoop=null;
function startDemo(){if(demoLoop)return;log(t('demoMode'));applyState(genDemoState());demoLoop=setInterval(()=>applyState(genDemoState()),3000);}

// ──────────────────────────────────────────────
//  INIT
// ──────────────────────────────────────────────
window.addEventListener('DOMContentLoaded',async()=>{
  // 言語ボタンイベント
  document.querySelectorAll('.lang-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
      switchLang(btn.dataset.lang);
      // 動的生成済みのツールチップ内 data-i18n も更新
      document.querySelectorAll('[data-i18n]').forEach(el=>{
        el.textContent=t(el.getAttribute('data-i18n'));
      });
      renderSidebar(); // モデルリスト再描画
    });
  });

  // コンテキストメニューイベント
  document.addEventListener('click',hideCtxMenu);
  document.addEventListener('contextmenu',e=>{if(!e.target.closest('.char-slot'))hideCtxMenu();});
  $id('ctx-regen').onclick=async()=>{hideCtxMenu();if(ctxTarget&&!scanRunning)await regenOne(ctxTarget);};
  $id('ctx-delete').onclick=async()=>{hideCtxMenu();if(ctxTarget){await deleteProfileFromDisk(ctxTarget.name);renderSidebar();updateSlotData(appState.models.find(m=>m.name===ctxTarget.name));}};

  // 初期 i18n 適用
  applyI18n();

  log(t('startup'));
  const ok=await connectElectron();
  if(!ok){log(t('noElectron'));connectWS();setTimeout(()=>{if(!appState.models.length)startDemo();},3000);}
});

window.addEventListener('beforeunload',()=>{if(cleanupIpc)cleanupIpc();if(demoLoop)clearInterval(demoLoop);});
