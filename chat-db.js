const { db, pool } = require("./db");

// 1. Initialize Tables & Migrations
async function initChatDb() {
  const schema = `
  CREATE TABLE IF NOT EXISTS chat_conversations (
    id SERIAL PRIMARY KEY,
    type VARCHAR(20) NOT NULL CHECK (type IN ('team', 'personal')),
    name VARCHAR(120),
    description TEXT DEFAULT '',
    avatar_url TEXT DEFAULT '',
    visibility VARCHAR(10) DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
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
    type VARCHAR(20) DEFAULT 'text' CHECK (type IN ('text', 'file', 'image', 'voice', 'code', 'poll', 'system')),
    reply_to_id INTEGER REFERENCES chat_messages(id) ON DELETE SET NULL,
    thread_id INTEGER REFERENCES chat_messages(id) ON DELETE CASCADE,
    metadata JSONB DEFAULT '{}',
    is_pinned BOOLEAN DEFAULT FALSE,
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_chat_messages_conv ON chat_messages(conversation_id, id DESC);

  CREATE TABLE IF NOT EXISTS chat_reactions (
    message_id INTEGER NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    emoji VARCHAR(32) NOT NULL,
    is_super BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (message_id, user_id, emoji)
  );

  CREATE TABLE IF NOT EXISTS chat_attachments (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
    message_id INTEGER REFERENCES chat_messages(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    file_size INTEGER,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_chat_attachments_conv ON chat_attachments(conversation_id);

  CREATE TABLE IF NOT EXISTS chat_polls (
    id SERIAL PRIMARY KEY,
    message_id INTEGER NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options JSONB NOT NULL,
    is_multi BOOLEAN DEFAULT FALSE,
    closed_at TIMESTAMPTZ
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

  // Column safety migrations & Row-Level Security
  await pool.query(`
    ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.chat_members ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.chat_reactions ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.chat_attachments ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.chat_polls ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.chat_poll_votes ENABLE ROW LEVEL SECURITY;
    ALTER TABLE chat_conversations ADD COLUMN IF NOT EXISTS visibility VARCHAR(10) DEFAULT 'public';
    ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT FALSE;
    ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ;
  `);

  await seedChatData();
  console.log("Chat & Community tables initialized and seeded successfully.");
}

async function seedChatData() {
  // Fetch real registered users (excluding any old demo @skillmate.io accounts)
  const realUsers = await db.all(`
    SELECT id, name, email, username, bio, city, photo_url
    FROM users
    WHERE email NOT LIKE '%@skillmate.io'
    ORDER BY id ASC
  `);

  if (!realUsers || realUsers.length === 0) return;

  const adminUser = realUsers.find(u => u.id === 1) || realUsers[0];
  const jaiyesh = realUsers.find(u => (u.username || '').toLowerCase().includes('jaiyesh') || u.name.toLowerCase().includes('jaiyesh'));
  const sahil = realUsers.find(u => (u.username || '').toLowerCase().includes('sahil') || u.name.toLowerCase().includes('sahil'));
  const harsh = realUsers.find(u => (u.username || '').toLowerCase().includes('harsh') || u.name.toLowerCase().includes('harsh'));

  // 1. Seed Core Team Channels in Network
  const teamChannels = [
    { name: "general-chat", desc: "General student community, ideas & announcements", topic: "General", visibility: "public" },
    { name: "product-design", desc: "UI/UX, dark glassmorphism prototypes & design systems", topic: "Design", visibility: "public" },
    { name: "tech-talk", desc: "Full-stack web, AI agents, Python & cloud architecture", topic: "Tech", visibility: "public" }
  ];

  for (const tc of teamChannels) {
    let conv = await db.get("SELECT id FROM chat_conversations WHERE name = ? AND type = 'team'", tc.name);
    let convId;
    if (!conv) {
      const res = await db.run(
        "INSERT INTO chat_conversations (type, name, description, visibility, created_by) VALUES ('team', ?, ?, ?, ?)",
        tc.name, tc.desc, tc.visibility, adminUser.id
      );
      convId = Number(res.lastInsertRowid);

      // Add all real registered users as members
      for (const u of realUsers.slice(0, 10)) {
        const role = u.id === adminUser.id ? 'owner' : 'member';
        await db.run(
          "INSERT INTO chat_members (conversation_id, user_id, role) VALUES (?, ?, ?) ON CONFLICT DO NOTHING",
          convId, u.id, role
        );
      }

      // Initial channel message
      await db.run(
        "INSERT INTO chat_messages (conversation_id, sender_id, content, type) VALUES (?, ?, ?, 'text')",
        convId, adminUser.id, `Welcome to #${tc.name}! This is a dedicated channel for collaboration, sharing files, and live discussion.`
      );
    }
  }

  // 2. Seed Personal 1-on-1 DMs with Real Registered Users
  const targetPeers = [jaiyesh, sahil, harsh].filter(Boolean);

  for (const peer of targetPeers) {
    if (peer.id === adminUser.id) continue;

    let dm = await db.get(`
      SELECT c.id FROM chat_conversations c
      JOIN chat_members m1 ON m1.conversation_id = c.id AND m1.user_id = ?
      JOIN chat_members m2 ON m2.conversation_id = c.id AND m2.user_id = ?
      WHERE c.type = 'personal'
    `, adminUser.id, peer.id);

    if (!dm) {
      const res = await db.run(
        "INSERT INTO chat_conversations (type, name, created_by) VALUES ('personal', ?, ?)",
        peer.name, adminUser.id
      );
      const dmId = Number(res.lastInsertRowid);
      await db.run("INSERT INTO chat_members (conversation_id, user_id) VALUES (?, ?)", dmId, adminUser.id);
      await db.run("INSERT INTO chat_members (conversation_id, user_id) VALUES (?, ?)", dmId, peer.id);

      // Realistic chat conversation with real user
      const msgs = [
        { sender: peer.id, text: `Hey! Did you check out the new Dark Glassmorphism interface for SkillMate?` },
        { sender: adminUser.id, text: `Yes, it looks incredible! The ambient purple glow and 3-column layout work smoothly.` },
        { sender: peer.id, text: `Awesome! I uploaded the project roadmap and design files into the Files tab. Take a look!` },
        { sender: adminUser.id, text: `Checking it out right now. Let me know when you're free for a quick audio huddle!` }
      ];

      for (const m of msgs) {
        await db.run(
          "INSERT INTO chat_messages (conversation_id, sender_id, content, type) VALUES (?, ?, ?, 'text')",
          dmId, m.sender, m.text
        );
      }

      // Add real sample files to Files tab
      const sampleFiles = [
        { name: "SkillMate_Roadmap.pdf", type: "pdf", url: "/uploads/roadmap.pdf", size: 1850000 },
        { name: "UI_Design_Tokens.json", type: "code", url: "/uploads/tokens.json", size: 45000 },
        { name: "Assets_Package.zip", type: "zip", url: "/uploads/assets.zip", size: 5200000 }
      ];
      for (const f of sampleFiles) {
        const fMsg = await db.run(
          "INSERT INTO chat_messages (conversation_id, sender_id, content, type) VALUES (?, ?, ?, 'file')",
          dmId, peer.id, `Shared document: ${f.name}`
        );
        await db.run(
          "INSERT INTO chat_attachments (conversation_id, message_id, user_id, file_url, file_name, file_type, file_size) VALUES (?, ?, ?, ?, ?, ?, ?)",
          dmId, Number(fMsg.lastInsertRowid), peer.id, f.url, f.name, f.type, f.size
        );
      }
    }
  }
}

// 3. Access Control Check
async function isMember(conversationId, userId) {
  const row = await db.get(
    "SELECT 1 FROM chat_members WHERE conversation_id = ? AND user_id = ?",
    conversationId, userId
  );
  return Boolean(row);
}

// 4. Get User Conversations (Pure DMs or All)
async function getUserConversations(userId, filterType = null) {
  let query = `
    SELECT
      c.id,
      c.type,
      c.name,
      c.description,
      c.avatar_url,
      c.visibility,
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
    JOIN chat_members m ON m.conversation_id = c.id AND m.user_id = $1
  `;

  const params = [userId];
  if (filterType) {
    query += ` WHERE c.type = $2`;
    params.push(filterType);
  }

  query += `
    ORDER BY (
      SELECT COALESCE(MAX(created_at), c.created_at) FROM chat_messages WHERE conversation_id = c.id
    ) DESC
  `;

  const rows = await db.all(query, ...params);

  // For personal DMs, load real recipient profile
  for (const conv of rows) {
    if (conv.type === 'personal') {
      const recipient = await db.get(`
        SELECT u.id, u.name, u.email, u.username, u.bio, u.city, u.photo_url
        FROM chat_members cm
        JOIN users u ON u.id = cm.user_id
        WHERE cm.conversation_id = ? AND cm.user_id != ?
        LIMIT 1
      `, conv.id, userId);

      if (recipient) {
        const username = recipient.username || recipient.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');
        conv.name = recipient.name;
        conv.handle = `@${username}`;
        conv.recipient = {
          ...recipient,
          username,
          handle: `@${username}`
        };
        conv.avatar_url = recipient.photo_url || '';

        // Load interests
        const intRows = await db.all(`
          SELECT i.name FROM user_interests ui
          JOIN interests i ON i.id = ui.interest_id
          WHERE ui.user_id = ?
          ORDER BY i.name
        `, recipient.id);
        conv.recipient.interests = intRows.map(r => r.name);
      }
    }
  }

  return rows;
}

// 5. Get Channels List for Network (Joined + Explore)
async function getChannelsForUser(userId) {
  // Joined Channels
  const joined = await db.all(`
    SELECT
      c.id,
      c.type,
      c.name,
      c.description,
      c.visibility,
      c.created_by,
      c.created_at,
      m.role,
      (SELECT COUNT(*)::int FROM chat_members cm WHERE cm.conversation_id = c.id) as member_count,
      (
        SELECT json_build_object(
          'id', lm.id,
          'content', lm.content,
          'sender_name', u.name,
          'created_at', lm.created_at
        )
        FROM chat_messages lm
        JOIN users u ON u.id = lm.sender_id
        WHERE lm.conversation_id = c.id
        ORDER BY lm.created_at DESC
        LIMIT 1
      ) as last_message
    FROM chat_conversations c
    JOIN chat_members m ON m.conversation_id = c.id AND m.user_id = ?
    WHERE c.type = 'team'
    ORDER BY c.name ASC
  `, userId);

  // Explore Channels (Public channels that the user hasn't joined)
  const explore = await db.all(`
    SELECT
      c.id,
      c.type,
      c.name,
      c.description,
      c.visibility,
      c.created_by,
      c.created_at,
      u.name as creator_name,
      (SELECT COUNT(*)::int FROM chat_members cm WHERE cm.conversation_id = c.id) as member_count
    FROM chat_conversations c
    LEFT JOIN users u ON u.id = c.created_by
    WHERE c.type = 'team'
      AND c.visibility = 'public'
      AND c.id NOT IN (SELECT conversation_id FROM chat_members WHERE user_id = ?)
    ORDER BY c.created_at DESC
  `, userId);

  return { joined, explore };
}

// 6. Get Conversation Details
async function getConversationDetails(conversationId, userId) {
  const conv = await db.get("SELECT * FROM chat_conversations WHERE id = ?", conversationId);
  if (!conv) return null;

  const members = await db.all(`
    SELECT u.id, u.name, u.email, u.username, u.bio, u.city, u.photo_url, cm.role, cm.joined_at
    FROM chat_members cm
    JOIN users u ON u.id = cm.user_id
    WHERE cm.conversation_id = ?
    ORDER BY 
      CASE cm.role WHEN 'owner' THEN 1 WHEN 'admin' THEN 2 ELSE 3 END,
      u.name ASC
  `, conversationId);

  // Ensure handles on all members
  members.forEach(m => {
    m.username = m.username || m.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');
    m.handle = `@${m.username}`;
  });

  let recipient = null;
  if (conv.type === 'personal') {
    recipient = members.find(m => m.id !== userId) || members[0] || null;
    if (recipient) {
      conv.name = recipient.name;
      conv.handle = recipient.handle;
      const intRows = await db.all(`
        SELECT i.name FROM user_interests ui
        JOIN interests i ON i.id = ui.interest_id
        WHERE ui.user_id = ?
        ORDER BY i.name
      `, recipient.id);
      recipient.interests = intRows.map(r => r.name);
    }
  }

  const currentUserRole = members.find(m => m.id === userId)?.role || null;

  return {
    ...conv,
    members,
    recipient,
    currentUserRole
  };
}

// 7. Get Messages with Cursor Pagination
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
      m.edited_at,
      m.created_at,
      u.name as sender_name,
      u.username as sender_username,
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

  const rows = await db.all(query, ...params);
  rows.forEach(r => {
    r.sender_username = r.sender_username || (r.sender_name || 'user').toLowerCase().replace(/\s+/g, '');
    r.sender_handle = `@${r.sender_username}`;
  });

  return rows.reverse();
}

// 8. Post Message
async function postMessage({ conversationId, senderId, content, type = 'text', replyToId = null, threadId = null, metadata = {} }) {
  const res = await db.run(`
    INSERT INTO chat_messages (conversation_id, sender_id, content, type, reply_to_id, thread_id, metadata)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, conversationId, senderId, content, type, replyToId, threadId, JSON.stringify(metadata));

  const messageId = Number(res.lastInsertRowid);

  // If file, add to attachments
  if (type === 'file' && metadata?.url) {
    await db.run(`
      INSERT INTO chat_attachments (conversation_id, message_id, user_id, file_url, file_name, file_type, file_size)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, conversationId, messageId, senderId, metadata.url, metadata.fileName || 'file', metadata.fileType || '', metadata.fileSize || 0);
  }

  const sender = await db.get("SELECT id, name, username, email, photo_url FROM users WHERE id = ?", senderId);
  const username = sender?.username || (sender?.email || 'user').split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');

  let replyTo = null;
  if (replyToId) {
    const parent = await db.get("SELECT m.id, m.content, u.name as sender_name FROM chat_messages m JOIN users u ON u.id = m.sender_id WHERE m.id = ?", replyToId);
    if (parent) replyTo = parent;
  }

  return {
    id: messageId,
    conversation_id: conversationId,
    sender_id: senderId,
    content,
    type,
    reply_to_id: replyToId,
    reply_to: replyTo,
    thread_id: threadId,
    metadata,
    is_pinned: false,
    is_edited: false,
    reactions: [],
    sender_name: sender?.name || "User",
    sender_username: username,
    sender_handle: `@${username}`,
    sender_photo: sender?.photo_url || "",
    created_at: new Date().toISOString()
  };
}

// 9. Edit & Delete Message
async function editMessage(messageId, userId, newContent) {
  const msg = await db.get("SELECT * FROM chat_messages WHERE id = ?", messageId);
  if (!msg) return null;
  if (msg.sender_id !== userId) throw new Error("You can only edit your own messages.");

  await db.run(
    "UPDATE chat_messages SET content = ?, is_edited = TRUE, edited_at = CURRENT_TIMESTAMP WHERE id = ?",
    newContent, messageId
  );

  return {
    id: messageId,
    conversation_id: msg.conversation_id,
    content: newContent,
    is_edited: true,
    edited_at: new Date().toISOString()
  };
}

async function deleteMessage(messageId, userId) {
  const msg = await db.get("SELECT m.*, cm.role as user_role FROM chat_messages m LEFT JOIN chat_members cm ON cm.conversation_id = m.conversation_id AND cm.user_id = ? WHERE m.id = ?", userId, messageId);
  if (!msg) return null;

  const isOwner = msg.user_role === 'owner' || msg.user_role === 'admin';
  if (msg.sender_id !== userId && !isOwner) {
    throw new Error("You do not have permission to delete this message.");
  }

  await db.run("DELETE FROM chat_messages WHERE id = ?", messageId);
  return { id: messageId, conversation_id: msg.conversation_id };
}

// 10. Channel Member Controls (Add, Remove, Join, Leave, Delete)
async function addMemberToChannel(convId, userId, role = 'member') {
  await db.run(
    "INSERT INTO chat_members (conversation_id, user_id, role) VALUES (?, ?, ?) ON CONFLICT (conversation_id, user_id) DO UPDATE SET role = excluded.role",
    convId, userId, role
  );
  const user = await db.get("SELECT id, name, username, email, bio, city, photo_url FROM users WHERE id = ?", userId);
  const username = user?.username || (user?.email || 'user').split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');
  return {
    ...user,
    username,
    handle: `@${username}`,
    role
  };
}

async function removeMemberFromChannel(convId, userId) {
  await db.run("DELETE FROM chat_members WHERE conversation_id = ? AND user_id = ?", convId, userId);
  return { success: true, conversation_id: convId, user_id: userId };
}

async function joinChannel(convId, userId) {
  const conv = await db.get("SELECT * FROM chat_conversations WHERE id = ? AND type = 'team'", convId);
  if (!conv) throw new Error("Channel not found.");
  if (conv.visibility === 'private') throw new Error("This channel is private. You must be invited by an admin.");

  await db.run(
    "INSERT INTO chat_members (conversation_id, user_id, role) VALUES (?, ?, 'member') ON CONFLICT DO NOTHING",
    convId, userId
  );
  return getConversationDetails(convId, userId);
}

async function leaveChannel(convId, userId) {
  const mem = await db.get("SELECT role FROM chat_members WHERE conversation_id = ? AND user_id = ?", convId, userId);
  if (!mem) return { success: true };
  if (mem.role === 'owner') {
    const otherMembers = await db.all("SELECT user_id FROM chat_members WHERE conversation_id = ? AND user_id != ? LIMIT 1", convId, userId);
    if (otherMembers.length > 0) {
      // Transfer ownership to first member
      await db.run("UPDATE chat_members SET role = 'owner' WHERE conversation_id = ? AND user_id = ?", convId, otherMembers[0].user_id);
    }
  }
  await db.run("DELETE FROM chat_members WHERE conversation_id = ? AND user_id = ?", convId, userId);
  return { success: true };
}

async function deleteChannel(convId, userId) {
  const mem = await db.get("SELECT role FROM chat_members WHERE conversation_id = ? AND user_id = ?", convId, userId);
  const conv = await db.get("SELECT created_by FROM chat_conversations WHERE id = ?", convId);
  if (conv?.created_by !== userId && mem?.role !== 'owner') {
    throw new Error("Only the channel owner can delete this channel.");
  }
  await db.run("DELETE FROM chat_conversations WHERE id = ?", convId);
  return { success: true, conversationId: convId };
}

// 11. Pins & Reactions
async function togglePin(conversationId, messageId) {
  const conv = await db.get("SELECT pinned_message_ids FROM chat_conversations WHERE id = ?", conversationId);
  let pins = Array.isArray(conv?.pinned_message_ids) ? [...conv.pinned_message_ids] : [];

  let isPinned = false;
  if (pins.includes(messageId)) {
    pins = pins.filter(id => id !== messageId);
    isPinned = false;
  } else {
    pins.push(messageId);
    isPinned = true;
  }

  await db.run("UPDATE chat_conversations SET pinned_message_ids = ? WHERE id = ?", `{${pins.join(",")}}`, conversationId);
  await db.run("UPDATE chat_messages SET is_pinned = ? WHERE id = ?", isPinned, messageId);
  return isPinned;
}

async function toggleReaction(messageId, userId, emoji, isSuper = false) {
  const existing = await db.get("SELECT * FROM chat_reactions WHERE message_id = ? AND user_id = ? AND emoji = ?", messageId, userId, emoji);
  if (existing) {
    await db.run("DELETE FROM chat_reactions WHERE message_id = ? AND user_id = ? AND emoji = ?", messageId, userId, emoji);
    return { action: "removed", emoji };
  } else {
    await db.run(
      "INSERT INTO chat_reactions (message_id, user_id, emoji, is_super) VALUES (?, ?, ?, ?) ON CONFLICT DO NOTHING",
      messageId, userId, emoji, isSuper
    );
    return { action: "added", emoji, isSuper };
  }
}

async function votePoll(pollId, userId, optionId) {
  const poll = await db.get("SELECT is_multi, options FROM chat_polls WHERE id = ?", pollId);
  if (!poll) return null;

  if (!poll.is_multi) {
    await db.run("DELETE FROM chat_poll_votes WHERE poll_id = ? AND user_id = ?", pollId, userId);
  }

  await db.run(
    "INSERT INTO chat_poll_votes (poll_id, user_id, option_id) VALUES (?, ?, ?) ON CONFLICT DO NOTHING",
    pollId, userId, optionId
  );

  const voteCounts = await db.all("SELECT option_id, COUNT(*)::int as count FROM chat_poll_votes WHERE poll_id = ? GROUP BY option_id", pollId);
  const countMap = new Map(voteCounts.map(v => [v.option_id, v.count]));

  const rawOptions = typeof poll.options === "string" ? JSON.parse(poll.options) : poll.options;
  const updatedOptions = rawOptions.map(opt => ({
    ...opt,
    votes: countMap.get(opt.id) || 0
  }));

  await db.run("UPDATE chat_polls SET options = ? WHERE id = ?", JSON.stringify(updatedOptions), pollId);
  return updatedOptions;
}

// 12. Files & Attachments Inspector
async function getConversationFiles(conversationId) {
  const docs = await db.all(`
    SELECT id, file_name, file_url, file_type, file_size, created_at
    FROM chat_attachments
    WHERE conversation_id = ? AND (file_type NOT LIKE 'image/%' AND file_type NOT LIKE 'video/%')
    ORDER BY created_at DESC
    LIMIT 20
  `, conversationId);

  const media = await db.all(`
    SELECT id, file_name, file_url, file_type, file_size, created_at
    FROM chat_attachments
    WHERE conversation_id = ? AND (file_type LIKE 'image/%' OR file_type LIKE 'video/%' OR file_url LIKE '%.jpg%' OR file_url LIKE '%.png%' OR file_url LIKE '%.webp%')
    ORDER BY created_at DESC
    LIMIT 20
  `, conversationId);

  return { docs, media };
}

// 13. Search Real Registered Users (With Full Name + @username)
async function searchUsers(query, currentUserId) {
  const cleanQ = `%${String(query || '').trim()}%`;
  const rows = await db.all(`
    SELECT u.id, u.name, u.email, u.username, u.bio, u.city, u.photo_url
    FROM users u
    WHERE u.id != ?
      AND u.email NOT LIKE '%@skillmate.io'
      AND (
        ? = '%%'
        OR u.name ILIKE ?
        OR u.username ILIKE ?
        OR u.email ILIKE ?
      )
    ORDER BY u.name ASC
    LIMIT 25
  `, currentUserId, cleanQ, cleanQ, cleanQ, cleanQ);

  for (const u of rows) {
    u.username = u.username || u.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');
    u.handle = `@${u.username}`;
    const intRows = await db.all(`
      SELECT i.name FROM user_interests ui
      JOIN interests i ON i.id = ui.interest_id
      WHERE ui.user_id = ?
      ORDER BY i.name
    `, u.id);
    u.interests = intRows.map(r => r.name);
  }

  return rows;
}

// 14. Find or Create Personal 1-on-1 DM
async function findOrCreatePersonalConversation(userA, userB) {
  const existing = await db.get(`
    SELECT c.id FROM chat_conversations c
    JOIN chat_members m1 ON m1.conversation_id = c.id AND m1.user_id = ?
    JOIN chat_members m2 ON m2.conversation_id = c.id AND m2.user_id = ?
    WHERE c.type = 'personal'
    LIMIT 1
  `, userA, userB);

  if (existing) return existing.id;

  const targetUser = await db.get("SELECT name, username, email FROM users WHERE id = ?", userB);
  const convName = targetUser?.name || 'Personal Chat';

  const res = await db.run(
    "INSERT INTO chat_conversations (type, name, created_by) VALUES ('personal', ?, ?)",
    convName, userA
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
  getChannelsForUser,
  getConversationDetails,
  getMessages,
  postMessage,
  editMessage,
  deleteMessage,
  addMemberToChannel,
  removeMemberFromChannel,
  joinChannel,
  leaveChannel,
  deleteChannel,
  togglePin,
  toggleReaction,
  votePoll,
  getConversationFiles,
  searchUsers,
  findOrCreatePersonalConversation
};
