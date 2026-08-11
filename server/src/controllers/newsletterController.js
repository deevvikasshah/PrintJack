const Newsletter = require('../models/Newsletter');
const { notifyAdmins } = require('../utils/notifyAdmins');

exports.subscribe = async (req, res, next) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    const existing = await Newsletter.findOne({ email });
    if (existing) {
      return res.status(200).json({ success: true, message: 'You are already subscribed to our newsletter!' });
    }

    await Newsletter.create({ email, source: req.body.source || 'footer' });

    await notifyAdmins({
      type: 'promotional',
      title: 'New newsletter subscriber',
      message: email,
      data: { kind: 'newsletter', email },
    });

    res.status(201).json({ success: true, message: 'Subscribed successfully! Watch your inbox for offers and updates.' });
  } catch (err) {
    next(err);
  }
};
