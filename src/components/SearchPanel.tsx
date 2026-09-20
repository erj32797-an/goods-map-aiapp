import React, { useState } from 'react';
import { 
  Search, 
  X, 
  ShoppingBag, 
  Store, 
  Sparkles, 
  History, 
  ArrowRightLeft,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { Product, Booth, SearchQuery, SearchHistoryItem } from '../types';

interface SearchPanelProps {
  query: SearchQuery;
  setQuery: (query: SearchQuery) => void;
  products: Product[];
  booths: Booth[];
  onResultClick: (boothId: string) => void;
  searchHistory: SearchHistoryItem[];
  onAddHistory: (queryText: string) => void;
  onClearHistory: () => void;
  onDeleteHistoryItem: (id: string) => void;
  onClearSearch?: () => void;
  onTriggerSecretAdmin?: () => void;
  minHeight?: number;
  density?: 'compact' | 'comfortable' | 'spacious';
  cardSize?: 'sm' | 'md' | 'lg';
}

const HOT_TAGS = ['拉麵', '口紅', 'iPhone', '洋芋片', '運動鞋', '牛肉麵', '咖啡', '服飾'];

export default function SearchPanel({
  query,
  setQuery,
  products,
  booths,
  onResultClick,
  searchHistory,
  onAddHistory,
  onClearHistory,
  onDeleteHistoryItem,
  onClearSearch,
  onTriggerSecretAdmin,
  minHeight = 460,
  density = 'comfortable',
  cardSize = 'md'
}: SearchPanelProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;

    // Check hidden admin keyword: exactly '12345'
    if (val.trim() === '12345') {
      if (onTriggerSecretAdmin) {
        onTriggerSecretAdmin();
      }
      setQuery({ ...query, text: '' });
      if (onClearSearch) {
        onClearSearch();
      }
      return;
    }

    setQuery({ ...query, text: val });
    if (!val.trim() && onClearSearch) {
      onClearSearch();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.text.trim() === '12345') {
      e.preventDefault();
      if (onTriggerSecretAdmin) {
        onTriggerSecretAdmin();
      }
      setQuery({ ...query, text: '' });
      if (onClearSearch) {
        onClearSearch();
      }
    }
  };

  const handleClear = () => {
    setQuery({ ...query, text: '' });
    if (onClearSearch) {
      onClearSearch();
    }
  };

  const handleTabChange = (type: 'all' | 'product' | 'booth') => {
    setQuery({ ...query, type });
  };

  const handleTagClick = (tag: string) => {
    setQuery({ ...query, text: tag });
    onAddHistory(tag);
  };

  const handleHistoryClick = (text: string) => {
    setQuery({ ...query, text });
  };

  // Perform filtering for products and booths
  const searchText = query.text.trim().toLowerCase();
  const keywords = searchText ? searchText.split(/\s+/).filter(Boolean) : [];

  const matchText = (source: string) => {
    if (!source) return false;
    const srcLower = source.toLowerCase();
    return keywords.every(kw => srcLower.includes(kw));
  };

  // 1. Filtered products
  const matchedProducts = products.filter(product => {
    if (!searchText) return false;
    if (query.type === 'booth') return false; // skip if specifically searching booths
    
    // Check product details
    const nameMatch = matchText(product.name);
    const categoryMatch = matchText(product.category);
    const descMatch = matchText(product.description);
    const tagMatch = product.tags.some(tag => matchText(tag));

    // Also match parent booth details (bidirectional search helper!)
    const parentBooth = booths.find(b => b.id === product.boothId);
    const boothMatch = parentBooth ? (matchText(parentBooth.name) || matchText(parentBooth.id)) : false;

    return nameMatch || categoryMatch || descMatch || tagMatch || boothMatch;
  });

  // 2. Filtered booths
  const matchedBooths = booths.filter(booth => {
    if (!searchText) return false;
    if (query.type === 'product') return false; // skip if specifically searching products

    const nameMatch = matchText(booth.name);
    const idMatch = booth.id.toLowerCase() === searchText || booth.id.toLowerCase().includes(searchText);
    const zoneMatch = matchText(booth.zone);
    const descMatch = matchText(booth.description);

    // Also check if any product inside matches (bidirectional search!)
    const hasMatchingProduct = products.some(p => p.boothId === booth.id && (matchText(p.name) || p.tags.some(t => matchText(t))));

    return nameMatch || idMatch || zoneMatch || descMatch || hasMatchingProduct;
  });

  const totalResults = matchedProducts.length + matchedBooths.length;

  const paddingClass = density === 'compact' ? 'p-3.5' : density === 'spacious' ? 'p-6' : 'p-5';
  const cardPaddingClass = cardSize === 'sm' ? 'p-2' : cardSize === 'lg' ? 'p-4' : 'p-3';
  const cardTextSizeClass = cardSize === 'sm' ? 'text-xs' : cardSize === 'lg' ? 'text-base' : 'text-sm';

  return (
    <div 
      className={`bg-white border border-slate-200 rounded-2xl md:rounded-3xl shadow-sm flex flex-col min-h-0 md:[min-height:var(--desktop-min-h)] max-h-[480px] md:max-h-[520px] overflow-hidden transition-all duration-300 p-3 md:p-4 md:${paddingClass}`} 
      id="search-panel-container"
      style={{ '--desktop-min-h': `${Math.min(minHeight, 420)}px` } as React.CSSProperties}
    >
      
      {/* Bidirectional header subtitle */}
      <div className={`flex flex-wrap items-center justify-between gap-2 ${searchText ? 'mb-2.5 md:mb-4' : 'hidden md:flex mb-2.5 md:mb-4'}`}>
        <div className="hidden md:flex items-center gap-1.5 text-xs text-indigo-600 font-medium">
          <ArrowRightLeft className="w-3.5 h-3.5 shrink-0" />
          <span>支援雙向查詢模式</span>
        </div>
        {searchText && (
          <span className="text-[11px] bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-0.5 rounded-full font-mono font-bold shrink-0">
            找到 {totalResults} 筆相符
          </span>
        )}
      </div>

      {/* Smart Search Input with search button */}
      <div className="relative mb-2.5 md:mb-4" id="search-input-wrapper">
        <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-150 ${isFocused ? 'text-indigo-600' : 'text-slate-400'}`}>
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={query.text}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            if (searchText) {
              onAddHistory(query.text);
            }
          }}
          placeholder="搜尋商品、種類、標籤、櫃位代號..."
          className="w-full pl-11 pr-10 py-3 bg-slate-50 text-slate-800 placeholder-slate-400 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm font-sans transition duration-150 shadow-inner"
          id="main-search-input"
        />
        {query.text && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition duration-150"
            title="清除搜尋"
            id="btn-search-clear"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Mode Navigation Tabs (行動裝置僅保留綜合查詢，隱藏依商品、依櫃位查詢) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl mb-2.5 md:mb-4" id="search-type-tabs">
        <button
          onClick={() => handleTabChange('all')}
          className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition duration-150 ${
            query.type === 'all'
              ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/80'
              : 'text-slate-500 hover:text-slate-800'
          }`}
          id="tab-search-all"
        >
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">綜合查詢</span>
        </button>
        <button
          onClick={() => handleTabChange('product')}
          className={`hidden md:flex py-1.5 px-2 rounded-lg text-xs font-semibold items-center justify-center gap-1.5 transition duration-150 ${
            query.type === 'product'
              ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/80'
              : 'text-slate-500 hover:text-slate-800'
          }`}
          id="tab-search-products"
        >
          <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">依商品</span>
        </button>
        <button
          onClick={() => handleTabChange('booth')}
          className={`hidden md:flex py-1.5 px-2 rounded-lg text-xs font-semibold items-center justify-center gap-1.5 transition duration-150 ${
            query.type === 'booth'
              ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/80'
              : 'text-slate-500 hover:text-slate-800'
          }`}
          id="tab-search-booths"
        >
          <Store className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">依櫃位</span>
        </button>
      </div>

      {/* Hot suggestions chips */}
      <div className="mb-2.5 md:mb-4" id="hot-tags-section">
        <div className="flex items-center gap-1 text-[11px] text-slate-400 font-bold mb-2">
          <TrendingUp className="w-3 h-3 text-indigo-600 shrink-0" />
          <span>熱門搜尋</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {HOT_TAGS.map(tag => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className={`text-[11px] px-2.5 py-1 rounded-lg border transition duration-150 ${
                searchText === tag.toLowerCase()
                  ? 'bg-indigo-600 text-white border-indigo-500'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Results Display */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-2 space-y-4 scrollbar-thin custom-scrollbar scroll-smooth" id="search-results-viewport">
        {searchText ? (
          <>
            {/* Matching Booths Section */}
            {matchedBooths.length > 0 && (
              <div id="matched-booths-list">
                <h4 className="text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-2 flex items-center gap-1">
                  <Store className="w-3 h-3 text-indigo-600 shrink-0" />
                  <span>符合的櫃位 ({matchedBooths.length})</span>
                </h4>
                <div className="space-y-2">
                  {matchedBooths.map(booth => (
                    <div
                      key={booth.id}
                      onClick={() => onResultClick(booth.id)}
                      className={`group bg-white hover:bg-slate-50 border border-slate-200 hover:border-indigo-500 rounded-2xl cursor-pointer transition duration-150 flex items-center justify-between gap-3 shadow-sm ${cardPaddingClass}`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Zone ID Tag */}
                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center font-mono text-[10px] font-bold text-indigo-600 group-hover:bg-indigo-50 group-hover:border-indigo-200 transition-colors shrink-0">
                          <span>{booth.id}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className={`font-bold text-slate-800 group-hover:text-indigo-600 transition-colors break-words ${cardTextSizeClass}`}>
                            {booth.name}
                          </div>
                          <div className="text-[11px] text-slate-500 break-words">
                            {booth.zone}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition duration-150 shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Matching Products Section */}
            {matchedProducts.length > 0 && (
              <div id="matched-products-list">
                <h4 className="text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-2 flex items-center gap-1">
                  <ShoppingBag className="w-3 h-3 text-pink-500 shrink-0" />
                  <span>符合的商品 ({matchedProducts.length})</span>
                </h4>
                <div className="space-y-2">
                  {matchedProducts.map(product => {
                    const booth = booths.find(b => b.id === product.boothId);
                    return (
                      <div
                        key={product.id}
                        onClick={() => onResultClick(product.boothId)}
                        className={`group bg-white hover:bg-slate-50 border border-slate-200 hover:border-pink-500/80 rounded-2xl cursor-pointer transition duration-150 shadow-sm ${cardPaddingClass}`}
                      >
                        <div className="flex flex-wrap sm:flex-nowrap justify-between items-start gap-2 mb-1.5">
                          <h5 className={`font-bold text-slate-800 group-hover:text-pink-600 transition-colors break-words flex-1 min-w-0 ${cardTextSizeClass}`}>
                            {product.name}
                          </h5>
                          {product.price && (
                            <span className="text-xs font-mono font-bold text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 shadow-sm shrink-0 whitespace-nowrap">
                              NT$ {product.price.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 break-words mb-2 font-sans leading-relaxed">
                          {product.description}
                        </p>
                        
                        {/* Parent Booth Info Label */}
                        <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1 border-t border-slate-100">
                          <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-medium">
                            {product.category}
                          </span>
                          <span className="text-[11px] font-semibold text-pink-600 flex items-center gap-1 flex-wrap">
                            <span>位於 🏢</span>
                            <span className="underline decoration-dotted break-words">{booth?.name || product.boothId}</span>
                            <span className="font-mono bg-pink-50 border border-pink-200 px-1.5 py-0.2 rounded text-[10px] text-pink-700 shrink-0">
                              {product.boothId}
                            </span>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* No Match Placeholder */}
            {matchedBooths.length === 0 && matchedProducts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4" id="search-no-results">
                <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mb-3 shadow-inner">
                  <Search className="w-5 h-5" />
                </div>
                <h5 className="text-sm font-bold text-slate-700 mb-1">查無相符結果</h5>
                <p className="text-xs text-slate-500 max-w-[260px] leading-relaxed">
                  請嘗試其他關鍵字或點擊上方熱門搜尋進行雙向比對。
                </p>
              </div>
            )}
          </>
        ) : (
          /* Blank state showing Search History or search prompt */
          <div className="space-y-4" id="history-section">
            {searchHistory.length > 0 ? (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-bold uppercase">
                    <History className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>最近搜尋紀錄</span>
                  </div>
                  <button
                    onClick={onClearHistory}
                    className="text-[11px] text-slate-500 hover:text-indigo-600 font-semibold transition"
                    id="btn-clear-all-history"
                  >
                    全部清除
                  </button>
                </div>
                <div className="space-y-1.5">
                  {searchHistory.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 hover:border-indigo-500 transition shadow-sm"
                    >
                      <button
                        onClick={() => handleHistoryClick(item.query)}
                        className="flex-1 text-left text-xs font-semibold text-slate-600 hover:text-indigo-600 transition break-words min-w-0"
                      >
                        {item.query}
                      </button>
                      <button
                        onClick={() => onDeleteHistoryItem(item.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition shrink-0"
                        title="刪除"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="hidden md:flex flex-col items-center justify-center py-6 md:py-16 text-center px-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-2.5 md:mb-3 shadow-sm">
                  <ArrowRightLeft className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <h5 className="text-sm font-bold text-slate-700 mb-1">雙向查詢</h5>
                <p className="text-xs text-slate-500 max-w-[240px] leading-relaxed">
                  輸入商品（如: 零食、手機、吹風機）或櫃位代號（如: A1、D1）進行即時查詢
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
