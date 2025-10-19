import React, { useState, useRef } from 'react'
import { 
  Upload, Search, Grid, List, Filter, Star, 
  Plus, Image, Trash2, Download, Eye 
} from 'lucide-react'

function EnhancedStickerLibrary({
  stickers = [],
  onStickerAdd,
  onStickerUpload,
  searchQuery = '',
  onSearchChange
}) {
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)

  // Get unique categories
  const categories = ['All', ...new Set(stickers.map(s => s.category || 'Uncategorized'))]
  
  // Filter stickers
  const filteredStickers = stickers.filter(sticker => {
    const matchesSearch = !searchQuery || 
      sticker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sticker.category || '').toLowerCase().includes(searchQuery.toLowerCase())
    
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
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 100)

      try {
        await onStickerUpload(file)
        setUploadProgress(100)
        
        setTimeout(() => {
          setUploadProgress(0)
          setIsUploading(false)
        }, 500)
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

  return (
    <div className="enhanced-sticker-library">
      {/* Search and Controls */}
      <div className="sticker-library__controls">
        <div className="search-container">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search stickers..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="view-controls">
          <button
            className={`btn btn--icon tooltip ${viewMode === 'grid' ? 'btn--selected' : ''}`}
            onClick={() => setViewMode('grid')}
            data-tooltip="Grid View"
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

      {/* Category Filters */}
      <div className="category-filters">
        {categories.map(category => (
          <button
            key={category}
            className={`category-filter ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Upload Area */}
      <div 
        className={`upload-area ${dragOver ? 'drag-over' : ''} ${isUploading ? 'uploading' : ''}`}
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
        
        {isUploading ? (
          <div className="upload-progress">
            <div className="progress-circle">
              <svg viewBox="0 0 36 36" className="circular-chart">
                <path
                  className="circle-bg"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="circle"
                  strokeDasharray={`${uploadProgress}, 100`}
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="percentage">{Math.round(uploadProgress)}%</span>
            </div>
            <p>Uploading sticker...</p>
          </div>
        ) : (
          <>
            <Upload size={32} />
            <p><strong>Drop images here</strong> or click to browse</p>
            <p className="upload-hint">Supports PNG, JPG, SVG up to 10MB</p>
          </>
        )}
      </div>

      {/* Stickers Grid/List */}
      <div className={`stickers-container ${viewMode}`}>
        {filteredStickers.length === 0 ? (
          <div className="empty-state">
            <Image size={48} />
            <h3>No stickers found</h3>
            <p>Try uploading some images or adjusting your search</p>
          </div>
        ) : (
          filteredStickers.map(sticker => (
            <div
              key={sticker.id}
              className="sticker-card"
              onClick={() => onStickerAdd(sticker)}
            >
              <div className="sticker-preview">
                <img 
                  src={sticker.url} 
                  alt={sticker.name}
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'flex'
                  }}
                />
                <div className="preview-fallback" style={{ display: 'none' }}>
                  <Image size={24} />
                </div>
                
                <div className="sticker-overlay">
                  <button 
                    className="btn btn--icon btn--overlay tooltip"
                    onClick={(e) => {
                      e.stopPropagation()
                      onStickerAdd(sticker)
                    }}
                    data-tooltip="Add to Design"
                  >
                    <Plus size={16} />
                  </button>
                  <button 
                    className="btn btn--icon btn--overlay tooltip"
                    onClick={(e) => {
                      e.stopPropagation()
                      // Preview functionality
                    }}
                    data-tooltip="Preview"
                  >
                    <Eye size={16} />
                  </button>
                </div>
              </div>
              
              <div className="sticker-info">
                <h4 className="sticker-name">{sticker.name}</h4>
                <span className="sticker-category">{sticker.category || 'Uncategorized'}</span>
                {sticker.uploadedAt && (
                  <span className="sticker-date">
                    {new Date(sticker.uploadedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
              
              {viewMode === 'list' && (
                <div className="sticker-actions">
                  <button 
                    className="btn btn--icon tooltip"
                    onClick={(e) => {
                      e.stopPropagation()
                      // Download functionality
                    }}
                    data-tooltip="Download"
                  >
                    <Download size={14} />
                  </button>
                  <button 
                    className="btn btn--icon tooltip"
                    onClick={(e) => {
                      e.stopPropagation()
                      // Delete functionality
                    }}
                    data-tooltip="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Results Info */}
      {filteredStickers.length > 0 && (
        <div className="results-info">
          <span>{filteredStickers.length} sticker{filteredStickers.length !== 1 ? 's' : ''}</span>
          {searchQuery && <span> matching "{searchQuery}"</span>}
        </div>
      )}
    </div>
  )
}

export default EnhancedStickerLibrary