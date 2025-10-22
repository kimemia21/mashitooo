import React, { useState, useRef, useCallback, useEffect } from 'react'
import { ZoomIn, ZoomOut, RotateCw, Trash2, Upload, Grid3x3, Layers, Move, Maximize2, ChevronLeft, ChevronRight, Download, Settings, Home, Hand, MousePointer2 } from 'lucide-react'
import './styles/StickerEditor.css'

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
  const [stickers, setStickers] = useState(initialStickers)
  const [selectedSticker, setSelectedSticker] = useState(externalSelected || null)
  const [draggedSticker, setDraggedSticker] = useState(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isResizing, setIsResizing] = useState(false)
  const [isRotating, setIsRotating] = useState(false)
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const [rotationStart, setRotationStart] = useState({ angle: 0, centerX: 0, centerY: 0 })
  const [zoom, setZoom] = useState(1)
  const [showGrid, setShowGrid] = useState(false)
  const [leftPanelOpen, setLeftPanelOpen] = useState(true)
  const [rightPanelOpen, setRightPanelOpen] = useState(true)
  const [tool, setTool] = useState('select')
  const [uvMapLoaded, setUvMapLoaded] = useState(false)
  const [uvMapDimensions, setUvMapDimensions] = useState({ width: 600, height: 800 })
  
  const canvasRef = useRef()
  const fileInputRef = useRef()

  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  })

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const isMobile = windowSize.width <= 768

  useEffect(() => {
    const img = new Image()
    img.src = uvMapImage
    img.onload = () => {
      setUvMapDimensions({ width: img.width, height: img.height })
      setUvMapLoaded(true)
    }
    img.onerror = () => {
      setUvMapLoaded(true)
    }
  }, [uvMapImage])

  const defaultLibrary = [
    { url: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="40" fill="%23667eea" stroke="%23764ba2" stroke-width="2"/%3E%3C/svg%3E', name: 'Circle' },
    { url: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect x="15" y="15" width="70" height="70" rx="8" fill="%23f093fb" stroke="%23f5576c" stroke-width="2"/%3E%3C/svg%3E', name: 'Square' },
    { url: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Cpolygon points="50,10 90,85 10,85" fill="%234facfe" stroke="%2300f2fe" stroke-width="2"/%3E%3C/svg%3E', name: 'Triangle' },
    { url: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Cpath d="M50 15 L61 45 L92 45 L67 63 L78 93 L50 75 L22 93 L33 63 L8 45 L39 45 Z" fill="%23fa709a" stroke="%23fee140" stroke-width="2"/%3E%3C/svg%3E', name: 'Star' },
    { url: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Cpath d="M50 10 L90 50 L50 90 L10 50 Z" fill="%2330cfd0" stroke="%23330867" stroke-width="2"/%3E%3C/svg%3E', name: 'Diamond' },
    { url: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Cpath d="M50 15 L65 40 L92 45 L71 65 L76 92 L50 78 L24 92 L29 65 L8 45 L35 40 Z" fill="%23a8edea" stroke="%23fed6e3" stroke-width="2"/%3E%3C/svg%3E', name: 'Badge' },
  ]

  const stickerLibrary = initialLibrary.length > 0 ? initialLibrary : defaultLibrary

  const addSticker = (stickerTemplate) => {
    const newSticker = {
      id: Date.now(),
      url: stickerTemplate.url,
      name: stickerTemplate.name,
      x: 50,
      y: 50,
      width: 80,
      height: 80,
      rotation: 0
    }
    const updated = [...stickers, newSticker]
    setStickers(updated)
    setSelectedSticker(newSticker.id)
    onStickerAdd?.(stickerTemplate)
  }

  const updateSticker = (id, updates) => {
    const updated = stickers.map(s => s.id === id ? { ...s, ...updates } : s)
    setStickers(updated)
    onStickerUpdate?.(id, updates)
  }

  const deleteSticker = (id) => {
    const updated = stickers.filter(s => s.id !== id)
    setStickers(updated)
    if (selectedSticker === id) setSelectedSticker(null)
    onStickerDelete?.(id)
  }

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const newSticker = {
          id: Date.now(),
          url: e.target.result,
          name: file.name,
          x: 50,
          y: 50,
          width: 100,
          height: 100,
          rotation: 0
        }
        const updated = [...stickers, newSticker]
        setStickers(updated)
        setSelectedSticker(newSticker.id)
        onStickerUpload?.(e.target.result, file.name)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleMouseDown = useCallback((e, stickerId, action = 'move') => {
    e.preventDefault()
    e.stopPropagation()
    
    const sticker = stickers.find(s => s.id === stickerId)
    if (!sticker) return

    const rect = canvasRef.current.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    const clickX = (clientX - rect.left) / zoom
    const clickY = (clientY - rect.top) / zoom
    
    const stickerPixelX = (sticker.x / 100) * uvMapDimensions.width
    const stickerPixelY = (sticker.y / 100) * uvMapDimensions.height

    setSelectedSticker(stickerId)
    onStickerSelect?.(stickerId)
    setDraggedSticker(stickerId)

    if (action === 'resize') {
      setIsResizing(true)
      setResizeStart({ x: clientX, y: clientY, width: sticker.width, height: sticker.height })
    } else if (action === 'rotate') {
      setIsRotating(true)
      setRotationStart({
        angle: sticker.rotation || 0,
        centerX: stickerPixelX,
        centerY: stickerPixelY,
        startX: clickX,
        startY: clickY
      })
    } else {
      setDragOffset({ x: clickX - stickerPixelX, y: clickY - stickerPixelY })
    }
  }, [stickers, zoom, uvMapDimensions, onStickerSelect])

  const handleMouseMove = useCallback((e) => {
    if (!canvasRef.current || !draggedSticker) return

    const rect = canvasRef.current.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    const mouseX = (clientX - rect.left) / zoom
    const mouseY = (clientY - rect.top) / zoom

    if (isResizing) {
      const deltaX = clientX - resizeStart.x
      const deltaY = clientY - resizeStart.y
      const avgDelta = (deltaX + deltaY) / 2
      const scaleFactor = Math.max(0.3, 1 + avgDelta / 100)
      
      const newWidth = Math.max(30, Math.min(300, resizeStart.width * scaleFactor))
      const newHeight = Math.max(30, Math.min(300, resizeStart.height * scaleFactor))
      
      updateSticker(draggedSticker, { width: newWidth, height: newHeight })
    } else if (isRotating) {
      const dx = mouseX - rotationStart.centerX
      const dy = mouseY - rotationStart.centerY
      const angle = Math.atan2(dy, dx) * (180 / Math.PI)
      updateSticker(draggedSticker, { rotation: angle + 90 })
    } else {
      const newPixelX = mouseX - dragOffset.x
      const newPixelY = mouseY - dragOffset.y
      
      const newX = (newPixelX / uvMapDimensions.width) * 100
      const newY = (newPixelY / uvMapDimensions.height) * 100

      const margin = 2
      const constrainedX = Math.max(margin, Math.min(100 - margin, newX))
      const constrainedY = Math.max(margin, Math.min(100 - margin, newY))

      updateSticker(draggedSticker, { x: constrainedX, y: constrainedY })
    }
  }, [draggedSticker, dragOffset, isResizing, isRotating, resizeStart, rotationStart, zoom, uvMapDimensions])

  const handleMouseUp = useCallback(() => {
    setDraggedSticker(null)
    setIsResizing(false)
    setIsRotating(false)
  }, [])

  useEffect(() => {
    if (draggedSticker) {
      const options = { passive: false }
      document.addEventListener('mousemove', handleMouseMove, options)
      document.addEventListener('mouseup', handleMouseUp, options)
      document.addEventListener('touchmove', handleMouseMove, options)
      document.addEventListener('touchend', handleMouseUp, options)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove, options)
        document.removeEventListener('mouseup', handleMouseUp, options)
        document.removeEventListener('touchmove', handleMouseMove, options)
        document.removeEventListener('touchend', handleMouseUp, options)
      }
    }
  }, [draggedSticker, handleMouseMove, handleMouseUp])

  const selectedStickerData = stickers.find(s => s.id === selectedSticker)

  const canvasContainerWidth = windowSize.width - (leftPanelOpen && !isMobile ? 280 : 60) - (rightPanelOpen && !isMobile ? 320 : 60)
  const canvasContainerHeight = windowSize.height - 56

  const getDisplayDimensions = () => {
    const maxWidth = Math.min(canvasContainerWidth * 0.9, 800)
    const maxHeight = Math.min(canvasContainerHeight * 0.9, 1000)
    
    const aspectRatio = uvMapDimensions.width / uvMapDimensions.height
    
    let displayWidth = maxWidth
    let displayHeight = displayWidth / aspectRatio
    
    if (displayHeight > maxHeight) {
      displayHeight = maxHeight
      displayWidth = displayHeight * aspectRatio
    }
    
    return { width: displayWidth * zoom, height: displayHeight * zoom }
  }

  const displayDimensions = getDisplayDimensions()

  return (
    <div className="main-container">
      
      {/* Top Toolbar */}
      <div className={`toolbar ${isMobile ? 'toolbar-mobile toolbar-landscape toolbar-compact' : 'toolbar-desktop'} toolbar-tablet`}>
        <div className="flex items-center gap-6 flex-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#569cd6] to-[#4ec9b0] rounded flex items-center justify-center">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-[15px] text-[#e0e0e0]">UV Editor</span>
          </div>
          
          <div className="h-6 w-px bg-[#3e3e42]" />
          
          <div className="flex items-center gap-1 bg-[#2d2d30] rounded-md p-1">
            <button
              onClick={() => setTool('select')}
              className={`p-1.5 rounded transition-colors ${tool === 'select' ? 'bg-[#37373d] text-[#569cd6]' : 'text-[#999] hover:text-[#ccc] hover:bg-[#37373d]'}`}
              title="Select Tool (V)"
            >
              <MousePointer2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTool('hand')}
              className={`p-1.5 rounded transition-colors ${tool === 'hand' ? 'bg-[#37373d] text-[#569cd6]' : 'text-[#999] hover:text-[#ccc] hover:bg-[#37373d]'}`}
              title="Hand Tool (H)"
            >
              <Hand className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-1.5 rounded transition-colors ${showGrid ? 'bg-[#37373d] text-[#569cd6]' : 'text-[#999] hover:text-[#ccc] hover:bg-[#2d2d30]'}`}
            title="Toggle Grid"
          >
            <Grid3x3 className="w-4 h-4" />
          </button>
          
          <div className="h-6 w-px bg-[#3e3e42]" />
          
          <div className="flex items-center gap-2 bg-[#2d2d30] rounded-md px-2 py-1">
            <button
              onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}
              className="p-1 text-[#999] hover:text-[#ccc] transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs text-[#999] min-w-[3rem] text-center font-mono">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom(Math.min(3, zoom + 0.25))}
              className="p-1 text-[#999] hover:text-[#ccc] transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {onApply && (
            <>
              <div className="h-6 w-px bg-[#3e3e42]" />
              <button
                onClick={onApply}
                disabled={isApplying}
                className="px-4 py-1.5 bg-[#0e639c] hover:bg-[#1177bb] disabled:bg-[#2d2d30] disabled:text-[#666] text-white text-sm font-medium rounded transition-colors"
              >
                {isApplying ? 'Applying...' : 'Apply'}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="content-area sticker-editor-container">
        {/* Mobile Overlay */}
        {isMobile && (leftPanelOpen || rightPanelOpen) && (
          <div 
            className="sidebar-mobile-overlay"
            onClick={() => {
              setLeftPanelOpen(false)
              setRightPanelOpen(false)
            }}
          />
        )}
        
        {/* Left Sidebar */}
        <div className={`sidebar sidebar-left ${
          leftPanelOpen 
            ? (isMobile ? 'sidebar-mobile sidebar-landscape' : 'sidebar-expanded sidebar-tablet sidebar-desktop') 
            : 'sidebar-collapsed'
        } motion-safe`}>
          <div className="sidebar-header">
            {leftPanelOpen && <span className="text-sm font-medium text-[#999]">TOOLS</span>}
            <button
              onClick={() => setLeftPanelOpen(!leftPanelOpen)}
              className="btn touch-button focus-ring motion-safe"
            >
              {leftPanelOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>

          {leftPanelOpen && (
            <div className="flex-1 overflow-y-auto p-3">
              <div className="space-y-1 mb-6">
                <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-[#ccc] hover:bg-[#2d2d30] rounded transition-colors">
                  <MousePointer2 className="w-4 h-4" />
                  <span>Select</span>
                  <span className="ml-auto text-xs text-[#666]">V</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-[#ccc] hover:bg-[#2d2d30] rounded transition-colors">
                  <Move className="w-4 h-4" />
                  <span>Move</span>
                  <span className="ml-auto text-xs text-[#666]">M</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-[#ccc] hover:bg-[#2d2d30] rounded transition-colors">
                  <Maximize2 className="w-4 h-4" />
                  <span>Scale</span>
                  <span className="ml-auto text-xs text-[#666]">S</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-[#ccc] hover:bg-[#2d2d30] rounded transition-colors">
                  <RotateCw className="w-4 h-4" />
                  <span>Rotate</span>
                  <span className="ml-auto text-xs text-[#666]">R</span>
                </button>
              </div>

              <div className="pt-3 border-t border-[#3e3e42]">
                <div className="text-xs font-medium text-[#999] mb-2 px-1">LAYERS ({stickers.length})</div>
                <div className="space-y-1">
                  {stickers.map((sticker, idx) => (
                    <button
                      key={sticker.id}
                      onClick={() => {
                        setSelectedSticker(sticker.id)
                        onStickerSelect?.(sticker.id)
                      }}
                      className={`w-full flex items-center gap-2 px-2 py-2 text-sm rounded transition-colors ${selectedSticker === sticker.id ? 'bg-[#37373d] text-[#569cd6]' : 'text-[#ccc] hover:bg-[#2d2d30]'}`}
                    >
                      <div className="w-6 h-6 rounded bg-[#2d2d30] flex items-center justify-center flex-shrink-0">
                        <img src={sticker.url} alt="" className="w-4 h-4 object-contain" />
                      </div>
                      <span className="truncate flex-1 text-left text-xs">{sticker.name || `Layer ${idx + 1}`}</span>
                    </button>
                  ))}
                  {stickers.length === 0 && (
                    <div className="text-xs text-[#666] px-2 py-4 text-center">No layers</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Canvas Area */}
        <div className="canvas-area canvas-container">
          <div
            ref={canvasRef}
            style={{
              width: displayDimensions.width,
              height: displayDimensions.height,
            }}
            className="canvas touch-action-none"
          >
            {/* Grid */}
            {showGrid && (
              <div
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                  backgroundImage: 'repeating-linear-gradient(0deg, #3e3e42 0px, #3e3e42 1px, transparent 1px, transparent 20px), repeating-linear-gradient(90deg, #3e3e42 0px, #3e3e42 1px, transparent 1px, transparent 20px)',
                  backgroundSize: '20px 20px'
                }}
              />
            )}

            {/* UV Map */}
            {uvMapLoaded && (
              <img 
                src={uvMapImage}
                alt="UV Map"
                className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none opacity-40"
                draggable={false}
              />
            )}

            {/* Canvas Center Indicator */}
            <div className="absolute top-1/2 left-1/2 w-px h-8 bg-[#569cd6] opacity-40 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 w-8 h-px bg-[#569cd6] opacity-40 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

            {/* Side Label */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#252526]/90 backdrop-blur-sm border border-[#3e3e42] rounded text-xs font-medium text-[#999]">
              {side} SIDE
            </div>

            {/* Stickers */}
            {stickers.map(sticker => {
              const stickerPixelX = (sticker.x / 100) * (displayDimensions.width / zoom)
              const stickerPixelY = (sticker.y / 100) * (displayDimensions.height / zoom)
              const isSelected = selectedSticker === sticker.id
              
              return (
                <div
                  key={sticker.id}
                  style={{
                    position: 'absolute',
                    left: `${stickerPixelX}px`,
                    top: `${stickerPixelY}px`,
                    width: `${sticker.width}px`,
                    height: `${sticker.height}px`,
                    transform: `translate(-50%, -50%) rotate(${sticker.rotation || 0}deg)`,
                    cursor: 'move',
                    zIndex: isSelected ? 50 : 10,
                    touchAction: 'none'
                  }}
                  onMouseDown={(e) => handleMouseDown(e, sticker.id)}
                  onTouchStart={(e) => handleMouseDown(e, sticker.id)}
                >
                  {isSelected && (
                    <>
                      <div className="absolute inset-0 border border-[#569cd6] rounded pointer-events-none" 
                        style={{ boxShadow: '0 0 0 1px rgba(86, 156, 214, 0.3)' }} 
                      />
                      <div className="absolute -inset-2 border border-[#569cd6]/30 rounded pointer-events-none" />
                    </>
                  )}

                  <img
                    src={sticker.url}
                    alt={sticker.name}
                    className="w-full h-full object-contain pointer-events-none select-none"
                    draggable={false}
                  />
                  
                  {isSelected && (
                    <>
                      {/* Corner Handles */}
                      <div className="absolute -top-1 -left-1 w-2 h-2 bg-[#569cd6] border border-[#252526] rounded-sm" />
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#569cd6] border border-[#252526] rounded-sm" />
                      <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-[#569cd6] border border-[#252526] rounded-sm" />
                      
                      {/* Resize Handle */}
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '-4px',
                          right: '-4px',
                          width: '8px',
                          height: '8px',
                          background: '#569cd6',
                          border: '1px solid #252526',
                          cursor: 'se-resize',
                          zIndex: 60
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation()
                          handleMouseDown(e, sticker.id, 'resize')
                        }}
                        onTouchStart={(e) => {
                          e.stopPropagation()
                          handleMouseDown(e, sticker.id, 'resize')
                        }}
                      />

                      {/* Rotate Handle */}
                      <div
                        style={{
                          position: 'absolute',
                          top: '-20px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: '8px',
                          height: '8px',
                          background: '#4ec9b0',
                          border: '1px solid #252526',
                          borderRadius: '50%',
                          cursor: 'grab',
                          zIndex: 60
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation()
                          handleMouseDown(e, sticker.id, 'rotate')
                        }}
                        onTouchStart={(e) => {
                          e.stopPropagation()
                          handleMouseDown(e, sticker.id, 'rotate')
                        }}
                      />
                      <div className="absolute top-0 left-1/2 w-px h-[-20px] bg-[#4ec9b0]/50 pointer-events-none" style={{ height: '20px', marginTop: '-20px' }} />

                      {/* Delete Button */}
                      <button
                        style={{
                          position: 'absolute',
                          top: '-4px',
                          right: '-4px',
                          width: '16px',
                          height: '16px',
                          background: '#f48771',
                          border: '1px solid #252526',
                          borderRadius: '2px',
                          cursor: 'pointer',
                          zIndex: 60,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteSticker(sticker.id)
                        }}
                      >
                        <Trash2 className="w-2.5 h-2.5 text-white" />
                      </button>
                    </>
                  )}
                </div>
              )
            })}

            {/* Empty State */}
            {stickers.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <Layers className="w-12 h-12 text-[#3e3e42] mx-auto mb-3" />
                  <div className="text-sm text-[#666]">Drop stickers here</div>
                </div>
              </div>
            )}
          </div>

          {/* Canvas Info Bar */}
          <div className={`canvas-info ${isMobile ? 'canvas-info-mobile' : ''}`}>
            <span className="hidden sm:inline">{Math.round(displayDimensions.width / zoom)} × {Math.round(displayDimensions.height / zoom)}px</span>
            <div className="w-px h-3 bg-[#3e3e42] hidden sm:block" />
            <span>{stickers.length} {isMobile ? '' : 'objects'}</span>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className={`sidebar sidebar-right ${
          rightPanelOpen 
            ? (isMobile ? 'sidebar-mobile sidebar-landscape' : 'sidebar-expanded sidebar-tablet sidebar-desktop') 
            : 'sidebar-collapsed'
        } motion-safe`}>
          <div className="sidebar-header">
            <button
              onClick={() => setRightPanelOpen(!rightPanelOpen)}
              className="btn touch-button focus-ring motion-safe"
            >
              {rightPanelOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
            {rightPanelOpen && <span className="text-sm font-medium text-[#999]">PROPERTIES</span>}
          </div>

          {rightPanelOpen && (
            <div className="sidebar-content smooth-scroll">
              {/* Properties Panel */}
              {selectedStickerData && (
                <div className={`p-4 border-b border-[#3e3e42] ${isMobile ? 'properties-compact' : ''}`}>
                  <div className="text-xs font-medium text-[#999] mb-3">TRANSFORM</div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-[#999] mb-1.5 block">Position</label>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="relative">
                          <input
                            type="number"
                            value={Math.round(selectedStickerData.x)}
                            onChange={(e) => updateSticker(selectedSticker, { x: parseFloat(e.target.value) || 0 })}
                            className="input-field touch-input focus-ring"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#666]">X</span>
                        </div>
                        <div className="relative">
                          <input
                            type="number"
                            value={Math.round(selectedStickerData.y)}
                            onChange={(e) => updateSticker(selectedSticker, { y: parseFloat(e.target.value) || 0 })}
                            className="input-field touch-input focus-ring"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#666]">Y</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-[#999] mb-1.5 block">Size</label>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="relative">
                          <input
                            type="number"
                            value={Math.round(selectedStickerData.width)}
                            onChange={(e) => updateSticker(selectedSticker, { width: parseFloat(e.target.value) || 0 })}
                            className="input-field touch-input focus-ring"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#666]">W</span>
                        </div>
                        <div className="relative">
                          <input
                            type="number"
                            value={Math.round(selectedStickerData.height)}
                            onChange={(e) => updateSticker(selectedSticker, { height: parseFloat(e.target.value) || 0 })}
                            className="input-field touch-input focus-ring"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#666]">H</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs text-[#999]">Rotation</label>
                        <span className="text-xs text-[#569cd6] font-mono">{Math.round(selectedStickerData.rotation || 0)}°</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={selectedStickerData.rotation || 0}
                        onChange={(e) => updateSticker(selectedSticker, { rotation: parseFloat(e.target.value) })}
                        className="w-full h-1 bg-[#3c3c3c] rounded-lg appearance-none cursor-pointer accent-[#569cd6]"
                      />
                    </div>

                    <button
                      onClick={() => deleteSticker(selectedSticker)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#3c3c3c] hover:bg-[#f48771] text-[#999] hover:text-white border border-[#3e3e42] hover:border-[#f48771] rounded transition-colors text-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete Layer
                    </button>
                  </div>
                </div>
              )}

              {/* Asset Library */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs font-medium text-[#999]">ASSETS</div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 bg-[#0e639c] hover:bg-[#1177bb] rounded text-white transition-colors"
                    title="Upload Asset"
                  >
                    <Upload className="w-3.5 h-3.5" />
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <div className={`asset-grid ${isMobile ? 'asset-grid-mobile' : 'asset-grid-desktop'} asset-grid-tablet`}>
                  {stickerLibrary.map((sticker, index) => (
                    <button
                      key={index}
                      onClick={() => addSticker(sticker)}
                      className="asset-item hover-effects touch-button focus-ring motion-safe"
                      title={sticker.name}
                    >
                      <img
                        src={sticker.url}
                        alt={sticker.name}
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform motion-safe"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#252526] to-transparent opacity-0 group-hover:opacity-100 transition-opacity motion-safe p-1.5">
                        <div className="text-[10px] text-[#ccc] truncate text-center">{sticker.name}</div>
                      </div>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full mt-3 flex items-center justify-center gap-2 px-3 py-2.5 bg-[#2d2d30] hover:bg-[#37373d] border-2 border-dashed border-[#3e3e42] hover:border-[#569cd6] rounded transition-all motion-safe text-xs text-[#999] hover:text-[#569cd6] touch-button hover-effects focus-ring"
                >
                  <Upload className="w-4 h-4" />
                  Upload Custom Asset
                </button>
              </div>

              {/* Quick Actions */}
              {onApply && (
                <div className="p-4 border-t border-[#3e3e42] space-y-2">
                  <button
                    onClick={onApply}
                    disabled={isApplying}
                    className="w-full px-4 py-2.5 bg-[#0e639c] hover:bg-[#1177bb] disabled:bg-[#3c3c3c] disabled:text-[#666] text-white text-sm font-medium rounded transition-colors"
                  >
                    {isApplying ? 'Applying to Model...' : 'Apply to Model'}
                  </button>
                  {onCancel && (
                    <button
                      onClick={onCancel}
                      disabled={isApplying}
                      className="w-full px-4 py-2.5 bg-transparent hover:bg-[#2d2d30] text-[#999] hover:text-[#ccc] border border-[#3e3e42] text-sm rounded transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StickerEditor