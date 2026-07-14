const twilio = require("twilio");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

let client = null;

const getClient = () => {
  if (!client && accountSid && authToken) {
    client = twilio(accountSid, authToken);
  }
  return client;
};

const sendSMS = async ({ to, body }) => {
  const twilioClient = getClient();
  if (!twilioClient) {
    console.warn("Twilio client not configured. SMS not sent.");
    console.log(`[SMS Fallback] To: ${to}\nBody: ${body}`);
    return { success: false, error: "Twilio not configured" };
  }

  try {
    const message = await twilioClient.messages.create({
      body,
      from: fromNumber,
      to,
    });
    console.log(`SMS sent to ${to}: ${message.sid}`);
    return { success: true, sid: message.sid };
  } catch (error) {
    console.error(`SMS failed to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};

const sendOTP_SMS = async (phone, otp) => {
  const body = `Your PrintJack verification code is: ${otp}. This OTP is valid for 10 minutes. Do not share this code with anyone.`;
  return sendSMS({ to: phone, body });
};

const sendOrderUpdate_SMS = async (phone, order) => {
  const statusMessages = {
    confirmed: "has been confirmed",
    processing: "is being processed",
    printing: "is now being printed",
    quality_check: "is undergoing quality check",
    packed: "has been packed and is ready for dispatch",
    shipped: "has been shipped",
    out_for_delivery: "is out for delivery today",
    delivered: "has been delivered",
    cancelled: "has been cancelled",
    returned: "return has been processed",
  };

  const currentStatus = order.status || order.orderStatus || "processing";
  const statusText = statusMessages[currentStatus] || "has been updated";

  const body = `PrintJack: Your order #${order.orderNumber} ${statusText}.${order.trackingNumber ? ` Tracking: ${order.trackingNumber}` : ""} Track at printjack.in/orders`;
  return sendSMS({ to: phone, body });
};

module.exports = {
  sendSMS,
  sendOTP_SMS,
  sendOrderUpdate_SMS,
};
