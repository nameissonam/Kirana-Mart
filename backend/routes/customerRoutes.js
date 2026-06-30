const express = require("express");
const router = express.Router();
const {
  getCustomers,
  getCustomerById,
  getCustomerOrders,
} = require("../controllers/customerController");
const { protect, admin } = require("../middlewares/authMiddleware");

// All routes are protected and restricted to Admins
router.route("/").get(protect, admin, getCustomers);
router.route("/:id").get(protect, admin, getCustomerById);
router.route("/:id/orders").get(protect, admin, getCustomerOrders);

module.exports = router;
