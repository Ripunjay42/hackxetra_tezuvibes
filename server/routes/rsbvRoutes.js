const express = require('express');
const { selectAllRsbpByUserId,selectAllRsbpByEventId , createRsbp } = require('../controllers/rsbvController'); // Use require
const router = express.Router();

// Endpoint to create a new event
router.post('/', createRsbp);

// Endpoint to retrieve all events
router.get('/userid', selectAllRsbpByUserId);
router.get('/eventid',selectAllRsbpByEventId);

module.exports = router;