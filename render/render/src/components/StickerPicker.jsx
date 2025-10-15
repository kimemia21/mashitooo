import React, { useState } from 'react'
import { Upload, Image, X } from 'lucide-react'

const StickerPicker = ({ onStickerSelect, stickers, onStickerUpload }) => {
  const [draggedFile, setDraggedFile] = useState(null)
  const [isExpanded, setIsExpanded] = useState(true)

  const containerStyle = {
    position: 'fixed',
    top: '0',
    right: '0',
    height: '100vh',
    width: isExpanded ? 'min(320px, 100vw)' : '60px',
    background: 'linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%)',
    borderLeft: '1px solid rgba(255, 255, 255, 0.05)',
    boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.4)',
    transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  }

  const headerStyle = {
    padding: '20px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: '60px',
  }

  const titleStyle = {
    margin: 0,
    fontSize: '13px',
    fontWeight: 600,
    color: '#e0e0e0',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    display: isExpanded ? 'block' : 'none',
  }

  const toggleButtonStyle = {
    background: 'transparent',
    border: 'none',
    color: '#888',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '4px',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }

  const contentStyle = {
    padding: isExpanded ? '20px' : '10px',
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
  }

  const uploadAreaStyle = {
    border: '2px dashed rgba(255, 255, 255, 0.15)',
    borderRadius: '8px',
    padding: isExpanded ? '32px 20px' : '20px 10px',
    textAlign: 'center',
    marginBottom: '20px',
    backgroundColor: draggedFile ? 'rgba(66, 133, 244, 0.1)' : 'rgba(255, 255, 255, 0.03)',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    display: isExpanded ? 'block' : 'none',
  }

  const uploadIconStyle = {
    marginBottom: '12px',
    color: draggedFile ? '#4285f4' : '#666',
    transition: 'color 0.3s ease',
  }

  const uploadTextStyle = {
    fontSize: '12px',
    color: '#999',
    marginBottom: '4px',
    fontWeight: 500,
  }

  const uploadSubtextStyle = {
    fontSize: '11px',
    color: '#666',
  }

  const stickerGridStyle = {
    display: 'grid',
    gridTemplateColumns: isExpanded ? 'repeat(auto-fill, minmax(70px, 1fr))' : '1fr',
    gap: '12px',
    maxHeight: isExpanded ? 'calc(100vh - 280px)' : 'calc(100vh - 100px)',
    overflowY: 'auto',
    paddingRight: '4px',
  }

  const stickerItemWrapperStyle = {
    position: 'relative',
    aspectRatio: '1',
    borderRadius: '8px',
    overflow: 'hidden',
    cursor: 'pointer',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  }

  const stickerItemStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  }

  const emptyStateStyle = {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#666',
    display: isExpanded ? 'block' : 'none',
  }

  const scrollbarStyle = `
    ::-webkit-scrollbar {
      width: 6px;
    }
    ::-webkit-scrollbar-track {
      background: transparent;
    }
    ::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 3px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.15);
    }
  `

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

  const handleDragOver = (e) => {
    e.preventDefault()
    setDraggedFile(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setDraggedFile(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDraggedFile(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        onStickerUpload(e.target.result, file.name)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <>
      <style>{scrollbarStyle}</style>
      <div style={containerStyle}>
        <div style={headerStyle}>
          <h3 style={titleStyle}>Asset Browser</h3>
          <button
            style={toggleButtonStyle}
            onClick={() => setIsExpanded(!isExpanded)}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
              e.currentTarget.style.color = '#e0e0e0'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = '#888'
            }}
            aria-label={isExpanded ? 'Collapse panel' : 'Expand panel'}
          >
            {isExpanded ? <X size={18} /> : <Image size={18} />}
          </button>
        </div>

        <div style={contentStyle}>
          {/* Upload Area */}
          <div
            style={uploadAreaStyle}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('sticker-upload').click()}
            onMouseEnter={(e) => {
              if (!draggedFile) {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
              }
            }}
            onMouseLeave={(e) => {
              if (!draggedFile) {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)'
              }
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Upload style={uploadIconStyle} size={24} />
            </div>
            <div style={uploadTextStyle}>
              Import Asset
            </div>
            <div style={uploadSubtextStyle}>
              Drop or click to browse
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
          {stickers.length > 0 ? (
            <div style={stickerGridStyle}>
              {stickers.map((sticker, index) => (
                <div
                  key={index}
                  style={stickerItemWrapperStyle}
                  onClick={() => onStickerSelect(sticker)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)'
                    e.currentTarget.style.borderColor = '#4285f4'
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(66, 133, 244, 0.3)'
                    const img = e.currentTarget.querySelector('img')
                    if (img) img.style.transform = 'scale(1.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)'
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)'
                    e.currentTarget.style.boxShadow = 'none'
                    const img = e.currentTarget.querySelector('img')
                    if (img) img.style.transform = 'scale(1)'
                  }}
                  title={sticker.name}
                >
                  <img
                    src={sticker.url}
                    alt={sticker.name}
                    style={stickerItemStyle}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div style={emptyStateStyle}>
              <Image size={48} style={{ color: '#444', marginBottom: '12px' }} />
              <div style={{ fontSize: '12px', marginBottom: '4px' }}>No assets yet</div>
              <div style={{ fontSize: '11px', color: '#555' }}>
                Import images to get started
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default StickerPicker