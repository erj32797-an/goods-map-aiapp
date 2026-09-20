/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  RotateCcw, 
  Check, 
  Compass,
  SlidersHorizontal,
  Map as MapIcon,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { Booth, Product, Facility, Walkway, SearchQuery, SearchHistoryItem, MapLegendItem, ModuleSizeSettings } from './types';
import { DEFAULT_BOOTHS, DEFAULT_PRODUCTS, DEFAULT_FACILITIES, DEFAULT_WALKWAYS, DEFAULT_LEGENDS, DEFAULT_MODULE_SIZE_SETTINGS, DEFAULT_SYSTEM_TITLE } from './data';
import StoreMap from './components/StoreMap';
import SearchPanel from './components/SearchPanel';
import BoothDetails from './components/BoothDetails';
import AdminDashboard from './components/AdminDashboard';

export default function App() {
  // Main view toggle: 'map' (interactive customer guide) or 'admin' (store management & excel import backend)
  const [mainView, setMainView] = useState<'map' | 'admin'>('admin');

  // State initialization with localStorage persistence
  const [booths, setBooths] = useState<Booth[]>(() => {
    const saved = localStorage.getItem('store_booths_v1');
    return saved ? JSON.parse(saved) : DEFAULT_BOOTHS;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('store_products_v1');
    return saved ? JSON.parse(saved) : DEFAULT_PRODUCTS;
  });

  const [facilities, setFacilities] = useState<Facility[]>(() => {
    const saved = localStorage.getItem('store_facilities_v1');
    return saved ? JSON.parse(saved) : DEFAULT_FACILITIES;
  });

  const [walkways, setWalkways] = useState<Walkway[]>(() => {
    const saved = localStorage.getItem('store_walkways_v1');
    return saved ? JSON.parse(saved) : DEFAULT_WALKWAYS;
  });

  const [legends, setLegends] = useState<MapLegendItem[]>(() => {
    const saved = localStorage.getItem('store_legends_v1');
    return saved ? JSON.parse(saved) : DEFAULT_LEGENDS;
  });

  const [moduleSizes, setModuleSizes] = useState<ModuleSizeSettings>(() => {
    const saved = localStorage.getItem('store_module_sizes_v1');
    const savedTitle = localStorage.getItem('store_system_title_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_MODULE_SIZE_SETTINGS,
          ...parsed,
          systemTitle: parsed.systemTitle || savedTitle || DEFAULT_SYSTEM_TITLE
        };
      } catch {
        return DEFAULT_MODULE_SIZE_SETTINGS;
      }
    }
    return {
      ...DEFAULT_MODULE_SIZE_SETTINGS,
      systemTitle: savedTitle || DEFAULT_SYSTEM_TITLE
    };
  });

  const systemTitle = moduleSizes.systemTitle?.trim() || DEFAULT_SYSTEM_TITLE;

  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>(() => {
    const saved = localStorage.getItem('store_search_history_v1');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedBoothId, setSelectedBoothId] = useState<string | null>(null);
  const [query, setQuery] = useState<SearchQuery>({ text: '', type: 'all' });

  // Toast / notification state for UI actions
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Admin Dashboard sub-tab routing state
  const [adminTargetTab, setAdminTargetTab] = useState<'excel' | 'layout' | 'booths' | 'products' | 'legends' | 'sizes'>('layout');
  const [adminTargetBoothId, setAdminTargetBoothId] = useState<string | null>(null);

  // Unified Admin Navigation Handler (Shared by 5-click hidden entry and search keyword '12345')
  const navigateToAdmin = useCallback((tab: 'excel' | 'layout' | 'booths' | 'products' | 'legends' | 'sizes' = 'layout', boothId: string | null = null) => {
    setAdminTargetTab(tab);
    setAdminTargetBoothId(boothId);
    setMainView('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('⚙️ 已進入商場空間與商品管理後台');
  }, []);

  // Hidden 5-clicks entrance on "智慧商場導覽與管理系統"
  const clickTimestampsRef = useRef<number[]>([]);

  const handleTitleClick = () => {
    if (mainView === 'admin') return;
    const now = Date.now();
    // Keep clicks occurring within the last 2500ms (2.5 second sliding window)
    const recentClicks = clickTimestampsRef.current.filter(t => now - t <= 2500);
    recentClicks.push(now);
    clickTimestampsRef.current = recentClicks;

    if (recentClicks.length >= 5) {
      clickTimestampsRef.current = [];
      navigateToAdmin();
    }
  };

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('store_booths_v1', JSON.stringify(booths));
  }, [booths]);

  useEffect(() => {
    localStorage.setItem('store_products_v1', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('store_facilities_v1', JSON.stringify(facilities));
  }, [facilities]);

  useEffect(() => {
    localStorage.setItem('store_walkways_v1', JSON.stringify(walkways));
  }, [walkways]);

  useEffect(() => {
    localStorage.setItem('store_legends_v1', JSON.stringify(legends));
  }, [legends]);

  useEffect(() => {
    localStorage.setItem('store_module_sizes_v1', JSON.stringify(moduleSizes));
    if (moduleSizes.systemTitle) {
      localStorage.setItem('store_system_title_v1', moduleSizes.systemTitle);
    }
  }, [moduleSizes]);

  useEffect(() => {
    if (systemTitle) {
      document.title = `${systemTitle} - 互動式商品位置查詢系統`;
    }
  }, [systemTitle]);

  useEffect(() => {
    localStorage.setItem('store_search_history_v1', JSON.stringify(searchHistory));
  }, [searchHistory]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Search trigger helper to calculate highlighted booths based on bidirectional search
  const searchText = query.text.trim().toLowerCase();
  const keywords = searchText ? searchText.split(/\s+/).filter(Boolean) : [];

  const matchText = (source: string) => {
    if (!source) return false;
    const srcLower = source.toLowerCase();
    return keywords.every(kw => srcLower.includes(kw));
  };

  const getHighlightedBoothIds = (): string[] => {
    if (!searchText) return [];

    const highlightedIds = new Set<string>();

    // 1. Check direct booth matches
    booths.forEach(booth => {
      const matchName = matchText(booth.name);
      const matchId = booth.id.toLowerCase() === searchText || booth.id.toLowerCase().includes(searchText);
      const matchZone = matchText(booth.zone);
      const matchDesc = matchText(booth.description);

      // Check if any product inside this booth matches
      const hasMatchingProduct = products.some(p => p.boothId === booth.id && (matchText(p.name) || p.tags.some(t => matchText(t))));

      if (query.type !== 'product' && (matchName || matchId || matchZone || matchDesc || hasMatchingProduct)) {
        highlightedIds.add(booth.id);
      }
    });

    // 2. Check product matches (Bidirectional Search - finding items highlights their parent booths!)
    if (query.type !== 'booth') {
      products.forEach(product => {
        const nameMatch = matchText(product.name);
        const categoryMatch = matchText(product.category);
        const descMatch = matchText(product.description);
        const tagMatch = product.tags.some(tag => matchText(tag));

        if (nameMatch || categoryMatch || descMatch || tagMatch) {
          highlightedIds.add(product.boothId);
        }
      });
    }

    return Array.from(highlightedIds);
  };

  const highlightedBoothIds = getHighlightedBoothIds();

  // Search History Management
  const handleAddHistory = (queryText: string) => {
    const trimmed = queryText.trim();
    if (!trimmed) return;
    
    setSearchHistory(prev => {
      const filtered = prev.filter(item => item.query.toLowerCase() !== trimmed.toLowerCase());
      const newItem: SearchHistoryItem = {
        id: Date.now().toString(),
        query: trimmed,
        timestamp: new Date().toLocaleTimeString()
      };
      return [newItem, ...filtered].slice(0, 6);
    });
  };

  const handleDeleteHistoryItem = (id: string) => {
    setSearchHistory(prev => prev.filter(item => item.id !== id));
  };

  const handleClearHistory = () => {
    setSearchHistory([]);
    showToast('已清除所有搜尋紀錄');
  };

  // Clear search and reset booth highlight/selection to original colors
  const handleClearSearch = () => {
    setSelectedBoothId(null);
  };

  // Handle clicking on map elements or search results
  const handleSelectBooth = (boothId: string) => {
    setSelectedBoothId(boothId);
  };

  // Switch to Map and focus on a specific booth (used by Admin Dashboard)
  const handleLocateBoothOnMap = (boothId: string) => {
    setSelectedBoothId(boothId);
    setMainView('map');
    showToast(`已定位至櫃位「${boothId}」`);
  };

  // App-level Reset & Clear Modal State
  const [showAppResetModal, setShowAppResetModal] = useState<boolean>(false);

  // Full Database catalog reset (flushes local storage and reloads clean defaults)
  const handleDirectResetAll = () => {
    try {
      localStorage.removeItem('store_booths_v1');
      localStorage.removeItem('store_products_v1');
      localStorage.removeItem('store_facilities_v1');
      localStorage.removeItem('store_walkways_v1');
      localStorage.removeItem('store_legends_v1');
      localStorage.removeItem('store_module_sizes_v1');
      localStorage.removeItem('store_system_title_v1');
      localStorage.removeItem('store_search_history_v1');
    } catch (e) {
      console.warn('localStorage clear failed', e);
    }
    setBooths(DEFAULT_BOOTHS);
    setProducts(DEFAULT_PRODUCTS);
    setFacilities(DEFAULT_FACILITIES);
    setWalkways(DEFAULT_WALKWAYS);
    setLegends(DEFAULT_LEGENDS);
    setModuleSizes(DEFAULT_MODULE_SIZE_SETTINGS);
    setSearchHistory([]);
    setSelectedBoothId(null);
    setQuery({ text: '', type: 'all' });
    showToast('✨ 賣場空間資料庫、模組尺寸與圖例已重設為系統預設值！');
    setShowAppResetModal(false);
  };

  // Clear all booths and products to blank slate (ready for fresh Excel import)
  const handleClearAllBoothsAndProducts = () => {
    try {
      localStorage.setItem('store_booths_v1', JSON.stringify([]));
      localStorage.setItem('store_products_v1', JSON.stringify([]));
    } catch (e) {
      console.warn('localStorage update failed', e);
    }
    setBooths([]);
    setProducts([]);
    setSelectedBoothId(null);
    setQuery({ text: '', type: 'all' });
    showToast('🗑️ 已成功清空所有專櫃與商品資料 (目前為空白狀態)！');
    setShowAppResetModal(false);
  };

  // Full Database catalog reset trigger (opens non-blocking modal)
  const handleResetData = () => {
    setShowAppResetModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans" id="app-root">
      
      {/* Top Header Banner & Global Navigation Switch */}
      <header className="bg-white border-b border-slate-200 py-2.5 sm:py-3.5 px-3 sm:px-6 sticky top-0 z-30 shadow-sm safe-top safe-left safe-right">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          
          {/* Logo Title section (Continuous 5 clicks hidden admin entrance) */}
          <div 
            className="flex items-center gap-2.5 sm:gap-3 min-w-0 select-none cursor-pointer group"
            onClick={handleTitleClick}
            id="system-title-section"
            title={systemTitle}
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md text-white shrink-0 group-hover:bg-indigo-700 transition">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg md:text-xl font-black tracking-tight text-slate-900 break-words group-hover:text-indigo-950 transition">
                  {systemTitle}
                </h1>
                <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full shrink-0">
                  v4.5 EXCEL PRO
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium break-words hidden md:block">
                支援商品/櫃位雙向查詢
              </p>
            </div>
          </div>

          {/* Header Action Tools */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
            {/* If in admin view, provide clear button to return to the interactive store map */}
            {mainView === 'admin' && (
              <button
                onClick={() => setMainView('map')}
                className="px-3 sm:px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition duration-150 shadow-sm"
                id="btn-return-to-map"
              >
                <MapIcon className="w-4 h-4 shrink-0" />
                <span>返回賣場平面導覽</span>
              </button>
            )}

            {/* Quick stats and reset */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <div className="bg-slate-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-slate-200 text-center shadow-sm">
                <div className="text-[9px] text-slate-400 font-bold uppercase">櫃位</div>
                <div className="text-xs font-mono font-bold text-indigo-600">{booths.length}</div>
              </div>
              <div className="bg-slate-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-slate-200 text-center shadow-sm">
                <div className="text-[9px] text-slate-400 font-bold uppercase">商品</div>
                <div className="text-xs font-mono font-bold text-rose-600">{products.length}</div>
              </div>

              <button
                onClick={handleResetData}
                className="p-1.5 sm:p-2 bg-white hover:bg-slate-50 hover:text-rose-600 border border-slate-200 rounded-xl text-slate-500 transition duration-150 shadow-sm"
                title="還原預設賣場資料"
                id="btn-reset-db"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main 
        className={`flex-1 w-full mx-auto p-3 sm:p-4 md:p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] safe-left safe-right flex flex-col transition-all duration-300 ${
          moduleSizes.contentMaxWidth === 'full' ? 'max-w-full px-3 sm:px-6' :
          moduleSizes.contentMaxWidth === '6xl' ? 'max-w-6xl' :
          moduleSizes.contentMaxWidth === '5xl' ? 'max-w-5xl' : 'max-w-7xl'
        }`}
      >
        
        {mainView === 'admin' ? (
          /* ======================================================== */
          /* EXCEL IMPORT & FULL STORE ADMIN DASHBOARD VIEW           */
          /* ======================================================== */
          <div className="flex-1">
            <AdminDashboard
              booths={booths}
              products={products}
              facilities={facilities}
              walkways={walkways}
              legends={legends}
              moduleSizes={moduleSizes}
              onUpdateBooths={setBooths}
              onUpdateProducts={setProducts}
              onUpdateFacilities={setFacilities}
              onUpdateWalkways={setWalkways}
              onUpdateLegends={setLegends}
              onUpdateModuleSizes={setModuleSizes}
              onResetAllData={handleDirectResetAll}
              onShowToast={showToast}
              onSelectBoothForView={handleLocateBoothOnMap}
              onBackToMap={() => setMainView('map')}
              initialTab={adminTargetTab}
              initialBoothIdForProduct={adminTargetBoothId}
            />
          </div>
        ) : (
          /* ======================================================== */
          /* INTERACTIVE FLOOR MAP & BIDIRECTIONAL SEARCH GUIDE VIEW   */
          /* ======================================================== */
          <div className="flex flex-col gap-4 flex-1">
            
            {/* Quick Sizing Toolbar on Frontend if enabled (hidden on mobile devices) */}
            {moduleSizes.showFrontendQuickResize && (
              <div className="hidden md:flex bg-white/90 backdrop-blur-md border border-slate-200/80 px-4 py-2.5 rounded-2xl flex-wrap items-center justify-between gap-3 shadow-xs text-xs">
                <div className="flex items-center gap-3 text-slate-600 flex-wrap">
                  <div className="flex items-center gap-1.5 font-bold text-slate-700">
                    <span className="p-1 bg-indigo-50 text-indigo-600 rounded-md">
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                    </span>
                    <span>版面比例:</span>
                  </div>
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl flex-wrap">
                    {(['2:10', '3:9', '4:8', '5:7', '6:6', '7:5', '8:4', '12:12'] as const).map(ratio => (
                      <button
                        key={ratio}
                        type="button"
                        onClick={() => {
                          setModuleSizes(prev => ({ ...prev, columnRatio: ratio }));
                          showToast(`已切換版面比例為「${ratio}」`);
                        }}
                        className={`px-2 py-0.5 rounded-lg font-mono text-[11px] font-bold transition ${
                          moduleSizes.columnRatio === ratio
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                        }`}
                      >
                        {ratio}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  {/* Quick Height presets */}
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <span className="text-[11px] font-bold text-slate-500">地圖高:</span>
                    <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
                      {[480, 580, 720, 880].map(h => (
                        <button
                          key={h}
                          type="button"
                          onClick={() => {
                            setModuleSizes(prev => ({ ...prev, mapHeight: h }));
                            showToast(`已調整地圖高度為 ${h}px`);
                          }}
                          className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-bold transition ${
                            moduleSizes.mapHeight === h
                              ? 'bg-indigo-600 text-white shadow-2xs'
                              : 'text-slate-600 hover:bg-white/60'
                          }`}
                        >
                          {h}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quick Scale presets */}
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <span className="text-[11px] font-bold text-slate-500">縮放:</span>
                    <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
                      {[0.8, 1.0, 1.25, 1.5].map(s => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => {
                            setModuleSizes(prev => ({ ...prev, mapViewScale: s }));
                            showToast(`已調整縮放為 ${(s * 100).toFixed(0)}%`);
                          }}
                          className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-bold transition ${
                            Math.abs(moduleSizes.mapViewScale - s) < 0.05
                              ? 'bg-indigo-600 text-white shadow-2xs'
                              : 'text-slate-600 hover:bg-white/60'
                          }`}
                        >
                          {(s * 100).toFixed(0)}%
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Dynamic Grid Layout according to columnRatio (Parent container defining sticky boundary) */}
            <div 
              className={`items-start flex-1 gap-6 ${
                moduleSizes.columnRatio === '12:12' 
                  ? 'flex flex-col' 
                  : 'grid grid-cols-1 md:grid-cols-12'
              }`}
              id="main-guide-grid-parent"
            >
              
              {/* Left Side: Search Panel & Detailed Product List */}
              <section 
                className={`flex flex-col gap-4 z-10 ${
                  moduleSizes.columnRatio === '2:10' ? 'md:col-span-2' :
                  moduleSizes.columnRatio === '3:9' ? 'md:col-span-3' :
                  moduleSizes.columnRatio === '4:8' ? 'md:col-span-4' :
                  moduleSizes.columnRatio === '5:7' ? 'md:col-span-5' :
                  moduleSizes.columnRatio === '6:6' ? 'md:col-span-6' :
                  moduleSizes.columnRatio === '7:5' ? 'md:col-span-7' :
                  moduleSizes.columnRatio === '8:4' ? 'md:col-span-8' : 'w-full'
                }`} 
                id="left-sidebar-section"
              >
                
                {/* Main Search Panel (雙向查詢模式) */}
                <div className="min-h-0">
                  <SearchPanel
                    query={query}
                    setQuery={setQuery}
                    products={products}
                    booths={booths}
                    onResultClick={handleSelectBooth}
                    searchHistory={searchHistory}
                    onAddHistory={handleAddHistory}
                    onClearHistory={handleClearHistory}
                    onDeleteHistoryItem={handleDeleteHistoryItem}
                    onClearSearch={handleClearSearch}
                    onTriggerSecretAdmin={navigateToAdmin}
                    minHeight={moduleSizes.searchMinHeight}
                    density={moduleSizes.searchDensity}
                    cardSize={moduleSizes.searchCardSize}
                  />
                </div>

                {/* Detailed booth/product specifications slot (詳細商品清單，行動裝置前台不顯示，僅保留綜合查詢面板及平面圖) */}
                <div className="min-h-0 hidden md:block" id="selected-booth-details-slot">
                  <BoothDetails
                    booth={booths.find(b => b.id === selectedBoothId) || null}
                    products={products}
                    allBooths={booths}
                    onSelectBooth={handleSelectBooth}
                    onClose={() => setSelectedBoothId(null)}
                  />
                </div>
              </section>

              {/* Right Side: Visual Floor Map (Sticky 懸浮面板：捲動時跟隨移動，到達頂部時自動固定，離開父層時隨之移出) */}
              <section 
                className={`flex flex-col gap-6 md:sticky md:top-20 self-start z-20 ${
                  moduleSizes.columnRatio === '2:10' ? 'md:col-span-10' :
                  moduleSizes.columnRatio === '3:9' ? 'md:col-span-9' :
                  moduleSizes.columnRatio === '4:8' ? 'md:col-span-8' :
                  moduleSizes.columnRatio === '5:7' ? 'md:col-span-7' :
                  moduleSizes.columnRatio === '6:6' ? 'md:col-span-6' :
                  moduleSizes.columnRatio === '7:5' ? 'md:col-span-5' :
                  moduleSizes.columnRatio === '8:4' ? 'md:col-span-4' : 'w-full'
                }`} 
                id="right-map-section"
              >
                
                {/* Interactive map card */}
                <StoreMap
                  booths={booths}
                  facilities={facilities}
                  walkways={walkways}
                  legends={legends}
                  selectedBoothId={selectedBoothId}
                  highlightedBoothIds={highlightedBoothIds}
                  onSelectBooth={handleSelectBooth}
                  searchActive={!!searchText}
                  mapHeight={moduleSizes.mapHeight}
                  initialScale={moduleSizes.mapViewScale}
                  borderRadius={moduleSizes.mapBorderRadius}
                  showBoothIds={moduleSizes.showBoothIds !== false}
                  canvasWidth={moduleSizes.canvasWidth || 1000}
                  canvasHeight={moduleSizes.canvasHeight || 500}
                  onUpdateMapHeight={(newH) => setModuleSizes(prev => ({ ...prev, mapHeight: newH }))}
                  onUpdateScale={(newS) => setModuleSizes(prev => ({ ...prev, mapViewScale: newS }))}
                />

              </section>

            </div>

          </div>
        )}

      </main>

      {/* Slide-In Toast Notification Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-4 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 z-50 bg-white border border-slate-200 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 max-w-sm mb-[env(safe-area-inset-bottom)] text-slate-800"
          >
            <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
              <Check className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold break-words">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-4 sm:py-5 text-center text-xs text-slate-400 flex flex-col sm:flex-row justify-between items-center px-4 sm:px-8 gap-3 pb-[calc(1.25rem+env(safe-area-inset-bottom))] safe-left safe-right">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0"></span>
          <span className="break-words">系統運作正常 • 支援 Excel / CSV 即時同步</span>
        </div>
        <div>
          <span className="break-words">© 2026 互動式賣場商品位置查詢與智慧管理系統 • Digital Mall Map Corp.</span>
        </div>
      </footer>

      {/* App Database Reset & Clear Modal */}
      {showAppResetModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl p-4 sm:p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  賣場資料庫管理與清除
                </h3>
                <p className="text-xs text-slate-500">
                  請選擇要執行的資料清除或重設操作
                </p>
              </div>
            </div>

            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={handleDirectResetAll}
                className="w-full text-left p-3.5 bg-slate-50 hover:bg-indigo-50/70 border border-slate-200 hover:border-indigo-300 rounded-2xl transition group"
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-xs text-slate-800 group-hover:text-indigo-700 flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-indigo-600" />
                    <span>還原為系統預設示範資料庫</span>
                  </div>
                  <span className="text-[11px] text-slate-400">推薦</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 pl-6">
                  重設所有自訂設定，恢復 16 間標準專櫃、範例商品與標準平面圖。
                </p>
              </button>

              <button
                type="button"
                onClick={handleClearAllBoothsAndProducts}
                className="w-full text-left p-3.5 bg-slate-50 hover:bg-rose-50/70 border border-slate-200 hover:border-rose-300 rounded-2xl transition group"
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-xs text-rose-700 flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-rose-600" />
                    <span>一鍵清空所有專櫃與商品 (0 筆空白)</span>
                  </div>
                  <span className="text-[10px] text-rose-600 font-bold bg-rose-100 px-1.5 py-0.5 rounded-md">全新規劃</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 pl-6">
                  清空所有現有櫃位與商品資料，適合準備全新匯入 Excel 檔案。
                </p>
              </button>
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowAppResetModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
