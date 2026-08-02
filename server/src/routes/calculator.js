const router = require("express").Router();
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/auth");
const {
  calculatePrice,
  getCalculatorConfig,
  updateCalculatorConfig,
  enableCalculatorForAll,
} = require("../controllers/calculatorController");

router.get("/:productId", protect, calculatePrice);
router.get("/:productId/config", protect, getCalculatorConfig);
router.put("/:productId/config", protect, authorize("admin"), updateCalculatorConfig);
router.post("/enable-all", protect, authorize("admin"), enableCalculatorForAll);

module.exports = router;