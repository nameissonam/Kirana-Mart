const Product = require("../models/Product");
const fs = require("fs");
const path = require("path");

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

// Seed database with mock products
const seedProducts = async (req, res) => {
  try {
    await Product.deleteMany({});

    const sampleProducts = [
      {
        name: "Alphonso Mangoes (1kg)",
        description: "Sweet, juicy, premium quality Alphonso mangoes directly from Devgad farms.",
        price: 180,
        category: "Fruits & Vegetables",
        stock: 50,
        image: "fruits",
        unit: "kg",
        type: "Veg",
        lowStockThreshold: 15,
      },
      {
        name: "Organic Tomatoes (1kg)",
        description: "Freshly harvested red organic tomatoes, rich in taste and nutrients.",
        price: 45,
        category: "Fruits & Vegetables",
        stock: 120,
        image: "vegetables",
        unit: "kg",
        type: "Veg",
        lowStockThreshold: 15,
      },
      {
        name: "Amul Pasteurised Butter (500g)",
        description: "Utterly butterly delicious butter, a staple for every Indian breakfast.",
        price: 275,
        category: "Dairy & Eggs",
        stock: 90,
        image: "dairy",
        unit: "packet",
        type: "Veg",
        lowStockThreshold: 15,
      },
      {
        name: "Mother Dairy Paneer (200g)",
        description: "Soft and fresh cottage cheese paneer, perfect for curry and grilling.",
        price: 95,
        category: "Dairy & Eggs",
        stock: 8, // Seed low stock to test alerts!
        image: "dairy",
        unit: "packet",
        type: "Veg",
        lowStockThreshold: 15,
      },
      {
        name: "Haldiram's Aloo Bhujia (400g)",
        description: "Crispy and spicy potato noodles snack, the ultimate teatime partner.",
        price: 110,
        category: "Snacks & Munchies",
        stock: 150,
        image: "snacks",
        unit: "packet",
        type: "Veg",
        lowStockThreshold: 15,
      },
      {
        name: "Britannia Good Day Cookies (400g)",
        description: "Rich butter cookies loaded with sweet cashew nuts, smiles in every bite.",
        price: 80,
        category: "Snacks & Munchies",
        stock: 110,
        image: "snacks",
        unit: "packet",
        type: "Veg",
        lowStockThreshold: 15,
      },
      {
        name: "Tata Tea Premium (1kg)",
        description: "Unique blend of big tea leaves and gentle long leaves for the perfect chai.",
        price: 420,
        category: "Beverages",
        stock: 60,
        image: "beverages",
        unit: "kg",
        type: "Veg",
        lowStockThreshold: 15,
      },
      {
        name: "Nescafe Classic Coffee (100g)",
        description: "100% pure instant coffee powder, start your day with a rich aroma.",
        price: 310,
        category: "Beverages",
        stock: 45,
        image: "beverages",
        unit: "packet",
        type: "Veg",
        lowStockThreshold: 15,
      },
      {
        name: "Coca-Cola Cold Drink (1.25L)",
        description: "Refreshing, crisp sparkling soft drink to share with friends and family.",
        price: 70,
        category: "Beverages",
        stock: 80,
        image: "beverages",
        unit: "bottle",
        type: "Veg",
        lowStockThreshold: 15,
      },
      {
        name: "Maggi 2-Minute Masala Noodles (12-Pack)",
        description: "Your favorite instant noodles with the classic Indian spice masala blend.",
        price: 168,
        category: "Instant Foods",
        stock: 200,
        image: "instant",
        unit: "packet",
        type: "Veg",
        lowStockThreshold: 20,
      },
      {
        name: "Aashirvaad Shudh Chakki Atta (5kg)",
        description: "100% stone-ground whole wheat flour for soft and fluffy rotis.",
        price: 260,
        category: "Staples & Spices",
        stock: 100,
        image: "staples",
        unit: "packet",
        type: "Veg",
        lowStockThreshold: 15,
      },
      {
        name: "Fortune Soya Health Oil (1L)",
        description: "Refined soyabean oil, lightweight and fortified with vitamins A and D.",
        price: 140,
        category: "Staples & Spices",
        stock: 85,
        image: "staples",
        unit: "bottle",
        type: "Veg",
        lowStockThreshold: 15,
      }
    ];

    const seeded = await Product.insertMany(sampleProducts);
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
  updateProduct,
  deleteProduct,
  seedProducts,
};
