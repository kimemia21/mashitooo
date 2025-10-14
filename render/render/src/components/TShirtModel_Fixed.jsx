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

  // Create high-quality fabric texture base
  const fabricTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 1024
    const ctx = canvas.getContext('2d')
    
    // Create fabric background matching editor
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, '#fafafa')
    gradient.addColorStop(0.5, '#ffffff')
    gradient.addColorStop(1, '#f5f5f5')
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Add fabric texture that matches the editor
    ctx.fillStyle = 'rgba(0, 0, 0, 0.015)'
    for (let i = 0; i < canvas.width; i += 1) {
      for (let j = 0; j < canvas.height; j += 1) {
        if (Math.random() > 0.97) {
          ctx.fillRect(i, j, 1, 1)
        }
      }
    }

    // Add weave pattern identical to editor
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.01)'
    ctx.lineWidth = 0.5
    for (let i = 0; i < canvas.width; i += 2) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, canvas.height)
      ctx.stroke()
    }
    for (let i = 0; i < canvas.height; i += 2) {
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

  // CRITICAL: Perfect 1:1 coordinate mapping
  useEffect(() => {
    if (stickers.length === 0) {
      compositeMaterial.map = fabricTexture
      compositeMaterial.needsUpdate = true
      return
    }

    console.log('Rendering', stickers.length, 'stickers on 3D model...')

    // Create high-resolution texture canvas
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
      console.log('Updated 3D texture with', totalStickers, 'stickers')
    }
    
    if (totalStickers === 0) {
      updateTexture()
      return
    }
    
    stickers.forEach((sticker, index) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        // EXACT 1:1 mapping from editor coordinates to texture coordinates
        // The editor uses percentages (0-100), we convert to pixel coordinates
        
        // Calculate exact position on texture canvas
        const textureX = (sticker.x / 100) * canvas.width
        const textureY = (sticker.y / 100) * canvas.height
        
        // Calculate exact size on texture canvas
        // We need to scale the pixel sizes from editor to texture proportionally
        const editorDimensions = { width: 400, height: 500 } // from StickerEditor
        const scaleX = canvas.width / editorDimensions.width
        const scaleY = canvas.height / editorDimensions.height
        
        const textureWidth = sticker.width * scaleX
        const textureHeight = sticker.height * scaleY
        
        console.log(`Sticker ${index + 1}: Editor(${sticker.x}%, ${sticker.y}%, ${sticker.width}px, ${sticker.height}px) -> Texture(${textureX}, ${textureY}, ${textureWidth}, ${textureHeight})`)
        
        // Apply rotation if present
        if (sticker.rotation && sticker.rotation !== 0) {
          ctx.save()
          ctx.translate(textureX, textureY)
          ctx.rotate((sticker.rotation * Math.PI) / 180)
          
          // Add subtle shadow for realism
          ctx.shadowColor = 'rgba(0, 0, 0, 0.15)'
          ctx.shadowBlur = 3
          ctx.shadowOffsetX = 1
          ctx.shadowOffsetY = 1
          
          ctx.drawImage(img, -textureWidth/2, -textureHeight/2, textureWidth, textureHeight)
          ctx.restore()
        } else {
          ctx.save()
          ctx.shadowColor = 'rgba(0, 0, 0, 0.15)'
          ctx.shadowBlur = 3
          ctx.shadowOffsetX = 1
          ctx.shadowOffsetY = 1
          
          // Draw sticker centered at the exact position
          ctx.drawImage(
            img, 
            textureX - textureWidth/2, 
            textureY - textureHeight/2, 
            textureWidth, 
            textureHeight
          )
          ctx.restore()
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
  }, [stickers, compositeMaterial, fabricTexture])

  // Enhanced fallback t-shirt geometry
  if (error || !nodes || Object.keys(nodes).length === 0) {
    console.log('Using fallback t-shirt geometry')
    
    return (
      <group ref={group} scale={[1, 1, 1]}>
        {/* T-shirt body with proper proportions */}
        <mesh ref={meshRef} position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.2, 2.8, 0.1]} />
          <primitive object={compositeMaterial} />
        </mesh>
        
        {/* Left sleeve */}
        <mesh position={[-1.4, 0.9, 0]} rotation={[0, 0, -0.2]} castShadow receiveShadow>
          <boxGeometry args={[0.8, 1.0, 0.1]} />
          <primitive object={compositeMaterial} />
        </mesh>
        
        {/* Right sleeve */}
        <mesh position={[1.4, 0.9, 0]} rotation={[0, 0, 0.2]} castShadow receiveShadow>
          <boxGeometry args={[0.8, 1.0, 0.1]} />
          <primitive object={compositeMaterial} />
        </mesh>
        
        {/* Neckline */}
        <mesh position={[0, 1.35, 0.01]} castShadow receiveShadow>
          <ringGeometry args={[0.15, 0.35, 16]} />
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
              ref={name === 'T_Shirt' || name.includes('shirt') ? meshRef : undefined}
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