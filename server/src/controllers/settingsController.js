const { Setting } = require('../models');
const { AppError } = require('../middleware/errorHandler');

const DEFAULT_HOMEPAGE = {
  testimonials: [
    { name: 'Priya Sharma', role: 'Founder, Brew Coffee', rating: 5, text: 'PrintJack delivered our branded merchandise faster than expected. The print quality is outstanding. We have ordered 5 times already!', avatar: 'PS' },
    { name: 'Rahul Mehta', role: 'Marketing Lead, TechNova', rating: 5, text: 'The online editor made it so easy to design our promotional banners. Great customer support too. Highly recommended for businesses!', avatar: 'RM' },
    { name: 'Ananya Patel', role: 'Event Manager', rating: 5, text: 'We got 500 custom t-shirts for our college fest. The bulk pricing was unbeatable and the quality was perfect. Will order again!', avatar: 'AP' },
    { name: 'Vikram Singh', role: 'CEO, StartupGrid', rating: 4, text: 'Professional business cards at an affordable price. The design tool is intuitive and the delivery was on time. Great experience overall.', avatar: 'VS' },
  ],
  trustLogos: ['Startup India', 'Make in India', 'Digital India', 'ISO 9001', 'Google Pay', 'Shopify'],
  trustBar: [
    { icon: 'truck', text: 'Free Shipping on ₹999+' },
    { icon: 'shield', text: '100% Quality Guarantee' },
    { icon: 'map', text: 'Pan India Delivery' },
    { icon: 'support', text: '24/7 Support' },
  ],
};

const normalizeHomepage = (settings) => {
  const out = { ...DEFAULT_HOMEPAGE };
  const parseArray = (val) => {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
      try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        // ignore
      }
    }
    return null;
  };
  const t = parseArray(settings.testimonials);
  if (t && Array.isArray(t)) out.testimonials = t;
  const l = parseArray(settings.trustLogos);
  if (l && Array.isArray(l)) out.trustLogos = l;
  const b = parseArray(settings.trustBar);
  if (b && Array.isArray(b)) out.trustBar = b;
  return out;
};

exports.getPublicContent = async (req, res, next) => {
  try {
    const keys = ['testimonials', 'trustLogos', 'trustBar'];
    const found = await Setting.find({ key: { $in: keys } });
    const settings = {};
    found.forEach((s) => { settings[s.key] = s.value; });

    const content = normalizeHomepage(settings);

    res.status(200).json({ success: true, content });
  } catch (err) {
    next(err);
  }
};

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
    const { value, description, category } = req.body;
    const key = req.params.key;

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
