require("dotenv").config();
const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const Database = require("better-sqlite3");
const multer = require("multer");
const helmet = require("helmet");
const { rateLimit } = require("express-rate-limit");
const http = require("http");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = Number(process.env.PORT) || 3000;
const ROOT = __dirname;
const uploadDir = path.join(ROOT, "uploads");

fs.mkdirSync(uploadDir, { recursive: true });

app.disable("x-powered-by");

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    hsts: false
  })
);

app.use(express.json({ limit: "1mb" }));

function getSessionSecret() {
  const envSecret = process.env.SESSION_SECRET;

  if (envSecret && envSecret.length >= 32) {
    return envSecret;
  }

  const secretPath = path.join(ROOT, ".session-secret");

  try {
    const existing = fs.readFileSync(secretPath, "utf8").trim();

    if (existing.length >= 32) {
      return existing;
    }
  } catch (_) {
  }

  const secret = crypto.randomBytes(48).toString("hex");

  fs.writeFileSync(secretPath, secret, { mode: 0o600 });

  return secret;
}

class SQLiteSessionStore extends session.Store {
  constructor(filename) {
    super();

    this.database = new Database(filename);

    this.database.pragma("journal_mode = WAL");

    this.database.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        sid TEXT PRIMARY KEY,
        sess TEXT NOT NULL,
        expires INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_sessions_expires
      ON sessions(expires);
    `);

    this.getStatement = this.database.prepare(`
      SELECT sess, expires
      FROM sessions
      WHERE sid = ?
    `);

    this.setStatement = this.database.prepare(`
      INSERT INTO sessions (sid, sess, expires)
      VALUES (?, ?, ?)
      ON CONFLICT(sid) DO UPDATE SET
        sess = excluded.sess,
        expires = excluded.expires
    `);

    this.deleteStatement = this.database.prepare(`
      DELETE FROM sessions WHERE sid = ?
    `);

    this.cleanupStatement = this.database.prepare(`
      DELETE FROM sessions WHERE expires <= ?
    `);
  }

  get(sid, callback) {
    try {
      const row = this.getStatement.get(sid);

      if (!row) return callback(null, null);

      if (row.expires <= Date.now()) {
        this.deleteStatement.run(sid);
        return callback(null, null);
      }

      callback(null, JSON.parse(row.sess));
    } catch (error) {
      callback(error);
    }
  }

  set(sid, sess, callback) {
    try {
      const cookie = sess.cookie || {};

      let expires = cookie.expires
        ? new Date(cookie.expires).getTime()
        : Date.now() + (Number(cookie.maxAge) || 86400000);

      if (!Number.isFinite(expires)) {
        expires = Date.now() + 86400000;
      }

      if (expires <= Date.now()) {
        this.deleteStatement.run(sid);
        return callback?.(null);
      }

      this.setStatement.run(sid, JSON.stringify(sess), expires);

      this.cleanupStatement.run(Date.now());

      callback?.(null);
    } catch (error) {
      callback?.(error);
    }
  }

  touch(sid, sess, callback) {
    this.set(sid, sess, callback);
  }

  destroy(sid, callback) {
    try {
      this.deleteStatement.run(sid);
      callback?.(null);
    } catch (error) {
      callback?.(error);
    }
  }

  clear(callback) {
    try {
      this.database.prepare("DELETE FROM sessions").run();
      callback?.(null);
    } catch (error) {
      callback?.(error);
    }
  }

  length(callback) {
    try {
      this.cleanupStatement.run(Date.now());

      const row = this.database
        .prepare("SELECT COUNT(*) AS count FROM sessions")
        .get();

      callback(null, row.count);
    } catch (error) {
      callback(error);
    }
  }

  all(callback) {
    try {
      this.cleanupStatement.run(Date.now());

      const rows = this.database
        .prepare("SELECT sess FROM sessions WHERE expires > ?")
        .all(Date.now());

      callback(null, rows.map(row => JSON.parse(row.sess)));
    } catch (error) {
      callback(error);
    }
  }
}

const sessionStore = new SQLiteSessionStore(
  path.join(ROOT, "skillmate-sessions.sqlite")
);

const sessionMiddleware = session({
  name: "skillmate.sid",
  store: sessionStore,
  secret: getSessionSecret(),
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 7 * 24 * 60 * 60 * 1000
  }
});

app.use(sessionMiddleware);
io.engine.use(sessionMiddleware);

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    error: "Too many login attempts. Please try again in 15 minutes."
  },
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json(options.message);
  }
});

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    error: "Too many registration attempts. Please try again in 15 minutes."
  },
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json(options.message);
  }
});

const db = new Database(path.join(ROOT, "skillmate.sqlite"));

db.pragma("foreign_keys = ON");
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    bio TEXT DEFAULT '',
    photo_url TEXT DEFAULT '',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS interests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS user_interests (
    user_id INTEGER NOT NULL,
    interest_id INTEGER NOT NULL,
    PRIMARY KEY (user_id, interest_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (interest_id) REFERENCES interests(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS connections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    requester_id INTEGER NOT NULL,
    recipient_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending'
      CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(requester_id, recipient_id),
    CHECK (requester_id != recipient_id),
    FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,
    recipient_id INTEGER NOT NULL,
    body TEXT DEFAULT '',
    image_url TEXT DEFAULT '',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_messages_chat
  ON messages(sender_id, recipient_id, id);

  CREATE INDEX IF NOT EXISTS idx_connections_recipient
  ON connections(recipient_id, status);
`);

const userColumns = db.pragma("table_info(users)");

if (!userColumns.some(column => column.name === "is_demo")) {
  db.exec("ALTER TABLE users ADD COLUMN is_demo INTEGER NOT NULL DEFAULT 0");
}

db.exec(`
  CREATE TABLE IF NOT EXISTS communities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    emoji TEXT NOT NULL DEFAULT '✦',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS community_members (
    community_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    joined_at TEXT DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (community_id, user_id),
    FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_community_members_user
  ON community_members(user_id);

  CREATE INDEX IF NOT EXISTS idx_community_members_community
  ON community_members(community_id);

  CREATE TABLE IF NOT EXISTS community_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    community_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    body TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_community_messages_history
  ON community_messages(community_id, id);
`);

console.log("Application database connected.");
console.log("Persistent session storage connected.");

function cleanInterests(value) {
  if (!Array.isArray(value)) return [];

  return [
    ...new Set(
      value
        .filter(item => typeof item === "string")
        .map(item => item.trim().slice(0, 40))
        .filter(Boolean)
    )
  ].slice(0, 20);
}

const replaceInterestsTransaction = db.transaction((userId, names) => {
  db.prepare("DELETE FROM user_interests WHERE user_id = ?")
    .run(userId);

  const addInterest = db.prepare(`
    INSERT OR IGNORE INTO interests (name) VALUES (?)
  `);

  const findInterest = db.prepare(`
    SELECT id FROM interests WHERE name = ?
  `);

  const linkInterest = db.prepare(`
    INSERT OR IGNORE INTO user_interests (user_id, interest_id)
    VALUES (?, ?)
  `);

  for (const name of names) {
    addInterest.run(name);

    const interest = findInterest.get(name);

    if (interest) {
      linkInterest.run(userId, interest.id);
    }
  }
});

function saveInterests(userId, interests) {
  replaceInterestsTransaction(userId, cleanInterests(interests));
}

function getProfile(userId) {
  const user = db.prepare(`
    SELECT id, name, email, bio, photo_url, created_at, is_demo
    FROM users
    WHERE id = ?
  `).get(userId);

  if (!user) return null;

  const interests = db.prepare(`
    SELECT i.name
    FROM interests i
    JOIN user_interests ui ON ui.interest_id = i.id
    WHERE ui.user_id = ?
    ORDER BY i.name COLLATE NOCASE
  `).all(userId).map(item => item.name);

  const storedBio = String(user.bio || "");
  const separator = storedBio.lastIndexOf(" · ");
  const bio = separator >= 0 ? storedBio.slice(0, separator) : storedBio;
  const city = separator >= 0 ? storedBio.slice(separator + 3) : "";

  return {
    ...user,
    bio,
    city,
    is_demo: Boolean(user.is_demo),
    interests
  };
}

function getPublicProfile(userId) {
  const profile = getProfile(userId);

  if (!profile) return null;

  const { email, ...publicProfile } = profile;

  return publicProfile;
}

const COMMUNITY_CATALOG = [
  { topic: "AI", name: "Neural Nexus", description: "A space for AI, machine learning, and curious builders.", emoji: "✦" },
  { topic: "Python", name: "PyVerse", description: "Share Python projects, scripts, learning paths, and clever solutions.", emoji: "🐍" },
  { topic: "Web Development", name: "Stack Society", description: "Build the web together—from clean UI to full-stack apps.", emoji: "⌘" },
  { topic: "Startups", name: "Launchpad League", description: "Trade ideas, test concepts, and learn how products get built.", emoji: "🚀" },
  { topic: "Music", name: "Soundwave Circle", description: "For playlists, instruments, songwriting, and all things sound.", emoji: "♫" },
  { topic: "Gaming", name: "Pixel Arena", description: "Gaming culture, game design, strategy, and friendly competition.", emoji: "🎮" },
  { topic: "Design", name: "Pixel Society", description: "A studio-like circle for UI/UX, graphics, product thinking, and visual craft.", emoji: "🎨" },
  { topic: "Robotics", name: "RoboRealm", description: "Robots, sensors, control systems, and hands-on engineering ideas.", emoji: "🤖" },
  { topic: "Psychology", name: "Mindscape Collective", description: "Explore human behaviour, habits, learning, and how people think.", emoji: "☼" },
  { topic: "Photography", name: "FrameCraft", description: "Share compositions, visual stories, editing tips, and photo projects.", emoji: "📷" },
  { topic: "Finance", name: "FinFront", description: "Discuss finance basics, markets, fintech, and responsible money learning.", emoji: "₹" },
  { topic: "Movies", name: "Reel Club", description: "Film lovers sharing cinema, genres, storytelling, and recommendations.", emoji: "🎬" },
  { topic: "Data Science", name: "DataVerse", description: "Find patterns, explore datasets, and turn data into useful stories.", emoji: "▦" },
  { topic: "Cybersecurity", name: "CyberShield", description: "Learn about application security, privacy, and defensive security.", emoji: "🛡" },
  { topic: "IoT", name: "CircuitVerse", description: "Connected devices, microcontrollers, sensors, and embedded projects.", emoji: "⌁" },
  { topic: "Writing", name: "Wordsmith Collective", description: "A home for essays, stories, ideas, and creative writing.", emoji: "✎" },
  { topic: "Fitness", name: "Pulse Tribe", description: "Build healthy habits, share activity goals, and learn together.", emoji: "⚡" },
  { topic: "Astronomy", name: "Orbit Society", description: "Space, astronomy, stargazing, and the questions beyond Earth.", emoji: "☄" }
];

const TEAM_DEMO_ACCOUNTS = [
  { name: "Punit", email: "punit@iiitnr.edu.in", bio: "Student exploring AI, web development, and building useful projects · Raipur", interests: ["AI", "Python", "Web Development", "Startups"], city: "Raipur" },
  { name: "Sahil", email: "sahil@iiitnr.edu.in", bio: "Student interested in problem-solving, software projects, and learning by building · Naya Raipur", interests: ["Python", "Data Science", "Cybersecurity"], city: "Naya Raipur" },
  { name: "Nilesh", email: "nilesh@iiitnr.edu.in", bio: "Student exploring machine learning, data analysis, and technology research · Naya Raipur", interests: ["AI", "Data Science", "Astronomy"], city: "Naya Raipur" },
  { name: "Jayesh", email: "jayesh@iiitnr.edu.in", bio: "Student focused on web experiences, creative interfaces, and game ideas · Raipur", interests: ["Web Development", "Design", "Gaming"], city: "Raipur" },
  { name: "Abhinav", email: "abhinav@iiitnr.edu.in", bio: "Student interested in robotics, connected devices, and secure systems · Naya Raipur", interests: ["Robotics", "IoT", "Cybersecurity"], city: "Naya Raipur" },
  { name: "Yagyesh", email: "yagyesh@iiitnr.edu.in", bio: "Student curious about startups, finance, and building collaborative ideas · Raipur", interests: ["Finance", "Startups", "Gaming", "Music"], city: "Raipur" }
];

const PREVIEW_MEMBER_ACCOUNTS = [
  { name: "Aanya Mehta", email: "preview-01@skillmate.test", bio: "Student developer exploring AI-powered apps and Python projects · Raipur", interests: ["AI", "Python", "Web Development"], city: "Raipur" },
  { name: "Aarav Sharma", email: "preview-02@skillmate.test", bio: "Student curious about machine learning, data, and useful automation · Naya Raipur", interests: ["AI", "Data Science", "Python"], city: "Naya Raipur" },
  { name: "Kavya Singh", email: "preview-03@skillmate.test", bio: "Student designer turning rough ideas into clean, usable interfaces · Naya Raipur", interests: ["Design", "Web Development", "Writing"], city: "Naya Raipur" },
  { name: "Kabir Shah", email: "preview-04@skillmate.test", bio: "Student gamer exploring game development and creative coding · Raipur", interests: ["Gaming", "Web Development", "AI"], city: "Raipur" },
  { name: "Myra Nair", email: "preview-05@skillmate.test", bio: "Student photographer interested in visual storytelling and film · Bilaspur", interests: ["Photography", "Movies", "Design"], city: "Bilaspur" },
  { name: "Rohan Iyer", email: "preview-06@skillmate.test", bio: "Student exploring startups, product building, and team collaboration · Naya Raipur", interests: ["Startups", "Web Development", "Finance"], city: "Naya Raipur" },
  { name: "Sana Khan", email: "preview-07@skillmate.test", bio: "Student interested in psychology, learning habits, and communication · Raipur", interests: ["Psychology", "Writing", "AI"], city: "Raipur" },
  { name: "Vihaan Das", email: "preview-08@skillmate.test", bio: "Student building electronics experiments and small IoT projects · Naya Raipur", interests: ["IoT", "Robotics", "Python"], city: "Naya Raipur" },
  { name: "Zoya Kapoor", email: "preview-09@skillmate.test", bio: "Student music lover exploring songwriting and creative tools · Durg", interests: ["Music", "Writing", "Design"], city: "Durg" },
  { name: "Aditya Verma", email: "preview-10@skillmate.test", bio: "Student curious about entrepreneurship, finance, and fintech · Naya Raipur", interests: ["Finance", "Startups", "Data Science"], city: "Naya Raipur" },
  { name: "Neel Joshi", email: "preview-11@skillmate.test", bio: "Student exploring cyber safety and secure application design · Raipur", interests: ["Cybersecurity", "Web Development", "Python"], city: "Raipur" },
  { name: "Priya Desai", email: "preview-12@skillmate.test", bio: "Student writer who enjoys stories, essays, and digital publishing · Naya Raipur", interests: ["Writing", "Movies", "Psychology"], city: "Naya Raipur" },
  { name: "Farhan Ali", email: "preview-13@skillmate.test", bio: "Student exploring wellness, fitness, and data-driven habits · Durg", interests: ["Fitness", "Data Science", "Psychology"], city: "Durg" },
  { name: "Tanvi Jain", email: "preview-14@skillmate.test", bio: "Student curious about astronomy, space science, and Python visualisations · Raipur", interests: ["Astronomy", "Python", "AI"], city: "Raipur" },
  { name: "Mihir Reddy", email: "preview-15@skillmate.test", bio: "Student analytics enthusiast working with datasets and visual stories · Naya Raipur", interests: ["Data Science", "AI", "Finance"], city: "Naya Raipur" },
  { name: "Diya Bose", email: "preview-16@skillmate.test", bio: "Student UI/UX learner interested in product research and design systems · Bilaspur", interests: ["Design", "Psychology", "Web Development"], city: "Bilaspur" },
  { name: "Parth Kulkarni", email: "preview-17@skillmate.test", bio: "Student exploring hardware, robotics, and embedded projects · Raipur", interests: ["Robotics", "IoT", "Cybersecurity"], city: "Raipur" },
  { name: "Avni Mishra", email: "preview-18@skillmate.test", bio: "Student interested in independent music, movies, and creative communities · Naya Raipur", interests: ["Music", "Movies", "Photography"], city: "Naya Raipur" },
  { name: "Samar Bhat", email: "preview-19@skillmate.test", bio: "Student learning web technologies and building responsive interfaces · Durg", interests: ["Web Development", "Python", "Design"], city: "Durg" },
  { name: "Rhea Malhotra", email: "preview-20@skillmate.test", bio: "Student startup enthusiast curious about new products and community ideas · Raipur", interests: ["Startups", "Finance", "Writing"], city: "Raipur" },
  { name: "Yash Sinha", email: "preview-21@skillmate.test", bio: "Student exploring secure software, coding challenges, and open learning · Naya Raipur", interests: ["Cybersecurity", "Python", "Data Science"], city: "Naya Raipur" },
  { name: "Nisha Menon", email: "preview-22@skillmate.test", bio: "Student interested in finance, investing basics, and analytics · Raipur", interests: ["Finance", "Data Science", "Writing"], city: "Raipur" },
  { name: "Shaurya Chopra", email: "preview-23@skillmate.test", bio: "Student game-development learner interested in AI and graphics · Naya Raipur", interests: ["Gaming", "AI", "Web Development"], city: "Naya Raipur" },
  { name: "Arjun Rao", email: "preview-24@skillmate.test", bio: "Student photographer combining design, film, and storytelling · Raipur", interests: ["Photography", "Design", "Movies"], city: "Raipur" },
  { name: "Meera Pillai", email: "preview-25@skillmate.test", bio: "Student wellness enthusiast exploring psychology and fitness data · Naya Raipur", interests: ["Fitness", "Psychology", "Data Science"], city: "Naya Raipur" }
];

function requireLogin(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({
      error: "Please log in first."
    });
  }
  next();
}

function seedDemoData() {
  const upsertCommunity = db.prepare(`
    INSERT INTO communities (topic, name, description, emoji)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(topic) DO UPDATE SET
      name = excluded.name,
      description = excluded.description,
      emoji = excluded.emoji
  `);

  const findUser = db.prepare("SELECT id FROM users WHERE email = ?");

  const insertUser = db.prepare(`
    INSERT INTO users (name, email, password_hash, bio, is_demo)
    VALUES (?, ?, ?, ?, ?)
  `);

  const updateUser = db.prepare(`
    UPDATE users SET name = ?, bio = ?, is_demo = ?, password_hash = ?
    WHERE id = ?
  `);

  const joinCommunity = db.prepare(`
    INSERT OR IGNORE INTO community_members (community_id, user_id)
    SELECT id, ? FROM communities WHERE topic = ?
  `);

  const teamPasswordHash = bcrypt.hashSync("69696969", 10);

  const privatePreviewPasswordHash = bcrypt.hashSync(
    crypto.randomBytes(32).toString("hex"), 10
  );

  const seedTransaction = db.transaction(() => {
    COMMUNITY_CATALOG.forEach(community => {
      upsertCommunity.run(
        community.topic,
        community.name,
        community.description,
        community.emoji
      );
    });

    const allSeedAccounts = process.env.NODE_ENV === "production"
      ? []
      : [
          ...TEAM_DEMO_ACCOUNTS.map(profile => ({ ...profile, isDemo: 0, passwordHash: teamPasswordHash })),
          ...PREVIEW_MEMBER_ACCOUNTS.map(profile => ({ ...profile, isDemo: 1, passwordHash: privatePreviewPasswordHash }))
        ];

    for (const profile of allSeedAccounts) {
      const email = profile.email.toLowerCase();
      const bio = `${profile.bio.split(" · ").slice(0, -1).join(" · ")} · ${profile.city}`.slice(0, 500);
      const existing = findUser.get(email);
      let userId;

      if (existing) {
        userId = Number(existing.id);
        updateUser.run(
          profile.name,
          bio,
          profile.isDemo,
          profile.passwordHash,
          userId
        );
      } else {
        const inserted = insertUser.run(
          profile.name,
          email,
          profile.passwordHash,
          bio,
          profile.isDemo
        );
        userId = Number(inserted.lastInsertRowid);
      }

      saveInterests(userId, profile.interests);

      if (profile.isDemo) {
        for (const topic of profile.interests) {
          joinCommunity.run(userId, topic);
        }
      }
    }
  });

  seedTransaction();
}

seedDemoData();

function isConnected(userA, userB) {
  return Boolean(db.prepare(`
    SELECT id
    FROM connections
    WHERE status = 'accepted'
      AND (
        (requester_id = ? AND recipient_id = ?)
        OR
        (requester_id = ? AND recipient_id = ?)
      )
  `).get(userA, userB, userB, userA));
}

function getMessage(messageId) {
  return db.prepare(`
    SELECT id, sender_id, recipient_id, body, image_url, created_at
    FROM messages
    WHERE id = ?
  `).get(messageId);
}

function establishSession(req, res, next, userId, status, message) {
  req.session.regenerate(error => {
    if (error) return next(error);

    req.session.userId = userId;

    req.session.save(saveError => {
      if (saveError) return next(saveError);

      res.status(status).json({
        message,
        user: getProfile(userId)
      });
    });
  });
}

app.get("/", (req, res, next) => {
  fs.readFile(path.join(ROOT, "index.html"), "utf8", (error, html) => {
    if (error) return next(error);

    const chatScript = '<script src="/community-chat-client.js"></script>';

    const page = html.includes("/community-chat-client.js")
      ? html
      : html.replace(/<\/body>/i, `${chatScript}\n</body>`);

    res.type("html").send(page);
  });
});

app.get("/community-chat-client.js", (req, res) => {
  res.sendFile(path.join(ROOT, "community-chat-client.js"));
});

app.get("/style.css", (req, res) => {
  res.sendFile(path.join(ROOT, "style.css"));
});

app.get("/script.js", (req, res) => {
  res.sendFile(path.join(ROOT, "script.js"));
});

app.use("/uploads", express.static(uploadDir));

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "SkillMate backend is running."
  });
});

app.post(
  "/api/auth/register",
  registerLimiter,
  (req, res, next) => {
    try {
      const {
        name,
        email,
        password,
        bio = "",
        interests = []
      } = req.body;

      if (
        typeof name !== "string" ||
        typeof email !== "string" ||
        typeof password !== "string" ||
        !name.trim() ||
        !email.trim() ||
        password.length < 8 ||
        password.length > 128
      ) {
        return res.status(400).json({
          error: "Enter your name and email. Password must be 8–128 characters."
        });
      }

      const normalizedEmail = email.trim().toLowerCase();

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        return res.status(400).json({
          error: "Enter a valid email address."
        });
      }

      if (db.prepare("SELECT id FROM users WHERE email = ?")
        .get(normalizedEmail)) {
        return res.status(409).json({
          error: "An account with this email already exists."
        });
      }

      const passwordHash = bcrypt.hashSync(password, 12);

      const result = db.prepare(`
        INSERT INTO users (name, email, password_hash, bio)
        VALUES (?, ?, ?, ?)
      `).run(
        name.trim().slice(0, 80),
        normalizedEmail,
        passwordHash,
        typeof bio === "string" ? bio.trim().slice(0, 500) : ""
      );

      const userId = Number(result.lastInsertRowid);

      saveInterests(userId, interests);

      establishSession(
        req,
        res,
        next,
        userId,
        201,
        "Account created successfully."
      );
    } catch (error) {
      next(error);
    }
  }
);

app.post(
  "/api/auth/login",
  loginLimiter,
  (req, res, next) => {
    try {
      const { email, password } = req.body;

      if (
        typeof email !== "string" ||
        typeof password !== "string"
      ) {
        return res.status(400).json({
          error: "Enter email and password."
        });
      }

      const user = db.prepare(`
        SELECT id, password_hash
        FROM users
        WHERE email = ?
      `).get(email.trim().toLowerCase());

      if (!user || !bcrypt.compareSync(password, user.password_hash)) {
        return res.status(401).json({
          error: "Incorrect email or password."
        });
      }

      establishSession(
        req,
        res,
        next,
        user.id,
        200,
        "Login successful."
      );
    } catch (error) {
      next(error);
    }
  }
);

app.post("/api/auth/logout", (req, res, next) => {
  req.session.destroy(error => {
    if (error) return next(error);

    res.clearCookie("skillmate.sid", {
      httpOnly: true,
      sameSite: "lax",
      secure: false
    });

    res.json({ message: "Logged out successfully." });
  });
});

app.get("/api/auth/me", requireLogin, (req, res) => {
  const user = getProfile(req.session.userId);

  if (!user) {
    return res.status(401).json({
      error: "Account not found."
    });
  }

  res.json({ user });
});

app.put("/api/profile", requireLogin, (req, res) => {
  const { name, bio, interests } = req.body;
  const userId = req.session.userId;

  if (name !== undefined) {
    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        error: "Name cannot be empty."
      });
    }

    db.prepare("UPDATE users SET name = ? WHERE id = ?")
      .run(name.trim().slice(0, 80), userId);
  }

  if (bio !== undefined) {
    if (typeof bio !== "string") {
      return res.status(400).json({
        error: "Invalid bio."
      });
    }

    db.prepare("UPDATE users SET bio = ? WHERE id = ?")
      .run(bio.trim().slice(0, 500), userId);
  }

  if (interests !== undefined) {
    saveInterests(userId, interests);
  }

  res.json({
    message: "Profile updated.",
    user: getProfile(userId)
  });
});

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, uploadDir);
  },
  filename: (req, file, callback) => {
    const extensions = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
      "image/gif": ".gif"
    };

    const extension = extensions[file.mimetype];

    if (!extension) {
      return callback(
        new Error("Upload a JPG, PNG, WEBP or GIF image.")
      );
    }

    callback(
      null,
      `${Date.now()}-${crypto.randomBytes(12).toString("hex")}${extension}`
    );
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    const allowed = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif"
    ];

    if (!allowed.includes(file.mimetype)) {
      return callback(
        new Error("Upload a JPG, PNG, WEBP or GIF image.")
      );
    }

    callback(null, true);
  }
});

app.post(
  "/api/upload/photo",
  requireLogin,
  upload.single("photo"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        error: "Choose a photo to upload."
      });
    }

    const photoUrl = `/uploads/${req.file.filename}`;

    db.prepare("UPDATE users SET photo_url = ? WHERE id = ?")
      .run(photoUrl, req.session.userId);

    res.json({
      message: "Photo uploaded.",
      photo_url: photoUrl
    });
  }
);

app.get("/api/profiles", (req, res) => {
  const search = String(req.query.search || "").trim().slice(0, 100);
  const interest = String(req.query.interest || "").trim().slice(0, 40);
  const currentUserId = Number(req.session?.userId || 0);
  const pattern = `%${search}%`;

  let users = db.prepare(`
    SELECT id
    FROM users
    WHERE id != ?
      AND (
        ? = ''
        OR name LIKE ?
        OR bio LIKE ?
      )
    ORDER BY name COLLATE NOCASE
    LIMIT 100
  `).all(currentUserId, search, pattern, pattern);

  users = users.map(user => getPublicProfile(user.id)).filter(Boolean);

  if (interest) {
    users = users.filter(user =>
      user.interests.some(item => item.toLowerCase() === interest.toLowerCase())
    );
  }

  res.json({ profiles: users });
});

app.post("/api/connections/request/:userId", requireLogin, (req, res) => {
  const requesterId = req.session.userId;
  const recipientId = Number(req.params.userId);

  if (!Number.isInteger(recipientId) || recipientId <= 0) {
    return res.status(400).json({ error: "Invalid user." });
  }

  if (recipientId === requesterId) {
    return res.status(400).json({
      error: "You cannot connect with yourself."
    });
  }

  if (!db.prepare("SELECT id FROM users WHERE id = ?").get(recipientId)) {
    return res.status(404).json({ error: "User not found." });
  }

  const existing = db.prepare(`
    SELECT *
    FROM connections
    WHERE
      (requester_id = ? AND recipient_id = ?)
      OR
      (requester_id = ? AND recipient_id = ?)
  `).get(requesterId, recipientId, recipientId, requesterId);

  if (existing && existing.status !== "rejected") {
    return res.status(409).json({
      error: "A connection request or connection already exists."
    });
  }

  if (existing) {
    db.prepare("DELETE FROM connections WHERE id = ?").run(existing.id);
  }

  const result = db.prepare(`
    INSERT INTO connections (requester_id, recipient_id)
    VALUES (?, ?)
  `).run(requesterId, recipientId);

  res.status(201).json({
    message: "Connection request sent.",
    connectionId: Number(result.lastInsertRowid)
  });
});

app.get("/api/connections", requireLogin, (req, res) => {
  const userId = req.session.userId;

  const connections = db.prepare(`
    SELECT
      c.id AS connection_id,
      c.requester_id,
      c.recipient_id,
      c.status,
      c.created_at,
      CASE
        WHEN c.requester_id = ? THEN c.recipient_id
        ELSE c.requester_id
      END AS other_user_id
    FROM connections c
    WHERE c.requester_id = ? OR c.recipient_id = ?
    ORDER BY c.id DESC
  `).all(userId, userId, userId);

  res.json({
    connections: connections.map(connection => ({
      ...connection,
      user: getPublicProfile(connection.other_user_id)
    }))
  });
});

app.post("/api/connections/:id/accept", requireLogin, (req, res) => {
  const result = db.prepare(`
    UPDATE connections
    SET status = 'accepted'
    WHERE id = ?
      AND recipient_id = ?
      AND status = 'pending'
  `).run(Number(req.params.id), req.session.userId);

  if (!result.changes) {
    return res.status(404).json({
      error: "Pending request not found."
    });
  }

  res.json({ message: "Connection accepted." });
});

app.post("/api/connections/:id/reject", requireLogin, (req, res) => {
  const result = db.prepare(`
    UPDATE connections
    SET status = 'rejected'
    WHERE id = ?
      AND recipient_id = ?
      AND status = 'pending'
  `).run(Number(req.params.id), req.session.userId);

  if (!result.changes) {
    return res.status(404).json({
      error: "Connection request not found."
    });
  }

  res.json({ message: "Connection request declined." });
});

app.get("/api/messages/:userId", requireLogin, (req, res) => {
  const currentUserId = req.session.userId;
  const otherUserId = Number(req.params.userId);

  if (!Number.isInteger(otherUserId) || otherUserId <= 0) {
    return res.status(400).json({ error: "Invalid user." });
  }

  if (!isConnected(currentUserId, otherUserId)) {
    return res.status(403).json({
      error: "You must be connected before messaging."
    });
  }

  const messages = db.prepare(`
    SELECT id, sender_id, recipient_id, body, image_url, created_at
    FROM messages
    WHERE
      (sender_id = ? AND recipient_id = ?)
      OR
      (sender_id = ? AND recipient_id = ?)
    ORDER BY id DESC
    LIMIT 200
  `).all(
    currentUserId,
    otherUserId,
    otherUserId,
    currentUserId
  );

  res.json({ messages: messages.reverse() });
});

app.post("/api/messages/:userId", requireLogin, (req, res) => {
  const senderId = req.session.userId;
  const recipientId = Number(req.params.userId);

  const body = typeof req.body.body === "string"
    ? req.body.body.trim()
    : "";

  const imageUrl = typeof req.body.image_url === "string"
    ? req.body.image_url.trim()
    : "";

  if (!Number.isInteger(recipientId) || recipientId <= 0) {
    return res.status(400).json({ error: "Invalid recipient." });
  }

  if (!body && !imageUrl) {
    return res.status(400).json({
      error: "Message cannot be empty."
    });
  }

  if (body.length > 4000) {
    return res.status(400).json({
      error: "Message is too long."
    });
  }

  if (
    imageUrl &&
    !/^\/uploads\/[a-zA-Z0-9._-]+$/.test(imageUrl)
  ) {
    return res.status(400).json({
      error: "Invalid image URL."
    });
  }

  if (!isConnected(senderId, recipientId)) {
    return res.status(403).json({
      error: "You must be connected before messaging."
    });
  }

  const result = db.prepare(`
    INSERT INTO messages (sender_id, recipient_id, body, image_url)
    VALUES (?, ?, ?, ?)
  `).run(senderId, recipientId, body, imageUrl);

  const message = getMessage(Number(result.lastInsertRowid));

  io.to(`user:${senderId}`).emit("message:new", message);
  io.to(`user:${recipientId}`).emit("message:new", message);

  res.status(201).json({ message });
});
io.on("connection", socket => {
  const userId = Number(socket.request.session?.userId || 0);

  if (!userId) {
    socket.disconnect(true);
    return;
  }

  socket.join(`user:${userId}`);

  const memberships = db.prepare(`
    SELECT community_id
    FROM community_members
    WHERE user_id = ?
  `).all(userId);

  memberships.forEach(row => {
    socket.join(`community:${row.community_id}`);
  });

  socket.on("community:join", rawCommunityId => {
    const communityId = Number(rawCommunityId);

    if (!Number.isSafeInteger(communityId) || communityId <= 0) return;

    const membership = db.prepare(`
      SELECT 1 FROM community_members
      WHERE community_id = ? AND user_id = ?
    `).get(communityId, userId);

    if (membership) socket.join(`community:${communityId}`);
  });

  socket.on("community:leave", rawCommunityId => {
    const communityId = Number(rawCommunityId);

    if (!Number.isSafeInteger(communityId) || communityId <= 0) return;

    socket.leave(`community:${communityId}`);
  });
});

app.get("/api/communities", (req, res) => {
  const userId = Number(req.session?.userId || 0);

  const communities = db.prepare(`
    SELECT
      c.id,
      c.topic,
      c.name,
      c.description,
      c.emoji,
      COUNT(DISTINCT cm.user_id) AS member_count,
      EXISTS(
        SELECT 1 FROM community_members mine
        WHERE mine.community_id = c.id AND mine.user_id = ?
      ) AS is_member
    FROM communities c
    LEFT JOIN community_members cm ON cm.community_id = c.id
    GROUP BY c.id
    ORDER BY c.topic COLLATE NOCASE
  `).all(userId).map(community => ({
    ...community,
    member_count: Number(community.member_count),
    is_member: Boolean(community.is_member)
  }));

  res.json({ communities });
});

app.post("/api/communities/join-my-interests", requireLogin, (req, res) => {
  const interests = cleanInterests(req.body.interests);

  if (!interests.length) {
    return res.status(400).json({
      error: "Select at least one interest first."
    });
  }

  const normalizedTopics = new Set(
    interests.map(value => value.toLowerCase())
  );

  const matching = COMMUNITY_CATALOG.filter(community =>
    normalizedTopics.has(community.topic.toLowerCase())
  );

  if (!matching.length) {
    return res.status(400).json({
      error: "No communities match those interests."
    });
  }

  const join = db.prepare(`
    INSERT OR IGNORE INTO community_members (community_id, user_id)
    SELECT id, ? FROM communities WHERE topic = ?
  `);

  const transaction = db.transaction(() => {
    matching.forEach(community =>
      join.run(req.session.userId, community.topic)
    );
  });

  transaction();

  matching.forEach(community => {
    const row = db.prepare(
      "SELECT id FROM communities WHERE topic = ?"
    ).get(community.topic);

    if (row) {
      io.in(`user:${req.session.userId}`)
        .socketsJoin(`community:${row.id}`);
    }
  });

  res.json({
    message: `Joined ${matching.length} ${matching.length === 1 ? "community" : "communities"} matching your selected interests.`,
    joined: matching.map(community => community.topic)
  });
});

app.post("/api/communities/:id/join", requireLogin, (req, res) => {
  const communityId = Number(req.params.id);

  if (!Number.isInteger(communityId) || communityId <= 0) {
    return res.status(400).json({ error: "Invalid community." });
  }

  const community = db.prepare(
    "SELECT id FROM communities WHERE id = ?"
  ).get(communityId);

  if (!community) {
    return res.status(404).json({ error: "Community not found." });
  }

  const result = db.prepare(`
    INSERT OR IGNORE INTO community_members (community_id, user_id)
    VALUES (?, ?)
  `).run(communityId, req.session.userId);

  io.in(`user:${req.session.userId}`)
    .socketsJoin(`community:${communityId}`);

  res.status(result.changes ? 201 : 200).json({
    message: result.changes
      ? "Joined community."
      : "You are already a member."
  });
});

app.post("/api/communities/:id/leave", requireLogin, (req, res) => {
  const communityId = Number(req.params.id);

  if (!Number.isInteger(communityId) || communityId <= 0) {
    return res.status(400).json({ error: "Invalid community." });
  }

  const result = db.prepare(`
    DELETE FROM community_members
    WHERE community_id = ? AND user_id = ?
  `).run(communityId, req.session.userId);

  io.in(`user:${req.session.userId}`)
    .socketsLeave(`community:${communityId}`);

  res.json({
    message: result.changes
      ? "Left community."
      : "You were not a member of this community."
  });
});

function getCommunityMessage(messageId) {
  return db.prepare(`
    SELECT
      cm.id,
      cm.community_id,
      cm.user_id,
      cm.body,
      cm.created_at,
      u.name AS sender_name,
      u.photo_url AS sender_photo_url
    FROM community_messages cm
    JOIN users u ON u.id = cm.user_id
    WHERE cm.id = ?
  `).get(messageId);
}

function isCommunityMember(communityId, userId) {
  return Boolean(db.prepare(`
    SELECT 1
    FROM community_members
    WHERE community_id = ? AND user_id = ?
  `).get(communityId, userId));
}

app.get("/api/communities/:id/messages", requireLogin, (req, res) => {
  const communityId = Number(req.params.id);

  if (!Number.isSafeInteger(communityId) || communityId <= 0) {
    return res.status(400).json({ error: "Invalid community." });
  }

  if (!isCommunityMember(communityId, req.session.userId)) {
    return res.status(403).json({
      error: "Join this community to view its group chat."
    });
  }

  const messages = db.prepare(`
    SELECT
      cm.id,
      cm.community_id,
      cm.user_id,
      cm.body,
      cm.created_at,
      u.name AS sender_name,
      u.photo_url AS sender_photo_url
    FROM community_messages cm
    JOIN users u ON u.id = cm.user_id
    WHERE cm.community_id = ?
    ORDER BY cm.id DESC
    LIMIT 200
  `).all(communityId).reverse();

  res.json({ messages });
});

app.post("/api/communities/:id/messages", requireLogin, (req, res) => {
  const communityId = Number(req.params.id);

  const body = typeof req.body?.body === "string"
    ? req.body.body.trim()
    : "";

  if (!Number.isSafeInteger(communityId) || communityId <= 0) {
    return res.status(400).json({ error: "Invalid community." });
  }

  if (!body) {
    return res.status(400).json({
      error: "Message cannot be empty."
    });
  }

  if (body.length > 2000) {
    return res.status(400).json({
      error: "Message must be 2,000 characters or less."
    });
  }

  if (!isCommunityMember(communityId, req.session.userId)) {
    return res.status(403).json({
      error: "Join this community before sending messages."
    });
  }

  const result = db.prepare(`
    INSERT INTO community_messages (community_id, user_id, body)
    VALUES (?, ?, ?)
  `).run(communityId, req.session.userId, body);

  const message = getCommunityMessage(
    Number(result.lastInsertRowid)
  );

  io.to(`community:${communityId}`)
    .emit("community:message:new", message);

  res.status(201).json({ message });
});

app.use("/api", (req, res) => {
  res.status(404).json({
    error: "API endpoint not found."
  });
});

app.use((error, req, res, next) => {
  console.error(error);

  if (res.headersSent) return next(error);

  if (error.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      error: "Photo must be 5 MB or smaller."
    });
  }

  if (error.message?.startsWith("Upload a JPG")) {
    return res.status(400).json({
      error: error.message
    });
  }

  if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
    return res.status(409).json({
      error: "That account or connection already exists."
    });
  }

  res.status(500).json({
    error: "An unexpected server error occurred."
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log("");
  console.log("SkillMate backend is running!");
  console.log(`Website: http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log("Application data: skillmate.sqlite");
  console.log("Session data: skillmate-sessions.sqlite");
  console.log("Security headers: enabled");
  console.log("Login/register rate limits: enabled");
  console.log("Press Ctrl+C to stop the server.");
  console.log("");
});