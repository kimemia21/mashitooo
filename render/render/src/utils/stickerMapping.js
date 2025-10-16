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
const ORIENTATION_FIXES = {
  FRONT: {
    flipY: false,      // Don't flip - editor coordinates already match
    flipX: false,
    rotationOffset: 0
  },
  BACK: {
    flipY: false,      // Don't flip - editor coordinates already match
    flipX: true,       // Only flip X for back side mirroring
    rotationOffset: 0
  }
}

/**
 * Map editor coordinates to 3D texture coordinates
 * Keep transformations minimal and traceable
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
  
  const fixes = ORIENTATION_FIXES[side] || ORIENTATION_FIXES.FRONT
  
  let correctedX = sticker.x
  let correctedY = sticker.y
  let correctedRotation = sticker.rotation || 0
  
  // Only apply necessary corrections
  if (fixes.flipX) {
    correctedX = 100 - sticker.x
    console.log(`Applied X flip for ${side}:`, `${sticker.x}% → ${correctedX}%`)
  }
  
  if (fixes.flipY) {
    correctedY = 100 - sticker.y
    console.log(`Applied Y flip for ${side}:`, `${sticker.y}% → ${correctedY}%`)
  }
  
  correctedRotation += fixes.rotationOffset
  
  // Keep size unchanged - don't inflate
  const correctedWidth = sticker.width
  const correctedHeight = sticker.height
  
  const result = {
    id: sticker.id,
    url: sticker.url,
    x: correctedX,
    y: correctedY,
    width: correctedWidth,
    height: correctedHeight,
    rotation: correctedRotation,
    side: side,
    originalX: sticker.x,
    originalY: sticker.y,
    originalWidth: sticker.width,
    originalHeight: sticker.height,
    originalRotation: sticker.rotation || 0
  }
  
  console.log('📤 OUTPUT (Mapped texture coordinates):')
  console.log({
    id: result.id,
    position: `${result.x}%, ${result.y}%`,
    size: `${result.width}px × ${result.height}px`,
    rotation: result.rotation + '°'
  })
  
  return result
}
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
      const mappedSticker = mapEditorToTexture(sticker, side)
      
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
    isPerfectMapping: true,
    warnings: []
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
  
  // Allow small floating point differences
  const deltaX = Math.abs(editorSticker.x - textureSticker.x)
  const deltaY = Math.abs(editorSticker.y - textureSticker.y)
  const deltaW = Math.abs(editorSticker.width - textureSticker.width)
  const deltaH = Math.abs(editorSticker.height - textureSticker.height)
  const deltaR = Math.abs((editorSticker.rotation || 0) - textureSticker.rotation)
  
  console.log('Differences:', {
    x: deltaX.toFixed(2) + '%',
    y: deltaY.toFixed(2) + '%', 
    width: deltaW.toFixed(2) + 'px',
    height: deltaH.toFixed(2) + 'px',
    rotation: deltaR.toFixed(2) + '°'
  })
  
  // Much tighter tolerances since we're not changing anything
  const isAccurate = deltaX < 0.1 && deltaY < 0.1 && deltaW < 1 && deltaH < 1 && deltaR < 0.1
  
  if (isAccurate) {
    console.log('✅ Perfect 1:1 mapping verified')
  } else {
    console.log('⚠️ Mapping has coordinate differences - may need adjustment')
  }
  
  return isAccurate
}

/**
 * Verify coordinate system consistency
 */
export function verifyCoordinateSystem(stickers) {
  console.log('\n🧪 === COORDINATE SYSTEM VERIFICATION ===')
  
  if (!stickers || stickers.length === 0) {
    console.log('No stickers to verify')
    return true
  }
  
  let allValid = true
  
  for (const sticker of stickers) {
    const hasRequiredProps = sticker.id && typeof sticker.x === 'number' && typeof sticker.y === 'number'
    
    if (!hasRequiredProps) {
      console.warn(`⚠️ Sticker ${sticker.id} missing required properties`)
      allValid = false
    }
  }
  
  console.log('✅ Coordinate system verification complete')
  return allValid
}