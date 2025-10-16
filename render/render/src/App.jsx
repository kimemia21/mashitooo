import React, { useState, useRef } from 'react'
import { Menu, X, RotateCcw, Home, Maximize2, Eye, Layers } from 'lucide-react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Center } from '@react-three/drei'
import * as THREE from 'three'
import TShirtModel from './components/TShirtModel'
import ModernBackground from './components/ModernBackground'
import ColorPicker from './components/ColorPicker'
import StickerPicker from './components/StickerPicker'
import EditModeUI from './components/EditModeUI'
import StickerEditor from './components/StickerEditor'
import { preprocessStickers, createStickerPreview, debugCoordinateMapping, verifyCoordinateSystem } from './utils/stickerMapping'
import './theme.css'
import './mobile-fixes.css'
import './styles/simple-mobile.css'
import { useResponsive } from './hooks/useResponsive'
import Panel from './components/Panel'
import IconButton from './components/IconButton'

// View Controls Component for quick view switching
function ViewControls({ onViewChange, onReset, currentView }) {
  const views = [
    { name: 'front', label: 'Front', key: '1', icon: '👕' },
    { name: 'back', label: 'Back', key: '2', icon: '🔙' },
    { name: 'left', label: 'Left', key: '3', icon: '⬅️' },
    { name: 'right', label: 'Right', key: '4', icon: '➡️' },
  ]

  return (
    <div style={{
      display: 'flex',
      gap: '8px',
      padding: '12px',
      background: 'rgba(42, 42, 42, 0.95)',
      borderRadius: '12px',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 4px 24px rgba(0,0,0,0.3)'
    }}>
      {views.map(view => (
        <button
          key={view.name}
          onClick={() => {
            if (window.tshirtModelControls) {
              window.tshirtModelControls[`snapTo${view.name.charAt(0).toUpperCase() + view.name.slice(1)}`]()
            }
          }}
          className={`btn ${currentView === view.name ? 'primary' : 'secondary'}`}
          style={{
            padding: '8px 16px',
            fontSize: '13px',
            minWidth: '70px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease'
          }}
        >
          <span>{view.icon}</span>
          {view.label}
          <span style={{ 
            opacity: 0.5, 
            fontSize: '11px', 
            marginLeft: '2px' 
          }}>
            {view.key}
          </span>
        </button>
      ))}
      <button
        onClick={onReset}
        className="btn secondary"
        style={{
          padding: '8px 16px',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}
      >
        <Home size={14} />
        Reset
      </button>
    </div>
  )
}

// Keyboard Shortcuts Overlay
function KeyboardShortcuts({ show }) {
  if (!show) return null
  
  return (
    <div style={{
      position: 'absolute',
      bottom: '80px',
      right: '20px',
      zIndex: 100,
      background: 'rgba(42, 42, 42, 0.95)',
      padding: '16px',
      borderRadius: '8px',
      fontSize: '12px',
      color: '#d5d5d5',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      maxWidth: '220px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.3)'
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '13px' }}>
        ⌨️ Keyboard Shortcuts
      </div>
      <div style={{ display: 'grid', gap: '6px', lineHeight: '1.5' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ opacity: 0.7 }}>1-4</span>
          <span>Quick views</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ opacity: 0.7 }}>Arrows</span>
          <span>Rotate</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ opacity: 0.7 }}>+/-</span>
          <span>Zoom in/out</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ opacity: 0.7 }}>R</span>
          <span>Reset view</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ opacity: 0.7 }}>Scroll</span>
          <span>Zoom</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ opacity: 0.7 }}>Drag</span>
          <span>Rotate model</span>
        </div>
      </div>
    </div>
  )
}

// Mobile Gesture Help Overlay
function MobileGestureHelp({ show }) {
  if (!show) return null
  
  return (
    <div style={{
      position: 'fixed',
      top: '70px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 100,
      background: 'rgba(42, 42, 42, 0.95)',
      padding: '10px 20px',
      borderRadius: '20px',
      fontSize: '11px',
      color: '#d5d5d5',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      whiteSpace: 'nowrap',
      boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
      maxWidth: '90vw',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <span>👆 Drag to rotate</span>
        <span>•</span>
        <span>🤏 Pinch to zoom</span>
        <span>•</span>
        <span>👆👆 Double tap reset</span>
      </div>
    </div>
  )
}

// Zoom Level Indicator
function ZoomIndicator({ zoom, show }) {
  if (!show) return null
  
  const percentage = Math.round(zoom * 100)
  
  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      right: '20px',
      zIndex: 100,
      background: 'rgba(42, 42, 42, 0.95)',
      padding: '8px 16px',
      borderRadius: '20px',
      fontSize: '12px',
      color: '#d5d5d5',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
      transition: 'opacity 0.3s ease',
      opacity: 0.8
    }}>
      <Maximize2 size={14} />
      <span style={{ fontWeight: 'bold' }}>{percentage}%</span>
    </div>
  )
}

function App() {
  // Core application state
  const [appMode, setAppMode] = useState('VIEW') // 'VIEW', 'EDIT', 'MESH_EDIT'
  const [editSide, setEditSide] = useState(null) // 'FRONT', 'BACK'
  const [tshirtColor, setTshirtColor] = useState('#ffffff')
  const [stickers, setStickers] = useState([])
  const [stickerLibrary, setStickerLibrary] = useState([
    { url: '/sample-sticker.svg', name: 'Sample Sticker' },
    { url: '/test-sticker.svg', name: 'Test Sticker' }
  ])
  
  // 2D Editor state (for edit mode)
  const [editorStickers, setEditorStickers] = useState([])
  const [selectedSticker, setSelectedSticker] = useState(null)
  const [isApplying, setIsApplying] = useState(false)
  
  // 3D View state
  const [currentView, setCurrentView] = useState('front')
  const [modelRotation, setModelRotation] = useState({ x: 0, y: 0 })
  const [modelZoom, setModelZoom] = useState(1)
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(true)
  const [showGestureHelp, setShowGestureHelp] = useState(true)
  const [showZoomIndicator, setShowZoomIndicator] = useState(false)
  
  const controlsRef = useRef()
  const zoomTimeoutRef = useRef(null)
  const { isMobile, isTablet, isDesktop } = useResponsive()
  
  // UI state for mobile
  const [leftPanelOpen, setLeftPanelOpen] = useState(false)
  const [rightPanelOpen, setRightPanelOpen] = useState(false)

  // Hide help overlays after a few seconds
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowKeyboardHelp(false)
      setShowGestureHelp(false)
    }, 5000)
    return () => clearTimeout(timer)
  }, [])

  // Handle model rotation changes
  const handleModelRotationChange = (rot) => {
    setModelRotation(rot)
    // Detect which view we're closest to
    const normalizedY = ((rot.y % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
    if (normalizedY < Math.PI / 4 || normalizedY > (7 * Math.PI / 4)) {
      setCurrentView('front')
    } else if (normalizedY > (3 * Math.PI / 4) && normalizedY < (5 * Math.PI / 4)) {
      setCurrentView('back')
    } else if (normalizedY > (Math.PI / 4) && normalizedY < (3 * Math.PI / 4)) {
      setCurrentView('right')
    } else {
      setCurrentView('left')
    }
  }

  // Handle zoom indicator display
  const handleZoomChange = (zoom) => {
    setModelZoom(zoom)
    setShowZoomIndicator(true)
    
    if (zoomTimeoutRef.current) {
      clearTimeout(zoomTimeoutRef.current)
    }
    
    zoomTimeoutRef.current = setTimeout(() => {
      setShowZoomIndicator(false)
    }, 1500)
  }

  // Handle entering edit mode
  const handleEditMode = () => {
    setAppMode('EDIT')
  }

  // Handle side selection (front/back)
  const handleSideSelect = (side) => {
    setEditSide(side)
    // Load existing stickers for this side
    const sideStickers = stickers.filter(s => s.side === side)
    setEditorStickers(sideStickers.map(s => ({
      ...s,
      x: s.editorX || 50,
      y: s.editorY || 50,
      width: s.editorWidth || 100,
      height: s.editorHeight || 100,
      rotation: s.editorRotation || 0
    })))
  }

  // Handle adding sticker to 2D editor
  const handleAddSticker = (sticker) => {
    const newSticker = {
      id: Date.now(),
      url: sticker.url,
      name: sticker.name,
      x: 50,
      y: 50,
      width: 100,
      height: 100,
      rotation: 0,
      side: editSide
    }
    setEditorStickers([...editorStickers, newSticker])
  }

  // Handle sticker upload
  const handleStickerUpload = (dataUrl, fileName) => {
    const newSticker = { url: dataUrl, name: fileName }
    setStickerLibrary([...stickerLibrary, newSticker])
  }

  // Handle sticker positioning in 2D editor
  const handleStickerUpdate = (stickerId, updates) => {
    setEditorStickers(editorStickers.map(s => 
      s.id === stickerId ? { ...s, ...updates } : s
    ))
  }

  // Handle deleting sticker
  const handleStickerDelete = (stickerId) => {
    setEditorStickers(editorStickers.filter(s => s.id !== stickerId))
    if (selectedSticker === stickerId) {
      setSelectedSticker(null)
    }
  }

  // Apply 2D editor changes to 3D model
  const handleApplyChanges = async () => {
    setIsApplying(true)
    
    try {
      verifyCoordinateSystem(editorStickers)
      const otherSideStickers = stickers.filter(s => s.side !== editSide)
      
      console.log(`\n🎯 === APPLYING ${editSide} SIDE STICKERS ===`)
      console.log(`Processing ${editorStickers.length} stickers from 2D editor...`)
      
      editorStickers.forEach((sticker, index) => {
        console.log(`Editor Sticker ${index + 1}: "${sticker.name}"`, {
          position: `${sticker.x}%, ${sticker.y}%`,
          size: `${sticker.width}px × ${sticker.height}px`,
          rotation: `${sticker.rotation || 0}°`
        })
      })
      
      console.log('\n🔄 Processing coordinates...')
      const processedStickers = await preprocessStickers(editorStickers, editSide)
      
      let allMappingsPerfect = true
      processedStickers.forEach((processed, index) => {
        const original = editorStickers[index]
        const isPerfect = debugCoordinateMapping(original, processed)
        if (!isPerfect) allMappingsPerfect = false
        
        const preview = createStickerPreview(original, editSide)
        if (preview.warnings.length > 0) {
          console.warn(`⚠️ Position warnings for "${processed.name}":`, preview.warnings)
        }
        
        if (preview.isPerfectMapping) {
          console.log(`✅ Perfect 1:1 mapping verified for "${processed.name}"`)
        } else {
          console.error(`❌ Mapping failed for "${processed.name}"`)
          allMappingsPerfect = false
        }
      })
      
      if (!allMappingsPerfect) {
        console.error('❌ COORDINATE MAPPING VERIFICATION FAILED!')
        console.error('Stickers may not appear in correct positions!')
      } else {
        console.log('✅ ALL COORDINATE MAPPINGS VERIFIED PERFECT!')
      }
      
      const finalStickers = processedStickers.map(sticker => ({
        ...sticker,
        side: editSide,
        editorX: sticker.originalX,
        editorY: sticker.originalY,
        editorWidth: sticker.originalWidth,
        editorHeight: sticker.originalHeight,
        editorRotation: sticker.originalRotation,
        processed: true,
        appliedAt: new Date().toISOString(),
        mappingVerified: allMappingsPerfect
      }))
      
      console.log('\n📋 Final stickers being sent to 3D model:')
      finalStickers.forEach((sticker, index) => {
        console.log(`3D Sticker ${index + 1}: "${sticker.name}"`, {
          position: `${sticker.x}%, ${sticker.y}%`,
          size: `${sticker.width}px × ${sticker.height}px`,
          rotation: `${sticker.rotation}°`,
          side: sticker.side
        })
      })
      
      console.log('\n⏳ Generating 3D texture...')
      await new Promise(resolve => setTimeout(resolve, 1200))
      
      setStickers([...otherSideStickers, ...finalStickers])
      
      console.log(`\n✅ SUCCESSFULLY APPLIED ${finalStickers.length} STICKERS TO ${editSide} SIDE`)
      console.log('🎯 Stickers should now appear in EXACT same positions on 3D model!')
      
    } catch (error) {
      console.error('❌ CRITICAL ERROR applying stickers:', error)
      alert('Error applying stickers. Please check console for details and try again.')
    } finally {
      setIsApplying(false)
      setAppMode('VIEW')
      setEditSide(null)
      setEditorStickers([])
      setSelectedSticker(null)
      console.log('\n🏁 === APPLY PROCESS COMPLETE ===\n')
    }
  }

  // Cancel edit mode
  const handleCancelEdit = () => {
    setAppMode('VIEW')
    setEditSide(null)
    setEditorStickers([])
    setSelectedSticker(null)
  }

  // Reset camera view
  const handleResetView = () => {
    if (window.tshirtModelControls) {
      window.tshirtModelControls.reset()
    }
    setModelZoom(1)
  }

  return (
    <div className="app-container" style={{ 
      width: '100vw', 
      height: '100dvh',
      position: 'relative',
      background: 'var(--bg-primary)',
      overflow: 'hidden',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      
      {/* Main 3D View Mode */}
      {appMode === 'VIEW' && (
        <>
          <Canvas
            camera={{ position: [0, 0, 5], fov: 50 }}
            style={{ width: '100%', height: '100%' }}
            gl={{ 
              antialias: true,
              alpha: false,
              powerPreference: 'high-performance',
              preserveDrawingBuffer: false
            }}
            dpr={Math.min(window.devicePixelRatio, 2)}
            shadows
          >
            {/* Modern Studio Lighting */}
            <ambientLight intensity={0.3} />
            <directionalLight 
              position={[10, 10, 5]} 
              intensity={1.2} 
              castShadow 
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
              shadow-camera-far={50}
              shadow-camera-left={-10}
              shadow-camera-right={10}
              shadow-camera-top={10}
              shadow-camera-bottom={-10}
            />
            <directionalLight position={[-5, 5, 5]} intensity={0.3} />
            <pointLight position={[0, -5, 5]} intensity={0.4} color="#4a9eff" />
            
            <Environment preset="studio" />
            
            {/* Modern Background */}
            <ModernBackground />
            
            {/* Enhanced T-Shirt Model with Advanced Controls */}
            <Center>
              <TShirtModel
                color={tshirtColor}
                stickers={stickers}
                viewMode="rendered"
                enableAdvancedControls={true}
                onRotationChange={handleModelRotationChange}
                selectedSticker={selectedSticker}
                onStickerSelect={setSelectedSticker}
                onStickerUpdate={handleStickerUpdate}
              />
            </Center>
          </Canvas>

          {/* Zoom Level Indicator */}
          <ZoomIndicator zoom={modelZoom} show={showZoomIndicator} />

          {/* Mobile Menu Button */}
          {isMobile && (
            <div style={{
              position: 'fixed',
              top: '16px',
              left: '16px',
              zIndex: 1001
            }}>
              <IconButton
                icon={leftPanelOpen ? X : Menu}
                onClick={() => setLeftPanelOpen(!leftPanelOpen)}
                tooltip="Menu"
                size={24}
              />
            </div>
          )}

          {/* Mobile Overlay */}
          {isMobile && leftPanelOpen && (
            <div 
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                zIndex: 999,
                backdropFilter: 'blur(4px)'
              }}
              onClick={() => setLeftPanelOpen(false)}
            />
          )}

          {/* Left Panel - Color Picker */}
          <div style={{
            position: isMobile ? 'fixed' : 'absolute',
            top: 0,
            left: 0,
            width: isMobile ? '90vw' : 'auto',
            maxWidth: isMobile ? '320px' : 'none',
            height: isMobile ? '100vh' : 'auto',
            zIndex: 1000,
            transform: isMobile ? (leftPanelOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none',
            transition: 'transform 0.3s ease',
            pointerEvents: 'auto'
          }}>
            <Panel 
              title="Colors" 
              collapsible={!isMobile} 
              defaultOpen={!isMobile}
            >
              <ColorPicker 
                color={tshirtColor} 
                onChange={setTshirtColor} 
              />
            </Panel>
          </div>
          
          {/* Right Panel - Sticker Picker (Desktop Only) */}
          {!isMobile && (
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              zIndex: 100,
              pointerEvents: 'auto'
            }}>
              <Panel 
                title="Stickers" 
                collapsible={true} 
                defaultOpen={false}
              >
                <StickerPicker 
                  onStickerSelect={handleAddSticker}
                  stickers={stickerLibrary}
                  onStickerUpload={handleStickerUpload}
                />
              </Panel>
            </div>
          )}

          {/* Desktop View Controls */}
          {!isMobile && (
            <div style={{
              position: 'absolute',
              top: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 200
            }}>
              <ViewControls 
                currentView={currentView}
                onViewChange={setCurrentView}
                onReset={handleResetView}
              />
            </div>
          )}

          {/* Keyboard Shortcuts Help */}
          {!isMobile && <KeyboardShortcuts show={showKeyboardHelp} />}

          {/* Mobile Gesture Help */}
          {isMobile && <MobileGestureHelp show={showGestureHelp} />}

          {/* Floating Action Buttons - Mobile */}
          {isMobile && (
            <>
              {/* Bottom Right FAB Group */}
              <div style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                zIndex: 200,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <IconButton
                  icon={Home}
                  onClick={handleResetView}
                  tooltip="Reset View"
                  size={20}
                />
                <IconButton
                  icon={Eye}
                  onClick={() => setShowGestureHelp(!showGestureHelp)}
                  tooltip="Toggle Help"
                  size={20}
                />
              </div>

              {/* Bottom Center - Primary Action */}
              <div style={{
                position: 'fixed',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 200
              }}>
                <button 
                  onClick={handleEditMode}
                  className="btn primary"
                  style={{
                    padding: '16px 32px',
                    fontSize: '16px',
                    borderRadius: '24px',
                    boxShadow: 'var(--glow)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Layers size={20} />
                  Edit Design
                </button>
              </div>
            </>
          )}

          {/* Desktop Controls */}
          {!isMobile && (
            <div style={{
              position: 'absolute',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 200,
              display: 'flex',
              gap: '12px',
              alignItems: 'center'
            }}>
              <button 
                onClick={handleEditMode}
                className="btn primary"
                style={{
                  padding: '12px 24px',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Layers size={18} />
                Edit Design
              </button>

              <IconButton
                icon={Home}
                onClick={handleResetView}
                tooltip="Reset View"
                size={18}
              />
              
              <IconButton
                icon={Eye}
                onClick={() => setShowKeyboardHelp(!showKeyboardHelp)}
                tooltip="Toggle Shortcuts"
                size={18}
              />
            </div>
          )}
        </>
      )}

      {/* Edit Mode - Side Selection */}
      {appMode === 'EDIT' && !editSide && (
        <EditModeUI 
          onSideSelect={handleSideSelect}
          onCancel={handleCancelEdit}
        />
      )}

      {/* Edit Mode - 2D Sticker Editor */}
      {appMode === 'EDIT' && editSide && (
        <StickerEditor
          side={editSide}
          stickers={editorStickers}
          stickerLibrary={stickerLibrary}
          selectedSticker={selectedSticker}
          onStickerSelect={setSelectedSticker}
          onStickerAdd={handleAddSticker}
          onStickerUpdate={handleStickerUpdate}
          onStickerDelete={handleStickerDelete}
          onStickerUpload={handleStickerUpload}
          onApply={handleApplyChanges}
          onCancel={handleCancelEdit}
          isApplying={isApplying}
        />
      )}

      {/* Progress/Status Messages */}
      {isApplying && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(42, 42, 42, 0.95)',
          border: '1px solid #1a1a1a',
          color: '#d5d5d5',
          padding: 'clamp(16px, 4vw, 24px) clamp(24px, 6vw, 40px)',
          borderRadius: '8px',
          fontSize: 'clamp(13px, 3.2vw, 14px)',
          zIndex: 3000,
          maxWidth: '90vw',
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          fontWeight: '500'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '3px solid #3d3d3d',
            borderTop: '3px solid #5680c2',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 12px'
          }} />
          Applying designs to t-shirt...
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Mobile responsive adjustments */
        @media (max-width: 768px) {
          body {
            -webkit-tap-highlight-color: transparent;
          }
        }

        @media (max-width: 480px) {
          .button-group {
            flex-direction: column !important;
            width: 100%;
          }
        }

        /* Smooth transitions for all interactive elements */
        .btn {
          transition: all 0.2s ease;
        }

        .btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .btn:active {
          transform: translateY(0);
        }
      `}</style>
    </div>
  )
}

export default App