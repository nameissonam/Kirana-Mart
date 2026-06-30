const express = require("express");

const {
  createOrder,
  getAllOrders,
  getCustomerOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  createManualOrder,
} = require("../controllers/orderController");

const { protect, admin } = require("../middlewares/authMiddleware");

const router = express.Router();

// Create Order (Protected - Customer only)
router.post("/", protect, createOrder);

// Create Manual Order (Protected - Admin only)
router.post("/manual", protect, admin, createManualOrder);

// Get Customer's Orders (Protected - Customer views own orders)
router.get("/my-orders", protect, getCustomerOrders);

// Get Single Order (Protected - Can view if owner or admin)
router.get("/:id", protect, getOrderById);

// Get All Orders (Protected - Admin only)
router.get("/", protect, admin, getAllOrders);

// Update Order Status (Protected - Admin only)
router.put("/:id/status", protect, admin, updateOrderStatus);

// Update Payment Status (Protected - Admin only, offline payments)
router.put("/:id/payment-status", protect, admin, updatePaymentStatus);

module.exports = router;
