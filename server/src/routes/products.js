const router = require("express").Router();
const { body, param } = require("express-validator");
const { protect, authorize } = require("../middleware/auth");
const { upload } = require("../middleware/upload");
const validate = require("../middleware/validate");
const {
  getAllProducts,
  getFeaturedProducts,
  getProductsByCategory,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getRelatedProducts,
  addProductReview,
  markReviewHelpful,
  getTemplates,
} = require("../controllers/productsController");
const {
  calculatePrice,
  getCalculatorConfig,
} = require("../controllers/calculatorController");

router.get("/", getAllProducts);
router.get("/featured", getFeaturedProducts);
router.get("/category/:slug", getProductsByCategory);

router.post(
  "/",
  protect,
  authorize("admin"),
  upload.array("images", 10),
  [
    body("name").trim().notEmpty().withMessage("Product name is required"),
    body("basePrice")
      .isFloat({ min: 0 })
      .withMessage("Base price must be a positive number"),
    body("category").notEmpty().withMessage("Category is required"),
  ],
  validate,
  createProduct
);

router.put(
  "/:id",
  protect,
  authorize("admin"),
  upload.array("images", 10),
  [
    body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
    body("basePrice")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Base price must be a positive number"),
  ],
  validate,
  updateProduct
);

router.delete("/:id", protect, authorize("admin"), deleteProduct);

router.get("/:idOrSlug", getProduct);

router.get("/:id/related", getRelatedProducts);

router.post(
  "/:id/reviews",
  protect,
  [
    body("rating")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),
    body("comment").trim().notEmpty().withMessage("Review comment is required"),
    body("title").optional().trim(),
  ],
  validate,
  addProductReview
);

router.post(
  "/:id/reviews/:reviewId/helpful",
  protect,
  [
    param("id").isMongoId().withMessage("Invalid product ID"),
    param("reviewId").isMongoId().withMessage("Invalid review ID"),
  ],
  validate,
  markReviewHelpful
);

router.get("/:id/templates", getTemplates);

router.post("/:productId/calculate", calculatePrice);
router.get("/:productId/calculator-config", getCalculatorConfig);

module.exports = router;
