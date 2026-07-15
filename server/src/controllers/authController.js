const crypto = require('crypto');
const { User } = require('../models');
const { sendEmail } = require('../services/email');
const { sendSMS } = require('../services/sms');
const { AppError } = require('../middleware/errorHandler');

const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  const cookieOptions = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  };
  res.status(statusCode).cookie('token', token, cookieOptions).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      referralCode: user.referralCode,
    },
  });
};

const generateOTP = () => String(Math.floor(100000 + Math.random() * 900000));

exports.register = async (req, res, next) => {
  try {
    const { name, phone, password } = req.body;
    const email = req.body.email?.toLowerCase();

    if (!name || !email || !password) {
      throw new AppError('Name, email, and password are required', 400);
    }

    const existingUser = await User.findOne({ $or: [{ email }, ...(phone ? [{ phone }] : [])] });
    if (existingUser) {
      throw new AppError('User with this email or phone already exists', 409);
    }

    const user = await User.create({ name, email, phone, password });

    const otp = generateOTP();
    user.otp = { code: otp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) };
    await user.save({ validateBeforeSave: false });

    try {
      await sendEmail({
        to: user.email,
        subject: 'PrintJack - Verify Your Email',
        html: `<p>Welcome to PrintJack!</p><p>Your verification OTP is: <strong>${otp}</strong></p><p>This OTP expires in 10 minutes.</p>`,
      });
    } catch (e) {
      console.error('Failed to send verification email:', e.message);
    }

    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { password } = req.body;
    const email = req.body.email?.toLowerCase();

    if (!email || !password) {
      throw new AppError('Please provide email and password', 400);
    }

    const user = await User.findOne({ email, isActive: true }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      throw new AppError('Invalid email or password', 401);
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

exports.googleAuth = async (req, res, next) => {
  try {
    const { googleId, name, avatar } = req.body;
    const email = req.body.email?.toLowerCase();

    if (!email) {
      throw new AppError('Google authentication requires an email', 400);
    }

    let user = await User.findOne({ email });

    if (user) {
      user.lastLogin = new Date();
      if (avatar && !user.avatar) user.avatar = avatar;
      await user.save({ validateBeforeSave: false });
    } else {
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        avatar: avatar || '',
        password: crypto.randomBytes(32).toString('hex'),
        isActive: true,
      });
      user.lastLogin = new Date();
      await user.save({ validateBeforeSave: false });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

exports.sendOTP = async (req, res, next) => {
  try {
    const { method } = req.body;
    const identifier = req.body.email || req.body.phone;

    if (!identifier) {
      throw new AppError('Email or phone number is required', 400);
    }

    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
    });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const otp = generateOTP();
    user.otp = { code: otp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) };
    await user.save({ validateBeforeSave: false });

    const sendVia = method || (user.email === identifier ? 'email' : 'sms');

    if (sendVia === 'email' || !user.phone) {
      await sendEmail({
        to: user.email,
        subject: 'PrintJack - Your OTP Code',
        html: `<p>Your OTP code is: <strong>${otp}</strong></p><p>This code expires in 10 minutes.</p>`,
      });
    }
    if ((sendVia === 'sms') && user.phone) {
      await sendSMS({
        to: user.phone,
        message: `Your PrintJack OTP is: ${otp}. Valid for 10 minutes.`,
      });
    }

    res.status(200).json({ success: true, message: 'OTP sent successfully' });
  } catch (err) {
    next(err);
  }
};

exports.verifyOTP = async (req, res, next) => {
  try {
    const { code } = req.body;
    const identifier = req.body.email || req.body.phone;

    if (!identifier || !code) {
      throw new AppError('Email/phone and OTP code are required', 400);
    }

    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
    });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (!user.otp || !user.otp.code || !user.otp.expiresAt) {
      throw new AppError('No OTP found. Please request a new one.', 400);
    }

    if (new Date() > user.otp.expiresAt) {
      throw new AppError('OTP has expired. Please request a new one.', 400);
    }

    if (user.otp.code !== code) {
      throw new AppError('Invalid OTP code', 400);
    }

    user.otp = undefined;
    user.isVerified = true;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({ success: true, message: 'OTP verified successfully' });
  } catch (err) {
    next(err);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const email = req.body.email?.toLowerCase();

    if (!email) {
      throw new AppError('Please provide your email', 400);
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError('No account with that email exists', 404);
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

    try {
      await sendEmail({
        to: user.email,
        subject: 'PrintJack - Password Reset Request',
        html: `<p>You requested a password reset.</p><p>Click the link below to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>This link expires in 15 minutes.</p><p>If you did not request this, please ignore this email.</p>`,
      });

      res.status(200).json({ success: true, message: 'Password reset email sent' });
    } catch (e) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      throw new AppError('Failed to send reset email. Please try again.', 500);
    }
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      throw new AppError('Please provide a new password', 400);
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 5 * 1000),
      httpOnly: true,
    });

    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new AppError('Please provide current and new password', 400);
    }

    if (newPassword.length < 8) {
      throw new AppError('New password must be at least 8 characters', 400);
    }

    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.matchPassword(currentPassword))) {
      throw new AppError('Current password is incorrect', 401);
    }

    user.password = newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};
