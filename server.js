require("dotenv").config();
const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const helmet = require("helmet");
const { rateLimit } = require("express-rate-limit");
const http = require("http");
const path = require("path");
const fs = require("fs");
const { Server } = require("socket.io");
const crypto = require("crypto");
const {
  db,
  pool,
  sessionStore,
  saveInterests,
  getProfile,
  getPublicProfile,
  COMMUNITY_CATALOG,
  initDb
} = require("./db");

const app = express();
app.set("trust proxy", 1);
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: false }
});

const PORT = Number(process.env.PORT) || 3000;
const ROOT = __dirname;
const uploadDir = path.join(ROOT, "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "blob:"],
        connectSrc: ["'self'", "ws:", "wss:"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        frameAncestors: ["'none'"]
      }
    },
    crossOriginEmbedderPolicy: false
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

const sessionMiddleware = session({
  name: "skillmate.sid",
  store: sessionStore,
  secret: process.env.SESSION_SECRET || "skillmate-secure-session-secret-2026",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "lax",
    secure: "auto"
  }
});

app.use(sessionMiddleware);
io.engine.use(sessionMiddleware);

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many login attempts. Please try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  message: { error: "Too many accounts created from this IP. Please try again in an hour." },
  standardHeaders: true,
  legacyHeaders: false
});

function requireLogin(req, res, next) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: "Log in to continue." });
  }
  next();
}

function establishSession(req, res, next, userId, statusCode, successMessage) {
  req.session.regenerate(async error => {
    if (error) return next(error);

    req.session.userId = userId;

    req.session.save(async saveError => {
      if (saveError) return next(saveError);

      try {
        const user = await getProfile(userId);
        res.status(statusCode).json({
          message: successMessage,
          user
        });
      } catch (err) {
        next(err);
      }
    });
  });
}

async function isConnected(userA, userB) {
  const row = await db.get(`
    SELECT 1 FROM connections
    WHERE ((requester_id = ? AND recipient_id = ?) OR (requester_id = ? AND recipient_id = ?))
      AND status = 'accepted'
  `, userA, userB, userB, userA);
  return Boolean(row);
}

async function getMessage(messageId) {
  return db.get(`
    SELECT id, sender_id, recipient_id, body, image_url, created_at
    FROM messages
    WHERE id = ?
  `, messageId);
}

async function isCommunityMember(communityId, userId) {
  return Boolean(await db.get(`
    SELECT 1 FROM community_members
    WHERE community_id = ? AND user_id = ?
  `, communityId, userId));
}

async function getCommunityMessage(messageId) {
  return db.get(`
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
  `, messageId);
}

// Routes
app.get("/", (req, res, next) => {
  fs.readFile(path.join(ROOT, "index.html"), "utf8", (err, html) => {
    if (err) return next(err);
    const chatScript = '<script src="/community-chat-client.js"></script>';
    const page = html.includes("/community-chat-client.js")
      ? html
      : html.replace("</body>", `  ${chatScript}\n</body>`);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(page);
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

app.get("/favicon.png", (req, res) => {
  res.sendFile(path.join(ROOT, "favicon.png"));
});

app.use("/uploads", express.static(uploadDir));
app.use(express.static(ROOT));

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    database: "supabase_postgresql",
    time: new Date().toISOString()
  });
});

// Authentication
app.post("/api/auth/register", registerLimiter, async (req, res, next) => {
  try {
    const { name, email, password, bio = "", interests = [] } = req.body;

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
      return res.status(400).json({ error: "Enter a valid email address." });
    }

    const existing = await db.get("SELECT id FROM users WHERE email = ?", normalizedEmail);
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    const passwordHash = bcrypt.hashSync(password, 12);
    const result = await db.run(
      "INSERT INTO users (name, email, password_hash, bio) VALUES (?, ?, ?, ?)",
      name.trim().slice(0, 80),
      normalizedEmail,
      passwordHash,
      typeof bio === "string" ? bio.trim().slice(0, 500) : ""
    );

    const userId = Number(result.lastInsertRowid);
    await saveInterests(userId, interests);

    establishSession(req, res, next, userId, 201, "Account created successfully.");
  } catch (error) {
    next(error);
  }
});

app.post("/api/auth/login", loginLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({ error: "Enter email and password." });
    }

    const user = await db.get(
      "SELECT id, password_hash FROM users WHERE email = ?",
      email.trim().toLowerCase()
    );

    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: "Incorrect email or password." });
    }

    establishSession(req, res, next, user.id, 200, "Login successful.");
  } catch (error) {
    next(error);
  }
});

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

app.get("/api/auth/me", requireLogin, async (req, res, next) => {
  try {
    const user = await getProfile(req.session.userId);
    if (!user) return res.status(401).json({ error: "Account not found." });
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

app.put("/api/profile", requireLogin, async (req, res, next) => {
  try {
    const { name, bio, interests } = req.body;
    const userId = req.session.userId;

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({ error: "Name cannot be empty." });
      }
      await db.run("UPDATE users SET name = ? WHERE id = ?", name.trim().slice(0, 80), userId);
    }

    if (bio !== undefined) {
      if (typeof bio !== "string") {
        return res.status(400).json({ error: "Invalid bio." });
      }
      await db.run("UPDATE users SET bio = ? WHERE id = ?", bio.trim().slice(0, 500), userId);
    }

    if (interests !== undefined) {
      await saveInterests(userId, interests);
    }

    const updatedUser = await getProfile(userId);
    res.json({ message: "Profile updated.", user: updatedUser });
  } catch (error) {
    next(error);
  }
});

const storage = multer.diskStorage({
  destination: (req, file, callback) => callback(null, uploadDir),
  filename: (req, file, callback) => {
    const extensions = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
      "image/gif": ".gif"
    };
    const extension = extensions[file.mimetype];
    if (!extension) return callback(new Error("Upload a JPG, PNG, WEBP or GIF image."));
    callback(null, `${Date.now()}-${crypto.randomBytes(12).toString("hex")}${extension}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.mimetype)) {
      return callback(new Error("Upload a JPG, PNG, WEBP or GIF image."));
    }
    callback(null, true);
  }
});

app.post("/api/upload/photo", requireLogin, upload.single("photo"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Choose a photo to upload." });
    const photoUrl = `/uploads/${req.file.filename}`;
    await db.run("UPDATE users SET photo_url = ? WHERE id = ?", photoUrl, req.session.userId);
    res.json({ message: "Photo uploaded.", photo_url: photoUrl });
  } catch (error) {
    next(error);
  }
});

app.get("/api/profiles", async (req, res, next) => {
  try {
    const search = String(req.query.search || "").trim().slice(0, 100);
    const interest = String(req.query.interest || "").trim().slice(0, 40);
    const currentUserId = Number(req.session?.userId || 0);
    const pattern = `%${search}%`;

    const userRows = await db.all(`
      SELECT id
      FROM users
      WHERE id != ?
        AND (
          ? = ''
          OR name ILIKE ?
          OR bio ILIKE ?
        )
      ORDER BY name
      LIMIT 100
    `, currentUserId, search, pattern, pattern);

    let users = (await Promise.all(userRows.map(u => getPublicProfile(u.id)))).filter(Boolean);

    if (interest) {
      users = users.filter(user =>
        user.interests.some(item => item.toLowerCase() === interest.toLowerCase())
      );
    }

    res.json({ profiles: users });
  } catch (error) {
    next(error);
  }
});

// Connections
app.post("/api/connections/request/:userId", requireLogin, async (req, res, next) => {
  try {
    const requesterId = req.session.userId;
    const recipientId = Number(req.params.userId);

    if (!Number.isInteger(recipientId) || recipientId <= 0) {
      return res.status(400).json({ error: "Invalid user." });
    }

    if (recipientId === requesterId) {
      return res.status(400).json({ error: "You cannot connect with yourself." });
    }

    const targetUser = await db.get("SELECT id FROM users WHERE id = ?", recipientId);
    if (!targetUser) {
      return res.status(404).json({ error: "User not found." });
    }

    const existing = await db.get(`
      SELECT *
      FROM connections
      WHERE (requester_id = ? AND recipient_id = ?)
         OR (requester_id = ? AND recipient_id = ?)
    `, requesterId, recipientId, recipientId, requesterId);

    if (existing && existing.status !== "rejected") {
      return res.status(409).json({ error: "A connection request or connection already exists." });
    }

    if (existing) {
      await db.run("DELETE FROM connections WHERE id = ?", existing.id);
    }

    const result = await db.run(
      "INSERT INTO connections (requester_id, recipient_id) VALUES (?, ?)",
      requesterId,
      recipientId
    );

    res.status(201).json({
      message: "Connection request sent.",
      connectionId: Number(result.lastInsertRowid)
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/connections", requireLogin, async (req, res, next) => {
  try {
    const userId = req.session.userId;

    const connections = await db.all(`
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
    `, userId, userId, userId);

    const fullConnections = await Promise.all(
      connections.map(async connection => ({
        ...connection,
        user: await getPublicProfile(connection.other_user_id)
      }))
    );

    res.json({ connections: fullConnections });
  } catch (error) {
    next(error);
  }
});

app.post("/api/connections/:id/accept", requireLogin, async (req, res, next) => {
  try {
    const result = await db.run(`
      UPDATE connections
      SET status = 'accepted'
      WHERE id = ? AND recipient_id = ? AND status = 'pending'
    `, Number(req.params.id), req.session.userId);

    if (!result.changes) {
      return res.status(404).json({ error: "Pending request not found." });
    }

    res.json({ message: "Connection accepted." });
  } catch (error) {
    next(error);
  }
});

app.post("/api/connections/:id/reject", requireLogin, async (req, res, next) => {
  try {
    const result = await db.run(`
      UPDATE connections
      SET status = 'rejected'
      WHERE id = ? AND recipient_id = ? AND status = 'pending'
    `, Number(req.params.id), req.session.userId);

    if (!result.changes) {
      return res.status(404).json({ error: "Connection request not found." });
    }

    res.json({ message: "Connection request declined." });
  } catch (error) {
    next(error);
  }
});

// Messages
app.get("/api/messages/:userId", requireLogin, async (req, res, next) => {
  try {
    const currentUserId = req.session.userId;
    const otherUserId = Number(req.params.userId);

    if (!Number.isInteger(otherUserId) || otherUserId <= 0) {
      return res.status(400).json({ error: "Invalid user." });
    }

    if (!(await isConnected(currentUserId, otherUserId))) {
      return res.status(403).json({ error: "You must be connected before messaging." });
    }

    const messages = await db.all(`
      SELECT id, sender_id, recipient_id, body, image_url, created_at
      FROM messages
      WHERE (sender_id = ? AND recipient_id = ?)
         OR (sender_id = ? AND recipient_id = ?)
      ORDER BY id DESC
      LIMIT 200
    `, currentUserId, otherUserId, otherUserId, currentUserId);

    res.json({ messages: messages.reverse() });
  } catch (error) {
    next(error);
  }
});

app.post("/api/messages/:userId", requireLogin, async (req, res, next) => {
  try {
    const senderId = req.session.userId;
    const recipientId = Number(req.params.userId);
    const body = typeof req.body.body === "string" ? req.body.body.trim() : "";
    const imageUrl = typeof req.body.image_url === "string" ? req.body.image_url.trim() : "";

    if (!Number.isInteger(recipientId) || recipientId <= 0) {
      return res.status(400).json({ error: "Invalid recipient." });
    }

    if (!body && !imageUrl) {
      return res.status(400).json({ error: "Message cannot be empty." });
    }

    if (body.length > 4000) {
      return res.status(400).json({ error: "Message is too long." });
    }

    if (imageUrl && !/^\/uploads\/[a-zA-Z0-9._-]+$/.test(imageUrl)) {
      return res.status(400).json({ error: "Invalid image URL." });
    }

    if (!(await isConnected(senderId, recipientId))) {
      return res.status(403).json({ error: "You must be connected before messaging." });
    }

    const result = await db.run(
      "INSERT INTO messages (sender_id, recipient_id, body, image_url) VALUES (?, ?, ?, ?)",
      senderId, recipientId, body, imageUrl
    );

    const message = await getMessage(Number(result.lastInsertRowid));

    io.to(`user:${senderId}`).emit("message:new", message);
    io.to(`user:${recipientId}`).emit("message:new", message);

    res.status(201).json({ message });
  } catch (error) {
    next(error);
  }
});

// Communities
app.get("/api/communities", async (req, res, next) => {
  try {
    const userId = Number(req.session?.userId || 0);

    const communities = (await db.all(`
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
      ORDER BY c.topic
    `, userId)).map(community => ({
      ...community,
      member_count: Number(community.member_count),
      is_member: Boolean(community.is_member)
    }));

    res.json({ communities });
  } catch (error) {
    next(error);
  }
});

app.post("/api/communities/join-my-interests", requireLogin, async (req, res, next) => {
  try {
    const { cleanInterests } = require("./db");
    const interests = cleanInterests(req.body.interests);

    if (!interests.length) {
      return res.status(400).json({ error: "Select at least one interest first." });
    }

    const normalizedTopics = new Set(interests.map(value => value.toLowerCase()));
    const matching = COMMUNITY_CATALOG.filter(community =>
      normalizedTopics.has(community.topic.toLowerCase())
    );

    if (!matching.length) {
      return res.status(400).json({ error: "No communities match those interests." });
    }

    for (const community of matching) {
      await db.run(`
        INSERT INTO community_members (community_id, user_id)
        SELECT id, ? FROM communities WHERE topic = ?
        ON CONFLICT DO NOTHING
      `, req.session.userId, community.topic);

      const row = await db.get("SELECT id FROM communities WHERE topic = ?", community.topic);
      if (row) {
        io.in(`user:${req.session.userId}`).socketsJoin(`community:${row.id}`);
      }
    }

    res.json({
      message: `Joined ${matching.length} ${matching.length === 1 ? "community" : "communities"} matching your selected interests.`,
      joined: matching.map(community => community.topic)
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/communities/:id/join", requireLogin, async (req, res, next) => {
  try {
    const communityId = Number(req.params.id);

    if (!Number.isInteger(communityId) || communityId <= 0) {
      return res.status(400).json({ error: "Invalid community." });
    }

    const community = await db.get("SELECT id FROM communities WHERE id = ?", communityId);
    if (!community) {
      return res.status(404).json({ error: "Community not found." });
    }

    const result = await db.run(
      "INSERT INTO community_members (community_id, user_id) VALUES (?, ?) ON CONFLICT DO NOTHING",
      communityId,
      req.session.userId
    );

    io.in(`user:${req.session.userId}`).socketsJoin(`community:${communityId}`);

    res.status(result.changes ? 201 : 200).json({
      message: result.changes ? "Joined community." : "You are already a member."
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/communities/:id/leave", requireLogin, async (req, res, next) => {
  try {
    const communityId = Number(req.params.id);

    if (!Number.isInteger(communityId) || communityId <= 0) {
      return res.status(400).json({ error: "Invalid community." });
    }

    const result = await db.run(
      "DELETE FROM community_members WHERE community_id = ? AND user_id = ?",
      communityId,
      req.session.userId
    );

    io.in(`user:${req.session.userId}`).socketsLeave(`community:${communityId}`);

    res.json({
      message: result.changes ? "Left community." : "You were not a member of this community."
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/communities/:id/messages", requireLogin, async (req, res, next) => {
  try {
    const communityId = Number(req.params.id);

    if (!Number.isSafeInteger(communityId) || communityId <= 0) {
      return res.status(400).json({ error: "Invalid community." });
    }

    if (!(await isCommunityMember(communityId, req.session.userId))) {
      return res.status(403).json({ error: "Join this community to view its group chat." });
    }

    const messages = (await db.all(`
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
    `, communityId)).reverse();

    res.json({ messages });
  } catch (error) {
    next(error);
  }
});

app.post("/api/communities/:id/messages", requireLogin, async (req, res, next) => {
  try {
    const communityId = Number(req.params.id);
    const body = typeof req.body.body === "string" ? req.body.body.trim() : "";

    if (!Number.isSafeInteger(communityId) || communityId <= 0) {
      return res.status(400).json({ error: "Invalid community." });
    }

    if (!body) {
      return res.status(400).json({ error: "Message cannot be empty." });
    }

    if (body.length > 2000) {
      return res.status(400).json({ error: "Message is too long." });
    }

    if (!(await isCommunityMember(communityId, req.session.userId))) {
      return res.status(403).json({ error: "Join this community before sending messages." });
    }

    const result = await db.run(
      "INSERT INTO community_messages (community_id, user_id, body) VALUES (?, ?, ?)",
      communityId, req.session.userId, body
    );

    const message = await getCommunityMessage(Number(result.lastInsertRowid));

    io.to(`community:${communityId}`).emit("community:message:new", message);

    res.status(201).json({ message });
  } catch (error) {
    next(error);
  }
});

// Socket.io Real-Time
io.on("connection", async socket => {
  const userId = Number(socket.request.session?.userId || 0);

  if (!userId) {
    socket.disconnect(true);
    return;
  }

  socket.join(`user:${userId}`);

  try {
    const memberships = await db.all(
      "SELECT community_id FROM community_members WHERE user_id = ?",
      userId
    );

    memberships.forEach(row => {
      socket.join(`community:${row.community_id}`);
    });
  } catch (err) {
    console.error("Socket room join error:", err);
  }

  socket.on("community:join", async rawCommunityId => {
    const communityId = Number(rawCommunityId);
    if (!Number.isSafeInteger(communityId) || communityId <= 0) return;

    try {
      const membership = await db.get(
        "SELECT 1 FROM community_members WHERE community_id = ? AND user_id = ?",
        communityId,
        userId
      );
      if (membership) socket.join(`community:${communityId}`);
    } catch (err) {
      console.error("Socket community:join error:", err);
    }
  });

  socket.on("community:leave", rawCommunityId => {
    const communityId = Number(rawCommunityId);
    if (!Number.isSafeInteger(communityId) || communityId <= 0) return;
    socket.leave(`community:${communityId}`);
  });
});

app.use("/api", (req, res) => {
  res.status(404).json({ error: "API endpoint not found." });
});

app.use((error, req, res, next) => {
  console.error("Server error:", error);

  if (res.headersSent) return next(error);

  if (error.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ error: "Photo must be 5 MB or smaller." });
  }

  if (error.message?.startsWith("Upload a JPG")) {
    return res.status(400).json({ error: error.message });
  }

  if (error.code === "23505") { // Postgres unique_violation
    return res.status(409).json({ error: "That account or connection already exists." });
  }

  res.status(500).json({ error: "An unexpected server error occurred." });
});

async function startServer() {
  try {
    await initDb();
    server.listen(PORT, "0.0.0.0", () => {
      console.log("");
      console.log("SkillMate backend is running!");
      console.log(`Website: http://localhost:${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
      console.log("Database: Supabase PostgreSQL (Cloud)");
      console.log("Sessions: connect-pg-simple");
      console.log("Security headers: enabled");
      console.log("Login/register rate limits: enabled");
      console.log("Press Ctrl+C to stop the server.");
      console.log("");
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

startServer();
