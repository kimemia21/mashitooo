/**
 * Utility functions for converting 2D sticker positions to proper 3D UV coordinates
 * This ensures stickers are placed on the outside surface of the t-shirt
 */

/**
 * Validates that sticker positioning is safe and won't cause issues
 */
export function validateStickerPosition(sticker, side) {
  const warnings = []
  
  // Check bounds
  if (sticker.x < 10 || sticker.x > 90) {
    warnings.push('Sticker may be too close to the edge')
  }
  
  if (sticker.y < 15 || sticker.y > 85) {
    warnings.push('Sticker may be in an awkward position')
  }
  
  // Check size
  if (sticker.width < 50 || sticker.height < 50) {
    warnings.push('Sticker may be too small to print clearly')
  }
  
  if (sticker.width > 200 || sticker.height > 200) {
    warnings.push('Sticker may be too large for the print area')
  }
  
  return warnings
}

/**
 * Converts 2D editor coordinates to proper 3D UV coordinates
 * Ensures stickers are placed on the correct surface (outside) of the t-shirt
 */
export function convert2DToUV(sticker, side) {
  // Normalize 2D editor coordinates (0-100%) to UV space (0-1)
  const normalizedX = sticker.x / 100
  const normalizedY = sticker.y / 100
  
  let uvX, uvY, uvWidth, uvHeight
  
  if (side === 'FRONT') {
    // Front side UV mapping
    // Map to chest area, avoiding collar and side seams
    uvX = 0.25 + (normalizedX - 0.5) * 0.5  // Center horizontally in chest area
    uvY = 0.3 + normalizedY * 0.4           // Map to chest area vertically
    
    // Scale appropriately for front chest area
    uvWidth = (sticker.width / 800) * 0.6   // Adjusted scaling for better proportion
    uvHeight = (sticker.height / 800) * 0.6
    
  } else if (side === 'BACK') {
    // Back side UV mapping  
    // Map to upper back area, avoiding collar and side seams
    uvX = 0.25 + (normalizedX - 0.5) * 0.5  // Center horizontally in back area
    uvY = 0.2 + normalizedY * 0.5           // Map to back area vertically
    
    // Scale appropriately for back area (can be slightly larger)
    uvWidth = (sticker.width / 700) * 0.7   // Slightly larger scaling for back
    uvHeight = (sticker.height / 700) * 0.7
  }
  
  // Ensure UV coordinates stay within safe bounds
  // This prevents stickers from wrapping to wrong surfaces
  uvX = Math.max(0.15, Math.min(0.85, uvX))
  uvY = Math.max(0.15, Math.min(0.85, uvY))
  uvWidth = Math.max(0.03, Math.min(0.25, uvWidth))
  uvHeight = Math.max(0.03, Math.min(0.25, uvHeight))
  
  return {
    uvX,
    uvY,
    uvWidth,
    uvHeight,
    uvRotation: sticker.rotation || 0
  }
}

/**
 * Pre-processes stickers before applying to 3D model
 * Validates positioning and applies corrections if needed
 */
export function preprocessStickers(stickers, side) {
  return stickers.map(sticker => {
    // Validate position
    const warnings = validateStickerPosition(sticker, side)
    if (warnings.length > 0) {
      console.warn(`Sticker "${sticker.name}" warnings:`, warnings)
    }
    
    // Convert to UV coordinates
    const uvCoords = convert2DToUV(sticker, side)
    
    // Return processed sticker with all necessary data
    return {
      ...sticker,
      ...uvCoords,
      side: side,
      processed: true,
      warnings: warnings
    }
  })
}

/**
 * Creates a preview of how the sticker will look on the 3D model
 * This helps ensure proper placement before final rendering
 */
export function createStickerPreview(sticker, side) {
  const uvCoords = convert2DToUV(sticker, side)
  
  return {
    originalPosition: { x: sticker.x, y: sticker.y },
    uvPosition: { x: uvCoords.uvX, y: uvCoords.uvY },
    size: { width: uvCoords.uvWidth, height: uvCoords.uvHeight },
    rotation: uvCoords.uvRotation,
    side: side,
    warnings: validateStickerPosition(sticker, side)
  }
}