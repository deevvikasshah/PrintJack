const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const connectDB = require("./config/db");
const { errorHandler } = require("./middleware/errorHandler");
const { AppError } = require("./middleware/errorHandler");

// Route imports
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const productRoutes = require("./routes/products");
const categoryRoutes = require("./routes/categories");
const orderRoutes = require("./routes/orders");
const paymentRoutes = require("./routes/payments");
const designRoutes = require("./routes/designs");
const cartRoutes = require("./routes/cart");
const couponRoutes = require("./routes/coupons");
const blogRoutes = require("./routes/blog");
const uploadRoutes = require("./routes/upload");
const analyticsRoutes = require("./routes/analytics");
const referralRoutes = require("./routes/referrals");

// Connect to database
connectDB();

const app = express();

// Trust proxy (for rate limiter behind reverse proxy)
app.set("trust proxy", 1);

// Security headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Data sanitization
app.use(mongoSanitize());
app.use(xss());

// Prevent HTTP parameter pollution
app.use(
  hpp({
    whitelist: [
      "price",
      "rating",
      "category",
      "sort",
      "fields",
      "page",
      "limit",
    ],
  })
);

// Passport middleware
app.use(passport.initialize());

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "PrintJack API is running",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/users", limiter, userRoutes);
app.use("/api/products", limiter, productRoutes);
app.use("/api/categories", limiter, categoryRoutes);
app.use("/api/orders", limiter, orderRoutes);
app.use("/api/payments", limiter, paymentRoutes);
app.use("/api/designs", limiter, designRoutes);
app.use("/api/cart", limiter, cartRoutes);
app.use("/api/coupons", limiter, couponRoutes);
app.use("/api/blog", limiter, blogRoutes);
app.use("/api/upload", limiter, uploadRoutes);
app.use("/api/analytics", limiter, analyticsRoutes);
app.use("/api/referrals", limiter, referralRoutes);

// 404 handler
app.all("*", (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `PrintJack server running in ${process.env.NODE_ENV} mode on port ${PORT}`
  );
});

module.exports = app;
