const mongoose = require("mongoose");

const paymentItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
}, { _id: false });

const paymentAttemptSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: { type: [paymentItemSchema], required: true },
  deliveryAddress: {
    fullName: String,
    phone: String,
    flat: String,
    street: String,
    pincode: String,
    city: String,
    location: {
      lat: Number,
      lng: Number,
      query: String,
      accuracy: Number,
      capturedAt: Date,
      source: { type: String, default: "browser" },
    },
  },
  couponCode: { type: String, default: "" },
  discountAmount: { type: Number, default: 0 },
  deliveryAmount: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  currency: { type: String, default: "INR" },
  gateway: { type: String, default: "Razorpay" },
  gatewayOrderId: { type: String, required: true, unique: true, index: true },
  paymentId: { type: String, default: "", index: true },
  transactionId: { type: String, default: "" },
  paymentMethod: { type: String, default: "UPI" },
  status: {
    type: String,
    enum: ["Pending", "Processing", "Paid", "Failed", "Cancelled"],
    default: "Pending",
  },
  failureReason: { type: String, default: "" },
  paidAt: Date,
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
}, { timestamps: true });

module.exports = mongoose.model("PaymentAttempt", paymentAttemptSchema);
