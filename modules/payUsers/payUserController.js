const Web3 = require("web3");
const payUserModel = require("./payUserModel");
const utils = require("../../helper/utils");
const userBalanceModel = require("./userBalanceModel");
const payUserCtrl = {};

payUserCtrl.addPaydetails = async (req, res) => {
  try {
    const { amount, address } = req.body;

    const userBalance = await userBalanceModel.findOne({ address: address });

    if (!userBalance)
      return res
        .status(400)
        .json({ status: false, message: "user balance not found" });

    if (userBalance.balance - amount < 0)
      return res.status(400).json({
        status: false,
        message: "Pay amount exceeds the balance amount",
      });

    // userBalance.balance = userBalance.balance - amount;
    // userBalance.save();
    const newPayData = new payUserModel({
      amount,
      address,
      status: false,
    });
    await newPayData.save();

    return res.status(200).json(newPayData.toJSON());
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

payUserCtrl.getPayStatus = async (req, res) => {
  try {
    const address = req.params.address;
    // return res.status(200).json({ status: isValid ? true : false });

    const payDetail = await payUserModel.findOne({ _id: address });

    if (!payDetail)
      return res
        .status(404)
        .json({ status: false, message: "Details not found" });

    const provider =
      process.env.NODE_ENV === "development"
        ? process.env.RPC_TESTNET
        :  process.env.RPC_MAINNET 

    const web3 = new Web3(new Web3.providers.HttpProvider(provider));

    const stableAmount = payDetail.amount / 5;
    const amountWei = utils.convertToWei(stableAmount.toString());

    const byte = web3.eth.abi.encodeParameters(
      ["bool", "uint256", "address"],
      [payDetail.status, amountWei, payDetail.address]
    );

    return res.status(200).json({
      status: true,
      data: payDetail,
      byteData: byte,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

payUserCtrl.getAddressData = async (req, res) => {
  try {
    const address = req.params.address;

    const userBalance = await userBalanceModel.findOne({ address: address });

    if (!userBalance)
      return res
        .status(404)
        .json({ status: false, message: "User do not have any balance" });

    const payList = await payUserModel.find({ address: address });

    if (!payList.length)
      return res.status(200).json({
        status: false,
        balance: userBalance.balance,
        message: "Transaction not found with given address",
      });

    return res.status(200).json({
      status: true,
      balance: userBalance.balance,
      data: payList,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

payUserCtrl.addUserBalance = async (req, res) => {
  try {
    const { balance, address } = req.body;

    if (!balance || !address)
      return res
        .status(400)
        .json({ status: false, message: "Invalid input data" });

    const userBalance = await userBalanceModel.findOne({ address });

    if (!userBalance) {
      const balanceData = new userBalanceModel({ balance, address });
      await balanceData.save();
      return res.status(200).json({
        status: true,
        data: balanceData.toJSON(),
        message: "Balance added for give address",
      });
    }

    userBalance.balance = (
      parseInt(userBalance.balance) + parseInt(balance)
    ).toString();
    userBalance.save();

    return res.status(200).json({
      status: true,
      data: userBalance.toJSON(),
      message: "Balance added for give address",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

payUserCtrl.setTransactionSuccess = async (req, res) => {
  try {
    const { TRANSACTION_ID } = req.params;

    const transaction = await payUserModel.findOne({ _id: TRANSACTION_ID });

    if (!transaction)
      return res
        .status(404)
        .json({ status: false, message: "Transaction not found" });

    transaction.status = true;

    const userBal = await userBalanceModel.findOne({
      address: transaction.address,
    });

    userBal.balance = userBal.balance - transaction.amount;

    await userBal.save();
    await transaction.save();

    return res.status(200).json({ status: true, message: "Balance updated" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

module.exports = payUserCtrl;
