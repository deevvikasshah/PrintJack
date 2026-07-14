const router = require("express").Router();
const { body } = require("express-validator");
const { protect, authorize } = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
  saveDesign,
  getMyDesigns,
  getPendingApprovals,
  getDesign,
  updateDesign,
  deleteDesign,
  submitForPrint,
  approveDesign,
  exportDesign,
} = require("../controllers/designsController");

router.post(
  "/",
  protect,
  [
    body("name").trim().notEmpty().withMessage("Design name is required"),
    body("template").notEmpty().withMessage("Template ID is required"),
  ],
  validate,
  saveDesign
);

router.get("/my", protect, getMyDesigns);
router.get("/pending", protect, authorize("admin"), getPendingApprovals);

router.get("/:id", protect, getDesign);

router.put(
  "/:id",
  protect,
  [
    body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
  ],
  validate,
  updateDesign
);

router.delete("/:id", protect, deleteDesign);

router.put("/:id/submit", protect, submitForPrint);
router.put("/:id/approve", protect, authorize("admin"), approveDesign);
router.get("/:id/export", protect, exportDesign);

module.exports = router;
