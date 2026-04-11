const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  image: { type: String },
  category: { type: String },
  selectedVariant: {
    name: { type: String },
    price: { type: Number }
  }
});

const returnRequestSchema = new mongoose.Schema({
  requested: { type: Boolean, default: false },
  reason: { type: String },
  images: [{ type: String }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  requestedAt: { type: Date },
  resolvedAt: { type: Date },
  adminNote: { type: String },
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  shippingAddress: {
    name: String,
    phoneNumber: String,
    houseNo: String,
    street: String,
    area: String,
    city: String,
    district: String,
    state: String,
    pincode: String,
  },
  paymentMethod: { 
    type: String, 
    enum: ['COD', 'Razorpay', 'UPI', 'wallet', 'wallet+razorpay', 'wallet+upi', 'wallet+cod'], 
    required: true 
  },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  paymentResult: {
    razorpay_order_id: { type: String },
    razorpay_payment_id: { type: String },
    razorpay_signature: { type: String },
  },
  walletAmountUsed: { type: Number, default: 0 },
  remainingAmount: { type: Number, default: 0 },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  orderStatus: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'], default: 'pending' },
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  appliedCoupons: [{ type: String }],
  shippedAt: { type: Date },
  deliveredAt: { type: Date },
  cancelReason: { type: String },
  returnReason: { type: String },
  returnRequest: returnRequestSchema,
  refund: {
    initiated: { type: Boolean, default: false },
    method: { type: String, enum: ['wallet', 'bank', 'razorpay', ''] },
    status: { type: String, enum: ['pending', 'processing', 'processed', 'failed'], default: 'pending' },
    amount: { type: Number },
    initiatedAt: { type: Date },
    processedAt: { type: Date },
    pendingMethod: { type: Boolean, default: false },
    bankDetails: {
      accountHolder: String,
      accountNumber: String,
      ifscCode: String,
      bankName: String,
    },
    razorpayRefundId: { type: String },
    failureReason: { type: String },
  },
}, { timestamps: true });

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ razorpayOrderId: 1 });
orderSchema.index({ 'returnRequest.requested': 1 });
orderSchema.index({ 'returnRequest.status': 1 });

module.exports = mongoose.model('Order', orderSchema);
