const mongoose = require("mongoose");

const { Schema } = mongoose;

const applyProjectSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    telegramUsername: {
      type: String,
      required: true,
    },
    projectName: {
      type: String,
      required: true,
    },
    projectWebsiteLink: {
      type: String,
      required: true,
    },
    gameplayVideo: {
      type: String,
      required: false,
      default: "",
    },
    projectDescription: {
      type: String,
      required: false,
    },
    developmentStatus: {
      type: String,
      required: false,
    },
    paperLinks: {
      type: [String],
      required: false,
    },
    reason: {
      type: String,
      default: null,
    },
    approvalStatus: {
      type: String,
      default: "pending",
      enum: ["approved", "rejected", "pending"],
    },
    twitterUsername: {
      type: String,
      required: false,
      default: "",
    },
  },

  {
    timestamps: true,
    toJSON: {
      getters: true,
    },
  }
);

module.exports = mongoose.model("applyProject", applyProjectSchema);
