import React, { useRef, useEffect, useState, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

function TShirtModel({ 
  color = '#ffffff', 
  stickers = [], 
  onStickerClick, 
  onStickerSelect,
  selectedSticker,
  viewMode = 'rendered' 
}) {
  const group = useRef()
  const { nodes, materials } = useGLTF('/models/t_shirt.glb')
  const { scene, gl } = useThree()
  const [hoveredSticker, setHoveredSticker] = useState(null)
  const [loadedTextures, setLoadedTextures] = useState(new Map())
  
  // Enhanced material management with view modes
  const processedMaterials = useMemo(() => {
    if (!materials) return {}
    
    const processed = {}
    Object.entries(materials).forEach(([key, material]) => {
      const newMaterial = material.clone()
      
      // Apply color
      if (newMaterial.color) {
        newMaterial.color.set(color)
      }
      
      // Apply view mode
      switch (viewMode) {
        case 'wireframe':
          newMaterial.wireframe = true
          break
        case 'solid':
          newMaterial.wireframe = false
          if (newMaterial.map) newMaterial.map = null
          if (newMaterial.normalMap) newMaterial.normalMap = null
          break
        case 'rendered':
          newMaterial.wireframe = false
          break
      }
      
      processed[key] = newMaterial
    })
    
    return processed
  }, [materials, color, viewMode])

  // Load sticker textures properly
  useEffect(() => {
    const loadTexture = async (sticker) => {
      if (loadedTextures.has(sticker.id)) return
      
      try {
        const texture = await new Promise((resolve, reject) => {
          const loader = new THREE.TextureLoader()
          loader.load(
            sticker.url,
            (tex) => {
              tex.flipY = false
              tex.wrapS = THREE.ClampToEdgeWrapping
              tex.wrapT = THREE.ClampToEdgeWrapping
              tex.generateMipmaps = false
              resolve(tex)
            },
            undefined,
            reject
          )
        })
        
        setLoadedTextures(prev => new Map(prev.set(sticker.id, texture)))
      } catch (error) {
        console.error('Failed to load sticker texture:', error)
      }
    }
    
    stickers.forEach(loadTexture)
  }, [stickers, loadedTextures])

  // Fallback mesh
  if (!nodes || Object.keys(nodes).length === 0) {
    return (
      <mesh>
        <boxGeometry args={[1, 1.5, 0.1]} />
        <meshStandardMaterial 
          color={color} 
          wireframe={viewMode === 'wireframe'}
        />
      </mesh>
    )
  }

  return (
    <group ref={group} dispose={null} scale={[0.8, 0.8, 0.8]}>
      {/* T-Shirt Mesh */}
      {Object.entries(nodes).map(([name, node]) => {
        if (node.isMesh) {
          const material = processedMaterials[node.material?.name] || node.material
          return (
            <mesh
              key={name}
              geometry={node.geometry}
              material={material}
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
      
      {/* Professional Sticker Rendering */}
      {stickers.map((sticker, index) => {
        const texture = loadedTextures.get(sticker.id)
        if (!texture) return null
        
        const isSelected = selectedSticker === index
        const isHovered = hoveredSticker === index
        
        return (
          <group key={`sticker-group-${sticker.id}`}>
            {/* Main sticker mesh */}
            <mesh
              position={[
                sticker.position?.x || 0,
                sticker.position?.y || 0.2,
                sticker.position?.z || 0.51
              ]}
              rotation={[
                sticker.rotation?.x || 0,
                sticker.rotation?.y || 0,
                sticker.rotation?.z || 0
              ]}
              scale={[
                sticker.scale?.x || 0.25,
                sticker.scale?.y || 0.25,
                sticker.scale?.z || 1
              ]}
              onClick={(e) => {
                e.stopPropagation()
                onStickerSelect && onStickerSelect(index)
                onStickerClick && onStickerClick(index, e)
              }}
              onPointerEnter={(e) => {
                e.stopPropagation()
                setHoveredSticker(index)
                document.body.style.cursor = 'pointer'
              }}
              onPointerLeave={(e) => {
                e.stopPropagation()
                setHoveredSticker(null)
                document.body.style.cursor = 'default'
              }}
              castShadow
            >
              <planeGeometry args={[1, 1]} />
              <meshLambertMaterial 
                map={texture}
                transparent={true}
                opacity={isHovered ? 0.9 : 1.0}
                alphaTest={0.1}
                side={THREE.DoubleSide}
              />
            </mesh>
            
            {/* Selection outline */}
            {isSelected && (
              <mesh
                position={[
                  sticker.position?.x || 0,
                  sticker.position?.y || 0.2,
                  sticker.position?.z || 0.50
                ]}
                rotation={[
                  sticker.rotation?.x || 0,
                  sticker.rotation?.y || 0,
                  sticker.rotation?.z || 0
                ]}
                scale={[
                  (sticker.scale?.x || 0.25) * 1.1,
                  (sticker.scale?.y || 0.25) * 1.1,
                  1
                ]}
              >
                <planeGeometry args={[1, 1]} />
                <meshBasicMaterial 
                  color="#00aaff"
                  transparent={true}
                  opacity={0.3}
                  side={THREE.DoubleSide}
                />
              </mesh>
            )}
            
            {/* Hover highlight */}
            {isHovered && !isSelected && (
              <mesh
                position={[
                  sticker.position?.x || 0,
                  sticker.position?.y || 0.2,
                  sticker.position?.z || 0.50
                ]}
                rotation={[
                  sticker.rotation?.x || 0,
                  sticker.rotation?.y || 0,
                  sticker.rotation?.z || 0
                ]}
                scale={[
                  (sticker.scale?.x || 0.25) * 1.05,
                  (sticker.scale?.y || 0.25) * 1.05,
                  1
                ]}
              >
                <planeGeometry args={[1, 1]} />
                <meshBasicMaterial 
                  color="#ffffff"
                  transparent={true}
                  opacity={0.2}
                  side={THREE.DoubleSide}
                />
              </mesh>
            )}
          </group>
        )
      })}
    </group>
  )
}

// Preload the model
useGLTF.preload('/public/models/tshirt.glb')

export default TShirtModel