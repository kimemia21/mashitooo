import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react'
import { useGLTF, Decal, useTexture } from '@react-three/drei'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { DecalSticker } from './DecalSticker'
import { MeshSticker } from './MeshSticker'

// Enhanced physics constants for God Mode camera system
const ROTATION_SPEED = 0.012
const DAMPING = 0.88
const SPRING_STIFFNESS = 0.08
const SPRING_DAMPING = 0.75
const MAX_POLAR_ANGLE = Math.PI * 0.95 // Prevent camera from flipping over
const MIN_POLAR_ANGLE = Math.PI * 0.05
const MIN_DISTANCE = 2 // Minimum camera distance from model
const MAX_DISTANCE = 15 // Maximum camera distance from model
const DEFAULT_DISTANCE = 5
const AUTO_CENTER_SPEED = 0.15
const INERTIA_THRESHOLD = 0.0003
const IDLE_TIMEOUT = 3000
const PINCH_SENSITIVITY = 0.015
const MOMENTUM_MULTIPLIER = 0.18
const KEYBOARD_ROTATION_SPEED = 0.05
const ZOOM_SPEED = 0.3

export default function TShirtModel({ 
  color = '#ffffff', 
  stickers = [], 
  viewMode = 'rendered',
  enableAdvancedControls = true,
  onRotationChange = null,
  selectedSticker = null,
  onStickerSelect = () => {},
  onStickerUpdate = () => {}
}) {
  const group = useRef()
  const { camera, gl, size } = useThree()
  

  // Spherical coordinates for God Mode orbit camera
  const [spherical, setSpherical] = useState({
    radius: DEFAULT_DISTANCE, // Distance from model center
    theta: 0, // Azimuth angle (horizontal rotation around Y-axis)
    phi: Math.PI / 2, // Polar angle (vertical angle from Y-axis)
  })
  
  const [targetSpherical, setTargetSpherical] = useState({
    radius: DEFAULT_DISTANCE,
    theta: 0,
    phi: Math.PI / 2,
  })

  // Enhanced state management
  const [velocity, setVelocity] = useState({ theta: 0, phi: 0 })
  const [isInteracting, setIsInteracting] = useState(false)
  const [shouldAutoCenter, setShouldAutoCenter] = useState(false)
  const [springAnimation, setSpringAnimation] = useState({ 
    active: false, 
    targetTheta: 0, 
    targetPhi: Math.PI / 2,
    targetRadius: DEFAULT_DISTANCE 
  })
  
  const lastInteractionTime = useRef(Date.now())
  const velocityHistory = useRef([])
  
  const [touchState, setTouchState] = useState({
    dragging: false,
    pinching: false,
    lastX: 0,
    lastY: 0,
    lastDistance: 0,
    initialTouch: null,
    touchCount: 0,
    lastTapTime: 0,
  })

  const isMobile = useMemo(() => window.innerWidth < 768, [])

  // Camera setup - set initial position
  useEffect(() => {
    if (camera.isPerspectiveCamera) {
      camera.fov = isMobile ? 45 : 35
      camera.position.set(0, 0, DEFAULT_DISTANCE)
      camera.lookAt(0, 0, 0) // Always look at model center
      camera.updateProjectionMatrix()
    }
  }, [camera, isMobile])

  // Load model
  const { nodes, materials } = useGLTF('/models/oversized_t-shirt.glb')

  // Utility functions
  const getTouchDistance = useCallback((touch1, touch2) => {
    const dx = touch1.clientX - touch2.clientX
    const dy = touch1.clientY - touch2.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }, [])

  const getTouchMidpoint = useCallback((touch1, touch2) => {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2
    }
  }, [])

  const updateVelocityHistory = useCallback((vTheta, vPhi) => {
    velocityHistory.current.push({ theta: vTheta, phi: vPhi, time: Date.now() })
    if (velocityHistory.current.length > 5) {
      velocityHistory.current.shift()
    }
  }, [])

  const getAverageVelocity = useCallback(() => {
    if (velocityHistory.current.length === 0) return { theta: 0, phi: 0 }
    
    const recent = velocityHistory.current.slice(-3)
    const avgTheta = recent.reduce((sum, v) => sum + v.theta, 0) / recent.length
    const avgPhi = recent.reduce((sum, v) => sum + v.phi, 0) / recent.length
    
    return { theta: avgTheta, phi: avgPhi }
  }, [])

  // Snap to specific view angles (Professional 3D editor preset views)
  const snapToViewAngle = useCallback((view) => {
    const viewAngles = {
      front: { theta: 0, phi: Math.PI / 2, radius: DEFAULT_DISTANCE },
      back: { theta: Math.PI, phi: Math.PI / 2, radius: DEFAULT_DISTANCE },
      left: { theta: -Math.PI / 2, phi: Math.PI / 2, radius: DEFAULT_DISTANCE },
      right: { theta: Math.PI / 2, phi: Math.PI / 2, radius: DEFAULT_DISTANCE },
      top: { theta: 0, phi: 0.1, radius: DEFAULT_DISTANCE },
      bottom: { theta: 0, phi: Math.PI - 0.1, radius: DEFAULT_DISTANCE },
    }
    
    if (viewAngles[view]) {
      setSpringAnimation({ 
        active: true, 
        targetTheta: viewAngles[view].theta, 
        targetPhi: viewAngles[view].phi,
        targetRadius: viewAngles[view].radius
      })
      setTargetSpherical({
        theta: viewAngles[view].theta,
        phi: viewAngles[view].phi,
        radius: viewAngles[view].radius
      })
      setShouldAutoCenter(true)
      setVelocity({ theta: 0, phi: 0 })
    }
  }, [])

  // Enhanced touch handlers with God Mode camera orbiting
  useEffect(() => {
    if (!enableAdvancedControls) return
    
    const canvas = gl.domElement
    if (!canvas) return

    const handleTouchStart = (e) => {
      lastInteractionTime.current = Date.now()
      setIsInteracting(true)
      setShouldAutoCenter(false)
      velocityHistory.current = []
      
      const touchCount = e.touches.length
      
      if (touchCount === 1) {
        const touch = e.touches[0]
        setTouchState({
          dragging: true,
          pinching: false,
          lastX: touch.clientX,
          lastY: touch.clientY,
          lastDistance: 0,
          initialTouch: { x: touch.clientX, y: touch.clientY },
          touchCount: 1,
          lastTapTime: Date.now(),
        })
        setVelocity({ theta: 0, phi: 0 })
        
      } else if (touchCount === 2) {
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        const distance = getTouchDistance(touch1, touch2)
        const midpoint = getTouchMidpoint(touch1, touch2)
        
        setTouchState({
          dragging: false,
          pinching: true,
          lastX: midpoint.x,
          lastY: midpoint.y,
          lastDistance: distance,
          initialTouch: midpoint,
          touchCount: 2,
          lastTapTime: 0,
        })
        setVelocity({ theta: 0, phi: 0 })
        
      } else if (touchCount === 3) {
        e.preventDefault()
        snapToViewAngle('front')
      }
    }

    const handleTouchMove = (e) => {
      e.preventDefault()
      lastInteractionTime.current = Date.now()
      
      if (touchState.pinching && e.touches.length === 2) {
        // Pinch to zoom = change camera distance
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        const distance = getTouchDistance(touch1, touch2)
        
        if (touchState.lastDistance > 0) {
          const delta = distance - touchState.lastDistance
          const zoomDelta = -delta * PINCH_SENSITIVITY // Negative because pinching in = zoom in = closer
          
          setSpherical((sph) => ({
            ...sph,
            radius: Math.max(MIN_DISTANCE, Math.min(MAX_DISTANCE, sph.radius + zoomDelta))
          }))
        }
        
        setTouchState((prev) => ({ 
          ...prev, 
          lastDistance: distance
        }))
        
      } else if (touchState.dragging && e.touches.length === 1) {
        const touch = e.touches[0]
        const dx = touch.clientX - touchState.lastX
        const dy = touch.clientY - touchState.lastY
        
        // Orbit camera around model (God Mode)
        const deltaTheta = dx * ROTATION_SPEED
        const deltaPhi = dy * ROTATION_SPEED
        
        setSpherical((sph) => ({
          ...sph,
          theta: sph.theta - deltaTheta, // Horizontal orbit
          phi: Math.max(MIN_POLAR_ANGLE, Math.min(MAX_POLAR_ANGLE, sph.phi + deltaPhi)) // Vertical orbit with limits
        }))
        
        updateVelocityHistory(-deltaTheta * MOMENTUM_MULTIPLIER, deltaPhi * MOMENTUM_MULTIPLIER)
        
        setTouchState((prev) => ({
          ...prev,
          lastX: touch.clientX,
          lastY: touch.clientY,
        }))
      }
    }

    const handleTouchEnd = (e) => {
      const remainingTouches = e.touches.length
      
      if (remainingTouches === 0) {
        const avgVel = getAverageVelocity()
        setVelocity(avgVel)
        
        setIsInteracting(false)
        setTouchState({ 
          dragging: false, 
          pinching: false, 
          lastX: 0, 
          lastY: 0, 
          lastDistance: 0, 
          initialTouch: null,
          touchCount: 0,
          lastTapTime: touchState.lastTapTime
        })
        
        velocityHistory.current = []
        
      } else if (remainingTouches === 1 && touchState.pinching) {
        const touch = e.touches[0]
        setTouchState({
          dragging: true,
          pinching: false,
          lastX: touch.clientX,
          lastY: touch.clientY,
          lastDistance: 0,
          initialTouch: { x: touch.clientX, y: touch.clientY },
          touchCount: 1,
          lastTapTime: 0,
        })
      }
    }

    const handleDoubleTap = (e) => {
      const currentTime = Date.now()
      const tapGap = currentTime - touchState.lastTapTime
      
      if (tapGap < 300 && tapGap > 0 && e.touches.length === 1) {
        e.preventDefault()
        snapToViewAngle('front')
        setVelocity({ theta: 0, phi: 0 })
        
        setTouchState(prev => ({ ...prev, lastTapTime: 0 }))
      }
    }

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false })
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false })
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false })
    canvas.addEventListener('touchstart', handleDoubleTap, { passive: false })

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart)
      canvas.removeEventListener('touchmove', handleTouchMove)
      canvas.removeEventListener('touchend', handleTouchEnd)
      canvas.removeEventListener('touchstart', handleDoubleTap)
    }
  }, [touchState, enableAdvancedControls, gl, getTouchDistance, getTouchMidpoint, updateVelocityHistory, getAverageVelocity, snapToViewAngle])

  // Mouse wheel zoom (changes camera distance)
  useEffect(() => {
    if (!enableAdvancedControls || isMobile) return
    
    const canvas = gl.domElement
    if (!canvas) return

    const handleWheel = (e) => {
      e.preventDefault()
      lastInteractionTime.current = Date.now()
      
      const delta = e.deltaY * 0.01 // Positive = zoom out, negative = zoom in
      
      setSpherical((sph) => ({
        ...sph,
        radius: Math.max(MIN_DISTANCE, Math.min(MAX_DISTANCE, sph.radius + delta * ZOOM_SPEED))
      }))
      
      setTargetSpherical((sph) => ({
        ...sph,
        radius: Math.max(MIN_DISTANCE, Math.min(MAX_DISTANCE, sph.radius + delta * ZOOM_SPEED))
      }))
    }

    canvas.addEventListener('wheel', handleWheel, { passive: false })
    return () => canvas.removeEventListener('wheel', handleWheel)
  }, [enableAdvancedControls, isMobile, gl])

  // Keyboard controls (God Mode camera orbit)
  useEffect(() => {
    if (!enableAdvancedControls || isMobile) return

    const handleKeyDown = (e) => {
      lastInteractionTime.current = Date.now()
      
      switch(e.key) {
        case 'ArrowLeft':
        case '4':
          // Orbit camera left around model
          setSpherical(sph => ({ ...sph, theta: sph.theta - KEYBOARD_ROTATION_SPEED }))
          break
        case 'ArrowRight':
        case '6':
          // Orbit camera right around model
          setSpherical(sph => ({ ...sph, theta: sph.theta + KEYBOARD_ROTATION_SPEED }))
          break
        case 'ArrowUp':
        case '8':
          // Orbit camera up around model
          setSpherical(sph => ({ 
            ...sph, 
            phi: Math.max(MIN_POLAR_ANGLE, sph.phi - KEYBOARD_ROTATION_SPEED)
          }))
          break
        case 'ArrowDown':
        case '2':
          // Orbit camera down around model
          setSpherical(sph => ({ 
            ...sph, 
            phi: Math.min(MAX_POLAR_ANGLE, sph.phi + KEYBOARD_ROTATION_SPEED)
          }))
          break
        case '+':
        case '=':
          // Zoom in (move camera closer)
          setSpherical(sph => ({ 
            ...sph, 
            radius: Math.max(MIN_DISTANCE, sph.radius - 0.3)
          }))
          break
        case '-':
        case '_':
          // Zoom out (move camera farther)
          setSpherical(sph => ({ 
            ...sph, 
            radius: Math.min(MAX_DISTANCE, sph.radius + 0.3)
          }))
          break
        case 'r':
        case 'R':
          snapToViewAngle('front')
          break
        case '1':
          snapToViewAngle('front')
          break
        case '3':
          snapToViewAngle('right')
          break
        case '7':
          snapToViewAngle('top')
          break
        case '9':
          // Flip to opposite horizontal view
          setSpherical(sph => ({ ...sph, theta: sph.theta + Math.PI }))
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enableAdvancedControls, isMobile, snapToViewAngle])

  // Auto-center after idle
  useEffect(() => {
    const checkIdle = setInterval(() => {
      if (!isInteracting && Date.now() - lastInteractionTime.current > IDLE_TIMEOUT) {
        const velocityMagnitude = Math.sqrt(velocity.theta * velocity.theta + velocity.phi * velocity.phi)
        if (velocityMagnitude < INERTIA_THRESHOLD) {
          setShouldAutoCenter(true)
        }
      }
    }, 500)

    return () => clearInterval(checkIdle)
  }, [isInteracting, velocity])

  // Animation frame - God Mode camera system
  useFrame((state, delta) => {
    // Spring animation for view snapping
    if (springAnimation.active) {
      const dTheta = springAnimation.targetTheta - spherical.theta
      const dPhi = springAnimation.targetPhi - spherical.phi
      const dRadius = springAnimation.targetRadius - spherical.radius
      const distance = Math.sqrt(dTheta * dTheta + dPhi * dPhi + dRadius * dRadius)
      
      if (distance > 0.001) {
        const springForceTheta = dTheta * SPRING_STIFFNESS
        const springForcePhi = dPhi * SPRING_STIFFNESS
        const springForceRadius = dRadius * SPRING_STIFFNESS
        
        setVelocity((v) => ({
          theta: (v.theta + springForceTheta) * SPRING_DAMPING,
          phi: (v.phi + springForcePhi) * SPRING_DAMPING
        }))
        
        setSpherical((sph) => ({
          theta: sph.theta + velocity.theta,
          phi: Math.max(MIN_POLAR_ANGLE, Math.min(MAX_POLAR_ANGLE, sph.phi + velocity.phi)),
          radius: sph.radius + springForceRadius
        }))
      } else {
        setSpringAnimation({ active: false, targetTheta: 0, targetPhi: Math.PI / 2, targetRadius: DEFAULT_DISTANCE })
        setSpherical({ 
          theta: springAnimation.targetTheta, 
          phi: springAnimation.targetPhi,
          radius: springAnimation.targetRadius
        })
        setVelocity({ theta: 0, phi: 0 })
      }
    }
    // Auto-center logic
    else if (shouldAutoCenter && !isInteracting) {
      const dTheta = targetSpherical.theta - spherical.theta
      const dPhi = targetSpherical.phi - spherical.phi
      const distance = Math.sqrt(dTheta * dTheta + dPhi * dPhi)
      
      if (distance > 0.01) {
        const easeSpeed = AUTO_CENTER_SPEED * (1 + distance * 0.5)
        setSpherical((sph) => ({
          ...sph,
          theta: sph.theta + dTheta * easeSpeed,
          phi: Math.max(MIN_POLAR_ANGLE, Math.min(MAX_POLAR_ANGLE, sph.phi + dPhi * easeSpeed))
        }))
      } else {
        setShouldAutoCenter(false)
        setSpherical(targetSpherical)
      }
    }
    // Inertia and damping
    else if (!isInteracting && !shouldAutoCenter) {
      const velocityMagnitude = Math.sqrt(velocity.theta * velocity.theta + velocity.phi * velocity.phi)
      
      if (velocityMagnitude > INERTIA_THRESHOLD) {
        setSpherical((sph) => ({
          ...sph,
          theta: sph.theta + velocity.theta,
          phi: Math.max(MIN_POLAR_ANGLE, Math.min(MAX_POLAR_ANGLE, sph.phi + velocity.phi))
        }))
        setVelocity((v) => ({ 
          theta: v.theta * DAMPING, 
          phi: v.phi * DAMPING 
        }))
      } else {
        setVelocity({ theta: 0, phi: 0 })
      }
    }
    
    // ⭐ GOD MODE: Calculate camera position orbiting around stationary model at origin (0,0,0)
    // Convert spherical coordinates to Cartesian coordinates
    const x = spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta)
    const y = spherical.radius * Math.cos(spherical.phi)
    const z = spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta)
    
    // Update camera position - camera orbits, model stays still
    camera.position.set(x, y, z)
    camera.lookAt(0, 0, 0) // Always look at model center (origin)
    
    // Notify parent of camera rotation changes
    if (onRotationChange) {
      onRotationChange({ 
        theta: spherical.theta, 
        phi: spherical.phi,
        radius: spherical.radius 
      })
    }
  })

  // Fabric material
  const fabricTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 1024
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = color
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    const texture = new THREE.CanvasTexture(canvas)
    texture.flipY = false
    return texture
  }, [color])

  const material = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.75,
      metalness: 0.05,
      map: fabricTexture,
    })
    if (viewMode === 'wireframe') mat.wireframe = true
    if (viewMode === 'solid') mat.map = null
    return mat
  }, [viewMode, color, fabricTexture])

  // Model scale - keeping model size consistent
  const modelScale = isMobile ? 2 : 1.5

  // Expose control API
  useEffect(() => {
    if (window) {
      window.tshirtModelControls = {
        snapToFront: () => snapToViewAngle('front'),
        snapToBack: () => snapToViewAngle('back'),
        snapToLeft: () => snapToViewAngle('left'),
        snapToRight: () => snapToViewAngle('right'),
        snapToTop: () => snapToViewAngle('top'),
        snapToBottom: () => snapToViewAngle('bottom'),
        reset: () => {
          snapToViewAngle('front')
        },
        setZoom: (distance) => setSpherical(sph => ({ 
          ...sph, 
          radius: Math.min(MAX_DISTANCE, Math.max(MIN_DISTANCE, distance)) 
        })),
        getCamera: () => ({ 
          theta: spherical.theta, 
          phi: spherical.phi, 
          radius: spherical.radius 
        })
      }
    }
  }, [snapToViewAngle, spherical])

  // Get mesh reference for sticker placement
  const meshRef = useRef()
  const [targetMesh, setTargetMesh] = useState(null)

  // Set the target mesh for stickers when the model loads
  useEffect(() => {
    if (meshRef.current) {
      setTargetMesh(meshRef.current)
    }
  }, [])

  // Handle sticker drag end
  const handleStickerDragEnd = useCallback((stickerId, newPosition, newRotation, newScale) => {
    if (onStickerUpdate) {
      onStickerUpdate(stickerId, {
        position: newPosition,
        rotation: newRotation,
        scale: newScale
      })
    }
  }, [onStickerUpdate])

  // ⭐ MODEL IS STATIONARY - positioned at origin (0, 0, 0) and never moves
  return (
    <group position={[0, 0, 0]}>
      <group ref={group} scale={[modelScale, modelScale, modelScale]}>
        {Object.values(nodes).map((node, i) =>
          node.isMesh ? (
            <mesh
              key={i}
              ref={i === 0 ? meshRef : null} // Use first mesh as target for stickers
              geometry={node.geometry}
              material={material}
              castShadow
              receiveShadow
            />
          ) : null
        )}
        
        {/* SIMPLE TEST: Mesh-based stickers outside of t-shirt mesh */}
      {stickers.map((sticker) => (
  <MeshSticker 
    key={sticker.id} 
    sticker={sticker} 
    meshRef={meshRef}  // Pass the mesh reference
  />
))}
      </group>
    </group>
  )
}

useGLTF.preload('/models/oversized_t-shirt.glb')