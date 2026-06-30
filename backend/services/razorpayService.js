const Razorpay = require("razorpay");

let client;

const getRazorpayClient = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Online payment is temporarily unavailable. Please choose Cash on Delivery or Pay at Store.");
  }
  if (!client) {
    client = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return client;
};

const isRazorpayConfigured = () => Boolean(
  process.env.RAZORPAY_KEY_ID
  && process.env.RAZORPAY_KEY_SECRET
  && process.env.RAZORPAY_WEBHOOK_SECRET
);

module.exports = { getRazorpayClient, isRazorpayConfigured };
