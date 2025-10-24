import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import ColorPicker from './ColorPicker'
import StickerPicker from './StickerPicker'
import ModelSwitcher from './ModelSwitcher'

const Panel = ({ 
  title = "Design Customization",
  collapsible = false, 
  defaultOpen = true,
  className = '',
  type = 'full', // 'full', 'modelPicker', 'colorPicker', 'stickerPicker'
  
  // ModelSwitcher props
  currentModel,
  onModelChange,
  
  // ColorPicker props
  color,
  onColorChange,
  originalColor,
  
  // StickerPicker props
  stickers,
  onStickerSelect,
  onStickerUpload,
  
  ...props 
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [contentHeight, setContentHeight] = useState('auto')
  const contentRef = useRef(null)

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight)
    }
  }, [isOpen, stickers, color])

  const togglePanel = () => {
    if (collapsible) {
      setIsOpen(!isOpen)
    }
  }

  // Render content based on type
  const renderContent = () => {
    switch (type) {
      case 'modelPicker':
        return (
          <ModelSwitcher 
            currentModel={currentModel}
            onModelChange={onModelChange}
          />
        )
      
      case 'colorPicker':
        return (
          <ColorPicker 
            color={color}
            onChange={onColorChange}
            originalColor={originalColor}
          />
        )
      
      case 'stickerPicker':
        return (
          <StickerPicker 
            onStickerSelect={onStickerSelect}
            stickers={stickers}
            onStickerUpload={onStickerUpload}
          />
        )
      
      case 'full':
      default:
        return (
          <>
            <ColorPicker 
              color={color}
              onChange={onColorChange}
              originalColor={originalColor}
            />

            <StickerPicker 
              onStickerSelect={onStickerSelect}
              stickers={stickers}
              onStickerUpload={onStickerUpload}
            />
          </>
        )
    }
  }

  return (
    <div 
      className={`panel ${collapsible ? 'collapsible' : ''} ${className}`} 
      {...props}
      style={{
        backgroundColor: '#1a1a1a',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        marginBottom: '12px',
        width: '100%',
        maxWidth: '384px', // Compact max width
        marginLeft: 'auto',
        marginRight: 'auto',
        boxSizing: 'border-box'
      }}
    >
      <div 
        className="panel-header"
        onClick={togglePanel}
        style={{ 
          cursor: collapsible ? 'pointer' : 'default',
          padding: window.innerWidth < 640 ? '12px 14px' : '14px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: collapsible ? (isOpen ? 'rgba(139, 92, 246, 0.1)' : 'transparent') : 'transparent',
          transition: 'background-color 0.2s ease',
          userSelect: 'none',
          WebkitTapHighlightColor: 'transparent',
          gap: '12px',
          minHeight: '48px'
        }}
      >
        <span 
          style={{ 
            fontWeight: '600',
            fontSize: '14px',
            color: '#fff',
            flex: 1,
            lineHeight: '1.5',
            wordBreak: 'break-word'
          }}
        >
          {title}
        </span>
        {collapsible && (
          <div 
            className="icon-btn" 
            style={{ 
              width: '32px',
              height: '32px',
              border: 'none',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'background-color 0.2s ease'
            }}
          >
            {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        )}
      </div>
      
      <div 
        style={{
          maxHeight: isOpen ? `${contentHeight}px` : '0',
          overflow: 'hidden',
          transition: 'max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div 
          ref={contentRef}
          className="panel-content"
          style={{
            padding: type === 'modelPicker' ? '0' : window.innerWidth < 640 ? '12px 14px' : '16px',
            fontSize: '14px',
            lineHeight: '1.6',
            color: 'rgba(255, 255, 255, 0.9)',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
            display: 'flex',
            flexDirection: 'column',
            gap: window.innerWidth < 640 ? '12px' : '16px'
          }}
        >
          {renderContent()}
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 640px) {
          .panel {
            margin-bottom: 8px;
          }
        }

        /* Smooth touch interactions on mobile */
        @media (hover: none) and (pointer: coarse) {
          .panel-header:active {
            opacity: 0.8;
          }
          
          .icon-btn:active {
            transform: scale(0.95);
          }
        }

        /* Better scrolling on mobile */
        .panel-content {
          -webkit-overflow-scrolling: touch;
        }

        /* Ensure proper touch targets on mobile */
        @media (max-width: 640px) {
          .icon-btn {
            min-width: 36px;
            min-height: 36px;
          }
        }
      `}</style>
    </div>
  )
}

export default Panel