const mongoose = require('mongoose');
const slugify = require('slugify');
const mongoosePaginate = require('mongoose-paginate-v2');

const printAreaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  description: { type: String, default: '' },
  maxFileSize: { type: Number, default: 10 },
  acceptedFormats: [{ type: String }],
}, { _id: true });

const bulkPricingSchema = new mongoose.Schema({
  minQty: { type: Number, required: true },
  maxQty: { type: Number, required: true },
  price: { type: Number, required: true },
}, { _id: true });

const colorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  hexCode: { type: String },
  available: { type: Boolean, default: true },
  additionalPrice: { type: Number, default: 0 },
}, { _id: true });

const sizeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  available: { type: Boolean, default: true },
  additionalPrice: { type: Number, default: 0 },
}, { _id: true });

const templateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  thumbnail: { type: String, default: '' },
}, { _id: true });

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  alt: { type: String, default: '' },
}, { _id: true });

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Name cannot exceed 200 characters'],
  },
  slug: {
    type: String,
    unique: true,
  },
  description: {
    type: String,
    default: '',
  },
  shortDescription: {
    type: String,
    default: '',
    maxlength: [500, 'Short description cannot exceed 500 characters'],
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required'],
  },
  subCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  },
  brand: {
    type: String,
    default: '',
  },
  basePrice: {
    type: Number,
    required: [true, 'Base price is required'],
    min: [0, 'Price cannot be negative'],
  },
  bulkPricing: [bulkPricingSchema],
  images: [imageSchema],
  colors: [colorSchema],
  sizes: [sizeSchema],
  material: {
    type: String,
    default: '',
  },
  printingMethod: {
    type: String,
    default: '',
  },
  printAreas: [printAreaSchema],
  tags: [{ type: String }],
  specifications: {
    type: Map,
    of: String,
  },
  templates: [templateSchema],
  minimumOrderQuantity: {
    type: Number,
    default: 1,
    min: 1,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  totalReviews: {
    type: Number,
    default: 0,
  },
  totalSold: {
    type: Number,
    default: 0,
  },
  metaTitle: {
    type: String,
    default: '',
  },
  metaDescription: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

productSchema.plugin(mongoosePaginate);

productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true }) + '-' + Date.now().toString(36);
  }
  next();
});

productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ slug: 1 });
productSchema.index({ isFeatured: 1, isActive: 1 });

module.exports = mongoose.model('Product', productSchema);
