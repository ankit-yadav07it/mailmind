const { db, findById, findOne, findMany, updateById, create } = require('../config/db');

const getAttention = async (req, res, next) => {
  try {
    const client = await findById(db.users, req.userId);
    if (!client) return res.status(404).json({ success: false, message: 'User not found' });

    // Get all accounts belonging to client and their linked assistant
    const userIds = [req.userId];
    if (client.linkedUserId) userIds.push(client.linkedUserId);
    const accounts = await findMany(db.emailAccounts, { userId: { $in: userIds } });
    const accountIds = accounts.map(a => a._id);

    let conversations = await findMany(db.conversations, { accountId: { $in: accountIds }, status: 'open', isArchived: false });
    conversations = conversations.filter(c => (c.manualClassification || c.aiClassification) === 'CLIENT_TO_REPLY');

    // Priority sort
    const pw = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    conversations.sort((a, b) => (pw[b.priority] || 2) - (pw[a.priority] || 2) || new Date(b.lastMessageAt) - new Date(a.lastMessageAt));

    const withAnalysis = await Promise.all(conversations.map(async c => {
      const ai = await findOne(db.aiAnalysis, { conversationId: c._id });
      return { ...c, aiAnalysis: ai || null };
    }));

    res.json({ success: true, data: { conversations: withAnalysis, count: withAnalysis.length } });
  } catch (e) { next(e); }
};

const handleConversation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const conv = await findById(db.conversations, id);
    if (!conv) return res.status(404).json({ success: false, message: 'Not found' });

    await updateById(db.conversations, id, { status: 'completed', requiresAction: false });
    const client = await findById(db.users, req.userId);
    if (client?.linkedUserId) {
      await create(db.notifications, {
        userId: client.linkedUserId,
        type: 'client_action',
        title: 'Client Marked as Handled',
        body: `${client.name} handled "${conv.subject}"`,
        conversationId: id,
      });
    }
    res.json({ success: true, message: 'Marked as handled' });
  } catch (e) { next(e); }
};

const takeOver = async (req, res, next) => {
  try {
    const { id } = req.params;
    const conv = await findById(db.conversations, id);
    if (!conv) return res.status(404).json({ success: false, message: 'Not found' });

    await updateById(db.conversations, id, { manualClassification: 'ASSISTANT_TO_REPLY', requiresAction: true });
    const client = await findById(db.users, req.userId);
    if (client?.linkedUserId) {
      await create(db.notifications, {
        userId: client.linkedUserId,
        type: 'client_action',
        title: 'Assistant Assigned',
        body: `${client.name} asked assistant to handle "${conv.subject}"`,
        conversationId: id,
      });
    }
    res.json({ success: true, message: 'Reassigned to assistant' });
  } catch (e) { next(e); }
};

module.exports = { getAttention, handleConversation, takeOver };
