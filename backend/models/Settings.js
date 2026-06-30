const mongoose = require("mongoose");

const DEFAULT_STORE_ADDRESS = "Kirana Mart, Railway Crossing Line, near Kali Mandir, Yashoda Nagar, Khankripara, Chhota Gobindpur, Jamshedpur, Jharkhand 831004";

const settingsSchema = new mongoose.Schema(
  {
    shopName: {
      type: String,
      default: "Kirana Mart",
    },
    contactPhone: {
      type: String,
      default: "+91 98765 43210",
    },
    contactEmail: {
      type: String,
      default: "contact@kiranamart.com",
    },
    deliveryCharge: {
      type: Number,
      default: 10,
    },
    minOrderValue: {
      type: Number,
      default: 100,
    },
    homeDeliveryMinValue: {
      type: Number,
      default: 750,
    },
    address: {
      type: String,
      default: DEFAULT_STORE_ADDRESS,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Settings", settingsSchema);
module.exports.DEFAULT_STORE_ADDRESS = DEFAULT_STORE_ADDRESS;
