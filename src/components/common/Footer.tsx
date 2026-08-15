import React, { useState } from 'react';
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  CreditCard,
  Lock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { useEcommerce } from '../../context/EcommerceContext';

export const Footer: React.FC = () => {
  const { setActiveTab, setSelectedCategoryFilter, resetToDemoData, switchDemoRole, addToast } = useEcommerce();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscribed(true);
      addToast('success', 'Subscribed', 'Thank you for joining AURA Atelier newsletter! Use code WELCOME10 for 10% off.');
      setNewsletterEmail('');
    }
  };

  return (
    <footer id="main-footer" className="bg-stone-950 text-stone-300 border-t border-stone-800">
      {/* Value Badges Band */}
      <div className="border-b border-stone-800/80 py-10 bg-stone-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-stone-800 text-amber-400 border border-stone-700">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-stone-100">Carbon-Neutral Delivery</h4>
                <p className="text-xs text-stone-400 mt-1">Free express shipping on all orders exceeding $150.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-stone-800 text-amber-400 border border-stone-700">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-stone-100">30-Day Effortless Trial</h4>
                <p className="text-xs text-stone-400 mt-1">Prepaid returns with instant refund guarantee.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-stone-800 text-amber-400 border border-stone-700">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-stone-100">256-Bit SSL Protection</h4>
                <p className="text-xs text-stone-400 mt-1">Bank-grade encrypted tokenized checkout security.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-stone-800 text-amber-400 border border-stone-700">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-stone-100">Dedicated Concierge</h4>
                <p className="text-xs text-stone-400 mt-1">24/7 technical and personal shopping assistance.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Newsletter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand & Manifesto */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-stone-950 font-black text-base">
                A
              </div>
              <span className="font-serif tracking-widest text-lg font-bold text-stone-100">
                AURA ATELIER
              </span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed max-w-sm">
              Curated acoustic audio, precision Swiss & Japanese horology, organic merino textiles, and artisanal living accessories built for a lifetime of performance.
            </p>

            {/* Newsletter Form */}
            <div className="pt-2">
              <h5 className="text-xs font-semibold text-stone-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Join the Private Collector Dispatch
              </h5>
              {subscribed ? (
                <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 p-2.5 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>You are on the VIP early-access list!</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <input
                    id="newsletter-email-input"
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="bg-stone-900 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 flex-1"
                  />
                  <button
                    id="newsletter-submit-btn"
                    type="submit"
                    className="bg-amber-400 hover:bg-amber-300 text-stone-950 px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    Join
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h5 className="text-xs font-semibold text-stone-200 uppercase tracking-wider mb-3">
              Collections
            </h5>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <button
                  onClick={() => {
                    setSelectedCategoryFilter('Audio & Tech');
                    setActiveTab('shop');
                  }}
                  className="hover:text-amber-400 transition-colors"
                >
                  Audio & Acoustic Tech
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSelectedCategoryFilter('Apparel & Wear');
                    setActiveTab('shop');
                  }}
                  className="hover:text-amber-400 transition-colors"
                >
                  Merino Apparel & Knitwear
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSelectedCategoryFilter('Accessories');
                    setActiveTab('shop');
                  }}
                  className="hover:text-amber-400 transition-colors"
                >
                  Horology & EDC Accessories
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSelectedCategoryFilter('Home & Living');
                    setActiveTab('shop');
                  }}
                  className="hover:text-amber-400 transition-colors"
                >
                  Artisan Stoneware & Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSelectedCategoryFilter('Wellness & Care');
                    setActiveTab('shop');
                  }}
                  className="hover:text-amber-400 transition-colors"
                >
                  Botanical Wellness & Oils
                </button>
              </li>
            </ul>
          </div>

          {/* Platform Controls */}
          <div>
            <h5 className="text-xs font-semibold text-stone-200 uppercase tracking-wider mb-3">
              Store Access
            </h5>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <button
                  onClick={() => setActiveTab('shop')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Shopping Catalog
                </button>
              </li>
              <li>
                <button
                  onClick={() => switchDemoRole('admin')}
                  className="hover:text-amber-400 text-amber-400/90 font-medium transition-colors flex items-center gap-1"
                >
                  <ShieldCheck className="w-3 h-3" />
                  Admin Inventory & Sales
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Track Order Status
                </button>
              </li>
              <li>
                <button
                  onClick={resetToDemoData}
                  className="hover:text-stone-200 text-stone-400 transition-colors flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Reset Demo Stock & Orders
                </button>
              </li>
            </ul>
          </div>

          {/* Trust & Certifications */}
          <div>
            <h5 className="text-xs font-semibold text-stone-200 uppercase tracking-wider mb-3">
              Payment & Security
            </h5>
            <div className="space-y-3 text-xs text-stone-400">
              <div className="flex flex-wrap gap-2 text-stone-300">
                <span className="bg-stone-900 border border-stone-800 px-2 py-1 rounded text-[11px] font-mono">VISA</span>
                <span className="bg-stone-900 border border-stone-800 px-2 py-1 rounded text-[11px] font-mono">Mastercard</span>
                <span className="bg-stone-900 border border-stone-800 px-2 py-1 rounded text-[11px] font-mono">AMEX</span>
                <span className="bg-stone-900 border border-stone-800 px-2 py-1 rounded text-[11px] font-mono">Apple Pay</span>
                <span className="bg-stone-900 border border-stone-800 px-2 py-1 rounded text-[11px] font-mono">PayPal</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-stone-400 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>PCI-DSS Level 1 Compliant</span>
              </div>
              <p className="text-[11px] text-stone-500">
                All mock transactions are processed in a secure sandboxed environment.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-500">
          <p>© 2026 AURA Atelier Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Accessibility</span>
            <span>Cookie Settings</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
