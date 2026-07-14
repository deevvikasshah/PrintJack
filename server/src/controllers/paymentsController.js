const crypto = require('crypto');
const razorpay = require('../config/razorpay');
const { Order, User, Notification } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const { sendEmail } = require('../services/email');

exports.createRazorpayOrder = async (req, res, next) => {
  try {
    const { amount, orderId } = req.body;

    if (!amount || amount <= 0) {
      throw new AppError('Valid amount is required', 400);
    }

    const options = {
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: orderId || `pj_${Date.now()}`,
      notes: {
        orderId: orderId || '',
        userId: req.user._id.toString(),
      },
    };

    const razorpayOrder = await razorpay.orders.create(options);

    res.status(201).json({
      success: true,
      razorpayOrder: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        receipt: razorpayOrder.receipt,
      },
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    next(err);
  }
};

exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new AppError('Missing payment verification parameters', 400);
    }

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
      message: `Payment for order ${order.orderNumber} has been confirmed. Amount: ₹${order.totalAmount}`,
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

exports.handleWebhook = async (req, res, next) => {
  try {
    const webhookSignature = req.headers['x-razorpay-signature'];
    const body = JSON.stringify(req.body);

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (webhookSignature !== expectedSignature) {
      return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
    }

    const event = req.body;
    const eventType = event.event;

    if (eventType === 'payment.captured') {
      const payment = event.payload.payment.entity;
      const orderId = payment.notes?.orderId;

      if (orderId) {
        const order = await Order.findById(orderId);
        if (order && order.paymentStatus !== 'captured') {
          order.paymentStatus = 'captured';
          order.orderStatus = 'confirmed';
          order.razorpayPaymentId = payment.id;
          await order.save({ validateBeforeSave: false });
        }
      }
    }

    if (eventType === 'payment.failed') {
      const payment = event.payload.payment.entity;
      const orderId = payment.notes?.orderId;

      if (orderId) {
        const order = await Order.findById(orderId);
        if (order) {
          order.paymentStatus = 'failed';
          await order.save({ validateBeforeSave: false });

          await Notification.create({
            user: order.user,
            type: 'payment',
            title: 'Payment Failed',
            message: `Payment for order ${order.orderNumber} has failed. Please try again.`,
            data: { orderId: order._id, orderNumber: order.orderNumber },
          });
        }
      }
    }

    if (eventType === 'payment.authorized') {
      const payment = event.payload.payment.entity;
      const orderId = payment.notes?.orderId;

      if (orderId) {
        const order = await Order.findById(orderId);
        if (order) {
          order.razorpayPaymentId = payment.id;
          order.paymentStatus = 'authorized';
          await order.save({ validateBeforeSave: false });
        }
      }
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(200).json({ success: true });
  }
};

exports.refundPayment = async (req, res, next) => {
  try {
    const { orderId, amount, reason } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (order.paymentStatus !== 'captured') {
      throw new AppError('Cannot refund an order with payment status: ' + order.paymentStatus, 400);
    }

    if (!order.razorpayPaymentId) {
      throw new AppError('No Razorpay payment ID found for this order', 400);
    }

    const refundAmount = amount ? Math.round(amount * 100) : Math.round(order.totalAmount * 100);

    const refund = await razorpay.payments.refund(order.razorpayPaymentId, {
      amount: refundAmount,
      notes: {
        reason: reason || 'Refund requested by admin',
        orderId: order._id.toString(),
      },
    });

    order.paymentStatus = 'refunded';
    order.orderStatus = 'returned';
    await order.save();

    await Notification.create({
      user: order.user,
      type: 'payment',
      title: 'Refund Processed',
      message: `A refund of ₹${(refundAmount / 100).toFixed(2)} has been initiated for order ${order.orderNumber}. It may take 5-7 business days to reflect in your account.`,
      data: { orderId: order._id, orderNumber: order.orderNumber, refundId: refund.id },
    });

    const user = await User.findById(order.user);
    if (user && user.email) {
      try {
        await sendEmail({
          to: user.email,
          subject: `PrintJack - Refund Initiated for Order ${order.orderNumber}`,
          html: `<p>Dear ${user.name},</p><p>A refund of <strong>₹${(refundAmount / 100).toFixed(2)}</strong> has been initiated for your order <strong>${order.orderNumber}</strong>.</p><p>${reason ? `Reason: ${reason}</p>` : ''}<p>The refund will be credited to your original payment method within 5-7 business days.</p><p>Thank you for choosing PrintJack!</p>`,
        });
      } catch (e) {
        console.error('Failed to send refund email:', e.message);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Refund initiated successfully',
      refund: {
        id: refund.id,
        amount: refund.amount,
        status: refund.status,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getPaymentHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const orders = await Order.paginate(
      { user: req.user._id, paymentStatus: { $in: ['captured', 'refunded', 'failed'] } },
      {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: '-createdAt',
        select: 'orderNumber totalAmount paymentMethod paymentStatus razorpayPaymentId createdAt',
      }
    );

    res.status(200).json({
      success: true,
      payments: orders.docs,
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
