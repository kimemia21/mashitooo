import React, { useState } from 'react'

function BlenderUI({ 
  onImport, 
  onExport, 
  editMode, 
  onEditModeChange,
  selectionMode,
  onSelectionModeChange,
  transformMode,
  selectedObjects,
  isLoading,
  isExporting,
  lastAction,
  showPropertiesPanel = false,
  onTogglePropertiesPanel
}) {
  const [showLeftToolbar, setShowLeftToolbar] = useState(true)

  // Top-left corner buttons
  const topLeftStyle = {
    position: 'absolute',
    top: '20px',
    left: '20px',
    zIndex: 1000,
    display: 'flex',
    gap: '10px'
  }

  const buttonStyle = {
    background: 'rgba(40, 44, 52, 0.95)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '6px',
    color: 'white',
    padding: '8px 16px',
    cursor: 'pointer',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s ease',
    backdropFilter: 'blur(10px)'
  }

  const disabledButtonStyle = {
    ...buttonStyle,
    opacity: 0.5,
    cursor: 'not-allowed'
  }

  // Bottom-left corner status
  const bottomLeftStyle = {
    position: 'absolute',
    bottom: '20px',
    left: '20px',
    zIndex: 1000,
    background: 'rgba(40, 44, 52, 0.95)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    color: 'white',
    padding: '8px 16px',
    fontSize: '12px',
    backdropFilter: 'blur(10px)',
    minWidth: '200px'
  }

  // Right panel (collapsible)
  const rightPanelStyle = {
    position: 'absolute',
    top: '20px',
    right: showPropertiesPanel ? '20px' : '-300px',
    width: '280px',
    height: 'calc(100vh - 40px)',
    background: 'rgba(40, 44, 52, 0.95)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: 'white',
    fontSize: '12px',
    backdropFilter: 'blur(10px)',
    transition: 'right 0.3s ease',
    zIndex: 1000,
    overflow: 'auto'
  }

  const panelHeaderStyle = {
    padding: '12px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    fontWeight: 'bold',
    fontSize: '13px'
  }

  const panelContentStyle = {
    padding: '12px'
  }

  const inputStyle = {
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '4px',
    color: 'white',
    padding: '4px 8px',
    fontSize: '11px',
    width: '60px',
    marginLeft: '8px'
  }

  const getEditModeText = () => {
    if (editMode === 'EDIT') {
      return `Edit Mode - ${selectionMode} Select`
    }
    return 'Object Mode'
  }

  const getLastActionText = () => {
    if (transformMode) {
      return `${transformMode.charAt(0) + transformMode.slice(1).toLowerCase()} Mode Active`
    }
    if (lastAction) {
      return `Last: ${lastAction}`
    }
    return 'Ready'
  }

  const getSelectionText = () => {
    if (selectedObjects.length === 0) {
      return 'Nothing selected'
    } else if (selectedObjects.length === 1) {
      return '1 object selected'
    } else {
      return `${selectedObjects.length} objects selected`
    }
  }

  return (
    <>
      {/* Top-left corner - Import/Export */}
      <div style={topLeftStyle}>
        <button
          style={isLoading ? disabledButtonStyle : buttonStyle}
          onClick={onImport}
          disabled={isLoading}
          onMouseEnter={(e) => !isLoading && (e.target.style.background = 'rgba(60, 64, 72, 0.95)')}
          onMouseLeave={(e) => (e.target.style.background = 'rgba(40, 44, 52, 0.95)')}
        >
          📁 {isLoading ? 'Loading...' : 'Import GLB'}
        </button>
        
        <button
          style={isExporting ? disabledButtonStyle : buttonStyle}
          onClick={onExport}
          disabled={isExporting}
          onMouseEnter={(e) => !isExporting && (e.target.style.background = 'rgba(60, 64, 72, 0.95)')}
          onMouseLeave={(e) => (e.target.style.background = 'rgba(40, 44, 52, 0.95)')}
        >
          💾 {isExporting ? 'Exporting...' : 'Export GLB'}
        </button>
      </div>

      {/* Bottom-left corner - Mode and status */}
      <div style={bottomLeftStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong>{getEditModeText()}</strong>
            {editMode === 'EDIT' && (
              <div style={{ fontSize: '10px', opacity: 0.8, marginTop: '2px' }}>
                Press 1-Vertex, 2-Edge, 3-Face
              </div>
            )}
          </div>
          <div style={{ textAlign: 'right', fontSize: '10px', opacity: 0.8 }}>
            {getLastActionText()}
          </div>
        </div>
        
        <div style={{ 
          marginTop: '8px', 
          paddingTop: '8px', 
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          fontSize: '10px',
          opacity: 0.8 
        }}>
          {getSelectionText()}
        </div>
      </div>

      {/* Right panel toggle button */}
      {!showPropertiesPanel && (
        <button
          style={{
            ...buttonStyle,
            position: 'absolute',
            top: '20px',
            right: '20px',
            zIndex: 1001
          }}
          onClick={onTogglePropertiesPanel}
        >
          📊 Properties
        </button>
      )}

      {/* Right panel - Properties */}
      <div style={rightPanelStyle}>
        <div style={panelHeaderStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Properties
            <button
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontSize: '16px'
              }}
              onClick={onTogglePropertiesPanel}
            >
              ×
            </button>
          </div>
        </div>

        <div style={panelContentStyle}>
          {selectedObjects.length > 0 ? (
            <>
              <div style={{ marginBottom: '16px' }}>
                <strong>Transform</strong>
              </div>
              
              <div style={{ marginBottom: '12px' }}>
                <div>Location</div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <label>X: <input type="number" step="0.01" style={inputStyle} /></label>
                  <label>Y: <input type="number" step="0.01" style={inputStyle} /></label>
                  <label>Z: <input type="number" step="0.01" style={inputStyle} /></label>
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <div>Rotation</div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <label>X: <input type="number" step="1" style={inputStyle} />°</label>
                  <label>Y: <input type="number" step="1" style={inputStyle} />°</label>
                  <label>Z: <input type="number" step="1" style={inputStyle} />°</label>
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <div>Scale</div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <label>X: <input type="number" step="0.01" style={inputStyle} /></label>
                  <label>Y: <input type="number" step="0.01" style={inputStyle} /></label>
                  <label>Z: <input type="number" step="0.01" style={inputStyle} /></label>
                </div>
              </div>
            </>
          ) : (
            <div style={{ opacity: 0.6, fontStyle: 'italic' }}>
              Select an object to view properties
            </div>
          )}

          {editMode === 'EDIT' && (
            <>
              <div style={{ 
                marginTop: '20px',
                paddingTop: '16px', 
                borderTop: '1px solid rgba(255, 255, 255, 0.1)' 
              }}>
                <strong>Edit Mode Tools</strong>
              </div>
              
              <div style={{ marginTop: '12px', fontSize: '10px', opacity: 0.8 }}>
                <div>E - Extrude</div>
                <div>I - Inset Faces</div>
                <div>Ctrl+B - Bevel</div>
                <div>Ctrl+R - Loop Cut</div>
                <div>X/Del - Delete</div>
                <div>M - Merge</div>
                <div>O - Proportional Edit</div>
              </div>
            </>
          )}

          <div style={{ 
            marginTop: '20px',
            paddingTop: '16px', 
            borderTop: '1px solid rgba(255, 255, 255, 0.1)' 
          }}>
            <strong>Shortcuts</strong>
          </div>
          
          <div style={{ marginTop: '12px', fontSize: '10px', opacity: 0.8 }}>
            <div>Tab - Toggle Object/Edit Mode</div>
            <div>G - Move</div>
            <div>R - Rotate</div>
            <div>S - Scale</div>
            <div>X/Y/Z - Axis lock</div>
            <div>Escape - Cancel</div>
            <div>Enter/Click - Confirm</div>
            <div>F - Frame Selected</div>
            <div>Home - Frame All</div>
            <div>N - Toggle Properties</div>
          </div>
        </div>
      </div>

    </>
  )
}

export default BlenderUI