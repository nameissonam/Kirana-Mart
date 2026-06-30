const User = require("../models/User");
const Order = require("../models/Order");

// @desc    Get all customers with aggregate stats
// @route   GET /api/customers
// @access  Private/Admin
const getCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: "customer" }).select("-password");

    // Fetch aggregate statistics (total orders, total spend) for each customer
    const customerStats = await Promise.all(
      customers.map(async (customer) => {
        const orders = await Order.find({ customer: customer._id });
        const totalOrders = orders.length;
        const totalSpend = orders.reduce(
          (sum, order) => sum + (order.status !== "REJECTED" ? order.totalAmount : 0),
          0
        );
        return {
          ...customer.toObject(),
          totalOrders,
          totalSpend,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: customerStats.length,
      customers: customerStats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single customer details
// @route   GET /api/customers/:id
// @access  Private/Admin
const getCustomerById = async (req, res) => {
  try {
    const customer = await User.findById(req.params.id).select("-password");
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const orders = await Order.find({ customer: customer._id });
    const totalOrders = orders.length;
    const totalSpend = orders.reduce(
      (sum, order) => sum + (order.status !== "REJECTED" ? order.totalAmount : 0),
      0
    );

    res.status(200).json({
      success: true,
      customer: {
        ...customer.toObject(),
        totalOrders,
        totalSpend,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get customer order history
// @route   GET /api/customers/:id/orders
// @access  Private/Admin
const getCustomerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.params.id })
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

module.exports = {
  getCustomers,
  getCustomerById,
  getCustomerOrders,
};
