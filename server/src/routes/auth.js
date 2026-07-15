const router = require("express").Router();
const { body } = require("express-validator");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");
const controller = require("../controllers/authController");

const {
  register,
  login,
  googleAuth,
  sendOTP,
  verifyOTP,
  forgotPassword,
  resetPassword,
  logout,
  getMe,
  updatePassword,
} = controller;

router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters"),
  ],
  validate,
  register
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  login
);

router.post("/google", googleAuth);

router.post(
  "/send-otp",
  [
    body("email").isEmail().withMessage("Valid email is required"),
  ],
  validate,
  sendOTP
);

router.post(
  "/verify-otp",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("otp").isLength({ min: 4, max: 6 }).withMessage("OTP must be 4-6 digits"),
  ],
  validate,
  verifyOTP
);

router.post(
  "/forgot-password",
  [
    body("email").isEmail().withMessage("Valid email is required"),
  ],
  validate,
  forgotPassword
);

router.put(
  "/reset-password/:token",
  [
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters"),
  ],
  validate,
  resetPassword
);

router.post("/logout", protect, logout);
router.get("/me", protect, getMe);

router.put(
  "/update-password",
  protect,
  [
    body("currentPassword").notEmpty().withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 8 })
      .withMessage("New password must be at least 8 characters"),
  ],
  validate,
  updatePassword
);

module.exports = router;
