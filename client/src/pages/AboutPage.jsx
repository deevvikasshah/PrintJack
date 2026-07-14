import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Target, Eye, Heart, Award, Users, Package,
  Clock, Star, CheckCircle, Printer, Truck, Shield,
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

function AnimatedSection({ children, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div ref={ref} initial="hidden" animate={inView ? 'visible' : 'hidden'} className={className}>
      {children}
    </motion.div>
  );
}

const stats = [
  { number: '5+', label: 'Years in Business', icon: Clock },
  { number: '50K+', label: 'Orders Delivered', icon: Package },
  { number: '200+', label: 'Products', icon: Printer },
  { number: '10K+', label: 'Happy Customers', icon: Users },
];

const values = [
  { icon: Award, title: 'Quality First', desc: 'We never compromise on quality. Every product goes through strict quality checks before dispatch.' },
  { icon: Heart, title: 'Customer Love', desc: 'Your satisfaction is our priority. We go above and beyond to make every order perfect.' },
  { icon: Truck, title: 'Fast Delivery', desc: 'We know time matters. Our streamlined process ensures on-time delivery every single time.' },
  { icon: Shield, title: 'Trust & Transparency', desc: 'No hidden charges, no surprises. What you see is what you get, every time.' },
];

const team = [
  { name: 'Arjun Kumar', role: 'Founder & CEO', avatar: 'AK' },
  { name: 'Neha Gupta', role: 'Head of Operations', avatar: 'NG' },
  { name: 'Ravi Patel', role: 'Design Lead', avatar: 'RP' },
  { name: 'Sneha Reddy', role: 'Customer Success', avatar: 'SR' },
];

export default function AboutPage() {
  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-navy-700 to-navy-900 py-24">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: 'linear' }} className="absolute -top-40 -right-40 w-[500px] h-[500px] border border-white/5 rounded-full" />
          <motion.div animate={{ rotate: -360 }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }} className="absolute -bottom-20 -left-20 w-[400px] h-[400px] border border-white/5 rounded-full" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            Our Story
          </motion.span>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
            Empowering Businesses Through <span className="text-yellow-300">Print</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-6 text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
            PrintJack was born from a simple idea: make professional-quality printing accessible to every business in India. From a small garage setup to serving 10,000+ businesses — this is our journey.
          </motion.p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 bg-white">
        <AnimatedSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div variants={fadeUp}>
              <span className="text-brand-500 font-semibold text-sm uppercase tracking-wider">How It All Started</span>
              <h2 className="mt-2 text-3xl font-extrabold text-gray-900">From Garage to Pan India</h2>
              <div className="mt-6 space-y-4 text-gray-600 leading-relaxed">
                <p>
                  In 2020, we started PrintJack with one second-hand printer, a laptop, and an unshakeable belief that every business deserves premium printed materials without breaking the bank.
                </p>
                <p>
                  What began as a one-person operation serving local businesses in our neighborhood has grown into a full-scale printing platform serving customers across all 28 states and 8 union territories of India.
                </p>
                <p>
                  Today, PrintJack operates from a 5,000 sq ft facility with state-of-the-art printing equipment, a passionate team of 25+ professionals, and a catalog of 200+ customizable products.
                </p>
              </div>
            </motion.div>
            <motion.div variants={fadeUp} className="grid grid-cols-2 gap-4">
              <div className="bg-brand-500/10 rounded-2xl p-6 text-center">
                <div className="text-3xl font-extrabold text-brand-500">2020</div>
                <p className="text-sm text-gray-600 mt-1">Founded</p>
              </div>
              <div className="bg-navy-700/10 rounded-2xl p-6 text-center">
                <div className="text-3xl font-extrabold text-navy-700">25+</div>
                <p className="text-sm text-gray-600 mt-1">Team Members</p>
              </div>
              <div className="bg-emerald-500/10 rounded-2xl p-6 text-center">
                <div className="text-3xl font-extrabold text-emerald-600">5000</div>
                <p className="text-sm text-gray-600 mt-1">Sq Ft Facility</p>
              </div>
              <div className="bg-amber-500/10 rounded-2xl p-6 text-center">
                <div className="text-3xl font-extrabold text-amber-600">200+</div>
                <p className="text-sm text-gray-600 mt-1">Products</p>
              </div>
            </motion.div>
          </div>
        </AnimatedSection>
      </section>

      {/* Mission / Vision / Values */}
      <section className="py-20 bg-gray-50">
        <AnimatedSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <span className="text-brand-500 font-semibold text-sm uppercase tracking-wider">What Drives Us</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900">Mission, Vision & Values</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Target, title: 'Our Mission', desc: 'To make professional printing accessible, affordable, and effortless for every business in India through technology and innovation.', color: 'from-brand-500 to-red-600' },
              { icon: Eye, title: 'Our Vision', desc: 'To become India\'s most trusted and loved printing platform, empowering 1 million businesses by 2030.', color: 'from-navy-700 to-blue-900' },
              { icon: Heart, title: 'Our Promise', desc: 'We promise quality you can trust, prices you\'ll love, and service that makes you come back. Every order, every time.', color: 'from-emerald-500 to-emerald-600' },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeUp} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-5`}>
                  <item.icon size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
                <p className="mt-3 text-gray-600 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>
      </section>

      {/* Values */}
      <section className="py-20 bg-white">
        <AnimatedSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <span className="text-brand-500 font-semibold text-sm uppercase tracking-wider">Core Values</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900">What We Stand For</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <motion.div key={i} variants={fadeUp} className="text-center p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-lg transition-all">
                <div className="w-12 h-12 rounded-xl bg-navy-700 text-white flex items-center justify-center mx-auto mb-4">
                  <v.icon size={22} />
                </div>
                <h3 className="font-bold text-gray-900">{v.title}</h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>
      </section>

      {/* Stats */}
      <section className="py-20 bg-gradient-to-r from-brand-500 to-red-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <s.icon size={32} className="mx-auto text-white/80 mb-3" />
                <div className="text-4xl sm:text-5xl font-extrabold text-white">{s.number}</div>
                <p className="mt-1 text-white/80 font-medium">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-white">
        <AnimatedSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <span className="text-brand-500 font-semibold text-sm uppercase tracking-wider">Meet the Team</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900">The People Behind PrintJack</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {team.map((member, i) => (
              <motion.div key={i} variants={fadeUp} className="text-center group">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-navy-700 to-brand-500 flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform">
                  {member.avatar}
                </div>
                <h3 className="font-bold text-gray-900">{member.name}</h3>
                <p className="text-sm text-gray-500">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>
      </section>

      {/* CTA */}
      <section className="py-20 bg-navy-700">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <motion.div variants={fadeUp}>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Ready to Start Printing?</h2>
              <p className="mt-4 text-white/70 text-lg">Join 10,000+ businesses that trust PrintJack for their printing needs.</p>
              <div className="mt-8 flex flex-wrap gap-4 justify-center">
                <Link to="/products" className="inline-flex items-center gap-2 bg-white text-navy-700 font-bold px-8 py-4 rounded-xl hover:bg-yellow-300 transition-all shadow-xl">
                  Browse Products <ArrowRight size={20} />
                </Link>
                <Link to="/contact" className="inline-flex items-center gap-2 border-2 border-white/30 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 transition-all">
                  Contact Us
                </Link>
              </div>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
