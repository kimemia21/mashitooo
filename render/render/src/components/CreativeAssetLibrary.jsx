import React, { useState, useRef } from 'react'
import { 
  Upload, Search, Grid, List, Filter, Star, 
  Plus, Image, Trash2, Download, Eye, Heart,
  Palette, Sparkles, Layers, Scissors, Brush,
  Zap, Camera, Move, RotateCw, Scale
} from 'lucide-react'

function CreativeAssetLibrary({
  stickers = [],
  onStickerAdd,
  onStickerUpload,
  searchQuery = '',
  onSearchChange
}) {
  const [viewMode, setViewMode] = useState('grid')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [favoriteIds, setFavoriteIds] = useState(new Set())
  const [selectedAssets, setSelectedAssets] = useState(new Set())
  const fileInputRef = useRef(null)

  // Creative categories with artistic themes
  const categories = [
    { id: 'All', label: 'All Assets', icon: Layers, color: 'var(--gradient-cosmic)' },
    { id: 'Patterns', label: 'Patterns', icon: Grid, color: 'var(--gradient-sunset)' },
    { id: 'Textures', label: 'Textures', icon: Brush, color: 'var(--gradient-forest)' },
    { id: 'Illustrations', label: 'Art', icon: Palette, color: 'var(--gradient-ocean)' },
    { id: 'Typography', label: 'Text', icon: Zap, color: 'var(--gradient-aurora)' },
    { id: 'Custom', label: 'My Work', icon: Heart, color: 'var(--gradient-fire)' }
  ]
  
  // Filter stickers with enhanced search
  const filteredStickers = stickers.filter(sticker => {
    const matchesSearch = !searchQuery || 
      sticker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sticker.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sticker.tags || []).some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'All' || 
      (sticker.category || 'Uncategorized') === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const handleFileSelect = async (files) => {
    if (!files || files.length === 0) return

    setIsUploading(true)
    setUploadProgress(0)

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // Artistic upload progress animation
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + Math.random() * 15
        })
      }, 150)

      try {
        await onStickerUpload(file)
        setUploadProgress(100)
        
        setTimeout(() => {
          setUploadProgress(0)
          setIsUploading(false)
        }, 800)
      } catch (error) {
        console.error('Upload failed:', error)
        setIsUploading(false)
        setUploadProgress(0)
      }
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    )
    handleFileSelect(files)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setDragOver(false)
  }

  const toggleFavorite = (id) => {
    const newFavorites = new Set(favoriteIds)
    if (newFavorites.has(id)) {
      newFavorites.delete(id)
    } else {
      newFavorites.add(id)
    }
    setFavoriteIds(newFavorites)
  }

  const toggleAssetSelection = (id) => {
    const newSelected = new Set(selectedAssets)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedAssets(newSelected)
  }

  return (
    <div className="creative-asset-library">
      {/* Artistic Search and Controls */}
      <div className="asset-library__controls">
        <div className="search-container creative-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Discover creative assets..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input artistic-input"
          />
          <div className="search-glow"></div>
        </div>
        
        <div className="view-controls artistic-controls">
          <button
            className={`btn btn--icon tooltip ${viewMode === 'grid' ? 'btn--selected' : ''}`}
            onClick={() => setViewMode('grid')}
            data-tooltip="Gallery View"
          >
            <Grid size={16} />
          </button>
          <button
            className={`btn btn--icon tooltip ${viewMode === 'list' ? 'btn--selected' : ''}`}
            onClick={() => setViewMode('list')}
            data-tooltip="List View"
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Creative Category Filters */}
      <div className="category-filters artistic-categories">
        {categories.map(category => {
          const Icon = category.icon
          const isActive = selectedCategory === category.id
          return (
            <button
              key={category.id}
              className={`category-filter artistic-category ${isActive ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.id)}
              style={{ '--category-gradient': category.color }}
            >
              <Icon size={14} />
              <span>{category.label}</span>
              {isActive && <div className="category-glow"></div>}
            </button>
          )
        })}
      </div>

      {/* Artistic Upload Area */}
      <div 
        className={`upload-area artistic-upload ${dragOver ? 'drag-over' : ''} ${isUploading ? 'uploading' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          style={{ display: 'none' }}
        />
        
        <div className="upload-content">
          {isUploading ? (
            <div className="upload-progress artistic-progress">
              <div className="progress-circle">
                <svg viewBox="0 0 36 36" className="circular-chart">
                  <path
                    className="circle-bg"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="circle artistic-progress-bar"
                    strokeDasharray={`${uploadProgress}, 100`}
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="percentage-content">
                  <span className="percentage">{Math.round(uploadProgress)}%</span>
                  <Sparkles size={12} className="sparkle-icon" />
                </div>
              </div>
              <p className="upload-text">Creating magic...</p>
            </div>
          ) : (
            <>
              <div className="upload-icon-container">
                <Upload size={36} className="upload-icon" />
                <div className="upload-sparkles">
                  <Sparkles size={16} className="sparkle sparkle-1" />
                  <Sparkles size={12} className="sparkle sparkle-2" />
                  <Sparkles size={14} className="sparkle sparkle-3" />
                </div>
              </div>
              <h3 className="upload-title">Bring Your Vision to Life</h3>
              <p className="upload-description">Drop your creative assets here or click to browse</p>
              <p className="upload-hint">Supports PNG, JPG, SVG • Up to 10MB each</p>
            </>
          )}
        </div>
        
        <div className="upload-background-effects">
          <div className="upload-gradient"></div>
          <div className="upload-pattern"></div>
        </div>
      </div>

      {/* Creative Assets Grid/List */}
      <div className={`assets-container artistic-assets ${viewMode}`}>
        {filteredStickers.length === 0 ? (
          <div className="empty-state artistic-empty">
            <div className="empty-icon-container">
              <Palette size={64} className="empty-icon" />
              <div className="empty-sparkles">
                <Sparkles size={20} className="sparkle sparkle-1" />
                <Sparkles size={16} className="sparkle sparkle-2" />
                <Sparkles size={18} className="sparkle sparkle-3" />
              </div>
            </div>
            <h3>Your Creative Canvas Awaits</h3>
            <p>
              {searchQuery 
                ? `No assets match "${searchQuery}" - try a different search`
                : 'Start building your creative library by uploading your first design assets'
              }
            </p>
            {searchQuery ? (
              <button 
                className="btn btn--secondary"
                onClick={() => onSearchChange('')}
              >
                <Zap size={16} />
                Clear Search
              </button>
            ) : (
              <button 
                className="btn btn--primary"
                onClick={() => fileInputRef.current?.click()}
              >
                <Plus size={16} />
                Upload First Asset
              </button>
            )}
          </div>
        ) : (
          filteredStickers.map(sticker => (
            <div
              key={sticker.id}
              className={`asset-card artistic-asset ${selectedAssets.has(sticker.id) ? 'selected' : ''}`}
              onClick={() => onStickerAdd(sticker)}
            >
              <div className="asset-preview">
                <img 
                  src={sticker.url} 
                  alt={sticker.name}
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'flex'
                  }}
                />
                <div className="preview-fallback" style={{ display: 'none' }}>
                  <Palette size={24} />
                </div>
                
                <div className="asset-overlay">
                  <div className="overlay-actions">
                    <button 
                      className="btn btn--icon btn--overlay tooltip"
                      onClick={(e) => {
                        e.stopPropagation()
                        onStickerAdd(sticker)
                      }}
                      data-tooltip="Add to Canvas"
                    >
                      <Plus size={16} />
                    </button>
                    <button 
                      className="btn btn--icon btn--overlay tooltip"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleFavorite(sticker.id)
                      }}
                      data-tooltip="Add to Favorites"
                    >
                      <Heart 
                        size={16} 
                        fill={favoriteIds.has(sticker.id) ? 'currentColor' : 'none'}
                      />
                    </button>
                    <button 
                      className="btn btn--icon btn--overlay tooltip"
                      onClick={(e) => {
                        e.stopPropagation()
                      }}
                      data-tooltip="Quick Preview"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                  
                  {viewMode === 'grid' && (
                    <div className="overlay-tools">
                      <Move size={12} />
                      <RotateCw size={12} />
                      <Scale size={12} />
                    </div>
                  )}
                </div>
                
                <div className="asset-selection">
                  <input
                    type="checkbox"
                    checked={selectedAssets.has(sticker.id)}
                    onChange={(e) => {
                      e.stopPropagation()
                      toggleAssetSelection(sticker.id)
                    }}
                    className="selection-checkbox"
                  />
                </div>
              </div>
              
              <div className="asset-info">
                <h4 className="asset-name">{sticker.name}</h4>
                <div className="asset-meta">
                  <span className="asset-category">{sticker.category || 'Uncategorized'}</span>
                  {sticker.uploadedAt && (
                    <span className="asset-date">
                      {new Date(sticker.uploadedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                
                {sticker.tags && sticker.tags.length > 0 && (
                  <div className="asset-tags">
                    {sticker.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="asset-tag">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>
              
              {viewMode === 'list' && (
                <div className="asset-actions">
                  <button 
                    className="btn btn--icon tooltip"
                    onClick={(e) => {
                      e.stopPropagation()
                    }}
                    data-tooltip="Download"
                  >
                    <Download size={14} />
                  </button>
                  <button 
                    className="btn btn--icon tooltip"
                    onClick={(e) => {
                      e.stopPropagation()
                    }}
                    data-tooltip="Duplicate"
                  >
                    <Layers size={14} />
                  </button>
                  <button 
                    className="btn btn--icon tooltip"
                    onClick={(e) => {
                      e.stopPropagation()
                    }}
                    data-tooltip="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
              
              <div className="asset-glow"></div>
            </div>
          ))
        )}
      </div>

      {/* Creative Results Info */}
      {filteredStickers.length > 0 && (
        <div className="results-info artistic-results">
          <Sparkles size={14} />
          <span>{filteredStickers.length} creative asset{filteredStickers.length !== 1 ? 's' : ''}</span>
          {searchQuery && <span> matching "{searchQuery}"</span>}
          {selectedAssets.size > 0 && (
            <span> • {selectedAssets.size} selected</span>
          )}
        </div>
      )}
    </div>
  )
}

export default CreativeAssetLibrary