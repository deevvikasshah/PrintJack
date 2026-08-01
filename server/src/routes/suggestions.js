const router = require("express").Router();
const { protect } = require("../middleware/auth");
const { getSuggestions, applySuggestion } = require("../controllers/suggestionsController");

router.get("/:productId", protect, getSuggestions);
router.post("/:productId/apply", protect, applySuggestion);

module.exports = router;