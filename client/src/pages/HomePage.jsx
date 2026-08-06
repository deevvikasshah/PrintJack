import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef } from 'react';
import {
  ArrowRight, Truck, ShieldCheck, MapPin, Headphones,
  CreditCard, Shirt, StickyNote, Megaphone, Maximize, Coffee,
  Palette, CheckCircle, Package, Star,
  Send, ChevronDown, Quote, ChevronLeft, ChevronRight, Clock, BadgePercent,
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
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

const sectionNav = [
  { href: '#shop-by-category', label: 'Shop by Category' },
  { href: '#special-finishes', label: 'Special Finishes' },
  { href: '#featured', label: 'Featured Products' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#faqs', label: 'FAQs' },
];

const categories = [
  { name: 'Business Cards', icon: CreditCard, count: 45, slug: 'business-cards', image: 'https://images.unsplash.com/photo-1591405351990-4726e331f141?w=800', priceFrom: 299 },
  { name: 'Apparel', icon: Shirt, count: 120, slug: 't-shirts', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800', priceFrom: 499 },
  { name: 'Stickers', icon: StickyNote, count: 80, slug: 'stickers', image: 'https://images.unsplash.com/photo-1601924582970-9238bcb495d9?w=800', priceFrom: 149 },
  { name: 'Mugs & Gifts', icon: Coffee, count: 55, slug: 'mugs', image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800', priceFrom: 399 },
  { name: 'Marketing Materials', icon: Megaphone, count: 65, slug: 'flyers', image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=800', priceFrom: 99 },
  { name: 'Wide Format', icon: Maximize, count: 30, slug: 'banners', image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800', priceFrom: 1299 },
];

const finishes = [
  { name: 'Gold Foil', image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600', from: 549, note: 'Premium gilded finish' },
  { name: 'Spot Gloss', image: 'https://images.unsplash.com/photo-1549476464-37392f717541?w=600', from: 449, note: 'Selective shine & texture' },
  { name: 'Matte Soft Touch', image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600', from: 349, note: 'Velvety smooth feel' },
  { name: 'Letterpress', image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600', from: 599, note: 'Classic pressed depth' },
];

const steps = [
  { title: 'Design', desc: 'Create or upload your artwork with our free online editor.', image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80' },
  { title: 'Print', desc: 'Vivid, precision printing on premium, sustainably sourced materials.', image: 'https://images.unsplash.com/photo-1591405351990-4726e331f141?w=800&q=80' },
  { title: 'Quality Check', desc: 'Every single piece is hand-inspected before it leaves our facility.', image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&q=80' },
  { title: 'Delivery', desc: 'Safely packed and shipped to your doorstep across India.', image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&q=80' },
];

const featuredProducts = [
  { id: 1, name: 'Classic Business Card', price: 299, bulkPrice: 199, image: 'https://images.unsplash.com/photo-1591405351990-4726e331f141?w=400', category: 'Business Cards', rating: 4.8, reviews: 342, discount: 20, features: ['Premium 350 GSM', 'Matte or gloss', 'Free online preview'] },
  { id: 2, name: 'Custom Printed T-Shirt', price: 499, bulkPrice: 299, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', category: 'Apparel', rating: 4.6, reviews: 518, badge: 'bestseller', features: ['100% combed cotton', 'Vivid DTF print', 'All sizes'] },
  { id: 3, name: 'Die-Cut Vinyl Sticker Pack', price: 149, bulkPrice: 79, image: 'https://images.unsplash.com/photo-1601924582970-9238bcb495d9?w=400', category: 'Stickers', rating: 4.9, reviews: 891, discount: 30, features: ['Waterproof vinyl', 'Any shape', 'Kiss cut or die cut'] },
  { id: 4, name: 'Premium Banner Roll-Up', price: 1299, bulkPrice: 899, image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400', category: 'Wide Format', rating: 4.7, reviews: 156, features: ['Matte or gloss', 'Reusable stand', 'Stand included'] },
  { id: 5, name: 'Custom Coffee Mug', price: 399, bulkPrice: 249, image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400', category: 'Mugs & Gifts', rating: 4.5, reviews: 234, badge: 'new', features: ['Microwave safe', 'Full-wrap print', 'Dishwasher proof'] },
  { id: 6, name: 'A5 Flyer Single-Sided', price: 99, bulkPrice: 49, image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400', category: 'Marketing', rating: 4.4, reviews: 678, features: ['Gloss or matte', 'Fast turnaround', 'Full colour'] },
];

const heroSlides = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1591405351990-4726e331f141?w=1600&q=80',
    badge: 'Trusted by 10,000+ businesses across India',
    title: ['Custom printed products', 'that mean business.'],
    subtitle: 'From business cards to branded merchandise — design, customize, and order premium printed products with pan-India delivery.',
    primary: { label: 'Shop Products', to: '/products' },
    secondary: { label: 'Start Designing', to: '/editor' },
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1600&q=80',
    badge: 'Free online design studio',
    title: ['Design online.', 'Print premium.'],
    subtitle: 'Create custom apparel, mugs, and more in minutes with 30+ fonts, clipart, and ready-made templates in our free editor.',
    primary: { label: 'Start Designing', to: '/editor' },
    secondary: { label: 'Shop Products', to: '/products' },
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=1600&q=80',
    badge: 'Bulk pricing that scales',
    title: ['Bulk printing that', 'saves you big.'],
    subtitle: 'Tiered discounts on every product — the more you order, the lower the per-unit price. Perfect for businesses and events.',
    primary: { label: 'Get a Quote', to: '/contact' },
    secondary: { label: 'Shop Products', to: '/products' },
  },
];

const whyChooseUs = [
  { icon: Palette, title: 'Custom Designs', desc: 'Edit online or upload your own artwork for free.' },
  { icon: Clock, title: 'Fast Turnaround', desc: 'Standard production in just 3–5 business days.' },
  { icon: BadgePercent, title: 'Bulk Pricing', desc: 'Tiered discounts the more you order.' },
  { icon: Truck, title: 'Pan-India Delivery', desc: 'Safely shipped to every corner of India.' },
  { icon: Headphones, title: 'Dedicated Support', desc: 'Real humans here 24/7 to help you.' },
];

const testimonials = [
  { name: 'Priya Sharma', role: 'Founder, Brew Coffee', rating: 5, text: 'PrintJack delivered our branded merchandise faster than expected. The print quality is outstanding. We have ordered 5 times already!', avatar: 'PS' },
  { name: 'Rahul Mehta', role: 'Marketing Lead, TechNova', rating: 5, text: 'The online editor made it so easy to design our promotional banners. Great customer support too. Highly recommended for businesses!', avatar: 'RM' },
  { name: 'Ananya Patel', role: 'Event Manager', rating: 5, text: 'We got 500 custom t-shirts for our college fest. The bulk pricing was unbeatable and the quality was perfect. Will order again!', avatar: 'AP' },
  { name: 'Vikram Singh', role: 'CEO, StartupGrid', rating: 4, text: 'Professional business cards at an affordable price. The design tool is intuitive and the delivery was on time. Great experience overall.', avatar: 'VS' },
];

const faqs = [
  { q: 'What is the minimum order quantity?', a: 'Most products can be ordered from a single unit, but our best value starts with bulk quantities. Business cards, for example, start from just 50 cards. Check each product page for its minimum order.' },
  { q: 'Can I use my own design?', a: 'Absolutely. Upload your own artwork directly from your device, or use our free online design editor to create something from scratch — it is completely free to use.' },
  { q: 'What finishes are available?', a: 'We offer a range of premium finishes including gold and silver foil, spot gloss, raised spot gloss, matte soft touch, and letterpress. These are available on select products.' },
  { q: 'How long does delivery take?', a: 'Standard production takes 3–5 business days, with shipping across India taking 2–5 more days depending on your location. Express options are available at checkout.' },
  { q: 'Do you offer bulk discounts?', a: 'Yes! Every product page includes a bulk pricing table. The more you order, the lower the per-unit price — and our team is happy to provide custom quotes for large corporate orders.' },
];

const blogPosts = [
  { title: '10 Business Card Design Trends for 2026', excerpt: 'Stay ahead with these modern business card trends that will make your brand memorable.', image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600', date: 'Jan 10, 2026', slug: 'business-card-trends-2026' },
  { title: 'How to Design Merchandise Your Customers Will Love', excerpt: 'Learn the secrets of creating branded products that people actually want to use and wear.', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600', date: 'Jan 5, 2026', slug: 'design-merchandise-guide' },
  { title: 'Bulk Printing: Tips to Save Money Without Compromising Quality', excerpt: 'Discover how to optimize your print orders for the best value and quality balance.', image: 'https://images.unsplash.com/photo-1562408590-e32931084e23?w=600', date: 'Dec 28, 2025', slug: 'bulk-printing-tips' },
];

const defaultTrustLogos = ['Startup India', 'Make in India', 'Digital India', 'ISO 9001', 'Google Pay', 'Shopify', 'Razorpay', 'Myntra'];
const defaultTestimonials = testimonials;
const defaultTrustBar = [
  { icon: 'truck', text: 'Free Shipping on ₹999+' },
  { icon: 'shield', text: '100% Quality Guarantee' },
  { icon: 'map', text: 'Pan India Delivery' },
  { icon: 'support', text: '24/7 Support' },
];

const TRUST_ICONS = {
  truck: Truck,
  shield: ShieldCheck,
  map: MapPin,
  support: Headphones,
  card: CreditCard,
  package: Package,
};

function FaqAccordion({ items }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="max-w-3xl mx-auto divide-y divide-ink/10">
      {items.map((item, i) => (
        <div key={i} className="py-5">
          <button
            onClick={() => setOpen(open === i ? -1 : i)}
            className="w-full flex items-center justify-between gap-4 text-left"
          >
            <span className="font-display text-lg text-ink font-medium">{item.q}</span>
            <ChevronDown size={20} className={`flex-shrink-0 text-ink/50 transition-transform duration-300 ${open === i ? 'rotate-180' : ''}`} />
          </button>
          <div className={`grid transition-all duration-300 ${open === i ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <p className="text-ink/60 leading-relaxed">{item.a}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  const [email, setEmail] = useState('');
  const [content, setContent] = useState(null);
  const [featuredItems, setFeaturedItems] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHeroPaused, setIsHeroPaused] = useState(false);

  const goToSlide = (i) => setCurrentSlide((i + heroSlides.length) % heroSlides.length);
  const goToNext = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  const goToPrev = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  const popularCatRef = useRef(null);
  const scrollCategories = (dir) => {
    popularCatRef.current?.scrollBy({ left: dir * 264, behavior: 'smooth' });
  };

  useEffect(() => {
    if (isHeroPaused) return undefined;
    const timer = setInterval(goToNext, 5000);
    return () => clearInterval(timer);
  }, [isHeroPaused]);

  const trustLogos = content?.trustLogos || defaultTrustLogos;
  const siteTestimonials = content?.testimonials || defaultTestimonials;
  const trustBar = content?.trustBar || defaultTrustBar;

  const displayFeatured = featuredItems.length > 0 ? featuredItems : featuredProducts;

  const [testiIndex, setTestiIndex] = useState(0);
  const [isTestiPaused, setIsTestiPaused] = useState(false);
  const goToTesti = (i) => setTestiIndex((i + siteTestimonials.length) % siteTestimonials.length);

  useEffect(() => {
    if (siteTestimonials.length > 0 && testiIndex >= siteTestimonials.length) {
      setTestiIndex(0);
    }
  }, [siteTestimonials.length, testiIndex]);

  useEffect(() => {
    if (isTestiPaused || siteTestimonials.length <= 1) return undefined;
    const timer = setInterval(() => setTestiIndex((prev) => (prev + 1) % siteTestimonials.length), 6000);
    return () => clearInterval(timer);
  }, [isTestiPaused, siteTestimonials.length]);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const res = await fetch('/api/admin/settings/public');
        if (res.ok) {
          const data = await res.json();
          if (data?.success && data.content) {
            setContent(data.content);
          }
        }
      } catch (e) {
        // Fall back to defaults on any error
      }
    };
    loadContent();
  }, []);

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const res = await fetch('/api/products/featured');
        if (!res.ok) return;
        const data = await res.json();
        const list = data.products || data.data || [];
        if (list.length === 0) return;
        setFeaturedItems(
          list.map((p) => ({
            id: p._id,
            slug: p.slug,
            name: p.name,
            price: p.basePrice || p.price || 0,
            bulkPrice: p.bulkPrice || (p.bulkPricing && p.bulkPricing[0]?.price) || null,
            image:
              (p.images && p.images[0] && (typeof p.images[0] === 'string' ? p.images[0] : p.images[0].url)) ||
              '/placeholder-product.png',
            category: p.category?.name || p.category || 'Products',
            rating: p.averageRating || p.rating || 0,
            reviews: p.totalReviews || p.reviewCount || 0,
            discount: p.discount || 0,
            features: [
              p.material ? `Material · ${p.material}` : null,
              p.printingMethod ? `Print · ${p.printingMethod}` : null,
              'Free online preview',
            ].filter(Boolean),
          }))
        );
      } catch (e) {
        // Fall back to hardcoded featured products
      }
    };
    loadFeatured();
  }, []);

  return (
    <div className="bg-paper-100">
      {/* ===== HERO CAROUSEL ===== */}
      <section
        className="relative overflow-hidden"
        onMouseEnter={() => setIsHeroPaused(true)}
        onMouseLeave={() => setIsHeroPaused(false)}
      >
        <div className="relative h-[560px] sm:h-[600px] lg:h-[680px]">
          {heroSlides.map((slide, i) => {
            const isActive = i === currentSlide;
            return (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${slide.image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/45 to-black/20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                      initial={false}
                      animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    >
                      <motion.span
                        initial={false}
                        animate={isActive ? { opacity: 1 } : { opacity: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="inline-flex items-center gap-2 text-sm text-white/80 mb-8"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-pj-green" /> {slide.badge}
                      </motion.span>
                      <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl text-white leading-[1.05] font-semibold tracking-tight">
                        {slide.title[0]}
                        <br />
                        <span className="italic text-white/80">{slide.title[1]}</span>
                      </h1>
                      <p className="mt-6 text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
                        {slide.subtitle}
                      </p>
                      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                        <Link
                          to={slide.primary.to}
                          className="inline-flex items-center gap-2 bg-white text-ink font-semibold px-8 py-4 rounded-full hover:bg-pj-green hover:text-white transition-colors"
                        >
                          {slide.primary.label} <ArrowRight size={18} />
                        </Link>
                        {slide.secondary && (
                          <Link
                            to={slide.secondary.to}
                            className="inline-flex items-center gap-2 border border-white/50 text-white font-semibold px-8 py-4 rounded-full hover:border-white hover:bg-white/10 transition-colors"
                          >
                            {slide.secondary.label}
                          </Link>
                        )}
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Left / Right Arrows */}
        <button
          onClick={goToPrev}
          aria-label="Previous slide"
          className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/30 hover:bg-black/60 border border-white/20 text-white flex items-center justify-center backdrop-blur-sm transition-colors"
        >
          <ChevronLeft size={22} />
        </button>
        <button
          onClick={goToNext}
          aria-label="Next slide"
          className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/30 hover:bg-black/60 border border-white/20 text-white flex items-center justify-center backdrop-blur-sm transition-colors"
        >
          <ChevronRight size={22} />
        </button>

        {/* Dot Indicators */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {heroSlides.map((slide, i) => (
            <button
              key={slide.id}
              onClick={() => goToSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === currentSlide}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                i === currentSlide
                  ? 'w-8 bg-white'
                  : 'w-2.5 bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      </section>

      {/* ===== WHY CHOOSE US ===== */}
      <section className="bg-paper-100 border-b border-ink/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {whyChooseUs.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                className="flex flex-col items-center text-center lg:items-start lg:text-left"
              >
                <div className="w-12 h-12 rounded-2xl bg-pj-green/10 flex items-center justify-center mb-3">
                  <item.icon size={22} className="text-pj-green" />
                </div>
                <h3 className="font-display text-base font-semibold text-ink">{item.title}</h3>
                <p className="mt-1 text-sm text-ink/60 leading-snug">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== STICKY SECTION NAV ===== */}
      <nav className="sticky top-0 z-40 bg-paper-50/90 backdrop-blur border-b border-ink/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {sectionNav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="px-3 py-3.5 text-sm text-ink/60 hover:text-ink whitespace-nowrap transition-colors border-b-2 border-transparent hover:border-ink"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* ===== TRUST BAR ===== */}
      <section className="bg-paper-50 border-b border-ink/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {trustBar.map((item, i) => {
              const Icon = TRUST_ICONS[item.icon] || Truck;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-3 justify-center lg:justify-start"
                >
                  <div className="w-10 h-10 rounded-full bg-pj-green/10 flex items-center justify-center">
                    <Icon size={20} className="text-pj-green" />
                  </div>
                  <span className="text-sm text-ink/70">{item.text}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== POPULAR CATEGORIES ===== */}
      <section className="py-14 lg:py-20 bg-paper-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <span className="text-sm text-pj-green font-medium uppercase tracking-widest">Popular</span>
              <h2 className="mt-3 font-display text-3xl sm:text-5xl text-ink">Popular Categories</h2>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => scrollCategories(-1)}
                aria-label="Scroll categories left"
                className="w-10 h-10 rounded-full border border-ink/15 hover:bg-paper-50 text-ink/70 hover:text-pj-green flex items-center justify-center transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => scrollCategories(1)}
                aria-label="Scroll categories right"
                className="w-10 h-10 rounded-full border border-ink/15 hover:bg-paper-50 text-ink/70 hover:text-pj-green flex items-center justify-center transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            ref={popularCatRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4 -mx-4 px-4 sm:mx-0 sm:px-0"
          >
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                to={`/products?category=${cat.slug}`}
                className="group flex-shrink-0 snap-start w-40 sm:w-48 lg:w-56 rounded-2xl overflow-hidden relative aspect-[4/5]"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="font-display text-lg text-white font-semibold leading-tight">{cat.name}</h3>
                  <p className="text-xs text-white/70 mt-0.5">from ₹{cat.priceFrom}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SHOP BY CATEGORY ===== */}
      <section id="shop-by-category" className="py-20 lg:py-28">
        <AnimatedSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} className="max-w-2xl mb-14">
            <span className="text-sm text-pj-green font-medium uppercase tracking-widest">Shop by Category</span>
            <h2 className="mt-3 font-display text-3xl sm:text-5xl text-ink">Premium print for every need</h2>
            <p className="mt-4 text-ink/60 text-lg">Easily create the best custom products online — all printed on premium, sustainably sourced materials.</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((cat, i) => (
              <motion.div key={cat.slug} variants={fadeUp}>
                <Link
                  to={`/products?category=${cat.slug}`}
                  className="group block bg-paper-50 rounded-2xl overflow-hidden border border-ink/10 hover:border-ink/30 transition-all hover:-translate-y-1"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-paper-200">
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-xl text-ink group-hover:text-pj-green transition-colors">{cat.name}</h3>
                      <ArrowRight size={18} className="text-ink/40 group-hover:text-pj-green group-hover:translate-x-1 transition-all" />
                    </div>
                    <p className="mt-1 text-sm text-ink/50">{cat.count}+ products · from ₹{cat.priceFrom}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>
      </section>

      {/* ===== SPECIAL FINISHES ===== */}
      <section id="special-finishes" className="py-20 lg:py-28 bg-paper-50 border-y border-ink/10">
        <AnimatedSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} className="max-w-2xl mb-14">
            <span className="text-sm text-pj-green font-medium uppercase tracking-widest">Special Finishes</span>
            <h2 className="mt-3 font-display text-3xl sm:text-5xl text-ink">Give your products stealable status</h2>
            <p className="mt-4 text-ink/60 text-lg">From gold bling to velvety textures — a treat for the eyes, and the hands.</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {finishes.map((f, i) => (
              <motion.div key={f.name} variants={fadeUp} className="group bg-white rounded-2xl overflow-hidden border border-ink/10 hover:border-ink/30 transition-all hover:-translate-y-1">
                <div className="aspect-square overflow-hidden bg-paper-200">
                  <img src={f.image} alt={f.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                </div>
                <div className="p-5">
                  <h3 className="font-display text-lg text-ink">{f.name}</h3>
                  <p className="text-sm text-ink/50 mt-0.5">{f.note}</p>
                  <p className="mt-3 text-sm text-ink/80"><span className="font-semibold text-ink">From ₹{f.from}</span> / unit</p>
                  <Link to="/products" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-pj-green hover:gap-2 transition-all">
                    Shop {f.name} <ArrowRight size={14} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>
      </section>

      {/* ===== FEATURED PRODUCTS ===== */}
      <section id="featured" className="py-20 lg:py-28">
        <AnimatedSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} className="flex items-end justify-between mb-14">
            <div className="max-w-xl">
              <span className="text-sm text-pj-green font-medium uppercase tracking-widest">Featured</span>
              <h2 className="mt-3 font-display text-3xl sm:text-5xl text-ink">Handpicked for you</h2>
            </div>
            <Link to="/products" className="hidden sm:inline-flex items-center gap-2 text-pj-green font-semibold hover:gap-3 transition-all">
              View all products <ArrowRight size={16} />
            </Link>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayFeatured.map((p, i) => (
              <motion.div key={p.id} variants={fadeUp} className="group bg-paper-50 rounded-2xl overflow-hidden border border-ink/10 hover:border-ink/30 transition-all hover:-translate-y-1">
                <div className="relative aspect-[4/3] overflow-hidden bg-paper-200">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  {p.discount && (
                    <span className="absolute top-3 left-3 bg-pj-green text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Save {p.discount}%
                    </span>
                  )}
                  {p.badge === 'bestseller' && (
                    <span className="absolute top-3 left-3 bg-ink text-paper-50 text-xs font-semibold px-3 py-1 rounded-full">
                      Best Seller
                    </span>
                  )}
                  {p.badge === 'new' && (
                    <span className="absolute top-3 left-3 bg-ink text-paper-50 text-xs font-semibold px-3 py-1 rounded-full">
                      New
                    </span>
                  )}
                </div>
                <div className="p-6">
                  <span className="text-xs text-ink/50 uppercase tracking-wider">{p.category}</span>
                  <h3 className="mt-1 font-display text-xl text-ink group-hover:text-pj-green transition-colors">{p.name}</h3>
                  <ul className="mt-3 space-y-1">
                    {p.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-ink/60">
                        <CheckCircle size={14} className="text-pj-green flex-shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="font-display text-2xl text-ink">₹{p.price}</span>
                    {p.bulkPrice && <span className="text-sm text-ink/50">from · bulk ₹{p.bulkPrice}</span>}
                  </div>
                  <div className="mt-4 flex items-center gap-1">
                    <div className="flex">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} size={14} className={j < Math.round(p.rating) ? 'text-amber-500 fill-amber-500' : 'text-ink/15 fill-ink/15'} />
                      ))}
                    </div>
                    <span className="text-xs text-ink/50 ml-1">({p.reviews})</span>
                  </div>
                  <div className="mt-5 flex gap-3">
                    <Link to={`/configure/${p.id}`} className="flex-1 text-center bg-ink hover:bg-pj-green text-paper-50 text-sm font-semibold py-3 rounded-full transition-colors">
                      Customize
                    </Link>
                    <Link to={`/products/${p.slug || p.id}`} className="flex-1 text-center border border-ink/20 hover:border-ink text-ink text-sm font-semibold py-3 rounded-full transition-colors">
                      View Details
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" className="py-20 lg:py-28 bg-paper-50 border-y border-ink/10">
        <AnimatedSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-sm text-pj-green font-medium uppercase tracking-widest">Our Process</span>
            <h2 className="mt-3 font-display text-3xl sm:text-5xl text-ink">From idea to doorstep in 4 steps</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="group bg-white rounded-2xl overflow-hidden border border-ink/10 hover:border-ink/30 hover:-translate-y-1 transition-all"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-paper-200">
                  <img
                    src={step.image}
                    alt={step.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <span className="absolute top-3 left-3 w-8 h-8 rounded-full bg-ink/80 text-paper-50 text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-display text-lg text-ink">{step.title}</h3>
                  <p className="mt-1.5 text-sm text-ink/60 leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="py-20 lg:py-28">
        <AnimatedSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-sm text-pj-green font-medium uppercase tracking-widest">Testimonials</span>
            <h2 className="mt-3 font-display text-3xl sm:text-5xl text-ink">What our customers say</h2>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="relative max-w-3xl mx-auto"
            onMouseEnter={() => setIsTestiPaused(true)}
            onMouseLeave={() => setIsTestiPaused(false)}
          >
            {/* Arrow Nav */}
            <button
              onClick={() => goToTesti(testiIndex - 1)}
              aria-label="Previous testimonial"
              className="absolute left-0 lg:-left-16 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-paper-50 border border-ink/15 hover:bg-pj-green hover:text-white text-ink/70 flex items-center justify-center transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => goToTesti(testiIndex + 1)}
              aria-label="Next testimonial"
              className="absolute right-0 lg:-right-16 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-paper-50 border border-ink/15 hover:bg-pj-green hover:text-white text-ink/70 flex items-center justify-center transition-colors"
            >
              <ChevronRight size={20} />
            </button>

            <AnimatePresence mode="wait">
              <motion.div
                key={testiIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="bg-paper-50 rounded-3xl p-8 sm:p-12 border border-ink/10 shadow-sm text-center"
              >
                {siteTestimonials[testiIndex] && (() => {
                  const t = siteTestimonials[testiIndex];
                  return (
                    <>
                      <Quote size={40} className="text-pj-green/30 mx-auto mb-6" />
                      <div className="flex justify-center gap-1 mb-6">
                        {[...Array(5)].map((_, j) => (
                          <Star
                            key={j}
                            size={16}
                            className={j < (t.rating || 5) ? 'text-amber-500 fill-amber-500' : 'text-ink/15 fill-ink/15'}
                          />
                        ))}
                      </div>
                      <p className="text-lg sm:text-xl text-ink/80 leading-relaxed">“{t.text}”</p>
                      <div className="mt-8 flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pj-green to-ink text-white flex items-center justify-center text-base font-bold">
                          {t.avatar || t.name?.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-base font-semibold text-ink">{t.name}</h4>
                          <p className="text-sm text-ink/50">{t.role}</p>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </motion.div>
            </AnimatePresence>

            {/* Dot Indicators */}
            <div className="mt-8 flex justify-center gap-2">
              {siteTestimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToTesti(i)}
                  aria-label={`Go to testimonial ${i + 1}`}
                  aria-current={i === testiIndex}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    i === testiIndex ? 'w-8 bg-pj-green' : 'w-2.5 bg-ink/20 hover:bg-ink/40'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </AnimatedSection>
      </section>

      {/* ===== TRUSTED BY STRIP ===== */}
      <section className="py-12 lg:py-16 border-y border-ink/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-semibold text-ink/40 uppercase tracking-widest mb-8">
            Trusted by leading brands across India
          </p>
          <div className="flex items-center justify-between gap-8 md:gap-12 overflow-x-auto scrollbar-hide">
            {trustLogos.map((logo, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="flex-shrink-0"
              >
                <span className="block whitespace-nowrap font-display text-lg md:text-xl tracking-tight text-ink/35 grayscale hover:text-pj-green hover:grayscale-0 hover:scale-105 transition-all duration-300 cursor-default">
                  {logo}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section id="faqs" className="py-20 lg:py-28 bg-paper-50 border-y border-ink/10">
        <AnimatedSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-sm text-pj-green font-medium uppercase tracking-widest">FAQs</span>
            <h2 className="mt-3 font-display text-3xl sm:text-5xl text-ink">Questions, answered</h2>
          </motion.div>
          <motion.div variants={fadeUp}>
            <FaqAccordion items={faqs} />
          </motion.div>
        </AnimatedSection>
      </section>

      {/* ===== BLOG PREVIEW ===== */}
      <section className="py-20 lg:py-28">
        <AnimatedSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} className="flex items-end justify-between mb-14">
            <div>
              <span className="text-sm text-pj-green font-medium uppercase tracking-widest">From Our Blog</span>
              <h2 className="mt-3 font-display text-3xl sm:text-5xl text-ink">Latest articles</h2>
            </div>
            <Link to="/blog" className="hidden sm:inline-flex items-center gap-2 text-pj-green font-semibold hover:gap-3 transition-all">
              View all <ArrowRight size={16} />
            </Link>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {blogPosts.map((post, i) => (
              <motion.div key={i} variants={fadeUp}>
                <Link to={`/blog/${post.slug}`} className="group block bg-paper-50 rounded-2xl overflow-hidden border border-ink/10 hover:border-ink/30 transition-all hover:-translate-y-1">
                  <div className="aspect-[16/10] overflow-hidden bg-paper-200">
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  </div>
                  <div className="p-6">
                    <span className="text-xs text-ink/50">{post.date}</span>
                    <h3 className="mt-1 font-display text-lg text-ink group-hover:text-pj-green transition-colors leading-snug">{post.title}</h3>
                    <p className="mt-2 text-sm text-ink/60 line-clamp-2">{post.excerpt}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-pj-green group-hover:gap-2 transition-all">
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
      <section className="py-20 lg:py-28 bg-pj-green">
        <AnimatedSection className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div variants={fadeUp}>
            <h2 className="font-display text-3xl sm:text-5xl text-white">Stay in the loop</h2>
            <p className="mt-4 text-white/80 text-lg">Get exclusive offers, design tips, and new product launches straight to your inbox.</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setEmail('');
                alert('Thanks for subscribing!');
              }}
              className="mt-10 flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 px-5 py-3.5 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <button type="submit" className="bg-ink hover:bg-paper-200 text-paper-50 font-bold px-8 py-3.5 rounded-full transition-colors flex items-center justify-center gap-2">
                <Send size={16} /> Subscribe
              </button>
            </form>
            <p className="mt-3 text-white/50 text-xs">No spam, unsubscribe anytime.</p>
          </motion.div>
        </AnimatedSection>
      </section>
    </div>
  );
}
