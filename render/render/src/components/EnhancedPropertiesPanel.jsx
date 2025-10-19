import React, { useState } from 'react'
import { 
  Move, RotateCw, Scale, Copy, Trash2, 
  Eye, EyeOff, Lock, Unlock, Layers,
  ChevronDown, ChevronUp, Palette,
  Settings, Sliders
} from 'lucide-react'

function EnhancedPropertiesPanel({
  selectedSticker,
  onUpdate,
  onDelete,
  onDuplicate
}) {
  const [expandedSections, setExpandedSections] = useState({
    transform: true,
    appearance: true,
    advanced: false
  })

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handlePropertyChange = (property, value) => {
    if (!selectedSticker) return
    onUpdate(selectedSticker.id, { [property]: value })
  }

  const handlePositionChange = (axis, value) => {
    if (!selectedSticker) return
    const newPosition = [...selectedSticker.position]
    const axisIndex = axis === 'x' ? 0 : axis === 'y' ? 1 : 2
    newPosition[axisIndex] = parseFloat(value)
    onUpdate(selectedSticker.id, { position: newPosition })
  }

  const handleRotationChange = (axis, value) => {
    if (!selectedSticker) return
    const newRotation = [...selectedSticker.rotation]
    const axisIndex = axis === 'x' ? 0 : axis === 'y' ? 1 : 2
    newRotation[axisIndex] = parseFloat(value) * (Math.PI / 180) // Convert to radians
    onUpdate(selectedSticker.id, { rotation: newRotation })
  }

  const handleScaleChange = (axis, value) => {
    if (!selectedSticker) return
    const newScale = [...selectedSticker.scale]
    const axisIndex = axis === 'x' ? 0 : axis === 'y' ? 1 : 2
    newScale[axisIndex] = parseFloat(value)
    onUpdate(selectedSticker.id, { scale: newScale })
  }

  const resetTransform = () => {
    if (!selectedSticker) return
    onUpdate(selectedSticker.id, {
      position: [0, 0, 0.1],
      rotation: [0, 0, 0],
      scale: [1, 1, 1]
    })
  }

  if (!selectedSticker) {
    return (
      <div className="enhanced-properties-panel">
        <div className="properties-empty-state">
          <Layers size={48} />
          <h3>No Selection</h3>
          <p>Select a sticker to edit its properties</p>
        </div>
      </div>
    )
  }

  return (
    <div className="enhanced-properties-panel">
      {/* Sticker Header */}
      <div className="properties-header">
        <div className="properties-sticker-info">
          <div className="properties-sticker-preview">
            <img src={selectedSticker.url} alt={selectedSticker.name} />
          </div>
          <div className="properties-sticker-details">
            <h4>{selectedSticker.name}</h4>
            <span className="properties-sticker-id">ID: {selectedSticker.id}</span>
          </div>
        </div>
        
        <div className="properties-quick-actions">
          <button 
            className="btn btn--icon tooltip"
            onClick={() => handlePropertyChange('visible', !selectedSticker.visible)}
            data-tooltip={selectedSticker.visible !== false ? "Hide" : "Show"}
          >
            {selectedSticker.visible !== false ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
          <button 
            className="btn btn--icon tooltip"
            onClick={() => handlePropertyChange('locked', !selectedSticker.locked)}
            data-tooltip={selectedSticker.locked ? "Unlock" : "Lock"}
          >
            {selectedSticker.locked ? <Lock size={16} /> : <Unlock size={16} />}
          </button>
        </div>
      </div>

      {/* Transform Section */}
      <div className="properties-section">
        <button 
          className="properties-section-header"
          onClick={() => toggleSection('transform')}
        >
          <Move size={16} />
          <span>Transform</span>
          {expandedSections.transform ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        
        {expandedSections.transform && (
          <div className="properties-section-content">
            {/* Position Controls */}
            <div className="property-group">
              <label className="property-label">Position</label>
              <div className="property-controls">
                <div className="property-control">
                  <span className="axis-label">X</span>
                  <input
                    type="number"
                    step="0.1"
                    value={selectedSticker.position[0].toFixed(2)}
                    onChange={(e) => handlePositionChange('x', e.target.value)}
                    className="property-input"
                  />
                </div>
                <div className="property-control">
                  <span className="axis-label">Y</span>
                  <input
                    type="number"
                    step="0.1"
                    value={selectedSticker.position[1].toFixed(2)}
                    onChange={(e) => handlePositionChange('y', e.target.value)}
                    className="property-input"
                  />
                </div>
                <div className="property-control">
                  <span className="axis-label">Z</span>
                  <input
                    type="number"
                    step="0.1"
                    value={selectedSticker.position[2].toFixed(2)}
                    onChange={(e) => handlePositionChange('z', e.target.value)}
                    className="property-input"
                  />
                </div>
              </div>
            </div>

            {/* Rotation Controls */}
            <div className="property-group">
              <label className="property-label">Rotation (°)</label>
              <div className="property-controls">
                <div className="property-control">
                  <span className="axis-label">X</span>
                  <input
                    type="number"
                    step="5"
                    value={(selectedSticker.rotation[0] * (180 / Math.PI)).toFixed(0)}
                    onChange={(e) => handleRotationChange('x', e.target.value)}
                    className="property-input"
                  />
                </div>
                <div className="property-control">
                  <span className="axis-label">Y</span>
                  <input
                    type="number"
                    step="5"
                    value={(selectedSticker.rotation[1] * (180 / Math.PI)).toFixed(0)}
                    onChange={(e) => handleRotationChange('y', e.target.value)}
                    className="property-input"
                  />
                </div>
                <div className="property-control">
                  <span className="axis-label">Z</span>
                  <input
                    type="number"
                    step="5"
                    value={(selectedSticker.rotation[2] * (180 / Math.PI)).toFixed(0)}
                    onChange={(e) => handleRotationChange('z', e.target.value)}
                    className="property-input"
                  />
                </div>
              </div>
            </div>

            {/* Scale Controls */}
            <div className="property-group">
              <label className="property-label">Scale</label>
              <div className="property-controls">
                <div className="property-control">
                  <span className="axis-label">X</span>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="5"
                    value={selectedSticker.scale[0].toFixed(2)}
                    onChange={(e) => handleScaleChange('x', e.target.value)}
                    className="property-input"
                  />
                </div>
                <div className="property-control">
                  <span className="axis-label">Y</span>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="5"
                    value={selectedSticker.scale[1].toFixed(2)}
                    onChange={(e) => handleScaleChange('y', e.target.value)}
                    className="property-input"
                  />
                </div>
                <div className="property-control">
                  <span className="axis-label">Z</span>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="5"
                    value={selectedSticker.scale[2].toFixed(2)}
                    onChange={(e) => handleScaleChange('z', e.target.value)}
                    className="property-input"
                  />
                </div>
              </div>
            </div>

            <button 
              className="btn btn--secondary btn--full-width"
              onClick={resetTransform}
            >
              <RotateCw size={16} />
              Reset Transform
            </button>
          </div>
        )}
      </div>

      {/* Appearance Section */}
      <div className="properties-section">
        <button 
          className="properties-section-header"
          onClick={() => toggleSection('appearance')}
        >
          <Palette size={16} />
          <span>Appearance</span>
          {expandedSections.appearance ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        
        {expandedSections.appearance && (
          <div className="properties-section-content">
            {/* Opacity Control */}
            <div className="property-group">
              <label className="property-label">Opacity</label>
              <div className="property-slider-container">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={selectedSticker.opacity || 1}
                  onChange={(e) => handlePropertyChange('opacity', parseFloat(e.target.value))}
                  className="property-slider"
                />
                <span className="property-value">
                  {Math.round((selectedSticker.opacity || 1) * 100)}%
                </span>
              </div>
            </div>

            {/* Blend Mode */}
            <div className="property-group">
              <label className="property-label">Blend Mode</label>
              <select
                value={selectedSticker.blendMode || 'normal'}
                onChange={(e) => handlePropertyChange('blendMode', e.target.value)}
                className="property-select"
              >
                <option value="normal">Normal</option>
                <option value="multiply">Multiply</option>
                <option value="screen">Screen</option>
                <option value="overlay">Overlay</option>
                <option value="soft-light">Soft Light</option>
                <option value="hard-light">Hard Light</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Advanced Section */}
      <div className="properties-section">
        <button 
          className="properties-section-header"
          onClick={() => toggleSection('advanced')}
        >
          <Settings size={16} />
          <span>Advanced</span>
          {expandedSections.advanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        
        {expandedSections.advanced && (
          <div className="properties-section-content">
            {/* Layer Order */}
            <div className="property-group">
              <label className="property-label">Layer Order</label>
              <div className="property-controls">
                <button className="btn btn--secondary">Send to Back</button>
                <button className="btn btn--secondary">Bring to Front</button>
              </div>
            </div>

            {/* Shadow Effect */}
            <div className="property-group">
              <label className="property-label">Drop Shadow</label>
              <div className="property-checkbox">
                <input
                  type="checkbox"
                  checked={selectedSticker.shadow || false}
                  onChange={(e) => handlePropertyChange('shadow', e.target.checked)}
                />
                <span>Enable drop shadow</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="properties-actions">
        <button 
          className="btn btn--secondary"
          onClick={() => onDuplicate(selectedSticker)}
        >
          <Copy size={16} />
          Duplicate
        </button>
        <button 
          className="btn btn--danger"
          onClick={() => onDelete(selectedSticker.id)}
        >
          <Trash2 size={16} />
          Delete
        </button>
      </div>
    </div>
  )
}

export default EnhancedPropertiesPanel