const router = require("express").Router();
const { body } = require("express-validator");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
  getMyReferralCode,
  getReferralStats,
  applyReferral,
  getPendingRewards,
  getReferralHistory,
} = require("../controllers/referralsController");

router.get("/code", protect, getMyReferralCode);
router.get("/stats", protect, getReferralStats);
router.get("/history", protect, getReferralHistory);

router.post(
  "/apply",
  protect,
  [
    body("referralCode").trim().notEmpty().withMessage("Referral code is required"),
  ],
  validate,
  applyReferral
);

router.get("/rewards", protect, getPendingRewards);

module.exports = router;
