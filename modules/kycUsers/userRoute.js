const express = require('express');
const UserCtr = require('./userController');
const multipart = require('connect-multiparty');
const Utils = require('../../helper/utils');
const multipartMiddleware = multipart();
const UserMiddleware = require('./userMiddleware');

const web3Helper = require('../../helper/web3Helper');

const Auth = require('../../helper/auth');
const auth = require('../../helper/auth');

const userRoute = express.Router();
// get roles
const listUser = [Auth.isAuthenticatedUser, UserCtr.list];
userRoute.get('/list', listUser);

// login admin
const getRandom = [
  Auth.isAuthenticatedUser,
  UserMiddleware.validateCheck,
  UserCtr.genrateLotteryNumbers,
];
userRoute.post('/genrateRandom', getRandom); // get random lottery numbers

// genrate csv
const genrateCsv = [auth.isAuthenticatedUser, UserCtr.addCsv];
userRoute.get("/genrateCsv", genrateCsv);  

// get snapshot data
const getSnapshotData = [
  auth.isAuthenticatedUser,
  UserCtr.getGenratedSnapshotData,
];
userRoute.get('/snapshotData', getSnapshotData);

// get user staked balance

const getUserStaked = [
  auth.isAuthenticatedUser,
  UserMiddleware.checkProcessPending,
  UserCtr.getUsersStakedBalance,
];
userRoute.get('/getUserStake', getUserStaked);
userRoute.get('/genstksnapshot', [ auth.isAuthenticatedUser, UserCtr.ReformaStakingSnapshot]);

// get RST balance
const getSfund = [Auth.apiKeyAuthentication ,UserCtr.getUserBalances];
userRoute.get('/getSfund', getSfund);

// get ape token balnce
const getApeBalance = [web3Helper.getApeFarmingBalance];
userRoute.get('/getApeBalance', getApeBalance);

// login user
const login = [UserMiddleware.loginCheck, UserCtr.login];
userRoute.post('/login', login);

// notify about IGO Launch day
const notify = [UserCtr.notifyIGO];
userRoute.post('/notifyUser', notify);

// genrate nonce
const genrateNonce = [Auth.apiKeyAuthentication, UserCtr.genrateNonce];
userRoute.get('/genrateNonce/:address', genrateNonce);

// add new wallet address of user
const addNewWalletAddresses = [
  Auth.userAuthetication,
  UserMiddleware.validateAddWallet,
  UserMiddleware.checkWalletAlreadyAdded,
  UserCtr.addUserNetwork,
];
userRoute.post('/addWallet', addNewWalletAddresses);

// get it by group
const getByGroup = [auth.isAuthenticatedUser, UserCtr.getByGroups];
userRoute.get('/group', getByGroup);

// update wallet address
const updateWalletAddress = [
  Auth.userAuthetication,
  UserMiddleware.validateUpdateWallet,
  UserCtr.updateUserNetwork,
];
userRoute.put('/updateWallet', updateWalletAddress);

// get seconday wallet address from csv
const getSecondaryWalletAddress = [
  Auth.apiKeyAuthentication,
  multipartMiddleware,
  UserCtr.getSecondayWalletAddresses,
];
userRoute.post('/secondaryWallet', getSecondaryWalletAddress);
// userRoute.post('/add-community-testers', [multipartMiddleware, UserCtr.addCommunityTesters]);

// get unique contries list
const getUniqueCountries = [
  Auth.isAuthenticatedUser,
  UserCtr.listAllUniqueCountries,
];
userRoute.get('/getUniqueCountries', getUniqueCountries);

// check is valid address
const checkisValid = [Auth.apiKeyAuthentication, Utils.checkAddressForSolana];
userRoute.get('/checkIsValid', checkisValid);

userRoute.post('/subscribe',[ Auth.apiKeyAuthentication, UserMiddleware.validateSubcribeUser, UserCtr.subscribe]);
userRoute.get('/duplicate-user', [Auth.apiKeyAuthentication, UserCtr.findDupUsers]);
userRoute.get('/get-user-data', [Auth.apiKeyAuthentication, UserCtr.getUsersCsv]);

// Tier infomation - Thirdparty routes
// userRoute.get('/tier-info/:address', [Auth.thirdPartyAuthentication,UserCtr.getTierInfo]);

// user info route
userRoute.get("/user-info/:address", [UserCtr.getUserInfo]);
userRoute.put("/update/:address", [UserCtr.updateProfile]);

module.exports = userRoute;
