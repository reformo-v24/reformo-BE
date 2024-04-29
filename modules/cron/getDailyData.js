const syncController = require("../sync/syncController");
const syncHelper = require("../sync/syncHelper");
const ObjectsToCsv = require("objects-to-csv");
const axios = require("axios");
const fs = require("fs");
const dailyCron = {};

dailyCron.getContractsData = async (req, res) => {
  console.log("CRON CALLED  at ", +new Date());
  try {
    const getLatestBlockNoUrl = `https://api-testnet.bscscan.com/api?module=proxy&action=eth_blockNumber&apikey=${process.env.BSC_API_KEY}`; // api key needed
    const getLatestBlock = await axios.get(getLatestBlockNoUrl);



    if (getLatestBlock.status === 200) {
      const latestBlock = parseInt(getLatestBlock.data.result, 16);

      console.log("latest block is:", latestBlock);

      const startBlock = 0;
      const endBlock = latestBlock;

      let finalData = [];
      const getgetReformaBalanceBalance = await syncHelper.getReformaBalance(
        startBlock,
        endBlock
      );

      const getLiquidityBalance = await syncHelper.getLiquidityBalance(
        startBlock,
        endBlock
      );

      const getFarmingBalance = await syncHelper.getFarmingBalance(
        startBlock,
        endBlock
      );

    

      const getSlpBalance = await syncHelper.slpBalance(startBlock, endBlock);
    e
      if (getReformaBalance.length) {
        finalData = getReformaBalance;
      }
      // merge liquidity balance
      if (getLiquidityBalance.length) {
        finalData = await syncController.checkData(
          finalData,
          getLiquidityBalance,
          "liquidity"
        );
      }
      // merge farming balance
      if (getFarmingBalance.length) {
        finalData = await syncController.checkData(
          finalData,
          getFarmingBalance,
          "farming"
        );
      }
      // merge bakery balance
      // if (getBakeryBalance.length) {
      //   finalData = await syncController.checkData(
      //     finalData,
      //     getBakeryBalance,
      //     "bakery"
      //   );
      // }
      // merge toshdish balance
      // if (getToshBalance.length) {
      //   finalData = await syncController.checkData(
      //     finalData,
      //     getToshBalance,
      //     "tosh" 
      //   );
      // }
      // merge slp balance
      if (getSlpBalance.length) {
        finalData = await syncController.checkData(
          finalData,
          getSlpBalance,
          "slp"
        );
      }

      let object = {
        endBlock: latestBlock,
      };

      let data = JSON.stringify(object);
      fs.writeFileSync("./result/block.json", data);

      await dailyCron.saveFile(finalData, "all");
      await dailyCron.saveFile(getReformaBalance, "Reforma");
      await dailyCron.saveFile(getLiquidityBalance, "liquidity");
      await dailyCron.saveFile(getFarmingBalance, "farming");
      // await dailyCron.saveFile(getBakeryBalance, "bakery");
      // await dailyCron.saveFile(getToshBalance, "tosdis");
      await dailyCron.saveFile(getSlpBalance, "slp");

      console.log("cron fires successfully");
    }
  } catch (err) {
    console.log("error is cron ", err);
  }
};

dailyCron.saveFile = async (data, name) => {
  const csv = new ObjectsToCsv(data);
  const fileName = name;
  await csv.toDisk(`./result/${fileName}.csv`);
};

module.exports = dailyCron;
