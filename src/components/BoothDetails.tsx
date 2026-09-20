import React from 'react';
import { 
  Store, 
  ShoppingBag, 
  X, 
  Sparkles, 
  ArrowRight, 
  ExternalLink 
} from 'lucide-react';
import { Booth, Product } from '../types';
import { getBoothThemeStyles } from '../data';

interface BoothDetailsProps {
  booth: Booth | null;
  products: Product[];
  allBooths?: Booth[];
  onSelectBooth?: (boothId: string) => void;
  onClose: () => void;
  onManageInAdmin?: (boothId: string) => void;
}

export default function BoothDetails({
  booth,
  products,
  allBooths = [],
  onSelectBooth,
  onClose,
  onManageInAdmin
}: BoothDetailsProps) {
  if (!booth) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col items-center justify-center text-center transition-all duration-200" id="empty-details-container">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-3 shadow-2xs">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
          <span>詳細商品清單</span>
        </h4>
        <p className="text-xs text-slate-500 max-w-[280px] leading-relaxed">
          點擊右方平面圖中的任何櫃位、圖例分區或上方搜尋結果，即可在此檢視該專櫃的詳細商品清單與營業資訊。
        </p>
      </div>
    );
  }

  // Filter products belonging to this booth
  const boothProducts = products.filter(p => p.boothId === booth.id);
  const colorTheme = getBoothThemeStyles(booth.color);

  // Find other booths in the same zone
  const sameZoneBooths = allBooths.filter(b => b.zone === booth.zone && b.id !== booth.id);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-3.5 sm:p-5 shadow-sm flex flex-col max-h-[480px] overflow-hidden transition-all duration-300" id="booth-details-container">
      
      {/* Header section with zone, title and clear btn */}
      <div className="flex justify-between items-start gap-3 mb-3" id="details-header">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 mb-1">
            <span className="text-[10px] font-mono font-bold bg-slate-50 text-slate-600 border border-slate-200 px-2 py-0.5 rounded shrink-0">
              櫃位代號 {booth.id}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${colorTheme.badgeClass} shrink-0`}>
              {booth.zone}
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2 break-words">
            <Store className={`w-5 h-5 ${colorTheme.iconClass} shrink-0`} />
            <span className="break-words">{booth.name}</span>
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition duration-150 shrink-0"
          title="關閉專區"
          id="btn-close-details"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Booth Description text */}
      <div className="bg-slate-50 border border-slate-200 p-3 sm:p-3.5 rounded-2xl mb-3 shadow-inner" id="booth-desc-card">
        <p className="text-xs text-slate-600 leading-relaxed font-sans break-words">
          {booth.description}
        </p>
      </div>

      {/* Same Zone Other Booths quick links */}
      {sameZoneBooths.length > 0 && (
        <div className="mb-3 p-2.5 bg-slate-50/80 border border-slate-200 rounded-2xl">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-500 shrink-0" />
            <span>同區其他專櫃 ({sameZoneBooths.length}):</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {sameZoneBooths.map(zb => (
              <button
                key={zb.id}
                type="button"
                onClick={() => onSelectBooth && onSelectBooth(zb.id)}
                className="text-[11px] font-bold px-2.5 py-1 bg-white hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 text-slate-700 rounded-xl border border-slate-200 transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
                title={`前往同區「${zb.name}」`}
              >
                <span className="text-[9px] font-mono text-slate-400 shrink-0">{zb.id}</span>
                <span className="break-words">{zb.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main product listings tab & actions header */}
      <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-bold uppercase">
          <ShoppingBag className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>詳細商品清單 ({boothProducts.length})</span>
        </div>

        {onManageInAdmin && (
          <button
            onClick={() => onManageInAdmin(booth.id)}
            className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2.5 py-1 rounded-xl transition flex items-center gap-1 shrink-0"
            title="前往後台管理與新增此櫃位的商品清單"
            id="btn-goto-admin-products"
          >
            <span>後台商品管理</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Products list viewport */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-2 space-y-3.5 scrollbar-thin custom-scrollbar scroll-smooth" id="booth-products-list">
        {boothProducts.length > 0 ? (
          boothProducts.map(product => (
            <div
              key={product.id}
              className="bg-white border border-slate-200 hover:border-indigo-500 p-3 sm:p-3.5 rounded-2xl flex flex-col sm:flex-row justify-between items-start gap-3 group transition duration-150 shadow-sm hover:shadow"
            >
              <div className="space-y-1.5 flex-1 min-w-0 w-full">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <span className="text-[10px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 font-medium">
                    {product.category}
                  </span>
                  {product.price && (
                    <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded flex items-center shadow-sm shrink-0">
                      NT$ {product.price.toLocaleString()}
                    </span>
                  )}
                </div>
                
                <h4 className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors break-words">
                  {product.name}
                </h4>
                
                <p className="text-xs text-slate-500 leading-relaxed font-sans break-words">
                  {product.description}
                </p>

                {/* Sub-tags list */}
                {product.tags && product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {product.tags.map(tag => (
                      <span key={tag} className="text-[9px] text-slate-500 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded break-words">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <ShoppingBag className="w-8 h-8 text-slate-400 mb-2" />
            <h5 className="text-xs font-bold text-slate-600 mb-1">櫃位目前尚無商品</h5>
            <p className="text-[11px] text-slate-500 max-w-[240px] leading-relaxed">
              此專櫃目前尚未登錄上架商品。
            </p>
            {onManageInAdmin && (
              <button
                onClick={() => onManageInAdmin(booth.id)}
                className="mt-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-xl shadow-sm transition flex items-center gap-1.5"
              >
                <span>前往後台新增商品</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
