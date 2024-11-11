const {getAllByUserId,create,getAllByEventId } = require("../services/rsbpService");

exports.selectAllRsbpByUserId = async (req, res) => {
    return await getAllByUserId(req, res); // Calls the function from eventService
};

exports.selectAllRsbpByEventId = async (req, res) => {
    return await getAllByEventId(req, res); // Calls the function from eventService
};


// Handler to create a new event
exports.createRsbp = async (req, res) => {
    return await create(req, res); // Calls the function from eventService
};