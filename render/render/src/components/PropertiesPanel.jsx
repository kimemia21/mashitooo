import React from 'react'
import { Trash2, Copy, FlipHorizontal, FlipVertical } from 'lucide-react'

function PropertiesPanel({ 
  selectedSticker, 
  onUpdate, 
  onDelete, 
  onDuplicate 
}) {
  if (!selectedSticker) {
    return (
      <div className="properties-panel">
        <p className="text-muted text-center">
          Select a sticker to edit its properties
        </p>
      </div>
    )
  }

  const handleInputChange = (property, value) => {
    onUpdate(selectedSticker.id, { [property]: value })
  }

  const handlePositionChange = (axis, value) => {
    const newPosition = [...(selectedSticker.position || [0, 0, 0.1])]
    const axisIndex = { x: 0, y: 1, z: 2 }[axis]
    newPosition[axisIndex] = parseFloat(value) || 0
    onUpdate(selectedSticker.id, { position: newPosition })
  }

  const handleRotationChange = (axis, value) => {
    const newRotation = [...(selectedSticker.rotation || [0, 0, 0])]
    const axisIndex = { x: 0, y: 1, z: 2 }[axis]
    newRotation[axisIndex] = (parseFloat(value) || 0) * Math.PI / 180 // Convert to radians
    onUpdate(selectedSticker.id, { rotation: newRotation })
  }

  const handleScaleChange = (axis, value) => {
    const newScale = [...(selectedSticker.scale || [1, 1, 1])]
    const axisIndex = { x: 0, y: 1, z: 2 }[axis]
    newScale[axisIndex] = parseFloat(value) || 1
    onUpdate(selectedSticker.id, { scale: newScale })
  }

  const handleFlip = (axis) => {
    const currentScale = selectedSticker.scale || [1, 1, 1]
    const newScale = [...currentScale]
    const axisIndex = { x: 0, y: 1 }[axis]
    newScale[axisIndex] *= -1
    onUpdate(selectedSticker.id, { scale: newScale })
  }

  const position = selectedSticker.position || [0, 0, 0.1]
  const rotation = selectedSticker.rotation || [0, 0, 0]
  const scale = selectedSticker.scale || [1, 1, 1]

  return (
    <div className="properties-panel">
      {/* Sticker Info */}
      <div className="property-group">
        <div className="property-group__label">Sticker</div>
        <div className="sticker-info">
          <div className="sticker-info__preview">
            <img 
              src={selectedSticker.url} 
              alt={selectedSticker.name}
              style={{ width: '40px', height: '40px', objectFit: 'contain' }}
            />
          </div>
          <div className="sticker-info__details">
            <div className="sticker-info__name">{selectedSticker.name}</div>
            <div className="sticker-info__id text-muted">ID: {selectedSticker.id}</div>
          </div>
        </div>
      </div>

      {/* Position */}
      <div className="property-group">
        <div className="property-group__label">Position</div>
        <div className="property-row">
          <label>X:</label>
          <input
            type="number"
            className="input"
            value={position[0].toFixed(3)}
            onChange={(e) => handlePositionChange('x', e.target.value)}
            step="0.1"
          />
        </div>
        <div className="property-row">
          <label>Y:</label>
          <input
            type="number"
            className="input"
            value={position[1].toFixed(3)}
            onChange={(e) => handlePositionChange('y', e.target.value)}
            step="0.1"
          />
        </div>
        <div className="property-row">
          <label>Z:</label>
          <input
            type="number"
            className="input"
            value={position[2].toFixed(3)}
            onChange={(e) => handlePositionChange('z', e.target.value)}
            step="0.01"
          />
        </div>
      </div>

      {/* Rotation */}
      <div className="property-group">
        <div className="property-group__label">Rotation (degrees)</div>
        <div className="property-row">
          <label>X:</label>
          <input
            type="number"
            className="input"
            value={(rotation[0] * 180 / Math.PI).toFixed(1)}
            onChange={(e) => handleRotationChange('x', e.target.value)}
            step="1"
          />
        </div>
        <div className="property-row">
          <label>Y:</label>
          <input
            type="number"
            className="input"
            value={(rotation[1] * 180 / Math.PI).toFixed(1)}
            onChange={(e) => handleRotationChange('y', e.target.value)}
            step="1"
          />
        </div>
        <div className="property-row">
          <label>Z:</label>
          <input
            type="number"
            className="input"
            value={(rotation[2] * 180 / Math.PI).toFixed(1)}
            onChange={(e) => handleRotationChange('z', e.target.value)}
            step="1"
          />
        </div>
      </div>

      {/* Scale */}
      <div className="property-group">
        <div className="property-group__label">Scale</div>
        <div className="property-row">
          <label>X:</label>
          <input
            type="number"
            className="input"
            value={scale[0].toFixed(2)}
            onChange={(e) => handleScaleChange('x', e.target.value)}
            step="0.1"
            min="0.1"
          />
        </div>
        <div className="property-row">
          <label>Y:</label>
          <input
            type="number"
            className="input"
            value={scale[1].toFixed(2)}
            onChange={(e) => handleScaleChange('y', e.target.value)}
            step="0.1"
            min="0.1"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="property-group">
        <div className="property-group__label">Actions</div>
        <div className="property-actions">
          <button
            className="btn btn--icon"
            onClick={() => handleFlip('x')}
            title="Flip Horizontal"
          >
            <FlipHorizontal size={16} />
          </button>
          <button
            className="btn btn--icon"
            onClick={() => handleFlip('y')}
            title="Flip Vertical"
          >
            <FlipVertical size={16} />
          </button>
          <button
            className="btn btn--icon"
            onClick={() => onDuplicate?.(selectedSticker)}
            title="Duplicate"
          >
            <Copy size={16} />
          </button>
          <button
            className="btn btn--icon"
            onClick={() => onDelete?.(selectedSticker.id)}
            title="Delete"
            style={{ color: 'var(--color-danger)' }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default PropertiesPanel