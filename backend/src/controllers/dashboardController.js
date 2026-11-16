const { db, findMany, findOne, count } = require('../config/db');

const getStats = async (req, res, next) => {
  try {
    const accounts = await findMany(db.emailAccounts, { userId: req.userId });
    const accountIds = accounts.map(a => a._id);

    if (accountIds.length === 0) {
      return res.json({ success: true, data: { total:0,unread:0,important:0,actionRequired:0,waitingForResponse:0,upcomingMeetings:0,assistantToReply:0,clientToReply:0,noReplyNeeded:0,needsReview:0 }});
    }

    const baseFilter = { accountId: { $in: accountIds }, isArchived: false };
    const all = await findMany(db.conversations, baseFilter);

    function effectiveClass(c) { return c.manualClassification || c.aiClassification; }

    const stats = {
      total:             all.length,
      unread:            all.filter(c => !c.isRead).length,
      important:         all.filter(c => c.isImportant).length,
      actionRequired:    all.filter(c => c.requiresAction).length,
      waitingForResponse:all.filter(c => c.waitingForResponse).length,
      upcomingMeetings:  all.filter(c => c.hasUpcomingMeeting && c.status === 'open').length,
      assistantToReply:  all.filter(c => effectiveClass(c) === 'ASSISTANT_TO_REPLY').length,
      clientToReply:     all.filter(c => effectiveClass(c) === 'CLIENT_TO_REPLY').length,
      noReplyNeeded:     all.filter(c => effectiveClass(c) === 'NO_REPLY_NEEDED').length,
      needsReview:       all.filter(c => effectiveClass(c) === 'NEEDS_REVIEW').length,
    };

    res.json({ success: true, data: stats });
  } catch (e) { next(e); }
};

module.exports = { getStats };
