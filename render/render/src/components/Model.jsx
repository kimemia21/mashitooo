import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Model component with sticker rendering support and grey background
 */
function Model({ 
  color, 
  stickers = [],
  viewMode = 'rendered',
  enableAdvancedControls = true,
  onRotationChange = null,
  path ,
  onOriginalColorLoad
}) {
  const group = useRef()
  const meshRef = useRef()
  const { camera, gl } = useThree()
  const VIEW_FIT_SIZE = 3;
  
  const cameraState = useRef({
    radius: 4,
    theta: 0,
    phi: Math.PI / 2,
    targetRadius: 4,
    targetTheta: 0,
    targetPhi: Math.PI / 2,
    damping: 0.15
  })
  
  const controlState = useRef({
    isInteracting: false,
    lastX: 0,
    lastY: 0,
    lastDistance: 0,
    lastTouchTime: 0,
    isTouchPinch: false
  })

  const textureCache = useRef(new Map())
  const stickerImageCache = useRef(new Map())
  const [isLoading, setIsLoading] = useState(true)
  const [texturesLoaded, setTexturesLoaded] = useState(false)
  const [modelLoaded, setModelLoaded] = useState(false)
  const [autoScale, setAutoScale] = useState(1);
  const [centerOffset, setCenterOffset] = useState([0, 0, 0]);
  const [originalMap, setOriginalMap] = useState(null)
  const [originalModelColor, setOriginalModelColor] = useState('#ffffff')
  

// Load model with proper error handling
let  error
const { nodes, materials } = useGLTF(
    path, 
    // 1. Success Callback (CRITICAL: Triggers your scaling useEffect)
    () => {
        console.log('GLTF Model fully loaded. Triggering scaling.');
        setModelLoaded(true);
        setIsLoading(false);
    },
    // 2. Progress Callback (We can leave this undefined)
    undefined, 
    // 3. Error Setup (For deep error handling)
    (loader) => {
      loader.manager.onError = (url) => {
          console.error(`Error loading model: ${url}`);
          setIsLoading(false); 
      };
    }
  );
  // Set textures as loaded immediately since we're not loading any
// Reset loading states when path changes
useEffect(() => {
  console.log('🔄 Model path changed to:', path)
  setModelLoaded(false)
  setIsLoading(true)
  
  // Clear texture cache to prevent using old model's textures
  textureCache.current.clear()
  
  // Reset original data for new model
  setOriginalMap(null)
  setOriginalModelColor('#ffffff')
  
  // Small delay to ensure proper loading
  const timer = setTimeout(() => {
    if (nodes) {
      setModelLoaded(true)
      console.log('✅ Model loaded successfully:', path)
    }
  }, 100)
  
  return () => clearTimeout(timer)
}, [path, nodes])

// Set textures as loaded immediately since we're not loading any
useEffect(() => {
  setTexturesLoaded(true)
}, [])
// Extract original color and texture from model

useEffect(() => {
    if (modelLoaded && nodes) {
        // Find the primary mesh - try different naming patterns
        const primaryMesh = Object.values(nodes).find(
            node => node.isMesh && (
                node.name.toLowerCase().includes('hoodie') ||
                node.name.toLowerCase().includes('shirt') ||
                node.name.toLowerCase().includes('tshirt') ||
                node.name.toLowerCase().includes('t-shirt') ||
                node.name.toLowerCase().includes('beanie') ||
                node.name.toLowerCase().includes('cap') ||
                node.name.toLowerCase().includes('mesh') ||
                node.name.toLowerCase().includes('body') ||
                node.name.toLowerCase().includes('main')
            )
        ) || Object.values(nodes).find(node => node.isMesh); // Fallback to first mesh

        if (primaryMesh && primaryMesh.material) {
            console.log('🎯 Found primary mesh:', primaryMesh.name, 'with material:', primaryMesh.material);
            
            // 1. Extract Color
            if (primaryMesh.material.color) {
                const originalColor = `#${primaryMesh.material.color.getHexString()}`;
                console.log('🎨 Original model color extracted:', originalColor);
                setOriginalModelColor(originalColor); // Store locally
                if (onOriginalColorLoad) {
                    onOriginalColorLoad(originalColor); // Report to parent
                }
            }
            
            // 2. Extract Texture Map (e.g., the fabric weave)
            if (primaryMesh.material.map) {
                console.log('🖼️ Original texture map found:', primaryMesh.material.map);
                setOriginalMap(primaryMesh.material.map); 
            }
        } else {
            console.log('⚠️ No suitable mesh found in model nodes:', Object.keys(nodes));
        }
    }
}, [modelLoaded, nodes, onOriginalColorLoad]);

  // Load sticker images
  const loadStickerImage = useCallback((url) => {
    if (stickerImageCache.current.has(url)) {
      return Promise.resolve(stickerImageCache.current.get(url))
    }

    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        stickerImageCache.current.set(url, img)
        resolve(img)
      }
      img.onerror = reject
      img.src = url
    })
  }, [])

  // File: Model.jsx (INSERT THIS BLOCK, e.g., before useMemo or other effects)
  // =========================================================================
  // Dynamic Scaling and Centering Logic
  // =========================================================================
  useEffect(() => {
    // This effect runs once the model has been loaded and rendered in the scene
    if (modelLoaded && group.current) {
      console.log("Model loaded. Calculating dynamic scale and center.");

      // Temporarily set scale to 1 to get the true, unscaled bounding box
      group.current.scale.set(1, 1, 1);
      
      const box = new THREE.Box3().setFromObject(group.current);
      const size = new THREE.Vector3();
      box.getSize(size);
      
      // Determine the model's largest dimension (X, Y, or Z)
      const maxDimension = Math.max(size.x, size.y, size.z);
      
      // Calculate the scale factor to fit the largest dimension to VIEW_FIT_SIZE
      const scaleFactor = VIEW_FIT_SIZE / maxDimension;
      
      // Calculate Centering and Grounding Offset
      const center = new THREE.Vector3();
      box.getCenter(center);
      const min = box.min;
      
      // Offset to center on X and Z axes after scaling
      const xOffset = -center.x * scaleFactor;
      const zOffset = -center.z * scaleFactor;
      // Offset to move the lowest point (min.y) to Y=0 (the ground) after scaling
      const yOffset = -min.y * scaleFactor; 

      // Update state
      setAutoScale(scaleFactor);
      setCenterOffset([xOffset, yOffset, zOffset]);

      // Update Camera Radius for optimal viewing distance
      const newRadius = Math.max(4, VIEW_FIT_SIZE * 1.5); 
      
      // Update camera state references for controls
      cameraState.current.targetRadius = newRadius;
      cameraState.current.radius = newRadius;
    }
  }, [modelLoaded, path, VIEW_FIT_SIZE, cameraState]); // Dependency on path ensures recalculation when model changes


  // Create texture with stickers baked in
  const fabricTexture = useMemo(() => {
    // Skip creating custom texture for original color when no stickers
    if ((color === 'original' || color === originalModelColor) && stickers.length === 0) {
      return null // Will use originalMap in compositeMaterial
    }

    const cacheKey = `fabric_${color}_${JSON.stringify(stickers.map(s => ({ id: s.id, x: s.x, y: s.y, side: s.side })))}`
    
    if (textureCache.current.has(cacheKey)) {
      console.log('📦 Using cached texture')
      return textureCache.current.get(cacheKey)
    }

    console.log('\n🎨 === CREATING FABRIC TEXTURE WITH STICKERS ===')
    console.log(`Color: ${color}`)
    console.log(`Stickers to apply: ${stickers.length}`)

    const canvas = document.createElement('canvas')
    canvas.width = 2048
    canvas.height = 2560
    const ctx = canvas.getContext('2d', { alpha: false })
    
    // Handle original texture with color tinting
    if (originalMap && originalMap.image && color !== 'original' && color !== originalModelColor) {
        // 1. Draw the original texture (fabric weave/details) onto the canvas first.
        ctx.drawImage(originalMap.image, 0, 0, canvas.width, canvas.height);
        
        // 2. Overlay the custom color using the 'multiply' blend mode.
        // This acts as a TINT, changing the hue while preserving the fabric texture details.
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 3. Reset blend mode so stickers are drawn normally (not tinted).
        ctx.globalCompositeOperation = 'source-over'; 
    
    } else if (originalMap && originalMap.image && (color === 'original' || color === originalModelColor)) {
        // For original color, just use the original texture as base
        ctx.drawImage(originalMap.image, 0, 0, canvas.width, canvas.height);
    
    } else {
       // Create synthetic fabric texture when no original texture available
       ctx.fillStyle = color === 'original' ? originalModelColor : color
       ctx.fillRect(0, 0, canvas.width, canvas.height)
    
       // Add fabric texture
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
    }
    

  

    // Draw stickers onto the texture
    stickers.forEach((sticker, index) => {
      console.log(`\n🖼️ Drawing sticker ${index + 1}:`, {
        name: sticker.name,
        position: `${sticker.x}%, ${sticker.y}%`,
        size: `${sticker.width}px × ${sticker.height}px`,
        side: sticker.side
      })

      // Convert percentage position to pixel position on canvas
      const x = (sticker.x / 100) * canvas.width
      const y = (sticker.y / 100) * canvas.height
      const width = sticker.width * (canvas.width / 512) // Scale to canvas
      const height = sticker.height * (canvas.height / 512)

      console.log(`Canvas coordinates:`, {
        x: x.toFixed(2),
        y: y.toFixed(2),
        width: width.toFixed(2),
        height: height.toFixed(2)
      })

      // Load and draw sticker image
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.src = sticker.url
      
      img.onload = () => {
        ctx.save()
        
        // Translate to sticker center
        ctx.translate(x, y)
        
        // Apply rotation if specified
        if (sticker.rotation) {
          ctx.rotate((sticker.rotation * Math.PI) / 180)
        }
        
        // Draw centered
        ctx.drawImage(img, -width / 2, -height / 2, width, height)
        
        ctx.restore()
        
        console.log(`✅ Sticker drawn successfully`)
        
        // Update texture
        texture.needsUpdate = true
      }
      
      img.onerror = () => {
        console.error(`❌ Failed to load sticker image: ${sticker.url}`)
      }
    })

   

    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.ClampToEdgeWrapping
    texture.wrapT = THREE.ClampToEdgeWrapping
    texture.flipY = false
    texture.minFilter = THREE.LinearMipmapLinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.anisotropy = gl.capabilities.getMaxAnisotropy()
    
    textureCache.current.set(cacheKey, texture)
    
    console.log('✅ Fabric texture created with stickers')
    return texture
  }, [color, stickers, gl, originalMap, originalModelColor])

  const compositeMaterial = useMemo(() => {
    // Check if this is the original color and we have original textures
    const isOriginalColor = color === originalModelColor || color === 'original'
    
    // Determine which texture to use
    let textureToUse = fabricTexture
    if (isOriginalColor && originalMap) {
      textureToUse = originalMap
    } else if (!fabricTexture && originalMap) {
      textureToUse = originalMap
    }
    
    const material = new THREE.MeshStandardMaterial({
      color: '#ffffff', // Use white as base to not affect texture colors
      roughness: 0.7,
      metalness: 0.02,
      map: textureToUse,
      toneMapped: true,
      normalScale: new THREE.Vector2(0.3, 0.3),
      envMapIntensity: 0.5
    })

    if (viewMode === 'wireframe') {
      material.wireframe = true
      material.wireframeLinewidth = 1
      material.color.setHex(color.replace('#', '0x')) // Apply color to wireframe
    } else if (viewMode === 'solid') {
      material.map = null
      material.color.setHex(color.replace('#', '0x')) // Apply color to solid mode
    }

    return material
  }, [color, viewMode, fabricTexture, originalMap, originalModelColor])

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

// Auto-scale model to standard size based on bounding box
  useEffect(() => {
    if (modelLoaded && nodes && group.current) {
      try {
        // Calculate bounding box for entire model
        const box = new THREE.Box3()
        
        Object.values(nodes).forEach(node => {
          if (node.isMesh && node.geometry) {
            // Compute bounding box if not already computed
            if (!node.geometry.boundingBox) {
              node.geometry.computeBoundingBox()
            }
            
            // Get node's bounding box in world space
            const nodeBox = node.geometry.boundingBox.clone()
            box.union(nodeBox)
          }
        })
        
        // Target size - adjust this value to make models bigger/smaller
        // 2.5 = medium size, 3.0 = larger, 2.0 = smaller
        const targetSize = 2.5
        
        // Get the maximum dimension (width, height, or depth)
        const size = box.getSize(new THREE.Vector3())
        const maxDim = Math.max(size.x, size.y, size.z)
        
        // Calculate scale to normalize to target size
        const normalizedScale = targetSize / maxDim
        
        // Apply scale to group
        group.current.scale.setScalar(normalizedScale)
        
        console.log('📏 Model auto-scaled:', {
          originalSize: maxDim.toFixed(2),
          targetSize,
          scale: normalizedScale.toFixed(2)
        })
      } catch (error) {
        console.error('Error calculating model scale:', error)
        // Fallback to default scale
        group.current.scale.setScalar(1.2)
      }
    }
  }, [modelLoaded, nodes])

  useEffect(() => {
    if (modelLoaded && texturesLoaded && isLoading) {
      setIsLoading(false)
    }
  }, [modelLoaded, texturesLoaded, isLoading])

 if (isLoading || !modelLoaded || !texturesLoaded || !nodes) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <group position={[0, 0, 0]}>
        <mesh>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial 
            color="#ffffff" 
            emissive="#4a9eff"
            emissiveIntensity={0.5}
          />
        </mesh>
        {/* Loading indicator */}
        <mesh position={[0, 1, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial 
            color="#4a9eff"
            emissive="#4a9eff"
            emissiveIntensity={1}
          />
        </mesh>
      </group>
    </>
  )
}

  if (error || !nodes) {
    return (
      <>
        {/* <color attach="background" args={[blurredBackgroundColor]} /> */}
        <ambientLight intensity={0.8} color="#ffffff" />
        <directionalLight position={[5, 10, 5]} intensity={1} color="#ffffff" castShadow />
        <pointLight position={[0, 5, 5]} intensity={0.8} color="#ffffff" />
        
        <group ref={group}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[2.2, 2.8, 0.12]} />
            <meshStandardMaterial color={error ? "#ff6b6b" : color} roughness={0.7} metalness={0.1} />
          </mesh>
        </group>
      </>
    )
  }

  return (
    <>
    {/* <color attach="background" 
    
    
    args={[blurredBackgroundColor]} /> */}
      
 <ambientLight intensity={0.5} color="#ffffff" /> 

{/* Directional Light for Sun-like Shadows */}
<directionalLight
  position={[5, 10, 5]} // Position: Top-front-right
  intensity={0.4} // Reduced intensity
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

      
<group ref={group} dispose={null} scale={autoScale} position={centerOffset}>
  {Object.entries(nodes).map(([name, node]) =>
          node.isMesh && node.geometry ? (
            <mesh
              key={name}
              ref={name.includes('oodie') ? meshRef : undefined}
              geometry={node.geometry}
             material={
          viewMode === 'rendered'
            ? compositeMaterial 
            : node.material 
        }
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

useGLTF.preload("/models/hoodies/uploads_files_6392619_Hoodie.glb")

export default Model