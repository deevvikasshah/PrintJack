const router = require("express").Router();
const { protect, authorize } = require("../middleware/auth");
const {
  createTemplate,
  getTemplates,
  getTemplate,
  updateTemplate,
  deleteTemplate,
  getMyTemplates,
} = require("../controllers/templatesController");

router.route("/")
  .post(protect, createTemplate)
  .get(protect, getTemplates);

router.route("/my")
  .get(protect, getMyTemplates);

router.route("/:id")
  .get(protect, getTemplate)
  .put(protect, updateTemplate)
  .delete(protect, deleteTemplate);

module.exports = router;