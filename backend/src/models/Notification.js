const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['new_email', 'classification_changed', 'client_action', 'reply_needed'],
  },
  title: { type: String },
  body: { type: String },
  isRead: { type: Boolean, default: false },
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Notification', notificationSchema);
