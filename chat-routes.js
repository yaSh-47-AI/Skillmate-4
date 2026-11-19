const express = require("express");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");
const {
  isMember,
  getUserConversations,
  getConversationDetails,
  getMessages,
  postMessage,
  togglePin,
  toggleReaction,
  votePoll,
  getConversationFiles,
  searchUsers,
  findOrCreatePersonalConversation
} = require("./chat-db");
const { db } = require("./db");

const router = express.Router();

// Dynamic file upload storage using path.join(__dirname, "uploads")
const uploadDir = path.join(__dirname, "uploads");
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).slice(0, 10) || ".bin";
    const unique = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`;
    cb(null, unique);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

function requireLogin(req, res, next) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: "Please log in to access chat." });
  }
  next();
}

router.use(requireLogin);

// 1. Get all conversations for current user
router.get("/conversations", async (req, res, next) => {
  try {
    const conversations = await getUserConversations(req.session.userId);
    res.json({ conversations });
  } catch (err) {
    next(err);
  }
});

// 2. Create or Find Conversation
router.post("/conversations", async (req, res, next) => {
  try {
    const { type, name, description, recipientId, memberIds } = req.body;

    if (type === "personal") {
      if (!recipientId || Number(recipientId) === Number(req.session.userId)) {
        return res.status(400).json({ error: "Invalid recipient." });
      }
      const convId = await findOrCreatePersonalConversation(req.session.userId, Number(recipientId));
      const details = await getConversationDetails(convId, req.session.userId);
      return res.status(201).json({ conversation: details });
    }

    if (type === "team") {
      const cleanName = String(name || "").trim().toLowerCase().replace(/\s+/g, "-");
      if (!cleanName) return res.status(400).json({ error: "Channel name is required." });

      const createRes = await db.run(
        "INSERT INTO chat_conversations (type, name, description, created_by) VALUES ('team', ?, ?, ?)",
        cleanName, description || "", req.session.userId
      );
      const convId = Number(createRes.lastInsertRowid);
      await db.run("INSERT INTO chat_members (conversation_id, user_id, role) VALUES (?, ?, 'owner')", convId, req.session.userId);

      if (Array.isArray(memberIds)) {
        for (const mid of memberIds) {
          if (mid !== req.session.userId) {
            await db.run("INSERT INTO chat_members (conversation_id, user_id, role) VALUES (?, ?, 'member') ON CONFLICT DO NOTHING", convId, mid);
          }
        }
      }

      const details = await getConversationDetails(convId, req.session.userId);
      return res.status(201).json({ conversation: details });
    }

    res.status(400).json({ error: "Invalid conversation type." });
  } catch (err) {
    next(err);
  }
});

// 3. Get Conversation Details (with strict access control)
router.get("/conversations/:id", async (req, res, next) => {
  try {
    const convId = Number(req.params.id);
    if (!(await isMember(convId, req.session.userId))) {
      return res.status(403).json({ error: "Access denied. You are not a member of this conversation." });
    }
    const conversation = await getConversationDetails(convId, req.session.userId);
    if (!conversation) return res.status(404).json({ error: "Conversation not found." });
    res.json({ conversation });
  } catch (err) {
    next(err);
  }
});

// 4. Get Messages (with cursor-based pagination for infinite scroll)
router.get("/conversations/:id/messages", async (req, res, next) => {
  try {
    const convId = Number(req.params.id);
    if (!(await isMember(convId, req.session.userId))) {
      return res.status(403).json({ error: "Access denied. You are not a member of this conversation." });
    }

    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const beforeId = req.query.before ? Number(req.query.before) : null;

    const messages = await getMessages(convId, limit, beforeId);
    res.json({ messages });
  } catch (err) {
    next(err);
  }
});

// 5. Send Message
router.post("/conversations/:id/messages", async (req, res, next) => {
  try {
    const convId = Number(req.params.id);
    if (!(await isMember(convId, req.session.userId))) {
      return res.status(403).json({ error: "Access denied. You are not a member of this conversation." });
    }

    const { content, type, replyToId, threadId, metadata } = req.body;
    const cleanContent = String(content || "").trim();

    if (!cleanContent && type !== "file" && type !== "voice") {
      return res.status(400).json({ error: "Message cannot be empty." });
    }

    const message = await postMessage({
      conversationId: convId,
      senderId: req.session.userId,
      content: cleanContent,
      type: type || "text",
      replyToId: replyToId ? Number(replyToId) : null,
      threadId: threadId ? Number(threadId) : null,
      metadata: metadata || {}
    });

    // Real-time broadcast
    const io = req.app.get("io");
    if (io) {
      io.to(`conversation:${convId}`).emit("chat:message:new", message);
    }

    res.status(201).json({ message });
  } catch (err) {
    next(err);
  }
});

// 6. Pin / Unpin Message
router.post("/messages/:id/pin", async (req, res, next) => {
  try {
    const messageId = Number(req.params.id);
    const msg = await db.get("SELECT conversation_id FROM chat_messages WHERE id = ?", messageId);
    if (!msg) return res.status(404).json({ error: "Message not found." });

    if (!(await isMember(msg.conversation_id, req.session.userId))) {
      return res.status(403).json({ error: "Access denied." });
    }

    const isPinned = await togglePin(msg.conversation_id, messageId);

    const io = req.app.get("io");
    if (io) {
      io.to(`conversation:${msg.conversation_id}`).emit("chat:pin:updated", {
        messageId,
        isPinned
      });
    }

    res.json({ messageId, isPinned });
  } catch (err) {
    next(err);
  }
});

// 7. Toggle Reaction
router.post("/messages/:id/react", async (req, res, next) => {
  try {
    const messageId = Number(req.params.id);
    const { emoji, isSuper } = req.body;
    if (!emoji) return res.status(400).json({ error: "Emoji is required." });

    const msg = await db.get("SELECT conversation_id FROM chat_messages WHERE id = ?", messageId);
    if (!msg) return res.status(404).json({ error: "Message not found." });

    if (!(await isMember(msg.conversation_id, req.session.userId))) {
      return res.status(403).json({ error: "Access denied." });
    }

    const result = await toggleReaction(messageId, req.session.userId, emoji, Boolean(isSuper));

    const io = req.app.get("io");
    if (io) {
      io.to(`conversation:${msg.conversation_id}`).emit("chat:reaction:updated", {
        messageId,
        userId: req.session.userId,
        ...result
      });
    }

    res.json(result);
  } catch (err) {
    next(err);
  }
});

// 8. Vote on Poll
router.post("/polls/:id/vote", async (req, res, next) => {
  try {
    const pollId = Number(req.params.id);
    const { optionId } = req.body;
    if (optionId === undefined) return res.status(400).json({ error: "Option is required." });

    const poll = await db.get("SELECT p.*, m.conversation_id FROM chat_polls p JOIN chat_messages m ON m.id = p.message_id WHERE p.id = ?", pollId);
    if (!poll) return res.status(404).json({ error: "Poll not found." });

    if (!(await isMember(poll.conversation_id, req.session.userId))) {
      return res.status(403).json({ error: "Access denied." });
    }

    const votes = await votePoll(pollId, req.session.userId, Number(optionId));

    const io = req.app.get("io");
    if (io) {
      io.to(`conversation:${poll.conversation_id}`).emit("chat:poll:updated", {
        pollId,
        votes
      });
    }

    res.json({ pollId, votes });
  } catch (err) {
    next(err);
  }
});

// 9. Right Sidebar [Files] & Attachments Inspector
router.get("/conversations/:id/files", async (req, res, next) => {
  try {
    const convId = Number(req.params.id);
    if (!(await isMember(convId, req.session.userId))) {
      return res.status(403).json({ error: "Access denied." });
    }
    const files = await getConversationFiles(convId);
    res.json(files);
  } catch (err) {
    next(err);
  }
});

// 10. Search Registered Users (for starting new Personal DMs)
router.get("/users/search", async (req, res, next) => {
  try {
    const users = await searchUsers(req.query.q, req.session.userId);
    res.json({ users });
  } catch (err) {
    next(err);
  }
});

// 11. File & Voice Audio Upload
router.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded." });

  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({
    url: fileUrl,
    fileName: req.file.originalname,
    fileType: req.file.mimetype,
    fileSize: req.file.size
  });
});

module.exports = router;
