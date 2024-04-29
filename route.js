const express = require("express");
// const bodyParser = require('body-parser');
const syncRoute = require("./modules/sync/syncRoute");
const blockPassRoute = require("./modules/blockpass/blockPassRoute");
const adminRoute = require("./modules/admin/adminRoute");
const userRoute = require("./modules/kycUsers/userRoute");
const claimRoute = require("./modules/claim/claimRoute");
const poolsRoute = require("./modules/pools/poolsRoute");
const networkRoute = require("./modules/network/networkRoute");
const farmRoute = require("./modules/farm/farmRoute");
const logsRoute = require("./modules/logs/logsRout");
const projectRoute = require("./modules/projects/projectsRoute");
const settingRoute = require("./modules/settings/settingRoutes");
const IGOPoolsRoute = require("./modules/igopools/igoRoute");
const payUserRouter = require("./modules/payUsers/payUserRoutes");
const applyProjRouter = require("./modules/applyProject/applyProjectRoute");
const UserParticipateRoute = require("./modules/UserParticipate/participateRoute");
// Routes Path
const app = express.Router();

// Routes
app.use("/api/v1/sync", syncRoute);
app.use("/api/v1/block", blockPassRoute);
app.use("/api/v1/admin", adminRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/pools", poolsRoute);
app.use("/api/v1/claim", claimRoute);
app.use("/api/v1/network", networkRoute);
app.use("/api/v1/farm", farmRoute);
app.use("/api/v1/logs", logsRoute);
app.use("/api/v1/project", projectRoute);
app.use("/api/v1/settings", settingRoute);
app.use("/api/v1/IGOPools", IGOPoolsRoute);
app.use("/api/v1/payuser", payUserRouter);
app.use("/api/v1/apply-proj", applyProjRouter);
app.use("/api/v1/userParticipate", UserParticipateRoute);

app.use("/api/v1/status", function (req, res) {
  res.status(200).send("MESSAGE OK");
});

module.exports = app;
