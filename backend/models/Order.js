const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [orderItemSchema],
    deliveryType: {
      type: String,
      enum: ["Home Delivery", "Store Pickup"],
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["Cash on Delivery", "UPI", "Google Pay", "PhonePe", "Paytm", "BHIM", "Online", "COD", "Pay at Store"],
      required: true,
    },
    paymentStatus: { type: String, enum: ["Pending", "Processing", "Paid", "Failed", "Cancelled"], default: "Pending" },
    paymentGateway: { type: String, enum: ["Offline", "Razorpay"], default: "Offline" },
    paymentId: { type: String, default: "" },
    transactionId: { type: String, default: "" },
    gatewayOrderId: { type: String, default: "" },
    paidAt: { type: Date, default: null },
    paymentAttempt: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PaymentAttempt",
      unique: true,
      sparse: true,
    },
    transactionReference: { type: String, default: "" },
    deliveryAddress: {
      fullName: { type: String },
      phone: { type: String },
      flat: { type: String },
      street: { type: String },
      pincode: { type: String },
      city: { type: String },
      location: {
        lat: { type: Number },
        lng: { type: Number },
        query: { type: String },
        accuracy: { type: Number },
        capturedAt: { type: Date },
        source: { type: String, default: "browser" },
      },
    },
    status: {
      type: String,
      enum: ["PLACED", "CONFIRMED", "ACCEPTED", "REJECTED", "PACKED", "OUT_FOR_DELIVERY", "DELIVERED"],
      default: "PLACED",
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    couponCode: {
      type: String,
      default: "",
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);
