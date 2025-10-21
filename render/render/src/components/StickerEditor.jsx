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
  isApplying,
  uvMapImage = '/uvhoodie.png' // UV map image path
}) => {
  const [draggedSticker, setDraggedSticker] = useState(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isResizing, setIsResizing] = useState(false)
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const [uvMapLoaded, setUvMapLoaded] = useState(false)
  const [uvMapDimensions, setUvMapDimensions] = useState({ width: 800, height: 1000 })
  const canvasRef = useRef()

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

  // Load UV map and get its dimensions
  useEffect(() => {
    const img = new Image()
    img.src = uvMapImage
    img.onload = () => {
      setUvMapDimensions({ width: img.width, height: img.height })
      setUvMapLoaded(true)
    }
    img.onerror = () => {
      console.error('Failed to load UV map image')
      setUvMapLoaded(true) // Still allow editor to work
    }
  }, [uvMapImage])

  // Calculate display dimensions maintaining aspect ratio
  const getDisplayDimensions = () => {
    const maxWidth = isMobile ? Math.min(380, windowSize.width - 40) : 500
    const maxHeight = isMobile ? Math.min(500, windowSize.height * 0.5) : 700
    
    const aspectRatio = uvMapDimensions.width / uvMapDimensions.height
    
    let displayWidth = maxWidth
    let displayHeight = displayWidth / aspectRatio
    
    if (displayHeight > maxHeight) {
      displayHeight = maxHeight
      displayWidth = displayHeight * aspectRatio
    }
    
    return { width: displayWidth, height: displayHeight }
  }

  const displayDimensions = getDisplayDimensions()

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
    overflow: isMobile ? 'auto' : 'hidden'
  }

  const canvasStyle = {
    flex: isMobile ? '0 0 auto' : 1,
    minHeight: isMobile ? 'auto' : '100vh',
    height: isMobile ? 'auto' : '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%)',
    padding: isMobile ? '20px 10px' : '20px',
    overflowY: isMobile ? 'visible' : 'auto'
  }

  const uvMapContainerStyle = {
    width: `${displayDimensions.width}px`,
    height: `${displayDimensions.height}px`,
    position: 'relative',
    background: '#ffffff',
    borderRadius: '15px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
    margin: isMobile ? '0 auto' : '0',
    overflow: 'hidden'
  }

  // Mouse/touch handlers
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
    
    const stickerPixelX = (sticker.x / 100) * displayDimensions.width
    const stickerPixelY = (sticker.y / 100) * displayDimensions.height
    
    const resizeHandleX = stickerPixelX + sticker.width / 2 - 8
    const resizeHandleY = stickerPixelY + sticker.height / 2 - 8
    const distToResize = Math.sqrt(
      Math.pow(clickX - resizeHandleX, 2) + Math.pow(clickY - resizeHandleY, 2)
    )
    
    if (distToResize < 20 && selectedSticker === stickerId) {
      setIsResizing(true)
      setResizeStart({
        x: clientX,
        y: clientY,
        width: sticker.width,
        height: sticker.height
      })
      setDraggedSticker(stickerId)
    } else {
      setDraggedSticker(stickerId)
      setDragOffset({
        x: clickX - stickerPixelX,
        y: clickY - stickerPixelY
      })
    }
    
    onStickerSelect(stickerId)
  }, [stickers, onStickerSelect, selectedSticker, displayDimensions])

  const handleMouseMove = useCallback((e) => {
    if (!canvasRef.current || !draggedSticker) return

    const rect = canvasRef.current.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    const mouseX = clientX - rect.left
    const mouseY = clientY - rect.top

    if (isResizing) {
      const deltaX = clientX - resizeStart.x
      const deltaY = clientY - resizeStart.y
      const avgDelta = (deltaX + deltaY) / 2
      const scaleFactor = Math.max(0.3, 1 + avgDelta / 100)
      
      const newWidth = Math.max(30, Math.min(300, resizeStart.width * scaleFactor))
      const newHeight = Math.max(30, Math.min(300, resizeStart.height * scaleFactor))
      
      onStickerUpdate(draggedSticker, { width: newWidth, height: newHeight })
    } else {
      const newPixelX = mouseX - dragOffset.x
      const newPixelY = mouseY - dragOffset.y
      
      const newX = (newPixelX / displayDimensions.width) * 100
      const newY = (newPixelY / displayDimensions.height) * 100

      const margin = 2
      const constrainedX = Math.max(margin, Math.min(100 - margin, newX))
      const constrainedY = Math.max(margin, Math.min(100 - margin, newY))

      onStickerUpdate(draggedSticker, { x: constrainedX, y: constrainedY })
    }
  }, [draggedSticker, dragOffset, isResizing, resizeStart, onStickerUpdate, displayDimensions])

  const handleMouseUp = useCallback(() => {
    setDraggedSticker(null)
    setDragOffset({ x: 0, y: 0 })
    setIsResizing(false)
    setResizeStart({ x: 0, y: 0, width: 0, height: 0 })
  }, [])

  const handleTouchStart = (e, stickerId) => handleMouseDown(e, stickerId)
  const handleTouchMove = (e) => {
    e.preventDefault()
    handleMouseMove(e)
  }
  const handleTouchEnd = handleMouseUp

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
      <div style={canvasStyle} ref={canvasRef}>
        <div style={uvMapContainerStyle}>
          {/* UV Map Background */}
          {uvMapLoaded && (
            <img 
              src={uvMapImage}
              alt="UV Map"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                zIndex: 1,
                userSelect: 'none',
                pointerEvents: 'none'
              }}
              draggable={false}
            />
          )}
          
          {/* Loading state */}
          {!uvMapLoaded && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: '#666',
              fontSize: '16px',
              zIndex: 1
            }}>
              Loading UV Map...
            </div>
          )}
          
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
            zIndex: 100,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
          }}>
            {side} SIDE - UV MAP
          </div>

          {/* Stickers */}
          {stickers.map(sticker => {
            const stickerPixelX = (sticker.x / 100) * displayDimensions.width
            const stickerPixelY = (sticker.y / 100) * displayDimensions.height
            
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
                  border: selectedSticker === sticker.id ? '2px solid #007bff' : '1px solid rgba(255,255,255,0.5)',
                  borderRadius: '4px',
                  background: selectedSticker === sticker.id ? 'rgba(0, 123, 255, 0.1)' : 'transparent',
                  boxShadow: selectedSticker === sticker.id ? 
                    '0 4px 20px rgba(0, 123, 255, 0.4)' : 
                    '0 2px 10px rgba(0, 0, 0, 0.2)',
                  zIndex: selectedSticker === sticker.id ? 50 : 10,
                  transition: 'border 0.2s ease, box-shadow 0.2s ease',
                  touchAction: 'none'
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
                    filter: 'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.3))'
                  }}
                  draggable={false}
                />
                
                {/* Resize handle */}
                {selectedSticker === sticker.id && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '-10px',
                      right: '-10px',
                      width: isMobile ? '24px' : '20px',
                      height: isMobile ? '24px' : '20px',
                      background: '#007bff',
                      borderRadius: '50%',
                      cursor: 'se-resize',
                      border: '2px solid white',
                      boxShadow: '0 2px 8px rgba(0, 123, 255, 0.4)',
                      zIndex: 60,
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
                      top: '-10px',
                      right: '-10px',
                      width: isMobile ? '26px' : '22px',
                      height: isMobile ? '26px' : '22px',
                      background: '#dc3545',
                      color: 'white',
                      border: '2px solid white',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      fontSize: isMobile ? '14px' : '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(220, 53, 69, 0.4)',
                      zIndex: 60,
                      fontWeight: 'bold',
                      lineHeight: 1,
                      padding: 0
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
          {stickers.length === 0 && uvMapLoaded && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              color: '#666',
              fontSize: isMobile ? '14px' : '16px',
              zIndex: 5,
              pointerEvents: 'none',
              background: 'rgba(255, 255, 255, 0.9)',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ fontSize: isMobile ? '40px' : '48px', marginBottom: '10px' }}>🎨</div>
              <div style={{ fontWeight: 'bold' }}>Add Your Designs</div>
              <div style={{ fontSize: isMobile ? '12px' : '14px', marginTop: '8px', opacity: 0.8 }}>
                Stickers will appear on the UV map
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Side panel */}
      <div style={sidePanelStyle}>
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
            fontSize: isMobile ? '13px' : '15px', 
            color: '#666' 
          }}>
            Place stickers on the UV map
          </p>
        </div>

        <div style={{ 
          flex: 1,
          overflowY: 'auto',
          padding: isMobile ? '16px' : '20px'
        }}>
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
            <div style={{ fontSize: isMobile ? '13px' : '15px', color: '#666' }}>
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
            {isApplying ? 'Applying Design...' : 'Apply to Hoodie'}
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