const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const printSpecificationsSchema = new mongoose.Schema({
  width: { type: Number },
  height: { type: Number },
  bleed: { type: Number, default: 3 },
  colorMode: { type: String, enum: ['CMYK', 'RGB'], default: 'CMYK' },
}, { _id: false });

const designVersionSchema = new mongoose.Schema({
  versionNumber: { type: Number, required: true },
  canvasData: { type: mongoose.Schema.Types.Mixed },
  previewImage: { type: String },
  printSpecifications: printSpecificationsSchema,
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  changeNote: { type: String, default: '' },
}, { _id: true, timestamps: { createdAt: true, updatedAt: false } });

const collaborationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['owner', 'editor', 'viewer'], default: 'editor' },
  joinedAt: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
}, { _id: false });

const designSuggestionSchema = new mongoose.Schema({
  productType: { type: String, required: true },
  layout: { type: String, enum: ['center', 'left', 'right', 'wrap-around', 'all-over', 'pocket', 'sleeve', 'back'], required: true },
  placement: { type: String, enum: ['center', 'top-left', 'top-right', 'bottom-center', 'full-front', 'full-back'], default: 'center' },
  recommendedWidth: { type: Number },
  recommendedHeight: { type: Number },
  suggestedElements: [{ type: String }],
  confidence: { type: Number, min: 0, max: 1, default: 0.5 },
  reason: { type: String },
}, { _id: false });

const designSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required'],
  },
  name: {
    type: String,
    required: [true, 'Design name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
  },
  canvasData: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  previewImage: {
    type: String,
    default: '',
  },
  printFile: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['draft', 'saved', 'submitted', 'approved', 'rejected'],
    default: 'draft',
  },
  adminNotes: {
    type: String,
    default: '',
  },
  printSpecifications: printSpecificationsSchema,
  collaborators: [collaborationSchema],
  versions: [designVersionSchema],
  suggestions: [designSuggestionSchema],
  currentVersion: { type: Number, default: 1 },
  isTemplate: { type: Boolean, default: false },
  templateUsed: { type: mongoose.Schema.Types.ObjectId, ref: 'Template' },
}, {
  timestamps: { createdAt: true, updatedAt: false },
});

designSchema.plugin(mongoosePaginate);

designSchema.index({ user: 1, status: 1 });
designSchema.index({ product: 1 });
designSchema.index({ 'collaborators.user': 1 });
designSchema.index({ isTemplate: 1 });

module.exports = mongoose.model('Design', designSchema);
