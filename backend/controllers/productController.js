const Product = require("../models/Product");
const fs = require("fs");
const path = require("path");
const defaultProducts = require("../data/defaultProducts");

const deleteLocalProductImage = (imagePath = "") => {
  if (!imagePath.startsWith("/uploads/products/")) return;
  const absolutePath = path.join(__dirname, "..", imagePath.replace(/^\//, ""));
  fs.unlink(absolutePath, () => {});
};

const normalizeVariants = (variants) => {
  if (!Array.isArray(variants)) return [];
  return variants.map((variant) => String(variant).trim()).filter(Boolean);
};

// Create Product
const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock, image, imagePublicId, unit, variants, type, lowStockThreshold, brand, discountPercentage, images } = req.body;
    const product = await Product.create({
      name,
      description,
      price: Number(price),
      category,
      stock: Number(stock),
      image: image || "",
      imagePublicId: imagePublicId || "",
      unit: unit || "piece",
      variants: normalizeVariants(variants),
      type: type || "Veg",
      lowStockThreshold: lowStockThreshold !== undefined ? Number(lowStockThreshold) : 15,
      brand: brand || "KiranaMart Select",
      discountPercentage: Number(discountPercentage || 0),
      images: Array.isArray(images) ? images : [],
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get All Products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get Single Product
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Update Product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, stock, image, imagePublicId, unit, variants, type, lowStockThreshold, brand, discountPercentage, images } = req.body;

    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    const product = await Product.findByIdAndUpdate(
      id,
      {
        name,
        description,
        price: Number(price),
        category,
        stock: Number(stock),
        image: image ?? existingProduct.image,
        imagePublicId: imagePublicId ?? existingProduct.imagePublicId,
        unit: unit || "piece",
        variants: normalizeVariants(variants),
        type: type || "Veg",
        lowStockThreshold: lowStockThreshold !== undefined ? Number(lowStockThreshold) : 15,
        brand: brand || "KiranaMart Select",
        discountPercentage: Number(discountPercentage || 0),
        images: Array.isArray(images) ? images : [],
      },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (image !== undefined && image !== existingProduct.image) {
      deleteLocalProductImage(existingProduct.image);
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Delete Product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    deleteLocalProductImage(product.image);

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Seed database with the standard catalog
const seedProducts = async (req, res) => {
  try {
    await Product.deleteMany({});

    const seeded = await Product.insertMany(defaultProducts);
    res.status(201).json({
      message: "Database seeded successfully",
      count: seeded.length,
      products: seeded
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  seedProducts,
};
