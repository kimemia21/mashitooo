import React, { useState } from 'react'

const ColorPicker = ({ color, onChange }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const presetColors = [
    '#ffffff', '#ececec', '#d5d5d5', '#b0b0b0', '#8c8c8c',
    '#6e6e6e', '#525252', '#383838', '#262626', '#000000',
    '#ff0000', '#ff7700', '#ffdd00', '#00ff00', '#00ffff',
    '#0000ff', '#dd00ff', '#ff0088', '#990000', '#aa5500'
  ]

  return (
    <div style={{
      position: 'absolute',
      top: '12px',
      left: '12px',
      zIndex: 1000,
      width: 'clamp(180px, 85vw, 200px)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '11px',
      color: '#d5d5d5',
      userSelect: 'none'
    }}>
      {/* Header - Always Visible */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          background: 'linear-gradient(to bottom, #3e3e3e 0%, #2d2d2d 100%)',
          border: '1px solid #1a1a1a',
          borderBottom: isExpanded ? '1px solid #2d2d2d' : '1px solid #1a1a1a',
          borderRadius: isExpanded ? '3px 3px 0 0' : '3px',
          padding: '6px 8px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
          transition: 'background 0.1s',
          minHeight: '28px'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(to bottom, #494949 0%, #373737 100%)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(to bottom, #3e3e3e 0%, #2d2d2d 100%)'}>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '6px',
          fontSize: '11px',
          fontWeight: '400',
          color: '#c5c5c5'
        }}>
          {/* Color icon */}
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="#8c8c8c" strokeWidth="1.5"/>
            <path d="M8 2 L8 14 M2 8 L14 8" stroke="#8c8c8c" strokeWidth="1.5"/>
          </svg>
          <span>Color</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{
            width: '20px',
            height: '14px',
            borderRadius: '2px',
            backgroundColor: color,
            border: '1px solid #000',
            boxShadow: 'inset 0 0 2px rgba(0,0,0,0.5)',
            flexShrink: 0
          }} />
          {/* Triangle */}
          <svg 
            width="8" 
            height="8" 
            viewBox="0 0 8 8"
            style={{ 
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.15s'
            }}>
            <path d="M1 2 L4 6 L7 2" fill="none" stroke="#8c8c8c" strokeWidth="1.5"/>
          </svg>
        </div>
      </div>

      {/* Expanded Panel */}
      {isExpanded && (
        <div style={{
          background: '#3a3a3a',
          border: '1px solid #1a1a1a',
          borderTop: 'none',
          borderRadius: '0 0 3px 3px',
          padding: '8px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.5)',
          maxHeight: '400px',
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch'
        }}
        className="blender-scrollbar">
          {/* Hex Input */}
          <div style={{
            background: '#2a2a2a',
            border: '1px solid #1a1a1a',
            borderRadius: '2px',
            padding: '4px 6px',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '2px',
              backgroundColor: color,
              border: '1px solid #000',
              boxShadow: 'inset 0 0 2px rgba(0,0,0,0.5)',
              flexShrink: 0
            }} />
            <input
              type="text"
              value={color.toUpperCase()}
              onChange={(e) => {
                const val = e.target.value
                if (/^#[0-9A-F]{0,6}$/i.test(val)) {
                  if (val.length === 7) onChange(val)
                }
              }}
              style={{
                flex: 1,
                background: '#1e1e1e',
                border: '1px solid #000',
                borderRadius: '2px',
                padding: '3px 5px',
                color: '#d5d5d5',
                fontSize: '10px',
                fontFamily: 'monospace',
                outline: 'none',
                minWidth: 0
              }}
            />
          </div>

          {/* Color Wheel Picker */}
          <div style={{ marginBottom: '8px' }}>
            <input
              type="color"
              value={color}
              onChange={(e) => onChange(e.target.value)}
              style={{
                width: '100%',
                height: '80px',
                border: '1px solid #1a1a1a',
                borderRadius: '2px',
                cursor: 'pointer',
                background: '#2a2a2a',
                padding: '2px'
              }}
            />
          </div>

          {/* Presets Label */}
          <div style={{
            fontSize: '9px',
            color: '#8c8c8c',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '6px',
            fontWeight: '500'
          }}>
            Presets
          </div>

          {/* Presets Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '4px',
            marginBottom: '4px'
          }}>
            {presetColors.map((preset, index) => (
              <button
                key={index}
                onClick={() => onChange(preset)}
                title={preset}
                style={{
                  padding: 0,
                  border: color === preset ? '2px solid #5680c2' : '1px solid #1a1a1a',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  transition: 'border-color 0.1s',
                  background: preset,
                  aspectRatio: '1',
                  minHeight: '24px',
                  minWidth: '24px',
                  boxShadow: 'inset 0 0 2px rgba(0,0,0,0.3)',
                  outline: 'none'
                }}
                onMouseEnter={(e) => {
                  if (color !== preset) {
                    e.currentTarget.style.borderColor = '#5680c2'
                    e.currentTarget.style.borderWidth = '2px'
                  }
                }}
                onMouseLeave={(e) => {
                  if (color !== preset) {
                    e.currentTarget.style.borderColor = '#1a1a1a'
                    e.currentTarget.style.borderWidth = '1px'
                  }
                }}
              />
            ))}
          </div>
        </div>
      )}

      <style>{`
        /* Blender-style scrollbar */
        .blender-scrollbar::-webkit-scrollbar {
          width: 10px;
          background: #2a2a2a;
        }

        .blender-scrollbar::-webkit-scrollbar-track {
          background: #2a2a2a;
          border-left: 1px solid #1a1a1a;
        }

        .blender-scrollbar::-webkit-scrollbar-thumb {
          background: #5a5a5a;
          border-radius: 0;
          border: 1px solid #4a4a4a;
        }

        .blender-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6a6a6a;
        }

        .blender-scrollbar::-webkit-scrollbar-thumb:active {
          background: #7a7a7a;
        }

        /* Firefox scrollbar */
        .blender-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #5a5a5a #2a2a2a;
        }

        /* Mobile touch feedback */
        @media (hover: none) and (pointer: coarse) {
          button:active {
            transform: scale(0.95);
          }
        }

        /* Ensure proper touch scrolling on mobile */
        @media (max-width: 768px) {
          .blender-scrollbar {
            -webkit-overflow-scrolling: touch;
            overflow-y: scroll !important;
          }
        }
      `}</style>
    </div>
  )
}

export default ColorPicker