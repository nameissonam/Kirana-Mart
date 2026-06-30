const Order = require("../models/Order");
const Product = require("../models/Product");
const Notification = require("../models/Notification");
const User = require("../models/User");
const { calculateOrder } = require("../services/orderPricingService");

// Create Order (Customer side)
exports.createOrder = async (req, res) => {
  try {
    const allowedOfflineMethods = ["Cash on Delivery", "COD", "Pay at Store"];
    if (!allowedOfflineMethods.includes(req.body.paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Online payments must be completed through the secure payment gateway",
      });
    }

    const pricing = await calculateOrder(req.body);
    const orderData = {
      customer: req.user._id,
      items: pricing.items,
      deliveryType: req.body.paymentMethod === "Pay at Store" ? "Store Pickup" : "Home Delivery",
      deliveryAddress: req.body.paymentMethod === "Pay at Store" ? undefined : req.body.deliveryAddress,
      paymentMethod: req.body.paymentMethod,
      paymentStatus: "Pending",
      paymentGateway: "Offline",
      totalAmount: pricing.totalAmount,
      couponCode: pricing.couponCode,
      discountAmount: pricing.discountAmount,
    };

    const order = await Order.create(orderData);

    // Create system alert for new order
    await Notification.create({
      type: "NEW_ORDER",
      title: "New Customer Order",
      message: `A new order #${order._id.toString().substring(0, 8).toUpperCase()} for ₹${order.totalAmount} has been placed by ${req.user.name}.`,
      orderId: order._id,
    });

    res.status(201).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create Manual Order (Admin side)
exports.createManualOrder = async (req, res) => {
  try {
    const {
      customerId,
      items,
      deliveryType,
      paymentMethod,
      deliveryAddress,
      totalAmount,
    } = req.body;

    // Verify if customer exists
    const customer = await User.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Selected customer not found",
      });
    }

    const orderData = {
      customer: customerId,
      items,
      deliveryType,
      paymentMethod,
      deliveryAddress,
      totalAmount,
      status: "CONFIRMED", // Start manual orders as confirmed
    };

    const order = await Order.create(orderData);

    // Manual orders reduce stock immediately upon creation
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock = Math.max(0, product.stock - item.quantity);
        await product.save();

        // Check if stock dropped below threshold
        if (product.stock <= product.lowStockThreshold) {
          await Notification.create({
            type: "LOW_STOCK",
            title: "Low Stock Alert",
            message: `Product "${product.name}" stock level dropped to ${product.stock} units (limit: ${product.lowStockThreshold}).`,
            productId: product._id,
          });
        }
      }
    }

    // Trigger notification
    await Notification.create({
      type: "NEW_ORDER",
      title: "New Manual Order",
      message: `Manual order #${order._id.toString().substring(0, 8).toUpperCase()} for ₹${order.totalAmount} has been entered for ${customer.name}.`,
      orderId: order._id,
    });

    res.status(201).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Customer's Orders
exports.getCustomerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate("customer", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Orders (Admin only, supports status filtering)
exports.getAllOrders = async (req, res) => {
  try {
    const filterQuery = {};
    if (req.query.status) {
      filterQuery.status = req.query.status;
    }

    const orders = await Order.find(filterQuery)
      .populate("customer", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Single Order
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("customer", "name email");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if user owns this order or is admin
    if (
      order.customer._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this order",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Order Status (Admin only)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const oldStatus = order.status;

    // Strict status transition rules
    const validTransitions = {
      PLACED: ["CONFIRMED", "ACCEPTED", "REJECTED"],
      CONFIRMED: ["PACKED"],
      ACCEPTED: ["PACKED"], // Fallback compatibility for old ACCEPTED orders
      PACKED: ["OUT_FOR_DELIVERY"],
      OUT_FOR_DELIVERY: ["DELIVERED"],
      DELIVERED: [],
      REJECTED: [],
    };

    const allowedNextStatuses = validTransitions[oldStatus] || [];
    if (!allowedNextStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from ${oldStatus} to ${status}`,
      });
    }

    order.status = status;
    const updatedOrder = await order.save();

    // Reduce stock when transitioning to CONFIRMED (or accepted) from PLACED
    if (
      (status === "CONFIRMED" || status === "ACCEPTED") &&
      oldStatus === "PLACED"
    ) {
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product) {
          product.stock = Math.max(0, product.stock - item.quantity);
          await product.save();

          // Trigger low stock warning if applicable
          if (product.stock <= product.lowStockThreshold) {
            await Notification.create({
              type: "LOW_STOCK",
              title: "Low Stock Alert",
              message: `Product "${product.name}" stock level dropped to ${product.stock} units (limit: ${product.lowStockThreshold}).`,
              productId: product._id,
            });
          }
        }
      }
    }

    // Create system alert if rejected/cancelled
    if (status === "REJECTED" && oldStatus !== "REJECTED") {
      await Notification.create({
        type: "ORDER_CANCELLED",
        title: "Order Cancelled/Rejected",
        message: `Order #${order._id.toString().substring(0, 8).toUpperCase()} has been rejected or cancelled.`,
        orderId: order._id,
      });
    }

    res.status(200).json({
      success: true,
      order: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Payment Status (Admin only, offline payments)
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    const allowedStatuses = ["Pending", "Paid"];

    if (!allowedStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: "Payment status can only be changed to Pending or Paid",
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const offlineMethods = ["Cash on Delivery", "COD", "Pay at Store"];
    const canOwnerManagePayment =
      order.paymentGateway === "Offline" || offlineMethods.includes(order.paymentMethod);

    if (!canOwnerManagePayment) {
      return res.status(400).json({
        success: false,
        message: "Online payment status is managed by the payment gateway",
      });
    }

    order.paymentStatus = paymentStatus;
    if (paymentStatus === "Paid") {
      order.paidAt = order.paidAt || new Date();
      order.transactionReference =
        order.transactionReference || `OWNER-MARKED-${order._id.toString().slice(-8).toUpperCase()}`;
    } else {
      order.paidAt = null;
      if (order.transactionReference?.startsWith("OWNER-MARKED-")) {
        order.transactionReference = "";
      }
    }

    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      order: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
