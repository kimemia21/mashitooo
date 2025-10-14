// DecalSticker.jsx
import React, { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { Decal, useTexture, TransformControls } from '@react-three/drei'

export function DecalSticker({ sticker, targetMesh, onSelect, isSelected, onDragEnd }) {
  const decalRef = useRef()
  const transformRef = useRef()
  const texture = useTexture(sticker.url)
  
  // The Decal component requires a position, rotation, and size
  const positionVector = useMemo(() => new THREE.Vector3(...sticker.position), [sticker.position])
  const normalVector = useMemo(() => new THREE.Vector3(...sticker.normal), [sticker.normal])


  // Calculate the rotation needed to align the decal to the surface normal
  // Three.js DecalGeometry uses a quaternion for orientation, but useMemo is cleaner here
  const rotationQuaternion = useMemo(() => {
    const orientation = new THREE.Euler()
    orientation.setFromVector3(normalVector)
    return new THREE.Quaternion().setFromEuler(orientation)
  }, [normalVector])

  // Decal size is based on the sticker's scale, converted to a THREE.Vector3
  // The decal is a 3D object, so scale must be in 3 dimensions. We assume depth (z) is small.
  const sizeVector = useMemo(() => new THREE.Vector3(sticker.scale, sticker.scale * 1.25, sticker.scale), [sticker.scale])

  // --- TransformControls attaches to a mesh to enable drag/resize. ---
  // We use a simple, invisible box as the transformable object, and the Decal projects off it.
  const meshRef = useRef()
  
  // Set up the sticker mesh's initial position and rotation
  // This mesh is what the TransformControls will manipulate
  if (meshRef.current) {
    meshRef.current.position.set(...sticker.position)
    meshRef.current.rotation.set(...sticker.rotation)
    meshRef.current.scale.set(sticker.scale, sticker.scale, sticker.scale)
  }

  // Handle the drag/scale/rotate end event
  const handleTransformEnd = (e) => {
    // The event is fired on the TransformControls. We need to grab the manipulated object (meshRef.current)
    // and pass its new position/scale/rotation up to the state manager.
    onDragEnd(e)
  }

  return (
    <>
      {/* 1. The invisible mesh that TransformControls will attach to */}
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation() // Prevent the click from creating a new decal
          onSelect(sticker.id)
        }}
        userData={{ isSticker: true, id: sticker.id }}
        // Set the initial scale and position based on state
        position={positionVector.toArray()}
        scale={[sticker.scale, sticker.scale, sticker.scale]}
      >
        <boxGeometry args={[1, 1, 0.001]} />
        <meshBasicMaterial visible={false} /> {/* Invisible transform target */}
      </mesh>

      {/* 2. The TransformControls Gizmo */}
      {isSelected && (
        <TransformControls 
          ref={transformRef} 
          object={meshRef} 
          mode="translate" // Default to translate mode
          onMouseDown={() => onSelect(sticker.id)}
          onMouseUp={handleTransformEnd}
          // The helper for transforming a mesh can be attached to the invisible box
        >
          {/* TransformControls will manage the position/rotation/scale of meshRef.current */}
        </TransformControls>
      )}

      {/* 3. The Actual Decal Projection */}
      {/* The Decal should follow the meshRef's position, rotation, and scale */}
      <Decal
        ref={decalRef}
        position={meshRef.current ? meshRef.current.position.toArray() : positionVector.toArray()}
        rotation={meshRef.current ? meshRef.current.rotation.toArray().slice(0, 3) : normalVector.toArray()}
        scale={meshRef.current ? meshRef.current.scale.x : sticker.scale} // Use scale from transform mesh
        map={texture}
        debug // Helps visualize the decal projection bounds
      >
        {/* We use a Decal component from drei, which handles the DecalGeometry internally */}
        <meshPhysicalMaterial 
          map={texture} 
          polygonOffset 
          polygonOffsetFactor={-4} // Critical: ensures decal renders on top of the mesh
          transparent 
          depthTest={false}
        />
      </Decal>
    </>
  )
}

export default DecalSticker; 