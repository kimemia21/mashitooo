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

  // Create fabric-like base texture
  const fabricTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')
    
    // Create fabric pattern
    ctx.fillStyle = color
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Add subtle fabric texture
    for (let i = 0; i < 1000; i++) {
      const x = Math.random() * canvas.width
      const y = Math.random() * canvas.height
      const brightness = Math.random() * 0.1 - 0.05
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.abs(brightness)})`
      ctx.fillRect(x, y, 1, 1)
    }
    
    // Add weave pattern
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.02)'
    ctx.lineWidth = 1
    for (let i = 0; i < canvas.width; i += 4) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, canvas.height)
      ctx.stroke()
    }
    for (let i = 0; i < canvas.height; i += 4) {
      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(canvas.width, i)
      ctx.stroke()
    }
    
    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(2, 2)
    return texture
  }, [color])

  // Create composite material with proper sticker mapping
  const compositeMaterial = useMemo(() => {
    const material = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.8,
      metalness: 0.05,
      map: fabricTexture
    })

    // Apply view mode settings
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

  // Enhanced sticker mapping with proper UV coordinates
  useEffect(() => {
    if (stickers.length === 0) {
      compositeMaterial.map = fabricTexture
      compositeMaterial.needsUpdate = true
      return
    }

    // Create high-resolution canvas for better quality
    const canvas = document.createElement('canvas')
    canvas.width = 2048
    canvas.height = 2048
    const ctx = canvas.getContext('2d')
    
    // Draw fabric base
    ctx.drawImage(fabricTexture.image, 0, 0, canvas.width, canvas.height)
    
    let loadedCount = 0
    const totalStickers = stickers.length
    
    const updateTexture = () => {
      const texture = new THREE.CanvasTexture(canvas)
      texture.flipY = false
      texture.needsUpdate = true
      texture.wrapS = THREE.ClampToEdgeWrapping
      texture.wrapT = THREE.ClampToEdgeWrapping
      compositeMaterial.map = texture
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
        // Improved UV mapping based on t-shirt geometry
        let uvX, uvY, uvWidth, uvHeight
        
        if (sticker.side === 'FRONT') {
          // Front mapping - center chest area
          uvX = (0.25 + (sticker.uvX || 0.3) * 0.5) * canvas.width
          uvY = (0.2 + (sticker.uvY || 0.3) * 0.6) * canvas.height
          uvWidth = (sticker.uvWidth || 0.15) * canvas.width * 2
          uvHeight = (sticker.uvHeight || 0.15) * canvas.height * 2
        } else {
          // Back mapping - upper back area
          uvX = (0.25 + (sticker.uvX || 0.3) * 0.5) * canvas.width
          uvY = (0.15 + (sticker.uvY || 0.3) * 0.5) * canvas.height
          uvWidth = (sticker.uvWidth || 0.15) * canvas.width * 2
          uvHeight = (sticker.uvHeight || 0.15) * canvas.height * 2
        }
        
        // Apply rotation and draw sticker
        if (sticker.uvRotation && sticker.uvRotation !== 0) {
          ctx.save()
          ctx.translate(uvX + uvWidth/2, uvY + uvHeight/2)
          ctx.rotate(sticker.uvRotation * Math.PI / 180)
          
          // Add subtle drop shadow for depth
          ctx.shadowColor = 'rgba(0, 0, 0, 0.2)'
          ctx.shadowBlur = 4
          ctx.shadowOffsetX = 2
          ctx.shadowOffsetY = 2
          
          ctx.drawImage(img, -uvWidth/2, -uvHeight/2, uvWidth, uvHeight)
          ctx.restore()
        } else {
          ctx.save()
          ctx.shadowColor = 'rgba(0, 0, 0, 0.2)'
          ctx.shadowBlur = 4
          ctx.shadowOffsetX = 2
          ctx.shadowOffsetY = 2
          ctx.drawImage(img, uvX, uvY, uvWidth, uvHeight)
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

  // Enhanced fallback with better t-shirt shape
  if (error || !nodes || Object.keys(nodes).length === 0) {
    return (
      <group ref={group} scale={[1, 1, 1]}>
        {/* Fallback T-shirt shape with composite material */}
        <mesh ref={meshRef} castShadow receiveShadow>
          {/* Main body */}
          <boxGeometry args={[2, 2.5, 0.15]} />
          <primitive object={compositeMaterial} />
        </mesh>
        {/* Sleeves */}
        <mesh position={[-1.5, 0.8, 0]} castShadow receiveShadow>
          <boxGeometry args={[1, 1.2, 0.15]} />
          <primitive object={compositeMaterial} />
        </mesh>
        <mesh position={[1.5, 0.8, 0]} castShadow receiveShadow>
          <boxGeometry args={[1, 1.2, 0.15]} />
          <primitive object={compositeMaterial} />
        </mesh>
        {/* Collar */}
        <mesh position={[0, 1.3, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.8, 0.3, 0.15]} />
          <primitive object={compositeMaterial} />
        </mesh>
      </group>
    )
  }

  // Render actual T-shirt model with improved material
  return (
    <group ref={group} dispose={null} scale={[1, 1, 1]}>
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
useGLTF.preload('/models/oversized_t-shirt.glb')

export default TShirtModel