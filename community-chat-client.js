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
      padding: 7px 10px;
      border: 1px solid rgba(55,204,231,.25);
      border-radius: 9px;
      color: #b9f2fa;
      background: rgba(55,204,231,.08);
      font-size: 9px;
      font-weight: 800;
    }

    .community-chat-button:disabled {
      cursor: not-allowed;
      opacity: .42;
    }

    .community-chat-panel {
      margin-top: 22px;
      padding: 20px;
      border: 1px solid rgba(155,123,255,.2);
      border-radius: 20px;
      background: linear-gradient(
        145deg,
        rgba(139,92,246,.08),
        rgba(55,204,231,.025)
      ), #101019;
    }

    .community-chat-panel[hidden] {
      display: none !important;
    }

    .community-chat-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 15px;
      padding-bottom: 14px;
      border-bottom: 1px solid rgba(255,255,255,.09);
    }

    .community-chat-header h3 {
      margin-top: 5px;
      color: #f7f6fd;
      font-size: 17px;
    }

    .community-chat-header p {
      margin-top: 5px;
      color: #9a98ad;
      font-size: 10px;
    }

    .community-chat-close {
      width: 34px;
      height: 34px;
      border: 1px solid rgba(255,255,255,.09);
      border-radius: 10px;
      color: #f7f6fd;
      background: rgba(255,255,255,.04);
      font-size: 22px;
    }

    .community-chat-messages {
      display: flex;
      flex-direction: column;
      gap: 12px;
      min-height: 180px;
      max-height: 390px;
      padding: 16px 3px;
      overflow-y: auto;
    }

    .community-chat-empty {
      margin: auto;
      color: #9a98ad;
      font-size: 11px;
      text-align: center;
    }

    .community-message-row {
      align-self: flex-start;
      max-width: min(80%, 620px);
    }

    .community-message-row.mine {
      align-self: flex-end;
    }

    .community-message-meta {
      display: flex;
      align-items: center;
      gap: 9px;
      margin: 0 4px 5px;
      color: #9a98ad;
      font-size: 9px;
    }

    .community-message-meta strong {
      color: #c9c2da;
    }

    .community-message-row.mine .community-message-meta {
      justify-content: flex-end;
    }

    .community-message-bubble {
      padding: 10px 13px;
      border: 1px solid rgba(255,255,255,.08);
      border-radius: 13px 13px 13px 4px;
      color: #e8e4f2;
      background: rgba(255,255,255,.045);
      font-size: 11px;
      line-height: 1.65;
      overflow-wrap: anywhere;
      white-space: pre-wrap;
    }

    .community-message-row.mine .community-message-bubble {
      border-color: rgba(155,123,255,.25);
      border-radius: 13px 13px 4px 13px;
      background: rgba(139,92,246,.15);
    }

    .community-chat-composer {
      display: flex;
      gap: 9px;
      padding: 8px;
      border: 1px solid rgba(155,123,255,.2);
      border-radius: 13px;
      background: rgba(255,255,255,.035);
    }

    .community-chat-composer input {
      flex: 1;
      min-width: 0;
      border: 0;
      outline: 0;
      color: #f7f6fd;
      background: transparent;
      font: inherit;
      font-size: 11px;
    }

    .community-chat-composer button {
      width: 36px;
      height: 34px;
      border: 0;
      border-radius: 9px;
      color: white;
      background: #8056f3;
      font-size: 15px;
    }

    .community-chat-note {
      margin-top: 9px;
      color: #737187;
      font-size: 9px;
    }

    @media(max-width:650px) {
      .community-card-actions {
        justify-content: flex-start;
      }

      .community-chat-panel {
        padding: 14px;
      }

      .community-message-row {
        max-width: 94%;
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

    const heading = document.createElement('div');

    const eyebrow = document.createElement('span');

    eyebrow.className = 'section-eyebrow';
    eyebrow.textContent = 'COMMUNITY GROUP CHAT';

    const title = document.createElement('h3');

    title.id = 'communityChatTitle';
    title.textContent = 'Group chat';

    const subtitle = document.createElement('p');

    subtitle.id = 'communityChatSubtitle';
    subtitle.textContent = 'Only joined members can read and send messages.';

    heading.append(eyebrow, title, subtitle);


    const close = document.createElement('button');

    close.type = 'button';
    close.className = 'community-chat-close';
    close.textContent = '×';
    close.setAttribute('aria-label', 'Close group chat');
    close.addEventListener('click', closeChat);

    header.append(heading, close);


    const messages = document.createElement('div');

    messages.id = 'communityChatMessages';
    messages.className = 'community-chat-messages';
    messages.setAttribute('aria-live', 'polite');


    const form = document.createElement('form');

    form.id = 'communityChatForm';
    form.className = 'community-chat-composer';

    const input = document.createElement('input');

    input.id = 'communityChatInput';
    input.type = 'text';
    input.maxLength = 2000;
    input.placeholder = 'Message your community...';
    input.autocomplete = 'off';
    input.required = true;
    input.setAttribute('aria-label', 'Write a group message');

    const send = document.createElement('button');

    send.type = 'submit';
    send.textContent = '➤';
    send.setAttribute('aria-label', 'Send group message');

    form.append(input, send);
    form.addEventListener('submit', sendMessage);


    const note = document.createElement('p');

    note.className = 'community-chat-note';
    note.textContent = 'Messages are saved in the SkillMate database.';

    panel.append(header, messages, form, note);

    grid.insertAdjacentElement('afterend', panel);

    return panel;
  }


  function syncCommunityButtons() {
    const grid = $('#communitiesGrid');

    if (!grid) return;

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

      button.textContent = community.is_member
        ? 'Open group chat'
        : 'Join to chat';

      button.disabled = !community.is_member;

      button.onclick = () => openChat(community.id);


      if (
        !community.is_member &&
        Number(activeCommunityId) === Number(community.id)
      ) {
        closeChat();
      }
    });
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

    const community = communities.find(
      item => Number(item.id) === Number(communityId)
    );

    if (!community || !community.is_member) {
      toast('Join this community to access its group chat.');
      return;
    }

    if (activeCommunityId && socket) {
      socket.emit('community:leave', activeCommunityId);
    }

    activeCommunityId = Number(community.id);

    const panel = ensurePanel();

    if (!panel) return;

    $('#communityChatTitle').textContent =
      `${community.emoji || '✦'} ${community.name}`;

    $('#communityChatSubtitle').textContent =
      `${community.member_count || 0} members · ${community.topic}`;

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

      const messages = Array.isArray(result.messages)
        ? result.messages
        : [];

      if (!messages.length) {
        const empty = document.createElement('p');

        empty.className = 'community-chat-empty';

        empty.textContent = 'No messages yet. Start the conversation!';

        list.appendChild(empty);

        return;
      }

      messages.forEach(message => {
        const mine =
          Number(message.user_id) === Number(currentUser?.id);

        const row = document.createElement('article');

        row.className =
          `community-message-row${mine ? ' mine' : ''}`;

        const meta = document.createElement('div');

        meta.className = 'community-message-meta';

        const sender = document.createElement('strong');

        sender.textContent = mine
          ? 'You'
          : (message.sender_name || 'Member');

        const time = document.createElement('time');

        time.textContent = timeLabel(message.created_at);

        meta.append(sender, time);

        const body = document.createElement('p');

        body.className = 'community-message-bubble';
        body.textContent = message.body;

        row.append(meta, body);

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
      subtree: true
    });

    loadUser().then(loadCommunities);

    window.setInterval(loadCommunities, 5000);

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
