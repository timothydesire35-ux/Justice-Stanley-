import React, { useState, useEffect } from 'react';
import { Timer, Zap, Flame, ShoppingBag, Eye, Heart, Star, ArrowRight } from 'lucide-react';
import { useEcommerce } from '../../context/EcommerceContext';

export const FlashDeals: React.FC = () => {
  const { products, addToCart, setSelectedProductForModal, formatPrice, toggleWishlist, isInWishlist, setActiveTab } = useEcommerce();

  // 12-hour countdown timer state
  const [timeLeft, setTimeLeft] = useState({
    hours: 11,
    minutes: 42,
    seconds: 19,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        }
        if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        }
        if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const dealProducts = products.filter((p) => p.isOnSale || p.discountPercent || p.stock <= p.lowStockThreshold).slice(0, 4);

  return (
    <section id="flash-deals-section" className="py-14 bg-stone-950 text-stone-100 border-b border-stone-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Live Countdown */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Flame className="w-4 h-4" />
              <span>Limited Atelier Allocation</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-100">
              Flash Vault Offers
            </h2>
            <p className="text-xs text-stone-400 mt-1">
              Curated architectural pieces with temporary collector incentives.
            </p>
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center gap-2 bg-stone-900 border border-stone-800 px-4 py-2.5 rounded-2xl">
            <Timer className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="text-xs text-stone-400 font-medium">Closes in:</span>
            <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-stone-100">
              <span className="bg-stone-950 px-2 py-1 rounded border border-stone-800">
                {String(timeLeft.hours).padStart(2, '0')}h
              </span>
              <span className="text-stone-500">:</span>
              <span className="bg-stone-950 px-2 py-1 rounded border border-stone-800">
                {String(timeLeft.minutes).padStart(2, '0')}m
              </span>
              <span className="text-stone-500">:</span>
              <span className="bg-rose-950/80 text-rose-300 px-2 py-1 rounded border border-rose-800/80">
                {String(timeLeft.seconds).padStart(2, '0')}s
              </span>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {dealProducts.map((product) => {
            const isWish = isInWishlist(product.id);
            // Simulated allocation ratio
            const claimedPercent = Math.min(94, Math.max(55, 100 - product.stock * 4));

            return (
              <div
                key={product.id}
                id={`deal-card-${product.id}`}
                className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex flex-col justify-between hover:border-amber-400/50 transition-all group relative overflow-hidden"
              >
                {/* Sale Badge */}
                <div className="absolute top-6 left-6 z-10 flex flex-col gap-1">
                  {product.discountPercent && (
                    <span className="bg-rose-500 text-stone-950 font-bold text-[10px] uppercase px-2 py-0.5 rounded-full shadow">
                      -{product.discountPercent}% OFF
                    </span>
                  )}
                  {product.stock <= product.lowStockThreshold && (
                    <span className="bg-amber-400 text-stone-950 font-bold text-[10px] px-2 py-0.5 rounded-full shadow">
                      Only {product.stock} left
                    </span>
                  )}
                </div>

                {/* Wishlist Button */}
                <button
                  id={`wishlist-btn-${product.id}`}
                  onClick={() => toggleWishlist(product.id)}
                  className={`absolute top-6 right-6 z-10 p-2 rounded-full backdrop-blur-md transition-colors ${
                    isWish
                      ? 'bg-rose-500 text-white'
                      : 'bg-stone-950/60 text-stone-300 hover:text-white hover:bg-stone-900'
                  }`}
                  aria-label="Save to wishlist"
                >
                  <Heart className={`w-4 h-4 ${isWish ? 'fill-current' : ''}`} />
                </button>

                {/* Image Container */}
                <div className="relative h-48 rounded-xl overflow-hidden bg-stone-950 mb-4 cursor-pointer"
                  onClick={() => setSelectedProductForModal(product)}
                >
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-stone-950/20 group-hover:opacity-0 transition-opacity" />

                  {/* Quick View Button on Hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-stone-950/40 backdrop-blur-[2px]">
                    <span className="bg-stone-900 text-stone-100 text-xs font-semibold px-3 py-1.5 rounded-full border border-stone-700 flex items-center gap-1.5 shadow-lg">
                      <Eye className="w-3.5 h-3.5 text-amber-400" />
                      Quick Inspect
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-stone-400 mb-1">
                      <span className="font-mono">{product.sku}</span>
                      <div className="flex items-center gap-0.5 text-stone-300">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{product.rating}</span>
                      </div>
                    </div>

                    <h3
                      onClick={() => setSelectedProductForModal(product)}
                      className="font-serif font-bold text-sm text-stone-100 group-hover:text-amber-300 transition-colors line-clamp-1 cursor-pointer"
                    >
                      {product.name}
                    </h3>
                  </div>

                  {/* Price & Claim Progress */}
                  <div className="pt-2">
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-lg font-bold font-mono text-stone-100">
                        {formatPrice(product.price)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-xs line-through text-stone-500 font-mono">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>

                    {/* Stock Claimed Bar */}
                    <div className="space-y-1 mb-3">
                      <div className="flex justify-between text-[10px] text-stone-400 font-mono">
                        <span>Claimed</span>
                        <span className="text-amber-400 font-semibold">{claimedPercent}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 to-rose-500 rounded-full"
                          style={{ width: `${claimedPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Action */}
                    <button
                      id={`deal-add-cart-${product.id}`}
                      onClick={() => addToCart(product, 1)}
                      disabled={product.stock <= 0}
                      className="w-full bg-stone-800 hover:bg-amber-400 hover:text-stone-950 text-stone-200 text-xs font-semibold py-2 rounded-xl border border-stone-700 hover:border-amber-400 flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-40"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{product.stock > 0 ? 'Add to Bag' : 'Sold Out'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Banner CTA */}
        <div className="mt-10 bg-gradient-to-r from-stone-900 via-stone-900 to-stone-850 border border-stone-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-100">Need Custom Volume or Corporate Gifting?</h4>
              <p className="text-xs text-stone-400">Direct factory order allocation with personalized laser engraving.</p>
            </div>
          </div>

          <button
            id="browse-full-catalog-btn"
            onClick={() => setActiveTab('shop')}
            className="bg-amber-400 hover:bg-amber-300 text-stone-950 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap shadow transition-colors"
          >
            <span>Browse Full Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
};
