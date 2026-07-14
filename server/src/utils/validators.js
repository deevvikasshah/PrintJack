const Joi = require("joi");

const registerValidator = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name must be at least 2 characters",
    "string.max": "Name cannot exceed 100 characters",
  }),
  email: Joi.string().email().required().lowercase().messages({
    "string.empty": "Email is required",
    "string.email": "Please provide a valid email address",
  }),
  password: Joi.string().min(8).max(128).required().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/).messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 8 characters",
    "string.max": "Password cannot exceed 128 characters",
    "string.pattern.base": "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
  }),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "any.only": "Passwords do not match",
    "string.empty": "Please confirm your password",
  }),
  phone: Joi.string().pattern(/^[6-9]\d{9}$/).optional().messages({
    "string.pattern.base": "Please provide a valid 10-digit Indian mobile number",
  }),
  referralCode: Joi.string().alphanum().length(8).optional(),
});

const loginValidator = Joi.object({
  email: Joi.string().email().required().lowercase().messages({
    "string.empty": "Email is required",
    "string.email": "Please provide a valid email address",
  }),
  password: Joi.string().required().messages({
    "string.empty": "Password is required",
  }),
});

const productValidator = Joi.object({
  name: Joi.string().min(2).max(200).required().messages({
    "string.empty": "Product name is required",
    "string.min": "Product name must be at least 2 characters",
    "string.max": "Product name cannot exceed 200 characters",
  }),
  description: Joi.string().min(10).max(5000).required().messages({
    "string.empty": "Product description is required",
    "string.min": "Description must be at least 10 characters",
    "string.max": "Description cannot exceed 5000 characters",
  }),
  price: Joi.number().positive().precision(2).required().messages({
    "number.base": "Price must be a number",
    "number.positive": "Price must be greater than zero",
    "any.required": "Price is required",
  }),
  category: Joi.string().required().messages({
    "string.empty": "Category is required",
  }),
  subcategory: Joi.string().optional().allow("", null),
  images: Joi.array().items(Joi.string().uri()).min(1).max(10).optional().messages({
    "array.min": "At least one product image is required",
    "array.max": "Maximum 10 images allowed",
  }),
  sizes: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      price: Joi.number().positive().required(),
      stock: Joi.number().integer().min(0).required(),
    })
  ).optional(),
  colors: Joi.array().items(Joi.string()).optional(),
  material: Joi.string().max(100).optional(),
  bulkPricing: Joi.array().items(
    Joi.object({
      minQuantity: Joi.number().integer().positive().required(),
      discountPercent: Joi.number().min(0).max(100).required(),
      price: Joi.number().positive().optional(),
    })
  ).optional(),
  tags: Joi.array().items(Joi.string().max(50)).max(20).optional(),
  isActive: Joi.boolean().optional(),
  stock: Joi.number().integer().min(0).optional(),
  weight: Joi.number().min(0).optional(),
  sku: Joi.string().max(50).optional(),
});

const orderValidator = Joi.object({
  items: Joi.array().min(1).required().messages({
    "array.min": "Order must contain at least one item",
    "any.required": "Items are required",
  }),
  "items.*.product": Joi.string().required().messages({
    "string.empty": "Product ID is required for each item",
  }),
  "items.*.quantity": Joi.number().integer().positive().required().messages({
    "number.positive": "Quantity must be at least 1",
    "any.required": "Quantity is required",
  }),
  "items.*.size": Joi.string().optional().allow("", null),
  "items.*.color": Joi.string().optional().allow("", null),
  "items.*.customization": Joi.object({
    text: Joi.string().max(200).optional(),
    imageUrl: Joi.string().uri().optional(),
    notes: Joi.string().max(500).optional(),
  }).optional(),
  shippingAddress: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    phone: Joi.string().pattern(/^[6-9]\d{9}$/).required(),
    street: Joi.string().min(5).max(300).required(),
    city: Joi.string().min(2).max(100).required(),
    state: Joi.string().min(2).max(100).required(),
    pincode: Joi.string().pattern(/^[1-9][0-9]{5}$/).required().messages({
      "string.pattern.base": "Please provide a valid 6-digit Indian pincode",
    }),
    landmark: Joi.string().max(200).optional().allow("", null),
  }).required(),
  billingAddress: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    street: Joi.string().min(5).max(300).required(),
    city: Joi.string().min(2).max(100).required(),
    state: Joi.string().min(2).max(100).required(),
    pincode: Joi.string().pattern(/^[1-9][0-9]{5}$/).required(),
    gstin: Joi.string().pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/).optional().allow("", null),
  }).optional(),
  paymentMethod: Joi.string().valid("razorpay", "cod", "upi", "netbanking", "wallet").required().messages({
    "any.only": "Please select a valid payment method",
    "any.required": "Payment method is required",
  }),
  couponCode: Joi.string().alphanum().max(20).optional().allow("", null),
  notes: Joi.string().max(500).optional().allow("", null),
});

const couponValidator = Joi.object({
  code: Joi.string().alphanum().min(3).max(20).required().uppercase().messages({
    "string.empty": "Coupon code is required",
    "string.alphanum": "Coupon code can only contain letters and numbers",
    "string.min": "Coupon code must be at least 3 characters",
    "string.max": "Coupon code cannot exceed 20 characters",
  }),
  description: Joi.string().max(300).optional().allow("", null),
  discountType: Joi.string().valid("percentage", "flat").required().messages({
    "any.only": "Discount type must be either 'percentage' or 'flat'",
    "any.required": "Discount type is required",
  }),
  discountValue: Joi.number().positive().required().messages({
    "number.positive": "Discount value must be greater than zero",
    "any.required": "Discount value is required",
  }),
  maxDiscount: Joi.number().min(0).optional(),
  minOrderAmount: Joi.number().min(0).optional(),
  maxUses: Joi.number().integer().positive().optional(),
  usedCount: Joi.number().integer().min(0).optional(),
  applicableCategories: Joi.array().items(Joi.string()).optional(),
  excludeProducts: Joi.array().items(Joi.string()).optional(),
  validFrom: Joi.date().optional(),
  validTill: Joi.date().greater(Joi.ref("validFrom")).optional().messages({
    "date.greater": "End date must be after start date",
  }),
  isActive: Joi.boolean().optional(),
  applicableFor: Joi.string().valid("all", "new_users", "existing_users", "referral").optional(),
});

const addressValidator = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    "string.empty": "Recipient name is required",
    "string.min": "Name must be at least 2 characters",
  }),
  phone: Joi.string().pattern(/^[6-9]\d{9}$/).required().messages({
    "string.pattern.base": "Please provide a valid 10-digit Indian mobile number",
    "any.required": "Phone number is required",
  }),
  street: Joi.string().min(5).max(300).required().messages({
    "string.empty": "Street address is required",
    "string.min": "Street address must be at least 5 characters",
  }),
  city: Joi.string().min(2).max(100).required().messages({
    "string.empty": "City is required",
  }),
  state: Joi.string().min(2).max(100).required().messages({
    "string.empty": "State is required",
  }),
  pincode: Joi.string()
    .pattern(/^[1-9][0-9]{5}$/)
    .required()
    .messages({
      "string.pattern.base": "Please provide a valid 6-digit Indian pincode",
      "any.required": "Pincode is required",
    }),
  landmark: Joi.string().max(200).optional().allow("", null),
  isDefault: Joi.boolean().optional(),
  type: Joi.string().valid("home", "work", "other").optional(),
});

const blogValidator = Joi.object({
  title: Joi.string().min(5).max(200).required().messages({
    "string.empty": "Blog title is required",
    "string.min": "Title must be at least 5 characters",
    "string.max": "Title cannot exceed 200 characters",
  }),
  slug: Joi.string().pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional().messages({
    "string.pattern.base": "Slug must be URL-friendly (lowercase, hyphens only)",
  }),
  content: Joi.string().min(50).max(50000).required().messages({
    "string.empty": "Blog content is required",
    "string.min": "Content must be at least 50 characters",
    "string.max": "Content cannot exceed 50,000 characters",
  }),
  excerpt: Joi.string().max(500).optional().allow("", null),
  featuredImage: Joi.string().uri().optional().allow("", null),
  categories: Joi.array().items(Joi.string()).min(1).required().messages({
    "array.min": "At least one category is required",
  }),
  tags: Joi.array().items(Joi.string().max(50)).max(20).optional(),
  status: Joi.string().valid("draft", "published", "archived").optional(),
  metaTitle: Joi.string().max(70).optional().allow("", null),
  metaDescription: Joi.string().max(160).optional().allow("", null),
});

module.exports = {
  registerValidator,
  loginValidator,
  productValidator,
  orderValidator,
  couponValidator,
  addressValidator,
  blogValidator,
};
