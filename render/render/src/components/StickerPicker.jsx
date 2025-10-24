import React, { useState } from 'react'
import { Upload, Image } from 'lucide-react'

const StickerPicker = ({ onStickerSelect, stickers, onStickerUpload }) => {
  const [draggedFile, setDraggedFile] = useState(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

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
    <div className="w-full">
      {/* Header - Always Visible */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="cursor-pointer flex items-center justify-between transition-all select-none"
        style={{
          background: isHovered 
            ? 'linear-gradient(to bottom, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08))' 
            : 'linear-gradient(to bottom, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: isHovered ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
          borderBottomLeftRadius: isExpanded ? 0 : '0.375rem',
          borderBottomRightRadius: isExpanded ? 0 : '0.375rem',
          borderBottom: isExpanded ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(255, 255, 255, 0.1)',
          padding: '12px 16px',
          fontFamily: '"Helvetica Neue", Arial, sans-serif',
          borderTopLeftRadius: '0.375rem',
          borderTopRightRadius: '0.375rem'
        }}
      >
        <div className="flex items-center gap-2" style={{ fontSize: '12px', color: isHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.8)' }}>
          <Image size={14} style={{ color: isHovered ? "#ffffff" : "#8c8c8c" }} />
          <span style={{ 
            fontWeight: '400', 
            letterSpacing: '0.02em',
            fontFamily: '"Helvetica Neue", Arial, sans-serif',
            textShadow: '0 1px 4px rgba(0, 0, 0, 0.3)'
          }}>
            Assets
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#8c8c8c]">{stickers.length}</span>
          {/* Triangle */}
          <svg 
            width="10" 
            height="10" 
            viewBox="0 0 8 8"
            className="transition-transform duration-150"
            style={{ 
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
            }}
          >
            <path d="M1 2 L4 6 L7 2" fill="none" stroke="#8c8c8c" strokeWidth="1.5"/>
          </svg>
        </div>
      </div>

      {/* Expanded Panel */}
      {isExpanded && (
        <div style={{
          background: 'rgba(26, 26, 26, 0.9)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: 'none',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          borderBottomLeftRadius: '0.375rem',
          borderBottomRightRadius: '0.375rem',
          padding: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
          maxHeight: '400px',
          overflowY: 'auto',
          overflowX: 'hidden',
          fontFamily: '"Helvetica Neue", Arial, sans-serif'
        }}>
          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded p-4 text-center mb-3 cursor-pointer transition-all ${
              draggedFile
                ? 'border-[#5680c2] bg-[#5680c2]/10'
                : 'border-[#525252] bg-[#2a2a2a] hover:bg-[#333333] hover:border-[#666666]'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('sticker-upload').click()}
          >
            <div className="flex justify-center mb-2">
              <Upload 
                className={`transition-colors ${
                  draggedFile ? 'text-[#5680c2]' : 'text-[#8c8c8c]'
                }`} 
                size={20} 
              />
            </div>
            <div className="text-xs text-[#c5c5c5] mb-0.5 font-medium">
              Import Asset
            </div>
            <div className="text-[10px] text-[#8c8c8c]">
              Drop or click to browse
            </div>
            <input
              id="sticker-upload"
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {/* Sticker Grid */}
          {stickers.length > 0 ? (
            <>
              <div className="text-[9px] text-[#8c8c8c] uppercase tracking-wider mb-2 font-medium">
                Library ({stickers.length})
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {stickers.map((sticker, index) => (
                  <button
                    key={index}
                    className="relative aspect-square rounded overflow-hidden cursor-pointer bg-[#2a2a2a] border border-[#1a1a1a] transition-all hover:border-[#5680c2] hover:border-2 hover:scale-105 outline-none"
                    onClick={() => onStickerSelect(sticker)}
                    title={sticker.name}
                  >
                    <img
                      src={sticker.url}
                      alt={sticker.name}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-6 text-[#666666]">
              <Image size={32} className="text-[#555555] mb-2 mx-auto" />
              <div className="text-xs mb-0.5">No assets yet</div>
              <div className="text-[10px] text-[#555555]">
                Import images to get started
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        /* Custom scrollbar */
        div::-webkit-scrollbar {
          width: 8px;
        }
        div::-webkit-scrollbar-track {
          background: #2a2a2a;
          border-left: 1px solid #1a1a1a;
        }
        div::-webkit-scrollbar-thumb {
          background: #5a5a5a;
          border-radius: 4px;
          border: 1px solid #4a4a4a;
        }
        div::-webkit-scrollbar-thumb:hover {
          background: #6a6a6a;
        }
        * {
          scrollbar-width: thin;
          scrollbar-color: #5a5a5a #2a2a2a;
        }
        @media (hover: none) and (pointer: coarse) {
          button:active {
            transform: scale(0.95);
          }
        }
      `}</style>
    </div>
  )
}

// Demo ColorPicker
const ColorPicker = ({ color, onChange, originalColor = null }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const presetColors = [
    '#ffffff', '#ececec', '#d5d5d5', '#b0b0b0', '#8c8c8c',
    '#6e6e6e', '#525252', '#383838', '#262626', '#000000',
    '#ff0000', '#ff7700', '#ffdd00', '#00ff00', '#00ffff',
    '#0000ff', '#dd00ff', '#ff0088', '#990000', '#aa5500'
  ]

  return (
    <div className="w-full">
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-gradient-to-b from-[#3e3e3e] to-[#2d2d2d] border border-[#1a1a1a] rounded-t-md px-3 py-2 cursor-pointer flex items-center justify-between transition-all hover:from-[#494949] hover:to-[#373737] select-none"
        style={{
          borderBottomLeftRadius: isExpanded ? 0 : '0.375rem',
          borderBottomRightRadius: isExpanded ? 0 : '0.375rem',
          borderBottom: isExpanded ? '1px solid #2d2d2d' : '1px solid #1a1a1a'
        }}
      >
        <div className="flex items-center gap-2 text-xs text-[#c5c5c5]">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="#8c8c8c" strokeWidth="1.5"/>
            <path d="M8 2 L8 14 M2 8 L14 8" stroke="#8c8c8c" strokeWidth="1.5"/>
          </svg>
          <span className="font-medium">Color</span>
        </div>
        <div className="flex items-center gap-2">
          <div 
            className="w-6 h-4 rounded border border-black shadow-inner"
            style={{ backgroundColor: color }}
          />
          <svg 
            width="10" 
            height="10" 
            viewBox="0 0 8 8"
            className="transition-transform duration-150"
            style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            <path d="M1 2 L4 6 L7 2" fill="none" stroke="#8c8c8c" strokeWidth="1.5"/>
          </svg>
        </div>
      </div>

      {isExpanded && (
        <div className="bg-[#3a3a3a] border border-t-0 border-[#1a1a1a] rounded-b-md p-3 shadow-lg">
          <div className="grid grid-cols-5 gap-1.5">
            {presetColors.map((preset, index) => (
              <button
                key={index}
                onClick={() => onChange(preset)}
                className={`aspect-square rounded transition-all outline-none ${
                  color === preset ? 'border-2 border-[#5680c2]' : 'border border-[#1a1a1a] hover:border-[#5680c2]'
                }`}
                style={{ backgroundColor: preset }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Demo Panel
const Panel = ({ title, children }) => {
  return (
    <div className="bg-[#1a1a1a] rounded-xl overflow-hidden border border-white/10 mb-3 w-full max-w-2xl mx-auto">
      <div className="p-3 sm:p-4 border-b border-white/10">
        <span className="font-semibold text-sm text-white">{title}</span>
      </div>
      <div className="p-3 sm:p-4 space-y-3">
        {children}
      </div>
    </div>
  )
}

// Demo App
export default function App() {
  const [color, setColor] = useState('#ff0000')
  const [stickers, setStickers] = useState([
    { url: 'https://picsum.photos/seed/1/200', name: 'Image 1' },
    { url: 'https://picsum.photos/seed/2/200', name: 'Image 2' },
    { url: 'https://picsum.photos/seed/3/200', name: 'Image 3' },
    { url: 'https://picsum.photos/seed/4/200', name: 'Image 4' },
  ])

  const handleStickerSelect = (sticker) => {
    alert(`Selected: ${sticker.name}`)
  }

  const handleStickerUpload = (dataUrl, name) => {
    setStickers([...stickers, { url: dataUrl, name }])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">
          Compact Pickers
        </h1>
        
        <Panel title="Design Customization">
          <ColorPicker color={color} onChange={setColor} />
          <StickerPicker
            stickers={stickers}
            onStickerSelect={handleStickerSelect}
            onStickerUpload={handleStickerUpload}
          />
        </Panel>
      </div>
    </div>
  )
}