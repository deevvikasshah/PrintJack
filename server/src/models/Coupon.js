const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Coupon code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    minlength: [3, 'Code must be at least 3 characters'],
    maxlength: [20, 'Code cannot exceed 20 characters'],
  },
  description: {
    type: String,
    default: '',
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed', 'free_shipping'],
    required: [true, 'Discount type is required'],
  },
  discountValue: {
    type: Number,
    required: [true, 'Discount value is required'],
    min: [0, 'Discount value cannot be negative'],
  },
  minimumOrderAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  maximumDiscountAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  usageLimit: {
    type: Number,
    default: 0,
  },
  usedCount: {
    type: Number,
    default: 0,
  },
  applicableCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  }],
  applicableProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  validFrom: {
    type: Date,
    required: [true, 'Valid from date is required'],
  },
  validTill: {
    type: Date,
    required: [true, 'Valid till date is required'],
  },
}, {
  timestamps: { createdAt: true, updatedAt: false },
});

couponSchema.plugin(mongoosePaginate);

couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1, validFrom: 1, validTill: 1 });

module.exports = mongoose.model('Coupon', couponSchema);
