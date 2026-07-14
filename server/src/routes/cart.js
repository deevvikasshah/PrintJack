const router = require("express").Router();
const { body } = require("express-validator");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  applyCoupon,
  removeCoupon,
  getCartCount,
} = require("../controllers/cartController");

router.get("/", protect, getCart);

router.post(
  "/add",
  protect,
  [
    body("productId").notEmpty().withMessage("Product ID is required"),
    body("quantity")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Quantity must be at least 1"),
  ],
  validate,
  addToCart
);

router.put(
  "/item/:itemId",
  protect,
  [
    body("quantity")
      .isInt({ min: 1 })
      .withMessage("Quantity must be at least 1"),
  ],
  validate,
  updateCartItem
);

router.delete("/item/:itemId", protect, removeFromCart);
router.delete("/clear", protect, clearCart);

router.post(
  "/coupon",
  protect,
  [
    body("code").trim().notEmpty().withMessage("Coupon code is required"),
  ],
  validate,
  applyCoupon
);

router.delete("/coupon", protect, removeCoupon);

router.get("/count", protect, getCartCount);

module.exports = router;
