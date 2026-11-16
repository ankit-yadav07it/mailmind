const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');

router.get('/attention', clientController.getAttention);
router.patch('/conversations/:id/handled', clientController.handleConversation);
router.patch('/conversations/:id/take-over', clientController.takeOver);

module.exports = router;
