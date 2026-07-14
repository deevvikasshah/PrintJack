const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });


const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const Setting = require('../models/Setting');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/printjack';

const categoryData = {
  'Business Cards': {
    description: 'Professional business cards with premium finishes',
    subcategories: [
      'Matt Lamination', 'Matt Lam+Spot UV', 'Matt Lam+Gold Foil',
      'Matt Lam+Spot UV+Gold Foil', 'Round Corner', 'Special Paper',
      'Metallic Paper', 'Non-Tearable Paper',
    ],
  },
  'Stationery': {
    description: 'Complete range of office and personal stationery',
    subcategories: [
      'Letterhead', 'Envelope', 'File', 'Pen', 'Pencil', 'Diary',
      'Paper Bag', 'Identity Card', 'Calendar', 'Wrapping Paper',
      'Money Envelope', 'Greeting Card', 'Coaster', 'Table Calendar',
      'Thank You Card', 'Batch/Sticker',
    ],
  },
  'Stickers': {
    description: 'Custom stickers for every need',
    subcategories: [
      'Cromo Sticker', 'Non-Tearable', 'Transparent', 'UV DTF',
      'Vinyl Sticker', 'UV DTF Gold', 'Gold Foil',
    ],
  },
  'Apparel': {
    description: 'Custom printed apparel',
    subcategories: ['T-Shirt V-Neck', 'T-Shirt Round Neck', 'T-Shirt Polo', 'Cap', 'Hoodie'],
  },
  'Marketing': {
    description: 'Marketing and promotional materials',
    subcategories: [
      'Brochures', 'Flyers', 'Tent Card', 'Wobbler', 'Dangler',
      'Standee', 'Flex Banner', 'Vinyl Banner', 'Pamphlet',
    ],
  },
  'Wide Format': {
    description: 'Large format printing solutions',
    subcategories: ['Canvas', 'Flex', 'Sunboard', 'Photo Paper'],
  },
  'Mugs & Drinkware': {
    description: 'Custom printed mugs and drinkware',
    subcategories: ['Coffee Mug', 'Tea Mug', 'Water Bottle', 'Sipper'],
  },
  'Keychains & Gifts': {
    description: 'Personalized keychains and gift items',
    subcategories: ['Acrylic Keychain', 'Metal Keychain', 'Wooden Keychain', 'Photo Frame', 'Clock'],
  },
};

const productTemplates = {
  'Business Cards': [
    { name: 'Premium Matt Laminated Business Card', basePrice: 299, printingMethod: 'Offset', material: '350 GSM Art Card' },
    { name: 'Spot UV Business Card', basePrice: 449, printingMethod: 'Offset + Spot UV', material: '350 GSM Art Card' },
    { name: 'Gold Foil Business Card', basePrice: 599, printingMethod: 'Offset + Foil', material: '350 GSM Art Card' },
    { name: 'Round Corner Business Card', basePrice: 349, printingMethod: 'Digital', material: '300 GSM Art Card' },
    { name: 'Metallic Silver Business Card', basePrice: 699, printingMethod: 'Offset', material: 'Metallic Paper 290 GSM' },
    { name: 'Non-Tearable Business Card', basePrice: 499, printingMethod: 'Digital', material: 'Synthetic Paper' },
  ],
  'Stationery': [
    { name: 'Custom Letterhead A4', basePrice: 499, printingMethod: 'Digital', material: '100 GSM Bond Paper' },
    { name: 'Printed Envelope DL', basePrice: 199, printingMethod: 'Digital', material: '100 GSM Bond Paper' },
    { name: 'Branded File Folder', basePrice: 89, printingMethod: 'Screen Print', material: '300 GSM Card' },
    { name: 'Custom Diary 2025', basePrice: 349, printingMethod: 'Digital', material: '100 GSM Maplitho' },
    { name: 'Paper Bag Medium', basePrice: 25, printingMethod: 'Screen Print', material: '150 GSM Kraft Paper' },
    { name: 'Identity Card with Lanyard', basePrice: 149, printingMethod: 'Digital', material: 'PVC 0.5mm' },
    { name: 'Table Calendar 2025', basePrice: 199, printingMethod: 'Digital', material: '300 GSM Art Card' },
    { name: 'Thank You Card', basePrice: 149, printingMethod: 'Digital', material: '300 GSM Art Card' },
    { name: 'Money Envelope Set', basePrice: 99, printingMethod: 'Offset', material: '120 GSM Art Paper' },
    { name: 'Greeting Card Custom', basePrice: 79, printingMethod: 'Digital', material: '300 GSM Art Card' },
    { name: 'Coaster Custom', basePrice: 59, printingMethod: 'Sublimation', material: 'Hardboard 3mm' },
    { name: 'Wrapping Paper Roll', basePrice: 399, printingMethod: 'Rotary', material: '80 GSM Art Paper' },
  ],
  'Stickers': [
    { name: 'Cromo Sticker Sheet', basePrice: 149, printingMethod: 'Offset', material: 'Cromo Paper' },
    { name: 'Non-Tearable Sticker Roll', basePrice: 299, printingMethod: 'Digital', material: 'PP Synthetic' },
    { name: 'Transparent Sticker Sheet', basePrice: 199, printingMethod: 'Digital', material: 'Clear Vinyl' },
    { name: 'UV DTF Sticker Roll', basePrice: 599, printingMethod: 'UV DTF', material: 'PET Film' },
    { name: 'Vinyl Sticker Decal', basePrice: 249, printingMethod: 'Eco Solvent', material: 'Cast Vinyl' },
    { name: 'UV DTF Gold Sticker', basePrice: 799, printingMethod: 'UV DTF', material: 'Gold PET Film' },
    { name: 'Gold Foil Sticker', basePrice: 449, printingMethod: 'Hot Foil', material: 'Foil Paper' },
  ],
  'Apparel': [
    { name: 'Round Neck T-Shirt Custom', basePrice: 249, printingMethod: 'DTG', material: '100% Cotton 180 GSM' },
    { name: 'V-Neck T-Shirt Custom', basePrice: 279, printingMethod: 'DTG', material: '100% Cotton 180 GSM' },
    { name: 'Polo T-Shirt Custom', basePrice: 449, printingMethod: 'DTG', material: 'Piqué Cotton 220 GSM' },
    { name: 'Custom Printed Cap', basePrice: 199, printingMethod: 'Embroidery', material: 'Cotton Twill' },
    { name: 'Custom Hoodie', basePrice: 799, printingMethod: 'DTG', material: 'Fleece 320 GSM' },
  ],
  'Marketing': [
    { name: 'Brochure A4 Tri-Fold', basePrice: 599, printingMethod: 'Offset', material: '170 GSM Art Paper' },
    { name: 'Flyer A5 Single', basePrice: 299, printingMethod: 'Digital', material: '150 GSM Art Paper' },
    { name: 'Tent Card', basePrice: 199, printingMethod: 'Digital', material: '300 GSM Art Card' },
    { name: 'Wobbler', basePrice: 149, printingMethod: 'Digital', material: 'Acrylic + Sticker' },
    { name: 'Dangler', basePrice: 129, printingMethod: 'Digital', material: '300 GSM Card' },
    { name: 'Standee 6ft', basePrice: 1499, printingMethod: 'UV Print', material: 'Sunboard + Roll-up' },
    { name: 'Flex Banner 4x3 ft', basePrice: 599, printingMethod: 'UV Print', material: 'Frontlit Flex' },
    { name: 'Vinyl Sticker Banner', basePrice: 499, printingMethod: 'Eco Solvent', material: 'Vinyl 130 GSM' },
    { name: 'Pamphlet A5', basePrice: 399, printingMethod: 'Offset', material: '100 GSM Newsprint' },
  ],
  'Wide Format': [
    { name: 'Canvas Print A3', basePrice: 599, printingMethod: 'Canvas Print', material: '340 GSM Canvas' },
    { name: 'Flex Banner 10x5 ft', basePrice: 1299, printingMethod: 'UV Print', material: 'Frontlit Flex' },
    { name: 'Sunboard Print 2x3 ft', basePrice: 499, printingMethod: 'UV Print', material: '5mm Sunboard' },
    { name: 'Photo Print A2', basePrice: 399, printingMethod: 'Photo Print', material: '260 GSM Glossy Photo Paper' },
  ],
  'Mugs & Drinkware': [
    { name: 'Ceramic Coffee Mug 11oz', basePrice: 199, printingMethod: 'Sublimation', material: 'Ceramic White' },
    { name: 'Glass Tea Mug 300ml', basePrice: 299, printingMethod: 'Sublimation', material: 'Borosilicate Glass' },
    { name: 'Steel Water Bottle 750ml', basePrice: 449, printingMethod: 'UV Print', material: 'Stainless Steel' },
    { name: 'Plastic Sipper 500ml', basePrice: 249, printingMethod: 'UV Print', material: 'Tritan Plastic' },
  ],
  'Keychains & Gifts': [
    { name: 'Acrylic Keychain', basePrice: 79, printingMethod: 'UV Print', material: '3mm Acrylic' },
    { name: 'Metal Keychain', basePrice: 149, printingMethod: 'Laser Engrave', material: 'Stainless Steel' },
    { name: 'Wooden Keychain', basePrice: 99, printingMethod: 'Laser Engrave', material: 'Bamboo Wood' },
    { name: 'Photo Frame 5x7', basePrice: 299, printingMethod: 'Sublimation', material: 'MDF + Glass' },
    { name: 'Wall Clock Custom', basePrice: 499, printingMethod: 'Sublimation', material: 'MDF 6mm' },
  ],
};

const bulkPricingSets = {
  low: [
    { minQty: 10, maxQty: 24, price: 0 },
    { minQty: 25, maxQty: 99, price: -10 },
    { minQty: 100, maxQty: 499, price: -20 },
    { minQty: 500, maxQty: 999, price: -30 },
    { minQty: 1000, maxQty: 99999, price: -40 },
  ],
  mid: [
    { minQty: 5, maxQty: 19, price: 0 },
    { minQty: 20, maxQty: 49, price: -5 },
    { minQty: 50, maxQty: 199, price: -15 },
    { minQty: 200, maxQty: 999, price: -25 },
    { minQty: 1000, maxQty: 99999, price: -35 },
  ],
  high: [
    { minQty: 1, maxQty: 4, price: 0 },
    { minQty: 5, maxQty: 14, price: -5 },
    { minQty: 15, maxQty: 49, price: -10 },
    { minQty: 50, maxQty: 199, price: -20 },
  ],
};

const couponData = [
  {
    code: 'WELCOME10',
    description: '10% off on your first order',
    discountType: 'percentage',
    discountValue: 10,
    minimumOrderAmount: 299,
    maximumDiscountAmount: 500,
    usageLimit: 1,
    validFrom: new Date(),
    validTill: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
  },
  {
    code: 'FLAT50',
    description: 'Flat ₹50 off on orders above ₹499',
    discountType: 'fixed',
    discountValue: 50,
    minimumOrderAmount: 499,
    maximumDiscountAmount: 50,
    usageLimit: 5000,
    validFrom: new Date(),
    validTill: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
  },
  {
    code: 'FREESHIP',
    description: 'Free shipping on all orders',
    discountType: 'free_shipping',
    discountValue: 0,
    minimumOrderAmount: 0,
    maximumDiscountAmount: 0,
    usageLimit: 10000,
    validFrom: new Date(),
    validTill: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
  },
];

const settingsData = [
  { key: 'site_name', value: 'PrintJack', description: 'Website name', category: 'general' },
  { key: 'site_tagline', value: 'Print It. Own It.', description: 'Website tagline', category: 'general' },
  { key: 'site_email', value: 'info@printjack.in', description: 'Contact email', category: 'general' },
  { key: 'site_phone', value: '+91 98765 43210', description: 'Contact phone', category: 'general' },
  { key: 'currency', value: 'INR', description: 'Default currency', category: 'payment' },
  { key: 'currency_symbol', value: '₹', description: 'Currency symbol', category: 'payment' },
  { key: 'gst_percentage', value: 18, description: 'GST percentage', category: 'payment' },
  { key: 'gst_number', value: '', description: 'GST registration number', category: 'payment' },
  { key: 'shipping_charges', value: 49, description: 'Default shipping charges in ₹', category: 'shipping' },
  { key: 'free_shipping_above', value: 999, description: 'Free shipping above this amount', category: 'shipping' },
  { key: 'min_order_amount', value: 99, description: 'Minimum order amount', category: 'orders' },
  { key: 'max_cart_items', value: 50, description: 'Maximum items in cart', category: 'orders' },
  { key: 'delivery_days_min', value: 3, description: 'Min delivery days', category: 'shipping' },
  { key: 'delivery_days_max', value: 10, description: 'Max delivery days', category: 'shipping' },
  { key: 'razorpay_enabled', value: true, description: 'Enable Razorpay payments', category: 'payment' },
  { key: 'cod_enabled', value: true, description: 'Enable Cash on Delivery', category: 'payment' },
  { key: 'loyalty_points_per_rupee', value: 1, description: 'Loyalty points per ₹1 spent', category: 'loyalty' },
  { key: 'loyalty_points_value', value: 0.1, description: 'Value of 1 loyalty point in ₹', category: 'loyalty' },
  { key: 'referral_reward_amount', value: 100, description: 'Referral reward in ₹', category: 'referral' },
  { key: 'referee_reward_amount', value: 50, description: 'Referee reward in ₹', category: 'referral' },
  { key: 'meta_title', value: 'PrintJack - Online Printing Services India', description: 'Default meta title', category: 'seo' },
  { key: 'meta_description', value: 'PrintJack offers premium quality printing services for business cards, stickers, apparel, marketing materials and more. Best prices with bulk discounts.', description: 'Default meta description', category: 'seo' },
  { key: 'social_facebook', value: '', description: 'Facebook URL', category: 'social' },
  { key: 'social_instagram', value: '', description: 'Instagram URL', category: 'social' },
  { key: 'social_twitter', value: '', description: 'Twitter URL', category: 'social' },
  { key: 'social_youtube', value: '', description: 'YouTube URL', category: 'social' },
];

function getBulkPricingKey(basePrice) {
  if (basePrice < 100) return 'low';
  if (basePrice < 400) return 'mid';
  return 'high';
}

function computeBulkPrices(basePrice, tierKey) {
  return bulkPricingSets[tierKey].map((t) => ({
    minQty: t.minQty,
    maxQty: t.maxQty,
    price: Math.max(1, Math.round(basePrice + t.price)),
  }));
}

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const collections = ['users', 'categories', 'products', 'coupons', 'settings'];
    for (const col of collections) {
      await mongoose.connection.db.dropCollection(col).catch(() => {});
    }
    console.log('Cleared existing data');

    console.log('Creating super_admin user...');
    const admin = await User.create({
      name: 'PrintJack Admin',
      email: 'admin@printjack.in',
      phone: '9876543210',
      password: 'Admin@123',
      role: 'super_admin',
      isActive: true,
    });
    console.log(`Admin created: ${admin.email} (ID: ${admin._id})`);

    console.log('Creating categories...');
    const categoryMap = {};
    const parentCategories = Object.keys(categoryData);

    for (let i = 0; i < parentCategories.length; i++) {
      const catName = parentCategories[i];
      const catInfo = categoryData[catName];
      const parent = await Category.create({
        name: catName,
        description: catInfo.description,
        sortOrder: i + 1,
        isActive: true,
      });
      categoryMap[catName] = parent._id;
      console.log(`  Parent: ${catName}`);

      for (let j = 0; j < catInfo.subcategories.length; j++) {
        const subName = catInfo.subcategories[j];
        const sub = await Category.create({
          name: subName,
          description: `${subName} under ${catName}`,
          parentCategory: parent._id,
          sortOrder: j + 1,
          isActive: true,
        });
        categoryMap[`${catName}>${subName}`] = sub._id;
      }
    }
    console.log(`Created ${Object.keys(categoryMap).length} categories`);

    console.log('Creating products...');
    let productCount = 0;

    for (const [catName, templates] of Object.entries(productTemplates)) {
      const catId = categoryMap[catName];
      for (const tmpl of templates) {
        const bulkTier = getBulkPricingKey(tmpl.basePrice);
        const bulkPricing = computeBulkPrices(tmpl.basePrice, bulkTier);
        const hasSizes = ['Apparel'].includes(catName);
        const hasColors = true;

        const colors = hasColors
          ? [
              { name: 'Full Color', hexCode: '#ffffff', available: true, additionalPrice: 0 },
              { name: 'Black & White', hexCode: '#000000', available: true, additionalPrice: -10 },
            ]
          : [];

        const sizes = hasSizes
          ? [
              { name: 'S', available: true, additionalPrice: 0 },
              { name: 'M', available: true, additionalPrice: 0 },
              { name: 'L', available: true, additionalPrice: 0 },
              { name: 'XL', available: true, additionalPrice: 10 },
              { name: 'XXL', available: true, additionalPrice: 20 },
            ]
          : [];

        const product = await Product.create({
          name: tmpl.name,
          description: `${tmpl.name} - Premium quality custom printing by PrintJack. Material: ${tmpl.material}. Printing method: ${tmpl.printingMethod}. Available in bulk with discounts.`,
          shortDescription: `High quality ${tmpl.name.toLowerCase()} with ${tmpl.printingMethod.toLowerCase()} printing on ${tmpl.material.toLowerCase()}.`,
          category: catId,
          brand: 'PrintJack',
          basePrice: tmpl.basePrice,
          bulkPricing,
          images: [
            { url: `https://images.unsplash.com/photo-${['1572044347786-5693577a9077', '1521572163474-6864f9cf17ab', '1558618666-fcd25c85f82e', '1561070791-2526d30994b5', '1514228742587-6b1558fcca3d', '1586075010923-2dd4570fb338', '1611532736597-de2d4265fba3', '1579783902614-a3fb3927b6a5', '1512436113726-1b5a77a8bb97', '1562408590-e32931084e23', '1602617754084-d4860ae4e7f9', '1572044347786-5693577a9077'][productCount % 12]}?w=400&q=80`, alt: tmpl.name },
          ],
          colors,
          sizes,
          material: tmpl.material,
          printingMethod: tmpl.printingMethod,
          printAreas: [
            {
              name: 'Front',
              width: 3.5,
              height: 2,
              description: 'Standard front print area',
              maxFileSize: 10,
              acceptedFormats: ['PDF', 'AI', 'PNG', 'SVG'],
            },
          ],
          tags: [catName.toLowerCase(), tmpl.printingMethod.toLowerCase(), 'custom printing'],
          specifications: new Map([
            ['Material', tmpl.material],
            ['Printing', tmpl.printingMethod],
            ['Finish', 'Premium'],
            ['Delivery', '3-7 business days'],
          ]),
          minimumOrderQuantity: catName === 'Mugs & Drinkware' || catName === 'Keychains & Gifts' ? 1 : 10,
          isActive: true,
          isFeatured: Math.random() > 0.6,
          averageRating: +(3.5 + Math.random() * 1.5).toFixed(1),
          totalReviews: Math.floor(Math.random() * 50),
          totalSold: Math.floor(Math.random() * 200),
        });
        productCount++;
      }
    }
    console.log(`Created ${productCount} products`);

    console.log('Creating coupons...');
    for (const c of couponData) {
      await Coupon.create(c);
    }
    console.log(`Created ${couponData.length} coupons`);

    console.log('Creating settings...');
    for (const s of settingsData) {
      await Setting.create(s);
    }
    console.log(`Created ${settingsData.length} settings`);

    console.log('\n--- Seed Summary ---');
    console.log('Admin: admin@printjack.in / Admin@123');
    console.log(`Categories: ${parentCategories.length} parents with subcategories`);
    console.log(`Products: ${productCount}`);
    console.log(`Coupons: ${couponData.length}`);
    console.log(`Settings: ${settingsData.length}`);
    console.log('Seeding complete!');
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seed();
