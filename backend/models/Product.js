const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    unit: {
      type: String,
      default: "piece", // e.g., 'kg', 'piece', 'packet'
    },
    variants: {
      type: [String],
      default: [],
    },

    stock: {
      type: Number,
      default: 0,
    },

    image: {
      type: String,
      default: "",
    },
    imagePublicId: { type: String, default: "" },
    brand: { type: String, default: "KiranaMart Select" },
    discountPercentage: { type: Number, default: 0, min: 0, max: 90 },
    images: { type: [String], default: [] },

    lowStockThreshold: {
      type: Number,
      default: 15,
    },

    type: {
      type: String,
      default: "Veg", // e.g., 'Veg', 'Non-Veg', 'Other'
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);
