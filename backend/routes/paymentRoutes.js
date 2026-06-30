const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const {
  createPaymentOrder,
  verifyPayment,
  getPaymentStatus,
  cancelPayment,
} = require("../controllers/paymentController");

const router = express.Router();
const { isRazorpayConfigured } = require("../services/razorpayService");

router.get("/config", (req, res) => res.json({ configured: isRazorpayConfigured(), gateway: "Razorpay" }));
router.post("/create-order", protect, createPaymentOrder);
router.post("/verify", protect, verifyPayment);
router.get("/status/:attemptId", protect, getPaymentStatus);
router.post("/cancel/:attemptId", protect, cancelPayment);

module.exports = router;
