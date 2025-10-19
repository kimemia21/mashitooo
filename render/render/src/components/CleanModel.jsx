import React, { useRef, useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'

function CleanModel({ 
  color = '#ffffff', 
  stickers = [], 
  selectedSticker, 
  onStickerSelect,
  modelPath = '/models/tshirt.glb'
}) {
  const { nodes, materials } = useGLTF(modelPath)
  const meshRef = useRef()

  // Apply color to material
  useEffect(() => {
    if (materials && Object.keys(materials).length > 0) {
      Object.values(materials).forEach(material => {
        if (material.color) {
          material.color.set(color)
        }
      })
    }
  }, [color, materials])

  // Auto-rotate when no interaction
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2
    }
  })

  // Fallback if model doesn't load
  if (!nodes || Object.keys(nodes).length === 0) {
    return (
      <mesh ref={meshRef}>
        <boxGeometry args={[2, 3, 0.1]} />
        <meshStandardMaterial color={color} />
      </mesh>
    )
  }

  // Find the main mesh (usually the first mesh found)
  const mainMesh = Object.values(nodes).find(node => node.isMesh)
  
  if (!mainMesh) {
    return (
      <mesh ref={meshRef}>
        <boxGeometry args={[2, 3, 0.1]} />
        <meshStandardMaterial color={color} />
      </mesh>
    )
  }

  return (
    <group ref={meshRef}>
      <mesh
        geometry={mainMesh.geometry}
        material={materials[Object.keys(materials)[0]]}
        castShadow
        receiveShadow
      />
      
      {/* Render stickers */}
      {stickers.map(sticker => (
        <StickerMesh
          key={sticker.id}
          sticker={sticker}
          isSelected={selectedSticker?.id === sticker.id}
          onSelect={() => onStickerSelect?.(sticker)}
        />
      ))}
    </group>
  )
}

function StickerMesh({ sticker, isSelected, onSelect }) {
  const meshRef = useRef()
  
  return (
    <mesh
      ref={meshRef}
      position={sticker.position || [0, 0, 0.1]}
      rotation={sticker.rotation || [0, 0, 0]}
      scale={sticker.scale || [1, 1, 1]}
      onClick={onSelect}
    >
      <planeGeometry args={[0.5, 0.5]} />
      <meshBasicMaterial 
        transparent 
        opacity={isSelected ? 0.8 : 1}
        color={isSelected ? '#007acc' : '#ffffff'}
      />
    </mesh>
  )
}

// Preload the model
useGLTF.preload('/models/tshirt.glb')

export default CleanModel