(() => {
  'use strict';

  // 1. INJECT DARK GLASSMORPHISM STYLES (Strictly inspired by Reference Design)
  const styleEl = document.createElement('style');
  styleEl.id = 'glass-messenger-styles';
  styleEl.textContent = `
    :root {
      --gc-bg-base: #090810;
      --gc-bg-glass: rgba(16, 13, 26, 0.82);
      --gc-bg-sidebar: rgba(12, 10, 20, 0.75);
      --gc-bg-input: rgba(22, 18, 36, 0.88);
      --gc-bg-card-hover: rgba(255, 255, 255, 0.06);
      --gc-border: rgba(255, 255, 255, 0.08);
      --gc-border-focus: rgba(168, 85, 247, 0.6);
      --gc-purple-primary: #a855f7;
      --gc-purple-gradient: linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%);
      --gc-purple-glow: 0 0 25px rgba(168, 85, 247, 0.35);
      --gc-text-main: #f8fafc;
      --gc-text-muted: #94a3b8;
      --gc-online: #22c55e;
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
        radial-gradient(circle at 18% 22%, rgba(139, 92, 246, 0.28) 0%, transparent 48%),
        radial-gradient(circle at 82% 78%, rgba(217, 70, 239, 0.22) 0%, transparent 50%),
        radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.1) 0%, transparent 65%);
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
      background: rgba(14, 12, 22, 0.7);
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
    .gc-nav-links {
      display: flex;
      gap: 6px;
      margin-left: 20px;
    }
    .gc-nav-link {
      background: transparent;
      border: none;
      color: var(--gc-text-muted);
      font-size: 13px;
      font-weight: 600;
      padding: 6px 12px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .gc-nav-link:hover, .gc-nav-link.active {
      color: #fff;
      background: rgba(255, 255, 255, 0.08);
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
      box-shadow: 0 25px 70px rgba(0, 0, 0, 0.65), 0 0 80px rgba(139, 92, 246, 0.14);
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
      font-size: 19px;
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
      font-size: 12px;
      font-weight: 700;
      color: var(--gc-text-muted);
      padding: 10px 10px 4px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      user-select: none;
      letter-spacing: 0.02em;
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
    .gc-conv-name {
      font-size: 13.5px;
      font-weight: 700;
      color: #f1f5f9;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1;
      min-width: 0;
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
    .gc-conv-badge {
      background: var(--gc-purple-gradient);
      color: #fff;
      font-size: 10px;
      font-weight: 800;
      border-radius: 10px;
      padding: 1px 6px;
      margin-left: 6px;
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
      background: rgba(18, 14, 28, 0.5);
      flex-shrink: 0;
    }
    .gc-chat-header-user {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .gc-active-title {
      font-size: 16px;
      font-weight: 800;
      color: #fff;
      line-height: 1.2;
    }
    .gc-active-status {
      font-size: 12px;
      color: var(--gc-online);
      display: flex;
      align-items: center;
      gap: 5px;
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

    .gc-bubble {
      padding: 12px 18px;
      font-size: 13.5px;
      line-height: 1.5;
      position: relative;
      word-break: break-word;
    }

    /* Left Incoming: Dark Frosted Glass */
    .gc-message-row.incoming .gc-bubble {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #f1f5f9;
      border-radius: 18px 18px 18px 4px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    }

    /* Right Outgoing: Neon Purple Gradient */
    .gc-message-row.outgoing .gc-bubble {
      background: var(--gc-purple-gradient);
      color: #ffffff;
      border-radius: 18px 18px 4px 18px;
      box-shadow: 0 4px 20px rgba(139, 92, 246, 0.35);
      font-weight: 500;
    }

    .gc-msg-time {
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
      font-size: 13px;
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

    /* Floating Bottom Pill Input Bar */
    .gc-floating-input-bar {
      margin: 8px 18px 18px;
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
      color: #fff;
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
      margin-bottom: 4px;
    }
    .gc-inspector-role {
      font-size: 13px;
      color: var(--gc-text-muted);
      margin-bottom: 14px;
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
  `;
  document.head.appendChild(styleEl);

  // 2. INLINE SVG ICONS (Clean Lucide / Feather Style)
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
    settings: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>'
  };

  // 3. BUILD DOM CONTAINER
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
        <!-- COLUMN 1: LEFT SIDEBAR -->
        <aside class="gc-col-sidebar" id="gcColSidebar">
          <div class="gc-sidebar-header">
            <div class="gc-user-profile-badge" onclick="window.GlassChat.openStatusModal()" title="Status & Settings">
              <div class="gc-user-avatar-wrap">
                <div class="gc-user-avatar" id="gcMyAvatar">P</div>
                <div class="gc-status-dot" id="gcMyStatusDot"></div>
              </div>
              <span class="gc-header-title">Chat</span>
            </div>
            <div class="gc-sidebar-actions">
              <button class="gc-action-icon-btn" onclick="window.GlassChat.openCreateChannelModal()" title="New Channel">${ICONS.plus}</button>
              <button class="gc-action-icon-btn" onclick="window.GlassChat.openNewDMModal()" title="New DM">${ICONS.pencil}</button>
            </div>
          </div>

          <div class="gc-search-box">
            <span style="color:#64748b;">${ICONS.search}</span>
            <input type="text" id="gcSearchInput" placeholder="Search" oninput="window.GlassChat.handleSearch(this.value)">
          </div>

          <div class="gc-conversations-scroll" id="gcConversationsScroll">
            <div class="gc-section-title">
              <span>Team</span>
              <button class="gc-action-icon-btn" style="width:22px;height:22px;" onclick="window.GlassChat.openCreateChannelModal()">${ICONS.plus}</button>
            </div>
            <div id="gcTeamList" style="display:flex;flex-direction:column;gap:4px;"></div>

            <div class="gc-section-title" style="margin-top:12px;">
              <span>Personal</span>
              <button class="gc-action-icon-btn" style="width:22px;height:22px;" onclick="window.GlassChat.openNewDMModal()">${ICONS.plus}</button>
            </div>
            <div id="gcPersonalList" style="display:flex;flex-direction:column;gap:4px;"></div>
          </div>
        </aside>

        <!-- COLUMN 2: CENTER ACTIVE CHAT -->
        <main class="gc-col-chat" id="gcColChat">
          <div class="gc-chat-header">
            <div class="gc-chat-header-user">
              <div class="gc-user-avatar-wrap" style="width:42px;height:42px;">
                <div class="gc-user-avatar" id="gcActiveAvatar">S</div>
                <div class="gc-status-dot" id="gcActiveStatusDot"></div>
              </div>
              <div>
                <div class="gc-active-title" id="gcActiveTitle">Smira khan</div>
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

          <div class="gc-floating-input-bar">
            <button class="gc-pill-btn emoji" type="button" onclick="window.GlassChat.toggleEmojiPicker()" title="Emoji">${ICONS.smile}</button>
            <button class="gc-pill-btn" type="button" onclick="document.getElementById('gcFileInput').click()" title="Attach File">${ICONS.paperclip}</button>
            <input type="file" id="gcFileInput" style="display:none;" onchange="window.GlassChat.handleFileUpload(this.files[0])">

            <input type="text" class="gc-pill-input" id="gcMessageInput" placeholder="Type a message..." autocomplete="off">

            <div class="gc-voice-recording-wrap" id="gcVoiceRecWrap" style="display:none;align-items:center;gap:8px;">
              <div style="width:8px;height:8px;border-radius:50%;background:#ef4444;animation:pulse 1s infinite alternate;"></div>
              <span style="font-size:12px;font-weight:700;color:#ef4444;" id="gcVoiceTimer">0:00</span>
              <button class="gc-pill-btn" onclick="window.GlassChat.cancelVoiceRecord()">${ICONS.close}</button>
            </div>

            <button class="gc-pill-btn" id="gcBtnMic" type="button" onclick="window.GlassChat.toggleVoiceRecord()" title="Voice Note">${ICONS.mic}</button>
            <button class="gc-btn-send" type="button" onclick="window.GlassChat.sendMessage()" title="Send">${ICONS.send}</button>
          </div>
        </main>

        <!-- COLUMN 3: RIGHT INSPECTOR -->
        <aside class="gc-col-inspector" id="gcColInspector">
          <div class="gc-inspector-profile">
            <div class="gc-inspector-avatar" id="gcInspAvatar">S</div>
            <div class="gc-inspector-name" id="gcInspName">Smira khan</div>
            <div class="gc-inspector-role" id="gcInspRole">Digital Product Designer</div>
            <div class="gc-inspector-socials">
              <button class="gc-social-btn" title="Google">G</button>
              <button class="gc-social-btn" title="LinkedIn">in</button>
              <button class="gc-social-btn" title="Facebook">f</button>
            </div>
          </div>

          <div class="gc-segmented-tabs">
            <button class="gc-tab-btn active" id="gcTabBtnInfo" onclick="window.GlassChat.switchTab('info')">Info</button>
            <button class="gc-tab-btn" id="gcTabBtnFiles" onclick="window.GlassChat.switchTab('files')">Files</button>
          </div>

          <div id="gcTabInfo">
            <div class="gc-sub-header"><span>About & Details</span></div>
            <div style="font-size:12.5px;color:#94a3b8;line-height:1.5;margin-bottom:16px;" id="gcInspBio">
              Digital Product Designer exploring full-stack interactions, dark glassmorphism interfaces, and real-time design systems.
            </div>

            <div id="gcInspMembersWrap" style="display:none;">
              <div class="gc-sub-header"><span>Members</span> <span id="gcMemberCount" style="font-size:11px;color:#94a3b8;">0</span></div>
              <div id="gcMemberList" style="display:flex;flex-direction:column;gap:6px;"></div>
            </div>
          </div>

          <div id="gcTabFiles" style="display:none;">
            <div class="gc-sub-header">
              <span>Uploaded Files</span>
              <span class="gc-view-all-link" onclick="window.GlassChat.viewAllFiles()">View all</span>
            </div>
            <div class="gc-files-list" id="gcUploadedFilesList"></div>

            <div class="gc-sub-header">
              <span>Attachment's</span>
              <span class="gc-view-all-link" onclick="window.GlassChat.viewAllAttachments()">View all</span>
            </div>
            <div class="gc-attachments-grid" id="gcAttachmentsGrid"></div>
          </div>
        </aside>
      </div>

      <!-- STATUS & SETTINGS MODAL (ZERO ALERTS) -->
      <div id="gcStatusModal" class="gc-modal-backdrop" onclick="if(event.target===this)this.classList.remove('open')">
        <div class="gc-modal-box">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;">
            <span style="font-size:16px;font-weight:800;color:#fff;">Profile Status & Settings</span>
            <button class="gc-close-btn" onclick="document.getElementById('gcStatusModal').classList.remove('open')">${ICONS.close}</button>
          </div>
          <div style="display:flex;gap:10px;margin-bottom:16px;">
            <button class="gc-btn-new-recruitment" style="flex:1;justify-content:center;" onclick="window.GlassChat.setStatus('online')">🟢 Online</button>
            <button class="gc-btn-new-recruitment" style="flex:1;justify-content:center;" onclick="window.GlassChat.setStatus('idle')">🟡 Idle</button>
            <button class="gc-btn-new-recruitment" style="flex:1;justify-content:center;" onclick="window.GlassChat.setStatus('dnd')">🔴 DND</button>
          </div>
          <input type="text" id="gcCustomStatusInput" placeholder="Custom status (e.g. Coding UI, in a meeting)" style="width:100%;box-sizing:border-box;background:#1e1a30;border:1px solid var(--gc-border);border-radius:10px;padding:10px 14px;color:#fff;font-size:14px;outline:none;margin-bottom:14px;">
          <div style="display:flex;justify-content:flex-end;">
            <button class="gc-btn-new-recruitment" style="background:var(--gc-purple-gradient);border:none;color:#fff;" onclick="window.GlassChat.saveCustomStatus()">Save Status</button>
          </div>
        </div>
      </div>

      <!-- CREATE CHANNEL MODAL (ZERO ALERTS) -->
      <div id="gcCreateChannelModal" class="gc-modal-backdrop" onclick="if(event.target===this)this.classList.remove('open')">
        <div class="gc-modal-box">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;">
            <span style="font-size:16px;font-weight:800;color:#fff;">Create Team Channel</span>
            <button class="gc-close-btn" onclick="document.getElementById('gcCreateChannelModal').classList.remove('open')">${ICONS.close}</button>
          </div>
          <input type="text" id="gcNewChannelName" placeholder="channel-name (e.g. design-sprint)" style="width:100%;box-sizing:border-box;background:#1e1a30;border:1px solid var(--gc-border);border-radius:10px;padding:10px 14px;color:#fff;font-size:14px;outline:none;margin-bottom:12px;">
          <input type="text" id="gcNewChannelDesc" placeholder="Channel topic or purpose" style="width:100%;box-sizing:border-box;background:#1e1a30;border:1px solid var(--gc-border);border-radius:10px;padding:10px 14px;color:#fff;font-size:14px;outline:none;margin-bottom:16px;">
          <div style="display:flex;justify-content:flex-end;gap:10px;">
            <button class="gc-btn-new-recruitment" style="background:transparent;border:none;" onclick="document.getElementById('gcCreateChannelModal').classList.remove('open')">Cancel</button>
            <button class="gc-btn-new-recruitment" style="background:var(--gc-purple-gradient);border:none;color:#fff;" onclick="window.GlassChat.submitCreateChannel()">Create Channel</button>
          </div>
        </div>
      </div>

      <!-- NEW DM MODAL (SEARCH REAL USERS) -->
      <div id="gcNewDMModal" class="gc-modal-backdrop" onclick="if(event.target===this)this.classList.remove('open')">
        <div class="gc-modal-box" style="max-height:80vh;display:flex;flex-direction:column;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
            <span style="font-size:16px;font-weight:800;color:#fff;">Start 1-on-1 Personal Chat</span>
            <button class="gc-close-btn" onclick="document.getElementById('gcNewDMModal').classList.remove('open')">${ICONS.close}</button>
          </div>
          <input type="text" id="gcUserSearchInput" placeholder="Search registered students by name or email..." style="width:100%;box-sizing:border-box;background:#1e1a30;border:1px solid var(--gc-border);border-radius:10px;padding:10px 14px;color:#fff;font-size:14px;outline:none;margin-bottom:14px;" oninput="window.GlassChat.searchRegisteredUsers(this.value)">
          <div id="gcUserSearchResults" style="flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:8px;"></div>
        </div>
      </div>

      <!-- PINNED MESSAGES MODAL (ZERO ALERTS) -->
      <div id="gcPinnedModal" class="gc-modal-backdrop" onclick="if(event.target===this)this.classList.remove('open')">
        <div class="gc-modal-box">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
            <span style="font-size:16px;font-weight:800;color:#fff;">📌 Pinned Messages</span>
            <button class="gc-close-btn" onclick="document.getElementById('gcPinnedModal').classList.remove('open')">${ICONS.close}</button>
          </div>
          <div id="gcPinnedList" style="display:flex;flex-direction:column;gap:10px;max-height:60vh;overflow-y:auto;"></div>
        </div>
      </div>

      <!-- EMOJI PICKER POPOVER -->
      <div id="gcEmojiPicker" style="display:none;position:absolute;bottom:70px;left:30px;background:#151222;border:1px solid var(--gc-border);border-radius:14px;padding:12px;box-shadow:0 10px 30px rgba(0,0,0,0.6);z-index:200;">
        <div style="display:grid;grid-template-columns:repeat(6, 1fr);gap:8px;font-size:22px;cursor:pointer;">
          <span onclick="window.GlassChat.appendEmoji('😊')">😊</span>
          <span onclick="window.GlassChat.appendEmoji('❤️')">❤️</span>
          <span onclick="window.GlassChat.appendEmoji('🔥')">🔥</span>
          <span onclick="window.GlassChat.appendEmoji('👍')">👍</span>
          <span onclick="window.GlassChat.appendEmoji('🚀')">🚀</span>
          <span onclick="window.GlassChat.appendEmoji('🎉')">🎉</span>
          <span onclick="window.GlassChat.appendEmoji('💻')">💻</span>
          <span onclick="window.GlassChat.appendEmoji('✨')">✨</span>
          <span onclick="window.GlassChat.appendEmoji('⚡')">⚡</span>
          <span onclick="window.GlassChat.appendEmoji('😂')">😂</span>
          <span onclick="window.GlassChat.appendEmoji('🙌')">🙌</span>
          <span onclick="window.GlassChat.appendEmoji('💯')">💯</span>
        </div>
      </div>

      <!-- LIGHTBOX VIEWER -->
      <div id="gcLightboxModal" class="gc-modal-backdrop" onclick="if(event.target===this)this.classList.remove('open')">
        <img id="gcLightboxImg" src="" style="max-width:85vw;max-height:85vh;border-radius:12px;box-shadow:0 10px 40px rgba(0,0,0,0.8);border:1px solid rgba(255,255,255,0.2);" alt="Attachment Preview">
      </div>

      <!-- WEBRTC HUDDLE ROOM -->
      <div id="gcHuddleModal" class="gc-modal-backdrop">
        <div style="background:#100d1c;width:95%;height:90vh;border-radius:22px;border:1px solid var(--gc-border);display:flex;flex-direction:column;overflow:hidden;box-shadow:0 25px 80px rgba(0,0,0,0.8);">
          <div style="padding:16px 24px;border-bottom:1px solid var(--gc-border);display:flex;align-items:center;justify-content:space-between;">
            <div style="font-size:16px;font-weight:800;color:#fff;">📹 Glassmorphism Video & Audio Huddle</div>
            <button class="gc-close-btn" onclick="window.GlassChat.leaveHuddle()">${ICONS.close}</button>
          </div>
          <div style="flex:1;display:grid;grid-template-columns:repeat(auto-fit, minmax(300px, 1fr));gap:16px;padding:24px;overflow-y:auto;" id="gcHuddleGrid">
            <div style="background:#1b162b;border-radius:16px;border:1px solid var(--gc-border);position:relative;display:flex;align-items:center;justify-content:center;overflow:hidden;min-height:220px;" id="gcHuddleLocalTile">
              <video id="gcHuddleLocalVideo" autoplay playsinline muted style="width:100%;height:100%;object-fit:cover;"></video>
              <div id="gcHuddleLocalAvatar" style="font-size:32px;font-weight:800;color:#fff;background:var(--gc-purple-gradient);width:80px;height:80px;border-radius:50%;display:flex;align-items:center;justify-content:center;">P</div>
              <span style="position:absolute;bottom:12px;left:12px;background:rgba(0,0,0,0.6);padding:3px 8px;border-radius:6px;font-size:11px;">You</span>
            </div>
          </div>
          <div style="height:76px;background:#151222;border-top:1px solid var(--gc-border);display:flex;align-items:center;justify-content:center;gap:14px;">
            <button class="gc-action-icon-btn" style="width:44px;height:44px;border-radius:50%;" id="gcHuddleBtnCam" onclick="window.GlassChat.toggleHuddleCam()">${ICONS.video}</button>
            <button class="gc-action-icon-btn" style="width:44px;height:44px;border-radius:50%;" id="gcHuddleBtnMic" onclick="window.GlassChat.toggleHuddleMic()">${ICONS.mic}</button>
            <button class="gc-action-icon-btn" style="width:44px;height:44px;border-radius:50%;background:#ef4444;border-color:#ef4444;" onclick="window.GlassChat.leaveHuddle()">${ICONS.phone}</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(container);

    const input = document.getElementById('gcMessageInput');
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        window.GlassChat.sendMessage();
      }
    });

    return container;
  }

  // 4. EMBEDDED DEMO DATA (Instant Guaranteed View)
  const FALLBACK_CONVERSATIONS = [
    {
      id: 4,
      name: "Smira khan",
      type: "personal",
      avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      recipient: { bio: "Digital Product Designer", email: "smira@skillmate.io" },
      last_message: { content: "I am on the Google meet now. I sent it to your email. use glass morphism for this app! ❤️", created_at: new Date().toISOString() },
      unread_count: 0
    },
    {
      id: 5,
      name: "Develd kevrie",
      type: "personal",
      avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
      recipient: { bio: "Backend Architect & Distributed Systems", email: "develd@skillmate.io" },
      last_message: { content: "Lorem ipsum it simple...", created_at: new Date().toISOString() },
      unread_count: 0
    },
    {
      id: 6,
      name: "kevin kelin",
      type: "personal",
      avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
      recipient: { bio: "Frontend Specialist & React Dev", email: "kevin@skillmate.io" },
      last_message: { content: "Lorem ipsum it simple...", created_at: new Date().toISOString() },
      unread_count: 0
    },
    {
      id: 7,
      name: "Anita ponit",
      type: "personal",
      avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
      recipient: { bio: "Design Systems & UI/UX Lead", email: "anita@skillmate.io" },
      last_message: { content: "What's up bro?", created_at: new Date().toISOString() },
      unread_count: 0
    },
    {
      id: 8,
      name: "John Doe",
      type: "personal",
      avatar_url: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80",
      recipient: { bio: "Full-Stack Student exploring AI", email: "john@skillmate.io" },
      last_message: { content: "Lorem ipsum it simple...", created_at: new Date().toISOString() },
      unread_count: 0
    },
    {
      id: 1,
      name: "general-chat",
      type: "team",
      description: "General student community & collaboration",
      last_message: { content: "Welcome to #general-chat! Collaborate freely.", created_at: new Date().toISOString() },
      unread_count: 0
    },
    {
      id: 2,
      name: "product-design",
      type: "team",
      description: "Discussing glassmorphism prototypes & design systems",
      last_message: { content: "Check out the new dark glass layout!", created_at: new Date().toISOString() },
      unread_count: 0
    }
  ];

  const FALLBACK_SMIRA_MESSAGES = [
    { id: 1, sender_id: 2, sender_name: "Smira khan", content: "How do you like new Messaenger design 😊", type: "text", created_at: "10:30 AM" },
    { id: 2, sender_id: 2, sender_name: "Smira khan", content: "I am on the Google meet now. I sent it to your email. use glass morphism for this app!", type: "text", created_at: "10:32 AM" },
    { id: 3, sender_id: 1, sender_name: "You", content: "Think about your ideas! 😊", type: "text", created_at: "10:35 AM" },
    { id: 4, sender_id: 2, sender_name: "Smira khan", content: "How do you like new Messaenger design 😊", type: "text", created_at: "10:36 AM" },
    { id: 5, sender_id: 2, sender_name: "Smira khan", content: "I am on the Google meet now. I sent it to your email. use glass morphism for this app! ❤️", type: "text", created_at: "10:38 AM", reactions: [{ emoji: "❤️" }] },
    { id: 6, sender_id: 1, sender_name: "You", content: "I am on the Google meet now. I sent it to your email. use glass morphism for this app! ❤️", type: "text", created_at: "10:40 AM" }
  ];

  const FALLBACK_FILES = [
    { file_name: "Case study Outline file", file_type: "folder", file_size: 1420000, file_url: "#" },
    { file_name: "Design portfolio review.pdf", file_type: "pdf", file_size: 2840000, file_url: "#" },
    { file_name: "Photo's file.zip", file_type: "zip", file_size: 8520000, file_url: "#" }
  ];

  const FALLBACK_ATTACHMENTS = [
    { file_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80" },
    { file_url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&auto=format&fit=crop&q=80" },
    { file_url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=500&auto=format&fit=crop&q=80" }
  ];

  // 5. CLIENT LOGIC
  let currentUser = { id: 1, name: "Punit", role: "Student Lead" };
  let conversations = [];
  let activeConvId = 4; // Smira Khan by default
  let activeConv = null;
  let currentMessages = [];
  let socket = null;
  let onlineStatus = "online";
  let huddleStream = null;

  async function api(path, opts = {}) {
    const res = await fetch(path, {
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest', ...(opts.headers || {}) },
      ...opts
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  function escapeText(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  window.GlassChat = {
    async init() {
      ensureDOM();
      this.initSocket();
    },

    initSocket() {
      if (socket) return;
      if (typeof window.io === 'function') {
        socket = window.io();
        socket.on('chat:message:new', msg => {
          if (Number(msg.conversation_id) === Number(activeConvId)) {
            currentMessages.push(msg);
            this.appendMessage(msg);
          }
          this.loadConversations(false);
        });
        socket.on('chat:reaction:updated', data => {
          const row = document.getElementById(`gc-msg-${data.messageId}`);
          if (row && data.emoji) {
            let rWrap = row.querySelector('.gc-reactions-wrap');
            if (!rWrap) {
              rWrap = document.createElement('div');
              rWrap.className = 'gc-reactions-wrap';
              rWrap.style.cssText = 'display:flex;gap:4px;margin-top:4px;';
              row.querySelector('.gc-bubble-wrap').appendChild(rWrap);
            }
            rWrap.innerHTML = `<span style="background:rgba(168,85,247,0.25);border:1px solid rgba(168,85,247,0.4);border-radius:10px;padding:2px 7px;font-size:11px;">${data.emoji} 1</span>`;
          }
        });
      }
    },

    async open(targetId = null) {
      ensureDOM();
      const modal = document.getElementById('glassChatContainer');
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';

      await this.loadConversations(true, targetId);
    },

    close() {
      document.getElementById('glassChatContainer')?.classList.remove('open');
      document.body.style.overflow = '';
      this.leaveHuddle();
    },

    async loadConversations(autoSelect = true, preferredId = null) {
      try {
        const res = await api('/api/chat/conversations');
        conversations = res.conversations && res.conversations.length > 0 ? res.conversations : FALLBACK_CONVERSATIONS;
      } catch (_) {
        conversations = FALLBACK_CONVERSATIONS;
      }

      this.renderSidebar();

      if (autoSelect) {
        let selectId = preferredId;
        if (!selectId) {
          const smira = conversations.find(c => c.name.toLowerCase().includes('smira'));
          selectId = smira ? smira.id : conversations[0].id;
        }
        await this.selectConversation(selectId);
      }
    },

    renderSidebar() {
      const teamList = document.getElementById('gcTeamList');
      const personalList = document.getElementById('gcPersonalList');
      if (!teamList || !personalList) return;

      teamList.innerHTML = '';
      personalList.innerHTML = '';

      const q = (document.getElementById('gcSearchInput')?.value || '').toLowerCase().trim();

      conversations.forEach(c => {
        if (q && !c.name.toLowerCase().includes(q)) return;

        const isAct = Number(c.id) === Number(activeConvId);
        const item = document.createElement('div');
        item.className = `gc-conv-item ${isAct ? 'active' : ''}`;
        item.onclick = () => this.selectConversation(c.id);

        let avatarHtml = '';
        if (c.type === 'team') {
          avatarHtml = `
            <div class="gc-conv-avatar-wrap">
              <div class="gc-conv-avatar channel-hash">#</div>
            </div>
          `;
        } else {
          avatarHtml = `
            <div class="gc-conv-avatar-wrap">
              ${c.avatar_url ? `<img src="${c.avatar_url}" class="gc-conv-avatar" alt="">` : `<div class="gc-conv-avatar">${(c.name||'✦')[0].toUpperCase()}</div>`}
              <div class="gc-status-dot online"></div>
            </div>
          `;
        }

        const snippet = c.last_message?.content || (c.type === 'team' ? 'Tap to view discussion' : "What's up bro?");

        item.innerHTML = `
          ${avatarHtml}
          <div class="gc-conv-meta">
            <div class="gc-conv-top">
              <span class="gc-conv-name">${escapeText(c.name)}</span>
              <span class="gc-conv-time">10:40 AM</span>
            </div>
            <div class="gc-conv-snippet">${escapeText(snippet)}</div>
          </div>
        `;

        if (c.type === 'team') teamList.appendChild(item);
        else personalList.appendChild(item);
      });
    },

    async selectConversation(id) {
      activeConvId = Number(id);
      this.renderSidebar();

      activeConv = conversations.find(c => Number(c.id) === activeConvId) || conversations[0];

      if (socket) socket.emit('chat:join', activeConvId);

      // Update Center Header
      document.getElementById('gcActiveTitle').textContent = activeConv.name;
      const avatarEl = document.getElementById('gcActiveAvatar');
      if (activeConv.type === 'team') {
        avatarEl.textContent = '#';
        avatarEl.className = 'gc-user-avatar channel-hash';
      } else {
        avatarEl.textContent = (activeConv.name || '✦')[0].toUpperCase();
        avatarEl.className = 'gc-user-avatar';
      }

      document.getElementById('gcActiveStatusText').textContent = activeConv.type === 'team' ? 'Team Channel' : 'Active Now';

      // Update Right Inspector
      this.updateInspector(activeConv);

      // Load Messages
      try {
        const res = await api(`/api/chat/conversations/${activeConvId}/messages`);
        currentMessages = res.messages && res.messages.length > 0 ? res.messages : (activeConv.name.includes('Smira') ? FALLBACK_SMIRA_MESSAGES : []);
      } catch (_) {
        currentMessages = activeConv.name.includes('Smira') ? FALLBACK_SMIRA_MESSAGES : [];
      }

      this.renderMessages();
      this.loadFiles(activeConvId);
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
          <div class="gc-empty-title">Start the conversation in ${escapeText(displayName)}</div>
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

      const isMe = (msg.sender_id === 1) || (msg.sender_name === 'You');
      const row = document.createElement('div');
      row.className = `gc-message-row ${isMe ? 'outgoing' : 'incoming'}`;
      row.id = `gc-msg-${msg.id}`;

      let contentHtml = escapeText(msg.content);

      if (msg.type === 'code' || msg.content.includes('```')) {
        const clean = msg.content.replace(/```[a-z]*\n?/g, '').replace(/```/g, '');
        contentHtml = `
          <div class="gc-code-block">
            <div class="gc-code-header">
              <span>JAVASCRIPT</span>
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

      let reactionsHtml = '';
      if (Array.isArray(msg.reactions) && msg.reactions.length > 0) {
        reactionsHtml = `<div class="gc-reactions-wrap" style="display:flex;gap:4px;margin-top:4px;">`;
        msg.reactions.forEach(r => {
          reactionsHtml += `<span style="background:rgba(168,85,247,0.25);border:1px solid rgba(168,85,247,0.4);border-radius:10px;padding:2px 7px;font-size:11px;">${r.emoji}</span>`;
        });
        reactionsHtml += `</div>`;
      }

      row.innerHTML = `
        <div class="gc-msg-avatar">${isMe ? 'P' : (msg.sender_name || 'S')[0].toUpperCase()}</div>
        <div class="gc-bubble-wrap">
          <div class="gc-bubble">${contentHtml}</div>
          <span class="gc-msg-time">${msg.created_at || 'Just now'}</span>
          ${reactionsHtml}
        </div>
        <div class="gc-msg-actions">
          <button class="gc-act-btn" onclick="window.GlassChat.react(${msg.id}, '❤️')">❤️</button>
          <button class="gc-act-btn" onclick="window.GlassChat.react(${msg.id}, '😊')">😊</button>
          <button class="gc-act-btn" onclick="window.GlassChat.pin(${msg.id})">📌</button>
        </div>
      `;

      container.appendChild(row);
      container.scrollTop = container.scrollHeight;
    },

    async sendMessage() {
      const input = document.getElementById('gcMessageInput');
      const text = (input?.value || '').trim();
      if (!text) return;
      input.value = '';

      let type = 'text';
      if (text.startsWith('/code ') || text.includes('```')) type = 'code';

      try {
        await api(`/api/chat/conversations/${activeConvId}/messages`, {
          method: 'POST',
          body: JSON.stringify({ content: text, type })
        });
      } catch (_) {
        const localMsg = {
          id: Date.now(),
          sender_id: 1,
          sender_name: "You",
          content: text,
          type,
          created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        currentMessages.push(localMsg);
        this.appendMessage(localMsg);
      }
    },

    async react(msgId, emoji) {
      try {
        await api(`/api/chat/messages/${msgId}/react`, { method: 'POST', body: JSON.stringify({ emoji }) });
      } catch (_) {}
    },

    async pin(msgId) {
      try {
        await api(`/api/chat/messages/${msgId}/pin`, { method: 'POST' });
      } catch (_) {}
    },

    updateInspector(conv) {
      document.getElementById('gcInspName').textContent = conv.name;
      document.getElementById('gcInspAvatar').textContent = (conv.name || '✦')[0].toUpperCase();
      const roleEl = document.getElementById('gcInspRole');
      const bioEl = document.getElementById('gcInspBio');
      const mWrap = document.getElementById('gcInspMembersWrap');

      if (conv.type === 'personal') {
        roleEl.textContent = conv.recipient?.bio || "Digital Product Designer";
        bioEl.textContent = `${conv.recipient?.bio || "Digital Product Designer"} • Connected on SkillMate for UI/UX collaboration.`;
        mWrap.style.display = 'none';
      } else {
        roleEl.textContent = "Team Community Channel";
        bioEl.textContent = conv.description || "Dedicated channel for team discussions and peer reviews.";
        mWrap.style.display = 'block';
        document.getElementById('gcMemberCount').textContent = "5";
        const mList = document.getElementById('gcMemberList');
        mList.innerHTML = `
          <div style="font-size:12px;color:#cbd5e1;display:flex;align-items:center;gap:8px;">🟢 Punit (Owner)</div>
          <div style="font-size:12px;color:#cbd5e1;display:flex;align-items:center;gap:8px;">🟢 Smira khan (Admin)</div>
          <div style="font-size:12px;color:#cbd5e1;display:flex;align-items:center;gap:8px;">🟢 Sahil (Member)</div>
        `;
      }
    },

    switchTab(tab) {
      document.getElementById('gcTabBtnInfo').classList.toggle('active', tab === 'info');
      document.getElementById('gcTabBtnFiles').classList.toggle('active', tab === 'files');
      document.getElementById('gcTabInfo').style.display = tab === 'info' ? 'block' : 'none';
      document.getElementById('gcTabFiles').style.display = tab === 'files' ? 'block' : 'none';
    },

    toggleInspector() {
      document.getElementById('gcColInspector')?.classList.toggle('collapsed');
    },

    async loadFiles(convId) {
      let files = FALLBACK_FILES;
      let media = FALLBACK_ATTACHMENTS;
      try {
        const res = await api(`/api/chat/conversations/${convId}/files`);
        if (res.uploadedFiles && res.uploadedFiles.length > 0) files = res.uploadedFiles;
        if (res.mediaGrid && res.mediaGrid.length > 0) media = res.mediaGrid;
      } catch (_) {}

      const filesList = document.getElementById('gcUploadedFilesList');
      const grid = document.getElementById('gcAttachmentsGrid');
      if (!filesList || !grid) return;

      filesList.innerHTML = '';
      files.forEach(f => {
        const item = document.createElement('div');
        item.className = 'gc-file-item';
        let icon = '📁';
        if (f.file_name.endsWith('.pdf')) icon = '📄';
        if (f.file_name.endsWith('.zip')) icon = '📦';
        item.innerHTML = `
          <span>${icon}</span>
          <div class="gc-file-info">
            <div class="gc-file-name">${escapeText(f.file_name)}</div>
            <div class="gc-file-size">${Math.round((f.file_size || 1024)/1024)} KB</div>
          </div>
          <a href="${f.file_url}" download style="color:#a855f7;font-size:13px;text-decoration:none;">⬇</a>
        `;
        filesList.appendChild(item);
      });

      grid.innerHTML = '';
      media.forEach(m => {
        const thumb = document.createElement('div');
        thumb.className = 'gc-grid-thumb';
        thumb.onclick = () => this.openLightbox(m.file_url);
        thumb.innerHTML = `<img src="${m.file_url}" alt="">`;
        grid.appendChild(thumb);
      });
    },

    openLightbox(src) {
      document.getElementById('gcLightboxImg').src = src;
      document.getElementById('gcLightboxModal').classList.add('open');
    },

    // REAL MODALS (ZERO ALERTS)
    openStatusModal() {
      document.getElementById('gcStatusModal').classList.add('open');
    },

    setStatus(s) {
      onlineStatus = s;
      const dot = document.getElementById('gcMyStatusDot');
      if (dot) dot.className = `gc-status-dot ${s}`;
      if (socket) socket.emit('chat:status:change', { status: s });
      document.getElementById('gcStatusModal').classList.remove('open');
    },

    saveCustomStatus() {
      const val = document.getElementById('gcCustomStatusInput')?.value?.trim();
      if (socket) socket.emit('chat:status:change', { customStatus: val });
      document.getElementById('gcStatusModal').classList.remove('open');
    },

    openCreateChannelModal() {
      document.getElementById('gcCreateChannelModal').classList.add('open');
    },

    async submitCreateChannel() {
      const name = document.getElementById('gcNewChannelName')?.value?.trim();
      const desc = document.getElementById('gcNewChannelDesc')?.value?.trim();
      if (!name) return;

      try {
        const res = await api('/api/chat/conversations', {
          method: 'POST',
          body: JSON.stringify({ type: 'team', name, description: desc })
        });
        document.getElementById('gcCreateChannelModal').classList.remove('open');
        await this.loadConversations(true, res.conversation.id);
      } catch (_) {
        document.getElementById('gcCreateChannelModal').classList.remove('open');
      }
    },

    openNewDMModal() {
      document.getElementById('gcNewDMModal').classList.add('open');
      this.searchRegisteredUsers('');
    },

    async searchRegisteredUsers(q) {
      const list = document.getElementById('gcUserSearchResults');
      if (!list) return;
      list.innerHTML = '';

      let users = [];
      try {
        const res = await api(`/api/chat/users/search?q=${encodeURIComponent(q)}`);
        users = res.users || [];
      } catch (_) {}

      if (users.length === 0) {
        users = [
          { id: 2, name: "Smira khan", email: "smira@skillmate.io" },
          { id: 3, name: "Develd kevrie", email: "develd@skillmate.io" },
          { id: 4, name: "kevin kelin", email: "kevin@skillmate.io" },
          { id: 5, name: "Anita ponit", email: "anita@skillmate.io" },
          { id: 6, name: "John Doe", email: "john@skillmate.io" }
        ].filter(u => !q || u.name.toLowerCase().includes(q.toLowerCase()));
      }

      users.forEach(u => {
        const item = document.createElement('div');
        item.style.cssText = 'display:flex;align-items:center;gap:12px;padding:10px 14px;background:#1e1a30;border-radius:12px;cursor:pointer;';
        item.onmouseover = () => item.style.background = '#282342';
        item.onmouseout = () => item.style.background = '#1e1a30';
        item.onclick = () => this.startDM(u.id);

        item.innerHTML = `
          <div style="width:36px;height:36px;border-radius:50%;background:var(--gc-purple-gradient);display:flex;align-items:center;justify-content:center;font-weight:700;color:#fff;">
            ${(u.name||'✦')[0].toUpperCase()}
          </div>
          <div>
            <div style="font-weight:700;color:#fff;font-size:13px;">${escapeText(u.name)}</div>
            <div style="font-size:11px;color:#94a3b8;">${escapeText(u.email)}</div>
          </div>
        `;
        list.appendChild(item);
      });
    },

    async startDM(userId) {
      document.getElementById('gcNewDMModal').classList.remove('open');
      try {
        const res = await api('/api/chat/conversations', {
          method: 'POST',
          body: JSON.stringify({ type: 'personal', recipientId: userId })
        });
        await this.loadConversations(true, res.conversation.id);
      } catch (_) {
        const match = conversations.find(c => c.recipient?.id === userId);
        if (match) this.selectConversation(match.id);
      }
    },

    togglePinnedModal() {
      const modal = document.getElementById('gcPinnedModal');
      const list = document.getElementById('gcPinnedList');
      list.innerHTML = '';
      const pinned = currentMessages.filter(m => m.is_pinned);
      if (pinned.length === 0) {
        list.innerHTML = '<div style="font-size:12px;color:#94a3b8;text-align:center;padding:16px;">No pinned messages in this chat.</div>';
      } else {
        pinned.forEach(p => {
          const card = document.createElement('div');
          card.style.cssText = 'background:#1e1a30;padding:10px;border-radius:8px;border-left:3px solid #eab308;font-size:13px;';
          card.textContent = p.content;
          list.appendChild(card);
        });
      }
      modal.classList.add('open');
    },

    toggleEmojiPicker() {
      const p = document.getElementById('gcEmojiPicker');
      p.style.display = p.style.display === 'none' ? 'block' : 'none';
    },

    appendEmoji(emoji) {
      const inp = document.getElementById('gcMessageInput');
      inp.value += emoji;
      inp.focus();
      document.getElementById('gcEmojiPicker').style.display = 'none';
    },

    handleSearch(val) {
      this.renderSidebar();
    },

    // File Upload
    async handleFileUpload(file) {
      if (!file) return;
      const formData = new FormData();
      formData.append('file', file);
      try {
        const uploadRes = await fetch('/api/chat/upload', { method: 'POST', body: formData }).then(r => r.json());
        await api(`/api/chat/conversations/${activeConvId}/messages`, {
          method: 'POST',
          body: JSON.stringify({
            content: `Shared file: ${uploadRes.fileName}`,
            type: 'file',
            metadata: uploadRes
          })
        });
        this.loadFiles(activeConvId);
      } catch (_) {}
    },

    // WebRTC Audio/Video Huddle
    async startHuddle(video = true) {
      const modal = document.getElementById('gcHuddleModal');
      modal.classList.add('open');
      try {
        huddleStream = await navigator.mediaDevices.getUserMedia({ video, audio: true });
        const videoEl = document.getElementById('gcHuddleLocalVideo');
        if (video) {
          videoEl.srcObject = huddleStream;
          videoEl.style.display = 'block';
          document.getElementById('gcHuddleLocalAvatar').style.display = 'none';
        } else {
          videoEl.style.display = 'none';
          document.getElementById('gcHuddleLocalAvatar').style.display = 'flex';
        }
      } catch (_) {
        document.getElementById('gcHuddleLocalVideo').style.display = 'none';
        document.getElementById('gcHuddleLocalAvatar').style.display = 'flex';
      }
    },

    toggleHuddleCam() {
      if (!huddleStream) return;
      const t = huddleStream.getVideoTracks()[0];
      if (t) {
        t.enabled = !t.enabled;
        document.getElementById('gcHuddleLocalVideo').style.display = t.enabled ? 'block' : 'none';
        document.getElementById('gcHuddleLocalAvatar').style.display = t.enabled ? 'none' : 'flex';
      }
    },

    toggleHuddleMic() {
      if (!huddleStream) return;
      const t = huddleStream.getAudioTracks()[0];
      if (t) t.enabled = !t.enabled;
    },

    leaveHuddle() {
      if (huddleStream) {
        huddleStream.getTracks().forEach(t => t.stop());
        huddleStream = null;
      }
      document.getElementById('gcHuddleModal')?.classList.remove('open');
    },

    viewAllFiles() { this.switchTab('files'); },
    viewAllAttachments() { this.switchTab('files'); }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.GlassChat.init());
  } else {
    window.GlassChat.init();
  }

  window.openChat = function(personId) {
    window.GlassChat.open(personId);
  };
})();
