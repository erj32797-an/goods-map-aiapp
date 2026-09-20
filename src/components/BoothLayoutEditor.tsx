import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { 
  Maximize2, 
  Minimize2, 
  Grid, 
  RotateCcw, 
  Check, 
  Trash2, 
  Copy, 
  Layers, 
  ZoomIn, 
  ZoomOut, 
  Compass, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight, 
  ArrowUpDown,
  ChevronDown,
  Sparkles,
  Eye,
  AlertTriangle,
  Undo2,
  Redo2,
  ShoppingBag,
  Edit3,
  Type,
  Tag,
  Scaling,
  X
} from 'lucide-react';
import { Booth, Product, Facility, Walkway } from '../types';
import { DEFAULT_FACILITIES, DEFAULT_WALKWAYS, getBoothThemeStyles } from '../data';
import FloorPlanPresetModal from './floorplan/FloorPlanPresetModal';
import FacilityToolbar from './floorplan/FacilityToolbar';
import FloorPlanInspector from './floorplan/FloorPlanInspector';
import CanvasSizeModal from './floorplan/CanvasSizeModal';

interface BoothLayoutEditorProps {
  booths: Booth[];
  products: Product[];
  facilities?: Facility[];
  walkways?: Walkway[];
  canvasWidth?: number;
  canvasHeight?: number;
  onUpdateCanvasDimensions?: (newWidth: number, newHeight: number, scaleExisting: boolean) => void;
  showBoothIds?: boolean;
  onToggleShowBoothIds?: (show: boolean) => void;
  onUpdateBooths: (booths: Booth[]) => void;
  onUpdateFacilities?: (facilities: Facility[]) => void;
  onUpdateWalkways?: (walkways: Walkway[]) => void;
  onShowToast: (msg: string) => void;
  onSelectBoothForView?: (boothId: string) => void;
  onGoToProductsForBooth?: (boothId: string) => void;
  initialSelectedBoothId?: string | null;
}

type DragTargetType = 'booth' | 'facility' | 'walkway' | null;

type DragMode = 
  | 'move'
  | 'move-text'
  | 'resize-nw' 
  | 'resize-n' 
  | 'resize-ne' 
  | 'resize-e' 
  | 'resize-se' 
  | 'resize-s' 
  | 'resize-sw' 
  | 'resize-w' 
  | null;

// History snapshot
interface LayoutSnapshot {
  booths: Booth[];
  facilities: Facility[];
  walkways: Walkway[];
}

export default function BoothLayoutEditor({
  booths,
  products,
  facilities = DEFAULT_FACILITIES,
  walkways = DEFAULT_WALKWAYS,
  canvasWidth: propCanvasWidth = 1000,
  canvasHeight: propCanvasHeight = 500,
  onUpdateCanvasDimensions,
  showBoothIds: propShowBoothIds,
  onToggleShowBoothIds,
  onUpdateBooths,
  onUpdateFacilities,
  onUpdateWalkways,
  onShowToast,
  onSelectBoothForView,
  onGoToProductsForBooth,
  initialSelectedBoothId
}: BoothLayoutEditorProps) {

  const currentCanvasWidth = propCanvasWidth || 1000;
  const currentCanvasHeight = propCanvasHeight || 500;
  const [showCanvasSizeModal, setShowCanvasSizeModal] = useState<boolean>(false);

  // Design mode: 'booth' | 'facility' | 'walkway'
  const [activeMode, setActiveMode] = useState<'booth' | 'facility' | 'walkway'>('booth');

  // Nudge target mode for arrow controls: 'element' (nudge entire element) | 'text' (nudge text offset)
  const [nudgeTargetMode, setNudgeTargetMode] = useState<'element' | 'text'>('element');

  // Selected Target
  const [selectedBoothId, setSelectedBoothId] = useState<string>(() => {
    if (initialSelectedBoothId && booths.some(b => b.id === initialSelectedBoothId)) {
      return initialSelectedBoothId;
    }
    return '';
  });

  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null);
  const [selectedWalkwayId, setSelectedWalkwayId] = useState<string | null>(null);

  // Booth ID visibility state
  const [showBoothIds, setShowBoothIds] = useState<boolean>(propShowBoothIds !== undefined ? propShowBoothIds : true);

  // Sync prop changes
  useEffect(() => {
    if (propShowBoothIds !== undefined) {
      setShowBoothIds(propShowBoothIds);
    }
  }, [propShowBoothIds]);

  // On-Canvas Direct Inline Text Editing State
  const [editingFacilityTextId, setEditingFacilityTextId] = useState<string | null>(null);
  const [editingFacilityTextValue, setEditingFacilityTextValue] = useState<string>('');

  const [editingBoothTextId, setEditingBoothTextId] = useState<string | null>(null);
  const [editingBoothTextValue, setEditingBoothTextValue] = useState<string>('');

  const [editingWalkwayTextId, setEditingWalkwayTextId] = useState<string | null>(null);
  const [editingWalkwayTextValue, setEditingWalkwayTextValue] = useState<string>('');

  // Preset Blueprint Modal
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);

  // In-app confirmation dialog state for clear operations (avoiding iframe sandbox window.confirm blocks)
  const [clearModalConfig, setClearModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    onConfirm: () => void;
  } | null>(null);

  // History stack for Undo / Redo
  const [history, setHistory] = useState<LayoutSnapshot[]>([
    { booths, facilities, walkways }
  ]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Canvas Settings
  const [snapGrid, setSnapGrid] = useState<number>(10); // 0 = off, 5, 10, 20
  const [showGridLines, setShowGridLines] = useState<boolean>(true);
  const [showAllDimensions, setShowAllDimensions] = useState<boolean>(false);
  const [showWalkwaysLayer, setShowWalkwaysLayer] = useState<boolean>(true);
  const [showFacilitiesLayer, setShowFacilitiesLayer] = useState<boolean>(true);
  const [showBoothsLayer, setShowBoothsLayer] = useState<boolean>(true);
  const [highlightOverlap, setHighlightOverlap] = useState<boolean>(true);

  // Canvas Zoom & Pan & Dimensions
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanningCanvas, setIsPanningCanvas] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [viewportHeight, setViewportHeight] = useState<number>(580);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showZoomMenu, setShowZoomMenu] = useState<boolean>(false);
  const [showHeightMenu, setShowHeightMenu] = useState<boolean>(false);

  // Vertical drag-to-resize state for canvas height
  const [isResizingHeight, setIsResizingHeight] = useState<boolean>(false);
  const resizeStartYRef = useRef<number>(0);
  const resizeStartHeightRef = useRef<number>(580);

  // Touch gesture state for pinch-to-zoom and touch pan
  const touchStateRef = useRef<{
    initialDist: number;
    initialScale: number;
    lastX: number;
    lastY: number;
    touchCount: number;
  }>({
    initialDist: 0,
    initialScale: 1,
    lastX: 0,
    lastY: 0,
    touchCount: 0
  });

  // Drag & Resize State
  const [dragTargetType, setDragTargetType] = useState<DragTargetType>(null);
  const [dragTargetId, setDragTargetId] = useState<string | null>(null);
  const [dragMode, setDragMode] = useState<DragMode>(null);
  const [dragStartPoint, setDragStartPoint] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [initialItemState, setInitialItemState] = useState<{ x: number; y: number; width: number; height: number; textOffsetX?: number; textOffsetY?: number } | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);

  // Wheel zoom handler with non-passive event listener & scroll isolation
  useEffect(() => {
    const viewport = canvasContainerRef.current;
    if (!viewport) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (typeof e.stopImmediatePropagation === 'function') {
        e.stopImmediatePropagation();
      }
      const factor = e.deltaY < 0 ? 1.1 : 0.9;
      setZoomScale(prev => Math.min(Math.max(Number((prev * factor).toFixed(2)), 0.4), 3.5));
    };

    viewport.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      viewport.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Vertical canvas viewport height resize handlers
  const handleStartResizeHeight = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizingHeight(true);
    resizeStartYRef.current = e.clientY;
    resizeStartHeightRef.current = viewportHeight;
  };

  useEffect(() => {
    if (!isResizingHeight) return;

    const handleMouseMoveHeight = (e: MouseEvent) => {
      const dy = e.clientY - resizeStartYRef.current;
      const newH = Math.min(Math.max(Math.round(resizeStartHeightRef.current + dy), 420), 1100);
      setViewportHeight(newH);
    };

    const handleMouseUpHeight = () => {
      setIsResizingHeight(false);
    };

    window.addEventListener('mousemove', handleMouseMoveHeight);
    window.addEventListener('mouseup', handleMouseUpHeight);
    return () => {
      window.removeEventListener('mousemove', handleMouseMoveHeight);
      window.removeEventListener('mouseup', handleMouseUpHeight);
    };
  }, [isResizingHeight]);

  // Touch gesture handlers for mobile pinch-to-zoom and touch pan
  const handleCanvasTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      touchStateRef.current = {
        initialDist: 0,
        initialScale: zoomScale,
        lastX: e.touches[0].clientX - panOffset.x,
        lastY: e.touches[0].clientY - panOffset.y,
        touchCount: 1
      };
      setIsPanningCanvas(true);
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStateRef.current = {
        initialDist: dist,
        initialScale: zoomScale,
        lastX: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        lastY: (e.touches[0].clientY + e.touches[1].clientY) / 2,
        touchCount: 2
      };
      setIsPanningCanvas(false);
    }
  };

  const handleCanvasTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1 && touchStateRef.current.touchCount === 1) {
      setPanOffset({
        x: e.touches[0].clientX - touchStateRef.current.lastX,
        y: e.touches[0].clientY - touchStateRef.current.lastY
      });
    } else if (e.touches.length === 2 && touchStateRef.current.initialDist > 0) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = dist / touchStateRef.current.initialDist;
      const newScale = Math.min(Math.max(Number((touchStateRef.current.initialScale * ratio).toFixed(2)), 0.4), 3.5);
      setZoomScale(newScale);
    }
  };

  const handleCanvasTouchEnd = () => {
    setIsPanningCanvas(false);
    touchStateRef.current.touchCount = 0;
    touchStateRef.current.initialDist = 0;
  };

  // Derived selections
  const selectedBooth = booths.find(b => b.id === selectedBoothId) || null;
  const selectedFacility = facilities.find(f => f.id === selectedFacilityId) || null;
  const selectedWalkway = walkways.find(w => w.id === selectedWalkwayId) || null;

  // History Helper
  const pushHistory = useCallback((newBooths: Booth[], newFacilities: Facility[], newWalkways: Walkway[]) => {
    setHistory(prev => {
      const sliced = prev.slice(0, historyIndex + 1);
      return [...sliced, { booths: newBooths, facilities: newFacilities, walkways: newWalkways }];
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      const targetIndex = historyIndex - 1;
      setHistoryIndex(targetIndex);
      const snapshot = history[targetIndex];
      onUpdateBooths(snapshot.booths);
      if (onUpdateFacilities) onUpdateFacilities(snapshot.facilities);
      if (onUpdateWalkways) onUpdateWalkways(snapshot.walkways);
      onShowToast('已復原上一步動作');
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const targetIndex = historyIndex + 1;
      setHistoryIndex(targetIndex);
      const snapshot = history[targetIndex];
      onUpdateBooths(snapshot.booths);
      if (onUpdateFacilities) onUpdateFacilities(snapshot.facilities);
      if (onUpdateWalkways) onUpdateWalkways(snapshot.walkways);
      onShowToast('已重做動作');
    }
  };

  // Convert browser client coordinates to SVG viewBox coordinates
  const getSvgCoordinates = useCallback((clientX: number, clientY: number) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    return { x: svgP.x, y: svgP.y };
  }, []);

  const snap = useCallback((val: number, step: number) => {
    if (step <= 1) return Math.round(val);
    return Math.round(val / step) * step;
  }, []);

  // Update Booth
  const updateBooth = useCallback((id: string, updates: Partial<Booth>, saveToHistory = false) => {
    const updated = booths.map(b => b.id === id ? { ...b, ...updates } : b);
    onUpdateBooths(updated);
    if (saveToHistory) {
      pushHistory(updated, facilities, walkways);
    }
  }, [booths, facilities, walkways, onUpdateBooths, pushHistory]);

  // Update Facility
  const updateFacility = useCallback((id: string, updates: Partial<Facility>, saveToHistory = false) => {
    if (!onUpdateFacilities) return;
    const updated = facilities.map(f => f.id === id ? { ...f, ...updates } : f);
    onUpdateFacilities(updated);
    if (saveToHistory) {
      pushHistory(booths, updated, walkways);
    }
  }, [booths, facilities, walkways, onUpdateFacilities, pushHistory]);

  // Update Walkway
  const updateWalkway = useCallback((id: string, updates: Partial<Walkway>, saveToHistory = false) => {
    if (!onUpdateWalkways) return;
    const updated = walkways.map(w => w.id === id ? { ...w, ...updates } : w);
    onUpdateWalkways(updated);
    if (saveToHistory) {
      pushHistory(booths, facilities, updated);
    }
  }, [booths, facilities, walkways, onUpdateWalkways, pushHistory]);

  // ----------------------------------------------------
  // On-Canvas Direct Inline Text Editing Handlers
  // ----------------------------------------------------
  const handleStartEditFacilityText = (id: string, currentName: string) => {
    setEditingFacilityTextId(id);
    setEditingFacilityTextValue(currentName);
    setSelectedFacilityId(id);
    setSelectedBoothId('');
    setSelectedWalkwayId(null);
    setActiveMode('facility');
  };

  const handleCommitFacilityTextEdit = () => {
    if (!editingFacilityTextId) return;
    const trimmed = editingFacilityTextValue.trim();
    if (trimmed) {
      updateFacility(editingFacilityTextId, { name: trimmed }, true);
      onShowToast(`已更新設施文字為「${trimmed}」`);
    }
    setEditingFacilityTextId(null);
    setEditingFacilityTextValue('');
  };

  const handleCancelFacilityTextEdit = () => {
    setEditingFacilityTextId(null);
    setEditingFacilityTextValue('');
  };

  // Facility position nudge directly on element (unrestricted positioning)
  const handleNudgeFacility = (id: string, dx: number, dy: number) => {
    const fac = facilities.find(f => f.id === id);
    if (!fac) return;
    const newX = Math.round(fac.x + dx);
    const newY = Math.round(fac.y + dy);
    updateFacility(id, { x: newX, y: newY }, true);
  };

  // Facility text offset nudge (XY Offset)
  const handleNudgeFacilityTextOffset = (id: string, dx: number, dy: number) => {
    const fac = facilities.find(f => f.id === id);
    if (!fac) return;
    const curX = fac.textOffsetX || 0;
    const curY = fac.textOffsetY || 0;
    const newX = curX + dx;
    const newY = curY + dy;
    updateFacility(id, { textOffsetX: newX, textOffsetY: newY }, true);
    onShowToast(`設施文字微調：X ${newX >= 0 ? `+${newX}` : newX}px, Y ${newY >= 0 ? `+${newY}` : newY}px`);
  };

  const handleResetFacilityTextOffset = (id: string) => {
    updateFacility(id, { textOffsetX: 0, textOffsetY: 0 }, true);
    onShowToast('已重設設施文字位移為預設位置');
  };

  // Facility quick font size adjustment
  const handleAdjustFacilityFontSize = (id: string, delta: number) => {
    const fac = facilities.find(f => f.id === id);
    if (!fac) return;
    const current = fac.fontSize || 11;
    const next = Math.max(8, Math.min(32, current + delta));
    updateFacility(id, { fontSize: next }, true);
    onShowToast(`設施文字大小: ${next}px`);
  };

  // Facility quick text alignment position
  const handleSetFacilityTextPosition = (id: string, textPosition: Facility['textPosition']) => {
    updateFacility(id, { textPosition }, true);
    onShowToast(`文字位置設為「${textPosition === 'center' ? '置中' : textPosition === 'top' ? '靠頂' : textPosition === 'bottom' ? '靠底' : textPosition === 'left' ? '靠左' : '靠右'}」`);
  };

  // Facility text orientation toggle (horizontal / vertical)
  const handleToggleFacilityTextOrientation = (id: string) => {
    const fac = facilities.find(f => f.id === id);
    if (!fac) return;
    const next = fac.textOrientation === 'vertical' ? 'horizontal' : 'vertical';
    updateFacility(id, { textOrientation: next }, true);
    onShowToast(`設施文字方向設為「${next === 'vertical' ? '垂直 (直向)' : '平行 (橫向)'}」`);
  };

  // Facility type switcher directly on element
  const handleChangeFacilityType = (id: string, type: Facility['type']) => {
    let defaultColor = 'slate';
    if (type === 'nursery') defaultColor = 'pink';
    else if (type === 'entrance') defaultColor = 'emerald';
    else if (type === 'info') defaultColor = 'blue';
    else if (type === 'cafe') defaultColor = 'amber';
    else if (type === 'elevator') defaultColor = 'indigo';
    else if (type === 'atm') defaultColor = 'emerald';
    else if (type === 'exit') defaultColor = 'rose';
    else if (type === 'pillar') defaultColor = 'slate';
    else if (type === 'office') defaultColor = 'teal';

    updateFacility(id, { type, color: defaultColor }, true);
    onShowToast(`設施類型已切換`);
  };

  // Booth inline rename handlers
  const handleStartEditBoothText = (id: string, currentName: string) => {
    setEditingBoothTextId(id);
    setEditingBoothTextValue(currentName);
    setSelectedBoothId(id);
    setSelectedFacilityId(null);
    setSelectedWalkwayId(null);
    setActiveMode('booth');
  };

  const handleCommitBoothTextEdit = () => {
    if (!editingBoothTextId) return;
    const trimmed = editingBoothTextValue.trim();
    if (trimmed) {
      updateBooth(editingBoothTextId, { name: trimmed }, true);
      onShowToast(`已更新專櫃名稱為「${trimmed}」`);
    }
    setEditingBoothTextId(null);
    setEditingBoothTextValue('');
  };

  const handleCancelBoothTextEdit = () => {
    setEditingBoothTextId(null);
    setEditingBoothTextValue('');
  };

  // Booth position nudge directly on element (unrestricted positioning)
  const handleNudgeBooth = (id: string, dx: number, dy: number) => {
    const booth = booths.find(b => b.id === id);
    if (!booth) return;
    const newX = Math.round(booth.x + dx);
    const newY = Math.round(booth.y + dy);
    updateBooth(id, { x: newX, y: newY }, true);
  };

  // Booth text offset nudge (XY Offset)
  const handleNudgeBoothTextOffset = (id: string, dx: number, dy: number) => {
    const booth = booths.find(b => b.id === id);
    if (!booth) return;
    const curX = booth.textOffsetX || 0;
    const curY = booth.textOffsetY || 0;
    const newX = curX + dx;
    const newY = curY + dy;
    updateBooth(id, { textOffsetX: newX, textOffsetY: newY }, true);
    onShowToast(`專櫃文字微調：X ${newX >= 0 ? `+${newX}` : newX}px, Y ${newY >= 0 ? `+${newY}` : newY}px`);
  };

  const handleResetBoothTextOffset = (id: string) => {
    updateBooth(id, { textOffsetX: 0, textOffsetY: 0 }, true);
    onShowToast('已重設專櫃文字位移為預設位置');
  };

  // Booth quick font size adjustment
  const handleAdjustBoothFontSize = (id: string, delta: number) => {
    const booth = booths.find(b => b.id === id);
    if (!booth) return;
    const current = booth.fontSize || 12;
    const next = Math.max(8, Math.min(32, current + delta));
    updateBooth(id, { fontSize: next }, true);
    onShowToast(`專櫃文字大小: ${next}px`);
  };

  // Booth quick text position
  const handleSetBoothTextPosition = (id: string, textPosition: Booth['textPosition']) => {
    updateBooth(id, { textPosition }, true);
    onShowToast(`文字位置設為「${textPosition === 'center' ? '置中' : textPosition === 'top' ? '靠頂' : textPosition === 'bottom' ? '靠底' : textPosition === 'left' ? '靠左' : '靠右'}」`);
  };

  // Booth text orientation toggle (horizontal / vertical)
  const handleToggleBoothTextOrientation = (id: string) => {
    const booth = booths.find(b => b.id === id);
    if (!booth) return;
    const next = booth.textOrientation === 'vertical' ? 'horizontal' : 'vertical';
    updateBooth(id, { textOrientation: next }, true);
    onShowToast(`專櫃文字方向設為「${next === 'vertical' ? '垂直 (直向)' : '平行 (橫向)'}」`);
  };

  // Walkway inline rename handlers
  const handleStartEditWalkwayText = (id: string, currentName: string) => {
    setEditingWalkwayTextId(id);
    setEditingWalkwayTextValue(currentName);
    setSelectedWalkwayId(id);
    setSelectedBoothId('');
    setSelectedFacilityId(null);
    setActiveMode('walkway');
  };

  // Walkway position nudge directly on element (unrestricted positioning)
  const handleNudgeWalkway = (id: string, dx: number, dy: number) => {
    const walk = walkways.find(w => w.id === id);
    if (!walk) return;
    const newX = Math.round(walk.x + dx);
    const newY = Math.round(walk.y + dy);
    updateWalkway(id, { x: newX, y: newY }, true);
  };

  // Walkway text offset nudge (XY Offset)
  const handleNudgeWalkwayTextOffset = (id: string, dx: number, dy: number) => {
    const walk = walkways.find(w => w.id === id);
    if (!walk) return;
    const curX = walk.textOffsetX || 0;
    const curY = walk.textOffsetY || 0;
    const newX = curX + dx;
    const newY = curY + dy;
    updateWalkway(id, { textOffsetX: newX, textOffsetY: newY }, true);
    onShowToast(`動線文字微調：X ${newX >= 0 ? `+${newX}` : newX}px, Y ${newY >= 0 ? `+${newY}` : newY}px`);
  };

  const handleResetWalkwayTextOffset = (id: string) => {
    updateWalkway(id, { textOffsetX: 0, textOffsetY: 0 }, true);
    onShowToast('已重設動線文字位移為預設位置');
  };

  // Walkway quick font size adjustment
  const handleAdjustWalkwayFontSize = (id: string, delta: number) => {
    const walk = walkways.find(w => w.id === id);
    if (!walk) return;
    const current = walk.fontSize || 10;
    const next = Math.max(8, Math.min(32, current + delta));
    updateWalkway(id, { fontSize: next }, true);
    onShowToast(`通道文字大小: ${next}px`);
  };

  // Walkway quick text position
  const handleSetWalkwayTextPosition = (id: string, textPosition: Walkway['textPosition']) => {
    updateWalkway(id, { textPosition }, true);
    onShowToast(`動線文字位置設為「${textPosition === 'center' ? '置中' : textPosition === 'top' ? '靠頂' : textPosition === 'bottom' ? '靠底' : textPosition === 'left' ? '靠左' : '靠右'}」`);
  };

  // Walkway text orientation toggle (horizontal / vertical)
  const handleToggleWalkwayTextOrientation = (id: string) => {
    const walk = walkways.find(w => w.id === id);
    if (!walk) return;
    const next = walk.textOrientation === 'vertical' ? 'horizontal' : 'vertical';
    updateWalkway(id, { textOrientation: next }, true);
    onShowToast(`動線文字方向設為「${next === 'vertical' ? '垂直 (直向)' : '平行 (橫向)'}」`);
  };

  const handleCommitWalkwayTextEdit = () => {
    if (!editingWalkwayTextId) return;
    const trimmed = editingWalkwayTextValue.trim();
    if (trimmed) {
      updateWalkway(editingWalkwayTextId, { name: trimmed }, true);
      onShowToast(`已更新動線街道名稱為「${trimmed}」`);
    }
    setEditingWalkwayTextId(null);
    setEditingWalkwayTextValue('');
  };

  const handleCancelWalkwayTextEdit = () => {
    setEditingWalkwayTextId(null);
    setEditingWalkwayTextValue('');
  };

  // ----------------------------------------------------
  // Interactive Drag & Resize Start (Elements and Text)
  // ----------------------------------------------------
  const handleStartMove = (e: React.MouseEvent, type: DragTargetType, id: string, initialBox: { x: number; y: number; width: number; height: number }) => {
    e.stopPropagation();
    if (e.button !== 0) return;

    setDragTargetType(type);
    setDragTargetId(id);
    setDragMode('move');
    setInitialItemState({ ...initialBox });

    if (type === 'booth') {
      setSelectedBoothId(id);
      setSelectedFacilityId(null);
      setSelectedWalkwayId(null);
      setActiveMode('booth');
    } else if (type === 'facility') {
      setSelectedFacilityId(id);
      setSelectedBoothId('');
      setSelectedWalkwayId(null);
      setActiveMode('facility');
    } else if (type === 'walkway') {
      setSelectedWalkwayId(id);
      setSelectedBoothId('');
      setSelectedFacilityId(null);
      setActiveMode('walkway');
    }

    const svgPt = getSvgCoordinates(e.clientX, e.clientY);
    setDragStartPoint(svgPt);
  };

  // Interactive Direct Text Dragging Start (Smooth Drag & Micro-adjust on Canvas)
  const handleStartTextMove = (e: React.MouseEvent, type: DragTargetType, id: string, initialOffsets: { offsetX: number; offsetY: number }) => {
    e.stopPropagation();
    if (e.button !== 0) return;

    setDragTargetType(type);
    setDragTargetId(id);
    setDragMode('move-text');
    setInitialItemState({
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      textOffsetX: initialOffsets.offsetX || 0,
      textOffsetY: initialOffsets.offsetY || 0
    });

    if (type === 'booth') {
      setSelectedBoothId(id);
      setSelectedFacilityId(null);
      setSelectedWalkwayId(null);
      setActiveMode('booth');
    } else if (type === 'facility') {
      setSelectedFacilityId(id);
      setSelectedBoothId('');
      setSelectedWalkwayId(null);
      setActiveMode('facility');
    } else if (type === 'walkway') {
      setSelectedWalkwayId(id);
      setSelectedBoothId('');
      setSelectedFacilityId(null);
      setActiveMode('walkway');
    }

    const svgPt = getSvgCoordinates(e.clientX, e.clientY);
    setDragStartPoint(svgPt);
  };

  const handleStartResize = (e: React.MouseEvent, type: DragTargetType, id: string, mode: DragMode, initialBox: { x: number; y: number; width: number; height: number }) => {
    e.stopPropagation();
    if (e.button !== 0) return;

    setDragTargetType(type);
    setDragTargetId(id);
    setDragMode(mode);
    setInitialItemState({ ...initialBox });

    if (type === 'booth') {
      setSelectedBoothId(id);
      setSelectedFacilityId(null);
      setSelectedWalkwayId(null);
    } else if (type === 'facility') {
      setSelectedFacilityId(id);
      setSelectedBoothId('');
      setSelectedWalkwayId(null);
    } else if (type === 'walkway') {
      setSelectedWalkwayId(id);
      setSelectedBoothId('');
      setSelectedFacilityId(null);
    }

    const svgPt = getSvgCoordinates(e.clientX, e.clientY);
    setDragStartPoint(svgPt);
  };

  // ----------------------------------------------------
  // Global Mouse Handlers
  // ----------------------------------------------------
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // 1. Panning Canvas
      if (isPanningCanvas) {
        setPanOffset({
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y
        });
        return;
      }

      // 2. Dragging/Resizing target item or text
      if (!dragMode || !dragTargetType || !dragTargetId || !initialItemState) return;

      const currentPt = getSvgCoordinates(e.clientX, e.clientY);
      const dx = currentPt.x - dragStartPoint.x;
      const dy = currentPt.y - dragStartPoint.y;

      // Handle Direct Text Offset Dragging
      if (dragMode === 'move-text') {
        const dX = Math.round(dx);
        const dY = Math.round(dy);
        const baseOffX = initialItemState.textOffsetX || 0;
        const baseOffY = initialItemState.textOffsetY || 0;
        const newOffX = baseOffX + dX;
        const newOffY = baseOffY + dY;

        if (dragTargetType === 'booth') {
          updateBooth(dragTargetId, { textOffsetX: newOffX, textOffsetY: newOffY });
        } else if (dragTargetType === 'facility') {
          updateFacility(dragTargetId, { textOffsetX: newOffX, textOffsetY: newOffY });
        } else if (dragTargetType === 'walkway') {
          updateWalkway(dragTargetId, { textOffsetX: newOffX, textOffsetY: newOffY });
        }
        return;
      }

      let newX = initialItemState.x;
      let newY = initialItemState.y;
      let newW = initialItemState.width;
      let newH = initialItemState.height;

      const minWidth = dragTargetType === 'pillar' ? 15 : 25;
      const minHeight = dragTargetType === 'pillar' ? 15 : 20;
      const step = snapGrid;
      const boundMaxX = Math.max(20, currentCanvasWidth - 20);
      const boundMaxY = Math.max(20, currentCanvasHeight - 20);

      switch (dragMode) {
        case 'move': {
          newX = snap(initialItemState.x + dx, step);
          newY = snap(initialItemState.y + dy, step);
          newX = Math.max(20, Math.min(boundMaxX - newW, newX));
          newY = Math.max(20, Math.min(boundMaxY - newH, newY));
          break;
        }

        case 'resize-se': {
          newW = Math.max(minWidth, snap(initialItemState.width + dx, step));
          newH = Math.max(minHeight, snap(initialItemState.height + dy, step));
          newW = Math.min(boundMaxX - newX, newW);
          newH = Math.min(boundMaxY - newY, newH);
          break;
        }

        case 'resize-e': {
          newW = Math.max(minWidth, snap(initialItemState.width + dx, step));
          newW = Math.min(boundMaxX - newX, newW);
          break;
        }

        case 'resize-s': {
          newH = Math.max(minHeight, snap(initialItemState.height + dy, step));
          newH = Math.min(boundMaxY - newY, newH);
          break;
        }

        case 'resize-w': {
          const rawW = initialItemState.width - dx;
          const snappedW = snap(rawW, step);
          if (snappedW >= minWidth) {
            const calculatedX = initialItemState.x + (initialItemState.width - snappedW);
            if (calculatedX >= 20) {
              newW = snappedW;
              newX = calculatedX;
            }
          }
          break;
        }

        case 'resize-n': {
          const rawH = initialItemState.height - dy;
          const snappedH = snap(rawH, step);
          if (snappedH >= minHeight) {
            const calculatedY = initialItemState.y + (initialItemState.height - snappedH);
            if (calculatedY >= 20) {
              newH = snappedH;
              newY = calculatedY;
            }
          }
          break;
        }

        case 'resize-nw': {
          const rawW = initialItemState.width - dx;
          const rawH = initialItemState.height - dy;
          const snappedW = snap(rawW, step);
          const snappedH = snap(rawH, step);
          if (snappedW >= minWidth) {
            const calculatedX = initialItemState.x + (initialItemState.width - snappedW);
            if (calculatedX >= 20) {
              newW = snappedW;
              newX = calculatedX;
            }
          }
          if (snappedH >= minHeight) {
            const calculatedY = initialItemState.y + (initialItemState.height - snappedH);
            if (calculatedY >= 20) {
              newH = snappedH;
              newY = calculatedY;
            }
          }
          break;
        }

        case 'resize-ne': {
          newW = Math.max(minWidth, snap(initialItemState.width + dx, step));
          newW = Math.min(boundMaxX - newX, newW);
          const rawH = initialItemState.height - dy;
          const snappedH = snap(rawH, step);
          if (snappedH >= minHeight) {
            const calculatedY = initialItemState.y + (initialItemState.height - snappedH);
            if (calculatedY >= 20) {
              newH = snappedH;
              newY = calculatedY;
            }
          }
          break;
        }

        case 'resize-sw': {
          const rawW = initialItemState.width - dx;
          const snappedW = snap(rawW, step);
          if (snappedW >= minWidth) {
            const calculatedX = initialItemState.x + (initialItemState.width - snappedW);
            if (calculatedX >= 20) {
              newW = snappedW;
              newX = calculatedX;
            }
          }
          newH = Math.max(minHeight, snap(initialItemState.height + dy, step));
          newH = Math.min(boundMaxY - newY, newH);
          break;
        }
      }

      if (dragTargetType === 'booth') {
        updateBooth(dragTargetId, { x: newX, y: newY, width: newW, height: newH });
      } else if (dragTargetType === 'facility') {
        updateFacility(dragTargetId, { x: newX, y: newY, width: newW, height: newH });
      } else if (dragTargetType === 'walkway') {
        updateWalkway(dragTargetId, { x: newX, y: newY, width: newW, height: newH });
      }
    };

    const handleMouseUp = () => {
      if (dragMode && dragTargetId) {
        pushHistory(booths, facilities, walkways);
      }
      setDragMode(null);
      setDragTargetType(null);
      setDragTargetId(null);
      setInitialItemState(null);
      setIsPanningCanvas(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [
    dragMode,
    dragTargetType,
    dragTargetId,
    initialItemState,
    dragStartPoint,
    snapGrid,
    getSvgCoordinates,
    snap,
    updateBooth,
    updateFacility,
    updateWalkway,
    pushHistory,
    booths,
    facilities,
    walkways,
    isPanningCanvas,
    panStart,
    currentCanvasWidth,
    currentCanvasHeight
  ]);

  // Keyboard shortcut for deleting selected element or nudging element/text
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing inside input, textarea or select
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedFacilityId) {
          e.preventDefault();
          handleDeleteFacility(selectedFacilityId);
        } else if (selectedWalkwayId) {
          e.preventDefault();
          handleDeleteWalkway(selectedWalkwayId);
        } else if (selectedBoothId) {
          e.preventDefault();
          handleDeleteBooth(selectedBoothId);
        }
        return;
      }

      // Arrow keys nudging (Support Alt+Arrow or nudgeTargetMode === 'text' for text offset, otherwise element nudge)
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        const isTextNudge = e.altKey || nudgeTargetMode === 'text';
        const mult = e.shiftKey ? (isTextNudge ? 5 : 20) : (isTextNudge ? 1 : 5);
        let dx = 0;
        let dy = 0;
        if (e.key === 'ArrowLeft') dx = -mult;
        else if (e.key === 'ArrowRight') dx = mult;
        else if (e.key === 'ArrowUp') dy = -mult;
        else if (e.key === 'ArrowDown') dy = mult;

        if (isTextNudge) {
          if (selectedFacilityId) {
            e.preventDefault();
            handleNudgeFacilityTextOffset(selectedFacilityId, dx, dy);
          } else if (selectedWalkwayId) {
            e.preventDefault();
            handleNudgeWalkwayTextOffset(selectedWalkwayId, dx, dy);
          } else if (selectedBoothId) {
            e.preventDefault();
            handleNudgeBoothTextOffset(selectedBoothId, dx, dy);
          }
        } else {
          if (selectedFacilityId) {
            e.preventDefault();
            handleNudgeFacility(selectedFacilityId, dx, dy);
          } else if (selectedWalkwayId) {
            e.preventDefault();
            handleNudgeWalkway(selectedWalkwayId, dx, dy);
          } else if (selectedBoothId) {
            e.preventDefault();
            handleNudgeBooth(selectedBoothId, dx, dy);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedFacilityId,
    selectedWalkwayId,
    selectedBoothId,
    facilities,
    walkways,
    booths,
    nudgeTargetMode,
    handleNudgeFacility,
    handleNudgeFacilityTextOffset,
    handleNudgeWalkway,
    handleNudgeWalkwayTextOffset,
    handleNudgeBooth,
    handleNudgeBoothTextOffset
  ]);

  // Canvas Pan start
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 && e.target === canvasContainerRef.current) {
      setIsPanningCanvas(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  // ----------------------------------------------------
  // Add / Duplicate / Delete Actions
  // ----------------------------------------------------
  const handleQuickAddBooth = () => {
    const nextNum = booths.length + 1;
    const newId = `X${nextNum}`;
    const newBooth: Booth = {
      id: newId,
      name: `新專櫃 ${nextNum}`,
      zone: 'A區: 時尚潮流',
      color: 'teal',
      x: Math.max(20, Math.round(currentCanvasWidth / 2 - 75)),
      y: Math.max(20, Math.round(currentCanvasHeight / 2 - 50)),
      width: 150,
      height: 100,
      description: '新成立專櫃，可於右側修改名稱與上架商品。'
    };
    const updated = [...booths, newBooth];
    onUpdateBooths(updated);
    pushHistory(updated, facilities, walkways);
    setSelectedBoothId(newId);
    setSelectedFacilityId(null);
    setSelectedWalkwayId(null);
    setActiveMode('booth');
    onShowToast(`已新增專櫃「${newId}」`);
  };

  const handleAddFacility = (type: Facility['type'], name: string, color: string, width: number, height: number, description?: string) => {
    if (!onUpdateFacilities) return;
    const newId = `fac_${Date.now().toString().slice(-4)}`;
    const newFac: Facility = {
      id: newId,
      type,
      name,
      x: Math.max(10, Math.round(currentCanvasWidth / 2 - width / 2)),
      y: Math.max(10, Math.round(currentCanvasHeight / 2 - height / 2)),
      width,
      height,
      color,
      description: description || `${name} 公共設施標記`
    };
    const updated = [...facilities, newFac];
    onUpdateFacilities(updated);
    pushHistory(booths, updated, walkways);
    setSelectedFacilityId(newId);
    setSelectedBoothId('');
    setSelectedWalkwayId(null);
    setActiveMode('facility');
    onShowToast(`已新增公共設施「${name}」`);
  };

  const handleAddWalkway = (name: string, type: Walkway['type'], width: number, height: number, color?: string) => {
    if (!onUpdateWalkways) return;
    const newId = `walk_${Date.now().toString().slice(-4)}`;
    const newWalk: Walkway = {
      id: newId,
      name,
      type,
      x: Math.max(20, Math.round(currentCanvasWidth / 2 - width / 2)),
      y: Math.max(20, Math.round(currentCanvasHeight / 2 - height / 2)),
      width,
      height,
      color: color || (type === 'entrance' ? '#e2e8f0' : '#f1f5f9')
    };
    const updated = [...walkways, newWalk];
    onUpdateWalkways(updated);
    pushHistory(booths, facilities, updated);
    setSelectedWalkwayId(newId);
    setSelectedBoothId('');
    setSelectedFacilityId(null);
    setActiveMode('walkway');
    onShowToast(`已新增動線走道「${name}」`);
  };

  const handleDeleteBooth = (id: string) => {
    const target = booths.find(b => b.id === id);
    if (!target) return;
    const remaining = booths.filter(b => b.id !== id);
    onUpdateBooths(remaining);
    pushHistory(remaining, facilities, walkways);
    setSelectedBoothId(remaining[0]?.id || '');
    onShowToast(`已刪除專櫃「${target.id} - ${target.name}」(可按復原回復)`);
  };

  const handleDeleteFacility = (id: string) => {
    if (!onUpdateFacilities) return;
    const target = facilities.find(f => f.id === id);
    if (!target) return;
    const remaining = facilities.filter(f => f.id !== id);
    onUpdateFacilities(remaining);
    pushHistory(booths, remaining, walkways);
    setSelectedFacilityId(null);
    onShowToast(`已刪除設施「${target.name}」`);
  };

  const handleDeleteWalkway = (id: string) => {
    if (!onUpdateWalkways) return;
    const target = walkways.find(w => w.id === id);
    if (!target) return;
    const remaining = walkways.filter(w => w.id !== id);
    onUpdateWalkways(remaining);
    pushHistory(booths, facilities, remaining);
    setSelectedWalkwayId(null);
    onShowToast(`已刪除通道「${target.name}」`);
  };

  const handleDuplicateBooth = (booth: Booth) => {
    const newId = `${booth.id}_COPY`;
    const newBooth: Booth = {
      ...booth,
      id: newId,
      name: `${booth.name} (複本)`,
      x: Math.min(Math.max(20, currentCanvasWidth - booth.width - 20), booth.x + 20),
      y: Math.min(Math.max(20, currentCanvasHeight - booth.height - 20), booth.y + 20)
    };
    const updated = [...booths, newBooth];
    onUpdateBooths(updated);
    pushHistory(updated, facilities, walkways);
    setSelectedBoothId(newId);
    onShowToast(`已建立專櫃複本「${newId}」`);
  };

  const handleDuplicateFacility = (facility: Facility) => {
    if (!onUpdateFacilities) return;
    const newId = `fac_${Date.now().toString().slice(-4)}`;
    const duplicate: Facility = {
      ...facility,
      id: newId,
      name: `${facility.name} (複製)`,
      x: Math.min(Math.max(10, currentCanvasWidth - facility.width - 10), facility.x + 20),
      y: Math.min(Math.max(10, currentCanvasHeight - facility.height - 10), facility.y + 20)
    };
    const updated = [...facilities, duplicate];
    onUpdateFacilities(updated);
    pushHistory(booths, updated, walkways);
    setSelectedFacilityId(newId);
    setSelectedBoothId('');
    setSelectedWalkwayId(null);
    onShowToast(`已複製設施「${duplicate.name}」`);
  };

  const handleDuplicateWalkway = (walkway: Walkway) => {
    if (!onUpdateWalkways) return;
    const newId = `walk_${Date.now().toString().slice(-4)}`;
    const duplicate: Walkway = {
      ...walkway,
      id: newId,
      name: `${walkway.name} (複製)`,
      x: Math.min(Math.max(20, currentCanvasWidth - walkway.width - 20), walkway.x + 20),
      y: Math.min(Math.max(20, currentCanvasHeight - walkway.height - 20), walkway.y + 20)
    };
    const updated = [...walkways, duplicate];
    onUpdateWalkways(updated);
    pushHistory(booths, facilities, updated);
    setSelectedWalkwayId(newId);
    setSelectedBoothId('');
    setSelectedFacilityId(null);
    onShowToast(`已複製動線走道「${duplicate.name}」`);
  };

  // Clear & Reset Handlers for Background & Stores
  const handleClearAllFacilities = () => {
    if (!onUpdateFacilities) return;
    setClearModalConfig({
      isOpen: true,
      title: '確定清空所有公共設施？',
      description: '此操作將清空哺乳室、服務台、洗手間等所有公共設施。可隨時透過工具列「還原預設設施」或右上角「復原」按鈕回復。',
      confirmLabel: '確認清空公共設施',
      onConfirm: () => {
        onUpdateFacilities([]);
        pushHistory(booths, [], walkways);
        setSelectedFacilityId(null);
        onShowToast('已清空所有公共設施 (可按復原回復)');
        setClearModalConfig(null);
      }
    });
  };

  const handleClearAllWalkways = () => {
    if (!onUpdateWalkways) return;
    setClearModalConfig({
      isOpen: true,
      title: '確定清空所有動線街道走道？',
      description: '此操作將清空畫布上的所有通道與街道走道。可隨時透過工具列「還原預設街道」或「復原」按鈕回復。',
      confirmLabel: '確認清空街道走道',
      onConfirm: () => {
        onUpdateWalkways([]);
        pushHistory(booths, facilities, []);
        setSelectedWalkwayId(null);
        onShowToast('已清空所有街道走道 (可按復原回復)');
        setClearModalConfig(null);
      }
    });
  };

  const handleClearAllBackground = () => {
    setClearModalConfig({
      isOpen: true,
      title: '確定清空所有背景元件？',
      description: '包含所有公共設施與街道動線。清空後可隨時透過「還原預設背景元件」或「復原」按鈕回復。',
      confirmLabel: '確認清空全部背景',
      onConfirm: () => {
        if (onUpdateFacilities) onUpdateFacilities([]);
        if (onUpdateWalkways) onUpdateWalkways([]);
        pushHistory(booths, [], []);
        setSelectedFacilityId(null);
        setSelectedWalkwayId(null);
        onShowToast('已清空所有背景設施與街道走道 (可按復原回復)');
        setClearModalConfig(null);
      }
    });
  };

  const handleResetDefaultFacilities = () => {
    if (!onUpdateFacilities) return;
    onUpdateFacilities(DEFAULT_FACILITIES);
    pushHistory(booths, DEFAULT_FACILITIES, walkways);
    onShowToast('已還原為預設公共設施（含哺乳室、洗手間、服務台）');
  };

  const handleResetDefaultWalkways = () => {
    if (!onUpdateWalkways) return;
    onUpdateWalkways(DEFAULT_WALKWAYS);
    pushHistory(booths, facilities, DEFAULT_WALKWAYS);
    onShowToast('已還原為預設街道與主要通道');
  };

  const handleClearAllBooths = () => {
    setClearModalConfig({
      isOpen: true,
      title: '確定清空所有專櫃攤位？',
      description: '此操作將清空畫布上的所有專櫃攤位。清空後可隨時透過右上角「復原」按鈕隨時回復。',
      confirmLabel: '確認清空所有專櫃',
      onConfirm: () => {
        onUpdateBooths([]);
        pushHistory([], facilities, walkways);
        setSelectedBoothId('');
        onShowToast('已清空所有專櫃攤位 (可按復原回復)');
        setClearModalConfig(null);
      }
    });
  };

  const handleApplyLayout = (newBooths: Booth[], newFacilities: Facility[], newWalkways: Walkway[], versionTitle?: string) => {
    onUpdateBooths(newBooths);
    if (onUpdateFacilities) onUpdateFacilities(newFacilities);
    if (onUpdateWalkways) onUpdateWalkways(newWalkways);
    pushHistory(newBooths, newFacilities, newWalkways);
    setSelectedBoothId(newBooths[0]?.id || '');
    setSelectedFacilityId(null);
    setSelectedWalkwayId(null);
    if (versionTitle) {
      onShowToast(`已成功載入「${versionTitle}」平面圖配置！`);
    } else {
      onShowToast('已成功套用空間平面圖配置！');
    }
  };

  // Overlap Detection
  const checkOverlap = (b1: Booth, b2: Booth) => {
    return (
      b1.id !== b2.id &&
      b1.x < b2.x + b2.width &&
      b1.x + b1.width > b2.x &&
      b1.y < b2.y + b2.height &&
      b1.y + b1.height > b2.y
    );
  };

  const overlappingBoothIds = new Set<string>();
  if (highlightOverlap) {
    for (let i = 0; i < booths.length; i++) {
      for (let j = i + 1; j < booths.length; j++) {
        if (checkOverlap(booths[i], booths[j])) {
          overlappingBoothIds.add(booths[i].id);
          overlappingBoothIds.add(booths[j].id);
        }
      }
    }
  }

  // Theme color for booths
  const getBoothThemeHex = (colorName: string, isSelected: boolean) => {
    const styles = getBoothThemeStyles(colorName, isSelected);
    return {
      fill: styles.fill,
      stroke: styles.stroke,
      text: styles.text,
      badgeBg: styles.badgeBg,
      badgeText: styles.badgeText
    };
  };

  return (
    <div className="flex flex-col h-full gap-4" id="spatial-floor-plan-architect-root">
      
      {/* 1. ARCHITECTURAL TOOLBAR & ADD PALETTE */}
      <FacilityToolbar
        activeMode={activeMode}
        onChangeMode={setActiveMode}
        onAddFacility={handleAddFacility}
        onAddWalkway={handleAddWalkway}
        onAddNewBoothQuick={handleQuickAddBooth}
        onOpenPresets={() => setIsPresetModalOpen(true)}
        onClearFacilities={handleClearAllFacilities}
        onClearWalkways={handleClearAllWalkways}
        onClearBooths={handleClearAllBooths}
        onClearAllBackground={handleClearAllBackground}
        onResetDefaultFacilities={handleResetDefaultFacilities}
        onResetDefaultWalkways={handleResetDefaultWalkways}
        facilitiesCount={facilities.length}
        walkwaysCount={walkways.length}
        boothsCount={booths.length}
      />

      {/* 2. TOP CANVAS CONTROLS & SNAPPING BAR */}
      <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xs">
        
        {/* Left tools: Snap & Layers */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-inner text-xs">
            <span className="text-slate-400 font-bold px-2 flex items-center gap-1">
              <Grid className="w-3.5 h-3.5 text-indigo-600" />
              <span>網格磁吸:</span>
            </span>
            {[0, 5, 10, 20].map(val => (
              <button
                key={val}
                onClick={() => setSnapGrid(val)}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  snapGrid === val ? 'bg-indigo-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {val === 0 ? '自由' : `${val}px`}
              </button>
            ))}
          </div>

          <div className="w-[1px] h-5 bg-slate-200 hidden sm:block"></div>

          {/* Layer toggles */}
          <button
            onClick={() => setShowGridLines(prev => !prev)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
              showGridLines ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            title="開關網格格線"
          >
            <Grid className="w-3.5 h-3.5" />
            <span>網格</span>
          </button>

          <button
            onClick={() => setShowAllDimensions(prev => !prev)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
              showAllDimensions ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            title="標註長寬標籤"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>尺寸標註</span>
          </button>

          <button
            onClick={() => setShowWalkwaysLayer(prev => !prev)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
              showWalkwaysLayer ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200 text-slate-400'
            }`}
            title="走道圖層"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>走道層</span>
          </button>

          <button
            onClick={() => setShowFacilitiesLayer(prev => !prev)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
              showFacilitiesLayer ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-400'
            }`}
            title="公共設施圖層"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>設施層</span>
          </button>

          <button
            onClick={() => {
              const next = !showBoothIds;
              setShowBoothIds(next);
              if (onToggleShowBoothIds) {
                onToggleShowBoothIds(next);
              }
              onShowToast(`平面圖專櫃代號已設為「${next ? '顯示' : '隱藏'}」並套用至前台`);
            }}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
              showBoothIds ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-400'
            }`}
            title="開關專櫃代號 (如 A1, D2) 顯示（即時同步至前台平面圖）"
          >
            <Tag className="w-3.5 h-3.5" />
            <span>{showBoothIds ? '代號：顯示' : '代號：隱藏'}</span>
          </button>

          {overlappingBoothIds.size > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl font-medium animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>{overlappingBoothIds.size} 個專櫃重疊</span>
            </div>
          )}
        </div>

        {/* Right actions: Undo/Redo, Height, Zoom & Fullscreen */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="p-2 bg-white hover:bg-slate-100 disabled:opacity-40 text-slate-700 border border-slate-200 rounded-xl transition shadow-xs"
            title="復原 (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>

          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="p-2 bg-white hover:bg-slate-100 disabled:opacity-40 text-slate-700 border border-slate-200 rounded-xl transition shadow-xs"
            title="重做"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-5 bg-slate-200 mx-1 hidden sm:block"></div>

          {/* Spatial Canvas Dimensions Button (NEW) */}
          <button
            type="button"
            onClick={() => setShowCanvasSizeModal(true)}
            className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition"
            title={`自訂空間平面畫布尺寸（目前：${currentCanvasWidth} × ${currentCanvasHeight} px）`}
            id="btn-toolbar-canvas-dimensions"
          >
            <Scaling className="w-3.5 h-3.5 text-indigo-600" />
            <span>畫布: {currentCanvasWidth} × {currentCanvasHeight}</span>
            <ChevronDown className="w-3 h-3 text-indigo-400" />
          </button>

          {/* Viewport Container Height Preset Selector */}
          <div className="relative">
            <button
              onClick={() => { setShowHeightMenu(!showHeightMenu); setShowZoomMenu(false); }}
              className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
              title="調整編輯器視窗顯示高度"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-indigo-600" />
              <span>視窗: {viewportHeight}px</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showHeightMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 animate-fadeIn space-y-1">
                <div className="text-[10px] font-bold text-slate-400 px-2 py-1">視窗容器高度預設</div>
                {[
                  { label: '標準視窗 (500px)', val: 500 },
                  { label: '舒適視窗 (580px)', val: 580 },
                  { label: '寬闊視窗 (700px)', val: 700 },
                  { label: '大型視窗 (850px)', val: 850 },
                  { label: '超高視窗 (1000px)', val: 1000 }
                ].map(item => (
                  <button
                    key={item.val}
                    onClick={() => { setViewportHeight(item.val); setShowHeightMenu(false); }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex justify-between items-center transition ${
                      viewportHeight === item.val ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>{item.label}</span>
                    {viewportHeight === item.val && <Check className="w-3 h-3 text-indigo-600" />}
                  </button>
                ))}
                <div className="border-t border-slate-100 my-1 pt-1 flex justify-between gap-1 px-1">
                  <button
                    onClick={() => setViewportHeight(prev => Math.max(420, prev - 50))}
                    className="flex-1 py-1 text-center bg-slate-50 hover:bg-slate-100 rounded-lg text-[11px] font-bold text-slate-600"
                  >
                    -50px
                  </button>
                  <button
                    onClick={() => setViewportHeight(prev => Math.min(1100, prev + 50))}
                    className="flex-1 py-1 text-center bg-slate-50 hover:bg-slate-100 rounded-lg text-[11px] font-bold text-slate-600"
                  >
                    +50px
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Zoom controls & Dropdown Menu */}
          <div className="relative flex items-center bg-white border border-slate-200 rounded-xl p-0.5 shadow-xs">
            <button
              onClick={() => setZoomScale(prev => Math.max(0.4, Number((prev - 0.15).toFixed(2))))}
              className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-50"
              title="縮小畫布 (或滑鼠滾輪向下)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => { setShowZoomMenu(!showZoomMenu); setShowHeightMenu(false); }}
              className="text-[11px] font-mono font-bold px-1.5 text-slate-700 hover:text-indigo-600 flex items-center gap-0.5 rounded py-0.5"
              title="點擊展開縮放選單與滑桿"
            >
              <span>{Math.round(zoomScale * 100)}%</span>
              <ChevronDown className="w-2.5 h-2.5 opacity-60" />
            </button>

            <button
              onClick={() => setZoomScale(prev => Math.min(3.5, Number((prev + 0.15).toFixed(2))))}
              className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-50"
              title="放大畫布 (或滑鼠滾輪向上)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => { setZoomScale(1); setPanOffset({ x: 0, y: 0 }); }}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg text-[10px] px-1.5 font-mono hover:bg-slate-50"
              title="重設視角為 100% 居中"
            >
              100%
            </button>

            {showZoomMenu && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-50 animate-fadeIn space-y-2.5">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                  <span>縮放倍率滑桿</span>
                  <span className="font-mono text-indigo-600 font-bold">{Math.round(zoomScale * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.4"
                  max="3.0"
                  step="0.05"
                  value={zoomScale}
                  onChange={e => setZoomScale(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="grid grid-cols-3 gap-1 pt-1 border-t border-slate-100">
                  {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map(s => (
                    <button
                      key={s}
                      onClick={() => { setZoomScale(s); setShowZoomMenu(false); }}
                      className={`py-1 text-center rounded-lg text-[10px] font-mono font-bold transition ${
                        zoomScale === s ? 'bg-indigo-600 text-white' : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      {Math.round(s * 100)}%
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Fullscreen Toggle Button */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1 transition shadow-xs ${
              isFullscreen
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
            title={isFullscreen ? '退出全螢幕畫布' : '進入全螢幕沉浸式空間設計'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE: CANVAS + PROPERTIES INSPECTOR */}
      <div className={`grid grid-cols-1 ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-900/95 p-6 overflow-y-auto' : 'lg:grid-cols-12 gap-5 flex-1 min-h-[500px]'}`}>
        
        {/* Left / Center: Interactive SVG Designer Stage (8 cols or 9 cols in fullscreen) */}
        <div className={`${isFullscreen ? 'w-full max-w-7xl mx-auto flex flex-col bg-white rounded-3xl overflow-hidden shadow-2xl relative' : 'lg:col-span-8 flex flex-col bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm relative'}`}>
          
          {/* Header prompt banner */}
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0"></span>
              <button
                type="button"
                onClick={() => setShowCanvasSizeModal(true)}
                className="font-bold text-slate-800 hover:text-indigo-600 flex items-center gap-1 transition"
                title="點擊自訂畫布尺寸"
              >
                <span>空間平面畫布 ({currentCanvasWidth} × {currentCanvasHeight} px)</span>
                <Edit3 className="w-3 h-3 text-indigo-500" />
              </button>
              <span className="text-slate-400 hidden sm:inline">|</span>
              <span className="text-slate-500 break-words">
                {selectedBooth ? `已選取專櫃：${selectedBooth.id} (${selectedBooth.name})` : selectedFacility ? `已選取公共設施：${selectedFacility.name}` : selectedWalkway ? `已選取走道：${selectedWalkway.name}` : '點選元件以拖曳位置或調整大小'}
              </span>
            </div>
            <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
              <span className="hidden sm:inline">滾輪可縮放 • 背景拖曳可平移</span>
              {isFullscreen && (
                <button
                  onClick={() => setIsFullscreen(false)}
                  className="px-2 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold"
                >
                  關閉全螢幕
                </button>
              )}
            </div>
          </div>

          {/* SVG Viewport Container with Dynamic Height */}
          <div
            ref={canvasContainerRef}
            onMouseDown={handleCanvasMouseDown}
            onTouchStart={handleCanvasTouchStart}
            onTouchMove={handleCanvasTouchMove}
            onTouchEnd={handleCanvasTouchEnd}
            style={{ 
              height: isFullscreen ? 'calc(100vh - 180px)' : `${viewportHeight}px`,
              overscrollBehavior: 'contain',
              touchAction: 'none'
            }}
            className={`relative overflow-hidden bg-slate-100 flex items-center justify-center select-none overscroll-contain touch-none ${
              isPanningCanvas ? 'cursor-grabbing' : 'cursor-default'
            }`}
            id="designer-canvas-viewport"
          >
            <div
              style={{
                transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomScale})`,
                transformOrigin: 'center center',
                transition: isPanningCanvas ? 'none' : 'transform 0.1s ease-out'
              }}
              className="w-full h-full flex items-center justify-center p-4"
            >
              <svg
                ref={svgRef}
                width={currentCanvasWidth}
                height={currentCanvasHeight}
                viewBox={`0 0 ${currentCanvasWidth} ${currentCanvasHeight}`}
                className="select-none overflow-visible shadow-lg rounded-2xl bg-white"
                style={{ minWidth: `${currentCanvasWidth}px`, minHeight: `${currentCanvasHeight}px` }}
                onClick={() => {
                  setSelectedBoothId('');
                  setSelectedFacilityId(null);
                  setSelectedWalkwayId(null);
                }}
              >
                <defs>
                  {/* Grid pattern */}
                  <pattern id="designer-grid-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="0.8" />
                  </pattern>
                  <pattern id="designer-fine-grid-pattern" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#f1f5f9" strokeWidth="0.5" />
                  </pattern>
                </defs>

                {/* Outer Wall Boundary */}
                <rect 
                  x="20" 
                  y="20" 
                  width={Math.max(100, currentCanvasWidth - 40)} 
                  height={Math.max(100, currentCanvasHeight - 40)} 
                  rx="24" 
                  fill="#ffffff" 
                  stroke="#94a3b8" 
                  strokeWidth="2.5" 
                />

                {/* Grid Lines Overlay */}
                {showGridLines && (
                  <rect 
                    x="20" 
                    y="20" 
                    width={Math.max(100, currentCanvasWidth - 40)} 
                    height={Math.max(100, currentCanvasHeight - 40)} 
                    rx="24" 
                    fill="url(#designer-grid-pattern)" 
                    pointerEvents="none" 
                  />
                )}

                {/* ======================================================== */}
                {/* 1. WALKWAYS LAYER                                        */}
                {/* ======================================================== */}
                {showWalkwaysLayer && (
                  <g id="layer-walkways">
                    {walkways.map(walk => {
                      const isSelected = selectedWalkwayId === walk.id;
                      const isEditingText = editingWalkwayTextId === walk.id;

                      const fontSize = walk.fontSize || 10;
                      const fontWeight = walk.fontWeight === 'black' ? 900 : walk.fontWeight === 'bold' ? 700 : walk.fontWeight === 'medium' ? 500 : 400;
                      const offX = walk.textOffsetX || 0;
                      const offY = walk.textOffsetY || 0;
                      const isVertical = walk.textOrientation === 'vertical';
                      let textX = walk.x + walk.width / 2 + offX;
                      let textY = walk.y + walk.height / 2 + 3 + offY;
                      let textAnchor: 'middle' | 'start' | 'end' = 'middle';

                      if (!isVertical) {
                        if (walk.textPosition === 'top') {
                          textY = walk.y + fontSize + 4 + offY;
                        } else if (walk.textPosition === 'bottom') {
                          textY = walk.y + walk.height - 6 + offY;
                        } else if (walk.textPosition === 'left') {
                          textX = walk.x + 8 + offX;
                          textAnchor = 'start';
                        } else if (walk.textPosition === 'right') {
                          textX = walk.x + walk.width - 8 + offX;
                          textAnchor = 'end';
                        }
                      } else {
                        if (walk.textPosition === 'top') {
                          textY = walk.y + 10 + offY;
                        } else if (walk.textPosition === 'bottom') {
                          textY = walk.y + walk.height - walk.name.length * (fontSize + 2) - 4 + offY;
                        } else if (walk.textPosition === 'left') {
                          textX = walk.x + 10 + fontSize / 2 + offX;
                        } else if (walk.textPosition === 'right') {
                          textX = walk.x + walk.width - 10 - fontSize / 2 + offX;
                        } else {
                          textY = walk.y + Math.max(8, (walk.height - walk.name.length * (fontSize + 2)) / 2) + offY;
                        }
                      }

                      const textLen = walk.name.length;
                      const boundW = isVertical ? fontSize + 8 : Math.max(24, textLen * fontSize * 0.6 + 8);
                      const boundH = isVertical ? textLen * (fontSize + 2) + 8 : fontSize + 6;
                      const boundX = isVertical ? textX - boundW / 2 : (textX - (textAnchor === 'middle' ? boundW / 2 : textAnchor === 'end' ? boundW - 4 : 4));
                      const boundY = isVertical ? textY - 4 : textY - fontSize - 2;

                      return (
                        <g 
                          key={walk.id}
                          className="cursor-move group"
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedWalkwayId(walk.id);
                            setSelectedBoothId('');
                            setSelectedFacilityId(null);
                            setActiveMode('walkway');
                          }}
                          onDoubleClick={e => {
                            e.stopPropagation();
                            handleStartEditWalkwayText(walk.id, walk.name);
                          }}
                          onMouseDown={e => {
                            if (isEditingText) return;
                            handleStartMove(e, 'walkway', walk.id, { x: walk.x, y: walk.y, width: walk.width, height: walk.height });
                          }}
                        >
                          <rect
                            x={walk.x}
                            y={walk.y}
                            width={walk.width}
                            height={walk.height}
                            fill={walk.color || '#f1f5f9'}
                            stroke={isSelected ? '#10b981' : '#cbd5e1'}
                            strokeWidth={isSelected ? 2.5 : 1}
                            strokeDasharray={isSelected ? '4,4' : 'none'}
                            rx={4}
                            className="transition-all"
                          />

                          {/* Walkway label when not editing (supports direct text dragging when selected) */}
                          {!isEditingText && (
                            <g
                              className={isSelected ? 'cursor-grab active:cursor-grabbing pointer-events-auto' : 'pointer-events-none'}
                              onMouseDown={e => {
                                if (isSelected) {
                                  e.stopPropagation();
                                  handleStartTextMove(e, 'walkway', walk.id, {
                                    offsetX: walk.textOffsetX || 0,
                                    offsetY: walk.textOffsetY || 0
                                  });
                                }
                              }}
                            >
                              {/* Selected text bounding highlight */}
                              {isSelected && (
                                <rect
                                  x={boundX}
                                  y={boundY}
                                  width={boundW}
                                  height={boundH}
                                  rx={3}
                                  fill="rgba(16, 185, 129, 0.12)"
                                  stroke="#10b981"
                                  strokeWidth="1"
                                  strokeDasharray="2,2"
                                  className="transition-colors hover:fill-emerald-500/25"
                                />
                              )}
                              <text
                                x={textX}
                                y={textY}
                                textAnchor={isVertical ? 'middle' : textAnchor}
                                fill={walk.textColor || '#64748b'}
                                style={{
                                  fontSize: `${fontSize}px`,
                                  fontWeight,
                                  ...(isVertical ? {
                                    writingMode: 'vertical-rl' as const,
                                    textOrientation: 'upright' as const,
                                    letterSpacing: '1px'
                                  } : {})
                                }}
                                className={`font-sans select-none ${isSelected ? 'cursor-grab active:cursor-grabbing font-bold' : ''}`}
                              >
                                {walk.name}
                              </text>
                            </g>
                          )}

                          {/* Inline Walkway Rename Input */}
                          {isEditingText && (
                            <foreignObject
                              x={walk.x}
                              y={walk.y}
                              width={Math.max(walk.width, 140)}
                              height={Math.max(walk.height, 36)}
                              className="overflow-visible"
                            >
                              <div
                                className="w-full h-full flex flex-col items-center justify-center p-1 relative"
                                onClick={e => e.stopPropagation()}
                                onMouseDown={e => e.stopPropagation()}
                              >
                                <input
                                  type="text"
                                  autoFocus
                                  value={editingWalkwayTextValue}
                                  onChange={e => setEditingWalkwayTextValue(e.target.value)}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleCommitWalkwayTextEdit();
                                    } else if (e.key === 'Escape') {
                                      e.preventDefault();
                                      handleCancelWalkwayTextEdit();
                                    }
                                  }}
                                  onBlur={handleCommitWalkwayTextEdit}
                                  className="w-full px-2 py-1 text-center text-xs font-bold text-slate-900 bg-white border-2 border-emerald-600 rounded-lg shadow-xl focus:outline-none focus:ring-2 focus:ring-emerald-400"
                                  placeholder="輸入通道名稱..."
                                />
                                <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900/95 text-white px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1.5 shadow-xl whitespace-nowrap z-50">
                                  <button
                                    onMouseDown={e => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleCommitWalkwayTextEdit();
                                    }}
                                    className="text-emerald-400 font-bold"
                                  >
                                    ✓ 完成 (Enter)
                                  </button>
                                  <span className="text-slate-600">|</span>
                                  <button
                                    onMouseDown={e => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleCancelWalkwayTextEdit();
                                    }}
                                    className="text-slate-400"
                                  >
                                    取消
                                  </button>
                                </div>
                              </div>
                            </foreignObject>
                          )}

                          {/* Dimension badge if toggled */}
                          {(showAllDimensions || isSelected) && !isEditingText && (
                            <text
                              x={walk.x + walk.width / 2}
                              y={walk.y + walk.height - 4}
                              textAnchor="middle"
                              fill="#94a3b8"
                              className="text-[8px] font-mono pointer-events-none select-none"
                            >
                              {walk.width} × {walk.height}
                            </text>
                          )}

                          {/* 8-Direction Resize handles for Walkway if selected */}
                          {isSelected && !isEditingText && (
                            <g>
                              {/* NW */}
                              <rect
                                x={walk.x - 5}
                                y={walk.y - 5}
                                width="10"
                                height="10"
                                rx="2"
                                fill="#10b981"
                                stroke="#ffffff"
                                strokeWidth="2"
                                className="cursor-nwse-resize"
                                onMouseDown={e => handleStartResize(e, 'walkway', walk.id, 'resize-nw', { x: walk.x, y: walk.y, width: walk.width, height: walk.height })}
                              />
                              {/* N */}
                              <rect
                                x={walk.x + walk.width / 2 - 5}
                                y={walk.y - 5}
                                width="10"
                                height="10"
                                rx="2"
                                fill="#10b981"
                                stroke="#ffffff"
                                strokeWidth="2"
                                className="cursor-ns-resize"
                                onMouseDown={e => handleStartResize(e, 'walkway', walk.id, 'resize-n', { x: walk.x, y: walk.y, width: walk.width, height: walk.height })}
                              />
                              {/* NE */}
                              <rect
                                x={walk.x + walk.width - 5}
                                y={walk.y - 5}
                                width="10"
                                height="10"
                                rx="2"
                                fill="#10b981"
                                stroke="#ffffff"
                                strokeWidth="2"
                                className="cursor-nesw-resize"
                                onMouseDown={e => handleStartResize(e, 'walkway', walk.id, 'resize-ne', { x: walk.x, y: walk.y, width: walk.width, height: walk.height })}
                              />
                              {/* E */}
                              <rect
                                x={walk.x + walk.width - 5}
                                y={walk.y + walk.height / 2 - 5}
                                width="10"
                                height="10"
                                rx="2"
                                fill="#10b981"
                                stroke="#ffffff"
                                strokeWidth="2"
                                className="cursor-ew-resize"
                                onMouseDown={e => handleStartResize(e, 'walkway', walk.id, 'resize-e', { x: walk.x, y: walk.y, width: walk.width, height: walk.height })}
                              />
                              {/* SE */}
                              <rect
                                x={walk.x + walk.width - 5}
                                y={walk.y + walk.height - 5}
                                width="10"
                                height="10"
                                rx="2"
                                fill="#10b981"
                                stroke="#ffffff"
                                strokeWidth="2"
                                className="cursor-nwse-resize"
                                onMouseDown={e => handleStartResize(e, 'walkway', walk.id, 'resize-se', { x: walk.x, y: walk.y, width: walk.width, height: walk.height })}
                              />
                              {/* S */}
                              <rect
                                x={walk.x + walk.width / 2 - 5}
                                y={walk.y + walk.height - 5}
                                width="10"
                                height="10"
                                rx="2"
                                fill="#10b981"
                                stroke="#ffffff"
                                strokeWidth="2"
                                className="cursor-ns-resize"
                                onMouseDown={e => handleStartResize(e, 'walkway', walk.id, 'resize-s', { x: walk.x, y: walk.y, width: walk.width, height: walk.height })}
                              />
                              {/* SW */}
                              <rect
                                x={walk.x - 5}
                                y={walk.y + walk.height - 5}
                                width="10"
                                height="10"
                                rx="2"
                                fill="#10b981"
                                stroke="#ffffff"
                                strokeWidth="2"
                                className="cursor-nesw-resize"
                                onMouseDown={e => handleStartResize(e, 'walkway', walk.id, 'resize-sw', { x: walk.x, y: walk.y, width: walk.width, height: walk.height })}
                              />
                              {/* W */}
                              <rect
                                x={walk.x - 5}
                                y={walk.y + walk.height / 2 - 5}
                                width="10"
                                height="10"
                                rx="2"
                                fill="#10b981"
                                stroke="#ffffff"
                                strokeWidth="2"
                                className="cursor-ew-resize"
                                onMouseDown={e => handleStartResize(e, 'walkway', walk.id, 'resize-w', { x: walk.x, y: walk.y, width: walk.width, height: walk.height })}
                              />
                            </g>
                          )}
                        </g>
                      );
                    })}
                  </g>
                )}

                {/* ======================================================== */}
                {/* 2. PUBLIC FACILITIES LAYER (WITH ON-COMPONENT EDITING)   */}
                {/* ======================================================== */}
                {showFacilitiesLayer && (
                  <g id="layer-facilities">
                    {facilities.map(fac => {
                      const isSelected = selectedFacilityId === fac.id;
                      const isEditingText = editingFacilityTextId === fac.id;
                      const isEntrance = fac.type === 'entrance';
                      const isInfo = fac.type === 'info';
                      const isCafe = fac.type === 'cafe';
                      const isNursery = fac.type === 'nursery';
                      const isElevator = fac.type === 'elevator';
                      const isAtm = fac.type === 'atm';
                      const isExit = fac.type === 'exit';
                      const isPillar = fac.type === 'pillar';
                      const isOffice = fac.type === 'office';

                      let fill = '#f8fafc';
                      let stroke = isSelected ? '#2563eb' : '#94a3b8';
                      let textCol = '#475569';
                      let typeIcon = '📍';

                      if (isNursery) {
                        fill = '#fff1f2';
                        stroke = isSelected ? '#e11d48' : '#f43f5e';
                        textCol = '#be123c';
                        typeIcon = '🍼';
                      } else if (isEntrance) {
                        fill = '#ecfdf5';
                        stroke = isSelected ? '#059669' : '#10b981';
                        textCol = '#047857';
                        typeIcon = '🚪';
                      } else if (isInfo) {
                        fill = '#eff6ff';
                        stroke = isSelected ? '#1d4ed8' : '#3b82f6';
                        textCol = '#1e40af';
                        typeIcon = 'ℹ️';
                      } else if (isCafe) {
                        fill = '#fffbeb';
                        stroke = isSelected ? '#d97706' : '#f59e0b';
                        textCol = '#b45309';
                        typeIcon = '☕';
                      } else if (isAtm) {
                        fill = '#f0fdf4';
                        stroke = isSelected ? '#059669' : '#10b981';
                        textCol = '#065f46';
                        typeIcon = '🏧';
                      } else if (isElevator) {
                        fill = '#eef2ff';
                        stroke = isSelected ? '#4338ca' : '#6366f1';
                        textCol = '#3730a3';
                        typeIcon = '🛗';
                      } else if (isExit) {
                        fill = '#fff1f2';
                        stroke = isSelected ? '#be123c' : '#e11d48';
                        textCol = '#9f1239';
                        typeIcon = '🚨';
                      } else if (isPillar) {
                        fill = '#334155';
                        stroke = isSelected ? '#60a5fa' : '#1e293b';
                        textCol = '#ffffff';
                        typeIcon = '🏛️';
                      } else if (isOffice) {
                        fill = '#f0fdfa';
                        stroke = isSelected ? '#0d9488' : '#14b8a6';
                        textCol = '#0f766e';
                        typeIcon = '💼';
                      } else if (fac.type === 'restroom') {
                        typeIcon = '🚻';
                      } else if (fac.type === 'escalator') {
                        typeIcon = '🪜';
                      }

                      const fontSize = fac.fontSize || 11;
                      const fontWeight = fac.fontWeight === 'black' ? 900 : fac.fontWeight === 'bold' ? 700 : fac.fontWeight === 'medium' ? 500 : 400;
                      const offX = fac.textOffsetX || 0;
                      const offY = fac.textOffsetY || 0;
                      const isVertical = fac.textOrientation === 'vertical';
                      let textX = fac.x + fac.width / 2 + offX;
                      let textY = fac.y + fac.height / 2 + 4 + offY;
                      let textAnchor: 'middle' | 'start' | 'end' = 'middle';

                      if (!isVertical) {
                        if (fac.textPosition === 'top') {
                          textY = fac.y + fontSize + 4 + offY;
                        } else if (fac.textPosition === 'bottom') {
                          textY = fac.y + fac.height - 6 + offY;
                        } else if (fac.textPosition === 'left') {
                          textX = fac.x + 8 + offX;
                          textAnchor = 'start';
                        } else if (fac.textPosition === 'right') {
                          textX = fac.x + fac.width - 8 + offX;
                          textAnchor = 'end';
                        }
                      } else {
                        if (fac.textPosition === 'top') {
                          textY = fac.y + 8 + offY;
                        } else if (fac.textPosition === 'bottom') {
                          textY = fac.y + fac.height - (fac.name.length + (typeIcon ? 1 : 0)) * (fontSize + 2) - 4 + offY;
                        } else if (fac.textPosition === 'left') {
                          textX = fac.x + 8 + fontSize / 2 + offX;
                        } else if (fac.textPosition === 'right') {
                          textX = fac.x + fac.width - 8 - fontSize / 2 + offX;
                        } else {
                          textY = fac.y + Math.max(6, (fac.height - (fac.name.length + (typeIcon ? 1 : 0)) * (fontSize + 2)) / 2) + offY;
                        }
                      }

                      const textLen = fac.name.length + (typeIcon ? 1.5 : 0);
                      const boundW = isVertical ? fontSize + 10 : Math.max(26, textLen * fontSize * 0.65 + 16);
                      const boundH = isVertical ? textLen * (fontSize + 2) + 12 : fontSize + 6;
                      const boundX = isVertical ? textX - boundW / 2 : (textX - (textAnchor === 'middle' ? boundW / 2 : textAnchor === 'end' ? boundW - 4 : 4));
                      const boundY = isVertical ? textY - 4 : textY - fontSize - 2;

                      return (
                        <g
                          key={fac.id}
                          className="cursor-move group"
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedFacilityId(fac.id);
                            setSelectedBoothId('');
                            setSelectedWalkwayId(null);
                            setActiveMode('facility');
                          }}
                          onDoubleClick={e => {
                            e.stopPropagation();
                            handleStartEditFacilityText(fac.id, fac.name);
                          }}
                          onMouseDown={e => {
                            if (isEditingText) return;
                            handleStartMove(e, 'facility', fac.id, { x: fac.x, y: fac.y, width: fac.width, height: fac.height });
                          }}
                        >
                          <rect
                            x={fac.x}
                            y={fac.y}
                            width={fac.width}
                            height={fac.height}
                            rx={isInfo ? fac.width / 2 : isPillar ? 3 : 6}
                            fill={fill}
                            stroke={stroke}
                            strokeWidth={isSelected ? 2.5 : 1.5}
                            strokeDasharray={isEntrance ? '3,3' : 'none'}
                            className="transition-all"
                          />

                          {/* Architectural cross lines for pillar */}
                          {isPillar && (
                            <g className="pointer-events-none opacity-40">
                              <line x1={fac.x} y1={fac.y} x2={fac.x + fac.width} y2={fac.y + fac.height} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2,2" />
                              <line x1={fac.x + fac.width} y1={fac.y} x2={fac.x} y2={fac.y + fac.height} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2,2" />
                            </g>
                          )}

                          {/* Facility Text when not editing (supports direct text dragging when selected) */}
                          {!isEditingText && (
                            <g
                              className={isSelected ? 'cursor-grab active:cursor-grabbing pointer-events-auto' : 'pointer-events-none'}
                              onMouseDown={e => {
                                if (isSelected) {
                                  e.stopPropagation();
                                  handleStartTextMove(e, 'facility', fac.id, {
                                    offsetX: fac.textOffsetX || 0,
                                    offsetY: fac.textOffsetY || 0
                                  });
                                }
                              }}
                            >
                              {/* Selected text bounding highlight */}
                              {isSelected && (
                                <rect
                                  x={boundX}
                                  y={boundY}
                                  width={boundW}
                                  height={boundH}
                                  rx={3}
                                  fill="rgba(59, 130, 246, 0.12)"
                                  stroke="#3b82f6"
                                  strokeWidth="1"
                                  strokeDasharray="2,2"
                                  className="transition-colors hover:fill-blue-500/25"
                                />
                              )}
                              <text
                                x={textX}
                                y={textY}
                                textAnchor={isVertical ? 'middle' : textAnchor}
                                fill={fac.textColor || textCol}
                                style={{
                                  fontSize: `${fontSize}px`,
                                  fontWeight,
                                  ...(isVertical ? {
                                    writingMode: 'vertical-rl' as const,
                                    textOrientation: 'upright' as const,
                                    letterSpacing: '1px'
                                  } : {})
                                }}
                                className={`font-sans select-none ${isSelected ? 'cursor-grab active:cursor-grabbing font-bold' : ''}`}
                              >
                                {typeIcon} {fac.name}
                              </text>
                              <title>{`【${fac.name}】選中後可直接拖曳微調文字，或雙擊修改名稱 (X:${fac.x}, Y:${fac.y})`}</title>
                            </g>
                          )}

                          {/* Direct In-Place Text Editing Input via foreignObject */}
                          {isEditingText && (
                            <foreignObject
                              x={fac.x}
                              y={fac.y}
                              width={Math.max(fac.width, 130)}
                              height={Math.max(fac.height, 38)}
                              className="overflow-visible"
                            >
                              <div
                                className="w-full h-full flex flex-col items-center justify-center p-1 relative"
                                onClick={e => e.stopPropagation()}
                                onMouseDown={e => e.stopPropagation()}
                              >
                                <input
                                  type="text"
                                  autoFocus
                                  value={editingFacilityTextValue}
                                  onChange={e => setEditingFacilityTextValue(e.target.value)}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleCommitFacilityTextEdit();
                                    } else if (e.key === 'Escape') {
                                      e.preventDefault();
                                      handleCancelFacilityTextEdit();
                                    }
                                  }}
                                  onBlur={handleCommitFacilityTextEdit}
                                  className="w-full px-2 py-1 text-center text-xs font-bold text-slate-900 bg-white border-2 border-blue-600 rounded-lg shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                                  placeholder="輸入設施文字..."
                                />
                                <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900/95 text-white px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1.5 shadow-xl whitespace-nowrap z-50">
                                  <button
                                    onMouseDown={e => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleCommitFacilityTextEdit();
                                    }}
                                    className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-0.5"
                                  >
                                    <Check className="w-3 h-3" />
                                    <span>完成 (Enter)</span>
                                  </button>
                                  <span className="text-slate-600">|</span>
                                  <button
                                    onMouseDown={e => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleCancelFacilityTextEdit();
                                    }}
                                    className="text-slate-400 hover:text-slate-200"
                                  >
                                    取消 (Esc)
                                  </button>
                                </div>
                              </div>
                            </foreignObject>
                          )}

                          {/* Dimension & Coordinates badge if toggled or selected */}
                          {(showAllDimensions || isSelected) && !isEditingText && (
                            <text
                              x={fac.x + fac.width / 2}
                              y={fac.y + fac.height - 4}
                              textAnchor="middle"
                              fill="#94a3b8"
                              className="text-[8px] font-mono pointer-events-none select-none"
                            >
                              {fac.width} × {fac.height} | ({fac.x}, {fac.y})
                            </text>
                          )}

                          {/* 8-Direction Selection bounding handles */}
                          {isSelected && !isEditingText && (
                            <g>
                              {/* NW */}
                              <rect
                                x={fac.x - 5}
                                y={fac.y - 5}
                                width="10"
                                height="10"
                                rx="2"
                                fill="#2563eb"
                                stroke="#ffffff"
                                strokeWidth="2"
                                className="cursor-nwse-resize"
                                onMouseDown={e => handleStartResize(e, 'facility', fac.id, 'resize-nw', { x: fac.x, y: fac.y, width: fac.width, height: fac.height })}
                              />
                              {/* N */}
                              <rect
                                x={fac.x + fac.width / 2 - 5}
                                y={fac.y - 5}
                                width="10"
                                height="10"
                                rx="2"
                                fill="#2563eb"
                                stroke="#ffffff"
                                strokeWidth="2"
                                className="cursor-ns-resize"
                                onMouseDown={e => handleStartResize(e, 'facility', fac.id, 'resize-n', { x: fac.x, y: fac.y, width: fac.width, height: fac.height })}
                              />
                              {/* NE */}
                              <rect
                                x={fac.x + fac.width - 5}
                                y={fac.y - 5}
                                width="10"
                                height="10"
                                rx="2"
                                fill="#2563eb"
                                stroke="#ffffff"
                                strokeWidth="2"
                                className="cursor-nesw-resize"
                                onMouseDown={e => handleStartResize(e, 'facility', fac.id, 'resize-ne', { x: fac.x, y: fac.y, width: fac.width, height: fac.height })}
                              />
                              {/* E */}
                              <rect
                                x={fac.x + fac.width - 5}
                                y={fac.y + fac.height / 2 - 5}
                                width="10"
                                height="10"
                                rx="2"
                                fill="#2563eb"
                                stroke="#ffffff"
                                strokeWidth="2"
                                className="cursor-ew-resize"
                                onMouseDown={e => handleStartResize(e, 'facility', fac.id, 'resize-e', { x: fac.x, y: fac.y, width: fac.width, height: fac.height })}
                              />
                              {/* SE */}
                              <rect
                                x={fac.x + fac.width - 5}
                                y={fac.y + fac.height - 5}
                                width="10"
                                height="10"
                                rx="2"
                                fill="#2563eb"
                                stroke="#ffffff"
                                strokeWidth="2"
                                className="cursor-nwse-resize"
                                onMouseDown={e => handleStartResize(e, 'facility', fac.id, 'resize-se', { x: fac.x, y: fac.y, width: fac.width, height: fac.height })}
                              />
                              {/* S */}
                              <rect
                                x={fac.x + fac.width / 2 - 5}
                                y={fac.y + fac.height - 5}
                                width="10"
                                height="10"
                                rx="2"
                                fill="#2563eb"
                                stroke="#ffffff"
                                strokeWidth="2"
                                className="cursor-ns-resize"
                                onMouseDown={e => handleStartResize(e, 'facility', fac.id, 'resize-s', { x: fac.x, y: fac.y, width: fac.width, height: fac.height })}
                              />
                              {/* SW */}
                              <rect
                                x={fac.x - 5}
                                y={fac.y + fac.height - 5}
                                width="10"
                                height="10"
                                rx="2"
                                fill="#2563eb"
                                stroke="#ffffff"
                                strokeWidth="2"
                                className="cursor-nesw-resize"
                                onMouseDown={e => handleStartResize(e, 'facility', fac.id, 'resize-sw', { x: fac.x, y: fac.y, width: fac.width, height: fac.height })}
                              />
                              {/* W */}
                              <rect
                                x={fac.x - 5}
                                y={fac.y + fac.height / 2 - 5}
                                width="10"
                                height="10"
                                rx="2"
                                fill="#3b82f6"
                                stroke="#ffffff"
                                strokeWidth="2"
                                className="cursor-ew-resize"
                                onMouseDown={e => handleStartResize(e, 'facility', fac.id, 'resize-w', { x: fac.x, y: fac.y, width: fac.width, height: fac.height })}
                              />
                            </g>
                          )}
                        </g>
                      );
                    })}
                  </g>
                )}

                {/* ======================================================== */}
                {/* 3. BOOTHS LAYER (WITH ON-COMPONENT EDITING)              */}
                {/* ======================================================== */}
                {showBoothsLayer && (
                  <g id="layer-booths">
                    {booths.map(booth => {
                      const isSelected = selectedBoothId === booth.id;
                      const isEditingText = editingBoothTextId === booth.id;
                      const isOverlapping = overlappingBoothIds.has(booth.id);
                      const theme = getBoothThemeHex(booth.color, isSelected);

                      const fontSize = booth.fontSize || 12;
                      const fontWeight = booth.fontWeight === 'black' ? 900 : booth.fontWeight === 'bold' ? 700 : booth.fontWeight === 'medium' ? 500 : 400;
                      const offX = booth.textOffsetX || 0;
                      const offY = booth.textOffsetY || 0;
                      const isVertical = booth.textOrientation === 'vertical';
                      let textX = booth.x + booth.width / 2 + offX;
                      let textY = booth.y + booth.height / 2 + 4 + offY;
                      let textAnchor: 'middle' | 'start' | 'end' = 'middle';

                      if (!isVertical) {
                        if (booth.textPosition === 'top') {
                          textY = booth.y + 24 + fontSize + offY;
                        } else if (booth.textPosition === 'bottom') {
                          textY = booth.y + booth.height - 8 + offY;
                        } else if (booth.textPosition === 'left') {
                          textX = booth.x + 10 + offX;
                          textAnchor = 'start';
                        } else if (booth.textPosition === 'right') {
                          textX = booth.x + booth.width - 10 + offX;
                          textAnchor = 'end';
                        }
                      } else {
                        if (booth.textPosition === 'top') {
                          textY = booth.y + 28 + offY;
                        } else if (booth.textPosition === 'bottom') {
                          textY = booth.y + booth.height - booth.name.length * (fontSize + 2) - 6 + offY;
                        } else if (booth.textPosition === 'left') {
                          textX = booth.x + 12 + fontSize / 2 + offX;
                        } else if (booth.textPosition === 'right') {
                          textX = booth.x + booth.width - 12 - fontSize / 2 + offX;
                        } else {
                          textY = booth.y + Math.max(26, (booth.height - booth.name.length * (fontSize + 2)) / 2 + 8) + offY;
                        }
                      }

                      const textLen = booth.name.length;
                      const boundW = isVertical ? fontSize + 10 : Math.max(28, textLen * fontSize * 0.65 + 14);
                      const boundH = isVertical ? textLen * (fontSize + 2) + 12 : fontSize + 6;
                      const boundX = isVertical ? textX - boundW / 2 : (textX - (textAnchor === 'middle' ? boundW / 2 : textAnchor === 'end' ? boundW - 4 : 4));
                      const boundY = isVertical ? textY - 4 : textY - fontSize - 2;

                      return (
                        <g
                          key={booth.id}
                          className="cursor-move group"
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedBoothId(booth.id);
                            setSelectedFacilityId(null);
                            setSelectedWalkwayId(null);
                            setActiveMode('booth');
                          }}
                          onDoubleClick={e => {
                            e.stopPropagation();
                            handleStartEditBoothText(booth.id, booth.name);
                          }}
                          onMouseDown={e => {
                            if (isEditingText) return;
                            handleStartMove(e, 'booth', booth.id, { x: booth.x, y: booth.y, width: booth.width, height: booth.height });
                          }}
                        >
                          {/* Booth Rectangle Body */}
                          <rect
                            x={booth.x}
                            y={booth.y}
                            width={booth.width}
                            height={booth.height}
                            rx={10}
                            fill={theme.fill}
                            stroke={isOverlapping ? '#e11d48' : theme.stroke}
                            strokeWidth={isSelected ? 2.5 : 1.5}
                            strokeDasharray={isOverlapping ? '4,4' : 'none'}
                            className="transition-all shadow-sm"
                          />

                          {/* Booth ID Badge */}
                          {showBoothIds && (
                            <>
                              <rect
                                x={booth.x + 8}
                                y={booth.y + 8}
                                width={Math.max(28, booth.id.length * 9)}
                                height={18}
                                rx={5}
                                fill={theme.badgeBg}
                              />
                              <text
                                x={booth.x + 8 + Math.max(28, booth.id.length * 9) / 2}
                                y={booth.y + 20.5}
                                textAnchor="middle"
                                fill={theme.badgeText}
                                className="text-[10px] font-bold font-mono pointer-events-none select-none"
                              >
                                {booth.id}
                              </text>
                            </>
                          )}

                          {/* Booth Name Label when not editing (supports direct text dragging when selected) */}
                          {!isEditingText && (
                            <g
                              className={isSelected ? 'cursor-grab active:cursor-grabbing pointer-events-auto' : 'pointer-events-none'}
                              onMouseDown={e => {
                                if (isSelected) {
                                  e.stopPropagation();
                                  handleStartTextMove(e, 'booth', booth.id, {
                                    offsetX: booth.textOffsetX || 0,
                                    offsetY: booth.textOffsetY || 0
                                  });
                                }
                              }}
                            >
                              {/* Selected text bounding highlight */}
                              {isSelected && (
                                <rect
                                  x={boundX}
                                  y={boundY}
                                  width={boundW}
                                  height={boundH}
                                  rx={3}
                                  fill="rgba(99, 102, 241, 0.12)"
                                  stroke="#6366f1"
                                  strokeWidth="1"
                                  strokeDasharray="2,2"
                                  className="transition-colors hover:fill-indigo-500/25"
                                />
                              )}
                              <text
                                x={textX}
                                y={textY}
                                textAnchor={isVertical ? 'middle' : textAnchor}
                                fill={booth.textColor || theme.text}
                                style={{
                                  fontSize: `${fontSize}px`,
                                  fontWeight,
                                  ...(isVertical ? {
                                    writingMode: 'vertical-rl' as const,
                                    textOrientation: 'upright' as const,
                                    letterSpacing: '1px'
                                  } : {})
                                }}
                                className={`font-sans select-none ${isSelected ? 'cursor-grab active:cursor-grabbing font-bold' : ''}`}
                              >
                                {booth.name}
                              </text>
                              <title>{`【${booth.id} - ${booth.name}】選中後可直接拖曳微調文字，或雙擊修改名稱`}</title>
                            </g>
                          )}

                          {/* Direct In-Place Booth Name Editing Input via foreignObject */}
                          {isEditingText && (
                            <foreignObject
                              x={booth.x + 8}
                              y={booth.y + 26}
                              width={Math.max(booth.width - 16, 120)}
                              height={Math.max(booth.height - 32, 38)}
                              className="overflow-visible"
                            >
                              <div
                                className="w-full h-full flex flex-col items-center justify-center p-1 relative"
                                onClick={e => e.stopPropagation()}
                                onMouseDown={e => e.stopPropagation()}
                              >
                                <input
                                  type="text"
                                  autoFocus
                                  value={editingBoothTextValue}
                                  onChange={e => setEditingBoothTextValue(e.target.value)}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleCommitBoothTextEdit();
                                    } else if (e.key === 'Escape') {
                                      e.preventDefault();
                                      handleCancelBoothTextEdit();
                                    }
                                  }}
                                  onBlur={handleCommitBoothTextEdit}
                                  className="w-full px-2 py-1 text-center text-xs font-bold text-slate-900 bg-white border-2 border-indigo-600 rounded-lg shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                  placeholder="輸入專櫃名稱..."
                                />
                                <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900/95 text-white px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1.5 shadow-xl whitespace-nowrap z-50">
                                  <button
                                    onMouseDown={e => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleCommitBoothTextEdit();
                                    }}
                                    className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-0.5"
                                  >
                                    <Check className="w-3 h-3" />
                                    <span>完成 (Enter)</span>
                                  </button>
                                  <span className="text-slate-600">|</span>
                                  <button
                                    onMouseDown={e => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleCancelBoothTextEdit();
                                    }}
                                    className="text-slate-400 hover:text-slate-200"
                                  >
                                    取消
                                  </button>
                                </div>
                              </div>
                            </foreignObject>
                          )}

                          {/* Dimension badge if toggled */}
                          {(showAllDimensions || isSelected) && !isEditingText && (
                            <text
                              x={booth.x + booth.width / 2}
                              y={booth.y + booth.height - 8}
                              textAnchor="middle"
                              fill="#94a3b8"
                              className="text-[9px] font-mono pointer-events-none select-none"
                            >
                              {booth.width} × {booth.height}
                            </text>
                          )}

                          {/* 8-Direction Resize Handles when SELECTED */}
                          {isSelected && !isEditingText && (
                            <g>
                              {/* NW */}
                              <rect
                                x={booth.x - 5}
                                y={booth.y - 5}
                                width="10"
                                height="10"
                                rx="2"
                                fill="#4f46e5"
                                stroke="#ffffff"
                                strokeWidth="2"
                                className="cursor-nwse-resize"
                                onMouseDown={e => handleStartResize(e, 'booth', booth.id, 'resize-nw', { x: booth.x, y: booth.y, width: booth.width, height: booth.height })}
                              />
                              {/* N */}
                              <rect
                                x={booth.x + booth.width / 2 - 5}
                                y={booth.y - 5}
                                width="10"
                                height="10"
                                rx="2"
                                fill="#4f46e5"
                                stroke="#ffffff"
                                strokeWidth="2"
                                className="cursor-ns-resize"
                                onMouseDown={e => handleStartResize(e, 'booth', booth.id, 'resize-n', { x: booth.x, y: booth.y, width: booth.width, height: booth.height })}
                              />
                              {/* NE */}
                              <rect
                                x={booth.x + booth.width - 5}
                                y={booth.y - 5}
                                width="10"
                                height="10"
                                rx="2"
                                fill="#4f46e5"
                                stroke="#ffffff"
                                strokeWidth="2"
                                className="cursor-nesw-resize"
                                onMouseDown={e => handleStartResize(e, 'booth', booth.id, 'resize-ne', { x: booth.x, y: booth.y, width: booth.width, height: booth.height })}
                              />
                              {/* E */}
                              <rect
                                x={booth.x + booth.width - 5}
                                y={booth.y + booth.height / 2 - 5}
                                width="10"
                                height="10"
                                rx="2"
                                fill="#4f46e5"
                                stroke="#ffffff"
                                strokeWidth="2"
                                className="cursor-ew-resize"
                                onMouseDown={e => handleStartResize(e, 'booth', booth.id, 'resize-e', { x: booth.x, y: booth.y, width: booth.width, height: booth.height })}
                              />
                              {/* SE */}
                              <rect
                                x={booth.x + booth.width - 5}
                                y={booth.y + booth.height - 5}
                                width="10"
                                height="10"
                                rx="2"
                                fill="#4f46e5"
                                stroke="#ffffff"
                                strokeWidth="2"
                                className="cursor-nwse-resize"
                                onMouseDown={e => handleStartResize(e, 'booth', booth.id, 'resize-se', { x: booth.x, y: booth.y, width: booth.width, height: booth.height })}
                              />
                              {/* S */}
                              <rect
                                x={booth.x + booth.width / 2 - 5}
                                y={booth.y + booth.height - 5}
                                width="10"
                                height="10"
                                rx="2"
                                fill="#4f46e5"
                                stroke="#ffffff"
                                strokeWidth="2"
                                className="cursor-ns-resize"
                                onMouseDown={e => handleStartResize(e, 'booth', booth.id, 'resize-s', { x: booth.x, y: booth.y, width: booth.width, height: booth.height })}
                              />
                              {/* SW */}
                              <rect
                                x={booth.x - 5}
                                y={booth.y + booth.height - 5}
                                width="10"
                                height="10"
                                rx="2"
                                fill="#4f46e5"
                                stroke="#ffffff"
                                strokeWidth="2"
                                className="cursor-nesw-resize"
                                onMouseDown={e => handleStartResize(e, 'booth', booth.id, 'resize-sw', { x: booth.x, y: booth.y, width: booth.width, height: booth.height })}
                              />
                              {/* W */}
                              <rect
                                x={booth.x - 5}
                                y={booth.y + booth.height / 2 - 5}
                                width="10"
                                height="10"
                                rx="2"
                                fill="#4f46e5"
                                stroke="#ffffff"
                                strokeWidth="2"
                                className="cursor-ew-resize"
                                onMouseDown={e => handleStartResize(e, 'booth', booth.id, 'resize-w', { x: booth.x, y: booth.y, width: booth.width, height: booth.height })}
                              />
                            </g>
                          )}
                        </g>
                      );
                    })}
                  </g>
                )}

                {/* ======================================================== */}
                {/* 4. TOPMOST FLOATING QUICK TOOLBAR LAYER                  */}
                {/* Rendered on the absolute highest visual layer in SVG     */}
                {/* ======================================================== */}
                <g id="layer-active-floating-toolbars">
                  {/* Selected Walkway Toolbar */}
                  {selectedWalkwayId && !editingWalkwayTextId && (() => {
                    const walk = walkways.find(w => w.id === selectedWalkwayId);
                    if (!walk) return null;
                    const isTextMode = nudgeTargetMode === 'text';
                    const hasOffset = (walk.textOffsetX || 0) !== 0 || (walk.textOffsetY || 0) !== 0;
                    const tbWidth = isTextMode ? (hasOffset ? 540 : 510) : 440;
                    const tbHeight = 44;
                    const maxTbX = Math.max(15, currentCanvasWidth - 15 - tbWidth);
                    const tbX = Math.max(15, Math.min(maxTbX, walk.x + walk.width / 2 - tbWidth / 2));
                    const tbY = walk.y >= 52 ? walk.y - 48 : Math.min(currentCanvasHeight - 50, walk.y + walk.height + 8);
                    return (
                      <foreignObject
                        x={tbX}
                        y={tbY}
                        width={tbWidth}
                        height={tbHeight}
                        className="overflow-visible pointer-events-auto"
                      >
                        <div 
                          className="flex items-center gap-1 bg-slate-900/95 backdrop-blur-md text-white p-1 rounded-2xl shadow-2xl border border-slate-700/80 text-xs select-none ring-1 ring-white/10"
                          onClick={e => e.stopPropagation()}
                          onMouseDown={e => e.stopPropagation()}
                        >
                          {/* Direct Rename Button */}
                          <button
                            onClick={() => handleStartEditWalkwayText(walk.id, walk.name)}
                            className="flex items-center gap-1 px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-[11px] transition shadow-xs whitespace-nowrap"
                            title="直接修改動線名稱 (或雙擊動線)"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>改名稱</span>
                          </button>

                          {/* Quick Font Size Adjusters */}
                          <div className="flex items-center bg-slate-800 rounded-xl p-0.5 border border-slate-700">
                            <button
                              onClick={() => handleAdjustWalkwayFontSize(walk.id, -1)}
                              className="px-1.5 py-0.5 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-[10px] font-bold"
                              title="字級縮小 1px"
                            >
                              A-
                            </button>
                            <span className="text-[9px] font-mono px-1 text-emerald-400">
                              {walk.fontSize || 10}
                            </span>
                            <button
                              onClick={() => handleAdjustWalkwayFontSize(walk.id, 1)}
                              className="px-1.5 py-0.5 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-[10px] font-bold"
                              title="字級放大 1px"
                            >
                              A+
                            </button>
                          </div>

                          {/* Text Position Alignments */}
                          <div className="flex items-center bg-slate-800 rounded-xl p-0.5 border border-slate-700">
                            <button
                              onClick={() => handleSetWalkwayTextPosition(walk.id, 'top')}
                              className={`px-1 py-0.5 rounded-lg text-[10px] ${walk.textPosition === 'top' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                              title="文字頂部對齊"
                            >
                              頂
                            </button>
                            <button
                              onClick={() => handleSetWalkwayTextPosition(walk.id, 'center')}
                              className={`px-1 py-0.5 rounded-lg text-[10px] ${(!walk.textPosition || walk.textPosition === 'center') ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                              title="文字置中對齊"
                            >
                              中
                            </button>
                            <button
                              onClick={() => handleSetWalkwayTextPosition(walk.id, 'bottom')}
                              className={`px-1 py-0.5 rounded-lg text-[10px] ${walk.textPosition === 'bottom' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                              title="文字底部對齊"
                            >
                              底
                            </button>
                          </div>

                          {/* Text Orientation Toggle (Horizontal / Vertical) */}
                          <button
                            onClick={() => handleToggleWalkwayTextOrientation(walk.id)}
                            className={`px-1.5 py-0.5 rounded-xl text-[10px] font-bold transition flex items-center gap-1 border border-slate-700 ${
                              walk.textOrientation === 'vertical' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-800 text-slate-300 hover:text-white'
                            }`}
                            title={`切換文字方向 (目前：${walk.textOrientation === 'vertical' ? '垂直直向' : '平行橫向'})`}
                          >
                            <ArrowUpDown className="w-2.5 h-2.5" />
                            <span>{walk.textOrientation === 'vertical' ? '直向' : '橫向'}</span>
                          </button>

                          {/* Dual-Mode Nudge Controller (Element / Text) */}
                          <div className="flex items-center bg-slate-800 rounded-xl p-0.5 border border-slate-700 gap-0.5">
                            <button
                              onClick={() => {
                                const next = isTextMode ? 'element' : 'text';
                                setNudgeTargetMode(next);
                                onShowToast(next === 'text' ? '已切換為【微調文字位移 (XY Offset)】' : '已切換為【微調元件本體位置】');
                              }}
                              className={`px-1.5 py-0.5 rounded-lg text-[10px] font-bold transition flex items-center gap-0.5 ${
                                isTextMode ? 'bg-emerald-500 text-slate-950 shadow-xs' : 'bg-slate-700 text-slate-200 hover:text-white'
                              }`}
                              title="切換微調目標：【📦 元件位置】或【🔤 文字位移】"
                            >
                              {isTextMode ? '🔤字' : '📦件'}
                            </button>
                            <button
                              onClick={() => isTextMode ? handleNudgeWalkwayTextOffset(walk.id, -2, 0) : handleNudgeWalkway(walk.id, -5, 0)}
                              className="p-1 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg"
                              title={isTextMode ? "文字向左微調 2px (可按 Alt+←)" : "通道向左微調 5px (可按 ←)"}
                            >
                              <ArrowLeft className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => isTextMode ? handleNudgeWalkwayTextOffset(walk.id, 0, -2) : handleNudgeWalkway(walk.id, 0, -5)}
                              className="p-1 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg"
                              title={isTextMode ? "文字向上微調 2px (可按 Alt+↑)" : "通道向上微調 5px (可按 ↑)"}
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => isTextMode ? handleNudgeWalkwayTextOffset(walk.id, 0, 2) : handleNudgeWalkway(walk.id, 0, 5)}
                              className="p-1 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg"
                              title={isTextMode ? "文字向下微調 2px (可按 Alt+↓)" : "通道向下微調 5px (可按 ↓)"}
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => isTextMode ? handleNudgeWalkwayTextOffset(walk.id, 2, 0) : handleNudgeWalkway(walk.id, 5, 0)}
                              className="p-1 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg"
                              title={isTextMode ? "文字向右微調 2px (可按 Alt+→)" : "通道向右微調 5px (可按 →)"}
                            >
                              <ArrowRight className="w-3 h-3" />
                            </button>

                            {isTextMode && (
                              <div className="flex items-center pl-1 pr-0.5 border-l border-slate-700 gap-1">
                                <span className="font-mono text-[9px] text-emerald-300 whitespace-nowrap">
                                  {walk.textOffsetX || 0},{walk.textOffsetY || 0}
                                </span>
                                {hasOffset && (
                                  <button
                                    onClick={() => handleResetWalkwayTextOffset(walk.id)}
                                    className="p-0.5 hover:bg-slate-700 text-emerald-400 hover:text-emerald-200 rounded"
                                    title="文字位移歸零"
                                  >
                                    <RotateCcw className="w-2.5 h-2.5" />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Duplicate Button */}
                          <button
                            onClick={() => handleDuplicateWalkway(walk)}
                            className="p-1 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl"
                            title="複製此動線"
                          >
                            <Copy className="w-3 h-3" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteWalkway(walk.id)}
                            className="p-1 hover:bg-rose-900/60 text-rose-400 hover:text-rose-300 rounded-xl"
                            title="刪除動線"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </foreignObject>
                    );
                  })()}

                  {/* Selected Facility Toolbar */}
                  {selectedFacilityId && !editingFacilityTextId && (() => {
                    const fac = facilities.find(f => f.id === selectedFacilityId);
                    if (!fac) return null;
                    const isTextMode = nudgeTargetMode === 'text';
                    const hasOffset = (fac.textOffsetX || 0) !== 0 || (fac.textOffsetY || 0) !== 0;
                    const tbWidth = isTextMode ? (hasOffset ? 620 : 590) : 520;
                    const tbHeight = 44;
                    const maxTbX = Math.max(15, currentCanvasWidth - 15 - tbWidth);
                    const tbX = Math.max(15, Math.min(maxTbX, fac.x + fac.width / 2 - tbWidth / 2));
                    const tbY = fac.y >= 52 ? fac.y - 48 : Math.min(currentCanvasHeight - 50, fac.y + fac.height + 8);
                    return (
                      <foreignObject
                        x={tbX}
                        y={tbY}
                        width={tbWidth}
                        height={tbHeight}
                        className="overflow-visible pointer-events-auto"
                      >
                        <div 
                          className="flex items-center gap-1 bg-slate-900/95 backdrop-blur-md text-white p-1 rounded-2xl shadow-2xl border border-slate-700/80 text-xs select-none ring-1 ring-white/10"
                          onClick={e => e.stopPropagation()}
                          onMouseDown={e => e.stopPropagation()}
                        >
                          {/* Direct Edit Text Button */}
                          <button
                            onClick={() => handleStartEditFacilityText(fac.id, fac.name)}
                            className="flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-[11px] transition shadow-xs whitespace-nowrap"
                            title="直接編輯設施文字 (或雙擊元件)"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>改文字</span>
                          </button>

                          {/* Quick Font Size Adjusters */}
                          <div className="flex items-center bg-slate-800 rounded-xl p-0.5 border border-slate-700">
                            <button
                              onClick={() => handleAdjustFacilityFontSize(fac.id, -1)}
                              className="px-1.5 py-0.5 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-[10px] font-bold"
                              title="字級縮小 1px"
                            >
                              A-
                            </button>
                            <span className="text-[9px] font-mono px-1 text-blue-400">
                              {fac.fontSize || 11}
                            </span>
                            <button
                              onClick={() => handleAdjustFacilityFontSize(fac.id, 1)}
                              className="px-1.5 py-0.5 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-[10px] font-bold"
                              title="字級放大 1px"
                            >
                              A+
                            </button>
                          </div>

                          {/* Text Position Alignments */}
                          <div className="flex items-center bg-slate-800 rounded-xl p-0.5 border border-slate-700">
                            <button
                              onClick={() => handleSetFacilityTextPosition(fac.id, 'top')}
                              className={`px-1 py-0.5 rounded-lg text-[10px] ${fac.textPosition === 'top' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                              title="文字頂部對齊"
                            >
                              頂
                            </button>
                            <button
                              onClick={() => handleSetFacilityTextPosition(fac.id, 'center')}
                              className={`px-1 py-0.5 rounded-lg text-[10px] ${(!fac.textPosition || fac.textPosition === 'center') ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                              title="文字置中對齊"
                            >
                              中
                            </button>
                            <button
                              onClick={() => handleSetFacilityTextPosition(fac.id, 'bottom')}
                              className={`px-1 py-0.5 rounded-lg text-[10px] ${fac.textPosition === 'bottom' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                              title="文字底部對齊"
                            >
                              底
                            </button>
                          </div>

                          {/* Text Orientation Toggle (Horizontal / Vertical) */}
                          <button
                            onClick={() => handleToggleFacilityTextOrientation(fac.id)}
                            className={`px-1.5 py-0.5 rounded-xl text-[10px] font-bold transition flex items-center gap-1 border border-slate-700 ${
                              fac.textOrientation === 'vertical' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-800 text-slate-300 hover:text-white'
                            }`}
                            title={`切換文字方向 (目前：${fac.textOrientation === 'vertical' ? '垂直直向' : '平行橫向'})`}
                          >
                            <ArrowUpDown className="w-2.5 h-2.5" />
                            <span>{fac.textOrientation === 'vertical' ? '直向' : '橫向'}</span>
                          </button>

                          {/* Dual-Mode Nudge Controller (Element / Text) */}
                          <div className="flex items-center bg-slate-800 rounded-xl p-0.5 border border-slate-700 gap-0.5">
                            <button
                              onClick={() => {
                                const next = isTextMode ? 'element' : 'text';
                                setNudgeTargetMode(next);
                                onShowToast(next === 'text' ? '已切換為【微調文字位移 (XY Offset)】' : '已切換為【微調設施本體位置】');
                              }}
                              className={`px-1.5 py-0.5 rounded-lg text-[10px] font-bold transition flex items-center gap-0.5 ${
                                isTextMode ? 'bg-blue-500 text-white shadow-xs' : 'bg-slate-700 text-slate-200 hover:text-white'
                              }`}
                              title="切換微調目標：【📦 元件位置】或【🔤 文字位移】"
                            >
                              {isTextMode ? '🔤字' : '📦件'}
                            </button>
                            <button
                              onClick={() => isTextMode ? handleNudgeFacilityTextOffset(fac.id, -2, 0) : handleNudgeFacility(fac.id, -5, 0)}
                              className="p-1 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg"
                              title={isTextMode ? "文字向左微調 2px (可按 Alt+←)" : "設施向左微調 5px (可按 ←)"}
                            >
                              <ArrowLeft className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => isTextMode ? handleNudgeFacilityTextOffset(fac.id, 0, -2) : handleNudgeFacility(fac.id, 0, -5)}
                              className="p-1 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg"
                              title={isTextMode ? "文字向上微調 2px (可按 Alt+↑)" : "設施向上微調 5px (可按 ↑)"}
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => isTextMode ? handleNudgeFacilityTextOffset(fac.id, 0, 2) : handleNudgeFacility(fac.id, 0, 5)}
                              className="p-1 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg"
                              title={isTextMode ? "文字向下微調 2px (可按 Alt+↓)" : "設施向下微調 5px (可按 ↓)"}
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => isTextMode ? handleNudgeFacilityTextOffset(fac.id, 2, 0) : handleNudgeFacility(fac.id, 5, 0)}
                              className="p-1 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg"
                              title={isTextMode ? "文字向右微調 2px (可按 Alt+→)" : "設施向右微調 5px (可按 →)"}
                            >
                              <ArrowRight className="w-3 h-3" />
                            </button>

                            {isTextMode && (
                              <div className="flex items-center pl-1 pr-0.5 border-l border-slate-700 gap-1">
                                <span className="font-mono text-[9px] text-blue-300 whitespace-nowrap">
                                  {fac.textOffsetX || 0},{fac.textOffsetY || 0}
                                </span>
                                {hasOffset && (
                                  <button
                                    onClick={() => handleResetFacilityTextOffset(fac.id)}
                                    className="p-0.5 hover:bg-slate-700 text-blue-400 hover:text-blue-200 rounded"
                                    title="文字位移歸零"
                                  >
                                    <RotateCcw className="w-2.5 h-2.5" />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Quick Facility Type Switcher */}
                          <select
                            value={fac.type}
                            onChange={e => handleChangeFacilityType(fac.id, e.target.value as any)}
                            className="bg-slate-800 hover:bg-slate-700 text-white text-[11px] px-1.5 py-1 rounded-xl border border-slate-700 focus:outline-none cursor-pointer"
                            title="切換設施類型"
                          >
                            <option value="nursery">🍼 哺育室</option>
                            <option value="restroom">🚻 洗手間</option>
                            <option value="entrance">🚪 主入口</option>
                            <option value="info">ℹ 服務台</option>
                            <option value="escalator">🪜 手扶梯</option>
                            <option value="elevator">🛗 電梯</option>
                            <option value="cafe">☕ 咖啡座</option>
                            <option value="atm">🏧 提款機</option>
                            <option value="exit">🚨 逃生門</option>
                            <option value="pillar">🏛️ 柱子</option>
                            <option value="office">💼 辦公區</option>
                            <option value="custom">✨ 自訂</option>
                          </select>

                          {/* Duplicate Button */}
                          <button
                            onClick={() => handleDuplicateFacility(fac)}
                            className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl"
                            title="複製此設施"
                          >
                            <Copy className="w-3 h-3" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteFacility(fac.id)}
                            className="p-1.5 hover:bg-rose-900/60 text-rose-400 hover:text-rose-300 rounded-xl"
                            title="刪除設施"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </foreignObject>
                    );
                  })()}

                  {/* Selected Booth Toolbar */}
                  {selectedBoothId && !editingBoothTextId && (() => {
                    const booth = booths.find(b => b.id === selectedBoothId);
                    if (!booth) return null;
                    const isTextMode = nudgeTargetMode === 'text';
                    const hasOffset = (booth.textOffsetX || 0) !== 0 || (booth.textOffsetY || 0) !== 0;
                    const tbWidth = isTextMode ? (hasOffset ? 610 : 580) : 510;
                    const tbHeight = 44;
                    const maxTbX = Math.max(15, currentCanvasWidth - 15 - tbWidth);
                    const tbX = Math.max(15, Math.min(maxTbX, booth.x + booth.width / 2 - tbWidth / 2));
                    const tbY = booth.y >= 52 ? booth.y - 48 : Math.min(currentCanvasHeight - 50, booth.y + booth.height + 8);
                    return (
                      <foreignObject
                        x={tbX}
                        y={tbY}
                        width={tbWidth}
                        height={tbHeight}
                        className="overflow-visible pointer-events-auto"
                      >
                        <div 
                          className="flex items-center gap-1 bg-slate-900/95 backdrop-blur-md text-white p-1 rounded-2xl shadow-2xl border border-slate-700/80 text-xs select-none ring-1 ring-white/10"
                          onClick={e => e.stopPropagation()}
                          onMouseDown={e => e.stopPropagation()}
                        >
                          {/* Direct Rename Button */}
                          <button
                            onClick={() => handleStartEditBoothText(booth.id, booth.name)}
                            className="flex items-center gap-1 px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-[11px] transition shadow-xs whitespace-nowrap"
                            title="直接修改專櫃名稱 (或雙擊專櫃)"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>改名稱</span>
                          </button>

                          {/* Quick Font Size Adjusters */}
                          <div className="flex items-center bg-slate-800 rounded-xl p-0.5 border border-slate-700">
                            <button
                              onClick={() => handleAdjustBoothFontSize(booth.id, -1)}
                              className="px-1.5 py-0.5 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-[10px] font-bold"
                              title="字級縮小 1px"
                            >
                              A-
                            </button>
                            <span className="text-[9px] font-mono px-1 text-indigo-400">
                              {booth.fontSize || 12}
                            </span>
                            <button
                              onClick={() => handleAdjustBoothFontSize(booth.id, 1)}
                              className="px-1.5 py-0.5 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-[10px] font-bold"
                              title="字級放大 1px"
                            >
                              A+
                            </button>
                          </div>

                          {/* Text Position Alignments */}
                          <div className="flex items-center bg-slate-800 rounded-xl p-0.5 border border-slate-700">
                            <button
                              onClick={() => handleSetBoothTextPosition(booth.id, 'top')}
                              className={`px-1 py-0.5 rounded-lg text-[10px] ${booth.textPosition === 'top' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                              title="文字頂部對齊"
                            >
                              頂
                            </button>
                            <button
                              onClick={() => handleSetBoothTextPosition(booth.id, 'center')}
                              className={`px-1 py-0.5 rounded-lg text-[10px] ${(!booth.textPosition || booth.textPosition === 'center') ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                              title="文字置中對齊"
                            >
                              中
                            </button>
                            <button
                              onClick={() => handleSetBoothTextPosition(booth.id, 'bottom')}
                              className={`px-1 py-0.5 rounded-lg text-[10px] ${booth.textPosition === 'bottom' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                              title="文字底部對齊"
                            >
                              底
                            </button>
                          </div>

                          {/* Text Orientation Toggle (Horizontal / Vertical) */}
                          <button
                            onClick={() => handleToggleBoothTextOrientation(booth.id)}
                            className={`px-1.5 py-0.5 rounded-xl text-[10px] font-bold transition flex items-center gap-1 border border-slate-700 ${
                              booth.textOrientation === 'vertical' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-800 text-slate-300 hover:text-white'
                            }`}
                            title={`切換文字方向 (目前：${booth.textOrientation === 'vertical' ? '垂直直向' : '平行橫向'})`}
                          >
                            <ArrowUpDown className="w-2.5 h-2.5" />
                            <span>{booth.textOrientation === 'vertical' ? '直向' : '橫向'}</span>
                          </button>

                          {/* Dual-Mode Nudge Controller (Element / Text) */}
                          <div className="flex items-center bg-slate-800 rounded-xl p-0.5 border border-slate-700 gap-0.5">
                            <button
                              onClick={() => {
                                const next = isTextMode ? 'element' : 'text';
                                setNudgeTargetMode(next);
                                onShowToast(next === 'text' ? '已切換為【微調文字位移 (XY Offset)】' : '已切換為【微調專櫃本體位置】');
                              }}
                              className={`px-1.5 py-0.5 rounded-lg text-[10px] font-bold transition flex items-center gap-0.5 ${
                                isTextMode ? 'bg-indigo-500 text-white shadow-xs' : 'bg-slate-700 text-slate-200 hover:text-white'
                              }`}
                              title="切換微調目標：【📦 元件位置】或【🔤 文字位移】"
                            >
                              {isTextMode ? '🔤字' : '📦件'}
                            </button>
                            <button
                              onClick={() => isTextMode ? handleNudgeBoothTextOffset(booth.id, -2, 0) : handleNudgeBooth(booth.id, -5, 0)}
                              className="p-1 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg"
                              title={isTextMode ? "文字向左微調 2px (可按 Alt+←)" : "專櫃向左微調 5px (可按 ←)"}
                            >
                              <ArrowLeft className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => isTextMode ? handleNudgeBoothTextOffset(booth.id, 0, -2) : handleNudgeBooth(booth.id, 0, -5)}
                              className="p-1 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg"
                              title={isTextMode ? "文字向上微調 2px (可按 Alt+↑)" : "專櫃向上微調 5px (可按 ↑)"}
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => isTextMode ? handleNudgeBoothTextOffset(booth.id, 0, 2) : handleNudgeBooth(booth.id, 0, 5)}
                              className="p-1 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg"
                              title={isTextMode ? "文字向下微調 2px (可按 Alt+↓)" : "專櫃向下微調 5px (可按 ↓)"}
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => isTextMode ? handleNudgeBoothTextOffset(booth.id, 2, 0) : handleNudgeBooth(booth.id, 5, 0)}
                              className="p-1 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg"
                              title={isTextMode ? "文字向右微調 2px (可按 Alt+→)" : "專櫃向右微調 5px (可按 →)"}
                            >
                              <ArrowRight className="w-3 h-3" />
                            </button>

                            {isTextMode && (
                              <div className="flex items-center pl-1 pr-0.5 border-l border-slate-700 gap-1">
                                <span className="font-mono text-[9px] text-indigo-300 whitespace-nowrap">
                                  {booth.textOffsetX || 0},{booth.textOffsetY || 0}
                                </span>
                                {hasOffset && (
                                  <button
                                    onClick={() => handleResetBoothTextOffset(booth.id)}
                                    className="p-0.5 hover:bg-slate-700 text-indigo-400 hover:text-indigo-200 rounded"
                                    title="文字位移歸零"
                                  >
                                    <RotateCcw className="w-2.5 h-2.5" />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Duplicate Button */}
                          <button
                            onClick={() => handleDuplicateBooth(booth)}
                            className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl"
                            title="複製此專櫃"
                          >
                            <Copy className="w-3 h-3" />
                          </button>

                          {/* Go To Products */}
                          {onGoToProductsForBooth && (
                            <button
                              onClick={() => onGoToProductsForBooth(booth.id)}
                              className="flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-[11px] whitespace-nowrap"
                              title="前往管理此專櫃商品"
                            >
                              <ShoppingBag className="w-3 h-3 text-amber-400" />
                              <span>商品</span>
                            </button>
                          )}

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteBooth(booth.id)}
                            className="p-1.5 hover:bg-rose-900/60 text-rose-400 hover:text-rose-300 rounded-xl"
                            title="刪除專櫃"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </foreignObject>
                    );
                  })()}
                </g>
              </svg>
            </div>

            {/* Canvas Floating Quick Controls overlay */}
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-xs border border-slate-200/80 rounded-2xl p-1 shadow-md text-xs z-20">
              <button
                onClick={() => setZoomScale(prev => Math.max(0.4, Number((prev - 0.15).toFixed(2))))}
                className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-600"
                title="縮小"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="font-mono font-bold text-[11px] px-1 text-slate-700 min-w-[40px] text-center">
                {Math.round(zoomScale * 100)}%
              </span>
              <button
                onClick={() => setZoomScale(prev => Math.min(3.5, Number((prev + 0.15).toFixed(2))))}
                className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-600"
                title="放大"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <div className="w-[1px] h-4 bg-slate-200"></div>
              <button
                onClick={() => { setZoomScale(1); setPanOffset({ x: 0, y: 0 }); }}
                className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-indigo-600"
                title="重置視角"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Draggable Height Resize Handle Bar */}
          {!isFullscreen && (
            <div
              onMouseDown={handleStartResizeHeight}
              className={`h-4 bg-slate-100 hover:bg-indigo-50 border-t border-b border-slate-200 cursor-row-resize flex items-center justify-center group transition select-none ${
                isResizingHeight ? 'bg-indigo-100 ring-2 ring-indigo-400' : ''
              }`}
              title="按住並上下拖曳以調整空間視窗高度"
            >
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 group-hover:text-indigo-600 font-medium">
                <div className="w-8 h-1 bg-slate-300 group-hover:bg-indigo-400 rounded-full"></div>
                <span className="hidden sm:inline font-mono">上下拖曳調整視窗高度 ({viewportHeight}px)</span>
                <div className="w-8 h-1 bg-slate-300 group-hover:bg-indigo-400 rounded-full"></div>
              </div>
            </div>
          )}

          {/* Footer info bar */}
          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex flex-wrap justify-between items-center gap-2 text-[11px] text-slate-500">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <button
                type="button"
                onClick={() => setShowCanvasSizeModal(true)}
                className="font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition"
                title="點擊自訂畫布尺寸"
              >
                <span>📐 畫布基準：{currentCanvasWidth} × {currentCanvasHeight} px</span>
                <Edit3 className="w-3 h-3" />
              </button>
              <span>🏢 專櫃：{booths.length} 個</span>
              <span>🏛️ 公共設施：{facilities.length} 個</span>
              <span>🚶 動線通道：{walkways.length} 條</span>
            </div>
            <button
              onClick={() => setIsPresetModalOpen(true)}
              className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 shrink-0"
            >
              <Sparkles className="w-3 h-3" />
              <span>空間藍圖庫</span>
            </button>
          </div>
        </div>

        {/* Right: Properties Inspector Panel (4 cols) */}
        <div className="lg:col-span-4 flex flex-col lg:sticky lg:top-20 self-start">
          <FloorPlanInspector
            selectedBooth={selectedBooth}
            selectedFacility={selectedFacility}
            selectedWalkway={selectedWalkway}
            products={products}
            booths={booths}
            facilities={facilities}
            walkways={walkways}
            canvasWidth={currentCanvasWidth}
            canvasHeight={currentCanvasHeight}
            onOpenCanvasSizeModal={() => setShowCanvasSizeModal(true)}
            onUpdateCanvasDimensions={onUpdateCanvasDimensions}
            onSelectBooth={(id) => {
              setSelectedBoothId(id);
              setSelectedFacilityId(null);
              setSelectedWalkwayId(null);
              setActiveMode('booth');
            }}
            onSelectFacility={(id) => {
              setSelectedFacilityId(id);
              setSelectedBoothId('');
              setSelectedWalkwayId(null);
              setActiveMode('facility');
            }}
            onSelectWalkway={(id) => {
              setSelectedWalkwayId(id);
              setSelectedBoothId('');
              setSelectedFacilityId(null);
              setActiveMode('walkway');
            }}
            onUpdateBooth={updateBooth}
            onUpdateFacility={updateFacility}
            onUpdateWalkway={updateWalkway}
            onDeleteBooth={handleDeleteBooth}
            onDeleteFacility={handleDeleteFacility}
            onDeleteWalkway={handleDeleteWalkway}
            onDuplicateBooth={handleDuplicateBooth}
            onDuplicateFacility={handleDuplicateFacility}
            onDuplicateWalkway={handleDuplicateWalkway}
            onClearFacilities={handleClearAllFacilities}
            onClearWalkways={handleClearAllWalkways}
            onClearBooths={handleClearAllBooths}
            onClearAllBackground={handleClearAllBackground}
            onResetDefaultFacilities={handleResetDefaultFacilities}
            onResetDefaultWalkways={handleResetDefaultWalkways}
            onGoToProductsForBooth={onGoToProductsForBooth}
            showBoothIds={showBoothIds}
            onToggleShowBoothIds={(val) => {
              setShowBoothIds(val);
              if (onToggleShowBoothIds) {
                onToggleShowBoothIds(val);
              }
            }}
            onShowToast={onShowToast}
          />
        </div>

      </div>

      {/* Preset Blueprints & Saved Versions Selection Modal */}
      <FloorPlanPresetModal
        isOpen={isPresetModalOpen}
        onClose={() => setIsPresetModalOpen(false)}
        onApplyLayout={handleApplyLayout}
        currentBooths={booths}
        currentFacilities={facilities}
        currentWalkways={walkways}
        onShowToast={onShowToast}
      />

      {/* Spatial Canvas Dimensions Customization Modal */}
      <CanvasSizeModal
        isOpen={showCanvasSizeModal}
        onClose={() => setShowCanvasSizeModal(false)}
        currentWidth={currentCanvasWidth}
        currentHeight={currentCanvasHeight}
        onApplyDimensions={(newW, newH, scaleExisting) => {
          if (onUpdateCanvasDimensions) {
            onUpdateCanvasDimensions(newW, newH, scaleExisting);
          }
        }}
      />

      {/* In-App Confirmation Modal for Safe Clear Actions */}
      {clearModalConfig && clearModalConfig.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div 
            className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4"
            role="dialog"
            aria-modal="true"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-800">{clearModalConfig.title}</h3>
              <p className="text-sm text-slate-500 mt-1 leading-relaxed">{clearModalConfig.description}</p>
            </div>

            <div className="bg-amber-50/70 border border-amber-200/60 rounded-2xl p-3 text-xs text-amber-800 flex items-start gap-2">
              <Undo2 className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <span>提示：本系統具備完整歷史紀錄，清空後仍可點選右上角的「復原」按鈕隨時復原。</span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setClearModalConfig(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
              >
                取消
              </button>
              <button
                type="button"
                onClick={clearModalConfig.onConfirm}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/20 transition"
              >
                <Trash2 className="w-4 h-4" />
                <span>{clearModalConfig.confirmLabel}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
