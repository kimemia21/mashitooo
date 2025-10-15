import React, { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import IconButton from '../components/IconButton'

const ResponsiveLayout = ({ children, leftPanel, rightPanel, bottomControls }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640)
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 640 && window.innerWidth < 1024)
  const [leftPanelOpen, setLeftPanelOpen] = useState(false)
  const [rightPanelOpen, setRightPanelOpen] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      setIsMobile(width < 640)
      setIsTablet(width >= 640 && width < 1024)
      
      // Auto-close panels on mobile
      if (width < 640) {
        setLeftPanelOpen(false)
        setRightPanelOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleLeftPanel = () => setLeftPanelOpen(!leftPanelOpen)
  const toggleRightPanel = () => setRightPanelOpen(!rightPanelOpen)

  return (
    <div className="responsive-layout">
      {/* Mobile Menu Button */}
      {isMobile && (
        <div className="mobile-menu-button">
          <IconButton
            icon={Menu}
            onClick={toggleLeftPanel}
            tooltip="Open Menu"
            size={24}
          />
        </div>
      )}

      {/* Left Panel */}
      {leftPanel && (
        <>
          {/* Mobile Overlay */}
          {isMobile && leftPanelOpen && (
            <div 
              className="panel-overlay"
              onClick={() => setLeftPanelOpen(false)}
            />
          )}
          
          <div className={`
            left-panel 
            ${isMobile ? 'mobile' : ''} 
            ${leftPanelOpen ? 'open' : ''}
          `}>
            {isMobile && (
              <div className="panel-close">
                <IconButton
                  icon={X}
                  onClick={() => setLeftPanelOpen(false)}
                  tooltip="Close"
                  size={20}
                />
              </div>
            )}
            {leftPanel}
          </div>
        </>
      )}

      {/* Main Content */}
      <div className={`
        main-content 
        ${leftPanel ? 'has-left-panel' : ''} 
        ${rightPanel ? 'has-right-panel' : ''}
        ${isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'}
      `}>
        {children}
      </div>

      {/* Right Panel */}
      {rightPanel && !isMobile && (
        <div className="right-panel">
          {rightPanel}
        </div>
      )}

      {/* Bottom Controls */}
      {bottomControls && (
        <div className="bottom-controls">
          {bottomControls}
        </div>
      )}

      <style jsx>{`
        .responsive-layout {
          display: flex;
          width: 100vw;
          height: 100vh;
          position: relative;
          overflow: hidden;
        }

        .mobile-menu-button {
          position: fixed;
          top: 16px;
          left: 16px;
          z-index: 1001;
        }

        .panel-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 999;
          backdrop-filter: blur(4px);
        }

        .left-panel {
          position: fixed;
          top: 0;
          left: 0;
          width: var(--panel-width);
          height: 100vh;
          background: var(--bg-secondary);
          border-right: 1px solid var(--border-color);
          box-shadow: var(--shadow-md);
          z-index: 1000;
          transition: transform 0.3s ease;
          overflow-y: auto;
        }

        .left-panel.mobile {
          width: 90vw;
          max-width: 320px;
          transform: translateX(-100%);
        }

        .left-panel.mobile.open {
          transform: translateX(0);
        }

        .panel-close {
          position: sticky;
          top: 0;
          right: 0;
          padding: 16px;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-color);
          display: flex;
          justify-content: flex-end;
        }

        .main-content {
          flex: 1;
          position: relative;
          overflow: hidden;
        }

        .main-content.has-left-panel.desktop {
          margin-left: var(--panel-width);
        }

        .main-content.has-right-panel.desktop {
          margin-right: var(--panel-width);
        }

        .right-panel {
          position: fixed;
          top: 0;
          right: 0;
          width: var(--panel-width);
          height: 100vh;
          background: var(--bg-secondary);
          border-left: 1px solid var(--border-color);
          box-shadow: var(--shadow-md);
          z-index: 1000;
          overflow-y: auto;
        }

        .bottom-controls {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: var(--bg-secondary);
          border-top: 1px solid var(--border-color);
          padding: 12px 16px;
          z-index: 1000;
          box-shadow: var(--shadow-md);
        }

        @media (max-width: 639px) {
          .left-panel:not(.mobile) {
            display: none;
          }
          
          .right-panel {
            display: none;
          }

          .main-content {
            margin: 0 !important;
          }

          .bottom-controls {
            padding: 16px;
          }
        }

        @media (min-width: 640px) and (max-width: 1023px) {
          .left-panel {
            width: 240px;
          }
          
          .right-panel {
            width: 240px;
          }
        }
      `}</style>
    </div>
  )
}

export default ResponsiveLayout