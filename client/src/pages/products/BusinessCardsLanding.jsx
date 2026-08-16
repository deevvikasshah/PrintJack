import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Sparkles, ChevronDown, ArrowRight, Truck, LayoutTemplate, PenTool, Upload } from 'lucide-react';
import { clsx } from 'clsx';
import api from '../../utils/api';

const SIZES = [
  { name: 'Standard', detail: '88.9 × 50.8 mm', mult: 1, thumb: 'std' },
  { name: 'PrintJack OG', detail: '85 × 55 mm', mult: 1.15, thumb: 'og' },
  { name: 'Square', detail: '55 × 55 mm', mult: 1.1, thumb: 'sq' },
];

const COATINGS = [
  { name: 'Coated on both sides', detail: 'Smooth, print-perfect surface for crisp colors' },
  { name: 'Uncoated', detail: 'Natural paper feel, great for elegant embossed textures' },
];

const FINISHES = [
  { name: 'Matte', detail: 'With a smooth feel. Shine-free so no glare.' },
  { name: 'Gloss', detail: 'Eye-catchingly shiny. Makes color photos pop.' },
];

const CORNERS = [
  { name: 'Square', detail: 'Sharp and Stylish', addOn: 0 },
  { name: 'Rounded', detail: 'Smooth & Rounded', addOn: 0.1 },
];

const SIDES = [
  { name: 'Single sided', detail: 'Print on the front only', addOn: 0 },
  { name: 'Double sided', detail: 'Front and back printing', addOn: 0.2 },
];

const QUICK_QTYS = [100, 250, 500, 1000, 2500];

const DESIGN_OPTIONS = [
  {
    id: 'templates',
    icon: LayoutTemplate,
    iconBg: 'bg-[#EBD9EE] text-[#8E4A6B]',
    title: 'Use our templates',
    bullets: ['Looking for inspiration', 'Want simple customization'],
  },
  {
    id: 'editor',
    icon: PenTool,
    iconBg: 'bg-[#FCEFC8] text-[#9B6A09]',
    title: 'Design here online',
    bullets: ['Already have your logo', 'Customize every detail'],
  },
  {
    id: 'upload',
    icon: Upload,
    iconBg: 'bg-[#D6E6F5] text-[#2E5B8A]',
    title: 'Upload a full design',
    bullets: ['Have a complete design', 'Have your own designer'],
  },
];

const FALLBACK_STOCKS = [
  { _id: 'original', name: 'Premium Matt Laminated Business Card', detail: '350 GSM Art Card', price: 299 },
  { _id: 'spot-uv', name: 'Spot UV Business Card', detail: '350 GSM Art Card', price: 449 },
  { _id: 'gold-foil', name: 'Gold Foil Business Card', detail: '350 GSM Art Card', price: 599 },
  { _id: 'round', name: 'Round Corner Business Card', detail: '300 GSM Art Card', price: 349 },
  { _id: 'metallic', name: 'Metallic Silver Business Card', detail: 'Metallic Paper 290 GSM', price: 699 },
];

const GREEN = '#EAB308';

function currency(n) {
  return Math.round(n).toLocaleString('en-IN');
}

/* ---------- Shared MCQ card ---------- */
function SelectableCard({ selected, onClick, className, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={clsx(
        'group w-full rounded-2xl border-2 p-4 text-left transition-all duration-150',
        selected
          ? 'border-[#EAB308] bg-[#FDFBF3] shadow-[0_8px_20px_rgba(234,179,8,0.18)]'
          : 'border-[#E3DBD1] bg-white hover:border-[#D5A62E]/60 hover:shadow-sm',
        className
      )}
    >
      {children}
    </button>
  );
}

function SectionLabel({ children }) {
  return (
    <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[#9b6a09]">{children}</p>
  );
}

function SelectField({ label, value, onChange, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-[#9b6a09]">{label}</span>
      <span className="relative block">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-xl border border-[#ded3c5] bg-[#fcfaf7] px-4 py-3 pr-10 text-sm font-medium text-[#4b2822] transition focus:border-[#d5a62e] focus:outline-none focus:ring-2 focus:ring-[#f1d18a]/60"
        >
          {children}
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9b6a09]"
        />
      </span>
    </label>
  );
}

/* ---------- Size cards ---------- */
function CardThumb({ thumb }) {
  const classes = {
    std: 'w-14 h-8',
    og: 'w-14 h-9',
    sq: 'w-12 h-12',
  };
  return (
    <div className="flex h-16 w-full items-center justify-center rounded-lg bg-[#F5EFE3]">
      <div
        className={clsx(
          'rounded-[4px] bg-gradient-to-br from-[#8A5544] to-[#5d2c24] shadow-[3px_4px_0_rgba(156,106,35,0.18)]',
          classes[thumb]
        )}
      />
    </div>
  );
}

function SizeCard({ size, selected, onClick }) {
  return (
    <SelectableCard selected={selected} onClick={onClick}>
      <CardThumb thumb={size.thumb} />
      <p className="mt-3 text-sm font-bold text-[#4b2822]">{size.name}</p>
      <p className="mt-0.5 text-xs text-[#96857c]">{size.detail}</p>
    </SelectableCard>
  );
}

/* ---------- Finish cards ---------- */
function FinishCard({ finish, selected, onClick }) {
  const glossy = finish.name === 'Gloss';
  return (
    <SelectableCard selected={selected} onClick={onClick}>
      <div className="relative mb-3 flex h-16 w-full items-center justify-center overflow-hidden rounded-lg">
        {glossy ? (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-[#4F7CAC] via-[#3A5E8C] to-[#243D5E]" />
            <div className="absolute -top-4 left-2 h-16 w-24 rotate-[-18deg] rounded-full bg-white/40 blur-md" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-[#E8E2D6] via-[#DBD2C0] to-[#C7BBA4]" />
            <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-white/40" />
          </>
        )}
        <span className={clsx('relative z-10 text-[10px] font-bold uppercase tracking-[0.16em]', glossy ? 'text-white' : 'text-[#6b5a4e]')}>
          {finish.name}
        </span>
      </div>
      <p className="text-sm font-bold text-[#4b2822]">{finish.name}</p>
      <p className="mt-0.5 text-xs leading-5 text-[#96857c]">{finish.detail}</p>
    </SelectableCard>
  );
}

/* ---------- Corners cards ---------- */
function CornerIcon({ rounded }) {
  return (
    <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth="2">
      <rect
        x="4"
        y="4"
        width="16"
        height="16"
        rx={rounded ? 6 : 1}
        stroke="#9b6a09"
        fill={rounded ? 'none' : 'currentColor'}
        fillOpacity="0.15"
      />
    </svg>
  );
}

function CornerCard({ corner, selected, onClick }) {
  return (
    <SelectableCard selected={selected} onClick={onClick}>
      <div className="mb-3 flex h-16 w-full items-center justify-center rounded-lg bg-[#F5EFE3] text-[#9b6a09]">
        <CornerIcon rounded={corner.name === 'Rounded'} />
      </div>
      <p className="text-sm font-bold text-[#4b2822]">{corner.name}</p>
      <p className="mt-0.5 text-xs text-[#96857c]">{corner.detail}</p>
    </SelectableCard>
  );
}

/* ---------- Printing sides cards ---------- */
function SidesIcon({ double }) {
  return (
    <div className="relative h-9 w-14">
      {double && (
        <div className="absolute left-0 top-0 h-8 w-[52px] rotate-[-8deg] rounded-[5px] bg-[#C9A64E] shadow-sm" />
      )}
      <div className="absolute right-0 bottom-0 h-8 w-[52px] rotate-[6deg] rounded-[5px] bg-gradient-to-br from-[#8A5544] to-[#5d2c24] shadow-sm" />
    </div>
  );
}

function SideCard({ side, selected, onClick }) {
  return (
    <SelectableCard selected={selected} onClick={onClick}>
      <div className="mb-3 flex h-16 w-full items-center justify-center rounded-lg bg-[#F5EFE3]">
        <SidesIcon double={side.name !== 'Single sided'} />
      </div>
      <p className="text-sm font-bold text-[#4b2822]">{side.name}</p>
      <p className="mt-0.5 text-xs leading-5 text-[#96857c]">{side.detail}</p>
    </SelectableCard>
  );
}

/* ---------- Quantity list ---------- */
function QuantityList({ quantity, setQuantity, perCard }) {
  const [isCustom, setIsCustom] = useState(false);
  const handleType = (e) => {
    const raw = e.target.value.replace(/\D/g, '');
    setQuantity(raw === '' ? '' : Math.max(1, Number(raw)));
  };

  return (
    <div className="space-y-3">
      <div>
        <span className="mb-1.5 block text-xs font-semibold text-[#8a7870]">Quick select</span>
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <select
              value={isCustom ? 'custom' : Number(quantity) || 0}
              onChange={(e) => {
                if (e.target.value === 'custom') {
                  setIsCustom(true);
                  return;
                }
                setIsCustom(false);
                setQuantity(Number(e.target.value));
              }}
              className="w-full appearance-none rounded-xl border border-[#ded3c5] bg-[#fcfaf7] px-4 py-3 pr-10 text-sm font-semibold text-[#4b2822] transition focus:border-[#d5a62e] focus:outline-none focus:ring-2 focus:ring-[#f1d18a]/60"
            >
              {QUICK_QTYS.map((q) => (
                <option key={q} value={q}>
                  {q.toLocaleString('en-IN')} cards — ₹{currency(perCard * q)}
                </option>
              ))}
              <option value="custom">Custom quantity…</option>
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9b6a09]"
            />
          </div>
          <span className="shrink-0 text-sm text-[#8a7870]">per card</span>
        </div>
      </div>

      <div className="rounded-xl border-2 border-[#ded3c5] bg-[#fcfaf7] px-4 py-3 transition focus-within:border-[#d5a62e] focus-within:ring-2 focus-within:ring-[#f1d18a]/60">
        <label htmlFor="qty-custom" className="mb-1 block text-xs font-semibold text-[#8a7870]">
          Or type your quantity
        </label>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <input
              id="qty-custom"
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => {
                handleType(e);
                setIsCustom(true);
              }}
              className="w-[110px] rounded-lg border border-[#eee5da] bg-white px-3 py-2 text-center font-semibold text-[#4b2822] outline-none"
            />
            <span className="text-sm text-[#8a7870]">cards</span>
          </div>
          {quantity !== '' && Number(quantity) > 0 && (
            <span className="text-sm font-semibold text-[#5d2c24]">₹{currency(perCard * (Number(quantity) || 0))}</span>
          )}
        </div>
        <p className="mt-2 text-xs text-[#8a7870]">
          Bulk pricing applies automatically. Need more?{' '}
          <span className="font-medium text-[#9b6a09]">Contact us for large-order quotes.</span>
        </p>
      </div>
    </div>
  );
}

/* ---------- Design approach cards ---------- */
function DesignApproach({ value, onChange }) {
  return (
    <div className="space-y-3">
      {DESIGN_OPTIONS.map((opt) => {
        const Icon = opt.icon;
        const selected = value === opt.id;
        return (
          <SelectableCard
            key={opt.id}
            selected={selected}
            onClick={() => onChange(opt.id)}
            className={clsx('flex items-center gap-4 p-4', !selected && 'border-[#E8E2D9]')}
          >
            <span
              className={clsx(
                'flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl',
                opt.iconBg
              )}
            >
              <Icon size={26} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold text-[#4b2822]">{opt.title}</span>
              <span className="mt-1.5 flex flex-col gap-1">
                {opt.bullets.map((b) => (
                  <span key={b} className="flex items-center gap-2 text-xs text-[#8a7870]">
                    <span className="h-1 w-1 rounded-full bg-[#d5a62e]" />
                    {b}
                  </span>
                ))}
              </span>
            </span>
          </SelectableCard>
        );
      })}
    </div>
  );
}

function OrderSummary({ config, quantity, total, perCard, configureUrl }) {
  const rows = [
    ['Size', `${config.size.name} — ${config.size.detail}`],
    ['Paper', config.stock.name],
    ['Coating', config.coating.name],
    ['Finish', config.finish.name],
    ['Corners', config.corners.name],
    ['Sides', config.sides.name],
    ['Quantity', `${quantity.toLocaleString('en-IN')} cards`],
  ];
  return (
    <aside className="sticky top-[143px] rounded-2xl border border-[#dfd4c7] bg-white p-5 shadow-[0_8px_35px_rgba(71,39,28,0.07)] sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#9b6a09]">Your order</p>
          <h2 className="mt-1 font-serif text-2xl font-semibold text-[#4b2822]">Business cards</h2>
        </div>
        <span className="rounded-full bg-[#f7efe4] px-3 py-1 text-xs font-semibold text-[#7c6255]">Draft</span>
      </div>

      <div className="relative mb-6 flex h-40 items-center justify-center overflow-hidden rounded-xl bg-[#f1e7da]">
        <div className="card-preview relative flex h-[92px] w-[155px] rotate-[-5deg] flex-col justify-between rounded-md bg-[#6b342a] p-4 text-white shadow-[10px_12px_0_rgba(156,106,35,0.16)]">
          <span className="font-serif text-[10px] font-bold tracking-wide">PrintJack</span>
          <span className="text-[7px] uppercase tracking-[0.2em] text-[#e5b946]">Make your mark</span>
        </div>
        <div className="absolute -bottom-12 -right-10 h-28 w-28 rounded-full border-[16px] border-[#d5a62e]/30" />
      </div>

      <div className="space-y-3 border-b border-[#eee5da] pb-5">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-start justify-between gap-4 text-sm">
            <span className="text-[#96857c]">{label}</span>
            <span className="max-w-[190px] text-right font-medium text-[#573b34]">{value}</span>
          </div>
        ))}
      </div>

      <div className="flex items-end justify-between py-5">
        <span className="text-sm text-[#8a7870]">Estimated total</span>
        <span className="font-serif text-3xl font-semibold text-[#5d2c24]">₹{currency(total)}</span>
      </div>

      <Link
        to={configureUrl}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#b77b08] py-3.5 text-sm font-bold text-white shadow-[0_7px_15px_rgba(183,123,8,0.2)] transition hover:bg-[#976306]"
      >
        Continue to design <ArrowRight size={17} />
      </Link>
      <p className="mt-3 text-center text-xs text-[#9a8980]">Prices adjust automatically</p>
    </aside>
  );
}

function BulkPricing({ quantity, setQuantity, stock }) {
  const [open, setOpen] = useState(true);
  const tiers = stock && stock.bulkPricing && stock.bulkPricing.length
    ? stock.bulkPricing
    : [
        { minQty: 1, maxQty: 4, price: stock ? stock.price : 299 },
        { minQty: 5, maxQty: 14, price: stock ? Math.max(1, stock.price - 5) : 294 },
        { minQty: 15, maxQty: 49, price: stock ? Math.max(1, stock.price - 10) : 289 },
        { minQty: 50, maxQty: 199, price: stock ? Math.max(1, stock.price - 20) : 279 },
      ];
  const base = tiers[0]?.price || stock?.price || 299;

  return (
    <section className="mt-16">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 text-left"
      >
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#9b6a09]">
            The more you print, the more you keep
          </p>
          <h2 className="font-serif text-3xl font-semibold tracking-[-0.03em] text-[#4b2822]">
            Bulk pricing that rewards you
          </h2>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#dfc98c] bg-[#fff9e8] px-3 py-2 text-xs font-semibold text-[#80600f]">
            <Truck size={14} /> Delivered in under 7 days
          </span>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#9b6a09]">
            {open ? 'Hide pricing' : 'View pricing'}
            <ChevronDown size={16} className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
          </span>
        </div>
      </button>

      {open && (
        <div className="mt-5 overflow-hidden rounded-2xl border border-[#e4dbd0] bg-white">
          <div className="grid grid-cols-[1.3fr_1fr_1fr_1fr] border-b border-[#ebe3da] bg-[#fcfaf7] px-4 py-4 text-[10px] font-bold uppercase tracking-[0.12em] text-[#98877c] sm:px-6">
            <span>Quantity</span>
            <span>Price per card</span>
            <span>Pack price</span>
            <span>You save</span>
          </div>
          {tiers.map((t, i) => {
            const packPrice = Math.round(t.price * t.maxQty);
            const saving = i > 0 ? Math.round((base - t.price) * t.maxQty) : 0;
            const active = quantity >= t.minQty && quantity <= t.maxQty;
            return (
              <button
                key={`${t.minQty}-${t.maxQty}`}
                onClick={() => setQuantity(t.maxQty)}
                className={`grid w-full grid-cols-[1.3fr_1fr_1fr_1fr] px-4 py-4 text-left text-sm transition sm:px-6 ${
                  active ? 'bg-[#fff9ea]' : 'hover:bg-[#fcfaf7]'
                }`}
              >
                <span className="font-medium text-[#60443b]">
                  {t.minQty}–{t.maxQty >= 99999 ? '10,000+' : t.maxQty.toLocaleString('en-IN')}
                </span>
                <span className="text-[#725d53]">₹{currency(t.price)}</span>
                <span className="font-semibold text-[#5d2c24]">₹{currency(packPrice)}</span>
                <span className="font-medium text-[#b07808]">{saving > 0 ? `Save ₹${currency(saving)}` : '—'}</span>
              </button>
            );
          })}
        </div>
      )}
      {open && (
        <p className="mt-3 text-center text-xs text-[#a08e84]">Click a row to select that quantity tier.</p>
      )}
    </section>
  );
}

export default function BusinessCardsLanding() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(100);
  const [designApproach, setDesignApproach] = useState('editor');
  const [config, setConfig] = useState({
    size: SIZES[0],
    stock: FALLBACK_STOCKS[0],
    coating: COATINGS[0],
    finish: FINISHES[0],
    corners: CORNERS[0],
    sides: SIDES[1],
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/products?category=business-cards&limit=100');
        if (data.success) {
          const raw = data.products || data.data || [];
          const mapped = raw.map((p) => ({
            _id: p._id,
            name: p.name,
            detail: p.material || 'Premium card stock',
            price: p.basePrice || p.price || 0,
            bulkPricing: p.bulkPricing || [],
            mult: 1,
          }));
          if (mapped.length) {
            setStocks(mapped);
            setConfig((c) => ({ ...c, stock: mapped[0] }));
          }
        }
      } catch {
        setStocks(FALLBACK_STOCKS);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const set = (key, value) => setConfig((c) => ({ ...c, [key]: value }));

  const stock = config.stock;
  const sizeMult = config.size.mult || 1;
  const perCard = Math.round(
    (stock.price * sizeMult + config.corners.addOn + config.sides.addOn) * (config.coating.name === 'Uncoated' ? 0.94 : 1)
  );
  const total = Math.round(perCard * quantity);

  const sidesParam = config.sides.name === 'Double sided' ? 'sides=double' : 'sides=single';
  const designTab = designApproach === 'templates' ? 'templates' : designApproach === 'upload' ? 'upload' : 'canvas';
  const configureUrl = stock && stock._id
    ? `/configure/${stock._id}?${sidesParam}&size=${encodeURIComponent(config.size.name.toLowerCase())}&qty=${quantity}&tab=${designTab}#stage=design`
    : `/products?category=business-cards`;

  // Clicking a design-approach card sets the choice AND jumps straight into the
  // design stage with the matching panel open (templates / upload / canvas).
  const goDesign = (approach) => {
    setDesignApproach(approach);
    if (!stock || !stock._id) return;
    const tab = approach === 'templates' ? 'templates' : approach === 'upload' ? 'upload' : 'canvas';
    navigate(
      `/configure/${stock._id}?${sidesParam}&size=${encodeURIComponent(config.size.name.toLowerCase())}&qty=${quantity}&tab=${tab}#stage=design`
    );
  };

  return (
    <div className="min-h-screen bg-[#f8f5ef] text-[#3b2925]">
      <Helmet>
        <title>Business Cards | PrintJack</title>
        <meta
          name="description"
          content="Premium custom business cards with matt lamination, spot UV, gold foil and more. Bulk pricing, free online design editor and fast India-wide delivery."
        />
      </Helmet>

      <main>
        <section className="mx-auto max-w-[1440px] px-5 pb-16 pt-9 lg:px-10 lg:pt-14">
          <div className="mb-11 max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#e6c77c] bg-[#fff9e9] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#986b0c]">
              <Sparkles size={14} /> Make it unmistakably yours
            </div>
            <h1 className="font-serif text-4xl font-semibold leading-[1.12] tracking-[-0.04em] text-[#4b2822] sm:text-5xl lg:text-[58px]">
              Standard business cards,
              <br />
              <span className="text-[#b27b13]">beautifully finished.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#75635b]">
              Choose your stock, finish and quantity. We’ll make every detail feel just right, from the first handshake
              to the last card.
            </p>
          </div>

          <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_370px]">
            <div>
              <div className="mb-4 flex items-center justify-between text-sm">
                <span className="font-semibold text-[#5d2c24]">Build your cards</span>
                <span className="text-[#8b7a70]">Prices adjust automatically</span>
              </div>

              <div className="rounded-2xl border border-[#e6ded4] bg-white p-5 shadow-[0_4px_20px_rgba(71,39,28,0.04)] sm:p-7">
                {/* Size */}
                <div className="mb-7">
                  <SectionLabel>Choose your size</SectionLabel>
                  <div className="grid grid-cols-2 gap-3">
                    {SIZES.map((s) => (
                      <SizeCard
                        key={s.name}
                        size={s}
                        selected={config.size.name === s.name}
                        onClick={() => set('size', s)}
                      />
                    ))}
                  </div>
                </div>

                {/* Paper stock */}
                <div className="mb-7 border-t border-[#f0e8de] pt-6">
                  <SelectField
                    label="Paper stock"
                    value={config.stock.name}
                    onChange={(v) => {
                      const match = (stocks.length ? stocks : FALLBACK_STOCKS).find((s) => s.name === v);
                      set('stock', match || config.stock);
                    }}
                  >
                    {(stocks.length ? stocks : FALLBACK_STOCKS).map((s) => (
                      <option key={s.name} value={s.name}>
                        {s.name} — {s.detail}
                      </option>
                    ))}
                  </SelectField>
                </div>

                {/* Coating */}
                <div className="mb-7 border-t border-[#f0e8de] pt-6">
                  <SelectField
                    label="Coating"
                    value={config.coating.name}
                    onChange={(v) => set('coating', COATINGS.find((c) => c.name === v) || config.coating)}
                  >
                    {COATINGS.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </SelectField>
                </div>

                {/* Finish */}
                <div className="mb-7 border-t border-[#f0e8de] pt-6">
                  <SectionLabel>Choose your finish</SectionLabel>
                  <div className="grid grid-cols-2 gap-3">
                    {FINISHES.map((f) => (
                      <FinishCard
                        key={f.name}
                        finish={f}
                        selected={config.finish.name === f.name}
                        onClick={() => set('finish', f)}
                      />
                    ))}
                  </div>
                </div>

                {/* Corners */}
                <div className="mb-7 border-t border-[#f0e8de] pt-6">
                  <SectionLabel>Choose your corners</SectionLabel>
                  <div className="grid grid-cols-2 gap-3">
                    {CORNERS.map((c) => (
                      <CornerCard
                        key={c.name}
                        corner={c}
                        selected={config.corners.name === c.name}
                        onClick={() => set('corners', c)}
                      />
                    ))}
                  </div>
                </div>

                {/* Printing sides */}
                <div className="mb-7 border-t border-[#f0e8de] pt-6">
                  <SectionLabel>Choose your printing sides</SectionLabel>
                  <div className="grid grid-cols-2 gap-3">
                    {SIDES.map((s) => (
                      <SideCard
                        key={s.name}
                        side={s}
                        selected={config.sides.name === s.name}
                        onClick={() => set('sides', s)}
                      />
                    ))}
                  </div>
                </div>

                {/* Quantity */}
                <div className="border-t border-[#f0e8de] pt-6">
                  <SectionLabel>Quantity</SectionLabel>
                  <QuantityList quantity={quantity} setQuantity={setQuantity} perCard={perCard} />
                </div>
              </div>

              {/* How would you like to design your cards? */}
              <section className="mt-10 rounded-2xl border border-[#e6ded4] bg-[#fffdf9] p-5 sm:p-7">
                <SectionLabel>How would you like to design your cards?</SectionLabel>
                <DesignApproach value={designApproach} onChange={goDesign} />
              </section>

              <BulkPricing quantity={quantity} setQuantity={setQuantity} stock={stock} />

              <section className="mt-14 rounded-2xl border border-[#e6ded4] bg-[#fffdf9] p-6 text-center sm:p-9">
                <div className="mx-auto max-w-2xl">
                  <span className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#f3dfab] text-[#9b6a09]">
                    <Sparkles size={18} />
                  </span>
                  <h2 className="font-serif text-3xl font-semibold text-[#4b2822]">Design guidelines</h2>
                  <p className="mt-3 text-sm leading-6 text-[#8a7870]">
                    Give your artwork room to breathe. Add 3 mm bleed on every side and keep important text inside the
                    safe area. Not sure? Our editor has built-in bleed and safe-area guides.
                  </p>
                  <Link
                    to="/editor"
                    className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#9b6a09] transition hover:text-[#6b342a]"
                  >
                    Open the design editor <ArrowRight size={16} />
                  </Link>
                </div>
              </section>
            </div>

            <OrderSummary
              config={config}
              quantity={quantity}
              total={total}
              perCard={perCard}
              configureUrl={configureUrl}
            />
          </div>
        </section>
      </main>
    </div>
  );
}