const { db, findMany, findById, findOne, updateById, create, count, upsertOne } = require('../config/db');

// Helper: get effective classification
function effectiveClass(conv) {
  return conv.manualClassification || conv.aiClassification;
}

// Build category filter
function categoryFilter(category) {
  if (!category || category === 'all') return {};
  if (['ASSISTANT_TO_REPLY','CLIENT_TO_REPLY','NO_REPLY_NEEDED','NEEDS_REVIEW'].includes(category)) {
    // We'll filter in JS since NeDB $or with null is tricky
    return { _classFilter: category };
  }
  if (category === 'action_required') return { requiresAction: true };
  if (category === 'waiting')   return { waitingForResponse: true };
  if (category === 'meetings')  return { hasUpcomingMeeting: true };
  if (category === 'important') return { isImportant: true };
  if (category === 'archived')  return { isArchived: true };
  return {};
}

const getConversations = async (req, res, next) => {
  try {
    const { category, search, sort = 'newest', page = 1, limit = 20, isArchived } = req.query;
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const skip = (pageNum - 1) * limitNum;

    // Get user's email accounts
    const accounts = await findMany(db.emailAccounts, { userId: req.userId });
    const accountIds = accounts.map(a => a._id);
    if (accountIds.length === 0) {
      return res.json({ success: true, data: { conversations: [], total: 0, page: pageNum, totalPages: 0 } });
    }

    // Base filter
    const filter = { accountId: { $in: accountIds } };
    if (isArchived !== undefined) filter.isArchived = isArchived === 'true';
    else filter.isArchived = false;

    const catFilter = categoryFilter(category);
    const classTarget = catFilter._classFilter;
    delete catFilter._classFilter;
    Object.assign(filter, catFilter);

    const sortOpt = sort === 'oldest' ? { lastMessageAt: 1 } :
                    sort === 'priority' ? { priority: -1, lastMessageAt: -1 } :
                    { lastMessageAt: -1 };

    let conversations = await findMany(db.conversations, filter, { sort: sortOpt });

    // JS-level filtering
    if (classTarget) {
      conversations = conversations.filter(c => effectiveClass(c) === classTarget);
    }
    if (search && search.trim()) {
      const re = new RegExp(search.trim(), 'i');
      conversations = conversations.filter(c =>
        re.test(c.subject) || re.test(c.snippet) ||
        (c.participants || []).some(p => re.test(p.name) || re.test(p.email))
      );
    }

    const total = conversations.length;
    const paginated = conversations.slice(skip, skip + limitNum);

    // Attach AI analysis
    const withAnalysis = await Promise.all(paginated.map(async conv => {
      const ai = await findOne(db.aiAnalysis, { conversationId: conv._id });
      return { ...conv, aiAnalysis: ai || null };
    }));

    res.json({ success: true, data: {
      conversations: withAnalysis, total, page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1
    }});
  } catch (e) { next(e); }
};

const getConversation = async (req, res, next) => {
  try {
    const conv = await findById(db.conversations, req.params.id);
    if (!conv) return res.status(404).json({ success: false, message: 'Not found' });

    // Mark as read
    if (!conv.isRead) await updateById(db.conversations, conv._id, { isRead: true });

    const messages = await findMany(db.messages, { conversationId: conv._id }, { sort: { timestamp: 1 } });
    const aiAnalysis = await findOne(db.aiAnalysis, { conversationId: conv._id });

    res.json({ success: true, data: { ...conv, isRead: true, messages, aiAnalysis: aiAnalysis || null } });
  } catch (e) { next(e); }
};

const updateConversation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const conv = await findById(db.conversations, id);
    if (!conv) return res.status(404).json({ success: false, message: 'Not found' });

    const allowed = ['manualClassification','isRead','isImportant','isArchived','status','priority','requiresAction','waitingForResponse','hasUpcomingMeeting'];
    const patch = {};
    for (const k of allowed) if (req.body[k] !== undefined) patch[k] = req.body[k];

    const updated = await updateById(db.conversations, id, patch);

    // Notify on classification change
    if (patch.manualClassification && patch.manualClassification !== (conv.manualClassification || conv.aiClassification)) {
      const user = await findById(db.users, req.userId);
      if (user && user.linkedUserId) {
        await create(db.notifications, {
          userId: user.linkedUserId,
          type: 'classification_changed',
          title: 'Classification Changed',
          body: `"${conv.subject}" reclassified to ${patch.manualClassification}`,
          conversationId: id,
        });
      }
    }

    const aiAnalysis = await findOne(db.aiAnalysis, { conversationId: id });
    res.json({ success: true, data: { ...updated, aiAnalysis: aiAnalysis || null } });
  } catch (e) { next(e); }
};

module.exports = { getConversations, getConversation, updateConversation };
