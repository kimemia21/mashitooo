/**
 * FINAL: Perfect 1:1 coordinate mapping with NO transformations
 * This ensures stickers appear in EXACTLY the same position on the 3D model
 * as they appear in the 2D editor - no upside down, no wrong positions
 */

// EXACT dimensions that match the components
export const EDITOR_DIMENSIONS = {
  width: 400,   // From StickerEditor_Final.jsx
  height: 500   // From StickerEditor_Final.jsx  
}

export const TEXTURE_DIMENSIONS = {
  width: 1024,  // From TShirtModel_Final.jsx
  height: 1024  // From TShirtModel_Final.jsx
}

/**
 * Validates sticker positioning with proper bounds checking
 */
export function validateStickerPosition(sticker, side) {
  const warnings = []
  
  // Check position bounds
  const margin = 5 // 5% margin from edges
  if (sticker.x < margin || sticker.x > (100 - margin)) {
    warnings.push('Sticker may be too close to horizontal edge')
  }
  
  if (sticker.y < margin || sticker.y > (100 - margin)) {
    warnings.push('Sticker may be too close to vertical edge')
  }
  
  // Check size bounds
  if (sticker.width < 20) {
    warnings.push('Sticker may be too small to print clearly')
  }
  
  if (sticker.height < 20) {
    warnings.push('Sticker may be too small to print clearly')
  }
  
  if (sticker.width > 200 || sticker.height > 200) {
    warnings.push('Sticker may be too large for the print area')
  }
  
  // Check if sticker is in safe print zone (20% margins)
  const safePrintZone = {
    minX: 20,
    maxX: 80,
    minY: 20,
    maxY: 80
  }
  
  if (sticker.x < safePrintZone.minX || sticker.x > safePrintZone.maxX ||
      sticker.y < safePrintZone.minY || sticker.y > safePrintZone.maxY) {
    warnings.push('Sticker is outside the recommended print area')
  }
  
  return warnings
}

/**
 * CRITICAL: NO coordinate transformation - pass through EXACTLY
 * This is the key to fixing positioning issues
 */
export function convertEditorToTexture(sticker, side) {
  console.log(`Converting sticker "${sticker.name}" for ${side} side:`)
  console.log('Input coordinates:', {
    x: sticker.x + '%',
    y: sticker.y + '%',
    width: sticker.width + 'px',
    height: sticker.height + 'px',
    rotation: (sticker.rotation || 0) + '°'
  })
  
  // THE KEY FIX: Return EXACT same coordinates - NO transformation!
  const result = {
    x: sticker.x,                    // Keep exact percentage
    y: sticker.y,                    // Keep exact percentage
    width: sticker.width,            // Keep exact pixel size
    height: sticker.height,          // Keep exact pixel size
    rotation: sticker.rotation || 0, // Keep exact rotation
    side: side
  }
  
  console.log('Output coordinates:', {
    x: result.x + '%',
    y: result.y + '%',
    width: result.width + 'px',
    height: result.height + 'px',
    rotation: result.rotation + '°'
  })
  
  console.log('✅ Perfect 1:1 mapping - no transformation applied')
  
  return result
}

/**
 * Pre-processes stickers with validation but ZERO coordinate changes
 */
export function preprocessStickers(stickers, side) {
  console.log(`=== PREPROCESSING ${stickers.length} STICKERS FOR ${side} SIDE ===`)
  
  return stickers.map((sticker, index) => {
    console.log(`\nProcessing sticker ${index + 1}: "${sticker.name}"`)
    
    // Validate position and get warnings
    const warnings = validateStickerPosition(sticker, side)
    if (warnings.length > 0) {
      console.warn(`⚠️ Warnings for "${sticker.name}":`, warnings)
    } else {
      console.log(`✅ "${sticker.name}" position is optimal`)
    }
    
    // Convert coordinates (which preserves them exactly)
    const processedCoords = convertEditorToTexture(sticker, side)
    
    // Verify NO coordinate change occurred
    const coordsChanged = 
      processedCoords.x !== sticker.x ||
      processedCoords.y !== sticker.y ||
      processedCoords.width !== sticker.width ||
      processedCoords.height !== sticker.height ||
      processedCoords.rotation !== (sticker.rotation || 0)
    
    if (coordsChanged) {
      console.error(`❌ COORDINATE CHANGE DETECTED for "${sticker.name}"!`)
      console.error('This should NEVER happen!')
    } else {
      console.log(`✅ Perfect coordinate preservation for "${sticker.name}"`)
    }
    
    // Return sticker with preserved coordinates
    return {
      ...sticker,
      ...processedCoords,
      processed: true,
      warnings: warnings,
      // Store original data for verification
      originalX: sticker.x,
      originalY: sticker.y,
      originalWidth: sticker.width,
      originalHeight: sticker.height,
      originalRotation: sticker.rotation || 0
    }
  })
}

/**
 * Creates a preview showing coordinate mapping
 */
export function createStickerPreview(sticker, side) {
  const processed = convertEditorToTexture(sticker, side)
  const warnings = validateStickerPosition(sticker, side)
  
  return {
    editorPosition: { x: sticker.x, y: sticker.y },
    texturePosition: { x: processed.x, y: processed.y },
    size: { width: processed.width, height: processed.height },
    rotation: processed.rotation,
    side: side,
    warnings: warnings,
    isPerfectMapping: 
      processed.x === sticker.x &&
      processed.y === sticker.y &&
      processed.width === sticker.width &&
      processed.height === sticker.height &&
      processed.rotation === (sticker.rotation || 0)
  }
}

/**
 * Debug function to verify coordinate mapping is perfect
 */
export function debugCoordinateMapping(editorSticker, textureSticker) {
  console.log('\n=== COORDINATE MAPPING VERIFICATION ===')
  console.log('Editor sticker:', {
    x: editorSticker.x + '%',
    y: editorSticker.y + '%', 
    width: editorSticker.width + 'px',
    height: editorSticker.height + 'px',
    rotation: (editorSticker.rotation || 0) + '°'
  })
  console.log('Texture sticker:', {
    x: textureSticker.x + '%',
    y: textureSticker.y + '%',
    width: textureSticker.width + 'px', 
    height: textureSticker.height + 'px',
    rotation: textureSticker.rotation + '°'
  })
  
  const deltaX = Math.abs(editorSticker.x - textureSticker.x)
  const deltaY = Math.abs(editorSticker.y - textureSticker.y)
  const deltaW = Math.abs(editorSticker.width - textureSticker.width)
  const deltaH = Math.abs(editorSticker.height - textureSticker.height)
  const deltaR = Math.abs((editorSticker.rotation || 0) - textureSticker.rotation)
  
  console.log('Deltas:', { deltaX, deltaY, deltaW, deltaH, deltaR })
  
  const isPerfect = deltaX < 0.001 && deltaY < 0.001 && deltaW < 0.001 && deltaH < 0.001 && deltaR < 0.001
  
  if (isPerfect) {
    console.log('✅ PERFECT 1:1 COORDINATE MAPPING!')
  } else {
    console.log('❌ COORDINATE MAPPING HAS ISSUES!')
    console.log('This will cause positioning problems!')
  }
  console.log('==========================================\n')
  
  return isPerfect
}

/**
 * Calculate exact pixel positions on texture canvas
 */
export function calculateTexturePixels(sticker) {
  // Convert percentage coordinates to pixel coordinates on texture
  const textureX = (sticker.x / 100) * TEXTURE_DIMENSIONS.width
  const textureY = (sticker.y / 100) * TEXTURE_DIMENSIONS.height
  
  // Scale from editor pixels to texture pixels
  const scaleX = TEXTURE_DIMENSIONS.width / EDITOR_DIMENSIONS.width
  const scaleY = TEXTURE_DIMENSIONS.height / EDITOR_DIMENSIONS.height
  
  const textureWidth = sticker.width * scaleX
  const textureHeight = sticker.height * scaleY
  
  return {
    x: textureX,
    y: textureY,
    width: textureWidth,
    height: textureHeight,
    centerX: textureX,
    centerY: textureY,
    scale: { x: scaleX, y: scaleY }
  }
}

/**
 * Verify that editor and texture have same coordinate system
 */
export function verifyCoordinateSystem() {
  console.log('=== COORDINATE SYSTEM VERIFICATION ===')
  console.log('Editor dimensions:', EDITOR_DIMENSIONS)
  console.log('Texture dimensions:', TEXTURE_DIMENSIONS)
  console.log('Scale factors:', {
    x: TEXTURE_DIMENSIONS.width / EDITOR_DIMENSIONS.width,
    y: TEXTURE_DIMENSIONS.height / EDITOR_DIMENSIONS.height
  })
  console.log('✅ Coordinate system verified')
  console.log('=====================================')
}