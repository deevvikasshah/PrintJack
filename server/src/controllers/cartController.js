const { Cart, Product, Coupon } = require('../models');
const { AppError } = require('../middleware/errorHandler');

const recalcTotal = async (cart) => {
  await cart.populate('items.product');
  cart.totalAmount = cart.items.reduce((sum, item) => {
    return sum + (item.unitPrice * item.quantity);
  }, 0);
};

exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'name slug images basePrice colors sizes isActive',
    }).populate('coupon', 'code discountType discountValue maximumDiscountAmount');

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    cart.items = cart.items.filter((item) => item.product && item.product.isActive);

    res.status(200).json({
      success: true,
      cart: {
        _id: cart._id,
        items: cart.items,
        totalAmount: cart.totalAmount,
        discount: cart.discount,
        coupon: cart.coupon,
        finalAmount: Math.max(0, cart.totalAmount - cart.discount),
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1, size, color, designId, customizations } = req.body;

    if (!productId) {
      throw new AppError('Product ID is required', 400);
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      throw new AppError('Product not found or unavailable', 404);
    }

    let unitPrice = product.basePrice;

    if (size) {
      const sizeOption = product.sizes.find((s) => s.name === size && s.available);
      if (!sizeOption) {
        throw new AppError(`Size "${size}" is not available for this product`, 400);
      }
      unitPrice += sizeOption.additionalPrice;
    }

    if (color) {
      const colorOption = product.colors.find((c) => c.name === color && c.available);
      if (!colorOption) {
        throw new AppError(`Color "${color}" is not available for this product`, 400);
      }
      unitPrice += colorOption.additionalPrice;
    }

    if (quantity < product.minimumOrderQuantity) {
      throw new AppError(`Minimum order quantity is ${product.minimumOrderQuantity}`, 400);
    }

    if (quantity >= product.minimumOrderQuantity && product.bulkPricing && product.bulkPricing.length > 0) {
      const bulkTier = product.bulkPricing
        .filter((b) => quantity >= b.minQty && quantity <= b.maxQty)
        .sort((a, b) => b.minQty - a.minQty)[0];
      if (bulkTier) {
        unitPrice = bulkTier.price;
      }
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const existingIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId &&
        item.size === (size || undefined) &&
        item.color === (color || undefined) &&
        item.design?.toString() === (designId || undefined)
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += quantity;
      cart.items[existingIndex].unitPrice = unitPrice;
      if (customizations) cart.items[existingIndex].customizations = customizations;
    } else {
      cart.items.push({
        product: productId,
        design: designId || undefined,
        quantity,
        size,
        color,
        unitPrice,
        customizations: customizations || null,
      });
    }

    await recalcTotal(cart);
    await cart.save();

    cart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name slug images basePrice colors sizes',
    });

    res.status(200).json({ success: true, cart });
  } catch (err) {
    next(err);
  }
};

exports.updateCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { quantity, size, color } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      throw new AppError('Cart not found', 404);
    }

    const item = cart.items.id(itemId);
    if (!item) {
      throw new AppError('Cart item not found', 404);
    }

    const product = await Product.findById(item.product);
    if (!product || !product.isActive) {
      throw new AppError('Product is no longer available', 400);
    }

    if (quantity !== undefined) {
      if (quantity < 1) {
        throw new AppError('Quantity must be at least 1', 400);
      }
      if (quantity < product.minimumOrderQuantity) {
        throw new AppError(`Minimum order quantity is ${product.minimumOrderQuantity}`, 400);
      }
      item.quantity = quantity;
    }

    if (size !== undefined) item.size = size;
    if (color !== undefined) item.color = color;

    let unitPrice = product.basePrice;
    if (item.size) {
      const sizeOption = product.sizes.find((s) => s.name === item.size && s.available);
      if (sizeOption) unitPrice += sizeOption.additionalPrice;
    }
    if (item.color) {
      const colorOption = product.colors.find((c) => c.name === item.color && c.available);
      if (colorOption) unitPrice += colorOption.additionalPrice;
    }
    if (item.quantity >= product.minimumOrderQuantity && product.bulkPricing && product.bulkPricing.length > 0) {
      const bulkTier = product.bulkPricing
        .filter((b) => item.quantity >= b.minQty && item.quantity <= b.maxQty)
        .sort((a, b) => b.minQty - a.minQty)[0];
      if (bulkTier) unitPrice = bulkTier.price;
    }
    item.unitPrice = unitPrice;

    await recalcTotal(cart);
    await cart.save();

    res.status(200).json({ success: true, cart });
  } catch (err) {
    next(err);
  }
};

exports.removeFromCart = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      throw new AppError('Cart not found', 404);
    }

    const item = cart.items.id(itemId);
    if (!item) {
      throw new AppError('Cart item not found', 404);
    }

    cart.items.pull(itemId);
    await recalcTotal(cart);
    await cart.save();

    res.status(200).json({ success: true, cart });
  } catch (err) {
    next(err);
  }
};

exports.clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      throw new AppError('Cart not found', 404);
    }

    cart.items = [];
    cart.coupon = undefined;
    cart.discount = 0;
    cart.totalAmount = 0;
    await cart.save();

    res.status(200).json({ success: true, message: 'Cart cleared', cart });
  } catch (err) {
    next(err);
  }
};

exports.applyCoupon = async (req, res, next) => {
  try {
    const { code } = req.body;

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
    if (now < coupon.validFrom || now > coupon.validTill) {
      throw new AppError('This coupon has expired or is not yet valid', 400);
    }

    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      throw new AppError('This coupon has reached its usage limit', 400);
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      throw new AppError('Cart is empty', 400);
    }

    if (coupon.minimumOrderAmount > 0 && cart.totalAmount < coupon.minimumOrderAmount) {
      throw new AppError(`Minimum order amount of ₹${coupon.minimumOrderAmount} required for this coupon`, 400);
    }

    let discount = 0;

    if (coupon.applicableProducts && coupon.applicableProducts.length > 0) {
      const applicableItems = cart.items.filter((item) =>
        coupon.applicableProducts.some((pId) => pId.toString() === item.product._id.toString())
      );
      const applicableTotal = applicableItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

      if (coupon.discountType === 'percentage') {
        discount = Math.round(applicableTotal * (coupon.discountValue / 100));
      } else if (coupon.discountType === 'fixed') {
        discount = Math.min(coupon.discountValue, applicableTotal);
      }
    } else if (coupon.applicableCategories && coupon.applicableCategories.length > 0) {
      const applicableItems = cart.items.filter((item) =>
        coupon.applicableCategories.some((cId) => cId.toString() === item.product.category?.toString())
      );
      const applicableTotal = applicableItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

      if (coupon.discountType === 'percentage') {
        discount = Math.round(applicableTotal * (coupon.discountValue / 100));
      } else if (coupon.discountType === 'fixed') {
        discount = Math.min(coupon.discountValue, applicableTotal);
      }
    } else {
      if (coupon.discountType === 'percentage') {
        discount = Math.round(cart.totalAmount * (coupon.discountValue / 100));
      } else if (coupon.discountType === 'fixed') {
        discount = Math.min(coupon.discountValue, cart.totalAmount);
      } else if (coupon.discountType === 'free_shipping') {
        discount = 99;
      }
    }

    if (coupon.maximumDiscountAmount > 0 && discount > coupon.maximumDiscountAmount) {
      discount = coupon.maximumDiscountAmount;
    }

    discount = Math.min(discount, cart.totalAmount);

    cart.coupon = coupon._id;
    cart.discount = discount;
    await cart.save();

    coupon.usedCount += 1;
    await coupon.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'Coupon applied successfully',
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
      discount,
      totalAmount: cart.totalAmount,
      finalAmount: Math.max(0, cart.totalAmount - discount),
    });
  } catch (err) {
    next(err);
  }
};

exports.removeCoupon = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      throw new AppError('Cart not found', 404);
    }

    if (cart.coupon) {
      const coupon = await Coupon.findById(cart.coupon);
      if (coupon) {
        coupon.usedCount = Math.max(0, coupon.usedCount - 1);
        await coupon.save({ validateBeforeSave: false });
      }
    }

    cart.coupon = undefined;
    cart.discount = 0;
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Coupon removed',
      totalAmount: cart.totalAmount,
      finalAmount: cart.totalAmount,
    });
  } catch (err) {
    next(err);
  }
};

exports.getCartCount = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    const count = cart ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0;

    res.status(200).json({ success: true, count });
  } catch (err) {
    next(err);
  }
};
