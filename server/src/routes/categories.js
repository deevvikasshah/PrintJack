const router = require("express").Router();
const { body } = require("express-validator");
const { protect, authorize } = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
  getAllCategories,
  getCategoryTree,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoriesController");

router.get("/", getAllCategories);
router.get("/tree", getCategoryTree);

router.post(
  "/",
  protect,
  authorize("admin"),
  [
    body("name").trim().notEmpty().withMessage("Category name is required"),
    body("slug").trim().notEmpty().withMessage("Slug is required"),
  ],
  validate,
  createCategory
);

router.put(
  "/:id",
  protect,
  authorize("admin"),
  [
    body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
    body("slug").optional().trim().notEmpty().withMessage("Slug cannot be empty"),
  ],
  validate,
  updateCategory
);

router.delete("/:id", protect, authorize("admin"), deleteCategory);

router.get("/:idOrSlug", getCategory);

module.exports = router;
