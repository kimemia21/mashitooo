import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

function GLBEditor({ 
  modelUrl = null,
  onModelLoad,
  onModelChange,
  editMode = 'OBJECT', // 'OBJECT' or 'EDIT'
  selectionMode = 'FACE', // 'VERTEX', 'EDGE', 'FACE'
  selectedObjects = [],
  onObjectSelect,
  transformMode = null, // null, 'MOVE', 'ROTATE', 'SCALE'
  onTransformModeChange
}) {
  const group = useRef()
  const { scene, camera, raycaster, mouse, gl } = useThree()
  const [hoveredObject, setHoveredObject] = useState(null)
  const [meshes, setMeshes] = useState([])
  const [editModeGeometry, setEditModeGeometry] = useState(null)
  const [selectedVertices, setSelectedVertices] = useState([])
  const [selectedEdges, setSelectedEdges] = useState([])
  const [selectedFaces, setSelectedFaces] = useState([])
  
  // Load GLB model
  const { nodes, materials, animations } = useGLTF(modelUrl || '/models/t_shirt.glb')
  
  // Process loaded model into editable meshes
  useEffect(() => {
    if (!nodes) return
    
    const processedMeshes = []
    Object.entries(nodes).forEach(([name, node]) => {
      if (node.isMesh) {
        // Clone geometry to make it editable
        const editableGeometry = node.geometry.clone()
        editableGeometry.computeBoundingBox()
        editableGeometry.computeBoundingSphere()
        
        const meshData = {
          id: name,
          name: name,
          originalNode: node,
          geometry: editableGeometry,
          material: node.material,
          position: new THREE.Vector3().copy(node.position),
          rotation: new THREE.Euler().copy(node.rotation),
          scale: new THREE.Vector3().copy(node.scale),
          visible: true,
          selected: false
        }
        processedMeshes.push(meshData)
      }
    })
    
    setMeshes(processedMeshes)
    onModelLoad && onModelLoad(processedMeshes)
  }, [nodes, materials, onModelLoad])
  
  // Handle object selection via raycasting
  const handlePointerClick = useCallback((event) => {
    if (!meshes.length) return
    
    // Update mouse coordinates
    const rect = gl.domElement.getBoundingClientRect()
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    
    // Raycast to find intersected objects
    raycaster.setFromCamera(mouse, camera)
    
    if (editMode === 'OBJECT') {
      // Object mode - select entire meshes
      const meshRefs = meshes.map(mesh => mesh.ref?.current).filter(Boolean)
      const intersects = raycaster.intersectObjects(meshRefs, true)
      
      if (intersects.length > 0) {
        const intersectedMesh = intersects[0].object
        const meshIndex = meshes.findIndex(mesh => mesh.ref?.current === intersectedMesh)
        
        if (meshIndex >= 0) {
          const isShiftClick = event.shiftKey
          onObjectSelect && onObjectSelect(meshIndex, isShiftClick)
        }
      } else {
        // Clicked empty space - deselect all
        onObjectSelect && onObjectSelect(null, false)
      }
    } else if (editMode === 'EDIT') {
      // Edit mode - select vertices/edges/faces
      handleEditModeSelection(event)
    }
  }, [meshes, editMode, camera, raycaster, mouse, gl, onObjectSelect])
  
  // Handle edit mode selection (vertices, edges, faces)
  const handleEditModeSelection = useCallback((event) => {
    // Implementation for vertex/edge/face selection
    // This would involve more complex raycasting and geometry analysis
    console.log('Edit mode selection not yet implemented')
  }, [])
  
  // Handle hover effects
  const handlePointerMove = useCallback((event) => {
    if (!meshes.length) return
    
    const rect = gl.domElement.getBoundingClientRect()
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    
    raycaster.setFromCamera(mouse, camera)
    
    if (editMode === 'OBJECT') {
      const meshRefs = meshes.map(mesh => mesh.ref?.current).filter(Boolean)
      const intersects = raycaster.intersectObjects(meshRefs, true)
      
      if (intersects.length > 0) {
        const intersectedMesh = intersects[0].object
        const meshIndex = meshes.findIndex(mesh => mesh.ref?.current === intersectedMesh)
        setHoveredObject(meshIndex >= 0 ? meshIndex : null)
        gl.domElement.style.cursor = 'pointer'
      } else {
        setHoveredObject(null)
        gl.domElement.style.cursor = 'default'
      }
    }
  }, [meshes, editMode, camera, raycaster, mouse, gl])
  
  // Attach event listeners
  useEffect(() => {
    const canvas = gl.domElement
    canvas.addEventListener('click', handlePointerClick)
    canvas.addEventListener('mousemove', handlePointerMove)
    
    return () => {
      canvas.removeEventListener('click', handlePointerClick)
      canvas.removeEventListener('mousemove', handlePointerMove)
    }
  }, [gl.domElement, handlePointerClick, handlePointerMove])
  
  // Create materials with selection highlighting
  const createMaterial = useCallback((originalMaterial, isSelected, isHovered) => {
    if (!originalMaterial) {
      return new THREE.MeshStandardMaterial({ color: '#cccccc' })
    }
    
    const material = originalMaterial.clone()
    
    if (isSelected) {
      // Orange outline for selected objects (Blender style)
      material.emissive = new THREE.Color('#ff6600')
      material.emissiveIntensity = 0.3
    } else if (isHovered) {
      // Light glow for hovered objects
      material.emissive = new THREE.Color('#ffffff')
      material.emissiveIntensity = 0.1
    }
    
    return material
  }, [])
  
  if (!meshes.length) {
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#cccccc" />
      </mesh>
    )
  }
  
  return (
    <group ref={group} dispose={null}>
      {meshes.map((meshData, index) => {
        const isSelected = selectedObjects.includes(index)
        const isHovered = hoveredObject === index
        const material = createMaterial(meshData.material, isSelected, isHovered)
        
        return (
          <mesh
            key={meshData.id}
            ref={(ref) => {
              if (ref) {
                meshData.ref = { current: ref }
              }
            }}
            geometry={meshData.geometry}
            material={material}
            position={meshData.position}
            rotation={meshData.rotation}
            scale={meshData.scale}
            visible={meshData.visible}
            castShadow
            receiveShadow
            userData={{ meshIndex: index, meshData }}
          />
        )
      })}
      
      {/* Edit mode visualization */}
      {editMode === 'EDIT' && selectedObjects.length > 0 && (
        <EditModeVisualization
          meshes={meshes}
          selectedObjects={selectedObjects}
          selectionMode={selectionMode}
          selectedVertices={selectedVertices}
          selectedEdges={selectedEdges}
          selectedFaces={selectedFaces}
        />
      )}
    </group>
  )
}

// Component for visualizing edit mode selections
function EditModeVisualization({ 
  meshes, 
  selectedObjects, 
  selectionMode, 
  selectedVertices, 
  selectedEdges, 
  selectedFaces 
}) {
  // This would render vertex points, edge highlights, face selections
  // Implementation would involve creating geometry for points and lines
  return null
}

// Preload default model
useGLTF.preload('/models/t_shirt.glb')

export default GLBEditor