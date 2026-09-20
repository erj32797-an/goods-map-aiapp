import React, { useState } from 'react';
import { 
  Bookmark, 
  Plus, 
  Trash2, 
  Edit3, 
  Copy, 
  Check, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  ArrowUp, 
  ArrowDown, 
  Palette, 
  Search, 
  Filter, 
  Wand2, 
  Info, 
  X
} from 'lucide-react';
import { MapLegendItem, Booth, Facility } from '../types';
import { BOOTH_COLOR_OPTIONS, getBoothThemeStyles, DEFAULT_LEGENDS } from '../data';

interface MapLegendEditorProps {
  legends: MapLegendItem[];
  booths: Booth[];
  facilities?: Facility[];
  onUpdateLegends: (legends: MapLegendItem[]) => void;
  onShowToast: (msg: string) => void;
}

const CATEGORY_OPTIONS = ['分區主題', '公共設施', '狀態標示', '動線指引', '自訂標籤'];

export default function MapLegendEditor({
  legends,
  booths,
  facilities = [],
  onUpdateLegends,
  onShowToast
}: MapLegendEditorProps) {
  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showOnlyVisible, setShowOnlyVisible] = useState(false);

  // Form State for Adding New Legend
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLegendName, setNewLegendName] = useState('');
  const [newLegendColor, setNewLegendColor] = useState('teal');
  const [newLegendCategory, setNewLegendCategory] = useState('分區主題');
  const [newLegendDesc, setNewLegendDesc] = useState('');
  const [newLegendZoneCode, setNewLegendZoneCode] = useState('');
  const [newLegendVisible, setNewLegendVisible] = useState(true);
  const [formError, setFormError] = useState('');

  // Editing state for existing item
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('teal');
  const [editCategory, setEditCategory] = useState('分區主題');
  const [editDesc, setEditDesc] = useState('');
  const [editZoneCode, setEditZoneCode] = useState('');
  const [editVisible, setEditVisible] = useState(true);

  // Filtered Legends
  const filteredLegends = legends.filter(item => {
    const matchesSearch = !searchTerm || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesVisibility = !showOnlyVisible || item.visible;
    return matchesSearch && matchesCategory && matchesVisibility;
  });

  // Calculate statistics
  const totalCount = legends.length;
  const visibleCount = legends.filter(l => l.visible).length;
  const hiddenCount = totalCount - visibleCount;

  // Handlers
  const handleStartEdit = (item: MapLegendItem) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditColor(item.color);
    setEditCategory(item.category || '分區主題');
    setEditDesc(item.description || '');
    setEditZoneCode(item.zoneCode || '');
    setEditVisible(item.visible);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = (id: string) => {
    if (!editName.trim()) {
      onShowToast('❌ 圖例名稱不能為空');
      return;
    }

    const updated = legends.map(item => {
      if (item.id === id) {
        return {
          ...item,
          name: editName.trim(),
          color: editColor,
          category: editCategory,
          description: editDesc.trim(),
          zoneCode: editZoneCode.trim(),
          visible: editVisible
        };
      }
      return item;
    });

    onUpdateLegends(updated);
    setEditingId(null);
    onShowToast(`已更新圖例「${editName}」`);
  };

  const handleToggleVisibility = (id: string) => {
    const target = legends.find(l => l.id === id);
    if (!target) return;
    const newVis = !target.visible;
    const updated = legends.map(item => item.id === id ? { ...item, visible: newVis } : item);
    onUpdateLegends(updated);
    onShowToast(`已${newVis ? '顯示' : '隱藏'}圖例「${target.name}」`);
  };

  const handleQuickChangeColor = (id: string, newColor: string) => {
    const updated = legends.map(item => item.id === id ? { ...item, color: newColor } : item);
    onUpdateLegends(updated);
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const updated = [...legends];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    onUpdateLegends(updated);
  };

  const handleMoveDown = (index: number) => {
    if (index >= legends.length - 1) return;
    const updated = [...legends];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    onUpdateLegends(updated);
  };

  const handleDuplicate = (item: MapLegendItem) => {
    const newItem: MapLegendItem = {
      ...item,
      id: `legend_${Date.now()}`,
      name: `${item.name} (複製)`,
      visible: true
    };
    onUpdateLegends([...legends, newItem]);
    onShowToast(`已複製圖例「${item.name}」`);
  };

  const handleDelete = (id: string, name: string) => {
    const updated = legends.filter(item => item.id !== id);
    onUpdateLegends(updated);
    onShowToast(`已刪除圖例「${name}」`);
  };

  const handleAddNewLegend = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!newLegendName.trim()) {
      setFormError('請填寫圖例名稱');
      return;
    }

    const newItem: MapLegendItem = {
      id: `legend_${Date.now()}`,
      name: newLegendName.trim(),
      color: newLegendColor,
      category: newLegendCategory,
      description: newLegendDesc.trim(),
      zoneCode: newLegendZoneCode.trim(),
      visible: newLegendVisible
    };

    onUpdateLegends([...legends, newItem]);
    onShowToast(`✨ 已成功新增圖例「${newLegendName}」`);

    // Reset Form
    setNewLegendName('');
    setNewLegendDesc('');
    setNewLegendZoneCode('');
    setShowAddForm(false);
  };

  // Auto-Sync from current Booths Zones
  const handleAutoSyncFromBooths = () => {
    const uniqueZones = Array.from(new Set(booths.map(b => b.zone))).filter(Boolean);
    if (uniqueZones.length === 0) {
      onShowToast('目前商場尚無專櫃分區資料');
      return;
    }

    let addedCount = 0;
    const newItems: MapLegendItem[] = [...legends];

    uniqueZones.forEach(zoneName => {
      // Check if already exists
      const exists = newItems.some(item => 
        item.name.includes(zoneName) || zoneName.includes(item.name) ||
        (item.zoneCode && zoneName.includes(item.zoneCode))
      );

      if (!exists) {
        // Find booth example to get representative color
        const sampleBooth = booths.find(b => b.zone === zoneName);
        const color = sampleBooth?.color || 'teal';
        
        // Extract zone code if format like "A區: 時尚潮流"
        const zoneMatch = zoneName.match(/^([A-Z0-9]+)區/);
        const zoneCode = zoneMatch ? zoneMatch[1] : '';

        newItems.push({
          id: `legend_auto_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          name: zoneName,
          color: color,
          category: '分區主題',
          description: `包含 ${booths.filter(b => b.zone === zoneName).length} 個專櫃之展區主題`,
          visible: true,
          zoneCode: zoneCode
        });
        addedCount++;
      }
    });

    if (addedCount > 0) {
      onUpdateLegends(newItems);
      onShowToast(`⚡ 已自動從目前專櫃分區生成 ${addedCount} 個新圖例項目！`);
    } else {
      onShowToast('所有專櫃分區皆已有對應圖例，無需重複新增');
    }
  };

  // Auto-Sync from Facilities
  const handleAutoSyncFromFacilities = () => {
    if (facilities.length === 0) {
      onShowToast('目前商場尚無公共設施資料');
      return;
    }

    const uniqueFacilityNames = Array.from(new Set(facilities.map(f => f.name))).filter(Boolean);
    let addedCount = 0;
    const newItems: MapLegendItem[] = [...legends];

    uniqueFacilityNames.forEach(facName => {
      const exists = newItems.some(item => item.name === facName || item.name.includes(facName));
      if (!exists) {
        const sampleFac = facilities.find(f => f.name === facName);
        newItems.push({
          id: `legend_fac_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          name: facName,
          color: sampleFac?.color || 'indigo',
          category: '公共設施',
          description: sampleFac?.description || '賣場便利設施與服務站點',
          visible: true
        });
        addedCount++;
      }
    });

    if (addedCount > 0) {
      onUpdateLegends(newItems);
      onShowToast(`⚡ 已自動從公共設施新增 ${addedCount} 個圖例項目！`);
    } else {
      onShowToast('所有公共設施皆已有對應圖例');
    }
  };

  // Reset to default legends
  const handleResetDefaults = () => {
    onUpdateLegends(DEFAULT_LEGENDS);
    onShowToast('✨ 已還原為系統預設地圖圖例清單！');
  };

  return (
    <div className="space-y-6" id="map-legend-editor-root">
      
      {/* Top Header Card */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4.5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Bookmark className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold text-slate-900">
              地圖圖例設定與自訂編輯中心
            </h3>
            <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
              即時同步前台導覽
            </span>
          </div>
          <p className="text-xs text-slate-500 font-sans">
            自訂賣場平面圖下方的分區色塊、設施標誌與文字說明，顧客在前台點擊圖例可直接定位對應展區
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            type="button"
            onClick={handleAutoSyncFromBooths}
            className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
            title="掃描商場所有專櫃分區，若尚未設定圖例則自動建立"
            id="btn-sync-legends-booths"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>依專櫃分區自動生成</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition ${
              showAddForm 
                ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' 
                : 'bg-indigo-600 hover:bg-indigo-500 text-white ring-2 ring-indigo-600/20'
            }`}
            id="btn-toggle-add-legend"
          >
            <Plus className="w-4 h-4" />
            <span>{showAddForm ? '收合新增表單' : '✨ 新增自訂圖例'}</span>
          </button>

          <button
            type="button"
            onClick={handleResetDefaults}
            className="p-2 bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-700 border border-slate-200 rounded-xl transition"
            title="還原預設圖例"
            id="btn-reset-legends-default"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Statistics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200/80 p-3 rounded-2xl shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 mb-0.5">總圖例項目數</div>
          <div className="text-lg font-mono font-bold text-slate-800">{totalCount} <span className="text-xs font-normal text-slate-400">項</span></div>
        </div>
        <div className="bg-white border border-slate-200/80 p-3 rounded-2xl shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 mb-0.5">前台啟用顯示中</div>
          <div className="text-lg font-mono font-bold text-emerald-600">{visibleCount} <span className="text-xs font-normal text-slate-400">項</span></div>
        </div>
        <div className="bg-white border border-slate-200/80 p-3 rounded-2xl shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 mb-0.5">隱藏/未啟用</div>
          <div className="text-lg font-mono font-bold text-slate-400">{hiddenCount} <span className="text-xs font-normal text-slate-400">項</span></div>
        </div>
        <div className="bg-white border border-slate-200/80 p-3 rounded-2xl shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 mb-0.5">支援專櫃色系</div>
          <div className="text-lg font-mono font-bold text-indigo-600">{BOOTH_COLOR_OPTIONS.length} <span className="text-xs font-normal text-slate-400">色</span></div>
        </div>
      </div>

      {/* Live Map Legend Preview Bar Box */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2.5" id="live-legend-preview-box">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1 bg-indigo-50 text-indigo-600 rounded-md">
              <Eye className="w-3.5 h-3.5" />
            </span>
            <h4 className="text-xs font-bold text-slate-800">
              前台導覽地圖底部圖例欄 • 即時外觀預覽 (Live Preview)
            </h4>
          </div>
          <span className="text-[11px] text-slate-400">
            僅顯示勾選「啟用顯示」之項目 ({visibleCount} 項)
          </span>
        </div>

        {/* The rendered bar preview */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-wrap justify-center items-center gap-x-3 gap-y-2 text-xs text-slate-600 min-h-[46px]">
          <span className="font-bold text-slate-500 mr-0.5 flex items-center gap-1">
            <span>地圖圖例:</span>
          </span>
          {legends.filter(l => l.visible).length === 0 ? (
            <span className="text-slate-400 text-xs italic">目前無啟用的圖例，請在下方勾選「啟用顯示」</span>
          ) : (
            legends.filter(l => l.visible).map(legend => {
              const styles = getBoothThemeStyles(legend.color);
              return (
                <div
                  key={legend.id}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg border transition shadow-2xs"
                  style={{
                    backgroundColor: styles.fill,
                    borderColor: styles.stroke + '40',
                    color: styles.text
                  }}
                  title={legend.description || legend.name}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-sm shrink-0 border"
                    style={{
                      backgroundColor: styles.hex,
                      borderColor: styles.stroke
                    }}
                  />
                  <span className="font-semibold">{legend.name}</span>
                  {legend.category && legend.category !== '分區主題' && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-white/80 text-slate-500 font-normal">
                      {legend.category}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add New Legend Collapsible Form */}
      {showAddForm && (
        <div className="bg-indigo-50/40 border-2 border-indigo-200 rounded-3xl p-5 shadow-sm space-y-4 animate-fadeIn" id="add-legend-form-box">
          <div className="flex justify-between items-center pb-3 border-b border-indigo-100">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-indigo-600 text-white rounded-xl shadow-xs">
                <Bookmark className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  新增地圖圖例項目 (Add Map Legend)
                </h4>
                <p className="text-[11px] text-slate-500">
                  設定圖例名稱、代表色系與關聯分區，顧客將可清楚識別各區特色
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-indigo-100/50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleAddNewLegend} className="space-y-4">
            {formError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 rounded-xl text-xs flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Legend Name */}
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  圖例顯示名稱 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newLegendName}
                  onChange={e => setNewLegendName(e.target.value)}
                  placeholder="例如: 時尚潮流 (A區) 或 親子友善設施"
                  className="w-full bg-white px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-indigo-500 font-medium"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">圖例分類</label>
                <select
                  value={newLegendCategory}
                  onChange={e => setNewLegendCategory(e.target.value)}
                  className="w-full bg-white px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-indigo-500 font-medium"
                >
                  {CATEGORY_OPTIONS.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Associated Zone Code */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  關聯分區代碼 (選填)
                </label>
                <input
                  type="text"
                  value={newLegendZoneCode}
                  onChange={e => setNewLegendZoneCode(e.target.value)}
                  placeholder="例如: A 或 D"
                  className="w-full bg-white px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              {/* Description */}
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  圖例備註說明 / 提示 (選填)
                </label>
                <input
                  type="text"
                  value={newLegendDesc}
                  onChange={e => setNewLegendDesc(e.target.value)}
                  placeholder="例如: 流行男女服飾、鞋包與設計飾品專櫃"
                  className="w-full bg-white px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Color Selection Palette */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-bold text-slate-700">
                  代表色系選擇 ({BOOTH_COLOR_OPTIONS.length} 色)
                </label>
                <span className="font-mono text-[11px] text-indigo-600 font-bold">
                  當前色系: {BOOTH_COLOR_OPTIONS.find(o => o.key === newLegendColor)?.name || newLegendColor}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 p-2.5 bg-white border border-slate-200 rounded-xl">
                {BOOTH_COLOR_OPTIONS.map(opt => {
                  const isCur = newLegendColor === opt.key;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setNewLegendColor(opt.key)}
                      title={opt.name}
                      style={{ backgroundColor: opt.hex }}
                      className={`w-6 h-6 rounded-md transition-all flex items-center justify-center shadow-xs ${
                        isCur ? 'ring-2 ring-indigo-600 ring-offset-1 scale-110 z-10' : 'hover:scale-110 opacity-85 hover:opacity-100'
                      }`}
                    >
                      {isCur && <Check className="w-3.5 h-3.5 text-white drop-shadow-xs" strokeWidth={3} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Visibility toggle & Submit */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={newLegendVisible}
                  onChange={e => setNewLegendVisible(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span>立即啟用並顯示於前台導覽地圖底部圖例欄</span>
              </label>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="w-full sm:w-auto px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center justify-center gap-1.5"
                  id="btn-submit-new-legend"
                >
                  <Plus className="w-4 h-4" />
                  <span>確認新增圖例</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full md:w-auto flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="搜尋圖例名稱、分類或備註..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:bg-white focus:border-indigo-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700 outline-none focus:bg-white focus:border-indigo-500 font-medium"
          >
            <option value="all">全部分類 ({totalCount})</option>
            {CATEGORY_OPTIONS.map(cat => (
              <option key={cat} value={cat}>
                {cat} ({legends.filter(l => l.category === cat).length})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-600 font-medium">
            <input
              type="checkbox"
              checked={showOnlyVisible}
              onChange={e => setShowOnlyVisible(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
            />
            <span>只看已啟用 ({visibleCount})</span>
          </label>

          <span className="text-xs text-slate-400 font-mono">
            顯示 {filteredLegends.length} / {totalCount} 項
          </span>
        </div>
      </div>

      {/* Main Legend Items Table & Management List */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-xs border-collapse min-w-[640px]">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-bold">
              <tr>
                <th className="py-3 px-3 w-12 text-center">排序</th>
                <th className="py-3 px-3 w-20">狀態</th>
                <th className="py-3 px-3">圖例名稱與即時樣式</th>
                <th className="py-3 px-3 w-28">代表色系</th>
                <th className="py-3 px-3 w-28">分類標籤</th>
                <th className="py-3 px-3">備註說明</th>
                <th className="py-3 px-3 text-right w-36">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLegends.map((item, index) => {
                const isEditing = editingId === item.id;
                const originalIndex = legends.findIndex(l => l.id === item.id);
                const styles = getBoothThemeStyles(item.color);

                if (isEditing) {
                  return (
                    <tr key={item.id} className="bg-indigo-50/50">
                      <td className="py-3 px-3 text-center font-mono text-slate-400">
                        {originalIndex + 1}
                      </td>
                      <td className="py-3 px-3">
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editVisible}
                            onChange={e => setEditVisible(e.target.checked)}
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-[11px] font-bold">{editVisible ? '顯示' : '隱藏'}</span>
                        </label>
                      </td>
                      <td className="py-3 px-3">
                        <input
                          type="text"
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          className="w-full bg-white px-2 py-1 border border-indigo-300 rounded-lg text-xs font-bold text-slate-900 outline-none"
                          placeholder="圖例名稱"
                        />
                      </td>
                      <td className="py-3 px-3">
                        <select
                          value={editColor}
                          onChange={e => setEditColor(e.target.value)}
                          className="w-full bg-white px-2 py-1 border border-indigo-300 rounded-lg text-xs font-medium outline-none"
                        >
                          {BOOTH_COLOR_OPTIONS.map(opt => (
                            <option key={opt.key} value={opt.key}>{opt.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-3">
                        <select
                          value={editCategory}
                          onChange={e => setEditCategory(e.target.value)}
                          className="w-full bg-white px-2 py-1 border border-indigo-300 rounded-lg text-xs font-medium outline-none"
                        >
                          {CATEGORY_OPTIONS.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-3">
                        <input
                          type="text"
                          value={editDesc}
                          onChange={e => setEditDesc(e.target.value)}
                          className="w-full bg-white px-2 py-1 border border-indigo-300 rounded-lg text-xs text-slate-700 outline-none"
                          placeholder="備註說明"
                        />
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(item.id)}
                            className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition shadow-xs flex items-center gap-1"
                            title="儲存修改"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>儲存</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="p-1.5 bg-white hover:bg-slate-200 text-slate-600 border border-slate-300 rounded-lg text-xs transition"
                            title="取消"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr 
                    key={item.id} 
                    className={`hover:bg-slate-50/80 transition-colors ${!item.visible ? 'opacity-60 bg-slate-50/40' : ''}`}
                  >
                    {/* Reorder Buttons */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex flex-col items-center justify-center gap-0.5">
                        <button
                          type="button"
                          disabled={originalIndex === 0}
                          onClick={() => handleMoveUp(originalIndex)}
                          className="p-0.5 text-slate-400 hover:text-indigo-600 disabled:opacity-20 hover:bg-slate-100 rounded"
                          title="上移順序"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <span className="font-mono text-[10px] font-bold text-slate-400">
                          {originalIndex + 1}
                        </span>
                        <button
                          type="button"
                          disabled={originalIndex === legends.length - 1}
                          onClick={() => handleMoveDown(originalIndex)}
                          className="p-0.5 text-slate-400 hover:text-indigo-600 disabled:opacity-20 hover:bg-slate-100 rounded"
                          title="下移順序"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                    </td>

                    {/* Visibility Switch */}
                    <td className="py-3 px-3">
                      <button
                        type="button"
                        onClick={() => handleToggleVisibility(item.id)}
                        className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition ${
                          item.visible 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100' 
                            : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                        }`}
                        title={item.visible ? '點擊隱藏圖例' : '點擊啟用圖例'}
                      >
                        {item.visible ? (
                          <>
                            <Eye className="w-3 h-3 text-emerald-600" />
                            <span>顯示中</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3 text-slate-400" />
                            <span>已隱藏</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Legend Name & Visual Badge */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                          style={{
                            backgroundColor: styles.fill,
                            borderColor: styles.stroke + '50',
                            color: styles.text
                          }}
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-xs shrink-0"
                            style={{ backgroundColor: styles.hex }}
                          />
                          <span>{item.name}</span>
                        </div>
                        {item.zoneCode && (
                          <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                            {item.zoneCode}區
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Color Swatch / Quick Selector */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-3.5 h-3.5 rounded-full inline-block shrink-0 shadow-2xs border border-white"
                          style={{ backgroundColor: styles.hex }}
                        />
                        <span className="text-xs font-medium text-slate-700">
                          {styles.name}
                        </span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-3">
                      <span className="text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                        {item.category || '分區主題'}
                      </span>
                    </td>

                    {/* Description */}
                    <td className="py-3 px-3 text-slate-500 text-xs max-w-xs truncate">
                      {item.description || '-'}
                    </td>

                    {/* Action buttons */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(item)}
                          className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-indigo-600 rounded-lg transition"
                          title="編輯圖例內容"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDuplicate(item)}
                          className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-indigo-600 rounded-lg transition"
                          title="複製此圖例"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id, item.name)}
                          className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition"
                          title="刪除此圖例"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredLegends.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    <Bookmark className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="font-semibold text-sm">找不到符合條件的地圖圖例項目</p>
                    <p className="text-xs mt-1">您可以點擊上方「新增自訂圖例」或「依專櫃分區自動生成」快速建立</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
