const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const printSpecificationsSchema = new mongoose.Schema({
  width: { type: Number },
  height: { type: Number },
  bleed: { type: Number, default: 3 },
  colorMode: { type: String, enum: ['CMYK', 'RGB'], default: 'CMYK' },
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
}, {
  timestamps: { createdAt: true, updatedAt: false },
});

designSchema.plugin(mongoosePaginate);

designSchema.index({ user: 1, status: 1 });
designSchema.index({ product: 1 });

module.exports = mongoose.model('Design', designSchema);
