const mongoose = require('mongoose');

const aiAnalysisSchema = new mongoose.Schema(
  {
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', unique: true },
    classification: { type: String },
    confidence: { type: Number, min: 0, max: 1 },
    reason: { type: String },
    summary: { type: String },
    priority: { type: String },
    requiresAction: { type: Boolean },
    extractedEvents: [{ title: String, date: String, type: String }],
    suggestedCategories: [{ type: String }],
    analyzedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AIAnalysis', aiAnalysisSchema);
