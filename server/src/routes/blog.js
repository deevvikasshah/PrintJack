const router = require("express").Router();
const { body } = require("express-validator");
const { protect, authorize } = require("../middleware/auth");
const { upload } = require("../middleware/upload");
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
const Comment = require("../models/Comment");

router.get("/", getAllPosts);
router.get("/tag/:tag", getPostsByTag);

router.post(
  "/",
  protect,
  authorize("admin"),
  upload.single("image"),
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
  upload.single("image"),
  [
    body("title").optional().trim().notEmpty().withMessage("Title cannot be empty"),
    body("content").optional().trim().notEmpty().withMessage("Content cannot be empty"),
  ],
  validate,
  updatePost
);

router.delete("/:id", protect, authorize("admin"), deletePost);

router.get(
  "/:id/comments",
  async (req, res, next) => {
    try {
      const comments = await Comment.find({ post: req.params.id })
        .populate("user", "name avatar")
        .sort({ createdAt: -1 });
      res.status(200).json({ success: true, comments });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/:id/comments",
  protect,
  [
    body("text")
      .trim()
      .notEmpty()
      .withMessage("Comment text is required")
      .isLength({ max: 2000 })
      .withMessage("Comment cannot exceed 2000 characters"),
  ],
  validate,
  async (req, res, next) => {
    try {
      const comment = await Comment.create({
        post: req.params.id,
        user: req.user._id,
        text: req.body.text,
      });
      const populated = await Comment.findById(comment._id).populate("user", "name avatar");
      res.status(201).json({ success: true, comment: populated });
    } catch (err) {
      next(err);
    }
  }
);

router.get("/:slug", getPost);
router.get("/:id/related", getRelatedPosts);

module.exports = router;
