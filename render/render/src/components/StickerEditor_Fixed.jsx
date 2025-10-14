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
  const [resizeData, setResizeData] = useState(null)
  const canvasRef = useRef()
  const fabricCanvasRef = useRef()

  // Window size state for responsiveness
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

  // Responsive container - mobile first approach
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
    overflow: 'hidden'
  }
  
  const tshirtDimensions = {
    width: isMobile ? Math.min(350, windowSize.width - 40) : 400,
    height: isMobile ? Math.min(437, windowSize.height * 0.6) : 500,
    // These ratios match typical t-shirt proportions
    neckWidth: 0.25,
    neckHeight: 0.08,
    shoulderWidth: 0.9,
    bodyWidth: 0.7,
    armholeSize: 0.15
  }

  // Create precise fabric texture
  useEffect(() => {
    const canvas = fabricCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    canvas.width = tshirtDimensions.width
    canvas.height = tshirtDimensions.height

    // Create realistic fabric base
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, '#fafafa')
    gradient.addColorStop(0.5, '#ffffff')
    gradient.addColorStop(1, '#f5f5f5')
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Add fine fabric texture
    ctx.fillStyle = 'rgba(0, 0, 0, 0.015)'
    for (let i = 0; i < canvas.width; i += 1) {
      for (let j = 0; j < canvas.height; j += 1) {
        if (Math.random() > 0.97) {
          ctx.fillRect(i, j, 1, 1)
        }
      }
    }

    // Add weave pattern
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.01)'
    ctx.lineWidth = 0.5
    for (let i = 0; i < canvas.width; i += 2) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, canvas.height)
      ctx.stroke()
    }
    for (let i = 0; i < canvas.height; i += 2) {
      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(canvas.width, i)
      ctx.stroke()
    }
  }, [tshirtDimensions])

  // Create SVG t-shirt shape that perfectly matches 3D model
  const createTShirtSVG = () => {
    const w = tshirtDimensions.width
    const h = tshirtDimensions.height
    const nw = w * tshirtDimensions.neckWidth
    const nh = h * tshirtDimensions.neckHeight
    const sw = w * tshirtDimensions.shoulderWidth
    const bw = w * tshirtDimensions.bodyWidth
    const ah = h * tshirtDimensions.armholeSize

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
              M 0 ${ah}
              L ${w/2 - bw/2} ${ah}
              L ${w/2 - bw/2} ${ah + h * 0.3}
              L 0 ${ah + h * 0.25}
              Z
              M ${w} ${ah}
              L ${w/2 + bw/2} ${ah}
              L ${w/2 + bw/2} ${ah + h * 0.3}
              L ${w} ${ah + h * 0.25}
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
            M 0 ${ah}
            L ${w/2 - bw/2} ${ah}
            L ${w/2 - bw/2} ${ah + h * 0.3}
            L 0 ${ah + h * 0.25}
            Z
            M ${w} ${ah}
            L ${w/2 + bw/2} ${ah}
            L ${w/2 + bw/2} ${ah + h * 0.3}
            L ${w} ${ah + h * 0.25}
            Z
          `}
          fill="none"
          stroke="#ddd"
          strokeWidth="2"
        />
        
        {/* Print area guidelines */}
        <rect
          x={w * 0.15}
          y={h * 0.15}
          width={w * 0.7}
          height={h * 0.7}
          fill="none"
          stroke="rgba(0, 123, 255, 0.3)"
          strokeWidth="1"
          strokeDasharray="5,5"
        />
      </svg>
    )
  }

  // Enhanced mouse handlers with precise coordinate tracking
  const handleMouseDown = useCallback((e, stickerId) => {
    e.preventDefault()
    const sticker = stickers.find(s => s.id === stickerId)
    if (!sticker) return

    const rect = canvasRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const clickY = e.clientY - rect.top
    
    // Check if clicking on resize handle
    const stickerCenterX = (sticker.x / 100) * tshirtDimensions.width
    const stickerCenterY = (sticker.y / 100) * tshirtDimensions.height
    const resizeHandleX = stickerCenterX + sticker.width / 2
    const resizeHandleY = stickerCenterY + sticker.height / 2
    
    const distToResize = Math.sqrt(
      Math.pow(clickX - resizeHandleX, 2) + Math.pow(clickY - resizeHandleY, 2)
    )
    
    if (distToResize < 15 && selectedSticker === stickerId) {
      // Start resize
      setResizeData({
        stickerId,
        startX: clickX,
        startY: clickY,
        startWidth: sticker.width,
        startHeight: sticker.height
      })
    } else {
      // Start drag
      setDraggedSticker(stickerId)
      setDragOffset({
        x: clickX - stickerCenterX,
        y: clickY - stickerCenterY
      })
    }
    
    onStickerSelect(stickerId)
  }, [stickers, onStickerSelect, selectedSticker, tshirtDimensions])

  const handleMouseMove = useCallback((e) => {
    if (!canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    if (resizeData) {
      // Handle resize
      const deltaX = mouseX - resizeData.startX
      const deltaY = mouseY - resizeData.startY
      const scaleFactor = Math.max(0.5, 1 + (deltaX + deltaY) / 200)
      
      const newWidth = Math.max(30, Math.min(300, resizeData.startWidth * scaleFactor))
      const newHeight = Math.max(30, Math.min(300, resizeData.startHeight * scaleFactor))
      
      onStickerUpdate(resizeData.stickerId, { width: newWidth, height: newHeight })
      
    } else if (draggedSticker) {
      // Handle drag - convert pixel coordinates to percentages
      const newX = ((mouseX - dragOffset.x) / tshirtDimensions.width) * 100
      const newY = ((mouseY - dragOffset.y) / tshirtDimensions.height) * 100

      // Keep within bounds with margins
      const margin = 5
      const constrainedX = Math.max(margin, Math.min(100 - margin, newX))
      const constrainedY = Math.max(margin, Math.min(100 - margin, newY))

      onStickerUpdate(draggedSticker, { x: constrainedX, y: constrainedY })
    }
  }, [draggedSticker, dragOffset, resizeData, onStickerUpdate, tshirtDimensions])

  const handleMouseUp = useCallback(() => {
    setDraggedSticker(null)
    setDragOffset({ x: 0, y: 0 })
    setResizeData(null)
  }, [])

  // Add event listeners
  useEffect(() => {
    if (draggedSticker || resizeData) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [draggedSticker, resizeData, handleMouseMove, handleMouseUp])

  // File upload handler
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

  // Main canvas style - responsive
  const canvasStyle = {
    flex: isMobile ? 'none' : 1,
    height: isMobile ? '60vh' : 'auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%)',
    margin: isMobile ? '10px' : '20px',
    borderRadius: '10px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    position: 'relative',
    overflow: 'hidden'
  }

  // T-shirt container with exact dimensions
  const tshirtContainerStyle = {
    width: `${tshirtDimensions.width}px`,
    height: `${tshirtDimensions.height}px`,
    position: 'relative',
    background: 'transparent',
    borderRadius: '10px',
    overflow: 'visible'
  }

  // Side panel - responsive
  const sidePanelStyle = {
    width: isMobile ? '100vw' : '300px',
    height: isMobile ? '40vh' : 'auto',
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
          <canvas 
            ref={fabricCanvasRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 1,
              clipPath: 'url(#tshirt-clip)'
            }}
          />
          
          {/* T-shirt shape overlay */}
          {createTShirtSVG()}
          
          {/* Side label */}
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: isMobile ? '10px' : '12px',
            fontWeight: 'bold',
            zIndex: 10
          }}>
            {side} SIDE
          </div>

          {/* Stickers with perfect positioning */}
          {stickers.map(sticker => {
            const stickerX = (sticker.x / 100) * tshirtDimensions.width
            const stickerY = (sticker.y / 100) * tshirtDimensions.height
            
            return (
              <div
                key={sticker.id}
                style={{
                  position: 'absolute',
                  left: `${stickerX}px`,
                  top: `${stickerY}px`,
                  width: `${sticker.width}px`,
                  height: `${sticker.height}px`,
                  transform: `translate(-50%, -50%) rotate(${sticker.rotation || 0}deg)`,
                  cursor: 'move',
                  border: selectedSticker === sticker.id ? '2px solid #007bff' : '1px solid rgba(255,255,255,0.8)',
                  borderRadius: '4px',
                  background: selectedSticker === sticker.id ? 'rgba(0, 123, 255, 0.1)' : 'transparent',
                  boxShadow: selectedSticker === sticker.id ? 
                    '0 4px 12px rgba(0, 123, 255, 0.3)' : 
                    '0 2px 8px rgba(0, 0, 0, 0.2)',
                  zIndex: selectedSticker === sticker.id ? 20 : 15,
                  transition: 'all 0.2s ease'
                }}
                onMouseDown={(e) => handleMouseDown(e, sticker.id)}
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
                    filter: 'drop-shadow(0 1px 3px rgba(0, 0, 0, 0.3))'
                  }}
                  draggable={false}
                />
                
                {/* Resize handle */}
                {selectedSticker === sticker.id && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '-8px',
                      right: '-8px',
                      width: '16px',
                      height: '16px',
                      background: '#007bff',
                      borderRadius: '50%',
                      cursor: 'se-resize',
                      border: '2px solid white',
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
                      zIndex: 25
                    }}
                  />
                )}
                
                {/* Delete button */}
                {selectedSticker === sticker.id && (
                  <button
                    style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-8px',
                      width: '20px',
                      height: '20px',
                      background: '#dc3545',
                      color: 'white',
                      border: '2px solid white',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
                      zIndex: 25
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
              <div style={{ fontSize: isMobile ? '32px' : '48px', marginBottom: '8px', opacity: 0.6 }}>🎨</div>
              <div style={{ fontWeight: 'bold' }}>Design Your T-Shirt</div>
              <div style={{ fontSize: isMobile ? '12px' : '14px', marginTop: '4px', opacity: 0.8 }}>
                Add designs from the {isMobile ? 'panel below' : 'side panel'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Side Panel - Responsive */}
      <div style={sidePanelStyle}>
        {/* Header */}
        <div style={{
          padding: isMobile ? '15px' : '20px',
          borderBottom: '1px solid #ddd',
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
        }}>
          <h2 style={{ 
            margin: 0, 
            fontSize: isMobile ? '16px' : '18px', 
            fontWeight: 'bold', 
            color: '#333' 
          }}>
            Customize {side} Side
          </h2>
          <p style={{ 
            margin: '5px 0 0 0', 
            fontSize: isMobile ? '12px' : '14px', 
            color: '#666' 
          }}>
            Position your designs exactly where you want them
          </p>
        </div>

        {/* Content */}
        <div style={{ 
          padding: isMobile ? '15px' : '20px', 
          flex: 1, 
          overflowY: 'auto' 
        }}>
          {/* Upload Area */}
          <div style={{
            border: '2px dashed #007bff',
            borderRadius: '12px',
            padding: isMobile ? '15px' : '20px',
            textAlign: 'center',
            marginBottom: isMobile ? '15px' : '20px',
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #f8f9ff 0%, #fff 100%)',
            transition: 'all 0.3s ease'
          }} 
          onClick={() => document.getElementById('sticker-upload').click()}>
            <div style={{ fontSize: isMobile ? '20px' : '28px', marginBottom: '8px' }}>📎</div>
            <div style={{ fontSize: isMobile ? '12px' : '14px', color: '#007bff', fontWeight: 'bold' }}>
              Upload Your Design
            </div>
            <div style={{ fontSize: isMobile ? '10px' : '12px', color: '#666', marginTop: '4px' }}>
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

          {/* Sticker Library Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)',
            gap: isMobile ? '8px' : '12px'
          }}>
            {stickerLibrary.map((sticker, index) => (
              <div
                key={index}
                style={{
                  aspectRatio: '1',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  background: 'white',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
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
                    padding: isMobile ? '4px' : '8px'
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          padding: isMobile ? '15px' : '20px',
          borderTop: '1px solid #ddd',
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
        }}>
          <button
            onClick={onApply}
            disabled={isApplying}
            style={{
              width: '100%',
              background: isApplying ? '#ccc' : 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
              color: 'white',
              border: 'none',
              padding: isMobile ? '12px' : '15px',
              borderRadius: '12px',
              fontSize: isMobile ? '14px' : '16px',
              fontWeight: 'bold',
              cursor: isApplying ? 'not-allowed' : 'pointer',
              marginBottom: '10px',
              boxShadow: isApplying ? 'none' : '0 4px 12px rgba(40, 167, 69, 0.3)',
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
              padding: isMobile ? '10px' : '12px',
              borderRadius: '12px',
              fontSize: isMobile ? '12px' : '14px',
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