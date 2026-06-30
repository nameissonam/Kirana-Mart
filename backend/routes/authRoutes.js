const express = require("express");
const router = express.Router();
const {
  registerUser,
  authUser,
  getUserProfile,
  addAddress,
  deleteAddress,
} = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");

router.post("/register", registerUser);
router.post("/login", authUser);
router.get("/profile", protect, getUserProfile);
router.post("/address", protect, addAddress);
router.delete("/address/:addressId", protect, deleteAddress);

module.exports = router;
