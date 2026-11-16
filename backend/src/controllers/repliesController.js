const { db, findMany, findById, updateById, create } = require('../config/db');

const getDrafts = async (req, res, next) => {
  try {
    const drafts = await findMany(db.replyDrafts, { authorId: req.userId }, { sort: { createdAt: -1 } });
    const withConv = await Promise.all(
      drafts.map(async (d) => {
        const conv = await findById(db.conversations, d.conversationId);
        return { ...d, conversation: conv || null };
      })
    );
    res.json({ success: true, data: { drafts: withConv } });
  } catch (e) {
    next(e);
  }
};

const createDraft = async (req, res, next) => {
  try {
    const { conversationId, to, subject, body } = req.body;
    const draft = await create(db.replyDrafts, {
      conversationId,
      authorId: req.userId,
      to,
      subject,
      body,
      status: 'draft',
      aiGenerated: false,
    });
    res.status(201).json({ success: true, data: draft });
  } catch (e) {
    next(e);
  }
};

const updateDraft = async (req, res, next) => {
  try {
    const draft = await updateById(db.replyDrafts, req.params.id, { body: req.body.body });
    res.json({ success: true, data: draft });
  } catch (e) {
    next(e);
  }
};

const sendDraft = async (req, res, next) => {
  try {
    const draft = await findById(db.replyDrafts, req.params.id);
    if (!draft) return res.status(404).json({ success: false, message: 'Draft not found' });

    const updatedDraft = await updateById(db.replyDrafts, req.params.id, {
      status: 'sent_simulated',
      sentAt: new Date(),
    });

    // Fetch user details for sender metadata
    const user = await findById(db.users, req.userId);

    // Append outgoing message to conversation thread
    if (draft.conversationId) {
      await create(db.messages, {
        conversationId: String(draft.conversationId),
        fromEmail: user?.email || 'assistant@demo.com',
        fromName: user?.name || 'Morgan Vance',
        toEmail: draft.to || 'recipient@example.com',
        toName: 'Recipient',
        body: draft.body,
        timestamp: new Date(),
        isRead: true,
      });

      // Update conversation state: reply sent, now waiting for counterparty response
      const conv = await findById(db.conversations, draft.conversationId);
      if (conv) {
        await updateById(db.conversations, draft.conversationId, {
          requiresAction: false,
          waitingForResponse: true,
          lastMessageAt: new Date(),
          snippet: draft.body.substring(0, 140),
          messageCount: (conv.messageCount || 1) + 1,
        });
      }

      // Record activity notification
      await create(db.notifications, {
        userId: req.userId,
        type: 'reply_sent',
        title: 'Reply Sent (Simulated)',
        message: `Response successfully delivered for: ${draft.subject || 'Conversation'}`,
        isRead: false,
        conversationId: draft.conversationId,
      });
    }

    res.json({ success: true, data: updatedDraft, message: 'Reply sent (simulated)' });
  } catch (e) {
    next(e);
  }
};

module.exports = { getDrafts, createDraft, updateDraft, sendDraft };
