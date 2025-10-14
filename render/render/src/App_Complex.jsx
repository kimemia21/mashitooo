import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Center, Grid } from '@react-three/drei'
import GLBEditor from './components/GLBEditor'
import KeyboardTransforms from './components/KeyboardTransforms'
import GLBImportExport from './components/GLBImportExport'
import BlenderUI from './components/BlenderUI'

function App() {
  // GLB Editor state
  const [currentModel, setCurrentModel] = useState(null)
  const [editMode, setEditMode] = useState('OBJECT') // 'OBJECT' or 'EDIT'
  const [selectionMode, setSelectionMode] = useState('FACE') // 'VERTEX', 'EDGE', 'FACE'
  const [selectedObjects, setSelectedObjects] = useState([])
  const [meshes, setMeshes] = useState([])
  const [transformMode, setTransformMode] = useState(null)
  const [lastAction, setLastAction] = useState('')
  const [showGrid, setShowGrid] = useState(true)
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(false)
  const [cameraPosition, setCameraPosition] = useState([0, 0, 5])
  const [environmentPreset, setEnvironmentPreset] = useState('studio')
  const controlsRef = useRef()
  const sceneRef = useRef()

  // GLB Import/Export setup
  const importExport = GLBImportExport({
    onModelLoad: handleModelLoad,
    scene: sceneRef.current,
    onExportComplete: (success) => {
      setLastAction(success ? 'Model exported' : 'Export failed')
    }
  })

  // Handle model loading
  function handleModelLoad(modelData) {
    setCurrentModel(modelData)
    setLastAction(`Loaded: ${modelData.fileName || 'model'}`)
    
    // Auto-frame the model
    if (modelData.recommendedCameraDistance) {
      setCameraPosition([0, 0, modelData.recommendedCameraDistance])
      if (controlsRef.current) {
        controlsRef.current.target.set(0, 0, 0)
        controlsRef.current.update()
      }
    }
  }

  // Handle object selection
  const handleObjectSelect = useCallback((objectIndex, isShiftClick) => {
    if (objectIndex === null) {
      // Deselect all
      setSelectedObjects([])
      setLastAction('Deselected all')
    } else {
      setSelectedObjects(prev => {
        if (isShiftClick) {
          // Multi-select with Shift
          if (prev.includes(objectIndex)) {
            const newSelection = prev.filter(i => i !== objectIndex)
            setLastAction(`Deselected object ${objectIndex + 1}`)
            return newSelection
          } else {
            const newSelection = [...prev, objectIndex]
            setLastAction(`Added object ${objectIndex + 1} to selection`)
            return newSelection
          }
        } else {
          // Single select
          setLastAction(`Selected object ${objectIndex + 1}`)
          return [objectIndex]
        }
      })
    }
  }, [])

  // Handle transform changes
  const handleTransformChange = useCallback((objectIndex, transformData) => {
    setMeshes(prev => prev.map((mesh, index) => 
      index === objectIndex 
        ? { 
            ...mesh, 
            position: transformData.position || mesh.position,
            rotation: transformData.rotation || mesh.rotation,
            scale: transformData.scale || mesh.scale
          }
        : mesh
    ))
  }, [])

  // Handle transform mode changes
  const handleTransformModeChange = useCallback((mode) => {
    setTransformMode(mode)
    if (mode) {
      setLastAction(`${mode.charAt(0) + mode.slice(1).toLowerCase()} mode`)
    }
  }, [])

  // Keyboard shortcuts for mode switching
  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase()
      
      switch (key) {
        case 'tab':
          event.preventDefault()
          setEditMode(prev => {
            const newMode = prev === 'OBJECT' ? 'EDIT' : 'OBJECT'
            setLastAction(`Switched to ${newMode} mode`)
            return newMode
          })
          break
        case '1':
          if (editMode === 'EDIT') {
            event.preventDefault()
            setSelectionMode('VERTEX')
            setLastAction('Vertex select mode')
          }
          break
        case '2':
          if (editMode === 'EDIT') {
            event.preventDefault()
            setSelectionMode('EDGE')
            setLastAction('Edge select mode')
          }
          break
        case '3':
          if (editMode === 'EDIT') {
            event.preventDefault()
            setSelectionMode('FACE')
            setLastAction('Face select mode')
          }
          break
        case 'n':
          event.preventDefault()
          setShowPropertiesPanel(prev => !prev)
          break
        case 'f':
          event.preventDefault()
          handleFrameSelected()
          break
        case 'home':
          event.preventDefault()
          handleFrameAll()
          break
        case 'a':
          if (event.ctrlKey || event.metaKey) return // Don't interfere with browser shortcuts
          event.preventDefault()
          if (meshes.length > 0) {
            setSelectedObjects(meshes.map((_, index) => index))
            setLastAction('Selected all objects')
          }
          break
        case 'delete':
        case 'x':
          if (selectedObjects.length > 0 && !transformMode) {
            event.preventDefault()
            // In a real implementation, you'd delete the selected objects
            setLastAction(`Would delete ${selectedObjects.length} object(s)`)
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [editMode, meshes.length, selectedObjects.length, transformMode])

  // Camera controls
  const handleFrameAll = useCallback(() => {
    setCameraPosition([0, 0, 4])
    if (controlsRef.current) {
      controlsRef.current.target.set(0, 0, 0)
      controlsRef.current.update()
    }
    setLastAction('Framed all objects')
  }, [])

  const handleFrameSelected = useCallback(() => {
    if (selectedObjects.length > 0) {
      // Focus on first selected object
      setCameraPosition([0, 0, 3])
      if (controlsRef.current) {
        controlsRef.current.target.set(0, 0, 0)
        controlsRef.current.update()
      }
      setLastAction('Framed selected')
    }
  }, [selectedObjects])

  return (
    <div 
      style={{ 
        width: '100vw', 
        height: '100vh', 
        position: 'relative',
        background: 'linear-gradient(135deg, #3c3c3c 0%, #252525 100%)', // Blender-style background
        overflow: 'hidden'
      }}
      onDragOver={importExport.handleDragOver}
      onDragLeave={importExport.handleDragLeave}
      onDrop={importExport.handleDrop}
    >
      {/* Hidden file input */}
      {importExport.fileInputElement}
      
      {/* Blender-style UI */}
      <BlenderUI
        onImport={importExport.openFileDialog}
        onExport={importExport.exportGLB}
        editMode={editMode}
        onEditModeChange={setEditMode}
        selectionMode={selectionMode}
        onSelectionModeChange={setSelectionMode}
        transformMode={transformMode}
        selectedObjects={selectedObjects}
        isLoading={importExport.isLoading}
        isExporting={importExport.isExporting}
        lastAction={lastAction}
        showPropertiesPanel={showPropertiesPanel}
        onTogglePropertiesPanel={() => setShowPropertiesPanel(prev => !prev)}
      />
      
      {/* Drag and drop overlay */}
      {importExport.dragOver && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 100, 255, 0.1)',
          border: '3px dashed rgba(0, 100, 255, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          pointerEvents: 'none'
        }}>
          <div style={{
            background: 'rgba(0, 100, 255, 0.9)',
            color: 'white',
            padding: '20px 40px',
            borderRadius: '10px',
            fontSize: '18px',
            fontWeight: 'bold'
          }}>
            Drop GLB/GLTF file here to import
          </div>
        </div>
      )}
      
      {/* Professional 3D Canvas */}
      <Canvas
        camera={{ 
          position: cameraPosition, 
          fov: 45,
          near: 0.1,
          far: 1000
        }}
        style={{ 
          background: 'linear-gradient(135deg, #3c3c3c 0%, #252525 100%)' // Blender-style
        }}
        shadows
        gl={{ 
          antialias: true, 
          alpha: false,
          powerPreference: "high-performance"
        }}
        onCreated={({ scene }) => {
          sceneRef.current = scene
          scene.userData.orbitControls = controlsRef.current
        }}
      >
        {/* Professional Lighting Setup (Blender-style) */}
        <ambientLight intensity={0.3} />
        <directionalLight 
          position={[5, 10, 5]} 
          intensity={1.2}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-near={0.1}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
        <directionalLight 
          position={[-5, 5, -5]} 
          intensity={0.5}
        />
        
        {/* Environment */}
        <Environment preset={environmentPreset} />
        
        {/* Blender-style Grid */}
        {showGrid && (
          <Grid 
            args={[20, 20]}
            position={[0, -2, 0]}
            cellSize={1}
            cellThickness={0.5}
            cellColor={'#666666'}
            sectionSize={5}
            sectionThickness={1.5}
            sectionColor={'#888888'}
            fadeDistance={30}
            fadeStrength={1}
          />
        )}
        
        {/* Advanced Camera Controls */}
        <OrbitControls 
          ref={controlsRef}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={0.1}
          maxDistance={50}
          enableDamping={true}
          dampingFactor={0.05}
          rotateSpeed={0.8}
          panSpeed={1.0}
          zoomSpeed={1.2}
          mouseButtons={{
            LEFT: 2,   // Rotate with left click
            MIDDLE: 1, // Pan with middle click  
            RIGHT: null // Disable right click
          }}
        />
        
        {/* GLB Editor with Keyboard Transforms */}
        <Center>
          <GLBEditor
            modelUrl={currentModel?.scene ? undefined : undefined}
            onModelLoad={(meshes) => setMeshes(meshes)}
            onModelChange={handleTransformChange}
            editMode={editMode}
            selectionMode={selectionMode}
            selectedObjects={selectedObjects}
            onObjectSelect={handleObjectSelect}
            transformMode={transformMode}
            onTransformModeChange={handleTransformModeChange}
          />
          
          {/* Keyboard-driven transforms */}
          <KeyboardTransforms
            selectedObjects={selectedObjects}
            meshes={meshes}
            onTransformChange={handleTransformChange}
            onModeChange={handleTransformModeChange}
            enabled={true}
          />
        </Center>
        
        {/* Add the current model if loaded */}
        {currentModel?.scene && (
          <primitive 
            object={currentModel.scene} 
            position={[0, 0, 0]}
            scale={[1, 1, 1]}
          />
        )}
      </Canvas>
    </div>
  )
}

export default App