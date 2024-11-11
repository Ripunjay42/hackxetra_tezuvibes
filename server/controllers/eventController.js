const { selectAll, createEventService } = require("../services/eventService"); // Use require instead of import

// Handler to select all events
exports.selectAllEvent = async (req, res) => {
    return await selectAll(req, res); // Calls the function from eventService
};

// Handler to create a new event
exports.createEvent = async (req, res) => {
    return await createEventService(req, res); // Calls the function from eventService
};