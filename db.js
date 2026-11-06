require("dotenv").config();
const { Pool } = require("pg");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres.cuzscmxlxkuagnljtued:helloworld%401234%2356@aws-0-eu-north-1.pooler.supabase.com:5432/postgres";

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

function formatSql(sql) {
  let paramIndex = 1;
  let formatted = sql
    .replace(/COLLATE\s+NOCASE/gi, '')
    .replace(/INSERT OR IGNORE INTO/gi, 'INSERT INTO')
    .replace(/\?/g, () => `$${paramIndex++}`);

  if (sql.match(/INSERT OR IGNORE INTO/i) && !formatted.match(/ON CONFLICT/i)) {
    formatted += ' ON CONFLICT DO NOTHING';
  }

  if (
    /^\s*INSERT\s+INTO\s+(users|interests|connections|messages|communities|community_messages)\b/i.test(formatted) &&
    !/RETURNING/i.test(formatted) &&
    !/\bSELECT\b/i.test(formatted)
  ) {
    formatted += ' RETURNING id';
  }

  return formatted;
}

const db = {
  pool,
  async query(sql, params = []) {
    const flatParams = params.flat();
    const formatted = formatSql(sql);
    return pool.query(formatted, flatParams);
  },
  async get(sql, ...params) {
    const flatParams = params.flat();
    const formatted = formatSql(sql);
    const res = await pool.query(formatted, flatParams);
    return res.rows[0] || null;
  },
  async all(sql, ...params) {
    const flatParams = params.flat();
    const formatted = formatSql(sql);
    const res = await pool.query(formatted, flatParams);
    return res.rows;
  },
  async run(sql, ...params) {
    const flatParams = params.flat();
    const formatted = formatSql(sql);
    const res = await pool.query(formatted, flatParams);
    return {
      changes: res.rowCount,
      lastInsertRowid: res.rows[0]?.id
    };
  }
};

const sessionStore = new pgSession({
  pool,
  tableName: "session",
  createTableIfMissing: true
});

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

async function saveInterests(userId, interests) {
  const names = cleanInterests(interests);
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("DELETE FROM user_interests WHERE user_id = $1", [userId]);
    for (const name of names) {
      await client.query(
        "INSERT INTO interests (name) VALUES ($1) ON CONFLICT (name) DO NOTHING",
        [name]
      );
      const res = await client.query("SELECT id FROM interests WHERE name = $1", [name]);
      if (res.rows[0]) {
        await client.query(
          "INSERT INTO user_interests (user_id, interest_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
          [userId, res.rows[0].id]
        );
      }
    }
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

async function getProfile(userId) {
  const user = await db.get(
    "SELECT id, name, email, bio, photo_url, created_at, is_demo FROM users WHERE id = ?",
    userId
  );

  if (!user) return null;

  const interestsRows = await db.all(`
    SELECT i.name
    FROM interests i
    JOIN user_interests ui ON ui.interest_id = i.id
    WHERE ui.user_id = ?
    ORDER BY i.name
  `, userId);

  const interests = interestsRows.map(item => item.name);
  const storedBio = String(user.bio || "");
  const separator = storedBio.lastIndexOf(" • ");
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

async function getPublicProfile(userId) {
  const profile = await getProfile(userId);
  if (!profile) return null;
  const { email, ...publicProfile } = profile;
  return publicProfile;
}

const COMMUNITY_CATALOG = [
  { topic: "AI", name: "Neural Nexus", description: "A space for AI, machine learning, and curious builders.", emoji: "✦" },
  { topic: "Python", name: "PyVerse", description: "Share Python projects, scripts, learning paths, and clever solutions.", emoji: "🐍" },
  { topic: "Web Development", name: "Stack Society", description: "Build the web together — from clean UI to full-stack apps.", emoji: "💻" },
  { topic: "Startups", name: "Launchpad League", description: "Trade ideas, test concepts, and learn how products get built.", emoji: "🚀" },
  { topic: "Music", name: "Soundwave Circle", description: "For playlists, instruments, songwriting, and all things sound.", emoji: "🎵" },
  { topic: "Gaming", name: "Pixel Arena", description: "Gaming culture, game design, strategy, and friendly competition.", emoji: "🎮" },
  { topic: "Design", name: "Pixel Society", description: "A studio-like circle for UI/UX, graphics, product thinking, and visual craft.", emoji: "🎨" },
  { topic: "Robotics", name: "RoboRealm", description: "Robots, sensors, control systems, and hands-on engineering ideas.", emoji: "🤖" },
  { topic: "Psychology", name: "Mindscape Collective", description: "Explore human behaviour, habits, learning, and how people think.", emoji: "🧠" },
  { topic: "Photography", name: "FrameCraft", description: "Share compositions, visual stories, editing tips, and photo projects.", emoji: "📷" },
  { topic: "Finance", name: "FinFront", description: "Discuss finance basics, markets, fintech, and responsible money learning.", emoji: "📈" },
  { topic: "Movies", name: "Reel Club", description: "Film lovers sharing cinema, genres, storytelling, and recommendations.", emoji: "🎬" },
  { topic: "Data Science", name: "DataVerse", description: "Find patterns, explore datasets, and turn data into useful stories.", emoji: "📊" },
  { topic: "Cybersecurity", name: "CyberShield", description: "Learn about application security, privacy, and defensive security.", emoji: "🛡️" },
  { topic: "IoT", name: "CircuitVerse", description: "Connected devices, microcontrollers, sensors, and embedded projects.", emoji: "⚡" },
  { topic: "Writing", name: "Wordsmith Collective", description: "A home for essays, stories, ideas, and creative writing.", emoji: "✍️" },
  { topic: "Fitness", name: "Pulse Tribe", description: "Build healthy habits, share activity goals, and learn together.", emoji: "🏃" },
  { topic: "Astronomy", name: "Orbit Society", description: "Space, astronomy, stargazing, and the questions beyond Earth.", emoji: "🔭" }
];

const TEAM_DEMO_ACCOUNTS = [
  { name: "Punit", email: "punit@iiitnr.edu.in", bio: "Student exploring AI, web development, and building useful projects • Raipur", interests: ["AI", "Python", "Web Development", "Startups"], city: "Raipur" },
  { name: "Sahil", email: "sahil@iiitnr.edu.in", bio: "Student interested in problem-solving, software projects, and learning by building • Naya Raipur", interests: ["Python", "Data Science", "Cybersecurity"], city: "Naya Raipur" }
];

async function seedDemoData() {
  for (const community of COMMUNITY_CATALOG) {
    await db.run(`
      INSERT INTO communities (topic, name, description, emoji)
      VALUES (?, ?, ?, ?)
      ON CONFLICT (topic) DO UPDATE SET
        name = excluded.name,
        description = excluded.description,
        emoji = excluded.emoji
    `, community.topic, community.name, community.description, community.emoji);
  }

  const teamPasswordHash = bcrypt.hashSync("69696969", 10);
  for (const demo of TEAM_DEMO_ACCOUNTS) {
    const existing = await db.get("SELECT id FROM users WHERE email = ?", demo.email);
    let userId;
    if (existing) {
      userId = existing.id;
      await db.run("UPDATE users SET name = ?, bio = ?, is_demo = 0, password_hash = ? WHERE id = ?",
        demo.name, demo.bio, teamPasswordHash, userId
      );
    } else {
      const res = await db.run("INSERT INTO users (name, email, password_hash, bio, is_demo) VALUES (?, ?, ?, ?, 0)",
        demo.name, demo.email, teamPasswordHash, demo.bio
      );
      userId = Number(res.lastInsertRowid);
    }
    await saveInterests(userId, demo.interests);
    for (const interest of demo.interests) {
      await db.run(`
        INSERT INTO community_members (community_id, user_id)
        SELECT id, ? FROM communities WHERE topic = ?
        ON CONFLICT DO NOTHING
      `, userId, interest);
    }
  }
}

async function initDb() {
  try {
    const check = await pool.query("SELECT 1 FROM communities LIMIT 1");
    if (check && check.rows.length > 0) {
      console.log("Supabase PostgreSQL connected and ready.");
      return;
    }
  } catch (_) {
    // If table doesn't exist, proceed to create
  }

  const schema = `
  CREATE TABLE IF NOT EXISTS "session" (
    "sid" varchar NOT NULL COLLATE "default",
    "sess" json NOT NULL,
    "expire" timestamp(6) NOT NULL,
    CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
  );
  CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");

  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    bio TEXT DEFAULT '',
    photo_url TEXT DEFAULT '',
    is_demo INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS interests (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS user_interests (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    interest_id INTEGER NOT NULL REFERENCES interests(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, interest_id)
  );

  CREATE TABLE IF NOT EXISTS connections (
    id SERIAL PRIMARY KEY,
    requester_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(requester_id, recipient_id),
    CHECK (requester_id != recipient_id)
  );

  CREATE INDEX IF NOT EXISTS idx_connections_recipient ON connections(recipient_id, status);

  CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    body TEXT DEFAULT '',
    image_url TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_messages_chat ON messages(sender_id, recipient_id, id);

  CREATE TABLE IF NOT EXISTS communities (
    id SERIAL PRIMARY KEY,
    topic TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    emoji TEXT NOT NULL DEFAULT '✦',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS community_members (
    community_id INTEGER NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (community_id, user_id)
  );

  CREATE INDEX IF NOT EXISTS idx_community_members_user ON community_members(user_id);
  CREATE INDEX IF NOT EXISTS idx_community_members_community ON community_members(community_id);

  CREATE TABLE IF NOT EXISTS community_messages (
    id SERIAL PRIMARY KEY,
    community_id INTEGER NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_community_messages_history ON community_messages(community_id, id);
  `;

  await pool.query(schema);
  await seedDemoData();
  console.log("Supabase PostgreSQL initialized and seeded successfully.");
}

module.exports = {
  pool,
  db,
  sessionStore,
  cleanInterests,
  saveInterests,
  getProfile,
  getPublicProfile,
  COMMUNITY_CATALOG,
  initDb
};
