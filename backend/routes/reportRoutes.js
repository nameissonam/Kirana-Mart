const express = require("express");
const router = express.Router();
const {
  getDashboardStats,
  getSalesStats,
  getTopProducts,
} = require("../controllers/reportController");
const { protect, admin } = require("../middlewares/authMiddleware");

// All reports are protected and restricted to Admins
router.route("/dashboard").get(protect, admin, getDashboardStats);
router.route("/sales").get(protect, admin, getSalesStats);
router.route("/top-products").get(protect, admin, getTopProducts);

module.exports = router;
