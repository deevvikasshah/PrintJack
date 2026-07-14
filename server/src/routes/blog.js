const router = require("express").Router();
const { body } = require("express-validator");
const { protect, authorize } = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
  getAllPosts,
  getPostsByTag,
  getPost,
  getRelatedPosts,
  createPost,
  updatePost,
  deletePost,
} = require("../controllers/blogController");

router.get("/", getAllPosts);
router.get("/tag/:tag", getPostsByTag);

router.post(
  "/",
  protect,
  authorize("admin"),
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("slug").trim().notEmpty().withMessage("Slug is required"),
    body("content").trim().notEmpty().withMessage("Content is required"),
  ],
  validate,
  createPost
);

router.put(
  "/:id",
  protect,
  authorize("admin"),
  [
    body("title").optional().trim().notEmpty().withMessage("Title cannot be empty"),
    body("content").optional().trim().notEmpty().withMessage("Content cannot be empty"),
  ],
  validate,
  updatePost
);

router.delete("/:id", protect, authorize("admin"), deletePost);

router.get("/:slug", getPost);
router.get("/:id/related", getRelatedPosts);

module.exports = router;
