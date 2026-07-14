const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  design: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Design',
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  size: {
    type: String,
  },
  color: {
    type: String,
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  customizations: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
}, { _id: true });

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  items: [cartItemSchema],
  totalAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  coupon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coupon',
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
  },
}, {
  timestamps: true,
});

cartSchema.pre('save', function (next) {
  this.totalAmount = this.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  next();
});

cartSchema.index({ user: 1 });

module.exports = mongoose.model('Cart', cartSchema);
