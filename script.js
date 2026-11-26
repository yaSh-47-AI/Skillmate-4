/* ==========================================================
   SKILLMATE — FRONTEND
   Demo profiles + API-backed users, connections and circles
========================================================== */

const API = "/api";
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];

const TOPICS = [
  "AI", "Python", "Web Development", "Startups", "Music", "Gaming",
  "Design", "Robotics", "Psychology", "Photography", "Finance", "Movies",
  "Data Science", "Cybersecurity", "IoT", "Writing", "Fitness", "Astronomy"
];

const RECOMMENDED = ["AI", "Python", "Web Development"];

const ALIASES = {
  "AI": ["ai", "artificial intelligence", "machine learning", "ml", "deep learning"],
  "Python": ["python", "py"],
  "Web Development": ["web development", "web dev", "javascript", "react", "html", "css", "frontend", "backend", "full stack"],
  "Startups": ["startup", "startups", "entrepreneurship", "business", "founder"],
  "Music": ["music", "singing", "songwriting", "musician"],
  "Gaming": ["gaming", "games", "esports", "game development"],
  "Design": ["design", "figma", "ui/ux", "ux", "ui", "art", "product design"],
  "Robotics": ["robotics", "arduino", "robot"],
  "Psychology": ["psychology", "behaviour", "behavior"],
  "Photography": ["photography", "photo editing", "visual storytelling"],
  "Finance": ["finance", "investing", "economics", "fintech"],
  "Movies": ["movies", "movie", "cinema", "film", "films"],
  "Data Science": ["data science", "data analytics", "analytics"],
  "Cybersecurity": ["cybersecurity", "security", "ethical hacking"],
  "IoT": ["iot", "electronics", "embedded systems"],
  "Writing": ["writing", "writer", "storytelling", "content"],
  "Fitness": ["fitness", "wellness", "sports"],
  "Astronomy": ["astronomy", "space", "astrophysics"]
};

const DEMO_PROFILES = [
  {id:"preview-01",name:"Aanya Mehta",bio:"Student developer exploring AI-powered apps and Python projects",city:"Raipur",interests:["AI","Python","Web Development"]},
  {id:"preview-02",name:"Aarav Sharma",bio:"Student curious about machine learning, data and automation",city:"Naya Raipur",interests:["AI","Data Science","Python"]},
  {id:"preview-03",name:"Kavya Singh",bio:"Student designer turning rough ideas into clean interfaces",city:"Naya Raipur",interests:["Design","Web Development","Writing"]},
  {id:"preview-04",name:"Kabir Shah",bio:"Student gamer exploring game development and creative coding",city:"Raipur",interests:["Gaming","Web Development","AI"]},
  {id:"preview-05",name:"Myra Nair",bio:"Student photographer interested in visual storytelling and film",city:"Bilaspur",interests:["Photography","Movies","Design"]},
  {id:"preview-06",name:"Rohan Iyer",bio:"Student exploring startups, product building and collaboration",city:"Naya Raipur",interests:["Startups","Web Development","Finance"]},
  {id:"preview-07",name:"Sana Khan",bio:"Student interested in psychology, learning habits and communication",city:"Raipur",interests:["Psychology","Writing","AI"]},
  {id:"preview-08",name:"Vihaan Das",bio:"Student building electronics experiments and IoT projects",city:"Naya Raipur",interests:["IoT","Robotics","Python"]},
  {id:"preview-09",name:"Zoya Kapoor",bio:"Student music lover exploring songwriting and creative tools",city:"Durg",interests:["Music","Writing","Design"]},
  {id:"preview-10",name:"Aditya Verma",bio:"Student curious about entrepreneurship, finance and fintech",city:"Naya Raipur",interests:["Finance","Startups","Data Science"]},
  {id:"preview-11",name:"Neel Joshi",bio:"Student exploring cyber safety and secure application design",city:"Raipur",interests:["Cybersecurity","Web Development","Python"]},
  {id:"preview-12",name:"Priya Desai",bio:"Student writer who enjoys stories and digital publishing",city:"Naya Raipur",interests:["Writing","Movies","Psychology"]},
  {id:"preview-13",name:"Farhan Ali",bio:"Student exploring fitness, wellness and data-driven habits",city:"Durg",interests:["Fitness","Data Science","Psychology"]},
  {id:"preview-14",name:"Tanvi Jain",bio:"Student curious about astronomy and Python visualisations",city:"Raipur",interests:["Astronomy","Python","AI"]},
  {id:"preview-15",name:"Mihir Reddy",bio:"Student analytics enthusiast working with datasets",city:"Naya Raipur",interests:["Data Science","AI","Finance"]},
  {id:"preview-16",name:"Diya Bose",bio:"Student UI/UX learner interested in product research",city:"Bilaspur",interests:["Design","Psychology","Web Development"]},
  {id:"preview-17",name:"Parth Kulkarni",bio:"Student exploring hardware, robotics and embedded projects",city:"Raipur",interests:["Robotics","IoT","Cybersecurity"]},
  {id:"preview-18",name:"Avni Mishra",bio:"Student interested in independent music, film and creative circles",city:"Naya Raipur",interests:["Music","Movies","Photography"]},
  {id:"preview-19",name:"Samar Bhat",bio:"Student learning web technologies and responsive interfaces",city:"Durg",interests:["Web Development","Python","Design"]},
  {id:"preview-20",name:"Rhea Malhotra",bio:"Student startup enthusiast curious about new products",city:"Raipur",interests:["Startups","Finance","Writing"]},
  {id:"preview-21",name:"Yash Sinha",bio:"Student exploring secure software and coding challenges",city:"Naya Raipur",interests:["Cybersecurity","Python","Data Science"]},
  {id:"preview-22",name:"Nisha Menon",bio:"Student interested in finance and analytics",city:"Raipur",interests:["Finance","Data Science","Writing"]},
  {id:"preview-23",name:"Shaurya Chopra",bio:"Student game-development learner interested in AI and graphics",city:"Naya Raipur",interests:["Gaming","AI","Web Development"]},
  {id:"preview-24",name:"Arjun Rao",bio:"Student photographer combining design, film and storytelling",city:"Raipur",interests:["Photography","Design","Movies"]},
  {id:"preview-25",name:"Meera Pillai",bio:"Student wellness enthusiast exploring psychology and fitness data",city:"Naya Raipur",interests:["Fitness","Psychology","Data Science"]}
];

let currentUser = null;
let registeredProfiles = [];
let connectionRows = [];
let connectionsByUserId = new Map();
let activeChatId = null;
let activeChatUser = null;
let socket = null;
let toastTimer = null;
let selectedPhoto = null;
let recommendedOnly = false;
let visibleLimit = 6;
let communities = [];
const messageCache = new Map();

// Local cache for dummy profile connection requests (only preview-xx cards)
let requestedDemoProfiles = new Set();
try {
  const saved = JSON.parse(localStorage.getItem("skillmate_demo_requests") || "[]");
  if (Array.isArray(saved)) {
    requestedDemoProfiles = new Set(saved.filter(id => String(id).startsWith("preview-")));
  }
} catch (_) {}

/* ---------- HELPERS ---------- */

function clean(value) {
  return String(value ?? "").trim();
}

function normalize(value) {
  return clean(value).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function initials(name) {
  return clean(name).split(/\s+/).filter(Boolean).slice(0, 2)
    .map(part => part[0].toUpperCase()).join("") || "S";
}

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function showToast(message) {
  const el = $("#toast");
  if (!el) return;
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 3200);
}

function apiRequest(url, options = {}) {
  const config = {...options, credentials:"same-origin"};
  if (config.body && !(config.body instanceof FormData)) {
    config.headers = {"Content-Type":"application/json", ...(config.headers || {})};
  }

  return fetch(url, config).then(async response => {
    let data = {};
    try { data = await response.json(); } catch (_) {}
    if (!response.ok) {
      const error = new Error(data.error || `Request failed (${response.status})`);
      error.status = response.status;
      throw error;
    }
    return data;
  });
}

function splitBio(bio = "") {
  const parts = String(bio).split(" · ");
  if (parts.length < 2) return {role:parts[0] || "", city:""};
  return {role:parts.slice(0,-1).join(" · "), city:parts.at(-1)};
}

function selectedFilterTopics() {
  const checked = $$('input[name="filterInterest"]:checked').map(el => el.value);
  return checked.length ? checked : (currentUser?.interests || []);
}

function selectedSignupTopics() {
  return $$('input[name="signupInterest"]:checked').map(el => el.value);
}

function updateInterestCounts() {
  const filterCount = $("#interestCount");
  const signupCount = $("#signupInterestCount");
  if (filterCount) {
    filterCount.textContent = `${$$('input[name="filterInterest"]:checked').length} selected`;
  }
  if (signupCount) {
    signupCount.textContent = `${$$('input[name="signupInterest"]:checked').length} selected`;
  }
}

function renderUserAvatar(container, user) {
  if (!container) return;
  container.replaceChildren();
  if (user?.photo_url) {
    const img = document.createElement("img");
    img.src = user.photo_url;
    img.alt = `${user.name || "User"}'s profile`;
    container.appendChild(img);
  } else {
    container.textContent = user?.name ? initials(user.name) : "👤";
  }
}

/* ---------- USER MENU (3-DOTS TOP-RIGHT) ---------- */

function toggleUserMenu(event) {
  if (event) event.stopPropagation();
  const dropdown = $("#userMenuDropdown");
  const trigger = $("#userMenuTrigger");
  if (!dropdown) return;

  const isHidden = dropdown.hidden;
  dropdown.hidden = !isHidden;
  if (trigger) trigger.setAttribute("aria-expanded", String(isHidden));
}

function closeUserMenu() {
  const dropdown = $("#userMenuDropdown");
  const trigger = $("#userMenuTrigger");
  if (dropdown) dropdown.hidden = true;
  if (trigger) trigger.setAttribute("aria-expanded", "false");
}

document.addEventListener("click", event => {
  const userMenu = $("#userMenu");
  if (userMenu && !userMenu.contains(event.target)) {
    closeUserMenu();
  }
});

/* ---------- INTEREST MATCHING ---------- */

function hasTopic(profile, topic) {
  const aliases = ALIASES[topic] || [topic];
  const interests = (profile.interests || []).map(normalize);
  const bio = normalize(profile.bio || "");

  return aliases.some(alias => {
    const term = normalize(alias);
    return interests.some(item => item === term) ||
      (` ${bio} `).includes(` ${term} `);
  });
}

function getMatch(profile) {
  const topics = selectedFilterTopics();
  if (!topics.length) return {score:0, matched:[]};

  const matched = topics.filter(topic => hasTopic(profile, topic));
  return {score:Math.round(matched.length / topics.length * 100), matched};
}

function updateMatchPanel() {
  const value = $("#match");
  const info = $("#matchInfo");
  if (!value) return;

  const profiles = currentUser ? registeredProfiles : DEMO_PROFILES;
  const topics = selectedFilterTopics();

  if (!topics.length) {
    value.textContent = String(profiles.length);
    if (info) info.textContent = "Select an interest to personalise your recommendations.";
    return;
  }

  const count = profiles.filter(profile => getMatch(profile).score > 0).length;
  value.textContent = String(count);

  if (info) {
    info.textContent = count
      ? `${count} profiles share at least one selected interest.`
      : "No matches yet. Try selecting different interests.";
  }
}

function setRecommendedSignupInterests() {
  $$('input[name="signupInterest"]').forEach(input => {
    input.checked = RECOMMENDED.includes(input.value);
  });
  updateInterestCounts();
}

function selectRecommendedFilters() {
  $$('input[name="filterInterest"]').forEach(input => {
    input.checked = RECOMMENDED.includes(input.value);
  });
  visibleLimit = 8;
  updateInterestCounts();
  renderMembers();
}

function clearInterestFilters() {
  $$('input[name="filterInterest"]').forEach(input => input.checked = false);
  visibleLimit = 8;
  updateInterestCounts();
  renderMembers();
}

function syncFiltersToUser() {
  if (!currentUser) return;
  const saved = (currentUser.interests || []).map(normalize);
  $$('input[name="filterInterest"]').forEach(input => {
    input.checked = saved.includes(normalize(input.value));
  });
  updateInterestCounts();
}

$$('input[name="filterInterest"]').forEach(input => {
  input.addEventListener("change", () => {
    visibleLimit = 8;
    updateInterestCounts();
    renderMembers();
  });
});

$$('input[name="signupInterest"]').forEach(input => {
  input.addEventListener("change", updateInterestCounts);
});

/* ---------- AUTHENTICATION ---------- */

function openModal(mode = "login") {
  const modal = $("#modal");
  if (!modal) return;
  modal.style.display = "flex";
  switchAuth(mode);
  document.body.classList.add("modal-open");
}

function closeModal() {
  if ($("#modal")) $("#modal").style.display = "none";
  document.body.classList.remove("modal-open");
}

function clearAuthBanner() {
  const banner = $("#authInlineBanner");
  if (banner) {
    banner.hidden = true;
    banner.textContent = "";
    banner.classList.remove("success");
  }
}

function showAuthBanner(message, isSuccess = false) {
  const banner = $("#authInlineBanner");
  const box = $("#authBox");
  if (banner) {
    banner.textContent = message;
    banner.hidden = false;
    banner.classList.toggle("success", isSuccess);
  }
  if (!isSuccess && box) {
    box.classList.remove("shake");
    void box.offsetWidth; // trigger reflow
    box.classList.add("shake");
  }
}

function nextSignupStep() {
  clearAuthBanner();
  const name = clean($("#signupName")?.value);
  const email = clean($("#signupEmail")?.value);
  const password = $("#signupPassword")?.value || "";

  if (!name || !email) {
    showAuthBanner("Please enter your full name and email address.");
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showAuthBanner("Please enter a valid email address.");
    return;
  }
  if (!currentUser && password.length < 8) {
    showAuthBanner("Use a password with at least 8 characters.");
    return;
  }

  if ($("#signupStep1")) $("#signupStep1").style.display = "none";
  if ($("#signupStep2")) $("#signupStep2").style.display = "block";
  $("#signupStepPill1")?.classList.remove("active");
  $("#signupStepPill2")?.classList.add("active");
}

function prevSignupStep() {
  clearAuthBanner();
  if ($("#signupStep1")) $("#signupStep1").style.display = "block";
  if ($("#signupStep2")) $("#signupStep2").style.display = "none";
  $("#signupStepPill1")?.classList.add("active");
  $("#signupStepPill2")?.classList.remove("active");
}

function switchAuth(mode) {
  clearAuthBanner();
  const login = mode !== "signup";
  $("#loginForm").style.display = login ? "block" : "none";
  $("#signupForm").style.display = login ? "none" : "block";
  $("#loginTab").classList.toggle("active", login);
  $("#signupTab").classList.toggle("active", !login);
  $("#authTabs")?.classList.toggle("is-signup", !login);

  if (!login) {
    if ($("#signupStep1")) $("#signupStep1").style.display = currentUser ? "none" : "block";
    if ($("#signupStep2")) $("#signupStep2").style.display = currentUser ? "block" : "none";
    $("#signupStepPill1")?.classList.toggle("active", !currentUser);
    $("#signupStepPill2")?.classList.toggle("active", Boolean(currentUser));
    configureSignupForm();
    if (currentUser) fillProfileForm();
  }
}

function configureSignupForm() {
  const heading = $("#signupForm .auth-heading h2");
  const subheading = $("#signupForm .auth-heading p");
  const submit = $(".signup-submit");
  const email = $("#signupEmail");
  const password = $("#signupPassword");

  if (currentUser) {
    if (heading) heading.textContent = "Your profile";
    if (subheading) subheading.textContent = "Keep your details and interests up to date.";
    if (submit) submit.innerHTML = 'Save profile changes <span>↗</span>';
    if (email) {
      email.value = currentUser.email || "";
      email.readOnly = true;
    }
    if (password) {
      password.value = "";
      password.placeholder = "Not needed for profile updates";
    }
  } else {
    if (heading) heading.textContent = "Let's meet.";
    if (subheading) subheading.textContent = "A few details help us find people you'll click with.";
    if (submit) submit.innerHTML = 'Create my profile <span>↗</span>';
    if (email) email.readOnly = false;
    if (password) password.placeholder = "At least 8 characters";
    setRecommendedSignupInterests();
  }
}

function fillProfileForm() {
  if (!currentUser) return;
  const {role, city} = splitBio(currentUser.bio);

  $("#signupName").value = currentUser.name || "";
  $("#signupCity").value = currentUser.city || city || "";
  $("#signupRole").value = role || "";
  $("#signupEmail").value = currentUser.email || "";
  $("#signupPassword").value = "";

  const saved = (currentUser.interests || []).map(normalize);
  $$('input[name="signupInterest"]').forEach(input => {
    input.checked = saved.includes(normalize(input.value));
  });

  selectedPhoto = null;
  const preview = $("#photoPreview");
  preview.replaceChildren();

  if (currentUser.photo_url) {
    const image = document.createElement("img");
    image.src = currentUser.photo_url;
    image.alt = "Profile photo";
    preview.appendChild(image);
  } else {
    preview.innerHTML = "<span>👤</span>";
  }
  updateInterestCounts();
}

function togglePassword(id, button) {
  const input = document.getElementById(id);
  if (!input) return;

  const show = input.type === "password";
  input.type = show ? "text" : "password";
  button.innerHTML = show
    ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>'
    : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>';
  button.setAttribute("aria-label", show ? "Hide password" : "Show password");
}

function setAuthenticatedUser(user) {
  currentUser = user || null;

  const joinBtn = $("#joinButton");
  const userMenu = $("#userMenu");
  const joinCta = $("#joinCtaSection");
  const heroJoinBtn = $("#heroJoinButton");
  const heroWelcome = $("#heroWelcome");
  const chatSidebarUser = $("#chatSidebarUser");

  if (currentUser) {
    document.body.classList.add("user-logged-in");
    $$(".floating").forEach(el => { el.hidden = true; });

    // Hide standard Join button & bottom Join CTA when logged in
    if (joinBtn) joinBtn.hidden = true;
    if (joinCta) joinCta.hidden = true;
    if (heroJoinBtn) heroJoinBtn.hidden = true;

    const heroButtons = $("#heroButtons");
    if (heroButtons) heroButtons.hidden = true;

    // Show grand hero personalized welcome card
    if (heroWelcome) {
      heroWelcome.hidden = false;
      const welcomeName = $("#welcomeUserName");
      if (welcomeName) welcomeName.textContent = currentUser.name;

      const welcomeBio = $("#welcomeUserBio");
      if (welcomeBio) {
        welcomeBio.textContent = currentUser.bio || "Find collaborators, join circles, and discover people who share your passions.";
      }

      renderUserAvatar($("#welcomeBigAvatar"), currentUser);
    }

    // Show top-right user menu and avatars
    if (userMenu) userMenu.hidden = false;

    renderUserAvatar($("#navAvatar"), currentUser);
    renderUserAvatar($("#dropdownAvatar"), currentUser);
    renderUserAvatar($("#sidebarUserAvatar"), currentUser);

    const dropdownName = $("#dropdownUserName");
    if (dropdownName) dropdownName.textContent = currentUser.name;

    const dropdownRole = $("#dropdownUserRole");
    if (dropdownRole) {
      const {role, city} = splitBio(currentUser.bio);
      dropdownRole.textContent = [role, city].filter(Boolean).join(" · ") || currentUser.email || "Community member";
    }

    // Show user avatar card in chat sidebar
    if (chatSidebarUser) {
      chatSidebarUser.hidden = false;
      const sidebarName = $("#sidebarUserName");
      if (sidebarName) sidebarName.textContent = currentUser.name;
    }

    initializeSocket();
  } else {
    // Logged out state
    if (joinBtn) {
      joinBtn.hidden = false;
      joinBtn.textContent = "Join ↗";
      joinBtn.onclick = () => openModal("signup");
    }

    if (userMenu) {
      userMenu.hidden = true;
      closeUserMenu();
    }

    const heroButtons = $("#heroButtons");
    if (heroButtons) heroButtons.hidden = false;

    document.body.classList.remove("user-logged-in");
    $$(".floating").forEach(el => { el.hidden = false; });

    if (joinCta) joinCta.hidden = false;
    if (heroJoinBtn) heroJoinBtn.hidden = false;
    if (heroWelcome) heroWelcome.hidden = true;
    if (chatSidebarUser) chatSidebarUser.hidden = true;

    if (socket) {
      socket.disconnect();
      socket = null;
    }
  }

  updateSidebarAndMobileNav();
  updateNotificationBadge();
  renderNotificationPanel();
  if (typeof renderMobileHomeDashboard === "function") renderMobileHomeDashboard();
  window.dispatchEvent(new CustomEvent('auth-updated', { detail: currentUser }));
}

function updateSidebarAndMobileNav() {
  const drawerName = $("#sidebarDrawerName");
  const drawerRole = $("#sidebarDrawerRole");
  const drawerAvatar = $("#sidebarDrawerAvatar");
  const authLabel = $("#sidebarAuthLabel");
  const profileLabel = $("#sidebarProfileLabel");
  const mobileAvatar = $("#mobileTabAvatar");
  const mobileProfileLabel = $("#mobileTabProfileLabel");

  if (currentUser) {
    if (drawerName) drawerName.textContent = currentUser.name || "Member";
    if (drawerRole) {
      const {role, city} = splitBio(currentUser.bio);
      drawerRole.textContent = [role, city].filter(Boolean).join(" · ") || currentUser.email || "SkillMate member";
    }
    if (authLabel) authLabel.textContent = "Log out";
    if (profileLabel) profileLabel.textContent = "Edit My Profile";
    if (mobileProfileLabel) mobileProfileLabel.textContent = "Profile";
    renderUserAvatar(drawerAvatar, currentUser);
    renderUserAvatar(mobileAvatar, currentUser);
  } else {
    if (drawerName) drawerName.textContent = "Guest Explorer";
    if (drawerRole) drawerRole.textContent = "Join to connect with peers";
    if (authLabel) authLabel.textContent = "Log in / Join";
    if (profileLabel) profileLabel.textContent = "Create Profile";
    if (mobileProfileLabel) mobileProfileLabel.textContent = "Log in";
    if (drawerAvatar) drawerAvatar.innerHTML = "<span>👤</span>";
    if (mobileAvatar) mobileAvatar.innerHTML = "<span>👤</span>";
  }
}

async function loginUser() {
  clearAuthBanner();
  const email = clean($("#loginEmail")?.value);
  const password = $("#loginPassword")?.value || "";

  if (!email || !password) {
    showAuthBanner("Enter your email and password.");
    return;
  }

  const submitBtn = $("#loginForm .auth-submit");
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="auth-spinner"></span><span>Signing in...</span>';
  }

  try {
    const result = await apiRequest(`${API}/auth/login`, {
      method:"POST",
      body:JSON.stringify({email, password})
    });

    setAuthenticatedUser(result.user);
    closeModal();
    if ($("#loginPassword")) $("#loginPassword").value = "";

    syncFiltersToUser();
    await loadConnections();
    await refreshMembers();
    await loadCommunities();

    showToast(`Welcome back, ${result.user.name}!`);
  } catch (error) {
    showAuthBanner(error.message || "Invalid email or password.");
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span>Log In to SkillMate</span>';
    }
  }
}

async function signupUser() {
  const isNew = !currentUser;
  const name = clean($("#signupName")?.value);
  const city = clean($("#signupCity")?.value);
  const role = clean($("#signupRole")?.value);
  const email = clean($("#signupEmail")?.value);
  const password = $("#signupPassword")?.value || "";
  const interests = selectedSignupTopics();

  if (!name || !email) {
    showAuthBanner("Please enter your name and email.");
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showAuthBanner("Enter a valid email address.");
    return;
  }
  if (isNew && password.length < 8) {
    showAuthBanner("Use a password with at least 8 characters.");
    return;
  }

  const finalInterests = interests.length > 0 ? interests : ["AI", "Python", "Web Development"];
  const bio = [role, city].filter(Boolean).join(" • ") || "SkillMate member";

  const submitBtn = $(".signup-submit");
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="auth-spinner"></span><span>Creating account...</span>';
  }

  try {
    let result;

    if (currentUser) {
      result = await apiRequest(`${API}/profile`, {
        method:"PUT",
        body:JSON.stringify({name, bio, interests: finalInterests})
      });
    } else {
      result = await apiRequest(`${API}/auth/register`, {
        method:"POST",
        body:JSON.stringify({name, email, password, bio, interests: finalInterests})
      });
    }

    let updatedUser = result.user || currentUser;
    if (!currentUser) setAuthenticatedUser(updatedUser);

    if (selectedPhoto) {
      const form = new FormData();
      form.append("photo", selectedPhoto);

      try {
        const photoResult = await apiRequest(`${API}/upload/photo`, {
          method:"POST",
          body:form
        });
        updatedUser = {...updatedUser, photo_url:photoResult.photo_url};
      } catch (photoError) {
        showToast(`Profile saved, but photo upload failed: ${photoError.message}`);
      }
    }

    setAuthenticatedUser(updatedUser);
    closeModal();
    resetSignupForm();
    syncFiltersToUser();

    await loadConnections();
    await refreshMembers();
    await loadCommunities();

    showToast(isNew ? `Welcome to SkillMate, ${name}!` : "Profile updated.");
  } catch (error) {
    showAuthBanner(error.message || "Failed to create account.");
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span>' + (currentUser ? "Save profile changes" : "Create Account") + '</span>';
    }
  }
}

function resetSignupForm() {
  ["signupName","signupCity","signupRole","signupEmail","signupPassword"].forEach(id => {
    const input = document.getElementById(id);
    if (input) input.value = "";
  });
  const file = $("#signupPhoto");
  if (file) file.value = "";

  selectedPhoto = null;
  if ($("#photoPreview")) $("#photoPreview").innerHTML = "<span>👤</span>";
  setRecommendedSignupInterests();
}

async function logoutUser() {
  closeUserMenu();
  try {
    await apiRequest(`${API}/auth/logout`, {method:"POST"});
  } catch (_) {}

  if (socket) socket.disconnect();
  setAuthenticatedUser(null);
  window.location.reload();
}

const photoInput = $("#signupPhoto");
photoInput?.addEventListener("change", () => {
  const file = photoInput.files?.[0];
  if (!file) return;

  const accepted = ["image/jpeg","image/png","image/webp","image/gif"];
  if (!accepted.includes(file.type)) {
    showToast("Choose a JPG, PNG, WEBP or GIF image.");
    photoInput.value = "";
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    showToast("Photo must be 5 MB or smaller.");
    photoInput.value = "";
    return;
  }

  selectedPhoto = file;
  const reader = new FileReader();
  reader.onload = () => {
    const preview = $("#photoPreview");
    preview.replaceChildren();
    const image = document.createElement("img");
    image.src = String(reader.result || "");
    image.alt = "Profile photo preview";
    preview.appendChild(image);
  };
  reader.onerror = () => showToast("Could not read that image.");
  reader.readAsDataURL(file);
});

/* ---------- DISCOVER / PROFILE CARDS ---------- */

function makeAvatar(name, photo = "") {
  const el = document.createElement("div");
  el.className = "avatar";

  if (photo) {
    const img = document.createElement("img");
    img.src = photo;
    img.alt = `${name}'s profile photo`;
    el.appendChild(img);
  } else {
    el.textContent = initials(name);
  }

  return el;
}

function profileSearchText(profile) {
  return normalize([
    profile.name, profile.bio, profile.city, ...(profile.interests || [])
  ].join(" "));
}

function allDisplayProfiles() {
  // Visitors see curated preview profiles. Logged-in members get database profiles.
  return currentUser ? registeredProfiles : DEMO_PROFILES;
}

function createProfileCard(profile) {
  const card = document.createElement("article");
  const demo = Boolean(!Number.isFinite(Number(profile.id)) || String(profile.id).startsWith("preview-"));
  const match = getMatch(profile);

  card.className = "person tilt";
  card.dataset.userId = String(profile.id);

  const top = document.createElement("div");
  top.className = "person-top";
  top.appendChild(makeAvatar(profile.name, profile.photo_url || ""));

  const badge = document.createElement("span");
  badge.className = "online";
  const dot = document.createElement("i");
  badge.appendChild(dot);
  badge.append(document.createTextNode(match.score ? ` ${match.score}% MATCH` : (demo ? " PREVIEW" : " MEMBER")));
  top.appendChild(badge);
  card.appendChild(top);

  const name = document.createElement("h3");
  name.textContent = profile.name || "SkillMate member";
  card.appendChild(name);

  const uname = profile.username || String(profile.email || 'user').split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');
  const handleEl = document.createElement("div");
  handleEl.className = "profile-card-handle";
  handleEl.style.cssText = "font-size:12px;color:#c084fc;font-weight:600;margin-top:-6px;margin-bottom:8px;";
  handleEl.textContent = `@${uname}`;
  card.appendChild(handleEl);

  const role = document.createElement("div");
  role.className = "role";
  role.textContent = profile.bio || "Student and community member";
  card.appendChild(role);

  const tags = document.createElement("div");
  tags.className = "tags";
  (profile.interests || []).slice(0, 4).forEach(topic => {
    const tag = document.createElement("span");
    tag.textContent = topic;
    tags.appendChild(tag);
  });
  card.appendChild(tags);

  const footer = document.createElement("div");
  footer.className = "profile-card-footer";
  const location = document.createElement("span");
  location.className = "profile-location";
  location.textContent = profile.city || splitBio(profile.bio).city || "India";
  footer.appendChild(location);
  card.appendChild(footer);

  const actions = document.createElement("div");
  actions.className = "person-actions";

  const connectButton = document.createElement("button");
  connectButton.type = "button";
  connectButton.className = "connect";

  const messageButton = document.createElement("button");
  messageButton.type = "button";
  messageButton.className = "message-btn";
  messageButton.textContent = "Message";
  messageButton.dataset.messageUserId = String(profile.id || "");
  messageButton.dataset.messageUserName = profile.name || "Member";
  messageButton.dataset.isDemo = profile.isDemo ? "1" : "0";

  if (demo) {
    // Dummy profiles now work like real profiles (updates to Requested & persists state)
    const isRequested = requestedDemoProfiles.has(String(profile.id));

    if (isRequested) {
      connectButton.textContent = "Requested";
      connectButton.disabled = true;
    } else {
      connectButton.textContent = "Connect";
      connectButton.disabled = false;
      connectButton.addEventListener("click", () => {
        if (!currentUser) {
          showToast("Log in to send a connection request.");
          openModal("login");
          return;
        }

        requestedDemoProfiles.add(String(profile.id));
        try {
          localStorage.setItem("skillmate_demo_requests", JSON.stringify([...requestedDemoProfiles]));
        } catch (_) {}

        connectButton.textContent = "Requested";
        connectButton.disabled = true;
        showToast(`Connection request sent to ${profile.name}.`);
      });
    }
  } else {
    const relation = connectionsByUserId.get(Number(profile.id));

    if (relation?.status === "accepted") {
      connectButton.textContent = "Connected";
      connectButton.disabled = true;
    } else if (
      relation?.status === "pending" &&
      Number(relation.recipient_id) === Number(currentUser?.id)
    ) {
      connectButton.textContent = "Accept request";
      connectButton.addEventListener("click", () => acceptConnection(relation.connection_id));
    } else if (relation?.status === "pending") {
      connectButton.textContent = "Requested";
      connectButton.disabled = true;
    } else {
      connectButton.textContent = "Connect";
      connectButton.addEventListener("click", () => connectMember(profile));
    }
  }

  actions.append(connectButton, messageButton);
  card.appendChild(actions);
  enableTilt(card);
  return card;
}

function enableTilt(card) {
  if (matchMedia("(hover: none)").matches ||
      matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  card.addEventListener("mousemove", event => {
    const rect = card.getBoundingClientRect();
    const rx = ((event.clientY - rect.top - rect.height / 2) / 25) * -1;
    const ry = (event.clientX - rect.left - rect.width / 2) / 25;
    card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-3px)`;
  });

  card.addEventListener("mouseleave", () => card.style.transform = "");
}

// Discover Filter Pills State
let activeDiscoverFilter = 'all';

window.selectDiscoverFilter = function(filterKey) {
  activeDiscoverFilter = filterKey;
  visibleLimit = 6;

  document.querySelectorAll('#discoverFilterPills .filter-pill').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('onclick').includes(`'${filterKey}'`));
  });

  renderMembers();
};

function renderMembers() {
  const people = $("#people");
  if (!people) return;

  const query = normalize($("#search")?.value);
  const topics = selectedFilterTopics();

  let profiles = allDisplayProfiles()
    .filter(profile => !currentUser || Number(profile.id) !== Number(currentUser.id))
    .map(profile => ({profile, match:getMatch(profile)}))
    .filter(item => !query || profileSearchText(item.profile).includes(query));

  // Filter Pills (All, Top Matches 70%+, Connected, Topic)
  if (activeDiscoverFilter === 'top') {
    profiles = profiles.filter(item => item.match.score >= 70 || (item.match.score > 0 && profiles.length <= 6));
  } else if (activeDiscoverFilter === 'connected') {
    profiles = profiles.filter(item => connectionsByUserId.get(Number(item.profile.id))?.status === 'accepted');
  } else if (activeDiscoverFilter !== 'all') {
    profiles = profiles.filter(item =>
      (item.profile.interests || []).some(t => t.toLowerCase() === activeDiscoverFilter.toLowerCase())
    );
  }

  if (recommendedOnly && topics.length && activeDiscoverFilter === 'all') {
    profiles = profiles.filter(item => item.match.score > 0);
  }

  profiles.sort((a,b) =>
    b.match.score - a.match.score ||
    String(a.profile.name).localeCompare(String(b.profile.name))
  );

  const total = profiles.length;
  const visible = profiles.slice(0, visibleLimit);
  people.replaceChildren();

  visible.forEach(item => people.appendChild(createProfileCard(item.profile)));

  const noResults = $("#noResults");
  if (noResults) {
    noResults.hidden = total > 0;
    noResults.textContent = query
      ? "No profiles match your search. Try another name or interest."
      : "No matching profiles yet. Try choosing other interests.";
  }

  const count = $("#profileCount");
  if (count) {
    count.textContent = `${Math.min(visibleLimit,total)} of ${total} profiles`;
  }

  const more = $("#showMoreButton");
  if (more) {
    more.hidden = total <= visibleLimit;
    const remaining = total - visibleLimit;
    more.textContent = `Load more people ↓ (${remaining > 0 ? remaining : 0} remaining)`;
  }

  const summary = $("#discoverySummary");
  if (summary) {
    summary.textContent = topics.length
      ? `Ranked by shared interests: ${topics.slice(0,3).join(", ")}${topics.length > 3 ? " and more" : ""}`
      : `${total} profiles · choose interests for recommendations`;
  }

  updateMatchPanel();
  updateInterestCounts();
}

async function refreshMembers() {
  if (!currentUser) {
    registeredProfiles = [];
    renderMembers();
    return;
  }

  try {
    const result = await apiRequest(`${API}/profiles`);
    registeredProfiles = result.profiles || [];
    renderMembers();
  } catch (error) {
    showToast(error.message);
  }
}

function toggleRecommendedOnly() {
  recommendedOnly = !recommendedOnly;
  visibleLimit = 8;

  const button = $("#recommendationToggle");
  if (button) {
    button.textContent = recommendedOnly ? "Show everyone" : "Show best matches";
    button.classList.toggle("filter-active", recommendedOnly);
  }

  renderMembers();
}

function showMoreProfiles() {
  visibleLimit += 8;
  renderMembers();
}

function clearSearch() {
  if ($("#search")) $("#search").value = "";
  visibleLimit = 8;
  renderMembers();
}

$("#search")?.addEventListener("input", () => {
  visibleLimit = 8;
  renderMembers();
});

function scrollToDiscover() {
  navigateTo("discover");
}

/* ---------- CONNECTIONS ---------- */

async function loadConnections() {
  if (!currentUser) {
    connectionRows = [];
    connectionsByUserId = new Map();
    renderContacts();
    updateNotificationBadge();
    renderNotificationPanel();
    if ($("#chatCount")) $("#chatCount").textContent = "0";
    if ($("#sidebarChatCount")) $("#sidebarChatCount").textContent = "0";
    if ($("#mobileChatBadge")) $("#mobileChatBadge").hidden = true;
    return;
  }

  try {
    const result = await apiRequest(`${API}/connections`);
    connectionRows = result.connections || [];
    connectionsByUserId = new Map();

    connectionRows.forEach(row => {
      if (row.user) connectionsByUserId.set(Number(row.user.id), row);
    });

    const acceptedCount = connectionRows.filter(row => row.status === "accepted").length;
    const count = $("#chatCount");
    if (count) count.textContent = String(acceptedCount);

    const sidebarChatCount = $("#sidebarChatCount");
    if (sidebarChatCount) sidebarChatCount.textContent = String(acceptedCount);

    const chatSidebarBadge = $("#chatSidebarBadge");
    if (chatSidebarBadge) chatSidebarBadge.textContent = String(acceptedCount);

    const mobileChatBadge = $("#mobileChatBadge");
    if (mobileChatBadge) {
      mobileChatBadge.textContent = String(acceptedCount);
      mobileChatBadge.hidden = acceptedCount === 0;
    }

    updateNotificationBadge();
    renderNotificationPanel();
    renderMembers();
    renderContacts();
    if (typeof renderMobileHomeDashboard === "function") renderMobileHomeDashboard();
  } catch (error) {
    showToast(error.message);
  }
}

function updateNotificationBadge() {
  if (!currentUser) {
    const navBadge = $("#navNotificationBadge");
    const sidebarBadge = $("#sidebarNotificationCount");
    const panelBadge = $("#notifPanelBadge");
    if (navBadge) navBadge.hidden = true;
    if (sidebarBadge) sidebarBadge.hidden = true;
    if (panelBadge) panelBadge.hidden = true;
    return;
  }

  const incomingRequests = connectionRows.filter(
    row => row.status === "pending" && Number(row.recipient_id) === Number(currentUser.id)
  );
  const count = incomingRequests.length;

  const navBadge = $("#navNotificationBadge");
  if (navBadge) {
    navBadge.textContent = String(count);
    navBadge.hidden = count === 0;
  }

  const sidebarBadge = $("#sidebarNotificationCount");
  if (sidebarBadge) {
    sidebarBadge.textContent = String(count);
    sidebarBadge.hidden = count === 0;
  }

  const panelBadge = $("#notifPanelBadge");
  if (panelBadge) {
    panelBadge.textContent = count > 0 ? `${count} new` : "0";
    panelBadge.hidden = count === 0;
  }
}

function renderNotificationPanel() {
  const requestsSection = $("#notifRequestsSection");
  const requestsList = $("#notifRequestsList");
  const requestsCount = $("#notifRequestsCount");
  const activityList = $("#notifActivityList");
  const emptyState = $("#notifEmpty");

  if (!requestsList || !activityList) return;

  const incomingRequests = connectionRows.filter(
    row => row.status === "pending" && Number(row.recipient_id) === Number(currentUser?.id)
  );

  const acceptedActivities = connectionRows.filter(
    row => row.status === "accepted"
  );

  // 1. Render Incoming Requests
  requestsList.innerHTML = "";
  if (incomingRequests.length > 0) {
    if (requestsSection) requestsSection.hidden = false;
    if (requestsCount) requestsCount.textContent = `${incomingRequests.length} pending`;

    incomingRequests.forEach(req => {
      const card = document.createElement("div");
      card.className = "notif-card";

      const user = req.user || { name: "Member", id: req.requester_id };
      const avatarEl = makeAvatar(user.name, user.photo_url || "");
      avatarEl.className = "notif-avatar";

      const details = document.createElement("div");
      details.className = "notif-details";

      const nameEl = document.createElement("div");
      nameEl.className = "notif-name";
      nameEl.textContent = user.name;

      const descEl = document.createElement("div");
      descEl.className = "notif-desc";
      descEl.textContent = user.bio ? `wants to connect • "${user.bio.slice(0, 45)}..."` : "Sent you a connection request.";

      const actions = document.createElement("div");
      actions.className = "notif-actions";

      const acceptBtn = document.createElement("button");
      acceptBtn.type = "button";
      acceptBtn.className = "notif-btn accept";
      acceptBtn.textContent = "✓ Accept";
      acceptBtn.addEventListener("click", async () => {
        acceptBtn.disabled = true;
        acceptBtn.textContent = "Accepting...";
        await acceptConnection(req.connection_id);
      });

      const declineBtn = document.createElement("button");
      declineBtn.type = "button";
      declineBtn.className = "notif-btn decline";
      declineBtn.textContent = "✕ Decline";
      declineBtn.addEventListener("click", async () => {
        declineBtn.disabled = true;
        try {
          await apiRequest(`${API}/connections/${req.connection_id}/reject`, { method: "POST" });
          showToast("Connection request declined.");
          await loadConnections();
          refreshMembers();
        } catch (err) {
          showToast(err.message);
        }
      });

      actions.append(acceptBtn, declineBtn);
      details.append(nameEl, descEl, actions);
      card.append(avatarEl, details);
      requestsList.appendChild(card);
    });
  } else {
    if (requestsSection) requestsSection.hidden = true;
  }

  // 2. Render Activity (accepted connections)
  activityList.innerHTML = "";
  if (acceptedActivities.length > 0) {
    acceptedActivities.slice(0, 10).forEach(conn => {
      const card = document.createElement("div");
      card.className = "notif-card";

      const user = conn.user || { name: "Member", id: conn.other_user_id };
      const avatarEl = makeAvatar(user.name, user.photo_url || "");
      avatarEl.className = "notif-avatar";

      const details = document.createElement("div");
      details.className = "notif-details";

      const nameEl = document.createElement("div");
      nameEl.className = "notif-name";
      nameEl.textContent = user.name;

      const descEl = document.createElement("div");
      descEl.className = "notif-desc";
      descEl.textContent = "You are connected! You can now chat anytime.";

      const actions = document.createElement("div");
      actions.className = "notif-actions";

      const chatBtn = document.createElement("button");
      chatBtn.type = "button";
      chatBtn.className = "notif-btn chat";
      chatBtn.textContent = "✉ Message";
      chatBtn.addEventListener("click", () => {
        closeNotifications();
        openChat(Number(user.id));
      });

      actions.appendChild(chatBtn);
      details.append(nameEl, descEl, actions);
      card.append(avatarEl, details);
      activityList.appendChild(card);
    });
  }

  // 3. Empty state
  if (emptyState) {
    emptyState.hidden = (incomingRequests.length > 0 || acceptedActivities.length > 0);
  }
}

function toggleNotifications(event) {
  if (event) event.stopPropagation();
  if (!currentUser) {
    showToast("Log in to view notifications.");
    openModal("login");
    return;
  }

  const drawer = $("#notificationsDrawer");
  if (drawer?.classList.contains("open")) {
    closeNotifications();
  } else {
    openNotifications();
  }
}
window.toggleNotifications = toggleNotifications;

function openNotifications() {
  closeSidebar();
  closeChat();
  closeModal();
  closeUserMenu();

  const drawer = $("#notificationsDrawer");
  const backdrop = $("#notificationsBackdrop");
  drawer?.classList.add("open");
  drawer?.setAttribute("aria-hidden", "false");
  backdrop?.classList.add("open");
  document.body.classList.add("notifications-open");

  renderNotificationPanel();
}
window.openNotifications = openNotifications;

function closeNotifications() {
  const drawer = $("#notificationsDrawer");
  const backdrop = $("#notificationsBackdrop");
  drawer?.classList.remove("open");
  drawer?.setAttribute("aria-hidden", "true");
  backdrop?.classList.remove("open");
  document.body.classList.remove("notifications-open");
}
window.closeNotifications = closeNotifications;

async function connectMember(profile) {
  if (!currentUser) {
    showToast("Log in to send a connection request.");
    openModal("login");
    return;
  }

  if (!Number.isFinite(Number(profile.id)) || String(profile.id).startsWith("preview-")) {
    showToast("This profile is for preview only. Try connecting with a teammate account.");
    return;
  }

  try {
    const result = await apiRequest(`${API}/connections/request/${profile.id}`, {method:"POST"});
    await loadConnections();
    if (result && result.auto_accepted) {
      showToast(`🎉 Connected with ${profile.name}! You both wanted to connect.`);
    } else {
      showToast(`Connection request sent to ${profile.name}.`);
    }
    refreshMembers();
  } catch (error) {
    showToast(error.message);
  }
}

async function acceptConnection(connectionId) {
  try {
    await apiRequest(`${API}/connections/${connectionId}/accept`, {method:"POST"});
    await loadConnections();
    refreshMembers();
    showToast("Connection accepted. You can now chat.");
  } catch (error) {
    showToast(error.message);
  }
}

function connectedProfiles() {
  return connectionRows
    .filter(row => row.status === "accepted" && row.user)
    .map(row => row.user);
}

/* ---------- COMMUNITIES ---------- */

async function loadCommunities() {
  try {
    const result = await apiRequest(`${API}/communities`);
    communities = result.communities || [];
    renderCommunities();
    window.dispatchEvent(new CustomEvent('community-updated', { detail: communities }));
  } catch (error) {
    showToast(`Couldn't load communities: ${error.message}`);
  }
}

// Communities State: Tabs, Search, Category Filter, and Pagination
let activeCommunityTab = 'joined';
let activeCommunityCategory = 'all';
let communitySearchQuery = '';
let communityVisibleLimit = 6;

window.switchCommunityTab = function(tab) {
  activeCommunityTab = tab;
  communityVisibleLimit = 6;

  const btnJoined = $("#commTabBtnJoined");
  const btnExplore = $("#commTabBtnExplore");
  if (btnJoined && btnExplore) {
    btnJoined.classList.toggle("active", tab === "joined");
    btnExplore.classList.toggle("active", tab === "explore");
  }

  const toolbarTitle = $("#communityToolbarTitle");
  if (toolbarTitle) {
    toolbarTitle.textContent = tab === "joined" ? "My Joined Circles" : "Explore Community Circles";
  }

  renderCommunities();
};

window.selectCommunityCategory = function(cat) {
  activeCommunityCategory = cat;
  communityVisibleLimit = 6;

  document.querySelectorAll("#communityChipsBar .community-chip").forEach(chip => {
    chip.classList.toggle("active", chip.getAttribute("onclick").includes(`'${cat}'`));
  });

  renderCommunities();
};

window.handleCommunitySearch = function(val) {
  communitySearchQuery = normalize(val);
  communityVisibleLimit = 6;
  renderCommunities();
};

window.clearCommunitySearch = function() {
  const input = $("#communitySearch");
  if (input) input.value = "";
  communitySearchQuery = "";
  communityVisibleLimit = 6;
  renderCommunities();
};

window.showMoreCommunities = function() {
  communityVisibleLimit += 6;
  renderCommunities();
};

function renderCommunities() {
  const grid = $("#communitiesGrid");
  if (!grid) return;

  const joinedCount = communities.filter(c => c.is_member).length;
  const countEl = $("#myCirclesCount");
  if (countEl) countEl.textContent = String(joinedCount);

  // Filter by Tab (Joined vs Explore)
  let list = communities.filter(c => {
    if (activeCommunityTab === 'joined') return Boolean(c.is_member);
    return !c.is_member;
  });

  // Filter by Category Chip
  if (activeCommunityCategory !== 'all') {
    list = list.filter(c => normalize(c.topic) === normalize(activeCommunityCategory));
  }

  // Filter by Search Query
  if (communitySearchQuery) {
    list = list.filter(c =>
      normalize(`${c.name || ''} ${c.topic || ''} ${c.description || ''}`).includes(communitySearchQuery)
    );
  }

  const total = list.length;
  const visible = list.slice(0, communityVisibleLimit);
  grid.replaceChildren();

  visible.forEach(community => {
    const card = document.createElement("article");
    card.className = "community-card";

    const top = document.createElement("div");
    top.className = "community-card-top";

    const emoji = document.createElement("span");
    emoji.className = "community-emoji";
    emoji.textContent = community.emoji || "✦";

    const topic = document.createElement("span");
    topic.className = "community-topic-pill";
    topic.textContent = community.topic;

    top.append(emoji, topic);

    const title = document.createElement("h3");
    title.textContent = community.name;

    const description = document.createElement("p");
    description.textContent = community.description;

    const bottom = document.createElement("div");
    bottom.className = "community-card-bottom";

    const count = document.createElement("span");
    count.className = "community-member-count";
    const memberCount = Number(community.member_count || 0);
    count.textContent = `${memberCount} ${memberCount === 1 ? "member" : "members"}`;

    const actionWrap = document.createElement("div");
    actionWrap.style.cssText = "display:flex;align-items:center;gap:6px;";

    if (community.is_member) {
      const openChatBtn = document.createElement("button");
      openChatBtn.type = "button";
      openChatBtn.className = "primary";
      openChatBtn.style.cssText = "padding:6px 12px;font-size:12px;font-weight:700;";
      openChatBtn.textContent = "💬 Open Chat";
      openChatBtn.onclick = (e) => {
        e.stopPropagation();
        if (window.GlassChat) {
          window.GlassChat.open();
        } else {
          openChat();
        }
      };

      const leaveBtn = document.createElement("button");
      leaveBtn.type = "button";
      leaveBtn.className = "secondary";
      leaveBtn.style.cssText = "padding:6px 10px;font-size:12px;";
      leaveBtn.textContent = "Leave";
      leaveBtn.onclick = (e) => {
        e.stopPropagation();
        leaveCommunity(community.id);
      };

      actionWrap.append(openChatBtn, leaveBtn);
    } else {
      const joinBtn = document.createElement("button");
      joinBtn.type = "button";
      joinBtn.className = "primary";
      joinBtn.style.cssText = "padding:6px 14px;font-size:12px;font-weight:700;";
      joinBtn.textContent = "+ Join Circle";
      joinBtn.onclick = (e) => {
        e.stopPropagation();
        joinCommunity(community.id);
      };
      actionWrap.appendChild(joinBtn);
    }

    bottom.append(count, actionWrap);
    card.append(top, title, description, bottom);
    grid.appendChild(card);
  });

  const noMsg = $("#noCommunitiesMsg");
  if (noMsg) {
    noMsg.hidden = total > 0;
    noMsg.textContent = activeCommunityTab === 'joined'
      ? "You haven't joined any circles yet. Switch to 'Explore Circles' to join!"
      : "No explore circles match your search.";
  }

  const pagCount = $("#communityPaginationCount");
  if (pagCount) {
    pagCount.textContent = `Showing ${Math.min(communityVisibleLimit, total)} of ${total} circles`;
  }

  const moreBtn = $("#showMoreCommunitiesBtn");
  if (moreBtn) {
    moreBtn.style.display = total > communityVisibleLimit ? "inline-block" : "none";
    moreBtn.textContent = `Show More Circles ↓ (${total - communityVisibleLimit} remaining)`;
  }
}

async function joinCommunity(id) {
  if (!currentUser) {
    showToast("Log in first to join a community.");
    openModal("login");
    return;
  }

  // 0ms Optimistic UI Update
  const target = communities.find(c => Number(c.id) === Number(id));
  const prevState = target ? { is_member: target.is_member, member_count: target.member_count } : null;
  if (target && !target.is_member) {
    target.is_member = true;
    target.member_count = Number(target.member_count || 0) + 1;
    renderCommunities();
  }
  showToast("You joined the community!");

  try {
    await apiRequest(`${API}/communities/${id}/join`, {method:"POST"});
  } catch (error) {
    if (target && prevState) {
      target.is_member = prevState.is_member;
      target.member_count = prevState.member_count;
      renderCommunities();
    }
    showToast(error.message);
  }
}

async function leaveCommunity(id) {
  // 0ms Optimistic UI Update
  const target = communities.find(c => Number(c.id) === Number(id));
  const prevState = target ? { is_member: target.is_member, member_count: target.member_count } : null;
  if (target && target.is_member) {
    target.is_member = false;
    target.member_count = Math.max(0, Number(target.member_count || 1) - 1);
    renderCommunities();
  }
  showToast("You left the community.");

  try {
    await apiRequest(`${API}/communities/${id}/leave`, {method:"POST"});
  } catch (error) {
    if (target && prevState) {
      target.is_member = prevState.is_member;
      target.member_count = prevState.member_count;
      renderCommunities();
    }
    showToast(error.message);
  }
}

async function joinMyInterestCommunities() {
  if (!currentUser) {
    showToast("Log in first to join your interest circles.");
    openModal("login");
    return;
  }

  const interests = selectedFilterTopics();
  if (!interests.length) {
    showToast("Select at least one interest first.");
    return;
  }

  try {
    const result = await apiRequest(`${API}/communities/join-my-interests`, {
      method:"POST",
      body:JSON.stringify({interests})
    });
    await loadCommunities();
    showToast(result.message || "Joined your interest circles.");
  } catch (error) {
    showToast(error.message);
  }
}

/* ---------- CHAT ---------- */

const chatDrawer = $("#chatDrawer");
const chatBackdrop = $("#chatBackdrop");
const chatMessages = $("#chatMessages");
const chatContacts = $("#chatContacts");

function initializeSocket() {
  if (!currentUser || typeof window.io !== "function") return;
  if (socket) socket.disconnect();

  socket = window.io({ transports: ["websocket", "polling"] });
  socket.on("message:new", message => {
    const otherId = Number(message.sender_id) === Number(currentUser.id)
      ? Number(message.recipient_id)
      : Number(message.sender_id);

    if (activeChatId === otherId) loadMessages(otherId);
    else if (Number(message.sender_id) !== Number(currentUser.id)) {
      showToast("You received a new message.");
    }
  });

  socket.on("connection:request", async data => {
    const requesterName = data.requester?.name || "A member";
    showToast(`✦ New connection request from ${requesterName}!`);
    await loadConnections();
    await refreshMembers();
  });

  socket.on("connection:accepted", async data => {
    const userName = data.user?.name || "A member";
    showToast(`🎉 ${userName} accepted your connection request!`);
    await loadConnections();
    await refreshMembers();
  });

  socket.on("connection:rejected", async () => {
    await loadConnections();
    await refreshMembers();
  });
}

function showContactsMobile() {
  chatDrawer?.classList.remove("mobile-view-chat");
}
window.showContactsMobile = showContactsMobile;

function openChat(personId) {
  if (!currentUser) {
    showToast("Log in to view your connections and messages.");
    openModal("login");
    return;
  }

  const contacts = connectedProfiles();

  if (personId !== undefined && personId !== null && personId !== "") {
    activeChatId = Number(personId);
    activeChatUser = contacts.find(user => Number(user.id) === activeChatId) || null;
    if (!activeChatUser) {
      showToast("This member is not an accepted connection yet.");
      return;
    }
    chatDrawer?.classList.add("mobile-view-chat");
  } else if (!activeChatId || !contacts.some(user => Number(user.id) === activeChatId)) {
    activeChatUser = contacts[0] || null;
    activeChatId = activeChatUser ? Number(activeChatUser.id) : null;
  } else {
    activeChatUser = contacts.find(user => Number(user.id) === activeChatId) || activeChatUser;
  }

  chatDrawer?.classList.add("open");
  chatDrawer?.setAttribute("aria-hidden","false");
  chatBackdrop?.classList.add("open");
  document.body.classList.add("chat-open");

  updateNavActiveStates("chat");
  renderContacts();
  renderActiveChat();
  if (activeChatId) loadMessages(activeChatId);
  setTimeout(() => $("#chatInput")?.focus(), 200);
}

function closeChat() {
  window.GlassChat?.close();
  chatDrawer?.classList.remove("open");
  chatDrawer?.classList.remove("mobile-view-chat");
  chatDrawer?.setAttribute("aria-hidden","true");
  chatBackdrop?.classList.remove("open");
  document.body.classList.remove("chat-open");

  const currentView = $(".app-view.active")?.id?.replace("view-", "") || "home";
  updateNavActiveStates(currentView);
}

function renderContacts() {
  if (!chatContacts) return;
  const query = normalize($("#chatSearch")?.value);
  chatContacts.replaceChildren();

  const contacts = connectedProfiles().filter(user =>
    normalize(`${user.name} ${(user.interests || []).join(" ")}`).includes(query)
  );

  const sidebarBadge = $("#chatSidebarBadge");
  if (sidebarBadge) sidebarBadge.textContent = String(contacts.length);

  if (!currentUser || !contacts.length) {
    const empty = document.createElement("div");
    empty.className = "chat-empty";
    empty.textContent = currentUser ? "Accepted connections appear here." : "Log in to see your connections.";
    chatContacts.appendChild(empty);
    return;
  }

  contacts.forEach(user => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = `chat-contact${Number(user.id) === activeChatId ? " active" : ""}`;
    item.addEventListener("click", () => {
      activeChatId = Number(user.id);
      activeChatUser = user;
      chatDrawer?.classList.add("mobile-view-chat");
      renderContacts();
      renderActiveChat();
      loadMessages(activeChatId);
    });

    const avatar = document.createElement("div");
    avatar.className = "chat-avatar";

    if (user.photo_url) {
      const img = document.createElement("img");
      img.src = user.photo_url;
      img.alt = "";
      avatar.appendChild(img);
    } else {
      avatar.textContent = initials(user.name);
    }

    const copy = document.createElement("div");
    copy.className = "chat-contact-copy";

    const line = document.createElement("div");
    line.className = "chat-contact-line";

    const name = document.createElement("strong");
    name.textContent = user.name;

    const time = document.createElement("time");
    time.textContent = "";

    line.append(name,time);

    const preview = document.createElement("span");
    preview.className = "chat-contact-preview";
    const thread = messageCache.get(Number(user.id)) || [];
    const last = thread[thread.length - 1];
    preview.textContent = last ? (last.body || "New message") : "Connected on SkillMate";

    copy.append(line,preview);
    item.append(avatar,copy);
    chatContacts.appendChild(item);
  });
}

function renderActiveChat() {
  const user = activeChatUser;
  const avatar = $("#activeChatAvatar");

  if (avatar) {
    avatar.replaceChildren();
    avatar.className = "chat-avatar";

    if (user?.photo_url) {
      const img = document.createElement("img");
      img.src = user.photo_url;
      img.alt = "";
      avatar.appendChild(img);
    } else {
      avatar.textContent = user ? initials(user.name) : "✦";
    }
  }

  if ($("#activeChatName")) {
    $("#activeChatName").textContent = user?.name || "Select a member";
  }

  if ($("#activeChatStatus")) {
    $("#activeChatStatus").innerHTML = user
      ? '<i class="status-dot"></i> Active now'
      : '<span style="color:#807c93;">No chat active</span>';
  }

  if ($("#activeChatTopic")) {
    $("#activeChatTopic").textContent = user
      ? ((user.interests || []).join(" · ") || "SkillMate member")
      : "Connect with members to get started";
  }

  if ($("#chatInput")) $("#chatInput").disabled = !user;
  if ($(".send-button")) $(".send-button").disabled = !user;
  if ($(".composer-attach")) $(".composer-attach").disabled = !user;

  // Update Right Details Panel (matching Dribbble reference)
  if (user) {
    if ($("#detailsName")) $("#detailsName").textContent = user.name;
    if ($("#detailsRole")) $("#detailsRole").textContent = user.bio || "SkillMate member";
    if ($("#detailsAvatar")) {
      const avatarEl = $("#detailsAvatar");
      avatarEl.innerHTML = "";
      if (user.photo_url) {
        const img = document.createElement("img");
        img.src = user.photo_url;
        img.alt = user.name;
        avatarEl.appendChild(img);
      } else {
        avatarEl.textContent = initials(user.name);
      }
    }
    if ($("#detailsInterests")) {
      const wrap = $("#detailsInterests");
      wrap.innerHTML = "";
      const interests = user.interests && user.interests.length ? user.interests : ["AI", "Python", "Web Development"];
      interests.slice(0, 5).forEach(topic => {
        const chip = document.createElement("span");
        chip.className = "detail-tag";
        chip.textContent = topic;
        wrap.appendChild(chip);
      });
    }
  }

  // Update top bar user avatar
  if (currentUser && $("#chatTopUserAvatar")) {
    const topAvatar = $("#chatTopUserAvatar");
    topAvatar.innerHTML = "";
    if (currentUser.photo_url) {
      const img = document.createElement("img");
      img.src = currentUser.photo_url;
      img.alt = currentUser.name;
      topAvatar.appendChild(img);
    } else {
      topAvatar.textContent = initials(currentUser.name);
    }
  }

  renderMessages();
}

function toggleDetailsPanel() {
  const drawer = $("#chatDrawer");
  if (drawer) drawer.classList.toggle("hide-details");
}
window.toggleDetailsPanel = toggleDetailsPanel;

async function loadMessages(userId) {
  if (!currentUser || !userId) return;

  try {
    const result = await apiRequest(`${API}/messages/${userId}`);
    messageCache.set(Number(userId), result.messages || []);
    if (activeChatId === Number(userId)) renderMessages();
    renderContacts();
  } catch (error) {
    if (error.status !== 403) showToast(error.message);
  }
}

function renderMessages() {
  if (!chatMessages) return;
  chatMessages.replaceChildren();

  const day = document.createElement("div");
  day.className = "chat-day-label";
  day.textContent = activeChatUser ? "YOUR CONVERSATION" : "YOUR NETWORK";
  chatMessages.appendChild(day);

  if (!activeChatUser || !activeChatId) {
    const empty = document.createElement("div");
    empty.className = "chat-empty";
    empty.innerHTML = "<span>✦</span><div>Connect with a registered member to start chatting.</div>";
    chatMessages.appendChild(empty);
    return;
  }

  const thread = messageCache.get(Number(activeChatId)) || [];

  if (!thread.length) {
    const empty = document.createElement("div");
    empty.className = "chat-empty";
    empty.innerHTML = "<span>✦</span><div>Say hello and start with something you have in common.</div>";
    chatMessages.appendChild(empty);
    return;
  }

  thread.forEach(message => {
    const mine = Number(message.sender_id) === Number(currentUser.id);
    const row = document.createElement("div");
    row.className = `message-row ${mine ? "mine" : "theirs"}`;

    if (!mine) {
      const mini = document.createElement("div");
      mini.className = "message-mini-avatar";
      mini.textContent = initials(activeChatUser.name);
      row.appendChild(mini);
    }

    const bubble = document.createElement("div");
    bubble.className = "message-bubble";

    const text = document.createElement("div");
    text.textContent = message.body || "";
    bubble.appendChild(text);

    const time = document.createElement("span");
    time.className = "message-time";

    const date = message.created_at
      ? new Date(String(message.created_at).replace(" ","T") + "Z")
      : new Date();

    time.textContent = Number.isNaN(date.getTime()) ? "" :
      date.toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"});

    bubble.appendChild(time);
    row.appendChild(bubble);

    if (mine) {
      const mini = document.createElement("div");
      mini.className = "message-mini-avatar mine-mini";
      mini.textContent = initials(currentUser.name);
      row.appendChild(mini);
    }

    chatMessages.appendChild(row);
  });

  chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function sendChatMessage(text) {
  const body = clean(text);
  if (!body) return;

  if (!currentUser || !activeChatId || !activeChatUser) {
    showToast("Choose an accepted connection first.");
    return;
  }

  try {
    await apiRequest(`${API}/messages/${activeChatId}`, {
      method:"POST",
      body:JSON.stringify({body})
    });
    $("#chatInput").value = "";
    await loadMessages(activeChatId);
    $("#chatInput")?.focus();
  } catch (error) {
    showToast(error.message);
  }
}

$("#chatForm")?.addEventListener("submit", event => {
  event.preventDefault();
  sendChatMessage($("#chatInput")?.value || "");
});

$("#chatSearch")?.addEventListener("input", renderContacts);

$("#chatAttachment")?.addEventListener("change", event => {
  if (event.target.files?.length) {
    showToast("Text chat is ready. Image messages are not enabled yet.");
    event.target.value = "";
  }
});

function showChatInfo() {
  if (!activeChatUser) {
    showToast("Select an accepted connection first.");
    return;
  }
  showToast(`${activeChatUser.name} · ${(activeChatUser.interests || []).join(", ")}`);
}

/* ---------- SIDEBAR (INSTAGRAM WEB DRAWER) ---------- */

function openSidebar() {
  const sidebar = $("#sidebarDrawer");
  const backdrop = $("#sidebarBackdrop");
  sidebar?.classList.add("open");
  sidebar?.setAttribute("aria-hidden", "false");
  backdrop?.classList.add("open");
  document.body.classList.add("sidebar-open");
}

function closeSidebar() {
  const sidebar = $("#sidebarDrawer");
  const backdrop = $("#sidebarBackdrop");
  sidebar?.classList.remove("open");
  sidebar?.setAttribute("aria-hidden", "true");
  backdrop?.classList.remove("open");
  document.body.classList.remove("sidebar-open");
}

/* ---------- MODAL KEYBOARD AND PHOTO SAFETY ---------- */

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeModal();
    closeChat();
    closeSidebar();
    closeUserMenu();
    closeNotifications();
  }

  if (event.key === "Enter" && $("#modal")?.style.display === "flex") {
    if (event.target instanceof HTMLInputElement && event.target.type !== "file") {
      event.preventDefault();
      $("#signupForm").style.display !== "none" ? signupUser() : loginUser();
    }
  }
});

$("#modal")?.addEventListener("click", event => {
  if (event.target === $("#modal")) closeModal();
});

function bindAuthModalListeners() {
  $("#loginTab")?.addEventListener("click", () => switchAuth("login"));
  $("#signupTab")?.addEventListener("click", () => switchAuth("signup"));
  $(".auth-close")?.addEventListener("click", () => closeModal());
  $(".signup-submit")?.addEventListener("click", () => signupUser());
  $("#loginForm .auth-submit")?.addEventListener("click", () => loginUser());
  $("#joinButton")?.addEventListener("click", () => openModal("signup"));
  $("#heroJoinButton")?.addEventListener("click", () => openModal("signup"));
  $(".nav-chat")?.addEventListener("click", () => openChat());
  $(".chat-close")?.addEventListener("click", () => closeChat());
  $(".dot-red")?.addEventListener("click", () => closeChat());
  $("#chatMobileBack")?.addEventListener("click", () => showContactsMobile());
  $("#chatBackdrop")?.addEventListener("click", () => closeChat());

  // Instagram-style Left Sidebar Triggers
  $("#sidebarTrigger")?.addEventListener("click", () => openSidebar());
  $("#sidebarCloseBtn")?.addEventListener("click", () => closeSidebar());
  $("#sidebarBackdrop")?.addEventListener("click", () => closeSidebar());

  $$("#sidebarDrawer [data-action='close']").forEach(link => {
    link.addEventListener("click", () => closeSidebar());
  });

  $("#sidebarChatsAction")?.addEventListener("click", () => {
    closeSidebar();
    openChat();
  });

  $("#sidebarProfileBtn")?.addEventListener("click", () => {
    closeSidebar();
    openModal("signup");
  });

  $("#sidebarAuthAction")?.addEventListener("click", () => {
    closeSidebar();
    if (currentUser) {
      logoutUser();
    } else {
      openModal("login");
    }
  });

  // Floating Frosted Glass Bottom Dock Triggers
  $("#mobileTabHome")?.addEventListener("click", event => {
    event.preventDefault();
    navigateTo("home");
  });

  $("#mobileTabDiscover")?.addEventListener("click", event => {
    event.preventDefault();
    navigateTo("discover");
  });

  $("#mobileTabQuickAdd")?.addEventListener("click", event => {
    event.preventDefault();
    openQuickActionSheet();
  });

  $("#mobileTabCommunities")?.addEventListener("click", event => {
    event.preventDefault();
    navigateTo("communities");
  });

  $("#mobileTabChat")?.addEventListener("click", event => {
    event.preventDefault();
    closeSidebar();
    closeModal();
    closeQuickActionSheet();
    updateNavActiveStates("chat");
    if (window.GlassChat) {
      window.GlassChat.open();
    } else {
      openChat();
    }
  });

  // Event delegation for Discover & Network "Message" buttons (including paginated cards)
  document.addEventListener("click", event => {
    const msgBtn = event.target?.closest?.(".message-btn[data-message-user-id]");
    if (!msgBtn) return;
    event.preventDefault();
    const uid = Number(msgBtn.dataset.messageUserId);
    const uname = msgBtn.dataset.messageUserName || "Member";
    const isDemo = msgBtn.dataset.isDemo === "1";

    if (!currentUser) {
      showToast("Sign in to message members.");
      openModal("login");
      return;
    }
    if (isDemo || !Number.isFinite(uid) || uid <= 0) {
      showToast("Select a registered member to start a live chat.");
      return;
    }
    if (window.GlassChat) {
      window.GlassChat.openDM(uid, { name: uname });
    } else {
      openChat(uid);
    }
  });

  // Quick Action Bottom Sheet Controls
  $("#quickActionCloseBtn")?.addEventListener("click", closeQuickActionSheet);
  $("#quickActionBackdrop")?.addEventListener("click", closeQuickActionSheet);
  $("#qaNewDM")?.addEventListener("click", () => {
    closeQuickActionSheet();
    if (window.GlassChat?.openNewDMModal) {
      window.GlassChat.open();
      window.GlassChat.openNewDMModal();
    } else {
      openChat();
    }
  });
  $("#qaCreateChannel")?.addEventListener("click", () => {
    closeQuickActionSheet();
    if (window.GlassChat?.openCreateChannelModal) {
      window.GlassChat.openCreateChannelModal();
    } else {
      navigateTo("network");
    }
  });
  $("#qaExploreCircles")?.addEventListener("click", () => {
    closeQuickActionSheet();
    navigateTo("communities");
  });

  // Mobile Home Dashboard Controls
  $("#mhSearchBtn")?.addEventListener("click", () => {
    navigateTo("discover");
    setTimeout(() => $("#search")?.focus(), 180);
  });
  $("#mhAvatarBtn")?.addEventListener("click", () => {
    openModal(currentUser ? "signup" : "login");
  });
  $("#mhSpotlightBtn")?.addEventListener("click", () => {
    if (!currentUser) {
      openModal("signup");
    } else {
      navigateTo("discover");
    }
  });
  $$("#mhCategoriesRow .mh-cat-tile").forEach(tile => {
    tile.addEventListener("click", () => {
      const interest = tile.dataset.interest || "";
      navigateTo("discover");
      if (interest && typeof filterByInterest === "function") {
        filterByInterest(interest);
      }
    });
  });

  renderMobileHomeDashboard();
}

function openQuickActionSheet() {
  $("#quickActionBackdrop")?.classList.add("open");
  $("#quickActionSheet")?.classList.add("open");
}

function closeQuickActionSheet() {
  $("#quickActionBackdrop")?.classList.remove("open");
  $("#quickActionSheet")?.classList.remove("open");
}

function renderMobileHomeDashboard() {
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const timeEl = $("#mhTimeGreeting");
  if (timeEl) timeEl.textContent = timeGreeting;

  const firstNameEl = $("#mhFirstName");
  const subtitleEl = $("#mhSubtitle");
  const avatarEl = $("#mhUserAvatar");
  if (currentUser) {
    const first = (currentUser.name || "Explorer").trim().split(/\s+/)[0];
    if (firstNameEl) firstNameEl.textContent = first;
    if (subtitleEl) subtitleEl.textContent = "Connect, build, and grow with your peers.";
    renderUserAvatar(avatarEl, currentUser);
  } else {
    if (firstNameEl) firstNameEl.textContent = "Explorer";
    if (subtitleEl) subtitleEl.textContent = "Sign in to connect, chat, and join circles.";
    if (avatarEl) avatarEl.textContent = "✦";
  }

  // Bento stats from live data
  const acceptedCount = Array.isArray(connectionRows)
    ? connectionRows.filter(r => r.status === "accepted").length
    : 0;
  const circlesCount = typeof joinedCommunityIds !== "undefined" && joinedCommunityIds?.size
    ? joinedCommunityIds.size
    : 0;

  let cachedConvs = [];
  try {
    cachedConvs = JSON.parse(localStorage.getItem("gc_cache_convs") || "[]") || [];
  } catch (_) {}
  const unreadTotal = cachedConvs.reduce((acc, c) => acc + Number(c.unread_count || 0), 0);

  if ($("#mhStatConnections")) $("#mhStatConnections").textContent = String(acceptedCount);
  if ($("#mhStatCircles")) $("#mhStatCircles").textContent = String(circlesCount);
  if ($("#mhStatUnread")) $("#mhStatUnread").textContent = String(unreadTotal);

  const notifDot = $("#mhNotifDot");
  const pendingCount = Array.isArray(connectionRows)
    ? connectionRows.filter(r => r.status === "pending" && r.direction === "incoming").length
    : 0;
  if (notifDot) notifDot.hidden = pendingCount === 0;

  // Profile Strength / Match Pulse
  let strength = 35;
  if (currentUser) {
    strength = 55;
    if (currentUser.bio) strength += 15;
    if (Array.isArray(currentUser.interests) && currentUser.interests.length > 0) strength += 15;
    if (acceptedCount > 0 || circlesCount > 0) strength += 15;
  }
  strength = Math.min(100, strength);
  if ($("#mhProgressFill")) $("#mhProgressFill").style.width = `${strength}%`;
  if ($("#mhProgressPct")) $("#mhProgressPct").textContent = `${strength}%`;
  if ($("#mhSpotlightTitle")) {
    $("#mhSpotlightTitle").textContent = currentUser ? (strength >= 85 ? "Match Pulse Strong!" : "Keep Building!") : "Join SkillMate";
  }
  if ($("#mhSpotlightDesc")) {
    $("#mhSpotlightDesc").textContent = currentUser
      ? (strength >= 85 ? "Your profile is tuned for top peer & circle matches." : "Add skills or join a circle to boost your peer match score.")
      : "Create your profile to unlock live DMs, circles, and peer matching.";
  }

  // Stacked Active Chats & Circles List
  const listEl = $("#mhActivityList");
  if (!listEl) return;
  const items = [];
  cachedConvs.slice(0, 3).forEach(c => {
    items.push({
      type: "dm",
      id: c.id,
      name: c.name || c.title || "Direct Message",
      sub: c.last_message || "Tap to continue conversation",
      avatar: c.avatar_url || "",
      initial: (c.name || "C").charAt(0).toUpperCase()
    });
  });

  if (typeof COMMUNITIES !== "undefined" && Array.isArray(COMMUNITIES)) {
    const joinedList = COMMUNITIES.filter(cm => joinedCommunityIds?.has?.(cm.id)).slice(0, 3);
    joinedList.forEach(cm => {
      items.push({
        type: "circle",
        id: cm.id,
        name: cm.name,
        sub: `${cm.members || "Active"} members · Circle`,
        avatar: "",
        initial: "#"
      });
    });
  }

  if (items.length === 0) {
    listEl.innerHTML = `<button type="button" class="mh-activity-row" onclick="navigateTo('discover')">
      <span class="mh-row-avatar">✦</span>
      <span class="mh-row-copy">
        <strong>Discover Peers &amp; Circles</strong>
        <small>Tap to find collaborators who share your skills</small>
      </span>
      <span class="mh-row-chevron">&rsaquo;</span>
    </button>`;
    return;
  }

  listEl.innerHTML = "";
  items.slice(0, 4).forEach(item => {
    const row = document.createElement("button");
    row.type = "button";
    row.className = "mh-activity-row";
    const avatarHtml = item.avatar
      ? `<img src="${escapeHtml(item.avatar)}" alt="">`
      : escapeHtml(item.initial);
    row.innerHTML = `
      <span class="mh-row-avatar">${avatarHtml}</span>
      <span class="mh-row-copy">
        <strong>${escapeHtml(item.name)}</strong>
        <small>${escapeHtml(item.sub)}</small>
      </span>
      <span class="mh-row-chevron">&rsaquo;</span>
    `;
    row.addEventListener("click", () => {
      if (item.type === "dm") {
        if (window.GlassChat) window.GlassChat.open(item.id);
        else openChat();
      } else {
        navigateTo("communities");
      }
    });
    listEl.appendChild(row);
  });
}

/* ---------- SPA VIEW NAVIGATION ---------- */

function navigateTo(viewName) {
  // Always close any active modal, drawer, or backdrop to prevent UI locking
  closeChat();
  closeSidebar();
  closeModal();
  closeNotifications();
  document.body.classList.remove("chat-open", "sidebar-open", "modal-open", "notifications-open");

  const validViews = ["home", "communities", "network", "discover"];
  const target = validViews.includes(viewName) ? viewName : "home";

  $$(".app-view").forEach(view => {
    view.classList.remove("active");
  });

  const activeView = $(`#view-${target}`);
  if (activeView) {
    activeView.classList.add("active");
  }

  // Smooth scroll to top of page
  window.scrollTo({ top: 0, behavior: "smooth" });

  // Update URL hash
  const newHash = target === "home" ? "#/" : `#/${target}`;
  if (window.location.hash !== newHash) {
    history.pushState(null, "", newHash);
  }

  updateNavActiveStates(target);

  // If navigating to network view, resize canvas
  if (target === "network") {
    setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 150);
  }
}

function updateNavActiveStates(target) {
  // Top Navigation Center
  $$(".nav-center a").forEach(link => {
    const href = link.getAttribute("href") || "";
    const isActive = href.includes(target) || (target === "home" && href === "#/");
    link.classList.toggle("active", isActive);
  });

  // Mobile Bottom Bar & Slim Top Header Title
  const mobileMap = {
    home: "#mobileTabHome",
    discover: "#mobileTabDiscover",
    communities: "#mobileTabCommunities",
    network: "#mobileTabNetwork",
    chat: "#mobileTabChat"
  };
  const mobileTitles = {
    home: "SkillMate.",
    discover: "Discover",
    communities: "Communities",
    network: "Network",
    chat: "Chats"
  };
  document.body.dataset.mobileView = target;
  const mobilePageTitle = $("#mobilePageTitle");
  if (mobilePageTitle) {
    mobilePageTitle.textContent = mobileTitles[target] || "SkillMate.";
  }

  $$(".mobile-tab").forEach(tab => tab.classList.remove("active"));
  const activeTabId = mobileMap[target];
  if (activeTabId) {
    const activeTab = $(activeTabId);
    if (activeTab) activeTab.classList.add("active");
  }

  // Left Sidebar
  $$(".sidebar-nav-item").forEach(item => {
    const href = item.getAttribute("href") || "";
    const isActive = href.includes(target) || (target === "home" && href.includes("#/"));
    item.classList.toggle("active", isActive);
  });
}

function handleHashChange() {
  const rawHash = (window.location.hash || "").replace(/^#\/?/, "").toLowerCase();
  if (rawHash === "communities" || rawHash === "circles") {
    navigateTo("communities");
  } else if (rawHash === "network" || rawHash === "matching") {
    navigateTo("network");
  } else if (rawHash === "discover" || rawHash === "people") {
    navigateTo("discover");
  } else {
    navigateTo("home");
  }
}

window.addEventListener("hashchange", handleHashChange);

/* ---------- INITIALISE ---------- */

async function initializeApp() {
  bindAuthModalListeners();
  handleHashChange();
  updateInterestCounts();
  renderMembers();

  try {
    const result = await apiRequest(`${API}/auth/me`);
    setAuthenticatedUser(result.user);
    syncFiltersToUser();
    await loadConnections();
  } catch (_) {
    setAuthenticatedUser(null);
    renderContacts();
  }

  await refreshMembers();
  await loadCommunities();
}

initializeApp();

// ==================== NETWORK TABS & TEAM CHANNELS ====================
window.switchNetworkTab = function(tabName) {
  const btnConn = document.getElementById("netTabBtnConnections");
  const btnChan = document.getElementById("netTabBtnChannels");
  const contentConn = document.getElementById("netTabContentConnections");
  const contentChan = document.getElementById("netTabContentChannels");

  if (tabName === "connections") {
    btnConn?.classList.add("active");
    btnChan?.classList.remove("active");
    if (contentConn) contentConn.style.display = "block";
    if (contentChan) contentChan.style.display = "none";
    renderConnectedMembers();
  } else {
    btnConn?.classList.remove("active");
    btnChan?.classList.add("active");
    if (contentConn) contentConn.style.display = "none";
    if (contentChan) contentChan.style.display = "block";
    loadNetworkChannels();
  }
};

window.renderConnectedMembers = function() {
  const grid = document.getElementById("connectedMembersGrid");
  const noMsg = document.getElementById("noConnectionsMsg");
  if (!grid) return;

  const connected = connectedProfiles();
  grid.replaceChildren();

  if (connected.length === 0) {
    if (noMsg) noMsg.style.display = "block";
  } else {
    if (noMsg) noMsg.style.display = "none";
    connected.forEach(profile => {
      grid.appendChild(createProfileCard(profile));
    });
  }
};

window.loadNetworkChannels = async function() {
  try {
    const res = await apiRequest("/api/chat/channels");
    const joined = res.joined || [];
    const explore = res.explore || [];

    const badge = document.getElementById("netJoinedChannelsCount");
    if (badge) badge.textContent = String(joined.length);

    const joinedBadge = document.getElementById("joinedChannelsBadge");
    if (joinedBadge) joinedBadge.textContent = `${joined.length} joined`;

    // Render Joined Channels
    const joinedGrid = document.getElementById("joinedChannelsGrid");
    const noJoined = document.getElementById("noJoinedChannelsMsg");
    if (joinedGrid) {
      joinedGrid.replaceChildren();
      if (joined.length === 0) {
        if (noJoined) noJoined.style.display = "block";
      } else {
        if (noJoined) noJoined.style.display = "none";
        joined.forEach(c => {
          const card = document.createElement("div");
          card.className = "channel-card";
          const isOwner = c.role === 'owner';
          card.innerHTML = `
            <div class="channel-card-top">
              <div class="channel-hash-tag">
                <span class="channel-hash-icon">#</span>
                <span>${escapeHtml(c.name)}</span>
              </div>
              <span class="channel-badge ${c.visibility || 'public'}">${(c.visibility||'public').toUpperCase()}</span>
            </div>
            <p class="channel-card-desc">${escapeHtml(c.description || 'General team discussion & collaboration.')}</p>
            <div class="channel-card-bottom">
              <span class="channel-members-count">👥 ${c.member_count || 1} members ${isOwner ? '• (Owner)' : ''}</span>
              <div style="display:flex;align-items:center;gap:6px;">
                <button class="primary" style="padding:6px 14px;font-size:12px;font-weight:700;" onclick="window.GlassChat ? window.GlassChat.openChannel(${c.id}) : null">
                  Open Channel →
                </button>
                <button class="secondary" style="padding:6px 10px;font-size:12px;" onclick="leaveNetworkChannel(${c.id}, '${escapeHtml(c.name)}')">
                  Leave
                </button>
              </div>
            </div>
          `;
          joinedGrid.appendChild(card);
        });
      }
    }

    // Render Explore Channels
    const exploreGrid = document.getElementById("exploreChannelsGrid");
    const noExplore = document.getElementById("noExploreChannelsMsg");
    if (exploreGrid) {
      exploreGrid.replaceChildren();
      if (explore.length === 0) {
        if (noExplore) noExplore.style.display = "block";
      } else {
        if (noExplore) noExplore.style.display = "none";
        explore.forEach(c => {
          const card = document.createElement("div");
          card.className = "channel-card";
          card.innerHTML = `
            <div class="channel-card-top">
              <div class="channel-hash-tag">
                <span class="channel-hash-icon">#</span>
                <span>${escapeHtml(c.name)}</span>
              </div>
              <span class="channel-badge public">PUBLIC</span>
            </div>
            <p class="channel-card-desc">${escapeHtml(c.description || 'Public collaboration channel.')}</p>
            <div class="channel-card-bottom">
              <span class="channel-members-count">👥 ${c.member_count || 0} members</span>
              <button class="primary" style="padding:6px 16px;font-size:12px;font-weight:700;" onclick="joinNetworkChannel(${c.id})">
                + Join Channel
              </button>
            </div>
          `;
          exploreGrid.appendChild(card);
        });
      }
    }
  } catch (err) {
    console.error("Error loading channels:", err);
  }
};

window.joinNetworkChannel = async function(channelId) {
  try {
    await apiRequest(`/api/chat/conversations/${channelId}/join`, { method: "POST" });
    showToast("Joined channel successfully!");
    if (window.GlassChat) {
      window.GlassChat.openChannel(channelId);
    }
    loadNetworkChannels();
  } catch (err) {
    showToast(err.message);
  }
};

window.leaveNetworkChannel = async function(channelId, name) {
  try {
    await apiRequest(`/api/chat/conversations/${channelId}/leave`, { method: "POST" });
    showToast(`Left #${name}.`);
    loadNetworkChannels();
  } catch (err) {
    showToast(err.message);
  }
};

// ==================== SEAMLESS IN-APP WEB OTA UPDATER (webVersion) ====================
(function initWebOtaUpdater() {
  const STORAGE_KEY = "sm_web_version";
  let updateDismissed = false;

  async function checkWebVersion() {
    if (updateDismissed || window.SkillMateNativeOta) return;
    try {
      const res = await fetch(`/api/version?_t=${Date.now()}`, { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      const serverVersion = data?.webVersion;
      if (!serverVersion) return;

      const savedVersion = localStorage.getItem(STORAGE_KEY);
      if (!savedVersion) {
        localStorage.setItem(STORAGE_KEY, serverVersion);
        return;
      }

      if (savedVersion !== serverVersion) {
        showWebOtaModal(serverVersion, data.notes || "New UI & performance improvements are ready.");
      }
    } catch (_) {}
  }

  function showWebOtaModal(newVersion, notes) {
    if (document.getElementById("smWebOtaModal")) return;

    const modal = document.createElement("div");
    modal.id = "smWebOtaModal";
    modal.style.cssText = "position:fixed;inset:0;z-index:999999;display:flex;align-items:center;justify-content:center;padding:18px;background:rgba(7,7,11,0.78);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);";
    modal.innerHTML = `
      <div style="width:min(400px,100%);padding:24px;border-radius:22px;background:rgba(18,18,28,0.85);border:1px solid rgba(168,85,247,0.35);box-shadow:0 24px 70px rgba(0,0,0,0.75),0 0 50px rgba(139,92,246,0.22);color:#f8fafc;font-family:inherit;">
        <div style="font-size:18px;font-weight:800;margin-bottom:8px;">✨ New Update Available (v${escapeHtml(newVersion)})</div>
        <p style="font-size:13px;color:#94a3b8;line-height:1.5;margin:0 0 16px;">${escapeHtml(notes)}</p>
        <div id="smOtaProgressWrap" style="display:none;margin-bottom:14px;">
          <div style="height:6px;border-radius:99px;background:rgba(255,255,255,0.08);overflow:hidden;">
            <div id="smOtaProgressBar" style="width:15%;height:100%;background:linear-gradient(135deg,#7c3aed,#c026d3);transition:width 0.35s ease;"></div>
          </div>
          <div style="font-size:12px;color:#c084fc;margin-top:6px;font-weight:600;">Updating in-app...</div>
        </div>
        <div style="display:flex;justify-content:flex-end;gap:10px;">
          <button id="smOtaLaterBtn" type="button" style="padding:10px 14px;border-radius:12px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.04);color:#94a3b8;font-weight:700;cursor:pointer;">Later</button>
          <button id="smOtaNowBtn" type="button" style="padding:10px 18px;border-radius:12px;border:0;background:linear-gradient(135deg,#7c3aed,#c026d3);color:#fff;font-weight:800;cursor:pointer;box-shadow:0 6px 20px rgba(124,58,237,0.35);">Update Now</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById("smOtaLaterBtn").onclick = () => {
      updateDismissed = true;
      modal.remove();
    };

    document.getElementById("smOtaNowBtn").onclick = async () => {
      const btn = document.getElementById("smOtaNowBtn");
      const later = document.getElementById("smOtaLaterBtn");
      const wrap = document.getElementById("smOtaProgressWrap");
      const bar = document.getElementById("smOtaProgressBar");
      if (btn) { btn.disabled = true; btn.textContent = "Updating..."; }
      if (later) later.style.display = "none";
      if (wrap) wrap.style.display = "block";

      setTimeout(() => { if (bar) bar.style.width = "65%"; }, 80);

      try {
        if ("caches" in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map(k => caches.delete(k)));
        }
      } catch (_) {}

      localStorage.setItem(STORAGE_KEY, newVersion);
      setTimeout(() => {
        if (bar) bar.style.width = "100%";
        const url = new URL(window.location.href);
        url.searchParams.set("_v", newVersion);
        window.location.replace(url.toString());
      }, 420);
    };
  }

  window.addEventListener("load", () => setTimeout(checkWebVersion, 1200));
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") checkWebVersion();
  });
})();
