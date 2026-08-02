const router = require("express").Router();
const { protect, authorize } = require("../middleware/auth");
const {
  getDashboardStats,
  getSalesReport,
  getOrderReport,
  getTopProducts,
  getRevenueChart,
  getMetrics,
  getOrdersByStatus,
  getCategoryPerformance,
  getCustomerAcquisition,
  getExportReport,
  getFunnel,
} = require("../controllers/analyticsController");

router.use(protect, authorize("admin"));

router.get("/dashboard", getDashboardStats);
router.get("/dashboard-stats", getDashboardStats);
router.get("/metrics", getMetrics);
router.get("/sales", getSalesReport);
router.get("/orders", getOrderReport);
router.get("/orders-by-status", getOrdersByStatus);
router.get("/top-products", getTopProducts);
router.get("/revenue-chart", getRevenueChart);
router.get("/category-performance", getCategoryPerformance);
router.get("/customer-acquisition", getCustomerAcquisition);
router.get("/funnel", getFunnel);
router.get("/export", getExportReport);

module.exports = router;
