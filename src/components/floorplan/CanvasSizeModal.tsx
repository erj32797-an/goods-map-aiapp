import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Check, 
  RotateCcw, 
  Scaling, 
  Sparkles, 
  Info, 
  Sliders, 
  ChevronRight
} from 'lucide-react';export interface CanvasPreset {
  id: string;
  name: string;
  width: number;
  height: number;
  ratio: string;
  category: '橫向寬幅' | '正方格局' | '縱深長型' | '特殊規格';
  desc: string;
}

export const CANVAS_SIZE_PRESETS: CanvasPreset[] = [
  {
    id: 'standard_1000_500',
    name: '標準展場 (系統預設)',
    width: 1000,
    height: 500,
    ratio: '2.0 : 1',
    category: '橫向寬幅',
    desc: '黃金橫幅 2:1 比例，適合絕大多數商場樓層與標準展廳'
  },
  {
    id: 'wide_1200_600',
    name: '寬幅旗艦展廳 (推薦)',
    width: 1200,
    height: 600,
    ratio: '2.0 : 1',
    category: '橫向寬幅',
    desc: '面積增加 44%，兩側擁有更寬裕的專櫃排佈與主走道動線'
  },
  {
    id: 'ultra_wide_1400_700',
    name: '超廣角多展區大廳',
    width: 1400,
    height: 700,
    ratio: '2.0 : 1',
    category: '橫向寬幅',
    desc: '適合大型複合式購物中心或三至五個主題專區的整層平面圖'
  },
  {
    id: 'mega_1600_800',
    name: '巨幕國際會展中心',
    width: 1600,
    height: 800,
    ratio: '2.0 : 1',
    category: '橫向寬幅',
    desc: '超大跨距，可容納超過 30 個以上品牌專櫃與多組主副幹道'
  },
  {
    id: 'square_800_800',
    name: '正方形中庭商場',
    width: 800,
    height: 800,
    ratio: '1.0 : 1',
    category: '正方格局',
    desc: '1:1 正方格局，適合圍繞中央天井、圓形中庭或四方環形動線'
  },
  {
    id: 'square_1000_1000',
    name: '正方形大跨距商場',
    width: 1000,
    height: 1000,
    ratio: '1.0 : 1',
    category: '正方格局',
    desc: '1:1 超大正方平面，適合棋盤十字走道與網格專櫃配置'
  },
  {
    id: 'tall_800_1000',
    name: '縱向挑高深長型',
    width: 800,
    height: 1000,
    ratio: '0.8 : 1',
    category: '縱深長型',
    desc: '4:5 垂直縱向視野，適合直式深度展館、長型通道或單向導引'
  },
  {
    id: 'strip_1500_500',
    name: '橫向地下街長廊',
    width: 1500,
    height: 500,
    ratio: '3.0 : 1',
    category: '特殊規格',
    desc: '3:1 狹長型長廊，適合地下街、捷運連通道或購物商街'
  }
];

interface CanvasSizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentWidth: number;
  currentHeight: number;
  onApplyDimensions: (newWidth: number, newHeight: number, scaleExisting: boolean) => void;
}

export default function CanvasSizeModal({
  isOpen,
  onClose,
  currentWidth,
  currentHeight,
  onApplyDimensions
}: CanvasSizeModalProps) {
  const [width, setWidth] = useState<number>(currentWidth);
  const [height, setHeight] = useState<number>(currentHeight);
  const [scaleExisting, setScaleExisting] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Sync state whenever modal opens or props change
  useEffect(() => {
    if (isOpen) {
      setWidth(currentWidth || 1000);
      setHeight(currentHeight || 500);
      setScaleExisting(false);
    }
  }, [isOpen, currentWidth, currentHeight]);

  if (!isOpen) return null;

  const aspectRatio = (width / height).toFixed(2);
  const isModified = width !== currentWidth || height !== currentHeight;
  const totalAreaPixels = width * height;

  const handleApply = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clampedW = Math.max(600, Math.min(3000, Math.round(width)));
    const clampedH = Math.max(400, Math.min(2000, Math.round(height)));
    onApplyDimensions(clampedW, clampedH, scaleExisting);
    onClose();
  };

  const handleSelectPreset = (preset: CanvasPreset) => {
    setWidth(preset.width);
    setHeight(preset.height);
  };

  const handleResetToStandard = () => {
    setWidth(1000);
    setHeight(500);
  };

  const filteredPresets = activeCategory === 'all' 
    ? CANVAS_SIZE_PRESETS 
    : CANVAS_SIZE_PRESETS.filter(p => p.category === activeCategory);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]"
          id="canvas-size-modal-dialog"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4.5 bg-gradient-to-r from-slate-50 to-indigo-50/40 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-indigo-600 text-white rounded-2xl shadow-xs">
                <Scaling className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>空間平面畫布尺寸設定</span>
                  <span className="text-xs font-mono font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                    {width} × {height} px
                  </span>
                </h3>
                <p className="text-xs text-slate-500 font-sans">
                  自訂專櫃平面圖之底層座標系統與長寬邊界，即時同步至後台編輯器與前台地圖
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 rounded-xl transition"
              title="關閉"
              id="btn-close-canvas-size-modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 scrollbar-thin">
            
            {/* Visual Ratio & Metrics Preview Banner */}
            <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-5">
              
              {/* Dynamic SVG Aspect Ratio Mini Preview */}
              <div className="w-48 h-28 bg-slate-200/80 rounded-xl border border-slate-300/80 flex items-center justify-center p-2 relative overflow-hidden shrink-0 shadow-inner">
                <div 
                  className="bg-white border-2 border-indigo-500 rounded-lg shadow-sm flex items-center justify-center transition-all duration-200 relative"
                  style={{
                    width: width >= height ? '100%' : `${Math.max(30, (width / height) * 100)}%`,
                    height: height >= width ? '100%' : `${Math.max(30, (height / width) * 100)}%`,
                    maxWidth: '100%',
                    maxHeight: '100%'
                  }}
                >
                  <div className="text-[10px] font-mono font-bold text-indigo-700 text-center px-1">
                    {width} × {height}
                  </div>
                  <div className="absolute top-0.5 left-1 text-[8px] text-slate-400 font-mono">0,0</div>
                  <div className="absolute bottom-0.5 right-1 text-[8px] text-slate-400 font-mono">max</div>
                </div>
              </div>

              {/* Dimension Metrics */}
              <div className="flex-1 space-y-2 text-xs w-full">
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[10px] text-slate-400 block font-medium">長寬比例 (Ratio)</span>
                    <span className="font-mono font-bold text-slate-800 text-sm">
                      {aspectRatio} : 1
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[10px] text-slate-400 block font-medium">總像素面積</span>
                    <span className="font-mono font-bold text-slate-800 text-sm">
                      {(totalAreaPixels / 10000).toFixed(1)} 萬 px²
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[10px] text-slate-400 block font-medium">外牆邊界</span>
                    <span className="font-mono font-bold text-indigo-600 text-sm">
                      {width - 40} × {height - 40}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
                  <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span>
                    {width > 1200 ? '超寬型展覽空間，適合品牌多、動線長的展售活動。' :
                     Math.abs(width - height) < 100 ? '正方型空間，各分區專櫃能平均向中庭或出入口開展。' :
                     height > width ? '直式深長型賣場，訪客將沿著單向深度探索。' :
                     '標準 2:1 黃金比例，在各類桌機與平板螢幕皆能獲得最佳閱讀視野。'}
                  </span>
                </div>
              </div>
            </div>

            {/* Manual Size Inputs & Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Width Input Block */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                    <span>畫布寬度 (Width)</span>
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={600}
                      max={3000}
                      step={10}
                      value={width}
                      onChange={e => setWidth(Math.max(600, Math.min(3000, parseInt(e.target.value, 10) || 600)))}
                      className="w-20 px-2 py-1 text-right font-mono font-bold text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      id="input-canvas-width"
                    />
                    <span className="text-xs font-mono text-slate-400 font-medium">px</span>
                  </div>
                </div>

                <input
                  type="range"
                  min={600}
                  max={2500}
                  step={20}
                  value={width}
                  onChange={e => setWidth(parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  id="slider-canvas-width"
                />

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                  <span>600 px (緊湊)</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setWidth(prev => Math.max(600, prev - 50))}
                      className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-bold"
                    >
                      -50
                    </button>
                    <button
                      type="button"
                      onClick={() => setWidth(prev => Math.min(3000, prev + 50))}
                      className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-bold"
                    >
                      +50
                    </button>
                  </div>
                  <span>2500 px (極限)</span>
                </div>
              </div>

              {/* Height Input Block */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    <span>畫布高度 (Height)</span>
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={400}
                      max={2000}
                      step={10}
                      value={height}
                      onChange={e => setHeight(Math.max(400, Math.min(2000, parseInt(e.target.value, 10) || 400)))}
                      className="w-20 px-2 py-1 text-right font-mono font-bold text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      id="input-canvas-height"
                    />
                    <span className="text-xs font-mono text-slate-400 font-medium">px</span>
                  </div>
                </div>

                <input
                  type="range"
                  min={400}
                  max={1800}
                  step={20}
                  value={height}
                  onChange={e => setHeight(parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  id="slider-canvas-height"
                />

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                  <span>400 px (緊湊)</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setHeight(prev => Math.max(400, prev - 50))}
                      className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-bold"
                    >
                      -50
                    </button>
                    <button
                      type="button"
                      onClick={() => setHeight(prev => Math.min(2000, prev + 50))}
                      className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-bold"
                    >
                      +50
                    </button>
                  </div>
                  <span>1800 px (極限)</span>
                </div>
              </div>

            </div>

            {/* Element Scale Mode Option Toggle */}
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 space-y-2.5">
              <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>變更畫布尺寸時的元件處置策略</span>
                <span className="text-[10px] text-indigo-600 font-mono font-bold">
                  {scaleExisting ? '等比縮放現有專櫃' : '保持原有專櫃位置'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setScaleExisting(false)}
                  className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 ${
                    !scaleExisting
                      ? 'bg-white border-indigo-500 shadow-xs ring-2 ring-indigo-500/20'
                      : 'bg-white/60 border-slate-200 hover:bg-white text-slate-600'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full mt-0.5 border flex items-center justify-center shrink-0 ${
                    !scaleExisting ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'
                  }`}>
                    {!scaleExisting && <Check className="w-2.5 h-2.5" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 mb-0.5">保持原有專櫃座標 (推薦)</div>
                    <div className="text-[11px] text-slate-500">
                      僅擴大或縮小畫布外框邊界，專櫃、設施與動線維持既有位置與尺寸。
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setScaleExisting(true)}
                  className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 ${
                    scaleExisting
                      ? 'bg-white border-indigo-500 shadow-xs ring-2 ring-indigo-500/20'
                      : 'bg-white/60 border-slate-200 hover:bg-white text-slate-600'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full mt-0.5 border flex items-center justify-center shrink-0 ${
                    scaleExisting ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'
                  }`}>
                    {scaleExisting && <Check className="w-2.5 h-2.5" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 mb-0.5">等比例縮放所有元件</div>
                    <div className="text-[11px] text-slate-500">
                      根據新舊畫布尺寸比例，自動等比調整所有專櫃、公共設施與動線的位置與大小。
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Quick Canvas Presets */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>常用賣場與展館規格預設 (One-Click Presets)</span>
                </h4>
                <div className="flex items-center gap-1 text-[11px]">
                  {['all', '橫向寬幅', '正方格局', '縱深長型'].map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveCategory(cat)}
                      className={`px-2 py-0.5 rounded-lg font-medium transition ${
                        activeCategory === cat ? 'bg-indigo-600 text-white font-bold' : 'text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      {cat === 'all' ? '全部' : cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {filteredPresets.map(preset => {
                  const isCurrentSelected = width === preset.width && height === preset.height;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={`p-3 rounded-2xl border text-left transition group flex flex-col justify-between ${
                        isCurrentSelected 
                          ? 'bg-indigo-50/70 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs' 
                          : 'bg-white border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/30 shadow-2xs'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition">
                            {preset.name}
                          </div>
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                            {preset.width} × {preset.height} px
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 line-clamp-2">
                          {preset.desc}
                        </div>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                        <span className="text-slate-400 font-mono">比例: {preset.ratio}</span>
                        <span className={`font-bold flex items-center gap-0.5 ${isCurrentSelected ? 'text-indigo-600' : 'text-slate-500 group-hover:text-indigo-600'}`}>
                          {isCurrentSelected ? '已選擇' : '點擊套用'}
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 flex-wrap">
            <button
              type="button"
              onClick={handleResetToStandard}
              className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold border border-slate-200 transition flex items-center gap-1.5 shadow-xs"
              id="btn-reset-standard-canvas-size"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>還原 1000 × 500 px</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 transition"
                id="btn-cancel-canvas-size"
              >
                取消
              </button>

              <button
                type="button"
                onClick={handleApply}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md hover:shadow-lg"
                id="btn-apply-canvas-size"
              >
                <Check className="w-4 h-4" />
                <span>套用畫布尺寸 ({width} × {height})</span>
              </button>
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
