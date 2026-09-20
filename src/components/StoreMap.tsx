import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Minimize2,
  RotateCcw,
  Layers, 
  Sparkles,
  ArrowUpDown,
  ChevronDown
} from 'lucide-react';
import { Booth, Facility, Walkway, MapLegendItem } from '../types';
import { DEFAULT_FACILITIES, DEFAULT_WALKWAYS, DEFAULT_LEGENDS, getBoothThemeStyles } from '../data';

interface StoreMapProps {
  booths: Booth[];
  facilities?: Facility[];
  walkways?: Walkway[];
  legends?: MapLegendItem[];
  selectedBoothId: string | null;
  highlightedBoothIds: string[];
  onSelectBooth: (boothId: string) => void;
  searchActive: boolean;
  mapHeight?: number;
  initialScale?: number;
  borderRadius?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  onUpdateMapHeight?: (newHeight: number) => void;
  onUpdateScale?: (newScale: number) => void;
  activeLegendId?: string | null;
  onSelectLegend?: (legendId: string | null) => void;
  showBoothIds?: boolean;
  canvasWidth?: number;
  canvasHeight?: number;
}

export default function StoreMap({
  booths,
  facilities = DEFAULT_FACILITIES,
  walkways = DEFAULT_WALKWAYS,
  legends = DEFAULT_LEGENDS,
  selectedBoothId,
  highlightedBoothIds,
  onSelectBooth,
  searchActive,
  mapHeight = 580,
  initialScale = 1.0,
  borderRadius = '3xl',
  onUpdateMapHeight,
  onUpdateScale,
  activeLegendId: controlledActiveLegendId,
  onSelectLegend,
  showBoothIds = true,
  canvasWidth = 1000,
  canvasHeight = 500
}: StoreMapProps) {
  // Panning & Zooming state
  const [scale, setScale] = useState<number>(initialScale);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showZoomMenu, setShowZoomMenu] = useState<boolean>(false);
  const [showHeightMenu, setShowHeightMenu] = useState<boolean>(false);

  // Active Zone Legend selection state
  const [internalActiveLegendId, setInternalActiveLegendId] = useState<string | null>(null);
  const activeLegendId = controlledActiveLegendId !== undefined ? controlledActiveLegendId : internalActiveLegendId;

  const handleToggleLegend = (legendId: string | null) => {
    if (onSelectLegend) {
      onSelectLegend(legendId);
    }
    setInternalActiveLegendId(legendId);
  };

  // Helper to match booth with a map legend
  const isBoothMatchingLegend = (booth: Booth, legend: MapLegendItem): boolean => {
    if (!legend) return false;
    // Match by zoneCode (e.g. 'A', 'B', 'C', 'D', 'E')
    if (legend.zoneCode) {
      const code = legend.zoneCode.trim().toUpperCase();
      if (booth.id.toUpperCase().startsWith(code)) return true;
      if (booth.zone.toUpperCase().includes(code)) return true;
    }
    // Match by zone name
    if (legend.name) {
      const cleanLegend = legend.name.replace(/\(.*?區\)/g, '').trim();
      if (booth.zone.includes(legend.name) || legend.name.includes(booth.zone)) return true;
      if (cleanLegend && booth.zone.includes(cleanLegend)) return true;
    }
    // Match by color
    if (legend.color && booth.color === legend.color) {
      return true;
    }
    return false;
  };

  // Helper to match facility with a map legend
  const isFacilityMatchingLegend = (fac: Facility, legend: MapLegendItem): boolean => {
    if (!legend) return false;
    if (legend.category === '公共設施' || legend.id.startsWith('legend_fac_')) {
      if (legend.name && (fac.name.includes(legend.name) || legend.name.includes(fac.name))) return true;
      if (legend.color && fac.color === legend.color) return true;
      if (legend.id.includes('nursery') && (fac.type === 'nursery' || fac.name.includes('哺育') || fac.name.includes('育嬰'))) return true;
      if (legend.id.includes('service') && (fac.type === 'info' || fac.name.includes('服務') || fac.name.includes('諮詢'))) return true;
      if (legend.id.includes('restroom') && (fac.type === 'restroom' || fac.name.includes('洗手間') || fac.name.includes('化妝室'))) return true;
      if (legend.id.includes('cafe') && (fac.type === 'cafe' || fac.name.includes('咖啡') || fac.name.includes('大廳'))) return true;
      if (legend.id.includes('pillar') && (fac.type === 'pillar' || fac.name.includes('柱'))) return true;
      if (legend.id.includes('office') && (fac.type === 'office' || fac.name.includes('辦公') || fac.name.includes('行政'))) return true;
    }
    return false;
  };

  // Compute active legend and matching elements
  const currentActiveLegend = legends.find(l => l.id === activeLegendId) || null;
  const matchingZoneBooths = currentActiveLegend ? booths.filter(b => isBoothMatchingLegend(b, currentActiveLegend)) : [];
  const matchingZoneBoothIds = matchingZoneBooths.map(b => b.id);
  const matchingZoneFacilities = currentActiveLegend ? facilities.filter(f => isFacilityMatchingLegend(f, currentActiveLegend)) : [];
  const matchingZoneFacilityIds = matchingZoneFacilities.map(f => f.id);
  const hasZoneActive = !!currentActiveLegend;

  // Update scale when initialScale prop changes
  useEffect(() => {
    if (initialScale) {
      setScale(initialScale);
    }
  }, [initialScale]);

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredBooth, setHoveredBooth] = useState<Booth | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Touch gesture state for pinch-to-zoom
  const touchStateRef = useRef<{
    initialDist: number;
    initialScale: number;
    lastX: number;
    lastY: number;
    touchCount: number;
  }>({
    initialDist: 0,
    initialScale: 1,
    lastX: 0,
    lastY: 0,
    touchCount: 0
  });

  // Vertical drag-to-resize state for map height
  const [isResizingHeight, setIsResizingHeight] = useState<boolean>(false);
  const resizeStartYRef = useRef<number>(0);
  const resizeStartHeightRef = useRef<number>(mapHeight);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);

  // Reset zoom and pan
  const handleReset = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
    if (onUpdateScale) onUpdateScale(1);
  };

  // Fit map smoothly into current container width & height
  const handleFitToScreen = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const padding = 24;
      const availableW = Math.max(rect.width - padding, 200);
      const availableH = Math.max((isFullscreen ? window.innerHeight : mapHeight) - 100, 200);
      const fitScale = Math.min(
        availableW / canvasWidth,
        availableH / canvasHeight
      );
      const targetScale = Math.min(Math.max(Number(fitScale.toFixed(2)), 0.35), 2.5);
      setScale(targetScale);
      setOffset({ x: 0, y: 0 });
      if (onUpdateScale) onUpdateScale(targetScale);
    } else {
      setScale(0.8);
      setOffset({ x: 0, y: 0 });
    }
  };

  // Automatically fit map on mobile screens on initial mount
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      const timer = setTimeout(() => {
        handleFitToScreen();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [canvasWidth, canvasHeight]);

  const handleSetScale = (newScale: number) => {
    const clamped = Math.min(Math.max(Number(newScale.toFixed(2)), 0.4), 3.5);
    setScale(clamped);
    if (onUpdateScale) onUpdateScale(clamped);
  };

  const handleZoomIn = () => {
    handleSetScale(scale + 0.15);
  };

  const handleZoomOut = () => {
    handleSetScale(scale - 0.15);
  };

  // Mouse wheel zoom with non-passive listener to prevent window scrolling
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      setScale(prev => {
        const next = Math.min(Math.max(Number((prev * zoomFactor).toFixed(2)), 0.4), 3.5);
        if (onUpdateScale) onUpdateScale(next);
        return next;
      });
    };

    viewport.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      viewport.removeEventListener('wheel', handleWheel);
    };
  }, [onUpdateScale]);

  // Touch gesture handlers for mobile pinch-to-zoom and touch pan
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      touchStateRef.current = {
        initialDist: 0,
        initialScale: scale,
        lastX: e.touches[0].clientX - offset.x,
        lastY: e.touches[0].clientY - offset.y,
        touchCount: 1
      };
      setIsDragging(true);
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStateRef.current = {
        initialDist: dist,
        initialScale: scale,
        lastX: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        lastY: (e.touches[0].clientY + e.touches[1].clientY) / 2,
        touchCount: 2
      };
      setIsDragging(false);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1 && touchStateRef.current.touchCount === 1) {
      setOffset({
        x: e.touches[0].clientX - touchStateRef.current.lastX,
        y: e.touches[0].clientY - touchStateRef.current.lastY
      });
    } else if (e.touches.length === 2 && touchStateRef.current.initialDist > 0) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = dist / touchStateRef.current.initialDist;
      const newScale = Math.min(Math.max(Number((touchStateRef.current.initialScale * ratio).toFixed(2)), 0.4), 3.5);
      setScale(newScale);
      if (onUpdateScale) onUpdateScale(newScale);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchStateRef.current.touchCount = 0;
    touchStateRef.current.initialDist = 0;
  };

  // Drag handlers for panning
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // Only left click
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }

    // Update tooltip position if hovering, ensuring it is never clipped by container edges
    if (hoveredBooth && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const rawX = e.clientX - rect.left + 15;
      const rawY = e.clientY - rect.top + 15;
      const maxX = Math.max(10, rect.width - 240);
      const maxY = Math.max(10, rect.height - 140);
      setTooltipPos({
        x: Math.min(Math.max(10, rawX), maxX),
        y: Math.min(Math.max(10, rawY), maxY)
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Height resize drag handle logic
  const handleHeightResizeStart = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsResizingHeight(true);
    resizeStartYRef.current = e.clientY;
    resizeStartHeightRef.current = mapHeight;

    const handleWindowMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - resizeStartYRef.current;
      const newHeight = Math.min(Math.max(Math.round(resizeStartHeightRef.current + deltaY), 400), 1000);
      if (onUpdateMapHeight) {
        onUpdateMapHeight(newHeight);
      }
    };

    const handleWindowMouseUp = () => {
      setIsResizingHeight(false);
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
  };

  // Vertical touch drag-to-resize handler for mobile screens
  const handleTouchHeightResizeStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length !== 1) return;
    setIsResizingHeight(true);
    resizeStartYRef.current = e.touches[0].clientY;
    resizeStartHeightRef.current = mapHeight;

    const handleWindowTouchMove = (moveEvent: TouchEvent) => {
      if (moveEvent.touches.length !== 1) return;
      const deltaY = moveEvent.touches[0].clientY - resizeStartYRef.current;
      const newHeight = Math.min(Math.max(Math.round(resizeStartHeightRef.current + deltaY), 320), 1000);
      if (onUpdateMapHeight) {
        onUpdateMapHeight(newHeight);
      }
    };

    const handleWindowTouchEnd = () => {
      setIsResizingHeight(false);
      window.removeEventListener('touchmove', handleWindowTouchMove);
      window.removeEventListener('touchend', handleWindowTouchEnd);
    };

    window.addEventListener('touchmove', handleWindowTouchMove, { passive: true });
    window.addEventListener('touchend', handleWindowTouchEnd);
  };

  // Quick height adjust helpers
  const handleAdjustHeightStep = (delta: number) => {
    if (onUpdateMapHeight) {
      const target = Math.min(Math.max(mapHeight + delta, 400), 1000);
      onUpdateMapHeight(target);
    }
  };

  // Hover handlers for booths
  const handleBoothMouseEnter = (booth: Booth, e: React.MouseEvent<SVGGElement>) => {
    setHoveredBooth(booth);
  };

  const handleBoothMouseLeave = () => {
    setHoveredBooth(null);
  };

  const radiusClass = 
    borderRadius === 'sm' ? 'rounded-lg' :
    borderRadius === 'md' ? 'rounded-xl' :
    borderRadius === 'lg' ? 'rounded-2xl' :
    borderRadius === 'xl' ? 'rounded-2xl' :
    borderRadius === '2xl' ? 'rounded-3xl' : 'rounded-[2rem]';

  return (
    <div 
      ref={containerRef}
      className={`relative w-full bg-white overflow-hidden border border-slate-200/90 shadow-md hover:shadow-lg flex flex-col transition-all duration-300 ${radiusClass} ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen w-screen border-none shadow-2xl' : ''
      }`} 
      style={{ 
        height: isFullscreen ? '100vh' : `${mapHeight}px`,
        maxHeight: isFullscreen ? '100vh' : 'calc(100vh - 96px)'
      }}
      id="store-map-container"
    >
      {/* Map Header with controls */}
      <div className="absolute top-3.5 left-3.5 right-3.5 z-20 flex flex-wrap justify-between items-center gap-2 pointer-events-none">
        {/* Title Badge & Map Info */}
        <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 px-3.5 py-1.5 rounded-2xl flex items-center gap-2.5 pointer-events-auto shadow-sm">
          <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold text-slate-800">1F 賣場平面圖</h3>
              <span className="text-[10px] font-mono px-1.5 py-0.5 bg-indigo-50 text-indigo-700 font-bold rounded-md">
                {(scale * 100).toFixed(0)}%
              </span>
            </div>
            <p className="text-[10px] text-slate-500 hidden sm:block">滾輪/雙指縮放 • 拖曳平移視角</p>
          </div>
        </div>

        {/* Zoom & Size Controls Hub */}
        <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 p-1 rounded-2xl flex items-center gap-1 pointer-events-auto shadow-sm">
          
          {/* Zoom Out Button */}
          <button 
            onClick={handleZoomOut} 
            className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-xl transition duration-150 active:scale-95"
            title="縮小視角 (-15%)"
            id="btn-zoom-out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          {/* Quick Zoom Level Dropdown Trigger */}
          <div className="relative">
            <button
              onClick={() => {
                setShowZoomMenu(!showZoomMenu);
                setShowHeightMenu(false);
              }}
              className="px-2 py-1 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 rounded-xl text-xs font-mono font-bold flex items-center gap-1 border border-slate-200 transition"
              title="選擇縮放比例"
              id="btn-zoom-menu-toggle"
            >
              <span>{(scale * 100).toFixed(0)}%</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* Zoom Presets Popup */}
            {showZoomMenu && (
              <div 
                className="absolute top-full mt-1.5 right-0 bg-white border border-slate-200 rounded-2xl p-2 shadow-xl z-30 min-w-[170px] space-y-1 animate-in fade-in zoom-in-95 duration-150"
                id="zoom-presets-popup"
              >
                <div className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">縮放比例選項</div>
                <div className="grid grid-cols-3 gap-1 px-1">
                  {[0.6, 0.8, 1.0, 1.25, 1.5, 2.0].map(s => (
                    <button
                      key={s}
                      onClick={() => {
                        handleSetScale(s);
                        setShowZoomMenu(false);
                      }}
                      className={`px-1.5 py-1 text-xs font-mono font-bold rounded-lg transition ${
                        Math.abs(scale - s) < 0.05
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700'
                      }`}
                    >
                      {(s * 100).toFixed(0)}%
                    </button>
                  ))}
                </div>

                {/* Slider inside popup */}
                <div className="px-2 pt-2 pb-1 border-t border-slate-100 mt-1">
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono mb-1">
                    <span>40%</span>
                    <span className="font-bold text-indigo-600">{(scale * 100).toFixed(0)}%</span>
                    <span>350%</span>
                  </div>
                  <input
                    type="range"
                    min="0.4"
                    max="3.5"
                    step="0.05"
                    value={scale}
                    onChange={(e) => handleSetScale(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>

                <div className="pt-1 border-t border-slate-100 flex gap-1">
                  <button
                    onClick={() => {
                      handleReset();
                      setShowZoomMenu(false);
                    }}
                    className="w-full px-2 py-1 text-[11px] font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg flex items-center justify-center gap-1 transition"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>重設 100% 視角</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Zoom In Button */}
          <button 
            onClick={handleZoomIn} 
            className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-xl transition duration-150 active:scale-95"
            title="放大視角 (+15%)"
            id="btn-zoom-in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-4 bg-slate-200 mx-0.5"></div>

          {/* Map Height Quick Stepper / Dropdown (when not in fullscreen) */}
          {!isFullscreen && onUpdateMapHeight && (
            <div className="relative">
              <button
                onClick={() => {
                  setShowHeightMenu(!showHeightMenu);
                  setShowZoomMenu(false);
                }}
                className="px-2 py-1 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 rounded-xl text-xs font-mono font-bold flex items-center gap-1 border border-slate-200 transition"
                title="調整地圖高度"
                id="btn-height-menu-toggle"
              >
                <ArrowUpDown className="w-3 h-3 text-slate-400" />
                <span>{mapHeight}px</span>
              </button>

              {/* Height Presets Popup */}
              {showHeightMenu && (
                <div 
                  className="absolute top-full mt-1.5 right-0 bg-white border border-slate-200 rounded-2xl p-2.5 shadow-xl z-30 min-w-[200px] space-y-2 animate-in fade-in zoom-in-95 duration-150"
                  id="height-presets-popup"
                >
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <span>地圖高度快捷設定</span>
                    <span className="font-mono text-indigo-600">{mapHeight}px</span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { label: '小巧 (480px)', h: 480 },
                      { label: '標準 (580px)', h: 580 },
                      { label: '加高 (720px)', h: 720 },
                      { label: '巨幕 (880px)', h: 880 }
                    ].map(item => (
                      <button
                        key={item.h}
                        onClick={() => {
                          onUpdateMapHeight(item.h);
                          setShowHeightMenu(false);
                        }}
                        className={`px-2 py-1.5 text-xs font-bold rounded-xl text-left transition ${
                          mapHeight === item.h
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>

                  {/* Height Slider */}
                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono mb-1">
                      <span>400px</span>
                      <span className="font-bold text-indigo-600">{mapHeight}px</span>
                      <span>1000px</span>
                    </div>
                    <input
                      type="range"
                      min="400"
                      max="1000"
                      step="20"
                      value={mapHeight}
                      onChange={(e) => onUpdateMapHeight(parseInt(e.target.value, 10))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>

                  {/* Fine step buttons */}
                  <div className="flex gap-1 pt-1 border-t border-slate-100">
                    <button
                      onClick={() => handleAdjustHeightStep(-40)}
                      className="flex-1 py-1 px-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                    >
                      -40px
                    </button>
                    <button
                      onClick={() => handleAdjustHeightStep(40)}
                      className="flex-1 py-1 px-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                    >
                      +40px
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Fit to Screen Button */}
          <button 
            onClick={handleFitToScreen} 
            className="p-1.5 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-xl transition duration-150 flex items-center gap-1 active:scale-95"
            title="自動最適適應螢幕視角"
            id="btn-zoom-fit-screen"
          >
            <Maximize2 className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-[10px] font-bold hidden sm:inline text-indigo-600">最適</span>
          </button>

          {/* Reset View Button */}
          <button 
            onClick={handleReset} 
            className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-xl transition duration-150"
            title="重設視角與平移 (100%)"
            id="btn-zoom-reset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen Toggle Button */}
          <button 
            onClick={() => {
              setIsFullscreen(!isFullscreen);
              setShowZoomMenu(false);
              setShowHeightMenu(false);
            }} 
            className={`p-1.5 rounded-xl transition duration-150 ${
              isFullscreen 
                ? 'bg-indigo-600 text-white shadow-xs' 
                : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
            title={isFullscreen ? '結束全螢幕沉浸導覽' : '全螢幕沉浸放大導覽'}
            id="btn-fullscreen-toggle"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Interactive Map Drag & Drop Stage */}
      <div 
        ref={viewportRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => {
          if (showZoomMenu) setShowZoomMenu(false);
          if (showHeightMenu) setShowHeightMenu(false);
        }}
        className={`w-full flex-1 relative ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} overflow-hidden bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] bg-slate-50 touch-none`}
        id="map-canvas-viewport"
      >
        <div 
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.12s ease-out'
          }}
          className="w-full h-full flex items-center justify-center"
        >
          {/* Main SVG Floor Plan */}
          <svg
            ref={svgRef}
            width={canvasWidth}
            height={canvasHeight}
            viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
            className="select-none overflow-visible max-w-full"
            style={{ minWidth: `${canvasWidth}px`, minHeight: `${canvasHeight}px` }}
          >
            {/* Ambient Base Floor */}
            <rect 
              x="20" 
              y="20" 
              width={Math.max(100, canvasWidth - 40)} 
              height={Math.max(100, canvasHeight - 40)} 
              rx="24" 
              fill="#ffffff" 
              stroke="#cbd5e1" 
              strokeWidth="2" 
              className="shadow-sm cursor-pointer"
              onClick={() => {
                onSelectBooth('');
                handleToggleLegend(null);
              }}
            />

            {/* Dynamic Walkways / Corridor Paths */}
            <g id="walkways" className="opacity-90 cursor-pointer" onClick={() => { onSelectBooth(''); handleToggleLegend(null); }}>
              {walkways.map(walk => {
                const fontSize = walk.fontSize || 10;
                const fontWeight = walk.fontWeight === 'black' ? 900 : walk.fontWeight === 'bold' ? 700 : walk.fontWeight === 'medium' ? 500 : 400;
                const offX = walk.textOffsetX || 0;
                const offY = walk.textOffsetY || 0;
                const isVertical = walk.textOrientation === 'vertical';

                let textX = walk.x + walk.width / 2 + offX;
                let textY = walk.y + walk.height / 2 + 3 + offY;
                let textAnchor: 'middle' | 'start' | 'end' = 'middle';

                if (!isVertical) {
                  if (walk.textPosition === 'top') {
                    textY = walk.y + fontSize + 4 + offY;
                  } else if (walk.textPosition === 'bottom') {
                    textY = walk.y + walk.height - 6 + offY;
                  } else if (walk.textPosition === 'left') {
                    textX = walk.x + 8 + offX;
                    textAnchor = 'start';
                  } else if (walk.textPosition === 'right') {
                    textX = walk.x + walk.width - 8 + offX;
                    textAnchor = 'end';
                  }
                } else {
                  // Vertical orientation
                  if (walk.textPosition === 'top') {
                    textY = walk.y + 8 + offY;
                  } else if (walk.textPosition === 'bottom') {
                    textY = walk.y + walk.height - walk.name.length * (fontSize + 2) - 4 + offY;
                  } else if (walk.textPosition === 'left') {
                    textX = walk.x + fontSize + 4 + offX;
                  } else if (walk.textPosition === 'right') {
                    textX = walk.x + walk.width - fontSize - 4 + offX;
                  } else {
                    textY = walk.y + Math.max(8, (walk.height - walk.name.length * (fontSize + 2)) / 2) + offY;
                  }
                }

                return (
                  <g key={walk.id}>
                    <rect 
                      x={walk.x} 
                      y={walk.y} 
                      width={walk.width} 
                      height={walk.height} 
                      fill={walk.color || (walk.type === 'entrance' ? '#e2e8f0' : '#f1f5f9')} 
                      rx={6} 
                    />
                    {walk.name && walk.width >= 20 && walk.height >= 16 && (
                      <text
                        x={textX}
                        y={textY}
                        textAnchor={isVertical ? 'middle' : textAnchor}
                        fill={walk.textColor || '#64748b'}
                        style={{
                          fontSize: `${fontSize}px`,
                          fontWeight,
                          ...(isVertical ? {
                            writingMode: 'vertical-rl' as const,
                            textOrientation: 'upright' as const,
                            letterSpacing: '2px'
                          } : {})
                        }}
                        className="select-none pointer-events-none font-sans"
                      >
                        {walk.name}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>

            {/* Dynamic Mall Facilities Landmarks */}
            <g id="mall-facilities">
              {facilities.map(fac => {
                const isInfo = fac.type === 'info';
                const isEntrance = fac.type === 'entrance';
                const isEscalator = fac.type === 'escalator';
                const isElevator = fac.type === 'elevator';
                const isNursery = fac.type === 'nursery';
                const isCafe = fac.type === 'cafe';
                const isAtm = fac.type === 'atm';
                const isPillar = fac.type === 'pillar';
                const isOffice = fac.type === 'office';

                const fontSize = fac.fontSize || (isInfo ? 9 : 10);
                const fontWeight = fac.fontWeight === 'black' ? 900 : fac.fontWeight === 'bold' ? 700 : fac.fontWeight === 'medium' ? 500 : 400;
                const offX = fac.textOffsetX || 0;
                const offY = fac.textOffsetY || 0;
                const isVertical = fac.textOrientation === 'vertical';

                let textX = fac.width / 2 + offX;
                let textY = fac.height / 2 + 4 + offY;
                let textAnchor: 'middle' | 'start' | 'end' = 'middle';

                if (!isVertical) {
                  if (fac.textPosition === 'top') {
                    textY = fontSize + 4 + offY;
                  } else if (fac.textPosition === 'bottom') {
                    textY = fac.height - 4 + offY;
                  } else if (fac.textPosition === 'left') {
                    textX = 8 + offX;
                    textAnchor = 'start';
                  } else if (fac.textPosition === 'right') {
                    textX = fac.width - 8 + offX;
                    textAnchor = 'end';
                  }
                } else {
                  if (fac.textPosition === 'top') {
                    textY = 8 + offY;
                  } else if (fac.textPosition === 'bottom') {
                    textY = fac.height - fac.name.length * (fontSize + 2) - 4 + offY;
                  } else if (fac.textPosition === 'left') {
                    textX = fontSize + 4 + offX;
                  } else if (fac.textPosition === 'right') {
                    textX = fac.width - fontSize - 4 + offX;
                  } else {
                    textY = Math.max(6, (fac.height - fac.name.length * (fontSize + 2)) / 2) + offY;
                  }
                }

                const verticalTextStyle = isVertical ? {
                  writingMode: 'vertical-rl' as const,
                  textOrientation: 'upright' as const,
                  letterSpacing: '2px'
                } : {};

                // Facility matching & opacity
                const isFacilityMatch = hasZoneActive && matchingZoneFacilityIds.includes(fac.id);
                let facOpacity = 1;
                if (hasZoneActive) {
                  if (matchingZoneFacilityIds.length > 0) {
                    facOpacity = isFacilityMatch ? 1 : 0.25;
                  } else if (matchingZoneBoothIds.length > 0) {
                    facOpacity = 0.35;
                  }
                }

                if (isInfo) {
                  const radius = Math.min(fac.width, fac.height) / 2 - 4;
                  const cx = fac.x + fac.width / 2;
                  const cy = fac.y + fac.height / 2;
                  return (
                    <g key={fac.id} className="cursor-pointer group" style={{ opacity: facOpacity }}>
                      {isFacilityMatch && (
                        <circle cx={cx} cy={cy} r={Math.max(20, radius + 4)} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeDasharray="4,2" className="animate-pulse" />
                      )}
                      <circle cx={cx} cy={cy} r={Math.max(16, radius)} fill="#3b82f6" fillOpacity="0.1" stroke="#3b82f6" strokeWidth="1.5" />
                      <text x={cx} y={cy - 4} textAnchor="middle" fill="#1d4ed8" className="text-[13px] font-bold font-sans">ℹ</text>
                      <text 
                        x={cx + offX} 
                        y={cy + 12 + offY} 
                        textAnchor="middle" 
                        fill={fac.textColor || '#1e40af'} 
                        style={{ fontSize: `${fontSize}px`, fontWeight }}
                        className="font-sans font-bold"
                      >
                        {fac.name}
                      </text>
                    </g>
                  );
                }

                if (isEntrance) {
                  return (
                    <g key={fac.id} transform={`translate(${fac.x}, ${fac.y})`} style={{ opacity: facOpacity }}>
                      {isFacilityMatch && (
                        <rect x="-3" y="-3" width={fac.width + 6} height={fac.height + 6} rx="8" fill="none" stroke="#10b981" strokeWidth="2" className="animate-pulse" />
                      )}
                      <rect x="0" y="0" width={fac.width} height={fac.height} rx="6" fill="#10b981" fillOpacity="0.1" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3,3" />
                      <text 
                        x={textX} 
                        y={textY} 
                        textAnchor={isVertical ? 'middle' : textAnchor} 
                        fill={fac.textColor || '#047857'} 
                        style={{ fontSize: `${fontSize}px`, fontWeight, ...verticalTextStyle }}
                        className="font-sans font-bold"
                      >
                        {fac.name}
                      </text>
                    </g>
                  );
                }

                if (isEscalator) {
                  return (
                    <g key={fac.id} transform={`translate(${fac.x}, ${fac.y})`} style={{ opacity: facOpacity }}>
                      {isFacilityMatch && (
                        <rect x="-3" y="-3" width={fac.width + 6} height={fac.height + 6} rx="6" fill="none" stroke="#64748b" strokeWidth="2" className="animate-pulse" />
                      )}
                      <rect x="0" y="0" width={fac.width} height={fac.height} rx="4" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1" />
                      <path d={`M 15 ${fac.height - 12} L ${fac.width - 15} 12`} stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
                      <text 
                        x={textX} 
                        y={textY} 
                        textAnchor={isVertical ? 'middle' : textAnchor} 
                        fill={fac.textColor || '#475569'} 
                        style={{ fontSize: `${fontSize}px`, fontWeight, ...verticalTextStyle }}
                        className="font-mono font-bold"
                      >
                        {fac.name}
                      </text>
                    </g>
                  );
                }

                if (isElevator) {
                  return (
                    <g key={fac.id} transform={`translate(${fac.x}, ${fac.y})`} style={{ opacity: facOpacity }}>
                      {isFacilityMatch && (
                        <rect x="-3" y="-3" width={fac.width + 6} height={fac.height + 6} rx="6" fill="none" stroke="#64748b" strokeWidth="2" className="animate-pulse" />
                      )}
                      <rect x="0" y="0" width={fac.width} height={fac.height} rx="4" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1" />
                      <path d={`M 12 12 L 12 ${fac.height - 12} M 12 12 L 9 15 M 12 12 L 15 15`} stroke="#64748b" strokeWidth="1.2" strokeLinecap="round" />
                      <text 
                        x={textX} 
                        y={textY} 
                        textAnchor={isVertical ? 'middle' : textAnchor} 
                        fill={fac.textColor || '#475569'} 
                        style={{ fontSize: `${fontSize}px`, fontWeight, ...verticalTextStyle }}
                        className="font-mono font-bold"
                      >
                        {fac.name}
                      </text>
                    </g>
                  );
                }

                let stroke = '#cbd5e1';
                let fill = '#f8fafc';
                let textCol = '#475569';

                if (isCafe) {
                  stroke = '#f59e0b';
                  fill = '#fffbeb';
                  textCol = '#b45309';
                } else if (isAtm) {
                  stroke = '#10b981';
                  fill = '#f0fdf4';
                  textCol = '#047857';
                } else if (isNursery) {
                  stroke = '#f43f5e';
                  fill = '#fff1f2';
                  textCol = '#be123c';
                } else if (isPillar) {
                  stroke = '#1e293b';
                  fill = '#334155';
                  textCol = '#ffffff';
                } else if (isOffice) {
                  stroke = '#0d9488';
                  fill = '#f0fdfa';
                  textCol = '#0f766e';
                }

                return (
                  <g key={fac.id} transform={`translate(${fac.x}, ${fac.y})`} style={{ opacity: facOpacity }}>
                    {isFacilityMatch && (
                      <rect x="-3" y="-3" width={fac.width + 6} height={fac.height + 6} rx="8" fill="none" stroke={stroke} strokeWidth="2.5" className="animate-pulse" />
                    )}
                    <rect x="0" y="0" width={fac.width} height={fac.height} rx={isPillar ? 3 : 6} fill={fill} stroke={stroke} strokeWidth={isPillar ? 1.5 : 1.2} />
                    {/* Architectural cross lines for pillar */}
                    {isPillar && (
                      <g className="pointer-events-none opacity-40">
                        <line x1="0" y1="0" x2={fac.width} y2={fac.height} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2,2" />
                        <line x1={fac.width} y1="0" x2="0" y2={fac.height} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2,2" />
                      </g>
                    )}
                    <text 
                      x={textX} 
                      y={textY} 
                      textAnchor={isVertical ? 'middle' : textAnchor} 
                      fill={fac.textColor || textCol} 
                      style={{ fontSize: `${fontSize}px`, fontWeight, ...verticalTextStyle }}
                      className="font-sans font-bold"
                    >
                      {fac.name}
                    </text>
                  </g>
                );
              })}
            </g>

            {/* Interactive Booth Layers */}
            <g id="booths-layer">
              {booths.map((booth) => {
                const isSelected = selectedBoothId === booth.id;
                const isHighlighted = highlightedBoothIds.includes(booth.id);
                const hasHighlights = highlightedBoothIds.length > 0;
                
                // Zone match check for active legend
                const isZoneMatch = hasZoneActive && matchingZoneBoothIds.includes(booth.id);

                // Determine layout transparency
                let opacity = 1;
                if (searchActive && hasHighlights) {
                  opacity = isHighlighted ? 1 : 0.25;
                } else if (hasZoneActive) {
                  opacity = isZoneMatch ? 1 : 0.25;
                } else if (selectedBoothId) {
                  opacity = isSelected ? 1 : 0.6;
                }

                // Color themes mapping adapted for high-contrast professional light-mode layout
                const themeStyles = getBoothThemeStyles(booth.color, isSelected);
                let fillColor = themeStyles.fill;
                let strokeColor = themeStyles.stroke;
                let textColor = themeStyles.text;
                let badgeBg = themeStyles.badgeBg;
                let badgeText = themeStyles.badgeText;
                const accentLineColor = themeStyles.accentBar;

                // If highlighted by Search, give a brilliant energetic glow override matching Design HTML!
                const searchHighlighted = searchActive && isHighlighted;
                if (searchHighlighted) {
                  fillColor = '#4f46e5'; // Indigo-600
                  strokeColor = '#4f46e5';
                  textColor = '#ffffff';
                  badgeBg = '#312e81'; // Indigo-900
                  badgeText = '#e0e7ff'; // Indigo-100
                }

                let strokeWidth = '1.5';
                if (searchHighlighted) {
                  strokeWidth = '3';
                } else if (isZoneMatch) {
                  strokeWidth = '2.5';
                } else if (isSelected) {
                  strokeWidth = '2.5';
                }

                // Typography & text placement
                const fontSize = booth.fontSize || 12;
                const fontWeight = booth.fontWeight === 'black' ? 900 : booth.fontWeight === 'bold' ? 700 : booth.fontWeight === 'medium' ? 500 : 400;
                const offX = booth.textOffsetX || 0;
                const offY = booth.textOffsetY || 0;

                let textX = booth.x + booth.width / 2 + offX;
                let textY = booth.y + booth.height / 2 + (showBoothIds ? 12 : 4) + offY;
                let textAnchor: 'middle' | 'start' | 'end' = 'middle';
                const isVertical = booth.textOrientation === 'vertical';

                if (!isVertical) {
                  if (booth.textPosition === 'top') {
                    textY = booth.y + (showBoothIds ? 24 : 14) + fontSize + offY;
                  } else if (booth.textPosition === 'bottom') {
                    textY = booth.y + booth.height - 8 + offY;
                  } else if (booth.textPosition === 'left') {
                    textX = booth.x + 12 + offX;
                    textAnchor = 'start';
                  } else if (booth.textPosition === 'right') {
                    textX = booth.x + booth.width - 12 + offX;
                    textAnchor = 'end';
                  }
                } else {
                  if (booth.textPosition === 'top') {
                    textY = booth.y + (showBoothIds ? 28 : 16) + offY;
                  } else if (booth.textPosition === 'bottom') {
                    textY = booth.y + booth.height - booth.name.length * (fontSize + 2) - 6 + offY;
                  } else if (booth.textPosition === 'left') {
                    textX = booth.x + 16 + fontSize + offX;
                  } else if (booth.textPosition === 'right') {
                    textX = booth.x + booth.width - fontSize - 12 + offX;
                  } else {
                    textY = booth.y + Math.max(showBoothIds ? 26 : 14, (booth.height - booth.name.length * (fontSize + 2)) / 2 + (showBoothIds ? 6 : 2)) + offY;
                  }
                }

                return (
                  <g
                    key={booth.id}
                    id={`booth-g-${booth.id}`}
                    className="transition-all duration-300 cursor-pointer"
                    style={{ opacity }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectBooth(booth.id);
                    }}
                    onMouseEnter={(e) => handleBoothMouseEnter(booth, e)}
                    onMouseLeave={handleBoothMouseLeave}
                  >
                    {/* Pulsing glow underlay for search match */}
                    {searchHighlighted && (
                      <motion.rect
                        x={booth.x - 4}
                        y={booth.y - 4}
                        width={booth.width + 8}
                        height={booth.height + 8}
                        rx={12}
                        fill="none"
                        stroke="#4f46e5"
                        strokeWidth="2"
                        initial={{ opacity: 0.3, scale: 0.98 }}
                        animate={{ 
                          opacity: [0.3, 0.7, 0.3],
                          scale: [0.98, 1.02, 0.98]
                        }}
                        transition={{ 
                          repeat: Infinity, 
                          duration: 1.5,
                          ease: "easeInOut"
                        }}
                      />
                    )}

                    {/* Animated Zone Reaction Halo for all booths in active legend zone */}
                    {isZoneMatch && !searchHighlighted && (
                      <motion.rect
                        x={booth.x - 4}
                        y={booth.y - 4}
                        width={booth.width + 8}
                        height={booth.height + 8}
                        rx={14}
                        fill="none"
                        stroke={themeStyles.hex || themeStyles.stroke}
                        strokeWidth="2.5"
                        strokeDasharray="6,3"
                        initial={{ opacity: 0.4, scale: 0.98 }}
                        animate={{ 
                          opacity: [0.4, 1, 0.4],
                          scale: [0.99, 1.02, 0.99]
                        }}
                        transition={{ 
                          repeat: Infinity, 
                          duration: 1.8,
                          ease: "easeInOut"
                        }}
                      />
                    )}

                    {/* Main Booth Card Rect */}
                    <rect
                      x={booth.x}
                      y={booth.y}
                      width={booth.width}
                      height={booth.height}
                      rx={10}
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      className="transition-all duration-200"
                    />

                    {/* Zone colored top-border accent line */}
                    <rect
                      x={booth.x + 8}
                      y={booth.y + 6}
                      width={booth.width - 16}
                      height={4}
                      rx={2}
                      fill={accentLineColor}
                    />

                    {/* Booth ID Badge */}
                    {showBoothIds && (
                      <g transform={`translate(${booth.x + 12}, ${booth.y + 24})`}>
                        <rect
                          x="0"
                          y="0"
                          width="24"
                          height="16"
                          rx="4"
                          fill={badgeBg}
                          stroke={strokeColor}
                          strokeWidth="0.75"
                        />
                        <text
                          x="12"
                          y="11.5"
                          textAnchor="middle"
                          fill={badgeText}
                          className="text-[9px] font-mono font-bold"
                        >
                          {booth.id}
                        </text>
                      </g>
                    )}

                    {/* Booth Name Text with dynamic size & position */}
                    <text
                      x={textX}
                      y={textY}
                      textAnchor={isVertical ? 'middle' : textAnchor}
                      fill={booth.textColor || textColor}
                      style={{
                        fontSize: `${fontSize}px`,
                        fontWeight,
                        ...(isVertical ? {
                          writingMode: 'vertical-rl' as const,
                          textOrientation: 'upright' as const,
                          letterSpacing: '2px'
                        } : {})
                      }}
                      className="font-sans select-none"
                    >
                      {booth.name}
                    </text>

                    {/* Search match star marker */}
                    {searchHighlighted && (
                      <g transform={`translate(${booth.x + booth.width - 24}, ${booth.y + 12})`}>
                        <circle cx="8" cy="8" r="8" fill="#4f46e5" />
                        <path d="M 8 3 L 9.5 6 L 13 6.5 L 10.5 9 L 11 12.5 L 8 11 L 5 12.5 L 5.5 9 L 3 6.5 L 6.5 6 Z" fill="#ffffff" transform="scale(0.8) translate(2, 2)" />
                      </g>
                    )}

                    {/* Zone Match Star Marker */}
                    {isZoneMatch && !searchHighlighted && (
                      <g transform={`translate(${booth.x + booth.width - 24}, ${booth.y + 12})`}>
                        <circle cx="8" cy="8" r="8" fill={themeStyles.hex || '#6366f1'} />
                        <path d="M 8 3 L 9.5 6 L 13 6.5 L 10.5 9 L 11 12.5 L 8 11 L 5 12.5 L 5.5 9 L 3 6.5 L 6.5 6 Z" fill="#ffffff" transform="scale(0.8) translate(2, 2)" />
                      </g>
                    )}

                    {/* Click Indicator on Selected */}
                    {isSelected && (
                      <rect
                        x={booth.x - 2}
                        y={booth.y - 2}
                        width={booth.width + 4}
                        height={booth.height + 4}
                        rx={12}
                        fill="none"
                        stroke="#4f46e5"
                        strokeWidth="2"
                        strokeDasharray="4,2"
                      />
                    )}
                  </g>
                );
              })}
            </g>

            {/* Selected Booth Highlighting Outer Outline */}
            {(() => {
              const selectedBooth = booths.find(b => b.id === selectedBoothId);
              if (!selectedBooth) return null;
              return (
                <rect
                  x={selectedBooth.x - 3}
                  y={selectedBooth.y - 3}
                  width={selectedBooth.width + 6}
                  height={selectedBooth.height + 6}
                  rx={14}
                  fill="none"
                  stroke="#4f46e5"
                  strokeWidth="2.5"
                  strokeDasharray="5,3"
                  className="pointer-events-none animate-pulse"
                />
              );
            })()}
          </svg>
        </div>
      </div>

      {/* Grid Overlay Dynamic Legend Indicator (行動裝置開啟時隱藏地圖圖例面板) */}
      <div className="hidden md:flex bg-white/95 backdrop-blur border-t border-slate-200 p-3 flex-wrap justify-center items-center gap-x-3.5 gap-y-2 text-xs text-slate-600" id="store-map-legend-bar">
        <span className="font-bold text-slate-700 mr-0.5 flex items-center gap-1.5 shrink-0">
          <Layers className="w-3.5 h-3.5 text-indigo-600" />
          <span>地圖圖例:</span>
        </span>
        {legends.filter(l => l.visible).map(legend => {
          const styles = getBoothThemeStyles(legend.color);
          const matchingBooths = booths.filter(b => isBoothMatchingLegend(b, legend));
          const matchingFacs = facilities.filter(f => isFacilityMatchingLegend(f, legend));
          const totalMatching = matchingBooths.length + matchingFacs.length;
          const isActive = activeLegendId === legend.id;

          return (
            <button
              key={legend.id}
              type="button"
              onClick={() => handleToggleLegend(isActive ? null : legend.id)}
              title={`${legend.description || legend.name} (點擊以高亮同區全體 ${totalMatching} 個項目)`}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border transition-all cursor-pointer ${
                isActive 
                  ? 'ring-2 ring-offset-1 ring-indigo-500 shadow-md font-bold scale-105 bg-white' 
                  : totalMatching > 0 
                  ? 'hover:scale-105 hover:shadow-xs hover:border-slate-400' 
                  : 'opacity-70'
              }`}
              style={{
                backgroundColor: isActive ? '#ffffff' : styles.fill,
                borderColor: isActive ? styles.stroke : styles.stroke + '60',
                color: styles.text
              }}
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0 border shadow-2xs"
                style={{
                  backgroundColor: styles.hex,
                  borderColor: styles.stroke
                }}
              />
              <span className="font-bold">{legend.name}</span>
              {totalMatching > 0 && (
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md ${
                  isActive ? 'bg-indigo-600 text-white' : 'bg-white/80 text-slate-600 border border-slate-200'
                }`}>
                  {totalMatching}
                </span>
              )}
              {isActive && (
                <Sparkles className="w-3 h-3 text-indigo-600 shrink-0" />
              )}
            </button>
          );
        })}
        {searchActive && (
          <span className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg border border-indigo-200 animate-pulse font-medium shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
            <span>高亮變色 (搜尋中)</span>
          </span>
        )}
        {/* Quick View Stats */}
        <div className="text-[11px] text-slate-400 font-mono shrink-0 hidden md:flex items-center gap-2">
          <span>{booths.length} 個櫃位</span>
          <span>•</span>
          <span>高度: {isFullscreen ? '全螢幕' : `${mapHeight}px`}</span>
        </div>
      </div>

      {/* Draggable Height Resize Handle Bar (only when not in fullscreen) */}
      {!isFullscreen && onUpdateMapHeight && (
        <div
          onMouseDown={handleHeightResizeStart}
          onTouchStart={handleTouchHeightResizeStart}
          className={`h-3.5 bg-slate-100 hover:bg-indigo-100/90 border-t border-slate-200/80 flex items-center justify-center cursor-row-resize transition group select-none ${
            isResizingHeight ? 'bg-indigo-200' : ''
          }`}
          title="按住並上下拖曳以調整地圖高度"
          id="map-height-drag-handle"
        >
          <div className="flex items-center gap-1.5 text-slate-400 group-hover:text-indigo-600 transition text-[10px] font-mono">
            <span className="w-8 h-1 bg-slate-300 group-hover:bg-indigo-500 rounded-full"></span>
            <span className="hidden group-hover:inline font-bold">↕ 拖曳調整高度 ({mapHeight}px)</span>
          </div>
        </div>
      )}

      {/* Floating Hover Tooltip with Framer Motion */}
      <AnimatePresence>
        {hoveredBooth && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{
              position: 'absolute',
              left: tooltipPos.x,
              top: tooltipPos.y,
              pointerEvents: 'none',
              zIndex: 50
            }}
            className="bg-white/95 backdrop-blur-md border border-slate-200 p-3.5 rounded-2xl shadow-xl max-w-xs text-slate-800"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-mono font-bold bg-slate-50 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                {hoveredBooth.id}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                hoveredBooth.color === 'teal' ? 'bg-teal-50 text-teal-700 border border-teal-200' :
                hoveredBooth.color === 'rose' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                hoveredBooth.color === 'violet' ? 'bg-violet-50 text-violet-700 border border-violet-200' :
                hoveredBooth.color === 'amber' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>
                {hoveredBooth.zone}
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-800 mb-1">{hoveredBooth.name}</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-sans">{hoveredBooth.description}</p>
            <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>點擊櫃位檢視詳細商品清單</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
