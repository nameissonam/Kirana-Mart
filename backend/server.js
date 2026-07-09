require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const connectDB = require("./config/db");
const User = require("./models/User");
const Product = require("./models/Product");
const Settings = require("./models/Settings");
const { DEFAULT_STORE_ADDRESS } = require("./models/Settings");
const defaultProducts = require("./data/defaultProducts");

const app = express();

app.use(cors());

// Razorpay webhook signatures must be checked against the untouched request body.
const { handleWebhook } = require("./controllers/paymentController");
app.post("/api/payments/webhook", express.raw({ type: "application/json" }), handleWebhook);

app.use(express.json());

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded images statically
app.use("/uploads", express.static(uploadsDir));

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Kirana Mart Backend Running");
});

// Import route files
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const customerRoutes = require("./routes/customerRoutes");
const reportRoutes = require("./routes/reportRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const couponRoutes = require("./routes/couponRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

// Register route endpoints
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/payments", paymentRoutes);

// Dual-register report endpoints (both /api/reports and /api/v1/reports)
app.use("/api/reports", reportRoutes);
app.use("/api/v1/reports", reportRoutes);

// Seed default settings on startup
const seedSettings = async () => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      await Settings.create({ deliveryCharge: 10, homeDeliveryMinValue: 750, address: DEFAULT_STORE_ADDRESS });
      console.log("✓ Default settings seeded successfully");
    } else {
      let changed = false;
      if (settings.homeDeliveryMinValue === undefined) {
        settings.homeDeliveryMinValue = 750;
        changed = true;
      }
      if (!settings.address || settings.address === "123, Main Road, Bengaluru, Karnataka - 560001") {
        settings.address = DEFAULT_STORE_ADDRESS;
        changed = true;
      }
      if (changed) {
        await settings.save();
        console.log("✓ Store settings defaults updated");
      }
    }
  } catch (error) {
    console.error("Error seeding settings:", error.message);
  }
};

// Seed default categories
const seedCategories = async () => {
  try {
    const Category = require("./models/Category");
    const defaultCategories = require("./data/defaultCategories");
    for (const cat of defaultCategories) {
      const result = await Category.updateOne(
        { name: cat.name },
        { $set: cat },
        { upsert: true }
      );
      if (result.upsertedCount > 0) {
        console.log(`✓ Seeded category: ${cat.name}`);
      }
    }
  } catch (error) {
    console.error("Error seeding categories:", error.message);
  }
};

// Seed starter products without deleting products added from the admin dashboard.
const seedProducts = async () => {
  try {
    const existingCount = await Product.countDocuments();
    if (existingCount >= 12) {
      console.log("✓ Product catalog already seeded");
      return;
    }

    let addedCount = 0;
    for (const product of defaultProducts) {
      const result = await Product.updateOne(
        { name: product.name },
        { $setOnInsert: product },
        { upsert: true }
      );
      if (result.upsertedCount > 0) {
        addedCount += 1;
      }
    }

    console.log(`✓ Starter products seeded: ${addedCount}`);
  } catch (error) {
    console.error("Error seeding products:", error.message);
  }
};

// Seed admin account on startup
const seedAdmin = async () => {
  try {
    if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
      const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL });
      if (!adminExists) {
        await User.create({
          name: process.env.ADMIN_NAME || "Store Owner",
          email: process.env.ADMIN_EMAIL,
          password: process.env.ADMIN_PASSWORD,
          role: "admin",
        });
        console.log("✓ Admin account created successfully");
      } else {
        console.log("✓ Admin account already exists");
      }
    }
  } catch (error) {
    console.error("Error seeding admin:", error.message);
  }
};

// Initialize seeding functions before starting server
const initApp = async () => {
  try {
    await connectDB();
    await seedAdmin();
    await seedSettings();
    await seedCategories();
    await seedProducts();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Application startup failed:", error.message);
    process.exit(1);
  }
};

initApp();
