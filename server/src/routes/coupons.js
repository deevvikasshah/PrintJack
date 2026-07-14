const router = require("express").Router();
const { body } = require("express-validator");
const { protect, authorize } = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
  getAllCoupons,
  getMyCoupons,
  getCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
} = require("../controllers/couponsController");

router.get("/", protect, authorize("admin"), getAllCoupons);

router.get("/my", protect, getMyCoupons);

router.post(
  "/validate",
  protect,
  [
    body("code").trim().notEmpty().withMessage("Coupon code is required"),
    body("cartTotal")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Cart total must be a positive number"),
  ],
  validate,
  validateCoupon
);

router.get("/:id", protect, authorize("admin"), getCoupon);

router.post(
  "/",
  protect,
  authorize("admin"),
  [
    body("code").trim().notEmpty().withMessage("Coupon code is required"),
    body("discountType")
      .isIn(["percentage", "fixed"])
      .withMessage("Discount type must be percentage or fixed"),
    body("discountValue")
      .isFloat({ min: 0 })
      .withMessage("Discount value must be a positive number"),
    body("expiryDate").isISO8601().withMessage("Valid expiry date is required"),
  ],
  validate,
  createCoupon
);

router.put(
  "/:id",
  protect,
  authorize("admin"),
  [
    body("code").optional().trim().notEmpty().withMessage("Code cannot be empty"),
    body("discountType")
      .optional()
      .isIn(["percentage", "fixed"])
      .withMessage("Discount type must be percentage or fixed"),
    body("discountValue")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Discount value must be a positive number"),
    body("expiryDate").optional().isISO8601().withMessage("Valid expiry date is required"),
  ],
  validate,
  updateCoupon
);

router.delete("/:id", protect, authorize("admin"), deleteCoupon);

module.exports = router;
