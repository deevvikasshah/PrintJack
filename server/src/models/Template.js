const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Template name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
  },
  description: {
    type: String,
    default: '',
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  category: {
    type: String,
    enum: ['tshirt', 'mug', 'poster', ' hoodie', 'cap', 'sticker', 'canvas', 'phone-case', 'laptop-skin', 'bag', 'other'],
    default: 'other',
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  canvasData: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  previewImage: {
    type: String,
    required: true,
  },
  thumbnail: {
    type: String,
    default: '',
  },
  printSpecifications: {
    width: { type: Number },
    height: { type: Number },
    bleed: { type: Number, default: 3 },
    colorMode: { type: String, enum: ['CMYK', 'RGB'], default: 'CMYK' },
  },
  tags: [{ type: String }],
  downloads: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  isPublic: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['active', 'hidden', 'deleted'],
    default: 'active',
  },
}, {
  timestamps: true,
});

templateSchema.index({ category: 1, isPublic: 1 });
templateSchema.index({ product: 1 });
templateSchema.index({ createdBy: 1 });
templateSchema.index({ tags: 1 });

module.exports = mongoose.model('Template', templateSchema);