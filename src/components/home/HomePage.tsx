import React from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Truck,
  Headphones,
  Award,
  Clock,
  Star,
  CheckCircle,
} from 'lucide-react';
import { HeroSection } from './HeroSection';
import { FlashDeals } from './FlashDeals';
import { ProductCard } from '../shop/ProductCard';
import { useEcommerce } from '../../context/EcommerceContext';

export const HomePage: React.FC = () => {
  const { products, setActiveTab, setSelectedCategoryFilter } = useEcommerce();

  const featuredProducts = products.filter((p) => p.featured).slice(0, 4);
  const bestSellers = products.slice(2, 6);

  const curatedCollections = [
    {
      title: 'Precision Horology',
      subtitle: 'Swiss automatic movements in surgical grade steel',
      category: 'Accessories',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
      tag: 'Limited 100 Pcs',
    },
    {
      title: 'Acoustic Fidelity',
      subtitle: 'Titanium diaphragms with active spatial immersion',
      category: 'Audio & Tech',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      tag: 'Studio Grade',
    },
    {
      title: 'Minimalist Merino',
      subtitle: 'Breathable, thermal regulating everyday luxury',
      category: 'Apparel & Wear',
      image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80',
      tag: '100% Sustainable',
    },
  ];

  return (
    <div id="home-welcome-page" className="bg-stone-950 text-stone-100 space-y-16 pb-16">
      {/* 1. Hero Showcase Section */}
      <HeroSection />

      {/* 2. Limited-Time Flash Deals & Inventory Counters */}
      <FlashDeals />

      {/* 3. Featured Masterpiece Curation */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 border-b border-stone-800 pb-4 gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Signature Vault</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-100">
              Featured Curations
            </h2>
            <p className="text-xs text-stone-400 mt-1">
              Engineered with sustainable luxury, precision acoustic drivers, and Swiss heritage.
            </p>
          </div>

          <button
            id="home-view-all-curations-btn"
            onClick={() => {
              setSelectedCategoryFilter('All');
              setActiveTab('shop');
            }}
            className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 transition-colors self-start md:self-auto"
          >
            <span>View Full Atelier Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} viewMode="grid" />
          ))}
        </div>
      </section>

      {/* 4. Atelier Collections Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-amber-400 text-xs font-bold tracking-widest uppercase">
            Curated Categories
          </span>
          <h2 className="text-3xl font-serif font-bold text-stone-100">
            Explore by Discipline
          </h2>
          <p className="text-xs text-stone-400">
            Select a disciplined collection to refine your pursuit of design excellence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {curatedCollections.map((col, idx) => (
            <div
              key={idx}
              onClick={() => {
                setSelectedCategoryFilter(col.category as any);
                setActiveTab('shop');
              }}
              className="group relative h-80 rounded-3xl overflow-hidden border border-stone-800 cursor-pointer shadow-xl transition-all duration-300 hover:border-amber-400/50 hover:shadow-amber-400/10"
            >
              <img
                src={col.image}
                alt={col.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-transparent p-6 flex flex-col justify-end">
                <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2.5 py-1 rounded-full self-start mb-2">
                  {col.tag}
                </span>
                <h3 className="text-xl font-bold font-serif text-stone-100 group-hover:text-amber-300 transition-colors">
                  {col.title}
                </h3>
                <p className="text-xs text-stone-300 mt-1 line-clamp-2">{col.subtitle}</p>
                <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
                  <span>Enter Collection</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Brand Values & Guarantees Bar */}
      <section className="bg-stone-900/60 border-y border-stone-800/80 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-100 font-serif">
                  Carbon-Neutral Express
                </h4>
                <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                  Complimentary tracked courier delivery on all orders over $150.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-100 font-serif">
                  Lifetime Authenticity
                </h4>
                <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                  Individually serialized units with digital certificates of origin.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-sky-400/10 border border-sky-400/20 text-sky-400 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-100 font-serif">
                  30-Day Atelier Trial
                </h4>
                <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                  Experience acoustic fidelity in your space with hassle-free returns.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-purple-400/10 border border-purple-400/20 text-purple-400 flex items-center justify-center shrink-0">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-100 font-serif">
                  Concierge Support
                </h4>
                <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                  24/7 dedicated horology & acoustic specialists at your service.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Curated Collector Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-8 sm:p-12 relative overflow-hidden">
          <div className="max-w-3xl">
            <div className="flex items-center gap-1 text-amber-400 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <blockquote className="text-xl sm:text-2xl font-serif text-stone-100 italic leading-relaxed mb-6">
              "The AURA Horizon ANC headphones deliver a soundstage precision that rivals dedicated reference studio monitors. Coupled with their carbon-neutral packaging and instant dispatch, this is the benchmark for modern e-commerce."
            </blockquote>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-amber-400 text-stone-950 font-bold font-serif flex items-center justify-center">
                EM
              </div>
              <div>
                <div className="font-bold text-sm text-stone-100">Elena Rostova</div>
                <div className="text-xs text-stone-400">Audio Engineer & Spatial Acoustics Designer</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
