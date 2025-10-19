import React from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

function Sidebar({ 
  side = 'left', 
  isOpen = true, 
  onToggle, 
  children, 
  title,
  isMobile = false 
}) {
  const sideClass = side === 'right' ? 'sidebar--right' : ''
  const collapsedClass = !isOpen ? 'sidebar--collapsed' : ''
  
  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && isOpen && (
        <div 
          className="sidebar__backdrop"
          onClick={onToggle}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 99
          }}
        />
      )}
      
      <aside className={`sidebar ${sideClass} ${collapsedClass}`}>
        {isMobile && (
          <div className="sidebar__header">
            {title && <h2>{title}</h2>}
            <button 
              className="btn btn--icon"
              onClick={onToggle}
              title="Close"
            >
              <X size={16} />
            </button>
          </div>
        )}
        
        <div className="sidebar__content">
          {children}
        </div>
        
        {/* Desktop toggle button */}
        {!isMobile && (
          <button
            className={`sidebar__toggle sidebar__toggle--${side}`}
            onClick={onToggle}
            title={isOpen ? 'Collapse' : 'Expand'}
          >
            {side === 'left' ? (
              isOpen ? <ChevronLeft size={12} /> : <ChevronRight size={12} />
            ) : (
              isOpen ? <ChevronRight size={12} /> : <ChevronLeft size={12} />
            )}
          </button>
        )}
      </aside>
    </>
  )
}

export default Sidebar