// src/components/StickerEditor.jsx
import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  ZoomIn, ZoomOut, RotateCw, Trash2, Upload, Grid3x3,
  Layers, Move, Maximize2, ChevronLeft, ChevronRight,
  Settings, Hand, MousePointer2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const StickerEditor = ({
  side = 'FRONT',
  stickers: initialStickers = [],
  stickerLibrary: initialLibrary = [],
  selectedSticker: externalSelected,
  onStickerSelect,
  onStickerAdd,
  onStickerUpdate,
  onStickerDelete,
  onStickerUpload,
  onApply,
  onCancel,
  isApplying = false,
  uvMapImage = '/Mesh_0.png'
}) => {
  // --- state / refs (kept your behavior) ---
  const [stickers, setStickers] = useState(initialStickers);
  const [selectedSticker, setSelectedSticker] = useState(externalSelected || null);
  const [draggedSticker, setDraggedSticker] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [rotationStart, setRotationStart] = useState({ angle: 0, centerX: 0, centerY: 0 });
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(false);
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [tool, setTool] = useState('select');
  const [uvMapLoaded, setUvMapLoaded] = useState(false);
  const [uvMapDimensions, setUvMapDimensions] = useState({ width: 600, height: 800 });

  const canvasRef = useRef();
  const fileInputRef = useRef();

  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  });

  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowSize.width <= 1024;

  useEffect(() => {
    const img = new Image();
    img.src = uvMapImage;
    img.onload = () => {
      setUvMapDimensions({ width: img.width, height: img.height });
      setUvMapLoaded(true);
    };
    img.onerror = () => setUvMapLoaded(true);
  }, [uvMapImage]);

  const defaultLibrary = [
    { url: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="40" fill="%23667eea" stroke="%23764ba2" stroke-width="2"/%3E%3C/svg%3E', name: 'Circle' },
    { url: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect x="15" y="15" width="70" height="70" rx="8" fill="%23f093fb" stroke="%23f5576c" stroke-width="2"/%3E%3C/svg%3E', name: 'Square' },
    { url: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Cpolygon points="50,10 90,85 10,85" fill="%234facfe" stroke="%2300f2fe" stroke-width="2"/%3E%3C/svg%3E', name: 'Triangle' },
    { url: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Cpath d="M50 15 L61 45 L92 45 L67 63 L78 93 L50 75 L22 93 L33 63 L8 45 L39 45 Z" fill="%23fa709a" stroke="%23fee140" stroke-width="2"/%3E%3C/svg%3E', name: 'Star' },
    { url: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Cpath d="M50 10 L90 50 L50 90 L10 50 Z" fill="%2330cfd0" stroke="%23330867" stroke-width="2"/%3E%3C/svg%3E', name: 'Diamond' },
    { url: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Cpath d="M50 15 L65 40 L92 45 L71 65 L76 92 L50 78 L24 92 L29 65 L8 45 L35 40 Z" fill="%23a8edea" stroke="%23fed6e3" stroke-width="2"/%3E%3C/svg%3E', name: 'Badge' },
  ];

  const stickerLibrary = initialLibrary.length > 0 ? initialLibrary : defaultLibrary;

  // --- helpers (preserved) ---
  const addSticker = (stickerTemplate) => {
    const newSticker = {
      id: Date.now(),
      url: stickerTemplate.url,
      name: stickerTemplate.name,
      x: 50, y: 50,
      width: 80, height: 80,
      rotation: 0
    };
    const updated = [...stickers, newSticker];
    setStickers(updated);
    setSelectedSticker(newSticker.id);
    onStickerAdd?.(stickerTemplate);
  };

  const updateSticker = (id, updates) => {
    const updated = stickers.map(s => s.id === id ? { ...s, ...updates } : s);
    setStickers(updated);
    onStickerUpdate?.(id, updates);
  };

  const deleteSticker = (id) => {
    const updated = stickers.filter(s => s.id !== id);
    setStickers(updated);
    if (selectedSticker === id) setSelectedSticker(null);
    onStickerDelete?.(id);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newSticker = {
          id: Date.now(),
          url: e.target.result,
          name: file.name,
          x: 50, y: 50,
          width: 100, height: 100, rotation: 0
        };
        const updated = [...stickers, newSticker];
        setStickers(updated);
        setSelectedSticker(newSticker.id);
        onStickerUpload?.(e.target.result, file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  // --- mouse/touch handlers (kept) ---
  const handleMouseDown = useCallback((e, stickerId, action = 'move') => {
    e.preventDefault(); e.stopPropagation();
    const sticker = stickers.find(s => s.id === stickerId);
    if (!sticker) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const clickX = (clientX - rect.left) / zoom;
    const clickY = (clientY - rect.top) / zoom;

    const stickerPixelX = (sticker.x / 100) * uvMapDimensions.width;
    const stickerPixelY = (sticker.y / 100) * uvMapDimensions.height;

    setSelectedSticker(stickerId); onStickerSelect?.(stickerId); setDraggedSticker(stickerId);

    if (action === 'resize') {
      setIsResizing(true);
      setResizeStart({ x: clientX, y: clientY, width: sticker.width, height: sticker.height });
    }  else if (action === 'rotate') {
  const rect = canvasRef.current.getBoundingClientRect();
  const stickerCenterX = rect.left + (sticker.x / 100) * rect.width;
  const stickerCenterY = rect.top + (sticker.y / 100) * rect.height;

  setIsRotating(true);
  setRotationStart({
    angle: sticker.rotation || 0,
    centerX: stickerCenterX / zoom,
    centerY: stickerCenterY / zoom
  });
}

    else {
      setDragOffset({ x: clickX - stickerPixelX, y: clickY - stickerPixelY });
    }
  }, [stickers, zoom, uvMapDimensions, onStickerSelect]);

  const handleMouseMove = useCallback((e) => {
    if (!canvasRef.current || !draggedSticker) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const mouseX = (clientX - rect.left) / zoom;
    const mouseY = (clientY - rect.top) / zoom;

    if (isResizing) {
      const deltaX = clientX - resizeStart.x;
      const deltaY = clientY - resizeStart.y;
      const avgDelta = (deltaX + deltaY) / 2;
      const scaleFactor = Math.max(0.3, 1 + avgDelta / 100);
      const newWidth = Math.max(30, Math.min(600, resizeStart.width * scaleFactor));
      const newHeight = Math.max(30, Math.min(600, resizeStart.height * scaleFactor));
      updateSticker(draggedSticker, { width: newWidth, height: newHeight });
    } else if (isRotating) {
      const dx = mouseX - rotationStart.centerX;
      const dy = mouseY - rotationStart.centerY;
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      updateSticker(draggedSticker, { rotation: angle + 90 });
    } else {
      const newPixelX = mouseX - dragOffset.x;
      const newPixelY = mouseY - dragOffset.y;
      const newX = (newPixelX / uvMapDimensions.width) * 100;
      const newY = (newPixelY / uvMapDimensions.height) * 100;
      const margin = 2;
      const constrainedX = Math.max(margin, Math.min(100 - margin, newX));
      const constrainedY = Math.max(margin, Math.min(100 - margin, newY));
      updateSticker(draggedSticker, { x: constrainedX, y: constrainedY });
    }
  }, [draggedSticker, dragOffset, isResizing, isRotating, resizeStart, rotationStart, zoom, uvMapDimensions]);

  const handleMouseUp = useCallback(() => {
    setDraggedSticker(null); setIsResizing(false); setIsRotating(false);
  }, []);

  useEffect(() => {
    if (draggedSticker) {
      const options = { passive: false };
      document.addEventListener('mousemove', handleMouseMove, options);
      document.addEventListener('mouseup', handleMouseUp, options);
      document.addEventListener('touchmove', handleMouseMove, options);
      document.addEventListener('touchend', handleMouseUp, options);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove, options);
        document.removeEventListener('mouseup', handleMouseUp, options);
        document.removeEventListener('touchmove', handleMouseMove, options);
        document.removeEventListener('touchend', handleMouseUp, options);
      };
    }
  }, [draggedSticker, handleMouseMove, handleMouseUp]);

  const selectedStickerData = stickers.find(s => s.id === selectedSticker);

  const canvasContainerWidth = windowSize.width - (leftPanelOpen && !isMobile ? 280 : 60) - (rightPanelOpen && !isMobile ? 320 : 60);
  const canvasContainerHeight = windowSize.height - 56;

  const getDisplayDimensions = () => {
    const maxWidth = Math.min(canvasContainerWidth * 0.92, 980);
    const maxHeight = Math.min(canvasContainerHeight * 0.92, 1200);
    const aspectRatio = uvMapDimensions.width / uvMapDimensions.height;
    let displayWidth = maxWidth;
    let displayHeight = displayWidth / aspectRatio;
    if (displayHeight > maxHeight) {
      displayHeight = maxHeight;
      displayWidth = displayHeight * aspectRatio;
    }
    return { width: displayWidth * zoom, height: displayHeight * zoom };
  };

  const displayDimensions = getDisplayDimensions();

  // --- small motion variants ---
  const panelVariant = { hidden: { x: -20, opacity: 0 }, visible: { x: 0, opacity: 1 } };
  const rightPanelVariant = { hidden: { x: 20, opacity: 0 }, visible: { x: 0, opacity: 1 } };

  // ------------------ RENDER ------------------
  return (
    <div className="w-full h-screen bg-zinc-900 text-zinc-100 flex flex-col overflow-hidden font-sans antialiased">
      
        <motion.header
          initial={{ y: -12, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.35 }}
          className="flex items-center justify-between h-14 px-4 bg-gradient-to-b from-zinc-900/90 to-zinc-900/60 border-b border-zinc-800 z-20"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#569cd6] to-[#4ec9b0] flex items-center justify-center shadow-sm">
          <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
          <div className="text-sm font-semibold">Fabric Editor</div>
          <div className="text-xs text-zinc-400 -mt-0.5">{side} · UV Canvas</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick open panel buttons */}
            <div className="flex items-center gap-2 bg-zinc-800/40 rounded-md px-2 py-1">
          <button
            onClick={() => { setLeftPanelOpen(true); setTool('select'); }}
            className="p-2 rounded hover:bg-zinc-800 text-zinc-200 flex items-center gap-2"
            title="Open Tools (Layers)"
            aria-label="Open Tools"
          >
            <Layers className="w-4 h-4" />
            <span className="text-xs text-zinc-300 hidden sm:inline">Tools</span>
          </button>

          <button
            onClick={() => { setRightPanelOpen(true); setTool('select'); }}
            className="p-2 rounded hover:bg-zinc-800 text-zinc-200 flex items-center gap-2"
            title="Open Properties"
            aria-label="Open Properties"
          >
            <Settings className="w-4 h-4" />
            <span className="text-xs text-zinc-300 hidden sm:inline">Properties</span>
          </button>
            </div>

            <div className="flex items-center gap-2 bg-zinc-800/60 rounded-md px-2 py-1">
          <button
            onClick={() => { setTool('select'); }}
            className={`p-1 rounded ${tool === 'select' ? 'bg-zinc-700 text-cyan-300' : 'text-zinc-300 hover:text-white'}`}
            title="Select (V)"
            aria-label="Select tool"
          >
            <MousePointer2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setTool('hand'); }}
            className={`p-1 rounded ${tool === 'hand' ? 'bg-zinc-700 text-cyan-300' : 'text-zinc-300 hover:text-white'}`}
            title="Hand (H)"
            aria-label="Hand tool"
          >
            <Hand className="w-4 h-4" />
          </button>
            </div>

            <button
          onClick={() => setShowGrid(!showGrid)}
          className={`p-2 rounded-md ${showGrid ? 'bg-zinc-800 text-cyan-300' : 'bg-transparent text-zinc-300 hover:bg-zinc-800'}`}
          title="Toggle Grid"
          aria-label="Toggle Grid"
            >
          <Grid3x3 className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 bg-zinc-800/40 rounded-md px-2 py-1">
          <button onClick={() => setZoom(Math.max(0.25, zoom - 0.25))} className="p-1 text-zinc-300" aria-label="Zoom out"><ZoomOut className="w-4 h-4" /></button>
          <div className="text-xs font-mono text-zinc-300 w-14 text-center">{Math.round(zoom * 100)}%</div>
          <button onClick={() => setZoom(Math.min(3, zoom + 0.25))} className="p-1 text-zinc-300" aria-label="Zoom in"><ZoomIn className="w-4 h-4" /></button>
            </div>

            {onApply && (
          <button
            onClick={onApply}
            disabled={isApplying}
            className="ml-3 px-3 py-1.5 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white text-sm disabled:opacity-60"
          >
            {isApplying ? 'Applying...' : 'Apply to Model'}
          </button>
            )}
          </div>
        </motion.header>

        <div className="flex-1 flex overflow-hidden relative">
          {/* mobile overlay to close sidebars */}
        {isMobile && (leftPanelOpen || rightPanelOpen) && (
          <div onClick={() => { setLeftPanelOpen(false); setRightPanelOpen(false); }}
            className="fixed inset-0 bg-black/40 z-30" />
        )}

        {/* Left sidebar */}
        <AnimatePresence initial={false}>
          {leftPanelOpen ? (
            <motion.aside
              initial="hidden" animate="visible" exit="hidden"
              variants={panelVariant}
              transition={{ duration: 0.25 }}
              className={`z-40 ${isMobile ? 'fixed left-0 top-14 bottom-0 w-80' : 'w-72'} bg-zinc-900 border-r border-zinc-800 shadow-lg flex flex-col`}
            >
              <div className="flex items-center justify-between px-3 h-12 border-b border-zinc-800">
                <div className="text-xs font-medium text-zinc-300 tracking-wide">Tools</div>
                <button onClick={() => setLeftPanelOpen(false)} className="p-2 text-zinc-300 hover:bg-zinc-800 rounded">
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 overflow-auto space-y-3 flex-1">
                <div className="space-y-2">
                  <button onClick={() => setTool('select')}
                    className={`w-full text-left px-3 py-2 rounded-md ${tool === 'select' ? 'bg-zinc-800 text-cyan-300' : 'hover:bg-zinc-800 text-zinc-300'}`}>
                    <div className="flex items-center gap-3"><MousePointer2 className="w-4 h-4" /> Select <span className="ml-auto text-xs text-zinc-500">V</span></div>
                  </button>

                  <button onClick={() => setTool('move')}
                    className={`w-full text-left px-3 py-2 rounded-md ${tool === 'move' ? 'bg-zinc-800 text-cyan-300' : 'hover:bg-zinc-800 text-zinc-300'}`}>
                    <div className="flex items-center gap-3"><Move className="w-4 h-4" /> Move <span className="ml-auto text-xs text-zinc-500">M</span></div>
                  </button>

                  <button onClick={() => setTool('scale')}
                    className={`w-full text-left px-3 py-2 rounded-md ${tool === 'scale' ? 'bg-zinc-800 text-cyan-300' : 'hover:bg-zinc-800 text-zinc-300'}`}>
                    <div className="flex items-center gap-3"><Maximize2 className="w-4 h-4" /> Scale <span className="ml-auto text-xs text-zinc-500">S</span></div>
                  </button>

                  <button onClick={() => setTool('rotate')}
                    className={`w-full text-left px-3 py-2 rounded-md ${tool === 'rotate' ? 'bg-zinc-800 text-cyan-300' : 'hover:bg-zinc-800 text-zinc-300'}`}>
                    <div className="flex items-center gap-3"><RotateCw className="w-4 h-4" /> Rotate <span className="ml-auto text-xs text-zinc-500">R</span></div>
                  </button>
                </div>

                <div className="pt-3 border-t border-zinc-800">
                  <div className="text-xs text-zinc-400 mb-2">Layers ({stickers.length})</div>
                  <div className="space-y-1">
                    {stickers.length === 0 && <div className="text-xs text-zinc-500 py-4 text-center">No layers</div>}
                    {stickers.map((sticker, idx) => (
                      <button key={sticker.id}
                        onClick={() => { setSelectedSticker(sticker.id); onStickerSelect?.(sticker.id); }}
                        className={`w-full flex items-center gap-2 px-2 py-2 rounded ${selectedSticker === sticker.id ? 'bg-zinc-800 text-cyan-300' : 'hover:bg-zinc-800 text-zinc-200'}`}>
                        <div className="w-7 h-7 rounded bg-zinc-800 flex items-center justify-center overflow-hidden">
                          <img src={sticker.url} alt="" className="w-5 h-5 object-contain" />
                        </div>
                        <div className="text-xs truncate text-left">{sticker.name || `Layer ${idx + 1}`}</div>
                        <div className="ml-auto text-[10px] text-zinc-500">{Math.round(sticker.x)}%,{Math.round(sticker.y)}%</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.aside>
          ) : (
            <motion.div
              initial={{ width: 60 }} animate={{ width: 60 }} className="w-16 flex-shrink-0"
            />
          )}
        </AnimatePresence>

        {/* Canvas area */}
        <main className="flex-1 relative flex items-center justify-center bg-zinc-900/40">
          <div
            ref={canvasRef}
            style={{ width: displayDimensions.width, height: displayDimensions.height }}
            className="relative bg-zinc-800 rounded-2xl shadow-2xl overflow-hidden touch-none"
          >
            {/* grid */}
            {showGrid && <div className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage: 'repeating-linear-gradient(0deg,#3b3b3f 0px,#3b3b3f 1px,transparent 1px,transparent 20px), repeating-linear-gradient(90deg,#3b3b3f 0px,#3b3b3f 1px,transparent 1px,transparent 20px)',
                backgroundSize: '20px 20px'
              }} />}
            {/* uv map */}
            {uvMapLoaded && (
              <img src={uvMapImage} alt="UV map" draggable={false}
                className="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none select-none rounded-2xl" />
            )}

            {/* center cross */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <div className="w-px h-8 bg-cyan-600/30" />
            </div>

            {/* side label */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-zinc-800/70 text-xs text-zinc-300 border border-zinc-700">
              {side} SIDE
            </div>

            {/* stickers */}
            {stickers.map(sticker => {
              const stickerPixelX = (sticker.x / 100) * (displayDimensions.width / zoom);
              const stickerPixelY = (sticker.y / 100) * (displayDimensions.height / zoom);
              const isSelected = selectedSticker === sticker.id;

              return (
                <motion.div
                  key={sticker.id}
                  animate={{ scale: isSelected ? 1.02 : 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                  style={{
                    position: 'absolute',
                    left: stickerPixelX,
                    top: stickerPixelY,
                    width: sticker.width,
                    height: sticker.height,
                    transform: `translate(-50%,-50%) rotate(${sticker.rotation || 0}deg)`,
                    zIndex: isSelected ? 60 : 20,
                    touchAction: 'none',
                    cursor: 'grab'
                  }}
                  onMouseDown={(e) => handleMouseDown(e, sticker.id)}
                  onTouchStart={(e) => handleMouseDown(e, sticker.id)}
                >
                  {/* selection outlines */}
                  {isSelected && (
                    <>
                      <div className="absolute inset-0 rounded-lg border border-cyan-500/60 pointer-events-none" style={{ boxShadow: '0 0 0 1px rgba(86,156,214,0.18)' }} />
                      <div className="absolute -inset-2 rounded-lg border border-cyan-500/20 pointer-events-none" />
                    </>
                  )}

                  <img src={sticker.url} alt={sticker.name} draggable={false}
                    className="w-full h-full object-contain rounded pointer-events-none select-none" />

                  {/* controls when selected */}
                  {isSelected && (
                    <>
                      {/* resize handle */}
                      <div
                        onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, sticker.id, 'resize'); }}
                        onTouchStart={(e) => { e.stopPropagation(); handleMouseDown(e, sticker.id, 'resize'); }}
                        className="absolute -right-2 -bottom-2 w-3 h-3 bg-cyan-500 rounded-sm border border-zinc-800 cursor-se-resize"
                        style={{ zIndex: 120 }}
                      />

                      {/* rotate handle */}
                      <div
                        onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, sticker.id, 'rotate'); }}
                        onTouchStart={(e) => { e.stopPropagation(); handleMouseDown(e, sticker.id, 'rotate'); }}
                        className="absolute left-1/2 -top-5 -translate-x-1/2 w-3 h-3 bg-emerald-400 rounded-full border border-zinc-800 cursor-grab"
                        style={{ zIndex: 120 }}
                      />

                      {/* delete */}
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteSticker(sticker.id); }}
                        className="absolute -top-3 -right-3 w-6 h-6 rounded flex items-center justify-center bg-red-500 text-white shadow"
                        style={{ zIndex: 130 }}
                        title="Delete sticker"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </>
                  )}
                </motion.div>
              );
            })}

            {/* empty state */}
            {stickers.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <Layers className="w-14 h-14 text-zinc-700 mx-auto mb-3" />
                  <div className="text-sm text-zinc-500">Drop stickers here or add from assets</div>
                </div>
              </div>
            )}
          </div>

          {/* canvas info */}
          <div className="absolute bottom-6 left-6 bg-zinc-800/70 backdrop-blur rounded px-3 py-1 text-xs text-zinc-300 border border-zinc-700">
            <div className="hidden sm:block">{Math.round(displayDimensions.width / zoom)} × {Math.round(displayDimensions.height / zoom)} px</div>
            <div className="text-xs">{stickers.length} object{stickers.length !== 1 ? 's' : ''}</div>
          </div>
        </main>

        {/* Right panel */}
        <AnimatePresence initial={false}>
          {rightPanelOpen ? (
            <motion.aside initial="hidden" animate="visible" exit="hidden" variants={rightPanelVariant}
              transition={{ duration: 0.25 }}
              className={`z-40 ${isMobile ? 'fixed right-0 top-14 bottom-0 w-80' : 'w-80'} bg-zinc-900 border-l border-zinc-800 shadow-lg flex flex-col`}
            >
              <div className="flex items-center justify-between px-3 h-12 border-b border-zinc-800">
                <div className="text-xs font-medium text-zinc-300 tracking-wide">Properties</div>
                <button onClick={() => setRightPanelOpen(false)} className="p-2 text-zinc-300 hover:bg-zinc-800 rounded">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 overflow-auto flex-1 space-y-4">
                {selectedStickerData ? (
                  <div className="space-y-3">
                    <div className="text-xs text-zinc-400">Transform</div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] text-zinc-400">X (%)</label>
                        <input type="number" value={Math.round(selectedStickerData.x)}
                          onChange={(e) => updateSticker(selectedSticker, { x: parseFloat(e.target.value) || 0 }) }
                          className="w-full mt-1 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-200 focus:outline-none" />
                      </div>
                      <div>
                        <label className="text-[11px] text-zinc-400">Y (%)</label>
                        <input type="number" value={Math.round(selectedStickerData.y)}
                          onChange={(e) => updateSticker(selectedSticker, { y: parseFloat(e.target.value) || 0 }) }
                          className="w-full mt-1 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-200 focus:outline-none" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] text-zinc-400">W (px)</label>
                        <input type="number" value={Math.round(selectedStickerData.width)}
                          onChange={(e) => updateSticker(selectedSticker, { width: parseFloat(e.target.value) || 0 })}
                          className="w-full mt-1 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-200 focus:outline-none" />
                      </div>
                      <div>
                        <label className="text-[11px] text-zinc-400">H (px)</label>
                        <input type="number" value={Math.round(selectedStickerData.height)}
                          onChange={(e) => updateSticker(selectedSticker, { height: parseFloat(e.target.value) || 0 })}
                          className="w-full mt-1 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-200 focus:outline-none" />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] text-zinc-400">Rotation</label>
                        <div className="text-xs text-cyan-300">{Math.round(selectedStickerData.rotation || 0)}°</div>
                      </div>
                      <input type="range" min="0" max="360" value={selectedStickerData.rotation || 0}
                        onChange={(e) => updateSticker(selectedSticker, { rotation: parseFloat(e.target.value) })}
                        className="w-full mt-2 accent-cyan-400" />
                    </div>

                    <button onClick={() => deleteSticker(selectedSticker)}
                      className="w-full mt-2 px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded text-sm flex items-center justify-center gap-2">
                      <Trash2 className="w-4 h-4" /> Delete Layer
                    </button>
                  </div>
                ) : (
                  <div className="text-xs text-zinc-500">Select a sticker to edit properties</div>
                )}

                {/* asset library */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-medium text-zinc-300">Assets</div>
                    <button onClick={() => fileInputRef.current?.click()} className="p-1.5 bg-cyan-600 rounded text-white">
                      <Upload className="w-4 h-4" />
                    </button>
                  </div>

                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />

                  <div className={`grid gap-2 ${isMobile ? 'grid-cols-3' : 'grid-cols-3'}`}>
                    {stickerLibrary.map((s, i) => (
                      <button key={i} onClick={() => addSticker(s)}
                        className="aspect-square bg-zinc-800 rounded border border-zinc-700 p-2 hover:border-cyan-400 transition">
                        <img src={s.url} alt={s.name} className="w-full h-full object-contain" />
                      </button>
                    ))}
                  </div>

                  <button onClick={() => fileInputRef.current?.click()} className="w-full mt-3 px-3 py-2 border border-dashed border-zinc-700 rounded text-xs text-zinc-300">
                    <div className="flex items-center justify-center gap-2"><Upload className="w-4 h-4" /> Upload Custom Asset</div>
                  </button>
                </div>
              </div>
            </motion.aside>
          ) : (
            <motion.div initial={{ width: 64 }} animate={{ width: 64 }} className="w-16 flex-shrink-0" />
          )}
        </AnimatePresence>
      </div>

      {/* bottom mini toolbar for mobile quick actions */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 md:hidden z-40 flex items-center gap-3">
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => setLeftPanelOpen(true)} className="p-3 rounded-full bg-zinc-800 text-zinc-200 shadow">
          <Layers className="w-4 h-4" />
        </motion.button>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => setRightPanelOpen(true)} className="p-3 rounded-full bg-zinc-800 text-zinc-200 shadow">
          <Settings className="w-4 h-4" />
        </motion.button>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => onApply?.()} className="p-3 rounded-full bg-cyan-600 text-white shadow">
          <Settings className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
};

export default StickerEditor;