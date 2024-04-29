const utils = require('./utils');
const AdminModel = require('../modules/admin/adminModel');
const UserModel = require('../modules/kycUsers/usersModel');
const errorUtil = require('./error');
const jwtUtil = require('./jwtUtils');

const auth = {};
// check authentication
auth.isAuthenticatedUser = async (req, res, next) => {
  let token = req.headers && req.headers["x-auth-token"];

  if (utils.empty(token)) {
    token = req.body && req.body["x-auth-token"];
  }
  const userTokenData = jwtUtil.decodeAuthToken(token);

  if (utils.empty(userTokenData)) {
    return errorUtil.notAuthenticated(res, req);
  }

  const fetchAdminDetails = await AdminModel.findById(userTokenData._id);

  if (fetchAdminDetails && fetchAdminDetails.isActive) {
    req.userData = fetchAdminDetails;
    return next();
  } else {
    return errorUtil.notAuthenticated(res, req);
  }

  // return errorUtil.notAuthenticated(res, req);
};

auth.isRoleSuperAdmin = async (req, res, next) => {
  if (req.userData.role || req.body.role === "superadmin") {
    return next();
  } else if(req.body.role && req.body.role === "admin"){
    return next();
  } else{
    return errorUtil.roleNotAuthorized(req, res);
  }
  // return errorUtil.notAuthenticated(res, req);
};

auth.checkIsAutheticated = async (req, res, next) => {
  let token = req.headers && req.headers['x-auth-token'];

  if (utils.empty(token)) {
    token = req.body && req.body['x-auth-token'];
  }
  const userTokenData = jwtUtil.decodeAuthToken(token);

  if (utils.empty(userTokenData)) {
    return next();
  }

  const fetchAdminDetails = await AdminModel.findById(userTokenData._id);

  if (fetchAdminDetails && fetchAdminDetails.isActive) {
    req.userData = fetchAdminDetails;
    return next();
  } else {
    return next();
  }
};

auth.userAuthetication = async (req, res, next) => {
  let token = req.headers && req.headers['x-auth-token'];

  if (utils.empty(token)) {
    token = req.body && req.body['x-auth-token'];
  }
  const userTokenData = jwtUtil.decodeAuthToken(token);
  req.userDetails = userTokenData;

  if (utils.empty(userTokenData)) {
    return errorUtil.notAuthenticated(res, req);
  }
  return next();
};
auth.apiKeyAuthentication = async(req, res, next)=>{
  const API_KEY = process.env.Reforma_API_KEY
  let apiKey = req.headers && req.headers['api_key'] || req.headers['api-key'];
  if(API_KEY === apiKey){
    return next()
  }else{
    return errorUtil.notAuthenticated(res, req);
  }
}

auth.thirdPartyAuthentication = async (req, res, next) => {
  const API_KEY = process.env.THIRDPARTY_Reforma_API_KEY;
  let apiKey = req.headers && req.headers['api_key'] || req.headers['api-key'];
  if(API_KEY === apiKey){
    return next()
  }else{
    return errorUtil.notAuthenticated(res, req);
  }
}

module.exports = auth;
