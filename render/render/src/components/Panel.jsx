import React, { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

const Panel = ({ 
  title, 
  children, 
  collapsible = false, 
  defaultOpen = true,
  className = '',
  ...props 
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  const togglePanel = () => {
    if (collapsible) {
      setIsOpen(!isOpen)
    }
  }

  return (
    <div className={`panel ${collapsible ? 'collapsible' : ''} ${className}`} {...props}>
      <div 
        className="panel-header"
        onClick={togglePanel}
        style={{ cursor: collapsible ? 'pointer' : 'default' }}
      >
        <span>{title}</span>
        {collapsible && (
          <div className="icon-btn" style={{ width: '20px', height: '20px', border: 'none', background: 'transparent' }}>
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        )}
      </div>
      
      {isOpen && (
        <div 
          className="panel-content"
          style={{
            maxHeight: isOpen ? '1000px' : '0',
            overflow: 'hidden',
            transition: 'max-height 0.3s ease, padding 0.3s ease',
            padding: isOpen ? '16px' : '0 16px'
          }}
        >
          {children}
        </div>
      )}
    </div>
  )
}

export default Panel