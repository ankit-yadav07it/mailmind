const express = require('express');
const router = express.Router();
const conversationsController = require('../controllers/conversationsController');

router.get('/', conversationsController.getConversations);
router.get('/:id', conversationsController.getConversation);
router.patch('/:id', conversationsController.updateConversation);

module.exports = router;
