import React, { useRef, useEffect } from 'react'
import { useThree, extend } from '@react-three/fiber'
import { TransformControls as ThreeTransformControls } from 'three/examples/jsm/controls/TransformControls'

extend({ TransformControls: ThreeTransformControls })

const TransformControls = ({ children, mode = 'translate', enabled = true, object = null, onObjectChange }) => {
  const { camera, gl, scene } = useThree()
  const transformControlsRef = useRef()
  const objectRef = useRef()

  useEffect(() => {
    if (transformControlsRef.current && camera && gl.domElement) {
      const controls = transformControlsRef.current
      controls.attach(objectRef.current)
      controls.setMode(mode)
      controls.enabled = enabled
      controls.showX = enabled
      controls.showY = enabled
      controls.showZ = enabled
      
      // Event listeners
      const handleObjectChange = () => {
        if (onObjectChange && objectRef.current) {
          const position = objectRef.current.position
          const rotation = objectRef.current.rotation
          const scale = objectRef.current.scale
          onObjectChange({
            position: { x: position.x, y: position.y, z: position.z },
            rotation: { x: rotation.x, y: rotation.y, z: rotation.z },
            scale: { x: scale.x, y: scale.y, z: scale.z }
          })
        }
      }

      const handleDragStart = () => {
        // Disable orbit controls during transform
        const orbitControls = scene.userData.orbitControls
        if (orbitControls) {
          orbitControls.enabled = false
        }
      }

      const handleDragEnd = () => {
        // Re-enable orbit controls after transform
        const orbitControls = scene.userData.orbitControls
        if (orbitControls) {
          orbitControls.enabled = true
        }
      }

      controls.addEventListener('objectChange', handleObjectChange)
      controls.addEventListener('dragging-changed', (event) => {
        if (event.value) {
          handleDragStart()
        } else {
          handleDragEnd()
        }
      })

      return () => {
        controls.removeEventListener('objectChange', handleObjectChange)
        controls.removeEventListener('dragging-changed', handleDragStart)
      }
    }
  }, [camera, gl, mode, enabled, onObjectChange, scene])

  useEffect(() => {
    if (transformControlsRef.current && object) {
      transformControlsRef.current.attach(object)
    }
  }, [object])

  if (!enabled) return <group ref={objectRef}>{children}</group>

  return (
    <>
      <transformControls ref={transformControlsRef} args={[camera, gl.domElement]} />
      <group ref={objectRef}>{children}</group>
    </>
  )
}

export default TransformControls