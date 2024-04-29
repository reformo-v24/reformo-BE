const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: false,
      default: null,
      lowercase: true,
    },

    recordId: {
      type: String,
      default: null,
      lowercase: true,
      unique: true,
    },

    old_recordId: {
      type: String,
      default: null,
      lowercase: true,
    },

    networks: [
      { type: Schema.Types.ObjectId, ref: "networkwallet", default: [] },
    ],

    country: {
      type: String,
      default: null,
      lowercase: true,
    },
    state: {
      type: String,
      default: null,
      lowercase: true,
    },

    walletAddress: {
      type: String,
      required: true,
      lowercase: true,
      // unique: true,
    },
    email: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    activeStaker: {
      type: Boolean,
      default: true,
    },
    totalbalance: {
      type: Number,
      default: 0,
    },

    balObj: {
      type: JSON,
      default: {},
    },
    stkPoints: {
      type: Object,
      default: {},
    },
    timestamp: {
      type: Number,
      default: 0,
    },

    kycStatus: {
      type: String,
      enum: [
        "approved",
        "waiting",
        "inreview",
        "resubmit",
        "incomplete",
        "rejected",
        "blocked",
        "nonblockpass",
      ],
    },

    approvedTimestamp: {
      type: Number,
      default: 0,
    },

    profilePics: {
      type: Object,
      default: {
        profile: null,
        cover: null,
      },
    },

    tier: {
      type: String,
      default: "tier0",
    },

    notifyMe: {
      type: Boolean,
      default: false
    }
  },

  {
    timestamps: true,
    toJSON: {
      getters: true,
    },
  }
);

module.exports = mongoose.model('users', userSchema);
