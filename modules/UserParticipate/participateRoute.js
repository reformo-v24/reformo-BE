

const express = require('express');
const participateController = require('./participateController');

const participateRoute = express.Router();

// POST route for updating participant details
participateRoute.post('/participate', participateController.updateParticipantDetails);

// GET route for retrieving participants by IgoName and Tier
participateRoute.get('/participants/:igoName/:tier', participateController.getParticipantsByIgoNameAndTier);

// Define route for getting participation status
participateRoute.get('/participateStatus/:igoId/:walletAddress', participateController.getParticipationStatus);




module.exports = participateRoute;

