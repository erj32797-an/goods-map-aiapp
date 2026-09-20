import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Check, 
  X, 
  RotateCcw, 
  Maximize2, 
  LayoutGrid, 
  ShoppingBag, 
  AlertTriangle, 
  ArrowRight, 
  Layers, 
  Store, 
  Compass, 
  Download, 
  UploadCloud, 
  Save, 
  Clock, 
  Trash2, 
  Copy, 
  Edit2, 
  FolderOpen, 
  Tag, 
  CheckCircle2, 
  FileJson
} from 'lucide-react';
import { Booth, Facility, Walkway, FloorPlanVersion, FloorPlanExportData } from '../../types';
import { FLOOR_PLAN_PRESETS, DEFAULT_BOOTHS, DEFAULT_FACILITIES, DEFAULT_WALKWAYS } from '../../data';

const STORAGE_KEY_VERSIONS = 'MALL_FLOORPLAN_SAVED_VERSIONS_V2';

interface FloorPlanPresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyLayout: (booths: Booth[], facilities: Facility[], walkways: Walkway[], versionTitle?: string) => void;
  currentBooths: Booth[];
  currentFacilities: Facility[];
  currentWalkways: Walkway[];
  onShowToast: (msg: string) => void;
}

export default function FloorPlanPresetModal({
  isOpen,
  onClose,
  onApplyLayout,
  currentBooths,
  currentFacilities,
  currentWalkways,
  onShowToast
}: FloorPlanPresetModalProps) {
  // Tabs: 'versions' (自訂版本) | 'presets' (建築藍圖) | 'io' (檔案匯入匯出)
  const [activeTab, setActiveTab] = useState<'versions' | 'presets' | 'io'>('versions');

  // Saved versions state (LocalStorage persistent)
  const [savedVersions, setSavedVersions] = useState<FloorPlanVersion[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);

  // New version saving form state
  const [isSavingNewVersion, setIsSavingNewVersion] = useState(false);
  const [newVersionName, setNewVersionName] = useState('');
  const [newVersionDesc, setNewVersionDesc] = useState('');
  const [newVersionTag, setNewVersionTag] = useState('特展動線');

  // Renaming version state
  const [editingVersionId, setEditingVersionId] = useState<string | null>(null);
  const [editingVersionName, setEditingVersionName] = useState('');

  // Presets state
  const [selectedPresetId, setSelectedPresetId] = useState<string>(FLOOR_PLAN_PRESETS[0]?.id || '');
  const [showConfirmApply, setShowConfirmApply] = useState(false);

  // Import JSON state
  const [importJsonText, setImportJsonText] = useState('');
  const [importParsedData, setImportParsedData] = useState<FloorPlanExportData | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load versions from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_VERSIONS);
      if (stored) {
        const parsed = JSON.parse(stored) as FloorPlanVersion[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSavedVersions(parsed);
          setSelectedVersionId(parsed[0].id);
          return;
        }
      }

      // Initialize with default rich standard versions
      const initialDefaultVersions: FloorPlanVersion[] = [
        {
          id: 'ver_standard_default',
          name: '2026 旗艦百貨標準格局 (含哺育室/洗手間)',
          description: '包含完整東南西北 4 向主通道、哺育室、服務台、手扶梯與 8 個核心精品專櫃',
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          booths: DEFAULT_BOOTHS,
          facilities: DEFAULT_FACILITIES,
          walkways: DEFAULT_WALKWAYS,
          tags: ['標準格局', '旗艦店']
        },
        {
          id: 'ver_gourmet_market',
          name: '週末主題文創與美食市集動線',
          description: '優化中央廣場空間，增設咖啡休閒座、主入口迎賓走道與高密度攤位配置',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          booths: FLOOR_PLAN_PRESETS[0]?.booths || DEFAULT_BOOTHS,
          facilities: FLOOR_PLAN_PRESETS[0]?.facilities || DEFAULT_FACILITIES,
          walkways: FLOOR_PLAN_PRESETS[0]?.walkways || DEFAULT_WALKWAYS,
          tags: ['週末市集', '高人流']
        }
      ];

      setSavedVersions(initialDefaultVersions);
      setSelectedVersionId(initialDefaultVersions[0].id);
      localStorage.setItem(STORAGE_KEY_VERSIONS, JSON.stringify(initialDefaultVersions));
    } catch (e) {
      console.error('Failed to load floor plan versions from storage', e);
    }
  }, []);

  // Save version helper
  const persistVersions = (versions: FloorPlanVersion[]) => {
    setSavedVersions(versions);
    try {
      localStorage.setItem(STORAGE_KEY_VERSIONS, JSON.stringify(versions));
    } catch (e) {
      console.error('Failed to persist floor plan versions', e);
    }
  };

  if (!isOpen) return null;

  const selectedPreset = FLOOR_PLAN_PRESETS.find(p => p.id === selectedPresetId) || FLOOR_PLAN_PRESETS[0];
  const selectedVersion = savedVersions.find(v => v.id === selectedVersionId) || savedVersions[0];

  // ----------------------------------------------------
  // Version Handlers
  // ----------------------------------------------------
  const handleSaveCurrentAsVersion = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const name = newVersionName.trim() || `自訂佈局快照 ${new Date().toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}`;
    
    const newVer: FloorPlanVersion = {
      id: `ver_${Date.now()}`,
      name,
      description: newVersionDesc.trim() || `包含 ${currentBooths.length} 個專櫃、${currentFacilities.length} 個設施與 ${currentWalkways.length} 條通道`,
      createdAt: new Date().toISOString(),
      booths: JSON.parse(JSON.stringify(currentBooths)),
      facilities: JSON.parse(JSON.stringify(currentFacilities)),
      walkways: JSON.parse(JSON.stringify(currentWalkways)),
      tags: newVersionTag ? [newVersionTag] : ['自訂版本']
    };

    const updated = [newVer, ...savedVersions];
    persistVersions(updated);
    setSelectedVersionId(newVer.id);
    setIsSavingNewVersion(false);
    setNewVersionName('');
    setNewVersionDesc('');
    onShowToast(`已成功將目前格局儲存為「${newVer.name}」版本！`);
  };

  const handleApplyVersion = (version: FloorPlanVersion) => {
    onApplyLayout(version.booths, version.facilities, version.walkways, version.name);
    setShowConfirmApply(false);
    onClose();
    onShowToast(`已成功套用「${version.name}」版本！`);
  };

  const handleDeleteVersion = (id: string, name: string) => {
    const remaining = savedVersions.filter(v => v.id !== id);
    persistVersions(remaining);
    if (selectedVersionId === id) {
      setSelectedVersionId(remaining[0]?.id || null);
    }
    onShowToast(`已刪除自訂版本「${name}」`);
  };

  const handleDuplicateVersion = (version: FloorPlanVersion) => {
    const duplicate: FloorPlanVersion = {
      ...version,
      id: `ver_${Date.now()}`,
      name: `${version.name} (複本)`,
      createdAt: new Date().toISOString()
    };
    const updated = [duplicate, ...savedVersions];
    persistVersions(updated);
    setSelectedVersionId(duplicate.id);
    onShowToast(`已複製版本「${duplicate.name}」`);
  };

  const handleStartRenameVersion = (version: FloorPlanVersion) => {
    setEditingVersionId(version.id);
    setEditingVersionName(version.name);
  };

  const handleCommitRenameVersion = (id: string) => {
    if (!editingVersionName.trim()) {
      setEditingVersionId(null);
      return;
    }
    const updated = savedVersions.map(v => v.id === id ? { ...v, name: editingVersionName.trim(), updatedAt: new Date().toISOString() } : v);
    persistVersions(updated);
    setEditingVersionId(null);
    onShowToast('已更新版本名稱');
  };

  // ----------------------------------------------------
  // Export & Import Handlers
  // ----------------------------------------------------
  const handleExportCurrentLayout = (customName?: string) => {
    const exportData: FloorPlanExportData = {
      app: 'MallSpatialArchitect',
      version: '2.0',
      exportedAt: new Date().toISOString(),
      name: customName || '商場平面圖空間配置',
      booths: currentBooths,
      facilities: currentFacilities,
      walkways: currentWalkways
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    const filename = `FloorPlan_Layout_${new Date().toISOString().slice(0, 10)}.json`;
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onShowToast(`已成功匯出平面圖檔案：${filename}`);
  };

  const handleExportSingleVersion = (version: FloorPlanVersion) => {
    const exportData: FloorPlanExportData = {
      app: 'MallSpatialArchitect',
      version: '2.0',
      exportedAt: new Date().toISOString(),
      name: version.name,
      description: version.description,
      booths: version.booths,
      facilities: version.facilities,
      walkways: version.walkways
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    const safeName = version.name.replace(/[/\\?%*:|"<>]/g, '_');
    const filename = `FloorPlan_${safeName}.json`;
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onShowToast(`已匯出「${version.name}」檔案`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        setImportJsonText(content);
        parseAndValidateImportData(content);
      } catch (err) {
        setImportError('檔案讀取失敗，請確認檔案格式是否正確。');
      }
    };
    reader.readAsText(file);
  };

  const parseAndValidateImportData = (jsonStr: string) => {
    setImportError(null);
    setImportParsedData(null);
    try {
      const data = JSON.parse(jsonStr);
      if (!data || typeof data !== 'object') {
        throw new Error('無效的 JSON 結構');
      }

      // Check booths or facilities or walkways array
      const booths = Array.isArray(data.booths) ? data.booths : [];
      const facilities = Array.isArray(data.facilities) ? data.facilities : [];
      const walkways = Array.isArray(data.walkways) ? data.walkways : [];

      if (booths.length === 0 && facilities.length === 0 && walkways.length === 0) {
        throw new Error('未在檔案中找到任何專櫃 (booths)、設施 (facilities) 或走道 (walkways) 資料');
      }

      setImportParsedData({
        app: data.app || 'MallSpatialArchitect',
        version: data.version || '2.0',
        exportedAt: data.exportedAt || new Date().toISOString(),
        name: data.name || '匯入的平面圖配置',
        description: data.description || '由外部檔案匯入',
        booths,
        facilities,
        walkways
      });
    } catch (err: any) {
      setImportError(err.message || 'JSON 解析失敗，請確認內容格式');
    }
  };

  const handleApplyImportedData = () => {
    if (!importParsedData) return;
    onApplyLayout(
      importParsedData.booths,
      importParsedData.facilities,
      importParsedData.walkways,
      importParsedData.name
    );
    onClose();
    onShowToast(`已成功匯入並套用「${importParsedData.name || '平面圖'}」！`);
  };

  const handleSaveImportedAsVersion = () => {
    if (!importParsedData) return;
    const newVer: FloorPlanVersion = {
      id: `ver_imported_${Date.now()}`,
      name: importParsedData.name || `匯入配置 ${new Date().toLocaleDateString()}`,
      description: importParsedData.description || `匯入自檔案，包含 ${importParsedData.booths.length} 個專櫃、${importParsedData.facilities.length} 個設施`,
      createdAt: new Date().toISOString(),
      booths: importParsedData.booths,
      facilities: importParsedData.facilities,
      walkways: importParsedData.walkways,
      tags: ['檔案匯入']
    };

    const updated = [newVer, ...savedVersions];
    persistVersions(updated);
    setSelectedVersionId(newVer.id);
    setActiveTab('versions');
    setImportParsedData(null);
    setImportJsonText('');
    onShowToast(`已將匯入檔案新增至版本庫「${newVer.name}」！`);
  };

  // Preset icon
  const getPresetIcon = (iconName: string) => {
    switch (iconName) {
      case 'Maximize2': return <Maximize2 className="w-4 h-4" />;
      case 'RotateCcw': return <RotateCcw className="w-4 h-4" />;
      case 'ShoppingBag': return <ShoppingBag className="w-4 h-4" />;
      case 'LayoutGrid':
      default: return <LayoutGrid className="w-4 h-4" />;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm animate-fadeIn" id="floorplan-preset-modal-backdrop">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col max-h-[92vh]"
          id="floorplan-preset-modal-card"
        >
          {/* Header */}
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs">
                <FolderOpen className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>空間平面圖版本庫與藍圖範本</span>
                  <span className="text-xs font-mono font-medium px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full">
                    {savedVersions.length} 個已存版本
                  </span>
                </h3>
                <p className="text-xs text-slate-500 font-sans">
                  自由儲存多套格局版本隨時套用、探索經典建築藍圖，並支援完整 JSON 檔案匯出與匯入
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
              id="btn-close-preset-modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex items-center px-6 pt-3 border-b border-slate-200 bg-white gap-2">
            <button
              onClick={() => { setActiveTab('versions'); setShowConfirmApply(false); }}
              className={`pb-3 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition ${
                activeTab === 'versions'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
              id="tab-btn-versions"
            >
              <Save className="w-4 h-4" />
              <span>自訂版本庫 ({savedVersions.length})</span>
            </button>

            <button
              onClick={() => { setActiveTab('presets'); setShowConfirmApply(false); }}
              className={`pb-3 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition ${
                activeTab === 'presets'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
              id="tab-btn-presets"
            >
              <Sparkles className="w-4 h-4" />
              <span>經典建築藍圖 ({FLOOR_PLAN_PRESETS.length})</span>
            </button>

            <button
              onClick={() => { setActiveTab('io'); setShowConfirmApply(false); }}
              className={`pb-3 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition ${
                activeTab === 'io'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
              id="tab-btn-io"
            >
              <FileJson className="w-4 h-4" />
              <span>檔案匯出 / 匯入</span>
            </button>
          </div>

          {/* Modal Main Scrollable Content */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 scrollbar-thin">
            
            {/* ------------------------------------------------------------------ */}
            {/* TAB 1: CUSTOM SAVED VERSIONS SNAPSHOTS                            */}
            {/* ------------------------------------------------------------------ */}
            {activeTab === 'versions' && (
              <div className="space-y-5 animate-fadeIn">
                
                {/* Save Current Layout Action Bar */}
                <div className="bg-gradient-to-r from-indigo-50/80 to-blue-50/80 border border-indigo-100 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                      <Save className="w-4 h-4 text-indigo-600" />
                      <span>將目前畫布格局儲存為新版本</span>
                    </div>
                    <p className="text-[11px] text-indigo-700/80">
                      目前畫布包含：{currentBooths.length} 個專櫃、{currentFacilities.length} 個公共設施、{currentWalkways.length} 條通道
                    </p>
                  </div>

                  {!isSavingNewVersion ? (
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => setIsSavingNewVersion(true)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition w-full sm:w-auto"
                        id="btn-open-save-version-form"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>另存為新版本</span>
                      </button>
                      <button
                        onClick={() => handleExportCurrentLayout()}
                        className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1"
                        title="立即匯出目前平面圖為 JSON 檔案"
                      >
                        <Download className="w-3.5 h-3.5 text-indigo-600" />
                        <span className="hidden sm:inline">快速匯出</span>
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSaveCurrentAsVersion} className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2 animate-fadeIn">
                      <input
                        type="text"
                        autoFocus
                        placeholder="請輸入版本名稱（如：2026夏季特展動線）..."
                        value={newVersionName}
                        onChange={e => setNewVersionName(e.target.value)}
                        className="px-3 py-1.5 text-xs bg-white border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-800 w-full sm:w-64"
                      />
                      <select
                        value={newVersionTag}
                        onChange={e => setNewVersionTag(e.target.value)}
                        className="px-2 py-1.5 text-xs bg-white border border-indigo-200 rounded-xl text-slate-700 focus:outline-none"
                      >
                        <option value="特展動線">🏷 特展動線</option>
                        <option value="標準格局">🏷 標準格局</option>
                        <option value="週末市集">🏷 週末市集</option>
                        <option value="季節促銷">🏷 季節促銷</option>
                        <option value="備份封存">🏷 備份封存</option>
                      </select>
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-xs whitespace-nowrap"
                      >
                        儲存
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsSavingNewVersion(false)}
                        className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold whitespace-nowrap"
                      >
                        取消
                      </button>
                    </form>
                  )}
                </div>

                {/* Saved Versions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {savedVersions.map(ver => {
                    const isSelected = selectedVersionId === ver.id;
                    const isEditing = editingVersionId === ver.id;

                    return (
                      <div
                        key={ver.id}
                        onClick={() => setSelectedVersionId(ver.id)}
                        className={`cursor-pointer rounded-2xl border-2 p-4 transition-all duration-200 flex flex-col justify-between ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/30 shadow-md ring-2 ring-indigo-600/10'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50 shadow-xs'
                        }`}
                        id={`version-card-${ver.id}`}
                      >
                        <div>
                          {/* Header row */}
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <span className={`p-1.5 rounded-lg shrink-0 ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                                <Layers className="w-4 h-4" />
                              </span>
                              
                              {isEditing ? (
                                <div className="flex items-center gap-1 w-full" onClick={e => e.stopPropagation()}>
                                  <input
                                    type="text"
                                    autoFocus
                                    value={editingVersionName}
                                    onChange={e => setEditingVersionName(e.target.value)}
                                    onKeyDown={e => {
                                      if (e.key === 'Enter') handleCommitRenameVersion(ver.id);
                                      if (e.key === 'Escape') setEditingVersionId(null);
                                    }}
                                    className="px-2 py-0.5 text-xs font-bold text-slate-900 border border-indigo-400 rounded-lg w-full focus:outline-none"
                                  />
                                  <button
                                    onClick={() => handleCommitRenameVersion(ver.id)}
                                    className="px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-bold rounded-lg"
                                  >
                                    確定
                                  </button>
                                </div>
                              ) : (
                                <span className="text-sm font-bold text-slate-900 truncate font-sans">
                                  {ver.name}
                                </span>
                              )}
                            </div>

                            {isSelected && (
                              <span className="p-1 bg-indigo-600 text-white rounded-full shrink-0">
                                <Check className="w-3 h-3" />
                              </span>
                            )}
                          </div>

                          {/* Tag & Date */}
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-2">
                            {ver.tags && ver.tags.length > 0 && (
                              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 font-bold rounded-md text-[10px]">
                                {ver.tags[0]}
                              </span>
                            )}
                            <span className="flex items-center gap-1 font-mono">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {new Date(ver.createdAt).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          {/* Description */}
                          {ver.description && (
                            <p className="text-xs text-slate-600 leading-relaxed font-sans mb-3 line-clamp-2">
                              {ver.description}
                            </p>
                          )}
                        </div>

                        {/* Stats pills & Card Action Bar */}
                        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 text-[11px]">
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <span className="flex items-center gap-0.5 font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[10px]">
                              <Store className="w-3 h-3 text-slate-400" />
                              {ver.booths.length} 櫃
                            </span>
                            <span className="flex items-center gap-0.5 font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[10px]">
                              <Compass className="w-3 h-3 text-slate-400" />
                              {ver.facilities.length} 設施
                            </span>
                            <span className="flex items-center gap-0.5 font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[10px]">
                              <Layers className="w-3 h-3 text-slate-400" />
                              {ver.walkways.length} 通道
                            </span>
                          </div>

                          <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => handleExportSingleVersion(ver)}
                              className="p-1 hover:bg-slate-100 text-slate-500 hover:text-indigo-600 rounded-lg transition"
                              title="匯出此版本為 JSON 檔案"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleStartRenameVersion(ver)}
                              className="p-1 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg transition"
                              title="修改版本名稱"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDuplicateVersion(ver)}
                              className="p-1 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg transition"
                              title="建立複本"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteVersion(ver.id, ver.name)}
                              className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition"
                              title="刪除此版本"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Mini preview of selected version */}
                {selectedVersion && (
                  <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-2.5">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        <span className="font-bold text-slate-200">選取版本預覽：{selectedVersion.name}</span>
                      </div>
                      <span className="text-slate-400 font-mono">
                        {selectedVersion.booths.length} 專櫃 · {selectedVersion.facilities.length} 設施 · {selectedVersion.walkways.length} 走道
                      </span>
                    </div>

                    <div className="w-full bg-slate-950/80 rounded-xl p-2.5 border border-slate-800 flex items-center justify-center overflow-hidden">
                      <svg viewBox="0 0 1000 500" className="w-full max-h-40 bg-slate-900 rounded-lg">
                        <rect x="20" y="20" width="960" height="460" rx="16" fill="#1e293b" stroke="#334155" strokeWidth="2" />
                        {selectedVersion.walkways.map((w, idx) => (
                          <rect key={idx} x={w.x} y={w.y} width={w.width} height={w.height} rx="4" fill="#334155" />
                        ))}
                        {selectedVersion.facilities.map((f, idx) => (
                          <rect key={idx} x={f.x} y={f.y} width={f.width} height={f.height} rx="4" fill="#0284c7" fillOpacity="0.4" stroke="#38bdf8" strokeWidth="1" />
                        ))}
                        {selectedVersion.booths.map((b, idx) => (
                          <rect key={idx} x={b.x} y={b.y} width={b.width} height={b.height} rx="4" fill="#6366f1" fillOpacity="0.6" stroke="#818cf8" strokeWidth="1" />
                        ))}
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ------------------------------------------------------------------ */}
            {/* TAB 2: ARCHITECTURAL BLUEPRINT PRESETS                            */}
            {/* ------------------------------------------------------------------ */}
            {activeTab === 'presets' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-amber-800">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">經典藍圖套用說明：</span>
                    選擇經典商場建築藍圖將會重新編排目前賣場的專櫃位置、大小、公共設施（服務台/手扶梯/電梯/哺育室/洗手間）與動線。商品目錄資料將會完整保留。
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {FLOOR_PLAN_PRESETS.map((preset) => {
                    const isSelected = selectedPresetId === preset.id;
                    return (
                      <div
                        key={preset.id}
                        onClick={() => setSelectedPresetId(preset.id)}
                        className={`cursor-pointer rounded-2xl border-2 p-4 transition-all duration-200 flex flex-col justify-between ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/40 shadow-md ring-2 ring-indigo-600/10'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50 shadow-xs'
                        }`}
                        id={`preset-card-${preset.id}`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <span className={`p-1.5 rounded-lg ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                                {getPresetIcon(preset.iconName)}
                              </span>
                              <span className="text-sm font-bold text-slate-900 font-sans">
                                {preset.name}
                              </span>
                            </div>
                            {isSelected && (
                              <span className="p-1 bg-indigo-600 text-white rounded-full">
                                <Check className="w-3 h-3" />
                              </span>
                            )}
                          </div>

                          <div className="text-xs font-medium text-indigo-700 mb-1.5">
                            {preset.subtitle}
                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed font-sans mb-3">
                            {preset.description}
                          </p>
                        </div>

                        {/* Stats pills */}
                        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1 font-mono bg-white px-2 py-0.5 rounded-md border border-slate-200">
                            <Store className="w-3 h-3 text-slate-400" />
                            {preset.booths.length} 櫃位
                          </span>
                          <span className="flex items-center gap-1 font-mono bg-white px-2 py-0.5 rounded-md border border-slate-200">
                            <Compass className="w-3 h-3 text-slate-400" />
                            {preset.facilities.length} 公共設施
                          </span>
                          <span className="flex items-center gap-1 font-mono bg-white px-2 py-0.5 rounded-md border border-slate-200">
                            <Layers className="w-3 h-3 text-slate-400" />
                            {preset.walkways.length} 主通道
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {selectedPreset && (
                  <div className="bg-slate-900 text-white rounded-2xl p-4.5 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        <span className="font-bold text-slate-200">經典藍圖架構：{selectedPreset.name}</span>
                      </div>
                      <span className="text-slate-400 font-mono">1000 × 500 px 空間標準尺寸</span>
                    </div>

                    <div className="w-full bg-slate-950/80 rounded-xl p-3 border border-slate-800 flex items-center justify-center overflow-hidden">
                      <svg viewBox="0 0 1000 500" className="w-full max-h-40 bg-slate-900 rounded-lg">
                        <rect x="20" y="20" width="960" height="460" rx="16" fill="#1e293b" stroke="#334155" strokeWidth="2" />
                        {selectedPreset.walkways.map((w, idx) => (
                          <rect key={idx} x={w.x} y={w.y} width={w.width} height={w.height} rx="4" fill="#334155" />
                        ))}
                        {selectedPreset.facilities.map((f, idx) => (
                          <rect key={idx} x={f.x} y={f.y} width={f.width} height={f.height} rx="4" fill="#0284c7" fillOpacity="0.4" stroke="#38bdf8" strokeWidth="1" />
                        ))}
                        {selectedPreset.booths.map((b, idx) => (
                          <rect key={idx} x={b.x} y={b.y} width={b.width} height={b.height} rx="4" fill="#6366f1" fillOpacity="0.6" stroke="#818cf8" strokeWidth="1" />
                        ))}
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ------------------------------------------------------------------ */}
            {/* TAB 3: FILE EXPORT & IMPORT (JSON)                                */}
            {/* ------------------------------------------------------------------ */}
            {activeTab === 'io' && (
              <div className="space-y-6 animate-fadeIn">
                
                {/* 1. EXPORT CARD */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs">
                        <Download className="w-4 h-4" />
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">匯出目前平面圖設定檔 (.json)</h4>
                        <p className="text-xs text-slate-500">將目前專櫃、公共設施與動線通道完整備份至本機電腦</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleExportCurrentLayout()}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition"
                      id="btn-export-json-file"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>下載配置檔案 (.json)</span>
                    </button>
                  </div>
                </div>

                {/* 2. IMPORT CARD */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs">
                      <UploadCloud className="w-4 h-4" />
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">匯入平面圖設定檔案 (.json)</h4>
                      <p className="text-xs text-slate-500">上傳先前備份的平面圖 JSON 檔案進行套用或儲存為新版本</p>
                    </div>
                  </div>

                  {/* Upload Drop Zone / Input */}
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/30 hover:bg-indigo-50/60 rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json,application/json"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <UploadCloud className="w-8 h-8 text-indigo-600 animate-bounce" />
                    <div className="text-xs font-bold text-indigo-900">
                      點擊選取或拖曳 JSON 檔案至此處
                    </div>
                    <div className="text-[11px] text-slate-500">
                      支援從此系統匯出的標準 .json 平面圖格式
                    </div>
                  </div>

                  {/* Manual Paste JSON Textarea */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">或直接貼上 JSON 程式碼內容：</label>
                    <textarea
                      rows={4}
                      value={importJsonText}
                      onChange={e => {
                        setImportJsonText(e.target.value);
                        parseAndValidateImportData(e.target.value);
                      }}
                      placeholder='{"app": "MallSpatialArchitect", "booths": [...], "facilities": [...]}'
                      className="w-full p-2.5 font-mono text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-800"
                    />
                  </div>

                  {/* Error Message */}
                  {importError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>{importError}</span>
                    </div>
                  )}

                  {/* Import Success Preview Summary */}
                  {importParsedData && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3 animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>驗證成功：{importParsedData.name}</span>
                        </div>
                        <div className="text-[11px] text-emerald-700 font-mono">
                          {importParsedData.booths.length} 專櫃 · {importParsedData.facilities.length} 設施 · {importParsedData.walkways.length} 通道
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-emerald-200/60">
                        <button
                          onClick={handleApplyImportedData}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition"
                          id="btn-apply-imported-layout"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>立即套用至目前畫布</span>
                        </button>

                        <button
                          onClick={handleSaveImportedAsVersion}
                          className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-emerald-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                          id="btn-save-imported-version"
                        >
                          <Save className="w-3.5 h-3.5 text-emerald-600" />
                          <span>儲存為自訂版本</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer Actions */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition"
              id="btn-cancel-preset"
            >
              關閉
            </button>

            <div className="flex items-center gap-2">
              {activeTab === 'versions' && selectedVersion && (
                showConfirmApply ? (
                  <div className="flex items-center gap-2 animate-fadeIn">
                    <span className="text-xs text-rose-600 font-bold">確定覆蓋目前畫布？</span>
                    <button
                      onClick={() => handleApplyVersion(selectedVersion)}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-sm transition"
                      id="btn-confirm-apply-version"
                    >
                      確定套用此版本
                    </button>
                    <button
                      onClick={() => setShowConfirmApply(false)}
                      className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition"
                    >
                      再考慮
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowConfirmApply(true)}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition"
                    id="btn-apply-version"
                  >
                    <Check className="w-4 h-4" />
                    <span>套用「{selectedVersion.name}」版本</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )
              )}

              {activeTab === 'presets' && selectedPreset && (
                showConfirmApply ? (
                  <div className="flex items-center gap-2 animate-fadeIn">
                    <span className="text-xs text-rose-600 font-bold">確定覆蓋目前格局？</span>
                    <button
                      onClick={() => {
                        onApplyLayout(selectedPreset.booths, selectedPreset.facilities, selectedPreset.walkways, selectedPreset.name);
                        setShowConfirmApply(false);
                        onClose();
                        onShowToast(`已成功套用「${selectedPreset.name}」藍圖！`);
                      }}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-sm transition"
                      id="btn-confirm-apply-preset"
                    >
                      確定套用此藍圖
                    </button>
                    <button
                      onClick={() => setShowConfirmApply(false)}
                      className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition"
                    >
                      再考慮
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowConfirmApply(true)}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition"
                    id="btn-apply-preset"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>套用「{selectedPreset.name}」藍圖</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
