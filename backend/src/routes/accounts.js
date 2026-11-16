const express = require('express');
const router = express.Router();
const accountsController = require('../controllers/accountsController');

router.get('/', accountsController.getAccounts);
router.post('/connect', accountsController.connectAccount);
router.post('/', accountsController.connectAccount);
router.delete('/:id', accountsController.deleteAccount);

module.exports = router;
