const { User, Referral, Coupon } = require('../models');
const { AppError } = require('../middleware/errorHandler');

exports.getMyReferralCode = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('referralCode name');

    if (!user.referralCode) {
      user.referralCode = 'PJ' + user._id.toString().slice(-6).toUpperCase() + Math.random().toString(36).slice(-4).toUpperCase();
      await user.save({ validateBeforeSave: false });
    }

    const referralLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/signup?ref=${user.referralCode}`;

    res.status(200).json({
      success: true,
      referralCode: user.referralCode,
      referralLink,
    });
  } catch (err) {
    next(err);
  }
};

exports.getReferralStats = async (req, res, next) => {
  try {
    const [totalReferrals, completedReferrals, pendingReferrals] = await Promise.all([
      Referral.countDocuments({ referrer: req.user._id }),
      Referral.countDocuments({ referrer: req.user._id, status: 'completed' }),
      Referral.countDocuments({ referrer: req.user._id, status: 'pending' }),
    ]);

    const rewards = await Referral.aggregate([
      { $match: { referrer: req.user._id, status: 'completed' } },
      {
        $group: {
          _id: null,
          totalRewardAmount: { $sum: '$rewardAmount' },
        },
      },
    ]);

    const user = await User.findById(req.user._id).select('loyaltyPoints');

    res.status(200).json({
      success: true,
      stats: {
        totalReferrals,
        completedReferrals,
        pendingReferrals,
        totalRewardAmount: rewards[0]?.totalRewardAmount || 0,
        loyaltyPoints: user.loyaltyPoints || 0,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.applyReferral = async (req, res, next) => {
  try {
    const { referralCode } = req.body;

    if (!referralCode) {
      throw new AppError('Referral code is required', 400);
    }

    const referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
    if (!referrer) {
      throw new AppError('Invalid referral code', 400);
    }

    if (referrer._id.toString() === req.user._id.toString()) {
      throw new AppError('You cannot use your own referral code', 400);
    }

    const existingReferral = await Referral.findOne({ referredUser: req.user._id });
    if (existingReferral) {
      throw new AppError('A referral code has already been applied to your account', 400);
    }

    const referralRewardAmount = 50;

    const referral = await Referral.create({
      referrer: referrer._id,
      referredUser: req.user._id,
      referralCode: referralCode.toUpperCase(),
      status: 'completed',
      rewardAmount: referralRewardAmount,
    });

    referrer.loyaltyPoints = (referrer.loyaltyPoints || 0) + referralRewardAmount;
    await referrer.save({ validateBeforeSave: false });

    req.user.referredBy = referrer._id;
    req.user.loyaltyPoints = (req.user.loyaltyPoints || 0) + Math.round(referralRewardAmount * 0.5);
    await req.user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'Referral code applied successfully',
      referral: {
        _id: referral._id,
        referrerName: referrer.name,
        rewardAmount: referralRewardAmount,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getPendingRewards = async (req, res, next) => {
  try {
    const pendingRewards = await Referral.find({
      referrer: req.user._id,
      status: 'pending',
    })
      .populate('referredUser', 'name email')
      .sort('-createdAt');

    const totalPending = pendingRewards.reduce((sum, r) => sum + r.rewardAmount, 0);

    res.status(200).json({
      success: true,
      pendingRewards,
      totalPendingAmount: totalPending,
    });
  } catch (err) {
    next(err);
  }
};
