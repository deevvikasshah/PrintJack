const { User, Notification } = require('../models');

const notifyAdmins = async ({ type = 'system', title, message, data = null }) => {
  try {
    const admins = await User.find({ role: { $in: ['admin', 'super_admin'] } }).select('_id').lean();

    if (!admins || admins.length === 0) return { success: true, notified: 0 };

    const notifications = admins.map((admin) => ({
      user: admin._id,
      type,
      title,
      message,
      data,
      isRead: false,
    }));

    await Notification.insertMany(notifications);
    return { success: true, notified: notifications.length };
  } catch (err) {
    console.error('Failed to notify admins:', err.message);
    return { success: false, error: err.message };
  }
};

module.exports = { notifyAdmins };
