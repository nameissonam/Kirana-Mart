const express = require("express");
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
} = require("../controllers/notificationController");
const { protect, admin } = require("../middlewares/authMiddleware");

// All notification routes are protected and restricted to Admins
router.route("/").get(protect, admin, getNotifications);
router.route("/read-all").put(protect, admin, markAllAsRead);
router.route("/:id/read").put(protect, admin, markAsRead);

module.exports = router;
