'use strict';

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // ── 状態取得 ────────────────────────────────
  getInitialState:  ()           => ipcRenderer.invoke('get-initial-state'),
  getAppVersion:    ()           => ipcRenderer.invoke('get-app-version'),
  getPlatform:      ()           => ipcRenderer.invoke('get-platform'),
  getProfilesPath:  ()           => ipcRenderer.invoke('get-profiles-path'),

  // ── プロファイル永続化 ───────────────────────
  /** 保存済み全プロファイルを返す: { [modelName]: profile } */
  loadProfiles:     ()           => ipcRenderer.invoke('load-profiles'),

  /** プロファイルを保存（マージ）: { [modelName]: profile } */
  saveProfiles:     (profiles)   => ipcRenderer.invoke('save-profiles', profiles),

  /** 特定モデルのプロファイルを削除 */
  deleteProfile:    (modelName)  => ipcRenderer.invoke('delete-profile', modelName),

  /** 全プロファイルを削除 */
  deleteAllProfiles:()           => ipcRenderer.invoke('delete-all-profiles'),

  // ── モデルインタビュー ───────────────────────
  /** モデルに自己紹介させる（Main→Ollama→Main→Renderer） */
  /** @param {string} modelName  @param {number} sizeGB モデルサイズ（GB）— タイムアウト計算に使用 */
  interviewModel:   (modelName, sizeGB)  => ipcRenderer.invoke('interview-model', modelName, sizeGB),

  // ── プッシュ更新 ─────────────────────────────
  onStateUpdate: (callback) => {
    const h = (_e, d) => callback(d);
    ipcRenderer.on('state-update', h);
    return () => ipcRenderer.removeListener('state-update', h);
  },

  isElectron: true,
});
