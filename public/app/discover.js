(() => {
  'use strict';

  const VIBE_SKILL_MAP = {
    tech: ['ai', 'python', 'web development', 'web dev', 'cybersecurity', 'data science', 'coding', 'tech', 'app dev', 'ml', 'react', 'node', 'javascript', 'robotics', 'iot', 'cloud'],
    design: ['ui/ux', 'ui', 'ux', 'design', 'photography', 'video', 'art', 'graphics', 'figma', 'product'],
    music: ['music', 'singing', 'guitar', 'piano', 'audio', 'production', 'dj']
  };

  const ICEBREAKER_CHIPS = [
    "Let's collab on a project 🚀",
    'Want to learn from you! 💡',
    "Let's swap skills 🔄",
    'Just connecting 👋'
  ];

  const FILTER_SKILL_OPTIONS = [
    'AI', 'Python', 'Web Development', 'Design', 'Startups',
    'Cybersecurity', 'Data Science', 'Music', 'Photography', 'App Dev'
  ];

  const PAGE_SIZE = 6;

  const state = {
    viewMode: 'feed', // 'feed' | 'deck'
    vibe: 'top',
    search: '',
    filters: {
      city: '',
      skills: new Set(),
      onlineOnly: false,
      collabOnly: false,
      minMatch: 0
    },
    visibleCount: PAGE_SIZE,
    deckIndex: 0,
    isLoading: false,
    optimisticSent: new Set(),
    icebreakerTarget: null,
    selectedIntent: ICEBREAKER_CHIPS[0]
  };

  let searchTimer = null;
  let observer = null;
  let sheetsMounted = false;

  const $ = (sel, root = document) => root.querySelector(sel);

  function haptic(ms = 12) {
    try {
      if (navigator.vibrate) navigator.vibrate(ms);
    } catch (_) {}
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text == null ? '' : String(text);
    return div.innerHTML;
  }

  function getBridge() {
    return typeof window.getDiscoverBridgeState === 'function' ? window.getDiscoverBridgeState() : {};
  }

  function getCurrentUser() {
    return getBridge().currentUser || null;
  }

  function getConnectionsMap() {
    return getBridge().connectionsByUserId || new Map();
  }

  function getRawProfiles() {
    if (typeof window.allDisplayProfiles === 'function') {
      return window.allDisplayProfiles();
    }
    return [];
  }

  function cleanText(text) {
    return String(text || '')
      .replace(/â€¢|Â·/g, '•')
      .replace(/\uFFFD+/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function splitCity(bio) {
    const cleaned = cleanText(bio);
    const parts = cleaned.split(/•|\|/).map(s => s.trim()).filter(Boolean);
    return {
      role: parts[0] || '',
      city: parts[1] || ''
    };
  }

  function formatUsername(raw) {
    const base = String(raw.username || raw.name || 'member')
      .replace(/^@+/, '')
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '')
      .slice(0, 16) || 'member';
    return `@${base}`;
  }

  function hashSeed(input) {
    const s = String(input || 'sm');
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h;
  }

  // Gracefully derive missing matchmaking fields from existing user schema
  function enrichProfile(raw) {
    const { role, city } = splitCity(raw.bio);
    const interests = Array.isArray(raw.interests) ? raw.interests.filter(Boolean) : [];
    const seed = hashSeed(raw.id || raw.name);

    const me = getCurrentUser();
    const myInterests = new Set((me?.interests || []).map(x => String(x).toLowerCase()));
    const matchInfo = typeof window.getMatch === 'function' ? window.getMatch(raw) : { score: 0, shared: [] };

    let matchPercentage = Number(raw.matchPercentage || 0);
    if (!matchPercentage) {
      if (matchInfo.score > 0) {
        matchPercentage = Math.min(98, Math.max(64, 58 + matchInfo.score * 11));
      } else if (interests.length > 0) {
        matchPercentage = 55 + (seed % 34); // 55% - 88%
      } else {
        matchPercentage = 52 + (seed % 20);
      }
    }

    const teach = Array.isArray(raw.skillsToTeach) && raw.skillsToTeach.length
      ? raw.skillsToTeach
      : interests.slice(0, 2);

    const learn = Array.isArray(raw.skillsToLearn) && raw.skillsToLearn.length
      ? raw.skillsToLearn
      : interests.slice(2, 4);

    const collab = interests.slice(4, 5);

    const statusOptions = [
      'Building a full-stack side project',
      'Looking for a hackathon teammate',
      'Exploring AI agents & product design',
      'Open to weekend skill-swap sessions'
    ];
    const currentlyInto = cleanText(raw.currentlyInto || role || statusOptions[seed % statusOptions.length]);
    const username = formatUsername(raw);
    const location = cleanText(raw.city || city || 'Remote') || 'Remote';
    const cleanBio = cleanText(raw.bio || '');
    const isOnline = typeof raw.isOnline === 'boolean' ? raw.isOnline : (seed % 3 !== 0);
    const openToCollab = typeof raw.openToCollab === 'boolean' ? raw.openToCollab : (seed % 4 !== 0);

    // Complementary swap score: they can teach something the current user wants or hasn't mastered yet
    const swapSkill = teach.find(t => !myInterests.has(t.toLowerCase())) || teach[0] || interests[0] || 'Skill Swap';

    return {
      ...raw,
      bio: cleanBio,
      username,
      location,
      currentlyInto,
      matchPercentage,
      sharedCount: (matchInfo.shared || []).length,
      skillsToTeach: teach,
      skillsToLearn: learn,
      skillsCollab: collab,
      allSkills: interests,
      isOnline,
      openToCollab,
      swapSkill
    };
  }

  function getConnectionStatus(profile) {
    const idKey = String(profile.id);
    if (state.optimisticSent.has(idKey)) return 'pending';
    const rel = getConnectionsMap().get(Number(profile.id));
    if (rel?.status === 'accepted') return 'accepted';
    if (rel?.status === 'pending') return 'pending';
    const demoSet = getBridge().requestedDemoProfiles;
    if (demoSet?.has?.(idKey)) {
      return 'pending';
    }
    return 'none';
  }

  function getFilteredProfiles() {
    const me = getCurrentUser();
    const myCity = splitCity(me?.bio).city.toLowerCase();
    const q = state.search.trim().toLowerCase();
    const qBare = q.replace(/^@+/, '');

    let list = getRawProfiles()
      .filter(p => !me || Number(p.id) !== Number(me.id))
      .map(enrichProfile);

    // Exclude already-connected users from default feed unless user explicitly searches their exact name/username
    list = list.filter(p => {
      if (getConnectionStatus(p) !== 'accepted') return true;
      if (!q) return false;
      const pName = String(p.name || '').trim().toLowerCase();
      const pUser = String(p.username || '').replace(/^@+/, '').trim().toLowerCase();
      return pName === q || pUser === qBare;
    });

    if (q) {
      list = list.filter(p => {
        const bareHandle = String(p.username || '').replace(/^@+/, '');
        const hay = `${p.name} ${p.username} ${bareHandle} ${p.location} ${p.bio} ${p.currentlyInto} ${p.allSkills.join(' ')}`.toLowerCase();
        return hay.includes(q);
      });
    }

    if (state.vibe === 'top') {
      const sortedTop = [...list].sort((a, b) => b.matchPercentage - a.matchPercentage || String(a.name).localeCompare(String(b.name)));
      const strongMatches = sortedTop.filter(p => p.matchPercentage >= 60);
      list = strongMatches.length >= 3 ? strongMatches : sortedTop;
    } else if (state.vibe === 'online') {
      list = list.filter(p => p.isOnline);
    } else if (state.vibe === 'nearby') {
      list = list.filter(p => myCity ? p.location.toLowerCase().includes(myCity) : p.location !== 'Remote');
    } else if (VIBE_SKILL_MAP[state.vibe]) {
      const keys = VIBE_SKILL_MAP[state.vibe];
      list = list.filter(p => p.allSkills.some(s => keys.some(k => s.toLowerCase().includes(k) || k.includes(s.toLowerCase()))));
    }

    if (state.filters.city.trim()) {
      const c = state.filters.city.trim().toLowerCase();
      list = list.filter(p => p.location.toLowerCase().includes(c));
    }
    if (state.filters.skills.size > 0) {
      const wanted = [...state.filters.skills].map(s => s.toLowerCase());
      list = list.filter(p => p.allSkills.some(s => wanted.some(w => s.toLowerCase().includes(w) || w.includes(s.toLowerCase()))));
    }
    if (state.filters.minMatch > 0) {
      list = list.filter(p => p.matchPercentage >= state.filters.minMatch);
    }
    if (state.filters.onlineOnly) {
      list = list.filter(p => p.isOnline);
    }
    if (state.filters.collabOnly) {
      list = list.filter(p => p.openToCollab);
    }

    list.sort((a, b) => b.matchPercentage - a.matchPercentage || String(a.name).localeCompare(String(b.name)));
    return list;
  }

  // Sub-component 1: DiscoverSkeleton
  function renderSkeleton(container, count = 4) {
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const sk = document.createElement('div');
      sk.className = 'disc-bento-card disc-skeleton-card';
      sk.innerHTML = `
        <div class="disc-sk-row">
          <div class="disc-sk-circle"></div>
          <div class="disc-sk-lines"><div class="disc-sk-line w60"></div><div class="disc-sk-line w40"></div></div>
        </div>
        <div class="disc-sk-line w90"></div>
        <div class="disc-sk-pills"><span class="disc-sk-pill"></span><span class="disc-sk-pill"></span><span class="disc-sk-pill"></span></div>
        <div class="disc-sk-btn"></div>
      `;
      container.appendChild(sk);
    }
  }

  // Sub-component 2: Compact High-Density SkillCard
  function createSkillCard(profile) {
    const card = document.createElement('article');
    card.className = 'disc-bento-card';
    card.dataset.userId = String(profile.id);

    const status = getConnectionStatus(profile);
    const initials = (profile.name || 'M').trim().slice(0, 2).toUpperCase();
    const avatarHtml = profile.avatar_url
      ? `<img src="${escapeHtml(profile.avatar_url)}" alt="${escapeHtml(profile.name)}">`
      : `<span>${escapeHtml(initials)}</span>`;

    // Max 3-4 compact micro skill pills + overflow
    const pills = [];
    profile.skillsToTeach.forEach(s => pills.push({ label: s, cls: 'teach', prefix: 'Pro' }));
    profile.skillsToLearn.forEach(s => pills.push({ label: s, cls: 'learn', prefix: 'Learning' }));
    profile.skillsCollab.forEach(s => pills.push({ label: s, cls: 'collab', prefix: 'Collab' }));

    const maxPills = 3;
    const shown = pills.slice(0, maxPills);
    const overflow = Math.max(0, profile.allSkills.length - shown.length);

    const pillsHtml = shown.map(p =>
      `<span class="disc-skill-pill ${p.cls}" title="${p.prefix}">${escapeHtml(p.label)}</span>`
    ).join('') + (overflow > 0 ? `<span class="disc-skill-pill overflow">+${overflow}</span>` : '');

    let ctaLabel = '+ Connect';
    let ctaClass = 'disc-connect-pill';
    let ctaDisabled = false;
    if (status === 'pending') {
      ctaLabel = 'Sent ✓';
      ctaClass += ' sent';
      ctaDisabled = true;
    } else if (status === 'accepted') {
      ctaLabel = 'Connected';
      ctaClass += ' connected';
      ctaDisabled = true;
    }

    card.innerHTML = `
      <div class="disc-card-top">
        <div class="disc-user-id">
          <div class="disc-avatar-wrap">
            <div class="disc-avatar">${avatarHtml}</div>
            ${profile.isOnline ? '<span class="disc-online-dot" title="Online now"></span>' : ''}
          </div>
          <div class="disc-user-meta">
            <div class="disc-name-line">
              <h3>${escapeHtml(profile.name)}</h3>
              <span class="disc-match-inline">${profile.matchPercentage}%</span>
            </div>
            <div class="disc-handle-line">${escapeHtml(profile.username)} • 📍 ${escapeHtml(profile.location)}</div>
          </div>
        </div>
        <button type="button" class="${ctaClass}" ${ctaDisabled ? 'disabled' : ''}>${ctaLabel}</button>
      </div>

      <p class="disc-compact-bio">${escapeHtml(profile.currentlyInto || profile.bio || 'Open to collaborate and swap skills')}</p>

      <div class="disc-skills-row">${pillsHtml || '<span class="disc-skill-pill collab">Open to Collab</span>'}</div>
    `;

    card.querySelector('.disc-connect-pill')?.addEventListener('click', e => {
      e.stopPropagation();
      haptic(14);
      openIcebreaker(profile);
    });

    card.addEventListener('click', e => {
      if (e.target.closest('button')) return;
      openProfileSheet(profile);
    });

    return card;
  }

  // Sub-component 3: PerfectSwaps Story-Style Strip
  function renderPerfectSwaps(allProfiles) {
    const section = $('#discSwapsSection');
    const carousel = $('#discSwapsCarousel');
    if (!section || !carousel) return;

    const showSwaps = state.viewMode === 'feed' && !state.search.trim() && state.vibe === 'top';
    section.hidden = !showSwaps;
    if (!showSwaps) return;

    const swaps = allProfiles
      .filter(p => getConnectionStatus(p) === 'none')
      .slice(0, 6);

    if (swaps.length === 0) {
      section.hidden = true;
      return;
    }

    carousel.innerHTML = '';
    swaps.forEach(p => {
      const story = document.createElement('div');
      story.className = 'disc-swap-story';
      const firstName = (p.name || 'Member').trim().split(/\s+/)[0];
      const initials = (p.name || 'M').trim().slice(0, 2).toUpperCase();
      const avatar = p.avatar_url
        ? `<img src="${escapeHtml(p.avatar_url)}" alt="">`
        : `<span>${escapeHtml(initials)}</span>`;
      story.innerHTML = `
        <div class="disc-story-ring-wrap">
          <div class="disc-story-avatar">${avatar}</div>
          <button type="button" class="disc-story-plus" aria-label="Connect with ${escapeHtml(p.name)}">+</button>
        </div>
        <span class="disc-story-name">${escapeHtml(firstName)}</span>
        <span class="disc-story-skill">${escapeHtml(p.swapSkill)}</span>
      `;
      story.querySelector('.disc-story-plus')?.addEventListener('click', e => {
        e.stopPropagation();
        haptic(14);
        openIcebreaker(p);
      });
      story.addEventListener('click', e => {
        if (!e.target.closest('button')) openProfileSheet(p);
      });
      carousel.appendChild(story);
    });
  }

  // Sub-component 4: SwipeDeck
  function renderSwipeDeck(profiles) {
    const stage = $('#discDeckStage');
    const actions = $('#discDeckActions');
    if (!stage) return;

    if (state.deckIndex >= profiles.length) {
      state.deckIndex = 0;
    }

    const remaining = profiles.slice(state.deckIndex, state.deckIndex + 3);
    stage.innerHTML = '';
    if (actions) actions.hidden = remaining.length === 0;

    if (remaining.length === 0) return;

    // Render back-to-front so top card is last child
    [...remaining].reverse().forEach((profile, revIdx) => {
      const depth = remaining.length - 1 - revIdx;
      const card = createSkillCard(profile);
      card.classList.add('disc-deck-card');
      card.style.transform = `translateY(${depth * 8}px) scale(${1 - depth * 0.03})`;
      card.style.opacity = String(1 - depth * 0.16);
      card.style.zIndex = String(10 - depth);

      if (depth === 0) {
        const stamps = document.createElement('div');
        stamps.className = 'disc-deck-stamps';
        stamps.innerHTML = `<span class="disc-stamp like">CONNECT</span><span class="disc-stamp nope">SKIP</span>`;
        card.prepend(stamps);
        attachSwipeGesture(card, profile);
      }
      stage.appendChild(card);
    });
  }

  function attachSwipeGesture(card, profile) {
    let startX = 0;
    let startY = 0;
    let dx = 0;
    let dragging = false;
    const likeStamp = card.querySelector('.disc-stamp.like');
    const nopeStamp = card.querySelector('.disc-stamp.nope');

    const onDown = e => {
      if (e.target.closest('button')) return;
      dragging = true;
      const pt = e.touches ? e.touches[0] : e;
      startX = pt.clientX;
      startY = pt.clientY;
      card.style.transition = 'none';
    };

    const onMove = e => {
      if (!dragging) return;
      const pt = e.touches ? e.touches[0] : e;
      dx = pt.clientX - startX;
      const dy = (pt.clientY - startY) * 0.25;
      const rot = dx * 0.05;
      card.style.transform = `translate3d(${dx}px, ${dy}px, 0) rotate(${rot}deg)`;
      const pct = Math.min(1, Math.abs(dx) / 95);
      if (likeStamp) likeStamp.style.opacity = dx > 12 ? String(pct) : '0';
      if (nopeStamp) nopeStamp.style.opacity = dx < -12 ? String(pct) : '0';
    };

    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      card.style.transition = 'transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.24s ease';
      if (dx > 90) {
        haptic(18);
        card.style.transform = 'translate3d(130%, 20px, 0) rotate(14deg)';
        card.style.opacity = '0';
        setTimeout(() => {
          state.deckIndex += 1;
          openIcebreaker(profile);
          DiscoverScreen.render();
        }, 180);
      } else if (dx < -90) {
        haptic(10);
        card.style.transform = 'translate3d(-130%, 20px, 0) rotate(-14deg)';
        card.style.opacity = '0';
        setTimeout(() => {
          state.deckIndex += 1;
          DiscoverScreen.render();
        }, 180);
      } else {
        card.style.transform = 'translate3d(0, 0, 0) rotate(0deg)';
        if (likeStamp) likeStamp.style.opacity = '0';
        if (nopeStamp) nopeStamp.style.opacity = '0';
      }
      dx = 0;
    };

    card.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
  }

  // Sub-component 5: Mount Bottom Sheets (Icebreaker, FilterSheet, ProfileSheet)
  function ensureSheetsMounted() {
    if (sheetsMounted) return;
    sheetsMounted = true;

    const host = document.createElement('div');
    host.id = 'discoverSheetsHost';
    host.innerHTML = `
      <!-- Icebreaker Bottom Sheet Portal -->
      <div class="disc-sheet-overlay" id="discIcebreakerOverlay">
        <div class="disc-sheet-panel" id="discIcebreakerSheet" role="dialog" aria-modal="true" aria-label="Send connection icebreaker">
          <div class="disc-sheet-handle"></div>
          <div class="disc-sheet-head">
            <div>
              <h3>Break the ice</h3>
              <p id="discIceTargetText">Pick a quick intro or write a short note</p>
            </div>
            <button type="button" class="disc-sheet-close" id="discIceCloseBtn" aria-label="Close">✕</button>
          </div>
          <div class="disc-ice-chips" id="discIceChips">
            ${ICEBREAKER_CHIPS.map((c, i) => `<button type="button" class="disc-ice-chip ${i === 0 ? 'active' : ''}" data-intent="${escapeHtml(c)}">${escapeHtml(c)}</button>`).join('')}
          </div>
          <input type="text" class="disc-ice-input" id="discIceNoteInput" maxlength="140" placeholder="Optional 1-line note (e.g. Saw your React work!)">
          <button type="button" class="disc-btn-primary full" id="discIceSendBtn">Send Request</button>
        </div>
      </div>

      <!-- Filter Bottom Sheet Portal -->
      <div class="disc-sheet-overlay" id="discFilterOverlay">
        <div class="disc-sheet-panel" id="discFilterSheet" role="dialog" aria-modal="true" aria-label="Discover filters">
          <div class="disc-sheet-handle"></div>
          <div class="disc-sheet-head">
            <div>
              <h3>Filter Matches</h3>
              <p>Dial in location, skills, and availability</p>
            </div>
            <button type="button" class="disc-sheet-close" id="discFilterCloseBtn" aria-label="Close">✕</button>
          </div>

          <label class="disc-field-label" for="discFilterCityInput">Location / City</label>
          <input type="text" class="disc-ice-input" id="discFilterCityInput" placeholder="e.g. Raipur, Bengaluru, Remote">

          <span class="disc-field-label">Skills &amp; Interests</span>
          <div class="disc-filter-skills" id="discFilterSkills">
            ${FILTER_SKILL_OPTIONS.map(s => `<button type="button" class="disc-filter-tag" data-skill="${escapeHtml(s)}">${escapeHtml(s)}</button>`).join('')}
          </div>

          <span class="disc-field-label">Minimum Match %</span>
          <div class="disc-filter-toggles" id="discFilterMinMatch">
            <button type="button" class="disc-match-opt active" data-min="0">Any</button>
            <button type="button" class="disc-match-opt" data-min="50">50%+</button>
            <button type="button" class="disc-match-opt" data-min="70">70%+</button>
            <button type="button" class="disc-match-opt" data-min="85">85%+</button>
          </div>

          <span class="disc-field-label">Availability</span>
          <div class="disc-filter-toggles">
            <button type="button" class="disc-avail-btn" id="discToggleOnline">⚡ Online Now</button>
            <button type="button" class="disc-avail-btn" id="discToggleCollab">Open to Collab</button>
          </div>

          <div class="disc-sheet-actions">
            <button type="button" class="disc-btn-ghost" id="discFilterResetBtn">Reset</button>
            <button type="button" class="disc-btn-primary" id="discFilterApplyBtn">Apply Filters</button>
          </div>
        </div>
      </div>

      <!-- Profile Detail Sheet Portal -->
      <div class="disc-sheet-overlay" id="discProfileOverlay">
        <div class="disc-sheet-panel" id="discProfileSheet" role="dialog" aria-modal="true" aria-label="Member profile">
          <div class="disc-sheet-handle"></div>
          <div class="disc-sheet-head" style="justify-content:flex-end;margin-bottom:-4px;">
            <button type="button" class="disc-sheet-close" id="discProfileCloseBtn" aria-label="Close">✕</button>
          </div>
          <div id="discProfileSheetBody"></div>
        </div>
      </div>
    `;
    document.body.appendChild(host);

    // Wire Icebreaker events
    $('#discIceCloseBtn')?.addEventListener('click', closeIcebreaker);
    $('#discIcebreakerOverlay')?.addEventListener('click', e => {
      if (e.target === e.currentTarget) closeIcebreaker();
    });
    $('#discIceChips')?.addEventListener('click', e => {
      const chip = e.target.closest('.disc-ice-chip');
      if (!chip) return;
      haptic(8);
      state.selectedIntent = chip.dataset.intent || ICEBREAKER_CHIPS[0];
      host.querySelectorAll('.disc-ice-chip').forEach(el => el.classList.toggle('active', el === chip));
    });
    $('#discIceSendBtn')?.addEventListener('click', submitIcebreakerRequest);

    // Wire Filter Sheet events
    $('#discFilterCloseBtn')?.addEventListener('click', closeFilterSheet);
    $('#discFilterOverlay')?.addEventListener('click', e => {
      if (e.target === e.currentTarget) closeFilterSheet();
    });
    $('#discFilterSkills')?.addEventListener('click', e => {
      const btn = e.target.closest('.disc-filter-tag');
      if (!btn) return;
      btn.classList.toggle('active');
    });
    $('#discFilterMinMatch')?.addEventListener('click', e => {
      const opt = e.target.closest('.disc-match-opt');
      if (!opt) return;
      host.querySelectorAll('#discFilterMinMatch .disc-match-opt').forEach(el => el.classList.toggle('active', el === opt));
    });
    $('#discToggleOnline')?.addEventListener('click', e => e.currentTarget.classList.toggle('active'));
    $('#discToggleCollab')?.addEventListener('click', e => e.currentTarget.classList.toggle('active'));
    $('#discFilterResetBtn')?.addEventListener('click', () => {
      $('#discFilterCityInput').value = '';
      host.querySelectorAll('.disc-filter-tag, .disc-avail-btn').forEach(el => el.classList.remove('active'));
      host.querySelectorAll('#discFilterMinMatch .disc-match-opt').forEach((el, idx) => el.classList.toggle('active', idx === 0));
      state.filters = { city: '', skills: new Set(), onlineOnly: false, collabOnly: false, minMatch: 0 };
      state.visibleCount = PAGE_SIZE;
      state.deckIndex = 0;
      updateFilterBadge();
      closeFilterSheet();
      DiscoverScreen.render();
    });
    $('#discFilterApplyBtn')?.addEventListener('click', () => {
      state.filters.city = $('#discFilterCityInput')?.value || '';
      state.filters.skills = new Set(
        [...host.querySelectorAll('.disc-filter-tag.active')].map(el => el.dataset.skill)
      );
      const activeMin = host.querySelector('#discFilterMinMatch .disc-match-opt.active');
      state.filters.minMatch = Number(activeMin?.dataset.min || 0);
      state.filters.onlineOnly = $('#discToggleOnline')?.classList.contains('active') || false;
      state.filters.collabOnly = $('#discToggleCollab')?.classList.contains('active') || false;
      state.visibleCount = PAGE_SIZE;
      state.deckIndex = 0;
      updateFilterBadge();
      closeFilterSheet();
      DiscoverScreen.render();
    });

    // Wire Profile Sheet close & backdrop
    $('#discProfileCloseBtn')?.addEventListener('click', closeProfileSheet);
    $('#discProfileOverlay')?.addEventListener('click', e => {
      if (e.target === e.currentTarget) closeProfileSheet();
    });
  }

  function openIcebreaker(profile) {
    const me = getCurrentUser();
    if (!me) {
      if (typeof window.showToast === 'function') window.showToast('Log in to send a connection request.');
      if (typeof window.openModal === 'function') window.openModal('login');
      return;
    }
    ensureSheetsMounted();
    state.icebreakerTarget = profile;
    state.selectedIntent = ICEBREAKER_CHIPS[0];
    $('#discIceTargetText').textContent = `Connect with ${profile.name} (${profile.username})`;
    $('#discIceNoteInput').value = '';
    document.querySelectorAll('#discIceChips .disc-ice-chip').forEach((el, idx) => el.classList.toggle('active', idx === 0));
    $('#discIcebreakerOverlay')?.classList.add('open');
  }

  function closeIcebreaker() {
    $('#discIcebreakerOverlay')?.classList.remove('open');
  }

  async function submitIcebreakerRequest() {
    const profile = state.icebreakerTarget;
    if (!profile) return;
    const customNote = ($('#discIceNoteInput')?.value || '').trim();
    const note = customNote || state.selectedIntent;

    // 1. Optimistic UI update immediately
    state.optimisticSent.add(String(profile.id));
    haptic(16);
    closeIcebreaker();
    DiscoverScreen.render();

    // Handle preview/demo profiles locally and persist in localStorage
    if (!Number.isFinite(Number(profile.id)) || profile.isDemo || String(profile.id).startsWith('preview-')) {
      const demoSet = getBridge().requestedDemoProfiles;
      if (demoSet) {
        demoSet.add(String(profile.id));
        try {
          localStorage.setItem('skillmate_demo_requests', JSON.stringify([...demoSet]));
        } catch (_) {}
      }
      if (typeof window.showToast === 'function') window.showToast(`Request sent to ${profile.name}: "${note}"`);
      return;
    }

    // 2. Persist to existing backend API
    try {
      const api = window.apiRequest || ((url, opts) => fetch(url, {
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', ...(opts?.headers || {}) },
        ...opts
      }).then(async r => {
        const d = await r.json().catch(() => ({}));
        if (!r.ok) { const e = new Error(d.error || `HTTP ${r.status}`); e.status = r.status; throw e; }
        return d;
      }));
      const result = await api(`/api/connections/request/${profile.id}`, {
        method: 'POST',
        body: JSON.stringify({ note })
      });
      if (typeof window.loadConnections === 'function') await window.loadConnections();
      if (typeof window.showToast === 'function') {
        window.showToast(result?.auto_accepted ? `Connected with ${profile.name}!` : `Request sent to ${profile.name}`);
      }
      DiscoverScreen.render();
    } catch (err) {
      if (err && err.status === 409) {
        // Already requested or already connected — sync state instead of rolling back
        if (typeof window.loadConnections === 'function') await window.loadConnections();
        if (typeof window.showToast === 'function') window.showToast(err.message || 'Request already sent.');
        DiscoverScreen.render();
        return;
      }
      state.optimisticSent.delete(String(profile.id));
      DiscoverScreen.render();
      if (typeof window.showToast === 'function') window.showToast(err.message || 'Could not send request.');
    }
  }

  function openFilterSheet() {
    ensureSheetsMounted();
    $('#discFilterCityInput').value = state.filters.city;
    document.querySelectorAll('#discFilterSkills .disc-filter-tag').forEach(el => {
      el.classList.toggle('active', state.filters.skills.has(el.dataset.skill));
    });
    document.querySelectorAll('#discFilterMinMatch .disc-match-opt').forEach(el => {
      el.classList.toggle('active', Number(el.dataset.min || 0) === state.filters.minMatch);
    });
    $('#discToggleOnline')?.classList.toggle('active', state.filters.onlineOnly);
    $('#discToggleCollab')?.classList.toggle('active', state.filters.collabOnly);
    $('#discFilterOverlay')?.classList.add('open');
  }

  function closeFilterSheet() {
    $('#discFilterOverlay')?.classList.remove('open');
  }

  function updateFilterBadge() {
    const badge = $('#discFilterBadge');
    if (!badge) return;
    let count = state.filters.skills.size;
    if (state.filters.city.trim()) count++;
    if (state.filters.minMatch > 0) count++;
    if (state.filters.onlineOnly) count++;
    if (state.filters.collabOnly) count++;
    badge.textContent = String(count);
    badge.hidden = count === 0;
  }

  function openProfileSheet(profile) {
    ensureSheetsMounted();
    const body = $('#discProfileSheetBody');
    if (!body) return;
    const initials = (profile.name || 'M').trim().slice(0, 2).toUpperCase();
    const avatar = profile.avatar_url
      ? `<img src="${escapeHtml(profile.avatar_url)}" alt="">`
      : `<span>${escapeHtml(initials)}</span>`;
    const status = getConnectionStatus(profile);

    body.innerHTML = `
      <div class="disc-prof-hero">
        <div class="disc-avatar-wrap lg">
          <div class="disc-avatar lg">${avatar}</div>
          ${profile.isOnline ? '<span class="disc-online-dot"></span>' : ''}
        </div>
        <div class="disc-prof-copy">
          <h3>${escapeHtml(profile.name)}</h3>
          <p>${escapeHtml(profile.username)} · 📍 ${escapeHtml(profile.location)}</p>
          <span class="disc-match-badge">${profile.matchPercentage}% Match</span>
        </div>
      </div>
      <div class="disc-status-bar">${escapeHtml(profile.currentlyInto)}</div>
      <p class="disc-prof-bio">${escapeHtml(profile.bio || 'Building projects and swapping skills on SkillMate.')}</p>
      <div class="disc-skills-row">${profile.allSkills.map(s => `<span class="disc-skill-pill collab">${escapeHtml(s)}</span>`).join('')}</div>
      <div class="disc-sheet-actions">
        <button type="button" class="disc-btn-ghost message-btn" data-message-user-id="${escapeHtml(profile.id)}" data-message-user-name="${escapeHtml(profile.name)}" data-is-demo="${profile.isDemo ? '1' : '0'}">Message</button>
        <button type="button" class="disc-btn-primary" id="discProfConnectBtn" ${status !== 'none' ? 'disabled' : ''}>
          ${status === 'accepted' ? 'Connected' : status === 'pending' ? 'Request Sent ✓' : '+ Connect'}
        </button>
      </div>
    `;
    $('#discProfConnectBtn')?.addEventListener('click', () => {
      closeProfileSheet();
      openIcebreaker(profile);
    });
    $('#discProfileOverlay')?.classList.add('open');
  }

  function closeProfileSheet() {
    $('#discProfileOverlay')?.classList.remove('open');
  }

  function setupPullToRefresh() {
    const view = $('#view-discover');
    const indicator = $('#discPtrIndicator');
    if (!view || !indicator) return;
    let startY = 0;
    let pullDist = 0;
    let pulling = false;

    view.addEventListener('touchstart', e => {
      if (window.scrollY <= 2) {
        startY = e.touches[0].clientY;
        pullDist = 0;
        pulling = true;
      }
    }, { passive: true });

    view.addEventListener('touchmove', e => {
      if (!pulling) return;
      const dy = e.touches[0].clientY - startY;
      if (dy > 16 && window.scrollY <= 2) {
        pullDist = Math.min(72, dy * 0.45);
        indicator.classList.add('visible');
        indicator.style.transform = `translateY(${pullDist - 24}px)`;
        indicator.style.opacity = String(Math.min(1, pullDist / 40));
      }
    }, { passive: true });

    view.addEventListener('touchend', async () => {
      if (!pulling) return;
      pulling = false;
      if (pullDist >= 38) {
        haptic(12);
        indicator.classList.add('spinning');
        indicator.style.transform = 'translateY(12px)';
        indicator.style.opacity = '1';
        state.isLoading = true;
        DiscoverScreen.render();
        if (typeof window.refreshMembers === 'function') await window.refreshMembers();
        state.isLoading = false;
        indicator.classList.remove('spinning', 'visible');
        indicator.style.transform = '';
        indicator.style.opacity = '';
        DiscoverScreen.render();
      } else {
        indicator.classList.remove('visible');
        indicator.style.transform = '';
        indicator.style.opacity = '';
      }
    }, { passive: true });
  }

  function setupLoadMore() {
    $('#discLoadMoreBtn')?.addEventListener('click', () => {
      haptic(10);
      state.visibleCount += PAGE_SIZE;
      DiscoverScreen.renderFeedOnly();
    });
  }

  const DiscoverScreen = {
    init() {
      const searchInput = $('#search');
      const clearBtn = $('#discSearchClear');

      searchInput?.addEventListener('input', () => {
        if (clearBtn) clearBtn.hidden = !searchInput.value;
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
          state.search = searchInput.value || '';
          state.visibleCount = PAGE_SIZE;
          state.deckIndex = 0;
          this.render();
        }, 120);
      });

      clearBtn?.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        clearBtn.hidden = true;
        state.search = '';
        state.visibleCount = PAGE_SIZE;
        state.deckIndex = 0;
        this.render();
      });

      $('#discViewToggle')?.addEventListener('click', e => {
        const btn = e.target.closest('.disc-toggle-btn');
        if (!btn) return;
        haptic(10);
        state.viewMode = btn.dataset.mode === 'deck' ? 'deck' : 'feed';
        document.querySelectorAll('#discViewToggle .disc-toggle-btn').forEach(el => {
          const active = el === btn;
          el.classList.toggle('active', active);
          el.setAttribute('aria-selected', String(active));
        });
        this.render();
      });

      $('#discVibeChips')?.addEventListener('click', e => {
        const chip = e.target.closest('.disc-vibe-chip');
        if (!chip) return;
        haptic(8);
        state.vibe = chip.dataset.vibe || 'all';
        state.visibleCount = PAGE_SIZE;
        state.deckIndex = 0;
        document.querySelectorAll('#discVibeChips .disc-vibe-chip').forEach(el => {
          el.classList.toggle('active', el === chip);
        });
        this.render();
      });

      $('#discFilterTrigger')?.addEventListener('click', () => {
        haptic(10);
        openFilterSheet();
      });

      $('#discClearFiltersBtn')?.addEventListener('click', () => this.clearAll());

      $('#discDeckSkipBtn')?.addEventListener('click', () => {
        haptic(10);
        state.deckIndex += 1;
        this.render();
      });

      $('#discDeckConnectBtn')?.addEventListener('click', () => {
        const list = getFilteredProfiles();
        const current = list[state.deckIndex];
        if (current) {
          haptic(14);
          openIcebreaker(current);
        }
      });

      $('#discDeckInfoBtn')?.addEventListener('click', () => {
        const list = getFilteredProfiles();
        const current = list[state.deckIndex];
        if (current) openProfileSheet(current);
      });

      setupPullToRefresh();
      setupLoadMore();
      this.render();
    },

    clearAll() {
      const searchInput = $('#search');
      if (searchInput) searchInput.value = '';
      if ($('#discSearchClear')) $('#discSearchClear').hidden = true;
      state.search = '';
      state.vibe = 'top';
      state.filters = { city: '', skills: new Set(), onlineOnly: false, collabOnly: false, minMatch: 0 };
      state.visibleCount = PAGE_SIZE;
      state.deckIndex = 0;
      document.querySelectorAll('#discVibeChips .disc-vibe-chip').forEach(el => {
        el.classList.toggle('active', el.dataset.vibe === 'top');
      });
      updateFilterBadge();
      this.render();
    },

    setInterestFilter(interest) {
      const val = String(interest || '').trim();
      if (!val) return;
      state.filters.skills = new Set([val]);
      state.vibe = 'top';
      state.visibleCount = PAGE_SIZE;
      updateFilterBadge();
      this.render();
    },

    renderFeedOnly() {
      const grid = $('#people');
      if (!grid) return;
      const profiles = getFilteredProfiles();
      const visible = profiles.slice(0, state.visibleCount);
      grid.innerHTML = '';
      visible.forEach(p => grid.appendChild(createSkillCard(p)));
      const countEl = $('#profileCount');
      if (countEl) countEl.textContent = `Showing ${visible.length} of ${profiles.length} curated matches`;

      const loadWrap = $('#discLoadMoreWrap');
      const loadBtn = $('#discLoadMoreBtn');
      if (loadWrap && loadBtn) {
        const remaining = profiles.length - visible.length;
        loadWrap.hidden = remaining <= 0;
        if (remaining > 0) {
          loadBtn.textContent = `Load More Matches (${remaining} remaining)`;
        }
      }
    },

    render() {
      const feedWrap = $('#discFeedContainer');
      const deckWrap = $('#discDeckContainer');
      const emptyEl = $('#discEmptyState');
      const grid = $('#people');
      if (!grid) return;

      const allEnriched = getRawProfiles()
        .filter(p => !getCurrentUser() || Number(p.id) !== Number(getCurrentUser().id))
        .map(enrichProfile)
        .sort((a, b) => b.matchPercentage - a.matchPercentage);

      renderPerfectSwaps(allEnriched);

      if (state.isLoading) {
        if (feedWrap) feedWrap.hidden = false;
        if (deckWrap) deckWrap.hidden = true;
        if (emptyEl) emptyEl.hidden = true;
        renderSkeleton(grid, 4);
        return;
      }

      const profiles = getFilteredProfiles();
      const hasResults = profiles.length > 0;

      if (emptyEl) emptyEl.hidden = hasResults;
      if (!hasResults) {
        if (feedWrap) feedWrap.hidden = true;
        if (deckWrap) deckWrap.hidden = true;
        const sugWrap = $('#discSuggestedWrap');
        const sugGrid = $('#discSuggestedGrid');
        if (sugWrap && sugGrid && allEnriched.length > 0) {
          sugWrap.hidden = false;
          sugGrid.innerHTML = '';
          allEnriched.slice(0, 2).forEach(p => sugGrid.appendChild(createSkillCard(p)));
        }
        return;
      }

      if (state.viewMode === 'deck') {
        if (feedWrap) feedWrap.hidden = true;
        if (deckWrap) deckWrap.hidden = false;
        renderSwipeDeck(profiles);
      } else {
        if (deckWrap) deckWrap.hidden = true;
        if (feedWrap) feedWrap.hidden = false;
        this.renderFeedOnly();
      }
    }
  };

  window.DiscoverScreen = DiscoverScreen;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => DiscoverScreen.init());
  } else {
    DiscoverScreen.init();
  }
})();
