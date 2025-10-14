import React, { useRef, useCallback, useState } from 'react'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter'
import * as THREE from 'three'

function GLBImportExport({ onModelLoad, scene, onExportComplete }) {
  const fileInputRef = useRef()
  const [isLoading, setIsLoading] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  // Handle file upload
  const handleFileLoad = useCallback(async (file) => {
    if (!file || (!file.name.endsWith('.glb') && !file.name.endsWith('.gltf'))) {
      alert('Please select a .glb or .gltf file')
      return
    }

    setIsLoading(true)
    
    try {
      const loader = new GLTFLoader()
      const url = URL.createObjectURL(file)
      
      const gltf = await new Promise((resolve, reject) => {
        loader.load(
          url,
          (gltf) => resolve(gltf),
          (progress) => {
            console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%')
          },
          (error) => reject(error)
        )
      })
      
      // Clean up the object URL
      URL.revokeObjectURL(url)
      
      // Process the loaded model
      const modelData = {
        scene: gltf.scene,
        nodes: {},
        materials: {},
        animations: gltf.animations || [],
        fileName: file.name
      }
      
      // Extract nodes and materials
      gltf.scene.traverse((child) => {
        if (child.isMesh) {
          modelData.nodes[child.name || `Mesh_${Object.keys(modelData.nodes).length}`] = child
          if (child.material) {
            const materialName = child.material.name || `Material_${Object.keys(modelData.materials).length}`
            modelData.materials[materialName] = child.material
          }
        }
      })
      
      // Frame the model in view (auto-fit)
      const box = new THREE.Box3().setFromObject(gltf.scene)
      const center = box.getCenter(new THREE.Vector3())
      const size = box.getSize(new THREE.Vector3())
      const maxDim = Math.max(size.x, size.y, size.z)
      
      // Position the model at the origin
      gltf.scene.position.sub(center)
      
      // Calculate appropriate camera distance
      const distance = maxDim * 2
      
      onModelLoad && onModelLoad({
        ...modelData,
        boundingBox: box,
        center: center,
        size: size,
        recommendedCameraDistance: distance
      })
      
    } catch (error) {
      console.error('Error loading GLB file:', error)
      alert('Error loading file: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }, [onModelLoad])

  // Handle drag and drop
  const handleDragOver = useCallback((event) => {
    event.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((event) => {
    event.preventDefault()
    setDragOver(false)
  }, [])

  const handleDrop = useCallback((event) => {
    event.preventDefault()
    setDragOver(false)
    
    const files = Array.from(event.dataTransfer.files)
    const glbFile = files.find(file => 
      file.name.endsWith('.glb') || file.name.endsWith('.gltf')
    )
    
    if (glbFile) {
      handleFileLoad(glbFile)
    }
  }, [handleFileLoad])

  // Handle file input change
  const handleFileInputChange = useCallback((event) => {
    const file = event.target.files[0]
    if (file) {
      handleFileLoad(file)
    }
  }, [handleFileLoad])

  // Export current scene as GLB
  const handleExport = useCallback(async (options = {}) => {
    if (!scene) {
      alert('No scene to export')
      return
    }

    setIsExporting(true)
    
    try {
      const exporter = new GLTFExporter()
      
      const exportOptions = {
        binary: true, // Export as .glb (binary)
        trs: false, // Don't use TRS (translation, rotation, scale) for better compatibility
        onlyVisible: true, // Only export visible objects
        truncateDrawRange: true,
        embedImages: true, // Embed textures
        maxTextureSize: 4096,
        ...options
      }
      
      const result = await new Promise((resolve, reject) => {
        exporter.parse(
          scene,
          (result) => resolve(result),
          (error) => reject(error),
          exportOptions
        )
      })
      
      // Create download
      const blob = new Blob([result], { type: 'application/octet-stream' })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `edited-model-${Date.now()}.glb`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Clean up
      URL.revokeObjectURL(url)
      
      onExportComplete && onExportComplete(true)
      
    } catch (error) {
      console.error('Error exporting GLB:', error)
      alert('Error exporting file: ' + error.message)
      onExportComplete && onExportComplete(false)
    } finally {
      setIsExporting(false)
    }
  }, [scene, onExportComplete])

  return {
    // Import functions
    openFileDialog: () => fileInputRef.current?.click(),
    handleDragOver,
    handleDragLeave, 
    handleDrop,
    isLoading,
    dragOver,
    
    // Export functions
    exportGLB: handleExport,
    isExporting,
    
    // File input element (render this in your component)
    fileInputElement: (
      <input
        ref={fileInputRef}
        type="file"
        accept=".glb,.gltf"
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
      />
    )
  }
}

export default GLBImportExport