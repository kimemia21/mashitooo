import React, { useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useResponsive } from '../hooks/useResponsive'

function MobileFirstSidebar({ 
  side = 'left', 
  isOpen = true, 
  onToggle, 
  children, 
  title,
  className = ''
}) {
  const { 
    isMobile, 
    isTablet, 
    isDesktop, 
    isTouch,
    orientation 
  } = useResponsive()
  
  const sidebarRef = useRef(null)
  const backdropRef = useRef(null)

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    if (!isMobile || !isOpen) return

    const handleClickOutside = (event) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        backdropRef.current &&
        backdropRef.current.contains(event.target)
      ) {
        onToggle()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [isMobile, isOpen, onToggle])

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [isMobile, isOpen])

  // Handle escape key
  useEffect(() => {
    if (!isMobile || !isOpen) return

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onToggle()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isMobile, isOpen, onToggle])

  const sideClass = side === 'right' ? 'sidebar--right' : 'sidebar--left'
  const collapsedClass = !isOpen ? 'sidebar--collapsed' : ''
  const mobileClass = isMobile ? 'sidebar--mobile' : ''
  const touchClass = isTouch ? 'sidebar--touch' : ''
  const orientationClass = `sidebar--${orientation}`
  
  const sidebarClasses = [
    'sidebar',
    sideClass,
    collapsedClass,
    mobileClass,
    touchClass,
    orientationClass,
    className
  ].filter(Boolean).join(' ')

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && isOpen && (
        <div 
          ref={backdropRef}
          className="sidebar__backdrop"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}
      
      <aside 
        ref={sidebarRef}
        className={sidebarClasses}
        aria-label={title}
        role="complementary"
      >
        {/* Mobile header with close button */}
        {isMobile && (
          <div className="sidebar__header">
            {title && <h2 className="sidebar__title">{title}</h2>}
            <button 
              className="btn btn--icon sidebar__close"
              onClick={onToggle}
              aria-label="Close sidebar"
            >
              <X size={16} />
            </button>
          </div>
        )}
        
        {/* Sidebar content */}
        <div className="sidebar__content scrollable">
          {children}
        </div>
        
        {/* Desktop toggle button */}
        {isDesktop && (
          <button
            className={`sidebar__toggle sidebar__toggle--${side}`}
            onClick={onToggle}
            title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
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

export default MobileFirstSidebar