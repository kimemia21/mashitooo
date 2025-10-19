import React, { useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, X, Sparkles } from 'lucide-react'
import { useResponsive } from '../hooks/useResponsive'

function ArtisticSidebar({ 
  side = 'left', 
  isOpen = true, 
  onToggle, 
  children, 
  title,
  className = '',
  theme = 'creative' // 'creative', 'tools', 'properties'
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

  const sideClass = side === 'right' ? 'artistic-sidebar--right' : 'artistic-sidebar--left'
  const collapsedClass = !isOpen ? 'artistic-sidebar--collapsed' : ''
  const mobileClass = isMobile ? 'artistic-sidebar--mobile' : ''
  const touchClass = isTouch ? 'artistic-sidebar--touch' : ''
  const orientationClass = `artistic-sidebar--${orientation}`
  const themeClass = `artistic-sidebar--${theme}`
  
  const sidebarClasses = [
    'artistic-sidebar',
    sideClass,
    collapsedClass,
    mobileClass,
    touchClass,
    orientationClass,
    themeClass,
    className
  ].filter(Boolean).join(' ')

  const getThemeGradient = () => {
    switch (theme) {
      case 'tools':
        return 'var(--gradient-sunset)'
      case 'properties':
        return 'var(--gradient-ocean)'
      default:
        return 'var(--gradient-aurora)'
    }
  }

  const getThemeIcon = () => {
    switch (theme) {
      case 'tools':
        return '🎨'
      case 'properties':
        return '⚙️'
      default:
        return '✨'
    }
  }

  return (
    <>
      {/* Artistic mobile backdrop */}
      {isMobile && isOpen && (
        <div 
          ref={backdropRef}
          className="artistic-sidebar__backdrop"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}
      
      <aside 
        ref={sidebarRef}
        className={sidebarClasses}
        aria-label={title}
        role="complementary"
        style={{
          '--theme-gradient': getThemeGradient()
        }}
      >
        {/* Artistic header with theme */}
        <div className="artistic-sidebar__header">
          <div className="sidebar-header__content">
            <div className="sidebar-header__icon">
              {getThemeIcon()}
            </div>
            <div className="sidebar-header__text">
              {title && <h2 className="sidebar-header__title">{title}</h2>}
              <span className="sidebar-header__subtitle">
                {theme === 'tools' && 'Creative Toolkit'}
                {theme === 'properties' && 'Design Controls'}
                {theme === 'creative' && 'Inspiration Hub'}
              </span>
            </div>
          </div>
          
          {isMobile && (
            <button 
              className="btn btn--icon sidebar-header__close tooltip"
              onClick={onToggle}
              aria-label="Close sidebar"
              data-tooltip="Close Panel"
            >
              <X size={16} />
            </button>
          )}
        </div>
        
        {/* Artistic border accent */}
        <div className="artistic-sidebar__accent"></div>
        
        {/* Sidebar content with artistic scrolling */}
        <div className="artistic-sidebar__content">
          <div className="sidebar-content__inner">
            {children}
          </div>
        </div>
        
        {/* Desktop toggle button with artistic styling */}
        {isDesktop && (
          <button
            className={`artistic-sidebar__toggle artistic-sidebar__toggle--${side} tooltip`}
            onClick={onToggle}
            data-tooltip={isOpen ? 'Collapse Panel' : 'Expand Panel'}
            aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <div className="toggle-icon">
              {side === 'left' ? (
                isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />
              ) : (
                isOpen ? <ChevronRight size={14} /> : <ChevronLeft size={14} />
              )}
            </div>
            <div className="toggle-glow"></div>
          </button>
        )}
        
        {/* Artistic bottom fade */}
        <div className="artistic-sidebar__fade"></div>
      </aside>
    </>
  )
}

export default ArtisticSidebar