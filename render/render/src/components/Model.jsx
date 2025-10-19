import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react'
import { useGLTF, Environment } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Urban Custom T-Shirt Shop Editor with Graffiti Walls
 * Street art aesthetic - focus on model
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
    radius: 4,
    theta: 0,
    phi: Math.PI / 2,
    targetRadius: 4,
    targetTheta: 0,
    targetPhi: Math.PI / 2,
    velocity: { theta: 0, phi: 0 },
    damping: 0.15
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

  // Load graffiti wall textures from images
  const wallTextures = useMemo(() => {
    const textureLoader = new THREE.TextureLoader()
    
    const backWallUrl = '/sample1.jpg'
    const leftWallUrl = '/wall2.jpg'
    const rightWallUrl = '/wall1.jpg'
    const floorUrl = '/wp5250282.jpg'
    
    const loadTexture = (url) => {
      const texture = textureLoader.load(
        url,
        undefined,
        undefined,
        (error) => {
          console.error('Error loading texture:', error)
        }
      )
      texture.wrapS = THREE.RepeatWrapping
      texture.wrapT = THREE.RepeatWrapping
      texture.minFilter = THREE.LinearMipmapLinearFilter
      texture.magFilter = THREE.LinearFilter
      texture.anisotropy = gl.capabilities.getMaxAnisotropy()
      return texture
    }
    
    return {
      back: loadTexture(backWallUrl),
      left: loadTexture(leftWallUrl),
      right: loadTexture(rightWallUrl),
      floor: loadTexture(floorUrl)
    }
  }, [gl])

  // Enhanced fabric texture
  const fabricTexture = useMemo(() => {
    const cacheKey = `fabric_${color}`
    if (textureCache.current.has(cacheKey)) {
      return textureCache.current.get(cacheKey)
    }

    const canvas = document.createElement('canvas')
    canvas.width = 2048
    canvas.height = 2560
    const ctx = canvas.getContext('2d', { alpha: false })
    
    ctx.fillStyle = color
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Fabric texture
    ctx.fillStyle = 'rgba(0, 0, 0, 0.015)'
    for (let i = 0; i < canvas.width; i += 2) {
      for (let j = 0; j < canvas.height; j += 2) {
        if (Math.random() > 0.97) {
          ctx.fillRect(i, j, 1, 1)
        }
      }
    }
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.008)'
    for (let i = 0; i < canvas.width; i += 4) {
      ctx.fillRect(i, 0, 1, canvas.height)
    }
    for (let j = 0; j < canvas.height; j += 4) {
      ctx.fillRect(0, j, canvas.width, 1)
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.ClampToEdgeWrapping
    texture.wrapT = THREE.ClampToEdgeWrapping
    texture.flipY = false
    texture.minFilter = THREE.LinearMipmapLinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.anisotropy = gl.capabilities.getMaxAnisotropy()
    
    textureCache.current.set(cacheKey, texture)
    return texture
  }, [color, gl])

  const compositeMaterial = useMemo(() => {
    const material = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.7,
      metalness: 0.02,
      map: fabricTexture,
      toneMapped: true,
      normalScale: new THREE.Vector2(0.3, 0.3),
      envMapIntensity: 0.5
    })

    if (viewMode === 'wireframe') {
      material.wireframe = true
      material.wireframeLinewidth = 1
    } else if (viewMode === 'solid') {
      material.map = null
    }

    return material
  }, [color, viewMode, fabricTexture])

  const updateCamera = useCallback(() => {
    const state = cameraState.current
    
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

  useEffect(() => {
    if (!enableAdvancedControls) return
    
    const canvas = gl.domElement
    if (!canvas) return

    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0

    const getTouchPos = (touch) => ({
      x: touch.clientX,
      y: touch.clientY
    })

    const getTouchDistance = (touch1, touch2) => {
      const dx = touch2.clientX - touch1.clientX
      const dy = touch2.clientY - touch1.clientY
      return Math.sqrt(dx * dx + dy * dy)
    }

    const handlePointerDown = (e) => {
      const ctrl = controlState.current
      const state = cameraState.current
      
      const pos = e.touches ? getTouchPos(e.touches[0]) : { x: e.clientX, y: e.clientY }
      
      ctrl.isInteracting = true
      ctrl.lastX = pos.x
      ctrl.lastY = pos.y
      ctrl.lastTouchTime = Date.now()
      ctrl.isTouchPinch = false
      
      state.targetTheta = state.theta
      state.targetPhi = state.phi
      state.targetRadius = state.radius
      
      if (isTouch && navigator.vibrate) {
        navigator.vibrate(10)
      }
    }

    const handlePointerMove = (e) => {
      const ctrl = controlState.current
      const state = cameraState.current
      
      if (!ctrl.isInteracting) return
      
      if (e.touches && e.touches.length === 2) {
        e.preventDefault()
        
        const distance = getTouchDistance(e.touches[0], e.touches[1])
        
        if (ctrl.lastDistance > 0) {
          const delta = (distance - ctrl.lastDistance) * 0.02
          state.targetRadius = Math.max(2, Math.min(10, state.targetRadius - delta))
        }
        
        ctrl.lastDistance = distance
        ctrl.isTouchPinch = true
        return
      }

      if (ctrl.isTouchPinch) {
        ctrl.lastDistance = 0
        ctrl.isTouchPinch = false
      }

      e.preventDefault()
      
      const pos = e.touches ? getTouchPos(e.touches[0]) : { x: e.clientX, y: e.clientY }
      
      const sensitivity = isTouch ? 0.012 : 0.008
      
      const deltaX = (pos.x - ctrl.lastX) * sensitivity
      const deltaY = (pos.y - ctrl.lastY) * sensitivity
      
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
      
      const zoomDelta = e.deltaY * 0.004
      state.targetRadius = Math.max(2, Math.min(10, state.targetRadius + zoomDelta))
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
          state.targetRadius = 4
          break
        case '+':
        case '=':
          state.targetRadius = Math.max(2, state.targetRadius - 0.5)
          break
        case '-':
          state.targetRadius = Math.min(10, state.targetRadius + 0.5)
          break
        default:
          break
      }
    }

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

  useFrame(() => {
    updateCamera()
  })

  if (error || !nodes) {
    return (
      <>
        <color attach="background" args={['#1a1a1a']} />
        <ambientLight intensity={0.5} color="#ffffff" />
        <directionalLight position={[5, 10, 5]} intensity={1.2} color="#ffffff" castShadow />
        <pointLight position={[0, 5, 5]} intensity={1} color="#ffffff" />
        
        <Environment preset="night" />
        
        {/* Back Wall */}
        <mesh position={[0, 0, -8]} receiveShadow>
          <planeGeometry args={[25, 15]} />
          <meshStandardMaterial 
            color="#2a2a2a"
            roughness={0.9}
            metalness={0.1}
          />
        </mesh>
        
        {/* Left Wall */}
        <mesh position={[-8, 0, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
          <planeGeometry args={[16, 15]} />
          <meshStandardMaterial 
            color="#2a2a2a"
            roughness={0.9}
            metalness={0.1}
          />
        </mesh>
        
        {/* Right Wall */}
        <mesh position={[8, 0, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
          <planeGeometry args={[16, 15]} />
          <meshStandardMaterial 
            color="#2a2a2a"
            roughness={0.9}
            metalness={0.1}
          />
        </mesh>
        
        {/* Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
          <planeGeometry args={[25, 16]} />
          <meshStandardMaterial 
            color="#1a1a1a"
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>
        
        <group ref={group}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[2.2, 2.8, 0.12]} />
            <meshStandardMaterial 
              color={error ? "#ff6b6b" : color}
              roughness={0.7}
              metalness={0.1}
            />
          </mesh>
        </group>
      </>
    )
  }

  return (
    <>
      {/* Dark background */}
      <color attach="background" args={['#1a1a1a']} />
      
      {/* Soft white ambient lighting */}
      <ambientLight intensity={0.5} color="#ffffff" />
      
      {/* Main key light */}
      <directionalLight
        position={[5, 10, 5]}
        intensity={1.2}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      
      {/* Fill light */}
      <directionalLight
        position={[-5, 5, -5]}
        intensity={0.6}
        color="#ffffff"
      />
      
      {/* Accent lights - subtle white */}
      <pointLight position={[0, 5, 5]} intensity={0.8} color="#ffffff" />
      <pointLight position={[-5, 3, -5]} intensity={0.6} color="#ffffff" />
      <pointLight position={[5, 3, -5]} intensity={0.6} color="#ffffff" />
      
      {/* Rim lighting */}
      <spotLight
        position={[0, 8, -6]}
        intensity={1}
        angle={0.6}
        penumbra={1}
        color="#ffffff"
        castShadow
      />
      
      <Environment preset="night" />
      
      {/* Back Wall with Graffiti Image */}
      <mesh position={[0, 0, -8]} receiveShadow>
        <planeGeometry args={[25, 15]} />
        <meshStandardMaterial 
          map={wallTextures.back}
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>
      
      {/* Left Wall with Graffiti Image */}
      <mesh position={[-8, 0, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[16, 15]} />
        <meshStandardMaterial 
          map={wallTextures.left}
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>
      
      {/* Right Wall with Graffiti Image */}
      <mesh position={[8, 0, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[16, 15]} />
        <meshStandardMaterial 
          map={wallTextures.right}
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>
      
      {/* Floor with Image Texture */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[25, 16]} />
        <meshStandardMaterial 
          map={wallTextures.floor}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* Main T-Shirt Model - Focus Point */}
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
    </>
  )
}

useGLTF.preload('/models/oversized_t-shirt.glb')

export default Model