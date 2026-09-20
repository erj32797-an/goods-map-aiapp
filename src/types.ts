export interface Product {
  id: string;
  name: string;
  category: string;
  tags: string[]; // Keyword tags for fuzzy search
  description: string;
  price?: number;
  boothId: string; // References Booth.id
}

export interface SearchQuery {
  text: string;
  type: 'all' | 'product' | 'booth';
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: string;
}

export interface Facility {
  id: string;
  type: 'entrance' | 'info' | 'escalator' | 'elevator' | 'restroom' | 'nursery' | 'cafe' | 'stairs' | 'atm' | 'exit' | 'pillar' | 'office' | 'custom';
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
  icon?: string;
  description?: string;
  // Text & Typography Customization
  fontSize?: number; // e.g. 9 to 24px (default 11)
  textPosition?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  textOrientation?: 'horizontal' | 'vertical'; // Horizontal (parallel) or Vertical (perpendicular)
  textOffsetX?: number; // pixel offset from anchor
  textOffsetY?: number;
  fontWeight?: 'normal' | 'medium' | 'bold' | 'black';
  textColor?: string;
}

export interface Walkway {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
  type?: 'primary' | 'secondary' | 'entrance' | 'custom';
  // Text & Typography Customization
  fontSize?: number; // default 10
  textPosition?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  textOrientation?: 'horizontal' | 'vertical'; // Horizontal (parallel) or Vertical (perpendicular)
  textOffsetX?: number;
  textOffsetY?: number;
  fontWeight?: 'normal' | 'medium' | 'bold' | 'black';
  textColor?: string;
}

export interface Booth {
  id: string; // e.g., "A1", "D2"
  name: string; // e.g., "日式拉麵"
  zone: string; // e.g., "D區: 美食廣場"
  color: string; // Hex or tailwind-friendly color class prefix
  x: number; // Grid or SVG relative x-coordinate (0-100 or actual scale)
  y: number; // Grid or SVG relative y-coordinate
  width: number; // Width on the map
  height: number; // Height on the map
  description: string;
  // Text & Typography Customization
  fontSize?: number; // default 12
  textPosition?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  textOrientation?: 'horizontal' | 'vertical'; // Horizontal (parallel) or Vertical (perpendicular)
  textOffsetX?: number;
  textOffsetY?: number;
  fontWeight?: 'normal' | 'medium' | 'bold' | 'black';
  textColor?: string;
}

export interface FloorPlanVersion {
  id: string;
  name: string;
  description?: string;
  createdAt: string; // ISO string
  updatedAt?: string;
  booths: Booth[];
  facilities: Facility[];
  walkways: Walkway[];
  zoneAreas?: ZoneArea[];
  tags?: string[];
  isFavorite?: boolean;
  canvasWidth?: number;
  canvasHeight?: number;
}

export interface FloorPlanExportData {
  app: string;
  version: string;
  exportedAt: string;
  name?: string;
  description?: string;
  booths: Booth[];
  facilities: Facility[];
  walkways: Walkway[];
  zoneAreas?: ZoneArea[];
  canvasWidth?: number;
  canvasHeight?: number;
}

export interface ZoneArea {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface MapLegendItem {
  id: string;
  name: string;
  color: string; // Key in BOOTH_COLOR_OPTIONS or hex
  category?: '分區主題' | '公共設施' | '狀態標示' | '自訂標籤' | string;
  description?: string;
  visible: boolean;
  zoneCode?: string;
}

export interface ModuleSizeSettings {
  // Layout column split between Search and Map on desktop: 2/10, 3/9, 4/8, 5/7, 6/6, 7/5, 8/4, or stacked 12/12
  columnRatio: '2:10' | '3:9' | '4:8' | '5:7' | '6:6' | '7:5' | '8:4' | '12:12';
  // Plane Map height (px)
  mapHeight: number; // e.g., 450 ~ 900, default 580
  // Search Panel min height (px)
  searchMinHeight: number; // e.g., 380 ~ 800, default 460
  // Search density mode
  searchDensity: 'compact' | 'comfortable' | 'spacious';
  // Search item card size
  searchCardSize: 'sm' | 'md' | 'lg';
  // Map SVG viewBox zoom / aspect ratio preset
  mapViewScale: number; // 0.8 to 1.5, default 1.0
  // Container max-width: 'full' | '7xl' | '6xl' | '5xl'
  contentMaxWidth: 'full' | '7xl' | '6xl' | '5xl';
  // Map corner roundness
  mapBorderRadius: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  // Show quick size toggle shortcuts directly on frontend
  showFrontendQuickResize: boolean;
  // Show or hide booth ID badge (e.g., A1, D2) on floor plan map
  showBoothIds?: boolean;
  // Spatial Floor Plan Canvas coordinate dimensions (px)
  canvasWidth?: number; // e.g., 600 ~ 3000, default 1000
  canvasHeight?: number; // e.g., 400 ~ 2000, default 500
  // Custom frontend system title (default: 智慧商場導覽與管理系統)
  systemTitle?: string;
}

