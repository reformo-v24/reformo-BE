const Web3 = require("web3");
const lotteryAbi = require("../abi/lautry.json");
const StakingContract = require("../abi/staking.json");
const FarmingContract = require("../abi/farming.json");
const PanCakeSwapAbi = require("../abi/pancakeswap.json");
const TosdisStakingAbi = require("../abi/tosdisStaking.json");
const TosdisFarmingAbi = require("../abi/tosdisFarming.json");
const ApeFarmingAbi = require("../abi/apeFarming.json");
const sfundAbi = require("../abi/sfund.json");
const Utils = require("../helper/utils");
const BlockModel = require("../modules/block/blockModel");
const UserModel = require("../modules/kycUsers/usersModel");
const igoAbi = require("../abi/igoAbi.json");

const provider =
  process.env.NODE_ENV === "development"
  ?  process.env.RPC_TESTNET
  :  process.env.RPC_TESTNET


const web3Helper = {};

web3Helper.getRandomNumber = async (requestNo, noOfAddress, Outof) => {
  try {
    web3 = new Web3(new Web3.providers.HttpProvider(provider));
    const lotteryContract = new web3.eth.Contract(
      lotteryAbi,
      process.env.CONTRACT_ADDRESS
    );
    const getRandomNumbers = await lotteryContract.methods
      .expand(requestNo, +noOfAddress, +Outof)
      .call();
    return getRandomNumbers;
  } catch (err) {
  }
};

web3Helper.getVestingTokens = async (eTokens, vestingPercent) => {
  try {
    web3 = new Web3(new Web3.providers.HttpProvider(provider));
    const newVestTokens = web3.utils.toWei(
      (+(eTokens * vestingPercent) / 100).toFixed(6)
    );
    return newVestTokens;
  } catch (err) {
    console.log("error in getVestingTokens ", err);
  }
};

web3Helper.getSoliditySha3 = async (claimToken) => {
  web3 = new Web3(new Web3.providers.HttpProvider(provider));
  return web3.utils.soliditySha3(
    { type: "address", value: claimToken.walletAddress },
    { type: "uint256", value: claimToken.eTokens }
  );
};

web3Helper.getUserStakedBalance = async (walletAddress, ContractAddress) => {
  return new Promise(async (resolve, reject) => {
    try {
      const provider =
        process.env.NODE_ENV === "development"
        ?  process.env.RPC_TESTNET
        :  process.env.RPC_TESTNET

      const web3 = new Web3(new Web3.providers.HttpProvider(provider));

      const contract = new web3.eth.Contract(StakingContract, ContractAddress);

      const getStakedBalance = await contract.methods
        .userDeposits(walletAddress)
        .call();

      resolve(getStakedBalance);
    } catch (err) {
      console.log("error in web3 stacked data ", err);

      resolve(0);
    }
  });
};

web3Helper.getFarmingContractEndDate = async (contractAddress) => {
  return new Promise(async (resolve, reject) => {
    try {
      const provider =
        process.env.NODE_ENV === "development"
        ?  process.env.RPC_TESTNET
        :  process.env.RPC_TESTNET

      const web3 = new Web3(new Web3.providers.HttpProvider(provider));

      const contract = new web3.eth.Contract(FarmingContract, contractAddress);

      const getEndDate = await contract.methods.stakingEnd().call();
      const startDate = await contract.methods.stakingStart().call();
      const withdrawDate = await contract.methods.withdrawStart().call();

      resolve({
        endDate: getEndDate,
        startDate: startDate,
        withdrawDate: withdrawDate,
      });
    } catch (err) {
      console.log("Error in getting end date", err);

      resolve({ endDate: 0, startDate: 0, withdrawDate: 0 });
    }
  });
};

web3Helper.getUserFarmedBalance = async (walletAddress, ContractAddress) => {
  return new Promise(async (resolve, reject) => {
    try {
      const provider =
        process.env.NODE_ENV === "development"
        ?  process.env.RPC_TESTNET
        :  process.env.RPC_TESTNET

      const web3 = new Web3(new Web3.providers.HttpProvider(provider));

      const contract = new web3.eth.Contract(FarmingContract, ContractAddress);

      const getStakedBalance = await contract.methods
        .userDeposits(walletAddress)
        .call();

      let harvestedValue = 0;

      const value = Utils.convertToEther(getStakedBalance["0"]);
      // if (value > 0) {
      //   const getSfundHarvested = await contract.methods
      //     .calculate(walletAddress)
      //     .call();

      //   harvestedValue = Utils.convertToEther(getSfundHarvested);
      // }

      resolve({ farm: value, harvest: harvestedValue });
    } catch (err) {

      resolve({ farm: 0, harvest: 0 });
    }
  });
};

// pancake swap
web3Helper.getPanCakeSwapFarmBalance = async (walletAddress) => {
  return new Promise(async (resolve, reject) => {
    try {
      const provider =
        process.env.NODE_ENV === "development"
        ?  process.env.RPC_TESTNET
        :  process.env.RPC_TESTNET

      const web3 = new Web3(new Web3.providers.HttpProvider(provider));

      const contract = new web3.eth.Contract(
        PanCakeSwapAbi,
        // "0x73feaa1eE314F8c655E354234017bE2193C9E24E"
        "0xA567eF8802461c8a37aa0dAD0615E53E6Bf6c1Db"
      );

      const getStakedBalance = await contract.methods
        .userInfo(450, walletAddress)
        .call();
      // console.log('getStakedBalance', getStakedBalance['amount']);
      const value = Utils.convertToEther(getStakedBalance["amount"]);
      resolve(value);
    } catch (err) {
      resolve(0);
      console.log("error in getPanCakeSwapFarmBalance", err);
    }
  });
};

// tosdis staking
web3Helper.getTosdisStakingBal = async (walletAddress) => {
  return new Promise(async (resolve, reject) => {
    try {
      const provider =
        process.env.NODE_ENV === "development"
        ?  process.env.RPC_TESTNET
        :  process.env.RPC_TESTNET

      const web3 = new Web3(new Web3.providers.HttpProvider(provider));

      const contract = new web3.eth.Contract(
        TosdisStakingAbi,
        process.env.STAKING_TOSDIS
      );

      const getStakedBalance = await contract.methods
        .getUserInfo(walletAddress)
        .call();

      const value = Utils.convertToEther(getStakedBalance["0"]);
      resolve(value);
    } catch (err) {
      resolve(0);
      console.log("error in getPanCakeSwapFarmBalance", err);
    }
  });
};

// tosdis farming

web3Helper.getTosdisFarmingBal = async (walletAddress, contractAddress) => {
  return new Promise(async (resolve, reject) => {
    try {
      const provider =
        process.env.NODE_ENV === "development"
        ?  process.env.RPC_TESTNET
        :  process.env.RPC_TESTNET

      const web3 = new Web3(new Web3.providers.HttpProvider(provider));

      const contract = new web3.eth.Contract(TosdisFarmingAbi, contractAddress);

      const getStakedBalance = await contract.methods
        .getUserInfo(walletAddress)
        .call();

      const value = Utils.convertToEther(getStakedBalance["0"]);
      resolve(value);
    } catch (err) {
      console.log("error in farming", err);
      resolve(0);
    }
  });
};

// ape Farming
web3Helper.getApeFarmingBalance = async (walletAddress, contractAddress) => {
  return new Promise(async (resolve, reject) => {
    try {
      const provider =
        process.env.NODE_ENV === "development"
        ?  process.env.RPC_TESTNET
        :  process.env.RPC_TESTNET

      const web3 = new Web3(new Web3.providers.HttpProvider(provider));

      const contract = new web3.eth.Contract(ApeFarmingAbi, contractAddress);

      const getStakedBalance = await contract.methods
        .userInfo("123", walletAddress)
        .call();
      const value = Utils.convertToEther(getStakedBalance["0"]);
      resolve(value);
    } catch (err) {
      console.log("error in ape farming", err);
      resolve(0);
    }
  });
};

// sfund balance
web3Helper.sfundBalance = async (walletAddress) => {
  return new Promise(async (resolve, reject) => {
    try {
      const provider =
        process.env.NODE_ENV === "development"
        ? process.env.RPC_TESTNET
        : process.env.RPC_TESTNET
      const web3 = new Web3(new Web3.providers.HttpProvider(provider));

      const contract = new web3.eth.Contract(sfundAbi, process.env.SFUND_TOKEN);

      const getStakedBalance = await contract.methods
        .balanceOf(walletAddress)
        .call();

      const value = Utils.convertToEther(getStakedBalance);
      resolve(value);
    } catch (err) {
      console.log("error in farming", err);
      resolve(0);
    }
  });
};

web3Helper.getTosdisStakingBalWithContract = async (
  walletAddress,
  contractAddress
) => {
  return new Promise(async (resolve, reject) => {
    try {
      const provider =
        process.env.NODE_ENV === "development"
        ? process.env.RPC_TESTNET
        : process.env.RPC_TESTNET

      const web3 = new Web3(new Web3.providers.HttpProvider(provider));

      const contract = new web3.eth.Contract(TosdisStakingAbi, contractAddress);

      const getStakedBalance = await contract.methods
        .getUserInfo(walletAddress)
        .call();

      const value = Utils.convertToEther(getStakedBalance["0"]);
      resolve(value);
    } catch (err) {
      resolve(0);
      
    }
  });
};

web3Helper.getTransactionStatus = async (transactionHash, networkName) => {
  return new Promise(async (resolve, reject) => {
    try {
      const testNetProvider =
        networkName == "polygon"
          ? process.env.RPC_POLYGON_TESTNET
          : networkName == "binance"
          ? process.env.RPC_TESTNET
          : networkName == "avalanche"
          ?  process.env.RPC_AVALANCHE_TESTNET
          : networkName == "fantom"
          ?  process.env.RPC_FANTOM_TESTNET
          : process.env.RPC_TESTNET
      const mainNetProvider =
        networkName == "polygon"
          ?  process.env.RPC_POLYGON_MAINNET
          : networkName == "binance"
          ? process.env.RPC_MAINNET 
          : networkName == "avalanche"
          ?  process.env.RPC_AVALANCHE_MAINNET
          : networkName == "fantom"
          ?  process.env.RPC_FANTOM_MAINNET
          : process.env.RPC_MAINNET
      const provider =
        process.env.NODE_ENV === "development"
          ? testNetProvider
          : mainNetProvider;
      const web3 = new Web3(new Web3.providers.HttpProvider(provider));
      const trxnReciept = await web3.eth.getTransactionReceipt(transactionHash);
      console.log(
        `trxnReciept.status :>>  ${
          trxnReciept != null ? trxnReciept.status : "null"
        }`
      );

      if (trxnReciept) {
        resolve({
          status: trxnReciept.status,
        });
      } else {
        resolve(null);
      }
    } catch (err) {
      reject(null);
    }
  });
};

web3Helper.stakingEvents = async (type, contractAddress) => {
  try {

    const provider =
        process.env.NODE_ENV === "development"
        ? process.env.RPC_TESTNET
        : process.env.RPC_TESTNET

    const web3 = new Web3(provider);
    const latestBlockNo = await web3.eth.getBlockNumber();
    const abi = type == "staking" ? StakingContract : FarmingContract;
    const contract = new web3.eth.Contract(abi, contractAddress);
    // get last block synced
    let lastBlock = await BlockModel.findOne({
      poolAddress: contractAddress.toLowerCase(),
    });
    // console.log(lastBlock);
    if (!lastBlock) {
      const newBlock = new BlockModel({
        poolAddress: contractAddress,
        type: type,
        blockNo: latestBlockNo,
      });
      await newBlock.save();
      lastBlock = newBlock;
    }
    // console.log('lastBlock :>> ', lastBlock);
    const getPastEvents = await contract.getPastEvents("allEvents", {
      fromBlock: +lastBlock.blockNo,
      toBlock: latestBlockNo,
    });
    // console.log('getPastEvents :>> ', getPastEvents);
    // console.log("getPastEvents.length :>> ", getPastEvents.length);
    if (getPastEvents.length) {
      const itreateEvents = async (i) => {
        if (i < getPastEvents.length) {
          const result = getPastEvents[i].returnValues;
          console.log("result of snapshot========>>>>>>",result)
          // console.log("getPastEvents[i] :>> ", getPastEvents[i].event);
          if (getPastEvents[i].event) {
            const walletAddress = result["staker_"];
            console.log("snapshot wallet address=======>>>>",walletAddress)
            await web3Helper.addNonBlockpassUser(walletAddress);
          }
          itreateEvents(i + 1);
        } else {
          lastBlock.blockNo = latestBlockNo;
          await lastBlock.save();
        }
      };
      itreateEvents(0);
    } else {
      lastBlock.blockNo = latestBlockNo;
      await lastBlock.save();
    }
    return;
  } catch (err) {
    Utils.echoLog(`err staking event syncing ${contractAddress}:>> `, err);
    console.log(
      `err staking event syncing ${contractAddress}:>> `,
      err.message
    );
  }
};
// add user through block syncing cron
web3Helper.addNonBlockpassUser = async (walletAddress) => {
  try {
    const user = await UserModel.findOne({
      walletAddress: walletAddress.toLowerCase().trim(),
    });
    if (user) {
      // console.log("user found blkp :>> ", walletAddress);
      user.activeStaker = true;
      await user.save();
    } else {
      // console.log("non blockpass user not found :>> ", walletAddress);
      Utils.echoLog("Non-blockpass user not found");
      const newUser = new UserModel({
        recordId: walletAddress.toLowerCase().trim(),
        walletAddress: walletAddress.toLowerCase().trim(),
        email: "",
        name: "",
        totalbalance: 0,
        balObj: {},
        // kycStatus: "nonblockpass",
        kycStatus: "approved",
        country: "India",
        approvedTimestamp: 0,
        tier: "tier0",
        activeStaker: true,
      });
      await newUser.save();
    }
  } catch (err) {
    Utils.echoLog("err in blockpass syncing user :>> ", err.message);
  }
};

// get snft holding for user
// web3Helper.snftBalance = async (walletAddress) => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       const provider =
//         process.env.NODE_ENV === "development"
//         ? "https://bsc.getblock.io/c8fcb46a-cb6b-43d6-8336-00493ced3b23/testnet/"
//         : "https://bsc.getblock.io/c8fcb46a-cb6b-43d6-8336-00493ced3b23/mainnet/";

//       const web3 = new Web3(new Web3.providers.HttpProvider(provider));

//       const contract = new web3.eth.Contract(snftAbi, process.env.SNFT_TOKEN);

//       const getStakedBalance = await contract.methods
//         .balanceOf(walletAddress)
//         .call();

//       const value = Utils.convertToEther(getStakedBalance);
//       resolve(value);
//     } catch (err) {
//       console.log("error in snft balance", err);
//       resolve(0);
//     }
//   });
// };

// get if user has claimed snft airdrop for a given vesting
// web3Helper.hasSnftClaimed = async (walletAddress) => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       const provider =
//         process.env.NODE_ENV === "development"
//         ? "https://bsc.getblock.io/c8fcb46a-cb6b-43d6-8336-00493ced3b23/testnet/"
//         : "https://bsc.getblock.io/c8fcb46a-cb6b-43d6-8336-00493ced3b23/mainnet/";

//       const web3 = new Web3(new Web3.providers.HttpProvider(provider));

//       const contract = new web3.eth.Contract(snftMerkleAbi, walletAddress);

//       const getStakedBalance = await contract.methods
//         .hasClaimed(walletAddress, 0) // particular vesting is represented in second argument as 0 (for now)
//         .call();

//       resolve(getStakedBalance);
//     } catch (err) {
//       console.log("error in checking hasclaimed", err);
//       resolve(0);
//     }
//   });
// };

web3Helper.hasIgoFilled = async (contractAddress) => {
  try {
    const provider =
      process.env.NODE_ENV === "development"
      ? process.env.RPC_TESTNET
      : process.env.RPC_TESTNET
    const web3 = new Web3(new Web3.providers.HttpProvider(provider));

    const igoContract = new web3.eth.Contract(igoAbi, contractAddress);

    const maxCap = await igoContract.methods.maxCap().call();
    const totalRaised = await igoContract.methods
      .totalBUSDReceivedInAllTier()
      .call();

    return { status: parseInt(totalRaised) >= parseInt(maxCap), totalRaised}
  } catch (error) {
    console.log("error in checking hasIgoFilled: ", error);
    Utils.echoLog("Error in checkign hasIgoFilled", error);
  }
};

module.exports = web3Helper;
