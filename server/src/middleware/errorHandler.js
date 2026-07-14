class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((e) => ({
    field: e.path,
    message: e.message,
  }));
  return new AppError(`Validation failed: ${errors.map((e) => e.message).join(". ")}`, 400);
};

const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  return new AppError(
    `Duplicate value for field '${field}': ${value}. Please use another value.`,
    409
  );
};

const handleCastError = (err) => {
  return new AppError(`Invalid ${err.path}: ${err.value}`, 400);
};

const handleJWTError = () => {
  return new AppError("Invalid token. Please log in again.", 401);
};

const handleJWTExpiredError = () => {
  return new AppError("Your token has expired. Please log in again.", 401);
};

const errorHandler = (err, req, res, _next) => {
  let error = { ...err };
  error.message = err.message;

  console.error("Error:", err);

  if (err.name === "ValidationError") {
    error = handleValidationError(err);
  } else if (err.code === 11000) {
    error = handleDuplicateKeyError(err);
  } else if (err.name === "CastError") {
    error = handleCastError(err);
  } else if (err.name === "JsonWebTokenError") {
    error = handleJWTError();
  } else if (err.name === "TokenExpiredError") {
    error = handleJWTExpiredError();
  }

  if (err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      error = new AppError("File size exceeds the 50MB limit.", 413);
    } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
      error = new AppError("Unexpected field in file upload.", 400);
    } else {
      error = new AppError(err.message, 400);
    }
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal server error";

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = { AppError, errorHandler };
