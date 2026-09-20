import React, { useState, useRef, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  UploadCloud, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ShoppingBag, 
  Store, 
  Plus, 
  Trash2, 
  Search, 
  RefreshCw, 
  Check, 
  Filter, 
  ArrowDownToLine, 
  Info, 
  Move, 
  Maximize2, 
  Copy, 
  Tag, 
  Eye, 
  PackagePlus, 
  Bookmark, 
  AlertOctagon, 
  RotateCcw, 
  Edit3, 
  Compass, 
  X
} from 'lucide-react';
import { Booth, Product, Facility, Walkway, MapLegendItem, ModuleSizeSettings } from '../types';
import { 
  BOOTH_COLOR_OPTIONS, 
  getBoothThemeStyles, 
  DEFAULT_BOOTHS, 
  DEFAULT_PRODUCTS, 
  DEFAULT_FACILITIES, 
  DEFAULT_WALKWAYS, 
  DEFAULT_LEGENDS, 
  DEFAULT_MODULE_SIZE_SETTINGS,
  DEFAULT_SYSTEM_TITLE
} from '../data';
import { 
  downloadExcelTemplate, 
  exportCurrentDataToExcel, 
  parseExcelFile, 
  ParseResult 
} from '../utils/excelUtils';
import BoothLayoutEditor from './BoothLayoutEditor';
import MapLegendEditor from './MapLegendEditor';
import ModuleSizeManager from './ModuleSizeManager';

interface AdminDashboardProps {
  booths: Booth[];
  products: Product[];
  facilities?: Facility[];
  walkways?: Walkway[];
  legends?: MapLegendItem[];
  moduleSizes?: ModuleSizeSettings;
  onUpdateBooths: (booths: Booth[]) => void;
  onUpdateProducts: (products: Product[]) => void;
  onUpdateFacilities?: (facilities: Facility[]) => void;
  onUpdateWalkways?: (walkways: Walkway[]) => void;
  onUpdateLegends?: (legends: MapLegendItem[]) => void;
  onUpdateModuleSizes?: (sizes: ModuleSizeSettings) => void;
  onResetAllData?: () => void;
  onShowToast: (msg: string) => void;
  onSelectBoothForView: (boothId: string) => void;
  initialTab?: 'excel' | 'layout' | 'booths' | 'products' | 'legends' | 'sizes';
  initialBoothIdForProduct?: string | null;
  onBackToMap?: () => void;
}

const QUICK_CATEGORIES = [
  '服飾精品',
  '彩妝香氛',
  '科技3C',
  '風味美饌',
  '生鮮超市',
  '生活居家',
  '休閒運動',
  '配件鞋包'
];

export default function AdminDashboard({
  booths,
  products,
  facilities,
  walkways,
  legends = DEFAULT_LEGENDS,
  moduleSizes = DEFAULT_MODULE_SIZE_SETTINGS,
  onUpdateBooths,
  onUpdateProducts,
  onUpdateFacilities,
  onUpdateWalkways,
  onUpdateLegends = () => {},
  onUpdateModuleSizes = () => {},
  onResetAllData,
  onShowToast,
  onSelectBoothForView,
  initialTab = 'layout',
  initialBoothIdForProduct = null,
  onBackToMap
}: AdminDashboardProps) {
  // Navigation sub-tabs inside Admin Dashboard
  const [activeTab, setActiveTab] = useState<'excel' | 'layout' | 'booths' | 'products' | 'legends' | 'sizes'>(initialTab);
  const [editorTargetBoothId, setEditorTargetBoothId] = useState<string | null>(null);

  // Clear All Data confirmation modal state
  const [showClearConfirmModal, setShowClearConfirmModal] = useState<boolean>(false);

  // System Title editing state
  const systemTitle = moduleSizes.systemTitle?.trim() || DEFAULT_SYSTEM_TITLE;
  const [showEditTitleModal, setShowEditTitleModal] = useState<boolean>(false);
  const [tempTitle, setTempTitle] = useState<string>(systemTitle);

  const handleOpenEditTitleModal = () => {
    setTempTitle(moduleSizes.systemTitle?.trim() || DEFAULT_SYSTEM_TITLE);
    setShowEditTitleModal(true);
  };

  const handleSaveSystemTitle = () => {
    const finalTitle = tempTitle.trim() || DEFAULT_SYSTEM_TITLE;
    onUpdateModuleSizes({
      ...moduleSizes,
      systemTitle: finalTitle
    });
    setShowEditTitleModal(false);
    onShowToast(`✨ 系統標題已更新為「${finalTitle}」並即時套用至前台導覽列！`);
  };

  const handleResetSystemTitle = () => {
    setTempTitle(DEFAULT_SYSTEM_TITLE);
    onUpdateModuleSizes({
      ...moduleSizes,
      systemTitle: DEFAULT_SYSTEM_TITLE
    });
    setShowEditTitleModal(false);
    onShowToast(`✨ 系統標題已還原為預設名稱「${DEFAULT_SYSTEM_TITLE}」！`);
  };

  // Sync initialTab when updated from parent
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
      if (initialTab === 'products') {
        setShowAddProductModal(true);
      }
    }
  }, [initialTab]);

  // Handle Clear All Data Options
  const handleClearBoothsAndProducts = () => {
    onUpdateBooths([]);
    onUpdateProducts([]);
    onShowToast('🗑️ 已成功清空所有專櫃與商品資料 (目前為空白狀態)！');
    setShowClearConfirmModal(false);
  };

  const handleExecuteClearAllData = () => {
    if (onResetAllData) {
      onResetAllData();
    } else {
      onUpdateBooths(DEFAULT_BOOTHS);
      onUpdateProducts(DEFAULT_PRODUCTS);
      if (onUpdateFacilities) onUpdateFacilities(DEFAULT_FACILITIES);
      if (onUpdateWalkways) onUpdateWalkways(DEFAULT_WALKWAYS);
      onUpdateLegends(DEFAULT_LEGENDS);
      onUpdateModuleSizes(DEFAULT_MODULE_SIZE_SETTINGS);
      onShowToast('✨ 已清除自訂資料並重設為系統預設初始狀態！');
    }
    setShowClearConfirmModal(false);
  };

  const handleWipeEverything = () => {
    onUpdateBooths([]);
    onUpdateProducts([]);
    if (onUpdateFacilities) onUpdateFacilities([]);
    if (onUpdateWalkways) onUpdateWalkways([]);
    onShowToast('🧹 已徹底清空商場專櫃、商品、公共設施與動線走道！');
    setShowClearConfirmModal(false);
  };

  // Excel Import States
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [previewTab, setPreviewTab] = useState<'booths' | 'products'>('booths');
  const [importMode, setImportMode] = useState<'upsert' | 'replace' | 'append'>('upsert');
  const [importSuccessMsg, setImportSuccessMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Booth Management Search / Form States
  const [boothSearch, setBoothSearch] = useState('');
  const [newBoothId, setNewBoothId] = useState('');
  const [newBoothName, setNewBoothName] = useState('');
  const [newBoothZone, setNewBoothZone] = useState('A區: 時尚潮流');
  const [newBoothColor, setNewBoothColor] = useState('teal');
  const [newBoothDesc, setNewBoothDesc] = useState('');
  const [newBoothSlot, setNewBoothSlot] = useState('slot1');
  const [boothFormError, setBoothFormError] = useState('');

  // Product Management Search / Filter States
  const [productSearch, setProductSearch] = useState('');
  const [productFilterZone, setProductFilterZone] = useState<string>('all');
  const [productFilterBoothId, setProductFilterBoothId] = useState<string>('all');
  const [newProdName, setNewProdName] = useState('');
  const [newProdBoothId, setNewProdBoothId] = useState(() => initialBoothIdForProduct || booths[0]?.id || 'A1');
  const [newProdCategory, setNewProdCategory] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdTags, setNewProdTags] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [showAddProductModal, setShowAddProductModal] = useState(() => initialTab === 'products');
  const [prodFormError, setProdFormError] = useState('');
  const [continueAdding, setContinueAdding] = useState(false);

  // Sync initial booth selection for new product
  useEffect(() => {
    if (initialBoothIdForProduct && booths.some(b => b.id === initialBoothIdForProduct)) {
      setNewProdBoothId(initialBoothIdForProduct);
      setProductFilterBoothId(initialBoothIdForProduct);
    }
  }, [initialBoothIdForProduct, booths]);

  // ----------------------------------------------------
  // Excel Import Handlers & Immediate State Sync
  // ----------------------------------------------------
  const applyImportedData = (importedBooths: Booth[], importedProducts: Product[], mode: 'upsert' | 'replace' | 'append') => {
    let finalBooths: Booth[] = [];
    let finalProducts: Product[] = [];

    if (mode === 'replace') {
      finalBooths = importedBooths.length > 0 ? importedBooths : booths;
      finalProducts = importedProducts.length > 0 ? importedProducts : products;
    } else if (mode === 'upsert') {
      // Upsert booths
      const boothMap = new Map<string, Booth>();
      booths.forEach(b => boothMap.set(b.id, b));
      importedBooths.forEach(b => boothMap.set(b.id, b));
      finalBooths = Array.from(boothMap.values());

      // Upsert products
      const prodMap = new Map<string, Product>();
      products.forEach(p => prodMap.set(p.id, p));
      importedProducts.forEach(p => prodMap.set(p.id, p));
      finalProducts = Array.from(prodMap.values());
    } else {
      // Append mode
      finalBooths = [...booths, ...importedBooths];
      finalProducts = [...products, ...importedProducts];
    }

    onUpdateBooths(finalBooths);
    onUpdateProducts(finalProducts);

    // Auto-accommodate canvas dimensions if imported booths extend beyond current canvas
    if (finalBooths.length > 0 && onUpdateModuleSizes) {
      const maxX = Math.max(...finalBooths.map(b => (b.x || 0) + (b.width || 90)), 0);
      const maxY = Math.max(...finalBooths.map(b => (b.y || 0) + (b.height || 75)), 0);
      const curW = moduleSizes?.canvasWidth || 1000;
      const curH = moduleSizes?.canvasHeight || 500;
      if (maxX + 60 > curW || maxY + 60 > curH) {
        const newW = Math.max(curW, Math.ceil((maxX + 120) / 100) * 100);
        const newH = Math.max(curH, Math.ceil((maxY + 120) / 100) * 100);
        onUpdateModuleSizes({
          ...moduleSizes,
          canvasWidth: newW,
          canvasHeight: newH
        });
      }
    }

    const successDetail = `已立即更新系統！成功寫入 ${importedBooths.length} 個專櫃、${importedProducts.length} 項商品資料至平面圖與商品目錄。`;
    setImportSuccessMsg(successDetail);
    onShowToast(successDetail);
  };

  const handleFileChange = async (file: File) => {
    if (!file) return;
    setImportSuccessMsg('');
    setUploadedFile(file);
    setIsParsing(true);

    try {
      const result = await parseExcelFile(file);
      setParseResult(result);
      if (result.booths.length > 0) {
        setPreviewTab('booths');
      } else if (result.products.length > 0) {
        setPreviewTab('products');
      }

      // If valid booths or products are parsed, immediately update store map and products!
      if (result.booths.length > 0 || result.products.length > 0) {
        applyImportedData(result.booths, result.products, importMode);
      } else {
        onShowToast(`已讀取「${file.name}」，未偵測到有效資料`);
      }
    } catch (err: any) {
      console.error(err);
      setParseResult({
        booths: [],
        products: [],
        errors: [`檔案解析失敗：${err?.message || '請確認檔案格式是否正確'}`],
        warnings: [],
        summary: { totalBoothRows: 0, validBoothRows: 0, totalProductRows: 0, validProductRows: 0 }
      });
    } finally {
      setIsParsing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleResetUpload = () => {
    setUploadedFile(null);
    setParseResult(null);
    setImportSuccessMsg('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Commit / Re-apply imported Excel rows into the state
  const handleCommitImport = () => {
    if (!parseResult) return;
    applyImportedData(parseResult.booths, parseResult.products, importMode);
  };

  // ----------------------------------------------------
  // Manual Booth Handlers
  // ----------------------------------------------------
  const handleCreateBooth = (e: React.FormEvent) => {
    e.preventDefault();
    setBoothFormError('');

    const id = newBoothId.trim().toUpperCase();
    const name = newBoothName.trim();

    if (!id || !name) {
      setBoothFormError('請填寫櫃位代號與專櫃名稱');
      return;
    }

    if (booths.some(b => b.id.toUpperCase() === id)) {
      setBoothFormError(`櫃位代號「${id}」已存在，請使用不同代號`);
      return;
    }

    let defaultX = 350;
    let defaultY = 180;
    let defaultW = 100;
    let defaultH = 70;

    if (newBoothSlot === 'slot1') { defaultX = 320; defaultY = 160; defaultW = 90; defaultH = 90; }
    else if (newBoothSlot === 'slot2') { defaultX = 430; defaultY = 160; defaultW = 90; defaultH = 90; }
    else if (newBoothSlot === 'slot3') { defaultX = 540; defaultY = 160; defaultW = 90; defaultH = 90; }
    else if (newBoothSlot === 'slot4') { defaultX = 350; defaultY = 280; defaultW = 130; defaultH = 80; }

    const createdBooth: Booth = {
      id,
      name,
      zone: newBoothZone,
      color: newBoothColor as any,
      description: newBoothDesc.trim() || `${name} 提供優質商品與專櫃服務`,
      x: defaultX,
      y: defaultY,
      width: defaultW,
      height: defaultH
    };

    onUpdateBooths([...booths, createdBooth]);
    onShowToast(`已成功建立專櫃「${name} (${id})」！已加入地圖`);
    setNewBoothId('');
    setNewBoothName('');
    setNewBoothDesc('');
  };

  const handleDeleteBooth = (boothId: string) => {
    const target = booths.find(b => b.id === boothId);
    onUpdateBooths(booths.filter(b => b.id !== boothId));
    if (target) {
      onShowToast(`已刪除櫃位「${target.name}」`);
    }
  };

  // ----------------------------------------------------
  // Manual Product Handlers (Migrated to Backend Center)
  // ----------------------------------------------------
  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setProdFormError('');
    const name = newProdName.trim();
    if (!name) {
      setProdFormError('請輸入商品名稱');
      return;
    }

    if (!newProdBoothId) {
      setProdFormError('請選擇所屬櫃位');
      return;
    }

    const tags = newProdTags
      .split(/[,，、/|\s]+/)
      .map(t => t.trim())
      .filter(Boolean);

    const priceNum = newProdPrice ? Number(newProdPrice) : undefined;
    const targetBooth = booths.find(b => b.id === newProdBoothId);

    const newProd: Product = {
      id: `p_${newProdBoothId.toLowerCase()}_${Date.now().toString(36)}`,
      name,
      boothId: newProdBoothId,
      category: newProdCategory.trim() || '專櫃推薦',
      price: isNaN(priceNum as number) ? undefined : priceNum,
      tags: tags.length > 0 ? tags : [name, targetBooth?.name || '專櫃商品'],
      description: newProdDesc.trim() || `${name}（${targetBooth?.name || newProdBoothId} 專櫃精選）`
    };

    onUpdateProducts([newProd, ...products]);
    onShowToast(`已成功上架商品「${name}」至專櫃 ${newProdBoothId}！`);
    
    // Clear inputs
    setNewProdName('');
    setNewProdPrice('');
    setNewProdTags('');
    setNewProdDesc('');
    
    if (!continueAdding) {
      setShowAddProductModal(false);
    }
  };

  const handleDeleteProduct = (productId: string) => {
    const target = products.find(p => p.id === productId);
    onUpdateProducts(products.filter(p => p.id !== productId));
    if (target) {
      onShowToast(`已刪除商品「${target.name}」`);
    }
  };

  const handleDuplicateProduct = (p: Product) => {
    const cloned: Product = {
      ...p,
      id: `p_clone_${Date.now().toString(36)}`,
      name: `${p.name} (複製)`
    };
    onUpdateProducts([cloned, ...products]);
    onShowToast(`已複製商品「${p.name}」`);
  };

  // Switch to product tab and pre-select booth
  const handleOpenAddProductForBooth = (boothId: string) => {
    setNewProdBoothId(boothId);
    setProductFilterBoothId(boothId);
    setShowAddProductModal(true);
    setActiveTab('products');
  };

  // Filtered lists
  const filteredBooths = booths.filter(b => 
    b.id.toLowerCase().includes(boothSearch.toLowerCase()) ||
    b.name.toLowerCase().includes(boothSearch.toLowerCase()) ||
    b.zone.toLowerCase().includes(boothSearch.toLowerCase())
  );

  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.boothId.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.tags.some(t => t.toLowerCase().includes(productSearch.toLowerCase())) ||
      (p.description && p.description.toLowerCase().includes(productSearch.toLowerCase()));

    const matchesBooth = productFilterBoothId === 'all' || p.boothId === productFilterBoothId;

    if (productFilterZone === 'all') return matchesSearch && matchesBooth;
    const parentBooth = booths.find(b => b.id === p.boothId);
    return matchesSearch && matchesBooth && parentBooth?.zone.startsWith(productFilterZone);
  });

  // Calculate Product Stats
  const activeBoothsWithProducts = new Set(products.map(p => p.boothId)).size;
  const uniqueCategories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));
  const avgPrice = products.filter(p => p.price).length > 0
    ? Math.round(products.filter(p => p.price).reduce((acc, cur) => acc + (cur.price || 0), 0) / products.filter(p => p.price).length)
    : 0;

  const currentSelectedBoothObj = booths.find(b => b.id === newProdBoothId);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col h-full overflow-hidden" id="admin-dashboard-root">
      
      {/* Top Banner Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <FileSpreadsheet className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              商場空間與商品庫存管理後台
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            集中管理櫃位空間位置、長寬大小、商品上架目錄與 Excel 批次匯入匯出
          </p>
        </div>

        {/* Global Action Tools */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleOpenEditTitleModal}
            className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
            title={`自訂前台導覽列系統主標題（目前：「${systemTitle}」）`}
            id="btn-edit-system-title-global"
          >
            <Compass className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>系統標題：<strong className="text-indigo-950 font-black max-w-[110px] sm:max-w-[160px] truncate inline-block align-bottom">{systemTitle}</strong></span>
            <Edit3 className="w-3 h-3 text-indigo-500 shrink-0 ml-0.5" />
          </button>

          <button
            onClick={() => {
              const current = moduleSizes.showBoothIds !== false;
              const next = !current;
              onUpdateModuleSizes({ ...moduleSizes, showBoothIds: next });
              onShowToast(`平面圖專櫃代號已設為「${next ? '顯示' : '隱藏'}」並即時套用至前台`);
            }}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs border ${
              moduleSizes.showBoothIds !== false 
                ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-300'
            }`}
            title="一鍵切換前台與後台平面圖專櫃代號 (如 A1, D2) 顯示狀態"
            id="btn-toggle-booth-ids-global"
          >
            <Tag className="w-3.5 h-3.5" />
            <span>櫃位代號：{moduleSizes.showBoothIds !== false ? '顯示' : '隱藏'}</span>
          </button>

          <button
            onClick={downloadExcelTemplate}
            className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
            title="下載包含「櫃位清單」與「商品清單」的標準範本"
            id="btn-download-template"
          >
            <ArrowDownToLine className="w-3.5 h-3.5 text-indigo-600" />
            <span>下載標準 Excel 範本</span>
          </button>

          <button
            onClick={() => exportCurrentDataToExcel(booths, products)}
            className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
            title="將目前所有櫃位與商品資料完整匯出為 Excel"
            id="btn-export-excel"
          >
            <Download className="w-3.5 h-3.5" />
            <span>匯出全量 Excel</span>
          </button>

          <button
            onClick={() => setShowClearConfirmModal(true)}
            className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-900 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
            title="清除所有自訂資料並重設為系統預設值"
            id="btn-clear-all-data"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
            <span>清除所有資料</span>
          </button>
        </div>
      </div>

      {/* Admin Module Tabs Switcher */}
      <div className="flex gap-2 py-4 border-b border-slate-100 overflow-x-auto">
        <button
          onClick={() => setActiveTab('layout')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition duration-150 shrink-0 ${
            activeTab === 'layout'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
          }`}
          id="tab-admin-layout"
        >
          <Move className="w-4 h-4" />
          <span>📐 櫃位空間與地圖布局 </span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition duration-150 shrink-0 ${
            activeTab === 'products'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
          }`}
          id="tab-admin-products"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>🛍️ 商品上架與庫存管理 ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('booths')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition duration-150 shrink-0 ${
            activeTab === 'booths'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
          }`}
          id="tab-admin-booths"
        >
          <Store className="w-4 h-4" />
          <span>🏢 櫃位清單管理 ({booths.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('excel')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition duration-150 shrink-0 ${
            activeTab === 'excel'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
          }`}
          id="tab-admin-excel"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>📊 Excel 批次匯入中心</span>
          {uploadedFile && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('legends')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition duration-150 shrink-0 ${
            activeTab === 'legends'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
          }`}
          id="tab-admin-legends"
        >
          <Bookmark className="w-4 h-4" />
          <span>🎨 地圖圖例自訂編輯 ({legends.filter(l => l.visible).length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sizes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition duration-150 shrink-0 ${
            activeTab === 'sizes'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
          }`}
          id="tab-admin-sizes"
        >
          <Maximize2 className="w-4 h-4" />
          <span>📐 模組尺寸與佈局設定 (比例 {moduleSizes.columnRatio} • 地圖 {moduleSizes.mapHeight}px)</span>
        </button>
      </div>

      {/* Main Tab Views */}
      <div className="flex-1 overflow-y-auto pt-4 scrollbar-thin">
        
        {/* ======================================================== */}
        {/* TAB 0: VISUAL BOOTH LAYOUT & GEOMETRY EDITOR            */}
        {/* ======================================================== */}
        {activeTab === 'layout' && (
          <div className="space-y-4" id="booth-layout-tab-content">
            <BoothLayoutEditor
              booths={booths}
              products={products}
              facilities={facilities}
              walkways={walkways}
              canvasWidth={moduleSizes.canvasWidth || 1000}
              canvasHeight={moduleSizes.canvasHeight || 500}
              onUpdateCanvasDimensions={(newW, newH, scaleExisting) => {
                if (scaleExisting) {
                  const oldW = moduleSizes.canvasWidth || 1000;
                  const oldH = moduleSizes.canvasHeight || 500;
                  const scaleX = newW / oldW;
                  const scaleY = newH / oldH;
                  const scaledBooths = booths.map(b => ({
                    ...b,
                    x: Math.round(b.x * scaleX),
                    y: Math.round(b.y * scaleY),
                    width: Math.max(30, Math.round(b.width * scaleX)),
                    height: Math.max(30, Math.round(b.height * scaleY))
                  }));
                  const scaledFacs = facilities.map(f => ({
                    ...f,
                    x: Math.round(f.x * scaleX),
                    y: Math.round(f.y * scaleY),
                    width: Math.max(20, Math.round(f.width * scaleX)),
                    height: Math.max(20, Math.round(f.height * scaleY))
                  }));
                  const scaledWalks = walkways.map(w => ({
                    ...w,
                    x: Math.round(w.x * scaleX),
                    y: Math.round(w.y * scaleY),
                    width: Math.max(20, Math.round(w.width * scaleX)),
                    height: Math.max(20, Math.round(w.height * scaleY))
                  }));
                  onUpdateBooths(scaledBooths);
                  onUpdateFacilities(scaledFacs);
                  onUpdateWalkways(scaledWalks);
                }
                onUpdateModuleSizes({ ...moduleSizes, canvasWidth: newW, canvasHeight: newH });
                onShowToast(`已將空間畫布尺寸更新為 ${newW} × ${newH} px${scaleExisting ? '（已等比縮放現有專櫃）' : ''}`);
              }}
              showBoothIds={moduleSizes.showBoothIds !== false}
              onToggleShowBoothIds={(val) => onUpdateModuleSizes({ ...moduleSizes, showBoothIds: val })}
              onUpdateBooths={onUpdateBooths}
              onUpdateFacilities={onUpdateFacilities}
              onUpdateWalkways={onUpdateWalkways}
              onShowToast={onShowToast}
              onSelectBoothForView={onSelectBoothForView}
              onGoToProductsForBooth={handleOpenAddProductForBooth}
              initialSelectedBoothId={editorTargetBoothId}
            />
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 1: PRODUCT CATALOG & ADD PRODUCT CENTER (MIGRATED)   */}
        {/* ======================================================== */}
        {activeTab === 'products' && (
          <div className="space-y-6" id="product-management-tab-content">
            
            {/* Top Statistics & Action Header */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4.5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-xl">
                    <ShoppingBag className="w-4 h-4" />
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">
                    專櫃商品上架與庫存目錄
                  </h3>
                </div>
                <p className="text-xs text-slate-500 font-sans">
                  在此為商場各專櫃新增商品項目、設定售價與搜尋標籤，或進行修改與即時預覽
                </p>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <button
                  onClick={() => setShowAddProductModal(!showAddProductModal)}
                  className={`w-full md:w-auto px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition ${
                    showAddProductModal
                      ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white ring-2 ring-indigo-600/20'
                  }`}
                  id="btn-toggle-add-product"
                >
                  <Plus className="w-4 h-4" />
                  <span>{showAddProductModal ? '收合新增表單' : '✨ 新增商品上架'}</span>
                </button>
              </div>
            </div>

            {/* Quick Stat Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white border border-slate-200/80 p-3 rounded-2xl shadow-xs">
                <div className="text-[11px] font-bold text-slate-400 mb-0.5">總上架商品數</div>
                <div className="text-lg font-mono font-bold text-slate-800">{products.length} <span className="text-xs font-normal text-slate-400">件</span></div>
              </div>
              <div className="bg-white border border-slate-200/80 p-3 rounded-2xl shadow-xs">
                <div className="text-[11px] font-bold text-slate-400 mb-0.5">專櫃商品覆蓋率</div>
                <div className="text-lg font-mono font-bold text-indigo-600">{activeBoothsWithProducts} / {booths.length} <span className="text-xs font-normal text-slate-400">櫃</span></div>
              </div>
              <div className="bg-white border border-slate-200/80 p-3 rounded-2xl shadow-xs">
                <div className="text-[11px] font-bold text-slate-400 mb-0.5">商品類別總數</div>
                <div className="text-lg font-mono font-bold text-emerald-600">{uniqueCategories.length} <span className="text-xs font-normal text-slate-400">類</span></div>
              </div>
              <div className="bg-white border border-slate-200/80 p-3 rounded-2xl shadow-xs">
                <div className="text-[11px] font-bold text-slate-400 mb-0.5">商品平均單價</div>
                <div className="text-lg font-mono font-bold text-amber-600">NT$ {avgPrice.toLocaleString()}</div>
              </div>
            </div>

            {/* Comprehensive Add Product Form (Collapsible / Expandable) */}
            {showAddProductModal && (
              <div className="bg-indigo-50/40 border-2 border-indigo-200 rounded-3xl p-5 shadow-sm space-y-4 animate-fadeIn" id="add-product-form-box">
                <div className="flex justify-between items-center pb-3 border-b border-indigo-100">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-indigo-600 text-white rounded-xl shadow-xs">
                      <PackagePlus className="w-4 h-4" />
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        新增商品至專櫃 (Add New Product)
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        填寫商品資訊，前台搜尋與專櫃資訊卡片將即時同步
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAddProductModal(false)}
                    className="text-slate-400 hover:text-slate-600 text-xs font-bold p-1 rounded-lg"
                  >
                    ✕ 關閉
                  </button>
                </div>

                <form onSubmit={handleCreateProduct} className="space-y-4">
                  
                  {/* Row 1: Target Booth & Product Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                        <span>所屬專櫃 (Target Booth) *</span>
                        {currentSelectedBoothObj && (
                          <span className="text-[10px] text-indigo-600 font-normal">
                            {currentSelectedBoothObj.zone}
                          </span>
                        )}
                      </label>
                      <select
                        value={newProdBoothId}
                        onChange={e => setNewProdBoothId(e.target.value)}
                        className="w-full bg-white px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500 shadow-xs"
                      >
                        {booths.map(b => (
                          <option key={b.id} value={b.id}>
                            [{b.id}] {b.name} ({b.zone.split(':')[0]})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                        商品名稱 (Product Name) *
                      </label>
                      <input
                        type="text"
                        value={newProdName}
                        onChange={e => setNewProdName(e.target.value)}
                        placeholder="例如: 極輕抗UV防潑水外套"
                        className="w-full bg-white px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 outline-none focus:border-indigo-500 shadow-xs"
                      />
                    </div>
                  </div>

                  {/* Row 2: Category + Quick Suggestion Pills */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                      商品類別 (Category)
                    </label>
                    <input
                      type="text"
                      value={newProdCategory}
                      onChange={e => setNewProdCategory(e.target.value)}
                      placeholder="自訂或點選下方熱門類別..."
                      className="w-full bg-white px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 outline-none focus:border-indigo-500 shadow-xs mb-2"
                    />
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] text-slate-400 font-medium">快速類別：</span>
                      {QUICK_CATEGORIES.map(cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setNewProdCategory(cat)}
                          className={`text-[10px] px-2 py-0.5 rounded-lg border font-medium transition ${
                            newProdCategory === cat
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Row 3: Price & Tags */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                        商品售價 (Price NT$)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400">NT$</span>
                        <input
                          type="number"
                          value={newProdPrice}
                          onChange={e => setNewProdPrice(e.target.value)}
                          placeholder="例如: 1280"
                          className="w-full bg-white pl-12 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-800 outline-none focus:border-indigo-500 shadow-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                        搜尋標籤 (Tags / 關鍵字，以逗號或空白分隔)
                      </label>
                      <input
                        type="text"
                        value={newProdTags}
                        onChange={e => setNewProdTags(e.target.value)}
                        placeholder="例如: 外套, 防曬, 透氣, 輕量"
                        className="w-full bg-white px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 outline-none focus:border-indigo-500 shadow-xs"
                      />
                    </div>
                  </div>

                  {/* Row 4: Description */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                      商品詳細規格與介紹 (Description)
                    </label>
                    <textarea
                      rows={2}
                      value={newProdDesc}
                      onChange={e => setNewProdDesc(e.target.value)}
                      placeholder="簡述商品亮點、材質或規格特色，顧客搜尋時亦可比對..."
                      className="w-full bg-white px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 outline-none focus:border-indigo-500 shadow-xs resize-none"
                    />
                  </div>

                  {/* Live Product Card Preview */}
                  <div className="bg-white border border-indigo-100 rounded-2xl p-3.5 space-y-2">
                    <div className="text-[10px] font-bold text-indigo-700 flex items-center gap-1 uppercase tracking-wider">
                      <Eye className="w-3 h-3" />
                      <span>前台商品卡片即時預覽 (Live Preview)</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex justify-between items-start gap-3">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[9px] font-mono font-bold bg-white text-indigo-700 border border-indigo-200 px-1.5 py-0.2 rounded">
                            {newProdBoothId} {currentSelectedBoothObj?.name}
                          </span>
                          <span className="text-[9px] text-slate-500 bg-white border border-slate-200 px-1.5 py-0.2 rounded">
                            {newProdCategory || '一般商品'}
                          </span>
                          {newProdPrice && (
                            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                              NT$ {Number(newProdPrice).toLocaleString()}
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-bold text-slate-900">
                          {newProdName || '（請輸入商品名稱）'}
                        </div>
                        <div className="text-[11px] text-slate-500 font-sans line-clamp-1">
                          {newProdDesc || '（尚未填寫商品介紹）'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {prodFormError && (
                    <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-xl font-medium">
                      ⚠️ {prodFormError}
                    </div>
                  )}

                  {/* Form Submit & Options */}
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-600 select-none">
                      <input
                        type="checkbox"
                        checked={continueAdding}
                        onChange={e => setContinueAdding(e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                      />
                      <span>新增後繼續留在表單建立下一筆商品</span>
                    </label>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => setShowAddProductModal(false)}
                        className="flex-1 sm:flex-none px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                      >
                        取消
                      </button>
                      <button
                        type="submit"
                        className="flex-1 sm:flex-none px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>確認新增商品</span>
                      </button>
                    </div>
                  </div>

                </form>
              </div>
            )}

            {/* Search, Filter & View Controls Toolbar */}
            <div className="flex flex-col md:flex-row justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                  placeholder="搜尋商品名稱、標籤關鍵字、分類或櫃位代號..."
                  className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none font-medium"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Booth Filter */}
                <select
                  value={productFilterBoothId}
                  onChange={e => setProductFilterBoothId(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-xs text-slate-700 font-bold px-3 py-2 rounded-xl outline-none"
                >
                  <option value="all">全部專櫃 ({products.length})</option>
                  {booths.map(b => (
                    <option key={b.id} value={b.id}>
                      [{b.id}] {b.name}
                    </option>
                  ))}
                </select>

                {/* Zone Filter */}
                <select
                  value={productFilterZone}
                  onChange={e => setProductFilterZone(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium px-3 py-2 rounded-xl outline-none"
                >
                  <option value="all">全部分區</option>
                  <option value="A">A區: 時尚潮流</option>
                  <option value="B">B區: 美妝生活</option>
                  <option value="C">C區: 科技生活</option>
                  <option value="D">D區: 美食天地</option>
                  <option value="E">E區: 鮮綠超市</option>
                </select>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto max-h-[420px] scrollbar-thin">
                <table className="w-full text-left text-xs min-w-[640px]">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 sticky top-0 font-bold">
                    <tr>
                      <th className="py-3 px-3.5">商品名稱與描述</th>
                      <th className="py-3 px-3">所屬專櫃</th>
                      <th className="py-3 px-3">類別</th>
                      <th className="py-3 px-3">售價 (NT$)</th>
                      <th className="py-3 px-3">搜尋標籤</th>
                      <th className="py-3 px-3 text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map(p => {
                        const parentBooth = booths.find(b => b.id === p.boothId);
                        return (
                          <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-3.5 font-bold text-slate-900 max-w-xs">
                              <div className="text-xs text-slate-900 break-words">{p.name}</div>
                              <div className="text-[10px] text-slate-500 font-normal break-words mt-0.5">{p.description}</div>
                            </td>
                            <td className="py-3 px-3">
                              <button
                                onClick={() => onSelectBoothForView(p.boothId)}
                                className="text-[11px] font-mono font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded border border-indigo-100 flex items-center gap-1 transition"
                                title="在前台地圖中定位此專櫃"
                              >
                                <span>{p.boothId}</span>
                                <span className="font-sans font-medium text-slate-600">({parentBooth?.name || '未知'})</span>
                              </button>
                            </td>
                            <td className="py-3 px-3">
                              <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                                {p.category}
                              </span>
                            </td>
                            <td className="py-3 px-3 font-mono font-bold text-emerald-700">
                              {p.price !== undefined ? `NT$ ${p.price.toLocaleString()}` : '-'}
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex flex-wrap gap-1 max-w-xs">
                                {p.tags.map((t, idx) => (
                                  <span key={idx} className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                    #{t}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => handleDuplicateProduct(p)}
                                  className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                  title="複製此商品為範本"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p.id)}
                                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                  title="下架刪除此商品"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400">
                          <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                          <p className="text-xs font-medium">查無符合條件之商品</p>
                          <button
                            onClick={() => { setProductSearch(''); setProductFilterBoothId('all'); setProductFilterZone('all'); }}
                            className="mt-2 text-[11px] text-indigo-600 hover:underline font-bold"
                          >
                            清除搜尋與篩選條件
                          </button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: BOOTH LIST & CREATION                             */}
        {/* ======================================================== */}
        {activeTab === 'booths' && (
          <div className="space-y-6" id="booth-management-tab-content">
            
            {/* Global Booth ID Map Visibility Quick Toggle Banner */}
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <span>平面圖專櫃代號 (Booth IDs) 顯示狀態</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      moduleSizes.showBoothIds !== false
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-slate-200 text-slate-600'
                    }`}>
                      {moduleSizes.showBoothIds !== false ? '目前：顯示代號 (A1, D2...)' : '目前：隱藏代號 (僅顯示店名)'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    控制前台與後台平面圖上是否顯示左上角的專櫃代號徽章。切換後前台即時同步。
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  const current = moduleSizes.showBoothIds !== false;
                  const next = !current;
                  onUpdateModuleSizes({ ...moduleSizes, showBoothIds: next });
                  onShowToast(`平面圖專櫃代號已設為「${next ? '顯示' : '隱藏'}」並即時套用至前台`);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 border ${
                  moduleSizes.showBoothIds !== false
                    ? 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 shadow-xs'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>{moduleSizes.showBoothIds !== false ? '切換為「隱藏代號」' : '切換為「顯示代號」'}</span>
              </button>
            </div>

            {/* Quick Booth Creation Card */}
            <form onSubmit={handleCreateBooth} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3">
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                <Store className="w-4 h-4 text-indigo-600" />
                <span>快速建立全新專櫃 (Add New Booth)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">櫃位代號 *</label>
                  <input
                    type="text"
                    value={newBoothId}
                    onChange={e => setNewBoothId(e.target.value)}
                    placeholder="例如: A8, B5, C10"
                    className="w-full bg-white px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-800 outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">專櫃名稱 *</label>
                  <input
                    type="text"
                    value={newBoothName}
                    onChange={e => setNewBoothName(e.target.value)}
                    placeholder="例如: Dyson 旗艦體驗店"
                    className="w-full bg-white px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">所屬分區</label>
                  <select
                    value={newBoothZone}
                    onChange={e => {
                      const z = e.target.value;
                      setNewBoothZone(z);
                      if (z.startsWith('A')) setNewBoothColor('teal');
                      else if (z.startsWith('B')) setNewBoothColor('rose');
                      else if (z.startsWith('C')) setNewBoothColor('violet');
                      else if (z.startsWith('D')) setNewBoothColor('amber');
                      else setNewBoothColor('emerald');
                    }}
                    className="w-full bg-white px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-indigo-500"
                  >
                    <option value="A區: 時尚潮流">A區: 時尚潮流</option>
                    <option value="B區: 美妝生活">B區: 美妝生活</option>
                    <option value="C區: 科技生活">C區: 科技生活</option>
                    <option value="D區: 美食天地">D區: 美食天地</option>
                    <option value="E區: 鮮綠超市">E區: 鮮綠超市</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">專櫃色系 ({BOOTH_COLOR_OPTIONS.length}色)</label>
                  <select
                    value={newBoothColor}
                    onChange={e => setNewBoothColor(e.target.value)}
                    className="w-full bg-white px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-indigo-500 font-medium"
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

              {/* Color Swatch Quick Picker */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 flex items-center justify-between">
                  <span>快速色彩選擇</span>
                  <span className="font-mono text-[10px] text-indigo-600 font-bold">
                    {BOOTH_COLOR_OPTIONS.find(o => o.key === newBoothColor)?.name || newBoothColor}
                  </span>
                </label>
                <div className="flex flex-wrap gap-1.5 p-2 bg-white border border-slate-200 rounded-xl">
                  {BOOTH_COLOR_OPTIONS.map(opt => {
                    const isCur = newBoothColor === opt.key;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setNewBoothColor(opt.key)}
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

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">專櫃服務與品牌介紹</label>
                <input
                  type="text"
                  value={newBoothDesc}
                  onChange={e => setNewBoothDesc(e.target.value)}
                  placeholder="簡介此專櫃的營業特色、主打項目..."
                  className="w-full bg-white px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-indigo-500"
                />
              </div>

              {boothFormError && (
                <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2 rounded-lg">
                  ⚠️ {boothFormError}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>建立專櫃並加入地圖</span>
                </button>
              </div>
            </form>

            {/* Search Booths */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={boothSearch}
                onChange={e => setBoothSearch(e.target.value)}
                placeholder="搜尋櫃位代號、名稱或分區..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>

            {/* Booths Table */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto max-h-[380px] scrollbar-thin">
                <table className="w-full text-left text-xs min-w-[580px]">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 sticky top-0 font-bold">
                    <tr>
                      <th className="py-2.5 px-3">代號</th>
                      <th className="py-2.5 px-3">專櫃名稱</th>
                      <th className="py-2.5 px-3">分區</th>
                      <th className="py-2.5 px-3">商品總數</th>
                      <th className="py-2.5 px-3">地圖坐標</th>
                      <th className="py-2.5 px-3 text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredBooths.length > 0 ? (
                      filteredBooths.map(b => {
                        const boothProdCount = products.filter(p => p.boothId === b.id).length;
                        return (
                          <tr key={b.id} className="hover:bg-slate-50">
                            <td className="py-3 px-3 font-mono font-bold text-indigo-600">{b.id}</td>
                            <td className="py-3 px-3 font-bold text-slate-900">{b.name}</td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-1.5">
                                <span 
                                  className="w-2.5 h-2.5 rounded-full inline-block shrink-0 shadow-xs border border-white"
                                  style={{ backgroundColor: getBoothThemeStyles(b.color).hex }}
                                  title={`色系: ${getBoothThemeStyles(b.color).name}`}
                                />
                                <span className="text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                  {b.zone}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-3 font-mono font-bold text-slate-700">
                              {boothProdCount} 款
                            </td>
                            <td className="py-3 px-3 font-mono text-slate-400">
                              X:{b.x}, Y:{b.y} ({b.width}×{b.height})
                            </td>
                            <td className="py-3 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleOpenAddProductForBooth(b.id)}
                                  className="px-2.5 py-1 text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition font-medium flex items-center gap-1"
                                  title="為此專櫃新增與管理商品清單"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>新增商品</span>
                                </button>

                                <button
                                  onClick={() => {
                                    setEditorTargetBoothId(b.id);
                                    setActiveTab('layout');
                                  }}
                                  className="px-2.5 py-1 text-xs text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition font-medium flex items-center gap-1"
                                  title="在可視化地圖編輯器中自訂調整此櫃位的位置與大小"
                                >
                                  <Move className="w-3 h-3" />
                                  <span>調整大小/位置</span>
                                </button>
                                
                                <button
                                  onClick={() => onSelectBoothForView(b.id)}
                                  className="px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-lg transition font-medium"
                                  title="在地圖檢視此櫃位"
                                >
                                  地圖定位
                                </button>
                                
                                <button
                                  onClick={() => handleDeleteBooth(b.id)}
                                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                  title="刪除櫃位"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          查無符合條件之櫃位
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: EXCEL BATCH IMPORT CENTER                        */}
        {/* ======================================================== */}
        {activeTab === 'excel' && (
          <div className="space-y-6" id="excel-import-tab-content">
            
            {/* Notification alert on successful import with quick navigation */}
            {importSuccessMsg && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-3xl text-xs flex flex-wrap items-center justify-between gap-3 shadow-sm animate-fadeIn">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-emerald-950 block">{importSuccessMsg}</span>
                    <span className="text-[11px] text-emerald-700">商品資料與空間平面圖已同步即時更新。</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setActiveTab('layout')}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition"
                  >
                    <Store className="w-3.5 h-3.5" />
                    <span>查看空間平面圖</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('products')}
                    className="px-3.5 py-1.5 bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-900 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>查看商品清單</span>
                  </button>
                </div>
              </div>
            )}

            {/* Quick helper controls bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 border border-slate-200 p-3 rounded-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-700">匯入作業輔助：</span>
                <button
                  type="button"
                  onClick={downloadExcelTemplate}
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-indigo-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-2xs"
                >
                  <ArrowDownToLine className="w-3.5 h-3.5 text-indigo-600" />
                  <span>下載標準 Excel 範本</span>
                </button>
                <button
                  type="button"
                  onClick={() => exportCurrentDataToExcel(booths, products)}
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-emerald-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>備份匯出目前資料 ({booths.length} 櫃位)</span>
                </button>
              </div>

              {booths.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowClearConfirmModal(true)}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                  title="清空專櫃與商品以便進行全新檔案匯入"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>事前清空現有資料</span>
                </button>
              )}
            </div>

            {/* Drag and drop upload zone */}
            {!uploadedFile ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center ${
                  isDragging
                    ? 'border-indigo-500 bg-indigo-50/60 scale-[0.99]'
                    : 'border-slate-300 hover:border-indigo-400 bg-slate-50/60 hover:bg-indigo-50/20'
                }`}
                id="excel-drag-drop-zone"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={e => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                  accept=".xlsx, .xls, .csv"
                  className="hidden"
                  id="excel-file-input"
                />

                <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-3 shadow-inner">
                  <UploadCloud className="w-7 h-7" />
                </div>

                <h4 className="text-sm font-bold text-slate-800 mb-1">
                  點擊選擇或將 Excel / CSV 檔案拖曳至此處
                </h4>
                <p className="text-xs text-slate-500 max-w-md mb-4">
                  支援標準 Excel (.xlsx, .xls) 及 CSV 檔案格式。系統將自動辨識工作表與「櫃位清單」、「商品清單」欄位。
                </p>

                <div className="flex items-center gap-3 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                    <Check className="w-3 h-3 text-emerald-500" />
                    雙向欄位智慧比對
                  </span>
                  <span className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                    <Check className="w-3 h-3 text-emerald-500" />
                    多工作表同時匯入
                  </span>
                  <span className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                    <Check className="w-3 h-3 text-emerald-500" />
                    匯入前即時預覽校驗
                  </span>
                </div>
              </div>
            ) : (
              /* File Details & Parse Results Dashboard */
              <div className="space-y-5 animate-fadeIn">
                
                {/* Uploaded File Info Card */}
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-wrap justify-between items-center gap-3 shadow-inner">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <span>{uploadedFile.name}</span>
                        <span className="text-[10px] font-mono text-slate-500 bg-white px-1.5 py-0.2 rounded border border-slate-200">
                          {(uploadedFile.size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        讀取時間：{new Date().toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleResetUpload}
                      className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold transition"
                    >
                      更換檔案
                    </button>
                  </div>
                </div>

                {/* Parsing Status or Error Overview */}
                {isParsing ? (
                  <div className="py-12 text-center">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-2" />
                    <p className="text-xs text-slate-600 font-bold">正在智慧解析 Excel 欄位與資料結構...</p>
                  </div>
                ) : parseResult ? (
                  <div className="space-y-4">
                    
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-white border border-slate-200 p-3 rounded-2xl shadow-xs">
                        <div className="text-[10px] text-slate-400 font-bold">解析櫃位總筆數</div>
                        <div className="text-base font-mono font-bold text-slate-800 mt-0.5">
                          {parseResult.summary.validBoothRows} <span className="text-xs font-normal text-slate-400">/ {parseResult.summary.totalBoothRows} 筆</span>
                        </div>
                      </div>
                      <div className="bg-white border border-slate-200 p-3 rounded-2xl shadow-xs">
                        <div className="text-[10px] text-slate-400 font-bold">解析商品總筆數</div>
                        <div className="text-base font-mono font-bold text-slate-800 mt-0.5">
                          {parseResult.summary.validProductRows} <span className="text-xs font-normal text-slate-400">/ {parseResult.summary.totalProductRows} 筆</span>
                        </div>
                      </div>
                      <div className="bg-white border border-slate-200 p-3 rounded-2xl shadow-xs">
                        <div className="text-[10px] text-slate-400 font-bold">錯誤與跳過筆數</div>
                        <div className="text-base font-mono font-bold text-rose-600 mt-0.5">
                          {parseResult.errors.length} <span className="text-xs font-normal text-slate-400">筆</span>
                        </div>
                      </div>
                      <div className="bg-white border border-slate-200 p-3 rounded-2xl shadow-xs">
                        <div className="text-[10px] text-slate-400 font-bold">欄位提醒與警告</div>
                        <div className="text-base font-mono font-bold text-amber-600 mt-0.5">
                          {parseResult.warnings.length} <span className="text-xs font-normal text-slate-400">則</span>
                        </div>
                      </div>
                    </div>

                    {/* Errors or warnings log */}
                    {(parseResult.errors.length > 0 || parseResult.warnings.length > 0) && (
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2 text-xs">
                        {parseResult.errors.map((err, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-rose-600">
                            <XCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{err}</span>
                          </div>
                        ))}
                        {parseResult.warnings.map((warn, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-amber-600">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            <span>{warn}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Preview Table Header & Tab switch */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
                      <div className="flex justify-between items-center flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setPreviewTab('booths')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                              previewTab === 'booths'
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <Store className="w-3.5 h-3.5" />
                            <span>預覽櫃位清單 ({parseResult.booths.length})</span>
                          </button>
                          <button
                            onClick={() => setPreviewTab('products')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                              previewTab === 'products'
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>預覽商品清單 ({parseResult.products.length})</span>
                          </button>
                        </div>

                        {/* Import Mode Selector */}
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-slate-500 font-bold">匯入策略:</span>
                          <select
                            value={importMode}
                            onChange={e => setImportMode(e.target.value as any)}
                            className="bg-slate-50 border border-slate-200 text-slate-700 font-bold px-2.5 py-1.5 rounded-xl outline-none"
                          >
                            <option value="upsert">智慧比對更新 (同ID更新，新ID新增)</option>
                            <option value="replace">全量覆蓋 (取代現有所有資料)</option>
                            <option value="append">直接追加 (保留現有並附加)</option>
                          </select>
                        </div>
                      </div>

                      {/* Preview Table Content */}
                      <div className="overflow-x-auto max-h-[300px] border border-slate-100 rounded-xl scrollbar-thin">
                        {previewTab === 'booths' ? (
                          <table className="w-full text-left text-xs min-w-[640px]">
                            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 sticky top-0 font-bold">
                              <tr>
                                <th className="py-2 px-3">櫃位代號</th>
                                <th className="py-2 px-3">專櫃名稱</th>
                                <th className="py-2 px-3">所屬分區</th>
                                <th className="py-2 px-3">坐標 (X, Y)</th>
                                <th className="py-2 px-3">尺寸 (寬 × 高)</th>
                                <th className="py-2 px-3">主題色</th>
                                <th className="py-2 px-3">簡介</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {parseResult.booths.map(b => (
                                <tr key={b.id} className="hover:bg-slate-50">
                                  <td className="py-2 px-3 font-mono font-bold text-indigo-600">{b.id}</td>
                                  <td className="py-2 px-3 font-bold text-slate-800 break-words">{b.name}</td>
                                  <td className="py-2 px-3 text-slate-600">{b.zone}</td>
                                  <td className="py-2 px-3 font-mono text-emerald-600 font-bold">({b.x}, {b.y})</td>
                                  <td className="py-2 px-3 font-mono text-slate-600">{b.width} × {b.height}</td>
                                  <td className="py-2 px-3 font-mono text-slate-500">{b.color}</td>
                                  <td className="py-2 px-3 text-slate-500 break-words max-w-xs">{b.description}</td>
                                </tr>
                              ))}
                              {parseResult.booths.length === 0 && (
                                <tr>
                                  <td colSpan={7} className="py-6 text-center text-slate-400">
                                    未在檔案中解析出櫃位資料
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        ) : (
                          <table className="w-full text-left text-xs min-w-[580px]">
                            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 sticky top-0 font-bold">
                              <tr>
                                <th className="py-2 px-3">商品名稱</th>
                                <th className="py-2 px-3">所屬櫃位</th>
                                <th className="py-2 px-3">分類</th>
                                <th className="py-2 px-3">售價</th>
                                <th className="py-2 px-3">標籤</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {parseResult.products.map(p => (
                                <tr key={p.id} className="hover:bg-slate-50">
                                  <td className="py-2 px-3 font-bold text-slate-800 break-words">{p.name}</td>
                                  <td className="py-2 px-3 font-mono font-bold text-indigo-600">{p.boothId}</td>
                                  <td className="py-2 px-3 text-slate-600">{p.category}</td>
                                  <td className="py-2 px-3 font-mono text-emerald-700">
                                    {p.price ? `NT$ ${p.price.toLocaleString()}` : '-'}
                                  </td>
                                  <td className="py-2 px-3 text-slate-500 break-words max-w-xs">
                                    {p.tags.join(', ')}
                                  </td>
                                </tr>
                              ))}
                              {parseResult.products.length === 0 && (
                                <tr>
                                  <td colSpan={5} className="py-6 text-center text-slate-400">
                                    未在檔案中解析出商品資料
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        )}
                      </div>

                      {/* Final Confirm Button */}
                      <div className="pt-2 flex justify-end gap-2">
                        <button
                          onClick={handleResetUpload}
                          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                        >
                          取消
                        </button>
                        <button
                          onClick={handleCommitImport}
                          className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5"
                          id="btn-confirm-excel-import"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>確認寫入系統資料庫</span>
                        </button>
                      </div>

                    </div>

                  </div>
                ) : null}

              </div>
            )}

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: MAP LEGEND EDITOR                                 */}
        {/* ======================================================== */}
        {activeTab === 'legends' && (
          <div className="space-y-4" id="map-legend-tab-content">
            <MapLegendEditor
              legends={legends}
              booths={booths}
              facilities={facilities}
              onUpdateLegends={onUpdateLegends}
              onShowToast={onShowToast}
            />
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: MODULE SIZE & LAYOUT SETTINGS                     */}
        {/* ======================================================== */}
        {activeTab === 'sizes' && (
          <div className="space-y-4" id="module-sizes-tab-content">
            <ModuleSizeManager
              settings={moduleSizes}
              onUpdateSettings={onUpdateModuleSizes}
              onShowToast={onShowToast}
            />
          </div>
        )}

      </div>

      {/* Clear All Data Confirmation Modal */}
      {showClearConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 space-y-4 animate-scaleUp">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  清除與重設賣場資料庫
                </h3>
                <p className="text-xs text-slate-500">
                  請選擇您要執行的清除方案
                </p>
              </div>
            </div>

            <div className="space-y-2.5 pt-1">
              {/* Option 1: Clear booths & products to blank slate */}
              <button
                type="button"
                onClick={handleClearBoothsAndProducts}
                className="w-full text-left p-3.5 bg-rose-50/50 hover:bg-rose-50 border border-rose-200/80 hover:border-rose-300 rounded-2xl transition group"
                id="btn-clear-booths-products"
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-xs text-rose-700 flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-rose-600" />
                    <span>一鍵清空專櫃與商品 (0 筆空白)</span>
                  </div>
                  <span className="text-[10px] text-rose-600 font-bold bg-rose-100 px-2 py-0.5 rounded-full">適合全新匯入</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 pl-6">
                  僅清空所有專櫃與商品列表，保留既有畫布尺寸與公共走道，方便全新上傳 Excel。
                </p>
              </button>

              {/* Option 2: Reset to default demo data */}
              <button
                type="button"
                onClick={handleExecuteClearAllData}
                className="w-full text-left p-3.5 bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-200 rounded-2xl transition group"
                id="btn-confirm-execute-clear-all"
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-xs text-slate-800 group-hover:text-indigo-700 flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-indigo-600" />
                    <span>還原為系統標準示範資料 (16 專櫃)</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold bg-slate-200 px-2 py-0.5 rounded-full">示範模式</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 pl-6">
                  清除所有自訂或匯入更動，恢復系統出廠的 16 間標準展示櫃位與目錄商品。
                </p>
              </button>

              {/* Option 3: Wipe everything */}
              <button
                type="button"
                onClick={handleWipeEverything}
                className="w-full text-left p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl transition group text-slate-600"
                id="btn-wipe-everything"
              >
                <div className="font-bold text-xs flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                  <span>徹底清除所有項目 (含設施與走道)</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 pl-4">
                  重置整個商場平面圖，專櫃、商品、公共設施與動線走道全數淨空。
                </p>
              </button>
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirmModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
              >
                取消關閉
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit System Title Modal */}
      {showEditTitleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn" id="modal-edit-system-title">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    修改系統主標題
                  </h3>
                  <p className="text-xs text-slate-500">
                    自訂前台頂部導覽列所顯示的品牌商場名稱與系統主標題
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditTitleModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
                id="btn-close-edit-title-modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  系統標題名稱 (System Title)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveSystemTitle();
                      }
                    }}
                    placeholder="請輸入系統主標題名稱（如：智慧商場導覽與管理系統）"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition pr-9"
                    autoFocus
                    id="input-edit-system-title-modal"
                  />
                  {tempTitle && (
                    <button
                      type="button"
                      onClick={() => setTempTitle('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                      title="清除輸入"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Real-time frontend preview card */}
              <div>
                <span className="text-[11px] font-bold text-slate-500 block mb-1.5">
                  前台導覽列即時外觀預覽
                </span>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                    <Compass className="w-5 h-5 animate-spin-slow" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm sm:text-base font-black tracking-tight text-slate-900 truncate">
                        {tempTitle.trim() || '（尚未輸入標題）'}
                      </span>
                      <span className="text-[9px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-1.5 py-0.2 rounded-full shrink-0">
                        v4.5 EXCEL PRO
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium">
                      支援商品/櫃位雙向查詢
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick suggestion tags */}
              <div>
                <span className="text-[11px] font-bold text-slate-500 block mb-1.5">
                  常用商場名稱快速填入
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    '智慧商場導覽與管理系統',
                    '新光三越購物中心導覽',
                    '遠東百貨空間導引與商品指南',
                    '誠品生活樓層導覽系統',
                    'Global Mall 智慧商場平面導引',
                    '城市旗艦展覽館空間導覽'
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setTempTitle(preset)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition ${
                        tempTitle === preset
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleResetSystemTitle}
                className="px-3 py-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 font-bold rounded-xl text-xs transition flex items-center gap-1.5"
                title={`恢復為預設名稱「${DEFAULT_SYSTEM_TITLE}」`}
                id="btn-reset-system-title-modal"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>還原預設</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditTitleModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                  id="btn-cancel-edit-title-modal"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleSaveSystemTitle}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition shadow-sm flex items-center gap-1.5"
                  id="btn-save-system-title-modal"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>確認儲存並套用</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
