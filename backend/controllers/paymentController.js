const crypto = require("crypto");
const Order = require("../models/Order");
const PaymentAttempt = require("../models/PaymentAttempt");
const Notification = require("../models/Notification");
const { calculateOrder } = require("../services/orderPricingService");
const { getRazorpayClient } = require("../services/razorpayService");

const validateAddress = (address = {}) => {
  const required = ["fullName", "phone", "flat", "street", "pincode", "city"];
  if (required.some((field) => !String(address[field] || "").trim())) {
    throw new Error("Complete delivery address is required");
  }
};

const paymentTransactionId = (payment) => (
  payment?.acquirer_data?.upi_transaction_id
  || payment?.acquirer_data?.rrn
  || payment?.id
  || ""
);

const signaturesMatch = (expected, received) => {
  const expectedBuffer = Buffer.from(String(expected));
  const receivedBuffer = Buffer.from(String(received || ""));
  return expectedBuffer.length === receivedBuffer.length
    && crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
};

const createPaidOrder = async (attempt, payment = {}) => {
  if (attempt.order) {
    return Order.findById(attempt.order);
  }

  const existingOrder = await Order.findOne({ paymentAttempt: attempt._id });
  if (existingOrder) {
    attempt.order = existingOrder._id;
    attempt.status = "Paid";
    await attempt.save();
    return existingOrder;
  }

  const paidAt = payment.created_at ? new Date(payment.created_at * 1000) : new Date();
  const transactionId = paymentTransactionId(payment);
  let order;
  let orderCreated = false;
  try {
    order = await Order.create({
      customer: attempt.customer,
      items: attempt.items,
      deliveryType: "Home Delivery",
      deliveryAddress: attempt.deliveryAddress,
      paymentMethod: "UPI",
      paymentStatus: "Paid",
      paymentGateway: "Razorpay",
      paymentId: payment.id || attempt.paymentId,
      transactionId,
      transactionReference: transactionId,
      gatewayOrderId: attempt.gatewayOrderId,
      paidAt,
      totalAmount: attempt.totalAmount,
      couponCode: attempt.couponCode,
      discountAmount: attempt.discountAmount,
      paymentAttempt: attempt._id,
    });
    orderCreated = true;
  } catch (error) {
    if (error.code !== 11000) throw error;
    order = await Order.findOne({ paymentAttempt: attempt._id });
    if (!order) throw error;
  }

  attempt.status = "Paid";
  attempt.paymentId = payment.id || attempt.paymentId;
  attempt.transactionId = transactionId;
  attempt.paymentMethod = payment.method ? String(payment.method).toUpperCase() : "UPI";
  attempt.paidAt = paidAt;
  attempt.order = order._id;
  attempt.failureReason = "";
  await attempt.save();

  if (orderCreated) {
    await Notification.create({
      type: "NEW_ORDER",
      title: "New Paid Order",
      message: `Online order #${order._id.toString().substring(0, 8).toUpperCase()} for ₹${order.totalAmount} has been paid successfully.`,
      orderId: order._id,
    });
  }

  return order;
};

exports.createPaymentOrder = async (req, res) => {
  try {
    validateAddress(req.body.deliveryAddress);
    const pricing = await calculateOrder(req.body);
    const razorpay = getRazorpayClient();
    const gatewayOrder = await razorpay.orders.create({
      amount: Math.round(pricing.totalAmount * 100),
      currency: "INR",
      receipt: `km_${Date.now()}_${req.user._id.toString().slice(-6)}`,
      notes: { customerId: req.user._id.toString() },
    });

    const attempt = await PaymentAttempt.create({
      customer: req.user._id,
      items: pricing.items,
      deliveryAddress: req.body.deliveryAddress,
      couponCode: pricing.couponCode,
      discountAmount: pricing.discountAmount,
      deliveryAmount: pricing.deliveryAmount,
      taxAmount: pricing.taxAmount,
      totalAmount: pricing.totalAmount,
      gatewayOrderId: gatewayOrder.id,
    });

    res.status(201).json({
      success: true,
      keyId: process.env.RAZORPAY_KEY_ID,
      attemptId: attempt._id,
      gatewayOrderId: gatewayOrder.id,
      amount: gatewayOrder.amount,
      currency: gatewayOrder.currency,
      pricing,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { attemptId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const attempt = await PaymentAttempt.findOne({ _id: attemptId, customer: req.user._id });
    if (!attempt || attempt.gatewayOrderId !== razorpay_order_id) {
      return res.status(404).json({ success: false, message: "Payment attempt not found" });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${attempt.gatewayOrderId}|${razorpay_payment_id}`)
      .digest("hex");
    const validSignature = signaturesMatch(expectedSignature, razorpay_signature);
    if (!validSignature) {
      attempt.status = "Failed";
      attempt.failureReason = "Payment signature verification failed";
      await attempt.save();
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }

    const razorpay = getRazorpayClient();
    let payment = await razorpay.payments.fetch(razorpay_payment_id);
    if (payment.order_id !== attempt.gatewayOrderId || payment.amount !== Math.round(attempt.totalAmount * 100)) {
      return res.status(400).json({ success: false, message: "Payment details do not match this order" });
    }

    if (payment.status === "authorized") {
      payment = await razorpay.payments.capture(payment.id, payment.amount, payment.currency || "INR");
    }

    attempt.paymentId = payment.id;
    attempt.transactionId = paymentTransactionId(payment);
    attempt.status = payment.status === "captured" ? "Paid" : "Processing";
    await attempt.save();

    if (payment.status !== "captured") {
      return res.status(202).json({ success: true, status: "Processing", attemptId: attempt._id });
    }

    const order = await createPaidOrder(attempt, payment);
    res.json({ success: true, status: "Paid", order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getPaymentStatus = async (req, res) => {
  try {
    const attempt = await PaymentAttempt.findOne({ _id: req.params.attemptId, customer: req.user._id }).populate("order");
    if (!attempt) return res.status(404).json({ success: false, message: "Payment attempt not found" });
    res.json({
      success: true,
      status: attempt.status,
      failureReason: attempt.failureReason,
      order: attempt.order,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.cancelPayment = async (req, res) => {
  try {
    const attempt = await PaymentAttempt.findOne({ _id: req.params.attemptId, customer: req.user._id });
    if (!attempt) return res.status(404).json({ success: false, message: "Payment attempt not found" });
    if (attempt.status !== "Paid") {
      attempt.status = "Cancelled";
      attempt.failureReason = "Customer closed the payment window";
      await attempt.save();
    }
    res.json({ success: true, status: attempt.status });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.handleWebhook = async (req, res) => {
  try {
    if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
      return res.status(503).send("Webhook secret is not configured");
    }
    const receivedSignature = String(req.headers["x-razorpay-signature"] || "");
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(req.body)
      .digest("hex");
    if (!signaturesMatch(expectedSignature, receivedSignature)) {
      return res.status(400).send("Invalid webhook signature");
    }

    const event = JSON.parse(req.body.toString("utf8"));
    const payment = event.payload?.payment?.entity;
    if (!payment?.order_id) return res.status(200).json({ received: true });

    const attempt = await PaymentAttempt.findOne({ gatewayOrderId: payment.order_id });
    if (!attempt) return res.status(200).json({ received: true });

    if (event.event === "payment.captured" || event.event === "order.paid") {
      await createPaidOrder(attempt, payment);
    } else if (event.event === "payment.failed" && attempt.status !== "Paid") {
      attempt.status = "Failed";
      attempt.paymentId = payment.id || "";
      attempt.failureReason = payment.error_description || payment.error_reason || "Payment failed";
      await attempt.save();
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Razorpay webhook error:", error.message);
    res.status(500).send("Webhook processing failed");
  }
};
