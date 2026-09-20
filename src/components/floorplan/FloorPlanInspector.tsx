import React, { useState } from 'react';
import { 
  Store, 
  Compass, 
  Layers, 
  Trash2, 
  Copy, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight, 
  Palette, 
  ShoppingBag, 
  Plus, 
  Info, 
  RotateCcw, 
  Eraser, 
  List, 
  Check, 
  Type, 
  Tag, 
  Scaling
} from 'lucide-react';
import { Booth, Facility, Walkway, Product } from '../../types';
import { ZONE_THEMES, BOOTH_COLOR_OPTIONS } from '../../data';

interface FloorPlanInspectorProps {
  selectedBooth: Booth | null;
  selectedFacility: Facility | null;
  selectedWalkway: Walkway | null;
  products: Product[];
  booths: Booth[];
  facilities: Facility[];
  walkways: Walkway[];
  canvasWidth?: number;
  canvasHeight?: number;
  onOpenCanvasSizeModal?: () => void;
  onUpdateCanvasDimensions?: (newWidth: number, newHeight: number, scaleExisting: boolean) => void;
  showBoothIds?: boolean;
  onToggleShowBoothIds?: (show: boolean) => void;
  onSelectBooth?: (id: string) => void;
  onSelectFacility?: (id: string | null) => void;
  onSelectWalkway?: (id: string | null) => void;
  onUpdateBooth: (id: string, updates: Partial<Booth>, saveToHistory?: boolean) => void;
  onUpdateFacility: (id: string, updates: Partial<Facility>, saveToHistory?: boolean) => void;
  onUpdateWalkway: (id: string, updates: Partial<Walkway>, saveToHistory?: boolean) => void;
  onDeleteBooth: (id: string) => void;
  onDeleteFacility: (id: string) => void;
  onDeleteWalkway: (id: string) => void;
  onDuplicateBooth: (booth: Booth) => void;
  onDuplicateFacility?: (facility: Facility) => void;
  onDuplicateWalkway?: (walkway: Walkway) => void;
  onClearFacilities?: () => void;
  onClearWalkways?: () => void;
  onClearBooths?: () => void;
  onClearAllBackground?: () => void;
  onResetDefaultFacilities?: () => void;
  onResetDefaultWalkways?: () => void;
  onGoToProductsForBooth?: (boothId: string) => void;
  onShowToast: (msg: string) => void;
}

// Subcomponent: Element Typography & Position Controller
function ElementTextInspector({
  fontSize,
  textPosition = 'center',
  textOrientation = 'horizontal',
  textOffsetX = 0,
  textOffsetY = 0,
  fontWeight = 'bold',
  defaultSize = 12,
  onChange,
  onShowToast
}: {
  fontSize?: number;
  textPosition?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  textOrientation?: 'horizontal' | 'vertical';
  textOffsetX?: number;
  textOffsetY?: number;
  fontWeight?: 'normal' | 'medium' | 'bold' | 'black';
  defaultSize: number;
  onChange: (updates: {
    fontSize?: number;
    textPosition?: 'center' | 'top' | 'bottom' | 'left' | 'right';
    textOrientation?: 'horizontal' | 'vertical';
    textOffsetX?: number;
    textOffsetY?: number;
    fontWeight?: 'normal' | 'medium' | 'bold' | 'black';
  }, saveToHistory?: boolean) => void;
  onShowToast: (msg: string) => void;
}) {
  const currentSize = fontSize || defaultSize;
  const currentPos = textPosition || 'center';
  const currentOrientation = textOrientation || 'horizontal';
  const curOffsetX = textOffsetX || 0;
  const curOffsetY = textOffsetY || 0;
  const curWeight = fontWeight || 'bold';

  const handleNudgeOffset = (dx: number, dy: number) => {
    const newX = curOffsetX + dx;
    const newY = curOffsetY + dy;
    onChange({ textOffsetX: newX, textOffsetY: newY }, true);
    onShowToast(`文字位移：X ${newX >= 0 ? `+${newX}` : newX}px, Y ${newY >= 0 ? `+${newY}` : newY}px`);
  };

  const handleResetText = () => {
    onChange({
      fontSize: defaultSize,
      textPosition: 'center',
      textOrientation: 'horizontal',
      textOffsetX: 0,
      textOffsetY: 0,
      fontWeight: 'bold'
    }, true);
    onShowToast('已重設文字樣式與位置為預設值');
  };

  return (
    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-3" id="element-text-typography-inspector">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
          <Type className="w-3.5 h-3.5 text-indigo-600" />
          <span>文字排列與微調 (Typography)</span>
        </span>
        <button
          onClick={handleResetText}
          className="text-[10px] text-slate-500 hover:text-indigo-600 flex items-center gap-0.5 hover:underline font-medium"
          title="重設文字大小與位置"
        >
          <RotateCcw className="w-2.5 h-2.5" />
          <span>重設文字</span>
        </button>
      </div>

      {/* Text Orientation Selector: Horizontal (Parallel) vs Vertical (Perpendicular) */}
      <div className="space-y-1.5">
        <span className="block text-[10px] font-bold text-slate-500">文字方向 (Orientation)</span>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => {
              onChange({ textOrientation: 'horizontal' }, true);
              onShowToast('已設定為【平行 / 橫向排列 ↔】');
            }}
            className={`py-1.5 px-2 text-center rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              currentOrientation === 'horizontal'
                ? 'bg-indigo-600 text-white shadow-xs ring-1 ring-indigo-500'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span>↔ 平行 (橫向)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onChange({ textOrientation: 'vertical' }, true);
              onShowToast('已設定為【垂直 / 直向排列 ↕】');
            }}
            className={`py-1.5 px-2 text-center rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              currentOrientation === 'vertical'
                ? 'bg-indigo-600 text-white shadow-xs ring-1 ring-indigo-500'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span>↕ 垂直 (直向)</span>
          </button>
        </div>
      </div>

      {/* Font size control with slider & steppers */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
          <span>字級大小 (Font Size)</span>
          <span className="font-mono text-indigo-600 bg-white px-2 py-0.5 rounded-md border border-slate-200 text-[11px] font-bold">
            {currentSize} px
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onChange({ fontSize: Math.max(8, currentSize - 1) }, true)}
            className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 active:scale-95 transition"
            title="減小字級 (-1px)"
          >
            A-
          </button>
          <input
            type="range"
            min="8"
            max="26"
            step="1"
            value={currentSize}
            onChange={e => onChange({ fontSize: Number(e.target.value) })}
            onMouseUp={() => onChange({ fontSize: currentSize }, true)}
            className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <button
            onClick={() => onChange({ fontSize: Math.min(30, currentSize + 1) }, true)}
            className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 active:scale-95 transition"
            title="加大字級 (+1px)"
          >
            A+
          </button>
        </div>

        {/* Quick size preset chips */}
        <div className="grid grid-cols-5 gap-1 pt-1">
          {[
            { label: '特小', size: 9 },
            { label: '小', size: 11 },
            { label: '標準', size: 13 },
            { label: '較大', size: 16 },
            { label: '醒目', size: 20 }
          ].map(item => (
            <button
              key={item.size}
              onClick={() => {
                onChange({ fontSize: item.size }, true);
                onShowToast(`已設定字級為 ${item.size}px`);
              }}
              className={`py-1 text-center rounded-lg text-[10px] font-medium transition ${
                currentSize === item.size
                  ? 'bg-indigo-600 text-white font-bold shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {item.size}px
            </button>
          ))}
        </div>
      </div>

      {/* Position 5-way alignment */}
      <div className="space-y-1.5">
        <span className="block text-[10px] font-bold text-slate-500">元件內文字對齊方位 (Position)</span>
        <div className="grid grid-cols-5 gap-1">
          {[
            { key: 'center' as const, label: '居中' },
            { key: 'top' as const, label: '靠頂' },
            { key: 'bottom' as const, label: '靠底' },
            { key: 'left' as const, label: '靠左' },
            { key: 'right' as const, label: '靠右' }
          ].map(pos => (
            <button
              key={pos.key}
              onClick={() => {
                onChange({ textPosition: pos.key }, true);
                onShowToast(`文字已對齊：${pos.label}`);
              }}
              className={`py-1 text-center rounded-lg text-[11px] font-medium transition ${
                currentPos === pos.key
                  ? 'bg-indigo-600 text-white font-bold shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {pos.label}
            </button>
          ))}
        </div>
      </div>

      {/* Font Weight */}
      <div className="space-y-1.5">
        <span className="block text-[10px] font-bold text-slate-500">文字字重 (Font Weight)</span>
        <div className="grid grid-cols-4 gap-1">
          {[
            { key: 'normal' as const, label: '一般' },
            { key: 'medium' as const, label: '中等' },
            { key: 'bold' as const, label: '粗體' },
            { key: 'black' as const, label: '特粗' }
          ].map(wt => (
            <button
              key={wt.key}
              onClick={() => {
                onChange({ fontWeight: wt.key }, true);
                onShowToast(`字重設定：${wt.label}`);
              }}
              className={`py-1 text-center rounded-lg text-[10px] transition ${
                curWeight === wt.key
                  ? 'bg-indigo-600 text-white font-bold shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {wt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Micro Offset Nudge Controls */}
      <div className="space-y-1.5 pt-1.5 border-t border-slate-200/60">
        <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
          <span>文字像素微調偏移 (XY Offset)</span>
          <span className="font-mono text-[10px] text-indigo-600 bg-white px-1.5 py-0.2 rounded border border-slate-200 font-bold">
            X: {curOffsetX >= 0 ? `+${curOffsetX}` : curOffsetX}px, Y: {curOffsetY >= 0 ? `+${curOffsetY}` : curOffsetY}px
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 pt-0.5">
          {/* 4 directions nudge */}
          <div className="grid grid-cols-3 gap-1 w-28 mx-auto">
            <div></div>
            <button onClick={() => handleNudgeOffset(0, -3)} className="p-1 bg-white hover:bg-indigo-50 border border-slate-200 rounded-md flex justify-center text-slate-700 active:bg-indigo-100" title="向上微調 3px"><ArrowUp className="w-3 h-3" /></button>
            <div></div>
            <button onClick={() => handleNudgeOffset(-3, 0)} className="p-1 bg-white hover:bg-indigo-50 border border-slate-200 rounded-md flex justify-center text-slate-700 active:bg-indigo-100" title="向左微調 3px"><ArrowLeft className="w-3 h-3" /></button>
            <div className="flex items-center justify-center text-[8px] font-mono text-slate-400 font-bold">文字</div>
            <button onClick={() => handleNudgeOffset(3, 0)} className="p-1 bg-white hover:bg-indigo-50 border border-slate-200 rounded-md flex justify-center text-slate-700 active:bg-indigo-100" title="向右微調 3px"><ArrowRight className="w-3 h-3" /></button>
            <div></div>
            <button onClick={() => handleNudgeOffset(0, 3)} className="p-1 bg-white hover:bg-indigo-50 border border-slate-200 rounded-md flex justify-center text-slate-700 active:bg-indigo-100" title="向下微調 3px"><ArrowDown className="w-3 h-3" /></button>
            <div></div>
          </div>

          {/* Quick zero out button & direct inputs */}
          <div className="flex flex-col gap-1 text-[10px]">
            <button
              onClick={() => {
                onChange({ textOffsetX: 0, textOffsetY: 0 }, true);
                onShowToast('已歸零文字位移');
              }}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg font-medium text-slate-600 text-center"
            >
              歸零位移
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FloorPlanInspector({
  selectedBooth,
  selectedFacility,
  selectedWalkway,
  products,
  booths,
  facilities,
  walkways,
  canvasWidth = 1000,
  canvasHeight = 500,
  onOpenCanvasSizeModal,
  onUpdateCanvasDimensions,
  showBoothIds = true,
  onToggleShowBoothIds,
  onSelectBooth,
  onSelectFacility,
  onSelectWalkway,
  onUpdateBooth,
  onUpdateFacility,
  onUpdateWalkway,
  onDeleteBooth,
  onDeleteFacility,
  onDeleteWalkway,
  onDuplicateBooth,
  onDuplicateFacility,
  onDuplicateWalkway,
  onClearFacilities,
  onClearWalkways,
  onClearBooths,
  onClearAllBackground,
  onResetDefaultFacilities,
  onResetDefaultWalkways,
  onGoToProductsForBooth,
  onShowToast
}: FloorPlanInspectorProps) {

  // Overview sub-tab inside empty inspector: 'facilities' | 'walkways' | 'booths' | 'canvas'
  const [overviewTab, setOverviewTab] = useState<'facilities' | 'walkways' | 'booths' | 'canvas'>('facilities');

  // Booth aspect ratio presets
  const handleApplyPresetSize = (w: number, h: number) => {
    if (!selectedBooth) return;
    const clampedW = Math.min((canvasWidth || 1000) - 25 - selectedBooth.x, w);
    const clampedH = Math.min((canvasHeight || 500) - 25 - selectedBooth.y, h);
    onUpdateBooth(selectedBooth.id, { width: clampedW, height: clampedH }, true);
    onShowToast(`已套用尺寸：${clampedW} × ${clampedH} px`);
  };

  // Alignments
  const handleAlign = (type: 'left' | 'right' | 'top' | 'bottom' | 'center-h' | 'center-v') => {
    const cw = canvasWidth || 1000;
    const ch = canvasHeight || 500;
    if (selectedBooth) {
      let { x, y, width, height } = selectedBooth;
      switch (type) {
        case 'left': x = 40; break;
        case 'right': x = cw - 40 - width; break;
        case 'top': y = 40; break;
        case 'bottom': y = ch - 40 - height; break;
        case 'center-h': x = Math.round((cw - width) / 2); break;
        case 'center-v': y = Math.round((ch - height) / 2); break;
      }
      onUpdateBooth(selectedBooth.id, { x, y }, true);
    } else if (selectedFacility) {
      let { x, y, width, height } = selectedFacility;
      switch (type) {
        case 'left': x = 40; break;
        case 'right': x = cw - 40 - width; break;
        case 'top': y = 40; break;
        case 'bottom': y = ch - 40 - height; break;
        case 'center-h': x = Math.round((cw - width) / 2); break;
        case 'center-v': y = Math.round((ch - height) / 2); break;
      }
      onUpdateFacility(selectedFacility.id, { x, y }, true);
    } else if (selectedWalkway) {
      let { x, y, width, height } = selectedWalkway;
      switch (type) {
        case 'left': x = 20; break;
        case 'right': x = cw - 20 - width; break;
        case 'top': y = 20; break;
        case 'bottom': y = ch - 20 - height; break;
        case 'center-h': x = Math.round((cw - width) / 2); break;
        case 'center-v': y = Math.round((ch - height) / 2); break;
      }
      onUpdateWalkway(selectedWalkway.id, { x, y }, true);
    }
  };

  // Nudge (unrestricted positioning)
  const handleNudge = (dx: number, dy: number) => {
    if (selectedBooth) {
      const newX = Math.round(selectedBooth.x + dx);
      const newY = Math.round(selectedBooth.y + dy);
      onUpdateBooth(selectedBooth.id, { x: newX, y: newY }, true);
    } else if (selectedFacility) {
      const newX = Math.round(selectedFacility.x + dx);
      const newY = Math.round(selectedFacility.y + dy);
      onUpdateFacility(selectedFacility.id, { x: newX, y: newY }, true);
    } else if (selectedWalkway) {
      const newX = Math.round(selectedWalkway.x + dx);
      const newY = Math.round(selectedWalkway.y + dy);
      onUpdateWalkway(selectedWalkway.id, { x: newX, y: newY }, true);
    }
  };

  // Products in booth
  const boothProducts = selectedBooth ? products.filter(p => p.boothId === selectedBooth.id) : [];

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-5 overflow-y-auto max-h-[calc(100vh-140px)] lg:max-h-[820px] custom-scrollbar scrollbar-thin scroll-smooth" id="floor-plan-inspector-panel">
      
      {/* 1. BOOTH SELECTED INSPECTOR */}
      {selectedBooth && (
        <div className="space-y-4" id="booth-inspector-content">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-indigo-600 text-white rounded-xl shadow-xs">
                <Store className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-sm font-bold text-slate-900 font-sans">
                  專櫃屬性設定 ({selectedBooth.id})
                </h4>
                <p className="text-[11px] text-slate-500 font-sans">
                  調整專櫃名稱、分區、精確坐標與長寬
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => onDuplicateBooth(selectedBooth)}
                className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition"
                title="複製專櫃"
                id="btn-duplicate-booth"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDeleteBooth(selectedBooth.id)}
                className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition"
                title="刪除專櫃"
                id="btn-delete-booth"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">專櫃名稱</label>
              <input
                type="text"
                value={selectedBooth.name}
                onChange={e => onUpdateBooth(selectedBooth.id, { name: e.target.value })}
                className="w-full px-3 py-1.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">所屬分區</label>
                <select
                  value={selectedBooth.zone}
                  onChange={e => {
                    const newZone = e.target.value;
                    const theme = ZONE_THEMES[newZone];
                    onUpdateBooth(selectedBooth.id, {
                      zone: newZone,
                      color: theme?.accent || selectedBooth.color
                    }, true);
                  }}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium"
                >
                  {Object.keys(ZONE_THEMES).map(zoneKey => (
                    <option key={zoneKey} value={zoneKey}>{zoneKey}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">專櫃色系 ({BOOTH_COLOR_OPTIONS.length}色)</label>
                <select
                  value={selectedBooth.color}
                  onChange={e => onUpdateBooth(selectedBooth.id, { color: e.target.value }, true)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium"
                >
                  {Array.from(new Set(BOOTH_COLOR_OPTIONS.map(o => o.category))).map(cat => (
                    <optgroup key={cat} label={`── ${cat} ──`}>
                      {BOOTH_COLOR_OPTIONS.filter(o => o.category === cat).map(opt => (
                        <option key={opt.key} value={opt.key}>
                          {opt.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Color Swatches Palette */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1.5 flex items-center justify-between">
                <span>快速選色盤</span>
                <span className="font-mono text-[9px] text-slate-500">
                  當前: {BOOTH_COLOR_OPTIONS.find(o => o.key === selectedBooth.color)?.name || selectedBooth.color}
                </span>
              </label>
              <div className="grid grid-cols-10 gap-1 p-2 bg-slate-50 border border-slate-200 rounded-xl">
                {BOOTH_COLOR_OPTIONS.map(opt => {
                  const isCur = selectedBooth.color === opt.key;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => onUpdateBooth(selectedBooth.id, { color: opt.key }, true)}
                      title={opt.name}
                      style={{ backgroundColor: opt.hex }}
                      className={`w-5 h-5 rounded-md transition-all flex items-center justify-center shadow-xs ${
                        isCur ? 'ring-2 ring-indigo-600 ring-offset-1 scale-110 z-10' : 'hover:scale-115 opacity-90 hover:opacity-100'
                      }`}
                    >
                      {isCur && <Check className="w-3 h-3 text-white drop-shadow-xs" strokeWidth={3} />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">專櫃介紹簡述</label>
              <textarea
                rows={2}
                value={selectedBooth.description}
                onChange={e => onUpdateBooth(selectedBooth.id, { description: e.target.value })}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            {/* Coordinates & Dimensions */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-2">
              <div className="text-[11px] font-bold text-slate-700 flex justify-between items-center">
                <span>位置與大小 (Geometry)</span>
                <span className="text-slate-400 font-mono text-[10px]">畫布基準: {canvasWidth} × {canvasHeight}px</span>
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                <div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono mb-0.5">
                    <span>X:</span>
                    <span className="text-[9px] text-slate-400">~{canvasWidth - selectedBooth.width}</span>
                  </div>
                  <input
                    type="number"
                    min={0}
                    max={canvasWidth - 10}
                    value={selectedBooth.x}
                    onChange={e => {
                      const val = Number(e.target.value);
                      const maxVal = Math.max(0, canvasWidth - 10);
                      onUpdateBooth(selectedBooth.id, { x: Math.max(0, Math.min(maxVal, val)) });
                    }}
                    className="w-full px-2 py-1 text-xs font-mono bg-white border border-slate-200 rounded-lg text-center focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono mb-0.5">
                    <span>Y:</span>
                    <span className="text-[9px] text-slate-400">~{canvasHeight - selectedBooth.height}</span>
                  </div>
                  <input
                    type="number"
                    min={0}
                    max={canvasHeight - 10}
                    value={selectedBooth.y}
                    onChange={e => {
                      const val = Number(e.target.value);
                      const maxVal = Math.max(0, canvasHeight - 10);
                      onUpdateBooth(selectedBooth.id, { y: Math.max(0, Math.min(maxVal, val)) });
                    }}
                    className="w-full px-2 py-1 text-xs font-mono bg-white border border-slate-200 rounded-lg text-center focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono mb-0.5">
                    <span>W:</span>
                    <span className="text-[9px] text-slate-400">~{canvasWidth - selectedBooth.x}</span>
                  </div>
                  <input
                    type="number"
                    min={25}
                    max={canvasWidth - selectedBooth.x}
                    value={selectedBooth.width}
                    onChange={e => {
                      const val = Number(e.target.value);
                      const maxVal = Math.max(25, canvasWidth - selectedBooth.x);
                      onUpdateBooth(selectedBooth.id, { width: Math.max(25, Math.min(maxVal, val)) });
                    }}
                    className="w-full px-2 py-1 text-xs font-mono bg-white border border-slate-200 rounded-lg text-center focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono mb-0.5">
                    <span>H:</span>
                    <span className="text-[9px] text-slate-400">~{canvasHeight - selectedBooth.y}</span>
                  </div>
                  <input
                    type="number"
                    min={20}
                    max={canvasHeight - selectedBooth.y}
                    value={selectedBooth.height}
                    onChange={e => {
                      const val = Number(e.target.value);
                      const maxVal = Math.max(20, canvasHeight - selectedBooth.y);
                      onUpdateBooth(selectedBooth.id, { height: Math.max(20, Math.min(maxVal, val)) });
                    }}
                    className="w-full px-2 py-1 text-xs font-mono bg-white border border-slate-200 rounded-lg text-center focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Booth ID Badge Visibility Setting */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-indigo-600" />
                  <span>專櫃代號徽章 ({selectedBooth.id})</span>
                </div>
                <div className="text-[10px] text-slate-500">
                  {showBoothIds ? '平面圖：顯示專櫃代號' : '平面圖：隱藏代號，僅顯示名稱'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const next = !showBoothIds;
                  if (onToggleShowBoothIds) {
                    onToggleShowBoothIds(next);
                  }
                  onShowToast(`平面圖專櫃代號已設為「${next ? '顯示' : '隱藏'}」並同步至前台`);
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition ${
                  showBoothIds
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100'
                }`}
                title="開關平面圖上的專櫃代號徽章"
              >
                {showBoothIds ? '✓ 顯示中' : '✕ 已隱藏'}
              </button>
            </div>

            {/* Text Typography & Position Adjustment */}
            <ElementTextInspector
              fontSize={selectedBooth.fontSize}
              textPosition={selectedBooth.textPosition}
              textOrientation={selectedBooth.textOrientation}
              textOffsetX={selectedBooth.textOffsetX}
              textOffsetY={selectedBooth.textOffsetY}
              fontWeight={selectedBooth.fontWeight}
              defaultSize={12}
              onChange={(updates, saveHistory) => onUpdateBooth(selectedBooth.id, updates, saveHistory)}
              onShowToast={onShowToast}
            />

            {/* Quick Size Presets */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5">快速尺寸規格預設</label>
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                <button
                  onClick={() => handleApplyPresetSize(150, 100)}
                  className="px-2 py-1 bg-slate-50 hover:bg-indigo-50 border border-slate-200 rounded-lg font-mono text-[11px] text-slate-700"
                >
                  150 × 100
                </button>
                <button
                  onClick={() => handleApplyPresetSize(140, 110)}
                  className="px-2 py-1 bg-slate-50 hover:bg-indigo-50 border border-slate-200 rounded-lg font-mono text-[11px] text-slate-700"
                >
                  140 × 110
                </button>
                <button
                  onClick={() => handleApplyPresetSize(200, 120)}
                  className="px-2 py-1 bg-slate-50 hover:bg-indigo-50 border border-slate-200 rounded-lg font-mono text-[11px] text-slate-700"
                >
                  200 × 120
                </button>
              </div>
            </div>

            {/* Micro Nudge & Fast Alignment */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100 flex flex-col items-center">
                <span className="text-[10px] font-bold text-slate-500 mb-1.5">5px 鍵位微調</span>
                <div className="grid grid-cols-3 gap-1 w-24">
                  <div></div>
                  <button onClick={() => handleNudge(0, -5)} className="p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded flex justify-center"><ArrowUp className="w-3 h-3" /></button>
                  <div></div>
                  <button onClick={() => handleNudge(-5, 0)} className="p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded flex justify-center"><ArrowLeft className="w-3 h-3" /></button>
                  <div className="flex items-center justify-center text-[9px] font-mono text-slate-400">5px</div>
                  <button onClick={() => handleNudge(5, 0)} className="p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded flex justify-center"><ArrowRight className="w-3 h-3" /></button>
                  <div></div>
                  <button onClick={() => handleNudge(0, 5)} className="p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded flex justify-center"><ArrowDown className="w-3 h-3" /></button>
                  <div></div>
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100 flex flex-col">
                <span className="text-[10px] font-bold text-slate-500 mb-1.5">快速邊界對齊</span>
                <div className="grid grid-cols-2 gap-1 text-[10px]">
                  <button onClick={() => handleAlign('left')} className="p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded text-center">靠左</button>
                  <button onClick={() => handleAlign('right')} className="p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded text-center">靠右</button>
                  <button onClick={() => handleAlign('top')} className="p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded text-center">靠頂</button>
                  <button onClick={() => handleAlign('bottom')} className="p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded text-center">靠底</button>
                </div>
                <button onClick={() => handleAlign('center-h')} className="mt-1 p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded text-[10px] text-center w-full">水平置中</button>
              </div>
            </div>

            {/* Products in this booth */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                  <ShoppingBag className="w-3.5 h-3.5 text-indigo-600" />
                  <span>專櫃關聯商品 ({boothProducts.length})</span>
                </span>
                {onGoToProductsForBooth && (
                  <button
                    onClick={() => onGoToProductsForBooth(selectedBooth.id)}
                    className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-0.5"
                  >
                    <Plus className="w-3 h-3" />
                    <span>上架商品</span>
                  </button>
                )}
              </div>

              {boothProducts.length > 0 ? (
                <div className="max-h-28 overflow-y-auto space-y-1 scrollbar-thin">
                  {boothProducts.map(p => (
                    <div key={p.id} className="p-1.5 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center text-xs">
                      <span className="font-medium text-slate-800 truncate">{p.name}</span>
                      <span className="font-mono text-slate-500 text-[11px]">NT${p.price?.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-[11px] text-slate-400 bg-slate-50 p-2 rounded-xl text-center">
                  目前尚未在此專櫃上架商品
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* 2. FACILITY SELECTED INSPECTOR (Including 哺乳室/哺育室, 洗手間, 服務台, etc.) */}
      {selectedFacility && !selectedBooth && (
        <div className="space-y-4" id="facility-inspector-content">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-blue-600 text-white rounded-xl shadow-xs">
                <Compass className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-sm font-bold text-slate-900 font-sans">
                  公共設施屬性編輯
                </h4>
                <p className="text-[11px] text-slate-500 font-sans">
                  {selectedFacility.type === 'nursery' ? '🍼 哺乳育嬰室設定與備註' : selectedFacility.type === 'pillar' ? '🏛️ 柱子結構與位置設定' : selectedFacility.type === 'office' ? '💼 辦公區空間與說明設定' : '設施名稱、類型標記、精確座標與長寬'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  if (onDuplicateFacility) {
                    onDuplicateFacility(selectedFacility);
                  } else {
                    const newId = `fac_${Date.now().toString().slice(-4)}`;
                    const duplicate: Facility = {
                      ...selectedFacility,
                      id: newId,
                      name: `${selectedFacility.name} (複製)`,
                      x: Math.min(Math.max(10, canvasWidth - selectedFacility.width - 10), selectedFacility.x + 20),
                      y: Math.min(Math.max(10, canvasHeight - selectedFacility.height - 10), selectedFacility.y + 20)
                    };
                    onUpdateFacility(newId, duplicate, true);
                    onShowToast(`已複製設施「${duplicate.name}」`);
                  }
                }}
                className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition"
                title="複製設施元件"
                id="btn-duplicate-facility"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDeleteFacility(selectedFacility.id)}
                className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition"
                title="刪除設施"
                id="btn-delete-facility"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">設施名稱 (地圖標籤文字)</label>
              <input
                type="text"
                value={selectedFacility.name}
                onChange={e => onUpdateFacility(selectedFacility.id, { name: e.target.value })}
                className="w-full px-3 py-1.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">設施類型</label>
                <select
                  value={selectedFacility.type}
                  onChange={e => onUpdateFacility(selectedFacility.id, { type: e.target.value as any }, true)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="nursery">🍼 哺育室 / 哺乳室 (Nursery)</option>
                  <option value="restroom">🚻 洗手間 (Restroom)</option>
                  <option value="entrance">🚪 主入口 (Entrance)</option>
                  <option value="info">ℹ 服務台 (Info Desk)</option>
                  <option value="escalator">🪜 手扶梯 (Escalator)</option>
                  <option value="elevator">🛗 電梯 (Elevator)</option>
                  <option value="cafe">☕ 咖啡座 (Cafe)</option>
                  <option value="atm">🏧 提款機 (ATM)</option>
                  <option value="exit">🚨 逃生門 (Exit)</option>
                  <option value="pillar">🏛️ 柱子 (Pillar)</option>
                  <option value="office">💼 辦公區 (Office Area)</option>
                  <option value="custom">✨ 自訂設施 (Custom)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">外觀色系</label>
                <select
                  value={selectedFacility.color || 'pink'}
                  onChange={e => onUpdateFacility(selectedFacility.id, { color: e.target.value }, true)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="pink">粉紅色 (Pink / 哺乳育嬰)</option>
                  <option value="rose">玫瑰紅 (Rose)</option>
                  <option value="emerald">翡翠綠 (Emerald / 入口提款)</option>
                  <option value="teal">水鴨青 (Teal / 辦公區)</option>
                  <option value="blue">海藍色 (Blue / 服務台)</option>
                  <option value="indigo">靛藍色 (Indigo / 電梯)</option>
                  <option value="slate">金屬灰 (Slate / 柱子洗手間)</option>
                  <option value="amber">暖橘色 (Amber / 咖啡座)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">說明備註 (顧客點選時顯示)</label>
              <input
                type="text"
                value={selectedFacility.description || ''}
                onChange={e => onUpdateFacility(selectedFacility.id, { description: e.target.value })}
                placeholder="例如：配備溫水飲水機、尿布更換台與獨立隔間..."
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            {/* Coordinates */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-2">
              <div className="text-[11px] font-bold text-slate-700 flex justify-between items-center">
                <span>設施位置與長寬 (Geometry)</span>
                <span className="text-slate-400 font-mono text-[10px]">畫布基準: {canvasWidth} × {canvasHeight}px</span>
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                <div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono mb-0.5">
                    <span>X:</span>
                    <span className="text-[9px] text-slate-400">~{canvasWidth - selectedFacility.width}</span>
                  </div>
                  <input
                    type="number"
                    min={0}
                    max={canvasWidth - 10}
                    value={selectedFacility.x}
                    onChange={e => {
                      const val = Number(e.target.value);
                      const maxVal = Math.max(0, canvasWidth - 10);
                      onUpdateFacility(selectedFacility.id, { x: Math.max(0, Math.min(maxVal, val)) });
                    }}
                    className="w-full px-2 py-1 text-xs font-mono bg-white border border-slate-200 rounded-lg text-center focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono mb-0.5">
                    <span>Y:</span>
                    <span className="text-[9px] text-slate-400">~{canvasHeight - selectedFacility.height}</span>
                  </div>
                  <input
                    type="number"
                    min={0}
                    max={canvasHeight - 10}
                    value={selectedFacility.y}
                    onChange={e => {
                      const val = Number(e.target.value);
                      const maxVal = Math.max(0, canvasHeight - 10);
                      onUpdateFacility(selectedFacility.id, { y: Math.max(0, Math.min(maxVal, val)) });
                    }}
                    className="w-full px-2 py-1 text-xs font-mono bg-white border border-slate-200 rounded-lg text-center focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono mb-0.5">
                    <span>W:</span>
                    <span className="text-[9px] text-slate-400">~{canvasWidth - selectedFacility.x}</span>
                  </div>
                  <input
                    type="number"
                    min={15}
                    max={canvasWidth - selectedFacility.x}
                    value={selectedFacility.width}
                    onChange={e => {
                      const val = Number(e.target.value);
                      const maxVal = Math.max(15, canvasWidth - selectedFacility.x);
                      onUpdateFacility(selectedFacility.id, { width: Math.max(15, Math.min(maxVal, val)) });
                    }}
                    className="w-full px-2 py-1 text-xs font-mono bg-white border border-slate-200 rounded-lg text-center focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono mb-0.5">
                    <span>H:</span>
                    <span className="text-[9px] text-slate-400">~{canvasHeight - selectedFacility.y}</span>
                  </div>
                  <input
                    type="number"
                    min={15}
                    max={canvasHeight - selectedFacility.y}
                    value={selectedFacility.height}
                    onChange={e => {
                      const val = Number(e.target.value);
                      const maxVal = Math.max(15, canvasHeight - selectedFacility.y);
                      onUpdateFacility(selectedFacility.id, { height: Math.max(15, Math.min(maxVal, val)) });
                    }}
                    className="w-full px-2 py-1 text-xs font-mono bg-white border border-slate-200 rounded-lg text-center focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Text Typography & Position Adjustment */}
            <ElementTextInspector
              fontSize={selectedFacility.fontSize}
              textPosition={selectedFacility.textPosition}
              textOrientation={selectedFacility.textOrientation}
              textOffsetX={selectedFacility.textOffsetX}
              textOffsetY={selectedFacility.textOffsetY}
              fontWeight={selectedFacility.fontWeight}
              defaultSize={11}
              onChange={(updates, saveHistory) => onUpdateFacility(selectedFacility.id, updates, saveHistory)}
              onShowToast={onShowToast}
            />

            {/* Quick Size Presets for facilities */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5">常用設施尺寸規格</label>
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                <button
                  onClick={() => {
                    onUpdateFacility(selectedFacility.id, { width: 80, height: 40 }, true);
                    onShowToast('已套用尺寸：80 × 40 px');
                  }}
                  className="px-2 py-1 bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-lg font-mono text-[11px] text-slate-700"
                >
                  80 × 40 (哺乳/洗手)
                </button>
                <button
                  onClick={() => {
                    onUpdateFacility(selectedFacility.id, { width: 80, height: 80 }, true);
                    onShowToast('已套用尺寸：80 × 80 px');
                  }}
                  className="px-2 py-1 bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-lg font-mono text-[11px] text-slate-700"
                >
                  80 × 80 (圓形服務台)
                </button>
                <button
                  onClick={() => {
                    onUpdateFacility(selectedFacility.id, { width: 140, height: 60 }, true);
                    onShowToast('已套用尺寸：140 × 60 px');
                  }}
                  className="px-2 py-1 bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-lg font-mono text-[11px] text-slate-700"
                >
                  140 × 60 (咖啡/休閒)
                </button>
              </div>
            </div>

            {/* Micro Nudge & Fast Alignment for Facilities */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100 flex flex-col items-center">
                <span className="text-[10px] font-bold text-slate-500 mb-1.5">5px 微調設施</span>
                <div className="grid grid-cols-3 gap-1 w-24">
                  <div></div>
                  <button onClick={() => handleNudge(0, -5)} className="p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded flex justify-center"><ArrowUp className="w-3 h-3" /></button>
                  <div></div>
                  <button onClick={() => handleNudge(-5, 0)} className="p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded flex justify-center"><ArrowLeft className="w-3 h-3" /></button>
                  <div className="flex items-center justify-center text-[9px] font-mono text-slate-400">5px</div>
                  <button onClick={() => handleNudge(5, 0)} className="p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded flex justify-center"><ArrowRight className="w-3 h-3" /></button>
                  <div></div>
                  <button onClick={() => handleNudge(0, 5)} className="p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded flex justify-center"><ArrowDown className="w-3 h-3" /></button>
                  <div></div>
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100 flex flex-col">
                <span className="text-[10px] font-bold text-slate-500 mb-1.5">邊界快速對齊</span>
                <div className="grid grid-cols-2 gap-1 text-[10px]">
                  <button onClick={() => handleAlign('left')} className="p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded text-center">靠左牆</button>
                  <button onClick={() => handleAlign('right')} className="p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded text-center">靠右牆</button>
                  <button onClick={() => handleAlign('top')} className="p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded text-center">靠頂牆</button>
                  <button onClick={() => handleAlign('bottom')} className="p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded text-center">靠底牆</button>
                </div>
                <button onClick={() => handleAlign('center-h')} className="mt-1 p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded text-[10px] text-center w-full">水平置中</button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 3. WALKWAY / STREET SELECTED INSPECTOR */}
      {selectedWalkway && !selectedBooth && !selectedFacility && (
        <div className="space-y-4" id="walkway-inspector-content">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-emerald-600 text-white rounded-xl shadow-xs">
                <Layers className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-sm font-bold text-slate-900 font-sans">
                  動線與街道走道編輯
                </h4>
                <p className="text-[11px] text-slate-500 font-sans">
                  街道名稱、動線類型、長寬尺寸與底色配置
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  if (onDuplicateWalkway) {
                    onDuplicateWalkway(selectedWalkway);
                  } else {
                    const newId = `walk_${Date.now().toString().slice(-4)}`;
                    const duplicate: Walkway = {
                      ...selectedWalkway,
                      id: newId,
                      name: `${selectedWalkway.name} (複製)`,
                      x: Math.min(Math.max(20, canvasWidth - selectedWalkway.width - 20), selectedWalkway.x + 20),
                      y: Math.min(Math.max(20, canvasHeight - selectedWalkway.height - 20), selectedWalkway.y + 20)
                    };
                    onUpdateWalkway(newId, duplicate, true);
                    onShowToast(`已複製街道「${duplicate.name}」`);
                  }
                }}
                className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition"
                title="複製街道走道"
                id="btn-duplicate-walkway"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDeleteWalkway(selectedWalkway.id)}
                className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition"
                title="刪除此街道"
                id="btn-delete-walkway"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">街道 / 走道名稱</label>
              <input
                type="text"
                value={selectedWalkway.name}
                onChange={e => onUpdateWalkway(selectedWalkway.id, { name: e.target.value })}
                className="w-full px-3 py-1.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">通道街道類型</label>
                <select
                  value={selectedWalkway.type || 'primary'}
                  onChange={e => onUpdateWalkway(selectedWalkway.id, { type: e.target.value as any }, true)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium"
                >
                  <option value="primary">主要橫貫/縱向幹道 (Primary)</option>
                  <option value="secondary">專櫃側邊逛街通道 (Secondary)</option>
                  <option value="entrance">迎賓玄關大門街道 (Entrance)</option>
                  <option value="custom">自訂方型街道區塊 (Custom)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">通道底色</label>
                <select
                  value={selectedWalkway.color || '#f1f5f9'}
                  onChange={e => onUpdateWalkway(selectedWalkway.id, { color: e.target.value }, true)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono"
                >
                  <option value="#f1f5f9">淺灰 (#f1f5f9)</option>
                  <option value="#e2e8f0">中灰 (#e2e8f0)</option>
                  <option value="#f8fafc">極淺灰 (#f8fafc)</option>
                  <option value="#ecfdf5">淡綠 (#ecfdf5)</option>
                  <option value="#eff6ff">淡藍 (#eff6ff)</option>
                  <option value="#fef3c7">淡暖黃 (#fef3c7)</option>
                </select>
              </div>
            </div>

            {/* Coordinates */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-2">
              <div className="text-[11px] font-bold text-slate-700 flex justify-between items-center">
                <span>街道範圍 (X, Y / W, H)</span>
                <span className="text-slate-400 font-mono text-[10px]">畫布基準: {canvasWidth} × {canvasHeight}px</span>
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                <div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono mb-0.5">
                    <span>X:</span>
                    <span className="text-[9px] text-slate-400">~{canvasWidth - selectedWalkway.width}</span>
                  </div>
                  <input
                    type="number"
                    min={0}
                    max={canvasWidth - 10}
                    value={selectedWalkway.x}
                    onChange={e => {
                      const val = Number(e.target.value);
                      const maxVal = Math.max(0, canvasWidth - 10);
                      onUpdateWalkway(selectedWalkway.id, { x: Math.max(0, Math.min(maxVal, val)) });
                    }}
                    className="w-full px-2 py-1 text-xs font-mono bg-white border border-slate-200 rounded-lg text-center focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono mb-0.5">
                    <span>Y:</span>
                    <span className="text-[9px] text-slate-400">~{canvasHeight - selectedWalkway.height}</span>
                  </div>
                  <input
                    type="number"
                    min={0}
                    max={canvasHeight - 10}
                    value={selectedWalkway.y}
                    onChange={e => {
                      const val = Number(e.target.value);
                      const maxVal = Math.max(0, canvasHeight - 10);
                      onUpdateWalkway(selectedWalkway.id, { y: Math.max(0, Math.min(maxVal, val)) });
                    }}
                    className="w-full px-2 py-1 text-xs font-mono bg-white border border-slate-200 rounded-lg text-center focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono mb-0.5">
                    <span>W:</span>
                    <span className="text-[9px] text-slate-400">~{canvasWidth - selectedWalkway.x}</span>
                  </div>
                  <input
                    type="number"
                    min={10}
                    max={canvasWidth - selectedWalkway.x}
                    value={selectedWalkway.width}
                    onChange={e => {
                      const val = Number(e.target.value);
                      const maxVal = Math.max(10, canvasWidth - selectedWalkway.x);
                      onUpdateWalkway(selectedWalkway.id, { width: Math.max(10, Math.min(maxVal, val)) });
                    }}
                    className="w-full px-2 py-1 text-xs font-mono bg-white border border-slate-200 rounded-lg text-center focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono mb-0.5">
                    <span>H:</span>
                    <span className="text-[9px] text-slate-400">~{canvasHeight - selectedWalkway.y}</span>
                  </div>
                  <input
                    type="number"
                    min={10}
                    max={canvasHeight - selectedWalkway.y}
                    value={selectedWalkway.height}
                    onChange={e => {
                      const val = Number(e.target.value);
                      const maxVal = Math.max(10, canvasHeight - selectedWalkway.y);
                      onUpdateWalkway(selectedWalkway.id, { height: Math.max(10, Math.min(maxVal, val)) });
                    }}
                    className="w-full px-2 py-1 text-xs font-mono bg-white border border-slate-200 rounded-lg text-center focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Text Typography & Position Adjustment */}
            <ElementTextInspector
              fontSize={selectedWalkway.fontSize}
              textPosition={selectedWalkway.textPosition}
              textOrientation={selectedWalkway.textOrientation}
              textOffsetX={selectedWalkway.textOffsetX}
              textOffsetY={selectedWalkway.textOffsetY}
              fontWeight={selectedWalkway.fontWeight}
              defaultSize={11}
              onChange={(updates, saveHistory) => onUpdateWalkway(selectedWalkway.id, updates, saveHistory)}
              onShowToast={onShowToast}
            />

            {/* Quick Size Presets for Walkways */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5">常用街道動線尺寸 (隨畫布自適應)</label>
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    const fullW = Math.max(200, canvasWidth - 80);
                    onUpdateWalkway(selectedWalkway.id, { width: fullW, height: 40 }, true);
                    onShowToast(`已套用全寬大道：${fullW} × 40 px`);
                  }}
                  className="px-2 py-1 bg-slate-50 hover:bg-emerald-50 border border-slate-200 rounded-lg font-mono text-[10px] text-slate-700 truncate"
                  title="延伸橫跨整個畫布寬度"
                >
                  {Math.max(200, canvasWidth - 80)} × 40 (全寬主幹)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const fullH = Math.max(100, canvasHeight - 80);
                    onUpdateWalkway(selectedWalkway.id, { width: 60, height: fullH }, true);
                    onShowToast(`已套用全高大道：60 × ${fullH} px`);
                  }}
                  className="px-2 py-1 bg-slate-50 hover:bg-emerald-50 border border-slate-200 rounded-lg font-mono text-[10px] text-slate-700 truncate"
                  title="延伸縱向整個畫布高度"
                >
                  60 × {Math.max(100, canvasHeight - 80)} (全高大道)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onUpdateWalkway(selectedWalkway.id, { width: 200, height: 25 }, true);
                    onShowToast('已套用尺寸：200 × 25 px');
                  }}
                  className="px-2 py-1 bg-slate-50 hover:bg-emerald-50 border border-slate-200 rounded-lg font-mono text-[10px] text-slate-700 truncate"
                >
                  200 × 25 (側邊街道)
                </button>
              </div>
            </div>

            {/* Micro Nudge & Fast Alignment for Walkways */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100 flex flex-col items-center">
                <span className="text-[10px] font-bold text-slate-500 mb-1.5">微調走道位置</span>
                <div className="grid grid-cols-3 gap-1 w-24">
                  <div></div>
                  <button onClick={() => handleNudge(0, -5)} className="p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded flex justify-center"><ArrowUp className="w-3 h-3" /></button>
                  <div></div>
                  <button onClick={() => handleNudge(-5, 0)} className="p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded flex justify-center"><ArrowLeft className="w-3 h-3" /></button>
                  <div className="flex items-center justify-center text-[9px] font-mono text-slate-400">5px</div>
                  <button onClick={() => handleNudge(5, 0)} className="p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded flex justify-center"><ArrowRight className="w-3 h-3" /></button>
                  <div></div>
                  <button onClick={() => handleNudge(0, 5)} className="p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded flex justify-center"><ArrowDown className="w-3 h-3" /></button>
                  <div></div>
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100 flex flex-col">
                <span className="text-[10px] font-bold text-slate-500 mb-1.5">邊界快速對齊</span>
                <div className="grid grid-cols-2 gap-1 text-[10px]">
                  <button onClick={() => handleAlign('left')} className="p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded text-center">靠左側牆</button>
                  <button onClick={() => handleAlign('right')} className="p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded text-center">靠右側牆</button>
                  <button onClick={() => handleAlign('top')} className="p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded text-center">靠頂端牆</button>
                  <button onClick={() => handleAlign('bottom')} className="p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded text-center">靠底部牆</button>
                </div>
                <button onClick={() => handleAlign('center-h')} className="mt-1 p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded text-[10px] text-center w-full">水平居中通道</button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 4. DEFAULT OVERVIEW / ELEMENT MANAGER LIST (WHEN NO ELEMENT IS SELECTED) */}
      {!selectedBooth && !selectedFacility && !selectedWalkway && (
        <div className="space-y-4" id="inspector-empty-state">
          
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-xl">
                <List className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-sm font-bold text-slate-800">
                  背景元件與街道清單管理器
                </h4>
                <p className="text-[11px] text-slate-500">
                  點選下方元件即可快速選取、修改或清空
                </p>
              </div>
            </div>
          </div>

          {/* Manager Sub-tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl text-xs font-bold">
            <button
              onClick={() => setOverviewTab('facilities')}
              className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition ${
                overviewTab === 'facilities' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Compass className="w-3 h-3" />
              <span>設施 ({facilities.length})</span>
            </button>
            <button
              onClick={() => setOverviewTab('walkways')}
              className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition ${
                overviewTab === 'walkways' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>走道 ({walkways.length})</span>
            </button>
            <button
              onClick={() => setOverviewTab('booths')}
              className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition ${
                overviewTab === 'booths' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Store className="w-3 h-3" />
              <span>專櫃 ({booths.length})</span>
            </button>
            <button
              onClick={() => setOverviewTab('canvas')}
              className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition ${
                overviewTab === 'canvas' ? 'bg-white text-purple-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Scaling className="w-3 h-3" />
              <span>畫布尺寸</span>
            </button>
          </div>

          {/* TAB 1: FACILITIES LIST (including 哺乳室, 洗手間, 服務台, etc.) */}
          {overviewTab === 'facilities' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700">公共設施清單 (包含哺乳室、洗手間等)</span>
                {onClearFacilities && facilities.length > 0 && (
                  <button
                    onClick={onClearFacilities}
                    className="text-[11px] text-rose-600 hover:underline flex items-center gap-0.5"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>清空設施</span>
                  </button>
                )}
              </div>

              {facilities.length > 0 ? (
                <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
                  {facilities.map(fac => (
                    <div
                      key={fac.id}
                      onClick={() => onSelectFacility && onSelectFacility(fac.id)}
                      className="p-2 bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 rounded-xl flex items-center justify-between cursor-pointer transition group"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="text-sm shrink-0">
                          {fac.type === 'nursery' ? '🍼' : fac.type === 'restroom' ? '🚻' : fac.type === 'info' ? 'ℹ' : fac.type === 'entrance' ? '🚪' : fac.type === 'escalator' ? '🪜' : fac.type === 'elevator' ? '🛗' : fac.type === 'cafe' ? '☕' : fac.type === 'atm' ? '🏧' : fac.type === 'exit' ? '🚨' : fac.type === 'pillar' ? '🏛️' : fac.type === 'office' ? '💼' : '📍'}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-slate-800 group-hover:text-blue-700 font-sans break-words">
                            {fac.name}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {fac.width}×{fac.height} px at ({fac.x}, {fac.y})
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteFacility(fac.id);
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                          title="刪除"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-400 bg-slate-50 p-4 rounded-2xl text-center border border-dashed border-slate-200">
                  目前畫布上沒有公共設施。可從上方工具列快速新增哺乳室、洗手間或服務台。
                </div>
              )}
            </div>
          )}

          {/* TAB 2: WALKWAYS / STREETS LIST */}
          {overviewTab === 'walkways' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700">街道與動線清單 (包含各大道與街道走道)</span>
                {onClearWalkways && walkways.length > 0 && (
                  <button
                    onClick={onClearWalkways}
                    className="text-[11px] text-rose-600 hover:underline flex items-center gap-0.5"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>清空街道</span>
                  </button>
                )}
              </div>

              {walkways.length > 0 ? (
                <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
                  {walkways.map(walk => (
                    <div
                      key={walk.id}
                      onClick={() => onSelectWalkway && onSelectWalkway(walk.id)}
                      className="p-2 bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 rounded-xl flex items-center justify-between cursor-pointer transition group"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="w-3 h-3 rounded shrink-0" style={{ backgroundColor: walk.color || '#cbd5e1' }}></div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 font-sans break-words">
                            {walk.name}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {walk.width}×{walk.height} px at ({walk.x}, {walk.y})
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteWalkway(walk.id);
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                          title="刪除"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-400 bg-slate-50 p-4 rounded-2xl text-center border border-dashed border-slate-200">
                  目前畫布上沒有街道或走道。可從上方工具列點擊新增主要大道或通道。
                </div>
              )}
            </div>
          )}

          {/* TAB 3: BOOTHS LIST */}
          {overviewTab === 'booths' && (
            <div className="space-y-2">
              {/* Quick toggle for booth ID badges on map */}
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="text-[11px] font-bold text-slate-700">平面圖專櫃代號 (A1/D2)</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const next = !showBoothIds;
                    if (onToggleShowBoothIds) {
                      onToggleShowBoothIds(next);
                    }
                    onShowToast(`平面圖專櫃代號已設為「${next ? '顯示' : '隱藏'}」並同步至前台`);
                  }}
                  className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold border transition ${
                    showBoothIds
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                      : 'bg-white border-slate-200 text-slate-500'
                  }`}
                >
                  {showBoothIds ? '✓ 顯示代號' : '✕ 隱藏代號'}
                </button>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700">專櫃攤位清單 ({booths.length})</span>
                {onClearBooths && booths.length > 0 && (
                  <button
                    onClick={onClearBooths}
                    className="text-[11px] text-rose-600 hover:underline flex items-center gap-0.5"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>清空專櫃</span>
                  </button>
                )}
              </div>

              <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
                {booths.map(b => (
                  <div
                    key={b.id}
                    onClick={() => onSelectBooth && onSelectBooth(b.id)}
                    className="p-2 bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-300 rounded-xl flex items-center justify-between cursor-pointer transition group"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-white border border-slate-200 text-indigo-700 shrink-0">
                        {b.id}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-700 font-sans break-words">
                          {b.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {b.width}×{b.height} px • {b.zone}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteBooth(b.id);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                        title="刪除"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SPATIAL CANVAS DIMENSIONS SETTINGS */}
          {overviewTab === 'canvas' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Scaling className="w-3.5 h-3.5 text-indigo-600" />
                  <span>空間平面畫布尺寸設定</span>
                </span>
                {onOpenCanvasSizeModal && (
                  <button
                    type="button"
                    onClick={onOpenCanvasSizeModal}
                    className="text-indigo-600 hover:text-indigo-800 font-bold text-[11px] flex items-center gap-1"
                  >
                    <span>開啟彈窗</span>
                  </button>
                )}
              </div>

              {/* Status Banner */}
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-3 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">目前畫布尺寸</div>
                  <div className="text-base font-mono font-black text-indigo-900">
                    {canvasWidth} × {canvasHeight} <span className="text-xs font-normal text-indigo-600">px</span>
                  </div>
                  <div className="text-[11px] text-indigo-700/80">
                    比例: {(canvasWidth / canvasHeight).toFixed(2)}:1 • 面積: {((canvasWidth * canvasHeight) / 10000).toFixed(1)} 萬 px²
                  </div>
                </div>

                {onOpenCanvasSizeModal && (
                  <button
                    type="button"
                    onClick={onOpenCanvasSizeModal}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1"
                  >
                    <Scaling className="w-3.5 h-3.5" />
                    <span>自訂尺寸</span>
                  </button>
                )}
              </div>

              {/* Width Slider */}
              <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700">畫布寬度 (Width)</span>
                  <span className="font-mono font-bold text-indigo-600">{canvasWidth} px</span>
                </div>
                <input
                  type="range"
                  min="600"
                  max="2500"
                  step="20"
                  value={canvasWidth}
                  onChange={e => {
                    if (onUpdateCanvasDimensions) {
                      onUpdateCanvasDimensions(parseInt(e.target.value, 10), canvasHeight, false);
                    }
                  }}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>600px</span>
                  <span>2500px</span>
                </div>
              </div>

              {/* Height Slider */}
              <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700">畫布高度 (Height)</span>
                  <span className="font-mono font-bold text-emerald-600">{canvasHeight} px</span>
                </div>
                <input
                  type="range"
                  min="400"
                  max="1800"
                  step="20"
                  value={canvasHeight}
                  onChange={e => {
                    if (onUpdateCanvasDimensions) {
                      onUpdateCanvasDimensions(canvasWidth, parseInt(e.target.value, 10), false);
                    }
                  }}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>400px</span>
                  <span>1800px</span>
                </div>
              </div>

              {/* Presets Grid */}
              <div className="space-y-1.5">
                <span className="block text-[11px] font-bold text-slate-700">常用尺寸規格快速切換</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { label: '標準 1000×500', w: 1000, h: 500 },
                    { label: '旗艦 1200×600', w: 1200, h: 600 },
                    { label: '廣角 1400×700', w: 1400, h: 700 },
                    { label: '巨幕 1600×800', w: 1600, h: 800 },
                    { label: '正方 800×800', w: 800, h: 800 },
                    { label: '正方 1000×1000', w: 1000, h: 1000 },
                    { label: '縱深 800×1000', w: 800, h: 1000 },
                    { label: '地下街 1500×500', w: 1500, h: 500 }
                  ].map(preset => {
                    const isCurrent = canvasWidth === preset.w && canvasHeight === preset.h;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          if (onUpdateCanvasDimensions) {
                            onUpdateCanvasDimensions(preset.w, preset.h, false);
                          }
                        }}
                        className={`p-1.5 rounded-xl border text-left text-xs transition ${
                          isCurrent
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <div className="font-bold truncate">{preset.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Global Clear & Reset Footer */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <div className="grid grid-cols-2 gap-2 text-xs">
              {onClearAllBackground && (
                <button
                  onClick={onClearAllBackground}
                  className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold flex items-center justify-center gap-1 transition"
                  id="btn-clear-bg-from-inspector"
                >
                  <Eraser className="w-3.5 h-3.5" />
                  <span>清空全部背景元件</span>
                </button>
              )}

              {onResetDefaultFacilities && (
                <button
                  onClick={() => {
                    if (onResetDefaultFacilities) onResetDefaultFacilities();
                    if (onResetDefaultWalkways) onResetDefaultWalkways();
                  }}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl font-bold flex items-center justify-center gap-1 transition"
                  id="btn-reset-default-bg"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>還原預設背景元件</span>
                </button>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
