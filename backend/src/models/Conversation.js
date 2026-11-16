const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'EmailAccount', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true },
    participants: [{ name: String, email: String }],
    lastMessageAt: { type: Date, default: Date.now },
    isRead: { type: Boolean, default: false },
    isImportant: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
    status: { type: String, enum: ['open', 'completed', 'archived'], default: 'open' },
    aiClassification: {
      type: String,
      enum: ['ASSISTANT_TO_REPLY', 'CLIENT_TO_REPLY', 'NO_REPLY_NEEDED', 'NEEDS_REVIEW'],
    },
    manualClassification: {
      type: String,
      enum: ['ASSISTANT_TO_REPLY', 'CLIENT_TO_REPLY', 'NO_REPLY_NEEDED', 'NEEDS_REVIEW'],
    },
    priority: { type: String, enum: ['HIGH', 'MEDIUM', 'LOW'], default: 'MEDIUM' },
    requiresAction: { type: Boolean, default: false },
    waitingForResponse: { type: Boolean, default: false },
    hasUpcomingMeeting: { type: Boolean, default: false },
    snippet: { type: String },
    messageCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

conversationSchema.virtual('effectiveClassification').get(function () {
  return this.manualClassification || this.aiClassification;
});

conversationSchema.virtual('aiAnalysis', {
  ref: 'AIAnalysis',
  localField: '_id',
  foreignField: 'conversationId',
  justOne: true,
});

conversationSchema.virtual('messages', {
  ref: 'Message',
  localField: '_id',
  foreignField: 'conversationId',
});

conversationSchema.set('toJSON', { virtuals: true });
conversationSchema.set('toObject', { virtuals: true });

conversationSchema.index({ userId: 1 });
conversationSchema.index({ aiClassification: 1 });
conversationSchema.index({ lastMessageAt: -1 });

module.exports = mongoose.model('Conversation', conversationSchema);
