const bcrypt = require("bcryptjs");
const { db, pool } = require("./db");

// 1. Initialize Tables
async function initChatDb() {
  const schema = `
  CREATE TABLE IF NOT EXISTS chat_conversations (
    id SERIAL PRIMARY KEY,
    type VARCHAR(20) NOT NULL CHECK (type IN ('team', 'personal')),
    name VARCHAR(120),
    description TEXT DEFAULT '',
    avatar_url TEXT DEFAULT '',
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    pinned_message_ids INTEGER[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS chat_members (
    conversation_id INTEGER NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    unread_count INTEGER DEFAULT 0,
    last_read_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (conversation_id, user_id)
  );
  CREATE INDEX IF NOT EXISTS idx_chat_members_user ON chat_members(user_id);
  CREATE INDEX IF NOT EXISTS idx_chat_members_conv ON chat_members(conversation_id);

  CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
    sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'text' CHECK (type IN ('text', 'file', 'voice', 'poll', 'code')),
    reply_to_id INTEGER REFERENCES chat_messages(id) ON DELETE SET NULL,
    thread_id INTEGER REFERENCES chat_messages(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}',
    is_pinned BOOLEAN DEFAULT FALSE,
    is_edited BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_chat_messages_conv ON chat_messages(conversation_id, id);
  CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(conversation_id, created_at DESC);

  CREATE TABLE IF NOT EXISTS chat_reactions (
    id SERIAL PRIMARY KEY,
    message_id INTEGER NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    emoji VARCHAR(32) NOT NULL,
    is_super BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (message_id, user_id, emoji)
  );

  CREATE TABLE IF NOT EXISTS chat_attachments (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
    message_id INTEGER NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_chat_attachments_conv ON chat_attachments(conversation_id);

  CREATE TABLE IF NOT EXISTS chat_polls (
    id SERIAL PRIMARY KEY,
    message_id INTEGER NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options JSONB NOT NULL,
    is_multi BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS chat_poll_votes (
    poll_id INTEGER NOT NULL REFERENCES chat_polls(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    option_id INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (poll_id, user_id, option_id)
  );
  `;

  await pool.query(schema);
  await seedChatData();
  console.log("Chat & Community tables initialized and seeded successfully.");
}

// 2. Demo Profiles from Reference Design
const DEMO_PROFILES = [
  { name: "Smira khan", email: "smira@skillmate.io", bio: "Digital Product Designer", city: "Bangalore", photo_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80" },
  { name: "Develd kevrie", email: "develd@skillmate.io", bio: "Backend Architect & Distributed Systems", city: "Mumbai", photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80" },
  { name: "kevin kelin", email: "kevin@skillmate.io", bio: "Frontend Specialist & React Dev", city: "Delhi", photo_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80" },
  { name: "Anita ponit", email: "anita@skillmate.io", bio: "Design Systems & UI/UX Lead", city: "Pune", photo_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80" },
  { name: "John Doe", email: "john@skillmate.io", bio: "Full-Stack Student exploring AI", city: "Hyderabad", photo_url: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80" }
];

async function seedChatData() {
  const hash = bcrypt.hashSync("69696969", 10);
  const userMap = new Map();

  // Create demo profiles in users table if missing
  for (const p of DEMO_PROFILES) {
    let existing = await db.get("SELECT id FROM users WHERE email = ?", p.email);
    if (!existing) {
      const res = await db.run(
        "INSERT INTO users (name, email, password_hash, bio, photo_url, is_demo) VALUES (?, ?, ?, ?, ?, 1)",
        p.name, p.email, hash, p.bio, p.photo_url
      );
      userMap.set(p.name, Number(res.lastInsertRowid));
    } else {
      userMap.set(p.name, existing.id);
    }
  }

  // Get primary users (Punit, Sahil, or first user)
  const allUsers = await db.all("SELECT id, name FROM users ORDER BY id ASC LIMIT 10");
  const adminUser = allUsers[0] || { id: 1, name: "Punit" };

  // 1. Seed Team Channels
  const teamChannels = [
    { name: "general-chat", desc: "General student community & collaboration", topic: "General" },
    { name: "product-design", desc: "Discussing glassmorphism prototypes & design systems", topic: "Design" }
  ];

  for (const tc of teamChannels) {
    let conv = await db.get("SELECT id FROM chat_conversations WHERE name = ? AND type = 'team'", tc.name);
    let convId;
    if (!conv) {
      const res = await db.run(
        "INSERT INTO chat_conversations (type, name, description, created_by) VALUES ('team', ?, ?, ?)",
        tc.name, tc.desc, adminUser.id
      );
      convId = Number(res.lastInsertRowid);

      // Add members to team channel
      for (const u of allUsers) {
        await db.run(
          "INSERT INTO chat_members (conversation_id, user_id, role) VALUES (?, ?, 'member') ON CONFLICT DO NOTHING",
          convId, u.id
        );
      }

      // Add initial messages
      const msgRes1 = await db.run(
        "INSERT INTO chat_messages (conversation_id, sender_id, content, type) VALUES (?, ?, ?, 'text')",
        convId, adminUser.id, `Welcome to #${tc.name}! Feel free to discuss ideas, share files, and collaborate.`
      );

      // Add a code block
      await db.run(
        "INSERT INTO chat_messages (conversation_id, sender_id, content, type) VALUES (?, ?, ?, 'code')",
        convId, adminUser.id, "```javascript\n// Glassmorphism ambient glow formula\nconst style = {\n  background: 'rgba(18, 16, 26, 0.75)',\n  backdropFilter: 'blur(18px)',\n  border: '1px solid rgba(255, 255, 255, 0.08)'\n};\n```"
      );

      // Add an interactive poll
      const pollMsg = await db.run(
        "INSERT INTO chat_messages (conversation_id, sender_id, content, type) VALUES (?, ?, ?, 'poll')",
        convId, adminUser.id, "Interactive Poll: Which feature should we build next?"
      );
      const pollMsgId = Number(pollMsg.lastInsertRowid);
      await db.run(
        "INSERT INTO chat_polls (message_id, question, options, is_multi) VALUES (?, ?, ?, false)",
        pollMsgId, "Which feature should we build next?",
        JSON.stringify([
          { id: 1, text: "WebRTC Audio/Video Huddle", votes: 4 },
          { id: 2, text: "Interactive Whiteboard", votes: 2 },
          { id: 3, text: "Real-time AI Code Reviewer", votes: 7 }
        ])
      );
    }
  }

  // 2. Seed Personal DMs (Especially Smira Khan matching the reference image)
  const smiraId = userMap.get("Smira khan");
  if (smiraId && adminUser.id) {
    let dm = await db.get(`
      SELECT c.id FROM chat_conversations c
      JOIN chat_members m1 ON m1.conversation_id = c.id AND m1.user_id = ?
      JOIN chat_members m2 ON m2.conversation_id = c.id AND m2.user_id = ?
      WHERE c.type = 'personal'
    `, adminUser.id, smiraId);

    let dmId;
    if (!dm) {
      const res = await db.run(
        "INSERT INTO chat_conversations (type, name, created_by) VALUES ('personal', 'Smira khan', ?)",
        adminUser.id
      );
      dmId = Number(res.lastInsertRowid);
      await db.run("INSERT INTO chat_members (conversation_id, user_id) VALUES (?, ?)", dmId, adminUser.id);
      await db.run("INSERT INTO chat_members (conversation_id, user_id) VALUES (?, ?)", dmId, smiraId);

      // Preload the exact messages from reference image!
      const seedMessages = [
        { sender: smiraId, text: "How do you like new Messaenger design 😊" },
        { sender: smiraId, text: "I am on the Google meet now. I sent it to your email. use glass morphism for this app!" },
        { sender: adminUser.id, text: "Think about your ideas! 😊" },
        { sender: smiraId, text: "How do you like new Messaenger design 😊" },
        { sender: smiraId, text: "I am on the Google meet now. I sent it to your email. use glass morphism for this app! ❤️" },
        { sender: adminUser.id, text: "I am on the Google meet now. I sent it to your email. use glass morphism for this app! ❤️" }
      ];

      for (const m of seedMessages) {
        const msgRes = await db.run(
          "INSERT INTO chat_messages (conversation_id, sender_id, content, type) VALUES (?, ?, ?, 'text')",
          dmId, m.sender, m.text
        );
        const mId = Number(msgRes.lastInsertRowid);
        if (m.text.includes("❤️")) {
          await db.run("INSERT INTO chat_reactions (message_id, user_id, emoji) VALUES (?, ?, '❤️') ON CONFLICT DO NOTHING", mId, smiraId);
        }
      }

      // Seed files for Right Sidebar [Files] tab
      const sampleFiles = [
        { name: "Case study Outline file", type: "folder", url: "/uploads/case-study.zip", size: 1420000 },
        { name: "Design portfolio review.pdf", type: "pdf", url: "/uploads/design-portfolio.pdf", size: 2840000 },
        { name: "Photo's file.zip", type: "zip", url: "/uploads/photos.zip", size: 8520000 }
      ];

      for (const f of sampleFiles) {
        const fMsg = await db.run(
          "INSERT INTO chat_messages (conversation_id, sender_id, content, type) VALUES (?, ?, ?, 'file')",
          dmId, smiraId, `Shared file: ${f.name}`
        );
        await db.run(
          "INSERT INTO chat_attachments (conversation_id, message_id, user_id, file_url, file_name, file_type, file_size) VALUES (?, ?, ?, ?, ?, ?, ?)",
          dmId, Number(fMsg.lastInsertRowid), smiraId, f.url, f.name, f.type, f.size
        );
      }

      // Seed sample image attachments for 3-column grid
      const sampleThumbnails = [
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=500&auto=format&fit=crop&q=80"
      ];
      for (const t of sampleThumbnails) {
        const aMsg = await db.run(
          "INSERT INTO chat_messages (conversation_id, sender_id, content, type) VALUES (?, ?, ?, 'file')",
          dmId, smiraId, "Shared image attachment"
        );
        await db.run(
          "INSERT INTO chat_attachments (conversation_id, message_id, user_id, file_url, file_name, file_type, file_size) VALUES (?, ?, ?, ?, 'attachment.jpg', 'image/jpeg', 450000)",
          dmId, Number(aMsg.lastInsertRowid), smiraId, t
        );
      }
    }
  }

  // Seed DMs for other demo users so Personal list is rich
  for (const name of ["Develd kevrie", "kevin kelin", "Anita ponit", "John Doe"]) {
    const otherId = userMap.get(name);
    if (!otherId || !adminUser.id) continue;
    let existingDm = await db.get(`
      SELECT c.id FROM chat_conversations c
      JOIN chat_members m1 ON m1.conversation_id = c.id AND m1.user_id = ?
      JOIN chat_members m2 ON m2.conversation_id = c.id AND m2.user_id = ?
      WHERE c.type = 'personal'
    `, adminUser.id, otherId);

    if (!existingDm) {
      const res = await db.run("INSERT INTO chat_conversations (type, name, created_by) VALUES ('personal', ?, ?)", name, adminUser.id);
      const dId = Number(res.lastInsertRowid);
      await db.run("INSERT INTO chat_members (conversation_id, user_id) VALUES (?, ?)", dId, adminUser.id);
      await db.run("INSERT INTO chat_members (conversation_id, user_id) VALUES (?, ?)", dId, otherId);

      await db.run(
        "INSERT INTO chat_messages (conversation_id, sender_id, content, type) VALUES (?, ?, ?, 'text')",
        dId, otherId, name === "Anita ponit" ? "What's up bro?" : "Hey! Let's review the full-stack architecture together."
      );
    }
  }
}

// 3. Query Helpers & Access Control

async function isMember(conversationId, userId) {
  const row = await db.get(
    "SELECT 1 FROM chat_members WHERE conversation_id = ? AND user_id = ?",
    Number(conversationId), Number(userId)
  );
  return Boolean(row);
}

async function getUserConversations(userId) {
  // Auto-join public team channels if user is not in them yet
  const teamChannels = await db.all("SELECT id FROM chat_conversations WHERE type = 'team'");
  for (const tc of teamChannels) {
    await db.run(
      "INSERT INTO chat_members (conversation_id, user_id) VALUES (?, ?) ON CONFLICT DO NOTHING",
      tc.id, userId
    );
  }

  const rows = await db.all(`
    SELECT
      c.id,
      c.type,
      c.name,
      c.description,
      c.avatar_url,
      c.pinned_message_ids,
      c.created_at,
      m.role,
      m.unread_count,
      m.last_read_at,
      (
        SELECT json_build_object(
          'id', lm.id,
          'content', lm.content,
          'type', lm.type,
          'sender_id', lm.sender_id,
          'created_at', lm.created_at
        )
        FROM chat_messages lm
        WHERE lm.conversation_id = c.id
        ORDER BY lm.created_at DESC
        LIMIT 1
      ) as last_message,
      (
        SELECT COUNT(*)::int FROM chat_members cm WHERE cm.conversation_id = c.id
      ) as member_count
    FROM chat_conversations c
    JOIN chat_members m ON m.conversation_id = c.id AND m.user_id = ?
    ORDER BY (
      SELECT COALESCE(MAX(created_at), c.created_at) FROM chat_messages WHERE conversation_id = c.id
    ) DESC
  `, userId);

  // If personal DM, fetch the recipient profile
  for (const conv of rows) {
    if (conv.type === 'personal') {
      const recipient = await db.get(`
        SELECT u.id, u.name, u.email, u.bio, u.photo_url
        FROM chat_members cm
        JOIN users u ON u.id = cm.user_id
        WHERE cm.conversation_id = ? AND cm.user_id != ?
        LIMIT 1
      `, conv.id, userId);

      if (recipient) {
        conv.name = recipient.name;
        conv.recipient = recipient;
        conv.avatar_url = recipient.photo_url || '';
      }
    }
  }

  return rows;
}

async function getConversationDetails(conversationId, userId) {
  const conv = await db.get("SELECT * FROM chat_conversations WHERE id = ?", conversationId);
  if (!conv) return null;

  const members = await db.all(`
    SELECT u.id, u.name, u.email, u.bio, u.photo_url, cm.role, cm.joined_at
    FROM chat_members cm
    JOIN users u ON u.id = cm.user_id
    WHERE cm.conversation_id = ?
    ORDER BY u.name ASC
  `, conversationId);

  let recipient = null;
  if (conv.type === 'personal') {
    recipient = members.find(m => m.id !== userId) || members[0] || null;
    if (recipient) conv.name = recipient.name;
  }

  return { ...conv, members, recipient };
}

async function getMessages(conversationId, limit = 50, beforeId = null) {
  let query = `
    SELECT
      m.id,
      m.conversation_id,
      m.sender_id,
      m.content,
      m.type,
      m.reply_to_id,
      m.thread_id,
      m.metadata,
      m.is_pinned,
      m.is_edited,
      m.created_at,
      u.name as sender_name,
      u.photo_url as sender_photo,
      (
        SELECT json_build_object('id', rm.id, 'content', rm.content, 'sender_name', ru.name)
        FROM chat_messages rm
        JOIN users ru ON ru.id = rm.sender_id
        WHERE rm.id = m.reply_to_id
      ) as reply_to,
      (
        SELECT json_agg(json_build_object('emoji', r.emoji, 'is_super', r.is_super, 'user_id', r.user_id))
        FROM chat_reactions r
        WHERE r.message_id = m.id
      ) as reactions
    FROM chat_messages m
    JOIN users u ON u.id = m.sender_id
    WHERE m.conversation_id = $1
  `;

  const params = [conversationId];
  if (beforeId && Number.isSafeInteger(Number(beforeId))) {
    query += ` AND m.id < $2`;
    params.push(Number(beforeId));
  }

  query += ` ORDER BY m.id DESC LIMIT $${params.length + 1}`;
  params.push(limit);

  const res = await pool.query(query, params);
  const rows = res.rows.reverse();

  // Attach polls if message type == 'poll'
  for (const msg of rows) {
    if (msg.type === 'poll') {
      const poll = await db.get("SELECT * FROM chat_polls WHERE message_id = ?", msg.id);
      if (poll) {
        const votes = await db.all("SELECT option_id, COUNT(*)::int as count, array_agg(user_id) as voters FROM chat_poll_votes WHERE poll_id = ? GROUP BY option_id", poll.id);
        msg.poll = { ...poll, votes };
      }
    }
  }

  return rows;
}

async function postMessage({ conversationId, senderId, content, type = 'text', replyToId = null, threadId = null, metadata = {} }) {
  const res = await db.run(`
    INSERT INTO chat_messages (conversation_id, sender_id, content, type, reply_to_id, thread_id, metadata)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, conversationId, senderId, content, type, replyToId, threadId, JSON.stringify(metadata));

  const messageId = Number(res.lastInsertRowid);

  // If file attachment, insert attachment record
  if (type === 'file' && metadata.url) {
    await db.run(`
      INSERT INTO chat_attachments (conversation_id, message_id, user_id, file_url, file_name, file_type, file_size)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, conversationId, messageId, senderId, metadata.url, metadata.fileName || 'file', metadata.fileType || 'application/octet-stream', metadata.fileSize || 0);
  }

  // Fetch full message with sender
  const msg = await db.get(`
    SELECT
      m.id, m.conversation_id, m.sender_id, m.content, m.type, m.reply_to_id, m.thread_id, m.metadata, m.is_pinned, m.is_edited, m.created_at,
      u.name as sender_name, u.photo_url as sender_photo
    FROM chat_messages m
    JOIN users u ON u.id = m.sender_id
    WHERE m.id = ?
  `, messageId);

  return msg;
}

async function togglePin(conversationId, messageId) {
  const msg = await db.get("SELECT is_pinned FROM chat_messages WHERE id = ? AND conversation_id = ?", messageId, conversationId);
  if (!msg) return null;
  const newStatus = !msg.is_pinned;
  await db.run("UPDATE chat_messages SET is_pinned = ? WHERE id = ?", newStatus, messageId);
  return newStatus;
}

async function toggleReaction(messageId, userId, emoji, isSuper = false) {
  const existing = await db.get("SELECT id FROM chat_reactions WHERE message_id = ? AND user_id = ? AND emoji = ?", messageId, userId, emoji);
  if (existing) {
    await db.run("DELETE FROM chat_reactions WHERE id = ?", existing.id);
    return { added: false, emoji };
  } else {
    await db.run("INSERT INTO chat_reactions (message_id, user_id, emoji, is_super) VALUES (?, ?, ?, ?)", messageId, userId, emoji, isSuper);
    return { added: true, emoji, isSuper };
  }
}

async function votePoll(pollId, userId, optionId) {
  const existing = await db.get("SELECT 1 FROM chat_poll_votes WHERE poll_id = ? AND user_id = ? AND option_id = ?", pollId, userId, optionId);
  if (existing) {
    await db.run("DELETE FROM chat_poll_votes WHERE poll_id = ? AND user_id = ? AND option_id = ?", pollId, userId, optionId);
  } else {
    await db.run("INSERT INTO chat_poll_votes (poll_id, user_id, option_id) VALUES (?, ?, ?)", pollId, userId, optionId);
  }

  const votes = await db.all("SELECT option_id, COUNT(*)::int as count, array_agg(user_id) as voters FROM chat_poll_votes WHERE poll_id = ? GROUP BY option_id", pollId);
  return votes;
}

async function getConversationFiles(conversationId) {
  const attachments = await db.all(`
    SELECT a.*, u.name as uploader_name
    FROM chat_attachments a
    JOIN users u ON u.id = a.user_id
    WHERE a.conversation_id = ?
    ORDER BY a.created_at DESC
  `, conversationId);

  const uploadedFiles = attachments.filter(a => !a.file_type.startsWith('image/'));
  const mediaGrid = attachments.filter(a => a.file_type.startsWith('image/') || a.file_type.startsWith('video/'));

  return { uploadedFiles, mediaGrid };
}

async function searchUsers(query, currentUserId) {
  const cleanQ = `%${String(query || '').trim()}%`;
  return db.all(`
    SELECT id, name, email, bio, photo_url
    FROM users
    WHERE id != ? AND (name ILIKE ? OR email ILIKE ?)
    LIMIT 20
  `, currentUserId, cleanQ, cleanQ);
}

async function findOrCreatePersonalConversation(userA, userB) {
  const existing = await db.get(`
    SELECT c.id FROM chat_conversations c
    JOIN chat_members m1 ON m1.conversation_id = c.id AND m1.user_id = ?
    JOIN chat_members m2 ON m2.conversation_id = c.id AND m2.user_id = ?
    WHERE c.type = 'personal'
    LIMIT 1
  `, userA, userB);

  if (existing) return existing.id;

  const targetUser = await db.get("SELECT name FROM users WHERE id = ?", userB);
  const res = await db.run(
    "INSERT INTO chat_conversations (type, name, created_by) VALUES ('personal', ?, ?)",
    targetUser?.name || 'Personal Chat', userA
  );
  const convId = Number(res.lastInsertRowid);
  await db.run("INSERT INTO chat_members (conversation_id, user_id) VALUES (?, ?)", convId, userA);
  await db.run("INSERT INTO chat_members (conversation_id, user_id) VALUES (?, ?)", convId, userB);
  return convId;
}

module.exports = {
  initChatDb,
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
};
