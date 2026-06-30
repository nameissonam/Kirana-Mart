const Coupon = require("../models/Coupon");

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private/Admin
const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, coupons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a coupon
// @route   POST /api/coupons
// @access  Private/Admin
const createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, minCartAmount, isActive } = req.body;

    if (!code || !discountValue) {
      return res.status(400).json({ success: false, message: "Please enter code and discount value" });
    }

    const uppercaseCode = code.trim().toUpperCase();

    const exists = await Coupon.findOne({ code: uppercaseCode });
    if (exists) {
      return res.status(400).json({ success: false, message: "Coupon code already exists" });
    }

    const coupon = await Coupon.create({
      code: uppercaseCode,
      discountType: discountType || "percentage",
      discountValue: Number(discountValue),
      minCartAmount: minCartAmount !== undefined ? Number(minCartAmount) : 0,
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({ success: true, coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a coupon
// @route   PUT /api/coupons/:id
// @access  Private/Admin
const updateCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, minCartAmount, isActive } = req.body;
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    if (code) {
      const uppercaseCode = code.trim().toUpperCase();
      if (uppercaseCode !== coupon.code) {
        const exists = await Coupon.findOne({ code: uppercaseCode });
        if (exists) {
          return res.status(400).json({ success: false, message: "Coupon code already exists" });
        }
        coupon.code = uppercaseCode;
      }
    }

    if (discountType) coupon.discountType = discountType;
    if (discountValue !== undefined) coupon.discountValue = Number(discountValue);
    if (minCartAmount !== undefined) coupon.minCartAmount = Number(minCartAmount);
    if (isActive !== undefined) coupon.isActive = isActive;

    const updated = await coupon.save();
    res.status(200).json({ success: true, coupon: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    await Coupon.deleteOne({ _id: req.params.id });
    res.status(200).json({ success: true, message: "Coupon removed successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Validate a coupon code
// @route   POST /api/coupons/validate
// @access  Private
const validateCoupon = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: "Coupon code is required" });
    }

    const uppercaseCode = code.trim().toUpperCase();
    const coupon = await Coupon.findOne({ code: uppercaseCode, isActive: true });

    if (!coupon) {
      return res.status(400).json({ success: false, message: "Invalid or expired coupon code" });
    }

    const total = Number(cartTotal) || 0;

    if (total < coupon.minCartAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum purchase of ₹${coupon.minCartAmount} required to apply this coupon`,
      });
    }

    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
      discountAmount = Math.round(total * (coupon.discountValue / 100));
    } else {
      discountAmount = Math.min(coupon.discountValue, total);
    }

    res.status(200).json({
      success: true,
      couponCode: coupon.code,
      discountAmount,
      message: "Coupon applied successfully!",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
};
