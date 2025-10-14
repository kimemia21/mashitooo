// GLBEditor.jsx
import React, { useRef, useState, useCallback } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { useGLTF, OrbitControls, TransformControls } from '@react-three/drei'
import * as THREE from 'three'
import { DecalSticker } from './DecalSticker' // New component

const T_SHIRT_MODEL_URL = '/models/oversized_t-shirt.glb'
const STICKER_URL = '/stickers/my_logo.png' // Example sticker

// Main component that wraps the 3D scene
function SceneManager({ stickerImage, initialStickers = [] }) {
  const { scene, camera } = useThree()
  const [stickers, setStickers] = useState(initialStickers)
  const [selectedStickerId, setSelectedStickerId] = useState(null)
  
  // Load the GLB model
  const { nodes } = useGLTF(T_SHIRT_MODEL_URL)
  const tShirtMesh = nodes.T_Shirt || Object.values(nodes).find(n => n.isMesh && n.name.toLowerCase().includes('shirt'))

  if (!tShirtMesh) {
    // Basic fallback if the GLB is missing or the mesh name is wrong
    return <mesh><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="hotpink" /></mesh>
  }
  
  // Get a reference to the actual 3D mesh object for raycasting
  const modelRef = useRef()
  
  // Find the selected sticker object
  const selectedSticker = stickers.find(s => s.id === selectedStickerId)

  // --- Core Placement Logic (Raycasting) ---
  const handleSurfaceClick = useCallback((event) => {
    // If we clicked on a DecalSticker, select it instead of creating a new one
    if (event.object.userData.isSticker) {
      setSelectedStickerId(event.object.userData.id)
      return
    }

    // Only create a new decal if we hit the T-Shirt mesh
    if (event.object === modelRef.current) {
      // event.point is the 3D coordinate where the raycaster hit the mesh
      // event.face.normal is the direction the surface is facing
      
      const newSticker = {
        id: THREE.MathUtils.generateUUID(),
        position: [event.point.x, event.point.y, event.point.z], // 3D position
        rotation: [0, 0, 0], // Initial rotation is 0
        normal: [event.face.normal.x, event.face.normal.y, event.face.normal.z],
        scale: 0.1, // Initial scale
        url: stickerImage || STICKER_URL,
      }

      setStickers(prev => [...prev, newSticker])
      setSelectedStickerId(newSticker.id)
    }
  }, [stickerImage])

  // --- Core Transform Logic (Handle Drag/Scale End) ---
  const onTransformEnd = useCallback((e) => {
    if (!selectedSticker) return

    // TransformControls updates the position/rotation/scale of the decal's parent mesh
    // We need to capture these new values and update our state
    const newPosition = e.target.object.position.toArray()
    const newRotation = e.target.object.rotation.toArray()
    const newScale = e.target.object.scale.x // Assuming uniform scale

    setStickers(prev => prev.map(s => s.id === selectedSticker.id ? {
      ...s,
      position: newPosition,
      rotation: [newRotation[0], newRotation[1], newRotation[2]],
      scale: newScale,
    } : s))
  }, [selectedSticker])
  
  return (
    <group>
      {/* 1. The T-Shirt Model Mesh (Raycast Target) */}
      <primitive 
        ref={modelRef}
        object={tShirtMesh.geometry}
        material={tShirtMesh.material} // You might need a specific material here
        scale={[1, 1, 1]}
        onClick={handleSurfaceClick}
      />
      
      {/* 2. All Decals (Stickers) */}
      {stickers.map((sticker) => (
        <DecalSticker
          key={sticker.id}
          sticker={sticker}
          targetMesh={modelRef.current} // Pass the target mesh for decal projection
          onSelect={setSelectedStickerId}
          isSelected={sticker.id === selectedStickerId}
          onDragEnd={onTransformEnd}
        />
      ))}
      
      {/* 3. Global Camera Controls */}
      <OrbitControls makeDefault />
      
      {/* Basic lighting */}
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} castShadow />
    </group>
  )
}


// The final exported component that sets up the Canvas
function GLBEditor({ modelUrl, stickerImage }) {
    return (
        <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
            <SceneManager stickerImage={stickerImage} />
        </Canvas>
    )
}

// Preload is still good practice
useGLTF.preload(T_SHIRT_MODEL_URL)

export default GLBEditor