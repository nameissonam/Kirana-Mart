const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  seedProducts,
} = require("../controllers/productController");

const { protect, admin } = require("../middlewares/authMiddleware");

const productUploadsDir = path.join(__dirname, "../uploads/products");
fs.mkdirSync(productUploadsDir, { recursive: true });

// Product images are stored locally and served from /uploads/products.
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, productUploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname).toLowerCase() || `.${file.mimetype.split("/")[1]}`;
    cb(null, `product-${uniqueSuffix}${extension}`);
  },
});

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!allowedImageTypes.has(file.mimetype)) {
      return cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "image"));
    }
    cb(null, true);
  },
});

// GET all products (Public)
router.get("/", getProducts);

// GET single product (Public)
router.get("/:id", getProductById);

// POST create product (Admin only)
router.post("/", protect, admin, createProduct);

// PUT update product (Admin only)
router.put("/:id", protect, admin, updateProduct);

// DELETE product (Admin only)
router.delete("/:id", protect, admin, deleteProduct);

// POST seed products (Admin only)
router.post("/seed", protect, admin, seedProducts);

// POST upload product image (Admin only)
router.post("/upload", protect, admin, (req, res) => {
  upload.single("image")(req, res, (error) => {
    if (error) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ message: "Image must be 2MB or smaller." });
      }
      return res.status(400).json({ message: "Only JPG, PNG, and WEBP images are allowed." });
    }
    if (!req.file) {
      return res.status(400).json({ message: "Choose an image to upload." });
    }
    res.status(200).json({ imageUrl: `/uploads/products/${req.file.filename}` });
  });
});

module.exports = router;
