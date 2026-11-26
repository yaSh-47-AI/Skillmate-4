(() => {
  'use strict';

  // 1. INJECT SLEEK DARK GLASSMORPHISM STYLES
  const styleEl = document.createElement('style');
  styleEl.id = 'glass-messenger-styles';
  styleEl.textContent = `
    :root {
      --gc-bg-base: #0B1410;
      --gc-bg-glass: rgba(14, 24, 19, 0.84);
      --gc-bg-sidebar: rgba(11, 20, 16, 0.86);
      --gc-bg-input: rgba(24, 39, 31, 0.9);
      --gc-bg-card-hover: rgba(197, 217, 169, 0.08);
      --gc-border: rgba(203, 224, 190, 0.12);
      --gc-border-focus: rgba(197, 217, 169, 0.55);
      --gc-purple-primary: #C5D9A9;
      --gc-purple-gradient: linear-gradient(135deg, #D2E4B8 0%, #99C58D 100%);
      --gc-purple-glow: 0 0 22px rgba(197, 217, 169, 0.3);
      --gc-text-main: #F3F6F1;
      --gc-text-muted: rgba(200, 215, 198, 0.58);
      --gc-online: #84C99A;
      --gc-idle: #eab308;
      --gc-dnd: #ef4444;
      --gc-font: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    #glassChatContainer {
      position: fixed;
      inset: 0;
      z-index: 99999;
      background: var(--gc-bg-base);
      background-image: 
        radial-gradient(circle at 18% 20%, rgba(74, 118, 86, 0.28) 0%, transparent 50%),
        radial-gradient(circle at 82% 80%, rgba(197, 217, 169, 0.14) 0%, transparent 50%),
        radial-gradient(circle at 50% 50%, rgba(45, 90, 64, 0.16) 0%, transparent 65%);
      color: var(--gc-text-main);
      font-family: var(--gc-font);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }
    #glassChatContainer.open {
      opacity: 1;
      pointer-events: auto;
    }

    /* Top Messenger Header */
    .gc-topbar {
      height: 54px;
      background: rgba(14, 12, 22, 0.75);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--gc-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      flex-shrink: 0;
      z-index: 100;
    }
    .gc-topbar-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .gc-brand {
      font-size: 17px;
      font-weight: 800;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .gc-brand span {
      background: var(--gc-purple-gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .gc-topbar-right {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .gc-btn-new-recruitment {
      background: rgba(168, 85, 247, 0.15);
      border: 1px solid rgba(168, 85, 247, 0.4);
      color: #e9d5ff;
      border-radius: 20px;
      padding: 6px 14px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s ease;
    }
    .gc-btn-new-recruitment:hover {
      background: var(--gc-purple-gradient);
      color: #fff;
      box-shadow: var(--gc-purple-glow);
    }
    .gc-close-btn {
      width: 34px;
      height: 34px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--gc-border);
      color: var(--gc-text-muted);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .gc-close-btn:hover {
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
      border-color: rgba(239, 68, 68, 0.4);
    }

    /* 3-COLUMN MAIN LAYOUT */
    .gc-layout {
      flex: 1;
      display: flex;
      overflow: hidden;
      margin: 12px 18px 18px;
      border-radius: 20px;
      background: var(--gc-bg-glass);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid var(--gc-border);
      box-shadow: 0 25px 70px rgba(0, 0, 0, 0.75), 0 0 90px rgba(139, 92, 246, 0.16);
    }

    /* COLUMN 1: LEFT SIDEBAR */
    .gc-col-sidebar {
      width: 320px;
      background: var(--gc-bg-sidebar);
      border-right: 1px solid var(--gc-border);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      overflow-x: hidden;
      overflow-y: hidden;
      box-sizing: border-box;
    }
    .gc-sidebar-header {
      padding: 18px 18px 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .gc-user-profile-badge {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
    }
    .gc-user-avatar-wrap {
      position: relative;
      width: 38px;
      height: 38px;
      flex-shrink: 0;
    }
    .gc-user-avatar {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
      background: var(--gc-purple-gradient);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      color: #fff;
      font-size: 15px;
    }
    .gc-status-dot {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 11px;
      height: 11px;
      border-radius: 50%;
      border: 2px solid #0f0c1b;
      background: var(--gc-online);
    }
    .gc-status-dot.idle { background: var(--gc-idle); }
    .gc-status-dot.dnd { background: var(--gc-dnd); }
    .gc-status-dot.offline { background: #64748b; }

    .gc-header-title {
      font-size: 18px;
      font-weight: 800;
      color: #fff;
      letter-spacing: -0.01em;
    }
    .gc-sidebar-actions {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .gc-action-icon-btn {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--gc-border);
      color: #cbd5e1;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .gc-action-icon-btn:hover {
      background: rgba(168, 85, 247, 0.25);
      color: #fff;
      border-color: rgba(168, 85, 247, 0.4);
    }

    /* Glass Search Box */
    .gc-search-box {
      margin: 4px 16px 14px;
      background: var(--gc-bg-input);
      border: 1px solid var(--gc-border);
      border-radius: 12px;
      padding: 8px 12px;
      display: flex;
      align-items: center;
      gap: 10px;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }
    .gc-search-box:focus-within {
      border-color: var(--gc-border-focus);
      box-shadow: 0 0 12px rgba(168, 85, 247, 0.25);
    }
    .gc-search-box input {
      background: transparent;
      border: none;
      outline: none;
      color: #fff;
      font-size: 13px;
      width: 100%;
      font-family: inherit;
    }
    .gc-search-box input::placeholder { color: #64748b; }

    /* Conversations Scroll Area */
    .gc-conversations-scroll {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 0 10px 16px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      box-sizing: border-box;
    }
    .gc-conversations-scroll::-webkit-scrollbar { width: 4px; }
    .gc-conversations-scroll::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
    }

    .gc-section-title {
      font-size: 11.5px;
      font-weight: 700;
      color: var(--gc-text-muted);
      padding: 8px 10px 4px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      user-select: none;
      letter-spacing: 0.03em;
      text-transform: uppercase;
    }

    .gc-conv-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      border-radius: 14px;
      background: transparent;
      border: 1px solid transparent;
      cursor: pointer;
      transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      width: 100%;
      box-sizing: border-box;
      overflow: hidden;
    }
    .gc-conv-item:hover {
      background: var(--gc-bg-card-hover);
      border-color: rgba(255, 255, 255, 0.06);
    }
    .gc-conv-item.active {
      background: rgba(139, 92, 246, 0.18);
      border-color: rgba(168, 85, 247, 0.4);
      box-shadow: inset 0 0 16px rgba(168, 85, 247, 0.15);
    }
    .gc-conv-item.active::before {
      content: '';
      position: absolute;
      left: 0;
      top: 15%;
      height: 70%;
      width: 4px;
      border-radius: 0 4px 4px 0;
      background: var(--gc-purple-gradient);
    }

    .gc-conv-avatar-wrap {
      position: relative;
      width: 40px;
      height: 40px;
      min-width: 40px;
      max-width: 40px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .gc-conv-avatar {
      width: 40px;
      height: 40px;
      min-width: 40px;
      max-width: 40px;
      flex-shrink: 0;
      border-radius: 50%;
      object-fit: cover;
      background: rgba(168, 85, 247, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 15px;
      color: #e9d5ff;
      box-sizing: border-box;
    }
    .gc-conv-avatar.channel-hash {
      border-radius: 12px;
      background: rgba(168, 85, 247, 0.14);
      color: var(--gc-purple-primary);
      font-size: 18px;
      font-weight: 800;
    }

    .gc-conv-meta {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .gc-conv-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .gc-conv-name-wrap {
      display: flex;
      align-items: center;
      gap: 5px;
      flex: 1;
      min-width: 0;
      overflow: hidden;
    }
    .gc-conv-name {
      font-size: 13.5px;
      font-weight: 700;
      color: #f1f5f9;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .gc-conv-handle {
      font-size: 11.5px;
      color: #94a3b8;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .gc-conv-time {
      font-size: 11px;
      color: #64748b;
      flex-shrink: 0;
      white-space: nowrap;
    }
    .gc-conv-snippet {
      font-size: 12px;
      color: var(--gc-text-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* COLUMN 2: CENTER ACTIVE CHAT */
    .gc-col-chat {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background-color: rgba(10, 8, 16, 0.55);
      background-image: 
        radial-gradient(circle at 30% 75%, rgba(139, 92, 246, 0.28), transparent 55%),
        radial-gradient(circle at 75% 25%, rgba(217, 70, 239, 0.18), transparent 50%),
        radial-gradient(circle at 50% 90%, rgba(168, 85, 247, 0.12), transparent 60%);
      position: relative;
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
    }

    /* Header */
    .gc-chat-header {
      height: 64px;
      padding: 0 20px;
      border-bottom: 1px solid var(--gc-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: rgba(18, 14, 28, 0.55);
      flex-shrink: 0;
    }
    .gc-chat-header-user {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .gc-active-title-wrap {
      display: flex;
      align-items: baseline;
      gap: 8px;
    }
    .gc-active-title {
      font-size: 16px;
      font-weight: 800;
      color: #fff;
      line-height: 1.2;
    }
    .gc-active-handle {
      font-size: 13px;
      color: #c084fc;
      font-weight: 600;
    }
    .gc-active-status {
      font-size: 12px;
      color: var(--gc-online);
      display: flex;
      align-items: center;
      gap: 5px;
      margin-top: 2px;
    }
    .gc-active-status-pulse {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--gc-online);
      box-shadow: 0 0 8px var(--gc-online);
    }
    .gc-chat-header-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .gc-neon-action-btn {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: rgba(168, 85, 247, 0.12);
      border: 1px solid rgba(168, 85, 247, 0.35);
      color: #c084fc;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .gc-neon-action-btn:hover {
      background: var(--gc-purple-gradient);
      color: #fff;
      box-shadow: var(--gc-purple-glow);
      transform: translateY(-1px);
    }

    /* Message Stream */
    .gc-chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 24px 20px 16px;
      display: flex;
      flex-direction: column;
      gap: 18px;
    }
    .gc-chat-messages::-webkit-scrollbar { width: 6px; }
    .gc-chat-messages::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.08);
      border-radius: 4px;
    }

    .gc-message-row {
      display: flex;
      gap: 10px;
      max-width: 75%;
      position: relative;
    }
    .gc-message-row.incoming { align-self: flex-start; }
    .gc-message-row.outgoing { align-self: flex-end; flex-direction: row-reverse; }

    .gc-msg-avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      object-fit: cover;
      background: rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 700;
      color: #fff;
      flex-shrink: 0;
      align-self: flex-end;
      margin-bottom: 2px;
    }
    .gc-bubble-wrap {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .gc-message-row.outgoing .gc-bubble-wrap { align-items: flex-end; }

    .gc-bubble-sender {
      font-size: 11.5px;
      font-weight: 700;
      color: #c084fc;
      margin-bottom: 2px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .gc-bubble-sender span {
      color: #94a3b8;
      font-weight: 500;
      font-size: 10.5px;
    }

    .gc-bubble {
      padding: 12px 18px;
      font-size: 13.5px;
      line-height: 1.5;
      position: relative;
      word-break: break-word;
    }

    /* Left Incoming: Dark Frosted Glass */
    .gc-message-row.incoming .gc-bubble {
      background: rgba(255, 255, 255, 0.055);
      border: 1px solid rgba(203, 224, 190, 0.12);
      color: #F3F6F1;
      border-radius: 18px 18px 18px 4px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.22);
    }

    /* Right Outgoing: Soft Sage / Emerald Frosted Gradient */
    .gc-message-row.outgoing .gc-bubble {
      background: linear-gradient(135deg, rgba(197, 217, 169, 0.24) 0%, rgba(132, 201, 154, 0.16) 100%);
      border: 1px solid rgba(197, 217, 169, 0.32);
      color: #F3F6F1;
      border-radius: 18px 18px 4px 18px;
      box-shadow: 0 4px 20px rgba(24, 52, 36, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.12);
      font-weight: 500;
    }

    .gc-reply-preview-in-msg {
      background: rgba(0, 0, 0, 0.25);
      border-left: 3px solid var(--gc-purple-primary);
      border-radius: 6px;
      padding: 4px 8px;
      font-size: 11.5px;
      margin-bottom: 6px;
      color: #cbd5e1;
    }

    .gc-msg-bottom-meta {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 10px;
      color: #64748b;
      padding: 0 4px;
    }

    /* Message Actions Hover Bar */
    .gc-msg-actions {
      position: absolute;
      top: -14px;
      background: rgba(20, 16, 32, 0.95);
      border: 1px solid var(--gc-border);
      border-radius: 8px;
      padding: 2px 4px;
      display: none;
      align-items: center;
      gap: 2px;
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.5);
      z-index: 20;
    }
    .gc-message-row.incoming .gc-msg-actions { right: 0; }
    .gc-message-row.outgoing .gc-msg-actions { left: 0; }
    .gc-message-row:hover .gc-msg-actions { display: flex; }

    .gc-act-btn {
      background: transparent;
      border: none;
      color: var(--gc-text-muted);
      font-size: 12px;
      padding: 3px 6px;
      border-radius: 4px;
      cursor: pointer;
    }
    .gc-act-btn:hover { background: rgba(255, 255, 255, 0.1); color: #fff; }

    /* Code Blocks */
    .gc-code-block {
      background: #0d0b16;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 10px;
      margin-top: 8px;
      overflow: hidden;
    }
    .gc-code-header {
      background: rgba(255, 255, 255, 0.04);
      padding: 6px 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 11px;
      color: #94a3b8;
      font-weight: 700;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    .gc-code-copy-btn {
      background: rgba(168, 85, 247, 0.15);
      border: 1px solid rgba(168, 85, 247, 0.3);
      color: #e9d5ff;
      border-radius: 6px;
      padding: 2px 8px;
      font-size: 10px;
      font-weight: 700;
      cursor: pointer;
    }
    .gc-code-copy-btn:hover { background: var(--gc-purple-primary); color: #fff; }
    .gc-code-block pre {
      margin: 0;
      padding: 12px;
      font-family: 'Consolas', 'Fira Code', monospace;
      font-size: 12px;
      color: #e2e8f0;
      overflow-x: auto;
    }

    /* Reply Staging Bar above input */
    .gc-reply-staging-bar {
      margin: 0 18px 4px;
      background: rgba(22, 18, 36, 0.95);
      border: 1px solid rgba(168, 85, 247, 0.3);
      border-radius: 12px;
      padding: 6px 14px;
      display: none;
      align-items: center;
      justify-content: space-between;
      font-size: 12px;
      color: #e2e8f0;
    }

    /* Floating Bottom Pill Input Bar */
    .gc-floating-input-bar {
      margin: 4px 18px 18px;
      background: var(--gc-bg-input);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 30px;
      padding: 6px 12px 6px 16px;
      display: flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }
    .gc-floating-input-bar:focus-within {
      border-color: rgba(168, 85, 247, 0.5);
      box-shadow: 0 10px 35px rgba(168, 85, 247, 0.2);
    }
    .gc-pill-btn {
      background: transparent;
      border: none;
      color: #cbd5e1;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .gc-pill-btn:hover { color: #fff; background: rgba(255, 255, 255, 0.08); }
    .gc-pill-btn.emoji { color: #c084fc; }
    .gc-pill-input {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      color: #fff;
      font-size: 14px;
      font-family: inherit;
      padding: 8px 0;
    }
    .gc-pill-input::placeholder { color: #64748b; }
    .gc-btn-send {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: var(--gc-purple-gradient);
      border: none;
      color: #0C1812;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 4px 14px rgba(168, 85, 247, 0.4);
    }
    .gc-btn-send:hover {
      transform: scale(1.05);
      box-shadow: var(--gc-purple-glow);
    }

    /* COLUMN 3: RIGHT INSPECTOR */
    .gc-col-inspector {
      width: 320px;
      background: var(--gc-bg-sidebar);
      border-left: 1px solid var(--gc-border);
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: stretch;
      flex-shrink: 0;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 24px 18px;
      padding-top: 24px;
      box-sizing: border-box;
      transition: all 0.25s ease;
    }
    .gc-col-inspector.collapsed { display: none !important; }

    .gc-inspector-profile {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      text-align: center;
      margin-bottom: 20px;
      width: 100%;
      flex-shrink: 0;
    }
    .gc-inspector-avatar {
      width: 82px;
      height: 82px;
      min-width: 82px;
      min-height: 82px;
      border-radius: 50%;
      object-fit: cover;
      background: var(--gc-purple-gradient);
      border: 3px solid rgba(168, 85, 247, 0.4);
      box-shadow: 0 0 25px rgba(168, 85, 247, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      font-weight: 800;
      color: #fff;
      margin-bottom: 12px;
      flex-shrink: 0;
    }
    .gc-inspector-name {
      font-size: 18px;
      font-weight: 800;
      color: #fff;
      margin-bottom: 2px;
    }
    .gc-inspector-handle {
      font-size: 13px;
      color: #c084fc;
      font-weight: 600;
      margin-bottom: 6px;
    }
    .gc-inspector-role {
      font-size: 12.5px;
      color: var(--gc-text-muted);
      margin-bottom: 14px;
      line-height: 1.4;
    }
    .gc-inspector-socials { display: flex; gap: 10px; }
    .gc-social-btn {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--gc-border);
      color: var(--gc-text-muted);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 13px;
      font-weight: 700;
    }
    .gc-social-btn:hover {
      background: rgba(168, 85, 247, 0.25);
      color: #fff;
      border-color: rgba(168, 85, 247, 0.4);
    }

    /* Segmented Tabs [Info] vs [Files] */
    .gc-segmented-tabs {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--gc-border);
      border-radius: 12px;
      padding: 3px;
      display: flex;
      gap: 4px;
      margin-bottom: 20px;
    }
    .gc-tab-btn {
      flex: 1;
      background: transparent;
      border: none;
      color: var(--gc-text-muted);
      padding: 7px 0;
      font-size: 12.5px;
      font-weight: 700;
      border-radius: 9px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .gc-tab-btn.active {
      background: rgba(255, 255, 255, 0.09);
      color: #fff;
    }

    .gc-sub-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 13px;
      font-weight: 700;
      color: #fff;
      margin-bottom: 12px;
    }
    .gc-view-all-link {
      font-size: 11px;
      color: #94a3b8;
      cursor: pointer;
    }
    .gc-view-all-link:hover { color: var(--gc-purple-primary); }

    .gc-files-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 22px;
    }
    .gc-file-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 9px 12px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--gc-border);
    }
    .gc-file-item:hover { background: rgba(255, 255, 255, 0.06); }
    .gc-file-info { flex: 1; min-width: 0; }
    .gc-file-name {
      font-size: 12px;
      font-weight: 600;
      color: #f1f5f9;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .gc-file-size { font-size: 10px; color: #64748b; }

    .gc-attachments-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
    }
    .gc-grid-thumb {
      aspect-ratio: 1;
      border-radius: 10px;
      overflow: hidden;
      border: 1px solid var(--gc-border);
      cursor: pointer;
    }
    .gc-grid-thumb img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.2s ease;
    }
    .gc-grid-thumb:hover img { transform: scale(1.08); }

    /* Empty State for Chat Stream */
    .gc-empty-chat-state {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 40px 20px;
      color: var(--gc-text-muted);
      user-select: none;
    }
    .gc-empty-icon-box {
      width: 68px;
      height: 68px;
      border-radius: 20px;
      background: rgba(168, 85, 247, 0.12);
      border: 1px solid rgba(168, 85, 247, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #c084fc;
      margin-bottom: 16px;
      box-shadow: 0 0 30px rgba(168, 85, 247, 0.2);
    }
    .gc-empty-icon-box svg {
      width: 32px;
      height: 32px;
    }
    .gc-empty-title {
      font-size: 16px;
      font-weight: 800;
      color: #f1f5f9;
      margin-bottom: 6px;
    }
    .gc-empty-subtitle {
      font-size: 13px;
      color: #64748b;
      max-width: 320px;
      line-height: 1.5;
    }

    /* Modals */
    .gc-modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(8px);
      z-index: 100000;
      display: none;
      align-items: center;
      justify-content: center;
    }
    .gc-modal-backdrop.open { display: flex; }
    .gc-modal-box {
      background: #141122;
      border: 1px solid var(--gc-border);
      border-radius: 18px;
      width: 90%;
      max-width: 440px;
      padding: 24px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.7);
    }

    /* Tag pills */
    .gc-tag-pill {
      background: rgba(168, 85, 247, 0.15);
      border: 1px solid rgba(168, 85, 247, 0.3);
      color: #e9d5ff;
      border-radius: 12px;
      padding: 3px 10px;
      font-size: 11px;
      font-weight: 600;
    }

    /* Sleek Glassmorphic Skeleton Shimmer */
    .gc-skeleton-row {
      display: flex;
      gap: 10px;
      max-width: 68%;
      animation: gcPulse 1.2s ease-in-out infinite alternate;
    }
    .gc-skeleton-row.right { align-self: flex-end; flex-direction: row-reverse; }
    .gc-skeleton-bubble {
      height: 44px;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.05);
    }
    @keyframes gcPulse {
      from { opacity: 0.45; }
      to { opacity: 0.9; }
    }
    .gc-retry-btn {
      background: rgba(239, 68, 68, 0.2);
      border: 1px solid rgba(239, 68, 68, 0.5);
      color: #fca5a5;
      border-radius: 8px;
      padding: 2px 8px;
      font-size: 10px;
      font-weight: 700;
      cursor: pointer;
    }
    .gc-retry-btn:hover { background: rgba(239, 68, 68, 0.4); color: #fff; }

    /* Mobile Back Button & Inspector Mobile Bar (hidden on desktop) */
    .gc-mobile-back-btn,
    .gc-inspector-mobile-bar {
      display: none;
    }

    @keyframes gcSheetUp {
      from { transform: translateY(100%); opacity: 0.7; }
      to { transform: translateY(0); opacity: 1; }
    }

    /* Native Mobile Single-Screen Stack & Bottom Sheets (<= 768px) */
    @media (max-width: 768px) {
      #glassChatContainer {
        height: 100dvh;
        max-height: 100dvh;
        -webkit-tap-highlight-color: transparent;
      }

      #glassChatContainer button,
      #glassChatContainer .gc-conv-item,
      #glassChatContainer .gc-tab-btn,
      #glassChatContainer .gc-topbar {
        user-select: none;
        -webkit-user-select: none;
        touch-action: manipulation;
      }

      #glassChatContainer .gc-bubble,
      #glassChatContainer .gc-bubble * {
        user-select: text;
        -webkit-user-select: text;
      }

      .gc-topbar {
        height: calc(54px + env(safe-area-inset-top, 0px));
        padding: env(safe-area-inset-top, 0px) 14px 0;
      }

      #glassChatContainer.gc-mobile-view-chat .gc-topbar {
        display: none;
      }

      .gc-layout {
        margin: 0;
        border-radius: 0;
        border: none;
        flex: 1;
        min-height: 0;
        position: relative;
      }

      /* Screen 1: Full-width Chat List View */
      .gc-col-sidebar {
        width: 100vw;
        max-width: 100vw;
        flex: 1;
        border-right: none;
        padding-bottom: calc(68px + env(safe-area-inset-bottom, 0px));
      }

      .gc-conv-item {
        min-height: 68px;
        padding: 10px 14px !important;
      }

      .gc-conv-item .gc-user-avatar-wrap {
        width: 44px !important;
        height: 44px !important;
      }

      .gc-col-chat,
      .gc-col-inspector {
        display: none;
      }

      /* Screen 2: Full-Screen Active Chat View */
      #glassChatContainer.gc-mobile-view-chat .gc-col-sidebar {
        display: none;
      }

      #glassChatContainer.gc-mobile-view-chat .gc-col-chat {
        display: flex;
        flex: 1;
        width: 100vw;
        max-width: 100vw;
        height: 100%;
        min-height: 0;
      }

      .gc-mobile-back-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        min-width: 36px;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid var(--gc-border);
        color: #f8fafc;
        cursor: pointer;
        margin-right: 4px;
        flex-shrink: 0;
      }

      .gc-mobile-back-btn:active {
        transform: scale(0.94);
      }

      .gc-chat-header {
        padding: calc(env(safe-area-inset-top, 0px) + 10px) 12px 10px !important;
        gap: 8px;
      }

      .gc-chat-header-user {
        min-width: 0;
        flex: 1;
        gap: 8px;
      }

      .gc-active-title {
        font-size: 15px !important;
      }

      .gc-chat-header-actions {
        gap: 6px;
        flex-shrink: 0;
      }

      .gc-neon-action-btn {
        width: 34px;
        height: 34px;
      }

      .gc-chat-messages {
        padding: 14px 12px 10px;
        gap: 12px;
      }

      .gc-message-row {
        max-width: 86%;
      }

      .gc-floating-input-bar {
        margin: 4px 10px calc(10px + env(safe-area-inset-bottom, 0px));
        padding: 5px 8px 5px 10px;
        gap: 6px;
      }

      .gc-pill-input {
        font-size: 16px !important;
        min-width: 0;
      }

      /* Screen 3: Mobile Inspector Slide-Over */
      #gcColInspector.gc-mobile-inspector-open {
        display: flex !important;
        position: fixed;
        inset: 0;
        width: 100vw;
        max-width: 100vw;
        height: 100dvh;
        z-index: 100001;
        border-left: none;
        background: rgba(12, 10, 22, 0.98);
        backdrop-filter: blur(28px);
        -webkit-backdrop-filter: blur(28px);
        padding: calc(env(safe-area-inset-top, 0px) + 14px) 18px calc(24px + env(safe-area-inset-bottom, 0px));
        animation: gcSheetUp 0.24s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .gc-inspector-mobile-bar {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 16px;
        font-size: 16px;
        font-weight: 800;
        color: #f8fafc;
      }

      /* Bottom-Sheet Modals on Mobile */
      .gc-modal-backdrop {
        align-items: flex-end;
        justify-content: center;
      }

      .gc-modal-box {
        width: 100vw;
        max-width: 100vw;
        border-radius: 24px 24px 0 0;
        border-left: none;
        border-right: none;
        border-bottom: none;
        padding: 14px 18px calc(24px + env(safe-area-inset-bottom, 0px));
        animation: gcSheetUp 0.24s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .gc-modal-box::before {
        content: "";
        display: block;
        width: 40px;
        height: 4px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.22);
        margin: 0 auto 14px;
      }
    }
  `;
  document.head.appendChild(styleEl);

  // 2. INLINE SVG ICONS
  const ICONS = {
    search: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>',
    phone: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>',
    video: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>',
    pin: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="17" x2="12" y2="22"></line><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.89A4 4 0 0 1 14 9V5a2 2 0 0 1 2-2H8a2 2 0 0 1 2 2v4a4 4 0 0 1-2.11 3.56l-1.78.89A2 2 0 0 0 5 15.24z"></path></svg>',
    info: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
    plus: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>',
    pencil: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>',
    paperclip: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>',
    smile: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>',
    mic: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>',
    send: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>',
    close: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
    settings: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>',
    reply: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 17 4 12 9 7"></polyline><path d="M20 18v-2a4 4 0 0 0-4-4H4"></path></svg>',
    trash: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>',
    edit: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>',
    userPlus: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7.5" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>',
    backArrow: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>'
  };

  function showGlassToast(msg) {
    let toast = document.getElementById('gcToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'gcToast';
      toast.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:rgba(20,16,32,0.95);border:1px solid rgba(168,85,247,0.4);border-radius:12px;padding:10px 20px;color:#fff;font-size:13px;font-weight:600;box-shadow:0 10px 30px rgba(0,0,0,0.6);z-index:999999;transition:opacity 0.2s ease;';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.display = 'block';
    toast.style.opacity = '1';
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => { toast.style.display = 'none'; }, 250);
    }, 3000);
  }

  function escapeText(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
  }

  // 3. STATE & STALE-WHILE-REVALIDATE CACHE
  let currentUser = null;
  let conversations = [];
  let activeConvId = null;
  let activeConv = null;
  let currentMessages = [];
  let socket = null;
  let stagedReply = null; // { id, senderName, content }
  const memMessages = new Map(); // convId -> messages[]
  const memDetails = new Map();  // convId -> conversation details

  function readLocalCache(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (_) {
      return fallback;
    }
  }

  function writeLocalCache(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (_) {}
  }

  function getCachedMessages(convId) {
    const id = Number(convId);
    if (memMessages.has(id)) return memMessages.get(id);
    const stored = readLocalCache(`gc_msgs_${id}`, null);
    if (Array.isArray(stored)) memMessages.set(id, stored);
    return stored;
  }

  function setCachedMessages(convId, msgs) {
    const id = Number(convId);
    const trimmed = Array.isArray(msgs) ? msgs.slice(-30) : [];
    memMessages.set(id, trimmed);
    writeLocalCache(`gc_msgs_${id}`, trimmed);
  }

  async function api(endpoint, options = {}) {
    const res = await fetch(endpoint, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
  }

  // 4. BUILD DOM CONTAINER
  function ensureDOM() {
    let container = document.getElementById('glassChatContainer');
    if (container) return container;

    container = document.createElement('div');
    container.id = 'glassChatContainer';
    container.innerHTML = `
      <header class="gc-topbar">
        <div class="gc-topbar-left">
          <div class="gc-brand">Skill<span>Mate.</span> <span style="font-size:13px;opacity:0.75;font-weight:600;margin-left:6px;letter-spacing:0.02em;">Messenger</span></div>
        </div>
        <div class="gc-topbar-right">
          <button class="gc-btn-new-recruitment" type="button" onclick="window.GlassChat.openNewDMModal()" title="Start New Direct Message">
            ${ICONS.plus} <span>New Chat</span>
          </button>
          <button class="gc-close-btn" type="button" onclick="window.GlassChat.close()" title="Close Messenger">${ICONS.close}</button>
        </div>
      </header>

      <div class="gc-layout" id="gcLayout">
        <!-- COLUMN 1: LEFT SIDEBAR (1-on-1 Direct Messages Only) -->
        <aside class="gc-col-sidebar" id="gcColSidebar">
          <div class="gc-sidebar-header">
            <div class="gc-user-profile-badge" onclick="window.GlassChat.openStatusModal()" title="Status & Settings">
              <div class="gc-user-avatar-wrap">
                <div class="gc-user-avatar" id="gcMyAvatar">✦</div>
                <div class="gc-status-dot" id="gcMyStatusDot"></div>
              </div>
              <span class="gc-header-title">Chats</span>
            </div>
            <div class="gc-sidebar-actions">
              <button class="gc-action-icon-btn" onclick="window.GlassChat.openNewDMModal()" title="Start New Direct Message">${ICONS.pencil}</button>
            </div>
          </div>

          <div class="gc-search-box">
            <span style="color:#64748b;">${ICONS.search}</span>
            <input type="text" id="gcSearchInput" placeholder="Search conversations or @username..." oninput="window.GlassChat.handleSearch(this.value)">
          </div>

          <div class="gc-conversations-scroll" id="gcConversationsScroll">
            <div class="gc-section-title">
              <span>Direct Messages</span>
              <button class="gc-action-icon-btn" style="width:20px;height:20px;" onclick="window.GlassChat.openNewDMModal()">${ICONS.plus}</button>
            </div>
            <div id="gcPersonalList" style="display:flex;flex-direction:column;gap:4px;"></div>
          </div>
        </aside>

        <!-- COLUMN 2: CENTER ACTIVE CHAT STREAM -->
        <main class="gc-col-chat" id="gcColChat">
          <div class="gc-chat-header">
            <div class="gc-chat-header-user" onclick="if (window.innerWidth <= 768) window.GlassChat.toggleInspector()">
              <button class="gc-mobile-back-btn" type="button" onclick="event.stopPropagation(); window.GlassChat.exitMobileChat()" aria-label="Back to chats">${ICONS.backArrow}</button>
              <div class="gc-user-avatar-wrap" style="width:40px;height:40px;">
                <div class="gc-user-avatar" id="gcActiveAvatar">✦</div>
                <div class="gc-status-dot" id="gcActiveStatusDot"></div>
              </div>
              <div>
                <div class="gc-active-title-wrap">
                  <span class="gc-active-title" id="gcActiveTitle">Select a chat</span>
                  <span class="gc-active-handle" id="gcActiveHandle"></span>
                </div>
                <div class="gc-active-status" id="gcActiveStatus">
                  <span class="gc-active-status-pulse"></span>
                  <span id="gcActiveStatusText">Active Now</span>
                </div>
              </div>
            </div>
            <div class="gc-chat-header-actions">
              <button class="gc-neon-action-btn" onclick="window.GlassChat.startHuddle(false)" title="Audio Call">${ICONS.phone}</button>
              <button class="gc-neon-action-btn" onclick="window.GlassChat.startHuddle(true)" title="Video Call">${ICONS.video}</button>
              <button class="gc-neon-action-btn" onclick="window.GlassChat.togglePinnedModal()" title="Pinned Messages">${ICONS.pin}</button>
              <button class="gc-neon-action-btn" onclick="window.GlassChat.toggleInspector()" title="Toggle Inspector">${ICONS.info}</button>
            </div>
          </div>

          <div class="gc-chat-messages" id="gcChatMessages"></div>

          <!-- Staged Quote Reply Preview -->
          <div class="gc-reply-staging-bar" id="gcReplyStaging">
            <div style="display:flex;align-items:center;gap:8px;overflow:hidden;">
              <span style="color:#c084fc;">${ICONS.reply}</span>
              <span id="gcReplyText" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;"></span>
            </div>
            <button class="gc-act-btn" onclick="window.GlassChat.cancelReply()">${ICONS.close}</button>
          </div>

          <!-- Floating Pill Input Bar -->
          <div class="gc-floating-input-bar">
            <button class="gc-pill-btn emoji" type="button" onclick="window.GlassChat.toggleEmojiPicker()" title="Emoji">${ICONS.smile}</button>
            <button class="gc-pill-btn" type="button" onclick="document.getElementById('gcFileInput').click()" title="Attach File">${ICONS.paperclip}</button>
            <input type="file" id="gcFileInput" style="display:none;" onchange="window.GlassChat.handleFileUpload(this.files[0])">

            <input type="text" class="gc-pill-input" id="gcMessageInput" placeholder="Type a message..." autocomplete="off">

            <div class="gc-voice-recording-wrap" id="gcVoiceRecWrap" style="display:none;align-items:center;gap:8px;">
              <div style="width:8px;height:8px;border-radius:50%;background:#ef4444;"></div>
              <span style="font-size:12px;font-weight:700;color:#ef4444;" id="gcVoiceTimer">0:00</span>
              <button class="gc-pill-btn" onclick="window.GlassChat.cancelVoiceRecord()">${ICONS.close}</button>
            </div>

            <button class="gc-pill-btn" id="gcBtnMic" type="button" onclick="window.GlassChat.toggleVoiceRecord()" title="Voice Note">${ICONS.mic}</button>
            <button class="gc-btn-send" type="button" onclick="window.GlassChat.sendMessage()" title="Send">${ICONS.send}</button>
          </div>
        </main>

        <!-- COLUMN 3: RIGHT INSPECTOR -->
        <aside class="gc-col-inspector" id="gcColInspector">
          <div class="gc-inspector-mobile-bar">
            <button class="gc-mobile-back-btn" type="button" onclick="window.GlassChat.closeInspector()" aria-label="Close profile details">${ICONS.backArrow}</button>
            <span>Profile &amp; Files</span>
          </div>
          <div class="gc-inspector-profile">
            <div class="gc-inspector-avatar" id="gcInspAvatar">✦</div>
            <div class="gc-inspector-name" id="gcInspName">User Name</div>
            <div class="gc-inspector-handle" id="gcInspHandle">@username</div>
            <div class="gc-inspector-role" id="gcInspRole">Profile Bio</div>
            <div class="gc-inspector-socials" id="gcInspSocials">
              <button class="gc-social-btn" title="Google">G</button>
              <button class="gc-social-btn" title="LinkedIn">in</button>
              <button class="gc-social-btn" title="GitHub">gh</button>
            </div>
          </div>

          <div class="gc-segmented-tabs">
            <button class="gc-tab-btn active" id="gcTabBtnInfo" onclick="window.GlassChat.switchTab('info')">Info</button>
            <button class="gc-tab-btn" id="gcTabBtnFiles" onclick="window.GlassChat.switchTab('files')">Files</button>
          </div>

          <div id="gcTabInfo">
            <!-- Channel Actions (Only shown in channel mode) -->
            <div id="gcChannelControls" style="display:none;margin-bottom:16px;">
              <button class="gc-btn-new-recruitment" style="width:100%;justify-content:center;margin-bottom:8px;" onclick="window.GlassChat.openAddMemberModal()">
                ${ICONS.userPlus} <span>+ Add Member</span>
              </button>
            </div>

            <div class="gc-sub-header"><span>About & Location</span></div>
            <div style="font-size:12.5px;color:#94a3b8;line-height:1.5;margin-bottom:12px;" id="gcInspBio">
              No bio provided.
            </div>
            <div style="font-size:12px;color:#cbd5e1;margin-bottom:16px;display:flex;align-items:center;gap:6px;">
              <span style="opacity:0.6;">📍 Location:</span> <strong id="gcInspCity">India</strong>
            </div>

            <div class="gc-sub-header"><span>Interests & Skills</span></div>
            <div id="gcInspInterests" style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:20px;"></div>

            <!-- Members list for Channel Mode -->
            <div id="gcInspMembersWrap" style="display:none;">
              <div class="gc-sub-header">
                <span>Channel Members</span>
                <span id="gcMemberCount" style="font-size:11px;color:#94a3b8;">0</span>
              </div>
              <div id="gcMemberList" style="display:flex;flex-direction:column;gap:6px;"></div>

              <div id="gcChannelDangerZone" style="margin-top:20px;display:flex;flex-direction:column;gap:8px;">
                <button id="gcBtnLeaveChannel" class="gc-nav-link" style="color:#ef4444;border:1px solid rgba(239,68,68,0.3);width:100%;text-align:center;" onclick="window.GlassChat.leaveCurrentChannel()">
                  Leave Channel
                </button>
                <button id="gcBtnDeleteChannel" class="gc-nav-link" style="color:#ef4444;background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.4);width:100%;text-align:center;display:none;" onclick="window.GlassChat.deleteCurrentChannel()">
                  Delete Channel (Owner)
                </button>
              </div>
            </div>
          </div>

          <div id="gcTabFiles" style="display:none;">
            <div class="gc-sub-header">
              <span>Shared Documents</span>
              <span class="gc-view-all-link" onclick="window.GlassChat.viewAllFiles()">Refresh</span>
            </div>
            <div class="gc-files-list" id="gcUploadedFilesList"></div>

            <div class="gc-sub-header">
              <span>Media Attachments</span>
              <span class="gc-view-all-link" onclick="window.GlassChat.viewAllAttachments()">Grid</span>
            </div>
            <div class="gc-attachments-grid" id="gcAttachmentsGrid"></div>
          </div>
        </aside>
      </div>

      <!-- MODAL 1: NEW 1-on-1 DM (Search Real Registered Users) -->
      <div id="gcNewDMModal" class="gc-modal-backdrop" onclick="if(event.target===this)this.classList.remove('open')">
        <div class="gc-modal-box">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
            <span style="font-size:16px;font-weight:800;color:#fff;">New Direct Message</span>
            <button class="gc-close-btn" onclick="document.getElementById('gcNewDMModal').classList.remove('open')">${ICONS.close}</button>
          </div>
          <div class="gc-search-box" style="margin:0 0 14px 0;">
            <span style="color:#64748b;">${ICONS.search}</span>
            <input type="text" id="gcDMUserSearch" placeholder="Type name or @username..." oninput="window.GlassChat.searchRegisteredUsers(this.value)">
          </div>
          <div id="gcDMUserResults" style="max-height:280px;overflow-y:auto;display:flex;flex-direction:column;gap:6px;">
            <div style="text-align:center;padding:20px;color:#64748b;font-size:12.5px;">Type a name or @username to find members.</div>
          </div>
        </div>
      </div>

      <!-- MODAL 2: CREATE CHANNEL MODAL -->
      <div id="gcCreateChannelModal" class="gc-modal-backdrop" onclick="if(event.target===this)this.classList.remove('open')">
        <div class="gc-modal-box">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
            <span style="font-size:16px;font-weight:800;color:#fff;">Create Team Channel</span>
            <button class="gc-close-btn" onclick="document.getElementById('gcCreateChannelModal').classList.remove('open')">${ICONS.close}</button>
          </div>
          <div style="display:flex;flex-direction:column;gap:12px;">
            <div>
              <label style="font-size:12px;font-weight:700;color:#cbd5e1;display:block;margin-bottom:4px;">CHANNEL NAME</label>
              <input type="text" id="gcNewChannelName" placeholder="e.g. project-alpha" style="width:100%;background:rgba(255,255,255,0.06);border:1px solid var(--gc-border);border-radius:10px;padding:10px;color:#fff;font-family:inherit;box-sizing:border-box;">
            </div>
            <div>
              <label style="font-size:12px;font-weight:700;color:#cbd5e1;display:block;margin-bottom:4px;">DESCRIPTION</label>
              <input type="text" id="gcNewChannelDesc" placeholder="What is this channel about?" style="width:100%;background:rgba(255,255,255,0.06);border:1px solid var(--gc-border);border-radius:10px;padding:10px;color:#fff;font-family:inherit;box-sizing:border-box;">
            </div>
            <div>
              <label style="font-size:12px;font-weight:700;color:#cbd5e1;display:block;margin-bottom:4px;">VISIBILITY</label>
              <div style="display:flex;gap:10px;">
                <label style="display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer;">
                  <input type="radio" name="gcChannelVis" value="public" checked> <span>Public (Anyone can join)</span>
                </label>
                <label style="display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer;">
                  <input type="radio" name="gcChannelVis" value="private"> <span>Private (Invite only)</span>
                </label>
              </div>
            </div>
            <button class="gc-btn-new-recruitment" style="width:100%;justify-content:center;padding:10px;margin-top:6px;" onclick="window.GlassChat.submitCreateChannel()">
              Create Channel
            </button>
          </div>
        </div>
      </div>

      <!-- MODAL 3: ADD MEMBER TO CHANNEL -->
      <div id="gcAddMemberModal" class="gc-modal-backdrop" onclick="if(event.target===this)this.classList.remove('open')">
        <div class="gc-modal-box">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
            <span style="font-size:16px;font-weight:800;color:#fff;">Add Member to Channel</span>
            <button class="gc-close-btn" onclick="document.getElementById('gcAddMemberModal').classList.remove('open')">${ICONS.close}</button>
          </div>
          <div class="gc-search-box" style="margin:0 0 14px 0;">
            <span style="color:#64748b;">${ICONS.search}</span>
            <input type="text" id="gcAddMemberSearch" placeholder="Search members by name or @username..." oninput="window.GlassChat.searchMembersToAdd(this.value)">
          </div>
          <div id="gcAddMemberResults" style="max-height:280px;overflow-y:auto;display:flex;flex-direction:column;gap:6px;">
            <div style="text-align:center;padding:20px;color:#64748b;font-size:12.5px;">Type a name or @username to search members.</div>
          </div>
        </div>
      </div>

      <!-- MODAL 4: EDIT MESSAGE MODAL (NO ALERT/PROMPT) -->
      <div id="gcEditMsgModal" class="gc-modal-backdrop" onclick="if(event.target===this)this.classList.remove('open')">
        <div class="gc-modal-box">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">
            <span style="font-size:16px;font-weight:800;color:#fff;">Edit Message</span>
            <button class="gc-close-btn" onclick="document.getElementById('gcEditMsgModal').classList.remove('open')">${ICONS.close}</button>
          </div>
          <input type="hidden" id="gcEditMsgId">
          <textarea id="gcEditMsgText" rows="3" style="width:100%;background:rgba(255,255,255,0.06);border:1px solid var(--gc-border);border-radius:10px;padding:10px;color:#fff;font-family:inherit;box-sizing:border-box;resize:none;margin-bottom:12px;"></textarea>
          <div style="display:flex;justify-content:flex-end;gap:8px;">
            <button class="gc-nav-link" onclick="document.getElementById('gcEditMsgModal').classList.remove('open')">Cancel</button>
            <button class="gc-btn-new-recruitment" onclick="window.GlassChat.saveEditedMessage()">Save Changes</button>
          </div>
        </div>
      </div>

      <!-- MODAL 5: CONFIRMATION MODAL (NO BROWSER CONFIRM) -->
      <div id="gcConfirmModal" class="gc-modal-backdrop" onclick="if(event.target===this)this.classList.remove('open')">
        <div class="gc-modal-box">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
            <span style="font-size:16px;font-weight:800;color:#fff;" id="gcConfirmTitle">Confirm Action</span>
            <button class="gc-close-btn" onclick="document.getElementById('gcConfirmModal').classList.remove('open')">${ICONS.close}</button>
          </div>
          <p id="gcConfirmMessage" style="font-size:13px;color:#cbd5e1;line-height:1.5;margin-bottom:18px;">Are you sure you want to proceed?</p>
          <div style="display:flex;justify-content:flex-end;gap:8px;">
            <button class="gc-nav-link" onclick="document.getElementById('gcConfirmModal').classList.remove('open')">Cancel</button>
            <button id="gcConfirmActionBtn" class="gc-btn-new-recruitment" style="background:#ef4444;border-color:#ef4444;color:#fff;">Confirm</button>
          </div>
        </div>
      </div>

      <!-- MODAL 7: PINNED MESSAGES DRAWER -->
      <div id="gcPinnedModal" class="gc-modal-backdrop" onclick="if(event.target===this)this.classList.remove('open')">
        <div class="gc-modal-box">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">
            <span style="font-size:16px;font-weight:800;color:#fff;">📌 Pinned Messages</span>
            <button class="gc-close-btn" onclick="document.getElementById('gcPinnedModal').classList.remove('open')">${ICONS.close}</button>
          </div>
          <div id="gcPinnedList" style="max-height:300px;overflow-y:auto;display:flex;flex-direction:column;gap:6px;"></div>
        </div>
      </div>

      <!-- MODAL 6: STATUS & SETTINGS -->
      <div id="gcStatusModal" class="gc-modal-backdrop" onclick="if(event.target===this)this.classList.remove('open')">
        <div class="gc-modal-box">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;">
            <span style="font-size:16px;font-weight:800;color:#fff;">Profile Status & Settings</span>
            <button class="gc-close-btn" onclick="document.getElementById('gcStatusModal').classList.remove('open')">${ICONS.close}</button>
          </div>
          <div style="display:flex;flex-direction:column;gap:10px;">
            <button class="gc-file-item" style="cursor:pointer;" onclick="window.GlassChat.setStatus('online')">
              <span class="gc-status-dot online" style="position:static;display:inline-block;"></span>
              <strong style="color:#22c55e;">Online</strong>
            </button>
            <button class="gc-file-item" style="cursor:pointer;" onclick="window.GlassChat.setStatus('idle')">
              <span class="gc-status-dot idle" style="position:static;display:inline-block;"></span>
              <strong style="color:#eab308;">Idle / Away</strong>
            </button>
            <button class="gc-file-item" style="cursor:pointer;" onclick="window.GlassChat.setStatus('dnd')">
              <span class="gc-status-dot dnd" style="position:static;display:inline-block;"></span>
              <strong style="color:#ef4444;">Do Not Disturb</strong>
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(container);

    // Setup input listeners
    document.getElementById('gcMessageInput')?.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        window.GlassChat.sendMessage();
      }
    });

    return container;
  }

  // 5. CLIENT CONTROLLER
  window.GlassChat = {
    async init() {
      ensureDOM();
      this.initSockets();
      await this.loadCurrentUser();
      await this.loadConversations();
    },

    initSockets() {
      if (typeof io !== 'undefined' && !socket) {
        socket = io({
          credentials: true,
          transports: ['websocket', 'polling']
        });

        socket.on('chat:message:new', msg => {
          const cid = Number(msg.conversation_id);
          // Update local cache in place for any conversation
          const cached = getCachedMessages(cid) || [];
          const alreadyExists = cached.some(m => Number(m.id) === Number(msg.id));
          if (!alreadyExists) {
            // Check if this matches an optimistic temp message sent by me
            const tempIdx = cached.findIndex(m =>
              String(m.id).startsWith('temp-') &&
              Number(m.sender_id) === Number(msg.sender_id) &&
              m.content === msg.content
            );
            if (tempIdx >= 0) {
              cached[tempIdx] = msg;
            } else {
              cached.push(msg);
            }
            setCachedMessages(cid, cached);
          }

          if (activeConvId && cid === Number(activeConvId)) {
            this.reconcileIncomingMessage(msg);
          }
          // Update snippet in sidebar
          this.updateSidebarSnippet(msg.conversation_id, msg.content);
        });

        socket.on('chat:message:edited', updated => {
          const el = document.getElementById(`gc-msg-${updated.id}`);
          if (el) {
            const bubble = el.querySelector('.gc-bubble');
            if (bubble) bubble.textContent = updated.content;
            const meta = el.querySelector('.gc-msg-bottom-meta');
            if (meta && !meta.innerHTML.includes('(edited)')) {
              meta.innerHTML += ' <span style="font-size:9px;opacity:0.6;">(edited)</span>';
            }
          }
        });

        socket.on('chat:message:deleted', data => {
          const el = document.getElementById(`gc-msg-${data.id}`);
          if (el) el.remove();
        });

        socket.on('chat:typing', data => {
          if (activeConvId && Number(data.conversationId) === Number(activeConvId)) {
            const el = document.getElementById('gcActiveStatusText');
            if (el && data.isTyping) {
              el.textContent = `${data.userName || 'Someone'} is typing...`;
              clearTimeout(this._typingTimer);
              this._typingTimer = setTimeout(() => {
                el.textContent = activeConv?.type === 'team' ? `${activeConv.members?.length || 0} Members` : 'Active Now';
              }, 2500);
            }
          }
        });

        socket.on('chat:member:added', () => {
          if (activeConv && activeConv.type === 'team') {
            this.selectConversation(activeConv.id);
          }
        });

        socket.on('chat:member:removed', data => {
          if (activeConv && Number(data.conversationId) === Number(activeConv.id)) {
            if (Number(data.userId) === Number(currentUser?.id)) {
              this.loadConversations();
            } else {
              this.selectConversation(activeConv.id);
            }
          }
        });

        socket.on('chat:conversation:deleted', data => {
          if (activeConvId && Number(data.conversationId) === Number(activeConvId)) {
            this.loadConversations();
          }
        });
      }
    },

    async loadCurrentUser() {
      try {
        const res = await api('/api/auth/me');
        currentUser = res.user;
        if (currentUser) {
          const myAv = document.getElementById('gcMyAvatar');
          if (myAv) myAv.textContent = (currentUser.name || '✦')[0].toUpperCase();
        }
      } catch (_) {
        currentUser = { id: 1, name: 'Punit', username: 'punit' };
      }
    },

    async loadConversations() {
      // 1. Instant render from localStorage cache (< 10ms)
      const cached = readLocalCache('gc_cache_convs', null);
      if (Array.isArray(cached) && cached.length > 0 && conversations.length === 0) {
        conversations = cached;
        this.renderSidebar();
        if (!activeConvId && window.innerWidth > 768) {
          this.selectConversation(conversations[0].id);
        }
      }

      // 2. Stale-while-revalidate fetch in background
      try {
        const res = await api('/api/chat/conversations?type=personal');
        conversations = res.conversations || [];
        writeLocalCache('gc_cache_convs', conversations);
      } catch (_) {}

      this.renderSidebar();

      if (!activeConvId && conversations.length > 0 && window.innerWidth > 768) {
        await this.selectConversation(conversations[0].id);
      }

      // 3. Background prefetch top 3 chats so switching is 0ms
      conversations.slice(0, 3).forEach(c => {
        if (!getCachedMessages(c.id)) {
          api(`/api/chat/conversations/${c.id}/messages?limit=30`)
            .then(r => { if (r?.messages) setCachedMessages(c.id, r.messages); })
            .catch(() => {});
        }
      });
    },

    renderSidebar() {
      const personalList = document.getElementById('gcPersonalList');
      if (!personalList) return;
      personalList.innerHTML = '';

      const q = (document.getElementById('gcSearchInput')?.value || '').toLowerCase().trim();

      const filtered = conversations.filter(c => {
        if (!q) return true;
        const name = (c.name || '').toLowerCase();
        const handle = (c.handle || '').toLowerCase();
        return name.includes(q) || handle.includes(q);
      });

      if (filtered.length === 0) {
        personalList.innerHTML = `
          <div style="padding:20px 10px;text-align:center;font-size:12px;color:#64748b;">
            ${q ? 'No conversations found.' : 'No direct messages yet. Click + to start a chat!'}
          </div>
        `;
        return;
      }

      filtered.forEach(c => {
        const isAct = Number(c.id) === Number(activeConvId);
        const item = document.createElement('div');
        item.className = `gc-conv-item ${isAct ? 'active' : ''}`;
        item.onclick = () => this.selectConversation(c.id);

        const handle = c.handle || (c.recipient?.handle || '');
        const snippet = c.last_message?.content || "Tap to chat";

        item.innerHTML = `
          <div class="gc-conv-avatar-wrap">
            ${c.avatar_url ? `<img src="${c.avatar_url}" class="gc-conv-avatar" alt="">` : `<div class="gc-conv-avatar">${(c.name||'✦')[0].toUpperCase()}</div>`}
            <div class="gc-status-dot online"></div>
          </div>
          <div class="gc-conv-meta">
            <div class="gc-conv-top">
              <div class="gc-conv-name-wrap">
                <span class="gc-conv-name">${escapeText(c.name)}</span>
                ${handle ? `<span class="gc-conv-handle">• ${escapeText(handle)}</span>` : ''}
              </div>
              <span class="gc-conv-time">10:40 AM</span>
            </div>
            <div class="gc-conv-snippet">${escapeText(snippet)}</div>
          </div>
        `;

        personalList.appendChild(item);
      });
    },

    updateSidebarSnippet(convId, text) {
      const conv = conversations.find(c => Number(c.id) === Number(convId));
      if (conv) {
        if (!conv.last_message) conv.last_message = {};
        conv.last_message.content = text;
        this.renderSidebar();
      }
    },

    async selectConversation(id) {
      activeConvId = Number(id);
      this.renderSidebar();

      if (window.innerWidth <= 768) {
        document.getElementById('glassChatContainer')?.classList.add('gc-mobile-view-chat');
        document.body.classList.add('gc-chat-active');
        document.getElementById('gcColInspector')?.classList.remove('gc-mobile-inspector-open');
      }

      if (socket) socket.emit('chat:join', activeConvId);

      // 1. Instant header & cached messages render (< 20ms)
      const cachedConv = memDetails.get(activeConvId) || conversations.find(c => Number(c.id) === activeConvId);
      if (cachedConv) {
        activeConv = cachedConv;
        this.renderChatHeader(activeConv);
        this.updateInspector(activeConv);
      }

      const cachedMsgs = getCachedMessages(activeConvId);
      if (Array.isArray(cachedMsgs)) {
        currentMessages = cachedMsgs;
        this.renderMessages();
      } else {
        this.renderSkeletonMessages();
      }

      // 2. Parallel background revalidation (Details + Latest 30 Messages + Files)
      try {
        const [detailRes, msgRes, filesRes] = await Promise.all([
          api(`/api/chat/conversations/${activeConvId}`).catch(() => null),
          api(`/api/chat/conversations/${activeConvId}/messages?limit=30`).catch(() => null),
          api(`/api/chat/conversations/${activeConvId}/files`).catch(() => null)
        ]);

        // Ignore stale response if user already switched to another chat
        if (Number(activeConvId) !== Number(id)) return;

        if (detailRes?.conversation) {
          activeConv = detailRes.conversation;
          memDetails.set(activeConvId, activeConv);
          this.renderChatHeader(activeConv);
          this.updateInspector(activeConv);
        }

        if (msgRes?.messages) {
          currentMessages = msgRes.messages;
          setCachedMessages(activeConvId, currentMessages);
          this.renderMessages();
        } else if (!Array.isArray(cachedMsgs)) {
          currentMessages = [];
          this.renderMessages();
        }

        if (filesRes) {
          this.renderFiles(filesRes);
        }
      } catch (_) {}
    },

    renderChatHeader(conv) {
      if (!conv) return;
      const activeTitle = document.getElementById('gcActiveTitle');
      const activeHandle = document.getElementById('gcActiveHandle');
      const activeAvatar = document.getElementById('gcActiveAvatar');
      const activeStatusText = document.getElementById('gcActiveStatusText');

      if (conv.type === 'team') {
        activeTitle.textContent = `#${conv.name}`;
        activeHandle.textContent = conv.visibility === 'private' ? '🔒 Private Channel' : '🌐 Public Channel';
        activeAvatar.textContent = '#';
        activeAvatar.className = 'gc-user-avatar channel-hash';
        activeStatusText.textContent = `${conv.members?.length || 0} Members`;
      } else {
        activeTitle.textContent = conv.name;
        activeHandle.textContent = conv.handle || conv.recipient?.handle || '';
        activeAvatar.textContent = (conv.name || '✦')[0].toUpperCase();
        activeAvatar.className = 'gc-user-avatar';
        activeStatusText.textContent = 'Active Now';
      }
    },

    renderSkeletonMessages() {
      const container = document.getElementById('gcChatMessages');
      if (!container) return;
      container.innerHTML = `
        <div class="gc-skeleton-row"><div class="gc-skeleton-bubble" style="width:180px;"></div></div>
        <div class="gc-skeleton-row right"><div class="gc-skeleton-bubble" style="width:220px;"></div></div>
        <div class="gc-skeleton-row"><div class="gc-skeleton-bubble" style="width:250px;"></div></div>
      `;
    },

    reconcileIncomingMessage(msg) {
      // Avoid duplicates if optimistic bubble already rendered
      const existingEl = document.getElementById(`gc-msg-${msg.id}`);
      if (existingEl) return;

      const tempIndex = currentMessages.findIndex(m =>
        String(m.id).startsWith('temp-') &&
        Number(m.sender_id) === Number(msg.sender_id) &&
        m.content === msg.content
      );

      if (tempIndex >= 0) {
        const tempId = currentMessages[tempIndex].id;
        currentMessages[tempIndex] = msg;
        const tempEl = document.getElementById(`gc-msg-${tempId}`);
        if (tempEl) {
          tempEl.id = `gc-msg-${msg.id}`;
          const statusEl = tempEl.querySelector('.gc-send-state');
          if (statusEl) statusEl.textContent = msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '✓';
          return;
        }
      }

      currentMessages.push(msg);
      this.appendMessage(msg);
    },

    updateInspector(conv) {
      const nameEl = document.getElementById('gcInspName');
      const handleEl = document.getElementById('gcInspHandle');
      const avatarEl = document.getElementById('gcInspAvatar');
      const roleEl = document.getElementById('gcInspRole');
      const bioEl = document.getElementById('gcInspBio');
      const cityEl = document.getElementById('gcInspCity');
      const intWrap = document.getElementById('gcInspInterests');
      const mWrap = document.getElementById('gcInspMembersWrap');
      const channelControls = document.getElementById('gcChannelControls');
      const deleteBtn = document.getElementById('gcBtnDeleteChannel');

      if (conv.type === 'team') {
        nameEl.textContent = `#${conv.name}`;
        handleEl.textContent = conv.visibility === 'private' ? '🔒 Private Channel' : '🌐 Public Channel';
        avatarEl.textContent = '#';
        avatarEl.className = 'gc-inspector-avatar channel-hash';
        roleEl.textContent = conv.description || 'Team Collaboration Channel';
        bioEl.textContent = conv.description || 'Welcome to this team channel. Collaborate, share code, and discuss topics.';
        cityEl.textContent = 'Global';
        intWrap.innerHTML = `<span class="gc-tag-pill">#${conv.name}</span><span class="gc-tag-pill">${conv.visibility}</span>`;

        // Show channel member management
        if (channelControls) channelControls.style.display = 'block';
        if (mWrap) mWrap.style.display = 'block';

        const isOwner = conv.currentUserRole === 'owner' || Number(conv.created_by) === Number(currentUser?.id);
        if (deleteBtn) deleteBtn.style.display = isOwner ? 'block' : 'none';

        // Render member list
        const mList = document.getElementById('gcMemberList');
        const mCount = document.getElementById('gcMemberCount');
        if (mCount) mCount.textContent = `${conv.members?.length || 0}`;

        if (mList) {
          mList.innerHTML = '';
          (conv.members || []).forEach(m => {
            const row = document.createElement('div');
            row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:6px 8px;border-radius:8px;background:rgba(255,255,255,0.03);';
            const isMe = Number(m.id) === Number(currentUser?.id);
            const roleBadge = m.role === 'owner' ? '<span style="font-size:9.5px;background:rgba(168,85,247,0.3);color:#e9d5ff;padding:1px 5px;border-radius:4px;font-weight:700;">OWNER</span>' : (m.role === 'admin' ? '<span style="font-size:9.5px;background:rgba(34,197,94,0.2);color:#86efac;padding:1px 5px;border-radius:4px;font-weight:700;">ADMIN</span>' : '');

            row.innerHTML = `
              <div style="display:flex;align-items:center;gap:8px;overflow:hidden;">
                <div style="width:26px;height:26px;border-radius:50%;background:rgba(168,85,247,0.3);color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;">
                  ${(m.name||'U')[0].toUpperCase()}
                </div>
                <div style="overflow:hidden;">
                  <div style="font-size:12px;font-weight:700;color:#f1f5f9;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                    ${escapeText(m.name)} ${isMe ? '(You)' : ''} ${roleBadge}
                  </div>
                  <div style="font-size:10.5px;color:#94a3b8;">${escapeText(m.handle || `@${m.username||'user'}`)}</div>
                </div>
              </div>
              <div style="display:flex;align-items:center;gap:4px;">
                ${!isMe ? `<button class="gc-act-btn" title="Message 1-on-1" onclick="window.GlassChat.openDM(${m.id})">💬</button>` : ''}
                ${isOwner && !isMe ? `<button class="gc-act-btn" title="Remove Member" style="color:#ef4444;" onclick="window.GlassChat.removeMemberFromChannel(${m.id})">✕</button>` : ''}
              </div>
            `;
            mList.appendChild(row);
          });
        }
      } else {
        // Personal 1-on-1 DM Inspector
        if (channelControls) channelControls.style.display = 'none';
        if (mWrap) mWrap.style.display = 'none';

        const rec = conv.recipient || {};
        nameEl.textContent = conv.name;
        handleEl.textContent = conv.handle || rec.handle || `@${rec.username || 'user'}`;
        avatarEl.textContent = (conv.name || '✦')[0].toUpperCase();
        avatarEl.className = 'gc-inspector-avatar';
        roleEl.textContent = rec.bio || 'Student & SkillMate Peer';
        bioEl.textContent = rec.bio || 'Student exploring software projects, learning by building, and collaborating on SkillMate.';
        cityEl.textContent = rec.city || 'India';

        intWrap.innerHTML = '';
        const interests = rec.interests || ['AI', 'Python', 'Web Development'];
        interests.forEach(topic => {
          const pill = document.createElement('span');
          pill.className = 'gc-tag-pill';
          pill.textContent = topic;
          intWrap.appendChild(pill);
        });
      }
    },

    renderMessages() {
      const container = document.getElementById('gcChatMessages');
      if (!container) return;
      container.innerHTML = '';

      if (!currentMessages || currentMessages.length === 0) {
        const rawName = activeConv?.name || 'this conversation';
        const displayName = activeConv?.type === 'team' ? (rawName.startsWith('#') ? rawName : `#${rawName}`) : rawName;
        const emptyEl = document.createElement('div');
        emptyEl.className = 'gc-empty-chat-state';
        emptyEl.innerHTML = `
          <div class="gc-empty-icon-box">
            ${activeConv?.type === 'team' ? '<span style="font-size:30px;font-weight:900;color:#c084fc;">#</span>' : ICONS.smile}
          </div>
          <div class="gc-empty-title">Start the conversation with ${escapeText(displayName)}</div>
          <div class="gc-empty-subtitle">Send a message, share code or files, or start an audio huddle to get things rolling.</div>
        `;
        container.appendChild(emptyEl);
        return;
      }

      currentMessages.forEach(m => this.appendMessage(m));
      container.scrollTop = container.scrollHeight;
    },

    appendMessage(msg) {
      const container = document.getElementById('gcChatMessages');
      if (!container) return;

      const emptyState = container.querySelector('.gc-empty-chat-state');
      if (emptyState) emptyState.remove();

      const isMe = (Number(msg.sender_id) === Number(currentUser?.id)) || (msg.sender_name === 'You');
      const row = document.createElement('div');
      row.className = `gc-message-row ${isMe ? 'outgoing' : 'incoming'}`;
      row.id = `gc-msg-${msg.id}`;

      let contentHtml = escapeText(msg.content);

      if (msg.type === 'code' || msg.content.includes('```')) {
        const clean = msg.content.replace(/```[a-z]*\n?/g, '').replace(/```/g, '');
        contentHtml = `
          <div class="gc-code-block">
            <div class="gc-code-header">
              <span>CODE SNIPPET</span>
              <button class="gc-code-copy-btn" onclick="navigator.clipboard.writeText(this.closest('.gc-code-block').querySelector('pre').textContent); this.textContent='Copied!'; setTimeout(()=>this.textContent='Copy', 1500)">Copy</button>
            </div>
            <pre><code>${escapeText(clean)}</code></pre>
          </div>
        `;
      } else if (msg.type === 'file' && msg.metadata?.url) {
        if (msg.metadata.fileType?.startsWith('image/')) {
          contentHtml = `<img src="${msg.metadata.url}" style="max-width:240px;border-radius:10px;cursor:pointer;" onclick="window.GlassChat.openLightbox('${msg.metadata.url}')">`;
        } else {
          contentHtml = `
            <div style="display:flex;align-items:center;gap:8px;">
              <span>${ICONS.paperclip}</span>
              <a href="${msg.metadata.url}" download style="color:#fff;font-weight:700;">${escapeText(msg.metadata.fileName || 'Attachment')}</a>
            </div>
          `;
        }
      }

      // Quote Reply Header
      let replyHtml = '';
      if (msg.reply_to) {
        replyHtml = `
          <div class="gc-reply-preview-in-msg">
            <strong>↳ ${escapeText(msg.reply_to.sender_name || 'User')}:</strong> ${escapeText(msg.reply_to.content || '').slice(0, 50)}
          </div>
        `;
      }

      // Reactions
      let reactionsHtml = '';
      if (Array.isArray(msg.reactions) && msg.reactions.length > 0) {
        reactionsHtml = `<div class="gc-reactions-wrap" style="display:flex;gap:4px;margin-top:4px;">`;
        msg.reactions.forEach(r => {
          reactionsHtml += `<span style="background:rgba(168,85,247,0.25);border:1px solid rgba(168,85,247,0.4);border-radius:10px;padding:2px 7px;font-size:11px;">${r.emoji}</span>`;
        });
        reactionsHtml += `</div>`;
      }

      const senderDisplay = msg.sender_handle ? `${escapeText(msg.sender_name)} <span>${escapeText(msg.sender_handle)}</span>` : escapeText(msg.sender_name || 'User');

      row.innerHTML = `
        <div class="gc-msg-avatar">${isMe ? (currentUser?.name||'U')[0].toUpperCase() : (msg.sender_name || '✦')[0].toUpperCase()}</div>
        <div class="gc-bubble-wrap">
          ${!isMe ? `<div class="gc-bubble-sender">${senderDisplay}</div>` : ''}
          <div class="gc-bubble">
            ${replyHtml}
            ${contentHtml}
          </div>
          <div class="gc-msg-bottom-meta">
            <span class="gc-send-state">${msg._sending ? '⏱ Sending...' : (msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now')}</span>
            ${msg.is_edited ? '<span style="font-size:9px;opacity:0.6;">(edited)</span>' : ''}
            ${reactionsHtml}
          </div>
        </div>
        <div class="gc-msg-actions">
          <button class="gc-act-btn" title="Reply" onclick="window.GlassChat.stageReply(${msg.id}, '${escapeText(msg.sender_name)}', '${escapeText(msg.content)}')">${ICONS.reply}</button>
          <button class="gc-act-btn" title="React" onclick="window.GlassChat.react(${msg.id}, '❤️')">❤️</button>
          <button class="gc-act-btn" title="React" onclick="window.GlassChat.react(${msg.id}, '👍')">👍</button>
          <button class="gc-act-btn" title="Pin" onclick="window.GlassChat.pin(${msg.id})">${ICONS.pin}</button>
          ${isMe ? `<button class="gc-act-btn" title="Edit" onclick="window.GlassChat.openEditMessageModal(${msg.id})">${ICONS.edit}</button>` : ''}
          ${isMe ? `<button class="gc-act-btn" title="Delete" style="color:#ef4444;" onclick="window.GlassChat.deleteMessage(${msg.id})">${ICONS.trash}</button>` : ''}
        </div>
      `;

      container.appendChild(row);
      container.scrollTop = container.scrollHeight;
    },

    stageReply(id, senderName, content) {
      stagedReply = { id, senderName, content };
      const bar = document.getElementById('gcReplyStaging');
      const text = document.getElementById('gcReplyText');
      if (bar && text) {
        text.textContent = `Replying to ${senderName}: "${content.slice(0, 50)}"`;
        bar.style.display = 'flex';
      }
      document.getElementById('gcMessageInput')?.focus();
    },

    cancelReply() {
      stagedReply = null;
      const bar = document.getElementById('gcReplyStaging');
      if (bar) bar.style.display = 'none';
    },

    async sendMessage(retryPayload = null) {
      const input = document.getElementById('gcMessageInput');
      const text = retryPayload ? retryPayload.content : (input?.value || '').trim();
      const targetConvId = retryPayload ? retryPayload.conversationId : activeConvId;
      if (!text || !targetConvId) return;

      const replyToId = retryPayload ? retryPayload.replyToId : (stagedReply?.id || null);
      const tempId = retryPayload ? retryPayload.tempId : `temp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

      if (!retryPayload) {
        this.cancelReply();
        if (input) input.value = '';

        // 0ms Optimistic Render
        const optimisticMsg = {
          id: tempId,
          conversation_id: targetConvId,
          sender_id: currentUser?.id || 1,
          sender_name: currentUser?.name || 'You',
          content: text,
          type: 'text',
          reply_to_id: replyToId,
          reactions: [],
          _sending: true,
          created_at: new Date().toISOString()
        };
        currentMessages.push(optimisticMsg);
        setCachedMessages(targetConvId, currentMessages);
        this.appendMessage(optimisticMsg);
        this.updateSidebarSnippet(targetConvId, text);
      } else {
        const retryEl = document.getElementById(`gc-msg-${tempId}`);
        const statusEl = retryEl?.querySelector('.gc-send-state');
        if (statusEl) statusEl.textContent = '⏱ Retrying...';
      }

      try {
        const res = await api(`/api/chat/conversations/${targetConvId}/messages`, {
          method: 'POST',
          body: JSON.stringify({ content: text, type: 'text', replyToId })
        });

        if (res?.message) {
          const realMsg = res.message;
          const idx = currentMessages.findIndex(m => String(m.id) === String(tempId));
          if (idx >= 0) currentMessages[idx] = realMsg;
          setCachedMessages(targetConvId, currentMessages);

          const domRow = document.getElementById(`gc-msg-${tempId}`);
          if (domRow) {
            domRow.id = `gc-msg-${realMsg.id}`;
            const statusEl = domRow.querySelector('.gc-send-state');
            if (statusEl) {
              statusEl.textContent = realMsg.created_at
                ? new Date(realMsg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                : '✓';
            }
          }
        }
      } catch (err) {
        const domRow = document.getElementById(`gc-msg-${tempId}`);
        const statusEl = domRow?.querySelector('.gc-send-state');
        if (statusEl) {
          statusEl.innerHTML = `<button class="gc-retry-btn" onclick='window.GlassChat.sendMessage(${JSON.stringify({ tempId, conversationId: targetConvId, content: text, replyToId })})'>Failed • Retry</button>`;
        }
      }
    },

    openEditMessageModal(msgId) {
      const msg = currentMessages.find(m => Number(m.id) === Number(msgId));
      if (!msg) return;
      document.getElementById('gcEditMsgId').value = msg.id;
      document.getElementById('gcEditMsgText').value = msg.content;
      document.getElementById('gcEditMsgModal').classList.add('open');
    },

    async saveEditedMessage() {
      const id = document.getElementById('gcEditMsgId').value;
      const content = document.getElementById('gcEditMsgText').value.trim();
      if (!id || !content) return;

      try {
        await api(`/api/chat/messages/${id}`, {
          method: 'PUT',
          body: JSON.stringify({ content })
        });
        document.getElementById('gcEditMsgModal').classList.remove('open');
      } catch (err) {
        showGlassToast(err.message);
      }
    },

    deleteMessage(msgId) {
      this.confirmModal("Delete Message", "Are you sure you want to delete this message?", async () => {
        try {
          await api(`/api/chat/messages/${msgId}`, { method: 'DELETE' });
        } catch (err) {
          console.error(err);
        }
      });
    },

    confirmModal(title, msg, onConfirm) {
      const modal = document.getElementById('gcConfirmModal');
      document.getElementById('gcConfirmTitle').textContent = title;
      document.getElementById('gcConfirmMessage').textContent = msg;
      const btn = document.getElementById('gcConfirmActionBtn');
      btn.onclick = () => {
        modal.classList.remove('open');
        onConfirm();
      };
      modal.classList.add('open');
    },

    async react(msgId, emoji) {
      try {
        await api(`/api/chat/messages/${msgId}/react`, {
          method: 'POST',
          body: JSON.stringify({ emoji })
        });
      } catch (err) {
        console.error(err);
      }
    },

    async pin(msgId) {
      try {
        await api(`/api/chat/messages/${msgId}/pin`, { method: 'POST' });
      } catch (err) {
        console.error(err);
      }
    },

    async handleFileUpload(file) {
      if (!file || !activeConvId) return;
      const formData = new FormData();
      formData.append('file', file);

      try {
        const uploadRes = await fetch('/api/chat/upload', { method: 'POST', body: formData }).then(r => r.json());
        if (uploadRes.url) {
          await api(`/api/chat/conversations/${activeConvId}/messages`, {
            method: 'POST',
            body: JSON.stringify({
              content: `Shared file: ${uploadRes.fileName}`,
              type: 'file',
              metadata: uploadRes
            })
          });
        }
      } catch (err) {
        console.error('File upload error:', err);
      }
    },

    async loadFiles(convId) {
      try {
        const res = await api(`/api/chat/conversations/${convId}/files`);
        this.renderFiles(res);
      } catch (_) {}
    },

    renderFiles(res) {
      const docList = document.getElementById('gcUploadedFilesList');
      const mediaGrid = document.getElementById('gcAttachmentsGrid');

      if (docList) {
        docList.innerHTML = '';
        const docs = res.docs || [];
        if (docs.length === 0) {
          docList.innerHTML = '<div style="font-size:11.5px;color:#64748b;padding:8px 0;">No shared documents yet.</div>';
        } else {
          docs.forEach(d => {
            const item = document.createElement('div');
            item.className = 'gc-file-item';
            item.innerHTML = `
              <span>${ICONS.paperclip}</span>
              <div class="gc-file-info">
                <div class="gc-file-name">${escapeText(d.file_name)}</div>
                <div class="gc-file-size">${Math.round((d.file_size||0)/1024)} KB</div>
              </div>
              <a href="${d.file_url}" download style="color:#c084fc;font-size:12px;font-weight:700;">↓</a>
            `;
            docList.appendChild(item);
          });
        }
      }

      if (mediaGrid) {
        mediaGrid.innerHTML = '';
        const media = res.media || [];
        if (media.length === 0) {
          mediaGrid.innerHTML = '<div style="grid-column:1/-1;font-size:11.5px;color:#64748b;padding:8px 0;">No media attachments yet.</div>';
        } else {
          media.forEach(m => {
            const thumb = document.createElement('div');
            thumb.className = 'gc-grid-thumb';
            thumb.innerHTML = `<img src="${m.file_url}" alt="">`;
            thumb.onclick = () => window.GlassChat.openLightbox(m.file_url);
            mediaGrid.appendChild(thumb);
          });
        }
      }
    },

    openLightbox(url) {
      let lb = document.getElementById('gcLightbox');
      if (!lb) {
        lb = document.createElement('div');
        lb.id = 'gcLightbox';
        lb.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.92);backdrop-filter:blur(10px);z-index:999999;display:flex;align-items:center;justify-content:center;cursor:pointer;';
        lb.innerHTML = '<img id="gcLightboxImg" style="max-width:90%;max-height:90%;border-radius:12px;box-shadow:0 0 50px rgba(168,85,247,0.4);"><button style="position:absolute;top:24px;right:24px;background:none;border:none;color:#fff;font-size:24px;cursor:pointer;">✕</button>';
        lb.onclick = () => { lb.style.display = 'none'; };
        document.body.appendChild(lb);
      }
      document.getElementById('gcLightboxImg').src = url;
      lb.style.display = 'flex';
    },

    // 1-on-1 DM: Wire Message button everywhere
    async openDM(targetUserId) {
      ensureDOM();
      this.open();

      try {
        const res = await api(`/api/chat/dm/${targetUserId}`, { method: 'POST' });
        if (res.conversation) {
          await this.loadConversations();
          await this.selectConversation(res.conversation.id);
        }
      } catch (err) {
        console.error('Error opening DM:', err);
      }
    },

    // Channel: Open in Channel Mode
    async openChannel(channelId) {
      ensureDOM();
      this.open();
      await this.selectConversation(channelId);
    },

    // New DM Modal (Real Users)
    openNewDMModal() {
      ensureDOM();
      const modal = document.getElementById('gcNewDMModal');
      document.getElementById('gcDMUserSearch').value = '';
      this.searchRegisteredUsers('');
      modal.classList.add('open');
    },

    async searchRegisteredUsers(q) {
      const container = document.getElementById('gcDMUserResults');
      if (!container) return;

      try {
        const res = await api(`/api/chat/users/search?q=${encodeURIComponent(q)}`);
        const users = res.users || [];

        if (users.length === 0) {
          container.innerHTML = '<div style="text-align:center;padding:20px;color:#64748b;font-size:12.5px;">No members found.</div>';
          return;
        }

        container.innerHTML = '';
        users.forEach(u => {
          const item = document.createElement('div');
          item.className = 'gc-file-item';
          item.style.cursor = 'pointer';
          item.innerHTML = `
            <div style="width:34px;height:34px;border-radius:50%;background:var(--gc-purple-gradient);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;flex-shrink:0;">
              ${(u.name||'U')[0].toUpperCase()}
            </div>
            <div style="flex:1;min-width:0;">
              <div style="font-size:13px;font-weight:700;color:#fff;">${escapeText(u.name)} <span style="font-size:11.5px;color:#c084fc;">${escapeText(u.handle||'@'+u.username)}</span></div>
              <div style="font-size:11px;color:#94a3b8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeText(u.bio || u.city || 'SkillMate Member')}</div>
            </div>
            <button class="gc-btn-new-recruitment" style="padding:4px 10px;font-size:11px;">Message</button>
          `;
          item.onclick = async () => {
            document.getElementById('gcNewDMModal').classList.remove('open');
            await this.openDM(u.id);
          };
          container.appendChild(item);
        });
      } catch (_) {}
    },

    // Create Channel Modal
    openCreateChannelModal() {
      ensureDOM();
      document.getElementById('gcNewChannelName').value = '';
      document.getElementById('gcNewChannelDesc').value = '';
      document.getElementById('gcCreateChannelModal').classList.add('open');
    },

    async submitCreateChannel() {
      const name = document.getElementById('gcNewChannelName').value.trim();
      const desc = document.getElementById('gcNewChannelDesc').value.trim();
      const vis = document.querySelector('input[name="gcChannelVis"]:checked')?.value || 'public';

      if (!name) return;

      try {
        const res = await api('/api/chat/conversations', {
          method: 'POST',
          body: JSON.stringify({ type: 'team', name, description: desc, visibility: vis })
        });

        document.getElementById('gcCreateChannelModal').classList.remove('open');
        if (res.conversation) {
          await this.selectConversation(res.conversation.id);
          // If on Network Channels page, refresh channels list
          if (typeof window.loadNetworkChannels === 'function') {
            window.loadNetworkChannels();
          }
        }
      } catch (err) {
        showGlassToast(err.message);
      }
    },

    // Add Member Modal (for Channel Inspector)
    openAddMemberModal() {
      if (!activeConv || activeConv.type !== 'team') return;
      document.getElementById('gcAddMemberSearch').value = '';
      this.searchMembersToAdd('');
      document.getElementById('gcAddMemberModal').classList.add('open');
    },

    async searchMembersToAdd(q) {
      const container = document.getElementById('gcAddMemberResults');
      if (!container || !activeConv) return;

      try {
        const res = await api(`/api/chat/users/search?q=${encodeURIComponent(q)}`);
        const existingIds = new Set((activeConv.members || []).map(m => Number(m.id)));
        const users = (res.users || []).filter(u => !existingIds.has(Number(u.id)));

        if (users.length === 0) {
          container.innerHTML = '<div style="text-align:center;padding:20px;color:#64748b;font-size:12.5px;">No eligible users to invite.</div>';
          return;
        }

        container.innerHTML = '';
        users.forEach(u => {
          const item = document.createElement('div');
          item.className = 'gc-file-item';
          item.style.cursor = 'pointer';
          item.innerHTML = `
            <div style="width:32px;height:32px;border-radius:50%;background:rgba(168,85,247,0.3);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;flex-shrink:0;">
              ${(u.name||'U')[0].toUpperCase()}
            </div>
            <div style="flex:1;min-width:0;">
              <div style="font-size:12.5px;font-weight:700;color:#fff;">${escapeText(u.name)} <span style="font-size:11px;color:#c084fc;">${escapeText(u.handle||'@'+u.username)}</span></div>
              <div style="font-size:11px;color:#94a3b8;">${escapeText(u.city || 'India')}</div>
            </div>
            <button class="gc-btn-new-recruitment" style="padding:4px 10px;font-size:11px;">+ Add</button>
          `;
          item.onclick = async () => {
            try {
              await api(`/api/chat/conversations/${activeConv.id}/members`, {
                method: 'POST',
                body: JSON.stringify({ userId: u.id, role: 'member' })
              });
              document.getElementById('gcAddMemberModal').classList.remove('open');
              await this.selectConversation(activeConv.id);
            } catch (err) {
              showGlassToast(err.message);
            }
          };
          container.appendChild(item);
        });
      } catch (_) {}
    },

    removeMemberFromChannel(userId) {
      if (!activeConv) return;
      this.confirmModal("Remove Member", "Remove this member from the channel?", async () => {
        try {
          await api(`/api/chat/conversations/${activeConv.id}/members/${userId}`, { method: 'DELETE' });
          await this.selectConversation(activeConv.id);
        } catch (err) {
          console.error(err);
        }
      });
    },

    leaveCurrentChannel() {
      if (!activeConv || activeConv.type !== 'team') return;
      this.confirmModal("Leave Channel", `Are you sure you want to leave #${activeConv.name}?`, async () => {
        try {
          await api(`/api/chat/conversations/${activeConv.id}/leave`, { method: 'POST' });
          this.close();
          if (typeof window.loadNetworkChannels === 'function') {
            window.loadNetworkChannels();
          }
        } catch (err) {
          console.error(err);
        }
      });
    },

    deleteCurrentChannel() {
      if (!activeConv || activeConv.type !== 'team') return;
      this.confirmModal("Delete Channel", `Permanently delete #${activeConv.name} and all its messages?`, async () => {
        try {
          await api(`/api/chat/conversations/${activeConv.id}`, { method: 'DELETE' });
          this.close();
          if (typeof window.loadNetworkChannels === 'function') {
            window.loadNetworkChannels();
          }
        } catch (err) {
          console.error(err);
        }
      });
    },

    // UI helpers
    _bindMobileViewport() {
      if (this._vvBound || !window.visualViewport) return;
      this._vvBound = true;
      const syncViewport = () => {
        const c = document.getElementById('glassChatContainer');
        if (!c || !c.classList.contains('open') || window.innerWidth > 768) {
          if (c) {
            c.style.height = '';
            c.style.top = '';
          }
          return;
        }
        const vv = window.visualViewport;
        c.style.height = `${vv.height}px`;
        c.style.top = `${vv.offsetTop}px`;
        const stream = document.getElementById('gcChatMessages');
        if (stream && c.classList.contains('gc-mobile-view-chat')) {
          stream.scrollTop = stream.scrollHeight;
        }
      };
      window.visualViewport.addEventListener('resize', syncViewport);
      window.visualViewport.addEventListener('scroll', syncViewport);
    },

    open(targetId) {
      ensureDOM();
      this._bindMobileViewport();
      const c = document.getElementById('glassChatContainer');
      if (c) {
        c.classList.add('open');
        if (!targetId && window.innerWidth <= 768) {
          c.classList.remove('gc-mobile-view-chat');
          document.body.classList.remove('gc-chat-active');
        }
      }
      if (targetId) this.selectConversation(targetId);
    },

    exitMobileChat() {
      document.getElementById('glassChatContainer')?.classList.remove('gc-mobile-view-chat');
      document.body.classList.remove('gc-chat-active');
      document.getElementById('gcColInspector')?.classList.remove('gc-mobile-inspector-open');
    },

    close() {
      const c = document.getElementById('glassChatContainer');
      if (c) {
        c.classList.remove('open', 'gc-mobile-view-chat');
        c.style.height = '';
        c.style.top = '';
      }
      document.body.classList.remove('gc-chat-active');
      document.getElementById('gcColInspector')?.classList.remove('gc-mobile-inspector-open');
    },

    handleSearch(val) {
      this.renderSidebar();
    },

    switchTab(tab) {
      const btnInfo = document.getElementById('gcTabBtnInfo');
      const btnFiles = document.getElementById('gcTabBtnFiles');
      const tabInfo = document.getElementById('gcTabInfo');
      const tabFiles = document.getElementById('gcTabFiles');

      if (tab === 'info') {
        btnInfo?.classList.add('active');
        btnFiles?.classList.remove('active');
        if (tabInfo) tabInfo.style.display = 'block';
        if (tabFiles) tabFiles.style.display = 'none';
      } else {
        btnInfo?.classList.remove('active');
        btnFiles?.classList.add('active');
        if (tabInfo) tabInfo.style.display = 'none';
        if (tabFiles) tabFiles.style.display = 'block';
      }
    },

    toggleInspector() {
      const insp = document.getElementById('gcColInspector');
      if (!insp) return;
      if (window.innerWidth <= 768) {
        insp.classList.remove('collapsed');
        insp.classList.toggle('gc-mobile-inspector-open');
      } else {
        insp.classList.toggle('collapsed');
      }
    },

    closeInspector() {
      document.getElementById('gcColInspector')?.classList.remove('gc-mobile-inspector-open');
    },

    toggleEmojiPicker() {
      const input = document.getElementById('gcMessageInput');
      if (input) {
        input.value += ' 😊';
        input.focus();
      }
    },

    toggleVoiceRecord() {
      const wrap = document.getElementById('gcVoiceRecWrap');
      if (wrap) {
        wrap.style.display = wrap.style.display === 'none' ? 'flex' : 'none';
      }
    },

    cancelVoiceRecord() {
      const wrap = document.getElementById('gcVoiceRecWrap');
      if (wrap) wrap.style.display = 'none';
    },

    openStatusModal() {
      document.getElementById('gcStatusModal')?.classList.add('open');
    },

    setStatus(status) {
      const dot = document.getElementById('gcMyStatusDot');
      if (dot) {
        dot.className = `gc-status-dot ${status}`;
      }
      if (socket) {
        socket.emit('chat:status:change', { status });
      }
      document.getElementById('gcStatusModal')?.classList.remove('open');
    },

    startHuddle(withVideo) {
      if (!activeConvId) return;
      if (socket) {
        socket.emit('chat:call:join', { conversationId: activeConvId, hasVideo: withVideo, userName: currentUser?.name });
      }
      showGlassToast(`📞 Connected to Audio/Video Huddle in ${activeConv?.name || 'chat'} via WebRTC`);
    },

    togglePinnedModal() {
      if (!activeConv) return;
      const modal = document.getElementById('gcPinnedModal');
      const container = document.getElementById('gcPinnedList');
      if (!modal || !container) return;

      const pinned = currentMessages.filter(m => m.is_pinned);
      if (pinned.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:24px;color:#64748b;font-size:12.5px;">No pinned messages yet. Hover over any message and click 📌 to pin it.</div>';
      } else {
        container.innerHTML = '';
        pinned.forEach(p => {
          const item = document.createElement('div');
          item.className = 'gc-file-item';
          item.innerHTML = `
            <div style="flex:1;min-width:0;">
              <div style="font-size:11px;font-weight:700;color:#c084fc;">${escapeText(p.sender_name)}</div>
              <div style="font-size:12.5px;color:#f1f5f9;margin-top:2px;">${escapeText(p.content)}</div>
            </div>
            <button class="gc-act-btn" onclick="window.GlassChat.pin(${p.id}); window.GlassChat.togglePinnedModal();">✕</button>
          `;
          container.appendChild(item);
        });
      }
      modal.classList.add('open');
    },

    viewAllFiles() {
      if (activeConvId) this.loadFiles(activeConvId);
    },

    viewAllAttachments() {
      if (activeConvId) this.loadFiles(activeConvId);
    }
  };

  // Override window.openChat
  window.openChat = function(personId) {
    if (personId) {
      window.GlassChat.openDM(personId);
    } else {
      window.GlassChat.open();
    }
  };

  window.openDiscord = function(targetId) {
    if (window.GlassChat) window.GlassChat.open(targetId);
  };

  // Initialize on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.GlassChat.init());
  } else {
    window.GlassChat.init();
  }
})();
