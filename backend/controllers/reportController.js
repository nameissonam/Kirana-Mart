const Order = require("../models/Order");
const Product = require("../models/Product");

// @desc    Get dashboard metrics & recent orders
// @route   GET /api/reports/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    
    const revenueData = await Order.aggregate([
      { $match: { status: { $ne: "REJECTED" } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;
    
    const totalProducts = await Product.countDocuments();

    // Check low stock count using lowStockThreshold
    const lowStockAlerts = await Product.countDocuments({
      $expr: { $lte: ["$stock", "$lowStockThreshold"] },
    });

    // Fetch top 5 recent orders
    const recentOrders = await Order.find()
      .populate("customer", "name email")
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        totalOrders,
        totalRevenue,
        totalProducts,
        lowStockAlerts,
      },
      recentOrders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get daily sales (7 days) & monthly sales (current year)
// @route   GET /api/reports/sales
// @access  Private/Admin
const getSalesStats = async (req, res) => {
  try {
    // 1. Daily sales (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailySales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
          status: { $ne: "REJECTED" },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalAmount: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill missing days with zero values to maintain a continuous chart
    const filledDailySales = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const match = dailySales.find((day) => day._id === dateStr);
      filledDailySales.push({
        date: dateStr,
        totalAmount: match ? match.totalAmount : 0,
        count: match ? match.count : 0,
      });
    }

    // 2. Monthly sales for current year
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);

    const monthlySales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfYear },
          status: { $ne: "REJECTED" },
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          totalAmount: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill months (1 to 12)
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    const filledMonthlySales = [];
    for (let m = 1; m <= 12; m++) {
      const match = monthlySales.find((item) => item._id === m);
      filledMonthlySales.push({
        month: monthNames[m - 1],
        totalAmount: match ? match.totalAmount : 0,
        count: match ? match.count : 0,
      });
    }

    res.status(200).json({
      success: true,
      dailySales: filledDailySales,
      monthlySales: filledMonthlySales,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get top selling products
// @route   GET /api/reports/top-products
// @access  Private/Admin
const getTopProducts = async (req, res) => {
  try {
    const topProducts = await Order.aggregate([
      { $match: { status: { $ne: "REJECTED" } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          name: { $first: "$items.name" },
          price: { $first: "$items.price" },
          quantitySold: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      { $sort: { quantitySold: -1 } },
      { $limit: 5 },
    ]);

    res.status(200).json({
      success: true,
      topProducts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
  getSalesStats,
  getTopProducts,
};
