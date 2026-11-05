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
let visibleLimit = 8;
let communities = [];
const messageCache = new Map();

// Local cache for dummy profile connection requests
let requestedDemoProfiles = new Set();
try {
  const saved = JSON.parse(localStorage.getItem("skillmate_demo_requests") || "[]");
  if (Array.isArray(saved)) requestedDemoProfiles = new Set(saved);
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

function switchAuth(mode) {
  const login = mode !== "signup";
  $("#loginForm").style.display = login ? "block" : "none";
  $("#signupForm").style.display = login ? "none" : "block";
  $("#loginTab").classList.toggle("active", login);
  $("#signupTab").classList.toggle("active", !login);

  if (!login) {
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
  button.textContent = show ? "◌" : "◉";
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

  window.dispatchEvent(new CustomEvent('auth-updated', { detail: currentUser }));
}

async function loginUser() {
  const email = clean($("#loginEmail")?.value);
  const password = $("#loginPassword")?.value || "";

  if (!email || !password) {
    showToast("Enter your email and password.");
    return;
  }

  const submitBtn = $("#loginForm .auth-submit");
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Logging in...";
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
    showToast(error.message || "Login failed.");
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Login to SkillMate <span>↗</span>';
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
    showToast("Please enter your name and email.");
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showToast("Enter a valid email address.");
    return;
  }
  if (isNew && password.length < 8) {
    showToast("Use a password with at least 8 characters.");
    return;
  }

  const finalInterests = interests.length > 0 ? interests : ["AI", "Python", "Web Development"];
  const bio = [role, city].filter(Boolean).join(" • ") || "SkillMate member";

  const submitBtn = $(".signup-submit");
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Creating profile...";
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
    showToast(error.message || "Failed to create account.");
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = (currentUser ? "Save profile changes" : "Create my profile") + ' <span>↗</span>';
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
  const demo = Boolean(profile.is_demo || profile.isDemo || String(profile.id).startsWith("preview-"));
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
  messageButton.textContent = "✉ Message";

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

    messageButton.addEventListener("click", () => {
      if (!currentUser) {
        showToast("Log in to view your connections and messages.");
        openModal("login");
        return;
      }
      showToast(`Connection pending. You can chat once ${profile.name} accepts.`);
    });
  } else {
    const relation = connectionsByUserId.get(Number(profile.id));

    if (relation?.status === "accepted") {
      connectButton.textContent = "✓ Connected";
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

    messageButton.addEventListener("click", () => {
      if (relation?.status !== "accepted") {
        showToast("Accept the connection before messaging.");
        return;
      }
      openChat(Number(profile.id));
    });
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

function renderMembers() {
  const people = $("#people");
  if (!people) return;

  const query = normalize($("#search")?.value);
  const topics = selectedFilterTopics();

  let profiles = allDisplayProfiles()
    .filter(profile => !currentUser || Number(profile.id) !== Number(currentUser.id))
    .map(profile => ({profile, match:getMatch(profile)}))
    .filter(item => !query || profileSearchText(item.profile).includes(query))
    .sort((a,b) =>
      b.match.score - a.match.score ||
      String(a.profile.name).localeCompare(String(b.profile.name))
    );

  if (recommendedOnly && topics.length) {
    profiles = profiles.filter(item => item.match.score > 0);
  }

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
    more.textContent = "Load more people ↓";
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
  $("#discover")?.scrollIntoView({behavior:"smooth"});
}

/* ---------- CONNECTIONS ---------- */

async function loadConnections() {
  if (!currentUser) {
    connectionRows = [];
    connectionsByUserId = new Map();
    renderContacts();
    if ($("#chatCount")) $("#chatCount").textContent = "0";
    return;
  }

  try {
    const result = await apiRequest(`${API}/connections`);
    connectionRows = result.connections || [];
    connectionsByUserId = new Map();

    connectionRows.forEach(row => {
      if (row.user) connectionsByUserId.set(Number(row.user.id), row);
    });

    const count = $("#chatCount");
    if (count) {
      count.textContent = String(connectionRows.filter(row => row.status === "accepted").length);
    }

    renderMembers();
    renderContacts();
  } catch (error) {
    showToast(error.message);
  }
}

async function connectMember(profile) {
  if (!currentUser) {
    showToast("Log in to send a connection request.");
    openModal("login");
    return;
  }

  if (profile.is_demo || !Number.isFinite(Number(profile.id))) {
    showToast("This profile is for preview only. Try connecting with a teammate account.");
    return;
  }

  try {
    await apiRequest(`${API}/connections/request/${profile.id}`, {method:"POST"});
    await loadConnections();
    showToast(`Connection request sent to ${profile.name}.`);
  } catch (error) {
    showToast(error.message);
  }
}

async function acceptConnection(connectionId) {
  try {
    await apiRequest(`${API}/connections/${connectionId}/accept`, {method:"POST"});
    await loadConnections();
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

function renderCommunities() {
  const grid = $("#communitiesGrid");
  if (!grid) return;

  const chosen = selectedFilterTopics().map(normalize);
  const ranked = [...communities].sort((a,b) => {
    const aMatch = chosen.includes(normalize(a.topic)) ? 1 : 0;
    const bMatch = chosen.includes(normalize(b.topic)) ? 1 : 0;
    return bMatch - aMatch || String(a.name).localeCompare(String(b.name));
  });

  grid.replaceChildren();

  ranked.forEach(community => {
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

    const action = document.createElement("button");
    action.type = "button";
    action.className = `community-action${community.is_member ? " joined" : ""}`;
    action.textContent = community.is_member ? "✓ Joined" : "Join circle";
    action.addEventListener("click", () =>
      community.is_member ? leaveCommunity(community.id) : joinCommunity(community.id)
    );

    bottom.append(count, action);
    card.append(top, title, description, bottom);
    grid.appendChild(card);
  });

  const summary = $("#communitySummary");
  if (summary) {
    const joined = communities.filter(item => item.is_member).length;
    summary.textContent = currentUser
      ? `${joined} circles joined · ${communities.length} communities available`
      : `${communities.length} interest circles · log in to join`;
  }
}

async function joinCommunity(id) {
  if (!currentUser) {
    showToast("Log in first to join a community.");
    openModal("login");
    return;
  }

  try {
    await apiRequest(`${API}/communities/${id}/join`, {method:"POST"});
    await loadCommunities();
    showToast("You joined the community!");
  } catch (error) {
    showToast(error.message);
  }
}

async function leaveCommunity(id) {
  try {
    await apiRequest(`${API}/communities/${id}/leave`, {method:"POST"});
    await loadCommunities();
    showToast("You left the community.");
  } catch (error) {
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

  socket = window.io();
  socket.on("message:new", message => {
    const otherId = Number(message.sender_id) === Number(currentUser.id)
      ? Number(message.recipient_id)
      : Number(message.sender_id);

    if (activeChatId === otherId) loadMessages(otherId);
    else if (Number(message.sender_id) !== Number(currentUser.id)) {
      showToast("You received a new message.");
    }
  });
}

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

  renderContacts();
  renderActiveChat();
  if (activeChatId) loadMessages(activeChatId);
  setTimeout(() => $("#chatInput")?.focus(), 200);
}

function closeChat() {
  chatDrawer?.classList.remove("open");
  chatDrawer?.setAttribute("aria-hidden","true");
  chatBackdrop?.classList.remove("open");
  document.body.classList.remove("chat-open");
}

function renderContacts() {
  if (!chatContacts) return;
  const query = normalize($("#chatSearch")?.value);
  chatContacts.replaceChildren();

  const contacts = connectedProfiles().filter(user =>
    normalize(`${user.name} ${(user.interests || []).join(" ")}`).includes(query)
  );

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
    $("#activeChatName").textContent = user?.name || "Your conversations";
  }

  if ($("#activeChatTopic")) {
    $("#activeChatTopic").textContent = user
      ? ((user.interests || []).join(" · ") || "SkillMate member")
      : "Connect with members to get started";
  }

  if ($("#chatInput")) $("#chatInput").disabled = !user;
  if ($(".send-button")) $(".send-button").disabled = !user;
  if ($(".composer-attach")) $(".composer-attach").disabled = !user;

  renderMessages();
}

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

/* ---------- MODAL KEYBOARD AND PHOTO SAFETY ---------- */

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeModal();
    closeChat();
    closeUserMenu();
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
  $("#chatBackdrop")?.addEventListener("click", () => closeChat());
}

/* ---------- INITIALISE ---------- */

async function initializeApp() {
  bindAuthModalListeners();
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
