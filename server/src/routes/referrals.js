const router = require("express").Router();
const { body } = require("express-validator");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
  getMyReferralCode,
  getReferralStats,
  applyReferral,
  getPendingRewards,
} = require("../controllers/referralsController");

router.get("/code", protect, getMyReferralCode);
router.get("/stats", protect, getReferralStats);

router.post(
  "/apply",
  protect,
  [
    body("code").trim().notEmpty().withMessage("Referral code is required"),
  ],
  validate,
  applyReferral
);

router.get("/rewards", protect, getPendingRewards);

module.exports = router;
