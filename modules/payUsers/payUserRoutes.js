const express = require("express");
const payUserCtrl = require("./payUserController");

const payUserRouter = express.Router();

payUserRouter.post("/add-pay", payUserCtrl.addPaydetails);
payUserRouter.get("/verify/:address", payUserCtrl.getPayStatus);
payUserRouter.get("/address/:address", payUserCtrl.getAddressData);
payUserRouter.post("/add-money", payUserCtrl.addUserBalance);
payUserRouter.get(
  "/transaction-success/:TRANSACTION_ID",
  payUserCtrl.setTransactionSuccess
);

module.exports = payUserRouter;
