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
  const [isRotating, setIsRotating] = useState(false)
  const canvasRef = useRef()
  const fabricCanvasRef = useRef()

  const containerStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: '#f5f5f5',
    display: 'flex',
    zIndex: 1500
  }

  // Create fabric texture canvas
  useEffect(() => {
    const canvas = fabricCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    canvas.width = 400
    canvas.height = 500

    // Base fabric color
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, '#f8f8f8')
    gradient.addColorStop(0.5, '#ffffff')
    gradient.addColorStop(1, '#f0f0f0')
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Add fabric texture pattern
    ctx.fillStyle = 'rgba(0, 0, 0, 0.02)'
    for (let i = 0; i < canvas.width; i += 2) {
      for (let j = 0; j < canvas.height; j += 2) {
        if ((i + j) % 4 === 0) {
          ctx.fillRect(i, j, 1, 1)
        }
      }
    }

    // Add subtle weave pattern
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.015)'
    ctx.lineWidth = 0.5
    for (let i = 0; i < canvas.width; i += 3) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, canvas.height)
      ctx.stroke()
    }
    for (let i = 0; i < canvas.height; i += 3) {
      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(canvas.width, i)
      ctx.stroke()
    }

    // Add fabric shadow/depth
    const shadowGradient = ctx.createRadialGradient(
      canvas.width/2, canvas.height/2, 0,
      canvas.width/2, canvas.height/2, Math.max(canvas.width, canvas.height)/2
    )
    shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0)')
    shadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0.05)')
    
    ctx.fillStyle = shadowGradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [])

  // Enhanced T-shirt template with fabric appearance
  const tshirtTemplateStyle = {
    width: '400px',
    height: '500px',
    position: 'relative',
    borderRadius: '20px 20px 40px 40px',
    overflow: 'hidden',
    boxShadow: 'inset 0 2px 10px rgba(0, 0, 0, 0.1), 0 4px 20px rgba(0, 0, 0, 0.1)',
    border: '2px solid #e0e0e0'
  }

  // T-shirt template area with fabric background
  const canvasStyle = {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%)',
    margin: '20px',
    borderRadius: '10px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    position: 'relative',
    overflow: 'hidden'
  }

  // Side panel for tools
  const sidePanelStyle = {
    width: '300px',
    background: 'white',
    borderLeft: '1px solid #ddd',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  }

  // Enhanced mouse event handlers with better collision detection
  const handleMouseDown = useCallback((e, stickerId) => {
    e.preventDefault()
    const sticker = stickers.find(s => s.id === stickerId)
    if (!sticker) return

    const rect = canvasRef.current.getBoundingClientRect()
    const templateRect = canvasRef.current.querySelector('.tshirt-template').getBoundingClientRect()
    
    setDraggedSticker(stickerId)
    setDragOffset({
      x: e.clientX - (templateRect.left + (sticker.x / 100) * templateRect.width),
      y: e.clientY - (templateRect.top + (sticker.y / 100) * templateRect.height)
    })
    onStickerSelect(stickerId)
  }, [stickers, onStickerSelect])

  const handleMouseMove = useCallback((e) => {
    if (!draggedSticker || !canvasRef.current) return

    const templateRect = canvasRef.current.querySelector('.tshirt-template').getBoundingClientRect()
    const newX = ((e.clientX - dragOffset.x - templateRect.left) / templateRect.width) * 100
    const newY = ((e.clientY - dragOffset.y - templateRect.top) / templateRect.height) * 100

    // Enhanced bounds checking - keep stickers within printable area
    const margin = 10 // 10% margin from edges
    const constrainedX = Math.max(margin, Math.min(100 - margin, newX))
    const constrainedY = Math.max(margin + 5, Math.min(85, newY)) // Avoid collar area

    onStickerUpdate(draggedSticker, { x: constrainedX, y: constrainedY })
  }, [draggedSticker, dragOffset, onStickerUpdate])

  const handleMouseUp = useCallback(() => {
    setDraggedSticker(null)
    setDragOffset({ x: 0, y: 0 })
    setIsResizing(false)
    setIsRotating(false)
  }, [])

  // Handle resize functionality
  const handleResize = useCallback((e, stickerId) => {
    e.stopPropagation()
    setIsResizing(true)
    setDraggedSticker(stickerId)
    
    const handleResizeMove = (e) => {
      const sticker = stickers.find(s => s.id === stickerId)
      if (!sticker) return
      
      const templateRect = canvasRef.current.querySelector('.tshirt-template').getBoundingClientRect()
      const deltaX = e.movementX
      const deltaY = e.movementY
      
      const newWidth = Math.max(50, Math.min(200, sticker.width + deltaX))
      const newHeight = Math.max(50, Math.min(200, sticker.height + deltaY))
      
      onStickerUpdate(stickerId, { width: newWidth, height: newHeight })
    }
    
    const handleResizeEnd = () => {
      document.removeEventListener('mousemove', handleResizeMove)
      document.removeEventListener('mouseup', handleResizeEnd)
      setIsResizing(false)
      setDraggedSticker(null)
    }
    
    document.addEventListener('mousemove', handleResizeMove)
    document.addEventListener('mouseup', handleResizeEnd)
  }, [stickers, onStickerUpdate])

  // Handle rotation functionality
  const handleRotation = useCallback((e, stickerId) => {
    e.stopPropagation()
    setIsRotating(true)
    setDraggedSticker(stickerId)
    
    const sticker = stickers.find(s => s.id === stickerId)
    const templateRect = canvasRef.current.querySelector('.tshirt-template').getBoundingClientRect()
    const centerX = templateRect.left + (sticker.x / 100) * templateRect.width
    const centerY = templateRect.top + (sticker.y / 100) * templateRect.height
    
    const handleRotateMove = (e) => {
      const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180 / Math.PI
      onStickerUpdate(stickerId, { rotation: angle })
    }
    
    const handleRotateEnd = () => {
      document.removeEventListener('mousemove', handleRotateMove)
      document.removeEventListener('mouseup', handleRotateEnd)
      setIsRotating(false)
      setDraggedSticker(null)
    }
    
    document.addEventListener('mousemove', handleRotateMove)
    document.addEventListener('mouseup', handleRotateEnd)
  }, [stickers, onStickerUpdate])

  // Add event listeners
  React.useEffect(() => {
    if (draggedSticker && !isResizing && !isRotating) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [draggedSticker, isResizing, isRotating, handleMouseMove, handleMouseUp])

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

  return (
    <div style={containerStyle}>
      {/* Main Canvas Area */}
      <div style={canvasStyle} ref={canvasRef}>
        <div className="tshirt-template" style={tshirtTemplateStyle}>
          {/* Fabric background canvas */}
          <canvas 
            ref={fabricCanvasRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 1
            }}
          />
          
          {/* Template Label */}
          <div style={{
            position: 'absolute',
            top: '15px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '15px',
            fontSize: '12px',
            fontWeight: 'bold',
            zIndex: 10
          }}>
            {side} SIDE
          </div>

          {/* Enhanced Printable Area Guidelines */}
          <div style={{
            position: 'absolute',
            top: '60px',
            left: '40px',
            right: '40px',
            bottom: '60px',
            border: '2px dashed rgba(0, 123, 255, 0.6)',
            borderRadius: '15px',
            pointerEvents: 'none',
            zIndex: 5,
            background: 'rgba(0, 123, 255, 0.02)'
          }}>
            <div style={{
              position: 'absolute',
              top: '-20px',
              left: '0',
              fontSize: '11px',
              color: '#007bff',
              fontWeight: 'bold',
              background: 'white',
              padding: '2px 8px',
              borderRadius: '10px'
            }}>
              Safe Print Zone
            </div>
          </div>

          {/* Render Stickers with enhanced styling */}
          {stickers.map(sticker => (
            <div
              key={sticker.id}
              style={{
                position: 'absolute',
                left: `${sticker.x}%`,
                top: `${sticker.y}%`,
                width: `${sticker.width}px`,
                height: `${sticker.height}px`,
                transform: `translate(-50%, -50%) rotate(${sticker.rotation}deg)`,
                cursor: 'move',
                border: selectedSticker === sticker.id ? '2px solid #007bff' : '2px solid transparent',
                borderRadius: '6px',
                background: selectedSticker === sticker.id ? 'rgba(0, 123, 255, 0.1)' : 'transparent',
                boxShadow: selectedSticker === sticker.id ? '0 4px 12px rgba(0, 123, 255, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
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
                  filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))'
                }}
                draggable={false}
              />
              
              {/* Enhanced Selection Controls */}
              {selectedSticker === sticker.id && (
                <>
                  {/* Resize Handle */}
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
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)'
                    }}
                    onMouseDown={(e) => handleResize(e, sticker.id)}
                  />
                  
                  {/* Rotation Handle */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '-25px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '16px',
                      height: '16px',
                      background: '#28a745',
                      borderRadius: '50%',
                      cursor: 'grab',
                      border: '2px solid white',
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)'
                    }}
                    onMouseDown={(e) => handleRotation(e, sticker.id)}
                  />
                  
                  {/* Delete Button */}
                  <button
                    style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-8px',
                      width: '24px',
                      height: '24px',
                      background: '#dc3545',
                      color: 'white',
                      border: '2px solid white',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)'
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      onStickerDelete(sticker.id)
                    }}
                  >
                    ×
                  </button>
                </>
              )}
            </div>
          ))}

          {/* Enhanced Empty State */}
          {stickers.length === 0 && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              color: '#888',
              fontSize: '16px',
              zIndex: 10
            }}>
              <div style={{ fontSize: '48px', marginBottom: '10px', opacity: 0.6 }}>🎨</div>
              <div style={{ fontWeight: 'bold' }}>Design Your T-Shirt</div>
              <div style={{ fontSize: '14px', marginTop: '5px', opacity: 0.8 }}>
                Drag designs here or upload your own
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Side Panel */}
      <div style={sidePanelStyle}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #ddd',
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
        }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
            Customize {side} Side
          </h2>
          <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>
            Step 2 of 3: Position your designs on the fabric
          </p>
        </div>

        {/* Sticker Library */}
        <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '15px', color: '#333' }}>Design Library</h3>
          
          {/* Enhanced Upload Area */}
          <div style={{
            border: '2px dashed #007bff',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center',
            marginBottom: '20px',
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #f8f9ff 0%, #fff 100%)',
            transition: 'all 0.3s ease'
          }} 
          onClick={() => document.getElementById('sticker-upload').click()}
          onMouseEnter={(e) => {
            e.target.style.borderColor = '#0056b3'
            e.target.style.transform = 'scale(1.02)'
          }}
          onMouseLeave={(e) => {
            e.target.style.borderColor = '#007bff'
            e.target.style.transform = 'scale(1)'
          }}>
            <div style={{ fontSize: '28px', marginBottom: '10px' }}>📎</div>
            <div style={{ fontSize: '14px', color: '#007bff', fontWeight: 'bold' }}>
              Upload Your Design
            </div>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
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

          {/* Enhanced Sticker Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px'
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
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}
                onClick={() => onStickerAdd(sticker)}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = '#007bff'
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = '0 4px 16px rgba(0, 123, 255, 0.2)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = '#e0e0e0'
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}
              >
                <img
                  src={sticker.url}
                  alt={sticker.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    padding: '8px'
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Action Buttons */}
        <div style={{
          padding: '20px',
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
              padding: '15px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: isApplying ? 'not-allowed' : 'pointer',
              marginBottom: '12px',
              boxShadow: isApplying ? 'none' : '0 4px 12px rgba(40, 167, 69, 0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              if (!isApplying) {
                e.target.style.transform = 'translateY(-2px)'
                e.target.style.boxShadow = '0 6px 20px rgba(40, 167, 69, 0.4)'
              }
            }}
            onMouseLeave={(e) => {
              if (!isApplying) {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = '0 4px 12px rgba(40, 167, 69, 0.3)'
              }
            }}
          >
            {isApplying ? 'Processing Design...' : 'Apply to T-Shirt'}
          </button>
          
          <button
            onClick={onCancel}
            disabled={isApplying}
            style={{
              width: '100%',
              background: 'transparent',
              color: '#666',
              border: '2px solid #ddd',
              padding: '12px',
              borderRadius: '12px',
              fontSize: '14px',
              cursor: isApplying ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              if (!isApplying) {
                e.target.style.borderColor = '#dc3545'
                e.target.style.color = '#dc3545'
              }
            }}
            onMouseLeave={(e) => {
              if (!isApplying) {
                e.target.style.borderColor = '#ddd'
                e.target.style.color = '#666'
              }
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