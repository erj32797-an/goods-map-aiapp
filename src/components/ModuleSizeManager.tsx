import React from 'react';
import { 
  Maximize2, 
  Columns, 
  Sliders, 
  RotateCcw, 
  Sparkles, 
  Eye, 
  Check, 
  Search, 
  Compass, 
  CheckCircle2,
  SlidersHorizontal,
  Scaling
} from 'lucide-react';
import { ModuleSizeSettings } from '../types';
import { DEFAULT_MODULE_SIZE_SETTINGS, DEFAULT_SYSTEM_TITLE } from '../data';

interface ModuleSizeManagerProps {
  settings: ModuleSizeSettings;
  onUpdateSettings: (settings: ModuleSizeSettings) => void;
  onShowToast: (msg: string) => void;
}

const RATIO_OPTIONS: { key: ModuleSizeSettings['columnRatio']; name: string; desc: string; searchCols: string; mapCols: string; icon: string }[] = [
  { 
    key: '2:10', 
    name: '極致超大平面圖 (2:10)', 
    desc: '極小化查詢側欄 (16.7%)，給予賣場地圖極限開闊的 83.3% 超大展示空間',
    searchCols: 'w-1/6',
    mapCols: 'w-5/6',
    icon: '2:10'
  },
  { 
    key: '3:9', 
    name: '超廣角平面地圖 (3:9)', 
    desc: '精簡查詢側欄 (25%)，右側平面圖佔據 75% 視野，非常適合大型展覽館或多樓層空間',
    searchCols: 'w-1/4',
    mapCols: 'w-3/4',
    icon: '3:9'
  },
  { 
    key: '4:8', 
    name: '精緻查詢 + 寬闊平面圖 (4:8)', 
    desc: '給予平面圖最大展示寬度 (66.7%)，適合以地圖導覽為主的賣場空間',
    searchCols: 'w-1/3',
    mapCols: 'w-2/3',
    icon: '4:8'
  },
  { 
    key: '5:7', 
    name: '標準平衡黃金比例 (5:7)', 
    desc: '系統預設最佳視覺體驗，搜尋面板與賣場地圖皆有寬裕閱讀與操作空間',
    searchCols: 'w-[41.6%]',
    mapCols: 'w-[58.4%]',
    icon: '5:7'
  },
  { 
    key: '6:6', 
    name: '對等雙欄分割 (6:6)', 
    desc: '左右等寬分割 (50% / 50%)，查詢模組與平面圖各佔一半視野',
    searchCols: 'w-1/2',
    mapCols: 'w-1/2',
    icon: '6:6'
  },
  { 
    key: '7:5', 
    name: '豐富查詢 + 精簡平面圖 (7:5)', 
    desc: '強調商品列表展示與多條件篩選 (58.4%)，平面圖居次輔助定位',
    searchCols: 'w-[58.4%]',
    mapCols: 'w-[41.6%]',
    icon: '7:5'
  },
  { 
    key: '8:4', 
    name: '全覽商品目錄 + 側邊地圖 (8:4)', 
    desc: '左側搜尋列表最大化 (66.7%)，右側以精巧地圖輔助指引',
    searchCols: 'w-2/3',
    mapCols: 'w-1/3',
    icon: '8:4'
  },
  { 
    key: '12:12', 
    name: '上下垂直全寬堆疊 (12:12)', 
    desc: '搜尋模組在上/下整行全寬 (100%)，地圖亦全寬展示，適合觸控導覽機或寬螢幕',
    searchCols: 'w-full',
    mapCols: 'w-full',
    icon: '100%'
  }
];

const PRESET_COMBINATIONS = [
  {
    name: '🖥️ 寬螢幕導覽機標準模式',
    desc: '5:7 比例 / 地圖 600px / 舒適密度',
    settings: {
      columnRatio: '5:7' as const,
      mapHeight: 600,
      searchMinHeight: 480,
      searchDensity: 'comfortable' as const,
      searchCardSize: 'md' as const,
      mapViewScale: 1.0,
      contentMaxWidth: '7xl' as const,
      mapBorderRadius: '3xl' as const,
      showFrontendQuickResize: true
    }
  },
  {
    name: '🏛️ 超廣角大展館模式',
    desc: '3:9 比例 / 地圖 760px / 75% 極大視野',
    settings: {
      columnRatio: '3:9' as const,
      mapHeight: 760,
      searchMinHeight: 450,
      searchDensity: 'compact' as const,
      searchCardSize: 'sm' as const,
      mapViewScale: 1.2,
      contentMaxWidth: 'full' as const,
      mapBorderRadius: '3xl' as const,
      showFrontendQuickResize: true
    }
  },
  {
    name: '🔭 極致全景地圖模式',
    desc: '2:10 比例 / 地圖 820px / 83% 巨幕',
    settings: {
      columnRatio: '2:10' as const,
      mapHeight: 820,
      searchMinHeight: 450,
      searchDensity: 'compact' as const,
      searchCardSize: 'sm' as const,
      mapViewScale: 1.3,
      contentMaxWidth: 'full' as const,
      mapBorderRadius: '3xl' as const,
      showFrontendQuickResize: true
    }
  },
  {
    name: '🛍️ 商品型錄專注搜尋模式',
    desc: '7:5 比例 / 地圖 500px / 寬敞卡片',
    settings: {
      columnRatio: '7:5' as const,
      mapHeight: 520,
      searchMinHeight: 560,
      searchDensity: 'spacious' as const,
      searchCardSize: 'lg' as const,
      mapViewScale: 0.95,
      contentMaxWidth: '7xl' as const,
      mapBorderRadius: '2xl' as const,
      showFrontendQuickResize: true
    }
  }
];

export default function ModuleSizeManager({
  settings,
  onUpdateSettings,
  onShowToast
}: ModuleSizeManagerProps) {
  
  const handleUpdate = (partial: Partial<ModuleSizeSettings>) => {
    const updated = { ...settings, ...partial };
    onUpdateSettings(updated);
  };

  const handleApplyPreset = (presetSettings: ModuleSizeSettings, name: string) => {
    onUpdateSettings(presetSettings);
    onShowToast(`已套用「${name}」配置`);
  };

  const handleResetDefaults = () => {
    onUpdateSettings(DEFAULT_MODULE_SIZE_SETTINGS);
    onShowToast('✨ 已還原為系統預設模組尺寸！');
  };

  return (
    <div className="space-y-6" id="module-size-manager-root">
      
      {/* Top Banner Header */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4.5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Maximize2 className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold text-slate-900">
              前台模組尺寸與版面佈局配置中心 (Module Size & Layout Customizer)
            </h3>
            <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
              即時響應前台
            </span>
          </div>
          <p className="text-xs text-slate-500 font-sans">
            自由調整前台「查詢搜尋模組」與「賣場平面圖模組」的寬度佔比、高度、卡片大小、地圖視野比例及版面容器
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            id="btn-reset-module-sizes"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>還原預設尺寸</span>
          </button>
        </div>
      </div>

      {/* Preset Quick Apply Cards */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>快速一鍵套用情境預設組合 (Preset Themes)</span>
          </h4>
          <span className="text-[11px] text-slate-400">點擊任一卡片立即生效</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PRESET_COMBINATIONS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(preset.settings, preset.name)}
              className="text-left p-3.5 bg-white hover:bg-indigo-50/40 border border-slate-200 hover:border-indigo-300 rounded-2xl transition duration-150 shadow-2xs group flex flex-col justify-between"
            >
              <div>
                <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition mb-1">
                  {preset.name}
                </div>
                <div className="text-[11px] text-slate-500 break-words">
                  {preset.desc}
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-indigo-600 font-bold">
                <span>點擊套用</span>
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 group-hover:scale-125 transition"></span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Live Mini Preview Box */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3" id="layout-live-mini-preview">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1 bg-indigo-50 text-indigo-600 rounded-md">
              <Eye className="w-3.5 h-3.5" />
            </span>
            <h4 className="text-xs font-bold text-slate-800">
              前台左右欄位比例與高度 • 即時佈局視覺預覽 (Live Layout Diagram)
            </h4>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono flex-wrap">
            <span>寬度比例: <strong className="text-indigo-600">{settings.columnRatio}</strong></span>
            <span>•</span>
            <span>地圖高: <strong className="text-emerald-600">{settings.mapHeight}px</strong></span>
            <span>•</span>
            <span>搜尋最低高: <strong className="text-indigo-600">{settings.searchMinHeight}px</strong></span>
          </div>
        </div>

        {/* Dynamic proportional preview diagram */}
        <div className="p-3 bg-slate-900 rounded-xl text-white">
          <div className="text-[10px] text-slate-400 mb-2 flex items-center justify-between">
            <span>[ 前台畫面預覽模式: {settings.contentMaxWidth === 'full' ? '全螢幕 100%' : `最大寬度 ${settings.contentMaxWidth}`} ]</span>
            <span>平面圖視角縮放: {(settings.mapViewScale * 100).toFixed(0)}%</span>
          </div>
          
          <div className={`gap-3 ${settings.columnRatio === '12:12' ? 'flex flex-col' : 'flex flex-row'}`}>
            {/* Search Box Preview */}
            <div 
              className="bg-slate-800 border border-slate-700 rounded-lg p-3 flex flex-col justify-between transition-all duration-300 relative overflow-hidden"
              style={{
                width: settings.columnRatio === '12:12' ? '100%' : 
                  settings.columnRatio === '2:10' ? '16.66%' :
                  settings.columnRatio === '3:9' ? '25%' :
                  settings.columnRatio === '4:8' ? '33.33%' :
                  settings.columnRatio === '5:7' ? '41.66%' :
                  settings.columnRatio === '6:6' ? '50%' :
                  settings.columnRatio === '7:5' ? '58.33%' : '66.66%',
                minHeight: '120px'
              }}
            >
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300 mb-1">
                  <Search className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">查詢模組</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  寬度佔比: {settings.columnRatio.split(':')[0]} / 12 ({
                    settings.columnRatio === '2:10' ? '17%' :
                    settings.columnRatio === '3:9' ? '25%' :
                    settings.columnRatio === '4:8' ? '33%' :
                    settings.columnRatio === '5:7' ? '42%' :
                    settings.columnRatio === '6:6' ? '50%' :
                    settings.columnRatio === '7:5' ? '58%' :
                    settings.columnRatio === '8:4' ? '67%' : '100%'
                  })
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  密度: {settings.searchDensity === 'compact' ? '緊湊' : settings.searchDensity === 'comfortable' ? '標準' : '寬敞'} | 卡片: {settings.searchCardSize.toUpperCase()}
                </div>
              </div>

              <div className="mt-3 flex items-center gap-1">
                <div className="h-4 bg-slate-700 rounded flex-1"></div>
                <div className="h-4 w-12 bg-indigo-600 rounded"></div>
              </div>
            </div>

            {/* Map Box Preview */}
            <div 
              className="bg-slate-800/90 border border-emerald-500/40 rounded-lg p-3 flex flex-col justify-between transition-all duration-300 relative overflow-hidden"
              style={{
                width: settings.columnRatio === '12:12' ? '100%' : 
                  settings.columnRatio === '2:10' ? '83.34%' :
                  settings.columnRatio === '3:9' ? '75%' :
                  settings.columnRatio === '4:8' ? '66.67%' :
                  settings.columnRatio === '5:7' ? '58.34%' :
                  settings.columnRatio === '6:6' ? '50%' :
                  settings.columnRatio === '7:5' ? '41.67%' : '33.34%',
                minHeight: '120px'
              }}
            >
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300 mb-1">
                  <Compass className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">賣場平面圖導覽模組</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  寬度佔比: {settings.columnRatio.split(':')[1]} / 12 ({
                    settings.columnRatio === '2:10' ? '83%' :
                    settings.columnRatio === '3:9' ? '75%' :
                    settings.columnRatio === '4:8' ? '67%' :
                    settings.columnRatio === '5:7' ? '58%' :
                    settings.columnRatio === '6:6' ? '50%' :
                    settings.columnRatio === '7:5' ? '42%' :
                    settings.columnRatio === '8:4' ? '33%' : '100%'
                  })
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  容器高度: {settings.mapHeight}px | 圓角: {settings.mapBorderRadius}
                </div>
              </div>

              {/* Simulated mini booth rectangles */}
              <div className="grid grid-cols-4 gap-1.5 mt-2 opacity-75">
                <div className="h-5 bg-teal-500/30 border border-teal-500 rounded text-[8px] flex items-center justify-center text-teal-300 font-mono">A1</div>
                <div className="h-5 bg-rose-500/30 border border-rose-500 rounded text-[8px] flex items-center justify-center text-rose-300 font-mono">B1</div>
                <div className="h-5 bg-violet-500/30 border border-violet-500 rounded text-[8px] flex items-center justify-center text-violet-300 font-mono">C1</div>
                <div className="h-5 bg-amber-500/30 border border-amber-500 rounded text-[8px] flex items-center justify-center text-amber-300 font-mono">D1</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 0: SYSTEM TITLE AND BRANDING */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4" id="section-system-title-config">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Compass className="w-4 h-4" />
            </span>
            <div>
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                <span>系統主標題與商場品牌名稱 (System Title)</span>
                <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full font-bold">
                  即時同步前台導覽列
                </span>
              </h4>
              <p className="text-[11px] text-slate-500">
                自訂前台頂部導覽列所顯示的主標題（目前：「{settings.systemTitle || DEFAULT_SYSTEM_TITLE}」）
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              handleUpdate({ systemTitle: DEFAULT_SYSTEM_TITLE });
              onShowToast(`✨ 系統標題已還原為預設名稱「${DEFAULT_SYSTEM_TITLE}」！`);
            }}
            className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1 self-start sm:self-auto shrink-0"
            title="還原為系統出廠預設名稱"
            id="btn-reset-system-title-section"
          >
            <RotateCcw className="w-3 h-3" />
            <span>還原預設標題</span>
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={settings.systemTitle || ''}
                onChange={(e) => handleUpdate({ systemTitle: e.target.value })}
                placeholder="請輸入系統主標題（如：智慧商場導覽與管理系統）"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                id="input-system-title-form"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                const finalTitle = settings.systemTitle?.trim() || DEFAULT_SYSTEM_TITLE;
                handleUpdate({ systemTitle: finalTitle });
                onShowToast(`✨ 系統標題已更新為「${finalTitle}」並即時套用至前台導覽！`);
              }}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs shrink-0"
              id="btn-save-system-title-form"
            >
              <Check className="w-3.5 h-3.5" />
              <span>確認套用</span>
            </button>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            <span className="text-[10px] text-slate-400 font-bold mr-1">常用名稱範本快速填入：</span>
            {[
              '智慧商場導覽與管理系統',
              '新光三越購物中心導覽',
              '遠東百貨空間導引與商品指南',
              '誠品生活樓層導覽與專櫃查詢',
              'Global Mall 智慧商場導引'
            ].map((rec) => (
              <button
                key={rec}
                type="button"
                onClick={() => {
                  handleUpdate({ systemTitle: rec });
                  onShowToast(`已填入「${rec}」並套用至前台`);
                }}
                className={`text-[10px] px-2 py-0.5 rounded-lg border transition font-medium ${
                  settings.systemTitle === rec
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {rec}
              </button>
            ))}
          </div>

          {/* Real-time preview snippet */}
          <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-xs">
              <Compass className="w-4 h-4 animate-spin-slow" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs sm:text-sm font-black text-slate-900 truncate">
                  {settings.systemTitle?.trim() || DEFAULT_SYSTEM_TITLE}
                </span>
                <span className="text-[9px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-1.5 py-0.2 rounded-full shrink-0">
                  v4.5 EXCEL PRO
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                前台導覽列預覽 • 支援商品/櫃位雙向查詢
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Settings Form Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* SECTION 1: COLUMN RATIO & WIDTH */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Columns className="w-4 h-4" />
            </span>
            <div>
              <h4 className="text-xs font-bold text-slate-900">
                1. 左右欄位寬度分割比例 (Column Split Ratio)
              </h4>
              <p className="text-[11px] text-slate-500">
                設定大螢幕桌機/觸控機下，查詢面板與平面圖的寬度配置
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {RATIO_OPTIONS.map(opt => {
              const isSelected = settings.columnRatio === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => handleUpdate({ columnRatio: opt.key })}
                  className={`text-left p-3 rounded-2xl border transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-indigo-50/60 border-indigo-500 ring-2 ring-indigo-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px]">
                        {opt.icon}
                      </span>
                      <span>{opt.name.split(' (')[0]}</span>
                    </span>
                    {isSelected && (
                      <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 break-words">
                    {opt.desc}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Container Max Width */}
          <div className="pt-2">
            <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
              前台整體版面最大寬度 (Content Max-Width)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { key: 'full', label: '100% 全螢幕滿版', desc: '適合寬螢幕/電視導覽' },
                { key: '7xl', label: '7XL (標準寬幅)', desc: '系統預設極佳適配' },
                { key: '6xl', label: '6XL (適中)', desc: '1152px 緊湊居中' },
                { key: '5xl', label: '5XL (緊湊)', desc: '1024px 集中視線' }
              ].map(item => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleUpdate({ contentMaxWidth: item.key as any })}
                  className={`p-2.5 rounded-xl border text-left transition ${
                    settings.contentMaxWidth === item.key
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <div className="text-xs font-bold">{item.label}</div>
                  <div className={`text-[10px] ${settings.contentMaxWidth === item.key ? 'text-indigo-100' : 'text-slate-400'}`}>
                    {item.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 2: MAP MODULE HEIGHT & VIEWPORT */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <Compass className="w-4 h-4" />
            </span>
            <div>
              <h4 className="text-xs font-bold text-slate-900">
                2. 賣場平面圖高度與縮放設定 (Map Height & Viewport)
              </h4>
              <p className="text-[11px] text-slate-500">
                調整平面圖容器的實際像素高度、外框圓角與初始視覺縮放比例
              </p>
            </div>
          </div>

          {/* Map Height Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-bold text-slate-700">
                平面圖高度 (Map Container Height)
              </label>
              <div className="flex items-center gap-1">
                <span className="font-mono text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {settings.mapHeight} px
                </span>
                <span className="text-[10px] text-slate-400">(範圍: 450 ~ 950px)</span>
              </div>
            </div>

            <input
              type="range"
              min="450"
              max="950"
              step="10"
              value={settings.mapHeight}
              onChange={e => handleUpdate({ mapHeight: parseInt(e.target.value, 10) })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              id="slider-map-height"
            />

            {/* Quick buttons for common map heights */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                { label: '小 (480px)', val: 480 },
                { label: '標準 (580px)', val: 580 },
                { label: '大 (680px)', val: 680 },
                { label: '特大 (780px)', val: 780 },
                { label: '巨幕 (880px)', val: 880 }
              ].map(btn => (
                <button
                  key={btn.val}
                  type="button"
                  onClick={() => handleUpdate({ mapHeight: btn.val })}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
                    settings.mapHeight === btn.val
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Map Viewport Scale */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-bold text-slate-700">
                初始視角縮放比例 (Initial Viewport Scale)
              </label>
              <span className="font-mono text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                {(settings.mapViewScale * 100).toFixed(0)} %
              </span>
            </div>

            <input
              type="range"
              min="0.75"
              max="1.4"
              step="0.05"
              value={settings.mapViewScale}
              onChange={e => handleUpdate({ mapViewScale: parseFloat(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              id="slider-map-scale"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>75% (全景縮小)</span>
              <span>100% (標準 1:1)</span>
              <span>140% (局部特寫)</span>
            </div>
          </div>

          {/* Map Border Radius */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="block text-[11px] font-bold text-slate-700">
              地圖模組邊框圓角 (Border Radius)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { key: 'sm', label: '極小 (sm)' },
                { key: 'lg', label: '俐落 (lg)' },
                { key: '2xl', label: '圓潤 (2xl)' },
                { key: '3xl', label: '超圓潤 (3xl)' }
              ].map(r => (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => handleUpdate({ mapBorderRadius: r.key as any })}
                  className={`py-1.5 px-2 rounded-xl text-xs font-semibold border text-center transition ${
                    settings.mapBorderRadius === r.key
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Booth ID Badge Visibility Toggle */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block">
                  平面圖專櫃代號顯示 (Show Booth IDs)
                </label>
                <p className="text-[10px] text-slate-500">
                  設定是否在前台與後台平面圖上顯示各櫃位左上角的代號徽章（例如 A1, D2）
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const current = settings.showBoothIds !== false;
                  const nextVal = !current;
                  handleUpdate({ showBoothIds: nextVal });
                  onShowToast(`平面圖專櫃代號已設為「${nextVal ? '顯示' : '隱藏'}」`);
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.showBoothIds !== false ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
                id="toggle-show-booth-ids"
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    settings.showBoothIds !== false ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                settings.showBoothIds !== false ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}>
                {settings.showBoothIds !== false ? '✓ 目前狀態：顯示專櫃代號' : '✕ 目前狀態：隱藏專櫃代號（不顯示）'}
              </span>
            </div>
          </div>

        </div>

        {/* SECTION 3: SPATIAL CANVAS DIMENSIONS (NEW) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4" id="section-canvas-dimensions">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-xl">
                <Scaling className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <span>3. 空間平面畫布尺寸設定 (Spatial Canvas Dimensions)</span>
                  <span className="text-[10px] font-mono font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                    {settings.canvasWidth || 1000} × {settings.canvasHeight || 500} px
                  </span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  自訂專櫃平面圖底層坐標系長寬與畫布比例，同步套用至後台空間編輯器與前台賣場地圖
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleUpdate({ canvasWidth: 1000, canvasHeight: 500 })}
              className="px-2.5 py-1 text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-lg text-xs font-medium border border-slate-200 transition flex items-center gap-1"
              title="還原為預設 1000 × 500 px"
            >
              <RotateCcw className="w-3 h-3" />
              <span>還原預設</span>
            </button>
          </div>

          {/* Aspect Ratio Preview Banner */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-44 h-24 bg-slate-200/80 rounded-xl border border-slate-300 flex items-center justify-center p-2 relative shrink-0 shadow-inner">
              <div 
                className="bg-white border-2 border-indigo-500 rounded-lg shadow-sm flex items-center justify-center transition-all duration-200"
                style={{
                  width: (settings.canvasWidth || 1000) >= (settings.canvasHeight || 500) ? '100%' : `${Math.max(30, ((settings.canvasWidth || 1000) / (settings.canvasHeight || 500)) * 100)}%`,
                  height: (settings.canvasHeight || 500) >= (settings.canvasWidth || 1000) ? '100%' : `${Math.max(30, ((settings.canvasHeight || 500) / (settings.canvasWidth || 1000)) * 100)}%`,
                  maxWidth: '100%',
                  maxHeight: '100%'
                }}
              >
                <div className="text-[10px] font-mono font-bold text-indigo-700 text-center px-1">
                  {settings.canvasWidth || 1000} × {settings.canvasHeight || 500}
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-2 text-xs w-full">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-medium">長寬比例</span>
                  <span className="font-mono font-bold text-slate-800 text-xs">
                    {((settings.canvasWidth || 1000) / (settings.canvasHeight || 500)).toFixed(2)} : 1
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-medium">總像素面積</span>
                  <span className="font-mono font-bold text-slate-800 text-xs">
                    {(((settings.canvasWidth || 1000) * (settings.canvasHeight || 500)) / 10000).toFixed(1)} 萬 px²
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-medium">地圖外牆界線</span>
                  <span className="font-mono font-bold text-indigo-600 text-xs">
                    {(settings.canvasWidth || 1000) - 40} × {(settings.canvasHeight || 500) - 40}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Canvas Width & Height Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Canvas Width */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                  <span>畫布寬度 (Canvas Width)</span>
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={600}
                    max={2500}
                    step={10}
                    value={settings.canvasWidth || 1000}
                    onChange={e => handleUpdate({ canvasWidth: Math.max(600, Math.min(3000, parseInt(e.target.value, 10) || 600)) })}
                    className="w-18 px-1.5 py-0.5 text-right font-mono font-bold text-xs bg-slate-50 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <span className="text-[10px] font-mono text-slate-400">px</span>
                </div>
              </div>

              <input
                type="range"
                min="600"
                max="2500"
                step="20"
                value={settings.canvasWidth || 1000}
                onChange={e => handleUpdate({ canvasWidth: parseInt(e.target.value, 10) })}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                id="slider-manager-canvas-width"
              />

              <div className="flex justify-between text-[10px] text-slate-400">
                <span>600px</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => handleUpdate({ canvasWidth: Math.max(600, (settings.canvasWidth || 1000) - 50) })}
                    className="px-1.5 py-0.2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-bold"
                  >
                    -50
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdate({ canvasWidth: Math.min(2500, (settings.canvasWidth || 1000) + 50) })}
                    className="px-1.5 py-0.2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-bold"
                  >
                    +50
                  </button>
                </div>
                <span>2500px</span>
              </div>
            </div>

            {/* Canvas Height */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  <span>畫布高度 (Canvas Height)</span>
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={400}
                    max={1800}
                    step={10}
                    value={settings.canvasHeight || 500}
                    onChange={e => handleUpdate({ canvasHeight: Math.max(400, Math.min(2000, parseInt(e.target.value, 10) || 400)) })}
                    className="w-18 px-1.5 py-0.5 text-right font-mono font-bold text-xs bg-slate-50 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <span className="text-[10px] font-mono text-slate-400">px</span>
                </div>
              </div>

              <input
                type="range"
                min="400"
                max="1800"
                step="20"
                value={settings.canvasHeight || 500}
                onChange={e => handleUpdate({ canvasHeight: parseInt(e.target.value, 10) })}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                id="slider-manager-canvas-height"
              />

              <div className="flex justify-between text-[10px] text-slate-400">
                <span>400px</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => handleUpdate({ canvasHeight: Math.max(400, (settings.canvasHeight || 500) - 50) })}
                    className="px-1.5 py-0.2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-bold"
                  >
                    -50
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdate({ canvasHeight: Math.min(1800, (settings.canvasHeight || 500) + 50) })}
                    className="px-1.5 py-0.2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-bold"
                  >
                    +50
                  </button>
                </div>
                <span>1800px</span>
              </div>
            </div>
          </div>

          {/* Quick Presets for Canvas Dimensions */}
          <div className="pt-2 border-t border-slate-100 space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-700">
              常用空間規格快捷預設 (Quick Canvas Presets)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: '標準展場 (1000×500)', w: 1000, h: 500, ratio: '2:1' },
                { label: '寬幅旗艦 (1200×600)', w: 1200, h: 600, ratio: '2:1' },
                { label: '超廣角展館 (1400×700)', w: 1400, h: 700, ratio: '2:1' },
                { label: '巨幕大會展 (1600×800)', w: 1600, h: 800, ratio: '2:1' },
                { label: '正方中庭 (800×800)', w: 800, h: 800, ratio: '1:1' },
                { label: '正方大跨距 (1000×1000)', w: 1000, h: 1000, ratio: '1:1' },
                { label: '縱深長型 (800×1000)', w: 800, h: 1000, ratio: '4:5' },
                { label: '長條地下街 (1500×500)', w: 1500, h: 500, ratio: '3:1' }
              ].map(preset => {
                const isMatch = (settings.canvasWidth || 1000) === preset.w && (settings.canvasHeight || 500) === preset.h;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleUpdate({ canvasWidth: preset.w, canvasHeight: preset.h })}
                    className={`p-2 rounded-xl text-left border transition ${
                      isMatch
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <div className="text-xs font-bold truncate">{preset.label.split(' (')[0]}</div>
                    <div className={`text-[10px] font-mono ${isMatch ? 'text-indigo-100' : 'text-slate-400'}`}>
                      {preset.w} × {preset.h} ({preset.ratio})
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* SECTION 4: SEARCH MODULE SIZING & DENSITY */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Search className="w-4 h-4" />
            </span>
            <div>
              <h4 className="text-xs font-bold text-slate-900">
                4. 查詢模組高度與卡片密度 (Search Panel Height & Density)
              </h4>
              <p className="text-[11px] text-slate-500">
                調整搜尋面板最小高度、商品結果列表卡片尺寸與緊湊度
              </p>
            </div>
          </div>

          {/* Search Min Height Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-bold text-slate-700">
                查詢面板最低高度 (Search Minimum Height)
              </label>
              <div className="flex items-center gap-1">
                <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                  {settings.searchMinHeight} px
                </span>
                <span className="text-[10px] text-slate-400">(範圍: 360 ~ 800px)</span>
              </div>
            </div>

            <input
              type="range"
              min="360"
              max="800"
              step="10"
              value={settings.searchMinHeight}
              onChange={e => handleUpdate({ searchMinHeight: parseInt(e.target.value, 10) })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              id="slider-search-height"
            />

            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                { label: '緊湊 (380px)', val: 380 },
                { label: '標準 (460px)', val: 460 },
                { label: '加高 (560px)', val: 560 },
                { label: '全高 (680px)', val: 680 }
              ].map(btn => (
                <button
                  key={btn.val}
                  type="button"
                  onClick={() => handleUpdate({ searchMinHeight: btn.val })}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
                    settings.searchMinHeight === btn.val
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Result Density Mode */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="block text-[11px] font-bold text-slate-700">
              搜尋列表排列密度 (Display Density)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { key: 'compact', label: '緊湊密集 (Compact)', desc: '一屏容納最多商品' },
                { key: 'comfortable', label: '標準舒適 (Comfortable)', desc: '兼顧圖片與文字間距' },
                { key: 'spacious', label: '寬敞大圖 (Spacious)', desc: '凸顯商品圖文與標籤' }
              ].map(item => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleUpdate({ searchDensity: item.key as any })}
                  className={`p-2.5 rounded-xl border text-left transition ${
                    settings.searchDensity === item.key
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <div className="text-xs font-bold">{item.label}</div>
                  <div className={`text-[10px] ${settings.searchDensity === item.key ? 'text-indigo-100' : 'text-slate-400'}`}>
                    {item.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Search Card Size */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="block text-[11px] font-bold text-slate-700">
              商品與專櫃項目卡片尺寸 (Result Card Size)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { key: 'sm', label: '小型 (Small)', desc: '文字緊湊' },
                { key: 'md', label: '中型 (Medium)', desc: '標準大小' },
                { key: 'lg', label: '大型 (Large)', desc: '大字體與大按鈕' }
              ].map(item => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleUpdate({ searchCardSize: item.key as any })}
                  className={`p-2 rounded-xl border text-left transition ${
                    settings.searchCardSize === item.key
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <div className="text-xs font-bold">{item.label}</div>
                  <div className={`text-[10px] ${settings.searchCardSize === item.key ? 'text-indigo-100' : 'text-slate-400'}`}>
                    {item.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* SECTION 5: USER EXPERIENCE & SHORTCUTS */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <span className="p-1.5 bg-amber-50 text-amber-600 rounded-xl">
                <SlidersHorizontal className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  5. 前台操作體驗與快捷尺寸切換
                </h4>
                <p className="text-[11px] text-slate-500">
                  控制前台導覽頁面是否顯示一鍵切換寬度的快捷浮動按鈕
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-3">
              <label className="flex items-start gap-3 p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={settings.showFrontendQuickResize}
                  onChange={e => handleUpdate({ showFrontendQuickResize: e.target.checked })}
                  className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <div>
                  <div className="text-xs font-bold text-slate-800">
                    在前台導覽介面顯示「快捷尺寸與比例切換器」
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    在前台頂部工具列提供顧客或賣場人員直接以點擊方式切換 4:8 / 5:7 / 6:6 / 7:5 / 全螢幕比例，便於現場臨機展示
                  </div>
                </div>
              </label>

              <div className="p-3.5 bg-indigo-50/50 rounded-2xl border border-indigo-100 text-xs text-indigo-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  <span>設定即時生效並自動儲存</span>
                </div>
                <p className="text-[11px] text-indigo-700">
                  所有尺寸與版面比例設定均會自動寫入瀏覽器快取 (Local Storage)，無論前台或後台刷新均保持最新配置。
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">當前配置已同步至前台</span>
            <button
              type="button"
              onClick={() => onShowToast('✨ 模組尺寸與版面配置已更新！')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-xs transition"
            >
              儲存並確認配置
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
