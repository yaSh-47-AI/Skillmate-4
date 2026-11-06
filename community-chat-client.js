(() => {
  'use strict';

  const API = '/api';
  const $ = (selector, root = document) => root.querySelector(selector);

  let communities = [];
  let currentUser = null;
  let activeCommunityId = null;
  let socket = null;
  let messageLoadRequest = 0;
  let refreshTimer = null;

  const style = document.createElement('style');

  style.textContent = `
    .community-card-actions {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      flex-wrap: wrap;
      gap: 7px;
    }

    .community-chat-button {
      min-height: 32px;
      padding: 7px 12px;
      border: 1px solid rgba(168,85,247,.3);
      border-radius: 10px;
      color: #e9d5ff;
      background: rgba(168,85,247,.1);
      font-size: 10px;
      font-weight: 750;
      cursor: pointer;
      transition: all .2s ease;
    }

    .community-chat-button:hover {
      background: rgba(168,85,247,.22);
      border-color: rgba(168,85,247,.5);
      color: #fff;
    }

    .community-chat-button:disabled {
      cursor: not-allowed;
      opacity: .42;
    }

    .community-chat-panel {
      margin-top: 24px;
      padding: 0;
      border: 1px solid rgba(255,255,255,.12);
      border-radius: 22px;
      background: rgba(14, 12, 24, 0.82);
      backdrop-filter: blur(40px) saturate(170%);
      -webkit-backdrop-filter: blur(40px) saturate(170%);
      box-shadow: 0 25px 80px rgba(0, 0, 0, 0.65), 0 0 60px rgba(139, 92, 246, 0.12);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .community-chat-panel[hidden] {
      display: none !important;
    }

    .community-chat-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 15px;
      padding: 16px 22px;
      border-bottom: 1px solid rgba(255,255,255,.09);
      background: rgba(255,255,255,.02);
    }

    .community-chat-header-left {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 0;
    }

    .discord-hash-badge {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 34px;
      height: 34px;
      border-radius: 10px;
      color: #c084fc;
      background: rgba(168,85,247,.15);
      font-size: 20px;
      font-weight: 900;
      flex-shrink: 0;
    }

    .community-chat-header h3 {
      margin: 0;
      color: #f7f6fd;
      font-size: 16px;
      font-weight: 800;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .community-chat-header p {
      margin: 2px 0 0;
      color: #9a98ad;
      font-size: 11px;
    }

    .community-chat-close {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border: 1px solid rgba(255,255,255,.1);
      border-radius: 50%;
      color: #9a98ad;
      background: rgba(255,255,255,.04);
      font-size: 14px;
      cursor: pointer;
      transition: all .18s;
    }

    .community-chat-close:hover {
      color: #fff;
      background: rgba(255,255,255,.12);
      border-color: rgba(255,255,255,.2);
    }

    .community-chat-messages {
      display: flex;
      flex-direction: column;
      gap: 10px;
      min-height: 220px;
      max-height: 480px;
      padding: 20px 22px;
      overflow-y: auto;
    }

    /* Discord Welcome Card */
    .discord-welcome-card {
      padding: 20px 18px;
      margin-bottom: 12px;
      border: 1px solid rgba(168, 85, 247, 0.22);
      border-radius: 16px;
      background: linear-gradient(135deg, rgba(168, 85, 247, 0.12), rgba(236, 72, 153, 0.05));
      backdrop-filter: blur(14px);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
    }

    .discord-welcome-avatar {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      border-radius: 14px;
      background: linear-gradient(135deg, #a855f7, #ec4899);
      color: #fff;
      font-size: 22px;
      margin-bottom: 10px;
      box-shadow: 0 6px 20px rgba(168, 85, 247, 0.4);
    }

    .discord-welcome-title {
      margin: 0 0 6px;
      color: #fff;
      font-size: 17px;
      font-weight: 850;
      letter-spacing: -.3px;
    }

    .discord-welcome-desc {
      margin: 0 0 12px;
      color: #a8a4bd;
      font-size: 11.5px;
      line-height: 1.5;
    }

    .discord-welcome-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 7px;
    }

    .discord-tag {
      padding: 4px 10px;
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #d1cbe5;
      font-size: 10px;
      font-weight: 600;
      letter-spacing: .2px;
    }

    .community-chat-empty {
      margin: 10px auto;
      color: #8c889f;
      font-size: 11px;
      text-align: center;
      padding: 8px;
    }

    /* Discord Message Row */
    .discord-msg-row {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 6px 10px;
      border-radius: 12px;
      transition: background .15s ease;
    }

    .discord-msg-row:hover {
      background: rgba(255, 255, 255, 0.03);
    }

    .discord-msg-row.mine {
      background: rgba(168, 85, 247, 0.05);
      border-left: 2px solid #a855f7;
    }

    .discord-msg-avatar {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: linear-gradient(135deg, #7c3aed, #06b6d4);
      color: #fff;
      font-size: 11px;
      font-weight: 800;
      flex-shrink: 0;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    }

    .discord-msg-content {
      flex: 1;
      min-width: 0;
    }

    .discord-msg-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 3px;
    }

    .discord-sender-name {
      color: #f5f3ff;
      font-size: 12px;
      font-weight: 750;
    }

    .discord-role-badge {
      padding: 1px 6px;
      border-radius: 6px;
      font-size: 8px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .5px;
      color: #c084fc;
      background: rgba(168, 85, 247, 0.15);
      border: 1px solid rgba(168, 85, 247, 0.3);
    }

    .discord-role-badge.mine {
      color: #38bdf8;
      background: rgba(56, 189, 248, 0.15);
      border-color: rgba(56, 189, 248, 0.3);
    }

    .discord-msg-time {
      color: #7b778d;
      font-size: 9px;
    }

    .discord-msg-body {
      color: #e2def2;
      font-size: 12px;
      line-height: 1.6;
      overflow-wrap: anywhere;
      white-space: pre-wrap;
    }

    /* Composer */
    .community-chat-composer {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 8px 18px 14px;
      padding: 6px 12px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 28px;
      background: rgba(255, 255, 255, 0.045);
      backdrop-filter: blur(20px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
    }

    .community-chat-composer:focus-within {
      border-color: rgba(168, 85, 247, 0.45);
      background: rgba(255, 255, 255, 0.065);
    }

    .discord-attach-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 0;
      color: #a39eb8;
      background: rgba(255, 255, 255, 0.05);
      font-size: 16px;
      cursor: pointer;
      transition: all .16s;
    }

    .discord-attach-btn:hover {
      color: #fff;
      background: rgba(255, 255, 255, 0.12);
    }

    .community-chat-composer input {
      flex: 1;
      min-width: 0;
      border: 0;
      outline: 0;
      color: #f7f6fd;
      background: transparent;
      font: inherit;
      font-size: 12px;
      padding: 6px 0;
    }

    .community-chat-composer input::placeholder {
      color: #78738a;
    }

    .discord-send-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border: 0;
      border-radius: 50%;
      color: white;
      background: linear-gradient(135deg, #a855f7, #ec4899);
      box-shadow: 0 3px 12px rgba(168, 85, 247, 0.4);
      font-size: 13px;
      cursor: pointer;
      transition: transform .15s ease, opacity .15s ease;
    }

    .discord-send-btn:hover {
      transform: scale(1.05);
    }

    .discord-send-btn:disabled {
      opacity: .4;
      cursor: not-allowed;
      transform: none;
    }

    .community-chat-note {
      margin: 0 18px 10px;
      color: #635f75;
      font-size: 9px;
      text-align: center;
    }

    @media(max-width:650px) {
      .community-card-actions {
        justify-content: flex-start;
      }
      .community-chat-panel {
        border-radius: 16px;
      }
      .community-chat-header {
        padding: 12px 14px;
      }
      .community-chat-messages {
        padding: 14px 12px;
      }
      .community-chat-composer {
        margin: 6px 12px 12px;
        padding: 5px 10px;
      }
    }
  `;

  document.head.appendChild(style);


  function toast(message) {
    if (typeof window.showToast === 'function') {
      window.showToast(message);
    } else {
      console.info('[SkillMate]', message);
    }
  }


  async function api(url, options = {}) {
    const config = {
      credentials: 'same-origin',
      ...options
    };

    if (config.body && !(config.body instanceof FormData)) {
      config.headers = {
        'Content-Type': 'application/json',
        ...config.headers
      };
    }

    const response = await fetch(url, config);

    let data = {};

    try {
      data = await response.json();
    } catch (_) {
    }

    if (!response.ok) {
      const error = new Error(
        data.error || `Request failed (${response.status}).`
      );

      error.status = response.status;

      throw error;
    }

    return data;
  }


  function initials(name) {
    if (!name) return '✦';
    const parts = String(name).trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return (parts[0][0] || '✦').toUpperCase();
  }

  function timeLabel(value) {
    if (!value) return '';

    const date = new Date(
      String(value).replace(' ', 'T') + 'Z'
    );

    return Number.isNaN(date.getTime())
      ? ''
      : date.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        });
  }


  async function loadUser() {
    try {
      const result = await api(`${API}/auth/me`);
      currentUser = result.user || null;
    } catch (_) {
      currentUser = null;
    }
  }


  async function loadCommunities() {
    try {
      const result = await api(`${API}/communities`);

      communities = Array.isArray(result.communities)
        ? result.communities
        : [];

      syncCommunityButtons();
    } catch (_) {
      // The main page already shows its own community loading state.
    }
  }


  function ensurePanel() {
    let panel = $('#communityChatPanel');

    if (panel) return panel;

    const grid = $('#communitiesGrid');

    if (!grid) return null;

    panel = document.createElement('section');

    panel.id = 'communityChatPanel';
    panel.className = 'community-chat-panel';
    panel.hidden = true;
    panel.setAttribute('aria-label', 'Community group chat');


    const header = document.createElement('div');
    header.className = 'community-chat-header';

    const headerLeft = document.createElement('div');
    headerLeft.className = 'community-chat-header-left';

    const hashBadge = document.createElement('span');
    hashBadge.className = 'discord-hash-badge';
    hashBadge.textContent = '#';

    const heading = document.createElement('div');

    const title = document.createElement('h3');
    title.id = 'communityChatTitle';
    title.textContent = 'general';

    const subtitle = document.createElement('p');
    subtitle.id = 'communityChatSubtitle';
    subtitle.textContent = 'Only joined members can read and send messages.';

    heading.append(title, subtitle);
    headerLeft.append(hashBadge, heading);

    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'community-chat-close';
    close.textContent = '✕';
    close.setAttribute('aria-label', 'Close group chat');
    close.addEventListener('click', closeChat);

    header.append(headerLeft, close);

    const messages = document.createElement('div');
    messages.id = 'communityChatMessages';
    messages.className = 'community-chat-messages';
    messages.setAttribute('aria-live', 'polite');

    const form = document.createElement('form');
    form.id = 'communityChatForm';
    form.className = 'community-chat-composer';

    const attach = document.createElement('button');
    attach.type = 'button';
    attach.className = 'discord-attach-btn';
    attach.textContent = '＋';
    attach.title = 'Add attachment';
    attach.onclick = () => toast('File uploads coming soon!');

    const input = document.createElement('input');
    input.id = 'communityChatInput';
    input.type = 'text';
    input.maxLength = 2000;
    input.placeholder = 'Message this channel...';
    input.autocomplete = 'off';
    input.required = true;
    input.setAttribute('aria-label', 'Write a group message');

    const send = document.createElement('button');
    send.type = 'submit';
    send.className = 'discord-send-btn';
    send.textContent = '➤';
    send.setAttribute('aria-label', 'Send group message');

    form.append(attach, input, send);
    form.addEventListener('submit', sendMessage);

    const note = document.createElement('p');
    note.className = 'community-chat-note';
    note.textContent = 'Messages are saved in the SkillMate database.';

    panel.append(header, messages, form, note);

    grid.insertAdjacentElement('afterend', panel);

    return panel;
  }


  let isSyncing = false;

  function syncCommunityButtons() {
    if (isSyncing) return;
    const grid = $('#communitiesGrid');

    if (!grid) return;
    isSyncing = true;

    try {
      const lookup = new Map(
        communities.map(item => [
          String(item.topic).trim().toLowerCase(),
          item
        ])
      );

      grid.querySelectorAll('.community-card').forEach(card => {
        const topic = card
          .querySelector('.community-topic-pill')
          ?.textContent
          ?.trim()
          .toLowerCase();

        const community = lookup.get(topic);

        if (!community) return;

        let actions = card.querySelector('.community-card-actions');

        if (!actions) {
          actions = document.createElement('div');
          actions.className = 'community-card-actions';

          const bottom = card.querySelector('.community-card-bottom');

          if (bottom) {
            bottom.appendChild(actions);
          } else {
            card.appendChild(actions);
          }
        }

        const joinButton = card.querySelector('.community-action');

        if (joinButton && joinButton.parentElement !== actions) {
          actions.appendChild(joinButton);
        }

        let button = actions.querySelector('.community-chat-button');

        if (!button) {
          button = document.createElement('button');
          button.type = 'button';
          button.className = 'community-chat-button';
          actions.appendChild(button);
        }

        const isJoinedOnCard = Boolean(
          card.querySelector('.community-action.joined') ||
          card.querySelector('.community-action')?.textContent?.includes('Joined')
        );
        const isMember = Boolean(community?.is_member || isJoinedOnCard);

        button.textContent = isMember
          ? 'Open group chat'
          : 'Join to chat';

        button.disabled = false;

        button.onclick = () => {
          if (isMember) {
            openChat(community ? community.id : topic);
          } else {
            const joinBtn = card.querySelector('.community-action');
            if (joinBtn) joinBtn.click();
          }
        };

        if (
          !isMember &&
          Number(activeCommunityId) === Number(community?.id)
        ) {
          closeChat();
        }
      });
    } finally {
      window.setTimeout(() => { isSyncing = false; }, 300);
    }
  }


  function getSocket() {
    if (socket && socket.connected) return socket;

    if (typeof window.io !== 'function') return null;

    if (socket) socket.disconnect();

    socket = window.io({
      withCredentials: true
    });

    socket.on('connect', () => {
      if (activeCommunityId) {
        socket.emit('community:join', activeCommunityId);
      }
    });

    socket.on('community:message:new', message => {
      if (
        Number(message.community_id) ===
        Number(activeCommunityId)
      ) {
        loadMessages(activeCommunityId);
      }
    });

    socket.on('connect_error', () => {
      toast('Group chat connection failed. Refresh the page.');
    });

    return socket;
  }


  async function openChat(communityId) {
    await loadUser();

    if (!currentUser) {
      toast('Log in first to use community group chats.');

      if (typeof window.openModal === 'function') {
        window.openModal('login');
      }

      return;
    }

    await loadCommunities();

    let community = communities.find(
      item => Number(item.id) === Number(communityId) || String(item.topic).trim().toLowerCase() === String(communityId).trim().toLowerCase()
    );

    if (!community) {
      await loadCommunities();
      community = communities.find(
        item => Number(item.id) === Number(communityId) || String(item.topic).trim().toLowerCase() === String(communityId).trim().toLowerCase()
      );
    }

    if (!community) {
      toast('Community not found.');
      return;
    }

    if (!community.is_member) {
      try {
        await api(`${API}/communities/${community.id}/join`, { method: 'POST' });
        await loadCommunities();
        if (typeof window.loadCommunities === 'function') {
          window.loadCommunities();
        }
      } catch (_) {
        toast('Join this community to access its group chat.');
        return;
      }
    }

    if (activeCommunityId && socket) {
      socket.emit('community:leave', activeCommunityId);
    }

    activeCommunityId = Number(community.id);

    const panel = ensurePanel();

    if (!panel) return;

    const topicSlug = (community.topic || community.name || 'general').toLowerCase().replace(/\s+/g, '-');
    $('#communityChatTitle').textContent = `${community.emoji || '✦'} ${community.name}`;
    $('#communityChatSubtitle').textContent = `👥 ${community.member_count || 1} members · Chat, share, and collaborate in #${topicSlug}`;
    if ($('#communityChatInput')) {
      $('#communityChatInput').placeholder = `Message #${topicSlug}...`;
    }

    panel.hidden = false;

    const liveSocket = getSocket();

    if (liveSocket) {
      if (liveSocket.connected) {
        liveSocket.emit('community:join', activeCommunityId);
      } else {
        liveSocket.once('connect', () => {
          liveSocket.emit('community:join', activeCommunityId);
        });
      }
    }

    panel.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest'
    });

    await loadMessages(activeCommunityId);

    $('#communityChatInput')?.focus();
  }


  function closeChat() {
    if (activeCommunityId && socket) {
      socket.emit('community:leave', activeCommunityId);
    }

    activeCommunityId = null;
    messageLoadRequest += 1;

    const panel = $('#communityChatPanel');

    if (panel) panel.hidden = true;
  }


  async function loadMessages(communityId) {
    if (!communityId) return;

    const list = $('#communityChatMessages');

    if (!list) return;

    const requestId = ++messageLoadRequest;

    try {
      const result = await api(
        `${API}/communities/${communityId}/messages`
      );

      if (
        Number(activeCommunityId) !== Number(communityId) ||
        requestId !== messageLoadRequest
      ) {
        return;
      }

      list.replaceChildren();

      // Render Discord-style Welcome Banner (Image 2)
      const currentComm = communities.find(c => Number(c.id) === Number(communityId));
      const topicSlug = (currentComm?.topic || currentComm?.name || 'community').toLowerCase().replace(/\s+/g, '-');
      const commName = currentComm?.name || 'Community';
      const commEmoji = currentComm?.emoji || '✦';

      const welcomeCard = document.createElement('div');
      welcomeCard.className = 'discord-welcome-card';
      welcomeCard.innerHTML = `
        <div class="discord-welcome-avatar">${commEmoji}</div>
        <div class="discord-welcome-body">
          <h2 class="discord-welcome-title">Welcome to ${commName}!</h2>
          <p class="discord-welcome-desc">A space for creators, learners and doers to collaborate, ask questions and build together in #${topicSlug}.</p>
          <div class="discord-welcome-pills">
            <span class="discord-tag">✦ Be Kind</span>
            <span class="discord-tag">💡 Share Knowledge</span>
            <span class="discord-tag">🤝 Help Others</span>
            <span class="discord-tag">🚀 Grow Together</span>
          </div>
        </div>
      `;
      list.appendChild(welcomeCard);

      const messages = Array.isArray(result.messages)
        ? result.messages
        : [];

      if (!messages.length) {
        const empty = document.createElement('p');
        empty.className = 'community-chat-empty';
        empty.textContent = 'No messages yet in this channel. Say hello to get things started! 👋';
        list.appendChild(empty);
        return;
      }

      messages.forEach(message => {
        const mine =
          Number(message.user_id) === Number(currentUser?.id);

        const row = document.createElement('article');
        row.className = `discord-msg-row${mine ? ' mine' : ''}`;

        const avatar = document.createElement('div');
        avatar.className = 'discord-msg-avatar';
        avatar.textContent = initials(mine ? (currentUser?.name || 'You') : (message.sender_name || 'Member'));

        const content = document.createElement('div');
        content.className = 'discord-msg-content';

        const meta = document.createElement('div');
        meta.className = 'discord-msg-meta';

        const sender = document.createElement('strong');
        sender.className = 'discord-sender-name';
        sender.textContent = mine
          ? 'You'
          : (message.sender_name || 'Member');

        const role = document.createElement('span');
        role.className = `discord-role-badge${mine ? ' mine' : ''}`;
        role.textContent = mine ? 'Member' : 'Builder';

        const time = document.createElement('time');
        time.className = 'discord-msg-time';
        time.textContent = timeLabel(message.created_at);

        meta.append(sender, role, time);

        const body = document.createElement('div');
        body.className = 'discord-msg-body';
        body.textContent = message.body;

        content.append(meta, body);
        row.append(avatar, content);
        list.appendChild(row);
      });

      list.scrollTop = list.scrollHeight;

    } catch (error) {
      list.replaceChildren();

      const note = document.createElement('p');

      note.className = 'community-chat-empty';

      note.textContent =
        error.message || 'Could not load group messages.';

      list.appendChild(note);
    }
  }


  async function sendMessage(event) {
    event.preventDefault();

    const input = $('#communityChatInput');

    const body = String(input?.value || '').trim();

    if (!body || !activeCommunityId) return;

    if (body.length > 2000) {
      toast('Message must be 2,000 characters or less.');
      return;
    }

    const button = input
      .closest('form')
      ?.querySelector('button[type="submit"]');

    if (button) button.disabled = true;

    try {
      await api(
        `${API}/communities/${activeCommunityId}/messages`,
        {
          method: 'POST',
          body: JSON.stringify({ body })
        }
      );

      input.value = '';

      await loadMessages(activeCommunityId);

      input.focus();

    } catch (error) {
      toast(error.message);
    } finally {
      if (button) button.disabled = false;
    }
  }


  function start() {
    const grid = $('#communitiesGrid');

    if (!grid) return;

    ensurePanel();

    const observer = new MutationObserver(() => {
      window.clearTimeout(refreshTimer);

      refreshTimer = window.setTimeout(
        syncCommunityButtons,
        100
      );
    });

    observer.observe(grid, {
      childList: true,
      subtree: false
    });

    loadUser().then(loadCommunities);

    window.addEventListener('community-updated', event => {
      if (Array.isArray(event.detail)) {
        communities = event.detail;
        syncCommunityButtons();
      }
    });

    window.addEventListener('auth-updated', event => {
      currentUser = event.detail;
      loadCommunities();
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeChat();
    });
  }


  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      start,
      { once: true }
    );
  } else {
    start();
  }

})();
