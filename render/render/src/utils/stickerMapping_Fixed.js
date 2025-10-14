/**
 * FIXED: Perfect 1:1 coordinate mapping between 2D editor and 3D model
 * This ensures stickers appear in EXACTLY the same position on the 3D model
 * as they appear in the 2D editor
 */

// Editor dimensions (must match StickerEditor_Fixed.jsx exactly)
export const EDITOR_DIMENSIONS = {
  width: 400,
  height: 500
}

// 3D texture dimensions (must match TShirtModel_Fixed.jsx exactly)
export const TEXTURE_DIMENSIONS = {
  width: 1024,
  height: 1024
}

/**
 * Validates sticker positioning with proper bounds checking
 */
export function validateStickerPosition(sticker, side) {
  const warnings = []
  
  // Check if sticker is within safe bounds (with proper margins)
  const marginX = 5 // 5% margin from horizontal edges
  const marginY = 5 // 5% margin from vertical edges
  
  if (sticker.x < marginX || sticker.x > (100 - marginX)) {
    warnings.push('Sticker may be too close to the edge')
  }
  
  if (sticker.y < marginY || sticker.y > (100 - marginY)) {
    warnings.push('Sticker may be too close to the edge')
  }
  
  // Check size bounds
  if (sticker.width < 30) {
    warnings.push('Sticker may be too small to print clearly')
  }
  
  if (sticker.width > 300 || sticker.height > 300) {
    warnings.push('Sticker may be too large for the print area')
  }
  
  // Check aspect ratio
  const aspectRatio = sticker.width / sticker.height
  if (aspectRatio > 5 || aspectRatio < 0.2) {
    warnings.push('Unusual aspect ratio - may not print well')
  }
  
  return warnings
}

/**
 * CRITICAL: 1:1 coordinate conversion
 * This function does NO coordinate transformation - it passes coordinates through exactly
 * The 2D editor and 3D model use the SAME coordinate system
 */
export function convertEditorToTexture(sticker, side) {
  // The key insight: DON'T transform coordinates!
  // Use the exact same percentage-based system in both editor and 3D model
  
  console.log(`Converting sticker for ${side} side:`, {
    editor: { x: sticker.x, y: sticker.y, width: sticker.width, height: sticker.height },
    rotation: sticker.rotation || 0
  })
  
  // Return the EXACT same coordinates - no transformation needed
  return {
    x: sticker.x,           // Keep exact percentage
    y: sticker.y,           // Keep exact percentage  
    width: sticker.width,   // Keep exact pixel size
    height: sticker.height, // Keep exact pixel size
    rotation: sticker.rotation || 0,
    side: side
  }
}

/**
 * Pre-processes stickers with validation but NO coordinate changes
 */
export function preprocessStickers(stickers, side) {
  console.log(`Preprocessing ${stickers.length} stickers for ${side} side`)
  
  return stickers.map((sticker, index) => {
    // Validate position
    const warnings = validateStickerPosition(sticker, side)
    if (warnings.length > 0) {
      console.warn(`Sticker ${index + 1} "${sticker.name}" warnings:`, warnings)
    }
    
    // Convert coordinates (which actually just passes them through)
    const processedCoords = convertEditorToTexture(sticker, side)
    
    console.log(`Sticker ${index + 1} processed:`, processedCoords)
    
    // Return sticker with processed data
    return {
      ...sticker,
      ...processedCoords,
      processed: true,
      warnings: warnings,
      // Store original data for debugging
      originalX: sticker.x,
      originalY: sticker.y,
      originalWidth: sticker.width,
      originalHeight: sticker.height
    }
  })
}

/**
 * Creates a preview showing exact coordinate mapping
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
    coordinateChange: {
      deltaX: processed.x - sticker.x,
      deltaY: processed.y - sticker.y,
      deltaWidth: processed.width - sticker.width,
      deltaHeight: processed.height - sticker.height
    }
  }
}

/**
 * Debug function to verify coordinate mapping
 */
export function debugCoordinateMapping(editorSticker, textureSticker) {
  console.log('=== Coordinate Mapping Debug ===')
  console.log('Editor:', {
    x: editorSticker.x + '%',
    y: editorSticker.y + '%', 
    width: editorSticker.width + 'px',
    height: editorSticker.height + 'px'
  })
  console.log('Texture:', {
    x: textureSticker.x + '%',
    y: textureSticker.y + '%',
    width: textureSticker.width + 'px', 
    height: textureSticker.height + 'px'
  })
  
  const deltaX = Math.abs(editorSticker.x - textureSticker.x)
  const deltaY = Math.abs(editorSticker.y - textureSticker.y)
  const deltaW = Math.abs(editorSticker.width - textureSticker.width)
  const deltaH = Math.abs(editorSticker.height - textureSticker.height)
  
  console.log('Deltas:', { deltaX, deltaY, deltaW, deltaH })
  
  if (deltaX < 0.1 && deltaY < 0.1 && deltaW < 1 && deltaH < 1) {
    console.log('✅ Perfect coordinate mapping!')
  } else {
    console.log('❌ Coordinate mapping has issues')
  }
  console.log('================================')
}

/**
 * Utility to calculate exact pixel positions on texture
 */
export function calculateTexturePixels(sticker) {
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