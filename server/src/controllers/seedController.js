const { User, Category, Product, Coupon, Setting } = require('../models');
const { AppError } = require('../middleware/errorHandler');

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
    subcategories: ['T-Shirt', 'Polo T-Shirt', 'Hoodie', 'Cap', 'Mug'],
  },
  'Marketing': {
    description: 'Marketing materials and promotional items',
    subcategories: ['Flyer', 'Brochure', 'Poster', 'Banner', 'Roll Up Stand', 'Tent Card'],
  },
};

const productTemplates = {
  'Business Cards': [
    { name: 'Standard Business Cards', basePrice: 99, material: 'Premium Paper', printingMethod: 'Offset' },
    { name: 'Premium Business Cards', basePrice: 199, material: 'Premium Cardstock', printingMethod: 'Digital' },
    { name: 'Luxury Business Cards', basePrice: 399, material: 'Linen Cardstock', printingMethod: 'Letterpress' },
  ],
  'Stationery': [
    { name: 'A4 Letterhead', basePrice: 49, material: 'Premium Bond Paper', printingMethod: 'Offset' },
    { name: 'DL Envelope', basePrice: 29, material: 'Premium Paper', printingMethod: 'Offset' },
  ],
  'Stickers': [
    { name: 'Custom Sticker Sheet', basePrice: 49, material: 'Vinyl', printingMethod: 'Digital' },
    { name: 'Die Cut Stickers', basePrice: 79, material: 'Vinyl', printingMethod: 'Digital' },
  ],
  'Apparel': [
    { name: 'Custom T-Shirt', basePrice: 449, material: 'Cotton', printingMethod: 'Screen Printing' },
    { name: 'Custom Hoodie', basePrice: 899, material: 'Cotton Blend', printingMethod: 'Screen Printing' },
  ],
  'Marketing': [
    { name: 'A5 Flyer', basePrice: 39, material: 'Premium Paper', printingMethod: 'Offset' },
    { name: 'A4 Brochure', basePrice: 59, material: 'Premium Paper', printingMethod: 'Offset' },
  ],
};

const bulkPricingSets = {
  low: [
    { minQty: 50, maxQty: 100, price: 0 },
    { minQty: 101, maxQty: 250, price: -10 },
    { minQty: 251, maxQty: 500, price: -20 },
    { minQty: 501, maxQty: 1000, price: -30 },
  ],
  mid: [
    { minQty: 50, maxQty: 100, price: 0 },
    { minQty: 101, maxQty: 250, price: -20 },
    { minQty: 251, maxQty: 500, price: -40 },
    { minQty: 501, maxQty: 1000, price: -60 },
  ],
  high: [
    { minQty: 10, maxQty: 50, price: 0 },
    { minQty: 51, maxQty: 100, price: -50 },
    { minQty: 101, maxQty: 250, price: -100 },
    { minQty: 251, maxQty: 500, price: -150 },
  ],
};

const couponData = [
  { code: 'WELCOME20', discount: 20, discountType: 'percentage', minOrder: 199, maxUses: 1000, isActive: true },
  { code: 'FIRST100', discount: 100, discountType: 'fixed', minOrder: 499, maxUses: 500, isActive: true },
  { code: 'PRINT50', discount: 50, discountType: 'percentage', minOrder: 999, maxUses: 200, isActive: true, maxDiscount: 500 },
];

const settingsData = [
  { key: 'site_name', value: 'PrintJack', category: 'general' },
  { key: 'site_tagline', value: 'Your Trusted Printing Partner', category: 'general' },
  { key: 'contact_email', value: 'hello@printjack.in', category: 'contact' },
  { key: 'contact_phone', value: '+91 98765 43210', category: 'contact' },
  { key: 'address', value: 'Mumbai, Maharashtra, India', category: 'contact' },
  { key: 'currency', value: 'INR', category: 'payment' },
  { key: 'currency_symbol', value: '₹', category: 'payment' },
  { key: 'gst_percentage', value: 18, category: 'payment' },
  { key: 'shipping_charges', value: 49, category: 'shipping' },
  { key: 'free_shipping_above', value: 999, category: 'shipping' },
  { key: 'delivery_days_min', value: 3, category: 'shipping' },
  { key: 'delivery_days_max', value: 10, category: 'shipping' },
  { key: 'cod_enabled', value: true, category: 'payment' },
  { key: 'loyalty_points_per_rupee', value: 1, category: 'loyalty' },
  { key: 'meta_title', value: 'PrintJack - Online Printing Services India', category: 'seo' },
  { key: 'meta_description', value: 'PrintJack offers premium quality printing services.', category: 'seo' },
];

const productImages = [
  '1572044347786-5693577a9077', '1521572163474-6864f9cf17ab',
  '1558618666-fcd25c85f82e', '1561070791-2526d30994b5',
  '1514228742587-6b1558fcca3d', '1586075010923-2dd4570fb338',
  '1611532736597-de2d4265fba3', '1579783902614-a3fb3927b6a5',
  '1512436113726-1b5a77a8bb97', '1562408590-e32931084e23',
  '1602617754084-d4860ae4e7f9', '1532298229637-3d3e3b1b8b5e',
];

exports.seed = async (req, res, next) => {
  try {
    const existingProducts = await Product.countDocuments();
    if (existingProducts > 0) {
      throw new AppError('Database already seeded. Drop collections first or use force=true', 400);
    }

    const results = {};

    const admin = await User.create({
      name: 'PrintJack Admin',
      email: 'admin@printjack.in',
      phone: '9876543210',
      password: 'Admin@123',
      role: 'super_admin',
      isActive: true,
    });
    results.admin = { email: admin.email, password: 'Admin@123' };

    const categoryMap = {};
    const parentNames = Object.keys(categoryData);
    for (let i = 0; i < parentNames.length; i++) {
      const name = parentNames[i];
      const info = categoryData[name];
      const parent = await Category.create({
        name,
        description: info.description,
        sortOrder: i + 1,
        isActive: true,
      });
      categoryMap[name] = parent._id;

      for (let j = 0; j < info.subcategories.length; j++) {
        const sub = await Category.create({
          name: info.subcategories[j],
          description: `${info.subcategories[j]} under ${name}`,
          parentCategory: parent._id,
          sortOrder: j + 1,
          isActive: true,
        });
        categoryMap[`${name}>${info.subcategories[j]}`] = sub._id;
      }
    }
    results.categories = `${parentNames.length} parents with subcategories`;

    let productCount = 0;
    const catKeys = Object.keys(productTemplates);
    for (let ci = 0; ci < catKeys.length; ci++) {
      const catName = catKeys[ci];
      const templates = productTemplates[catName];
      const catId = categoryMap[catName];
      if (!catId) continue;

      for (const tmpl of templates) {
        const bulkTier = tmpl.basePrice < 100 ? 'low' : tmpl.basePrice < 400 ? 'mid' : 'high';
        const bulkPricing = bulkPricingSets[bulkTier].map(t => ({
          minQty: t.minQty,
          maxQty: t.maxQty,
          price: Math.max(1, Math.round(tmpl.basePrice + t.price)),
        }));

        await Product.create({
          name: tmpl.name,
          description: `${tmpl.name} - Premium quality custom printing by PrintJack. Material: ${tmpl.material}. Printing method: ${tmpl.printingMethod}.`,
          shortDescription: `High quality ${tmpl.name.toLowerCase()} with ${tmpl.printingMethod.toLowerCase()} printing.`,
          slug: tmpl.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
          category: catId,
          basePrice: tmpl.basePrice,
          bulkPricing,
          images: [{ url: `https://images.unsplash.com/photo-${productImages[productCount % productImages.length]}?w=400&q=80`, alt: tmpl.name }],
          colors: [
            { name: 'Full Color', hexCode: '#ffffff', available: true, additionalPrice: 0 },
            { name: 'Black & White', hexCode: '#000000', available: true, additionalPrice: -10 },
          ],
          sizes: catName === 'Apparel' ? [
            { name: 'S', available: true, additionalPrice: 0 },
            { name: 'M', available: true, additionalPrice: 0 },
            { name: 'L', available: true, additionalPrice: 0 },
            { name: 'XL', available: true, additionalPrice: 10 },
          ] : [],
          material: tmpl.material,
          printingMethod: tmpl.printingMethod,
          printAreas: [{ name: 'Front', width: 3.5, height: 2, description: 'Standard front print area', maxFileSize: 10, acceptedFormats: ['PDF', 'AI', 'PNG', 'SVG'] }],
          tags: [catName.toLowerCase(), tmpl.printingMethod.toLowerCase(), 'custom printing'],
          specifications: { Material: tmpl.material, Printing: tmpl.printingMethod, Finish: 'Premium', Delivery: '3-7 business days' },
          minimumOrderQuantity: catName === 'Apparel' ? 1 : 10,
          isActive: true,
          isFeatured: productCount % 3 === 0,
          averageRating: +(3.5 + Math.random() * 1.5).toFixed(1),
          totalReviews: Math.floor(Math.random() * 50),
          totalSold: Math.floor(Math.random() * 200),
        });
        productCount++;
      }
    }
    results.products = `${productCount} products`;

    results.coupons = 0;
    for (const c of couponData) {
      await Coupon.create(c);
      results.coupons++;
    }

    results.settings = 0;
    for (const s of settingsData) {
      await Setting.create(s);
      results.settings++;
    }

    res.status(201).json({ success: true, message: 'Database seeded successfully', results });
  } catch (err) {
    next(err);
  }
};
