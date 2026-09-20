import * as XLSX from 'xlsx';
import { Booth, Product } from '../types';

export interface ParsedBoothRow {
  id: string;
  name: string;
  zone: string;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
  description: string;
  isValid: boolean;
  error?: string;
}

export interface ParsedProductRow {
  id: string;
  name: string;
  boothId: string;
  category: string;
  price?: number;
  tags: string[];
  description: string;
  isValid: boolean;
  error?: string;
}

export interface ParseResult {
  booths: ParsedBoothRow[];
  products: ParsedProductRow[];
  errors: string[];
  warnings: string[];
  summary: {
    totalBoothRows: number;
    validBoothRows: number;
    totalProductRows: number;
    validProductRows: number;
  };
}

// Coordinate slot presets for booths if coordinates are not provided in Excel
const SLOT_PRESETS = [
  { x: 50, y: 50, width: 80, height: 80 },
  { x: 180, y: 50, width: 90, height: 80 },
  { x: 310, y: 50, width: 90, height: 80 },
  { x: 630, y: 50, width: 80, height: 80 },
  { x: 740, y: 50, width: 80, height: 80 },
  { x: 850, y: 50, width: 80, height: 80 },
  { x: 50, y: 180, width: 80, height: 80 },
  { x: 310, y: 180, width: 90, height: 90 },
  { x: 520, y: 180, width: 90, height: 90 },
  { x: 850, y: 180, width: 80, height: 80 },
  { x: 50, y: 350, width: 90, height: 80 },
  { x: 180, y: 350, width: 80, height: 80 },
  { x: 310, y: 350, width: 100, height: 80 },
  { x: 520, y: 350, width: 90, height: 80 },
  { x: 740, y: 350, width: 80, height: 80 },
  { x: 850, y: 350, width: 80, height: 80 }
];

/**
 * Downloads a pre-formatted Excel template file for store manager
 */
export function downloadExcelTemplate() {
  const wb = XLSX.utils.book_new();

  // 1. Booths Template Data
  const boothsHeader = [
    '櫃位代號*', '專櫃名稱*', '所屬分區*', '色彩主題', '地圖X坐標', '地圖Y坐標', '寬度', '高度', '專櫃介紹'
  ];
  const boothsSampleRows = [
    ['A1', 'UNIQLO 優衣庫', 'A區: 時尚潮流', 'teal', 50, 50, 80, 80, '簡約高品質日常服飾與機能穿搭'],
    ['B1', 'SEPHORA 美妝旗艦', 'B區: 美妝生活', 'rose', 630, 50, 80, 80, '國際專櫃美妝與頂級護膚保養品'],
    ['C1', 'Apple 授權旗艦店', 'C區: 科技生活', 'violet', 850, 50, 80, 80, 'iPhone、Mac 與最新科技數位產品'],
    ['D1', '一風堂 日式拉麵', 'D區: 美食天地', 'amber', 50, 350, 90, 80, '日本正統濃厚豚骨拉麵與特製煎餃'],
    ['E1', 'Mia C’bon 高級超市', 'E區: 鮮綠超市', 'emerald', 850, 350, 80, 80, '進口生鮮、頂級和牛與產地直送蔬果']
  ];

  const boothsWs = XLSX.utils.aoa_to_sheet([boothsHeader, ...boothsSampleRows]);
  
  // Set column widths for booth sheet
  boothsWs['!cols'] = [
    { wch: 12 }, { wch: 22 }, { wch: 18 }, { wch: 12 }, 
    { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 35 }
  ];

  XLSX.utils.book_append_sheet(wb, boothsWs, '櫃位清單 (Booths)');

  // 2. Products Template Data
  const productsHeader = [
    '商品名稱*', '所屬櫃位代號*', '商品類別*', '價格(NT$)', '搜尋標籤(以逗號分隔)', '商品詳細描述'
  ];
  const productsSampleRows = [
    ['極輕羽絨外套', 'A1', '服裝 / 外套', 1990, '外套, 羽絨, 禦寒, 保暖, 冬季, 輕量', '90% 高純度羽絨，輕盈保暖防潑水'],
    ['AIRism 涼感內衣', 'A1', '服裝 / 內著', 390, '涼感, 排汗, 內衣, 夏季, 透氣', '科技吸汗排汗速乾纖維，親膚透氣'],
    ['小黑瓶 精華露 50ml', 'B1', '保養品 / 精華', 4380, '精華液, 保濕, 修護, 專櫃, 抗老', '微生態修護專利，讓肌膚維持透亮水潤'],
    ['M4 MacBook Air 15吋', 'C1', '電腦 / 筆電', 42900, 'MacBook, 筆電, Apple, M4, 輕薄', '強悍 M4 晶片效能與長達 18 小時電池續航力'],
    ['白丸元味 濃厚豚骨拉麵', 'D1', '主食 / 拉麵', 260, '拉麵, 豚骨, 叉燒, 午餐, 晚餐, 美食', '招牌濃厚絲滑豚骨高湯，搭配特製極細麵條'],
    ['日本產 麝香葡萄 特選禮盒', 'E1', '生鮮 / 水果', 1280, '葡萄, 麝香, 日本, 進口, 送禮, 水果', '日本直送頂級無籽麝香葡萄，清甜脆口帶花果香']
  ];

  const productsWs = XLSX.utils.aoa_to_sheet([productsHeader, ...productsSampleRows]);
  productsWs['!cols'] = [
    { wch: 26 }, { wch: 16 }, { wch: 18 }, { wch: 14 }, { wch: 36 }, { wch: 40 }
  ];

  XLSX.utils.book_append_sheet(wb, productsWs, '商品清單 (Products)');

  // Download
  XLSX.writeFile(wb, '商場櫃位與商品匯入範本_template.xlsx');
}

/**
 * Exports current active database as an Excel workbook
 */
export function exportCurrentDataToExcel(booths: Booth[], products: Product[]) {
  const wb = XLSX.utils.book_new();

  // Export Booths Sheet
  const boothRows = booths.map(b => ({
    '櫃位代號': b.id,
    '專櫃名稱': b.name,
    '所屬分區': b.zone,
    '色彩主題': b.color,
    '地圖X坐標': b.x,
    '地圖Y坐標': b.y,
    '寬度': b.width,
    '高度': b.height,
    '專櫃介紹': b.description
  }));
  const boothWs = XLSX.utils.json_to_sheet(boothRows);
  boothWs['!cols'] = [
    { wch: 12 }, { wch: 22 }, { wch: 18 }, { wch: 12 }, 
    { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 40 }
  ];
  XLSX.utils.book_append_sheet(wb, boothWs, '櫃位清單');

  // Export Products Sheet
  const productRows = products.map(p => ({
    '商品ID': p.id,
    '商品名稱': p.name,
    '所屬櫃位代號': p.boothId,
    '商品類別': p.category,
    '價格(NT$)': p.price ?? '',
    '搜尋標籤': p.tags.join(', '),
    '商品詳細描述': p.description
  }));
  const productWs = XLSX.utils.json_to_sheet(productRows);
  productWs['!cols'] = [
    { wch: 16 }, { wch: 26 }, { wch: 16 }, { wch: 18 }, { wch: 14 }, { wch: 36 }, { wch: 40 }
  ];
  XLSX.utils.book_append_sheet(wb, productWs, '商品清單');

  const timestamp = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `商場完整資料庫備份_${timestamp}.xlsx`);
}

/**
 * Normalizes an object's keys by trimming and mapping common Chinese/English column names
 */
function normalizeRow(row: Record<string, any>): Record<string, any> {
  const normalized: Record<string, any> = {};
  for (const [key, value] of Object.entries(row)) {
    const cleanKey = key.trim().toLowerCase().replace(/[\*\(\)（）\$\#\:\：\s]/g, '');
    normalized[cleanKey] = value;
  }
  return normalized;
}

function getVal(row: Record<string, any>, candidates: string[]): any {
  for (const c of candidates) {
    const cleanCandidate = c.toLowerCase().replace(/[\*\(\)（）\$\#\:\：\s]/g, '');
    const direct = row[cleanCandidate];
    if (direct !== undefined && direct !== null && direct !== '') return direct;
  }
  return undefined;
}

/**
 * Parses an uploaded Excel / CSV File and extracts Booths and Products with detailed validation
 */
export async function parseExcelFile(file: File): Promise<ParseResult> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });

  const parsedBooths: ParsedBoothRow[] = [];
  const parsedProducts: ParsedProductRow[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  const existingBoothIdMap = new Map<string, ParsedBoothRow>();
  let slotIndex = 0;

  workbook.SheetNames.forEach(sheetName => {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) return;

    // Convert sheet to JSON array
    const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });
    if (rawRows.length === 0) return;

    const firstRow = normalizeRow(rawRows[0]);
    const lowerSheetName = sheetName.toLowerCase();

    // Check if columns contain booth / product headers
    const hasBoothIdHeader = ['櫃位代號', '櫃位編號', '專櫃代號', '代號', 'boothid', 'booth_id', 'code', 'id'].some(k => k in firstRow);
    const hasBoothNameHeader = ['專櫃名稱', '櫃位名稱', '名稱', '店名', '專櫃', 'boothname', 'booth_name', 'storename'].some(k => k in firstRow);
    const hasProductNameHeader = ['商品名稱', '產品名稱', '品名', '商品', 'productname', 'product_name', 'itemname', 'item'].some(k => k in firstRow);

    const isBoothSheet = 
      lowerSheetName.includes('櫃位') || 
      lowerSheetName.includes('booth') || 
      lowerSheetName.includes('專櫃') ||
      (hasBoothNameHeader && !hasProductNameHeader) ||
      (hasBoothIdHeader && !hasProductNameHeader);

    const isProductSheet = 
      lowerSheetName.includes('商品') || 
      lowerSheetName.includes('product') || 
      lowerSheetName.includes('產品') ||
      lowerSheetName.includes('item') ||
      hasProductNameHeader;

    // 1. Parse Booth rows if booth sheet or mixed sheet
    if (isBoothSheet || (!isProductSheet && hasBoothNameHeader) || (hasBoothIdHeader && hasBoothNameHeader)) {
      rawRows.forEach((raw, idx) => {
        const row = normalizeRow(raw);
        const rowNum = idx + 2;

        const idRaw = getVal(row, ['櫃位代號', '櫃位編號', '專櫃代號', '代號', '代碼', 'boothid', 'booth_id', 'id', 'code']);
        const nameRaw = getVal(row, ['專櫃名稱', '櫃位名稱', '店名', '名稱', '專櫃', 'name', 'boothname', 'booth_name', 'title']);
        const zoneRaw = getVal(row, ['所屬分區', '分區名稱', '分區', '區域', 'zone', 'area', 'floor', '樓層']);
        const colorRaw = getVal(row, ['色彩主題', '顏色', '色系', '色彩', 'color', 'theme']);
        const xRaw = getVal(row, ['地圖x坐標', '地圖x座標', 'x坐標', 'x座標', '坐標x', '座標x', 'x位置', 'x軸', 'posx', 'left', 'positionx', 'x', 'pos_x', 'coord_x', 'coordinate_x', '橫坐標', '橫座標']);
        const yRaw = getVal(row, ['地圖y坐標', '地圖y座標', 'y坐標', 'y座標', '坐標y', '座標y', 'y位置', 'y軸', 'posy', 'top', 'positiony', 'y', 'pos_y', 'coord_y', 'coordinate_y', '縱坐標', '縱座標']);
        const wRaw = getVal(row, ['寬度', '寬', 'width', 'w', '長度', '長', 'length']);
        const hRaw = getVal(row, ['高度', '高', 'height', 'h', '深', '深度', 'depth']);
        const descRaw = getVal(row, ['專櫃介紹', '櫃位簡介', '專櫃描述', '描述', '說明', '簡介', 'description', 'desc']);

        const id = idRaw ? String(idRaw).trim().toUpperCase() : '';
        const name = nameRaw ? String(nameRaw).trim() : '';

        if (!id && !name) {
          return; // Skip empty row
        }

        let isValid = true;
        let errorMsg = '';

        if (!id) {
          isValid = false;
          errorMsg = '缺少櫃位代號';
        } else if (!name) {
          isValid = false;
          errorMsg = '缺少專櫃名稱';
        }

        // Zone resolution
        let zone = zoneRaw ? String(zoneRaw).trim() : '';
        if (!zone) {
          const prefix = (id.charAt(0) || 'A').toUpperCase();
          if (prefix === 'A') zone = 'A區: 時尚潮流';
          else if (prefix === 'B') zone = 'B區: 美妝生活';
          else if (prefix === 'C') zone = 'C區: 科技生活';
          else if (prefix === 'D') zone = 'D區: 美食天地';
          else if (prefix === 'E') zone = 'E區: 鮮綠超市';
          else zone = `${prefix}區: 精選專櫃`;
        } else if (!zone.includes('區') && !zone.includes('F')) {
          zone = `${id.charAt(0) || 'A'}區: ${zone}`;
        }

        // Color theme resolution
        let color = colorRaw ? String(colorRaw).trim().toLowerCase() : '';
        if (!color || !['teal', 'rose', 'violet', 'amber', 'emerald', 'blue', 'indigo', 'purple'].includes(color)) {
          if (zone.startsWith('A') || id.startsWith('A')) color = 'teal';
          else if (zone.startsWith('B') || id.startsWith('B')) color = 'rose';
          else if (zone.startsWith('C') || id.startsWith('C')) color = 'violet';
          else if (zone.startsWith('D') || id.startsWith('D')) color = 'amber';
          else if (zone.startsWith('E') || id.startsWith('E')) color = 'emerald';
          else color = 'teal';
        }

        // Coordinates & Dimension resolution - Unrestricted positioning
        const hasValidX = xRaw !== undefined && xRaw !== null && xRaw !== '' && !isNaN(Number(xRaw));
        const hasValidY = yRaw !== undefined && yRaw !== null && yRaw !== '' && !isNaN(Number(yRaw));
        const hasValidW = wRaw !== undefined && wRaw !== null && wRaw !== '' && !isNaN(Number(wRaw)) && Number(wRaw) > 0;
        const hasValidH = hRaw !== undefined && hRaw !== null && hRaw !== '' && !isNaN(Number(hRaw)) && Number(hRaw) > 0;

        let x = 0;
        let y = 0;
        let width = 90;
        let height = 75;

        if (hasValidX && hasValidY) {
          // Use exact coordinates provided in Excel without arbitrary upper bound clamping
          x = Math.max(0, Math.round(Number(xRaw)));
          y = Math.max(0, Math.round(Number(yRaw)));
          width = hasValidW ? Math.max(10, Math.round(Number(wRaw))) : 90;
          height = hasValidH ? Math.max(10, Math.round(Number(hRaw))) : 75;
        } else {
          // If coordinates are partially or completely missing, calculate intelligent non-overlapping grid slots
          const col = slotIndex % 6;
          const row = Math.floor(slotIndex / 6);
          const autoX = 40 + col * 150;
          const autoY = 40 + row * 110;
          slotIndex++;

          x = hasValidX ? Math.max(0, Math.round(Number(xRaw))) : autoX;
          y = hasValidY ? Math.max(0, Math.round(Number(yRaw))) : autoY;
          width = hasValidW ? Math.max(10, Math.round(Number(wRaw))) : 90;
          height = hasValidH ? Math.max(10, Math.round(Number(hRaw))) : 75;

          warnings.push(`工作表「${sheetName}」第 ${rowNum} 行專櫃 [${id || name}] 未提供完整坐標，已自動設定初始位置 (${x}, ${y})。`);
        }

        const description = descRaw ? String(descRaw).trim() : `${name} 優質專櫃服務`;

        const boothRow: ParsedBoothRow = {
          id: id || `B_${Date.now().toString(36)}_${idx}`,
          name: name || id,
          zone,
          color,
          x,
          y,
          width,
          height,
          description,
          isValid,
          error: errorMsg || undefined
        };

        if (isValid && !existingBoothIdMap.has(boothRow.id)) {
          existingBoothIdMap.set(boothRow.id, boothRow);
          parsedBooths.push(boothRow);
        }
      });
    }

    // 2. Parse Product rows if product sheet or mixed sheet
    if (isProductSheet || hasProductNameHeader) {
      rawRows.forEach((raw, idx) => {
        const row = normalizeRow(raw);
        const rowNum = idx + 2;

        const nameRaw = getVal(row, ['商品名稱', '產品名稱', '品名', '商品', 'name', 'productname', 'product_name', 'title', 'item']);
        const boothIdRaw = getVal(row, ['所屬櫃位代號', '所屬櫃位', '櫃位代號', '專櫃代號', '櫃位編號', '櫃位', '專櫃', 'boothid', 'booth_id', 'booth', 'code']);
        const categoryRaw = getVal(row, ['商品類別', '產品類別', '類別', '分類', '類別名稱', 'category', 'type']);
        const priceRaw = getVal(row, ['價格', '商品價格', '價格nt', '單價', '售價', '定價', 'price', 'cost', 'amount']);
        const tagsRaw = getVal(row, ['搜尋標籤', '標籤', '關鍵字', 'tags', 'keywords']);
        const descRaw = getVal(row, ['商品詳細描述', '商品描述', '商品簡介', '產品說明', '描述', '說明', 'description', 'desc', 'detail']);
        const idRaw = getVal(row, ['商品id', '產品id', '商品代號', 'id', 'productid', 'sku']);

        const name = nameRaw ? String(nameRaw).trim() : '';
        let boothId = boothIdRaw ? String(boothIdRaw).trim().toUpperCase() : '';

        // If booth ID is missing but booth name is in the row, or fallback to first known booth
        if (!boothId && firstRow['專櫃名稱']) {
          const bName = String(firstRow['專櫃名稱']).trim();
          const matched = Array.from(existingBoothIdMap.values()).find(b => b.name === bName);
          if (matched) boothId = matched.id;
        }

        if (!name && !boothId) {
          return; // Skip empty row
        }

        let isValid = true;
        let errorMsg = '';

        if (!name) {
          isValid = false;
          errorMsg = '缺少商品名稱';
        } else if (!boothId) {
          // If product has no boothId assigned, assign default or warning
          boothId = 'A1';
          warnings.push(`工作表「${sheetName}」第 ${rowNum} 行商品「${name}」缺少所屬櫃位，已自動指派至 A1 專櫃。`);
        }

        const category = categoryRaw ? String(categoryRaw).trim() : '精選商品';
        
        let price: number | undefined = undefined;
        if (priceRaw !== undefined && priceRaw !== '') {
          const num = Number(String(priceRaw).replace(/[^0-9.]/g, ''));
          if (!isNaN(num)) price = num;
        }

        // Tags parsing (split by comma, space, slash, etc.)
        let tags: string[] = [];
        if (tagsRaw) {
          tags = String(tagsRaw)
            .split(/[,，、/|\s]+/)
            .map(t => t.trim())
            .filter(Boolean);
        }
        if (tags.length === 0 && name) {
          tags = [name, category];
        }

        const description = descRaw ? String(descRaw).trim() : `${name} - ${category} 優質選品`;

        parsedProducts.push({
          id: idRaw ? String(idRaw).trim() : `p_imp_${Date.now().toString(36)}_${idx}`,
          name,
          boothId,
          category,
          price,
          tags,
          description,
          isValid,
          error: errorMsg || undefined
        });
      });
    }
  });

  // 3. Auto-discover missing booths referenced by products
  parsedProducts.forEach(prod => {
    if (prod.isValid && prod.boothId && !existingBoothIdMap.has(prod.boothId)) {
      const preset = SLOT_PRESETS[slotIndex % SLOT_PRESETS.length];
      slotIndex++;
      const prefix = prod.boothId.charAt(0).toUpperCase();
      let color = 'teal';
      let zone = `${prefix}區: 精選專櫃`;

      if (prefix === 'A') { color = 'teal'; zone = 'A區: 時尚潮流'; }
      else if (prefix === 'B') { color = 'rose'; zone = 'B區: 美妝生活'; }
      else if (prefix === 'C') { color = 'violet'; zone = 'C區: 科技生活'; }
      else if (prefix === 'D') { color = 'amber'; zone = 'D區: 美食天地'; }
      else if (prefix === 'E') { color = 'emerald'; zone = 'E區: 鮮綠超市'; }

      const autoBooth: ParsedBoothRow = {
        id: prod.boothId,
        name: `${prod.boothId} 專櫃`,
        zone,
        color,
        x: preset.x,
        y: preset.y,
        width: preset.width,
        height: preset.height,
        description: `${prod.boothId} 專櫃（商品目錄自動生成）`,
        isValid: true
      };

      existingBoothIdMap.set(prod.boothId, autoBooth);
      parsedBooths.push(autoBooth);
      warnings.push(`商品參照之專櫃 [${prod.boothId}] 已自動生成並加入平面圖。`);
    }
  });

  if (parsedBooths.length === 0 && parsedProducts.length === 0) {
    errors.push('無法在檔案中辨識出櫃位清單或商品清單。請確認欄位標題是否包含「櫃位代號/專櫃名稱」或「商品名稱/所屬櫃位代號」，或下載標準範本填寫。');
  }

  const validBoothCount = parsedBooths.filter(b => b.isValid).length;
  const validProductCount = parsedProducts.filter(p => p.isValid).length;

  return {
    booths: parsedBooths,
    products: parsedProducts,
    errors,
    warnings,
    summary: {
      totalBoothRows: parsedBooths.length,
      validBoothRows: validBoothCount,
      totalProductRows: parsedProducts.length,
      validProductRows: validProductCount
    }
  };
}
