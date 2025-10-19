import React, { useState } from 'react'
import { Plus, Search, Grid, List, Upload, Sparkles } from 'lucide-react'
import '../styles/sticker-library-creative.css'

function StickerLibrary({ 
  stickers = [], 
  onStickerAdd, 
  onStickerUpload,
  searchQuery = '',
  onSearchChange 
}) {
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isUploading, setIsUploading] = useState(false)
  
  // Get unique categories
  const categories = ['all', ...new Set(stickers.map(s => s.category).filter(Boolean))]
  
  const filteredStickers = stickers.filter(sticker => {
    const matchesSearch = sticker.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || sticker.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleStickerClick = (sticker) => {
    if (onStickerAdd) {
      onStickerAdd(sticker)
    }
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (file && onStickerUpload) {
      setIsUploading(true)
      try {
        await onStickerUpload(file)
      } finally {
        setIsUploading(false)
        event.target.value = '' // Reset input
      }
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    const files = Array.from(e.dataTransfer.files)
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    
    if (imageFiles.length > 0 && onStickerUpload) {
      setIsUploading(true)
      try {
        for (const file of imageFiles) {
          await onStickerUpload(file)
        }
      } finally {
        setIsUploading(false)
      }
    }
  }

  return (
    <div className="sticker-library">
      {/* Modern Header */}
      <div className="sticker-library__header">
        <div className="sticker-library__search-row">
          <div className="sticker-library__search">
            <div className="input-group">
              <Search size={16} className="input-group__icon" />
              <input
                type="text"
                className="input"
                placeholder="Search amazing stickers..."
                value={searchQuery}
                onChange={(e) => onSearchChange?.(e.target.value)}
              />
            </div>
          </div>
          
          <div className="sticker-library__controls">
            <button
              className={`view-toggle-btn ${viewMode === 'grid' ? 'view-toggle-btn--active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <Grid size={16} />
            </button>
            <button
              className={`view-toggle-btn ${viewMode === 'list' ? 'view-toggle-btn--active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <List size={16} />
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        {categories.length > 1 && (
          <div className="sticker-library__categories">
            {categories.map(category => (
              <button
                key={category}
                className={`category-tab ${selectedCategory === category ? 'category-tab--active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category === 'all' ? '✨ All' : category}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Creative Upload Zone */}
      <div className="sticker-library__upload">
        <div 
          className="upload-zone"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <Upload size={24} />
          <div className="upload-zone__text">
            {isUploading ? 'Uploading...' : 'Drop files or click to upload'}
          </div>
          <div className="upload-zone__subtext">
            PNG, JPG, SVG up to 10MB
          </div>
          <input
            type="file"
            accept="image/*,.svg"
            onChange={handleFileUpload}
            multiple
            disabled={isUploading}
          />
        </div>
      </div>

      {/* Modern Content Area */}
      <div className={`sticker-library__content sticker-library__content--${viewMode}`}>
        {filteredStickers.length === 0 ? (
          <div className="sticker-library__empty">
            <div className="sticker-library__empty-icon">
              <Sparkles />
            </div>
            <div className="sticker-library__empty-title">
              {searchQuery ? 'No stickers found' : 'Start your creative journey'}
            </div>
            <div className="sticker-library__empty-text">
              {searchQuery 
                ? `No stickers match "${searchQuery}"`
                : 'Upload your first sticker to get started creating amazing designs'
              }
            </div>
            {searchQuery ? (
              <button 
                className="btn"
                onClick={() => onSearchChange?.('')}
              >
                Clear Search
              </button>
            ) : (
              <button 
                className="btn"
                onClick={() => document.querySelector('.upload-zone input').click()}
              >
                <Plus size={16} />
                Upload Sticker
              </button>
            )}
          </div>
        ) : (
          filteredStickers.map(sticker => (
            <div
              key={sticker.id || sticker.url}
              className={`sticker-item ${isUploading ? 'sticker-item--loading' : ''}`}
              onClick={() => !isUploading && handleStickerClick(sticker)}
            >
              <div className="sticker-item__preview">
                <img
                  src={sticker.url}
                  alt={sticker.name}
                  className="sticker-item__image"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'flex'
                  }}
                />
                <div className="sticker-item__fallback" style={{ display: 'none' }}>
                  🎨
                </div>
              </div>
              
              <div className="sticker-item__info">
                <div className="sticker-item__name">{sticker.name}</div>
                {sticker.category && viewMode === 'list' && (
                  <div className="sticker-item__category">
                    {sticker.category}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default StickerLibrary