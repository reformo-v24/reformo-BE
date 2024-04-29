const mongoose = require("mongoose");

const { Schema } = mongoose;

const userBalanceSchema = new Schema(
  {
    address: {
      type: String,
      required: true,
      unique: true,
    },
    balance: {
      type: String,
      required: true,
    },
  },

  {
    timestamps: true,
    toJSON: {
      getters: true,
    },
  }
);

module.exports = mongoose.model("userbalance", userBalanceSchema);
