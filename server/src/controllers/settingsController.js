const { Setting } = require('../models');
const { AppError } = require('../middleware/errorHandler');

exports.getSettings = async (req, res, next) => {
  try {
    const { category } = req.query;

    const query = {};
    if (category) query.category = category;

    const settings = await Setting.find(query).sort('key');

    const settingsObj = {};
    settings.forEach((s) => {
      settingsObj[s.key] = s.value;
    });

    res.status(200).json({
      success: true,
      settings,
      settingsMap: settingsObj,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateSetting = async (req, res, next) => {
  try {
    const { key, value, description, category } = req.body;

    if (!key || value === undefined) {
      throw new AppError('Key and value are required', 400);
    }

    const setting = await Setting.set(
      key,
      value,
      description || '',
      category || 'general'
    );

    res.status(200).json({ success: true, setting });
  } catch (err) {
    next(err);
  }
};

exports.bulkUpdateSettings = async (req, res, next) => {
  try {
    const { settings } = req.body;

    if (!settings || !Array.isArray(settings) || settings.length === 0) {
      throw new AppError('Settings array is required', 400);
    }

    const updated = [];

    for (const item of settings) {
      if (!item.key || item.value === undefined) continue;
      const setting = await Setting.set(
        item.key,
        item.value,
        item.description || '',
        item.category || 'general'
      );
      updated.push(setting);
    }

    res.status(200).json({
      success: true,
      message: `${updated.length} settings updated successfully`,
      settings: updated,
    });
  } catch (err) {
    next(err);
  }
};
