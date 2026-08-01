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
    body("cartAmount")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Cart amount must be a positive number"),
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
      .isIn(["percentage", "fixed", "free_shipping"])
      .withMessage("Discount type must be percentage, fixed, or free_shipping"),
    body("discountValue")
      .isFloat({ min: 0 })
      .withMessage("Discount value must be a positive number"),
    body("validFrom").isISO8601().withMessage("Valid from date is required"),
    body("validTill").isISO8601().withMessage("Valid till date is required"),
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
      .isIn(["percentage", "fixed", "free_shipping"])
      .withMessage("Discount type must be percentage, fixed, or free_shipping"),
    body("discountValue")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Discount value must be a positive number"),
    body("validFrom").optional().isISO8601().withMessage("Valid from date is required"),
    body("validTill").optional().isISO8601().withMessage("Valid till date is required"),
  ],
  validate,
  updateCoupon
);

router.delete("/:id", protect, authorize("admin"), deleteCoupon);

module.exports = router;
