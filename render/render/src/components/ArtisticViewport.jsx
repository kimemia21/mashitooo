import React, { useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import { 
  Home, Maximize, RotateCcw, Grid, Eye, 
  Layers, Sparkles, Camera, Download,
  Palette, Brush, Move, RotateCw, Scale
} from 'lucide-react'

function ArtisticViewport({
  children,
  showGridGuides = false,
  onGridToggle,
  selectedSticker,
  onStickerDeselect,
  className = ''
}) {
  const controlsRef = useRef()
  const canvasRef = useRef()
  const [viewMode, setViewMode] = useState('perspective') // 'perspective', 'front', 'side', 'top'
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showInspiration, setShowInspiration] = useState(false)

  const handleResetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset()
    }
  }

  const handleViewModeChange = (mode) => {
    setViewMode(mode)
    // Add camera position changes based on view mode
    if (controlsRef.current) {
      switch (mode) {
        case 'front':
          controlsRef.current.setPosition(0, 0, 5)
          break
        case 'side':
          controlsRef.current.setPosition(5, 0, 0)
          break
        case 'top':
          controlsRef.current.setPosition(0, 5, 0)
          break
        default:
          controlsRef.current.setPosition(3, 3, 5)
      }
    }
  }

  const handleScreenshot = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current
      const link = document.createElement('a')
      link.download = 'fabric-design.png'
      link.href = canvas.toDataURL()
      link.click()
    }
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const viewportClasses = [
    'artistic-viewport',
    isFullscreen ? 'artistic-viewport--fullscreen' : '',
    className
  ].filter(Boolean).join(' ')

  return (
    <main className={viewportClasses}>
      {/* Artistic Canvas Background */}
      <div className="viewport-background">
        <div className="background-texture"></div>
        <div className="background-gradients">
          <div className="gradient-orb gradient-orb--1"></div>
          <div className="gradient-orb gradient-orb--2"></div>
          <div className="gradient-orb gradient-orb--3"></div>
        </div>
      </div>

      {/* Creative 3D Canvas */}
      <div className="canvas-container">
        <Canvas
          ref={canvasRef}
          camera={{ position: [0, 0, 5], fov: 50 }}
          gl={{ 
            preserveDrawingBuffer: true, 
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
          }}
          dpr={Math.min(window.devicePixelRatio, 2)}
          className="artistic-canvas"
        >
          {/* Artistic Environment */}
          <Environment preset="studio" />
          <ContactShadows 
            position={[0, -2, 0]} 
            opacity={0.3} 
            scale={12} 
            blur={3}
            color="#8b5cf6"
          />
          
          {/* Ambient lighting for fabric textures */}
          <ambientLight intensity={0.6} />
          <directionalLight 
            position={[10, 10, 5]} 
            intensity={0.8}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />

          {children}
          
          <OrbitControls
            ref={controlsRef}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            dampingFactor={0.05}
            enableDamping={true}
            maxPolarAngle={Math.PI / 1.4}
            minDistance={2}
            maxDistance={12}
            zoomSpeed={0.8}
            rotateSpeed={0.5}
          />
        </Canvas>
      </div>

      {/* Artistic Grid Overlay */}
      {showGridGuides && (
        <div className="grid-overlay">
          <div className="grid-pattern"></div>
          <div className="grid-center-cross">
            <div className="center-line center-line--horizontal"></div>
            <div className="center-line center-line--vertical"></div>
          </div>
        </div>
      )}

      {/* Creative Control Panels */}
      <div className="viewport-controls">
        {/* View Mode Controls */}
        <div className="control-panel view-controls">
          <h4>Canvas View</h4>
          <div className="view-modes">
            {[
              { id: 'perspective', label: '3D', icon: Layers },
              { id: 'front', label: 'Front', icon: Eye },
              { id: 'side', label: 'Side', icon: Move },
              { id: 'top', label: 'Top', icon: Grid }
            ].map(mode => {
              const Icon = mode.icon
              return (
                <button
                  key={mode.id}
                  className={`view-mode-btn ${viewMode === mode.id ? 'active' : ''} tooltip`}
                  onClick={() => handleViewModeChange(mode.id)}
                  data-tooltip={`${mode.label} View`}
                >
                  <Icon size={16} />
                  <span>{mode.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Camera Controls */}
        <div className="control-panel camera-controls">
          <h4>Camera</h4>
          <div className="camera-buttons">
            <button 
              className="btn btn--icon tooltip"
              onClick={handleResetCamera}
              data-tooltip="Reset View"
            >
              <Home size={16} />
            </button>
            <button 
              className="btn btn--icon tooltip"
              onClick={toggleFullscreen}
              data-tooltip={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              <Maximize size={16} />
            </button>
            <button 
              className="btn btn--icon tooltip"
              onClick={onGridToggle}
              data-tooltip="Toggle Grid"
            >
              <Grid size={16} />
            </button>
          </div>
        </div>

        {/* Creative Tools */}
        <div className="control-panel creative-tools">
          <h4>Tools</h4>
          <div className="tool-buttons">
            <button 
              className="btn btn--icon tooltip"
              onClick={() => setShowInspiration(!showInspiration)}
              data-tooltip="Inspiration Mode"
            >
              <Sparkles size={16} />
            </button>
            <button 
              className="btn btn--icon tooltip"
              onClick={handleScreenshot}
              data-tooltip="Capture Design"
            >
              <Camera size={16} />
            </button>
            <button 
              className="btn btn--icon tooltip"
              data-tooltip="Color Palette"
            >
              <Palette size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Selected Object Controls */}
      {selectedSticker && (
        <div className="selection-controls">
          <div className="selection-info">
            <div className="selection-preview">
              <img src={selectedSticker.url} alt={selectedSticker.name} />
            </div>
            <div className="selection-details">
              <h4>{selectedSticker.name}</h4>
              <span>Selected Asset</span>
            </div>
          </div>
          
          <div className="selection-tools">
            <button className="btn btn--icon tooltip" data-tooltip="Move">
              <Move size={16} />
            </button>
            <button className="btn btn--icon tooltip" data-tooltip="Rotate">
              <RotateCw size={16} />
            </button>
            <button className="btn btn--icon tooltip" data-tooltip="Scale">
              <Scale size={16} />
            </button>
            <button 
              className="btn btn--icon tooltip"
              onClick={onStickerDeselect}
              data-tooltip="Deselect"
            >
              <Eye size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Inspiration Overlay */}
      {showInspiration && (
        <div className="inspiration-overlay">
          <div className="inspiration-content">
            <h3>Creative Inspiration</h3>
            <div className="inspiration-suggestions">
              <div className="suggestion">
                <Brush size={20} />
                <span>Try layering textures for depth</span>
              </div>
              <div className="suggestion">
                <Palette size={20} />
                <span>Experiment with color harmony</span>
              </div>
              <div className="suggestion">
                <Sparkles size={20} />
                <span>Add subtle animations</span>
              </div>
            </div>
            <button 
              className="btn btn--secondary"
              onClick={() => setShowInspiration(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Artistic Bottom Glow */}
      <div className="viewport-glow"></div>
    </main>
  )
}

export default ArtisticViewport