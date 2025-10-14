import React, { useEffect, useCallback, useState, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

function KeyboardTransforms({ 
  selectedObjects = [],
  meshes = [],
  onTransformChange,
  onModeChange,
  enabled = true 
}) {
  const { camera, gl } = useThree()
  const [transformMode, setTransformMode] = useState(null) // null, 'MOVE', 'ROTATE', 'SCALE'
  const [axisLock, setAxisLock] = useState(null) // null, 'X', 'Y', 'Z'
  const [numericInput, setNumericInput] = useState('')
  const [isTransforming, setIsTransforming] = useState(false)
  const [initialMousePos, setInitialMousePos] = useState({ x: 0, y: 0 })
  const [transformStartValues, setTransformStartValues] = useState([])
  const mousePos = useRef({ x: 0, y: 0 })
  
  // Track mouse movement
  useEffect(() => {
    const handleMouseMove = (event) => {
      const rect = gl.domElement.getBoundingClientRect()
      mousePos.current = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      }
    }
    
    gl.domElement.addEventListener('mousemove', handleMouseMove)
    return () => gl.domElement.removeEventListener('mousemove', handleMouseMove)
  }, [gl])
  
  // Calculate transform delta based on mouse movement
  const calculateTransformDelta = useCallback(() => {
    if (!isTransforming) return { x: 0, y: 0, z: 0 }
    
    const deltaX = (mousePos.current.x - initialMousePos.x) * 0.01
    const deltaY = -(mousePos.current.y - initialMousePos.y) * 0.01
    
    switch (axisLock) {
      case 'X':
        return { x: deltaX, y: 0, z: 0 }
      case 'Y':
        return { x: 0, y: deltaY, z: 0 }
      case 'Z':
        return { x: 0, y: 0, z: deltaX }
      default:
        // Free movement - use camera orientation
        const cameraDirection = new THREE.Vector3()
        camera.getWorldDirection(cameraDirection)
        const right = new THREE.Vector3()
        right.crossVectors(camera.up, cameraDirection).normalize()
        const up = new THREE.Vector3()
        up.crossVectors(cameraDirection, right).normalize()
        
        return {
          x: right.x * deltaX + up.x * deltaY,
          y: right.y * deltaX + up.y * deltaY,
          z: right.z * deltaX + up.z * deltaY
        }
    }
  }, [isTransforming, initialMousePos, axisLock, camera])
  
  // Apply transforms to selected objects
  const applyTransform = useCallback(() => {
    if (!isTransforming || selectedObjects.length === 0) return
    
    const delta = calculateTransformDelta()
    const numericValue = numericInput ? parseFloat(numericInput) : null
    
    selectedObjects.forEach((objectIndex, i) => {
      const mesh = meshes[objectIndex]
      if (!mesh) return
      
      const startValues = transformStartValues[i]
      if (!startValues) return
      
      let newTransform = { ...startValues }
      
      if (numericValue !== null) {
        // Use numeric input
        switch (transformMode) {
          case 'MOVE':
            if (axisLock === 'X') newTransform.position.x = startValues.position.x + numericValue
            else if (axisLock === 'Y') newTransform.position.y = startValues.position.y + numericValue
            else if (axisLock === 'Z') newTransform.position.z = startValues.position.z + numericValue
            else {
              newTransform.position.x = startValues.position.x + numericValue
              newTransform.position.y = startValues.position.y + numericValue
              newTransform.position.z = startValues.position.z + numericValue
            }
            break
          case 'ROTATE':
            const radians = (numericValue * Math.PI) / 180
            if (axisLock === 'X') newTransform.rotation.x = startValues.rotation.x + radians
            else if (axisLock === 'Y') newTransform.rotation.y = startValues.rotation.y + radians
            else if (axisLock === 'Z') newTransform.rotation.z = startValues.rotation.z + radians
            break
          case 'SCALE':
            if (axisLock === 'X') newTransform.scale.x = startValues.scale.x * numericValue
            else if (axisLock === 'Y') newTransform.scale.y = startValues.scale.y * numericValue
            else if (axisLock === 'Z') newTransform.scale.z = startValues.scale.z * numericValue
            else {
              newTransform.scale.x = startValues.scale.x * numericValue
              newTransform.scale.y = startValues.scale.y * numericValue
              newTransform.scale.z = startValues.scale.z * numericValue
            }
            break
        }
      } else {
        // Use mouse delta
        switch (transformMode) {
          case 'MOVE':
            newTransform.position = {
              x: startValues.position.x + delta.x,
              y: startValues.position.y + delta.y,
              z: startValues.position.z + delta.z
            }
            break
          case 'ROTATE':
            const rotationSpeed = 2
            newTransform.rotation = {
              x: startValues.rotation.x + delta.y * rotationSpeed,
              y: startValues.rotation.y + delta.x * rotationSpeed,
              z: startValues.rotation.z + (axisLock === 'Z' ? delta.x * rotationSpeed : 0)
            }
            break
          case 'SCALE':
            const scaleSpeed = 1
            const scaleDelta = 1 + (delta.x + delta.y) * scaleSpeed
            newTransform.scale = {
              x: startValues.scale.x * (axisLock === 'X' || !axisLock ? scaleDelta : 1),
              y: startValues.scale.y * (axisLock === 'Y' || !axisLock ? scaleDelta : 1),
              z: startValues.scale.z * (axisLock === 'Z' || !axisLock ? scaleDelta : 1)
            }
            break
        }
      }
      
      onTransformChange && onTransformChange(objectIndex, newTransform)
    })
  }, [isTransforming, selectedObjects, meshes, transformMode, axisLock, numericInput, calculateTransformDelta, transformStartValues, onTransformChange])
  
  // Start transform mode
  const startTransform = useCallback((mode) => {
    if (selectedObjects.length === 0) return
    
    setTransformMode(mode)
    setIsTransforming(true)
    setInitialMousePos({ ...mousePos.current })
    setAxisLock(null)
    setNumericInput('')
    
    // Store initial transform values
    const initialValues = selectedObjects.map(objectIndex => {
      const mesh = meshes[objectIndex]
      return mesh ? {
        position: { ...mesh.position },
        rotation: { ...mesh.rotation },
        scale: { ...mesh.scale }
      } : null
    }).filter(Boolean)
    
    setTransformStartValues(initialValues)
    onModeChange && onModeChange(mode)
    
    // Disable orbit controls during transform
    gl.domElement.style.cursor = 'move'
  }, [selectedObjects, meshes, onModeChange, gl])
  
  // Confirm transform
  const confirmTransform = useCallback(() => {
    setTransformMode(null)
    setIsTransforming(false)
    setAxisLock(null)
    setNumericInput('')
    setTransformStartValues([])
    onModeChange && onModeChange(null)
    gl.domElement.style.cursor = 'default'
  }, [onModeChange, gl])
  
  // Cancel transform
  const cancelTransform = useCallback(() => {
    if (isTransforming && transformStartValues.length > 0) {
      // Restore original values
      selectedObjects.forEach((objectIndex, i) => {
        const startValues = transformStartValues[i]
        if (startValues) {
          onTransformChange && onTransformChange(objectIndex, startValues)
        }
      })
    }
    
    setTransformMode(null)
    setIsTransforming(false)
    setAxisLock(null)
    setNumericInput('')
    setTransformStartValues([])
    onModeChange && onModeChange(null)
    gl.domElement.style.cursor = 'default'
  }, [isTransforming, transformStartValues, selectedObjects, onTransformChange, onModeChange, gl])
  
  // Keyboard event handler
  useEffect(() => {
    if (!enabled) return
    
    const handleKeyDown = (event) => {
      // Prevent default for our hotkeys
      const key = event.key.toLowerCase()
      
      if (isTransforming) {
        // Handle transform mode keys
        switch (key) {
          case 'escape':
            event.preventDefault()
            cancelTransform()
            break
          case 'enter':
          case ' ':
            event.preventDefault()
            confirmTransform()
            break
          case 'x':
            event.preventDefault()
            setAxisLock(prev => prev === 'X' ? null : 'X')
            break
          case 'y':
            event.preventDefault()
            setAxisLock(prev => prev === 'Y' ? null : 'Y')
            break
          case 'z':
            event.preventDefault()
            setAxisLock(prev => prev === 'Z' ? null : 'Z')
            break
          case 'backspace':
            event.preventDefault()
            setNumericInput(prev => prev.slice(0, -1))
            break
          default:
            // Handle numeric input
            if (key >= '0' && key <= '9' || key === '.' || key === '-') {
              event.preventDefault()
              setNumericInput(prev => prev + key)
            }
            break
        }
      } else {
        // Handle mode activation keys
        switch (key) {
          case 'g':
            event.preventDefault()
            startTransform('MOVE')
            break
          case 'r':
            event.preventDefault()
            startTransform('ROTATE')
            break
          case 's':
            event.preventDefault()
            startTransform('SCALE')
            break
        }
      }
    }
    
    const handleKeyUp = (event) => {
      // Handle any key up events if needed
    }
    
    const handleClick = (event) => {
      if (isTransforming) {
        event.preventDefault()
        confirmTransform()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    gl.domElement.addEventListener('click', handleClick)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      gl.domElement.removeEventListener('click', handleClick)
    }
  }, [enabled, isTransforming, startTransform, confirmTransform, cancelTransform, gl])
  
  // Apply transforms on mouse movement
  useEffect(() => {
    if (isTransforming) {
      applyTransform()
    }
  }, [isTransforming, applyTransform])
  
  return null // This component doesn't render anything visible
}

export default KeyboardTransforms