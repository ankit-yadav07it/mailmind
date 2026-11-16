const { db, create, findMany, findById, remove } = require('../config/db');
const { seedForAccount } = require('../services/seedService');

const getAccounts = async (req, res, next) => {
  try {
    const accounts = await findMany(db.emailAccounts, { userId: req.userId });
    res.json({ success: true, data: { accounts } });
  } catch (e) { next(e); }
};

const connectAccount = async (req, res, next) => {
  try {
    const { provider = 'gmail', emailAddress } = req.body;
    const email = emailAddress || `${req.userId.slice(0,6)}@${provider}.com`;
    const account = await create(db.emailAccounts, {
      userId: req.userId,
      provider,
      emailAddress: email,
      displayName: provider === 'gmail' ? 'Google Workspace' : 'Microsoft Outlook',
      avatarColor: provider === 'gmail' ? '#EA4335' : '#0078D4',
      status: 'connected',
      isSimulated: true,
      lastSynced: new Date(),
    });
    // Seed conversations for this account
    await seedForAccount(account._id, req.userId);
    res.json({ success: true, data: { account } });
  } catch (e) { next(e); }
};

const deleteAccount = async (req, res, next) => {
  try {
    await remove(db.emailAccounts, { _id: req.params.id, userId: req.userId });
    await remove(db.conversations, { accountId: req.params.id });
    res.json({ success: true, message: 'Account removed' });
  } catch (e) { next(e); }
};

module.exports = { getAccounts, connectAccount, deleteAccount };
