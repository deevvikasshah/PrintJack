const router = require("express").Router();
const { body } = require("express-validator");
const { protect, authorize } = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
  createRazorpayOrder,
  verifyPayment,
  handleWebhook,
  refundPayment,
  getPaymentHistory,
} = require("../controllers/paymentsController");

router.post(
  "/create-order",
  protect,
  [
    body("amount")
      .isFloat({ min: 1 })
      .withMessage("Amount must be a positive number"),
    body("orderId").notEmpty().withMessage("Order ID is required"),
  ],
  validate,
  createRazorpayOrder
);

router.post(
  "/verify",
  protect,
  [
    body("razorpay_order_id").notEmpty().withMessage("Razorpay order ID is required"),
    body("razorpay_payment_id").notEmpty().withMessage("Razorpay payment ID is required"),
    body("razorpay_signature").notEmpty().withMessage("Razorpay signature is required"),
  ],
  validate,
  verifyPayment
);

router.post("/webhook", handleWebhook);

router.post(
  "/refund/:orderId",
  protect,
  authorize("admin"),
  [
    body("reason").optional().trim().notEmpty().withMessage("Reason cannot be empty"),
  ],
  validate,
  refundPayment
);

router.get("/history", protect, getPaymentHistory);

module.exports = router;
