const express = require('express');
const { selectAllEvent, createEvent } = require('../controllers/eventController'); // Use require
const router = express.Router();

// Endpoint to create a new event
router.post('/', createEvent);

// Endpoint to retrieve all events
router.get('/', selectAllEvent);

module.exports = router;