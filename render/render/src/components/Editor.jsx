import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  ZoomIn, ZoomOut, RotateCw, Trash2, Upload, Grid3x3,
  Layers, Move, Maximize2, ChevronLeft, ChevronRight,
  Settings, Hand, MousePointer2
} from 'lucide-react';

const Editor = ({
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
  const [stickers, setStickers] = useState(initialStickers);
  const [selectedSticker, setSelectedSticker] = useState(externalSelected || null);
  const [draggedSticker, setDraggedSticker] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [rotationStart, setRotationStart] = useState({ angle: 0, centerX: 0, centerY: 0, startAngle: 0 });
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(false);
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [tool, setTool] = useState('select');
  const [uvMapLoaded, setUvMapLoaded] = useState(false);
  const [uvMapDimensions, setUvMapDimensions] = useState({ width: 600, height: 800 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const canvasRef = useRef();
  const fileInputRef = useRef();

  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  });

  // Track mouse position for blur effect
  useEffect(() => {
    const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    setStickers(initialStickers);
  }, [initialStickers]);

  useEffect(() => {
    if (externalSelected !== undefined) {
      setSelectedSticker(externalSelected);
    }
  }, [externalSelected]);

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
    onStickerAdd?.(newSticker);
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

  const handleMouseDown = useCallback((e, stickerId, action = 'move') => {
    e.preventDefault();
    e.stopPropagation();
    const sticker = stickers.find(s => s.id === stickerId);
    if (!sticker) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const clickX = (clientX - rect.left) / zoom;
    const clickY = (clientY - rect.top) / zoom;

    const stickerPixelX = (sticker.x / 100) * uvMapDimensions.width;
    const stickerPixelY = (sticker.y / 100) * uvMapDimensions.height;

    setSelectedSticker(stickerId);
    onStickerSelect?.(stickerId);
    setDraggedSticker(stickerId);

    if (action === 'resize') {
      setIsResizing(true);
      setResizeStart({ x: clientX, y: clientY, width: sticker.width, height: sticker.height });
    } else if (action === 'rotate') {
      const displayDims = getDisplayDimensions();
      const stickerCenterX = (sticker.x / 100) * (displayDims.width / zoom);
      const stickerCenterY = (sticker.y / 100) * (displayDims.height / zoom);
      
      const dx = clickX - stickerCenterX;
      const dy = clickY - stickerCenterY;
      const startAngle = Math.atan2(dy, dx) * (180 / Math.PI);

      setIsRotating(true);
      setRotationStart({
        angle: sticker.rotation || 0,
        centerX: stickerCenterX,
        centerY: stickerCenterY,
        startAngle: startAngle
      });
    } else {
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
      const currentAngle = Math.atan2(dy, dx) * (180 / Math.PI);
      const angleDelta = currentAngle - rotationStart.startAngle;
      const newRotation = (rotationStart.angle + angleDelta + 360) % 360;
      updateSticker(draggedSticker, { rotation: newRotation });
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
    setDraggedSticker(null);
    setIsResizing(false);
    setIsRotating(false);
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

  return (
    <div className="w-full h-screen bg-black text-zinc-100 flex flex-col overflow-hidden font-sans antialiased relative">
      {/* Background Image Layer - Sharp */}
      <div
        className="fixed inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.vexels.com/media/users/3/358430/raw/96ff7f89c7e9736cec596fb55ecd7972-edgy-urban-hoodie-t-shirt-design.jpg')`,
          transform: 'scale(1.1)',
          zIndex: 0
        }}
      />

      {/* Blurred Overlay with Mouse Reveal Effect */}
      <div
        className="fixed inset-0 bg-cover bg-center pointer-events-none"
        style={{
          backgroundImage: `url('https://images.vexels.com/media/users/3/358430/raw/96ff7f89c7e9736cec596fb55ecd7972-edgy-urban-hoodie-t-shirt-design.jpg')`,
          filter: 'blur(8px) brightness(0.6)',
          transform: 'scale(1.1)',
          maskImage: `radial-gradient(circle 300px at ${mousePos.x}px ${mousePos.y}px, transparent 0%, black 40%)`,
          WebkitMaskImage: `radial-gradient(circle 300px at ${mousePos.x}px ${mousePos.y}px, transparent 0%, black 40%)`,
          transition: 'mask-image 0.15s ease-out, -webkit-mask-image 0.15s ease-out',
          zIndex: 0
        }}
      />

      {/* Dark overlay for better readability */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.7) 100%)',
          zIndex: 1
        }}
      />

      {/* Grid overlay */}
      <div
        className="fixed inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,255,100,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,100,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          zIndex: 1
        }}
      />

      {/* Subtle cursor glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle 200px at ${mousePos.x}px ${mousePos.y}px, rgba(0,255,100,0.08), transparent 60%)`,
          transition: 'all 0.15s ease-out',
          zIndex: 1
        }}
      />

      {/* Main Content with relative positioning for z-index */}
      <div className="relative z-10 w-full h-screen flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between h-12 sm:h-14 px-2 sm:px-4 bg-white/5 backdrop-blur-md border-b border-white/10 z-20">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-[#569cd6] to-[#4ec9b0] flex items-center justify-center shadow-sm">
              <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-semibold text-white">Fabric Editor</div>
              <div className="text-[10px] sm:text-xs text-zinc-300 -mt-0.5">{side} · UV Canvas</div>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-3">
            {/* Desktop controls */}
            <div className="hidden md:flex items-center gap-2 bg-white/5 backdrop-blur-sm rounded-md px-2 py-1">
              <button onClick={() => { setLeftPanelOpen(true); setTool('select'); }} className="p-2 rounded hover:bg-white/10 text-zinc-200 flex items-center gap-2" title="Open Tools">
                <Layers className="w-4 h-4" />
                <span className="text-xs text-zinc-300 hidden lg:inline">Tools</span>
              </button>
              <button onClick={() => { setRightPanelOpen(true); setTool('select'); }} className="p-2 rounded hover:bg-white/10 text-zinc-200 flex items-center gap-2" title="Open Properties">
                <Settings className="w-4 h-4" />
                <span className="text-xs text-zinc-300 hidden lg:inline">Properties</span>
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-2 bg-white/5 backdrop-blur-sm rounded-md px-2 py-1">
              <button onClick={() => setTool('select')} className={`p-1 rounded ${tool === 'select' ? 'bg-white/10 text-cyan-300' : 'text-zinc-300 hover:text-white'}`} title="Select (V)">
                <MousePointer2 className="w-4 h-4" />
              </button>
              <button onClick={() => setTool('hand')} className={`p-1 rounded ${tool === 'hand' ? 'bg-white/10 text-cyan-300' : 'text-zinc-300 hover:text-white'}`} title="Hand (H)">
                <Hand className="w-4 h-4" />
              </button>
            </div>

            <button onClick={() => setShowGrid(!showGrid)} className={`hidden sm:block p-2 rounded-md ${showGrid ? 'bg-white/10 text-cyan-300' : 'bg-transparent text-zinc-300 hover:bg-white/10'}`} title="Toggle Grid">
              <Grid3x3 className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1 sm:gap-2 bg-white/5 backdrop-blur-sm rounded-md px-1 sm:px-2 py-1">
              <button onClick={() => setZoom(Math.max(0.25, zoom - 0.25))} className="p-1 text-zinc-300"><ZoomOut className="w-3 h-3 sm:w-4 sm:h-4" /></button>
              <div className="text-[10px] sm:text-xs font-mono text-zinc-300 w-10 sm:w-14 text-center">{Math.round(zoom * 100)}%</div>
              <button onClick={() => setZoom(Math.min(3, zoom + 0.25))} className="p-1 text-zinc-300"><ZoomIn className="w-3 h-3 sm:w-4 sm:h-4" /></button>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              {onCancel && (
                <button onClick={onCancel} className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-md bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white text-xs sm:text-sm border border-white/20">
                  Cancel
                </button>
              )}
              {onApply && (
                <button onClick={onApply} disabled={isApplying} className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-md bg-cyan-600/90 backdrop-blur-sm hover:bg-cyan-500 text-white text-xs sm:text-sm disabled:opacity-60 border border-cyan-400/30">
                  {isApplying ? 'Applying...' : 'Apply'}
                </button>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden relative">
          {isMobile && (leftPanelOpen || rightPanelOpen) && (
            <div onClick={() => { setLeftPanelOpen(false); setRightPanelOpen(false); }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30" />
          )}

          {/* Left Panel */}
          {leftPanelOpen && (
            <aside className={`z-40 ${isMobile ? 'fixed left-0 top-12 sm:top-14 bottom-0 w-72 sm:w-80' : 'w-60 lg:w-72'} bg-black/40 backdrop-blur-xl border-r border-white/10 shadow-2xl flex flex-col`}>
              <div className="flex items-center justify-between px-3 h-10 sm:h-12 border-b border-white/10">
                <div className="text-xs font-medium text-zinc-200 tracking-wide">Tools</div>
                <button onClick={() => setLeftPanelOpen(false)} className="p-2 text-zinc-300 hover:bg-white/10 rounded">
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 overflow-auto space-y-3 flex-1">
                <div className="space-y-2">
                  <button onClick={() => setTool('select')} className={`w-full text-left px-3 py-2 rounded-md ${tool === 'select' ? 'bg-white/10 text-cyan-300' : 'hover:bg-white/5 text-zinc-300'}`}>
                    <div className="flex items-center gap-3"><MousePointer2 className="w-4 h-4" /> Select <span className="ml-auto text-xs text-zinc-500">V</span></div>
                  </button>
                  <button onClick={() => setTool('move')} className={`w-full text-left px-3 py-2 rounded-md ${tool === 'move' ? 'bg-white/10 text-cyan-300' : 'hover:bg-white/5 text-zinc-300'}`}>
                    <div className="flex items-center gap-3"><Move className="w-4 h-4" /> Move <span className="ml-auto text-xs text-zinc-500">M</span></div>
                  </button>
                  <button onClick={() => setTool('scale')} className={`w-full text-left px-3 py-2 rounded-md ${tool === 'scale' ? 'bg-white/10 text-cyan-300' : 'hover:bg-white/5 text-zinc-300'}`}>
                    <div className="flex items-center gap-3"><Maximize2 className="w-4 h-4" /> Scale <span className="ml-auto text-xs text-zinc-500">S</span></div>
                  </button>
                  <button onClick={() => setTool('rotate')} className={`w-full text-left px-3 py-2 rounded-md ${tool === 'rotate' ? 'bg-white/10 text-cyan-300' : 'hover:bg-white/5 text-zinc-300'}`}>
                    <div className="flex items-center gap-3"><RotateCw className="w-4 h-4" /> Rotate <span className="ml-auto text-xs text-zinc-500">R</span></div>
                  </button>
                </div>

                <div className="pt-3 border-t border-white/10">
                  <div className="text-xs text-zinc-300 mb-2">Layers ({stickers.length})</div>
                  <div className="space-y-1">
                    {stickers.length === 0 && <div className="text-xs text-zinc-500 py-4 text-center">No layers</div>}
                    {stickers.map((sticker, idx) => (
                      <button key={sticker.id} onClick={() => { setSelectedSticker(sticker.id); onStickerSelect?.(sticker.id); }}
                        className={`w-full flex items-center gap-2 px-2 py-2 rounded ${selectedSticker === sticker.id ? 'bg-white/10 text-cyan-300' : 'hover:bg-white/5 text-zinc-200'}`}>
                        <div className="w-7 h-7 rounded bg-white/5 flex items-center justify-center overflow-hidden">
                          <img src={sticker.url} alt="" className="w-5 h-5 object-contain" />
                        </div>
                        <div className="text-xs truncate text-left">{sticker.name || `Layer ${idx + 1}`}</div>
                        <div className="ml-auto text-[10px] text-zinc-500">{Math.round(sticker.x)}%,{Math.round(sticker.y)}%</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          )}

          {/* Main Canvas */}
          <main className="flex-1 relative flex items-center justify-center">
            <div ref={canvasRef} style={{ width: displayDimensions.width, height: displayDimensions.height }}
              className="relative bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden touch-none border border-white/10">
              {showGrid && <div className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage: 'repeating-linear-gradient(0deg,#3b3b3f 0px,#3b3b3f 1px,transparent 1px,transparent 20px), repeating-linear-gradient(90deg,#3b3b3f 0px,#3b3b3f 1px,transparent 1px,transparent 20px)',
                  backgroundSize: '20px 20px'
                }} />}
              {uvMapLoaded && (
                <img src={uvMapImage} alt="UV map" draggable={false}
                  className="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none select-none rounded-xl sm:rounded-2xl" />
              )}

              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <div className="w-px h-8 bg-cyan-600/30" />
              </div>

              <div className="absolute top-2 sm:top-3 left-1/2 -translate-x-1/2 px-2 sm:px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-[10px] sm:text-xs text-zinc-200 border border-white/20">
                {side} SIDE
              </div>

              {stickers.map(sticker => {
                const stickerPixelX = (sticker.x / 100) * (displayDimensions.width / zoom);
                const stickerPixelY = (sticker.y / 100) * (displayDimensions.height / zoom);
                const isSelected = selectedSticker === sticker.id;

                return (
                  <div key={sticker.id}
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
                    onTouchStart={(e) => handleMouseDown(e, sticker.id)}>
                    {isSelected && (
                      <>
                        <div className="absolute inset-0 rounded-lg border border-cyan-500/60 pointer-events-none" style={{ boxShadow: '0 0 0 1px rgba(86,156,214,0.18)' }} />
                        <div className="absolute -inset-2 rounded-lg border border-cyan-500/20 pointer-events-none" />
                      </>
                    )}

                    <img src={sticker.url} alt={sticker.name} draggable={false}
                      className="w-full h-full object-contain rounded pointer-events-none select-none" />

                    {isSelected && (
                      <>
                        <div onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, sticker.id, 'resize'); }}
                          onTouchStart={(e) => { e.stopPropagation(); handleMouseDown(e, sticker.id, 'resize'); }}
                          className="absolute -right-2 -bottom-2 w-3 h-3 bg-cyan-500 rounded-sm border border-zinc-800 cursor-se-resize"
                          style={{ zIndex: 120 }} />

                        <div onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, sticker.id, 'rotate'); }}
                          onTouchStart={(e) => { e.stopPropagation(); handleMouseDown(e, sticker.id, 'rotate'); }}
                          className="absolute left-1/2 -top-5 -translate-x-1/2 w-3 h-3 bg-emerald-400 rounded-full border border-zinc-800 cursor-grab"
                          style={{ zIndex: 120 }} />

                        <button onClick={(e) => { e.stopPropagation(); deleteSticker(sticker.id); }}
                          className="absolute -top-3 -right-3 w-6 h-6 rounded flex items-center justify-center bg-red-500 text-white shadow"
                          style={{ zIndex: 130 }} title="Delete sticker">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </>
                    )}
                  </div>
                );
              })}

              {stickers.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <Layers className="w-12 h-12 sm:w-14 sm:h-14 text-zinc-500/50 mx-auto mb-3" />
                    <div className="text-xs sm:text-sm text-zinc-400">Drop stickers here or add from assets</div>
                  </div>
                </div>
              )}
            </div>

            <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 bg-black/40 backdrop-blur-md rounded px-2 sm:px-3 py-1 text-[10px] sm:text-xs text-zinc-300 border border-white/10">
              <div className="hidden sm:block">{Math.round(displayDimensions.width / zoom)} × {Math.round(displayDimensions.height / zoom)} px</div>
              <div className="text-[10px] sm:text-xs">{stickers.length} object{stickers.length !== 1 ? 's' : ''}</div>
            </div>
          </main>

          {/* Right Panel */}
          {rightPanelOpen && (
            <aside className={`z-40 ${isMobile ? 'fixed right-0 top-12 sm:top-14 bottom-0 w-72 sm:w-80' : 'w-64 lg:w-80'} bg-black/40 backdrop-blur-xl border-l border-white/10 shadow-2xl flex flex-col`}>
              <div className="flex items-center justify-between px-3 h-10 sm:h-12 border-b border-white/10">
                <div className="text-xs font-medium text-zinc-200 tracking-wide">Properties</div>
                <button onClick={() => setRightPanelOpen(false)} className="p-2 text-zinc-300 hover:bg-white/10 rounded">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 overflow-auto flex-1 space-y-4">
                {selectedStickerData ? (
                  <div className="space-y-3">
                    <div className="text-xs text-zinc-300">Transform</div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] text-zinc-400">X (%)</label>
                        <input type="number" value={Math.round(selectedStickerData.x)}
                          onChange={(e) => updateSticker(selectedSticker, { x: parseFloat(e.target.value) || 0 })}
                          className="w-full mt-1 px-2 py-1 bg-white/5 backdrop-blur-sm border border-white/20 rounded text-xs text-zinc-200 focus:outline-none focus:border-cyan-400" />
                      </div>
                      <div>
                        <label className="text-[11px] text-zinc-400">Y (%)</label>
                        <input type="number" value={Math.round(selectedStickerData.y)}
                          onChange={(e) => updateSticker(selectedSticker, { y: parseFloat(e.target.value) || 0 })}
                          className="w-full mt-1 px-2 py-1 bg-white/5 backdrop-blur-sm border border-white/20 rounded text-xs text-zinc-200 focus:outline-none focus:border-cyan-400" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] text-zinc-400">W (px)</label>
                        <input type="number" value={Math.round(selectedStickerData.width)}
                          onChange={(e) => updateSticker(selectedSticker, { width: parseFloat(e.target.value) || 0 })}
                          className="w-full mt-1 px-2 py-1 bg-white/5 backdrop-blur-sm border border-white/20 rounded text-xs text-zinc-200 focus:outline-none focus:border-cyan-400" />
                      </div>
                      <div>
                        <label className="text-[11px] text-zinc-400">H (px)</label>
                        <input type="number" value={Math.round(selectedStickerData.height)}
                          onChange={(e) => updateSticker(selectedSticker, { height: parseFloat(e.target.value) || 0 })}
                          className="w-full mt-1 px-2 py-1 bg-white/5 backdrop-blur-sm border border-white/20 rounded text-xs text-zinc-200 focus:outline-none focus:border-cyan-400" />
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
                      className="w-full mt-2 px-3 py-2 bg-red-600/80 backdrop-blur-sm hover:bg-red-500 text-white rounded text-sm flex items-center justify-center gap-2 border border-red-500/30">
                      <Trash2 className="w-4 h-4" /> Delete Layer
                    </button>
                  </div>
                ) : (
                  <div className="text-xs text-zinc-400">Select a sticker to edit properties</div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-medium text-zinc-200">Assets</div>
                    <button onClick={() => fileInputRef.current?.click()} className="p-1.5 bg-cyan-600/80 backdrop-blur-sm rounded text-white hover:bg-cyan-500 border border-cyan-400/30">
                      <Upload className="w-4 h-4" />
                    </button>
                  </div>

                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />

                  <div className="grid gap-2 grid-cols-3">
                    {stickerLibrary.map((s, i) => (
                      <button key={i} onClick={() => addSticker(s)}
                        className="aspect-square bg-white/5 backdrop-blur-sm rounded border border-white/20 p-2 hover:border-cyan-400 transition">
                        <img src={s.url} alt={s.name} className="w-full h-full object-contain" />
                      </button>
                    ))}
                  </div>

                  <button onClick={() => fileInputRef.current?.click()} className="w-full mt-3 px-3 py-2 border border-dashed border-white/20 rounded text-xs text-zinc-300 hover:border-white/40 hover:bg-white/5 transition">
                    <div className="flex items-center justify-center gap-2"><Upload className="w-4 h-4" /> Upload Custom Asset</div>
                  </button>
                </div>
              </div>
            </aside>
          )}
        </div>

        {/* Mobile Bottom Toolbar */}
        <div className="md:hidden absolute bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 sm:gap-3">
          <button onClick={() => setLeftPanelOpen(true)} className="p-2.5 sm:p-3 rounded-full bg-black/60 backdrop-blur-md text-zinc-200 shadow-lg border border-white/20">
            <Layers className="w-4 h-4" />
          </button>
          <button onClick={() => setRightPanelOpen(true)} className="p-2.5 sm:p-3 rounded-full bg-black/60 backdrop-blur-md text-zinc-200 shadow-lg border border-white/20">
            <Settings className="w-4 h-4" />
          </button>
          <button onClick={() => setShowGrid(!showGrid)} className={`p-2.5 sm:p-3 rounded-full ${showGrid ? 'bg-cyan-600/80' : 'bg-black/60'} backdrop-blur-md text-white shadow-lg border ${showGrid ? 'border-cyan-400/30' : 'border-white/20'}`}>
            <Grid3x3 className="w-4 h-4" />
          </button>
          {onApply && (
            <button onClick={() => onApply?.()} className="p-2.5 sm:p-3 rounded-full bg-cyan-600/80 backdrop-blur-md text-white shadow-lg border border-cyan-400/30">
              <Settings className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Editor;