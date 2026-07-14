const crypto = require("crypto");

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateOrderNumber = () => {
  const now = new Date();
  const datePart =
    now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0");
  const randomPart = Math.floor(1000 + Math.random() * 9000).toString();
  return `PJ-${datePart}-${randomPart}`;
};

const generateCouponCode = (prefix = "PJ") => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = prefix.toUpperCase();
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const generateReferralCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const calculateBulkPrice = (basePrice, quantity, bulkPricing = []) => {
  if (!bulkPricing || bulkPricing.length === 0) {
    return basePrice * quantity;
  }

  const sortedTiers = [...bulkPricing].sort((a, b) => a.minQuantity - b.minQuantity);
  let applicablePrice = basePrice;

  for (const tier of sortedTiers) {
    if (quantity >= tier.minQuantity) {
      applicablePrice = tier.price || basePrice * (1 - (tier.discountPercent || 0) / 100);
    } else {
      break;
    }
  }

  return Math.round(applicablePrice * quantity * 100) / 100;
};

const calculateShipping = (weight, state) => {
  const baseRate = 50;
  const perKgRate = 30;
  const metroStates = ["Delhi", "Maharashtra", "Karnataka", "Tamil Nadu", "Gujarat", "Rajasthan", "Uttar Pradesh", "West Bengal", "Telangana", "Kerala"];

  let cost = baseRate + weight * perKgRate;

  if (!metroStates.includes(state)) {
    cost += weight * 20;
  }

  if (weight > 5) {
    cost += (weight - 5) * perKgRate;
  }

  if (weight >= 50) {
    cost *= 0.9;
  }

  return Math.round(cost * 100) / 100;
};

const calculateGST = (amount, gstRate = 18) => {
  const gstAmount = (amount * gstRate) / 100;
  return Math.round(gstAmount * 100) / 100;
};

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return "₹0.00";
  return (
    "₹" +
    Number(amount).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
};

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
};

const paginate = async (query, page = 1, limit = 10) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  let total = 0;
  let results = [];

  if (query.model) {
    total = await query.model.countDocuments(query.filter || {});
    results = await query.model
      .find(query.filter || {})
      .sort(query.sort || { createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate(query.populate || "")
      .lean();
  } else if (typeof query.exec === "function") {
    const clonedQuery = query.clone();
    const countQuery = query.model ? query.model.find(query.getFilter()) : null;

    if (clonedQuery._count) {
      total = await clonedQuery._count;
    }

    results = await query.skip(skip).limit(limitNum).lean();

    if (total === 0 && query.model) {
      total = await query.model.countDocuments(query.getFilter());
    }
  }

  const totalPages = Math.ceil(total / limitNum);

  return {
    results,
    pagination: {
      currentPage: pageNum,
      totalPages,
      totalItems: total,
      itemsPerPage: limitNum,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
      nextPage: pageNum < totalPages ? pageNum + 1 : null,
      prevPage: pageNum > 1 ? pageNum - 1 : null,
    },
  };
};

const buildFilters = (filters = {}, allowedFields = []) => {
  const mongoFilters = {};

  for (const field of allowedFields) {
    const value = filters[field];
    if (value === undefined || value === null || value === "") continue;

    if (field === "search" || field === "q") {
      mongoFilters.$or = [
        { name: { $regex: value, $options: "i" } },
        { description: { $regex: value, $options: "i" } },
      ];
      continue;
    }

    if (field.endsWith("_min")) {
      const baseField = field.replace("_min", "");
      if (!mongoFilters[baseField]) mongoFilters[baseField] = {};
      mongoFilters[baseField].$gte = Number(value);
      continue;
    }

    if (field.endsWith("_max")) {
      const baseField = field.replace("_max", "");
      if (!mongoFilters[baseField]) mongoFilters[baseField] = {};
      mongoFilters[baseField].$lte = Number(value);
      continue;
    }

    if (field.endsWith("_from")) {
      const baseField = field.replace("_from", "");
      if (!mongoFilters[baseField]) mongoFilters[baseField] = {};
      mongoFilters[baseField].$gte = new Date(value);
      continue;
    }

    if (field.endsWith("_to")) {
      const baseField = field.replace("_to", "");
      if (!mongoFilters[baseField]) mongoFilters[baseField] = {};
      mongoFilters[baseField].$lte = new Date(value);
      continue;
    }

    if (field === "category" || field === "categories") {
      mongoFilters.category = { $in: Array.isArray(value) ? value : [value] };
      continue;
    }

    if (field === "status") {
      mongoFilters.status = value;
      continue;
    }

    if (field === "isActive" || field === "active") {
      mongoFilters.isActive = value === "true" || value === true;
      continue;
    }

    if (field === "price") {
      mongoFilters.price = Number(value);
      continue;
    }

    mongoFilters[field] = value;
  }

  return mongoFilters;
};

const formatDate = (date, format = "long") => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  switch (format) {
    case "short":
      return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    case "medium":
      return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    case "time":
      return d.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    case "datetime":
      return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    case "iso":
      return d.toISOString();
    case "shortDate":
      return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    case "long":
    default:
      return d.toLocaleDateString("en-IN", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
  }
};

const generateInvoice = (order) => {
  const itemRows = order.items
    .map(
      (item, i) => `
    <tr>
      <td style="padding: 8px 12px; border-bottom: 1px solid #E0E0E0; font-size: 13px;">${i + 1}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #E0E0E0; font-size: 13px;">${item.product?.name || item.name || "N/A"}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #E0E0E0; font-size: 13px; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #E0E0E0; font-size: 13px; text-align: right;">₹${Number(item.price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #E0E0E0; font-size: 13px; text-align: right;">₹${Number(item.quantity * item.price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
    </tr>`
    )
    .join("");

  const invoiceHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; }
    .invoice-container { max-width: 800px; margin: 0 auto; border: 1px solid #E0E0E0; }
    .invoice-header { display: flex; justify-content: space-between; align-items: center; padding: 24px 32px; background-color: #1D3557; color: white; }
    .invoice-header h1 { margin: 0; font-size: 28px; }
    .invoice-header .invoice-label { font-size: 14px; opacity: 0.8; }
    .invoice-details { padding: 24px 32px; display: flex; justify-content: space-between; }
    .invoice-details div { flex: 1; }
    .invoice-details h3 { margin: 0 0 8px; font-size: 14px; color: #1D3557; text-transform: uppercase; }
    .invoice-details p { margin: 2px 0; font-size: 13px; color: #666; }
    table { width: 100%; border-collapse: collapse; }
    th { background-color: #1D3557; color: white; padding: 10px 12px; text-align: left; font-size: 13px; }
    th:last-child, th:nth-child(4), th:nth-child(3) { text-align: right; }
    th:nth-child(3) { text-align: center; }
    .totals { padding: 16px 32px; text-align: right; }
    .totals table { width: 300px; margin-left: auto; }
    .totals td { padding: 6px 12px; font-size: 14px; }
    .totals .total-row { font-weight: bold; font-size: 16px; border-top: 2px solid #1D3557; }
    .totals .total-row td { padding-top: 10px; color: #E63946; }
    .footer-note { padding: 16px 32px; background-color: #F8F9FA; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #E0E0E0; }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="invoice-header">
      <div>
        <h1>PrintJack</h1>
        <div class="invoice-label">Premium Custom Printing Solutions</div>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 22px; font-weight: bold;">INVOICE</div>
        <div style="font-size: 13px; opacity: 0.8;">#${order.orderNumber}</div>
      </div>
    </div>
    <div class="invoice-details">
      <div>
        <h3>From</h3>
        <p><strong>PrintJack</strong></p>
        <p>${process.env.COMPANY_ADDRESS || "123 Print Street, Printing District"}</p>
        <p>${process.env.COMPANY_CITY || "Mumbai, Maharashtra - 400001"}</p>
        <p>GSTIN: ${process.env.COMPANY_GSTIN || "27AABCP1234F1Z5"}</p>
        <p>Email: ${process.env.SUPPORT_EMAIL || "billing@printjack.in"}</p>
      </div>
      <div>
        <h3>Bill To</h3>
        <p><strong>${order.user?.name || order.shippingAddress?.name || "Customer"}</strong></p>
        <p>${order.user?.email || ""}</p>
        <p>${order.shippingAddress?.street || ""}</p>
        <p>${order.shippingAddress?.city || ""}, ${order.shippingAddress?.state || ""} - ${order.shippingAddress?.pincode || ""}</p>
        ${order.shippingAddress?.phone ? `<p>Phone: ${order.shippingAddress.phone}</p>` : ""}
      </div>
    </div>
    <div style="padding: 0 32px;">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Item</th>
            <th style="text-align: center;">Qty</th>
            <th style="text-align: right;">Unit Price</th>
            <th style="text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
        </tbody>
      </table>
    </div>
    <div class="totals">
      <table>
        <tr>
          <td>Subtotal:</td>
          <td style="text-align: right;">₹${Number(order.subtotal || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
        </tr>
        ${order.discount ? `<tr><td>Discount:</td><td style="text-align: right; color: #28a745;">-₹${Number(order.discount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td></tr>` : ""}
        <tr>
          <td>Shipping:</td>
          <td style="text-align: right;">${order.shippingCharge === 0 ? "FREE" : "₹" + Number(order.shippingCharge || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
        </tr>
        ${order.gst ? `<tr><td>GST (${order.gstRate || 18}%):</td><td style="text-align: right;">₹${Number(order.gst).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td></tr>` : ""}
        <tr class="total-row">
          <td>Total:</td>
          <td>₹${Number(order.totalAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
        </tr>
      </table>
    </div>
    <div class="footer-note">
      <p>Thank you for your business! | This is a computer-generated invoice and does not require a signature.</p>
      <p>For queries, contact us at ${process.env.SUPPORT_EMAIL || "billing@printjack.in"} or ${process.env.SUPPORT_PHONE || "+91 98765 43210"}</p>
    </div>
  </div>
</body>
</html>`;

  return invoiceHtml;
};

const truncate = (text, length = 100) => {
  if (!text) return "";
  if (text.length <= length) return text;
  return text.substring(0, length).trimEnd() + "...";
};

module.exports = {
  generateOTP,
  generateOrderNumber,
  generateCouponCode,
  generateReferralCode,
  calculateBulkPrice,
  calculateShipping,
  calculateGST,
  formatCurrency,
  slugify,
  paginate,
  buildFilters,
  formatDate,
  generateInvoice,
  truncate,
};
