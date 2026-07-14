const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  key: {
    type: String,
    required: [true, 'Setting key is required'],
    unique: true,
    trim: true,
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'Setting value is required'],
  },
  description: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    default: 'general',
  },
}, {
  timestamps: true,
});

settingSchema.index({ key: 1 });
settingSchema.index({ category: 1 });

settingSchema.statics.get = async function (key) {
  const setting = await this.findOne({ key });
  return setting ? setting.value : null;
};

settingSchema.statics.set = async function (key, value, description = '', category = 'general') {
  return this.findOneAndUpdate(
    { key },
    { key, value, description, category },
    { upsert: true, new: true }
  );
};

module.exports = mongoose.model('Setting', settingSchema);
