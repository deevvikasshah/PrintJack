const { Order, Cart, Product, User, Notification } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const { sendEmail } = require('../services/email');
const { sendSMS } = require('../services/sms');
let razorpayService;
try { razorpayService = require('../services/razorpay'); } catch { razorpayService = null; }

exports.checkoutFromCart = async (req, res, next) => {
  try {
    const { shippingAddressId, paymentMethod, shippingMethod, couponCode } = req.body;

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      throw new AppError('Cart is empty', 400);
    }

    let shippingAddress = null;
    if (shippingAddressId) {
      const user = await User.findById(req.user._id);
      shippingAddress = user.addresses.id(shippingAddressId);
      if (!shippingAddress) {
        throw new AppError('Shipping address not found', 400);
      }
      shippingAddress = {
        fullName: shippingAddress.fullName,
        phone: shippingAddress.phone,
        street: shippingAddress.street,
        city: shippingAddress.city,
        state: shippingAddress.state,
        pincode: shippingAddress.pincode,
        country: shippingAddress.country || 'India',
      };
    } else {
      throw new AppError('Shipping address is required', 400);
    }

    let subtotal = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const product = item.product;
      if (!product || !product.isActive) {
        throw new AppError(`Product "${product?.name || 'Unknown'}" is no longer available`, 400);
      }

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
        if (bulkTier) {
          unitPrice = bulkTier.price;
        }
      }

      const totalPrice = unitPrice * item.quantity;
      subtotal += totalPrice;

      orderItems.push({
        product: product._id,
        design: item.design || undefined,
        name: product.name,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        unitPrice,
        totalPrice,
        customizationPreview: item.customizations?.preview || '',
      });
    }

    const isExpress = shippingMethod === 'express';
    const shippingCost = isExpress ? 149 : (subtotal >= 999 ? 0 : 99);
    const taxRate = 0.18;
    const tax = Math.round(subtotal * taxRate);
    const discount = cart.discount || 0;
    const totalAmount = subtotal + shippingCost + tax - discount;

    if (paymentMethod === 'cod') {
      const order = await Order.create({
        user: req.user._id,
        items: orderItems,
        shippingAddress,
        subtotal,
        shippingCost,
        tax,
        discount,
        totalAmount,
        paymentMethod: 'cod',
        paymentStatus: 'pending',
        orderStatus: 'pending',
      });

      for (const item of orderItems) {
        await Product.findByIdAndUpdate(item.product, { $inc: { totalSold: item.quantity } });
      }

      cart.items = [];
      cart.coupon = undefined;
      cart.discount = 0;
      await cart.save();

      await Notification.create({
        user: req.user._id,
        type: 'order_status',
        title: 'Order Placed',
        message: `Your order ${order.orderNumber} has been placed successfully (COD).`,
        data: { orderId: order._id, orderNumber: order.orderNumber },
      });

      return res.status(201).json({ success: true, order });
    }

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      subtotal,
      shippingCost,
      tax,
      discount,
      totalAmount,
      paymentMethod: 'razorpay',
      paymentStatus: 'pending',
      orderStatus: 'pending',
    });

    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, { $inc: { totalSold: item.quantity } });
    }

    if (razorpayService) {
      try {
        const razorpayOrder = await razorpayService.createOrder(
          totalAmount,
          'INR',
          order._id.toString(),
          { orderId: order._id.toString(), userId: req.user._id.toString() }
        );
        order.razorpayOrderId = razorpayOrder.orderId;
      } catch (e) {
        console.error('Razorpay order creation failed:', e.message);
        throw new AppError('Payment gateway error. Please try again.', 500);
      }
    }

    await order.save({ validateBeforeSave: false });

    cart.items = [];
    cart.coupon = undefined;
    cart.discount = 0;
    await cart.save();

    res.status(201).json({
      success: true,
      _id: order._id,
      orderNumber: order.orderNumber,
      razorpayOrderId: order.razorpayOrderId || null,
      amount: order.totalAmount * 100,
      currency: 'INR',
      key: process.env.RAZORPAY_KEY_ID,
      items: orderItems,
      totalAmount,
      subtotal,
      shippingCost,
      tax,
      discount,
    });
  } catch (err) {
    next(err);
  }
};

exports.verifyPaymentFromCheckout = async (req, res, next) => {
  try {
    const { orderId, razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    if (!orderId || !razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      throw new AppError('Missing payment verification parameters', 400);
    }

    const crypto = require('crypto');
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      throw new AppError('Payment verification failed: Invalid signature', 400);
    }

    const order = await Order.findById(orderId);
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    order.razorpayOrderId = razorpay_order_id;
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    order.paymentStatus = 'captured';
    order.orderStatus = 'confirmed';
    await order.save();

    await Notification.create({
      user: order.user,
      type: 'payment',
      title: 'Payment Confirmed',
      message: `Payment for order ${order.orderNumber} has been confirmed.`,
      data: { orderId: order._id, orderNumber: order.orderNumber, paymentId: razorpay_payment_id },
    });

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      orderId: order._id,
      orderNumber: order.orderNumber,
    });
  } catch (err) {
    next(err);
  }
};

exports.createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, billingAddress, paymentMethod, specialInstructions, couponId, couponDiscount } = req.body;

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.pincode) {
      throw new AppError('Complete shipping address is required', 400);
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      throw new AppError('Cart is empty', 400);
    }

    let subtotal = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const product = await Product.findById(item.product._id || item.product);
      if (!product || !product.isActive) {
        throw new AppError(`Product "${item.product.name || item.product}" is no longer available`, 400);
      }

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
        if (bulkTier) {
          unitPrice = bulkTier.price;
        }
      }

      const totalPrice = unitPrice * item.quantity;
      subtotal += totalPrice;

      orderItems.push({
        product: product._id,
        design: item.design || undefined,
        name: product.name,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        unitPrice,
        totalPrice,
        customizationPreview: item.customizations?.preview || '',
      });
    }

    const shippingCost = subtotal >= 999 ? 0 : 99;
    const taxRate = 0.18;
    const tax = Math.round(subtotal * taxRate);
    const discount = couponDiscount || 0;
    const totalAmount = subtotal + shippingCost + tax - discount;

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      subtotal,
      shippingCost,
      tax,
      discount,
      totalAmount,
      paymentMethod: paymentMethod || 'razorpay',
      specialInstructions,
      orderStatus: 'pending',
    });

    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, { $inc: { totalSold: item.quantity } });
    }

    cart.items = [];
    cart.coupon = undefined;
    cart.discount = 0;
    await cart.save();

    await Notification.create({
      user: req.user._id,
      type: 'order_status',
      title: 'Order Placed',
      message: `Your order ${order.orderNumber} has been placed successfully.`,
      data: { orderId: order._id, orderNumber: order.orderNumber },
    });

    res.status(201).json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

exports.getMyOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const query = { user: req.user._id };
    if (status) query.orderStatus = status;

    const orders = await Order.paginate(query, {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: '-createdAt',
    });

    res.status(200).json({
      success: true,
      orders: orders.docs,
      pagination: {
        total: orders.totalDocs,
        pages: orders.totalPages,
        page: orders.page,
        limit: orders.limit,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name slug images')
      .populate('items.design', 'name previewImage')
      .populate('user', 'name email phone');

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (req.user.role === 'customer' && order.user._id.toString() !== req.user._id.toString()) {
      throw new AppError('Not authorized to view this order', 403);
    }

    res.status(200).json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

exports.getAllOrders = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      paymentStatus,
      startDate,
      endDate,
      search,
      sort = '-createdAt',
    } = req.query;

    const query = {};
    if (status) query.orderStatus = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate + 'T23:59:59.999Z');
    }

    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'shippingAddress.fullName': { $regex: search, $options: 'i' } },
      ];
    }

    const orders = await Order.paginate(query, {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort,
      populate: [
        { path: 'user', select: 'name email phone' },
        { path: 'items.product', select: 'name slug' },
      ],
    });

    res.status(200).json({
      success: true,
      orders: orders.docs,
      pagination: {
        total: orders.totalDocs,
        pages: orders.totalPages,
        page: orders.page,
        limit: orders.limit,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note, trackingNumber, shippingPartner, estimatedDelivery } = req.body;

    const validStatuses = ['pending', 'confirmed', 'in_production', 'quality_check', 'shipped', 'delivered', 'cancelled', 'returned'];
    if (!validStatuses.includes(status)) {
      throw new AppError('Invalid order status', 400);
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    order.orderStatus = status;
    if (note) {
      order.statusHistory.push({ status, date: new Date(), note });
    }

    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (shippingPartner) order.shippingPartner = shippingPartner;
    if (estimatedDelivery) order.estimatedDelivery = new Date(estimatedDelivery);
    if (status === 'delivered') order.deliveredAt = new Date();

    await order.save();

    const statusMessages = {
      confirmed: 'has been confirmed',
      in_production: 'is now in production',
      quality_check: 'is undergoing quality check',
      shipped: 'has been shipped',
      delivered: 'has been delivered',
      cancelled: 'has been cancelled',
      returned: 'has been returned',
    };

    await Notification.create({
      user: order.user,
      type: 'order_status',
      title: `Order ${status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}`,
      message: `Your order ${order.orderNumber} ${statusMessages[status] || 'has been updated'}.`,
      data: { orderId: order._id, orderNumber: order.orderNumber, status },
    });

    const user = await User.findById(order.user);
    if (user && user.email) {
      try {
        await sendEmail({
          to: user.email,
          subject: `PrintJack - Order ${order.orderNumber} ${status.replace('_', ' ').toUpperCase()}`,
          html: `<p>Dear ${user.name},</p><p>Your order <strong>${order.orderNumber}</strong> ${statusMessages[status] || 'has been updated'}.</p>${trackingNumber ? `<p>Tracking Number: <strong>${trackingNumber}</strong></p>` : ''}${shippingPartner ? `<p>Shipping Partner: <strong>${shippingPartner}</strong></p>` : ''}<p>Thank you for choosing PrintJack!</p>`,
        });
      } catch (e) {
        console.error('Failed to send order status email:', e.message);
      }
    }

    if (user && user.phone && (status === 'shipped' || status === 'delivered')) {
      try {
        await sendSMS({
          to: user.phone,
          message: `PrintJack: Your order ${order.orderNumber} ${statusMessages[status] || 'has been updated'}. ${trackingNumber ? `Tracking: ${trackingNumber}` : ''}`,
        });
      } catch (e) {
        console.error('Failed to send order status SMS:', e.message);
      }
    }

    res.status(200).json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

exports.approveDesign = async (req, res, next) => {
  try {
    const { orderItemId, approved, adminNotes, printFile } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    const item = order.items.id(orderItemId);
    if (!item) {
      throw new AppError('Order item not found', 404);
    }

    if (approved) {
      if (printFile) item.printFile = printFile;
      if (adminNotes) {
        order.notes = (order.notes ? order.notes + '\n' : '') + `Design approved: ${adminNotes}`;
      }
    } else {
      if (adminNotes) {
        order.notes = (order.notes ? order.notes + '\n' : '') + `Design rejected: ${adminNotes}`;
      }
    }

    await order.save();

    await Notification.create({
      user: order.user,
      type: 'design_update',
      title: approved ? 'Design Approved' : 'Design Rejected',
      message: approved
        ? `Your design for "${item.name}" in order ${order.orderNumber} has been approved.`
        : `Your design for "${item.name}" in order ${order.orderNumber} has been rejected. ${adminNotes || ''}`,
      data: { orderId: order._id, orderNumber: order.orderNumber, orderItemId, approved },
    });

    res.status(200).json({ success: true, message: approved ? 'Design approved' : 'Design rejected', order });
  } catch (err) {
    next(err);
  }
};

exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (order.user.toString() !== req.user._id.toString()) {
      throw new AppError('Not authorized to cancel this order', 403);
    }

    if (!['pending', 'confirmed'].includes(order.orderStatus)) {
      throw new AppError(`Cannot cancel order with status "${order.orderStatus}". Only pending or confirmed orders can be cancelled.`, 400);
    }

    order.orderStatus = 'cancelled';
    await order.save();

    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { totalSold: -item.quantity } });
    }

    await Notification.create({
      user: order.user,
      type: 'order_status',
      title: 'Order Cancelled',
      message: `Your order ${order.orderNumber} has been cancelled.`,
      data: { orderId: order._id, orderNumber: order.orderNumber },
    });

    res.status(200).json({ success: true, message: 'Order cancelled successfully', order });
  } catch (err) {
    next(err);
  }
};

exports.getOrderStats = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [totalOrders, todayOrders, weekOrders, monthOrders, yearOrders] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: startOfDay } }),
      Order.countDocuments({ createdAt: { $gte: startOfWeek } }),
      Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Order.countDocuments({ createdAt: { $gte: startOfYear } }),
    ]);

    const [totalRevenue, todayRevenue, weekRevenue, monthRevenue, yearRevenue] = await Promise.all([
      Order.aggregate([
        { $match: { paymentStatus: 'captured' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Order.aggregate([
        { $match: { paymentStatus: 'captured', createdAt: { $gte: startOfDay } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Order.aggregate([
        { $match: { paymentStatus: 'captured', createdAt: { $gte: startOfWeek } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Order.aggregate([
        { $match: { paymentStatus: 'captured', createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Order.aggregate([
        { $match: { paymentStatus: 'captured', createdAt: { $gte: startOfYear } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
    ]);

    const pendingApprovals = await Order.countDocuments({
      'items.printFile': '',
      orderStatus: { $in: ['pending', 'confirmed'] },
    });

    const pendingOrders = await Order.countDocuments({ orderStatus: 'pending' });

    res.status(200).json({
      success: true,
      stats: {
        totalOrders,
        todayOrders,
        weekOrders,
        monthOrders,
        yearOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        todayRevenue: todayRevenue[0]?.total || 0,
        weekRevenue: weekRevenue[0]?.total || 0,
        monthRevenue: monthRevenue[0]?.total || 0,
        yearRevenue: yearRevenue[0]?.total || 0,
        pendingApprovals,
        pendingOrders,
      },
    });
  } catch (err) {
    next(err);
  }
};
