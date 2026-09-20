import React from 'react';
import { 
  Plus, 
  Store, 
  Compass, 
  Layers, 
  Trash2, 
  RotateCcw, 
  Eraser, 
  Download, 
  UploadCloud, 
  FolderOpen
} from 'lucide-react';
import { Facility, Walkway, Booth } from '../../types';

interface FacilityToolbarProps {
  activeMode: 'booth' | 'facility' | 'walkway';
  onChangeMode: (mode: 'booth' | 'facility' | 'walkway') => void;
  onAddFacility: (type: Facility['type'], name: string, color: string, width: number, height: number, description?: string) => void;
  onAddWalkway: (name: string, type: Walkway['type'], width: number, height: number, color?: string) => void;
  onAddNewBoothQuick: () => void;
  onOpenPresets: () => void;
  onExportLayout?: () => void;
  onImportClick?: () => void;
  onClearFacilities?: () => void;
  onClearWalkways?: () => void;
  onClearBooths?: () => void;
  onClearAllBackground?: () => void;
  onResetDefaultFacilities?: () => void;
  onResetDefaultWalkways?: () => void;
  facilitiesCount?: number;
  walkwaysCount?: number;
  boothsCount?: number;
}

export default function FacilityToolbar({
  activeMode,
  onChangeMode,
  onAddFacility,
  onAddWalkway,
  onAddNewBoothQuick,
  onOpenPresets,
  onExportLayout,
  onImportClick,
  onClearFacilities,
  onClearWalkways,
  onClearBooths,
  onClearAllBackground,
  onResetDefaultFacilities,
  onResetDefaultWalkways,
  facilitiesCount = 0,
  walkwaysCount = 0,
  boothsCount = 0
}: FacilityToolbarProps) {

  const FACILITY_TEMPLATES = [
    { type: 'nursery' as const, name: '🍼 獨立哺乳育嬰室', color: 'pink', width: 80, height: 40, icon: '🍼', desc: '配備溫水機與獨立哺乳室' },
    { type: 'restroom' as const, name: '🚻 男女友善洗手間', color: 'slate', width: 75, height: 35, icon: '🚻', desc: '無障礙廁所與洗手台' },
    { type: 'entrance' as const, name: '🚪 ★ 主入口迎賓門廳', color: 'emerald', width: 100, height: 35, icon: '🚪', desc: '迎賓出入口大門' },
    { type: 'info' as const, name: 'ℹ 顧客服務諮詢台', color: 'blue', width: 80, height: 80, icon: 'ℹ', desc: '諮詢、廣播與退稅服務' },
    { type: 'escalator' as const, name: '🪜 雙向手扶梯', color: 'slate', width: 60, height: 40, icon: '🪜', desc: '通往上下樓層手扶梯' },
    { type: 'elevator' as const, name: '🛗 景觀透明電梯', color: 'indigo', width: 60, height: 40, icon: '🛗', desc: '各樓層無障礙直達梯' },
    { type: 'cafe' as const, name: '☕ 休憩咖啡座', color: 'amber', width: 130, height: 60, icon: '☕', desc: '顧客歇腳休閒座位區' },
    { type: 'atm' as const, name: '🏧 ATM 自動提款機', color: 'emerald', width: 70, height: 30, icon: '🏧', desc: '跨行提款與存款服務' },
    { type: 'exit' as const, name: '🚨 安全逃生口', color: 'rose', width: 70, height: 30, icon: '🚨', desc: '緊急逃生疏散出口' },
    { type: 'pillar' as const, name: '🏛️ 柱子', color: 'slate', width: 30, height: 30, icon: '🏛️', desc: '建築結構承重柱、方柱' },
    { type: 'office' as const, name: '💼 辦公區', color: 'teal', width: 100, height: 50, icon: '💼', desc: '商場營運管理室與員工辦公區' }
  ];

  const WALKWAY_TEMPLATES = [
    { name: '東西向中央主街道 (橫貫大道)', type: 'primary' as const, width: 880, height: 40, color: '#f1f5f9', desc: '貫穿全場寬度 40px 之主要大道' },
    { name: '南北向迎賓大道 (中庭大道)', type: 'primary' as const, width: 60, height: 420, color: '#f1f5f9', desc: '迎賓門廳縱向 60px 主要大道' },
    { name: '迎賓門廳玄關街道', type: 'entrance' as const, width: 180, height: 40, color: '#e2e8f0', desc: '大門出入口集散迎賓街道' },
    { name: '專櫃側邊逛街通道 (支線走道)', type: 'secondary' as const, width: 200, height: 25, color: '#f1f5f9', desc: '各分區櫃位間次要走道' },
    { name: '中庭十字穿廊街道', type: 'primary' as const, width: 360, height: 30, color: '#f1f5f9', desc: '連接核心設施的十字街道' },
    { name: '自訂方型街道休閒區塊', type: 'custom' as const, width: 120, height: 120, color: '#f8fafc', desc: '自由長寬之自訂街道區塊' }
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-4" id="facility-toolbar-container">
      
      {/* Mode Switcher Tabs & Quick Clear Tools */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl flex-wrap">
          <button
            onClick={() => onChangeMode('booth')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              activeMode === 'booth'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            id="tab-mode-booth"
          >
            <Store className="w-3.5 h-3.5 shrink-0" />
            <span>專櫃格局設計</span>
            <span className="px-1.5 py-0.2 bg-indigo-50 text-indigo-600 rounded text-[10px] font-mono shrink-0">{boothsCount}</span>
          </button>

          <button
            onClick={() => onChangeMode('facility')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              activeMode === 'facility'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            id="tab-mode-facility"
          >
            <Compass className="w-3.5 h-3.5 shrink-0" />
            <span>公共設施元件</span>
            <span className="px-1.5 py-0.2 bg-blue-50 text-blue-600 rounded text-[10px] font-mono shrink-0">{facilitiesCount}</span>
          </button>

          <button
            onClick={() => onChangeMode('walkway')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              activeMode === 'walkway'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            id="tab-mode-walkway"
          >
            <Layers className="w-3.5 h-3.5 shrink-0" />
            <span>動線與街道規劃</span>
            <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-600 rounded text-[10px] font-mono shrink-0">{walkwaysCount}</span>
          </button>
        </div>

        {/* Global Background Clear, Export/Import, & Blueprint Presets */}
        <div className="flex items-center gap-2 flex-wrap">
          {onClearAllBackground && (
            <button
              onClick={onClearAllBackground}
              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1 transition"
              title="一鍵清空所有背景設施與街道走道"
              id="btn-clear-all-background"
            >
              <Eraser className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">清空背景元件</span>
            </button>
          )}

          {onExportLayout && (
            <button
              onClick={onExportLayout}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
              title="匯出平面圖檔案 (.json)"
              id="btn-quick-export-toolbar"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>匯出檔案</span>
            </button>
          )}

          {onImportClick && (
            <button
              onClick={onImportClick}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
              title="匯入平面圖檔案 (.json)"
              id="btn-quick-import-toolbar"
            >
              <UploadCloud className="w-3.5 h-3.5 text-indigo-600" />
              <span>匯入檔案</span>
            </button>
          )}

          <button
            onClick={onOpenPresets}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
            id="btn-open-floorplan-presets"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>版本庫與藍圖範本</span>
          </button>
        </div>
      </div>

      {/* Mode Dependent Quick Elements List */}
      {activeMode === 'booth' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs flex-wrap gap-2">
            <div>
              <span className="font-bold text-slate-700">專櫃操作指令 (Booth Tools)</span>
              <span className="text-slate-400 ml-2">點擊畫布專櫃可進行移動、8向縮放、修改分區與商品關聯</span>
            </div>
            {onClearBooths && boothsCount > 0 && (
              <button
                onClick={onClearBooths}
                className="px-2.5 py-1 text-[11px] text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg font-bold flex items-center gap-1 transition"
                id="btn-clear-all-booths"
              >
                <Trash2 className="w-3 h-3" />
                <span>清空所有專櫃 ({boothsCount})</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onAddNewBoothQuick}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
              id="btn-quick-add-booth"
            >
              <Plus className="w-4 h-4" />
              <span>新增標準專櫃 (150×100 px)</span>
            </button>
          </div>
        </div>
      )}

      {activeMode === 'facility' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs flex-wrap gap-2">
            <div>
              <span className="font-bold text-slate-700">公共設施元件庫 (包含哺乳室、洗手間、服務台等)</span>
              <span className="text-slate-400 ml-2">點擊即可快速新增至畫布，支援拖曳縮放、修改屬性與清空</span>
            </div>
            
            <div className="flex items-center gap-1.5">
              {onResetDefaultFacilities && (
                <button
                  onClick={onResetDefaultFacilities}
                  className="px-2.5 py-1 text-[11px] text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-lg font-bold flex items-center gap-1 transition"
                  id="btn-reset-facilities"
                  title="重設為預設商場設施"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>還原預設設施</span>
                </button>
              )}
              {onClearFacilities && facilitiesCount > 0 && (
                <button
                  onClick={onClearFacilities}
                  className="px-2.5 py-1 text-[11px] text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg font-bold flex items-center gap-1 transition"
                  id="btn-clear-facilities"
                  title="清空所有公共設施"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>清空所有設施 ({facilitiesCount})</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
            {FACILITY_TEMPLATES.map((item, idx) => (
              <button
                key={idx}
                onClick={() => onAddFacility(item.type, item.name, item.color, item.width, item.height, item.desc)}
                className={`p-2.5 border rounded-xl text-left transition group shadow-xs ${
                  item.type === 'nursery' 
                    ? 'border-pink-300 bg-pink-50/40 hover:bg-pink-50' 
                    : item.type === 'pillar'
                    ? 'border-slate-300 bg-slate-100/80 hover:bg-slate-200/70 hover:border-slate-400'
                    : item.type === 'office'
                    ? 'border-teal-300 bg-teal-50/40 hover:bg-teal-50 hover:border-teal-400'
                    : 'bg-slate-50 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/70'
                }`}
                title={`${item.name} (${item.width}×${item.height}px)`}
                id={`btn-add-facility-${item.type}`}
              >
                <div className="flex items-start gap-1.5 mb-1">
                  <span className="text-sm shrink-0">{item.icon}</span>
                  <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 font-sans break-words leading-tight">
                    {item.name}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 font-sans break-words leading-normal">
                  {item.desc}
                </div>
                <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                  {item.width} × {item.height} px
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {activeMode === 'walkway' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs flex-wrap gap-2">
            <div>
              <span className="font-bold text-slate-700">動線與街道規劃 (街道、通道與人行大道)</span>
              <span className="text-slate-400 ml-2">規劃主要街道與分區通道，可自由拖曳、調整寬度底色與清空</span>
            </div>

            <div className="flex items-center gap-1.5">
              {onResetDefaultWalkways && (
                <button
                  onClick={onResetDefaultWalkways}
                  className="px-2.5 py-1 text-[11px] text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-lg font-bold flex items-center gap-1 transition"
                  id="btn-reset-walkways"
                  title="重設為預設街道動線"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>還原預設街道</span>
                </button>
              )}
              {onClearWalkways && walkwaysCount > 0 && (
                <button
                  onClick={onClearWalkways}
                  className="px-2.5 py-1 text-[11px] text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg font-bold flex items-center gap-1 transition"
                  id="btn-clear-walkways"
                  title="清空所有街道走道"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>清空所有街道 ({walkwaysCount})</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {WALKWAY_TEMPLATES.map((item, idx) => (
              <button
                key={idx}
                onClick={() => onAddWalkway(item.name, item.type, item.width, item.height, item.color)}
                className="p-3 bg-slate-50 hover:bg-indigo-50/70 border border-slate-200 hover:border-indigo-300 rounded-xl text-left transition group shadow-xs"
                id={`btn-add-walkway-${idx}`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 font-sans break-words leading-tight">
                    {item.name}
                  </span>
                  <span className="text-[10px] bg-slate-200/80 px-1.5 py-0.5 rounded text-slate-600 font-mono shrink-0">
                    {item.type}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-sans break-words leading-normal">
                  {item.desc}
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-1">
                  預設尺寸：{item.width} × {item.height} px
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

