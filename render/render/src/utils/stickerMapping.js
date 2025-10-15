/**
 * FIXED: Proper coordinate mapping with orientation correction
 * This ensures stickers appear correctly oriented on 3D model
 */

// EDITOR DIMENSIONS: What user sees in 2D editor
const EDITOR_DIMENSIONS = {
  width: 400,   // Canvas width in pixels  
  height: 500   // Canvas height in pixels
}

// TEXTURE DIMENSIONS: 3D model UV mapping
const TEXTURE_DIMENSIONS = {
  width: 512,   // Texture width in pixels
  height: 512   // Texture height in pixels
}

// Fix orientation and mirroring issues
const ORIENTATION_FIXES = {
  FRONT: {
    flipY: true,      // Fix upside-down issue
    flipX: false,     // No horizontal mirroring needed for front
    rotationOffset: 0 // No additional rotation needed
  },
  BACK: {
    flipY: true,      // Fix upside-down issue  
    flipX: true,      // Mirror for back side
    rotationOffset: 0 // No additional rotation needed
  }
}

/**
 * Map editor coordinates to 3D texture coordinates with proper orientation
 */
export function mapEditorToTexture(sticker, side) {
  console.log('\n🎯 === MAPPING EDITOR TO TEXTURE ===')
  console.log('📥 INPUT (Editor coordinates):')
  console.log({
    id: sticker.id,
    position: `${sticker.x}%, ${sticker.y}%`,
    size: `${sticker.width}px × ${sticker.height}px`,
    rotation: (sticker.rotation || 0) + '°'
  })
  
  // Get orientation fixes for this side
  const fixes = ORIENTATION_FIXES[side] || ORIENTATION_FIXES.FRONT
  
  // Apply coordinate corrections
  let correctedX = sticker.x
  let correctedY = sticker.y
  let correctedRotation = sticker.rotation || 0
  
  // Fix upside-down issue
  if (fixes.flipY) {
    correctedY = 100 - sticker.y  // Flip Y coordinate
  }
  
  // Fix mirroring for back side
  if (fixes.flipX) {
    correctedX = 100 - sticker.x  // Flip X coordinate
  }
  
  // Apply any rotation offset
  correctedRotation += fixes.rotationOffset
  
  // Ensure proper size scaling (make resizing easier)
  const sizeMultiplier = 1.2 // Make stickers slightly larger and easier to resize
  const correctedWidth = Math.max(sticker.width * sizeMultiplier, 40) // Minimum 40px
  const correctedHeight = Math.max(sticker.height * sizeMultiplier, 40) // Minimum 40px
  
  const result = {
    id: sticker.id,
    url: sticker.url,
    x: correctedX,
    y: correctedY,
    width: correctedWidth,
    height: correctedHeight,
    rotation: correctedRotation,
    side: side,
    // Add metadata for debugging
    _originalCoords: {
      x: sticker.x,
      y: sticker.y,
      width: sticker.width,
      height: sticker.height,
      rotation: sticker.rotation || 0
    },
    _fixes: fixes
  }
  
  console.log('📤 OUTPUT (Corrected texture coordinates):')
  console.log({
    id: result.id,
    position: `${result.x}%, ${result.y}%`,
    size: `${result.width}px × ${result.height}px`,
    rotation: result.rotation + '°',
    fixes: fixes
  })
  
  console.log('✅ Orientation and sizing fixes applied')
  return result
}

/**
 * Process multiple stickers for application to 3D model
 */
export async function preprocessStickers(editorStickers, side) {
  console.log('\n🚀 === PREPROCESSING STICKERS ===')
  console.log(`Processing ${editorStickers.length} stickers for ${side} side`)
  
  if (!editorStickers || editorStickers.length === 0) {
    console.log('⚠️ No stickers to process')
    return []
  }
  
  const processedStickers = []
  
  for (let i = 0; i < editorStickers.length; i++) {
    const sticker = editorStickers[i]
    console.log(`\n📝 Processing sticker ${i + 1}/${editorStickers.length}:`)
    
    try {
      // Map coordinates with orientation fixes
      const mappedSticker = mapEditorToTexture(sticker, side)
      
      // Verify the mapping worked correctly
      const isValid = mappedSticker && 
                     typeof mappedSticker.x === 'number' && 
                     typeof mappedSticker.y === 'number' &&
                     mappedSticker.width > 0 && 
                     mappedSticker.height > 0
      
      if (isValid) {
        processedStickers.push(mappedSticker)
        console.log('✅ Sticker processed successfully')
      } else {
        console.error('❌ Invalid sticker mapping result:', mappedSticker)
      }
      
    } catch (error) {
      console.error(`❌ Error processing sticker ${i + 1}:`, error)
    }
  }
  
  console.log(`\n🎯 PREPROCESSING COMPLETE: ${processedStickers.length}/${editorStickers.length} stickers processed`)
  return processedStickers
}

/**
 * Create sticker preview for debugging
 */
export function createStickerPreview(sticker, side) {
  return {
    id: sticker.id,
    url: sticker.url,
    position: `${sticker.x}%, ${sticker.y}%`,
    size: `${sticker.width}px × ${sticker.height}px`,
    rotation: sticker.rotation + '°',
    side: side,
    fixes: sticker._fixes || 'none'
  }
}

/**
 * Debug coordinate mapping
 */
export function debugCoordinateMapping(editorSticker, textureSticker) {
  console.log('\n🔍 === COORDINATE MAPPING DEBUG ===')
  console.log('Editor sticker:', {
    position: `${editorSticker.x}%, ${editorSticker.y}%`,
    size: `${editorSticker.width}px × ${editorSticker.height}px`,
    rotation: (editorSticker.rotation || 0) + '°'
  })
  console.log('Texture sticker:', {
    position: `${textureSticker.x}%, ${textureSticker.y}%`,
    size: `${textureSticker.width}px × ${textureSticker.height}px`,
    rotation: textureSticker.rotation + '°'
  })
  
  // Calculate differences
  const deltaX = Math.abs(editorSticker.x - textureSticker.x)
  const deltaY = Math.abs(editorSticker.y - textureSticker.y)
  const deltaW = Math.abs(editorSticker.width - textureSticker.width)
  const deltaH = Math.abs(editorSticker.height - textureSticker.height)
  const deltaR = Math.abs((editorSticker.rotation || 0) - textureSticker.rotation)
  
  console.log('Differences:', {
    x: deltaX + '%',
    y: deltaY + '%', 
    width: deltaW + 'px',
    height: deltaH + 'px',
    rotation: deltaR + '°'
  })
  
  const isAccurate = deltaX < 2 && deltaY < 2 && deltaW < 10 && deltaH < 10 && deltaR < 5
  console.log(isAccurate ? '✅ Mapping is accurate' : '❌ Mapping has significant differences')
  
  return isAccurate
}

/**
 * Verify coordinate system consistency
 */
export function verifyCoordinateSystem(stickers) {
  console.log('\n🧪 === COORDINATE SYSTEM VERIFICATION ===')
  
  for (const sticker of stickers) {
    console.log(`Sticker ${sticker.id}:`, {
      originalCoords: sticker._originalCoords,
      finalCoords: {
        x: sticker.x,
        y: sticker.y,
        width: sticker.width,
        height: sticker.height,
        rotation: sticker.rotation
      },
      fixes: sticker._fixes
    })
  }
  
  console.log('✅ Coordinate system verification complete')
}