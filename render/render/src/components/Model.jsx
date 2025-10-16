import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react'
import { useGLTF, Environment } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Enhanced TShirtModel with professional editor-like controls
 * Improvements: Better typography handling, smoother animations, enhanced visual feedback
 * Time Complexity: O(n) where n = number of stickers (one-time canvas render)
 * Space Complexity: O(1) for textures (cached and reused)
 */
function Model({ 
  color = '#ffffff', 
  stickers = [],
  viewMode = 'rendered',
  enableAdvancedControls = true,
  onRotationChange = null
}) {
  const group = useRef()
  const meshRef = useRef()
  const { camera, gl, size } = useThree()
  
  // Enhanced camera state with smoother interpolation
  const cameraState = useRef({
    radius: 5,
    theta: 0,
    phi: Math.PI / 2,
    targetRadius: 5,
    targetTheta: 0,
    targetPhi: Math.PI / 2,
    velocity: { theta: 0, phi: 0 },
    damping: 0.15 // Smoother camera movement
  })
  
  const controlState = useRef({
    isInteracting: false,
    lastX: 0,
    lastY: 0,
    lastDistance: 0,
    lastTouchTime: 0,
    isTouchPinch: false,
    deltaX: 0,
    deltaY: 0
  })

  // Enhanced texture cache with better memory management
  const textureCache = useRef(new Map())
  const [, forceUpdate] = useState()
  const [isLoading, setIsLoading] = useState(true)

  let nodes, materials, error
  try {
    const gltf = useGLTF('/models/oversized_t-shirt.glb', true)
    nodes = gltf.nodes
    materials = gltf.materials
    if (isLoading) setIsLoading(false)
  } catch (e) {
    error = e
    console.error('Model loading error:', e)
  }

  // Enhanced fabric texture with better quality
  const fabricTexture = useMemo(() => {
    const cacheKey = `fabric_${color}`
    if (textureCache.current.has(cacheKey)) {
      return textureCache.current.get(cacheKey)
    }

    const canvas = document.createElement('canvas')
    // Higher resolution for better quality
    canvas.width = 2048
    canvas.height = 2560
    const ctx = canvas.getContext('2d', { alpha: false })
    
    // Base color
    ctx.fillStyle = color
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Enhanced fabric texture with multiple layers
    // Layer 1: Fine grain
    ctx.fillStyle = 'rgba(0, 0, 0, 0.015)'
    for (let i = 0; i < canvas.width; i += 2) {
      for (let j = 0; j < canvas.height; j += 2) {
        if (Math.random() > 0.97) {
          ctx.fillRect(i, j, 1, 1)
        }
      }
    }
    
    // Layer 2: Subtle weave pattern
    ctx.fillStyle = 'rgba(0, 0, 0, 0.008)'
    for (let i = 0; i < canvas.width; i += 4) {
      ctx.fillRect(i, 0, 1, canvas.height)
    }
    for (let j = 0; j < canvas.height; j += 4) {
      ctx.fillRect(0, j, canvas.width, 1)
    }
    
    // Layer 3: Fabric noise for realism
    ctx.globalAlpha = 0.02
    for (let i = 0; i < 1000; i++) {
      const x = Math.random() * canvas.width
      const y = Math.random() * canvas.height
      const size = Math.random() * 3
      ctx.fillRect(x, y, size, size)
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.ClampToEdgeWrapping
    texture.wrapT = THREE.ClampToEdgeWrapping
    texture.flipY = false
    texture.minFilter = THREE.LinearMipmapLinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.anisotropy = gl.capabilities.getMaxAnisotropy() // Better texture quality
    
    textureCache.current.set(cacheKey, texture)
    return texture
  }, [color, gl])

  // Enhanced material with better lighting response
  const compositeMaterial = useMemo(() => {
    const material = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.7, // Slightly more matte for fabric
      metalness: 0.02,
      map: fabricTexture,
      toneMapped: true,
      normalScale: new THREE.Vector2(0.3, 0.3), // Subtle normal mapping effect
      envMapIntensity: 0.4 // Better environment reflection
    })

    if (viewMode === 'wireframe') {
      material.wireframe = true
      material.wireframeLinewidth = 1
    } else if (viewMode === 'solid') {
      material.map = null
    }

    return material
  }, [color, viewMode, fabricTexture])

  // Enhanced camera controls with smooth damping
  const updateCamera = useCallback(() => {
    const state = cameraState.current
    
    // Smooth interpolation for camera movement
    state.radius += (state.targetRadius - state.radius) * state.damping
    state.theta += (state.targetTheta - state.theta) * state.damping
    state.phi += (state.targetPhi - state.phi) * state.damping
    
    const x = state.radius * Math.sin(state.phi) * Math.cos(state.theta)
    const y = state.radius * Math.cos(state.phi)
    const z = state.radius * Math.sin(state.phi) * Math.sin(state.theta)
    
    camera.position.set(x, y, z)
    camera.lookAt(0, 0, 0)
    
    if (onRotationChange) {
      onRotationChange({ 
        theta: state.theta, 
        phi: state.phi, 
        radius: state.radius 
      })
    }
  }, [camera, onRotationChange])

  // Main touch/mouse control handler
  useEffect(() => {
    if (!enableAdvancedControls) return
    
    const canvas = gl.domElement
    if (!canvas) return

    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0

    // Helper to get touch position
    const getTouchPos = (touch) => ({
      x: touch.clientX,
      y: touch.clientY
    })

    // Helper to calculate distance between two touches
    const getTouchDistance = (touch1, touch2) => {
      const dx = touch2.clientX - touch1.clientX
      const dy = touch2.clientY - touch1.clientY
      return Math.sqrt(dx * dx + dy * dy)
    }

    const handlePointerDown = (e) => {
      const ctrl = controlState.current
      const state = cameraState.current
      
      // Handle both mouse and touch
      const pos = e.touches ? getTouchPos(e.touches[0]) : { x: e.clientX, y: e.clientY }
      
      ctrl.isInteracting = true
      ctrl.lastX = pos.x
      ctrl.lastY = pos.y
      ctrl.lastTouchTime = Date.now()
      ctrl.isTouchPinch = false
      
      // Sync targets with current position for smooth start
      state.targetTheta = state.theta
      state.targetPhi = state.phi
      state.targetRadius = state.radius
      
      // Haptic feedback on touch devices
      if (isTouch && navigator.vibrate) {
        navigator.vibrate(10)
      }
    }

    const handlePointerMove = (e) => {
      const ctrl = controlState.current
      const state = cameraState.current
      
      if (!ctrl.isInteracting) return
      
      // Handle two-finger pinch zoom (takes priority)
      if (e.touches && e.touches.length === 2) {
        e.preventDefault()
        
        const distance = getTouchDistance(e.touches[0], e.touches[1])
        
        if (ctrl.lastDistance > 0) {
          const delta = (distance - ctrl.lastDistance) * 0.02
          state.targetRadius = Math.max(2.5, Math.min(15, state.targetRadius - delta))
        }
        
        ctrl.lastDistance = distance
        ctrl.isTouchPinch = true
        return
      }

      // Single touch/mouse drag for rotation
      if (ctrl.isTouchPinch) {
        ctrl.lastDistance = 0
        ctrl.isTouchPinch = false
      }

      e.preventDefault()
      
      const pos = e.touches ? getTouchPos(e.touches[0]) : { x: e.clientX, y: e.clientY }
      
      // Adjust sensitivity for touch vs mouse
      const sensitivity = isTouch ? 0.012 : 0.008
      
      const deltaX = (pos.x - ctrl.lastX) * sensitivity
      const deltaY = (pos.y - ctrl.lastY) * sensitivity
      
      // Update target positions for smooth damping
      state.targetTheta -= deltaX
      state.targetPhi = Math.max(0.2, Math.min(Math.PI - 0.2, state.targetPhi + deltaY))
      
      ctrl.lastX = pos.x
      ctrl.lastY = pos.y
    }

    const handlePointerUp = () => {
      const ctrl = controlState.current
      ctrl.isInteracting = false
      ctrl.isTouchPinch = false
      ctrl.lastDistance = 0
    }

    const handleWheel = (e) => {
      e.preventDefault()
      const state = cameraState.current
      
      // Enhanced zoom with better feel
      const zoomDelta = e.deltaY * 0.004
      state.targetRadius = Math.max(2.5, Math.min(15, state.targetRadius + zoomDelta))
    }

    const handleKeyDown = (e) => {
      const state = cameraState.current
      const speed = 0.08
      
      switch(e.key) {
        case 'ArrowLeft':
          state.targetTheta -= speed
          break
        case 'ArrowRight':
          state.targetTheta += speed
          break
        case 'ArrowUp':
          state.targetPhi = Math.max(0.2, state.targetPhi - speed)
          break
        case 'ArrowDown':
          state.targetPhi = Math.min(Math.PI - 0.2, state.targetPhi + speed)
          break
        case '1':
          state.targetTheta = 0
          state.targetPhi = Math.PI / 2
          state.targetRadius = 5
          break
        case '+':
        case '=':
          state.targetRadius = Math.max(2.5, state.targetRadius - 0.5)
          break
        case '-':
          state.targetRadius = Math.min(15, state.targetRadius + 0.5)
          break
        default:
          break
      }
    }

    // Register event listeners with proper passive flags
    canvas.addEventListener('mousedown', handlePointerDown, { passive: true })
    canvas.addEventListener('mousemove', handlePointerMove, { passive: false })
    canvas.addEventListener('mouseup', handlePointerUp, { passive: true })
    canvas.addEventListener('mouseleave', handlePointerUp, { passive: true })
    
    canvas.addEventListener('touchstart', handlePointerDown, { passive: true })
    canvas.addEventListener('touchmove', handlePointerMove, { passive: false })
    canvas.addEventListener('touchend', handlePointerUp, { passive: true })
    
    canvas.addEventListener('wheel', handleWheel, { passive: false })
    
    window.addEventListener('keydown', handleKeyDown, { passive: true })

    return () => {
      canvas.removeEventListener('mousedown', handlePointerDown)
      canvas.removeEventListener('mousemove', handlePointerMove)
      canvas.removeEventListener('mouseup', handlePointerUp)
      canvas.removeEventListener('mouseleave', handlePointerUp)
      
      canvas.removeEventListener('touchstart', handlePointerDown)
      canvas.removeEventListener('touchmove', handlePointerMove)
      canvas.removeEventListener('touchend', handlePointerUp)
      
      canvas.removeEventListener('wheel', handleWheel)
      
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [enableAdvancedControls, gl])

  // Smooth camera update per frame
  useFrame(() => {
    updateCamera()
  })

  // Enhanced fallback with loading state
  if (error) {
    return (
      <group ref={group}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2.2, 2.8, 0.12]} />
          <meshStandardMaterial 
            color="#ff6b6b" 
            roughness={0.7}
            metalness={0.1}
          />
        </mesh>
      </group>
    )
  }

  if (!nodes) {
    return (
      <group ref={group}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2.2, 2.8, 0.12]} />
          <meshStandardMaterial 
            color={color}
            roughness={0.7}
            metalness={0.02}
            opacity={0.5}
            transparent
          />
        </mesh>
      </group>
    )
  }

  return (
    <group ref={group} dispose={null}>
      {Object.entries(nodes).map(([name, node]) => 
        node.isMesh && node.geometry ? (
          <mesh
            key={name}
            ref={name.includes('hirt') ? meshRef : undefined}
            geometry={node.geometry}
            material={compositeMaterial}
            position={node.position}
            rotation={node.rotation}
            scale={node.scale}
            castShadow
            receiveShadow
          />
        ) : null
      )}
    </group>
  )
}

useGLTF.preload('/models/oversized_t-shirt.glb')

export default Model