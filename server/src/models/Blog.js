const mongoose = require('mongoose');
const slugify = require('slugify');
const mongoosePaginate = require('mongoose-paginate-v2');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Blog title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  slug: {
    type: String,
    unique: true,
  },
  content: {
    type: String,
    required: [true, 'Blog content is required'],
  },
  excerpt: {
    type: String,
    default: '',
    maxlength: [500, 'Excerpt cannot exceed 500 characters'],
  },
  featuredImage: {
    type: String,
    default: '',
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required'],
  },
  category: {
    type: String,
    default: 'General',
  },
  tags: [{ type: String }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
  },
  publishedAt: {
    type: Date,
  },
  views: {
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

blogSchema.plugin(mongoosePaginate);

blogSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

blogSchema.index({ slug: 1 });
blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ author: 1 });

module.exports = mongoose.model('Blog', blogSchema);
