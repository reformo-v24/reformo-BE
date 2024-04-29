const express = require('express');
const farmCtr = require('./farmCtr');
const farmHelper = require('./farmHelper');
const Auth = require('../../helper/auth');

const farmRoute = express.Router();

// add new network
const getFarmReport = [Auth.apiKeyAuthentication, farmCtr.getUserBalances];
farmRoute.get('/getList', getFarmReport);

// farm helper
const farmHelperRoute = [Auth.apiKeyAuthentication, farmHelper.checkForDuplicate];
farmRoute.get('/farmList', farmHelperRoute);
module.exports = farmRoute;
