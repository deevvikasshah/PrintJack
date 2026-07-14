const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
  },
  type: {
    type: String,
    enum: ['order_status', 'payment', 'promotional', 'system', 'design_update'],
    required: [true, 'Notification type is required'],
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: { createdAt: true, updatedAt: false },
});

notificationSchema.plugin(mongoosePaginate);

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
