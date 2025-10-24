import React, { useState } from 'react'

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
      {/* Header - Always Visible */}
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
          {/* Color icon */}
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="#8c8c8c" strokeWidth="1.5"/>
            <path d="M8 2 L8 14 M2 8 L14 8" stroke="#8c8c8c" strokeWidth="1.5"/>
          </svg>
          <span className="font-medium">Color</span>
        </div>
        
        <div className="flex items-center gap-2">
          <div 
            className="w-6 h-4 rounded border border-black shadow-inner"
            style={{ 
              backgroundColor: color === 'original' ? originalColor : color,
              boxShadow: 'inset 0 0 2px rgba(0,0,0,0.5)'
            }}
          />
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
        <div className="bg-[#3a3a3a] border border-t-0 border-[#1a1a1a] rounded-b-md p-3 shadow-lg max-h-[400px] overflow-y-auto overflow-x-hidden">
          {/* Hex Input */}
          <div className="bg-[#2a2a2a] border border-[#1a1a1a] rounded p-2 mb-3 flex items-center gap-2">
            <div 
              className="w-8 h-8 rounded border border-black flex-shrink-0"
              style={{ 
                backgroundColor: color === 'original' ? originalColor : color,
                boxShadow: 'inset 0 0 2px rgba(0,0,0,0.5)'
              }}
            />
            <input
              type="text"
              value={color === 'original' ? originalColor?.toUpperCase() : color.toUpperCase()}
              onChange={(e) => {
                const val = e.target.value
                if (/^#[0-9A-F]{0,6}$/i.test(val)) {
                  if (val.length === 7) onChange(val)
                }
              }}
              className="flex-1 bg-[#1e1e1e] border border-black rounded px-2 py-1 text-[#d5d5d5] text-xs font-mono outline-none focus:border-[#5680c2] min-w-0"
              placeholder="#FFFFFF"
            />
          </div>

          {/* Color Wheel Picker */}
          <div className="mb-3">
            <input
              type="color"
              value={color === 'original' ? originalColor : color}
              onChange={(e) => onChange(e.target.value)}
              className="w-full h-20 border border-[#1a1a1a] rounded cursor-pointer bg-[#2a2a2a] p-1"
            />
          </div>

          {/* Original Button - Show only if originalColor is available */}
          {originalColor && (
            <div className="mb-3">
              <div className="text-[9px] text-[#8c8c8c] uppercase tracking-wider mb-2 font-medium">
                Original
              </div>
              
              <button
                onClick={() => onChange('original')}
                title="Original Model Color"
                className={`w-full px-3 py-2 rounded transition-all outline-none flex items-center justify-center gap-2 text-xs font-medium ${
                  color === 'original' 
                    ? 'border-2 border-[#5680c2] bg-gradient-to-br from-[#4a4a4a] to-[#2a2a2a]' 
                    : 'border border-[#1a1a1a] bg-gradient-to-br from-[#4a4a4a] to-[#2a2a2a] hover:border-[#5680c2] hover:border-2'
                }`}
              >
                <div 
                  className="w-5 h-3 rounded border border-black flex-shrink-0"
                  style={{
                    backgroundColor: originalColor,
                    boxShadow: 'inset 0 0 2px rgba(0,0,0,0.5)'
                  }}
                />
                <span className="text-[#d5d5d5]">Original Texture</span>
              </button>
            </div>
          )}

          {/* Presets Label */}
          <div className="text-[9px] text-[#8c8c8c] uppercase tracking-wider mb-2 font-medium">
            Presets
          </div>

          {/* Presets Grid */}
          <div className="grid grid-cols-5 gap-1.5">
            {presetColors.map((preset, index) => (
              <button
                key={index}
                onClick={() => onChange(preset)}
                title={preset}
                className={`aspect-square min-h-[28px] min-w-[28px] rounded transition-all outline-none ${
                  color === preset 
                    ? 'border-2 border-[#5680c2]' 
                    : 'border border-[#1a1a1a] hover:border-[#5680c2] hover:border-2'
                }`}
                style={{
                  backgroundColor: preset,
                  boxShadow: 'inset 0 0 2px rgba(0,0,0,0.3)'
                }}
              />
            ))}
          </div>
        </div>
      )}

      <style>{`
        /* Custom scrollbar for webkit browsers */
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

        div::-webkit-scrollbar-thumb:active {
          background: #7a7a7a;
        }

        /* Firefox scrollbar */
        * {
          scrollbar-width: thin;
          scrollbar-color: #5a5a5a #2a2a2a;
        }

        /* Mobile touch feedback */
        @media (hover: none) and (pointer: coarse) {
          button:active {
            transform: scale(0.95);
          }
        }
      `}</style>
    </div>
  )
}

export default ColorPicker