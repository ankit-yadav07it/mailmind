const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.post('/classify', aiController.classify);
router.post('/summarize', aiController.summarize);
router.post('/generate-reply', aiController.generateReply);
router.post('/extract-events', aiController.extractEvents);

module.exports = router;
