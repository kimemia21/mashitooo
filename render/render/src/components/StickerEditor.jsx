import React, { useState, useRef, useCallback } from 'react'

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

  // T-shirt template area (2D canvas)
  const canvasStyle = {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#ffffff',
    margin: '20px',
    borderRadius: '10px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    position: 'relative',
    overflow: 'hidden'
  }

  // T-shirt outline template
  const tshirtTemplateStyle = {
    width: '400px',
    height: '500px',
    background: 'linear-gradient(135deg, #e0e0e0 0%, #f0f0f0 100%)',
    borderRadius: '20px 20px 40px 40px',
    position: 'relative',
    border: '3px dashed #ccc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
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

  // Handle mouse events for dragging stickers
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

    // Constrain to template bounds
    const constrainedX = Math.max(0, Math.min(100, newX))
    const constrainedY = Math.max(0, Math.min(100, newY))

    onStickerUpdate(draggedSticker, { x: constrainedX, y: constrainedY })
  }, [draggedSticker, dragOffset, onStickerUpdate])

  const handleMouseUp = useCallback(() => {
    setDraggedSticker(null)
    setDragOffset({ x: 0, y: 0 })
    setIsResizing(false)
    setIsRotating(false)
  }, [])

  // Add event listeners
  React.useEffect(() => {
    if (draggedSticker) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [draggedSticker, handleMouseMove, handleMouseUp])

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
          {/* Template Label */}
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            {side} SIDE
          </div>

          {/* Printable Area Guidelines */}
          <div style={{
            position: 'absolute',
            top: '80px',
            left: '50px',
            right: '50px',
            bottom: '80px',
            border: '2px dashed rgba(0, 123, 255, 0.5)',
            borderRadius: '10px',
            pointerEvents: 'none'
          }}>
            <div style={{
              position: 'absolute',
              top: '-25px',
              left: '0',
              fontSize: '12px',
              color: '#007bff',
              fontWeight: 'bold'
            }}>
              Printable Area
            </div>
          </div>

          {/* Render Stickers */}
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
                borderRadius: '4px',
                background: selectedSticker === sticker.id ? 'rgba(0, 123, 255, 0.1)' : 'transparent'
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
                  userSelect: 'none'
                }}
                draggable={false}
              />
              
              {/* Selection Controls */}
              {selectedSticker === sticker.id && (
                <>
                  {/* Resize Handle */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '-6px',
                      right: '-6px',
                      width: '12px',
                      height: '12px',
                      background: '#007bff',
                      borderRadius: '50%',
                      cursor: 'se-resize'
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation()
                      setIsResizing(true)
                    }}
                  />
                  
                  {/* Rotation Handle */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '-20px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '12px',
                      height: '12px',
                      background: '#28a745',
                      borderRadius: '50%',
                      cursor: 'grab'
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation()
                      setIsRotating(true)
                    }}
                  />
                  
                  {/* Delete Button */}
                  <button
                    style={{
                      position: 'absolute',
                      top: '-6px',
                      right: '-6px',
                      width: '20px',
                      height: '20px',
                      background: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
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

          {/* Empty State */}
          {stickers.length === 0 && (
            <div style={{
              textAlign: 'center',
              color: '#666',
              fontSize: '16px'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>🎨</div>
              <div>Drag stickers here from the library</div>
              <div style={{ fontSize: '14px', marginTop: '5px' }}>or upload your own images</div>
            </div>
          )}
        </div>
      </div>

      {/* Side Panel */}
      <div style={sidePanelStyle}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #ddd',
          background: '#f8f9fa'
        }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
            Customize {side} Side
          </h2>
          <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>
            Step 2 of 3: Add and position your designs
          </p>
        </div>

        {/* Sticker Library */}
        <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '15px' }}>Sticker Library</h3>
          
          {/* Upload Area */}
          <div style={{
            border: '2px dashed #ddd',
            borderRadius: '8px',
            padding: '20px',
            textAlign: 'center',
            marginBottom: '20px',
            cursor: 'pointer',
            background: '#fafafa'
          }} onClick={() => document.getElementById('sticker-upload').click()}>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>📁</div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              Click to upload images
            </div>
            <input
              id="sticker-upload"
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </div>

          {/* Sticker Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '10px'
          }}>
            {stickerLibrary.map((sticker, index) => (
              <div
                key={index}
                style={{
                  aspectRatio: '1',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => onStickerAdd(sticker)}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = '#007bff'
                  e.target.style.transform = 'scale(1.05)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = '#ddd'
                  e.target.style.transform = 'scale(1)'
                }}
              >
                <img
                  src={sticker.url}
                  alt={sticker.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          padding: '20px',
          borderTop: '1px solid #ddd',
          background: '#f8f9fa'
        }}>
          <button
            onClick={onApply}
            disabled={isApplying}
            style={{
              width: '100%',
              background: isApplying ? '#ccc' : '#28a745',
              color: 'white',
              border: 'none',
              padding: '15px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: isApplying ? 'not-allowed' : 'pointer',
              marginBottom: '10px'
            }}
          >
            {isApplying ? 'Applying...' : 'Apply to T-Shirt'}
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
              borderRadius: '8px',
              fontSize: '14px',
              cursor: isApplying ? 'not-allowed' : 'pointer'
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