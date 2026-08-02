const { User, Notification } = require('../models');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');
const { AppError } = require('../middleware/errorHandler');

exports.getAllUsers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      sort = '-createdAt',
      role,
    } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }
    if (role) {
      query.role = role;
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort,
    };

    const users = await User.paginate(query, options);

    res.status(200).json({
      success: true,
      users: users.docs,
      pagination: {
        total: users.totalDocs,
        pages: users.totalPages,
        page: users.page,
        limit: users.limit,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { role, isActive } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (role !== undefined) {
      if (!['customer', 'admin', 'super_admin'].includes(role)) {
        throw new AppError('Invalid role', 400);
      }
      user.role = role;
    }

    if (isActive !== undefined) {
      user.isActive = isActive;
    }

    await user.save();

    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    user.isActive = false;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({ success: true, message: 'User deactivated successfully' });
  } catch (err) {
    next(err);
  }
};

exports.sendUserMessage = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      throw new AppError('Message is required', 400);
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    await Notification.create({
      user: user._id,
      type: 'system',
      title: 'Message from PrintJack',
      message: message.trim(),
      data: { fromAdmin: true },
    });

    res.status(200).json({ success: true, message: 'Message sent' });
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;

    if (req.file) {
      if (user.avatar) {
        try {
          const publicId = user.avatar.split('/').pop().split('.')[0];
          await deleteFromCloudinary(publicId);
        } catch (e) {
          console.error('Failed to delete old avatar:', e.message);
        }
      }
      const result = await uploadToCloudinary(req.file, {
        folder: 'printjack/avatars',
        width: 300,
        height: 300,
        crop: 'fill',
      });
      user.avatar = result.secure_url;
    } else if (avatar !== undefined) {
      user.avatar = avatar;
    }

    await user.save({ validateBeforeSave: false });

    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

exports.getAddresses = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('addresses');
    res.status(200).json({ success: true, addresses: user.addresses || [] });
  } catch (err) {
    next(err);
  }
};

exports.addAddress = async (req, res, next) => {
  try {
    const { label, fullName, phone, street, city, state, pincode, country, isDefault } = req.body;

    const user = await User.findById(req.user._id);

    if (isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    user.addresses.push({ label, fullName, street, city, state, pincode, country: country || 'India', phone, isDefault: !!isDefault });

    if (user.addresses.length === 1) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    res.status(201).json({ success: true, addresses: user.addresses });
  } catch (err) {
    next(err);
  }
};

exports.updateAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;
    const { label, fullName, phone, street, city, state, pincode, country, isDefault } = req.body;

    const user = await User.findById(req.user._id);

    let idx = -1;
    if (/^[0-9a-fA-F]{24}$/.test(addressId)) {
      idx = user.addresses.findIndex((a) => a._id.toString() === addressId);
    } else {
      idx = parseInt(addressId, 10);
    }

    if (idx < 0 || idx >= user.addresses.length) {
      throw new AppError('Address not found', 404);
    }

    if (isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    const addr = user.addresses[idx];
    if (label) addr.label = label;
    if (fullName) addr.fullName = fullName;
    if (street) addr.street = street;
    if (city) addr.city = city;
    if (state) addr.state = state;
    if (pincode) addr.pincode = pincode;
    if (country) addr.country = country;
    if (phone) addr.phone = phone;
    if (isDefault !== undefined) addr.isDefault = isDefault;

    await user.save();

    res.status(200).json({ success: true, addresses: user.addresses });
  } catch (err) {
    next(err);
  }
};

exports.deleteAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user._id);

    let idx = -1;
    if (/^[0-9a-fA-F]{24}$/.test(addressId)) {
      idx = user.addresses.findIndex((a) => a._id.toString() === addressId);
    } else {
      idx = parseInt(addressId, 10);
    }

    if (idx < 0 || idx >= user.addresses.length) {
      throw new AppError('Address not found', 404);
    }

    const wasDefault = user.addresses[idx].isDefault;
    user.addresses.splice(idx, 1);

    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    res.status(200).json({ success: true, addresses: user.addresses });
  } catch (err) {
    next(err);
  }
};

exports.setDefaultAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user._id);

    const address = user.addresses.id(addressId);
    if (!address) {
      throw new AppError('Address not found', 404);
    }

    user.addresses.forEach((addr) => {
      addr.isDefault = addr._id.toString() === addressId;
    });

    await user.save();

    res.status(200).json({ success: true, addresses: user.addresses });
  } catch (err) {
    next(err);
  }
};

exports.getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'wishlist',
      populate: { path: 'category', select: 'name slug' },
    });

    res.status(200).json({ success: true, wishlist: user.wishlist });
  } catch (err) {
    next(err);
  }
};

exports.toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user._id);

    const index = user.wishlist.findIndex((id) => id && id.toString() === productId.toString());
    let action;

    if (index > -1) {
      user.wishlist.splice(index, 1);
      action = 'removed';
    } else {
      user.wishlist.push(productId);
      action = 'added';
    }

    await user.save({ validateBeforeSave: false });

    res.status(200).json({ success: true, action, wishlist: user.wishlist });
  } catch (err) {
    next(err);
  }
};

exports.getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const notifications = await Notification.paginate(
      { user: req.user._id },
      {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: '-createdAt',
      }
    );

    const unreadCount = await Notification.countDocuments({
      user: req.user._id,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      notifications: notifications.docs,
      unreadCount,
      pagination: {
        total: notifications.totalDocs,
        pages: notifications.totalPages,
        page: notifications.page,
        limit: notifications.limit,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.markNotificationRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    res.status(200).json({ success: true, notification });
  } catch (err) {
    next(err);
  }
};

exports.markAllNotificationsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true }
    );

    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
};

exports.getLoyaltyPoints = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('loyaltyPoints');

    res.status(200).json({
      success: true,
      loyaltyPoints: user.loyaltyPoints,
    });
  } catch (err) {
    next(err);
  }
};

exports.getLoyaltyHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 15;

    const user = await User.findById(req.user._id).select('loyaltyHistory loyaltyPoints');
    const history = user.loyaltyHistory || [];
    const sorted = [...history].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const start = (page - 1) * limit;
    const paged = sorted.slice(start, start + limit);

    res.status(200).json({
      success: true,
      history: paged,
      loyaltyPoints: user.loyaltyPoints,
      pagination: {
        total: sorted.length,
        pages: Math.max(1, Math.ceil(sorted.length / limit)),
        page,
        limit,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.redeemLoyaltyPoints = async (req, res, next) => {
  try {
    const { points } = req.body;

    const redeemOptions = { 100: 50, 250: 150, 500: 350, 1000: 750 };

    if (!points || !redeemOptions[points]) {
      throw new AppError('Invalid redemption amount', 400);
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if ((user.loyaltyPoints || 0) < points) {
      throw new AppError('Insufficient loyalty points', 400);
    }

    user.loyaltyPoints -= points;
    user.loyaltyHistory = user.loyaltyHistory || [];
    user.loyaltyHistory.push({
      description: `Redeemed ${points} points for ₹${redeemOptions[points]} off`,
      points: -points,
      type: 'redeemed',
      createdAt: new Date(),
    });
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'Points redeemed successfully',
      loyaltyPoints: user.loyaltyPoints,
      rewardValue: redeemOptions[points],
    });
  } catch (err) {
    next(err);
  }
};

exports.getUserSettings = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('preferences');
    const preferences = user.preferences || {};

    res.status(200).json({
      success: true,
      notifications: preferences.notifications || {},
      language: preferences.language || 'en',
      currency: preferences.currency || 'INR',
    });
  } catch (err) {
    next(err);
  }
};

exports.updateUserSettings = async (req, res, next) => {
  try {
    const { notifications, language, currency } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    user.preferences = user.preferences || {};
    if (notifications) user.preferences.notifications = { ...(user.preferences.notifications || {}), ...notifications };
    if (language) user.preferences.language = language;
    if (currency) user.preferences.currency = currency;

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      notifications: user.preferences.notifications || {},
      language: user.preferences.language || 'en',
      currency: user.preferences.currency || 'INR',
    });
  } catch (err) {
    next(err);
  }
};
