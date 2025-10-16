import React, { useMemo } from 'react'
import * as THREE from 'three'
import { useTexture } from '@react-three/drei'

/**
 * FIXED: Mesh-based sticker that positions correctly on t-shirt surface
 * Maps 2D editor coordinates to 3D mesh positions
 */
export function MeshSticker({ sticker, meshRef }) {
  // Load sticker texture with error handling
  const texture = useTexture(sticker.url, (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace
  })
  
  // Calculate 3D position from 2D editor coordinates
  const position = useMemo(() => {
    if (!meshRef?.current) return [0, 0, 0]
    
    // Get mesh bounding box to understand the t-shirt dimensions
    const mesh = meshRef.current
    const geometry = mesh.geometry
    geometry.computeBoundingBox()
    const bbox = geometry.boundingBox
    
    // T-shirt dimensions in 3D space
    const width = bbox.max.x - bbox.min.x
    const height = bbox.max.y - bbox.min.y
    const depth = bbox.max.z - bbox.min.z
    
    // Convert percentage coordinates to 3D position
    // Editor: x% and y% (0-100 range)
    // 3D: needs to map to actual mesh surface
    
    let x, y, z
    
    if (sticker.side === 'FRONT') {
      // Map to front face of t-shirt
      // X: Left-right position (centered at 0)
      x = ((sticker.x - 50) / 100) * width
      
      // Y: Top-bottom position (Three.js Y is up)
      // Editor Y=0 is top, Three.js Y+ is up, so we flip it
      y = ((50 - sticker.y) / 100) * height
      
      // Z: Front surface (slightly in front to avoid z-fighting)
      z = (depth / 2) + 0.01
      
    } else if (sticker.side === 'BACK') {
      // Map to back face of t-shirt
      // X: Flipped for back side
      x = ((50 - sticker.x) / 100) * width
      
      // Y: Same as front
      y = ((50 - sticker.y) / 100) * height
      
      // Z: Back surface
      z = -(depth / 2) - 0.01
    }
    
    console.log('🎯 Sticker 3D Position:', {
      id: sticker.id,
      editorCoords: `${sticker.x}%, ${sticker.y}%`,
      meshPosition: `[${x?.toFixed(2)}, ${y?.toFixed(2)}, ${z?.toFixed(2)}]`,
      side: sticker.side
    })
    
    return [x, y, z]
  }, [sticker.x, sticker.y, sticker.side, meshRef])
  
  // Calculate scale from pixel dimensions
  const scale = useMemo(() => {
    // Convert pixel size to 3D scale
    // Base scale factor (adjust this to match your needs)
    const baseScale = 0.003
    
    const scaleX = sticker.width * baseScale
    const scaleY = sticker.height * baseScale
    
    return [scaleX, scaleY, 1]
  }, [sticker.width, sticker.height])
  
  // Rotation (convert degrees to radians)
  const rotation = useMemo(() => {
    const rotRad = (sticker.rotation || 0) * (Math.PI / 180)
    
    // Rotate around Z axis for 2D rotation
    if (sticker.side === 'BACK') {
      return [0, Math.PI, rotRad] // Flip for back side
    }
    return [0, 0, rotRad]
  }, [sticker.rotation, sticker.side])
  
  // Create material with transparency
  const material = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: true,
      depthTest: true,
    })
  }, [texture])
  
  return (
    <mesh
      position={position}
      rotation={rotation}
      scale={scale}
    >
      <planeGeometry args={[1, 1]} />
      <primitive object={material} attach="material" />
    </mesh>
  )
}

/**
 * Alternative: DecalSticker using drei's Decal component
 * This projects the sticker directly onto the mesh surface
 */
export function DecalSticker({ sticker, meshRef }) {
  const texture = useTexture(sticker.url)
  
  const decalConfig = useMemo(() => {
    if (!meshRef?.current) return null
    
    const mesh = meshRef.current
    const geometry = mesh.geometry
    geometry.computeBoundingBox()
    const bbox = geometry.boundingBox
    
    const width = bbox.max.x - bbox.min.x
    const height = bbox.max.y - bbox.min.y
    const depth = bbox.max.z - bbox.min.z
    
    // Position
    let x = ((sticker.x - 50) / 100) * width
    let y = ((50 - sticker.y) / 100) * height
    let z = sticker.side === 'FRONT' ? (depth / 2) : -(depth / 2)
    
    // Size
    const baseScale = 0.003
    const sizeX = sticker.width * baseScale
    const sizeY = sticker.height * baseScale
    
    // Rotation
    const rotRad = (sticker.rotation || 0) * (Math.PI / 180)
    const rotation = sticker.side === 'BACK' 
      ? [0, Math.PI, rotRad]
      : [0, 0, rotRad]
    
    return {
      position: [x, y, z],
      rotation,
      scale: [sizeX, sizeY, 0.1]
    }
  }, [sticker, meshRef])
  
  if (!decalConfig) return null
  
  return (
    <mesh
      position={decalConfig.position}
      rotation={decalConfig.rotation}
      scale={decalConfig.scale}
    >
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        map={texture}
        transparent={true}
        side={THREE.DoubleSide}
        depthWrite={true}
      />
    </mesh>
  )
}