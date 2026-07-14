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
  updateOrderStatus,
  approveDesign,
  cancelOrder,
} = require("../controllers/ordersController");

router.post(
  "/",
  protect,
  [
    body("items").isArray({ min: 1 }).withMessage("At least one item is required"),
    body("items.*.product").notEmpty().withMessage("Product ID is required"),
    body("items.*.quantity")
      .isInt({ min: 1 })
      .withMessage("Quantity must be at least 1"),
    body("shippingAddress").isObject().withMessage("Shipping address is required"),
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

router.get("/stats", protect, authorize("admin"), getOrderStats);

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
        "processing",
        "design_pending",
        "design_approved",
        "printing",
        "shipped",
        "delivered",
        "cancelled",
      ])
      .withMessage("Invalid order status"),
  ],
  validate,
  updateOrderStatus
);

router.put("/:id/approve-design", protect, authorize("admin"), approveDesign);

router.put("/:id/cancel", protect, cancelOrder);

module.exports = router;
