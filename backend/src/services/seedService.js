/**
 * seedService.js — Seeds the NeDB database with demo users, email accounts and conversations.
 * Uses db.js helpers instead of Mongoose models.
 */
const bcrypt = require('bcryptjs');
const { db, create, findOne, count, updateById } = require('../config/db');
const aiService = require('./aiService');
const { getSeedConversations } = require('./mockEmailService');

const seedForAccount = async (accountId, userId) => {
  try {
    const seedConvs = getSeedConversations(accountId, userId);

    for (const item of seedConvs) {
      const lastMsg = item.messages[item.messages.length - 1];
      const snippet = lastMsg ? lastMsg.body.substring(0, 140) : '';

      const conv = await create(db.conversations, {
        accountId: String(accountId),
        userId: String(userId),
        subject: item.subject,
        participants: item.participants,
        lastMessageAt: item.lastMessageAt || (lastMsg ? lastMsg.timestamp : new Date()),
        isRead: false,
        isImportant: item.isImportant || false,
        isArchived: false,
        status: 'open',
        aiClassification: item.classification,
        manualClassification: null,
        priority: item.priority || 'MEDIUM',
        requiresAction: item.requiresAction || false,
        waitingForResponse: item.waitingForResponse || false,
        hasUpcomingMeeting: item.hasUpcomingMeeting || false,
        snippet,
        messageCount: item.messages.length,
      });

      // Create messages for this conversation
      for (const msg of item.messages) {
        await create(db.messages, {
          conversationId: String(conv._id),
          fromEmail: msg.fromEmail,
          fromName: msg.fromName,
          toEmail: msg.toEmail,
          toName: msg.toName || (msg.toEmail && msg.toEmail.includes('assistant') ? 'Assistant' : 'Client'),
          body: msg.body,
          timestamp: msg.timestamp || new Date(),
          isRead: false,
        });
      }

      // Generate AI analysis
      const allText = item.messages.map((m) => m.body).join('\n');
      const aiResult = await aiService.classifyConversation(item.subject, allText, item.participants);

      await create(db.aiAnalysis, {
        conversationId: String(conv._id),
        classification: item.classification,
        confidence: aiResult.confidence || 0.88,
        reason: aiResult.reason || `Classified as ${item.classification} based on content keywords.`,
        summary: aiResult.summary || `Summary of conversation regarding: ${item.subject}.`,
        priority: item.priority || aiResult.priority || 'MEDIUM',
        requiresAction: item.requiresAction || false,
        extractedEvents: aiResult.extractedEvents || [],
        suggestedCategories: [item.classification],
        analyzedAt: new Date(),
      });
    }

    console.log(`✅ Seeded ${seedConvs.length} conversations for account ${accountId}`);
    return seedConvs.length;
  } catch (error) {
    console.error('Error in seedForAccount:', error.message);
    throw error;
  }
};

const seed = async () => {
  try {
    // NeDB is always "ready" — just check if users already exist
    const existingCount = await count(db.users, {});
    if (existingCount > 0) {
      console.log('✅ Database already initialized. Skipping seed.');
      return;
    }

    console.log('🌱 Seeding initial database data...');

    const passwordHash = await bcrypt.hash('Demo1234!', 10);

    // 1. Create client user
    const client = await create(db.users, {
      name: 'Alex Mercer',
      email: 'client@demo.com',
      passwordHash,
      role: 'client',
      linkedUserId: null,
    });

    // 2. Create assistant user (linked to client)
    const assistant = await create(db.users, {
      name: 'Morgan Vance',
      email: 'assistant@demo.com',
      passwordHash,
      role: 'assistant',
      linkedUserId: String(client._id),
    });

    // Back-link client → assistant
    await updateById(db.users, client._id, { linkedUserId: String(assistant._id) });

    // 3. Create simulated Gmail account for assistant
    const account = await create(db.emailAccounts, {
      userId: String(assistant._id),
      provider: 'gmail',
      emailAddress: 'assistant@demo.com',
      displayName: 'Primary Gmail',
      avatarColor: '#4F7CFF',
      status: 'connected',
      isSimulated: true,
      lastSynced: new Date(),
    });

    // 4. Seed conversations and messages
    await seedForAccount(account._id, assistant._id);

    console.log('✅ Seeding complete: 2 users, 1 email account, 20 conversations created.');
  } catch (error) {
    console.error('❌ Error during seeding:', error.message);
  }
};

module.exports = { seed, seedForAccount };
