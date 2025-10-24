import React, { useState, useRef } from 'react'
import { Menu, X, RotateCcw, Home } from 'lucide-react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Center } from '@react-three/drei'
import * as THREE from 'three'
import Model from './components/Model'
import ColorPicker from './components/ColorPicker'
import StickerPicker from './components/StickerPicker'
import EditModeUI from './components/EditModeUI'
import StickerEditor from './components/StickerEditor'
import ModelSwitcher from './components/ModelSwitcher'
import { preprocessStickers, createStickerPreview, debugCoordinateMapping, verifyCoordinateSystem } from './utils/stickerMapping'
import { ModelType } from './enums/AppEnums'
import './theme.css'
import './mobile-fixes.css'
import './styles/simple-mobile.css'
import { useResponsive } from './hooks/useResponsive'
import Panel from './components/Panel'
import IconButton from './components/IconButton'

function App() {
  // Core application state
  const [appMode, setAppMode] = useState('VIEW') // 'VIEW', 'EDIT', 'MESH_EDIT'
  const [editSide, setEditSide] = useState(null) // 'FRONT', 'BACK'
  const [tshirtColor, setTshirtColor] = useState('#ffffff')
const [originalModelColor, setOriginalModelColor] = useState('#ffffff');
  const [stickers, setStickers] = useState([])
  const [stickerLibrary, setStickerLibrary] = useState([
    { url: '/sample-sticker.svg', name: 'Sample Sticker' },
    { url: '/test-sticker.svg', name: 'Test Sticker' }
  ])



  
// Model selection state
// Model selection state
const [currentModelType, setCurrentModelType] = useState(ModelType.HOODIE)
const [currentModelPath, setCurrentModelPath] = useState('/models/hoodies/uploads_files_6392619_Hoodie.glb')
const [isModelLoading, setIsModelLoading] = useState(false)

  // 2D Editor state (for edit mode)
  const [editorStickers, setEditorStickers] = useState([])
  const [selectedSticker, setSelectedSticker] = useState(null)
  const [isApplying, setIsApplying] = useState(false)
  
  const controlsRef = useRef()
  const { isMobile, isTablet, isDesktop } = useResponsive()
  
  // UI state for mobile
  const [leftPanelOpen, setLeftPanelOpen] = useState(false)
  const [rightPanelOpen, setRightPanelOpen] = useState(false)

  const handleOriginalColorLoad = (color) => {
    // Only set the color if it hasn't been modified yet
    if (tshirtColor === '#ffffff') { 
        setTshirtColor(color);
    }
    setOriginalModelColor(color); // Store the original color for potential resets
};

// Handle model change
const handleModelChange = (modelType, modelPath) => {
  console.log('🔄 Changing model:', { modelType, modelPath })
  setIsModelLoading(true)
  setCurrentModelType(modelType)
  setCurrentModelPath(modelPath)
  
  // Reset loading state after a short delay
  setTimeout(() => {
    setIsModelLoading(false)
  }, 500)
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
    if (controlsRef.current) {
      controlsRef.current.reset()
    }
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
<div 
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        // Base color is black for the corners
        backgroundColor: '#000000', 
        overflow: 'hidden', 
      }}
    >
        {/* Inner DIV for the Blur and Gradient (Center Focus) */}
        <div 
          style={{
            width: '100%',
            height: '100%',
            // Gradient: Lighter grey center (#555555) fading to transparent/black at 75%
            // This creates the strong visual vignette to focus the center.
            backgroundImage: 'radial-gradient(circle at center, rgba(190, 190, 190, 1) 0%, rgba(0, 0, 0, 0.8) 75%, rgba(0, 0, 0, 1) 100%)',
            filter: 'blur(20px)', // High blur for soft, out-of-focus look
            transform: 'scale(1.1)', // Prevents blur edges from showing
          }}
        />

        {/* Grain Overlay for subtle texture */}
        <div 
            className="grain-overlay" // Requires the CSS class below
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0.05, // Subtle grain
                pointerEvents: 'none',
            }}
        />
    </div>

       
          <Canvas
            camera={{ position: [0, 0, 5], fov: 50 }}
            style={{ width: '100%', height: '100%'}}
           
            gl={{ 
              antialias: true,
              clearColor: new THREE.Color(0, 0, 0, 0),
              alpha: true,
              powerPreference: 'high-performance',
              preserveDrawingBuffer: false
            }}
            dpr={Math.min(window.devicePixelRatio, 2)}
            shadows
          >
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
            {/* <ModernBackground /> */}
            
            <OrbitControls 
              ref={controlsRef}
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
             minDistance={0.1}
              maxDistance={10}
              enableDamping={true}
              dampingFactor={0.05}
              rotateSpeed={1.0}
              zoomSpeed={1.0}
              panSpeed={0.8}
              target={[0, 0, 0]}
              autoRotate={true} 
  autoRotateSpeed={0.5} 
              makeDefault
              touches={{
                ONE: 2,
                TWO: 1
              }}
              mouseButtons={{
                LEFT: 0,
                MIDDLE: 1,
                RIGHT: 2
              }}
            />
            
            <Center
            // scale={0.7}
             >
              <Model
                color={tshirtColor}
                stickers={stickers}
                viewMode="rendered"
                backgroundImage="/urbanfusion-africanwomangraffitiillustration_882186-30433.jpg"
                path={currentModelPath}
                type={currentModelType}
                onOriginalColorLoad={handleOriginalColorLoad}
              />
            </Center>
          </Canvas>

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

          {/* Left Panel - Model Switcher & Color Picker */}
  

          {/* Left Panel - Model Switcher & Color Picker */}
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
  pointerEvents: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  padding: '12px'
}}>
  {/* Model Type Panel */}
  <Panel 
    title="Model Type" 
    type="modelPicker"
    collapsible={!isMobile} 
    defaultOpen={!isMobile}
    currentModel={currentModelType}
    onModelChange={handleModelChange}
  />

  {/* Design Customization Panel */}
  <Panel 
    title="Design Customization"
    type="full"
    collapsible={!isMobile} 
    defaultOpen={!isMobile}
    color={tshirtColor}
    onColorChange={setTshirtColor}
    originalColor={originalModelColor}
    stickers={stickerLibrary}
    onStickerSelect={handleAddSticker}
    onStickerUpload={handleStickerUpload}
  />
</div>

          {/* Floating Action Buttons - Mobile */}
          {isMobile && (
            <>
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
                  icon={RotateCcw}
                  onClick={() => {
                    if (controlsRef.current) {
                      controlsRef.current.autoRotate = !controlsRef.current.autoRotate
                    }
                  }}
                  tooltip="Auto Rotate"
                  size={20}
                />
              </div>

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
                    boxShadow: 'var(--glow)'
                  }}
                >
                  ✨ Edit Design
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
                  fontSize: '14px'
                }}
              >
                ✨ Edit Design
              </button>

              <IconButton
                icon={Home}
                onClick={handleResetView}
                tooltip="Reset View"
                size={18}
              />
              
              <IconButton
                icon={RotateCcw}
                onClick={() => {
                  if (controlsRef.current) {
                    controlsRef.current.autoRotate = !controlsRef.current.autoRotate
                  }
                }}
                tooltip="Auto Rotate"
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

      {/* Model Loading Indicator */}
{isModelLoading && (
  <div style={{
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: 'rgba(42, 42, 42, 0.95)',
    border: '1px solid #1a1a1a',
    color: '#d5d5d5',
    padding: 'clamp(16px, 4vw, 24px) clamp(24px, 6vw, 40px)',
    borderRadius: '4px',
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
    Loading {currentModelType.toLowerCase()}...
  </div>
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
          borderRadius: '4px',
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
          Applying designs to {currentModelType.toLowerCase()}...
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

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
      `}</style>
    </div>
  )
}

export default App