import React from 'react';
import { ArrowRight, Sparkles, ShieldCheck, ShoppingBag, Flame, Star, Zap } from 'lucide-react';
import { useEcommerce } from '../../context/EcommerceContext';
import { AISearchBar } from '../common/AISearchBar';

export const HeroSection: React.FC = () => {
  const {
    setActiveTab,
    setSelectedCategoryFilter,
    products,
    addToCart,
    setSelectedProductForModal,
    formatPrice,
    switchDemoRole,
  } = useEcommerce();

  const heroSpotlight = products.find((p) => p.id === 'prod-1') || products[0];

  const categories = [
    {
      name: 'Audio & Tech',
      tagline: 'Lossless studio acoustic engineering',
      count: products.filter((p) => p.category === 'Audio & Tech').length,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Apparel & Wear',
      tagline: 'Grade-A Merino wool & tailored layers',
      count: products.filter((p) => p.category === 'Apparel & Wear').length,
      image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Accessories',
      tagline: 'Automatic horology & RFID titanium gear',
      count: products.filter((p) => p.category === 'Accessories').length,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Home & Living',
      tagline: 'Hand-thrown ceramics & dimmable lights',
      count: products.filter((p) => p.category === 'Home & Living').length,
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
    },
  ];

  return (
    <section id="hero-section" className="relative overflow-hidden bg-stone-900 border-b border-stone-800 text-stone-100 py-12 lg:py-20">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-96 h-96 bg-stone-700/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Editorial Headline & Actions */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-800 border border-stone-700/80 text-amber-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Autumn / Winter 2026 Collection</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-stone-50 leading-[1.15]">
              Refined Living.
              <br />
              <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent">
                Uncompromising Craft.
              </span>
            </h1>

            <p className="text-stone-300 text-base sm:text-lg leading-relaxed max-w-xl">
              An e-commerce destination pairing audiophile acoustics, Swiss-inspired automatic timepieces, and ethical merino garments. Complete with live inventory monitoring and real-time sales intelligence.
            </p>

            {/* Natural Language AI Search Bar on Hero */}
            <div className="pt-2 max-w-xl">
              <div className="text-[11px] font-mono text-amber-400/90 mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>AI Natural Language Search</span>
              </div>
              <AISearchBar idPrefix="hero" />
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                id="hero-explore-catalog-btn"
                onClick={() => {
                  setSelectedCategoryFilter('All');
                  setActiveTab('shop');
                }}
                className="bg-amber-400 hover:bg-amber-300 text-stone-950 px-6 py-3.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-amber-400/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Explore Catalog</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <button
                id="hero-admin-portal-btn"
                onClick={() => switchDemoRole('admin')}
                className="bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 hover:border-stone-500 px-5 py-3.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Admin Inventory & Sales</span>
              </button>
            </div>

            {/* Social Trust Metrics */}
            <div className="pt-4 flex items-center gap-8 border-t border-stone-800/80 text-xs text-stone-400">
              <div>
                <div className="text-lg font-bold text-stone-100 font-mono">10,000+</div>
                <div>Global Dispatches</div>
              </div>
              <div className="w-px h-8 bg-stone-800" />
              <div>
                <div className="text-lg font-bold text-stone-100 font-mono flex items-center gap-1">
                  4.9 <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                </div>
                <div>Verified Rating</div>
              </div>
              <div className="w-px h-8 bg-stone-800" />
              <div>
                <div className="text-lg font-bold text-stone-100 font-mono">100%</div>
                <div>Carbon-Neutral</div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Spotlight Featured Product Card */}
          {heroSpotlight && (
            <div className="lg:col-span-5">
              <div className="bg-stone-950/80 border border-stone-800 rounded-3xl p-5 shadow-2xl relative group overflow-hidden">
                {/* Floating Tag */}
                <div className="absolute top-8 left-8 z-20 flex items-center gap-1.5 bg-amber-400 text-stone-950 px-2.5 py-1 rounded-full text-xs font-bold shadow-md">
                  <Flame className="w-3.5 h-3.5" />
                  Featured Spotlight
                </div>

                {/* Stock Indicator */}
                <div className="absolute top-8 right-8 z-20">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                    heroSpotlight.stock <= heroSpotlight.lowStockThreshold
                      ? 'bg-rose-950/80 text-rose-300 border-rose-800'
                      : 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                  }`}>
                    {heroSpotlight.stock > 0 ? `${heroSpotlight.stock} in stock` : 'Out of Stock'}
                  </span>
                </div>

                {/* Main Product Image */}
                <div className="relative h-72 sm:h-80 rounded-2xl overflow-hidden bg-stone-900 mb-5">
                  <img
                    src={heroSpotlight.images[0]}
                    alt={heroSpotlight.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent opacity-60" />
                </div>

                {/* Product Info */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider">
                      {heroSpotlight.category} • SKU: {heroSpotlight.sku}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-stone-300">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-semibold">{heroSpotlight.rating}</span>
                      <span className="text-stone-500">({heroSpotlight.reviewCount})</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold font-serif text-stone-100 group-hover:text-amber-300 transition-colors">
                    {heroSpotlight.name}
                  </h3>

                  <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed">
                    {heroSpotlight.description}
                  </p>

                  <div className="pt-3 flex items-center justify-between gap-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold font-mono text-stone-100">
                        {formatPrice(heroSpotlight.price)}
                      </span>
                      {heroSpotlight.originalPrice && (
                        <span className="text-sm line-through text-stone-500 font-mono">
                          {formatPrice(heroSpotlight.originalPrice)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        id="hero-quick-view-btn"
                        onClick={() => setSelectedProductForModal(heroSpotlight)}
                        className="bg-stone-800 hover:bg-stone-700 text-stone-200 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors"
                      >
                        Quick View
                      </button>
                      <button
                        id="hero-add-cart-btn"
                        onClick={() => addToCart(heroSpotlight, 1)}
                        disabled={heroSpotlight.stock <= 0}
                        className="bg-amber-400 hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed text-stone-950 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow transition-all"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add to Bag</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Category Jump Cards */}
        <div className="mt-16 pt-12 border-t border-stone-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold font-serif text-stone-100">Explore by Atelier</h2>
              <p className="text-xs text-stone-400 mt-0.5">Direct access to specialized craft categories</p>
            </div>
            <button
              id="view-all-collections-btn"
              onClick={() => {
                setSelectedCategoryFilter('All');
                setActiveTab('shop');
              }}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              <span>View All ({products.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <button
                key={cat.name}
                id={`cat-card-${cat.name.replace(/\s+/g, '-').toLowerCase()}`}
                onClick={() => {
                  setSelectedCategoryFilter(cat.name);
                  setActiveTab('shop');
                }}
                className="group relative h-48 rounded-2xl overflow-hidden border border-stone-800 text-left p-5 flex flex-col justify-between hover:border-amber-400/60 transition-all shadow-md"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-transparent" />

                <div className="relative z-10">
                  <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-stone-900/80 text-amber-300 border border-stone-700/80">
                    {cat.count} Items
                  </span>
                </div>

                <div className="relative z-10 space-y-1">
                  <h4 className="text-base font-bold text-stone-100 group-hover:text-amber-300 transition-colors font-serif">
                    {cat.name}
                  </h4>
                  <p className="text-[11px] text-stone-300 line-clamp-1">
                    {cat.tagline}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
