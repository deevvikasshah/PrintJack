const Razorpay = require("razorpay");
const crypto = require("crypto");

const hasKeys =
  process.env.RAZORPAY_KEY_ID &&
  process.env.RAZORPAY_KEY_ID !== 'your_razorpay_key_id' &&
  process.env.RAZORPAY_KEY_SECRET &&
  process.env.RAZORPAY_KEY_SECRET !== 'your_razorpay_key_secret';

const razorpay = hasKeys
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  : null;

const createOrder = async (amount, currency = "INR", receipt, notes = {}) => {
  try {
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      notes,
    });
    console.log(`Razorpay order created: ${order.id}`);
    return {
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      status: order.status,
    };
  } catch (error) {
    console.error("Razorpay createOrder error:", error.message);
    return { success: false, error: error.message };
  }
};

const verifyPayment = (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
  try {
    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    const isValid = expectedSignature === razorpaySignature;
    if (isValid) {
      console.log(`Payment verified for order ${razorpayOrderId}`);
    } else {
      console.warn(`Payment verification failed for order ${razorpayOrderId}`);
    }
    return { success: isValid, signatureValid: isValid };
  } catch (error) {
    console.error("Razorpay verifyPayment error:", error.message);
    return { success: false, error: error.message };
  }
};

const capturePayment = async (paymentId, amount) => {
  try {
    const captureAmount = amount ? Math.round(amount * 100) : undefined;
    const payment = await razorpay.payments.capture(paymentId, captureAmount);
    console.log(`Payment captured: ${paymentId}`);
    return {
      success: true,
      paymentId: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
    };
  } catch (error) {
    console.error("Razorpay capturePayment error:", error.message);
    return { success: false, error: error.message };
  }
};

const refundPayment = async (paymentId, amount, notes = {}) => {
  try {
    const refundData = {
      payment_id: paymentId,
      notes,
    };
    if (amount !== undefined && amount !== null) {
      refundData.amount = Math.round(amount * 100);
    }
    const refund = await razorpay.payments.refund(paymentId, refundData);
    console.log(`Refund created for payment ${paymentId}: ${refund.id}`);
    return {
      success: true,
      refundId: refund.id,
      paymentId: refund.payment_id,
      amount: refund.amount,
      status: refund.status,
    };
  } catch (error) {
    console.error("Razorpay refundPayment error:", error.message);
    return { success: false, error: error.message };
  }
};

const getPaymentDetails = async (paymentId) => {
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return {
      success: true,
      paymentId: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      method: payment.method,
      description: payment.description,
      createdAt: payment.created_at,
    };
  } catch (error) {
    console.error("Razorpay getPaymentDetails error:", error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  capturePayment,
  refundPayment,
  getPaymentDetails,
};
