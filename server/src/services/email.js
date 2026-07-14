const nodemailer = require("nodemailer");

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

const branding = {
  primary: "#E63946",
  secondary: "#1D3557",
  light: "#F1FAEE",
  white: "#FFFFFF",
  text: "#333333",
  textLight: "#666666",
  border: "#E0E0E0",
  logoText: "PrintJack",
  tagline: "Premium Custom Printing Solutions",
  website: process.env.FRONTEND_URL || "https://printjack.in",
  supportEmail: process.env.SUPPORT_EMAIL || "support@printjack.in",
  phone: process.env.SUPPORT_PHONE || "+91 98765 43210",
};

const baseTemplate = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <style>
    body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F5F5F5; color: ${branding.text}; }
    .wrapper { max-width: 600px; margin: 0 auto; background-color: ${branding.white}; }
    .header { background-color: ${branding.secondary}; padding: 24px 32px; text-align: center; }
    .header h1 { margin: 0; color: ${branding.white}; font-size: 28px; font-weight: 700; letter-spacing: 1px; }
    .header p { margin: 4px 0 0; color: ${branding.light}; font-size: 13px; letter-spacing: 0.5px; }
    .content { padding: 32px; line-height: 1.6; }
    .content h2 { color: ${branding.secondary}; margin-top: 0; font-size: 22px; }
    .content p { font-size: 15px; color: ${branding.textLight}; }
    .btn { display: inline-block; padding: 14px 32px; background-color: ${branding.primary}; color: ${branding.white} !important; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px; margin: 16px 0; }
    .btn-secondary { background-color: ${branding.secondary}; }
    .divider { border: none; border-top: 1px solid ${branding.border}; margin: 24px 0; }
    .info-box { background-color: #F8F9FA; border-left: 4px solid ${branding.primary}; padding: 16px 20px; margin: 16px 0; border-radius: 0 6px 6px 0; }
    .info-box-blue { border-left-color: ${branding.secondary}; }
    .footer { background-color: #2B2D42; padding: 24px 32px; text-align: center; }
    .footer p { margin: 4px 0; font-size: 13px; color: #999999; }
    .footer a { color: ${branding.primary}; text-decoration: none; }
    .footer .social-links { margin: 12px 0; }
    .footer .social-links a { display: inline-block; margin: 0 8px; color: ${branding.white}; text-decoration: none; font-size: 13px; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th { background-color: ${branding.secondary}; color: ${branding.white}; padding: 10px 12px; text-align: left; font-size: 13px; font-weight: 600; }
    td { padding: 10px 12px; border-bottom: 1px solid ${branding.border}; font-size: 14px; }
    tr:last-child td { border-bottom: none; }
    .text-primary { color: ${branding.primary}; }
    .text-center { text-align: center; }
    .mt-16 { margin-top: 16px; }
    .mb-16 { margin-bottom: 16px; }
    .otp-box { text-align: center; padding: 24px; margin: 20px 0; background: linear-gradient(135deg, ${branding.secondary}, #2B4C7E); border-radius: 10px; }
    .otp-code { font-size: 36px; font-weight: 700; letter-spacing: 8px; color: ${branding.white}; font-family: 'Courier New', monospace; }
    .otp-label { color: #B0C4DE; font-size: 12px; margin-top: 8px; text-transform: uppercase; letter-spacing: 2px; }
    .status-badge { display: inline-block; padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: 600; }
    .status-approved { background-color: #D4EDDA; color: #155724; }
    .status-rejected { background-color: #F8D7DA; color: #721C24; }
    .status-pending { background-color: #FFF3CD; color: #856404; }
    .coupon-card { background: linear-gradient(135deg, ${branding.primary}, #C62828); border-radius: 10px; padding: 24px; text-align: center; margin: 20px 0; color: ${branding.white}; }
    .coupon-code { font-size: 24px; font-weight: 700; letter-spacing: 4px; border: 2px dashed ${branding.white}; padding: 10px 20px; display: inline-block; margin: 12px 0; border-radius: 6px; }
    .coupon-discount { font-size: 32px; font-weight: 700; }
    .coupon-desc { font-size: 14px; opacity: 0.9; margin-top: 4px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>${branding.logoText}</h1>
      <p>${branding.tagline}</p>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ${branding.logoText}. All rights reserved.</p>
      <p>${branding.tagline}</p>
      <div class="social-links" style="margin-top: 12px;">
        <a href="${branding.website}">Website</a> |
        <a href="mailto:${branding.supportEmail}">Support</a> |
        <a href="tel:${branding.phone}">Call Us</a>
      </div>
      <p style="font-size: 11px; margin-top: 12px;">
        This email was sent to you because of your activity on ${branding.logoText}.<br>
        If you didn't expect this email, please ignore it or contact our support team.
      </p>
    </div>
  </div>
</body>
</html>`;

const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = createTransporter();
  const mailOptions = {
    from: `"${branding.logoText}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to,
    subject,
    html: html || text,
    text: text || undefined,
  };
  const info = await transporter.sendMail(mailOptions);
  console.log(`Email sent to ${to}: ${info.messageId}`);
  return info;
};

const sendWelcomeEmail = async (user) => {
  const content = `
    <h2>Welcome to ${branding.logoText}, ${user.name}! 🎉</h2>
    <p>We're thrilled to have you on board. You've just unlocked a world of premium custom printing services — from t-shirts and mugs to business cards and banners.</p>
    <div class="info-box info-box-blue">
      <strong>Your Account Details</strong><br>
      <span style="font-size: 14px; color: ${branding.textLight};">
        Name: ${user.name}<br>
        Email: ${user.email}<br>
        ${user.phone ? `Phone: ${user.phone}` : ""}
      </span>
    </div>
    <p>Here's what you can do with ${branding.logoText}:</p>
    <ul style="color: ${branding.textLight}; font-size: 14px; line-height: 2;">
      <li>Browse thousands of customizable products</li>
      <li>Upload your own designs or use our design tools</li>
      <li>Enjoy bulk pricing and exclusive discounts</li>
      <li>Track your orders in real-time</li>
      <li>Earn rewards with our referral program</li>
    </ul>
    <div class="text-center">
      <a href="${branding.website}/products" class="btn">Start Shopping</a>
    </div>
    <hr class="divider">
    <p style="font-size: 13px; color: #999;">
      Need help getting started? Our support team is here for you at
      <a href="mailto:${branding.supportEmail}">${branding.supportEmail}</a> or
      call us at <a href="tel:${branding.phone}">${branding.phone}</a>.
    </p>`;

  return sendEmail({
    to: user.email,
    subject: `Welcome to ${branding.logoText}! 🎉 Your Printing Journey Begins`,
    html: baseTemplate(content),
  });
};

const sendOTPEmail = async (user, otp) => {
  const content = `
    <h2>Verify Your Email</h2>
    <p>Hi ${user.name},</p>
    <p>Please use the following One-Time Password (OTP) to verify your email address. This code is valid for <strong>10 minutes</strong>.</p>
    <div class="otp-box">
      <div class="otp-code">${otp}</div>
      <div class="otp-label">Your OTP Code</div>
    </div>
    <div class="info-box">
      <strong>⚠️ Security Reminder</strong><br>
      <span style="font-size: 13px; color: ${branding.textLight};">
        Never share this OTP with anyone. ${branding.logoText} will never ask for your OTP via phone or email.
        If you didn't request this verification, please ignore this email.
      </span>
    </div>`;

  return sendEmail({
    to: user.email,
    subject: `Your ${branding.logoText} Verification Code: ${otp}`,
    html: baseTemplate(content),
  });
};

const sendPasswordResetEmail = async (user, resetUrl) => {
  const content = `
    <h2>Password Reset Request</h2>
    <p>Hi ${user.name},</p>
    <p>We received a request to reset the password for your ${branding.logoText} account associated with <strong>${user.email}</strong>.</p>
    <p>Click the button below to reset your password. This link is valid for <strong>1 hour</strong>.</p>
    <div class="text-center">
      <a href="${resetUrl}" class="btn">Reset Password</a>
    </div>
    <div class="info-box">
      <strong>⚠️ Didn't request this?</strong><br>
      <span style="font-size: 13px; color: ${branding.textLight};">
        If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
        For security, we recommend changing your password if you suspect unauthorized access to your account.
      </span>
    </div>
    <p style="font-size: 13px; color: #999; margin-top: 24px;">
      If the button doesn't work, copy and paste this URL into your browser:<br>
      <a href="${resetUrl}" style="color: ${branding.primary}; word-break: break-all;">${resetUrl}</a>
    </p>`;

  return sendEmail({
    to: user.email,
    subject: `${branding.logoText} — Reset Your Password`,
    html: baseTemplate(content),
  });
};

const sendOrderConfirmation = async (order, user) => {
  const itemRows = order.items
    .map(
      (item) => `
    <tr>
      <td>${item.product?.name || item.name || "Product"}</td>
      <td style="text-align: center;">${item.quantity}</td>
      <td style="text-align: right;">${formatCurrency(item.price)}</td>
      <td style="text-align: right;">${formatCurrency(item.quantity * item.price)}</td>
    </tr>`
    )
    .join("");

  const content = `
    <h2>Order Confirmed! 📦</h2>
    <p>Hi ${user.name},</p>
    <p>Thank you for your order with ${branding.logoText}. We've received your order and are getting it ready.</p>
    <div class="info-box info-box-blue">
      <strong>Order #${order.orderNumber}</strong><br>
      <span style="font-size: 13px; color: ${branding.textLight};">
        Placed on: ${formatDate(order.createdAt || new Date())}<br>
        ${order.estimatedDelivery ? `Estimated Delivery: ${formatDate(order.estimatedDelivery)}` : ""}
      </span>
    </div>
    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Price</th>
          <th style="text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
      </tbody>
    </table>
    <table style="margin-top: 8px;">
      <tbody>
        <tr>
          <td><strong>Subtotal</strong></td>
          <td style="text-align: right;">${formatCurrency(order.subtotal || 0)}</td>
        </tr>
        ${order.discount ? `<tr><td>Discount</td><td style="text-align: right; color: #28a745;">-${formatCurrency(order.discount)}</td></tr>` : ""}
        ${order.shippingCharge !== undefined ? `<tr><td>Shipping</td><td style="text-align: right;">${order.shippingCharge === 0 ? "FREE" : formatCurrency(order.shippingCharge)}</td></tr>` : ""}
        ${order.gst ? `<tr><td>GST (${order.gstRate || 18}%)</td><td style="text-align: right;">${formatCurrency(order.gst)}</td></tr>` : ""}
        <tr style="background-color: ${branding.light};">
          <td><strong style="font-size: 16px;">Total</strong></td>
          <td style="text-align: right;"><strong style="font-size: 16px; color: ${branding.primary};">${formatCurrency(order.totalAmount)}</strong></td>
        </tr>
      </tbody>
    </table>
    ${
      order.shippingAddress
        ? `
    <div class="info-box mt-16">
      <strong>Shipping Address</strong><br>
      <span style="font-size: 13px; color: ${branding.textLight};">
        ${order.shippingAddress.name || user.name}<br>
        ${order.shippingAddress.street || ""}<br>
        ${order.shippingAddress.city || ""}, ${order.shippingAddress.state || ""} - ${order.shippingAddress.pincode || ""}
        ${order.shippingAddress.phone ? `<br>Phone: ${order.shippingAddress.phone}` : ""}
      </span>
    </div>`
        : ""
    }
    <div class="text-center mt-16">
      <a href="${branding.website}/orders/${order._id || order.orderNumber}" class="btn">Track Order</a>
    </div>`;

  return sendEmail({
    to: user.email,
    subject: `Order Confirmed — #${order.orderNumber} | ${branding.logoText}`,
    html: baseTemplate(content),
  });
};

const sendOrderStatusUpdate = async (order, user) => {
  const statusMessages = {
    confirmed: "Your order has been confirmed and is being processed.",
    processing: "Your order is currently being processed. Our team is working on it!",
    printing: "Great news! Your order is now being printed.",
    quality_check: "Your order is undergoing quality inspection to ensure the best standards.",
    packed: "Your order has been packed and is ready for dispatch.",
    shipped: "Your order has been shipped! It's on its way to you.",
    out_for_delivery: "Your order is out for delivery today. Please keep your phone handy.",
    delivered: "Your order has been delivered. We hope you love it!",
    cancelled: "Your order has been cancelled.",
    returned: "Your return request has been processed.",
  };

  const currentStatus = order.status || order.orderStatus || "processing";
  const statusMessage = statusMessages[currentStatus] || "Your order status has been updated.";
  const statusLabels = {
    confirmed: "Confirmed",
    processing: "Processing",
    printing: "Printing",
    quality_check: "Quality Check",
    packed: "Packed",
    shipped: "Shipped",
    out_for_delivery: "Out for Delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
    returned: "Returned",
  };

  const content = `
    <h2>Order Status Update</h2>
    <p>Hi ${user.name},</p>
    <p>${statusMessage}</p>
    <div class="text-center mt-16 mb-16">
      <span class="status-badge status-${currentStatus === "cancelled" ? "rejected" : currentStatus === "delivered" ? "approved" : "pending"}" style="font-size: 15px; padding: 8px 24px;">
        ${statusLabels[currentStatus] || currentStatus}
      </span>
    </div>
    <div class="info-box info-box-blue">
      <strong>Order #${order.orderNumber}</strong><br>
      <span style="font-size: 13px; color: ${branding.textLight};">
        Status: ${statusLabels[currentStatus] || currentStatus}<br>
        ${order.trackingNumber ? `Tracking: ${order.trackingNumber}<br>` : ""}
        ${order.estimatedDelivery ? `Estimated Delivery: ${formatDate(order.estimatedDelivery)}` : ""}
      </span>
    </div>
    ${
      currentStatus === "shipped" && order.trackingUrl
        ? `<div class="text-center mt-16"><a href="${order.trackingUrl}" class="btn">Track Shipment</a></div>`
        : ""
    }
    <div class="text-center mt-16">
      <a href="${branding.website}/orders/${order._id || order.orderNumber}" class="btn btn-secondary">View Order Details</a>
    </div>`;

  return sendEmail({
    to: user.email,
    subject: `Order #${order.orderNumber} — ${statusLabels[currentStatus] || "Status Updated"} | ${branding.logoText}`,
    html: baseTemplate(content),
  });
};

const sendDesignApproval = async (design, user, status, notes) => {
  const isApproved = status === "approved";
  const content = `
    <h2>Design ${isApproved ? "Approved ✅" : "Needs Revision ❌"}</h2>
    <p>Hi ${user.name},</p>
    <p>Your design for <strong>${design.productName || "your product"}</strong> has been <strong>${isApproved ? "approved" : "rejected"}</strong> by our review team.</p>
    <div class="text-center mt-16 mb-16">
      <span class="status-badge ${isApproved ? "status-approved" : "status-rejected"}" style="font-size: 15px; padding: 8px 24px;">
        ${isApproved ? "Approved" : "Needs Revision"}
      </span>
    </div>
    ${
      design.thumbnailUrl || design.fileUrl
        ? `<div class="text-center mb-16"><img src="${design.thumbnailUrl || design.fileUrl}" alt="Design" style="max-width: 100%; border-radius: 8px; border: 1px solid ${branding.border};"></div>`
        : ""
    }
    <div class="info-box ${isApproved ? "info-box-blue" : ""}">
      <strong>${isApproved ? "Design Details" : "Feedback"}</strong><br>
      <span style="font-size: 13px; color: ${branding.textLight};">
        ${design.productName ? `Product: ${design.productName}<br>` : ""}
        ${design.dimensions ? `Dimensions: ${design.dimensions}<br>` : ""}
        ${notes ? `Notes: ${notes}` : "No additional notes."}
      </span>
    </div>
    ${
      !isApproved
        ? `
    <div class="mt-16">
      <p style="font-size: 14px; color: ${branding.textLight};">Please review the feedback above and upload a revised design. Our team will re-evaluate your updated design within 24 hours.</p>
      <div class="text-center">
        <a href="${branding.website}/designs/${design._id || ""}/upload" class="btn">Upload Revised Design</a>
      </div>
    </div>`
        : `
    <div class="mt-16">
      <p style="font-size: 14px; color: ${branding.textLight};">Your design will now proceed to production. We'll notify you once your order is being printed.</p>
      <div class="text-center">
        <a href="${branding.website}/orders" class="btn">View Order</a>
      </div>
    </div>`
    }`;

  return sendEmail({
    to: user.email,
    subject: `Design ${isApproved ? "Approved" : "Needs Revision"} — ${design.productName || "Your Design"} | ${branding.logoText}`,
    html: baseTemplate(content),
  });
};

const sendCouponEmail = async (user, coupon) => {
  const discountDisplay =
    coupon.discountType === "percentage"
      ? `${coupon.discountValue}% OFF`
      : `${formatCurrency(coupon.discountValue)} OFF`;

  const content = `
    <h2>Special Offer Just for You! 🎁</h2>
    <p>Hi ${user.name},</p>
    <p>As a valued ${branding.logoText} customer, we have an exclusive discount just for you!</p>
    <div class="coupon-card">
      <div class="coupon-discount">${discountDisplay}</div>
      <div class="coupon-desc">${coupon.description || "Use this code on your next order"}</div>
      <div class="coupon-code">${coupon.code}</div>
      <p style="font-size: 13px; opacity: 0.8; margin-bottom: 0;">
        ${coupon.minOrderAmount ? `Minimum order: ${formatCurrency(coupon.minOrderAmount)}` : "No minimum order"}
        ${coupon.maxDiscount ? ` | Max discount: ${formatCurrency(coupon.maxDiscount)}` : ""}
      </p>
    </div>
    <div class="info-box info-box-blue">
      <strong>Coupon Details</strong><br>
      <span style="font-size: 13px; color: ${branding.textLight};">
        Code: <strong>${coupon.code}</strong><br>
        ${coupon.validTill ? `Valid until: ${formatDate(coupon.validTill)}` : "Limited time offer"}
        ${coupon.maxUses ? `<br>Usage limit: ${coupon.maxUses} time${coupon.maxUses > 1 ? "s" : ""}` : ""}
        ${coupon.applicableCategories?.length ? `<br>Applicable on: ${coupon.applicableCategories.join(", ")}` : ""}
      </span>
    </div>
    <div class="text-center mt-16">
      <a href="${branding.website}/products?coupon=${coupon.code}" class="btn">Shop Now</a>
    </div>
    <p style="font-size: 13px; color: #999; text-align: center; margin-top: 16px;">
      Add items to your cart and apply code <strong>${coupon.code}</strong> at checkout to avail the discount.
    </p>`;

  return sendEmail({
    to: user.email,
    subject: `Exclusive ${discountDisplay} Coupon for You! | ${branding.logoText}`,
    html: baseTemplate(content),
  });
};

function formatCurrency(amount) {
  if (amount === null || amount === undefined) return "₹0.00";
  return "₹" + Number(amount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(date, format) {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  if (format === "short") {
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  }
  return d.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

module.exports = {
  createTransporter,
  sendEmail,
  sendWelcomeEmail,
  sendOTPEmail,
  sendPasswordResetEmail,
  sendOrderConfirmation,
  sendOrderStatusUpdate,
  sendDesignApproval,
  sendCouponEmail,
};
