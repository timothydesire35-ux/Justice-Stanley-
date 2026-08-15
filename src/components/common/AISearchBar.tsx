import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Sparkles,
  X,
  ArrowRight,
  Loader2,
  Tag,
  TrendingUp,
  Layers,
  ChevronRight,
  Check,
} from 'lucide-react';
import { useEcommerce } from '../../context/EcommerceContext';
import { Product, AISearchResultItem } from '../../types/ecommerce';

interface AISearchBarProps {
  idPrefix?: string;
  className?: string;
  placeholder?: string;
  onSearchComplete?: () => void;
}

const PREDICTIVE_PROMPTS = [
  'summer clothes & breathable styles',
  'noise cancelling for travel & commute',
  'luxury leather & horology gifts under $300',
  'working from home desk setup',
  'cozy evening ambiance & aromas',
  'minimalist everyday carry accessories',
];

export const AISearchBar: React.FC<AISearchBarProps> = ({
  idPrefix = 'header',
  className = '',
  placeholder = 'Try "summer clothes", "noise cancelling for commute", "gifts under $200"...',
  onSearchComplete,
}) => {
  const {
    searchQuery,
    setSearchQuery,
    runAiSearch,
    clearAiSearch,
    isAiSearching,
    aiSearchResponse,
    products,
    setSelectedProductForModal,
    setActiveTab,
    setSelectedCategoryFilter,
    formatPrice,
  } = useEcommerce();

  const [inputVal, setInputVal] = useState(searchQuery);
  const [isOpen, setIsOpen] = useState(false);
  const [liveMatches, setLiveMatches] = useState<Array<{ product: Product; result?: AISearchResultItem }>>([]);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>(PREDICTIVE_PROMPTS);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync input value if external query changes
  useEffect(() => {
    setInputVal(searchQuery);
  }, [searchQuery]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced predictive query preview as user types
  useEffect(() => {
    if (!inputVal.trim()) {
      setLiveMatches([]);
      setSuggestedPrompts(PREDICTIVE_PROMPTS);
      return;
    }

    const timer = setTimeout(() => {
      const q = inputVal.toLowerCase().trim();

      // Instant local predictive scoring while user types
      const scored = products
        .map((p) => {
          let score = 0;
          let reason = '';
          const nameMatch = p.name.toLowerCase().includes(q);
          const catMatch = p.category.toLowerCase().includes(q);
          const tagMatch = p.tags.some((t) => t.toLowerCase().includes(q));
          const descMatch = p.description.toLowerCase().includes(q);

          if (nameMatch) {
            score += 40;
            reason = `Matches name "${p.name}"`;
          } else if (catMatch) {
            score += 30;
            reason = `In ${p.category}`;
          } else if (tagMatch) {
            score += 25;
            reason = `Tagged with matching style`;
          } else if (descMatch) {
            score += 15;
            reason = `Described as ${p.subtitle || 'relevant piece'}`;
          }

          // Natural language concepts
          if (q.includes('summer') || q.includes('warm') || q.includes('beach')) {
            if (p.category === 'Apparel & Wear' || p.tags.some((t) => ['Linen', 'Lightweight', 'Sun'].includes(t))) {
              score += 35;
              reason = 'Lightweight breathable summer materials';
            }
          }
          if (q.includes('audio') || q.includes('sound') || q.includes('music') || q.includes('commute') || q.includes('listen')) {
            if (p.category === 'Audio & Tech') {
              score += 35;
              reason = 'High-resolution acoustic performance';
            }
          }
          if (q.includes('gift') || q.includes('present') || q.includes('luxury')) {
            if (p.price > 100 || p.tags.includes('Luxury') || p.tags.includes('Limited Edition')) {
              score += 30;
              reason = 'Curated luxury craftsmanship';
            }
          }
          if (q.includes('work') || q.includes('desk') || q.includes('office')) {
            if (p.category === 'Audio & Tech' || p.category === 'Accessories' || p.category === 'Home & Living') {
              score += 25;
              reason = 'Ideal for modern workspace & focus';
            }
          }

          return { product: p, score, reason };
        })
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 4);

      setLiveMatches(
        scored.map((s) => ({
          product: s.product,
          result: {
            productId: s.product.id,
            score: s.score,
            reason: s.reason,
            highlightedFeatures: s.product.tags.slice(0, 2),
          },
        }))
      );
    }, 200);

    return () => clearTimeout(timer);
  }, [inputVal, products]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    setIsOpen(false);
    await runAiSearch(inputVal, true);
    if (onSearchComplete) onSearchComplete();
  };

  const handleSelectPrompt = async (prompt: string) => {
    setInputVal(prompt);
    setIsOpen(false);
    await runAiSearch(prompt, true);
    if (onSearchComplete) onSearchComplete();
  };

  const handleSelectProduct = (prod: Product) => {
    setSelectedProductForModal(prod);
    setIsOpen(false);
    if (onSearchComplete) onSearchComplete();
  };

  const handleClear = () => {
    setInputVal('');
    clearAiSearch();
    if (inputRef.current) inputRef.current.focus();
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Search Input Container */}
      <form onSubmit={handleSubmit} className="relative group">
        <div
          className={`relative flex items-center bg-stone-900/90 border transition-all rounded-full ${
            isOpen
              ? 'border-amber-400 ring-2 ring-amber-400/20 bg-stone-900 shadow-xl'
              : 'border-stone-700/80 hover:border-stone-500 hover:bg-stone-850'
          }`}
        >
          {/* AI Sparkle / Search Icon */}
          <div className="pl-3.5 pr-1 flex items-center justify-center text-amber-400">
            {isAiSearching ? (
              <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
            ) : (
              <Sparkles className="w-4 h-4 animate-pulse text-amber-400" />
            )}
          </div>

          <input
            id={`${idPrefix}-search-input`}
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => {
              setInputVal(e.target.value);
              if (!isOpen) setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className="w-full bg-transparent py-2 pl-1.5 pr-20 text-xs sm:text-sm text-stone-100 placeholder-stone-400 focus:outline-none font-sans"
          />

          {/* Right Action: Clear & AI Badge */}
          <div className="absolute right-2 flex items-center gap-1.5">
            {inputVal && (
              <button
                type="button"
                id={`${idPrefix}-search-clear-btn`}
                onClick={handleClear}
                className="p-1 text-stone-400 hover:text-stone-100 rounded-full hover:bg-stone-800 transition-colors"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="submit"
              id={`${idPrefix}-search-submit-btn`}
              className="bg-amber-400 hover:bg-amber-300 text-stone-950 px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 transition-all shadow-sm active:scale-95 shrink-0"
              title="Search using AI natural language matching"
            >
              <span className="hidden sm:inline">AI Search</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </form>

      {/* Predictive Interactive Dropdown */}
      {isOpen && (
        <div
          id={`${idPrefix}-search-dropdown`}
          className="absolute left-0 right-0 top-full mt-2 bg-stone-900 border border-stone-700/90 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 max-h-[80vh] overflow-y-auto divide-y divide-stone-800"
        >
          {/* Header Banner */}
          <div className="px-4 py-2.5 bg-stone-950/80 flex items-center justify-between text-[11px] text-stone-300">
            <span className="flex items-center gap-1.5 font-medium text-amber-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Predictive Natural Language Search</span>
            </span>
            <span className="text-[10px] text-stone-400 font-mono">
              Powered by Gemini
            </span>
          </div>

          {/* Live Matched Products Section (if typing and matches exist) */}
          {liveMatches.length > 0 && (
            <div className="p-3 space-y-2">
              <div className="px-2 text-[10px] font-mono uppercase tracking-wider text-amber-400/90 flex items-center justify-between">
                <span>Instant Predictive Matches</span>
                <span className="text-stone-400">{liveMatches.length} items</span>
              </div>

              <div className="grid grid-cols-1 gap-1.5">
                {liveMatches.map(({ product, result }) => (
                  <div
                    key={product.id}
                    id={`${idPrefix}-match-${product.id}`}
                    onClick={() => handleSelectProduct(product)}
                    className="p-2 rounded-xl bg-stone-950/60 hover:bg-stone-800 border border-stone-800/80 hover:border-amber-400/50 transition-all cursor-pointer flex items-center gap-3 group"
                  >
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-12 h-12 rounded-lg object-cover bg-stone-900 shrink-0 border border-stone-800"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-stone-200 group-hover:text-amber-300 truncate">
                          {product.name}
                        </span>
                        <span className="text-xs font-mono font-bold text-stone-100 ml-2">
                          {formatPrice(product.price)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-stone-400 font-mono">
                          {product.category}
                        </span>
                        {result?.reason && (
                          <span className="text-[10px] text-amber-300/90 bg-amber-950/60 border border-amber-800/40 px-1.5 py-0.2 rounded line-clamp-1">
                            ✨ {result.reason}
                          </span>
                        )}
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-stone-500 group-hover:text-amber-400 transition-transform group-hover:translate-x-0.5 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Natural Language Prompt Ideas */}
          <div className="p-3 space-y-2">
            <div className="px-2 flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-stone-400">
              <TrendingUp className="w-3 h-3 text-amber-400" />
              <span>{inputVal.trim() ? 'Related Natural Language Prompts' : 'Popular Natural Language Searches'}</span>
            </div>

            <div className="flex flex-wrap gap-1.5 px-1">
              {suggestedPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  id={`${idPrefix}-prompt-chip-${idx}`}
                  onClick={() => handleSelectPrompt(prompt)}
                  className="text-left text-xs bg-stone-950 hover:bg-stone-800 border border-stone-800 hover:border-amber-400/60 text-stone-300 hover:text-amber-200 px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 group"
                >
                  <Sparkles className="w-3 h-3 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span>"{prompt}"</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Categories Bar */}
          <div className="p-3 bg-stone-950/40 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-stone-400 text-[11px]">
              <Layers className="w-3.5 h-3.5 text-stone-400" />
              <span>Jump to Category:</span>
            </div>

            <div className="flex flex-wrap gap-1">
              {['Audio & Tech', 'Apparel & Wear', 'Accessories', 'Home & Living'].map((cat) => (
                <button
                  key={cat}
                  id={`${idPrefix}-cat-jump-${cat.replace(/\s+/g, '-').toLowerCase()}`}
                  onClick={() => {
                    setSelectedCategoryFilter(cat);
                    setActiveTab('shop');
                    setIsOpen(false);
                    if (onSearchComplete) onSearchComplete();
                  }}
                  className="text-[11px] text-stone-300 hover:text-amber-300 bg-stone-900 border border-stone-800 px-2 py-0.5 rounded-md hover:border-stone-600 transition-colors"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Dropdown Bottom Submit CTA */}
          {inputVal.trim() && (
            <div className="p-2.5 bg-stone-950 flex items-center justify-between">
              <span className="text-xs text-stone-400 truncate max-w-[200px]">
                Search for <strong className="text-stone-100">"{inputVal}"</strong>
              </span>
              <button
                type="button"
                id={`${idPrefix}-search-all-btn`}
                onClick={handleSubmit}
                className="bg-amber-400 hover:bg-amber-300 text-stone-950 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow"
              >
                <span>View Full Catalog Results</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
