const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mongoosePaginate = require('mongoose-paginate-v2');

const addressSchema = new mongoose.Schema({
  label: { type: String, enum: ['Home', 'Office', 'Other'], default: 'Home' },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  country: { type: String, default: 'India' },
  phone: { type: String },
  isDefault: { type: Boolean, default: false },
}, { _id: true });

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },
  phone: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    match: [/^[6-9]\d{9}$/, 'Please provide a valid 10-digit Indian phone number'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false,
  },
  role: {
    type: String,
    enum: ['customer', 'admin', 'super_admin'],
    default: 'customer',
  },
  avatar: {
    type: String,
    default: '',
  },
  addresses: [addressSchema],
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  }],
  loyaltyPoints: {
    type: Number,
    default: 0,
    min: 0,
  },
  referralCode: {
    type: String,
    unique: true,
    sparse: true,
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
    type: Date,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

userSchema.plugin(mongoosePaginate);

userSchema.virtual('fullAddress').get(function () {
  if (!this.addresses || this.addresses.length === 0) return null;
  const addr = this.addresses.find((a) => a.isDefault) || this.addresses[0];
  return `${addr.street}, ${addr.city}, ${addr.state} - ${addr.pincode}, ${addr.country}`;
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.pre('save', function (next) {
  if (!this.referralCode && this.isNew) {
    this.referralCode = 'PJ' + this._id.toString().slice(-6).toUpperCase() + Math.random().toString(36).slice(-4).toUpperCase();
  }
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET || 'printjack_jwt_secret', {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  return resetToken;
};

module.exports = mongoose.model('User', userSchema);
