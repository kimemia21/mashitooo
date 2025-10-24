import React, { useState } from 'react'

/**
 * =============================================================================
 * CENTRALIZED T-SHIRT MODEL CONFIGURATION
 * =============================================================================
 * This file contains ALL configuration for the 3D model UV mapping and 2D editor.
 * Change your .glb model? Just update these values once!
 * =============================================================================
 */

// ============================================================================
// 1. MODEL CONFIGURATION - Update these when changing .glb models
// ============================================================================
export const MODEL_CONFIG = {
  // Path to your 3D model file
  modelPath: '/models/oversized_t-shirt.glb',
  
  // The name of the mesh in your .glb file that represents the t-shirt body
  // Check your .glb in Blender/three.js inspector to find this
  meshName: 'T_Shirt',
  
  // Default scale for the 3D model in the scene
  defaultScale: [1, 1, 1],
  
  // Default camera position for best view
  cameraPosition: [0, 0, 5],
  
  // Model rotation offset (if your model faces wrong direction)
  rotationOffset: [0, 0, 0]
}

// ============================================================================
// 2. UV MAPPING CONFIGURATION - This is the CRITICAL part!
// ============================================================================
/**
 * UV coordinates map 3D model surfaces to 2D texture space.
 * UV space: (0,0) = bottom-left, (1,1) = top-right
 * 
 * To find YOUR model's UV mapping:
 * 1. Open your .glb in Blender
 * 2. Switch to UV Editing workspace
 * 3. Note which part of the texture (0-1 range) maps to front/back
 * 4. Update the values below
 */
export const UV_MAPPING = {
  // FRONT SIDE UV BOUNDS
  front: {
    // UV coordinates for the front of the t-shirt
    // Format: [minU, minV, maxU, maxV] where U=horizontal, V=vertical
    uvBounds: [0.0, 0.0, 0.5, 1.0], // Left half of texture (example)
    
    // Is the front flipped horizontally in UV space?
    flipU: false,
    
    // Is the front flipped vertically in UV space?
    flipV: false,
    
    // Rotation of UV mapping (0, 90, 180, 270 degrees)
    rotation: 0,
    
    // Offset to apply to UV coordinates
    offsetU: 0.0,
    offsetV: 0.0
  },
  
  // BACK SIDE UV BOUNDS
  back: {
    uvBounds: [0.5, 0.0, 1.0, 1.0], // Right half of texture (example)
    flipU: false,
    flipV: false,
    rotation: 0,
    offsetU: 0.0,
    offsetV: 0.0
  },
  
  // SLEEVE UV BOUNDS (optional, for future expansion)
  leftSleeve: {
    uvBounds: [0.0, 0.0, 0.25, 0.25],
    flipU: false,
    flipV: false,
    rotation: 0,
    offsetU: 0.0,
    offsetV: 0.0
  },
  
  rightSleeve: {
    uvBounds: [0.75, 0.0, 1.0, 0.25],
    flipU: false,
    flipV: false,
    rotation: 0,
    offsetU: 0.0,
    offsetV: 0.0
  }
}

// ============================================================================
// 3. TEXTURE DIMENSIONS - Must match between editor and 3D texture
// ============================================================================
export const TEXTURE_CONFIG = {
  // Resolution of the texture canvas (higher = better quality, slower performance)
  width: 2048,
  height: 2048,
  
  // Aspect ratio (should match your model's UV layout)
  aspectRatio: 1.0, // 1.0 = square, 1.25 = 4:5, etc.
  
  // Texture quality settings
  anisotropy: 16,
  generateMipmaps: true,
  
  // Wrapping mode
  wrapS: 'ClampToEdgeWrapping',
  wrapT: 'ClampToEdgeWrapping'
}

// ============================================================================
// 4. EDITOR DIMENSIONS - 2D canvas for sticker placement
// ============================================================================
export const EDITOR_CONFIG = {
  // Canvas dimensions for the 2D editor
  // These should have the SAME aspect ratio as the UV bounds they represent
  width: 400,
  height: 500,
  
  // Aspect ratio (must match texture aspect ratio for that side)
  aspectRatio: 0.8, // 400/500 = 0.8 (4:5 ratio)
  
  // Safe print area (percentage from edges)
  safePrintMargin: {
    top: 10,
    right: 10,
    bottom: 10,
    left: 10
  },
  
  // Default sticker size when added
  defaultStickerSize: {
    width: 80,
    height: 80
  },
  
  // Min/max sticker sizes
  minStickerSize: 20,
  maxStickerSize: 300,
  
  // Grid settings (for snapping)
  gridSize: 10,
  enableSnapping: false
}

// ============================================================================
// 5. COORDINATE CONVERSION FUNCTIONS - The Magic Happens Here!
// ============================================================================

/**
 * Converts editor coordinates (pixels, percentages) to texture coordinates (pixels)
 * This is where we apply the UV mapping configuration
 */
export function editorToTexture(editorCoords, side = 'front') {
  const uvConfig = UV_MAPPING[side]
  const [minU, minV, maxU, maxV] = uvConfig.uvBounds
  
  // Get the UV space this side occupies
  const uvWidth = maxU - minU
  const uvHeight = maxV - minV
  
  // Convert editor percentage to UV coordinate (0-1 range)
  let u = (editorCoords.x / 100)
  let v = (editorCoords.y / 100)
  
  // Apply UV transformations
  if (uvConfig.flipU) u = 1 - u
  if (uvConfig.flipV) v = 1 - v
  
  // Apply rotation
  if (uvConfig.rotation === 90) {
    [u, v] = [v, 1 - u]
  } else if (uvConfig.rotation === 180) {
    u = 1 - u
    v = 1 - v
  } else if (uvConfig.rotation === 270) {
    [u, v] = [1 - v, u]
  }
  
  // Map to actual UV bounds
  u = minU + (u * uvWidth) + uvConfig.offsetU
  v = minV + (v * uvHeight) + uvConfig.offsetV
  
  // Convert UV coordinates (0-1) to texture pixel coordinates
  const textureX = u * TEXTURE_CONFIG.width
  const textureY = v * TEXTURE_CONFIG.height
  
  // Scale size from editor to texture
  const scaleX = (uvWidth * TEXTURE_CONFIG.width) / EDITOR_CONFIG.width
  const scaleY = (uvHeight * TEXTURE_CONFIG.height) / EDITOR_CONFIG.height
  
  return {
    x: textureX,
    y: textureY,
    width: editorCoords.width * scaleX,
    height: editorCoords.height * scaleY,
    rotation: editorCoords.rotation || 0,
    u: u, // UV coordinates for debugging
    v: v
  }
}

/**
 * Converts texture coordinates back to editor coordinates
 * Useful for loading saved designs
 */
export function textureToEditor(textureCoords, side = 'front') {
  const uvConfig = UV_MAPPING[side]
  const [minU, minV, maxU, maxV] = uvConfig.uvBounds
  
  const uvWidth = maxU - minU
  const uvHeight = maxV - minV
  
  // Convert texture pixels to UV coordinates (0-1)
  let u = textureCoords.x / TEXTURE_CONFIG.width
  let v = textureCoords.y / TEXTURE_CONFIG.height
  
  // Reverse UV bounds mapping
  u = (u - minU - uvConfig.offsetU) / uvWidth
  v = (v - minV - uvConfig.offsetV) / uvHeight
  
  // Reverse rotation
  if (uvConfig.rotation === 90) {
    [u, v] = [1 - v, u]
  } else if (uvConfig.rotation === 180) {
    u = 1 - u
    v = 1 - v
  } else if (uvConfig.rotation === 270) {
    [u, v] = [v, 1 - u]
  }
  
  // Reverse flips
  if (uvConfig.flipU) u = 1 - u
  if (uvConfig.flipV) v = 1 - v
  
  // Convert to editor percentages
  const editorX = u * 100
  const editorY = v * 100
  
  // Scale size from texture to editor
  const scaleX = EDITOR_CONFIG.width / (uvWidth * TEXTURE_CONFIG.width)
  const scaleY = EDITOR_CONFIG.height / (uvHeight * TEXTURE_CONFIG.height)
  
  return {
    x: editorX,
    y: editorY,
    width: textureCoords.width * scaleX,
    height: textureCoords.height * scaleY,
    rotation: textureCoords.rotation || 0
  }
}

/**
 * Get the texture region (in pixels) for a specific side
 */
export function getTextureRegion(side = 'front') {
  const uvConfig = UV_MAPPING[side]
  const [minU, minV, maxU, maxV] = uvConfig.uvBounds
  
  return {
    x: minU * TEXTURE_CONFIG.width,
    y: minV * TEXTURE_CONFIG.height,
    width: (maxU - minU) * TEXTURE_CONFIG.width,
    height: (maxV - minV) * TEXTURE_CONFIG.height
  }
}

/**
 * Validate that a sticker is within bounds
 */
export function validateStickerBounds(sticker, side = 'front') {
  const margin = EDITOR_CONFIG.safePrintMargin
  const warnings = []
  
  if (sticker.x < margin.left) warnings.push('Too close to left edge')
  if (sticker.x > (100 - margin.right)) warnings.push('Too close to right edge')
  if (sticker.y < margin.top) warnings.push('Too close to top edge')
  if (sticker.y > (100 - margin.bottom)) warnings.push('Too close to bottom edge')
  
  if (sticker.width < EDITOR_CONFIG.minStickerSize) warnings.push('Sticker too small')
  if (sticker.width > EDITOR_CONFIG.maxStickerSize) warnings.push('Sticker too large')
  if (sticker.height < EDITOR_CONFIG.minStickerSize) warnings.push('Sticker too small')
  if (sticker.height > EDITOR_CONFIG.maxStickerSize) warnings.push('Sticker too large')
  
  return warnings
}

// ============================================================================
// 6. UTILITY FUNCTIONS
// ============================================================================

/**
 * Get editor dimensions for a specific side
 * (In case different sides need different aspect ratios)
 */
export function getEditorDimensions(side = 'front') {
  const uvConfig = UV_MAPPING[side]
  const [minU, minV, maxU, maxV] = uvConfig.uvBounds
  
  const uvWidth = maxU - minU
  const uvHeight = maxV - minV
  const uvAspect = uvWidth / uvHeight
  
  // Calculate editor dimensions maintaining UV aspect ratio
  const baseWidth = EDITOR_CONFIG.width
  const baseHeight = baseWidth / uvAspect
  
  return {
    width: baseWidth,
    height: baseHeight,
    aspectRatio: uvAspect
  }
}

/**
 * Export configuration summary for debugging
 */
export function getConfigSummary() {
  return {
    model: MODEL_CONFIG.modelPath,
    textureSize: `${TEXTURE_CONFIG.width}x${TEXTURE_CONFIG.height}`,
    editorSize: `${EDITOR_CONFIG.width}x${EDITOR_CONFIG.height}`,
    sides: Object.keys(UV_MAPPING),
    uvMapping: UV_MAPPING
  }
}

/**
 * Verify configuration is valid
 */
export function validateConfiguration() {
  const issues = []
  
  // Check texture aspect ratio matches UV bounds
  Object.entries(UV_MAPPING).forEach(([side, config]) => {
    const [minU, minV, maxU, maxV] = config.uvBounds
    const uvAspect = (maxU - minU) / (maxV - minV)
    
    if (Math.abs(uvAspect - TEXTURE_CONFIG.aspectRatio) > 0.1) {
      issues.push(`${side}: UV aspect ratio doesn't match texture aspect ratio`)
    }
  })
  
  // Check editor aspect ratio
  const editorAspect = EDITOR_CONFIG.width / EDITOR_CONFIG.height
  if (Math.abs(editorAspect - EDITOR_CONFIG.aspectRatio) > 0.01) {
    issues.push('Editor dimensions dont match specified aspect ratio')
  }
  
  return {
    valid: issues.length === 0,
    issues: issues
  }
}

// ============================================================================
// 7. INTERACTIVE CONFIGURATION TOOL (for finding UV bounds)
// ============================================================================

/**
 * Interactive tool to help find UV coordinates
 * Use this component to click on your 3D model and find UV bounds
 */
function ConfigurationTool() {
  const [selectedSide, setSelectedSide] = useState('front')
  const [uvBounds, setUvBounds] = useState(UV_MAPPING.front.uvBounds)
  
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>🔧 T-Shirt Configuration Tool</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Current Configuration:</h3>
        <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '5px' }}>
          {JSON.stringify(getConfigSummary(), null, 2)}
        </pre>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Validation:</h3>
        {(() => {
          const validation = validateConfiguration()
          return (
            <div style={{ 
              padding: '10px', 
              background: validation.valid ? '#d4edda' : '#f8d7da',
              borderRadius: '5px',
              color: validation.valid ? '#155724' : '#721c24'
            }}>
              {validation.valid ? '✅ Configuration is valid!' : '❌ Configuration has issues:'}
              {validation.issues.length > 0 && (
                <ul>
                  {validation.issues.map((issue, i) => <li key={i}>{issue}</li>)}
                </ul>
              )}
            </div>
          )
        })()}
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>UV Mapping Guide:</h3>
        <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '5px' }}>
          <p><strong>To find your model's UV coordinates:</strong></p>
          <ol>
            <li>Open your .glb file in Blender</li>
            <li>Switch to "UV Editing" workspace</li>
            <li>Select the t-shirt mesh</li>
            <li>In the UV editor, note where the front/back are located</li>
            <li>Update UV_MAPPING with the bounds (0-1 range)</li>
          </ol>
          <p><strong>UV Coordinate System:</strong></p>
          <ul>
            <li>(0, 0) = Bottom-left corner</li>
            <li>(1, 1) = Top-right corner</li>
            <li>U = Horizontal axis</li>
            <li>V = Vertical axis</li>
          </ul>
        </div>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Quick Test:</h3>
        <select 
          value={selectedSide} 
          onChange={(e) => {
            setSelectedSide(e.target.value)
            setUvBounds(UV_MAPPING[e.target.value].uvBounds)
          }}
          style={{ padding: '5px', marginRight: '10px' }}
        >
          <option value="front">Front</option>
          <option value="back">Back</option>
          <option value="leftSleeve">Left Sleeve</option>
          <option value="rightSleeve">Right Sleeve</option>
        </select>
        
        <div style={{ marginTop: '10px' }}>
          <p>Test Coordinate Conversion:</p>
          {(() => {
            const testSticker = { x: 50, y: 50, width: 100, height: 100, rotation: 0 }
            const textureCoords = editorToTexture(testSticker, selectedSide)
            const backToEditor = textureToEditor(textureCoords, selectedSide)
            
            return (
              <div style={{ background: '#f5f5f5', padding: '10px', borderRadius: '5px' }}>
                <div><strong>Editor (50%, 50%):</strong></div>
                <div>→ Texture: ({textureCoords.x.toFixed(1)}px, {textureCoords.y.toFixed(1)}px)</div>
                <div>→ UV: ({textureCoords.u.toFixed(3)}, {textureCoords.v.toFixed(3)})</div>
                <div>→ Back to Editor: ({backToEditor.x.toFixed(1)}%, {backToEditor.y.toFixed(1)}%)</div>
                <div style={{ 
                  color: Math.abs(backToEditor.x - 50) < 0.1 ? 'green' : 'red',
                  fontWeight: 'bold',
                  marginTop: '5px'
                }}>
                  {Math.abs(backToEditor.x - 50) < 0.1 ? '✅ Perfect round-trip!' : '❌ Conversion error!'}
                </div>
              </div>
            )
          })()}
        </div>
      </div>
      
      <div style={{ background: '#d1ecf1', padding: '15px', borderRadius: '5px' }}>
        <h3>💡 Pro Tips:</h3>
        <ul>
          <li>Keep TEXTURE_CONFIG dimensions as powers of 2 (1024, 2048, 4096)</li>
          <li>Match aspect ratios between editor and UV bounds</li>
          <li>Use flipU/flipV if your model's UVs are mirrored</li>
          <li>Test with a simple sticker at (50%, 50%) to verify alignment</li>
          <li>Save your configuration to a separate JSON file for version control</li>
        </ul>
      </div>
    </div>
  )
}

export default ConfigurationTool

// ============================================================================
// 8. EXAMPLE USAGE IN OTHER FILES
// ============================================================================

/*
// In TShirtModel.jsx:
import { editorToTexture, TEXTURE_CONFIG, MODEL_CONFIG } from './TShirtConfig'

const textureCoords = editorToTexture(sticker, 'front')
// Use textureCoords.x, textureCoords.y for rendering

// In Editor.jsx:
import { EDITOR_CONFIG, getEditorDimensions, validateStickerBounds } from './TShirtConfig'

const dimensions = getEditorDimensions('front')
const warnings = validateStickerBounds(sticker, 'front')

// When applying stickers:
import { editorToTexture } from './TShirtConfig'

const processedStickers = stickers.map(s => editorToTexture(s, currentSide))
*/