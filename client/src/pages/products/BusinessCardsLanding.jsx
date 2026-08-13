import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  Star, ChevronRight, ChevronDown, Check, ArrowRight, FileDown,
  Ruler, Layers, LayoutGrid, Sparkles, BadgeCheck, Truck, Clock,
  ShieldCheck, Upload, PenTool, Plus, Minus,
} from 'lucide-react';
import api from '../../utils/api';
import DeliveryNote from '../../components/common/DeliveryNote';

const SIZES = {
  standard: {
    label: 'Standard',
    dims: '88.9 × 50.8 mm',
    details: 'The classic business card size. Fits standard wallets and card holders.',
    mult: 1,
  },
  moo: {
    label: 'Euro',
    dims: '85 × 55 mm',
    details: 'A little wider and shorter than standard. Distinctive and memorable.',
    mult: 1.15,
  },
  square: {
    label: 'Square',
    dims: '55 × 55 mm',
    details: 'Bold, modern and unmistakable. A square that stands out in any pile.',
    mult: 1.1,
  },
};

const COATINGS = [
  { label: 'Coated on both sides', desc: 'Smooth, print-perfect surface for crisp colors' },
  { label: 'Uncoated', desc: 'Natural paper feel, great for elegant embossed textures' },
];

const FINISHES = [
  { label: 'Matte', desc: 'Sophisticated, glare-free and easy to write on' },
  { label: 'Gloss', desc: 'Vibrant, shiny and eye-catching' },
];

const CORNERS = [
  { label: 'Square', desc: 'Classic sharp corners', addOn: 0 },
  { label: 'Rounded', desc: 'Soft, premium rounded corners', addOn: 0.1 },
];

const SIDES = [
  { label: 'Single sided', addOn: 0 },
  { label: 'Double sided', desc: 'Front and back printing', addOn: 0.2 },
];

const GUIDELINES = {
  standard: {
    label: 'Standard Size',
    trim: '88.9 × 50.8 mm',
    bleed: '92.9 × 54.8 mm',
    safe: '84.9 × 46.8 mm',
    notes: [
      'Design at 300 DPI in CMYK for best print quality',
      'Extend background colours to the bleed edge',
      'Keep important text and logos inside the safe area',
      'Recommended fonts 7pt or larger for readability',
    ],
  },
  moo: {
    label: 'Euro Size',
    trim: '85 × 55 mm',
    bleed: '89 × 59 mm',
    safe: '81 × 51 mm',
    notes: [
      'Design at 300 DPI in CMYK for best print quality',
      'Extend background colours to the bleed edge',
      'Keep important text and logos inside the safe area',
      'Recommended fonts 7pt or larger for readability',
    ],
  },
  square: {
    label: 'Square Size',
    trim: '55 × 55 mm',
    bleed: '59 × 59 mm',
    safe: '51 × 51 mm',
    notes: [
      'Design at 300 DPI in CMYK for best print quality',
      'Extend background colours to the bleed edge',
      'Keep important text and logos inside the safe area',
      'Recommended fonts 7pt or larger for readability',
    ],
  },
};

const FAQS = [
  {
    q: 'What paper stock should I choose for my business cards?',
    a: 'For the most popular choice, our Original 350 GSM art card gives a premium feel at a great price. Metallic paper adds a luxurious sheen, while non-tearable synthetic paper is perfect for durable, water-resistant cards that survive wallet life.',
  },
  {
    q: 'Can I print a different design on the back of every card?',
    a: 'Yes! Our PrintFinity feature lets you print a unique design on every single card in your pack at no extra cost. Perfect for unique QR codes, individual details, or creative campaigns.',
  },
  {
    q: 'What quantity tiers are available?',
    a: 'We offer flexible bulk pricing starting from a few cards up to thousands. The more you order, the lower the per-card price — you can see live pricing in the table below as you increase quantity.',
  },
  {
    q: 'Do you provide design templates?',
    a: 'Absolutely. Our free online design editor includes professionally made templates, 30+ fonts, clipart and design tools. You can also upload your own artwork or simply pick a template and customise it.',
  },
  {
    q: 'How long does delivery take?',
    a: 'Orders are usually printed and dispatched within 2–4 working days. Standard shipping takes 3–10 days across India depending on your location.',
  },
  {
    q: 'Can I approve a proof before printing?',
    a: 'Every design is reviewed by our team before printing. You can request changes and our team keeps you in the loop until everything is perfect.',
  },
];

function currency(n) {
  return `\u20b9${Math.round(n).toLocaleString('en-IN')}`;
}

function OptionRow({ step, title, hint, children }) {
  return (
    <div className="border border-ink/10 rounded-2xl bg-white p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-full bg-pj-green text-white text-sm font-semibold flex items-center justify-center flex-shrink-0">
            {step}
          </span>
          <h3 className="font-display text-lg text-ink">{title}</h3>
        </div>
        {hint && <span className="text-xs text-ink/40 hidden sm:block">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function Dropdown({ value, options, onChange, labelKey = 'label', descKey = 'desc', renderValue }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const selected = options.find((o) => o[labelKey] === value);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between gap-3 border rounded-xl px-4 py-3.5 bg-white text-left transition-all duration-200 ${
          open ? 'border-pj-green ring-2 ring-pj-green/30' : 'border-ink/15 hover:border-ink/35'
        }`}
      >
        <span className="min-w-0">
          <span className="block font-semibold text-ink truncate">
            {renderValue ? renderValue(selected) : selected ? selected[labelKey] : value}
          </span>
          {selected && descKey && selected[descKey] && (
            <span className="block text-xs text-ink/50 truncate">{selected[descKey]}</span>
          )}
        </span>
        <ChevronDown size={18} className={`text-ink/40 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute z-30 mt-2 w-full bg-white rounded-xl border border-ink/10 shadow-card-hover max-h-72 overflow-y-auto"
          >
            {options.map((o) => {
              const active = o[labelKey] === value;
              return (
                <li key={o[labelKey]}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(o[labelKey]);
                      setOpen(false);
                    }}
                    className={`w-full flex items-start justify-between gap-3 px-4 py-3 text-left transition-colors duration-150 ${
                      active ? 'bg-pj-sage text-pj-green' : 'text-ink hover:bg-paper-50'
                    }`}
                  >
                    <span className="min-w-0">
                      <span className={`block font-medium ${active ? 'text-pj-green' : 'text-ink'}`}>{o[labelKey]}</span>
                      {o[descKey] && <span className="block text-xs text-ink/50 mt-0.5">{o[descKey]}</span>}
                    </span>
                    {active && <Check size={16} className="text-pj-green flex-shrink-0 mt-0.5" />}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function BusinessCardsLanding() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sizeKey, setSizeKey] = useState('standard');
  const [paperIndex, setPaperIndex] = useState(0);
  const [coating, setCoating] = useState(COATINGS[0].label);
  const [finish, setFinish] = useState(FINISHES[0].label);
  const [corner, setCorner] = useState(CORNERS[0]);
  const [side, setSide] = useState(SIDES[0]);
  const [quantity, setQuantity] = useState(100);
  const [guidelineTab, setGuidelineTab] = useState('standard');
  const [faqOpen, setFaqOpen] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/products?category=business-cards&limit=100');
        if (data.success) {
          const raw = data.products || data.data || [];
          const normalized = raw.map((p) => ({
            ...p,
            price: p.basePrice || p.price || 0,
            bulkPricing: p.bulkPricing || [],
            material: p.material || 'Premium card stock',
            images: p.images ? p.images.map((i) => (typeof i === 'string' ? i : i.url || i)) : [],
            rating: p.averageRating || p.rating || 0,
            reviewCount: p.totalReviews || p.reviewCount || 0,
          }));
          setProducts(normalized);
        }
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const product = products[paperIndex] || null;
  const size = SIZES[sizeKey];

  const getTierPrice = (p, qty) => {
    if (!p || !p.bulkPricing || p.bulkPricing.length === 0) return p ? p.price : 0;
    const tier = p.bulkPricing.find((t) => qty >= t.minQty && qty <= t.maxQty) || p.bulkPricing[p.bulkPricing.length - 1];
    return tier.price;
  };

  const perCard = product
    ? getTierPrice(product, quantity) * size.mult + corner.addOn + side.addOn
    : 0;
  const total = Math.round(perCard * quantity);

  const quickQtys = [100, 250, 500, 1000, 2500];
  const effectivePaper = product || { name: 'Original Business Cards', material: '350 GSM Art Card', slug: 'business-cards' };
  const sidesParam = side.label === 'Double sided' ? 'sides=double' : 'sides=single';
  const configureUrl = product && product._id
    ? `/configure/${product._id}?${sidesParam}&size=${encodeURIComponent(sizeKey)}&qty=${quantity}#stage=design`
    : `/products?category=business-cards`;

  const avgRating = products.length
    ? (products.reduce((s, p) => s + (p.rating || 0), 0) / products.length).toFixed(1)
    : '4.8';
  const reviewCount = products.reduce((s, p) => s + (p.reviewCount || 0), 0) || 340;

  return (
    <div className="min-h-screen bg-paper-100">
      <Helmet>
        <title>Business Cards | PrintJack</title>
        <meta name="description" content="Premium custom business cards with matt lamination, spot UV, gold foil and more. Bulk pricing, free online design editor and fast India-wide delivery." />
      </Helmet>

      {/* Breadcrumb */}
      <div className="bg-paper-50 border-b border-ink/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-1.5 text-sm text-ink/50">
            <Link to="/" className="hover:text-pj-green transition-colors">Home</Link>
            <ChevronRight size={14} />
            <Link to="/products" className="hover:text-pj-green transition-colors">Products</Link>
            <ChevronRight size={14} />
            <span className="text-ink font-medium">Business Cards</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-paper-50 border-b border-ink/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="text-sm text-pj-green font-medium uppercase tracking-widest">Premium Printing</span>
              <h1 className="mt-3 font-display text-4xl sm:text-6xl text-ink leading-tight">
                Business Cards
              </h1>
              <p className="mt-4 text-lg text-ink/60 max-w-xl">
                High-quality business cards on thick 350 GSM card stock with premium finishes.
                Create your own design online or upload your artwork — 100 cards from{' '}
                <span className="font-semibold text-ink">{currency(products[0]?.price || 299)}</span>.
              </p>
              <div className="mt-5 flex items-center gap-2 text-sm">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => <Star key={i} size={16} className="fill-amber-400 text-amber-400" />)}
                </div>
                <span className="font-semibold text-ink">{avgRating}</span>
                <span className="text-ink/50">({reviewCount.toLocaleString('en-IN')} reviews)</span>
              </div>
              <ul className="mt-6 grid sm:grid-cols-2 gap-x-6 gap-y-2.5 text-sm text-ink/70">
                <li className="flex items-center gap-2"><BadgeCheck size={16} className="text-pj-green" /> 350 GSM thick card stock</li>
                <li className="flex items-center gap-2"><Sparkles size={16} className="text-pj-green" /> PrintFinity — different design on every card</li>
                <li className="flex items-center gap-2"><Layers size={16} className="text-pj-green" /> Matt lamination, spot UV & gold foil</li>
                <li className="flex items-center gap-2"><PenTool size={16} className="text-pj-green" /> Free online design editor & templates</li>
                <li className="flex items-center gap-2"><Truck size={16} className="text-pj-green" /> Fast delivery across India</li>
                <li className="flex items-center gap-2"><ShieldCheck size={16} className="text-pj-green" /> Approval before printing</li>
              </ul>
            </div>
            <div className="relative">
              <div className="rounded-3xl bg-gradient-to-br from-pj-sage to-paper-200 border border-ink/10 p-8 flex flex-col items-center justify-center gap-5">
                <div className="relative w-64 h-40">
                  <div className="absolute left-2 top-2 w-44 h-28 rounded-xl bg-white border border-ink/10 shadow-card rotate-[-6deg] flex items-center justify-center">
                    <div className="w-24 h-16 rounded-lg bg-pj-green/15 flex items-center justify-center">
                      <span className="font-display text-pj-green font-semibold">PJ</span>
                    </div>
                  </div>
                  <div className="absolute right-2 top-4 w-44 h-28 rounded-xl bg-white border border-ink/10 shadow-card rotate-[4deg] flex flex-col items-center justify-center gap-1">
                    <span className="w-16 h-2.5 rounded-full bg-ink/70" />
                    <span className="w-20 h-2 rounded-full bg-ink/30" />
                    <span className="w-14 h-2 rounded-full bg-pj-green/60" />
                  </div>
                  <div className="absolute right-8 bottom-2 w-44 h-28 rounded-xl bg-pj-green shadow-card rotate-[-3deg] flex items-center justify-center">
                    <span className="text-white font-display text-lg font-semibold">PrintJack</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-ink/60 bg-white rounded-full px-4 py-2 border border-ink/10 shadow-card">
                  <span className="flex items-center gap-1"><Ruler size={14} className="text-pj-green" /> {size.dims}</span>
                  <span className="flex items-center gap-1"><LayoutGrid size={14} className="text-pj-green" /> {product?.material || '350 GSM'}</span>
                  <span className="flex items-center gap-1"><Sparkles size={14} className="text-pj-green" /> {finish}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Configurator */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <OptionRow step={1} title="Choose your size" hint="Prices adjust automatically">
              <Dropdown
                value={sizeKey}
                options={Object.entries(SIZES).map(([key, s]) => ({ key, label: s.label, desc: `${s.dims} — ${s.details}` }))}
                onChange={(key) => setSizeKey(key)}
              />
            </OptionRow>

            <OptionRow step={2} title="Choose your paper stock">
              {loading ? (
                <div className="h-14 bg-paper-200 rounded-xl animate-pulse" />
              ) : products.length > 0 ? (
                <Dropdown
                  value={product?._id}
                  labelKey="_id"
                  options={products.map((p) => ({ _id: p._id, label: p.name, desc: `${p.material || 'Premium card stock'} · from ${currency(p.price)}/100` }))}
                  onChange={(id) => setPaperIndex(products.findIndex((p) => p._id === id))}
                />
              ) : (
                <p className="text-sm text-ink/50">Business card stocks are loading…</p>
              )}
            </OptionRow>

            <OptionRow step={3} title="Choose your coating">
              <Dropdown value={coating} options={COATINGS} onChange={setCoating} />
            </OptionRow>

            <OptionRow step={4} title="Choose your finish">
              <Dropdown value={finish} options={FINISHES} onChange={setFinish} />
            </OptionRow>

            <OptionRow step={5} title="Choose your corners & sides">
              <div className="grid sm:grid-cols-2 gap-4">
                <Dropdown value={corner.label} options={CORNERS} onChange={(label) => setCorner(CORNERS.find((c) => c.label === label))} />
                <Dropdown value={side.label} options={SIDES} onChange={(label) => setSide(SIDES.find((s) => s.label === label))} />
              </div>
            </OptionRow>

            <OptionRow step={6} title="Choose your quantity">
              <div className="flex flex-wrap gap-3 items-center">
                <div className="flex items-center border border-ink/15 rounded-xl overflow-hidden bg-white">
                  <button
                    onClick={() => setQuantity((q) => Math.max(25, q - 25))}
                    className="px-3 py-3 hover:bg-paper-50 text-ink/60"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-24 text-center font-semibold text-ink">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 25)}
                    className="px-3 py-3 hover:bg-paper-50 text-ink/60"
                    aria-label="Increase quantity"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <span className="text-sm text-ink/50">cards</span>
                <div className="flex flex-wrap gap-2">
                  {quickQtys.map((q) => (
                    <button
                      key={q}
                      onClick={() => setQuantity(q)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                        quantity === q ? 'bg-ink text-paper-50 border-ink' : 'bg-white border-ink/15 text-ink/60 hover:border-ink/40'
                      }`}
                    >
                      {q.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-xs text-ink/50 mt-3">
                Bulk pricing applies automatically. Need more? Contact us for large-order quotes.
              </p>
            </OptionRow>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-2xl border border-ink/10 shadow-card p-6">
              <h3 className="font-display text-xl text-ink mb-1">Your business cards</h3>
              <p className="text-sm text-ink/50 mb-4">Live preview of your selection</p>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-ink/50">Size</span><span className="font-medium text-ink">{size.label} · {size.dims}</span></div>
                <div className="flex justify-between"><span className="text-ink/50">Paper</span><span className="font-medium text-ink">{effectivePaper.name}</span></div>
                <div className="flex justify-between"><span className="text-ink/50">Material</span><span className="font-medium text-ink">{effectivePaper.material}</span></div>
                <div className="flex justify-between"><span className="text-ink/50">Coating</span><span className="font-medium text-ink">{coating}</span></div>
                <div className="flex justify-between"><span className="text-ink/50">Finish</span><span className="font-medium text-ink">{finish}</span></div>
                <div className="flex justify-between"><span className="text-ink/50">Corners</span><span className="font-medium text-ink">{corner.label}</span></div>
                <div className="flex justify-between"><span className="text-ink/50">Printing</span><span className="font-medium text-ink">{side.label}</span></div>
                <div className="flex justify-between"><span className="text-ink/50">Quantity</span><span className="font-medium text-ink">{quantity.toLocaleString('en-IN')} cards</span></div>
              </div>

              <div className="my-5 border-t border-dashed border-ink/10" />

              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs text-ink/50">Total (incl. GST)</p>
                  <p className="font-display text-3xl text-ink font-semibold">{currency(total)}</p>
                  <p className="text-xs text-ink/40 mt-1">{currency(perCard)} per card</p>
                </div>
              </div>

              <DeliveryNote category={product?.category || 'Business Cards'} className="mt-4 mb-1" />
              <Link
                to={configureUrl}
                className="mt-5 w-full inline-flex items-center justify-center gap-2 bg-pj-green hover:bg-[#166b4d] text-white font-semibold py-3.5 rounded-xl transition-colors"
              >
                Start making <ArrowRight size={18} />
              </Link>
              <Link
                to={configureUrl}
                className="mt-3 w-full inline-flex items-center justify-center gap-2 border-2 border-ink/10 text-ink font-semibold py-3 rounded-xl hover:border-pj-green hover:text-pj-green transition-colors"
              >
                <Upload size={16} /> Upload your own design
              </Link>
              <div className="mt-4 flex items-center justify-center gap-3 text-xs text-ink/50">
                <span className="flex items-center gap-1"><Truck size={14} className="text-pj-green" /> Free shipping over ₹999</span>
                <span className="flex items-center gap-1"><Clock size={14} className="text-pj-green" /> Delivered in under 7 days</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing table */}
        {product && product.bulkPricing && product.bulkPricing.length > 0 && (
          <div className="mt-12">
            <h2 className="font-display text-2xl sm:text-3xl text-ink text-center mb-8">Bulk pricing that rewards you</h2>
            <div className="overflow-x-auto bg-white rounded-2xl border border-ink/10 shadow-card">
              <table className="w-full min-w-[480px] text-left">
                <thead>
                  <tr className="border-b border-ink/10 text-xs uppercase tracking-wider text-ink/50">
                    <th className="px-6 py-4 font-medium">Quantity</th>
                    <th className="px-6 py-4 font-medium">Price per card</th>
                    <th className="px-6 py-4 font-medium">Pack price</th>
                    <th className="px-6 py-4 font-medium">You save</th>
                  </tr>
                </thead>
                <tbody>
                  {product.bulkPricing.map((t, i) => {
                    const rowTotal = Math.round((t.price * size.mult + corner.addOn + side.addOn) * t.maxQty);
                    const base = t.price;
                    const saving = i > 0 ? Math.round((product.bulkPricing[0].price - t.price) * t.maxQty * size.mult) : 0;
                    const isActive = quantity >= t.minQty && quantity <= t.maxQty;
                    return (
                      <tr
                        key={`${t.minQty}-${t.maxQty}`}
                        onClick={() => setQuantity(t.maxQty)}
                        className={`border-b border-ink/5 last:border-0 cursor-pointer transition-colors ${
                          isActive ? 'bg-pj-sage' : 'hover:bg-paper-50'
                        }`}
                      >
                        <td className="px-6 py-4 font-semibold text-ink">
                          {t.minQty}–{t.maxQty >= 99999 ? '10,000+' : t.maxQty.toLocaleString('en-IN')} cards
                        </td>
                        <td className="px-6 py-4 text-ink">{currency(base)}</td>
                        <td className="px-6 py-4 font-semibold text-ink">{currency(rowTotal)}</td>
                        <td className="px-6 py-4 text-pj-green font-medium">{saving > 0 ? `Save ${currency(saving)}` : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-center text-xs text-ink/50 mt-3">Click a row to select that quantity tier.</p>
          </div>
        )}
      </section>

      {/* Design guidelines */}
      <section className="bg-paper-50 border-y border-ink/10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl sm:text-3xl text-ink text-center mb-2">Design guidelines</h2>
          <p className="text-ink/50 text-center mb-8 max-w-2xl mx-auto">
            Use these measurements to make sure your artwork prints perfectly. Not sure? Our editor has built-in bleed and safe-area guides.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {Object.entries(GUIDELINES).map(([key, g]) => (
              <button
                key={key}
                onClick={() => setGuidelineTab(key)}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-colors ${
                  guidelineTab === key ? 'bg-ink text-paper-50' : 'bg-white border border-ink/15 text-ink/60 hover:border-ink/40'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-8 items-center max-w-4xl mx-auto">
            <div className="flex justify-center">
              <div className="relative w-56 h-32 bg-ink/10 rounded-lg" style={{ width: '13.5rem' }}>
                <div className="absolute inset-1 bg-paper-100 border-2 border-ink/30 rounded-md flex items-center justify-center">
                  <span className="text-xs font-medium text-ink/70">Trim {GUIDELINES[guidelineTab].trim}</span>
                </div>
                <div className="absolute inset-2.5 bg-white rounded-md shadow-card" />
              </div>
            </div>
            <div>
              <ul className="space-y-3 text-sm text-ink/70">
                {GUIDELINES[guidelineTab].notes.map((n, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <Check size={16} className="text-pj-green flex-shrink-0 mt-0.5" />
                    {n}
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 bg-white border border-ink/15 rounded-full px-4 py-2 text-xs font-medium text-ink/70">
                  <Ruler size={14} className="text-pj-green" /> Bleed: {GUIDELINES[guidelineTab].bleed}
                </span>
                <span className="inline-flex items-center gap-2 bg-white border border-ink/15 rounded-full px-4 py-2 text-xs font-medium text-ink/70">
                  <LayoutGrid size={14} className="text-pj-green" /> Safe area: {GUIDELINES[guidelineTab].safe}
                </span>
              </div>
              <Link to="/editor" className="mt-5 inline-flex items-center gap-2 text-pj-green font-semibold text-sm hover:underline">
                <FileDown size={16} /> Use our free template in the editor
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Other paper stocks */}
      {products.length > 1 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="font-display text-2xl sm:text-3xl text-ink text-center mb-2">Check out our other card stocks</h2>
          <p className="text-ink/50 text-center mb-10 max-w-2xl mx-auto">
            Every stock has its own personality. Compare our range and find the perfect match for your brand.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p, i) => (
              <div key={p._id || i} className={`bg-white rounded-2xl border p-6 shadow-card transition-shadow hover:shadow-card-hover ${i === paperIndex ? 'border-pj-green ring-2 ring-pj-green/30' : 'border-ink/10'}`}>
                <div className="aspect-[16/10] rounded-xl bg-gradient-to-br from-pj-sage to-paper-200 flex items-center justify-center mb-5 overflow-hidden">
                  {p.images && p.images[0] ? (
                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-32 h-20 rounded-lg bg-white shadow-card flex items-center justify-center">
                      <span className="text-pj-green font-display font-semibold">{p.name.split(' ').slice(0, 2).join(' ')}</span>
                    </div>
                  )}
                </div>
                <h3 className="font-display text-lg text-ink">{p.name}</h3>
                <p className="text-sm text-ink/50 mt-1">{p.material}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="font-semibold text-ink">from {currency(p.price)}<span className="text-xs font-normal text-ink/50">/100</span></span>
                  <Link
                    to={p._id ? `/configure/${p._id}` : `/products/${p.slug || p._id}`}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-pj-green hover:underline"
                  >
                    Customise <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="bg-paper-50 border-t border-ink/10 py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl sm:text-3xl text-ink text-center mb-10">Frequently asked questions</h2>
          <div className="space-y-3">
            {FAQS.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl border border-ink/10 overflow-hidden">
                <button
                  onClick={() => setFaqOpen(faqOpen === i ? -1 : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="font-semibold text-ink">{f.q}</span>
                  <ChevronDown size={18} className={`text-ink/40 flex-shrink-0 transition-transform ${faqOpen === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence initial={false}>
                  {faqOpen === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-sm text-ink/60 leading-relaxed">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
