import React, { useState } from 'react';
import {
  X,
  Star,
  ShoppingBag,
  Heart,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Check,
  Layers,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { Product } from '../../types/ecommerce';
import { useEcommerce } from '../../context/EcommerceContext';

export const ProductDetailModal: React.FC = () => {
  const {
    selectedProductForModal,
    setSelectedProductForModal,
    addToCart,
    formatPrice,
    toggleWishlist,
    isInWishlist,
    setIsCheckoutOpen,
    setIsCartOpen,
  } = useEcommerce();

  const product = selectedProductForModal;

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    product?.colors?.[0]?.name
  );
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product?.sizes?.[0]
  );
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'overview' | 'specs' | 'reviews'>('overview');

  if (!product) return null;

  const isWish = isInWishlist(product.id);
  const isOutOfStock = product.stock <= 0;

  const handleInstantBuy = () => {
    addToCart(product, quantity, selectedColor, selectedSize);
    setSelectedProductForModal(null);
    setIsCheckoutOpen(true);
  };

  const sampleReviews = [
    {
      author: 'Marcus Vance',
      rating: 5,
      date: 'Aug 04, 2026',
      title: 'Flawless craftsmanship and acoustics',
      comment:
        'The materials feel genuinely bespoke. Acoustic clarity across the entire frequency range is simply astounding. Worth every penny.',
      verified: true,
    },
    {
      author: 'Clara Lindqvist',
      rating: 5,
      date: 'Jul 29, 2026',
      title: 'Minimalist perfection',
      comment:
        'Shipped in beautiful sustainable packaging. Build quality exceeds competitors at twice the price point.',
      verified: true,
    },
    {
      author: 'Julian Thorne',
      rating: 4,
      date: 'Jul 15, 2026',
      title: 'Impressive finish',
      comment: 'Very solid build and great battery endurance. Intuitive controls.',
      verified: true,
    },
  ];

  return (
    <div
      id="product-detail-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/85 backdrop-blur-md animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) setSelectedProductForModal(null);
      }}
    >
      <div
        id="product-detail-modal-card"
        className="bg-stone-900 border border-stone-800 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col text-stone-100 shadow-2xl overflow-hidden relative"
      >
        {/* Close Button */}
        <button
          id="product-modal-close-btn"
          onClick={() => setSelectedProductForModal(null)}
          className="absolute top-5 right-5 z-20 bg-stone-950/70 hover:bg-stone-800 text-stone-300 hover:text-stone-100 p-2 rounded-full border border-stone-700 transition-colors backdrop-blur-sm"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Scrollable Container */}
        <div className="overflow-y-auto p-6 sm:p-8 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Left: Image Gallery */}
            <div className="md:col-span-6 space-y-4">
              <div className="relative h-80 sm:h-96 rounded-2xl overflow-hidden bg-stone-950 border border-stone-800">
                <img
                  src={product.images[selectedImageIndex] || product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {product.discountPercent && (
                  <span className="absolute top-4 left-4 bg-rose-500 text-stone-950 font-bold text-xs uppercase px-2.5 py-1 rounded-full shadow">
                    -{product.discountPercent}% Off
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                        selectedImageIndex === idx
                          ? 'border-amber-400 scale-105'
                          : 'border-stone-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Value Guarantees Banner */}
              <div className="bg-stone-950 border border-stone-800 rounded-2xl p-4 grid grid-cols-2 gap-3 text-xs text-stone-400">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Complimentary Shipping</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>30-Day Hassle-Free Returns</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>2-Year Atelier Warranty</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>100% Certified Authentic</span>
                </div>
              </div>
            </div>

            {/* Right: Details & Purchase Controls */}
            <div className="md:col-span-6 space-y-6">
              {/* Category & Rating */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-amber-400 uppercase tracking-wider">
                    {product.category} • SKU: {product.sku}
                  </span>
                  <div className="flex items-center gap-1 text-stone-300">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="font-semibold">{product.rating}</span>
                    <span className="text-stone-500">({product.reviewCount} reviews)</span>
                  </div>
                </div>

                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-100 leading-tight">
                  {product.name}
                </h1>
                {product.subtitle && (
                  <p className="text-xs text-stone-400">{product.subtitle}</p>
                )}
              </div>

              {/* Price & Stock Status */}
              <div className="bg-stone-950 border border-stone-800 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs text-stone-400">Total Price</div>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-2xl font-bold font-mono text-stone-100">
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm line-through text-stone-500 font-mono">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-stone-400">Stock Availability</div>
                  <span
                    className={`inline-block mt-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      isOutOfStock
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : product.stock <= product.lowStockThreshold
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}
                  >
                    {isOutOfStock ? 'Sold Out' : `${product.stock} Units in Inventory`}
                  </span>
                </div>
              </div>

              {/* Color Swatches */}
              {product.colors && product.colors.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-2">
                    Select Color Finish: <span className="text-amber-400">{selectedColor || product.colors[0].name}</span>
                  </label>
                  <div className="flex gap-2.5">
                    {product.colors.map((c) => (
                      <button
                        key={c.name}
                        onClick={() => setSelectedColor(c.name)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs transition-all ${
                          selectedColor === c.name || (!selectedColor && product.colors?.[0].name === c.name)
                            ? 'bg-stone-800 border-amber-400 text-stone-100 shadow-md'
                            : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-stone-700"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span>{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes (if applicable) */}
              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-2">
                    Select Size: <span className="text-amber-400">{selectedSize || product.sizes[0]}</span>
                  </label>
                  <div className="flex gap-2">
                    {product.sizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`w-10 h-10 rounded-xl border text-xs font-semibold flex items-center justify-center transition-all ${
                          selectedSize === s || (!selectedSize && product.sizes?.[0] === s)
                            ? 'bg-amber-400 text-stone-950 border-amber-400 font-bold shadow'
                            : 'bg-stone-950 border-stone-800 text-stone-300 hover:border-stone-700'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Stepper & Add to Bag */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3">
                  {/* Quantity Stepper */}
                  <div className="flex items-center bg-stone-950 border border-stone-800 rounded-xl p-1 shrink-0">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1 || isOutOfStock}
                      className="w-8 h-8 rounded-lg text-stone-300 hover:bg-stone-800 disabled:opacity-30 flex items-center justify-center font-bold text-sm"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-xs font-mono font-bold text-stone-100">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                      disabled={quantity >= product.stock || isOutOfStock}
                      className="w-8 h-8 rounded-lg text-stone-300 hover:bg-stone-800 disabled:opacity-30 flex items-center justify-center font-bold text-sm"
                    >
                      +
                    </button>
                  </div>

                  {/* Add to Bag Button */}
                  <button
                    id="modal-add-cart-btn"
                    onClick={() => {
                      addToCart(product, quantity, selectedColor, selectedSize);
                      setIsCartOpen(true);
                      setSelectedProductForModal(null);
                    }}
                    disabled={isOutOfStock}
                    className="flex-1 bg-stone-800 hover:bg-amber-400 hover:text-stone-950 disabled:opacity-40 disabled:cursor-not-allowed text-stone-200 text-xs font-bold py-3 px-4 rounded-xl border border-stone-700 hover:border-amber-400 flex items-center justify-center gap-2 transition-all shadow active:scale-[0.98]"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{isOutOfStock ? 'Out of Stock' : 'Add to Bag'}</span>
                  </button>

                  {/* Wishlist Toggle */}
                  <button
                    id="modal-wishlist-toggle-btn"
                    onClick={() => toggleWishlist(product.id)}
                    className={`p-3 rounded-xl border transition-colors ${
                      isWish
                        ? 'bg-rose-500 border-rose-500 text-white'
                        : 'bg-stone-950 border-stone-800 text-stone-300 hover:text-stone-100'
                    }`}
                    title="Save to wishlist"
                  >
                    <Heart className={`w-4 h-4 ${isWish ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Instant Buy Now Button */}
                <button
                  id="modal-buy-now-btn"
                  onClick={handleInstantBuy}
                  disabled={isOutOfStock}
                  className="w-full bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-stone-950 text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 transition-all active:scale-[0.98]"
                >
                  <Zap className="w-4 h-4" />
                  <span>Instant Express Checkout</span>
                </button>
              </div>

              {/* Tab Navigation for Specs / Description / Reviews */}
              <div className="pt-4 border-t border-stone-800">
                <div className="flex border-b border-stone-800 gap-6 text-xs font-semibold mb-4">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`pb-2 border-b-2 transition-colors ${
                      activeTab === 'overview'
                        ? 'border-amber-400 text-amber-400'
                        : 'border-transparent text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    Description
                  </button>
                  <button
                    onClick={() => setActiveTab('specs')}
                    className={`pb-2 border-b-2 transition-colors ${
                      activeTab === 'specs'
                        ? 'border-amber-400 text-amber-400'
                        : 'border-transparent text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    Specifications
                  </button>
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className={`pb-2 border-b-2 transition-colors ${
                      activeTab === 'reviews'
                        ? 'border-amber-400 text-amber-400'
                        : 'border-transparent text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    Collector Reviews ({sampleReviews.length})
                  </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                  <div className="text-xs text-stone-300 leading-relaxed space-y-3">
                    <p>{product.description}</p>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {product.tags.map((t) => (
                        <span
                          key={t}
                          className="bg-stone-950 border border-stone-800 text-stone-400 px-2.5 py-1 rounded-md text-[11px]"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'specs' && (
                  <div className="space-y-2">
                    {Object.entries(product.specs).map(([key, val]) => (
                      <div
                        key={key}
                        className="flex justify-between py-1.5 border-b border-stone-800/60 text-xs"
                      >
                        <span className="text-stone-400">{key}</span>
                        <span className="font-semibold text-stone-200">{val}</span>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="space-y-4">
                    {sampleReviews.map((rev, idx) => (
                      <div
                        key={idx}
                        className="bg-stone-950 border border-stone-800 rounded-xl p-3.5 text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-stone-200">{rev.author}</span>
                            {rev.verified && (
                              <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded flex items-center gap-1 border border-emerald-800/60">
                                <Check className="w-2.5 h-2.5" /> Verified Purchase
                              </span>
                            )}
                          </div>
                          <span className="text-stone-500 text-[10px]">{rev.date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < rev.rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-stone-700'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="font-semibold text-stone-200 text-[11px]">{rev.title}</p>
                        <p className="text-stone-400 text-[11px] leading-relaxed">{rev.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
