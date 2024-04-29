const mongoose = require("mongoose");

const { Schema } = mongoose;

const igoSchema = new Schema(
  {
    igoName: {
      type: String,
      required: true,
    },
    igoTokenName: {
      type: String,
      required: true,
    },
    userRegister: {
      status: {
        type: Boolean,
        default: false,
      },
      startDate: {
        type: String,
      },
      endDate: {
        type: String,
      },
    },
    igoTokenAddress: {
      type: String,
    },
    igoTokenSymbol: {
      type: String,
      required: true,
    },
    igoTokenDecimal: {
      type: Number,
      required: true,
    },
    paymentTokenSymbol: {
      type: String,
      required: true,
    },
    paymentTokenAddress: {
      type: String,
      required: true,
    },
    targetPoolRaise: {
      type: String,
      required: false,
    },
    imageURL: {
      type: String,
      required: true,
    },
    accessType: {
      type: String,
      required: true,
      enum: ["public", "private"],
    },
    igoDescription: {
      type: String,
      // required: true,
    },
    isPaymentTokenNative: {
      type: Boolean,
      required: true,
    },
    networkType: {
      type: String,
      required: true,
      enum: ["testnet", "mainnet"],
    },
    isDisabledBit: {
      type: Boolean,
      default: false,
    },
    network: {
      type: String,
      required: true,
      enum: ["binance", "polygon", "ethereum"],
    },
    socialLinks: {
      type: Object,
      default: {
        twitter: "",
        git: "",
        telegram: "",
        reddit: "",
        medium: "",
        browser_web: "",
        youtube: "",
        instagram: "",
        discord: "",
        white_paper: "",
        facebook: "",
      },
    },
    ownerAddress: {
      type: String,
    },
    price: {
      type: String,
      required: false,
    },
    phases: {
      type: [
        {
          phaseName: {
            type: String,
            required: true,
            enum: ["PHASE_ONE", "PHASE_TWO"],
          },
          poolStatus: {
            type: String,
            required: true,
            enum: ["upcoming", "completed", "Active", "Enrolling", "RegCompleted"],
          },
          phaseContractAddress: {
            type: String,
            required: false,
          },
          minUserAllocation: {
            type: String,
            required: true,
          },
          maxUserAllocation: {
            type: String,
            required: true,
          },
          start_date: {
            type: String,
            required: false,
          },
          end_date: {
            type: String,
            required: false,
          },
          igoTokenSupply: {
            type: String,
            required: true,
          },
          tiers: {
            type: Array,
            required: true,
          },
          maxTierCap: {
            type: Array,
            required: true,
          },
          minUserCap: {
            type: Array,
            required: true,
          },
          maxUserCap: {
            type: Array,
            required: true,
          },
          tierUsers: {
            type: Array,
            required: true,
          },
          totalRaisedAllocation: {
            type: String,
            required: false,
            default: "0"
          }
        },  
      ],
      required: false,
    },
    poolStatus: {
      type: String,
      required: true,
      enum: ["upcoming", "completed", "Active", "Enrolling", "RegCompleted"],
    },
    tokenDistributionDate: {
      type: String,
      required: true,
    },
    phasePoolRaise: {
      type: Number,
      required: false,
      default: null,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      getters: true,
    },
  }
);

module.exports = mongoose.model("igopools", igoSchema);
