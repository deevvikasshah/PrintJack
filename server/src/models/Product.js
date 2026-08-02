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

const calculatorVariableSchema = new mongoose.Schema({
  name: { type: String, required: true },
  label: { type: String, required: true },
  type: { type: String, enum: ['number', 'select', 'checkbox', 'range'], required: true },
  unit: { type: String, default: '' },
  defaultValue: { type: mongoose.Schema.Types.Mixed, default: 0 },
  options: [{ type: String }],
  min: { type: Number, default: 0 },
  max: { type: Number, default: 1000 },
  step: { type: Number, default: 1 },
  pricePerUnit: { type: Number, default: 0 },
  isRequired: { type: Boolean, default: false },
  description: { type: String, default: '' },
}, { _id: false });

const calculatorConfigSchema = new mongoose.Schema({
  enabled: { type: Boolean, default: false },
  baseFormula: { type: String, default: 'basePrice' },
  variables: [calculatorVariableSchema],
  priceBreakdown: {
    inkCost: { type: Number, default: 0 },
    paperCost: { type: Number, default: 0 },
    laminationCost: { type: Number, default: 0 },
    finishingCost: { type: Number, default: 0 },
    setupCost: { type: Number, default: 0 },
    shippingCost: { type: Number, default: 0 },
    totalCost: { type: Number, default: 0 },
    margin: { type: Number, default: 0 },
    finalPrice: { type: Number, default: 0 },
  },
  currency: { type: String, default: '₹' },
  allowCustomDimensions: { type: Boolean, default: true },
  defaultWidth: { type: Number, default: 0 },
  defaultHeight: { type: Number, default: 0 },
  dimensionUnit: { type: String, enum: ['cm', 'inch', 'mm'], default: 'cm' },
}, { _id: false });

const templateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  thumbnail: { type: String, default: '' },
}, { _id: true });

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  alt: { type: String, default: '' },
}, { _id: true });

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5,
  },
  title: { type: String, default: '', trim: true },
  comment: { type: String, required: [true, 'Review comment is required'], trim: true },
  photos: [{ type: String }],
  verifiedPurchase: { type: Boolean, default: false },
  helpful: {
    count: { type: Number, default: 0 },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
}, {
  timestamps: { createdAt: true, updatedAt: false },
});

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
  calculatorConfig: calculatorConfigSchema,
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
  reviews: [reviewSchema],
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
