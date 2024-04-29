const mongoose = require('mongoose');

const participateuserSchema = new mongoose.Schema({
  igoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Igopool' },
  igoName: String,
  participants: [{
    walletAddress: String,
    tier: String,
    kycStatus: String,
    name: String,
    email: String,
    participateStatus: {
      type: Boolean,
      default: false,
    },
  }],
  isDeleted: {
    type: Boolean,
    default: false,
  },
},
{
  timestamps: true,
  toJSON: {
    getters: true,
  },
});

const Participateuser = mongoose.model('Participateuser', participateuserSchema);

module.exports = Participateuser;
