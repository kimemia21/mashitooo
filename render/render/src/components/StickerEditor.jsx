import React, { useState, useRef, useCallback, useEffect } from 'react'

const StickerEditor = ({ 
  side, 
  stickers, 
  stickerLibrary, 
  selectedSticker, 
  onStickerSelect, 
  onStickerAdd, 
  onStickerUpdate, 
  onStickerDelete,
  onStickerUpload,
  onApply, 
  onCancel,
  isApplying 
}) => {
  const [draggedSticker, setDraggedSticker] = useState(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isResizing, setIsResizing] = useState(false)
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const canvasRef = useRef()
  const fabricCanvasRef = useRef()

  // Responsive state
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  })

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const isMobile = windowSize.width <= 768

  // FIXED: Mobile-first responsive container with proper scrolling
  const containerStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: '#f5f5f5',
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    zIndex: 1500,
    overflow: isMobile ? 'auto' : 'hidden' // KEY: Enable scrolling on mobile
  }

  // FIXED: T-shirt dimensions with proper aspect ratio
  const tshirtDimensions = {
    width: isMobile ? Math.min(320, windowSize.width - 20) : 400,
    height: isMobile ? Math.min(400, (windowSize.width - 20) * 1.25) : 500,
    // Standard t-shirt proportions
    neckWidth: 0.25,
    neckHeight: 0.08,
    shoulderWidth: 0.9,
    bodyWidth: 0.7,
    armholeSize: 0.15
  }

  // Create fabric texture with CORRECT orientation
 // Replace the fabric background creation useEffect with this:
useEffect(() => {
  const canvas = fabricCanvasRef.current;
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const img = new Image();
  img.src = "/tshirt_uv1.png"; 

  img.onload = () => {
    canvas.width = tshirtDimensions.width;
    canvas.height = tshirtDimensions.height;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  };
}, [tshirtDimensions]);


  // Create accurate T-shirt SVG shape
  const createTShirtSVG = () => {
    const w = tshirtDimensions.width
    const h = tshirtDimensions.height
    const nw = w * 0.25 // neck width
    const nh = h * 0.08 // neck height
    const bw = w * 0.7  // body width

    return (
      <svg 
        width={w} 
        height={h} 
        style={{ position: 'absolute', top: 0, left: 0, zIndex: 2 }}
        viewBox={`0 0 ${w} ${h}`}
      >
        <defs>
          <clipPath id="tshirt-clip">
            <path d={`
              M ${w/2 - nw/2} 0
              L ${w/2 + nw/2} 0
              L ${w/2 + nw/2} ${nh}
              L ${w/2 + bw/2} ${nh}
              L ${w/2 + bw/2} ${h}
              L ${w/2 - bw/2} ${h}
              L ${w/2 - bw/2} ${nh}
              L ${w/2 - nw/2} ${nh}
              Z
              M 0 ${h * 0.15}
              L ${w/2 - bw/2} ${h * 0.15}
              L ${w/2 - bw/2} ${h * 0.45}
              L 0 ${h * 0.4}
              Z
              M ${w} ${h * 0.15}
              L ${w/2 + bw/2} ${h * 0.15}
              L ${w/2 + bw/2} ${h * 0.45}
              L ${w} ${h * 0.4}
              Z
            `} />
          </clipPath>
        </defs>
        
        {/* T-shirt outline */}
        <path 
          d={`
            M ${w/2 - nw/2} 0
            L ${w/2 + nw/2} 0
            L ${w/2 + nw/2} ${nh}
            L ${w/2 + bw/2} ${nh}
            L ${w/2 + bw/2} ${h}
            L ${w/2 - bw/2} ${h}
            L ${w/2 - bw/2} ${nh}
            L ${w/2 - nw/2} ${nh}
            Z
            M 0 ${h * 0.15}
            L ${w/2 - bw/2} ${h * 0.15}
            L ${w/2 - bw/2} ${h * 0.45}
            L 0 ${h * 0.4}
            Z
            M ${w} ${h * 0.15}
            L ${w/2 + bw/2} ${h * 0.15}
            L ${w/2 + bw/2} ${h * 0.45}
            L ${w} ${h * 0.4}
            Z
          `}
          fill="none"
          stroke="#ddd"
          strokeWidth="2"
        />
        
        {/* Print safe area */}
        <rect
          x={w * 0.2}
          y={h * 0.2}
          width={w * 0.6}
          height={h * 0.6}
          fill="none"
          stroke="rgba(0, 123, 255, 0.3)"
          strokeWidth="1"
          strokeDasharray="3,3"
        />
      </svg>
    )
  }

  // FIXED: Enhanced mouse handlers with proper coordinate calculation
  const handleMouseDown = useCallback((e, stickerId) => {
    e.preventDefault()
    e.stopPropagation()
    
    const sticker = stickers.find(s => s.id === stickerId)
    if (!sticker) return

    const rect = canvasRef.current.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    const clickX = clientX - rect.left
    const clickY = clientY - rect.top
    
    // Calculate sticker position in pixels
    const stickerPixelX = (sticker.x / 100) * tshirtDimensions.width
    const stickerPixelY = (sticker.y / 100) * tshirtDimensions.height
    
    // Check if clicking resize handle (bottom-right corner)
    const resizeHandleX = stickerPixelX + sticker.width / 2 - 8
    const resizeHandleY = stickerPixelY + sticker.height / 2 - 8
    const distToResize = Math.sqrt(
      Math.pow(clickX - resizeHandleX, 2) + Math.pow(clickY - resizeHandleY, 2)
    )
    
    if (distToResize < 20 && selectedSticker === stickerId) {
      // Start resize
      setIsResizing(true)
      setResizeStart({
        x: clientX,
        y: clientY,
        width: sticker.width,
        height: sticker.height
      })
      setDraggedSticker(stickerId)
    } else {
      // Start drag
      setDraggedSticker(stickerId)
      setDragOffset({
        x: clickX - stickerPixelX,
        y: clickY - stickerPixelY
      })
    }
    
    onStickerSelect(stickerId)
  }, [stickers, onStickerSelect, selectedSticker, tshirtDimensions])

  // FIXED: Mouse move with proper coordinate handling
  const handleMouseMove = useCallback((e) => {
    if (!canvasRef.current || !draggedSticker) return

    const rect = canvasRef.current.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    const mouseX = clientX - rect.left
    const mouseY = clientY - rect.top

    if (isResizing) {
      // Handle resize with proper scaling
      const deltaX = clientX - resizeStart.x
      const deltaY = clientY - resizeStart.y
      const avgDelta = (deltaX + deltaY) / 2
      const scaleFactor = Math.max(0.3, 1 + avgDelta / 100)
      
      const newWidth = Math.max(20, Math.min(200, resizeStart.width * scaleFactor))
      const newHeight = Math.max(20, Math.min(200, resizeStart.height * scaleFactor))
      
      onStickerUpdate(draggedSticker, { width: newWidth, height: newHeight })
    } else {
      // Handle drag with CORRECT coordinate conversion
      const newPixelX = mouseX - dragOffset.x
      const newPixelY = mouseY - dragOffset.y
      
      // Convert to percentages - THIS IS THE KEY FIX
      const newX = (newPixelX / tshirtDimensions.width) * 100
      const newY = (newPixelY / tshirtDimensions.height) * 100

      // Keep within safe bounds
      const margin = 5
      const constrainedX = Math.max(margin, Math.min(100 - margin, newX))
      const constrainedY = Math.max(margin, Math.min(100 - margin, newY))

      onStickerUpdate(draggedSticker, { x: constrainedX, y: constrainedY })
    }
  }, [draggedSticker, dragOffset, isResizing, resizeStart, onStickerUpdate, tshirtDimensions])

  const handleMouseUp = useCallback(() => {
    setDraggedSticker(null)
    setDragOffset({ x: 0, y: 0 })
    setIsResizing(false)
    setResizeStart({ x: 0, y: 0, width: 0, height: 0 })
  }, [])

  // Add touch support
   const handleTouchStart = (e, stickerId) => handleMouseDown(e, stickerId)
  const handleTouchMove = useCallback((e) => {
    if (draggedSticker) {
      e.preventDefault()
    }
    handleMouseMove(e)
  }, [draggedSticker, handleMouseMove])
  const handleTouchEnd = handleMouseUp

  // Event listeners
  useEffect(() => {
    if (draggedSticker) {
      const options = { passive: false }
      document.addEventListener('mousemove', handleMouseMove, options)
      document.addEventListener('mouseup', handleMouseUp, options)
      document.addEventListener('touchmove', handleTouchMove, options)
      document.addEventListener('touchend', handleTouchEnd, options)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove, options)
        document.removeEventListener('mouseup', handleMouseUp, options)
        document.removeEventListener('touchmove', handleTouchMove, options)
        document.removeEventListener('touchend', handleTouchEnd, options)
      }
    }
  }, [draggedSticker, handleMouseMove, handleMouseUp])

  // File upload
  const handleFileUpload = (event) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        onStickerUpload(e.target.result, file.name)
      }
      reader.readAsDataURL(file)
    }
  }

  // FIXED: Mobile-responsive canvas style
  const canvasStyle = {
    flex: isMobile ? '0 0 auto' : 1,
    minHeight: isMobile ? 'auto' : '100vh',
    height: isMobile ? 'auto' : '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%)',
    padding: isMobile ? '20px 10px' : '20px',
    overflowY: isMobile ? 'visible' : 'hidden'
  }

  // T-shirt container
  const tshirtContainerStyle = {
    width: `${tshirtDimensions.width}px`,
    height: `${tshirtDimensions.height}px`,
    position: 'relative',
    background: 'transparent',
    borderRadius: '15px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    margin: isMobile ? '0 auto' : '0'
  }

  // FIXED: Mobile-responsive side panel
  const sidePanelStyle = {
    width: isMobile ? '100%' : '320px',
    minHeight: isMobile ? '50vh' : '100vh',
    maxHeight: isMobile ? 'none' : '100vh',
    background: 'white',
    borderLeft: isMobile ? 'none' : '1px solid #ddd',
    borderTop: isMobile ? '1px solid #ddd' : 'none',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  }

  return (
    <div style={containerStyle}>
      {/* Main Canvas Area */}
      <div style={canvasStyle} ref={canvasRef}>
        <div style={tshirtContainerStyle}>
          {/* Fabric background */}
       <img 
  src="/models/tshirt_uv.png"  
  alt="T-shirt"
  style={{
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    zIndex: 1,
    borderRadius: '15px'
  }}
/>

          
          {/* T-shirt shape */}
          {/* {createTShirtSVG()} */}
          
          {/* Side label */}
          <div style={{
            position: 'absolute',
            top: '15px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0, 0, 0, 0.85)',
            color: 'white',
            padding: isMobile ? '6px 12px' : '8px 16px',
            borderRadius: '20px',
            fontSize: isMobile ? '12px' : '14px',
            fontWeight: 'bold',
            zIndex: 10,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
          }}>
            {side} SIDE
          </div>

          {/* FIXED: Render stickers with CORRECT positioning */}
          {stickers.map(sticker => {
            // Calculate exact pixel position from percentage
            const stickerPixelX = (sticker.x / 100) * tshirtDimensions.width
            const stickerPixelY = (sticker.y / 100) * tshirtDimensions.height
            
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
                  border: selectedSticker === sticker.id ? '3px solid #007bff' : '1px solid rgba(255,255,255,0.8)',
                  borderRadius: '8px',
                  background: selectedSticker === sticker.id ? 'rgba(0, 123, 255, 0.1)' : 'transparent',
                  boxShadow: selectedSticker === sticker.id ? 
                    '0 8px 25px rgba(0, 123, 255, 0.4)' : 
                    '0 4px 15px rgba(0, 0, 0, 0.2)',
                  zIndex: selectedSticker === sticker.id ? 25 : 20,
                  transition: 'all 0.2s ease',
                  touchAction: 'none' // Prevent default touch behaviors
                }}
                onMouseDown={(e) => handleMouseDown(e, sticker.id)}
                onTouchStart={(e) => handleTouchStart(e, sticker.id)}
              >
                <img
                  src={sticker.url}
                  alt={sticker.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    pointerEvents: 'none',
                    userSelect: 'none',
                    filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3))',
                    borderRadius: '4px'
                  }}
                  draggable={false}
                />
                
                {/* FIXED: Enhanced resize handle */}
                {selectedSticker === sticker.id && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '-12px',
                      right: '-12px',
                      width: isMobile ? '24px' : '20px',
                      height: isMobile ? '24px' : '20px',
                      background: '#007bff',
                      borderRadius: '50%',
                      cursor: 'se-resize',
                      border: '3px solid white',
                      boxShadow: '0 4px 12px rgba(0, 123, 255, 0.4)',
                      zIndex: 30,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '10px',
                      fontWeight: 'bold'
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation()
                      handleMouseDown(e, sticker.id)
                    }}
                    onTouchStart={(e) => {
                      e.stopPropagation()
                      handleTouchStart(e, sticker.id)
                    }}
                  >
                    ⌟
                  </div>
                )}
                
                {/* Delete button */}
                {selectedSticker === sticker.id && (
                  <button
                    style={{
                      position: 'absolute',
                      top: '-12px',
                      right: '-12px',
                      width: isMobile ? '28px' : '24px',
                      height: isMobile ? '28px' : '24px',
                      background: '#dc3545',
                      color: 'white',
                      border: '3px solid white',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      fontSize: isMobile ? '16px' : '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(220, 53, 69, 0.4)',
                      zIndex: 30,
                      fontWeight: 'bold',
                      lineHeight: 1
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      onStickerDelete(sticker.id)
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            )
          })}

          {/* Empty state */}
          {stickers.length === 0 && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              color: '#888',
              fontSize: isMobile ? '14px' : '16px',
              zIndex: 10,
              pointerEvents: 'none'
            }}>
              <div style={{ fontSize: isMobile ? '40px' : '48px', marginBottom: '10px', opacity: 0.6 }}>🎨</div>
              <div style={{ fontWeight: 'bold' }}>Design Your T-Shirt</div>
              <div style={{ fontSize: isMobile ? '12px' : '14px', marginTop: '8px', opacity: 0.8 }}>
                Add designs from {isMobile ? 'below' : 'the side panel'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FIXED: Mobile-responsive side panel */}
      <div style={sidePanelStyle}>
        {/* Header */}
        <div style={{
          padding: isMobile ? '20px 16px 16px' : '24px 20px 20px',
          borderBottom: '1px solid #ddd',
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          flexShrink: 0
        }}>
          <h2 style={{ 
            margin: 0, 
            fontSize: isMobile ? '18px' : '20px', 
            fontWeight: 'bold', 
            color: '#333' 
          }}>
            Customize {side} Side
          </h2>
          <p style={{ 
            margin: '8px 0 0 0', 
            fontSize: isMobile ? '14px' : '16px', 
            color: '#666' 
          }}>
            Position exactly where you want them
          </p>
        </div>

        {/* Content with proper scrolling */}
        <div style={{ 
          flex: 1,
          overflowY: 'auto',
          padding: isMobile ? '16px' : '20px'
        }}>
          {/* Upload area */}
          <div style={{
            border: '3px dashed #007bff',
            borderRadius: '16px',
            padding: isMobile ? '20px 16px' : '24px 20px',
            textAlign: 'center',
            marginBottom: isMobile ? '20px' : '24px',
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #f8f9ff 0%, #fff 100%)',
            transition: 'all 0.3s ease'
          }} 
          onClick={() => document.getElementById('sticker-upload').click()}>
            <div style={{ fontSize: isMobile ? '32px' : '36px', marginBottom: '12px' }}>📎</div>
            <div style={{ fontSize: isMobile ? '16px' : '18px', color: '#007bff', fontWeight: 'bold', marginBottom: '8px' }}>
              Upload Your Design
            </div>
            <div style={{ fontSize: isMobile ? '14px' : '16px', color: '#666' }}>
              PNG, JPG, SVG supported
            </div>
            <input
              id="sticker-upload"
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </div>

          {/* Library grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(3, 1fr)',
            gap: isMobile ? '12px' : '16px'
          }}>
            {stickerLibrary.map((sticker, index) => (
              <div
                key={index}
                style={{
                  aspectRatio: '1',
                  border: '2px solid #e0e0e0',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  background: 'white',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
                onClick={() => onStickerAdd(sticker)}
              >
                <img
                  src={sticker.url}
                  alt={sticker.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    padding: isMobile ? '8px' : '12px'
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{
          padding: isMobile ? '16px' : '20px',
          borderTop: '1px solid #ddd',
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          flexShrink: 0
        }}>
          <button
            onClick={onApply}
            disabled={isApplying}
            style={{
              width: '100%',
              background: isApplying ? '#ccc' : 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
              color: 'white',
              border: 'none',
              padding: isMobile ? '16px' : '18px',
              borderRadius: '12px',
              fontSize: isMobile ? '16px' : '18px',
              fontWeight: 'bold',
              cursor: isApplying ? 'not-allowed' : 'pointer',
              marginBottom: '12px',
              boxShadow: isApplying ? 'none' : '0 6px 20px rgba(40, 167, 69, 0.3)',
              transition: 'all 0.3s ease'
            }}
          >
            {isApplying ? 'Applying Design...' : 'Apply to T-Shirt'}
          </button>
          
          <button
            onClick={onCancel}
            disabled={isApplying}
            style={{
              width: '100%',
              background: 'transparent',
              color: '#666',
              border: '2px solid #ddd',
              padding: isMobile ? '14px' : '16px',
              borderRadius: '12px',
              fontSize: isMobile ? '14px' : '16px',
              cursor: isApplying ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default StickerEditor