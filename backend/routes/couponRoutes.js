const express = require("express");
const router = express.Router();
const {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
} = require("../controllers/couponController");
const { protect, admin } = require("../middlewares/authMiddleware");

// Admin routes
router.route("/")
  .get(protect, admin, getCoupons)
  .post(protect, admin, createCoupon);

router.route("/:id")
  .put(protect, admin, updateCoupon)
  .delete(protect, admin, deleteCoupon);

// Customer route to validate a coupon code
router.post("/validate", protect, validateCoupon);

module.exports = router;
