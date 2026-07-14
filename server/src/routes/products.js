const router = require("express").Router();
const { body, param } = require("express-validator");
const { protect, authorize } = require("../middleware/auth");
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
  getTemplates,
} = require("../controllers/productsController");

router.get("/", getAllProducts);
router.get("/featured", getFeaturedProducts);
router.get("/category/:slug", getProductsByCategory);

router.post(
  "/",
  protect,
  authorize("admin"),
  [
    body("name").trim().notEmpty().withMessage("Product name is required"),
    body("slug").trim().notEmpty().withMessage("Slug is required"),
    body("price")
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number"),
    body("category").notEmpty().withMessage("Category is required"),
  ],
  validate,
  createProduct
);

router.put(
  "/:id",
  protect,
  authorize("admin"),
  [
    body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
    body("price")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number"),
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
  ],
  validate,
  addProductReview
);

router.get("/:id/templates", getTemplates);

module.exports = router;
