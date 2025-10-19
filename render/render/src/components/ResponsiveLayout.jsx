import React from 'react'
import { useResponsive } from '../hooks/useResponsive'

function ResponsiveLayout({ children, className = '' }) {
  const { 
    isMobile, 
    isTablet, 
    isDesktop, 
    orientation,
    getBreakpoint,
    isTouch 
  } = useResponsive()

  const layoutClasses = [
    'responsive-layout',
    `responsive-layout--${getBreakpoint()}`,
    `responsive-layout--${orientation}`,
    isTouch ? 'responsive-layout--touch' : 'responsive-layout--mouse',
    className
  ].filter(Boolean).join(' ')

  return (
    <div className={layoutClasses}>
      {children}
    </div>
  )
}

export default ResponsiveLayout