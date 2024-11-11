const formidable = require('formidable');
const path = require('path');
const fs = require('fs');
const db = require('../db/connection');
const { v4: uuidv4 } = require('uuid');

exports.createEventService = (req, res) => {
    const form = new formidable.IncomingForm();
    const userId = req.headers.userid;
    console.log(userId);
    const currentTime = new Date();

    // Parse the form
    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(500).json({ message: 'Error in file upload', error: err });
        }

        const poster = files.poster[0];
        if (!poster) {
            return res.status(400).json({ message: 'Poster file is required' });
        }

        const oldPath = poster.filepath;
        const newPath = path.join(__dirname, '../public/uploads', poster.originalFilename);

        // Copy file to the new location
        fs.copyFile(oldPath, newPath, async (error) => {
            if (error) {
                return res.status(500).json({ message: 'Error moving file', error });
            }

            // Parse event date and times as required formats
            const eventDate = new Date(fields.eventdate);

            // Ensure fromTime and toTime are not arrays and are properly formatted
            let fromTime = Array.isArray(fields.startingtime) ? fields.startingtime[0] : fields.startingtime;
            let toTime = Array.isArray(fields.endingtime) ? fields.endingtime[0] : fields.endingtime;

            // Ensure the time format is correct (HH:MM:SS format)
            fromTime = fromTime ? `${fromTime}:00` : null;
            toTime = toTime ? `${toTime}:00` : null;

            // Ensure eventDate is parsed correctly for PostgreSQL timestamp without timezone
            if (isNaN(eventDate.getTime())) {
                return res.status(400).json({ message: 'Invalid event date format' });
            }

            // Event data
            const eventData = {
                id: uuidv4(), // Generate unique UUID for the event
                eventName: fields.eventname,
                description: fields.description,
                date: eventDate, // Date object for PostgreSQL timestamp
                location: fields.location,
                fromTime: fromTime,
                toTime: toTime,
                eventImageURL: `/uploads/${poster.originalFilename}`,
                userId: userId,
                createdAt: currentTime,
                updatedAt: currentTime,
            };

            const insertQuery = `
                INSERT INTO events ("id", "eventName", "description", "date", "location", "fromTime", "toTime", "eventImageURL", "userId", "createdAt", "updatedAt")
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                RETURNING id;
            `;

            // Execute the insert query
            try {
                const data = await db.one(insertQuery, [
                    eventData.id,  // Pass the generated UUID for the event
                    eventData.eventName,
                    eventData.description,
                    eventData.date,
                    eventData.location,
                    eventData.fromTime, // time value
                    eventData.toTime,   // time value
                    eventData.eventImageURL,
                    eventData.userId,
                    eventData.createdAt,
                    eventData.updatedAt,
                ]);

                console.log(eventData);
                // Respond with success and the new event ID
                res.status(200).json({
                    message: 'Event created successfully',
                    eventId: data.id,  // The returned id is automatically generated
                    eventData: eventData,
                });
            } catch (error) {
                console.error('Error inserting event:', error);
                res.status(500).json({ message: 'Failed to create event', error });
            }
        });
    });
};


exports.selectAll = (req, res) => {
    const userId = req.headers.userid;  // Get the userId from the request headers

    if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    // Query the database to select all events for the given userId
    db.any('SELECT * FROM events')
        .then((data) => {
            // If events are found, send them as the response
            res.status(200).json({
                message: 'Events fetched successfully',
                events: data,
            });
        })
        .catch((error) => {
            // Handle any errors that occur during the query
            console.error('Error fetching events:', error);
            res.status(500).json({ message: 'Failed to fetch events', error });
        });
};