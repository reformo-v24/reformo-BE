const express = require("express");
const applyProjCtr = require("./applyProjectController");
const auth = require("../../helper/auth");

const applyRoute = express.Router();

applyRoute.get("/list", [
  auth.isAuthenticatedUser,
  applyProjCtr.listAppliedProjects,
]);
applyRoute.post("/add-project", [
  // auth.isAuthenticatedUser,
  // auth.isRoleSuperAdmin,
  applyProjCtr.addApplyProject,
]);
applyRoute.put("/update/:ID", [
  auth.isAuthenticatedUser,
  auth.isRoleSuperAdmin,
  applyProjCtr.updateAppliedStatus,
]);

module.exports = applyRoute;
