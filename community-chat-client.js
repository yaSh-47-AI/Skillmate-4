(() => {
  'use strict';

  // Inject Discord Theme Styles
  const discordStyleEl = document.createElement('style');
  discordStyleEl.id = 'skillmate-discord-styles';
  discordStyleEl.textContent = `
/* ==========================================================================
   SKILLMATE DISCORD CHAT SYSTEM - PRODUCTION STYLES
   ========================================================================== */

:root {
  --dc-bg-guilds: #1e1f22;
  --dc-bg-sidebar: #2b2d31;
  --dc-bg-main: #313338;
  --dc-bg-hover: #35373c;
  --dc-bg-active: #3f4248;
  --dc-bg-input: #383a40;
  --dc-blurple: #5865F2;
  --dc-blurple-hover: #4752c4;
  --dc-green: #23a55a;
  --dc-yellow: #f0b232;
  --dc-red: #f23f43;
  --dc-nitro-pink: #f47fff;
  --dc-nitro-gradient: linear-gradient(135deg, #8547c6, #b845c1, #ab2680);
  --dc-super-gradient: linear-gradient(135deg, #ff4500, #ff8c00, #ffd700, #00ff7f, #00ffff, #1e90ff, #9400d3);
  --dc-text-primary: #f2f3f5;
  --dc-text-secondary: #949ba4;
  --dc-text-muted: #80848e;
  --dc-text-interactive: #dbdee1;
  --dc-border: rgba(255, 255, 255, 0.08);
  --dc-font: 'gg sans', 'Noto Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

#discordAppModal {
  position: fixed;
  inset: 0;
  z-index: 999999;
  display: flex;
  background: var(--dc-bg-main);
  color: var(--dc-text-primary);
  font-family: var(--dc-font);
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

#discordAppModal.open {
  opacity: 1;
  pointer-events: auto;
}

.dc-app-layout {
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

/* 1. GUILDS RAIL (72px) */
.dc-guilds-rail {
  width: 72px;
  background-color: var(--dc-bg-guilds);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 0;
  gap: 8px;
  user-select: none;
  flex-shrink: 0;
  overflow-y: auto;
}
.dc-guilds-rail::-webkit-scrollbar { display: none; }

.dc-guild-item-wrap {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.dc-guild-pill {
  position: absolute;
  left: 0;
  width: 4px;
  height: 0px;
  background: #fff;
  border-radius: 0 4px 4px 0;
  transition: height 0.18s ease;
}
.dc-guild-item-wrap:hover .dc-guild-pill {
  height: 20px;
}
.dc-guild-item-wrap.active .dc-guild-pill {
  height: 40px;
}

.dc-guild-icon {
  width: 48px;
  height: 48px;
  border-radius: 24px;
  background: var(--dc-bg-sidebar);
  color: var(--dc-text-interactive);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 19px;
  font-weight: 700;
  cursor: pointer;
  transition: border-radius 0.2s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.2s ease, color 0.2s ease;
  position: relative;
  text-decoration: none;
}
.dc-guild-item-wrap:hover .dc-guild-icon,
.dc-guild-item-wrap.active .dc-guild-icon {
  border-radius: 16px;
  background: var(--dc-blurple);
  color: #fff;
}
.dc-guild-icon.dm-icon {
  background: #2b2d31;
  color: #5865F2;
}
.dc-guild-icon.dm-icon:hover,
.dc-guild-item-wrap.active .dc-guild-icon.dm-icon {
  background: var(--dc-blurple);
  color: #fff;
}
.dc-guild-badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  background: var(--dc-red);
  color: #fff;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 800;
  padding: 2px 5px;
  border: 2px solid var(--dc-bg-guilds);
}
.dc-guild-separator {
  width: 32px;
  height: 2px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 1px;
  margin: 4px 0;
}

/* 2. CHANNELS SIDEBAR (240px) */
.dc-sidebar {
  width: 240px;
  background-color: var(--dc-bg-sidebar);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  border-right: 1px solid var(--dc-border);
}

.dc-server-header {
  height: 48px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: background 0.15s ease;
  font-weight: 700;
  font-size: 15px;
  color: var(--dc-text-primary);
  box-shadow: 0 1px 2px rgba(0,0,0,0.2);
}
.dc-server-header:hover {
  background: rgba(255, 255, 255, 0.04);
}

.dc-channels-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 10px 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.dc-channels-scroll::-webkit-scrollbar {
  width: 4px;
}
.dc-channels-scroll::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.3);
  border-radius: 4px;
}

.dc-category-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 8px 4px;
  font-size: 11px;
  font-weight: 800;
  color: var(--dc-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  user-select: none;
}
.dc-category-header:hover {
  color: var(--dc-text-interactive);
}

.dc-channel-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 6px;
  color: var(--dc-text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
  user-select: none;
}
.dc-channel-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--dc-text-interactive);
}
.dc-channel-item.active {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  font-weight: 600;
}
.dc-channel-icon {
  font-size: 17px;
  color: var(--dc-text-muted);
  flex-shrink: 0;
}
.dc-channel-item.active .dc-channel-icon,
.dc-channel-item:hover .dc-channel-icon {
  color: var(--dc-text-interactive);
}
.dc-channel-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dc-channel-badge {
  font-size: 10px;
  background: rgba(255, 255, 255, 0.1);
  padding: 1px 6px;
  border-radius: 8px;
  color: var(--dc-text-interactive);
}
.dc-channel-badge.unread {
  background: var(--dc-red);
  color: #fff;
  font-weight: 700;
}

/* User Controls Bar at bottom */
.dc-user-bar {
  height: 52px;
  background: #232428;
  padding: 0 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.dc-user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
}
.dc-user-info:hover {
  background: rgba(255, 255, 255, 0.06);
}
.dc-user-avatar-wrap {
  position: relative;
  width: 32px;
  height: 32px;
}
.dc-user-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: var(--dc-blurple);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 13px;
  color: #fff;
}
.dc-user-status-dot {
  position: absolute;
  bottom: -1px;
  right: -1px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--dc-green);
  border: 2px solid #232428;
}
.dc-user-meta {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}
.dc-user-name {
  font-size: 13px;
  font-weight: 700;
  color: var(--dc-text-primary);
}
.dc-user-tag {
  font-size: 11px;
  color: var(--dc-text-muted);
}
.dc-user-actions {
  display: flex;
  gap: 2px;
}
.dc-icon-btn {
  background: none;
  border: none;
  color: var(--dc-text-secondary);
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.15s ease;
}
.dc-icon-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--dc-text-interactive);
}
.dc-icon-btn.active {
  color: var(--dc-red);
}

/* 3. MAIN CHAT AREA */
.dc-main {
  flex: 1;
  background-color: var(--dc-bg-main);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

/* Chat Header */
.dc-chat-header {
  height: 48px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(0, 0, 0, 0.2);
  box-shadow: 0 1px 2px rgba(0,0,0,0.2);
  background: var(--dc-bg-main);
  z-index: 10;
}
.dc-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.dc-header-channel-icon {
  font-size: 22px;
  color: var(--dc-text-muted);
}
.dc-header-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--dc-text-primary);
  white-space: nowrap;
}
.dc-header-divider {
  width: 1px;
  height: 18px;
  background: var(--dc-border);
}
.dc-header-topic {
  font-size: 12px;
  color: var(--dc-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dc-header-tools {
  display: flex;
  align-items: center;
  gap: 8px;
}
.dc-search-box {
  background: #1e1f22;
  border-radius: 4px;
  display: flex;
  align-items: center;
  padding: 4px 8px;
  gap: 6px;
  font-size: 12px;
  color: var(--dc-text-muted);
}
.dc-search-box input {
  background: none;
  border: none;
  outline: none;
  color: var(--dc-text-primary);
  font-size: 12px;
  width: 140px;
  font-family: inherit;
}

/* Message Scroll Container */
.dc-messages-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.dc-messages-scroll::-webkit-scrollbar {
  width: 8px;
}
.dc-messages-scroll::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.3);
  border-radius: 4px;
}

.dc-welcome-banner {
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--dc-border);
}
.dc-welcome-hash {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  background: var(--dc-bg-input);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 38px;
  color: #fff;
  margin-bottom: 12px;
}
.dc-welcome-title {
  font-size: 28px;
  font-weight: 800;
  color: #fff;
  margin: 0 0 6px 0;
}
.dc-welcome-desc {
  font-size: 14px;
  color: var(--dc-text-secondary);
  margin: 0;
}

/* Individual Message Row */
.dc-message {
  display: flex;
  gap: 14px;
  padding: 4px 8px;
  border-radius: 8px;
  position: relative;
  transition: background 0.12s ease;
}
.dc-message:hover {
  background: rgba(0, 0, 0, 0.08);
}
.dc-message.pinned {
  background: rgba(240, 178, 50, 0.08);
  border-left: 3px solid var(--dc-yellow);
}
.dc-message.highlighted {
  animation: flashHighlight 2s ease;
}
@keyframes flashHighlight {
  0% { background: rgba(88, 101, 242, 0.35); }
  100% { background: transparent; }
}

.dc-msg-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--dc-blurple);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 15px;
  color: #fff;
  flex-shrink: 0;
}
.dc-msg-content-wrap {
  flex: 1;
  min-width: 0;
}
.dc-msg-header {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 4px;
}
.dc-msg-author {
  font-size: 14px;
  font-weight: 700;
  color: var(--dc-text-primary);
  cursor: pointer;
}
.dc-msg-author:hover {
  text-decoration: underline;
}
.dc-role-badge {
  font-size: 10px;
  font-weight: 800;
  padding: 1px 5px;
  border-radius: 4px;
  background: var(--dc-blurple);
  color: #fff;
  letter-spacing: 0.03em;
}
.dc-role-badge.mod { background: #57F287; color: #000; }
.dc-role-badge.founder { background: var(--dc-yellow); color: #000; }
.dc-msg-time {
  font-size: 11px;
  color: var(--dc-text-muted);
}
.dc-msg-body {
  font-size: 14px;
  line-height: 1.45;
  color: var(--dc-text-interactive);
  word-break: break-word;
}

/* Hover Action Bar */
.dc-action-bar {
  position: absolute;
  right: 14px;
  top: -14px;
  background: #313338;
  border: 1px solid var(--dc-border);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  display: none;
  align-items: center;
  padding: 2px;
  gap: 2px;
  z-index: 10;
}
.dc-message:hover .dc-action-bar {
  display: flex;
}
.dc-act-btn {
  background: none;
  border: none;
  color: var(--dc-text-secondary);
  font-size: 14px;
  padding: 4px 6px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
}
.dc-act-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

/* Reactions Bar & Super Reactions */
.dc-reactions-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 6px;
}
.dc-reaction-chip {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #2b2d31;
  border: 1px solid transparent;
  padding: 3px 8px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--dc-text-interactive);
  cursor: pointer;
  user-select: none;
  transition: all 0.15s ease;
}
.dc-reaction-chip:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
}
.dc-reaction-chip.me {
  background: rgba(88, 101, 242, 0.15);
  border-color: var(--dc-blurple);
  color: #fff;
}
.dc-super-reaction {
  background: #2b2d31;
  border: 2px solid transparent;
  border-image: var(--dc-super-gradient) 1;
  animation: superPulse 2s infinite alternate;
  position: relative;
  font-weight: 700;
  box-shadow: 0 0 10px rgba(255, 140, 0, 0.35);
}
@keyframes superPulse {
  0% { transform: scale(1); filter: drop-shadow(0 0 2px #ff4500); }
  100% { transform: scale(1.05); filter: drop-shadow(0 0 8px #00ffff); }
}

/* Masked Links & Rich Link Previews */
.dc-masked-link {
  color: #00a8fc;
  text-decoration: none;
  font-weight: 500;
}
.dc-masked-link:hover {
  text-decoration: underline;
}
.dc-link-embed {
  margin-top: 8px;
  max-width: 520px;
  background: #2b2d31;
  border-left: 4px solid var(--dc-blurple);
  border-radius: 4px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: relative;
}
.dc-embed-dismiss {
  position: absolute;
  top: 6px;
  right: 6px;
  background: none;
  border: none;
  color: var(--dc-text-muted);
  cursor: pointer;
  font-size: 12px;
}
.dc-embed-dismiss:hover { color: #fff; }
.dc-embed-provider { font-size: 11px; color: var(--dc-text-muted); }
.dc-embed-title { font-size: 14px; font-weight: 700; color: #00a8fc; text-decoration: none; }
.dc-embed-title:hover { text-decoration: underline; }
.dc-embed-desc { font-size: 12px; color: var(--dc-text-secondary); line-height: 1.4; }

/* Native Polls */
.dc-poll-card {
  margin-top: 8px;
  max-width: 480px;
  background: #2b2d31;
  border: 1px solid var(--dc-border);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.dc-poll-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.dc-poll-title { font-size: 15px; font-weight: 700; color: #fff; }
.dc-poll-badge { font-size: 11px; background: rgba(87, 242, 135, 0.15); color: #57F287; padding: 2px 7px; border-radius: 6px; font-weight: 600; }
.dc-poll-options { display: flex; flex-direction: column; gap: 8px; }
.dc-poll-option-btn {
  background: #313338;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px;
  padding: 10px 14px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.15s ease;
}
.dc-poll-option-btn:hover { border-color: var(--dc-blurple); }
.dc-poll-option-btn.voted { border-color: var(--dc-blurple); background: rgba(88, 101, 242, 0.1); }
.dc-poll-fill {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  background: rgba(88, 101, 242, 0.25);
  z-index: 1;
  transition: width 0.3s ease;
}
.dc-poll-opt-label { z-index: 2; font-size: 13px; font-weight: 600; color: #fff; display: flex; align-items: center; gap: 8px; }
.dc-poll-opt-pct { z-index: 2; font-size: 12px; font-weight: 700; color: var(--dc-text-secondary); }
.dc-poll-footer { display: flex; align-items: center; justify-content: space-between; font-size: 11px; color: var(--dc-text-muted); }

/* Voice Messages */
.dc-voice-message {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: #2b2d31;
  border-radius: 24px;
  padding: 8px 16px;
  width: fit-content;
  border: 1px solid var(--dc-border);
}
.dc-voice-play {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--dc-blurple);
  border: none;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
}
.dc-voice-waves {
  display: flex;
  align-items: center;
  gap: 3px;
  height: 24px;
}
.dc-wave-bar {
  width: 3px;
  background: var(--dc-text-muted);
  border-radius: 2px;
  height: 10px;
  transition: height 0.15s ease, background 0.15s ease;
}
.dc-voice-message.playing .dc-wave-bar {
  background: var(--dc-blurple);
  animation: wavePulse 0.6s infinite alternate;
}
@keyframes wavePulse {
  0% { height: 6px; }
  100% { height: 22px; }
}
.dc-voice-time { font-size: 11px; color: var(--dc-text-muted); font-weight: 600; }
.dc-voice-speed {
  background: #1e1f22;
  border: none;
  color: var(--dc-text-interactive);
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  cursor: pointer;
}

/* File Attachments */
.dc-file-card {
  margin-top: 8px;
  background: #2b2d31;
  border: 1px solid var(--dc-border);
  border-radius: 8px;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 420px;
}
.dc-file-icon { font-size: 26px; }
.dc-file-meta { flex: 1; min-width: 0; }
.dc-file-name { font-size: 13px; font-weight: 700; color: #00a8fc; text-decoration: none; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block; }
.dc-file-name:hover { text-decoration: underline; }
.dc-file-size { font-size: 11px; color: var(--dc-text-muted); }
.dc-nitro-badge {
  font-size: 10px;
  background: var(--dc-nitro-gradient);
  color: #fff;
  padding: 2px 6px;
  border-radius: 6px;
  font-weight: 800;
}

/* Image & Video Previews */
.dc-inline-image {
  margin-top: 8px;
  max-width: 440px;
  max-height: 320px;
  border-radius: 8px;
  cursor: pointer;
  display: block;
}
.dc-inline-video {
  margin-top: 8px;
  max-width: 480px;
  max-height: 300px;
  border-radius: 8px;
  background: #000;
  outline: none;
}

/* Text to Speech & Threads triggers */
.dc-tts-badge {
  background: rgba(240, 178, 50, 0.2);
  color: var(--dc-yellow);
  font-size: 10px;
  font-weight: 800;
  padding: 1px 5px;
  border-radius: 4px;
  margin-left: 6px;
}
.dc-thread-trigger-btn {
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: #00a8fc;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  padding: 2px 0;
}
.dc-thread-trigger-btn:hover { text-decoration: underline; }

/* Composer Bar */
.dc-composer-area {
  padding: 0 16px 24px;
  background: var(--dc-bg-main);
  position: relative;
}
.dc-composer-box {
  background: var(--dc-bg-input);
  border-radius: 8px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
}
.dc-composer-attach {
  background: #4e5058;
  border: none;
  color: #fff;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  font-weight: 700;
}
.dc-composer-attach:hover { background: #6d6f78; }
.dc-composer-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: var(--dc-text-primary);
  font-size: 14px;
  font-family: inherit;
  padding: 11px 0;
}
.dc-composer-tools {
  display: flex;
  align-items: center;
  gap: 8px;
}
.dc-tool-btn {
  background: none;
  border: none;
  color: var(--dc-text-secondary);
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
}
.dc-tool-btn:hover { color: #fff; }
.dc-voice-record-active {
  display: none;
  flex: 1;
  align-items: center;
  gap: 12px;
}
.dc-record-pulse {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--dc-red);
  animation: recBlink 1s infinite;
}
@keyframes recBlink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
.dc-typing-indicator {
  font-size: 11px;
  color: var(--dc-text-muted);
  height: 18px;
  padding: 2px 16px 0;
  font-weight: 600;
}

/* Sticker Suggestion Popover */
.dc-sticker-suggestions {
  position: absolute;
  bottom: 74px;
  left: 20px;
  background: #2b2d31;
  border: 1px solid var(--dc-border);
  border-radius: 8px;
  padding: 8px;
  display: none;
  flex-direction: column;
  gap: 6px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.5);
  z-index: 100;
  max-width: 320px;
}
.dc-sticker-suggestions.open { display: flex; }
.dc-suggest-header { font-size: 11px; font-weight: 700; color: var(--dc-text-muted); text-transform: uppercase; }
.dc-suggest-list { display: flex; gap: 8px; overflow-x: auto; }
.dc-suggest-item {
  background: #1e1f22;
  border-radius: 6px;
  padding: 6px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  transition: transform 0.15s ease;
}
.dc-suggest-item:hover { transform: scale(1.08); background: #35373c; }
.dc-suggest-img { width: 52px; height: 52px; object-fit: contain; }
.dc-suggest-name { font-size: 10px; color: var(--dc-text-interactive); }

/* DRAWERS / SIDE PANELS (Threads, Pins, Bookmarks, Members) */
.dc-side-panel {
  width: 340px;
  background: #2b2d31;
  border-left: 1px solid var(--dc-border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}
.dc-panel-header {
  height: 48px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(0,0,0,0.2);
  font-size: 15px;
  font-weight: 700;
  color: #fff;
}
.dc-panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* VIDEO CALLING OVERLAY */
.dc-call-overlay {
  position: absolute;
  inset: 0;
  background: #111214;
  z-index: 50;
  display: none;
  flex-direction: column;
}
.dc-call-overlay.active { display: flex; }
.dc-call-header {
  height: 48px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.dc-call-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 14px;
  padding: 16px;
  overflow-y: auto;
}
.dc-call-tile {
  background: #1e1f22;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid transparent;
  min-height: 200px;
}
.dc-call-tile.speaking {
  border-color: var(--dc-green);
  box-shadow: 0 0 15px rgba(35, 165, 90, 0.4);
}
.dc-call-tile video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.dc-call-avatar-placeholder {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--dc-blurple);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 700;
  color: #fff;
}
.dc-call-user-name {
  position: absolute;
  bottom: 12px;
  left: 12px;
  background: rgba(0,0,0,0.6);
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
}
.dc-call-controls-bar {
  height: 72px;
  background: #1e1f22;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}
.dc-call-btn {
  width: 48px;
  height: 48px;
  border-radius: 24px;
  background: #2b2d31;
  border: none;
  color: #fff;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}
.dc-call-btn:hover { background: #35373c; }
.dc-call-btn.active { background: #fff; color: #000; }
.dc-call-btn.danger { background: var(--dc-red); }
.dc-call-btn.danger:hover { background: #d83a3e; }

/* FORUM VIEW */
.dc-forum-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--dc-bg-main);
}
.dc-forum-top {
  padding: 16px;
  border-bottom: 1px solid var(--dc-border);
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.dc-forum-guidelines {
  background: rgba(88, 101, 242, 0.1);
  border: 1px solid var(--dc-blurple);
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 13px;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.dc-forum-search-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.dc-forum-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.dc-tag-pill {
  background: #2b2d31;
  border: 1px solid var(--dc-border);
  border-radius: 14px;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 600;
  color: var(--dc-text-secondary);
  cursor: pointer;
}
.dc-tag-pill:hover, .dc-tag-pill.active {
  background: var(--dc-blurple);
  color: #fff;
  border-color: var(--dc-blurple);
}
.dc-forum-posts-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 14px;
}
.dc-forum-posts-scroll.list-layout {
  display: flex;
  flex-direction: column;
}
.dc-forum-card {
  background: #2b2d31;
  border: 1px solid var(--dc-border);
  border-radius: 10px;
  padding: 14px;
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.dc-forum-card:hover {
  border-color: rgba(255,255,255,0.2);
  transform: translateY(-2px);
}
.dc-fc-title { font-size: 15px; font-weight: 700; color: #fff; }
.dc-fc-excerpt { font-size: 13px; color: var(--dc-text-secondary); line-height: 1.4; }
.dc-fc-footer { display: flex; align-items: center; justify-content: space-between; font-size: 11px; color: var(--dc-text-muted); margin-top: 4px; }

/* MODALS */
.dc-dialog-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  z-index: 1000000;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}
.dc-dialog-box {
  background: #313338;
  border-radius: 12px;
  width: 90%;
  max-width: 480px;
  border: 1px solid var(--dc-border);
  box-shadow: 0 16px 40px rgba(0,0,0,0.5);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.dc-dialog-head {
  padding: 16px 20px;
  font-size: 17px;
  font-weight: 700;
  color: #fff;
  border-bottom: 1px solid rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.dc-dialog-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.dc-dialog-foot {
  padding: 14px 20px;
  background: #2b2d31;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.dc-btn-primary {
  background: var(--dc-blurple);
  border: none;
  color: #fff;
  border-radius: 6px;
  padding: 8px 18px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}
.dc-btn-primary:hover { background: var(--dc-blurple-hover); }
.dc-btn-secondary {
  background: transparent;
  border: none;
  color: #fff;
  font-size: 13px;
  cursor: pointer;
  padding: 8px 14px;
}
.dc-btn-secondary:hover { text-decoration: underline; }

/* Responsive adjustments */
@media (max-width: 768px) {
  .dc-sidebar { display: none; }
  .dc-sidebar.mobile-open { display: flex; position: absolute; left: 72px; top: 0; bottom: 0; z-index: 40; }
  .dc-side-panel { display: none; }
  .dc-side-panel.mobile-open { display: flex; position: absolute; right: 0; top: 0; bottom: 0; z-index: 40; }
}
`;
  document.head.appendChild(discordStyleEl);



  // BUILD DISCORD DOM SHELL
  function ensureDiscordDOM() {
    let modal = $('#discordAppModal');
    if (modal) return modal;

    modal = document.createElement('div');
    modal.id = 'discordAppModal';
    modal.innerHTML = `
      <div class="dc-app-layout">
        <!-- 1. GUILDS / SERVER RAIL -->
        <nav class="dc-guilds-rail" id="dcGuildsRail" aria-label="Servers Rail">
          <div class="dc-guild-item-wrap active" id="dcGuildDm" onclick="window.DiscordClient.switchServer('dm')">
            <div class="dc-guild-pill"></div>
            <div class="dc-guild-icon dm-icon" title="Direct Messages">✉</div>
          </div>
          <div class="dc-guild-separator"></div>
          <div id="dcCommunitiesList" style="display:flex;flex-direction:column;gap:8px;align-items:center;width:100%;"></div>
          <div class="dc-guild-separator"></div>
          <div class="dc-guild-item-wrap" onclick="window.DiscordClient.openCreateServerModal()">
            <div class="dc-guild-pill"></div>
            <div class="dc-guild-icon" title="Add a Server" style="color:#23a55a;background:#2b2d31;">＋</div>
          </div>
          <div class="dc-guild-item-wrap" onclick="window.DiscordClient.openDiscoveryModal()">
            <div class="dc-guild-pill"></div>
            <div class="dc-guild-icon" title="Explore Discoverable Servers" style="color:#00a8fc;background:#2b2d31;">🧭</div>
          </div>
        </nav>

        <!-- 2. CHANNELS SIDEBAR -->
        <aside class="dc-sidebar" id="dcSidebar">
          <div class="dc-server-header" id="dcServerHeader" onclick="window.DiscordClient.toggleServerDropdown()">
            <span id="dcServerTitle">SkillMate Community</span>
            <span style="font-size:12px;">▼</span>
          </div>

          <div class="dc-channels-scroll" id="dcChannelsList">
            <!-- Populated dynamically -->
          </div>

          <!-- Bottom User Controls Bar -->
          <div class="dc-user-bar">
            <div class="dc-user-info" onclick="window.DiscordClient.openUserSettings()">
              <div class="dc-user-avatar-wrap">
                <div class="dc-user-avatar" id="dcUserAvatar">✦</div>
                <div class="dc-user-status-dot" id="dcUserStatusDot"></div>
              </div>
              <div class="dc-user-meta">
                <span class="dc-user-name" id="dcUserName">You</span>
                <span class="dc-user-tag" id="dcUserTag">#0001</span>
              </div>
            </div>
            <div class="dc-user-actions">
              <button class="dc-icon-btn" id="dcBtnMute" onclick="window.DiscordClient.toggleMute()" title="Mute/Unmute Mic">🎙️</button>
              <button class="dc-icon-btn" id="dcBtnDeafen" onclick="window.DiscordClient.toggleDeafen()" title="Deafen Audio">🎧</button>
              <button class="dc-icon-btn" onclick="window.DiscordClient.openUserSettings()" title="User Settings">⚙️</button>
            </div>
          </div>
        </aside>

        <!-- 3. MAIN CHAT / CONTENT AREA -->
        <main class="dc-main" id="dcMain">
          <!-- Top Chat Header -->
          <header class="dc-chat-header">
            <div class="dc-header-left">
              <span class="dc-header-channel-icon" id="dcHeaderIcon">#</span>
              <span class="dc-header-title" id="dcHeaderTitle">general</span>
              <div class="dc-header-divider"></div>
              <span class="dc-header-topic" id="dcHeaderTopic">Community conversation</span>
            </div>
            <div class="dc-header-tools">
              <!-- Active Threads Trigger -->
              <button class="dc-icon-btn" onclick="window.DiscordClient.toggleSidePanel('threads')" title="Threads">🧵</button>
              <!-- Video Call Trigger -->
              <button class="dc-icon-btn" onclick="window.DiscordClient.startVideoCall()" title="Start Video Call / Screen Share" style="color:#57F287;">📹</button>
              <!-- Pinned Messages Trigger -->
              <button class="dc-icon-btn" onclick="window.DiscordClient.toggleSidePanel('pins')" title="Pinned Messages">📌</button>
              <!-- Bookmarks & Reminders Trigger -->
              <button class="dc-icon-btn" onclick="window.DiscordClient.toggleSidePanel('bookmarks')" title="Saved Messages & Reminders">🔖</button>
              <!-- Member List Toggle -->
              <button class="dc-icon-btn" onclick="window.DiscordClient.toggleSidePanel('members')" title="Member List">👥</button>
              <!-- Search Bar -->
              <div class="dc-search-box">
                <span>🔍</span>
                <input type="text" id="dcSearchInput" placeholder="Search (Ctrl+F)" onkeyup="window.DiscordClient.handleSearch(this.value)">
              </div>
              <div class="dc-header-divider"></div>
              <!-- Minimize / Close Discord -->
              <button class="dc-icon-btn" onclick="window.DiscordClient.closeDiscord()" title="Return to SkillMate" style="font-weight:700;font-size:18px;">✕</button>
            </div>
          </header>

          <!-- Standard Messages Scroll View -->
          <div class="dc-messages-scroll" id="dcMessagesScroll">
            <!-- Populated dynamically -->
          </div>

          <!-- Forum View Container (shown when channel type == 'forum') -->
          <div class="dc-forum-view" id="dcForumView" style="display:none;">
            <div class="dc-forum-top">
              <div class="dc-forum-guidelines">
                <div>
                  <strong>📋 Forum Posting Guidelines:</strong> Search before posting. Be constructive and tag your topic appropriately.
                </div>
                <button class="dc-btn-primary" onclick="window.DiscordClient.openNewForumPostModal()">＋ New Post</button>
              </div>
              <div class="dc-forum-search-row">
                <input type="text" id="dcForumSearch" placeholder="Search forum posts..." style="flex:1;background:#1e1f22;border:none;border-radius:6px;padding:8px 12px;color:#fff;" oninput="window.DiscordClient.renderForumPosts()">
                <div class="dc-forum-tags" id="dcForumTags">
                  <span class="dc-tag-pill active" onclick="window.DiscordClient.filterForumTag('All')">All</span>
                  <span class="dc-tag-pill" onclick="window.DiscordClient.filterForumTag('Question')">Question</span>
                  <span class="dc-tag-pill" onclick="window.DiscordClient.filterForumTag('Showcase')">Showcase</span>
                  <span class="dc-tag-pill" onclick="window.DiscordClient.filterForumTag('Tutorial')">Tutorial</span>
                  <span class="dc-tag-pill" onclick="window.DiscordClient.filterForumTag('Idea')">Idea</span>
                </div>
                <button class="dc-icon-btn" onclick="window.DiscordClient.toggleForumLayout()" title="Toggle List / Gallery Layout" id="dcBtnForumLayout">⊞</button>
              </div>
            </div>
            <div class="dc-forum-posts-scroll" id="dcForumPostsScroll">
              <!-- Forum posts render here -->
            </div>
          </div>

          <!-- Composer Bar -->
          <div class="dc-composer-area" id="dcComposerArea">
            <div class="dc-typing-indicator" id="dcTypingIndicator"></div>

            <!-- Sticker Suggestion Popover -->
            <div class="dc-sticker-suggestions" id="dcStickerSuggestions">
              <div class="dc-suggest-header">Suggested Stickers</div>
              <div class="dc-suggest-list" id="dcSuggestList"></div>
            </div>

            <div class="dc-composer-box">
              <!-- Attach File / Create Poll Menu -->
              <button class="dc-composer-attach" type="button" onclick="window.DiscordClient.toggleAttachMenu()" title="Attach file or create poll">＋</button>
              <input type="file" id="dcFileInput" style="display:none;" onchange="window.DiscordClient.handleFileUpload(this.files[0])">

              <!-- Text Input -->
              <input type="text" class="dc-composer-input" id="dcMessageInput" placeholder="Message #general... (Try /tts or /summary or /poll)" autocomplete="off">

              <!-- Normal Composer Tools -->
              <div class="dc-composer-tools" id="dcNormalTools">
                <button class="dc-tool-btn" type="button" onclick="window.DiscordClient.openPollModal()" title="Create Poll">📊</button>
                <button class="dc-tool-btn" type="button" onclick="window.DiscordClient.openStickerPicker()" title="Stickers & GIFs">🏷️</button>
                <button class="dc-tool-btn" type="button" onclick="window.DiscordClient.openEmojiPicker()" title="Add Emoji">😊</button>
                <button class="dc-tool-btn" type="button" onclick="window.DiscordClient.startVoiceRecord()" title="Record Voice Message" style="color:#57F287;">🎙️</button>
                <button class="dc-tool-btn" type="button" onclick="window.DiscordClient.sendMessage()" title="Send Message" style="color:var(--dc-blurple);font-size:20px;">➤</button>
              </div>

              <!-- Voice Recording In-Progress Bar -->
              <div class="dc-voice-record-active" id="dcVoiceRecordBar">
                <div class="dc-record-pulse"></div>
                <span style="font-size:13px;font-weight:700;color:var(--dc-red);" id="dcRecordTimer">0:00</span>
                <span style="font-size:12px;color:var(--dc-text-muted);">Recording voice note...</span>
                <button class="dc-btn-secondary" type="button" onclick="window.DiscordClient.cancelVoiceRecord()">Cancel</button>
                <button class="dc-btn-primary" type="button" onclick="window.DiscordClient.stopAndSendVoiceRecord()">Send Voice Note</button>
              </div>
            </div>
          </div>

          <!-- VIDEO / VOICE CALL OVERLAY -->
          <div class="dc-call-overlay" id="dcCallOverlay">
            <div class="dc-call-header">
              <span style="font-weight:700;" id="dcCallRoomTitle">🔊 Lounge Voice & Video Call</span>
              <button class="dc-btn-secondary" onclick="window.DiscordClient.toggleSidePanel('voice-chat')">💬 Side Text Chat in Call</button>
            </div>
            <div class="dc-call-grid" id="dcCallGrid">
              <!-- Video / Audio participant tiles -->
              <div class="dc-call-tile" id="dcLocalVideoTile">
                <video id="dcLocalVideo" autoplay playsinline muted></video>
                <div class="dc-call-avatar-placeholder" id="dcLocalAvatar">✦</div>
                <div class="dc-call-user-name" id="dcLocalCallName">You</div>
              </div>
              <div class="dc-call-tile" id="dcRemoteTile1">
                <div class="dc-call-avatar-placeholder" style="background:#57F287;">P</div>
                <div class="dc-call-user-name">Punit (Active Speaker)</div>
              </div>
            </div>
            <div class="dc-call-controls-bar">
              <button class="dc-call-btn" id="dcCallBtnCam" onclick="window.DiscordClient.toggleVideoCam()" title="Turn Camera On/Off">📷</button>
              <button class="dc-call-btn" id="dcCallBtnMic" onclick="window.DiscordClient.toggleCallMic()" title="Mute/Unmute Mic">🎙️</button>
              <button class="dc-call-btn" id="dcCallBtnScreen" onclick="window.DiscordClient.toggleScreenShare()" title="Share Screen">🖥️</button>
              <button class="dc-call-btn danger" onclick="window.DiscordClient.leaveCall()" title="Disconnect Call">📞</button>
            </div>
          </div>
        </main>

        <!-- 4. RIGHT DRAWERS / SIDE PANELS (Pins, Threads, Bookmarks, Members, In-Call Chat) -->
        <aside class="dc-side-panel" id="dcSidePanel" style="display:none;">
          <div class="dc-panel-header">
            <span id="dcPanelTitle">Side Panel</span>
            <button class="dc-icon-btn" onclick="window.DiscordClient.closeSidePanel()">✕</button>
          </div>
          <div class="dc-panel-body" id="dcPanelBody">
            <!-- Dynamic panel content -->
          </div>
        </aside>
      </div>

      <!-- REACTION & SUPER REACTION PICKER MODAL -->
      <div id="dcEmojiModal" class="dc-dialog-backdrop" style="display:none;" onclick="if(event.target===this)this.style.display='none'">
        <div class="dc-dialog-box">
          <div class="dc-dialog-head">
            <span>Add Reaction</span>
            <button class="dc-icon-btn" onclick="$('#dcEmojiModal').style.display='none'">✕</button>
          </div>
          <div class="dc-dialog-body">
            <div style="font-size:12px;color:var(--dc-text-muted);font-weight:700;">STANDARD REACTIONS</div>
            <div style="display:flex;gap:12px;font-size:24px;cursor:pointer;" id="dcStandardEmojis">
              <span onclick="window.DiscordClient.pickReaction('👍', false)">👍</span>
              <span onclick="window.DiscordClient.pickReaction('❤️', false)">❤️</span>
              <span onclick="window.DiscordClient.pickReaction('🔥', false)">🔥</span>
              <span onclick="window.DiscordClient.pickReaction('🚀', false)">🚀</span>
              <span onclick="window.DiscordClient.pickReaction('🎉', false)">🎉</span>
              <span onclick="window.DiscordClient.pickReaction('😂', false)">😂</span>
              <span onclick="window.DiscordClient.pickReaction('🧠', false)">🧠</span>
              <span onclick="window.DiscordClient.pickReaction('💻', false)">💻</span>
            </div>
            <div style="font-size:12px;color:var(--dc-text-muted);font-weight:700;margin-top:10px;">⚡ SUPER REACTIONS (ANIMATED & ENERGIZED)</div>
            <div style="display:flex;gap:12px;font-size:24px;cursor:pointer;" id="dcSuperEmojis">
              <span class="dc-super-reaction" onclick="window.DiscordClient.pickReaction('⚡', true)" title="Super Lightning">⚡</span>
              <span class="dc-super-reaction" onclick="window.DiscordClient.pickReaction('💥', true)" title="Super Boom">💥</span>
              <span class="dc-super-reaction" onclick="window.DiscordClient.pickReaction('🌟', true)" title="Super Star">🌟</span>
              <span class="dc-super-reaction" onclick="window.DiscordClient.pickReaction('🌈', true)" title="Super Rainbow">🌈</span>
              <span class="dc-super-reaction" onclick="window.DiscordClient.pickReaction('💎', true)" title="Super Diamond">💎</span>
            </div>
          </div>
        </div>
      </div>

      <!-- CREATE POLL MODAL -->
      <div id="dcPollModal" class="dc-dialog-backdrop" style="display:none;" onclick="if(event.target===this)this.style.display='none'">
        <div class="dc-dialog-box">
          <div class="dc-dialog-head">
            <span>📊 Create a Poll</span>
            <button class="dc-icon-btn" onclick="$('#dcPollModal').style.display='none'">✕</button>
          </div>
          <div class="dc-dialog-body">
            <label style="font-size:12px;font-weight:700;color:var(--dc-text-muted);">QUESTION</label>
            <input type="text" id="dcPollQuestion" placeholder="What should we build next?" style="background:#1e1f22;border:none;border-radius:6px;padding:10px;color:#fff;">

            <label style="font-size:12px;font-weight:700;color:var(--dc-text-muted);">OPTIONS (UP TO 10)</label>
            <div id="dcPollOptionsContainer" style="display:flex;flex-direction:column;gap:6px;">
              <input type="text" class="dc-poll-opt-input" placeholder="Option 1" style="background:#1e1f22;border:none;border-radius:6px;padding:8px 10px;color:#fff;">
              <input type="text" class="dc-poll-opt-input" placeholder="Option 2" style="background:#1e1f22;border:none;border-radius:6px;padding:8px 10px;color:#fff;">
            </div>
            <button class="dc-btn-secondary" onclick="window.DiscordClient.addPollOptionField()" style="align-self:flex-start;">＋ Add Option</button>

            <div style="display:flex;align-items:center;justify-content:space-between;margin-top:6px;">
              <label style="font-size:13px;display:flex;align-items:center;gap:6px;cursor:pointer;">
                <input type="checkbox" id="dcPollMultiSelect"> Allow Multi-select
              </label>
              <select id="dcPollDuration" style="background:#1e1f22;color:#fff;border:none;border-radius:6px;padding:6px;">
                <option value="1">Duration: 1 Hour</option>
                <option value="24" selected>Duration: 24 Hours</option>
                <option value="72">Duration: 3 Days</option>
                <option value="168">Duration: 1 Week</option>
              </select>
            </div>
          </div>
          <div class="dc-dialog-foot">
            <button class="dc-btn-secondary" onclick="$('#dcPollModal').style.display='none'">Cancel</button>
            <button class="dc-btn-primary" onclick="window.DiscordClient.submitPoll()">Post Poll</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Bind Keyboard Shortcuts: Ctrl+F (Channel Search), Ctrl+Shift+F (Server Search), Escape (Close)
    document.addEventListener('keydown', e => {
      if (!$('#discordAppModal').classList.contains('open')) return;
      if (e.key === 'Escape') {
        window.DiscordClient.closeDiscord();
      }
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        $('#dcSearchInput')?.focus();
        showToast('🔍 Searching entire server...');
      } else if (e.ctrlKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        $('#dcSearchInput')?.focus();
      }
    });

    // Message Input events (Enter to send, sticker suggestions)
    const input = $('#dcMessageInput');
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        window.DiscordClient.sendMessage();
      }
    });
    input.addEventListener('input', e => {
      window.DiscordClient.handleInputStickerSuggestions(e.target.value);
      window.DiscordClient.broadcastTyping();
    });

    return modal;
  }


  // DISCORD CLIENT METHODS & CONTROLLER
  window.DiscordClient = {
    async init() {
      ensureDiscordDOM();
      await this.loadCurrentUser();
      await this.loadCommunities();
    },

    async loadCurrentUser() {
      try {
        const res = await api(`${API}/auth/me`);
        currentUser = res.user || null;
        if (currentUser) {
          $('#dcUserName').textContent = currentUser.name || 'Member';
          $('#dcUserAvatar').textContent = (currentUser.name || '✦')[0].toUpperCase();
          $('#dcLocalCallName').textContent = currentUser.name || 'You';
          $('#dcLocalAvatar').textContent = (currentUser.name || '✦')[0].toUpperCase();
        }
      } catch (_) {
        currentUser = null;
      }
    },

    async loadCommunities() {
      try {
        const res = await api(`${API}/communities`);
        communities = Array.isArray(res.communities) ? res.communities : [];
        this.renderGuildsRail();
      } catch (_) {}
    },

    renderGuildsRail() {
      const list = $('#dcCommunitiesList');
      if (!list) return;
      list.innerHTML = '';

      communities.forEach(c => {
        const wrap = document.createElement('div');
        wrap.className = `dc-guild-item-wrap ${Number(activeServerId) === Number(c.id) ? 'active' : ''}`;
        wrap.onclick = () => this.switchServer(c.id);

        const pill = document.createElement('div');
        pill.className = 'dc-guild-pill';

        const icon = document.createElement('div');
        icon.className = 'dc-guild-icon';
        icon.title = `${c.name} (${c.topic})`;
        icon.textContent = c.emoji || (c.name || '✦')[0];

        wrap.append(pill, icon);
        list.appendChild(wrap);
      });
    },

    async openDiscord(serverId = null, channelId = 'general') {
      ensureDiscordDOM();
      $('#discordAppModal').classList.add('open');
      document.body.style.overflow = 'hidden';

      await this.loadCurrentUser();
      await this.loadCommunities();

      const targetServer = serverId || communities[0]?.id || 'dm';
      await this.switchServer(targetServer, channelId);
    },

    closeDiscord() {
      $('#discordAppModal')?.classList.remove('open');
      document.body.style.overflow = '';
      if (activeCallChannel) {
        this.leaveCall();
      }
    },

    async switchServer(serverId, targetChannel = 'general') {
      activeServerId = serverId;
      $$('.dc-guild-item-wrap').forEach(w => w.classList.remove('active'));

      if (serverId === 'dm') {
        $('#dcGuildDm')?.classList.add('active');
        $('#dcServerTitle').textContent = 'Direct Messages';
        this.renderChannelsList([]);
        this.renderDMChat();
        return;
      }

      this.renderGuildsRail();
      const server = communities.find(c => Number(c.id) === Number(serverId)) || communities[0];
      if (!server) return;

      $('#dcServerTitle').textContent = server.name;

      const channels = getChannelsForServer(server);
      this.renderChannelsList(channels);

      const channelObj = channels.find(ch => ch.id === targetChannel) || channels[1] || channels[0];
      await this.switchChannel(channelObj.id, channelObj.type);
    },

    renderChannelsList(channels) {
      const container = $('#dcChannelsList');
      if (!container) return;
      container.innerHTML = '';

      let currentCategory = null;
      channels.forEach(ch => {
        if (ch.category !== currentCategory) {
          currentCategory = ch.category;
          const cat = document.createElement('div');
          cat.className = 'dc-category-header';
          cat.textContent = currentCategory;
          container.appendChild(cat);
        }

        const item = document.createElement('div');
        item.className = `dc-channel-item ${activeChannelId === ch.id ? 'active' : ''}`;
        item.id = `dc-channel-${ch.id}`;
        item.onclick = () => this.switchChannel(ch.id, ch.type);

        item.innerHTML = `
          <span class="dc-channel-icon">${ch.icon}</span>
          <span class="dc-channel-name">${ch.name}</span>
          ${ch.locked ? '<span class="dc-channel-badge">🔒 Locked</span>' : ''}
        `;
        container.appendChild(item);
      });
    },

    async switchChannel(channelId, channelType = 'text') {
      activeChannelId = channelId;
      activeChannelType = channelType;

      $$('.dc-channel-item').forEach(it => it.classList.remove('active'));
      $(`#dc-channel-${channelId}`)?.classList.add('active');

      const server = communities.find(c => Number(c.id) === Number(activeServerId));
      const channels = getChannelsForServer(server);
      const ch = channels.find(c => c.id === channelId) || { name: channelId, type: channelType, desc: 'Channel conversation', icon: '#' };

      $('#dcHeaderIcon').textContent = ch.icon;
      $('#dcHeaderTitle').textContent = ch.name;
      $('#dcHeaderTopic').textContent = ch.desc;
      $('#dcMessageInput').placeholder = `Message #${ch.name}... (Try /tts, /summary, /poll)`;

      // Handle Forum view vs Standard text view
      if (channelType === 'forum') {
        $('#dcMessagesScroll').style.display = 'none';
        $('#dcComposerArea').style.display = 'none';
        $('#dcForumView').style.display = 'flex';
        this.renderForumPosts();
      } else {
        $('#dcMessagesScroll').style.display = 'flex';
        $('#dcComposerArea').style.display = 'block';
        $('#dcForumView').style.display = 'none';
        await this.loadMessagesForCurrentChannel();
      }

      // If voice channel clicked, show voice join banner
      if (channelType === 'voice' || channelType === 'stage') {
        this.promptVoiceJoin(ch);
      }
    },

    async loadMessagesForCurrentChannel() {
      const scroll = $('#dcMessagesScroll');
      if (!scroll) return;

      const server = communities.find(c => Number(c.id) === Number(activeServerId));
      const topic = server?.topic || 'general';

      // Load initial welcome banner
      scroll.innerHTML = `
        <div class="dc-welcome-banner">
          <div class="dc-welcome-hash">${$('#dcHeaderIcon').textContent}</div>
          <h2 class="dc-welcome-title">Welcome to #${$('#dcHeaderTitle').textContent}!</h2>
          <p class="dc-welcome-desc">This is the start of the #${$('#dcHeaderTitle').textContent} channel. Let's build together.</p>
        </div>
      `;

      try {
        const res = await api(`${API}/communities/${activeServerId}/messages`);
        const messages = Array.isArray(res.messages) ? res.messages : [];
        channelMessages.set(`${activeServerId}:${activeChannelId}`, messages);
        this.renderMessages();
      } catch (err) {
        // Fallback or demo messages
        const cached = channelMessages.get(`${activeServerId}:${activeChannelId}`) || [];
        this.renderMessages(cached);
      }
    },

    renderMessages(customList = null) {
      const scroll = $('#dcMessagesScroll');
      if (!scroll) return;

      const key = `${activeServerId}:${activeChannelId}`;
      const messages = customList || channelMessages.get(key) || [];

      // Keep welcome banner
      const banner = scroll.querySelector('.dc-welcome-banner');
      scroll.innerHTML = '';
      if (banner) scroll.appendChild(banner);

      messages.forEach(msg => {
        const row = this.createMessageElement(msg);
        scroll.appendChild(row);
      });

      scroll.scrollTop = scroll.scrollHeight;
    },

    createMessageElement(msg) {
      const row = document.createElement('div');
      row.className = `dc-message ${pinnedMessageIds.has(Number(msg.id)) ? 'pinned' : ''}`;
      row.id = `dc-msg-${msg.id}`;

      const avatarLetter = (msg.name || '✦')[0].toUpperCase();
      const parsed = parseContent(msg.body);

      // Check role
      let roleBadge = '<span class="dc-role-badge">MEMBER</span>';
      if ((msg.name || '').includes('Punit') || (msg.name || '').includes('Sahil') || msg.user_id === 1) {
        roleBadge = '<span class="dc-role-badge founder">FOUNDER</span>';
      }

      // Check if poll or voice note or attachment in payload
      let richPayloadHtml = '';
      try {
        if (msg.body && msg.body.startsWith('{"_type":')) {
          const payload = JSON.parse(msg.body);
          if (payload._type === 'poll') {
            richPayloadHtml = this.renderPollHtml(payload);
          } else if (payload._type === 'voice') {
            richPayloadHtml = this.renderVoiceHtml(payload);
          } else if (payload._type === 'file') {
            richPayloadHtml = this.renderFileHtml(payload);
          } else if (payload._type === 'sticker') {
            richPayloadHtml = `<img src="${payload.url}" alt="sticker" style="width:140px;height:140px;border-radius:12px;margin-top:6px;object-fit:cover;">`;
          }
        }
      } catch (_) {}

      row.innerHTML = `
        <div class="dc-msg-avatar">${avatarLetter}</div>
        <div class="dc-msg-content-wrap">
          <div class="dc-msg-header">
            <span class="dc-msg-author">${escapeHtml(msg.name || 'Student')}</span>
            ${roleBadge}
            <span class="dc-msg-time">${formatTime(msg.created_at)}</span>
            ${msg.is_tts ? '<span class="dc-tts-badge">🔊 TTS</span>' : ''}
          </div>
          <div class="dc-msg-body">
            ${richPayloadHtml || parsed.html}
            ${parsed.embedHtml}
          </div>

          <!-- Reactions Bar -->
          <div class="dc-reactions-bar" id="reactions-${msg.id}">
            <!-- Dynamically populated or toggled -->
          </div>

          <!-- Thread Trigger if has replies -->
          <div id="thread-trigger-${msg.id}"></div>
        </div>

        <!-- Hover Action Toolbar -->
        <div class="dc-action-bar">
          <button class="dc-act-btn" onclick="window.DiscordClient.quickReact(${msg.id}, '👍')" title="Thumbs Up">👍</button>
          <button class="dc-act-btn" onclick="window.DiscordClient.quickReact(${msg.id}, '❤️')" title="Love">❤️</button>
          <button class="dc-act-btn" onclick="window.DiscordClient.quickReact(${msg.id}, '🔥')" title="Fire">🔥</button>
          <button class="dc-act-btn" onclick="window.DiscordClient.openEmojiModalForMsg(${msg.id})" title="Add Reaction">😊</button>
          <button class="dc-act-btn" onclick="window.DiscordClient.startThread(${msg.id}, '${escapeHtml(msg.name)}')" title="Create Thread">🧵</button>
          <button class="dc-act-btn" onclick="window.DiscordClient.togglePinMessage(${msg.id})" title="Pin Message">📌</button>
          <button class="dc-act-btn" onclick="window.DiscordClient.bookmarkMessage(${msg.id})" title="Bookmark & Set Reminder">🔖</button>
          <button class="dc-act-btn" onclick="window.DiscordClient.speakMessage(${msg.id})" title="Speak aloud (/tts)">🔊</button>
          <button class="dc-act-btn" onclick="window.DiscordClient.deleteMessage(${msg.id})" title="Moderator Delete" style="color:var(--dc-red);">🗑️</button>
        </div>
      `;

      return row;
    },

    // Native Polls Rendering & Voting
    renderPollHtml(poll) {
      const totalVotes = poll.options.reduce((sum, o) => sum + (o.votes || 0), 0);
      const optionsHtml = poll.options.map((opt, idx) => {
        const pct = totalVotes > 0 ? Math.round(((opt.votes || 0) / totalVotes) * 100) : 0;
        return `
          <button class="dc-poll-option-btn ${opt.voted ? 'voted' : ''}" onclick="window.DiscordClient.votePoll('${poll.id}', ${idx})">
            <div class="dc-poll-fill" style="width:${pct}%"></div>
            <span class="dc-poll-opt-label">${escapeHtml(opt.label)}</span>
            <span class="dc-poll-opt-pct">${pct}% (${opt.votes || 0})</span>
          </button>
        `;
      }).join('');

      return `
        <div class="dc-poll-card" id="poll-${poll.id}">
          <div class="dc-poll-header">
            <span class="dc-poll-title">📊 ${escapeHtml(poll.question)}</span>
            <span class="dc-poll-badge">Active Poll</span>
          </div>
          <div class="dc-poll-options">
            ${optionsHtml}
          </div>
          <div class="dc-poll-footer">
            <span>${totalVotes} vote${totalVotes === 1 ? '' : 's'} · ${poll.isMulti ? 'Multiple choices allowed' : 'Single choice'}</span>
            <span>Closes in ${poll.duration || 24} hours</span>
          </div>
        </div>
      `;
    },

    // Voice Message Rendering
    renderVoiceHtml(voice) {
      return `
        <div class="dc-voice-message" id="voice-${voice.id}">
          <button class="dc-voice-play" onclick="window.DiscordClient.playVoiceNote('${voice.url}', this)">▶</button>
          <div class="dc-voice-waves">
            <div class="dc-wave-bar" style="height:14px;"></div>
            <div class="dc-wave-bar" style="height:20px;"></div>
            <div class="dc-wave-bar" style="height:10px;"></div>
            <div class="dc-wave-bar" style="height:22px;"></div>
            <div class="dc-wave-bar" style="height:16px;"></div>
            <div class="dc-wave-bar" style="height:12px;"></div>
            <div class="dc-wave-bar" style="height:18px;"></div>
          </div>
          <span class="dc-voice-time">${voice.duration || '0:05'}</span>
          <button class="dc-voice-speed" onclick="window.DiscordClient.toggleAudioSpeed(this)">1x</button>
        </div>
      `;
    },

    // File Attachments Rendering
    renderFileHtml(file) {
      if (file.mimetype && file.mimetype.startsWith('image/')) {
        return `<img class="dc-inline-image" src="${file.url}" alt="${escapeHtml(file.filename)}" onclick="window.open('${file.url}', '_blank')">`;
      }
      if (file.mimetype && file.mimetype.startsWith('video/')) {
        return `<video class="dc-inline-video" controls src="${file.url}"></video>`;
      }
      return `
        <div class="dc-file-card">
          <span class="dc-file-icon">📄</span>
          <div class="dc-file-meta">
            <a class="dc-file-name" href="${file.url}" download>${escapeHtml(file.filename || 'Attachment')}</a>
            <span class="dc-file-size">${Math.round((file.size || 1024) / 1024)} KB</span>
          </div>
          <span class="dc-nitro-badge">Nitro 1GB Ready</span>
        </div>
      `;
    }
  };


  // EXTENDING DISCORD CLIENT: ACTIONS, SENDING, VOICE, VIDEO, FORUM & MODERATION
  Object.assign(window.DiscordClient, {
    // SEND MESSAGE HANDLER
    async sendMessage() {
      const input = $('#dcMessageInput');
      let text = (input?.value || '').trim();
      if (!text) return;

      // Check AutoMod
      const check = runAutoMod(text);
      if (!check.allowed) {
        showToast(check.reason);
        return;
      }

      input.value = '';
      $('#dcStickerSuggestions').classList.remove('open');

      // Slash command: /tts <message>
      let isTTS = false;
      if (text.startsWith('/tts ')) {
        isTTS = true;
        text = text.slice(5).trim();
        speakText(text);
      }

      // Slash command: /summary (AI Channel Discussion Summary)
      if (text === '/summary') {
        this.generateChannelSummary();
        return;
      }

      // Slash command: /poll
      if (text.startsWith('/poll ')) {
        const parts = text.slice(6).split('|').map(s => s.trim()).filter(Boolean);
        if (parts.length >= 3) {
          const question = parts[0];
          const options = parts.slice(1).map(opt => ({ label: opt, votes: 0 }));
          this.postPollPayload(question, options, false, 24);
          return;
        }
      }

      try {
        const payload = { body: text, is_tts: isTTS };
        const res = await api(`${API}/communities/${activeServerId}/messages`, {
          method: 'POST',
          body: JSON.stringify(payload)
        });

        if (res.message) {
          this.appendMessageLocally(res.message);
        }
      } catch (err) {
        // Offline / Demo simulate
        const mockMsg = {
          id: Date.now(),
          community_id: activeServerId,
          user_id: currentUser?.id || 1,
          name: currentUser?.name || 'You',
          body: text,
          created_at: new Date().toISOString(),
          is_tts: isTTS
        };
        this.appendMessageLocally(mockMsg);
      }
    },

    appendMessageLocally(msg) {
      const key = `${activeServerId}:${activeChannelId}`;
      const list = channelMessages.get(key) || [];
      list.push(msg);
      channelMessages.set(key, list);

      const scroll = $('#dcMessagesScroll');
      if (scroll && scroll.style.display !== 'none') {
        const el = this.createMessageElement(msg);
        scroll.appendChild(el);
        scroll.scrollTop = scroll.scrollHeight;
      }
    },

    // AI CHANNEL SUMMARY GENERATOR (/summary)
    generateChannelSummary() {
      const key = `${activeServerId}:${activeChannelId}`;
      const list = channelMessages.get(key) || [];
      const topics = list.slice(-10).map(m => m.body).filter(b => !b.startsWith('{')).slice(0, 5);

      const summaryText = `
**✨ Automated AI Channel Summary for #${$('#dcHeaderTitle').textContent}**:
• **Active Discussion Points**: Collaborative development, Supabase connection pooling, WebSockets, and UI components.
• **Recent Highlights**: ${topics.length > 0 ? topics.slice(0, 3).join(' • ') : 'General member introductions and peer matching setup.'}
• **Action Items**: Test deployment link, review pins in channel, and join voice lounge for group review!
      `.trim();

      const summaryMsg = {
        id: Date.now(),
        community_id: activeServerId,
        user_id: 0,
        name: 'SkillMate Bot [AI]',
        body: summaryText,
        created_at: new Date().toISOString()
      };
      this.appendMessageLocally(summaryMsg);
      showToast('✨ Channel summary generated!');
    },

    // VOICE MESSAGE RECORDER (MediaRecorder API)
    async startVoiceRecord() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        recordedAudioChunks = [];

        mediaRecorder.ondataavailable = e => {
          if (e.data.size > 0) recordedAudioChunks.push(e.data);
        };

        mediaRecorder.start();
        recordSeconds = 0;

        $('#dcNormalTools').style.display = 'none';
        $('#dcVoiceRecordBar').style.display = 'flex';
        $('#dcRecordTimer').textContent = '0:00';

        recordTimerInterval = setInterval(() => {
          recordSeconds++;
          const mins = Math.floor(recordSeconds / 60);
          const secs = recordSeconds % 60;
          $('#dcRecordTimer').textContent = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
        }, 1000);
      } catch (err) {
        showToast('Microphone access denied or not available.');
      }
    },

    cancelVoiceRecord() {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(t => t.stop());
      }
      clearInterval(recordTimerInterval);
      $('#dcNormalTools').style.display = 'flex';
      $('#dcVoiceRecordBar').style.display = 'none';
    },

    stopAndSendVoiceRecord() {
      if (!mediaRecorder) return;
      mediaRecorder.onstop = async () => {
        clearInterval(recordTimerInterval);
        $('#dcNormalTools').style.display = 'flex';
        $('#dcVoiceRecordBar').style.display = 'none';

        const audioBlob = new Blob(recordedAudioChunks, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('file', audioBlob, 'voicenote.webm');

        let audioUrl = '';
        try {
          const uploadRes = await fetch(`${API}/discord/upload`, {
            method: 'POST',
            body: formData
          }).then(r => r.json());
          audioUrl = uploadRes.url;
        } catch (_) {
          audioUrl = URL.createObjectURL(audioBlob);
        }

        const mins = Math.floor(recordSeconds / 60);
        const secs = recordSeconds % 60;
        const durStr = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

        const payload = {
          _type: 'voice',
          id: Date.now(),
          url: audioUrl,
          duration: durStr
        };

        const res = await api(`${API}/communities/${activeServerId}/messages`, {
          method: 'POST',
          body: JSON.stringify({ body: JSON.stringify(payload) })
        }).catch(() => null);

        const voiceMsg = {
          id: Date.now(),
          community_id: activeServerId,
          user_id: currentUser?.id || 1,
          name: currentUser?.name || 'You',
          body: JSON.stringify(payload),
          created_at: new Date().toISOString()
        };
        this.appendMessageLocally(voiceMsg);
        showToast('🎤 Voice note sent!');
      };

      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(t => t.stop());
    },

    playVoiceNote(url, btn) {
      const container = btn.closest('.dc-voice-message');
      let audio = btn._audio;
      if (!audio) {
        audio = new Audio(url);
        btn._audio = audio;
        audio.onended = () => {
          btn.textContent = '▶';
          container?.classList.remove('playing');
        };
      }

      if (audio.paused) {
        audio.play();
        btn.textContent = '⏸';
        container?.classList.add('playing');
      } else {
        audio.pause();
        btn.textContent = '▶';
        container?.classList.remove('playing');
      }
    },

    toggleAudioSpeed(btn) {
      const parent = btn.closest('.dc-voice-message');
      const playBtn = parent?.querySelector('.dc-voice-play');
      const audio = playBtn?._audio;
      const speeds = ['1x', '1.5x', '2x'];
      const nextIdx = (speeds.indexOf(btn.textContent) + 1) % speeds.length;
      btn.textContent = speeds[nextIdx];
      if (audio) {
        audio.playbackRate = parseFloat(speeds[nextIdx]);
      }
    },

    // FILE ATTACHMENTS
    toggleAttachMenu() {
      $('#dcFileInput')?.click();
    },

    async handleFileUpload(file) {
      if (!file) return;
      showToast(`Uploading ${file.name}...`);
      const formData = new FormData();
      formData.append('file', file);

      try {
        const uploadRes = await fetch(`${API}/discord/upload`, {
          method: 'POST',
          body: formData
        }).then(r => r.json());

        const filePayload = {
          _type: 'file',
          filename: file.name,
          url: uploadRes.url,
          mimetype: file.type,
          size: file.size
        };

        await api(`${API}/communities/${activeServerId}/messages`, {
          method: 'POST',
          body: JSON.stringify({ body: JSON.stringify(filePayload) })
        });

        const fileMsg = {
          id: Date.now(),
          community_id: activeServerId,
          user_id: currentUser?.id || 1,
          name: currentUser?.name || 'You',
          body: JSON.stringify(filePayload),
          created_at: new Date().toISOString()
        };
        this.appendMessageLocally(fileMsg);
        showToast('📁 File shared in channel!');
      } catch (err) {
        showToast('File upload failed.');
      }
    },

    // STICKER SUGGESTIONS POPUP
    handleInputStickerSuggestions(text) {
      const popover = $('#dcStickerSuggestions');
      const list = $('#dcSuggestList');
      if (!popover || !list) return;

      const match = text.match(/:[a-zA-Z0-9_-]+$/);
      if (match) {
        const query = match[0].toLowerCase();
        const matches = STICKER_CATALOG.filter(s => s.trigger.startsWith(query) || s.name.toLowerCase().includes(query.slice(1)));
        if (matches.length > 0) {
          list.innerHTML = matches.map(s => `
            <div class="dc-suggest-item" onclick="window.DiscordClient.sendSticker('${s.url}', '${s.name}')">
              <img class="dc-suggest-img" src="${s.url}" alt="${s.name}">
              <span class="dc-suggest-name">${s.name}</span>
            </div>
          `).join('');
          popover.classList.add('open');
          return;
        }
      }
      popover.classList.remove('open');
    },

    sendSticker(url, name) {
      $('#dcStickerSuggestions')?.classList.remove('open');
      $('#dcMessageInput').value = '';
      const payload = { _type: 'sticker', url, name };
      this.appendMessageLocally({
        id: Date.now(),
        community_id: activeServerId,
        user_id: currentUser?.id || 1,
        name: currentUser?.name || 'You',
        body: JSON.stringify(payload),
        created_at: new Date().toISOString()
      });
      showToast(`🏷️ Sent sticker: ${name}`);
    },

    openStickerPicker() {
      const popover = $('#dcStickerSuggestions');
      const list = $('#dcSuggestList');
      if (!popover || !list) return;
      list.innerHTML = STICKER_CATALOG.map(s => `
        <div class="dc-suggest-item" onclick="window.DiscordClient.sendSticker('${s.url}', '${s.name}')">
          <img class="dc-suggest-img" src="${s.url}" alt="${s.name}">
          <span class="dc-suggest-name">${s.name}</span>
        </div>
      `).join('');
      popover.classList.toggle('open');
    },

    // NATIVE POLLS
    openPollModal() {
      $('#dcPollModal').style.display = 'flex';
      $('#dcPollQuestion').value = '';
      $$('.dc-poll-opt-input').forEach(inp => inp.value = '');
    },

    addPollOptionField() {
      const container = $('#dcPollOptionsContainer');
      const count = container.querySelectorAll('input').length;
      if (count >= 10) {
        showToast('Maximum 10 poll options allowed.');
        return;
      }
      const inp = document.createElement('input');
      inp.type = 'text';
      inp.className = 'dc-poll-opt-input';
      inp.placeholder = `Option ${count + 1}`;
      inp.style.cssText = 'background:#1e1f22;border:none;border-radius:6px;padding:8px 10px;color:#fff;';
      container.appendChild(inp);
    },

    submitPoll() {
      const question = ($('#dcPollQuestion').value || '').trim();
      const options = $$('.dc-poll-opt-input')
        .map(i => i.value.trim())
        .filter(Boolean)
        .map(label => ({ label, votes: 0, voted: false }));

      if (!question) {
        showToast('Please enter a poll question.');
        return;
      }
      if (options.length < 2) {
        showToast('Please provide at least 2 options.');
        return;
      }

      const isMulti = $('#dcPollMultiSelect').checked;
      const duration = parseInt($('#dcPollDuration').value) || 24;

      $('#dcPollModal').style.display = 'none';
      this.postPollPayload(question, options, isMulti, duration);
    },

    async postPollPayload(question, options, isMulti, duration) {
      const pollId = `poll_${Date.now()}`;
      const payload = {
        _type: 'poll',
        id: pollId,
        question,
        options,
        isMulti,
        duration,
        createdAt: Date.now()
      };
      activePolls.set(pollId, payload);

      await api(`${API}/communities/${activeServerId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ body: JSON.stringify(payload) })
      }).catch(() => null);

      this.appendMessageLocally({
        id: Date.now(),
        community_id: activeServerId,
        user_id: currentUser?.id || 1,
        name: currentUser?.name || 'You',
        body: JSON.stringify(payload),
        created_at: new Date().toISOString()
      });

      showToast('📊 Poll published to channel!');
    },

    votePoll(pollId, optionIndex) {
      const pollCard = $(`#poll-${pollId}`);
      if (!pollCard) return;

      const opts = pollCard.querySelectorAll('.dc-poll-option-btn');
      opts.forEach((btn, idx) => {
        if (idx === optionIndex) {
          btn.classList.toggle('voted');
        }
      });
      showToast('Vote submitted!');
    },

    // REACTIONS & SUPER REACTIONS
    openEmojiModalForMsg(msgId) {
      this._targetMsgId = msgId;
      $('#dcEmojiModal').style.display = 'flex';
    },

    openEmojiPicker() {
      const lastMsg = $$('.dc-message').slice(-1)[0];
      if (lastMsg) {
        const id = lastMsg.id.replace('dc-msg-', '');
        this.openEmojiModalForMsg(id);
      } else {
        showToast('Select a message to add a reaction.');
      }
    },

    pickReaction(emoji, isSuper = false) {
      $('#dcEmojiModal').style.display = 'none';
      if (!this._targetMsgId) return;
      this.toggleReaction(this._targetMsgId, emoji, isSuper);
    },

    quickReact(msgId, emoji) {
      this.toggleReaction(msgId, emoji, false);
    },

    toggleReaction(msgId, emoji, isSuper = false) {
      const bar = $(`#reactions-${msgId}`);
      if (!bar) return;

      let chip = bar.querySelector(`[data-emoji="${emoji}"]`);
      if (chip) {
        let count = parseInt(chip.getAttribute('data-count') || '1');
        if (chip.classList.contains('me')) {
          count--;
          chip.classList.remove('me');
          if (count <= 0) chip.remove();
          else {
            chip.setAttribute('data-count', count);
            chip.querySelector('.dc-r-count').textContent = count;
          }
        } else {
          count++;
          chip.classList.add('me');
          chip.setAttribute('data-count', count);
          chip.querySelector('.dc-r-count').textContent = count;
        }
      } else {
        chip = document.createElement('div');
        chip.className = `dc-reaction-chip me ${isSuper ? 'dc-super-reaction' : ''}`;
        chip.setAttribute('data-emoji', emoji);
        chip.setAttribute('data-count', '1');
        chip.onclick = () => this.toggleReaction(msgId, emoji, isSuper);
        chip.innerHTML = `<span>${emoji}</span> <span class="dc-r-count">1</span>`;
        bar.appendChild(chip);

        if (isSuper) {
          showToast(`⚡ Sent animated Super Reaction ${emoji}!`);
        }
      }

      const sock = getSocket();
      if (sock) {
        sock.emit('discord:reaction', {
          channelId: activeServerId,
          messageId: msgId,
          emoji,
          isSuper
        });
      }
    },

    // PINNED MESSAGES (Pins Panel & Jump-to)
    togglePinMessage(msgId) {
      const id = Number(msgId);
      const isPinned = pinnedMessageIds.has(id);
      if (isPinned) pinnedMessageIds.delete(id);
      else pinnedMessageIds.add(id);

      $(`#dc-msg-${msgId}`)?.classList.toggle('pinned', !isPinned);
      showToast(!isPinned ? '📌 Message pinned to channel!' : 'Message unpinned.');

      const sock = getSocket();
      if (sock) {
        sock.emit('discord:pin', {
          channelId: activeServerId,
          messageId: id,
          isPinned: !isPinned
        });
      }

      if (activeSidePanel === 'pins') this.renderPinsPanel();
    },

    jumpToMessage(msgId) {
      const msgEl = $(`#dc-msg-${msgId}`);
      if (msgEl) {
        msgEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        msgEl.classList.remove('highlighted');
        void msgEl.offsetWidth; // trigger reflow
        msgEl.classList.add('highlighted');
      }
    },

    // BOOKMARKS & REMINDERS
    bookmarkMessage(msgId) {
      const msgEl = $(`#dc-msg-${msgId}`);
      const text = msgEl?.querySelector('.dc-msg-body')?.textContent || 'Message';
      const author = msgEl?.querySelector('.dc-msg-author')?.textContent || 'Author';

      bookmarkedMessages.set(msgId, {
        id: msgId,
        author,
        text,
        savedAt: new Date().toLocaleTimeString()
      });

      showToast('🔖 Saved message to bookmarks! Reminder set for 1 hour.');
      setTimeout(() => {
        showToast(`⏰ REMINDER: "${text.slice(0, 40)}..." from ${author}`);
      }, 30000); // 30s demo alert
    },

    // PUBLIC AND PRIVATE THREADS
    startThread(msgId, author) {
      activeThreadId = msgId;
      this.toggleSidePanel('threads');
    },

    // TEXT-TO-SPEECH
    speakMessage(msgId) {
      const msgEl = $(`#dc-msg-${msgId}`);
      const text = msgEl?.querySelector('.dc-msg-body')?.textContent || '';
      speakText(text);
    },

    // MODERATOR DELETE
    deleteMessage(msgId) {
      deleteMessageLocally(msgId);
      const sock = getSocket();
      if (sock) {
        sock.emit('discord:moderation', {
          channelId: activeServerId,
          messageId: msgId,
          action: 'delete',
          reason: 'Moderator deleted'
        });
      }
      showToast('🗑️ Message removed by moderator.');
    },

    // SIDE PANELS (Pins, Threads, Bookmarks, Members, In-Voice Text Chat)
    toggleSidePanel(panelType) {
      const panel = $('#dcSidePanel');
      if (activeSidePanel === panelType && panel.style.display !== 'none') {
        this.closeSidePanel();
        return;
      }

      activeSidePanel = panelType;
      panel.style.display = 'flex';
      const body = $('#dcPanelBody');
      const title = $('#dcPanelTitle');

      if (panelType === 'pins') {
        title.textContent = '📌 Pinned Messages';
        this.renderPinsPanel();
      } else if (panelType === 'threads') {
        title.textContent = '🧵 Focused Thread';
        this.renderThreadsPanel();
      } else if (panelType === 'bookmarks') {
        title.textContent = '🔖 Bookmarks & Reminders';
        this.renderBookmarksPanel();
      } else if (panelType === 'members') {
        title.textContent = '👥 Server Members';
        this.renderMembersPanel();
      } else if (panelType === 'voice-chat') {
        title.textContent = '💬 Text Chat in Voice';
        this.renderInVoiceTextChat();
      }
    },

    closeSidePanel() {
      activeSidePanel = null;
      $('#dcSidePanel').style.display = 'none';
    },

    renderPinsPanel() {
      const body = $('#dcPanelBody');
      if (!body) return;
      body.innerHTML = '';

      if (pinnedMessageIds.size === 0) {
        body.innerHTML = '<div style="color:var(--dc-text-muted);font-size:13px;text-align:center;margin-top:20px;">No pinned messages in this channel. Hover any message and click 📌 to pin.</div>';
        return;
      }

      pinnedMessageIds.forEach(id => {
        const msgEl = $(`#dc-msg-${id}`);
        const text = msgEl?.querySelector('.dc-msg-body')?.innerHTML || 'Pinned conversation';
        const author = msgEl?.querySelector('.dc-msg-author')?.textContent || 'Member';

        const card = document.createElement('div');
        card.style.cssText = 'background:#1e1f22;padding:12px;border-radius:8px;border-left:3px solid var(--dc-yellow);display:flex;flex-direction:column;gap:6px;';
        card.innerHTML = `
          <div style="font-size:12px;font-weight:700;color:#fff;">${author}</div>
          <div style="font-size:13px;color:var(--dc-text-interactive);">${text}</div>
          <button class="dc-btn-secondary" style="align-self:flex-end;font-size:11px;color:var(--dc-yellow);" onclick="window.DiscordClient.jumpToMessage(${id})">Jump to Message ➔</button>
        `;
        body.appendChild(card);
      });
    },

    renderThreadsPanel() {
      const body = $('#dcPanelBody');
      if (!body) return;
      body.innerHTML = `
        <div style="font-size:12px;color:var(--dc-text-muted);margin-bottom:8px;">Sub-conversation branched off message #${activeThreadId || '1'}</div>
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:12px;">
          <label style="font-size:11px;color:var(--dc-text-muted);">Auto-hide after:</label>
          <select style="background:#1e1f22;color:#fff;border:none;border-radius:4px;padding:4px;font-size:11px;">
            <option>1 Hour</option>
            <option selected>24 Hours</option>
            <option>3 Days</option>
            <option>1 Week</option>
          </select>
        </div>
        <div id="dcThreadReplies" style="flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:8px;">
          <div style="font-size:13px;background:#1e1f22;padding:8px;border-radius:6px;color:#fff;">
            <strong>Sahil:</strong> I tested this on the Render staging link, works seamlessly!
          </div>
        </div>
        <div style="margin-top:12px;display:flex;gap:6px;">
          <input type="text" id="dcThreadInput" placeholder="Reply in thread..." style="flex:1;background:#1e1f22;border:none;border-radius:6px;padding:8px;color:#fff;font-size:12px;" onkeydown="if(event.key==='Enter')window.DiscordClient.sendThreadReply()">
          <button class="dc-btn-primary" onclick="window.DiscordClient.sendThreadReply()">Send</button>
        </div>
      `;
    },

    sendThreadReply() {
      const inp = $('#dcThreadInput');
      const text = (inp?.value || '').trim();
      if (!text) return;
      inp.value = '';

      const container = $('#dcThreadReplies');
      const item = document.createElement('div');
      item.style.cssText = 'font-size:13px;background:#1e1f22;padding:8px;border-radius:6px;color:#fff;';
      item.innerHTML = `<strong>You:</strong> ${escapeHtml(text)}`;
      container.appendChild(item);
      showToast('🧵 Thread reply added!');
    },

    renderBookmarksPanel() {
      const body = $('#dcPanelBody');
      if (!body) return;
      body.innerHTML = '';

      if (bookmarkedMessages.size === 0) {
        body.innerHTML = '<div style="color:var(--dc-text-muted);font-size:13px;text-align:center;margin-top:20px;">No saved bookmarks yet. Hover any message and click 🔖 to save.</div>';
        return;
      }

      bookmarkedMessages.forEach(b => {
        const item = document.createElement('div');
        item.style.cssText = 'background:#1e1f22;padding:12px;border-radius:8px;display:flex;flex-direction:column;gap:6px;';
        item.innerHTML = `
          <div style="font-size:12px;font-weight:700;color:#00a8fc;">🔖 ${b.author} · Saved at ${b.savedAt}</div>
          <div style="font-size:13px;color:var(--dc-text-interactive);">${escapeHtml(b.text)}</div>
          <span style="font-size:11px;color:var(--dc-green);">⏰ Reminder active</span>
        `;
        body.appendChild(item);
      });
    },

    renderMembersPanel() {
      const body = $('#dcPanelBody');
      if (!body) return;
      body.innerHTML = `
        <div style="font-size:11px;font-weight:800;color:var(--dc-text-muted);text-transform:uppercase;">FOUNDERS — 2</div>
        <div style="display:flex;align-items:center;gap:8px;padding:6px;cursor:pointer;">
          <div style="width:30px;height:30px;border-radius:50%;background:var(--dc-yellow);display:flex;align-items:center;justify-content:center;font-weight:700;color:#000;">P</div>
          <div style="display:flex;flex-direction:column;"><span style="font-size:13px;font-weight:700;color:#fff;">Punit</span><span style="font-size:10px;color:var(--dc-yellow);">FOUNDER</span></div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;padding:6px;cursor:pointer;">
          <div style="width:30px;height:30px;border-radius:50%;background:var(--dc-yellow);display:flex;align-items:center;justify-content:center;font-weight:700;color:#000;">S</div>
          <div style="display:flex;flex-direction:column;"><span style="font-size:13px;font-weight:700;color:#fff;">Sahil</span><span style="font-size:10px;color:var(--dc-yellow);">FOUNDER</span></div>
        </div>

        <div style="font-size:11px;font-weight:800;color:var(--dc-text-muted);text-transform:uppercase;margin-top:14px;">ONLINE MEMBERS — 4</div>
        <div style="display:flex;align-items:center;gap:8px;padding:6px;cursor:pointer;">
          <div style="width:30px;height:30px;border-radius:50%;background:var(--dc-blurple);display:flex;align-items:center;justify-content:center;font-weight:700;color:#fff;">Y</div>
          <span style="font-size:13px;color:#fff;">You (Project Lead)</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px;padding:6px;cursor:pointer;">
          <div style="width:30px;height:30px;border-radius:50%;background:#57F287;display:flex;align-items:center;justify-content:center;font-weight:700;color:#000;">A</div>
          <span style="font-size:13px;color:#fff;">Alex Developer</span>
        </div>
      `;
    },

    renderInVoiceTextChat() {
      const body = $('#dcPanelBody');
      if (!body) return;
      body.innerHTML = `
        <div style="font-size:12px;color:var(--dc-text-muted);margin-bottom:8px;">Integrated side chat for current voice/video call. Message without interrupting audio stream.</div>
        <div id="dcVoiceChatMessages" style="flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:8px;padding:4px;">
          <div style="font-size:12px;background:#1e1f22;padding:8px;border-radius:6px;color:#fff;">
            <strong>Punit:</strong> I am sharing my screen now to show the database schema.
          </div>
        </div>
        <div style="margin-top:12px;display:flex;gap:6px;">
          <input type="text" id="dcVoiceChatInput" placeholder="Message call members..." style="flex:1;background:#1e1f22;border:none;border-radius:6px;padding:8px;color:#fff;font-size:12px;" onkeydown="if(event.key==='Enter')window.DiscordClient.sendVoiceChatMessage()">
          <button class="dc-btn-primary" onclick="window.DiscordClient.sendVoiceChatMessage()">Send</button>
        </div>
      `;
    },

    sendVoiceChatMessage() {
      const inp = $('#dcVoiceChatInput');
      const text = (inp?.value || '').trim();
      if (!text) return;
      inp.value = '';

      const container = $('#dcVoiceChatMessages');
      const item = document.createElement('div');
      item.style.cssText = 'font-size:12px;background:#1e1f22;padding:8px;border-radius:6px;color:#fff;';
      item.innerHTML = `<strong>You:</strong> ${escapeHtml(text)}`;
      container.appendChild(item);
    },

    // FORUM CHANNELS
    renderForumPosts() {
      const container = $('#dcForumPostsScroll');
      if (!container) return;
      container.innerHTML = '';

      const searchVal = ($('#dcForumSearch')?.value || '').toLowerCase();
      const demoPosts = [
        { id: 1, title: 'How to scale Socket.IO connections on cloud platforms?', author: 'Punit', tag: 'Question', replies: 8, excerpt: 'We are setting up Redis adapter for multi-instance socket scaling. Anyone have benchmarks?' },
        { id: 2, title: 'Full-Stack Showcase: SkillMate AI Peer Matching Live on Render', author: 'Sahil', tag: 'Showcase', replies: 14, excerpt: 'Check out our clean architecture with Supabase PostgreSQL and automated GitHub CI/CD.' },
        { id: 3, title: 'Tutorial: Implementing Parameterized SQL queries to block 100% of injections', author: 'Project Lead', tag: 'Tutorial', replies: 19, excerpt: 'First principles explanation of placeholders ($1, $2) and DB query compilation steps.' }
      ];

      demoPosts.filter(p => !searchVal || p.title.toLowerCase().includes(searchVal) || p.excerpt.toLowerCase().includes(searchVal)).forEach(p => {
        const card = document.createElement('div');
        card.className = 'dc-forum-card';
        card.onclick = () => {
          showToast(`Opened forum post: ${p.title}`);
        };
        card.innerHTML = `
          <div style="display:flex;align-items:center;gap:6px;">
            <span class="dc-tag-pill active" style="font-size:10px;padding:2px 8px;">${p.tag}</span>
            <span style="font-size:11px;color:var(--dc-text-muted);">Posted by ${p.author}</span>
          </div>
          <div class="dc-fc-title">${escapeHtml(p.title)}</div>
          <div class="dc-fc-excerpt">${escapeHtml(p.excerpt)}</div>
          <div class="dc-fc-footer">
            <span>💬 ${p.replies} comments</span>
            <span>👍 12 reactions</span>
          </div>
        `;
        container.appendChild(card);
      });
    },

    toggleForumLayout() {
      const container = $('#dcForumPostsScroll');
      container?.classList.toggle('list-layout');
      showToast('Toggled Forum List/Gallery layout');
    },

    filterForumTag(tag) {
      $$('#dcForumTags .dc-tag-pill').forEach(p => p.classList.remove('active'));
      event.target.classList.add('active');
      this.renderForumPosts();
    },

    openNewForumPostModal() {
      const title = prompt('Enter Forum Post Title:');
      if (!title) return;
      const content = prompt('Enter Post Content / Details:');
      if (!content) return;

      showToast('📋 New Forum Post published!');
      this.renderForumPosts();
    },

    // VIDEO AND VOICE CALLING SYSTEM
    async startVideoCall() {
      activeCallChannel = activeChannelId;
      const overlay = $('#dcCallOverlay');
      overlay.classList.add('active');
      $('#dcCallRoomTitle').textContent = `📹 Group Video Call · #${$('#dcHeaderTitle').textContent}`;

      try {
        localStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        const video = $('#dcLocalVideo');
        if (video) {
          video.srcObject = localStream;
          video.style.display = 'block';
        }
        $('#dcLocalAvatar').style.display = 'none';
        showToast('📹 Camera & Microphone connected!');
      } catch (err) {
        // Fallback audio only
        showToast('Camera not available; joined voice-only mode.');
        $('#dcLocalVideo').style.display = 'none';
        $('#dcLocalAvatar').style.display = 'flex';
      }

      const sock = getSocket();
      if (sock) {
        sock.emit('discord:call:join', {
          channelId: activeServerId,
          userName: currentUser?.name || 'You',
          hasVideo: Boolean(localStream)
        });
      }
    },

    toggleVideoCam() {
      if (!localStream) return;
      const track = localStream.getVideoTracks()[0];
      if (track) {
        track.enabled = !track.enabled;
        isVideoOff = !track.enabled;
        $('#dcLocalVideo').style.display = isVideoOff ? 'none' : 'block';
        $('#dcLocalAvatar').style.display = isVideoOff ? 'flex' : 'none';
        $('#dcCallBtnCam').classList.toggle('active', isVideoOff);
        showToast(isVideoOff ? 'Camera turned off' : 'Camera turned on');
      }
    },

    toggleCallMic() {
      if (!localStream) return;
      const track = localStream.getAudioTracks()[0];
      if (track) {
        track.enabled = !track.enabled;
        isMuted = !track.enabled;
        $('#dcCallBtnMic').classList.toggle('active', isMuted);
        showToast(isMuted ? 'Microphone muted' : 'Microphone unmuted');
      }
    },

    async toggleScreenShare() {
      if (!isScreenSharing) {
        try {
          screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
          const video = $('#dcLocalVideo');
          if (video) video.srcObject = screenStream;
          isScreenSharing = true;
          $('#dcCallBtnScreen').classList.add('active');
          showToast('🖥️ Screen sharing active!');

          screenStream.getVideoTracks()[0].onended = () => {
            this.stopScreenShare();
          };
        } catch (_) {
          showToast('Screen share cancelled.');
        }
      } else {
        this.stopScreenShare();
      }
    },

    stopScreenShare() {
      if (screenStream) {
        screenStream.getTracks().forEach(t => t.stop());
        screenStream = null;
      }
      if (localStream) {
        const video = $('#dcLocalVideo');
        if (video) video.srcObject = localStream;
      }
      isScreenSharing = false;
      $('#dcCallBtnScreen').classList.remove('active');
      showToast('Screen share stopped');
    },

    leaveCall() {
      if (localStream) {
        localStream.getTracks().forEach(t => t.stop());
        localStream = null;
      }
      if (screenStream) {
        screenStream.getTracks().forEach(t => t.stop());
        screenStream = null;
      }
      $('#dcCallOverlay')?.classList.remove('active');
      activeCallChannel = null;
      showToast('📞 Disconnected from call.');

      const sock = getSocket();
      if (sock) sock.emit('discord:call:leave', { channelId: activeServerId });
    },

    promptVoiceJoin(ch) {
      if (confirm(`Join ${ch.name} Voice/Stage Channel now?`)) {
        this.startVideoCall();
      }
    },

    // SEARCH (Ctrl+F)
    handleSearch(val) {
      const q = (val || '').toLowerCase().trim();
      const messages = $$('.dc-message');
      if (!q) {
        messages.forEach(m => m.style.display = 'flex');
        return;
      }
      let matches = 0;
      messages.forEach(m => {
        const text = m.textContent.toLowerCase();
        if (text.includes(q)) {
          m.style.display = 'flex';
          matches++;
        } else {
          m.style.display = 'none';
        }
      });
    },

    // TYPING BROADCAST
    broadcastTyping() {
      const sock = getSocket();
      if (sock) {
        sock.emit('discord:typing', {
          channelId: activeServerId,
          username: currentUser?.name || 'Someone',
          isTyping: true
        });
      }
    },

    // USER SETTINGS MODAL
    openUserSettings() {
      alert(`User Settings for ${currentUser?.name || 'You'}:\n• Theme: Dark (Discord Pro)\n• Notification: All Messages\n• WebRTC Audio: Active\n• AutoMod Level: Strict Filtering\n• Nitro Status: Level 3 Boost Active!`);
    },

    // SERVER DROPDOWN
    toggleServerDropdown() {
      alert(`Server Actions for ${$('#dcServerTitle').textContent}:\n1. Server Settings & Roles\n2. Notification Settings\n3. Privacy & Safety\n4. Create Channel\n5. Server Boost (Level 3 Active!)`);
    },

    openCreateServerModal() {
      const name = prompt('Enter New Server Name:');
      if (name) {
        showToast(`Server "${name}" created!`);
      }
    },

    openDiscoveryModal() {
      showToast('🧭 Browsing 18 Public Discoverable Communities on SkillMate.');
    }
  });

  function deleteMessageLocally(msgId) {
    $(`#dc-msg-${msgId}`)?.remove();
  }

  function handleIncomingMessage(msg) {
    if (Number(msg.community_id) === Number(activeServerId)) {
      window.DiscordClient.appendMessageLocally(msg);
    }
  }

  function handleTypingIndicator(data) {
    const el = $('#dcTypingIndicator');
    if (!el) return;
    if (data.isTyping) {
      el.textContent = `${data.username} is typing...`;
      clearTimeout(el._timer);
      el._timer = setTimeout(() => { el.textContent = ''; }, 3000);
    }
  }

  function handleIncomingReaction(data) {
    window.DiscordClient.toggleReaction(data.messageId, data.emoji, data.isSuper);
  }

  function handleIncomingPollVote(data) {
    window.DiscordClient.votePoll(data.messageId, data.optionIndex);
  }

  // OVERRIDE & HOOK SKILLMATE INTEGRATION
  window.openDiscord = (serverId, channelId) => window.DiscordClient.openDiscord(serverId, channelId);

  // Hook into openChat
  const originalOpenChat = window.openChat;
  window.openChat = function(personId) {
    window.DiscordClient.openDiscord(null, 'general');
  };

  // Sync Community card buttons
  function syncCommunityCards() {
    $$('.community-card').forEach(card => {
      const topic = card.querySelector('.community-topic-pill')?.textContent?.trim();
      let btn = card.querySelector('.community-chat-button');
      if (btn) {
        btn.textContent = '💬 Open Discord Channel';
        btn.onclick = (e) => {
          e.stopPropagation();
          const match = communities.find(c => (c.topic || '').toLowerCase() === (topic || '').toLowerCase());
          window.DiscordClient.openDiscord(match ? match.id : null, 'general');
        };
      }
    });
  }

  // Auto initialize on load
  window.addEventListener('DOMContentLoaded', () => {
    window.DiscordClient.init();
    setInterval(syncCommunityCards, 1500);
  });

  // If already loaded
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    window.DiscordClient.init();
    setInterval(syncCommunityCards, 1500);
  }


})();
