import React from 'react';
import { ShoppingBag, Eye, Heart, Star, Sparkles, Check } from 'lucide-react';
import { Product } from '../../types/ecommerce';
import { useEcommerce } from '../../context/EcommerceContext';

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, viewMode = 'grid' }) => {
  const {
    addToCart,
    setSelectedProductForModal,
    formatPrice,
    toggleWishlist,
    isInWishlist,
    aiSearchResponse,
  } = useEcommerce();

  const isWish = isInWishlist(product.id);
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= product.lowStockThreshold;

  // AI Match details if active
  const aiMatch = aiSearchResponse?.results?.find((r) => r.productId === product.id);

  if (viewMode === 'list') {
    return (
      <div
        id={`product-card-list-${product.id}`}
        className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-6 hover:border-amber-400/60 transition-all group"
      >
        {/* Thumbnail */}
        <div
          className="relative w-full sm:w-48 h-44 rounded-xl overflow-hidden bg-stone-950 shrink-0 cursor-pointer"
          onClick={() => setSelectedProductForModal(product)}
        >
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {product.discountPercent && (
            <span className="absolute top-3 left-3 bg-rose-500 text-white font-bold text-[10px] uppercase px-2 py-0.5 rounded-full shadow">
              -{product.discountPercent}%
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2 w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider">
                {product.category} • SKU: {product.sku}
              </span>
              {aiMatch && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-400 text-stone-950 px-2 py-0.5 rounded-full shadow">
                  <Sparkles className="w-3 h-3" />
                  {aiMatch.score}% AI Match
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-stone-300">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-semibold">{product.rating}</span>
              <span className="text-stone-500">({product.reviewCount})</span>
            </div>
          </div>

          <h3
            onClick={() => setSelectedProductForModal(product)}
            className="text-base font-bold font-serif text-stone-100 group-hover:text-amber-300 transition-colors cursor-pointer"
          >
            {product.name}
          </h3>

          {aiMatch?.reason && (
            <p className="text-xs text-amber-300/90 font-medium bg-stone-950/80 border border-amber-900/40 px-2.5 py-1 rounded-lg">
              ✨ {aiMatch.reason}
            </p>
          )}

          <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {product.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-md bg-stone-950 text-[10px] font-medium text-stone-400 border border-stone-800"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Price & Action */}
        <div className="sm:border-l sm:border-stone-800 sm:pl-6 flex flex-col justify-between items-end sm:items-end w-full sm:w-44 shrink-0 space-y-3">
          <div className="text-right">
            <div className="text-xl font-bold font-mono text-stone-100">
              {formatPrice(product.price)}
            </div>
            {product.originalPrice && (
              <div className="text-xs line-through text-stone-500 font-mono">
                {formatPrice(product.originalPrice)}
              </div>
            )}
            <div className="mt-1">
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block ${
                  isOutOfStock
                    ? 'bg-rose-950/80 text-rose-400 border border-rose-800'
                    : isLowStock
                    ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                    : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                }`}
              >
                {isOutOfStock ? 'Sold Out' : isLowStock ? `Only ${product.stock} Left` : `${product.stock} in Stock`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full">
            <button
              id={`wishlist-list-btn-${product.id}`}
              onClick={() => toggleWishlist(product.id)}
              className={`p-2 rounded-xl border transition-colors ${
                isWish
                  ? 'bg-rose-500 border-rose-500 text-white'
                  : 'bg-stone-800 border-stone-700 text-stone-300 hover:text-stone-100'
              }`}
              title="Save to wishlist"
            >
              <Heart className={`w-4 h-4 ${isWish ? 'fill-current' : ''}`} />
            </button>

            <button
              id={`add-cart-list-btn-${product.id}`}
              onClick={() => addToCart(product, 1)}
              disabled={isOutOfStock}
              className="flex-1 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed text-stone-950 text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{isOutOfStock ? 'Out of Stock' : 'Add to Bag'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default Grid View
  return (
    <div
      id={`product-card-grid-${product.id}`}
      className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex flex-col justify-between hover:border-amber-400/60 transition-all duration-300 group relative"
    >
      {/* Top Badges */}
      <div className="absolute top-6 left-6 z-10 flex flex-col gap-1.5 pointer-events-none">
        {aiMatch && (
          <span className="bg-amber-400 text-stone-950 font-bold text-[10px] uppercase px-2.5 py-0.5 rounded-full shadow-lg flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            {aiMatch.score}% AI Match
          </span>
        )}
        {product.isNew && (
          <span className="bg-stone-100 text-stone-950 font-bold text-[10px] uppercase px-2 py-0.5 rounded-full shadow-md">
            New Drop
          </span>
        )}
        {product.discountPercent && (
          <span className="bg-rose-500 text-white font-bold text-[10px] uppercase px-2 py-0.5 rounded-full shadow-md">
            -{product.discountPercent}%
          </span>
        )}
        {isLowStock && (
          <span className="bg-amber-950/90 text-amber-300 border border-amber-800/80 font-bold text-[10px] px-2 py-0.5 rounded-full shadow">
            Only {product.stock} left
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        id={`wishlist-grid-btn-${product.id}`}
        onClick={(e) => {
          e.stopPropagation();
          toggleWishlist(product.id);
        }}
        className={`absolute top-6 right-6 z-10 p-2 rounded-full backdrop-blur-md transition-all shadow-md ${
          isWish
            ? 'bg-rose-500 text-white'
            : 'bg-stone-950/70 text-stone-300 hover:text-white hover:bg-stone-900'
        }`}
        aria-label="Wishlist"
      >
        <Heart className={`w-4 h-4 ${isWish ? 'fill-current' : ''}`} />
      </button>

      {/* Product Image Stage */}
      <div
        className="relative h-56 rounded-xl overflow-hidden bg-stone-950 mb-4 cursor-pointer"
        onClick={() => setSelectedProductForModal(product)}
      >
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Quick View Hover Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-stone-950/40 backdrop-blur-[2px]">
          <span className="bg-stone-900 text-stone-100 text-xs font-semibold px-3.5 py-1.5 rounded-full border border-stone-700 flex items-center gap-1.5 shadow-xl">
            <Eye className="w-3.5 h-3.5 text-amber-400" />
            Quick Inspect
          </span>
        </div>
      </div>

      {/* Product Body */}
      <div className="space-y-2 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[11px] text-stone-400 mb-1">
            <span className="font-mono text-stone-400">{product.category}</span>
            <div className="flex items-center gap-0.5 text-stone-300">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="font-semibold">{product.rating}</span>
            </div>
          </div>

          <h3
            onClick={() => setSelectedProductForModal(product)}
            className="font-serif font-bold text-sm text-stone-100 group-hover:text-amber-300 transition-colors line-clamp-1 cursor-pointer"
            title={product.name}
          >
            {product.name}
          </h3>

          {aiMatch?.reason ? (
            <p className="text-[11px] text-amber-300/90 font-medium bg-stone-950 border border-amber-900/40 px-2 py-0.5 rounded mt-1 line-clamp-1">
              ✨ {aiMatch.reason}
            </p>
          ) : (
            <p className="text-xs text-stone-400 line-clamp-2 mt-1 leading-relaxed">
              {product.subtitle || product.description}
            </p>
          )}
        </div>

        {/* Pricing & Cart Action */}
        <div className="pt-3 border-t border-stone-800/80">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold font-mono text-stone-100">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-xs line-through text-stone-500 font-mono">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                isOutOfStock
                  ? 'bg-rose-950/80 text-rose-400 border border-rose-800'
                  : isLowStock
                  ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                  : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
              }`}
            >
              {isOutOfStock ? 'Sold Out' : `${product.stock} Left`}
            </span>
          </div>

          <button
            id={`add-cart-grid-btn-${product.id}`}
            onClick={() => addToCart(product, 1)}
            disabled={isOutOfStock}
            className="w-full bg-stone-800 hover:bg-amber-400 hover:text-stone-950 disabled:opacity-40 disabled:cursor-not-allowed text-stone-200 text-xs font-semibold py-2.5 rounded-xl border border-stone-700 hover:border-amber-400 flex items-center justify-center gap-1.5 transition-all shadow active:scale-[0.98]"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{isOutOfStock ? 'Out of Stock' : 'Add to Bag'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
