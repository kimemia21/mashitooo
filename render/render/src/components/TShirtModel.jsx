import React, { useRef, useEffect, useState, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const ROTATION_SPEED = 0.015
const DAMPING = 0.95
const MAX_X_ROTATION = Math.PI / 2.5
const MIN_SCALE = 0.8
const MAX_SCALE = 4
const AUTO_CENTER_SPEED = 0.08
const INERTIA_THRESHOLD = 0.0008
const IDLE_TIMEOUT = 2000

export default function TShirtModel({ color = '#ffffff', stickers = [], viewMode = 'rendered' }) {
  const group = useRef()
  const { camera } = useThree()

  const [rotation, setRotation] = useState({ x: 0, y: 0 })
  const [velocity, setVelocity] = useState({ x: 0, y: 0 })
  const [scale, setScale] = useState(1)
  const [targetRotation, setTargetRotation] = useState({ x: 0, y: 0 })
  const [isInteracting, setIsInteracting] = useState(false)
  const [shouldAutoCenter, setShouldAutoCenter] = useState(false)
  const lastInteractionTime = useRef(Date.now())
  const [touchState, setTouchState] = useState({
    dragging: false,
    pinching: false,
    lastX: 0,
    lastY: 0,
    lastDistance: 0,
    initialTouch: null,
  })

  const isMobile = useMemo(() => window.innerWidth < 768, [])

  // Camera setup optimized for mobile
  useEffect(() => {
    if (camera.isPerspectiveCamera) {
      camera.fov = isMobile ? 50 : 40
      camera.position.set(0, 0, isMobile ? 5.5 : 4)
      camera.lookAt(0, 0, 0)
      camera.updateProjectionMatrix()
    }
  }, [camera, isMobile])

  // Load model
  const { nodes, materials } = useGLTF('/models/oversized_t-shirt.glb')

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

  // Enhanced touch handlers
  useEffect(() => {
    const canvas = document.querySelector('canvas')
    if (!canvas) return

    const distance = (t1, t2) => {
      const dx = t1.clientX - t2.clientX
      const dy = t1.clientY - t2.clientY
      return Math.sqrt(dx * dx + dy * dy)
    }

    const handleTouchStart = (e) => {
      lastInteractionTime.current = Date.now()
      setIsInteracting(true)
      setShouldAutoCenter(false)
      
      if (e.touches.length === 1) {
        setTouchState({
          dragging: true,
          pinching: false,
          lastX: e.touches[0].clientX,
          lastY: e.touches[0].clientY,
          lastDistance: 0,
          initialTouch: { x: e.touches[0].clientX, y: e.touches[0].clientY },
        })
        setVelocity({ x: 0, y: 0 })
      } else if (e.touches.length === 2) {
        const d = distance(e.touches[0], e.touches[1])
        setTouchState({
          dragging: false,
          pinching: true,
          lastX: 0,
          lastY: 0,
          lastDistance: d,
          initialTouch: null,
        })
        setVelocity({ x: 0, y: 0 })
      }
    }

    const handleTouchMove = (e) => {
      e.preventDefault()
      lastInteractionTime.current = Date.now()
      
      if (touchState.pinching && e.touches.length === 2) {
        const d = distance(e.touches[0], e.touches[1])
        const zoomFactor = d / touchState.lastDistance
        const newScale = scale * zoomFactor
        
        // Smooth scaling with better responsiveness
        setScale(Math.min(MAX_SCALE, Math.max(MIN_SCALE, newScale)))
        setTouchState((prev) => ({ ...prev, lastDistance: d }))
      } else if (touchState.dragging && e.touches.length === 1) {
        const dx = e.touches[0].clientX - touchState.lastX
        const dy = e.touches[0].clientY - touchState.lastY
        
        // Enhanced rotation with smoother control
        const rotationX = dy * ROTATION_SPEED
        const rotationY = dx * ROTATION_SPEED
        
        setRotation((r) => ({
          x: Math.max(-MAX_X_ROTATION, Math.min(MAX_X_ROTATION, r.x + rotationX)),
          y: r.y + rotationY,
        }))
        
        // Stronger velocity for better momentum
        setVelocity({ x: rotationX * 0.15, y: rotationY * 0.15 })
        
        setTouchState((prev) => ({
          ...prev,
          lastX: e.touches[0].clientX,
          lastY: e.touches[0].clientY,
        }))
      }
    }

    const handleTouchEnd = () => {
      setIsInteracting(false)
      setTouchState({ dragging: false, pinching: false, lastX: 0, lastY: 0, lastDistance: 0, initialTouch: null })
    }

    // Double tap to reset (game-like interaction)
    let lastTap = 0
    const handleDoubleTap = (e) => {
      const currentTime = Date.now()
      const tapLength = currentTime - lastTap
      if (tapLength < 300 && tapLength > 0) {
        e.preventDefault()
        // Reset to front view
        setTargetRotation({ x: 0, y: 0 })
        setShouldAutoCenter(true)
        setScale(1)
        setVelocity({ x: 0, y: 0 })
      }
      lastTap = currentTime
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
  }, [touchState, scale])

  // Auto-center after idle timeout
  useEffect(() => {
    const checkIdle = setInterval(() => {
      if (!isInteracting && Date.now() - lastInteractionTime.current > IDLE_TIMEOUT) {
        const velocityMagnitude = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y)
        if (velocityMagnitude < INERTIA_THRESHOLD) {
          setShouldAutoCenter(true)
        }
      }
    }, 500)

    return () => clearInterval(checkIdle)
  }, [isInteracting, velocity])

  // Enhanced animation frame with auto-centering
  useFrame(() => {
    if (group.current) {
      // Auto-center logic
      if (shouldAutoCenter && !isInteracting) {
        const dx = targetRotation.x - rotation.x
        const dy = targetRotation.y - rotation.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        if (distance > 0.01) {
          setRotation((r) => ({
            x: r.x + dx * AUTO_CENTER_SPEED,
            y: r.y + dy * AUTO_CENTER_SPEED,
          }))
        } else {
          setShouldAutoCenter(false)
          setRotation(targetRotation)
        }
      }
      // Inertia and damping
      else if (!isInteracting && !shouldAutoCenter) {
        const velocityMagnitude = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y)
        
        if (velocityMagnitude > INERTIA_THRESHOLD) {
          setRotation((r) => ({
            x: Math.max(-MAX_X_ROTATION, Math.min(MAX_X_ROTATION, r.x + velocity.x)),
            y: r.y + velocity.y,
          }))
          setVelocity((v) => ({ x: v.x * DAMPING, y: v.y * DAMPING }))
        } else {
          setVelocity({ x: 0, y: 0 })
        }
      }
      
      group.current.rotation.x = rotation.x
      group.current.rotation.y = rotation.y
    }
  })

  const baseScale = isMobile ? 2 : 1
  const finalScale = baseScale * scale

  return (
    <group ref={group} scale={[finalScale, finalScale, finalScale]}>
      {Object.values(nodes).map((node, i) =>
        node.isMesh ? (
          <mesh
            key={i}
            geometry={node.geometry}
            material={material}
            castShadow
            receiveShadow
          />
        ) : null
      )}
    </group>
  )
}

useGLTF.preload('/models/oversized_t-shirt.glb')