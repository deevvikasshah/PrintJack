const router = require("express").Router();
const { protect, authorize } = require("../middleware/auth");
const {
  getDashboardStats,
  getSalesReport,
  getOrderReport,
  getTopProducts,
  getRevenueChart,
} = require("../controllers/analyticsController");

router.use(protect, authorize("admin"));

router.get("/dashboard", getDashboardStats);
router.get("/sales", getSalesReport);
router.get("/orders", getOrderReport);
router.get("/top-products", getTopProducts);
router.get("/revenue-chart", getRevenueChart);

module.exports = router;
