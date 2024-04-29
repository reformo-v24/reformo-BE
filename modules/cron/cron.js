const cron = require('node-cron');
const DailyCron = require('./getDailyData');
const UserCtr = require('../kycUsers/userController');
const BlockPassCtr = require('../../modules/blockpass/blockpassCtr');
const ClaimCtr = require('../claim/claimController');
const poolCtr = require('../pools/poolsController');
const igoCtr = require("../igopools/igoController");

const contractDetails = process.env.CONTRACT_DETAILS;
cron.schedule(contractDetails, (req, res) => {
  DailyCron.getContractsData(req, res);
});

const userApproveList = process.env.USER_APPROVE_LIST;
cron.schedule(userApproveList, (req, res) => {
  BlockPassCtr.getApprovedUserList(req, res);
});

const userBalance = process.env.USER_BALANCE;
cron.schedule(userBalance, (req, res) => {
  UserCtr.getUserBalances(req, res);
});

const deleteDump = process.env.DELETE_DUMP_RECORDS;
cron.schedule(deleteDump, (req, res) => {
  ClaimCtr.deleteDumprecords()
});

const transactionStatus = process.env.TRANSACTION_STATUS;
cron.schedule(transactionStatus, (req, res) => {
  ClaimCtr.checkTransactionStatus();
  // poolCtr.blockSyncPool()
});

const dailyStakingSnapshot = process.env.DAILY_SNAPSHOT;
cron.schedule(dailyStakingSnapshot, (req, res) => {
  console.log('runnig stk snapshot cron at 13 UTC :>> ');
  UserCtr.reformaStakingSnapshot(req, res)
});

const synchPool = process.env.BLOCK_SYNCH_POOL;
cron.schedule(synchPool, (req, res) => {
  poolCtr.blockSyncPool()
});

 //toDo: This code commented for test purpose
// //cron job for scheduling the IGO cron job
// cron.schedule("*/1 * * * *", () => {
//   console.log("print log===>>");
//   igoCtr.scheduleTodayIgoCron();
// });

const igoNotify = process.env.IGO_NOTIFY;
cron.schedule(igoNotify, async () => {
  try {
    await UserCtr.notifyIGO();
  } catch (error) {
    console.error('Error occurred in cron job:', error);
  }
});


