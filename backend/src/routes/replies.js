const express = require('express');
const router = express.Router();
const repliesController = require('../controllers/repliesController');

router.get('/', repliesController.getDrafts);
router.post('/draft', repliesController.createDraft);
router.post('/', repliesController.createDraft);
router.patch('/:id', repliesController.updateDraft);
router.post('/:id/send', repliesController.sendDraft);

module.exports = router;
