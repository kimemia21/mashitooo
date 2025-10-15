import React, { useState, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Center } from '@react-three/drei'
import TShirtModel from './components/TShirtModel'
import ColorPicker from './components/ColorPicker'
import StickerPicker from './components/StickerPicker'
import EditModeUI from './components/EditModeUI'
import StickerEditor from './components/StickerEditor'
import { preprocessStickers, createStickerPreview, debugCoordinateMapping, verifyCoordinateSystem } from './utils/stickerMapping'
import './mobile-fixes.css'

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
  
  const controlsRef = useRef()

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
      x: s.editorX || 50, // Default to center if no editor position
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
      x: 50, // Center position (percentage)
      y: 50,
      width: 100, // Size in pixels
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

  // Apply 2D editor changes to 3D model with PERFECT 1:1 coordinate mapping
  const handleApplyChanges = async () => {
    setIsApplying(true)
    
    try {
      // Verify coordinate system first
      verifyCoordinateSystem()
      
      // Remove old stickers for this side
      const otherSideStickers = stickers.filter(s => s.side !== editSide)
      
      console.log(`\n🎯 === APPLYING ${editSide} SIDE STICKERS ===`)
      console.log(`Processing ${editorStickers.length} stickers from 2D editor...`)
      
      // Log all editor stickers with their exact coordinates
      editorStickers.forEach((sticker, index) => {
        console.log(`Editor Sticker ${index + 1}: "${sticker.name}"`, {
          position: `${sticker.x}%, ${sticker.y}%`,
          size: `${sticker.width}px × ${sticker.height}px`,
          rotation: `${sticker.rotation || 0}°`
        })
      })
      
      // Process stickers with PERFECT coordinate preservation
      console.log('\n🔄 Processing coordinates...')
      const processedStickers = preprocessStickers(editorStickers, editSide)
      
      // Verify each sticker mapping
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
      
      // Create final stickers with EXACT coordinates
      const finalStickers = processedStickers.map(sticker => ({
        ...sticker,
        side: editSide,
        // Store original editor data for verification
        editorX: sticker.originalX,
        editorY: sticker.originalY,
        editorWidth: sticker.originalWidth,
        editorHeight: sticker.originalHeight,
        editorRotation: sticker.originalRotation,
        // Processing metadata
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
      
      // Simulate processing time for texture generation
      console.log('\n⏳ Generating 3D texture...')
      await new Promise(resolve => setTimeout(resolve, 1200))
      
      // Apply to state
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
    <div style={{ 
      width: '100vw', 
      height: '100dvh',
      position: 'relative',
      background: '#2a2a2a',
      overflow: 'hidden',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      
      {/* Main 3D View Mode */}
      {appMode === 'VIEW' && (
        <>
          <Canvas
            camera={{ position: [0, 0, 5], fov: 50 }}
            style={{ width: '100%', height: '100%' }}
          >
            <Environment preset="studio" />
            
            {/* Model-only rotation controls */}
            <OrbitControls 
              ref={controlsRef}
              enablePan={false}
              enableZoom={true}
              enableRotate={true}
              minDistance={2}
              maxDistance={10}
              enableDamping={true}
              dampingFactor={0.05}
              rotateSpeed={0.8}
              zoomSpeed={0.8}
              target={[0, 0, 0]}
            />
            
            <Center>
              <TShirtModel
                color={tshirtColor}
                stickers={stickers}
                viewMode="rendered"
              />
            </Center>
          </Canvas>

          {/* UI Controls Layout - Proper Z-index and positioning */}
          
          {/* Left Panel - Color Picker (Top Left) */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 100,
            pointerEvents: 'none'
          }}>
            <div style={{ pointerEvents: 'auto' }}>
              <ColorPicker 
                color={tshirtColor} 
                onChange={setTshirtColor} 
              />
            </div>
          </div>
          
          {/* Right Panel - Sticker Picker (Top Right) */}
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            zIndex: 100,
            pointerEvents: 'none'
          }}>
            <div style={{ pointerEvents: 'auto' }}>
              <StickerPicker 
                onStickerSelect={handleAddSticker}
                stickers={stickerLibrary}
                onStickerUpload={handleStickerUpload}
              />
            </div>
          </div>

          {/* Bottom Center - Main Edit Button */}
          <div style={{
            position: 'absolute',
            bottom: 'max(20px, env(safe-area-inset-bottom, 20px))',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 200,
            display: 'flex',
            gap: 'clamp(8px, 2vw, 12px)',
            flexWrap: 'wrap',
            justifyContent: 'center',
            padding: '0 12px',
            maxWidth: '100vw'
          }}>
            <button 
              onClick={handleEditMode}
              style={{
                background: 'linear-gradient(to bottom, #5680c2 0%, #4a6fa8 100%)',
                color: 'white',
                border: '1px solid #3a5a8a',
                padding: 'clamp(10px, 2.5vw, 12px) clamp(20px, 5vw, 28px)',
                borderRadius: '4px',
                fontSize: 'clamp(12px, 3vw, 13px)',
                fontWeight: '500',
                cursor: 'pointer',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 2px 8px rgba(0,0,0,0.3)',
                transition: 'all 0.15s',
                minHeight: '44px',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'linear-gradient(to bottom, #6890d2 0%, #5a7fb8 100%)'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'linear-gradient(to bottom, #5680c2 0%, #4a6fa8 100%)'
              }}
            >
              Edit Design
            </button>

            <button 
              onClick={handleResetView}
              style={{
                background: 'linear-gradient(to bottom, #3e3e3e 0%, #2d2d2d 100%)',
                color: '#d5d5d5',
                border: '1px solid #1a1a1a',
                padding: 'clamp(10px, 2.5vw, 12px) clamp(16px, 4vw, 20px)',
                borderRadius: '4px',
                fontSize: 'clamp(11px, 2.8vw, 12px)',
                fontWeight: '400',
                cursor: 'pointer',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 2px 8px rgba(0,0,0,0.3)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.15s',
                minHeight: '44px',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'linear-gradient(to bottom, #494949 0%, #373737 100%)'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'linear-gradient(to bottom, #3e3e3e 0%, #2d2d2d 100%)'
              }}
            >
              Reset View
            </button>
          </div>
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
          /* Ensure buttons don't overlap on small screens */
          body {
            -webkit-tap-highlight-color: transparent;
          }
        }

        @media (max-width: 480px) {
          /* Stack buttons vertically on very small screens */
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