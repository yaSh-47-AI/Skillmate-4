(() => {
  'use strict';

  // 1. INJECT DARK GLASSMORPHISM STYLES (Strictly inspired by Reference Design)
  const styleEl = document.createElement('style');
  styleEl.id = 'glass-chat-styles';
  styleEl.textContent = `
    :root {
      --gc-bg-base: #0a0910;
      --gc-bg-glass: rgba(18, 15, 28, 0.78);
      --gc-bg-card: rgba(255, 255, 255, 0.04);
      --gc-bg-card-hover: rgba(255, 255, 255, 0.08);
      --gc-bg-input: rgba(24, 20, 36, 0.85);
      --gc-border: rgba(255, 255, 255, 0.08);
      --gc-border-focus: rgba(168, 85, 247, 0.5);
      --gc-purple-primary: #a855f7;
      --gc-purple-hover: #9333ea;
      --gc-purple-gradient: linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%);
      --gc-purple-glow: 0 0 25px rgba(168, 85, 247, 0.35);
      --gc-text-main: #f8fafc;
      --gc-text-muted: #94a3b8;
      --gc-online: #22c55e;
      --gc-idle: #eab308;
      --gc-dnd: #ef4444;
      --gc-font: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    /* Modal / Dedicated View Container */
    #glassChatContainer {
      position: fixed;
      inset: 0;
      z-index: 99999;
      background: var(--gc-bg-base);
      background-image: 
        radial-gradient(circle at 15% 20%, rgba(139, 92, 246, 0.22) 0%, transparent 45%),
        radial-gradient(circle at 85% 75%, rgba(217, 70, 239, 0.18) 0%, transparent 45%),
        radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.08) 0%, transparent 60%);
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

    /* Top Navigation Bar inside Messenger (Website header intact) */
    .gc-topbar {
      height: 54px;
      background: rgba(14, 12, 22, 0.65);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
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
      letter-spacing: -0.02em;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 8px;
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
      text-decoration: none;
    }
    .gc-nav-link:hover, .gc-nav-link.active {
      color: #fff;
      background: rgba(255, 255, 255, 0.06);
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
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--gc-border);
      color: var(--gc-text-muted);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 14px;
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
      margin: 12px 16px 16px;
      gap: 12px;
      border-radius: 20px;
      background: var(--gc-bg-glass);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid var(--gc-border);
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6), 0 0 80px rgba(139, 92, 246, 0.12);
    }

    /* COLUMN 1: LEFT SIDEBAR (Conversations & Channels) */
    .gc-col-sidebar {
      width: 310px;
      background: rgba(14, 11, 24, 0.6);
      border-right: 1px solid var(--gc-border);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      overflow: hidden;
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
      width: 30px;
      height: 30px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--gc-border);
      color: var(--gc-text-muted);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.15s ease;
    }
    .gc-action-icon-btn:hover {
      background: rgba(168, 85, 247, 0.2);
      color: #fff;
      border-color: rgba(168, 85, 247, 0.4);
    }

    /* Glassmorphic Search Bar */
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
    .gc-search-box input::placeholder {
      color: #64748b;
    }

    /* Collapsible Sections & Conversations List */
    .gc-conversations-scroll {
      flex: 1;
      overflow-y: auto;
      padding: 0 10px 16px;
      display: flex;
      flex-direction: column;
      gap: 6px;
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
    }
    .gc-conv-item:hover {
      background: var(--gc-bg-card-hover);
      border-color: rgba(255, 255, 255, 0.05);
    }
    .gc-conv-item.active {
      background: rgba(139, 92, 246, 0.16);
      border-color: rgba(168, 85, 247, 0.35);
      box-shadow: inset 0 0 16px rgba(168, 85, 247, 0.12);
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
      flex-shrink: 0;
    }
    .gc-conv-avatar {
      width: 100%;
      height: 100%;
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
    }
    .gc-conv-avatar.channel-hash {
      border-radius: 12px;
      background: rgba(168, 85, 247, 0.12);
      color: var(--gc-purple-primary);
      font-size: 18px;
      font-weight: 900;
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
    }
    .gc-conv-name {
      font-size: 13.5px;
      font-weight: 700;
      color: #f1f5f9;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .gc-conv-time {
      font-size: 11px;
      color: #64748b;
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

    /* COLUMN 2: CENTER ACTIVE CHAT STREAM */
    .gc-col-chat {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: rgba(10, 8, 16, 0.5);
      position: relative;
    }

    /* Active Chat Header */
    .gc-chat-header {
      height: 64px;
      padding: 0 20px;
      border-bottom: 1px solid var(--gc-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: rgba(18, 14, 28, 0.4);
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
      font-size: 16px;
      transition: all 0.2s ease;
    }
    .gc-neon-action-btn:hover {
      background: var(--gc-purple-gradient);
      color: #fff;
      box-shadow: var(--gc-purple-glow);
      transform: translateY(-1px);
    }

    /* Message Stream Scroll */
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

    /* Message Row: Left (Incoming) vs Right (Outgoing) */
    .gc-message-row {
      display: flex;
      gap: 10px;
      max-width: 75%;
      position: relative;
    }
    .gc-message-row.incoming {
      align-self: flex-start;
    }
    .gc-message-row.outgoing {
      align-self: flex-end;
      flex-direction: row-reverse;
    }

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
    .gc-message-row.outgoing .gc-bubble-wrap {
      align-items: flex-end;
    }

    /* Message Bubbles */
    .gc-bubble {
      padding: 12px 18px;
      font-size: 13.5px;
      line-height: 1.5;
      position: relative;
      word-break: break-word;
      transition: all 0.15s ease;
    }

    /* Left Incoming: Dark Frosted Glass */
    .gc-message-row.incoming .gc-bubble {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #f1f5f9;
      border-radius: 18px 18px 18px 4px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    }

    /* Right Outgoing: Vibrant Purple-to-Violet Gradient */
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
      transition: all 0.15s ease;
    }
    .gc-act-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
    }

    /* Reactions Bar */
    .gc-reactions-row {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-top: 4px;
    }
    .gc-reaction-tag {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 10px;
      padding: 2px 7px;
      font-size: 11px;
      font-weight: 700;
      color: #f1f5f9;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .gc-reaction-tag:hover {
      background: rgba(168, 85, 247, 0.2);
      border-color: rgba(168, 85, 247, 0.4);
    }
    .gc-reaction-tag.me {
      background: rgba(168, 85, 247, 0.25);
      border-color: var(--gc-purple-primary);
    }

    /* Syntax-Highlighted Code Blocks with 1-Click Copy */
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
      color: var(--gc-text-muted);
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 16px;
      transition: all 0.15s ease;
    }
    .gc-pill-btn:hover {
      color: #fff;
      background: rgba(255, 255, 255, 0.08);
    }
    .gc-pill-btn.emoji {
      color: #c084fc;
    }
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
      font-size: 16px;
      transition: all 0.2s ease;
      box-shadow: 0 4px 14px rgba(168, 85, 247, 0.4);
    }
    .gc-btn-send:hover {
      transform: scale(1.05);
      box-shadow: var(--gc-purple-glow);
    }

    /* Live Voice Recording Pill Mode */
    .gc-voice-recording-wrap {
      display: none;
      flex: 1;
      align-items: center;
      gap: 12px;
    }
    .gc-rec-pulse-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #ef4444;
      animation: gcPulse 1s infinite alternate;
    }
    @keyframes gcPulse { 0% { opacity: 0.3; transform: scale(0.9); } 100% { opacity: 1; transform: scale(1.15); } }

    /* COLUMN 3: RIGHT SIDEBAR (Profile & Media Inspector) */
    .gc-col-inspector {
      width: 300px;
      background: rgba(14, 11, 24, 0.6);
      border-left: 1px solid var(--gc-border);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      overflow-y: auto;
      padding: 24px 18px;
      transition: transform 0.25s ease;
    }
    .gc-col-inspector.collapsed {
      display: none;
    }
    .gc-inspector-profile {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      margin-bottom: 20px;
    }
    .gc-inspector-avatar {
      width: 82px;
      height: 82px;
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
    .gc-inspector-socials {
      display: flex;
      gap: 10px;
    }
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
      transition: all 0.15s ease;
    }
    .gc-social-btn:hover {
      background: rgba(168, 85, 247, 0.2);
      color: #fff;
      border-color: rgba(168, 85, 247, 0.4);
    }

    /* Segmented Toggle Tabs [Info] vs [Files] */
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
      background: rgba(255, 255, 255, 0.08);
      color: #fff;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }

    /* Uploaded Files Section */
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
      text-decoration: none;
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
      transition: background 0.15s ease;
    }
    .gc-file-item:hover {
      background: rgba(255, 255, 255, 0.06);
    }
    .gc-file-icon { font-size: 16px; }
    .gc-file-info {
      flex: 1;
      min-width: 0;
    }
    .gc-file-name {
      font-size: 12px;
      font-weight: 600;
      color: #f1f5f9;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .gc-file-size { font-size: 10px; color: #64748b; }

    /* Attachments 3-Column Thumbnail Grid */
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
      position: relative;
    }
    .gc-grid-thumb img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.2s ease;
    }
    .gc-grid-thumb:hover img {
      transform: scale(1.08);
    }

    /* Lightbox Modal */
    #gcLightboxModal {
      position: fixed;
      inset: 0;
      z-index: 1000000;
      background: rgba(0, 0, 0, 0.88);
      backdrop-filter: blur(10px);
      display: none;
      align-items: center;
      justify-content: center;
    }
    #gcLightboxModal.open { display: flex; }
    #gcLightboxImg {
      max-width: 85vw;
      max-height: 85vh;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.8);
      border: 1px solid rgba(255,255,255,0.2);
    }

    /* WebRTC Audio/Video Huddle Modal */
    #gcHuddleModal {
      position: fixed;
      inset: 0;
      z-index: 999999;
      background: rgba(10, 8, 16, 0.92);
      backdrop-filter: blur(24px);
      display: none;
      flex-direction: column;
    }
    #gcHuddleModal.open { display: flex; }
    .gc-huddle-header {
      padding: 16px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--gc-border);
    }
    .gc-huddle-grid {
      flex: 1;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 16px;
      padding: 24px;
      overflow-y: auto;
    }
    .gc-huddle-tile {
      background: rgba(22, 18, 36, 0.85);
      border-radius: 18px;
      border: 1px solid var(--gc-border);
      overflow: hidden;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 220px;
    }
    .gc-huddle-tile.speaking {
      border-color: var(--gc-purple-primary);
      box-shadow: 0 0 20px rgba(168, 85, 247, 0.4);
    }
    .gc-huddle-tile video {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .gc-huddle-controls {
      height: 80px;
      background: rgba(14, 11, 24, 0.8);
      border-top: 1px solid var(--gc-border);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
    }
    .gc-huddle-btn {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid var(--gc-border);
      color: #fff;
      font-size: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .gc-huddle-btn:hover { background: rgba(255, 255, 255, 0.16); }
    .gc-huddle-btn.danger { background: #ef4444; border-color: #ef4444; }

    /* Responsive Mobile Adjustments */
    @media (max-width: 900px) {
      .gc-col-inspector { display: none !important; }
    }
    @media (max-width: 680px) {
      .gc-layout { margin: 0; border-radius: 0; border: none; }
      .gc-col-sidebar { width: 100%; }
      .gc-col-chat { display: none; width: 100%; }
      .gc-layout.chat-view .gc-col-sidebar { display: none; }
      .gc-layout.chat-view .gc-col-chat { display: flex; }
    }
  `;
  document.head.appendChild(styleEl);

  // 2. BUILD GLASS CHAT DOM SHELL
  function ensureGlassChatDOM() {
    let container = document.getElementById('glassChatContainer');
    if (container) return container;

    container = document.createElement('div');
    container.id = 'glassChatContainer';
    container.innerHTML = `
      <!-- Top Messenger Header -->
      <header class="gc-topbar">
        <div class="gc-topbar-left">
          <div class="gc-brand">
            Skill<span>Mate.</span> <span style="font-size:12px;opacity:0.7;margin-left:4px;">Messenger</span>
          </div>
          <nav class="gc-nav-links">
            <button class="gc-nav-link active" type="button">Chat</button>
            <button class="gc-nav-link" type="button" onclick="window.GlassChat.openCreateChannelModal()">+ New Channel</button>
            <button class="gc-nav-link" type="button" onclick="window.GlassChat.openNewDMModal()">+ New DM</button>
          </nav>
        </div>
        <div class="gc-topbar-right">
          <button class="gc-btn-new-recruitment" type="button" onclick="window.GlassChat.openNewDMModal()">
            <span>＋</span> <span>New Chat</span>
          </button>
          <button class="gc-close-btn" type="button" onclick="window.GlassChat.close()" title="Return to SkillMate">✕</button>
        </div>
      </header>

      <!-- 3-Column Glass Layout -->
      <div class="gc-layout" id="gcLayout">
        <!-- COLUMN 1: LEFT SIDEBAR -->
        <aside class="gc-col-sidebar" id="gcColSidebar">
          <div class="gc-sidebar-header">
            <div class="gc-user-profile-badge" onclick="window.GlassChat.openStatusPicker()" title="Change Status / Focus Mode">
              <div class="gc-user-avatar-wrap">
                <div class="gc-user-avatar" id="gcMyAvatar">✦</div>
                <div class="gc-status-dot online" id="gcMyStatusDot"></div>
              </div>
              <span class="gc-header-title">Chat</span>
            </div>
            <div class="gc-sidebar-actions">
              <button class="gc-action-icon-btn" onclick="window.GlassChat.openCreateChannelModal()" title="Create Team Channel">#</button>
              <button class="gc-action-icon-btn" onclick="window.GlassChat.startHuddle()" title="Voice & Video Huddle">📹</button>
              <button class="gc-action-icon-btn" onclick="window.GlassChat.openNewDMModal()" title="New Direct Message">✏️</button>
            </div>
          </div>

          <!-- Glass Search Bar -->
          <div class="gc-search-box">
            <span style="font-size:14px;color:#64748b;">🔍</span>
            <input type="text" id="gcSearchInput" placeholder="Search" oninput="window.GlassChat.handleSearch(this.value)">
          </div>

          <!-- Conversations Scroll Area -->
          <div class="gc-conversations-scroll" id="gcConversationsScroll">
            <!-- Team Section -->
            <div class="gc-section-title">
              <span>Team</span>
              <button class="gc-action-icon-btn" style="width:20px;height:20px;font-size:11px;" onclick="window.GlassChat.openCreateChannelModal()">＋</button>
            </div>
            <div id="gcTeamList" style="display:flex;flex-direction:column;gap:4px;"></div>

            <!-- Personal Section -->
            <div class="gc-section-title" style="margin-top:10px;">
              <span>Personal</span>
              <button class="gc-action-icon-btn" style="width:20px;height:20px;font-size:11px;" onclick="window.GlassChat.openNewDMModal()">＋</button>
            </div>
            <div id="gcPersonalList" style="display:flex;flex-direction:column;gap:4px;"></div>
          </div>
        </aside>

        <!-- COLUMN 2: CENTER ACTIVE CHAT STREAM -->
        <main class="gc-col-chat" id="gcColChat">
          <!-- Active Conversation Header -->
          <div class="gc-chat-header">
            <div class="gc-chat-header-user">
              <div class="gc-user-avatar-wrap" style="width:42px;height:42px;">
                <div class="gc-user-avatar" id="gcActiveAvatar">✦</div>
                <div class="gc-status-dot online" id="gcActiveStatusDot"></div>
              </div>
              <div>
                <div class="gc-active-title" id="gcActiveTitle">Select a conversation</div>
                <div class="gc-active-status" id="gcActiveStatus">
                  <span class="gc-active-status-pulse"></span>
                  <span id="gcActiveStatusText">Active Now</span>
                </div>
              </div>
            </div>
            <div class="gc-chat-header-actions">
              <button class="gc-neon-action-btn" onclick="window.GlassChat.startAudioCall()" title="Audio Call / Huddle">📞</button>
              <button class="gc-neon-action-btn" onclick="window.GlassChat.startHuddle()" title="Video Call">📹</button>
              <button class="gc-neon-action-btn" onclick="window.GlassChat.togglePinnedMessages()" title="Pinned Messages">📌</button>
              <button class="gc-neon-action-btn" onclick="window.GlassChat.toggleInspector()" title="Toggle Info & Media Inspector">ℹ️</button>
            </div>
          </div>

          <!-- Message Stream -->
          <div class="gc-chat-messages" id="gcChatMessages">
            <!-- Messages render here -->
          </div>

          <!-- Floating Bottom Pill Input Bar -->
          <div class="gc-floating-input-bar">
            <!-- Normal Tools -->
            <button class="gc-pill-btn emoji" type="button" onclick="window.GlassChat.toggleEmojiPicker()" title="Add Emoji">😊</button>
            <button class="gc-pill-btn" type="button" onclick="document.getElementById('gcFileInput').click()" title="Attach File or Image">📎</button>
            <input type="file" id="gcFileInput" style="display:none;" onchange="window.GlassChat.handleFileUpload(this.files[0])">

            <!-- Text Input -->
            <input type="text" class="gc-pill-input" id="gcMessageInput" placeholder="Type something for sent..." autocomplete="off">

            <!-- Live Voice Recording Wrap -->
            <div class="gc-voice-recording-wrap" id="gcVoiceRecWrap">
              <div class="gc-rec-pulse-dot"></div>
              <span style="font-size:12px;font-weight:700;color:#ef4444;" id="gcVoiceTimer">0:00</span>
              <span style="font-size:11px;color:#94a3b8;">Recording audio note...</span>
              <button class="gc-pill-btn" onclick="window.GlassChat.cancelVoiceRecord()" title="Cancel">✕</button>
            </div>

            <!-- Mic and Send Buttons -->
            <button class="gc-pill-btn" id="gcBtnMic" type="button" onclick="window.GlassChat.toggleVoiceRecord()" title="Hold or Click to Record Voice Note">🎙️</button>
            <button class="gc-btn-send" type="button" onclick="window.GlassChat.sendMessage()" title="Send">➤</button>
          </div>
        </main>

        <!-- COLUMN 3: RIGHT INSPECTOR (Profile & Media) -->
        <aside class="gc-col-inspector" id="gcColInspector">
          <div class="gc-inspector-profile">
            <div class="gc-inspector-avatar" id="gcInspAvatar">✦</div>
            <div class="gc-inspector-name" id="gcInspName">Smira khan</div>
            <div class="gc-inspector-role" id="gcInspRole">Digital Product Designer</div>
            <div class="gc-inspector-socials">
              <button class="gc-social-btn" title="Google Profile">G</button>
              <button class="gc-social-btn" title="LinkedIn Profile">in</button>
              <button class="gc-social-btn" title="Facebook / Portfolio">f</button>
            </div>
          </div>

          <!-- Segmented Tabs [Info] vs [Files] -->
          <div class="gc-segmented-tabs">
            <button class="gc-tab-btn active" id="gcTabBtnInfo" onclick="window.GlassChat.switchInspectorTab('info')">Info</button>
            <button class="gc-tab-btn" id="gcTabBtnFiles" onclick="window.GlassChat.switchInspectorTab('files')">Files</button>
          </div>

          <!-- TAB 1: INFO PANE -->
          <div id="gcInspectorTabInfo">
            <div class="gc-sub-header">
              <span>About & Details</span>
            </div>
            <div style="font-size:12.5px;color:#94a3b8;line-height:1.5;margin-bottom:16px;" id="gcInspBio">
              Digital Product Designer exploring full-stack interactions, dark glassmorphism interfaces, and real-time design systems.
            </div>

            <div class="gc-sub-header" id="gcInspMembersHeader" style="display:none;">
              <span>Channel Members</span>
              <span id="gcInspMemberCount" style="font-size:11px;color:#94a3b8;">0</span>
            </div>
            <div id="gcInspMemberList" style="display:flex;flex-direction:column;gap:8px;"></div>
          </div>

          <!-- TAB 2: FILES PANE -->
          <div id="gcInspectorTabFiles" style="display:none;">
            <!-- Uploaded Files Section -->
            <div class="gc-sub-header">
              <span>Uploaded Files</span>
              <span class="gc-view-all-link" onclick="window.GlassChat.viewAllFiles()">View all</span>
            </div>
            <div class="gc-files-list" id="gcUploadedFilesList">
              <!-- Dynamically populated files -->
            </div>

            <!-- Attachments Section (3-Column Grid) -->
            <div class="gc-sub-header">
              <span>Attachment's</span>
              <span class="gc-view-all-link" onclick="window.GlassChat.viewAllAttachments()">View all</span>
            </div>
            <div class="gc-attachments-grid" id="gcAttachmentsGrid">
              <!-- 3-column thumbnails -->
            </div>
          </div>
        </aside>
      </div>

      <!-- LIGHTBOX VIEWER MODAL -->
      <div id="gcLightboxModal" onclick="if(event.target===this)this.classList.remove('open')">
        <img id="gcLightboxImg" src="" alt="Enlarged Attachment">
      </div>

      <!-- AUDIO/VIDEO HUDDLE ROOM MODAL -->
      <div id="gcHuddleModal">
        <div class="gc-huddle-header">
          <div style="font-size:16px;font-weight:800;color:#fff;" id="gcHuddleTitle">
            📹 Glassmorphism Video & Audio Huddle
          </div>
          <button class="gc-close-btn" onclick="window.GlassChat.leaveHuddle()">✕</button>
        </div>
        <div class="gc-huddle-grid" id="gcHuddleGrid">
          <div class="gc-huddle-tile" id="gcLocalHuddleTile">
            <video id="gcLocalHuddleVideo" autoplay playsinline muted></video>
            <div class="gc-inspector-avatar" id="gcLocalHuddleAvatar">✦</div>
            <span style="position:absolute;bottom:12px;left:12px;background:rgba(0,0,0,0.6);padding:3px 8px;border-radius:6px;font-size:11px;">You</span>
          </div>
        </div>
        <div class="gc-huddle-controls">
          <button class="gc-huddle-btn" id="gcHuddleBtnCam" onclick="window.GlassChat.toggleHuddleCam()" title="Camera On/Off">📷</button>
          <button class="gc-huddle-btn" id="gcHuddleBtnMic" onclick="window.GlassChat.toggleHuddleMic()" title="Mute/Unmute Mic">🎙️</button>
          <button class="gc-huddle-btn" id="gcHuddleBtnScreen" onclick="window.GlassChat.toggleHuddleScreen()" title="Share Screen">🖥️</button>
          <button class="gc-huddle-btn danger" onclick="window.GlassChat.leaveHuddle()" title="Leave Call">📞</button>
        </div>
      </div>

      <!-- CREATE CHANNEL MODAL -->
      <div id="gcCreateChannelModal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.8);z-index:100000;align-items:center;justify-content:center;backdrop-filter:blur(8px);">
        <div style="background:#151222;border:1px solid var(--gc-border);border-radius:18px;width:90%;max-width:420px;padding:24px;box-shadow:0 20px 60px rgba(0,0,0,0.7);">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
            <span style="font-size:16px;font-weight:800;color:#fff;">Create Team Channel</span>
            <button class="gc-close-btn" onclick="document.getElementById('gcCreateChannelModal').style.display='none'">✕</button>
          </div>
          <input type="text" id="gcNewChannelName" placeholder="channel-name" style="width:100%;box-sizing:border-box;background:#1e1a30;border:1px solid var(--gc-border);border-radius:10px;padding:10px 14px;color:#fff;font-size:14px;margin-bottom:12px;outline:none;">
          <input type="text" id="gcNewChannelDesc" placeholder="Channel topic / description" style="width:100%;box-sizing:border-box;background:#1e1a30;border:1px solid var(--gc-border);border-radius:10px;padding:10px 14px;color:#fff;font-size:14px;margin-bottom:18px;outline:none;">
          <div style="display:flex;justify-content:flex-end;gap:10px;">
            <button class="gc-btn-new-recruitment" style="background:transparent;border:none;" onclick="document.getElementById('gcCreateChannelModal').style.display='none'">Cancel</button>
            <button class="gc-btn-new-recruitment" style="background:var(--gc-purple-gradient);border:none;color:#fff;" onclick="window.GlassChat.submitCreateChannel()">Create Channel</button>
          </div>
        </div>
      </div>

      <!-- NEW DM MODAL -->
      <div id="gcNewDMModal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.8);z-index:100000;align-items:center;justify-content:center;backdrop-filter:blur(8px);">
        <div style="background:#151222;border:1px solid var(--gc-border);border-radius:18px;width:90%;max-width:440px;padding:24px;box-shadow:0 20px 60px rgba(0,0,0,0.7);max-height:80vh;display:flex;flex-direction:column;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
            <span style="font-size:16px;font-weight:800;color:#fff;">Start a Personal DM</span>
            <button class="gc-close-btn" onclick="document.getElementById('gcNewDMModal').style.display='none'">✕</button>
          </div>
          <input type="text" id="gcUserSearchInput" placeholder="Search registered students..." style="width:100%;box-sizing:border-box;background:#1e1a30;border:1px solid var(--gc-border);border-radius:10px;padding:10px 14px;color:#fff;font-size:14px;margin-bottom:14px;outline:none;" oninput="window.GlassChat.searchRegisteredUsers(this.value)">
          <div id="gcUserSearchResults" style="flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:8px;"></div>
        </div>
      </div>
    `;

    document.body.appendChild(container);

    // Keyboard bindings (Enter to send, Escape to close)
    const input = document.getElementById('gcMessageInput');
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        window.GlassChat.sendMessage();
      }
    });

    return container;
  }

  // 3. GLASS CHAT CONTROLLER & STATE
  let currentUser = null;
  let conversations = [];
  let activeConversationId = null;
  let activeConversation = null;
  let messages = [];
  let socket = null;
  let onlineUsers = new Map();

  // MediaRecorder state
  let mediaRec = null;
  let audioChunks = [];
  let recInterval = null;
  let recSecs = 0;

  // WebRTC Huddle state
  let huddleLocalStream = null;
  let huddleScreenStream = null;
  let isHuddleMuted = false;
  let isHuddleCamOff = false;

  async function apiFetch(url, opts = {}) {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...(opts.headers || {})
      },
      ...opts
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Request failed.' }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
  }

  function formatTime(str) {
    if (!str) return 'Just now';
    const d = new Date(String(str).replace(' ', 'T') + (String(str).includes('Z') ? '' : 'Z'));
    if (isNaN(d.getTime())) return 'Just now';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function escapeHtml(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  window.GlassChat = {
    async init() {
      ensureGlassChatDOM();
      await this.loadCurrentUser();
      this.initSocket();
    },

    async loadCurrentUser() {
      try {
        const res = await apiFetch('/api/auth/me');
        currentUser = res.user || null;
        if (currentUser) {
          const avatar = document.getElementById('gcMyAvatar');
          if (avatar) avatar.textContent = (currentUser.name || '✦')[0].toUpperCase();
          const huddleAv = document.getElementById('gcLocalHuddleAvatar');
          if (huddleAv) huddleAv.textContent = (currentUser.name || '✦')[0].toUpperCase();
        }
      } catch (_) {
        currentUser = null;
      }
    },

    initSocket() {
      if (socket) return;
      if (typeof window.io === 'function') {
        socket = window.io();

        socket.on('chat:message:new', msg => {
          if (Number(msg.conversation_id) === Number(activeConversationId)) {
            messages.push(msg);
            this.appendMessageElement(msg);
            const container = document.getElementById('gcChatMessages');
            if (container) container.scrollTop = container.scrollHeight;
          }
          this.loadConversations(false);
        });

        socket.on('chat:reaction:updated', data => {
          this.updateReactionElement(data);
        });

        socket.on('chat:pin:updated', data => {
          const msg = messages.find(m => m.id === data.messageId);
          if (msg) msg.is_pinned = data.isPinned;
          this.renderMessages();
        });

        socket.on('chat:poll:updated', data => {
          const msg = messages.find(m => m.poll && m.poll.id === data.pollId);
          if (msg && msg.poll) {
            msg.poll.votes = data.votes;
            this.renderMessages();
          }
        });

        socket.on('user:presence:update', data => {
          onlineUsers.set(data.userId, data.status);
          this.renderConversationsList();
        });

        socket.on('user:presence:sync', list => {
          list.forEach(item => onlineUsers.set(item.userId, item.status));
          this.renderConversationsList();
        });
      }
    },

    async open(targetConvId = null) {
      ensureGlassChatDOM();
      const modal = document.getElementById('glassChatContainer');
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';

      await this.loadCurrentUser();
      await this.loadConversations(true);

      if (targetConvId) {
        await this.selectConversation(targetConvId);
      } else if (conversations.length > 0) {
        // Select Smira Khan or first personal DM by default
        const smira = conversations.find(c => c.name.toLowerCase().includes('smira'));
        await this.selectConversation(smira ? smira.id : conversations[0].id);
      }
    },

    close() {
      const modal = document.getElementById('glassChatContainer');
      if (modal) modal.classList.remove('open');
      document.body.style.overflow = '';
      this.leaveHuddle();
    },

    async loadConversations(shouldSelectFirst = false) {
      try {
        const res = await apiFetch('/api/chat/conversations');
        conversations = res.conversations || [];
        this.renderConversationsList();
      } catch (err) {
        console.warn('Failed to load conversations:', err.message);
      }
    },

    renderConversationsList() {
      const teamList = document.getElementById('gcTeamList');
      const personalList = document.getElementById('gcPersonalList');
      if (!teamList || !personalList) return;

      teamList.innerHTML = '';
      personalList.innerHTML = '';

      const filterVal = (document.getElementById('gcSearchInput')?.value || '').toLowerCase().trim();

      conversations.forEach(c => {
        if (filterVal && !c.name.toLowerCase().includes(filterVal)) return;

        const isAct = Number(c.id) === Number(activeConversationId);
        const item = document.createElement('div');
        item.className = `gc-conv-item ${isAct ? 'active' : ''}`;
        item.onclick = () => this.selectConversation(c.id);

        let avatarHtml = '';
        let statusDotHtml = '';

        if (c.type === 'team') {
          avatarHtml = `<div class="gc-conv-avatar channel-hash">#</div>`;
        } else {
          const letter = (c.name || '✦')[0].toUpperCase();
          const otherUserId = c.recipient?.id;
          const userStatus = onlineUsers.get(otherUserId) || 'online';
          statusDotHtml = `<div class="gc-status-dot ${userStatus}"></div>`;
          avatarHtml = `
            <div class="gc-conv-avatar-wrap">
              ${c.avatar_url ? `<img src="${c.avatar_url}" class="gc-conv-avatar" alt="">` : `<div class="gc-conv-avatar">${letter}</div>`}
              ${statusDotHtml}
            </div>
          `;
        }

        const lastSnippet = c.last_message?.content || (c.type === 'team' ? 'Tap to view discussion' : "What's up bro?");
        const timeStr = c.last_message?.created_at ? formatTime(c.last_message.created_at) : '';

        item.innerHTML = `
          ${c.type === 'team' ? avatarHtml : avatarHtml}
          <div class="gc-conv-meta">
            <div class="gc-conv-top">
              <span class="gc-conv-name">${escapeHtml(c.name)}</span>
              <span class="gc-conv-time">${timeStr}</span>
            </div>
            <div class="gc-conv-snippet">${escapeHtml(lastSnippet)}</div>
          </div>
          ${c.unread_count > 0 ? `<span class="gc-conv-badge">${c.unread_count}</span>` : ''}
        `;

        if (c.type === 'team') teamList.appendChild(item);
        else personalList.appendChild(item);
      });
    },

    async selectConversation(convId) {
      activeConversationId = Number(convId);
      this.renderConversationsList();

      if (socket) {
        socket.emit('chat:join', activeConversationId);
      }

      try {
        const detailsRes = await apiFetch(`/api/chat/conversations/${activeConversationId}`);
        activeConversation = detailsRes.conversation;

        // Update Center Header
        const titleEl = document.getElementById('gcActiveTitle');
        const avatarEl = document.getElementById('gcActiveAvatar');
        if (titleEl) titleEl.textContent = activeConversation.name;
        if (avatarEl) {
          if (activeConversation.type === 'team') {
            avatarEl.textContent = '#';
            avatarEl.className = 'gc-user-avatar channel-hash';
          } else {
            avatarEl.textContent = (activeConversation.name || '✦')[0].toUpperCase();
            avatarEl.className = 'gc-user-avatar';
          }
        }

        const statusText = document.getElementById('gcActiveStatusText');
        if (statusText) {
          statusText.textContent = activeConversation.type === 'team' 
            ? `${activeConversation.members.length} members` 
            : 'Active Now';
        }

        // Update Right Inspector
        this.updateInspector(activeConversation);

        // Fetch Messages
        const msgRes = await apiFetch(`/api/chat/conversations/${activeConversationId}/messages`);
        messages = msgRes.messages || [];
        this.renderMessages();

        // Fetch Files for Inspector [Files] tab
        this.loadConversationFiles(activeConversationId);
      } catch (err) {
        console.warn('Select conversation error:', err.message);
      }
    },

    renderMessages() {
      const container = document.getElementById('gcChatMessages');
      if (!container) return;
      container.innerHTML = '';

      messages.forEach(m => {
        this.appendMessageElement(m);
      });

      container.scrollTop = container.scrollHeight;
    },

    appendMessageElement(msg) {
      const container = document.getElementById('gcChatMessages');
      if (!container) return;

      const isMe = currentUser && Number(msg.sender_id) === Number(currentUser.id);
      const row = document.createElement('div');
      row.className = `gc-message-row ${isMe ? 'outgoing' : 'incoming'}`;
      row.id = `gc-msg-${msg.id}`;

      const avatarLetter = (msg.sender_name || '✦')[0].toUpperCase();

      // Check special types (code, voice, poll, file)
      let contentHtml = escapeHtml(msg.content);

      if (msg.type === 'code' || msg.content.includes('```')) {
        const codeClean = msg.content.replace(/```[a-z]*\n?/g, '').replace(/```/g, '');
        contentHtml = `
          <div class="gc-code-block">
            <div class="gc-code-header">
              <span>JAVASCRIPT</span>
              <button class="gc-code-copy-btn" onclick="navigator.clipboard.writeText(this.closest('.gc-code-block').querySelector('pre').textContent); this.textContent='✓ Copied!'; setTimeout(()=>this.textContent='Copy', 1500)">Copy</button>
            </div>
            <pre><code>${escapeHtml(codeClean)}</code></pre>
          </div>
        `;
      } else if (msg.type === 'poll' && msg.poll) {
        contentHtml = this.renderPollHtml(msg.poll);
      } else if (msg.type === 'voice') {
        contentHtml = `
          <div style="display:flex;align-items:center;gap:10px;">
            <button class="gc-pill-btn emoji" style="background:rgba(255,255,255,0.15);width:32px;height:32px;" onclick="window.GlassChat.playVoiceAudio('${msg.metadata?.url || ''}', this)">▶</button>
            <div style="height:16px;width:80px;background:rgba(255,255,255,0.2);border-radius:4px;display:flex;align-items:center;padding:0 6px;gap:2px;">
              <span style="height:8px;width:3px;background:#fff;border-radius:2px;"></span>
              <span style="height:14px;width:3px;background:#fff;border-radius:2px;"></span>
              <span style="height:6px;width:3px;background:#fff;border-radius:2px;"></span>
              <span style="height:12px;width:3px;background:#fff;border-radius:2px;"></span>
            </div>
            <span style="font-size:11px;opacity:0.8;">${msg.metadata?.duration || '0:05'}</span>
          </div>
        `;
      } else if (msg.type === 'file' && msg.metadata?.url) {
        if (msg.metadata.fileType?.startsWith('image/')) {
          contentHtml = `<img src="${msg.metadata.url}" style="max-width:240px;border-radius:10px;cursor:pointer;" onclick="window.GlassChat.openLightbox('${msg.metadata.url}')" alt="">`;
        } else {
          contentHtml = `
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="font-size:20px;">📄</span>
              <div>
                <a href="${msg.metadata.url}" download style="color:#fff;font-weight:700;text-decoration:underline;font-size:13px;">${escapeHtml(msg.metadata.fileName || 'Attachment')}</a>
                <div style="font-size:10px;opacity:0.7;">${Math.round((msg.metadata.fileSize || 1024)/1024)} KB</div>
              </div>
            </div>
          `;
        }
      }

      // Reactions list
      let reactionsHtml = '';
      if (Array.isArray(msg.reactions) && msg.reactions.length > 0) {
        const counts = new Map();
        msg.reactions.forEach(r => {
          counts.set(r.emoji, (counts.get(r.emoji) || 0) + 1);
        });
        reactionsHtml = `<div class="gc-reactions-row">`;
        counts.forEach((c, emoji) => {
          reactionsHtml += `<span class="gc-reaction-tag" onclick="window.GlassChat.reactToMessage(${msg.id}, '${emoji}')">${emoji} ${c}</span>`;
        });
        reactionsHtml += `</div>`;
      }

      row.innerHTML = `
        <div class="gc-msg-avatar">${avatarLetter}</div>
        <div class="gc-bubble-wrap">
          <div class="gc-bubble">
            ${contentHtml}
          </div>
          <div style="display:flex;align-items:center;gap:6px;">
            <span class="gc-msg-time">${formatTime(msg.created_at)}</span>
            ${msg.is_pinned ? '<span style="font-size:10px;color:#eab308;">📌 Pinned</span>' : ''}
          </div>
          ${reactionsHtml}
        </div>

        <!-- Hover Actions -->
        <div class="gc-msg-actions">
          <button class="gc-act-btn" onclick="window.GlassChat.reactToMessage(${msg.id}, '❤️')" title="Heart">❤️</button>
          <button class="gc-act-btn" onclick="window.GlassChat.reactToMessage(${msg.id}, '😊')" title="Smile">😊</button>
          <button class="gc-act-btn" onclick="window.GlassChat.reactToMessage(${msg.id}, '🔥')" title="Fire">🔥</button>
          <button class="gc-act-btn" onclick="window.GlassChat.pinMessage(${msg.id})" title="Pin Message">📌</button>
          <button class="gc-act-btn" onclick="window.GlassChat.replyMessage(${msg.id})" title="Quote Reply">↩</button>
        </div>
      `;

      container.appendChild(row);
    },

    renderPollHtml(poll) {
      const total = poll.options.reduce((sum, o) => sum + (o.votes || 0), 0);
      const opts = poll.options.map(o => {
        const pct = total > 0 ? Math.round((o.votes / total) * 100) : 0;
        return `
          <button style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:8px 12px;color:#fff;cursor:pointer;position:relative;overflow:hidden;display:flex;justify-content:space-between;width:100%;font-size:12px;margin-top:4px;" onclick="window.GlassChat.votePoll(${poll.id}, ${o.id})">
            <div style="position:absolute;left:0;top:0;bottom:0;width:${pct}%;background:rgba(168,85,247,0.3);z-index:1;"></div>
            <span style="position:relative;z-index:2;font-weight:600;">${escapeHtml(o.text)}</span>
            <span style="position:relative;z-index:2;font-weight:700;">${pct}% (${o.votes})</span>
          </button>
        `;
      }).join('');

      return `
        <div style="background:rgba(0,0,0,0.25);border-radius:12px;padding:12px;min-width:220px;">
          <div style="font-weight:800;font-size:13px;margin-bottom:6px;">📊 ${escapeHtml(poll.question)}</div>
          ${opts}
        </div>
      `;
    },

    async sendMessage() {
      const input = document.getElementById('gcMessageInput');
      let text = (input?.value || '').trim();
      if (!text || !activeConversationId) return;
      input.value = '';

      // Slash command: /poll "Question" "Option 1" "Option 2"
      if (text.startsWith('/poll ')) {
        const parts = text.slice(6).match(/"([^"]+)"|(\S+)/g) || [];
        const cleanParts = parts.map(p => p.replace(/^"|"$/g, '').trim()).filter(Boolean);
        if (cleanParts.length >= 3) {
          const q = cleanParts[0];
          const opts = cleanParts.slice(1).map((t, i) => ({ id: i + 1, text: t, votes: 0 }));
          await apiFetch(`/api/chat/conversations/${activeConversationId}/messages`, {
            method: 'POST',
            body: JSON.stringify({
              content: `Poll: ${q}`,
              type: 'poll',
              metadata: { question: q, options: opts }
            })
          });
          return;
        }
      }

      let type = 'text';
      if (text.startsWith('/code ') || text.includes('```')) {
        type = 'code';
      }

      try {
        await apiFetch(`/api/chat/conversations/${activeConversationId}/messages`, {
          method: 'POST',
          body: JSON.stringify({ content: text, type })
        });
      } catch (err) {
        console.warn('Send message error:', err.message);
      }
    },

    async reactToMessage(msgId, emoji) {
      try {
        await apiFetch(`/api/chat/messages/${msgId}/react`, {
          method: 'POST',
          body: JSON.stringify({ emoji })
        });
      } catch (_) {}
    },

    async pinMessage(msgId) {
      try {
        await apiFetch(`/api/chat/messages/${msgId}/pin`, { method: 'POST' });
      } catch (_) {}
    },

    async votePoll(pollId, optId) {
      try {
        await apiFetch(`/api/chat/polls/${pollId}/vote`, {
          method: 'POST',
          body: JSON.stringify({ optionId: optId })
        });
      } catch (_) {}
    },

    // File Upload Handler
    async handleFileUpload(file) {
      if (!file || !activeConversationId) return;
      const formData = new FormData();
      formData.append('file', file);

      try {
        const uploadRes = await fetch('/api/chat/upload', {
          method: 'POST',
          body: formData
        }).then(r => r.json());

        await apiFetch(`/api/chat/conversations/${activeConversationId}/messages`, {
          method: 'POST',
          body: JSON.stringify({
            content: `Shared file: ${uploadRes.fileName}`,
            type: 'file',
            metadata: uploadRes
          })
        });

        this.loadConversationFiles(activeConversationId);
      } catch (err) {
        alert('File upload failed: ' + err.message);
      }
    },

    // Voice Notes via MediaRecorder
    async toggleVoiceRecord() {
      if (!mediaRec || mediaRec.state === 'inactive') {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          mediaRec = new MediaRecorder(stream);
          audioChunks = [];
          mediaRec.ondataavailable = e => { if (e.data.size > 0) audioChunks.push(e.data); };
          mediaRec.start();

          recSecs = 0;
          document.getElementById('gcVoiceRecWrap').style.display = 'flex';
          document.getElementById('gcMessageInput').style.display = 'none';

          recInterval = setInterval(() => {
            recSecs++;
            const m = Math.floor(recSecs / 60);
            const s = recSecs % 60;
            document.getElementById('gcVoiceTimer').textContent = `${m}:${s < 10 ? '0' : ''}${s}`;
          }, 1000);
        } catch (_) {
          alert('Microphone access denied.');
        }
      } else {
        // Stop and send
        mediaRec.onstop = async () => {
          clearInterval(recInterval);
          document.getElementById('gcVoiceRecWrap').style.display = 'none';
          document.getElementById('gcMessageInput').style.display = 'block';

          const blob = new Blob(audioChunks, { type: 'audio/webm' });
          const formData = new FormData();
          formData.append('file', blob, 'voicenote.webm');

          const uploadRes = await fetch('/api/chat/upload', { method: 'POST', body: formData }).then(r => r.json());
          const m = Math.floor(recSecs / 60);
          const s = recSecs % 60;

          await apiFetch(`/api/chat/conversations/${activeConversationId}/messages`, {
            method: 'POST',
            body: JSON.stringify({
              content: 'Voice note',
              type: 'voice',
              metadata: { url: uploadRes.url, duration: `${m}:${s < 10 ? '0' : ''}${s}` }
            })
          });
        };
        mediaRec.stop();
        mediaRec.stream.getTracks().forEach(t => t.stop());
      }
    },

    cancelVoiceRecord() {
      if (mediaRec && mediaRec.state !== 'inactive') {
        mediaRec.stop();
        mediaRec.stream.getTracks().forEach(t => t.stop());
      }
      clearInterval(recInterval);
      document.getElementById('gcVoiceRecWrap').style.display = 'none';
      document.getElementById('gcMessageInput').style.display = 'block';
    },

    playVoiceAudio(url, btn) {
      let a = btn._audio;
      if (!a) {
        a = new Audio(url);
        btn._audio = a;
        a.onended = () => { btn.textContent = '▶'; };
      }
      if (a.paused) {
        a.play();
        btn.textContent = '⏸';
      } else {
        a.pause();
        btn.textContent = '▶';
      }
    },

    // Right Sidebar Inspector Updates
    updateInspector(conv) {
      const avatarEl = document.getElementById('gcInspAvatar');
      const nameEl = document.getElementById('gcInspName');
      const roleEl = document.getElementById('gcInspRole');
      const bioEl = document.getElementById('gcInspBio');

      if (conv.type === 'personal') {
        nameEl.textContent = conv.name || 'Student';
        roleEl.textContent = conv.recipient?.bio || 'Digital Product Designer';
        bioEl.textContent = `${conv.recipient?.bio || 'Product Designer'} • Active peer collaborator on SkillMate.`;
        avatarEl.textContent = (conv.name || '✦')[0].toUpperCase();
        document.getElementById('gcInspMembersHeader').style.display = 'none';
      } else {
        nameEl.textContent = `#${conv.name}`;
        roleEl.textContent = `${conv.members?.length || 1} Community Members`;
        bioEl.textContent = conv.description || 'Dedicated topic channel for group discussion and peer work.';
        avatarEl.textContent = '#';

        // Render member list
        const mList = document.getElementById('gcInspMemberList');
        mList.innerHTML = '';
        document.getElementById('gcInspMembersHeader').style.display = 'flex';
        document.getElementById('gcInspMemberCount').textContent = conv.members?.length || 0;

        conv.members?.forEach(m => {
          const item = document.createElement('div');
          item.style.cssText = 'display:flex;align-items:center;gap:8px;padding:4px 0;font-size:12px;color:#f1f5f9;';
          item.innerHTML = `
            <div style="width:24px;height:24px;border-radius:50%;background:rgba(168,85,247,0.3);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:10px;">
              ${(m.name || '✦')[0].toUpperCase()}
            </div>
            <span>${escapeHtml(m.name)}</span>
            <span style="font-size:10px;color:#94a3b8;margin-left:auto;">${m.role}</span>
          `;
          mList.appendChild(item);
        });
      }
    },

    switchInspectorTab(tab) {
      document.getElementById('gcTabBtnInfo').classList.toggle('active', tab === 'info');
      document.getElementById('gcTabBtnFiles').classList.toggle('active', tab === 'files');
      document.getElementById('gcInspectorTabInfo').style.display = tab === 'info' ? 'block' : 'none';
      document.getElementById('gcInspectorTabFiles').style.display = tab === 'files' ? 'block' : 'none';
    },

    toggleInspector() {
      document.getElementById('gcColInspector')?.classList.toggle('collapsed');
    },

    async loadConversationFiles(convId) {
      try {
        const res = await apiFetch(`/api/chat/conversations/${convId}/files`);
        const filesList = document.getElementById('gcUploadedFilesList');
        const grid = document.getElementById('gcAttachmentsGrid');
        if (!filesList || !grid) return;

        filesList.innerHTML = '';
        grid.innerHTML = '';

        // Render Uploaded Files
        if (res.uploadedFiles && res.uploadedFiles.length > 0) {
          res.uploadedFiles.forEach(f => {
            const item = document.createElement('div');
            item.className = 'gc-file-item';
            let icon = '📄';
            if (f.file_type === 'folder' || f.file_name.includes('Outline')) icon = '📁';
            if (f.file_type === 'zip' || f.file_name.endsWith('.zip')) icon = '📦';
            item.innerHTML = `
              <span class="gc-file-icon">${icon}</span>
              <div class="gc-file-info">
                <div class="gc-file-name">${escapeHtml(f.file_name)}</div>
                <div class="gc-file-size">${Math.round((f.file_size || 1024)/1024)} KB</div>
              </div>
              <a href="${f.file_url}" download style="color:#a855f7;font-size:14px;text-decoration:none;">⬇</a>
            `;
            filesList.appendChild(item);
          });
        } else {
          filesList.innerHTML = '<div style="font-size:11px;color:#64748b;padding:8px 0;">No uploaded files yet.</div>';
        }

        // Render Attachments Grid
        if (res.mediaGrid && res.mediaGrid.length > 0) {
          res.mediaGrid.forEach(m => {
            const thumb = document.createElement('div');
            thumb.className = 'gc-grid-thumb';
            thumb.onclick = () => this.openLightbox(m.file_url);
            thumb.innerHTML = `<img src="${m.file_url}" alt="Attachment">`;
            grid.appendChild(thumb);
          });
        } else {
          grid.innerHTML = '<div style="font-size:11px;color:#64748b;grid-column:span 3;">No media attachments.</div>';
        }
      } catch (_) {}
    },

    openLightbox(src) {
      const modal = document.getElementById('gcLightboxModal');
      const img = document.getElementById('gcLightboxImg');
      if (modal && img) {
        img.src = src;
        modal.classList.add('open');
      }
    },

    // WebRTC Audio/Video Huddle
    async startHuddle(video = true) {
      const modal = document.getElementById('gcHuddleModal');
      modal.classList.add('open');

      try {
        huddleLocalStream = await navigator.mediaDevices.getUserMedia({ video, audio: true });
        const videoEl = document.getElementById('gcLocalHuddleVideo');
        if (videoEl && video) {
          videoEl.srcObject = huddleLocalStream;
          videoEl.style.display = 'block';
          document.getElementById('gcLocalHuddleAvatar').style.display = 'none';
        }
      } catch (_) {
        // Fallback to audio only
        document.getElementById('gcLocalHuddleVideo').style.display = 'none';
        document.getElementById('gcLocalHuddleAvatar').style.display = 'flex';
      }
    },

    startAudioCall() {
      this.startHuddle(false);
    },

    toggleHuddleCam() {
      if (!huddleLocalStream) return;
      const t = huddleLocalStream.getVideoTracks()[0];
      if (t) {
        t.enabled = !t.enabled;
        isHuddleCamOff = !t.enabled;
        document.getElementById('gcLocalHuddleVideo').style.display = isHuddleCamOff ? 'none' : 'block';
        document.getElementById('gcLocalHuddleAvatar').style.display = isHuddleCamOff ? 'flex' : 'none';
      }
    },

    toggleHuddleMic() {
      if (!huddleLocalStream) return;
      const t = huddleLocalStream.getAudioTracks()[0];
      if (t) {
        t.enabled = !t.enabled;
        isHuddleMuted = !t.enabled;
        document.getElementById('gcHuddleBtnMic').style.opacity = isHuddleMuted ? '0.5' : '1';
      }
    },

    async toggleHuddleScreen() {
      if (!huddleScreenStream) {
        try {
          huddleScreenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
          document.getElementById('gcLocalHuddleVideo').srcObject = huddleScreenStream;
          huddleScreenStream.getVideoTracks()[0].onended = () => {
            document.getElementById('gcLocalHuddleVideo').srcObject = huddleLocalStream;
            huddleScreenStream = null;
          };
        } catch (_) {}
      } else {
        huddleScreenStream.getTracks().forEach(t => t.stop());
        huddleScreenStream = null;
        if (huddleLocalStream) document.getElementById('gcLocalHuddleVideo').srcObject = huddleLocalStream;
      }
    },

    leaveHuddle() {
      if (huddleLocalStream) {
        huddleLocalStream.getTracks().forEach(t => t.stop());
        huddleLocalStream = null;
      }
      if (huddleScreenStream) {
        huddleScreenStream.getTracks().forEach(t => t.stop());
        huddleScreenStream = null;
      }
      document.getElementById('gcHuddleModal')?.classList.remove('open');
    },

    // Search Registered Users & Start New DM
    openNewDMModal() {
      document.getElementById('gcNewDMModal').style.display = 'flex';
      this.searchRegisteredUsers('');
    },

    async searchRegisteredUsers(q) {
      try {
        const res = await apiFetch(`/api/chat/users/search?q=${encodeURIComponent(q)}`);
        const list = document.getElementById('gcUserSearchResults');
        if (!list) return;
        list.innerHTML = '';

        (res.users || []).forEach(u => {
          const item = document.createElement('div');
          item.style.cssText = 'display:flex;align-items:center;gap:12px;padding:10px 14px;background:#1e1a30;border-radius:12px;cursor:pointer;transition:background 0.15s ease;';
          item.onmouseover = () => item.style.background = '#282342';
          item.onmouseout = () => item.style.background = '#1e1a30';
          item.onclick = () => this.startDMWithUser(u.id);

          item.innerHTML = `
            <div style="width:36px;height:36px;border-radius:50%;background:var(--gc-purple-gradient);display:flex;align-items:center;justify-content:center;font-weight:700;color:#fff;">
              ${(u.name || '✦')[0].toUpperCase()}
            </div>
            <div>
              <div style="font-weight:700;color:#fff;font-size:13px;">${escapeHtml(u.name)}</div>
              <div style="font-size:11px;color:#94a3b8;">${escapeHtml(u.email)}</div>
            </div>
          `;
          list.appendChild(item);
        });
      } catch (_) {}
    },

    async startDMWithUser(userId) {
      document.getElementById('gcNewDMModal').style.display = 'none';
      try {
        const res = await apiFetch('/api/chat/conversations', {
          method: 'POST',
          body: JSON.stringify({ type: 'personal', recipientId: userId })
        });
        await this.loadConversations();
        await this.selectConversation(res.conversation.id);
      } catch (err) {
        alert(err.message);
      }
    },

    // Create Team Channel
    openCreateChannelModal() {
      document.getElementById('gcCreateChannelModal').style.display = 'flex';
    },

    async submitCreateChannel() {
      const name = document.getElementById('gcNewChannelName')?.value?.trim();
      const desc = document.getElementById('gcNewChannelDesc')?.value?.trim();
      if (!name) return alert('Channel name is required.');

      try {
        const res = await apiFetch('/api/chat/conversations', {
          method: 'POST',
          body: JSON.stringify({ type: 'team', name, description: desc })
        });
        document.getElementById('gcCreateChannelModal').style.display = 'none';
        await this.loadConversations();
        await this.selectConversation(res.conversation.id);
      } catch (err) {
        alert(err.message);
      }
    },

    handleSearch(val) {
      this.renderConversationsList();
    },

    openStatusPicker() {
      const status = prompt('Set presence status (online, idle, dnd):', 'online');
      if (status && socket) {
        socket.emit('chat:status:change', { status: status.toLowerCase() });
      }
    }
  };

  // Auto initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.GlassChat.init());
  } else {
    window.GlassChat.init();
  }

  // Hook into openChat
  window.openChat = function(personId) {
    window.GlassChat.open(personId);
  };
})();
