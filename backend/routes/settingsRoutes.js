const express = require("express");
const router = express.Router();
const { getSettings, updateSettings } = require("../controllers/settingsController");
const { protect, admin } = require("../middlewares/authMiddleware");

// GET is public, PUT is admin-only
router.route("/")
  .get(getSettings)
  .put(protect, admin, updateSettings);

module.exports = router;
