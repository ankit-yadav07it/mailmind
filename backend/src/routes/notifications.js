const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notificationsController');

router.get('/', notificationsController.getNotifications);
router.patch('/read-all', notificationsController.markAllRead);
router.patch('/:id/read', notificationsController.markRead);

module.exports = router;
