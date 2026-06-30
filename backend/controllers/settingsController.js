const Settings = require("../models/Settings");

// @desc    Get store settings
// @route   GET /api/settings
// @access  Public
const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update store settings
// @route   PUT /api/settings
// @access  Private/Admin
const updateSettings = async (req, res) => {
  try {
    const {
      shopName,
      contactPhone,
      contactEmail,
      deliveryCharge,
      minOrderValue,
      homeDeliveryMinValue,
      address,
    } = req.body;

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    settings.shopName = shopName || settings.shopName;
    settings.contactPhone = contactPhone || settings.contactPhone;
    settings.contactEmail = contactEmail || settings.contactEmail;
    settings.deliveryCharge =
      deliveryCharge !== undefined ? Number(deliveryCharge) : settings.deliveryCharge;
    settings.minOrderValue =
      minOrderValue !== undefined ? Number(minOrderValue) : settings.minOrderValue;
    settings.homeDeliveryMinValue =
      homeDeliveryMinValue !== undefined ? Number(homeDeliveryMinValue) : settings.homeDeliveryMinValue;
    settings.address = address || settings.address;

    const updatedSettings = await settings.save();

    res.status(200).json({
      success: true,
      settings: updatedSettings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getSettings,
  updateSettings,
};
