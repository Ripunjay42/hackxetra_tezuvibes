const express = require('express');
const router = express.Router();
const streamController = require('../controllers/streamController');

router.post('/token', streamController.generateToken);

module.exports = router;