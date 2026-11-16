const { db, findMany, updateMany, updateById } = require('../config/db');

const getNotifications = async (req, res, next) => {
  try {
    const notifs = await findMany(db.notifications, { userId: req.userId }, { sort: { createdAt: -1 }, limit: 20 });
    res.json({ success: true, data: { notifications: notifs } });
  } catch (e) { next(e); }
};

const markAllRead = async (req, res, next) => {
  try {
    await updateMany(db.notifications, { userId: req.userId }, { isRead: true });
    res.json({ success: true, message: 'All notifications marked read' });
  } catch (e) { next(e); }
};

const markRead = async (req, res, next) => {
  try {
    await updateById(db.notifications, req.params.id, { isRead: true });
    res.json({ success: true, message: 'Notification marked read' });
  } catch (e) { next(e); }
};

module.exports = { getNotifications, markAllRead, markRead };
