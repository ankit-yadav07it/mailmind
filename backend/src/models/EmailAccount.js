const mongoose = require('mongoose');

const emailAccountSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  provider: { type: String, enum: ['gmail', 'outlook', 'yahoo'], default: 'gmail' },
  emailAddress: { type: String, required: true },
  displayName: { type: String },
  avatarColor: { type: String, default: '#4F7CFF' },
  status: { type: String, enum: ['connected', 'disconnected', 'syncing'], default: 'connected' },
  isSimulated: { type: Boolean, default: true },
  lastSynced: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('EmailAccount', emailAccountSchema);
