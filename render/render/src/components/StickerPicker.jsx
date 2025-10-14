import React, { useState } from 'react'

const StickerPicker = ({ onStickerSelect, stickers, onStickerUpload }) => {
  const [draggedFile, setDraggedFile] = useState(null)

  const containerStyle = {
    position: 'absolute',
    top: '20px',
    right: '20px',
    zIndex: 1000,
    background: 'rgba(255, 255, 255, 0.9)',
    padding: '15px',
    borderRadius: '10px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    backdropFilter: 'blur(10px)',
    width: '200px',
  }

  const titleStyle = {
    margin: '0 0 10px 0',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#333',
  }

  const uploadAreaStyle = {
    border: '2px dashed #ccc',
    borderRadius: '8px',
    padding: '20px',
    textAlign: 'center',
    marginBottom: '10px',
    backgroundColor: draggedFile ? '#f0f8ff' : '#fafafa',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  }

  const stickerGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px',
    maxHeight: '200px',
    overflowY: 'auto',
  }

  const stickerItemStyle = {
    width: '50px',
    height: '50px',
    borderRadius: '8px',
    cursor: 'pointer',
    border: '2px solid transparent',
    transition: 'transform 0.2s, border-color 0.2s',
    objectFit: 'cover',
  }

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        console.log('Uploading sticker:', file.name, 'Size:', e.target.result.length)
        onStickerUpload(e.target.result, file.name)
      }
      reader.readAsDataURL(file)
    } else {
      console.log('Invalid file type:', file?.type)
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
    <div style={containerStyle}>
      <h3 style={titleStyle}>Stickers</h3>
      
      {/* Upload Area */}
      <div
        style={uploadAreaStyle}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('sticker-upload').click()}
      >
        <div style={{ fontSize: '12px', color: '#666' }}>
          Drop image here or click to upload
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
      {stickers.length > 0 && (
        <div style={stickerGridStyle}>
          {stickers.map((sticker, index) => (
            <img
              key={index}
              src={sticker.url}
              alt={sticker.name}
              style={stickerItemStyle}
              onClick={() => onStickerSelect(sticker)}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.1)'
                e.target.style.borderColor = '#007bff'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)'
                e.target.style.borderColor = 'transparent'
              }}
              title={sticker.name}
            />
          ))}
        </div>
      )}
      
      {stickers.length === 0 && (
        <div style={{ fontSize: '12px', color: '#999', textAlign: 'center' }}>
          No stickers uploaded yet
        </div>
      )}
    </div>
  )
}

export default StickerPicker