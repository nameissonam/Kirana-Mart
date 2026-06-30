const Product = require("../models/Product");
const Settings = require("../models/Settings");

const createValidationError = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
};

const calculateOrder = async ({ items = [], couponCode = "", paymentMethod = "" }) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw createValidationError("Your basket is empty");
  }

  const productIds = items.map((item) => item.product);
  const products = await Product.find({ _id: { $in: productIds } });
  const productMap = new Map(products.map((product) => [product._id.toString(), product]));

  const verifiedItems = items.map((item) => {
    const product = productMap.get(String(item.product));
    const quantity = Number(item.quantity);
    if (!product || !Number.isInteger(quantity) || quantity < 1) {
      throw createValidationError("One or more basket items are unavailable. Please refresh products and add them again.");
    }
    if (product.stock < quantity) {
      throw createValidationError(`Only ${product.stock} units of ${product.name} are available`);
    }
    return {
      product: product._id,
      name: product.name,
      price: product.price,
      quantity,
    };
  });

  const subtotal = verifiedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const settings = await Settings.findOne();
  const deliveryCharge = Number(settings?.deliveryCharge ?? 30);
  const homeDeliveryMinValue = Number(settings?.homeDeliveryMinValue ?? 750);
  const isHomeDelivery = paymentMethod !== "Pay at Store";
  if (isHomeDelivery && subtotal < homeDeliveryMinValue) {
    throw createValidationError(`Home delivery is available only for cart value of ₹${homeDeliveryMinValue} or more.`);
  }

  const normalizedCoupon = String(couponCode || "").trim().toUpperCase();
  const discountAmount = normalizedCoupon === "KIRANAFRESH" ? Math.round(subtotal * 0.15) : 0;
  const deliveryAmount = paymentMethod === "Pay at Store" || normalizedCoupon === "FREEDEL" ? 0 : deliveryCharge;
  const taxAmount = Math.round((subtotal - discountAmount) * 0.05);
  const totalAmount = subtotal - discountAmount + deliveryAmount + taxAmount;

  return {
    items: verifiedItems,
    couponCode: ["KIRANAFRESH", "FREEDEL"].includes(normalizedCoupon) ? normalizedCoupon : "",
    subtotal,
    discountAmount,
    deliveryAmount,
    taxAmount,
    totalAmount,
  };
};

module.exports = { calculateOrder };
