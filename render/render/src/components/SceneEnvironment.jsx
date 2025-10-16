// SceneEnvironment.jsx (New component)
import React from 'react'
import { Environment, Plane, PerspectiveCamera, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'

export function SceneEnvironment() {
  return (
    <>
      {/* 1. Camera Setup (Optional - Can also be done outside) */}
      {/* <PerspectiveCamera makeDefault position={[5, 5, 5]} fov={50} /> */}

      {/* 2. Professional Studio Lighting */}
      <ambientLight intensity={0.5} color="#c0c0c0" /> 
      {/* Key Light: Brightest, slightly offset */}
      <directionalLight 
        position={[8, 8, 8]} 
        intensity={1.5} 
        castShadow 
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={20}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        color="#ffffff"
      />
      {/* Fill Light: Soft, reduces harsh shadows */}
      <directionalLight position={[-8, 4, 4]} intensity={0.4} color="#a0a0ff" />
      {/* Rim Light: Defines edges, gives depth */}
      <directionalLight position={[0, 4, -8]} intensity={0.3} color="#ffffff" />
      
      {/* 3. Environment Map (Soft Studio Reflection) */}
      <Environment preset="studio" /> 

      {/* 4. Floor (Subtle Grid/Plane) */}
      <Plane 
        args={[30, 30]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -1.8, 0]} // Adjust Y to be below the model
        receiveShadow
      >
        {/* Subtle, dark material for the floor */}
        <meshStandardMaterial 
          color="#333333" 
          roughness={0.8} 
          metalness={0.1} 
        />
        {/* Simple grid helper for a "workspace" feel */}
        <gridHelper args={[30, 30, '#555555', '#555555']} position={[0, 0.01, 0]} />
      </Plane>

      {/* 5. Contact Shadows for Better Grounding */}
      <ContactShadows 
        position={[0, -1.75, 0]} 
        opacity={0.5} 
        scale={10} 
        blur={1.5} 
        far={2} 
        resolution={512} 
        color="#000000"
      />

      {/* 6. Background Color (Professional Dark Grey) */}
      <color attach="background" args={["#282c34"]} /> 
    </>
  )
}
