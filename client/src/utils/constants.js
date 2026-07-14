export const API_URL = import.meta.env.VITE_API_URL || '/api';
export const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_XXXXXXXXXXXXXXX';

export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'processing',
  'printing',
  'quality_check',
  'shipped',
  'out_for_delivery',
  'delivered',
  'cancelled',
  'returned',
  'refunded',
];

export const PAYMENT_STATUSES = [
  'pending',
  'processing',
  'completed',
  'failed',
  'refunded',
  'partially_refunded',
];

export const PRODUCT_CATEGORIES = [
  { slug: 't-shirts', name: 'T-Shirts', icon: 'Shirt' },
  { slug: 'hoodies', name: 'Hoodies', icon: 'Shirt' },
  { slug: 'mugs', name: 'Mugs', icon: 'Coffee' },
  { slug: 'phone-cases', name: 'Phone Cases', icon: 'Smartphone' },
  { slug: 'tote-bags', name: 'Tote Bags', icon: 'ShoppingBag' },
  { slug: 'posters', name: 'Posters', icon: 'Image' },
  { slug: 'stickers', name: 'Stickers', icon: 'Sticker' },
  { slug: 'business-cards', name: 'Business Cards', icon: 'CreditCard' },
  { slug: 'flyers', name: 'Flyers', icon: 'FileText' },
  { slug: 'banners', name: 'Banners', icon: 'Flag' },
  { slug: 'caps', name: 'Caps & Hats', icon: 'Crown' },
  { slug: 'notebooks', name: 'Notebooks', icon: 'BookOpen' },
  { slug: 'mousepads', name: 'Mouse Pads', icon: 'Monitor' },
  { slug: 'custom-prints', name: 'Custom Prints', icon: 'Paintbrush' },
];

export const COLORS = [
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Black', hex: '#000000' },
  { name: 'Navy', hex: '#1D3557' },
  { name: 'Red', hex: '#E63946' },
  { name: 'Royal Blue', hex: '#2563EB' },
  { name: 'Forest Green', hex: '#16A34A' },
  { name: 'Yellow', hex: '#EAB308' },
  { name: 'Orange', hex: '#F97316' },
  { name: 'Purple', hex: '#9333EA' },
  { name: 'Pink', hex: '#EC4899' },
  { name: 'Grey', hex: '#6B7280' },
  { name: 'Maroon', hex: '#9D174D' },
];

export const SIZES = {
  't-shirts': ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
  hoodies: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
  caps: ['S', 'M', 'L', 'XL'],
  'phone-cases': ['Universal', 'iPhone 15', 'iPhone 14', 'Samsung S24', 'Samsung S23'],
  default: ['One Size'],
};

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi',
  'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

export const GST_RATE = 0.18;
export const FREE_SHIPPING_THRESHOLD = 999;
export const SHIPPING_COST = 99;

export const MAX_FILE_SIZE = 10 * 1024 * 1024;
export const ACCEPTED_IMAGE_FORMATS = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];
