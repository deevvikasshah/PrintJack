const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
  referrer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Referrer is required'],
  },
  referredUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Referred user is required'],
  },
  referralCode: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'expired'],
    default: 'pending',
  },
  reward: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coupon',
  },
  rewardAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
}, {
  timestamps: { createdAt: true, updatedAt: false },
});

referralSchema.index({ referrer: 1 });
referralSchema.index({ referredUser: 1 });
referralSchema.index({ referralCode: 1 });
referralSchema.index({ status: 1 });

module.exports = mongoose.model('Referral', referralSchema);
