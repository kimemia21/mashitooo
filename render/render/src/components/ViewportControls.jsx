import React from 'react'

const ViewportControls = ({ 
  viewMode, 
  setViewMode, 
  showGrid, 
  setShowGrid, 
  environmentPreset, 
  setEnvironmentPreset,
  onCameraReset,
  onFrameSelected,
  onFrameAll
}) => {
  const containerStyle = {
    position: 'absolute',
    top: '20px',
    left: '20px',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  }

  const panelStyle = {
    background: 'rgba(40, 44, 52, 0.95)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    padding: '12px',
    color: 'white',
    fontSize: '12px',
    backdropFilter: 'blur(10px)',
    minWidth: '180px',
  }

  const buttonStyle = {
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '4px',
    color: 'white',
    padding: '6px 12px',
    cursor: 'pointer',
    fontSize: '11px',
    transition: 'all 0.2s ease',
    margin: '2px',
  }

  const activeButtonStyle = {
    ...buttonStyle,
    background: 'rgba(59, 130, 246, 0.8)',
    borderColor: 'rgba(59, 130, 246, 1)',
  }

  const selectStyle = {
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '4px',
    color: 'white',
    padding: '4px 8px',
    fontSize: '11px',
    width: '100%',
    marginTop: '4px',
  }

  return (
    <div style={containerStyle}>
      {/* View Mode Controls */}
      <div style={panelStyle}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Viewport</div>
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          <button
            style={viewMode === 'wireframe' ? activeButtonStyle : buttonStyle}
            onClick={() => setViewMode('wireframe')}
          >
            Wireframe
          </button>
          <button
            style={viewMode === 'solid' ? activeButtonStyle : buttonStyle}
            onClick={() => setViewMode('solid')}
          >
            Solid
          </button>
          <button
            style={viewMode === 'rendered' ? activeButtonStyle : buttonStyle}
            onClick={() => setViewMode('rendered')}
          >
            Rendered
          </button>
        </div>
      </div>

      {/* Display Controls */}
      <div style={panelStyle}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Display</div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={showGrid}
            onChange={(e) => setShowGrid(e.target.checked)}
            style={{ margin: 0 }}
          />
          Show Grid
        </label>
        <select
          value={environmentPreset}
          onChange={(e) => setEnvironmentPreset(e.target.value)}
          style={selectStyle}
        >
          <option value="studio">Studio</option>
          <option value="warehouse">Warehouse</option>
          <option value="forest">Forest</option>
          <option value="city">City</option>
          <option value="sunset">Sunset</option>
          <option value="dawn">Dawn</option>
          <option value="night">Night</option>
          <option value="apartment">Apartment</option>
        </select>
      </div>

      {/* Camera Controls */}
      <div style={panelStyle}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Camera</div>
        <button
          style={buttonStyle}
          onClick={onCameraReset}
          onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
          onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
        >
          Reset View
        </button>
        <button
          style={buttonStyle}
          onClick={onFrameSelected}
          onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
          onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
        >
          Frame Selected
        </button>
        <button
          style={buttonStyle}
          onClick={onFrameAll}
          onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
          onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
        >
          Frame All
        </button>
      </div>

      {/* Keyboard Shortcuts */}
      <div style={panelStyle}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Shortcuts</div>
        <div style={{ fontSize: '10px', opacity: 0.8 }}>
          <div>G - Grab/Move</div>
          <div>R - Rotate</div>
          <div>S - Scale</div>
          <div>X - Delete</div>
          <div>Home - Frame All</div>
          <div>NumPad . - Frame Selected</div>
        </div>
      </div>
    </div>
  )
}

export default ViewportControls