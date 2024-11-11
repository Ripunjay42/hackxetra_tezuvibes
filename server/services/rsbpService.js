const { v4: uuidv4 } = require('uuid');
const db = require('../db/connection');

exports.create = (req, res) => {
    const userId = req.headers.userid; 
    console.log(userId);
    const { eventId } = req.body;  // Assuming eventId is passed in the request body
    console.log(eventId);

    if (!eventId || !userId) {
        return res.status(400).json({ message: 'Event ID and User ID are required' });
    }

    // First, check if an RSVP already exists for this event
    db.oneOrNone('SELECT * FROM rsvps WHERE "eventId" = $1', [eventId])
        .then((data) => {
            if (data) {
                // If RSVP exists, check if the userId is already in the userId array
                if (data.userIds && data.userIds.includes(userId)) {
                    return res.status(400).json({ message: 'User already RSVP\'d for this event' });
                }

                // If not, push the userId to the existing array and update the database
                data.userIds.push(userId);

                db.none('UPDATE rsvps SET "userIds" = $1 WHERE "eventId" = $2', [data.userIds, eventId])
                    .then(() => {
                        res.status(200).json({
                            message: 'RSVP updated successfully',
                            rsvpData: data,
                        });
                    })
                    .catch((error) => {
                        console.error('Error updating RSVP:', error);
                        res.status(500).json({ message: 'Failed to update RSVP', error });
                    });
            } else {
                // If no RSVP exists for this event, create a new one
                const rsvpData = {
                    id: uuidv4(),
                    eventId: eventId,
                    userIds: [userId],  // Initialize with the first userId
                    createdAt: new Date(),
                };

                db.none('INSERT INTO rsvps ("id", "eventId", "userIds", "createdAt") VALUES ($1, $2, $3, $4)', 
                    [rsvpData.id, rsvpData.eventId, rsvpData.userIds, rsvpData.createdAt])
                    .then(() => {
                        res.status(201).json({
                            message: 'RSVP created successfully',
                            rsvpData: rsvpData,
                        });
                    })
                    .catch((error) => {
                        console.error('Error creating RSVP:', error);
                        res.status(500).json({ message: 'Failed to create RSVP', error });
                    });
            }
        })
        .catch((error) => {
            console.error('Error checking RSVP:', error);
            res.status(500).json({ message: 'Failed to check RSVP', error });
        });
};

exports.getAllByUserId = (req, res) => {
    const userId = req.headers.userid;  // Get the userId from the request headers
    console.log(userId);
    
    if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    // Query the database to select all RSVPs for the given userId
    db.any('SELECT * FROM rsvps WHERE $1 = ANY("userIds")', [userId])  // Use the ANY operator for arrays
        .then((data) => {
            if (data.length === 0) {
                return res.status(404).json({ message: 'No RSVPs found for the user' });
            }

            // If RSVPs are found, send them as the response
            res.status(200).json({
                message: 'RSVPs fetched successfully',
                rsvps: data,
            });
        })
        .catch((error) => {
            // Handle any errors that occur during the query
            console.error('Error fetching RSVPs:', error);
            res.status(500).json({ message: 'Failed to fetch RSVPs', error });
        });
};


exports.getAllByEventId = (req, res) => {
    const {eventId} = req.body;  // Get the eventId from the request parameters

    if (!eventId) {
        return res.status(400).json({ message: 'Event ID is required' });
    }

    // Query the database to select all RSVPs for the given eventId
    db.any('SELECT * FROM rsvps WHERE "eventId" = $1', [eventId])
        .then((data) => {
            // If RSVPs are found, send them as the response
            res.status(200).json({
                message: 'RSVPs fetched successfully',
                rsvps: data,
            });
        })
        .catch((error) => {
            // Handle any errors that occur during the query
            console.error('Error fetching RSVPs:', error);
            res.status(500).json({ message: 'Failed to fetch RSVPs', error });
        });
};