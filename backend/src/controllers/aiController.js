const { db, findById, findOne, findMany, create, updateById, upsertOne } = require('../config/db');
const aiService = require('../services/aiService');

const classify = async (req, res, next) => {
  try {
    const { conversationId } = req.body;
    if (!conversationId) return res.status(400).json({ success: false, message: 'conversationId required' });

    const conv = await findById(db.conversations, conversationId);
    if (!conv) return res.status(404).json({ success: false, message: 'Conversation not found' });

    const messages = await findMany(db.messages, { conversationId }, { sort: { timestamp: 1 } });
    const bodyText = messages.map(m => m.body).join('\n\n');
    const result = await aiService.classifyConversation(conv.subject, bodyText, conv.participants || []);

    const patch = {
      conversationId,
      classification: result.classification,
      confidence: result.confidence || 0.85,
      reason: result.reason || 'AI classified',
      summary: result.summary || `Summary of: ${conv.subject}`,
      priority: result.priority || 'MEDIUM',
      requiresAction: result.requiresAction !== undefined ? result.requiresAction : false,
      extractedEvents: result.extractedEvents || [],
      suggestedCategories: [result.classification],
      analyzedAt: new Date(),
    };

    const existing = await findOne(db.aiAnalysis, { conversationId });
    const analysis = existing ? await updateById(db.aiAnalysis, existing._id, patch) : await create(db.aiAnalysis, patch);

    await updateById(db.conversations, conversationId, {
      aiClassification: result.classification,
      priority: result.priority || conv.priority,
      requiresAction: result.requiresAction !== undefined ? result.requiresAction : conv.requiresAction,
      hasUpcomingMeeting: (result.extractedEvents || []).length > 0 ? true : conv.hasUpcomingMeeting,
    });

    res.json({ success: true, data: { analysis } });
  } catch (e) { next(e); }
};

const summarize = async (req, res, next) => {
  try {
    const { conversationId } = req.body;
    if (!conversationId) return res.status(400).json({ success: false, message: 'conversationId required' });
    const messages = await findMany(db.messages, { conversationId }, { sort: { timestamp: 1 } });
    const summary = await aiService.summarizeConversation(messages);

    const existing = await findOne(db.aiAnalysis, { conversationId });
    const analysis = existing
      ? await updateById(db.aiAnalysis, existing._id, { summary, analyzedAt: new Date() })
      : await create(db.aiAnalysis, { conversationId, summary, analyzedAt: new Date() });

    res.json({ success: true, data: { summary, analysis } });
  } catch (e) { next(e); }
};

const generateReply = async (req, res, next) => {
  try {
    const { conversationId, tone, instructions } = req.body;
    if (!conversationId) return res.status(400).json({ success: false, message: 'conversationId required' });

    const conv = await findById(db.conversations, conversationId);
    if (!conv) return res.status(404).json({ success: false, message: 'Not found' });

    const messages = await findMany(db.messages, { conversationId }, { sort: { timestamp: 1 } });
    const bodyText = await aiService.generateReply(conv, messages, instructions || tone);

    const lastMsg = messages[messages.length - 1];
    const to = lastMsg?.fromEmail || conv.participants?.[0]?.email || '';
    const subject = conv.subject.startsWith('Re:') ? conv.subject : `Re: ${conv.subject}`;

    // Upsert draft
    const existing = await findOne(db.replyDrafts, { conversationId, authorId: req.userId });
    const draft = existing
      ? await updateById(db.replyDrafts, existing._id, { body: bodyText, to, subject, status: 'draft', aiGenerated: true })
      : await create(db.replyDrafts, { conversationId, authorId: req.userId, to, subject, body: bodyText, status: 'draft', aiGenerated: true });

    res.json({ success: true, data: draft });
  } catch (e) { next(e); }
};

const extractEvents = async (req, res, next) => {
  try {
    const { conversationId } = req.body;
    const messages = await findMany(db.messages, { conversationId }, { sort: { timestamp: 1 } });
    const events = await aiService.extractEvents(messages);
    res.json({ success: true, data: { events } });
  } catch (e) { next(e); }
};

module.exports = { classify, summarize, generateReply, extractEvents };
