import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  ArrowRight, Truck, ShieldCheck, MapPin, Headphones,
  CreditCard, Palette, Shirt, StickyNote, Megaphone, Maximize, Coffee,
  MousePointerClick, Upload, CheckCircle, Package, Star,
  ChevronLeft, ChevronRight, Send, Play, Quote,
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

function AnimatedSection({ children, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={staggerContainer}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const categories = [
  { name: 'Business Cards', icon: CreditCard, count: 45, slug: 'business-cards', color: 'from-blue-500 to-blue-600' },
  { name: 'Apparel', icon: Shirt, count: 120, slug: 'apparel', color: 'from-brand-500 to-red-600' },
  { name: 'Stickers', icon: StickyNote, count: 80, slug: 'stickers', color: 'from-amber-400 to-orange-500' },
  { name: 'Marketing Materials', icon: Megaphone, count: 65, slug: 'marketing', color: 'from-emerald-500 to-emerald-600' },
  { name: 'Wide Format', icon: Maximize, count: 30, slug: 'wide-format', color: 'from-purple-500 to-purple-600' },
  { name: 'Mugs & Gifts', icon: Coffee, count: 55, slug: 'mugs-gifts', color: 'from-pink-500 to-rose-500' },
];

const steps = [
  { icon: MousePointerClick, title: 'Choose Product', desc: 'Browse our catalog and pick the perfect product for your brand.' },
  { icon: Palette, title: 'Upload or Create', desc: 'Upload your design or use our online editor to create from scratch.' },
  { icon: CheckCircle, title: 'Preview & Approve', desc: 'See a live preview of your product and approve before printing.' },
  { icon: Package, title: 'We Print & Deliver', desc: 'We handle printing, quality check, and deliver to your doorstep.' },
];

const featuredProducts = [
  { id: 1, name: 'Classic Business Card', price: 299, bulkPrice: 199, image: 'https://images.unsplash.com/photo-1572044347786-5693577a9077?w=400', category: 'Business Cards', rating: 4.8, reviews: 342, discount: 20 },
  { id: 2, name: 'Custom Printed T-Shirt', price: 499, bulkPrice: 299, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', category: 'Apparel', rating: 4.6, reviews: 518, badge: 'bestseller' },
  { id: 3, name: 'Die-Cut Vinyl Sticker Pack', price: 149, bulkPrice: 79, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400', category: 'Stickers', rating: 4.9, reviews: 891, discount: 30 },
  { id: 4, name: 'Premium Banner Roll-Up', price: 1299, bulkPrice: 899, image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400', category: 'Wide Format', rating: 4.7, reviews: 156 },
  { id: 5, name: 'Custom Coffee Mug', price: 399, bulkPrice: 249, image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400', category: 'Mugs & Gifts', rating: 4.5, reviews: 234, badge: 'new' },
  { id: 6, name: 'A5 Flyer Single-Sided', price: 99, bulkPrice: 49, image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400', category: 'Marketing', rating: 4.4, reviews: 678 },
];

const trendingProducts = [
  { id: 7, name: 'Tote Bag Print', price: 349, image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400', rating: 4.7 },
  { id: 8, name: 'Phone Case Custom', price: 599, image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400', rating: 4.8 },
  { id: 9, name: 'Notebook Cover', price: 249, image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400', rating: 4.6 },
  { id: 10, name: 'Poster Print A3', price: 199, image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400', rating: 4.5 },
];

const testimonials = [
  { name: 'Priya Sharma', role: 'Founder, Brew Coffee', rating: 5, text: 'PrintJack delivered our branded merchandise faster than expected. The print quality is outstanding. We have ordered 5 times already!', avatar: 'PS' },
  { name: 'Rahul Mehta', role: 'Marketing Lead, TechNova', rating: 5, text: 'The online editor made it so easy to design our promotional banners. Great customer support too. Highly recommended for businesses!', avatar: 'RM' },
  { name: 'Ananya Patel', role: 'Event Manager', rating: 5, text: 'We got 500 custom t-shirts for our college fest. The bulk pricing was unbeatable and the quality was perfect. Will order again!', avatar: 'AP' },
  { name: 'Vikram Singh', role: 'CEO, StartupGrid', rating: 4, text: 'Professional business cards at an affordable price. The design tool is intuitive and the delivery was on time. Great experience overall.', avatar: 'VS' },
];

const blogPosts = [
  { title: '10 Business Card Design Trends for 2026', excerpt: 'Stay ahead with these modern business card trends that will make your brand memorable.', image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600', date: 'Jan 10, 2026', slug: 'business-card-trends-2026' },
  { title: 'How to Design Merchandise Your Customers Will Love', excerpt: 'Learn the secrets of creating branded products that people actually want to use and wear.', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600', date: 'Jan 5, 2026', slug: 'design-merchandise-guide' },
  { title: 'Bulk Printing: Tips to Save Money Without Compromising Quality', excerpt: 'Discover how to optimize your print orders for the best value and quality balance.', image: 'https://images.unsplash.com/photo-1562408590-e32931084e23?w=600', date: 'Dec 28, 2025', slug: 'bulk-printing-tips' },
];

const trustLogos = ['Startup India', 'Make in India', 'Digital India', 'ISO 9001', 'Google Pay', 'Shopify'];

const trendingSlides = [
  { id: 1, name: 'Custom T-Shirts', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800', bg: 'from-brand-500 to-red-600' },
  { id: 2, name: 'Business Cards', image: 'https://images.unsplash.com/photo-1572044347786-5693577a9077?w=800', bg: 'from-navy-700 to-blue-900' },
  { id: 3, name: 'Premium Stickers', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800', bg: 'from-amber-500 to-orange-600' },
];

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [email, setEmail] = useState('');
  const [featuredIdx, setFeaturedIdx] = useState(0);
  const [testIdx, setTestIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setCurrentSlide((p) => (p + 1) % trendingSlides.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="overflow-hidden">
      {/* ===== HERO ===== */}
      <section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-brand-500 via-red-500 to-navy-700 overflow-hidden">
        {/* Animated bg shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div animate={{ x: [0, 40, 0], y: [0, -30, 0] }} transition={{ duration: 8, repeat: Infinity }} className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
          <motion.div animate={{ x: [0, -30, 0], y: [0, 40, 0] }} transition={{ duration: 10, repeat: Infinity }} className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/10 rounded-full" />
          <motion.div animate={{ rotate: -360 }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/5 rounded-full" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white/90 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
              <Play size={14} className="fill-white/90" /> Trusted by 10,000+ businesses
            </motion.span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight">
              Design Your Brand.{' '}
              <span className="text-yellow-300">We Print It.</span>
            </h1>
            <p className="mt-6 text-lg text-white/80 max-w-lg leading-relaxed">
              From business cards to branded merchandise — create, customize, and order
              premium printed products with pan India delivery. Quality guaranteed.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-white text-navy-700 font-bold px-8 py-4 rounded-xl hover:bg-yellow-300 hover:text-navy-700 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
              >
                Start Designing <ArrowRight size={20} />
              </Link>
              <a
                href="#categories"
                className="inline-flex items-center gap-2 border-2 border-white/40 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 transition-all"
              >
                Explore Categories
              </a>
            </div>
          </motion.div>

          {/* Floating mockups */}
          <div className="relative hidden lg:flex items-center justify-center h-[500px]">
            {trendingSlides.map((slide, i) => (
              <motion.div
                key={slide.id}
                animate={{
                  opacity: i === currentSlide ? 1 : 0,
                  scale: i === currentSlide ? 1 : 0.8,
                  rotate: i === currentSlide ? -3 : 0,
                  y: i === currentSlide ? 0 : 30,
                }}
                transition={{ duration: 0.6 }}
                className="absolute"
              >
                <div className="w-72 h-80 bg-white rounded-2xl shadow-2xl overflow-hidden">
                  <div className={`h-20 bg-gradient-to-r ${slide.bg}`} />
                  <img src={slide.image} alt={slide.name} className="w-full h-60 object-cover" />
                </div>
                <div className="absolute -bottom-4 -right-4 bg-white rounded-xl shadow-lg px-4 py-2 text-sm font-bold text-navy-700">
                  {slide.name}
                </div>
              </motion.div>
            ))}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute top-10 right-0 bg-white rounded-xl shadow-xl p-3"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                  <CheckCircle size={16} className="text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">Order Confirmed!</span>
              </div>
            </motion.div>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute bottom-20 left-0 bg-white rounded-xl shadow-xl p-3"
            >
              <div className="flex items-center gap-2">
                <Truck size={16} className="text-brand-500" />
                <span className="text-sm font-medium text-gray-700">Out for Delivery</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== TRUST BAR ===== */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Truck, text: 'Free Shipping on ₹999+' },
              { icon: ShieldCheck, text: '100% Quality Guarantee' },
              { icon: MapPin, text: 'Pan India Delivery' },
              { icon: Headphones, text: '24/7 Support' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 justify-center lg:justify-start"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
                  <item.icon size={20} className="text-brand-500" />
                </div>
                <span className="text-sm font-medium text-gray-700">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section id="categories" className="py-20 bg-gray-50">
        <AnimatedSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} className="text-center mb-12">
            <span className="text-brand-500 font-semibold text-sm uppercase tracking-wider">Browse by Category</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900">Find What You Need</h2>
            <p className="mt-3 text-gray-500 max-w-xl mx-auto">Explore our wide range of custom printing products for every need</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {categories.map((cat, i) => (
              <motion.div key={cat.slug} variants={fadeUp}>
                <Link
                  to={`/products?category=${cat.slug}`}
                  className="group block bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-transparent"
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <cat.icon size={24} className="text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 group-hover:text-brand-500 transition-colors">{cat.name}</h3>
                  <p className="text-sm text-gray-400 mt-1">{cat.count}+ products</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-20 bg-white">
        <AnimatedSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <span className="text-brand-500 font-semibold text-sm uppercase tracking-wider">How It Works</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900">4 Simple Steps</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <motion.div key={i} variants={fadeUp} className="text-center relative">
                <div className="w-16 h-16 rounded-2xl bg-navy-700 text-white flex items-center justify-center mx-auto mb-5 shadow-lg shadow-navy-700/20">
                  <step.icon size={28} />
                </div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-6 h-6 bg-brand-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {i + 1}
                </div>
                <h3 className="font-bold text-gray-900 text-lg">{step.title}</h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                {i < 3 && (
                  <div className="hidden lg:block absolute top-8 -right-4 text-gray-200">
                    <ArrowRight size={20} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </AnimatedSection>
      </section>

      {/* ===== FEATURED PRODUCTS ===== */}
      <section className="py-20 bg-gray-50">
        <AnimatedSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} className="flex items-end justify-between mb-10">
            <div>
              <span className="text-brand-500 font-semibold text-sm uppercase tracking-wider">Featured</span>
              <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900">Handpicked for You</h2>
            </div>
            <Link to="/products" className="hidden sm:inline-flex items-center gap-1 text-brand-500 font-semibold hover:underline">
              View All <ArrowRight size={16} />
            </Link>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((p, i) => (
              <motion.div key={p.id} variants={fadeUp} className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all overflow-hidden border border-gray-100">
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  {p.discount && (
                    <span className="absolute top-3 left-3 bg-brand-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                      -{p.discount}%
                    </span>
                  )}
                  {p.badge === 'bestseller' && (
                    <span className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                      Best Seller
                    </span>
                  )}
                  {p.badge === 'new' && (
                    <span className="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                      New
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <span className="text-xs font-medium text-gray-400 uppercase">{p.category}</span>
                  <h3 className="mt-1 font-bold text-gray-900 group-hover:text-brand-500 transition-colors">{p.name}</h3>
                  <div className="flex items-center gap-1 mt-2">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} size={14} className={j < Math.round(p.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
                    ))}
                    <span className="text-xs text-gray-400 ml-1">({p.reviews})</span>
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-xl font-bold text-gray-900">₹{p.price}</span>
                    {p.bulkPrice && <span className="text-xs text-emerald-600 font-medium">Bulk from ₹{p.bulkPrice}</span>}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Link to={`/editor/${p.id}`} className="flex-1 text-center bg-brand-500 hover:bg-red-600 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors">
                      Customize
                    </Link>
                    <button className="px-4 py-2.5 border-2 border-gray-200 hover:border-navy-700 text-gray-700 text-sm font-semibold rounded-xl transition-colors">
                      Add to Cart
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>
      </section>

      {/* ===== POPULAR RIGHT NOW ===== */}
      <section className="py-20 bg-white">
        <AnimatedSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} className="flex items-end justify-between mb-10">
            <div>
              <span className="text-brand-500 font-semibold text-sm uppercase tracking-wider">Trending</span>
              <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900">Popular Right Now</h2>
            </div>
            <Link to="/products?sort=trending" className="hidden sm:inline-flex items-center gap-1 text-brand-500 font-semibold hover:underline">
              View All <ArrowRight size={16} />
            </Link>
          </motion.div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {trendingProducts.map((p, i) => (
              <motion.div key={p.id} variants={fadeUp} className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all">
                <div className="aspect-square overflow-hidden bg-gray-50">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 text-sm group-hover:text-brand-500 transition-colors">{p.name}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    <Star size={13} className="text-amber-400 fill-amber-400" />
                    <span className="text-xs text-gray-500">{p.rating}</span>
                  </div>
                  <p className="mt-2 font-bold text-gray-900">₹{p.price}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>
      </section>

      {/* ===== BULK ORDERING CTA ===== */}
      <section className="py-20 bg-gradient-to-r from-navy-700 to-navy-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div variants={fadeUp}>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                Ordering in Bulk? <br />
                <span className="text-yellow-300">Get Special Pricing</span>
              </h2>
              <p className="mt-4 text-white/70 text-lg leading-relaxed">
                Whether it's 100 business cards or 10,000 t-shirts, we offer competitive bulk pricing with guaranteed quality. Get a custom quote today.
              </p>
              <Link
                to="/contact"
                className="mt-8 inline-flex items-center gap-2 bg-brand-500 hover:bg-red-600 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-xl hover:shadow-2xl"
              >
                Get a Quote <ArrowRight size={20} />
              </Link>
            </motion.div>
            <motion.div variants={fadeUp} className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-6">Request a Quote</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <input type="text" placeholder="Your Name" className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-brand-500" />
                <input type="email" placeholder="Email Address" className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-brand-500" />
                <input type="tel" placeholder="Phone Number" className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-brand-500" />
                <select className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white/60 focus:outline-none focus:ring-2 focus:ring-brand-500">
                  <option value="">Select Product Type</option>
                  <option value="business-cards">Business Cards</option>
                  <option value="apparel">Apparel</option>
                  <option value="stickers">Stickers</option>
                  <option value="banners">Banners</option>
                  <option value="mugs">Mugs & Gifts</option>
                  <option value="other">Other</option>
                </select>
                <textarea rows={3} placeholder="Tell us about your project..." className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
                <button className="w-full bg-brand-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-colors">
                  Submit Request
                </button>
              </form>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="py-20 bg-gray-50">
        <AnimatedSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} className="text-center mb-12">
            <span className="text-brand-500 font-semibold text-sm uppercase tracking-wider">Testimonials</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900">What Our Customers Say</h2>
          </motion.div>
          <motion.div variants={fadeUp} className="relative">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {testimonials.map((t, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <Quote size={24} className="text-brand-500/20 mb-3" />
                  <p className="text-sm text-gray-600 leading-relaxed">{t.text}</p>
                  <div className="flex mt-3">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} size={14} className={j < t.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
                    ))}
                  </div>
                  <div className="mt-4 flex items-center gap-3 pt-4 border-t border-gray-100">
                    <div className="w-10 h-10 rounded-full bg-navy-700 text-white flex items-center justify-center text-sm font-bold">
                      {t.avatar}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">{t.name}</h4>
                      <p className="text-xs text-gray-400">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatedSection>
      </section>

      {/* ===== BLOG PREVIEW ===== */}
      <section className="py-20 bg-white">
        <AnimatedSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} className="flex items-end justify-between mb-10">
            <div>
              <span className="text-brand-500 font-semibold text-sm uppercase tracking-wider">From Our Blog</span>
              <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900">Latest Articles</h2>
            </div>
            <Link to="/blog" className="hidden sm:inline-flex items-center gap-1 text-brand-500 font-semibold hover:underline">
              View All <ArrowRight size={16} />
            </Link>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {blogPosts.map((post, i) => (
              <motion.div key={i} variants={fadeUp}>
                <Link to={`/blog/${post.slug}`} className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100">
                  <div className="aspect-[16/10] overflow-hidden">
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="p-5">
                    <span className="text-xs text-gray-400">{post.date}</span>
                    <h3 className="mt-1 font-bold text-gray-900 group-hover:text-brand-500 transition-colors leading-snug">{post.title}</h3>
                    <p className="mt-2 text-sm text-gray-500 line-clamp-2">{post.excerpt}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-500 group-hover:gap-2 transition-all">
                      Read More <ArrowRight size={14} />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>
      </section>

      {/* ===== NEWSLETTER ===== */}
      <section className="py-20 bg-gradient-to-r from-brand-500 to-red-600">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <motion.div variants={fadeUp}>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Stay in the Loop</h2>
              <p className="mt-3 text-white/80 text-lg">Get exclusive offers, design tips, and new product launches straight to your inbox.</p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setEmail('');
                  alert('Thanks for subscribing!');
                }}
                className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 px-5 py-3.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <button type="submit" className="bg-navy-700 hover:bg-navy-900 text-white font-bold px-8 py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2">
                  <Send size={16} /> Subscribe
                </button>
              </form>
              <p className="mt-3 text-white/50 text-xs">No spam, unsubscribe anytime.</p>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      {/* ===== TRUSTED BY ===== */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-8">Trusted by 10,000+ businesses across India</p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14">
            {trustLogos.map((logo, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-gray-300 hover:text-gray-500 transition-colors"
              >
                <span className="text-xl font-extrabold tracking-tight">{logo}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
