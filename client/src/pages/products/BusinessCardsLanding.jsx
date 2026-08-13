import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Sparkles, Check, ChevronDown, Plus, Minus, ArrowRight, Truck } from 'lucide-react';
import api from '../../utils/api';

const SIZES = [
  { name: 'Standard', detail: '88.9 × 50.8 mm', mult: 1 },
  { name: 'Euro', detail: '85 × 55 mm', mult: 1.15 },
  { name: 'Square', detail: '55 × 55 mm', mult: 1.1 },
];

const COATINGS = [
  { name: 'Coated on both sides', detail: 'Smooth, print-perfect surface for crisp colors' },
  { name: 'Uncoated', detail: 'Natural paper feel, great for elegant embossed textures' },
];

const FINISHES = [
  { name: 'Matte', detail: 'Sophisticated, glare-free and easy to write on' },
  { name: 'Gloss', detail: 'Vibrant, shiny and eye-catching' },
];

const CORNERS = [
  { name: 'Square', detail: 'Classic sharp corners', addOn: 0 },
  { name: 'Rounded', detail: 'Soft 4 mm radius corners', addOn: 0.1 },
];

const SIDES = [
  { name: 'Single sided', detail: 'Print on the front only', addOn: 0 },
  { name: 'Double sided', detail: 'Front and back printing', addOn: 0.2 },
];

const QUICK_QTYS = [100, 250, 500, 1000, 2500];

const FALLBACK_STOCKS = [
  { _id: 'original', name: 'Premium Matt Laminated Business Card', detail: '350 GSM Art Card', price: 299 },
  { _id: 'spot-uv', name: 'Spot UV Business Card', detail: '350 GSM Art Card', price: 449 },
  { _id: 'gold-foil', name: 'Gold Foil Business Card', detail: '350 GSM Art Card', price: 599 },
  { _id: 'round', name: 'Round Corner Business Card', detail: '300 GSM Art Card', price: 349 },
  { _id: 'metallic', name: 'Metallic Silver Business Card', detail: 'Metallic Paper 290 GSM', price: 699 },
];

function currency(n) {
  return Math.round(n).toLocaleString('en-IN');
}

function Accordion({ number, title, selected, open, onToggle, children }) {
  return (
    <section
      className={`overflow-hidden rounded-2xl border bg-white shadow-[0_4px_20px_rgba(71,39,28,0.04)] transition-colors ${
        open ? 'border-[#dcae3e]' : 'border-[#e6ded4]'
      }`}
    >
      <button
        onClick={onToggle}
        className="flex min-h-[78px] w-full items-center gap-4 px-5 py-4 text-left sm:px-7"
        aria-expanded={open}
      >
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors ${
            open ? 'bg-[#b77b08] text-white' : 'bg-[#f1d18a] text-[#774d05]'
          }`}
        >
          {number}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-serif text-lg font-semibold text-[#4b2822] sm:text-[21px]">{title}</span>
          {!open && <span className="mt-1 block truncate text-sm text-[#907f76]">{selected}</span>}
        </span>
        <ChevronDown
          size={20}
          className={`shrink-0 text-[#9b6a09] transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="border-t border-[#f0e8de] px-5 pb-6 pt-5 sm:px-7">{children}</div>
        </div>
      </div>
    </section>
  );
}

function OptionList({ options, selected, onSelect, showPrice = false }) {
  return (
    <div className="space-y-2">
      {options.map((opt) => {
        const active = selected === opt.name;
        return (
          <button
            key={opt.name}
            onClick={() => onSelect(opt)}
            className={`group flex min-h-[72px] w-full items-center gap-4 rounded-xl border px-4 py-3 text-left transition-all ${
              active
                ? 'border-[#d5a62e] bg-[#fffaf0] shadow-[0_3px_12px_rgba(184,132,18,0.08)]'
                : 'border-[#e5ded6] bg-white hover:border-[#cbb89c] hover:bg-[#fcfaf7]'
            }`}
          >
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition ${
                active ? 'border-[#b77b08] bg-[#b77b08] text-white' : 'border-[#cfc2b5] text-transparent'
              }`}
            >
              <Check size={13} strokeWidth={3} />
            </span>
            <span className="min-w-0 flex-1">
              <span className={`block text-[15px] font-semibold ${active ? 'text-[#9a690a]' : 'text-[#4e3530]'}`}>
                {opt.name}
              </span>
              {opt.detail && <span className="mt-1 block text-sm leading-5 text-[#8b7b73]">{opt.detail}</span>}
            </span>
            {showPrice && 'price' in opt && (
              <span className="shrink-0 text-right text-sm font-semibold text-[#5d2c24]">
                from ₹{currency(opt.price)}
                <span className="block text-[11px] font-normal text-[#a18f84]">/100 cards</span>
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function QuantityPicker({ quantity, setQuantity }) {
  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-12 items-center rounded-xl border border-[#ded3c5] bg-[#fcfaf7]">
          <button
            onClick={() => setQuantity(Math.max(100, quantity - 50))}
            className="flex h-full w-12 items-center justify-center text-[#7e6a60] transition hover:bg-[#f0e7da]"
            aria-label="Decrease quantity"
          >
            <Minus size={16} />
          </button>
          <span className="min-w-[66px] text-center font-semibold text-[#4b2822]">{quantity.toLocaleString('en-IN')}</span>
          <button
            onClick={() => setQuantity(quantity + 50)}
            className="flex h-full w-12 items-center justify-center text-[#7e6a60] transition hover:bg-[#f0e7da]"
            aria-label="Increase quantity"
          >
            <Plus size={16} />
          </button>
        </div>
        <span className="text-sm text-[#8a7870]">cards</span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {QUICK_QTYS.map((q) => (
          <button
            key={q}
            onClick={() => setQuantity(q)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              quantity === q
                ? 'border-[#6b342a] bg-[#6b342a] text-white'
                : 'border-[#ded3c5] bg-white text-[#705e55] hover:border-[#b77b08]'
            }`}
          >
            {q.toLocaleString('en-IN')}
          </button>
        ))}
      </div>
      <p className="mt-4 text-sm text-[#8a7870]">
        Bulk pricing applies automatically. Need more?{' '}
        <span className="font-medium text-[#9b6a09]">Contact us for large-order quotes.</span>
      </p>
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
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#9b6a09]">
            The more you print, the more you keep
          </p>
          <h2 className="font-serif text-3xl font-semibold tracking-[-0.03em] text-[#4b2822]">
            Bulk pricing that rewards you
          </h2>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-[#dfc98c] bg-[#fff9e8] px-3 py-2 text-xs font-semibold text-[#80600f]">
          <Truck size={14} /> Delivered in under 7 days
        </span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#e4dbd0] bg-white">
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
      <p className="mt-3 text-center text-xs text-[#a08e84]">Click a row to select that quantity tier.</p>
    </section>
  );
}

export default function BusinessCardsLanding() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(1);
  const [quantity, setQuantity] = useState(100);
  const [config, setConfig] = useState({
    size: SIZES[0],
    stock: FALLBACK_STOCKS[0],
    coating: COATINGS[0],
    finish: FINISHES[0],
    corners: CORNERS[0],
    sides: SIDES[1],
  });

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
  const configureUrl = stock && stock._id
    ? `/configure/${stock._id}?${sidesParam}&size=${encodeURIComponent(config.size.name.toLowerCase())}&qty=${quantity}#stage=design`
    : `/products?category=business-cards`;

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

              <div className="space-y-3">
                <Accordion
                  number={1}
                  title="Choose your size"
                  selected={`${config.size.name} — ${config.size.detail}`}
                  open={open === 1}
                  onToggle={() => setOpen(open === 1 ? null : 1)}
                >
                  <OptionList options={SIZES} selected={config.size.name} onSelect={(s) => set('size', s)} />
                  <p className="mt-3 text-sm leading-6 text-[#8a7870]">
                    The classic business card size. Fits standard wallets and card holders.
                  </p>
                </Accordion>

                <Accordion
                  number={2}
                  title="Choose your paper stock"
                  selected={config.stock.name}
                  open={open === 2}
                  onToggle={() => setOpen(open === 2 ? null : 2)}
                >
                  {loading ? (
                    <div className="h-16 animate-pulse rounded-xl bg-[#f0e7da]" />
                  ) : (
                    <OptionList
                      options={(stocks.length ? stocks : FALLBACK_STOCKS).map((s) => ({
                        name: s.name,
                        detail: s.detail,
                        price: s.price,
                      }))}
                      selected={config.stock.name}
                      onSelect={(s) => {
                        const match = (stocks.length ? stocks : FALLBACK_STOCKS).find((x) => x.name === s.name);
                        set('stock', match || s);
                      }}
                      showPrice
                    />
                  )}
                </Accordion>

                <Accordion
                  number={3}
                  title="Choose your coating"
                  selected={config.coating.name}
                  open={open === 3}
                  onToggle={() => setOpen(open === 3 ? null : 3)}
                >
                  <OptionList options={COATINGS} selected={config.coating.name} onSelect={(s) => set('coating', s)} />
                </Accordion>

                <Accordion
                  number={4}
                  title="Choose your finish"
                  selected={config.finish.name}
                  open={open === 4}
                  onToggle={() => setOpen(open === 4 ? null : 4)}
                >
                  <OptionList options={FINISHES} selected={config.finish.name} onSelect={(s) => set('finish', s)} />
                </Accordion>

                <Accordion
                  number={5}
                  title="Choose your corners & sides"
                  selected={`${config.corners.name}, ${config.sides.name}`}
                  open={open === 5}
                  onToggle={() => setOpen(open === 5 ? null : 5)}
                >
                  <div className="space-y-6">
                    <div>
                      <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[#9b6a09]">Corners</p>
                      <OptionList options={CORNERS} selected={config.corners.name} onSelect={(s) => set('corners', s)} />
                    </div>
                    <div>
                      <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[#9b6a09]">Printing sides</p>
                      <OptionList options={SIDES} selected={config.sides.name} onSelect={(s) => set('sides', s)} />
                    </div>
                  </div>
                </Accordion>

                <Accordion
                  number={6}
                  title="Choose your quantity"
                  selected={`${quantity.toLocaleString('en-IN')} cards`}
                  open={open === 6}
                  onToggle={() => setOpen(open === 6 ? null : 6)}
                >
                  <QuantityPicker quantity={quantity} setQuantity={setQuantity} />
                </Accordion>
              </div>

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
