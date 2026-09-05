const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsControllers');

router.get('/', statsController.getPublicStats);

module.exports = router;
