import React, { useRef, useEffect, useState, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

function TShirtModel({ 
  color = '#ffffff', 
  stickers = [],
  viewMode = 'rendered' 
}) {
  const group = useRef()
  const meshRef = useRef()
  
  // Try to load the GLB model, with fallback
  let nodes, materials, error
  try {
    const gltf = useGLTF('/models/oversized_t-shirt.glb', true)
    nodes = gltf.nodes
    materials = gltf.materials
  } catch (e) {
    console.log('T-shirt model not found, using fallback cube')
    error = e
  }

  // State for managing texture updates
  const [textureVersion, setTextureVersion] = useState(0)

  // Create composite material with stickers
  const compositeMaterial = useMemo(() => {
    const material = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.7,
      metalness: 0.1
    })

    // Apply view mode settings
    switch (viewMode) {
      case 'wireframe':
        material.wireframe = true
        break
      case 'solid':
        material.wireframe = false
        break
      case 'rendered':
        material.wireframe = false
        break
    }

    return material
  }, [color, viewMode])

  // Effect to handle sticker texture composition
  useEffect(() => {
    if (stickers.length === 0) {
      // No stickers, just use base color
      compositeMaterial.map = null
      compositeMaterial.transparent = false
      compositeMaterial.needsUpdate = true
      return
    }

    // Create canvas for compositing
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 1024
    const ctx = canvas.getContext('2d')
    
    // Fill with base color instead of transparent background
    ctx.fillStyle = color
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    let loadedCount = 0
    const totalStickers = stickers.length
    
    const updateTexture = () => {
      const texture = new THREE.CanvasTexture(canvas)
      texture.flipY = false
      texture.needsUpdate = true
      compositeMaterial.map = texture
      // Only set transparent if we actually have transparent areas in the stickers
      // The base material should remain opaque
      compositeMaterial.transparent = false
      compositeMaterial.needsUpdate = true
      setTextureVersion(prev => prev + 1)
    }
    
    if (totalStickers === 0) {
      updateTexture()
      return
    }
    
    stickers.forEach(sticker => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        // Calculate position and size based on UV coordinates
        const x = (sticker.uvX || 0.3) * canvas.width
        const y = (sticker.uvY || 0.3) * canvas.height  
        const width = (sticker.uvWidth || 0.2) * canvas.width
        const height = (sticker.uvHeight || 0.2) * canvas.height
        
        // Apply rotation if specified
        if (sticker.uvRotation && sticker.uvRotation !== 0) {
          ctx.save()
          ctx.translate(x + width/2, y + height/2)
          ctx.rotate(sticker.uvRotation * Math.PI / 180)
          ctx.drawImage(img, -width/2, -height/2, width, height)
          ctx.restore()
        } else {
          ctx.drawImage(img, x, y, width, height)
        }
        
        loadedCount++
        if (loadedCount === totalStickers) {
          updateTexture()
        }
      }
      img.onerror = () => {
        console.error('Failed to load sticker:', sticker.url)
        loadedCount++
        if (loadedCount === totalStickers) {
          updateTexture()
        }
      }
      img.src = sticker.url
    })
  }, [stickers, compositeMaterial])

  // Render fallback cube if no model is available
  if (error || !nodes || Object.keys(nodes).length === 0) {
    return (
      <group ref={group} scale={[1, 1, 1]}>
        {/* Fallback T-shirt shape with composite material */}
        <mesh ref={meshRef} castShadow receiveShadow>
          <boxGeometry args={[2, 2.5, 0.3]} />
          <primitive object={compositeMaterial} />
        </mesh>
      </group>
    )
  }

  // Render actual T-shirt model
  return (
    <group ref={group} dispose={null} scale={[1, 1, 1]}>
      {/* T-Shirt Mesh with composite material (stickers baked into texture) */}
      {Object.entries(nodes).map(([name, node]) => {
        if (node.isMesh) {
          return (
            <mesh
              key={name}
              ref={meshRef}
              geometry={node.geometry}
              material={compositeMaterial}
              position={node.position}
              rotation={node.rotation}
              scale={node.scale}
              castShadow
              receiveShadow
            />
          )
        }
        return null
      })}
    </group>
  )
}

// Preload the model
useGLTF.preload('/models/t_shirt.glb')

export default TShirtModel