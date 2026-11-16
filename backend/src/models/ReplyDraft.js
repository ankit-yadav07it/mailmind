const mongoose = require('mongoose');

const replyDraftSchema = new mongoose.Schema(
  {
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    to: { type: String },
    subject: { type: String },
    body: { type: String },
    status: { type: String, enum: ['draft', 'approved', 'sent_simulated'], default: 'draft' },
    aiGenerated: { type: Boolean, default: false },
    sentAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ReplyDraft', replyDraftSchema);
