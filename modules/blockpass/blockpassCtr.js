const UserModal = require("../kycUsers/usersModel");

const Utils = require("../../helper/utils");
const axios = require("axios");
const syncHelper = require("../sync/syncHelper");
const stkPointModel = require("../rstStakingPoints/stkPointsModel");
const fs = require("fs")

const blockPaSsCtr = {};

blockPassCtr.getApprovedUserList = async (req, res) => {
  console.log("Blockpass Cron Called ========>");
  let date = `${new Date().getDate()}-${new Date().getMonth()+1}-${new Date().getFullYear()}`;
  let separater = '------------------------------------------CRON JOB STARTED------------------------------------------';
  fs.appendFile(`blockpass-err-logs/blockpassErrLog-${date}.txt`, "\n\n"+separater+"\n\n" ,(err) => {
    if (err)
      console.log(err);
    else {
      console.log("separater added to file\n");
    }
  });
  try {
   
    let blockScheduled = [];

    const getRecordsFromBlockPass = async (skip) => {
      const getRecords = await getDatafromBlockPass(skip);
      if (getRecords && getRecords.records.length) {
        console.log(
          "getRecords.records.length ====>",
          getRecords.records.length
        );

        for (let i = 0; i < getRecords.records.length; i++) {
          console.log(
            getRecords.records[i].identities.crypto_address_eth.value
          );

          const userAddress =
            getRecords.records[i].identities.crypto_address_eth.value;

          const balObj = {
            sfund: 0,
            liquidity: 0,
            farming: 0,
            bakery: 0,
            tosdis: 0,
          };

          const total = 0;
          let approvedDate = 0;

          const email = getRecords.records[i].identities.email.value;
          const name = `${getRecords.records[i].identities.given_name.value}${getRecords.records[i].identities.family_name.value} `;
          const country = getRecords.records[i].identities?.address.value
            ? JSON.parse(getRecords.records[i].identities?.address.value)
            : null;
          const recordId = getRecords.records[i].recordId.toLowerCase().trim();



          let countryCode = null;
          let state = null;
          if (country) {
            countryCode = country.country ? country.country : null;
            state = country.state ? country.state : null;
          }

          if (getRecords.records[i].status === "approved") {
            const approval = Date.parse(getRecords.records[i].approvedDate);
            approvedDate = Math.trunc(approval / 1000);
          }
          
          if(getRecords.records[i].status === 'blocked'){
            
            let data = JSON.stringify({ 
              recordId: recordId,
              msg: "blocked user found",
              blockpassWalletAddress: userAddress.toLowerCase().trim()
            })
            let date = `${new Date().getDate()}-${new Date().getMonth()+1}-${new Date().getFullYear()}`;

            fs.appendFile(`blockpass-err-logs/blockpassErrLog-${date}.txt`, data+"\n" ,(err) => {
              if (err)
                console.log(err);
              else {
                console.log("Error record added to file successfully\n");
              }
            });

            continue;
          }

          const checkUserAvalaible = await UserModal.find({walletAddress: userAddress.toLowerCase().trim()});

          
          if(checkUserAvalaible.length > 1) {

            let date = `${new Date().getDate()}-${new Date().getMonth()+1}-${new Date().getFullYear()}`;
            let data = JSON.stringify({ 
              recordId: recordId,
              msg: "multiple wallet address found",
              blockpassWalletAddress: userAddress.toLowerCase().trim()
            })
            fs.appendFile(`blockpass-err-logs/blockpassErrLog-${date}.txt`, data+"\n" ,(err) => {
              if (err)
                console.log(err);
              else {
                console.log("error record added to file\n");
              }
            });

          } else if(checkUserAvalaible.length === 0) {

            const addNewUser = new UserModal({
              recordId: recordId,
              walletAddress: userAddress.toLowerCase().trim(),
              email: email,
              name: name,
              totalbalance: total,
              balObj: balObj,
              kycStatus: getRecords.records[i].status,
              country: countryCode,
              approvedTimestamp: approvedDate,
              tier: syncHelper.getUserTier(0),
            });
            await addNewUser.save();

          } else {

            const checkRecordId = await UserModal.findOne({recordId});
            if (!checkRecordId){
              await UserModal.updateOne(
                { _id: checkUserAvalaible[0]._id },
                {
                  kycStatus: getRecords.records[i].status,
                  name: name,
                  email: email,
                  recordId: recordId,
                  approvedTimestamp: approvedDate,
                  walletAddress: userAddress.toLowerCase().trim(),
                  country: countryCode,
                  state: state,
                }
              );
            }
            else if (checkRecordId.walletAddress === userAddress.toLowerCase().trim())
            {
              await UserModal.updateOne(
                { _id: checkUserAvalaible[0]._id },
                {
                  kycStatus: getRecords.records[i].status,
                  name: name,
                  email: email,
                  recordId: recordId,
                  approvedTimestamp: approvedDate,
                  walletAddress: userAddress.toLowerCase().trim(),
                  country: countryCode,
                  state: state,
                }
              );
            } else {
              let date = `${new Date().getDate()}-${new Date().getMonth()+1}-${new Date().getFullYear()}`;
              let data = JSON.stringify({ 
                recordId: recordId,
                msg: "Wallet Address changed",
                newWalletAddress: userAddress.toLowerCase().trim(),
                dbWalletAddress: checkRecordId.walletAddress,
              })
              fs.appendFile(`blockpass-err-logs/blockpassErrLog-${date}.txt`, data+"\n" ,(err) => {
                if (err)
                  console.log(err);
                else {
                  console.log("error record added to file\n");
                }
              });
            }
            
          }

       
        }

        console.log("total is:", getRecords.total);
        if (
          getRecords.total > getRecords.skip &&
          blockScheduled < getRecords.total
        ) {
          let skip = +getRecords.skip + 10;
          blockScheduled = skip;

          if (skip > getRecords.total) {
            skip = +getRecords.skip;
          }
          getRecordsFromBlockPass(skip);
        } else {
          console.log("Cron fired successfully");

          if (res) {
            res.status(200).JSON({
              message: "Cron fired successfully",
            });
          }
        }
      }
    };
    getRecordsFromBlockPass(0);

  } catch (err) {
    console.log("error in getting data", err);
    if (res) {
      res.status(500).JSON({
        message: "Something went wrong",
      });
    }
  }
};



async function getfundBalance(address, userAddress, endBlock) {

 

  try {
    await new Promise((resolve) => setTimeout(resolve, 100));

    var config = {
      method: "get",
      url: `https://api-test.bscscan.com/api?module=account&action=tokenbalancehistory&contractaddress=${address}&address=${userAddress}&blockno=${endBlock}&apikey=${process.env.BSC_API_KEY}`,
      headers: {},
    };

    const getSfundBal = await axios(config);

    if (getSfundBal.status === 200) {
      const data = getSfundBal.data;

      let reformaBalance = (+data.result / Math.pow(10, 18)).toFixed(2);

      return +reformaBalance > 0 ? +reformaBalance : 0;
    }
  } catch (err) {
    Utils.echoLog(`error in getSfundBalance ${err}`);
    return 0;
  }
}

// get liquidity balance
// eslint-disable-next-line no-unused-vars
async function getLiquidityBalance(userAddress, endBlock) {
  // const address = "0x74fa517715c4ec65ef01d55ad5335f90dce7cc87";
  const address = "0xA567eF8802461c8a37aa0dAD0615E53E6Bfc1Db";

  const getTotalSupplyUrl = `https://api-testnet.bscscan.com/api?module=stats&action=tokensupply&contractaddress=${address}&apikey=${process.env.BSC_API_KEY}`;
  const tokenBalanceUrl = `https://api-testnet.bscscan.com/api?module=account&action=tokenbalance&contractaddress=0x477bc8d23c634c154061869478bce96be6045d12&address=${address}&tag=latest&apikey=${process.env.BSC_API_KEY}`;

  const getTotalSupply = await axios.get(getTotalSupplyUrl);
  const getTokenBalance = await axios.get(tokenBalanceUrl);

  const getSfundBal = await getSfundBalance(address, userAddress, endBlock);

  const tokenSupply = +getTotalSupply.data.result / Math.pow(10, 18);
  const tokenBalance = +getTokenBalance.data.result / Math.pow(10, 18);

  if (getSfundBal) {
    const transactionCount = +getSfundBal / tokenSupply;
    const total = transactionCount * tokenBalance;

    return +total > 0 ? +total : 0;
  } else {
    return 0;
  }
}

// eslint-disable-next-line no-unused-vars
async function findData(data, userAddress) {
  const findIndex = data.findIndex(
    (user) =>
      user.address.toLowerCase().trim() === userAddress.toLowerCase().trim()
  );

  if (findIndex >= 0) {
    return data[findIndex].balance;
  } else {
    return 0;
  }
}

blockPassCtr.checkKycVerified = async (req, res) => {
  try {
    const checkIsVerified = await UserModal.findOne(
      {
        walletAddress: req.params.address.toLowerCase(),
      },
      { name: 0, recordId: 0, country: 0, state: 0, email: 0 }
    )
      .populate({
        path: "networks",
        select: { createdAt: 0, updatedAt: 0, userId: 0 },
        populate: {
          path: "networkId",
          select: { _id: 1, networkName: 1, logo: 1 },
          model: "network",
        },
      })
      .sort({ createdAt: -1 });

    // console.log('checkIsVerified', checkIsVerified);
    const totalStkPointDist = await stkPointModel.aggregate([
      {
        $sort : {
          "createdAt" : -1
        },
      },
      {
        $limit : 365
      },
      {
        $group:
          {
            _id : "",
            points: { $sum: "$stkPointsDist"},
            count: { $sum: 1 }
          }
      },

    ])
    if (checkIsVerified) {
      const percentage = Utils.toTruncFixed(((+checkIsVerified.stkPoints.totalStkPoints / +totalStkPointDist[0].points)*100), 6)
      const stkPoints = {
        totalStkPoints : checkIsVerified.stkPoints.totalStkPoints,
        recentStkPoints : checkIsVerified.stkPoints.recentStkPoints,
        percentage : Number(percentage)
      }
      res.status(200).json({
        message: "Kyc Status",
        status: true,
        data: {
          kycStatus: checkIsVerified.kycStatus === "approved" ? true : false,
          status: checkIsVerified.kycStatus,
          data: {
            // name: checkIsVerified.name,
            userId: checkIsVerified._id,
            snapshot: checkIsVerified.balObj,
            stkPoints : stkPoints,
            tier: checkIsVerified.tier,
            timestamp: checkIsVerified.timestamp,
            networks: checkIsVerified.networks,
          },
        },
      });
    } else {
      res.status(200).json({
        message: "Kyc Status",
        status: true,
        data: {
          kycStatus: false,
          status: "NOT REGISTERED",
          data: {},
        },
      });
    }
  } catch (err) {
    Utils.echoLog(`error in getSfundBalance ${err}`);
    res.status(200).json({
      message: "Somethig went wrong please try again",
      status: true,
      err: err.message ? err.message : null,
    });
  }
};

blockPassCtr.getWebhooks = async (req, res) => {
  try {
    Utils.echoLog("Webhook received for user", JSON.stringify(req.body));
    const userDetails = req.body;
    res.status(200).json({
      status: true,
    });

    if (!userDetails || !userDetails.recordId) {
      return res.status(200).json({
        status: true,
      });
    }

    const url = `https://kyc.blockpass.org/kyc/1.0/connect/${process.env.BLOCKPASS_CLIENT_ID}/recordId/${userDetails.recordId}`;

    var config = {
      method: "get",
      url: url,
      headers: {
        Authorization: `${process.env.BLOCKPASS_AUTHORIZATION}`,
      },
    };

    const getBlockPassData = await axios(config);
    if (getBlockPassData && getBlockPassData.status === 200) {
      const getRecords = getBlockPassData.data.data;

      const userAddress = getRecords.identities.crypto_address_eth.value;

      const balObj = {
        sfund: 0,
        liquidity: 0,
        farming: 0,
        bakery: 0,
        tosdis: 0,
        // slp: getSlp,
      };

      const total = 0;
      let approvedDate = 0;
      // getSlp;

      const email = getRecords.identities.email.value;
      const name = `${getRecords.identities.given_name.value}${getRecords.identities.family_name.value} `;
      const country = getRecords.identities?.address.value
        ? JSON.parse(getRecords.identities?.address.value)
        : null;
      const recordId = getRecords.recordId.toLowerCase().trim();
      const checkUserAvalaible = await UserModal.findOne({
        $or : [
          {recordId: recordId},
          {walletAddress : userAddress.toLowerCase().trim()}
        ]
      });

      let countryCode = null;
      let state = null;
      if (country) {
        countryCode = country.country ? country.country : null;
        state = country.state ? country.state : null;
      }

      if (getRecords.status === "approved") {
        const approval = Date.parse(getRecords.approvedDate);
        approvedDate = Math.trunc(approval / 1000);
      }

      if (checkUserAvalaible) {
        console.log("User avalaible ====>");
        // eslint-disable-next-line no-unused-vars
        const updateUser = await UserModal.updateOne(
          { _id: checkUserAvalaible._id },
          {
            kycStatus: getRecords.status,
            name: name,
            email: email,
            recordId: recordId,
            approvedTimestamp: approvedDate,
            walletAddress: userAddress.toLowerCase().trim(),
            country: countryCode,
            state: state,
          },
          { upsert: true }
        );
      } else {
        const addNewUser = new UserModal({
          recordId: recordId,
          walletAddress: userAddress.toLowerCase().trim(),
          email: email,
          name: name,
          totalbalance: total,
          balObj: balObj,
          kycStatus: getRecords.status,
          country: countryCode,
          approvedTimestamp: approvedDate,
          tier: syncHelper.getUserTier(0),
        });

        await addNewUser.save();
        // itreateBlocks(i + 1);
      }
    }
  } catch (err) {
    Utils.echoLog(`Error in webhooks ${err}`);
    console.log("error in webhook", err);
  }
};

module.exports = blockPassCtr;
