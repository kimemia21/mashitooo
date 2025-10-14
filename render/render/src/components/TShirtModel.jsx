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
    console.log('T-shirt model not found, using fallback geometry')
    error = e
  }

  // State for managing texture updates
  const [textureVersion, setTextureVersion] = useState(0)

  // Create base fabric texture
  const fabricTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
canvas.width = 1024
canvas.height = 1280
    const ctx = canvas.getContext('2d')
    
    // Create fabric background identical to editor
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Add fabric texture identical to editor
    ctx.fillStyle = 'rgba(0, 0, 0, 0.02)'
    for (let i = 0; i < canvas.width; i += 2) {
      for (let j = 0; j < canvas.height; j += 2) {
        if (Math.random() > 0.95) {
          ctx.fillRect(i, j, 1, 1)
        }
      }
    }

    // Add weave pattern identical to editor
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.015)'
    ctx.lineWidth = 0.5
    for (let i = 0; i < canvas.width; i += 3) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, canvas.height)
      ctx.stroke()
    }
    for (let i = 0; i < canvas.height; i += 3) {
      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(canvas.width, i)
      ctx.stroke()
    }
    
    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.ClampToEdgeWrapping
    texture.wrapT = THREE.ClampToEdgeWrapping
    texture.flipY = false
    return texture
  }, [color])

  // Create material
  const compositeMaterial = useMemo(() => {
    const material = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.7,
      metalness: 0.02,
      map: fabricTexture
    })

    // Apply view mode
    switch (viewMode) {
      case 'wireframe':
        material.wireframe = true
        break
      case 'solid':
        material.wireframe = false
        material.map = null
        break
      case 'rendered':
        material.wireframe = false
        break
    }

    return material
  }, [color, viewMode, fabricTexture])

  // CRITICAL: PERFECT 1:1 coordinate mapping - NO transformation!
  useEffect(() => {
    if (stickers.length === 0) {
      compositeMaterial.map = fabricTexture
      compositeMaterial.needsUpdate = true
      return
    }

    console.log('=== RENDERING STICKERS ON 3D MODEL ===')
    console.log('Number of stickers to render:', stickers.length)

    // Create texture canvas with EXACT same dimensions as calculations
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 1024
    const ctx = canvas.getContext('2d')
    
    // Draw the fabric base first
    ctx.drawImage(fabricTexture.image, 0, 0, canvas.width, canvas.height)
    
    let loadedCount = 0
    const totalStickers = stickers.length
    
    const updateTexture = () => {
      const texture = new THREE.CanvasTexture(canvas)
      texture.flipY = false
      texture.wrapS = THREE.ClampToEdgeWrapping
      texture.wrapT = THREE.ClampToEdgeWrapping
      texture.needsUpdate = true
      compositeMaterial.map = texture
      compositeMaterial.needsUpdate = true
      setTextureVersion(prev => prev + 1)
      console.log('✅ Updated 3D texture with', totalStickers, 'stickers')
    }
    
    if (totalStickers === 0) {
      updateTexture()
      return
    }
    
    stickers.forEach((sticker, index) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        console.log(`Rendering sticker ${index + 1}:`, {
          name: sticker.name,
          editorCoords: { x: sticker.x + '%', y: sticker.y + '%' },
          editorSize: { width: sticker.width + 'px', height: sticker.height + 'px' },
          rotation: sticker.rotation + '°'
        })

        // PERFECT COORDINATE MAPPING - USE EXACT SAME PERCENTAGES
        // Editor uses percentages, we use the SAME percentages on texture
        const textureX = (sticker.x / 100) * canvas.width
        const textureY = (sticker.y / 100) * canvas.height
        
        // Scale size proportionally from editor dimensions to texture dimensions
        // Editor dimensions are 400x500 (from StickerEditor_Final.jsx)
        const editorWidth = 400
        const editorHeight = 500
        const scaleX = canvas.width / editorWidth
        const scaleY = canvas.height / editorHeight
        
        const textureWidth = sticker.width * scaleX
        const textureHeight = sticker.height * scaleY
        
        console.log(`Texture mapping ${index + 1}:`, {
          texturePos: { x: textureX.toFixed(1), y: textureY.toFixed(1) },
          textureSize: { width: textureWidth.toFixed(1), height: textureHeight.toFixed(1) },
          scale: { x: scaleX.toFixed(3), y: scaleY.toFixed(3) }
        })
        
        // Apply rotation and draw sticker
        ctx.save()
        
        // Move to sticker center
        ctx.translate(textureX, textureY)
        
        // Apply rotation if present
        if (sticker.rotation && sticker.rotation !== 0) {
          ctx.rotate((sticker.rotation * Math.PI) / 180)
        }
        
        // Add subtle shadow for realism
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)'
        ctx.shadowBlur = 4
        ctx.shadowOffsetX = 2
        ctx.shadowOffsetY = 2
        
        // Draw sticker centered at current position
        ctx.drawImage(
          img, 
          -textureWidth / 2,   // Center horizontally
          -textureHeight / 2,  // Center vertically
          textureWidth, 
          textureHeight
        )
        
        ctx.restore()
        
        console.log(`✅ Rendered sticker ${index + 1} successfully`)
        
        loadedCount++
        if (loadedCount === totalStickers) {
          updateTexture()
          console.log('=== ALL STICKERS RENDERED ===')
        }
      }
      
      img.onerror = () => {
        console.error(`❌ Failed to load sticker ${index + 1}:`, sticker.url)
        loadedCount++
        if (loadedCount === totalStickers) {
          updateTexture()
        }
      }
      
      img.src = sticker.url
    })
  }, [stickers, compositeMaterial, fabricTexture])

  // Enhanced fallback t-shirt geometry
  if (error || !nodes || Object.keys(nodes).length === 0) {
    console.log('Using fallback t-shirt geometry')
    
    return (
      <group ref={group} scale={[1, 1, 1]}>
        {/* Main t-shirt body with proper proportions */}
        <mesh ref={meshRef} position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.2, 2.8, 0.12]} />
          <primitive object={compositeMaterial} />
        </mesh>
        
        {/* Left sleeve */}
        <mesh position={[-1.5, 0.9, 0]} rotation={[0, 0, -0.15]} castShadow receiveShadow>
          <boxGeometry args={[0.9, 1.1, 0.12]} />
          <primitive object={compositeMaterial} />
        </mesh>
        
        {/* Right sleeve */}
        <mesh position={[1.5, 0.9, 0]} rotation={[0, 0, 0.15]} castShadow receiveShadow>
          <boxGeometry args={[0.9, 1.1, 0.12]} />
          <primitive object={compositeMaterial} />
        </mesh>
        
        {/* Collar/neckline */}
        <mesh position={[0, 1.4, 0.01]} castShadow receiveShadow>
          <ringGeometry args={[0.18, 0.4, 16]} />
          <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
      </group>
    )
  }

  // Render the actual loaded t-shirt model
  return (
    <group ref={group} dispose={null} scale={[1, 1, 1]}>
      {Object.entries(nodes).map(([name, node]) => {
        if (node.isMesh && node.geometry) {
          return (
            <mesh
              key={name}
              ref={name === 'T_Shirt' || name.includes('shirt') || name.includes('Shirt') ? meshRef : undefined}
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
useGLTF.preload('/models/oversized_t-shirt.glb')

export default TShirtModel