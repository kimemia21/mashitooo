// DecalSticker.jsx
import React, { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { Decal, useTexture, TransformControls } from '@react-three/drei'

export function DecalSticker({ sticker, onSelect, isSelected, onDragEnd }) {
  const decalRef = useRef()
  const transformRef = useRef()
  const meshRef = useRef()
  const texture = useTexture(sticker.url)
  
  // Convert sticker position to 3D coordinates
  // For now, let's place the sticker at a default position on the mesh surface
  const position = useMemo(() => {
    // Default position on the front of the t-shirt
    return sticker.position || [0, 0, 0.5]
  }, [sticker.position])
  
  const rotation = useMemo(() => {
    // Default rotation facing forward
    return sticker.rotation || [0, 0, 0]
  }, [sticker.rotation])
  
  const scale = useMemo(() => {
    return sticker.scale || 0.5
  }, [sticker.scale])

  // Handle the drag/scale/rotate end event
  const handleTransformEnd = (e) => {
    // The event is fired on the TransformControls. We need to grab the manipulated object (meshRef.current)
    // and pass its new position/scale/rotation up to the state manager.
    onDragEnd(e)
  }

  return (
    <>
      {/* Transform control mesh */}
      <mesh
        ref={meshRef}
        position={position}
        rotation={rotation}
        scale={[scale, scale, scale]}
        onClick={(e) => {
          e.stopPropagation()
          onSelect(sticker.id)
        }}
        userData={{ isSticker: true, id: sticker.id }}
      >
        <boxGeometry args={[1, 1, 0.001]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {/* Transform controls */}
      {isSelected && (
        <TransformControls 
          ref={transformRef} 
          object={meshRef} 
          mode="translate"
          onMouseDown={() => onSelect(sticker.id)}
          onMouseUp={handleTransformEnd}
        />
      )}

      {/* Decal - simplified version */}
      <Decal
        ref={decalRef}
        position={position}
        rotation={rotation}
        scale={scale}
        map={texture}
      />
    </>
  )
}

export default DecalSticker; 