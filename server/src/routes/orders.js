const router = require("express").Router();
const { body } = require("express-validator");
const { protect, authorize } = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
  createOrder,
  getMyOrders,
  getOrderStats,
  getAllOrders,
  getOrder,
  getInvoice,
  updateOrderStatus,
  approveDesign,
  cancelOrder,
  checkoutFromCart,
  verifyPaymentFromCheckout,
  trackOrder,
} = require("../controllers/ordersController");

router.post(
  "/checkout",
  protect,
  [
    body("shippingAddressId").notEmpty().withMessage("Shipping address is required"),
  ],
  validate,
  checkoutFromCart
);

router.post("/verify-payment", protect, verifyPaymentFromCheckout);

router.post(
  "/",
  protect,
  [
    body("shippingAddress").isObject().withMessage("Shipping address is required"),
    body("shippingAddress.fullName").trim().notEmpty().withMessage("Full name is required"),
    body("shippingAddress.phone").trim().notEmpty().withMessage("Phone is required"),
    body("shippingAddress.street").trim().notEmpty().withMessage("Street is required"),
    body("shippingAddress.city").trim().notEmpty().withMessage("City is required"),
    body("shippingAddress.state").trim().notEmpty().withMessage("State is required"),
    body("shippingAddress.pincode").trim().notEmpty().withMessage("Pincode is required"),
    body("shippingAddress.country").trim().notEmpty().withMessage("Country is required"),
  ],
  validate,
  createOrder
);

router.get("/my", protect, getMyOrders);

router.get("/track", trackOrder);

router.get("/stats", protect, authorize("admin"), getOrderStats);

router.get("/:id/invoice", protect, getInvoice);

router.get("/", protect, authorize("admin"), getAllOrders);

router.get("/:id", protect, getOrder);

router.put(
  "/:id/status",
  protect,
  authorize("admin"),
  [
    body("status")
      .isIn([
        "pending",
        "confirmed",
        "in_production",
        "quality_check",
        "shipped",
        "delivered",
        "cancelled",
        "returned",
      ])
      .withMessage("Invalid order status"),
  ],
  validate,
  updateOrderStatus
);

router.put("/:id/approve-design", protect, authorize("admin"), approveDesign);

router.put("/:id/cancel", protect, cancelOrder);

module.exports = router;
