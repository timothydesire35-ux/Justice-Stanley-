import React, { useState, useMemo } from 'react';
import {
  Filter,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Search,
  RotateCcw,
  Sparkles,
  Layers,
  Check,
  ChevronDown,
  X,
  Heart,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { ProductCategory, Product } from '../../types/ecommerce';
import { useEcommerce } from '../../context/EcommerceContext';
import { ProductCard } from './ProductCard';
import { AISearchBar } from '../common/AISearchBar';

const CATEGORIES: ProductCategory[] = [
  'All',
  'Audio & Tech',
  'Apparel & Wear',
  'Accessories',
  'Home & Living',
  'Wellness & Care',
];

export const ShopCatalog: React.FC = () => {
  const {
    products,
    selectedCategoryFilter,
    setSelectedCategoryFilter,
    searchQuery,
    setSearchQuery,
    formatPrice,
    wishlist,
    currentUser,
    openProfileModal,
    aiSearchResponse,
    clearAiSearch,
    runAiSearch,
    isAiSearching,
  } = useEcommerce();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<
    'featured' | 'price-asc' | 'price-desc' | 'rating' | 'stock' | 'newest'
  >('featured');
  const [maxPrice, setMaxPrice] = useState<number>(500);
  const [stockFilter, setStockFilter] = useState<'all' | 'in-stock' | 'low-stock'>('all');
  const [minRating, setMinRating] = useState<number>(0);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [wishlistOnly, setWishlistOnly] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.tags.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [products]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        // AI search query or standard search
        if (aiSearchResponse && aiSearchResponse.matchedProductIds.length > 0) {
          if (!aiSearchResponse.matchedProductIds.includes(product.id)) {
            return false;
          }
        } else if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = product.name.toLowerCase().includes(q);
          const matchSub = product.subtitle.toLowerCase().includes(q);
          const matchDesc = product.description.toLowerCase().includes(q);
          const matchSku = product.sku.toLowerCase().includes(q);
          const matchCat = product.category.toLowerCase().includes(q);
          const matchTag = product.tags.some((t) => t.toLowerCase().includes(q));
          if (!matchName && !matchSub && !matchDesc && !matchSku && !matchCat && !matchTag) {
            return false;
          }
        }

        // Category filter
        if (selectedCategoryFilter !== 'All' && product.category !== selectedCategoryFilter) {
          return false;
        }
        // Price filter
        if (product.price > maxPrice) {
          return false;
        }
        // Stock status filter
        if (stockFilter === 'in-stock' && product.stock <= 0) {
          return false;
        }
        if (stockFilter === 'low-stock' && (product.stock <= 0 || product.stock > product.lowStockThreshold)) {
          return false;
        }
        // Rating filter
        if (minRating > 0 && product.rating < minRating) {
          return false;
        }
        // Tag filter
        if (selectedTag && !product.tags.includes(selectedTag)) {
          return false;
        }
        // Wishlist Only filter
        if (wishlistOnly && !wishlist.includes(product.id)) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'stock') return b.stock - a.stock;
        if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

        // If AI search is active, rank by AI relevance score by default
        if (aiSearchResponse?.results && sortBy === 'featured') {
          const scoreA = aiSearchResponse.results.find((r) => r.productId === a.id)?.score || 0;
          const scoreB = aiSearchResponse.results.find((r) => r.productId === b.id)?.score || 0;
          if (scoreA !== scoreB) return scoreB - scoreA;
        }

        // Default: featured first, then rating
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return b.rating - a.rating;
      });
  }, [products, selectedCategoryFilter, searchQuery, aiSearchResponse, maxPrice, stockFilter, minRating, selectedTag, wishlistOnly, wishlist, sortBy]);

  const handleResetFilters = () => {
    setSelectedCategoryFilter('All');
    clearAiSearch();
    setMaxPrice(500);
    setStockFilter('all');
    setMinRating(0);
    setSelectedTag(null);
    setWishlistOnly(false);
    setSortBy('featured');
  };

  const hasActiveFilters =
    selectedCategoryFilter !== 'All' ||
    searchQuery !== '' ||
    Boolean(aiSearchResponse && aiSearchResponse.matchedProductIds.length > 0) ||
    maxPrice < 500 ||
    stockFilter !== 'all' ||
    minRating > 0 ||
    selectedTag !== null ||
    wishlistOnly;

  return (
    <div id="shopping-catalog-page" className="bg-stone-950 text-stone-100 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8 border-b border-stone-800 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Layers className="w-4 h-4" />
              <span>Full Storefront Collection</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-100">
              {selectedCategoryFilter === 'All' ? 'Curated Masterpieces' : selectedCategoryFilter}
            </h1>
            <p className="text-xs text-stone-400 mt-1">
              Showing {filteredProducts.length} crafted pieces across premium acoustics, horology, and apparel.
            </p>
          </div>

          {/* Search Bar in Page Header */}
          <div className="w-full md:w-96">
            <AISearchBar idPrefix="catalog-header" />
          </div>
        </div>

        {/* Layout: Sidebar + Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 space-y-6">
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 sticky top-24 space-y-6">
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <div className="flex items-center gap-2 font-bold text-sm text-stone-100">
                  <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                  <span>Refine Catalog</span>
                </div>
                {hasActiveFilters && (
                  <button
                    onClick={handleResetFilters}
                    className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                )}
              </div>

              {/* Wishlist Quick Filter */}
              {currentUser && wishlist.length > 0 && (
                <button
                  id="filter-wishlist-toggle-btn"
                  onClick={() => setWishlistOnly(!wishlistOnly)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                    wishlistOnly
                      ? 'bg-rose-500/20 border-rose-500 text-rose-200 shadow-sm'
                      : 'bg-stone-950 border-stone-800 text-stone-300 hover:border-rose-500/50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Heart className={`w-4 h-4 ${wishlistOnly ? 'fill-rose-400 text-rose-400' : 'text-rose-400'}`} />
                    My Saved Items
                  </span>
                  <span className="bg-stone-900 text-rose-300 border border-stone-700 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold">
                    {wishlist.length}
                  </span>
                </button>
              )}

              {/* Categories */}
              <div>
                <h4 className="text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2.5">
                  Category
                </h4>
                <div className="space-y-1">
                  {CATEGORIES.map((cat) => {
                    const count =
                      cat === 'All'
                        ? products.length
                        : products.filter((p) => p.category === cat).length;
                    return (
                      <button
                        key={cat}
                        id={`filter-cat-${cat.replace(/\s+/g, '-').toLowerCase()}`}
                        onClick={() => setSelectedCategoryFilter(cat)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                          selectedCategoryFilter === cat
                            ? 'bg-amber-400 text-stone-950 font-bold shadow'
                            : 'text-stone-300 hover:bg-stone-800 hover:text-stone-100'
                        }`}
                      >
                        <span>{cat}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                            selectedCategoryFilter === cat
                              ? 'bg-stone-950/20 text-stone-950'
                              : 'bg-stone-950 text-stone-400'
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Range Slider */}
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-stone-300 uppercase tracking-wider text-[11px]">
                    Max Price
                  </span>
                  <span className="font-mono font-bold text-amber-400">{formatPrice(maxPrice)}</span>
                </div>
                <input
                  id="price-range-slider"
                  type="range"
                  min={50}
                  max={500}
                  step={10}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-amber-400 bg-stone-950 cursor-pointer h-1.5 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-stone-500 font-mono mt-1">
                  <span>{formatPrice(50)}</span>
                  <span>{formatPrice(500)}</span>
                </div>
              </div>

              {/* Inventory Stock Availability */}
              <div>
                <h4 className="text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
                  Stock Status
                </h4>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => setStockFilter('all')}
                    className={`py-1.5 text-[11px] rounded-lg border font-medium transition-all ${
                      stockFilter === 'all'
                        ? 'bg-stone-800 border-amber-400 text-amber-300'
                        : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setStockFilter('in-stock')}
                    className={`py-1.5 text-[11px] rounded-lg border font-medium transition-all ${
                      stockFilter === 'in-stock'
                        ? 'bg-stone-800 border-emerald-400 text-emerald-300'
                        : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
                    }`}
                  >
                    In Stock
                  </button>
                  <button
                    onClick={() => setStockFilter('low-stock')}
                    className={`py-1.5 text-[11px] rounded-lg border font-medium transition-all ${
                      stockFilter === 'low-stock'
                        ? 'bg-stone-800 border-amber-400 text-amber-300'
                        : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
                    }`}
                  >
                    Low Stock
                  </button>
                </div>
              </div>

              {/* Tag Badges */}
              <div>
                <h4 className="text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
                  Curated Tags
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                        selectedTag === tag
                          ? 'bg-amber-400 border-amber-400 text-stone-950 font-bold shadow'
                          : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700 hover:text-stone-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Products Area */}
          <main className="lg:col-span-9 space-y-6">
            {/* Top Toolbar: View mode, Sort, Mobile Filter Trigger */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {/* Mobile Filter Button */}
                <button
                  id="mobile-filter-open-btn"
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden bg-stone-800 hover:bg-stone-750 text-stone-200 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-stone-700"
                >
                  <Filter className="w-3.5 h-3.5 text-amber-400" />
                  <span>Filters {hasActiveFilters && '•'}</span>
                </button>

                <div className="text-xs text-stone-400 font-medium">
                  Showing <strong className="text-stone-100 font-mono">{filteredProducts.length}</strong> of{' '}
                  <span className="font-mono">{products.length}</span> items
                </div>
              </div>

              {/* Right Controls: Sort & Grid/List View */}
              <div className="flex items-center gap-3 ml-auto">
                {/* Sort Dropdown */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-stone-400 hidden sm:inline">Sort By:</span>
                  <select
                    id="catalog-sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-stone-950 border border-stone-700 rounded-xl px-3 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="featured">Featured & Curated</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating">Highest Rated (★)</option>
                    <option value="stock">Stock Available</option>
                    <option value="newest">Newest Arrivals</option>
                  </select>
                </div>

                {/* View Switcher */}
                <div className="flex items-center bg-stone-950 border border-stone-800 rounded-xl p-0.5">
                  <button
                    id="view-mode-grid"
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-stone-800 text-amber-400'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                    title="Grid layout"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    id="view-mode-list"
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-lg transition-colors ${
                      viewMode === 'list'
                        ? 'bg-stone-800 text-amber-400'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                    title="List layout"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* AI Natural Language Search Results Banner */}
            {aiSearchResponse && aiSearchResponse.matchedProductIds.length > 0 && (
              <div
                id="ai-search-results-banner"
                className="bg-gradient-to-r from-stone-900 via-amber-950/20 to-stone-900 border border-amber-500/40 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3 relative overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center font-bold shrink-0 shadow">
                      <Sparkles className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400">
                          AI Semantic Match
                        </span>
                        <span className="text-[10px] text-stone-400 bg-stone-950 px-2 py-0.5 rounded-full border border-stone-800 font-mono">
                          {filteredProducts.length} items ranked
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-stone-100 mt-0.5">
                        {aiSearchResponse.detectedIntent || searchQuery}
                      </h3>
                    </div>
                  </div>

                  <button
                    id="clear-ai-search-banner-btn"
                    onClick={clearAiSearch}
                    className="self-start sm:self-auto text-xs bg-stone-950 hover:bg-stone-800 text-stone-300 hover:text-stone-100 border border-stone-700 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Clear AI Filter</span>
                  </button>
                </div>

                {/* AI Follow-up suggested prompts */}
                {aiSearchResponse.suggestedQueries && aiSearchResponse.suggestedQueries.length > 0 && (
                  <div className="pt-2 border-t border-stone-800/80 flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="text-stone-400 text-[11px] flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-amber-400" />
                      Refine intent:
                    </span>
                    {aiSearchResponse.suggestedQueries.map((suggested, idx) => (
                      <button
                        key={idx}
                        id={`ai-suggest-pill-${idx}`}
                        onClick={() => runAiSearch(suggested, true)}
                        className="text-[11px] bg-stone-950/90 hover:bg-amber-400 hover:text-stone-950 text-stone-300 border border-stone-800 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1"
                      >
                        <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                        <span>"{suggested}"</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Active Filter Pills Bar */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-stone-400 text-[11px]">Active Filters:</span>
                {aiSearchResponse && aiSearchResponse.matchedProductIds.length > 0 ? (
                  <span className="inline-flex items-center gap-1 bg-amber-400/20 border border-amber-500/40 px-2.5 py-1 rounded-full text-amber-300 font-medium">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    AI Query: "{searchQuery}"
                    <button onClick={clearAiSearch}>
                      <X className="w-3 h-3 text-amber-300 hover:text-white" />
                    </button>
                  </span>
                ) : searchQuery ? (
                  <span className="inline-flex items-center gap-1 bg-stone-800 border border-stone-700 px-2.5 py-1 rounded-full text-stone-200">
                    Search: "{searchQuery}"
                    <button onClick={() => setSearchQuery('')}>
                      <X className="w-3 h-3 text-stone-400 hover:text-stone-100" />
                    </button>
                  </span>
                ) : null}
                {selectedCategoryFilter !== 'All' && (
                  <span className="inline-flex items-center gap-1 bg-stone-800 border border-stone-700 px-2.5 py-1 rounded-full text-stone-200">
                    Category: {selectedCategoryFilter}
                    <button onClick={() => setSelectedCategoryFilter('All')}>
                      <X className="w-3 h-3 text-stone-400 hover:text-stone-100" />
                    </button>
                  </span>
                )}
                {maxPrice < 500 && (
                  <span className="inline-flex items-center gap-1 bg-stone-800 border border-stone-700 px-2.5 py-1 rounded-full text-stone-200">
                    Max: {formatPrice(maxPrice)}
                    <button onClick={() => setMaxPrice(500)}>
                      <X className="w-3 h-3 text-stone-400 hover:text-stone-100" />
                    </button>
                  </span>
                )}
                {stockFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1 bg-stone-800 border border-stone-700 px-2.5 py-1 rounded-full text-stone-200">
                    Stock: {stockFilter}
                    <button onClick={() => setStockFilter('all')}>
                      <X className="w-3 h-3 text-stone-400 hover:text-stone-100" />
                    </button>
                  </span>
                )}
                {selectedTag && (
                  <span className="inline-flex items-center gap-1 bg-stone-800 border border-stone-700 px-2.5 py-1 rounded-full text-stone-200">
                    Tag: {selectedTag}
                    <button onClick={() => setSelectedTag(null)}>
                      <X className="w-3 h-3 text-stone-400 hover:text-stone-100" />
                    </button>
                  </span>
                )}
                <button
                  onClick={handleResetFilters}
                  className="text-amber-400 hover:text-amber-300 text-[11px] underline ml-1"
                >
                  Clear All
                </button>
              </div>
            )}

            {/* Product Display List / Grid */}
            {filteredProducts.length === 0 ? (
              <div className="bg-stone-900 border border-stone-800 rounded-3xl p-12 text-center text-stone-400 space-y-4">
                <Search className="w-12 h-12 text-stone-600 mx-auto" />
                <h3 className="text-lg font-bold text-stone-200 font-serif">No Matching Items Found</h3>
                <p className="text-xs text-stone-400 max-w-sm mx-auto">
                  Try adjusting your search terms, clearing category filters, or loosening price constraints.
                </p>
                <button
                  id="empty-reset-filters-btn"
                  onClick={handleResetFilters}
                  className="bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold px-4 py-2 rounded-xl transition-colors inline-block"
                >
                  Reset All Filters
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} viewMode="grid" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} viewMode="list" />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Slide-out Modal */}
      {isMobileFilterOpen && (
        <div
          id="mobile-filter-backdrop"
          className="fixed inset-0 z-50 flex justify-end bg-stone-950/80 backdrop-blur-sm lg:hidden animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsMobileFilterOpen(false);
          }}
        >
          <div className="bg-stone-900 w-full max-w-xs h-full p-6 overflow-y-auto border-l border-stone-800 space-y-6">
            <div className="flex items-center justify-between border-b border-stone-800 pb-4">
              <h3 className="font-bold text-stone-100 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                Refine Options
              </h3>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="text-stone-400 hover:text-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Categories */}
            <div>
              <h4 className="text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
                Category
              </h4>
              <div className="space-y-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategoryFilter(cat);
                      setIsMobileFilterOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs ${
                      selectedCategoryFilter === cat
                        ? 'bg-amber-400 text-stone-950 font-bold'
                        : 'text-stone-300 hover:bg-stone-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Slider */}
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-stone-300">Max Price</span>
                <span className="font-mono font-bold text-amber-400">{formatPrice(maxPrice)}</span>
              </div>
              <input
                type="range"
                min={50}
                max={500}
                step={10}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-amber-400 bg-stone-950 cursor-pointer"
              />
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-stone-800 space-y-2">
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full bg-amber-400 text-stone-950 font-bold py-2.5 rounded-xl text-xs"
              >
                Apply Filters
              </button>
              <button
                onClick={() => {
                  handleResetFilters();
                  setIsMobileFilterOpen(false);
                }}
                className="w-full bg-stone-800 text-stone-300 font-semibold py-2 rounded-xl text-xs"
              >
                Reset All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
