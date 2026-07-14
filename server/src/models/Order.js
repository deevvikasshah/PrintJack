const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  design: { type: mongoose.Schema.Types.ObjectId, ref: 'Design' },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  size: { type: String },
  color: { type: String },
  unitPrice: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  customizationPreview: { type: String, default: '' },
  printFile: { type: String, default: '' },
}, { _id: true });

const addressSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  country: { type: String, default: 'India' },
}, { _id: false });

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  date: { type: Date, default: Date.now },
  note: { type: String, default: '' },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
  },
  orderNumber: {
    type: String,
    unique: true,
  },
  items: [orderItemSchema],
  shippingAddress: {
    type: addressSchema,
    required: [true, 'Shipping address is required'],
  },
  billingAddress: addressSchema,
  subtotal: {
    type: Number,
    required: true,
    min: 0,
  },
  shippingCost: {
    type: Number,
    default: 0,
    min: 0,
  },
  tax: {
    type: Number,
    default: 0,
    min: 0,
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  paymentMethod: {
    type: String,
    enum: ['razorpay', 'cod', 'upi', 'netbanking', 'wallet'],
    default: 'razorpay',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'authorized', 'captured', 'failed', 'refunded'],
    default: 'pending',
  },
  razorpayOrderId: {
    type: String,
    default: '',
  },
  razorpayPaymentId: {
    type: String,
    default: '',
  },
  razorpaySignature: {
    type: String,
    default: '',
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'in_production', 'quality_check', 'shipped', 'delivered', 'cancelled', 'returned'],
    default: 'pending',
  },
  trackingNumber: {
    type: String,
    default: '',
  },
  shippingPartner: {
    type: String,
    default: '',
  },
  estimatedDelivery: {
    type: Date,
  },
  deliveredAt: {
    type: Date,
  },
  notes: {
    type: String,
    default: '',
  },
  specialInstructions: {
    type: String,
    default: '',
  },
  statusHistory: [statusHistorySchema],
}, {
  timestamps: { createdAt: true, updatedAt: true },
});

orderSchema.plugin(mongoosePaginate);

async function generateOrderNumber() {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const count = await mongoose.model('Order').countDocuments({
    createdAt: {
      $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
      $lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
    },
  });
  const seq = String(count + 1).padStart(4, '0');
  return `PJ-${dateStr}-${seq}`;
}

orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    this.orderNumber = await generateOrderNumber();
  }
  if (this.isNew) {
    this.statusHistory.push({ status: this.orderStatus, date: new Date(), note: 'Order placed' });
  }
  if (this.isModified('orderStatus') && !this.isNew) {
    const last = this.statusHistory[this.statusHistory.length - 1];
    if (!last || last.status !== this.orderStatus) {
      this.statusHistory.push({ status: this.orderStatus, date: new Date() });
    }
  }
  next();
});

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ orderStatus: 1 });

module.exports = mongoose.model('Order', orderSchema);
