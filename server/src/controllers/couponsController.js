const { Coupon, User } = require('../models');
const { AppError } = require('../middleware/errorHandler');

exports.getAllCoupons = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', isActive } = req.query;

    const query = {};
    if (search) {
      query.code = { $regex: search.toUpperCase(), $options: 'i' };
    }
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const coupons = await Coupon.paginate(query, {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: '-createdAt',
      populate: [
        { path: 'applicableCategories', select: 'name slug' },
        { path: 'applicableProducts', select: 'name slug' },
      ],
    });

    res.status(200).json({
      success: true,
      coupons: coupons.docs,
      pagination: {
        total: coupons.totalDocs,
        pages: coupons.totalPages,
        page: coupons.page,
        limit: coupons.limit,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id)
      .populate('applicableCategories', 'name slug')
      .populate('applicableProducts', 'name slug');

    if (!coupon) {
      throw new AppError('Coupon not found', 404);
    }

    res.status(200).json({ success: true, coupon });
  } catch (err) {
    next(err);
  }
};

exports.createCoupon = async (req, res, next) => {
  try {
    const {
      code, description, discountType, discountValue,
      minimumOrderAmount, maximumDiscountAmount, usageLimit,
      applicableCategories, applicableProducts,
      validFrom, validTill,
    } = req.body;

    if (!code || !discountType || discountValue === undefined || !validFrom || !validTill) {
      throw new AppError('Code, discount type, discount value, valid from, and valid till are required', 400);
    }

    if (discountType === 'percentage' && discountValue > 100) {
      throw new AppError('Percentage discount cannot exceed 100', 400);
    }

    if (new Date(validFrom) >= new Date(validTill)) {
      throw new AppError('Valid from date must be before valid till date', 400);
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue,
      minimumOrderAmount: minimumOrderAmount || 0,
      maximumDiscountAmount: maximumDiscountAmount || 0,
      usageLimit: usageLimit || 0,
      applicableCategories: applicableCategories || [],
      applicableProducts: applicableProducts || [],
      validFrom,
      validTill,
    });

    res.status(201).json({ success: true, coupon });
  } catch (err) {
    next(err);
  }
};

exports.updateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      throw new AppError('Coupon not found', 404);
    }

    const allowedFields = [
      'code', 'description', 'discountType', 'discountValue',
      'minimumOrderAmount', 'maximumDiscountAmount', 'usageLimit',
      'applicableCategories', 'applicableProducts',
      'isActive', 'validFrom', 'validTill',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        coupon[field] = field === 'code' ? req.body[field].toUpperCase() : req.body[field];
      }
    });

    if (coupon.discountType === 'percentage' && coupon.discountValue > 100) {
      throw new AppError('Percentage discount cannot exceed 100', 400);
    }

    await coupon.save();

    res.status(200).json({ success: true, coupon });
  } catch (err) {
    next(err);
  }
};

exports.deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      throw new AppError('Coupon not found', 404);
    }

    coupon.isActive = false;
    await coupon.save({ validateBeforeSave: false });

    res.status(200).json({ success: true, message: 'Coupon deactivated successfully' });
  } catch (err) {
    next(err);
  }
};

exports.validateCoupon = async (req, res, next) => {
  try {
    const { code, cartAmount, productId, categoryId } = req.body;

    if (!code) {
      throw new AppError('Coupon code is required', 400);
    }

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
    });

    if (!coupon) {
      throw new AppError('Invalid coupon code', 400);
    }

    const now = new Date();
    if (now < coupon.validFrom) {
      throw new AppError('This coupon is not yet valid', 400);
    }

    if (now > coupon.validTill) {
      throw new AppError('This coupon has expired', 400);
    }

    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      throw new AppError('This coupon has reached its usage limit', 400);
    }

    if (coupon.minimumOrderAmount > 0 && (!cartAmount || cartAmount < coupon.minimumOrderAmount)) {
      throw new AppError(`Minimum order amount of ₹${coupon.minimumOrderAmount} required for this coupon`, 400);
    }

    let applicable = true;
    let applicableAmount = cartAmount || 0;

    if (productId && coupon.applicableProducts && coupon.applicableProducts.length > 0) {
      applicable = coupon.applicableProducts.some((pId) => pId.toString() === productId);
      if (!applicable) {
        throw new AppError('This coupon is not applicable to the selected product', 400);
      }
    }

    if (categoryId && coupon.applicableCategories && coupon.applicableCategories.length > 0) {
      applicable = coupon.applicableCategories.some((cId) => cId.toString() === categoryId);
      if (!applicable) {
        throw new AppError('This coupon is not applicable to the selected category', 400);
      }
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = Math.round(applicableAmount * (coupon.discountValue / 100));
    } else if (coupon.discountType === 'fixed') {
      discount = Math.min(coupon.discountValue, applicableAmount);
    } else if (coupon.discountType === 'free_shipping') {
      discount = 99;
    }

    if (coupon.maximumDiscountAmount > 0 && discount > coupon.maximumDiscountAmount) {
      discount = coupon.maximumDiscountAmount;
    }

    res.status(200).json({
      success: true,
      valid: true,
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discount,
        maximumDiscountAmount: coupon.maximumDiscountAmount,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getMyCoupons = async (req, res, next) => {
  try {
    const now = new Date();

    const coupons = await Coupon.find({
      isActive: true,
      validFrom: { $lte: now },
      validTill: { $gte: now },
      $or: [
        { usageLimit: 0 },
        { $expr: { $lt: ['$usedCount', '$usageLimit'] } },
      ],
    }).sort('-createdAt');

    res.status(200).json({ success: true, coupons });
  } catch (err) {
    next(err);
  }
};
