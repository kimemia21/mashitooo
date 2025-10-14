import React from 'react'

const ColorPicker = ({ color, onChange }) => {
  const presetColors = [
    '#ffffff', // White
    '#ff0000', // Red
    '#00ff00', // Green
    '#0000ff', // Blue
    '#ffff00', // Yellow
    '#ff00ff', // Magenta
    '#00ffff', // Cyan
    '#000000', // Black
  ]

  const containerStyle = {
    position: 'absolute',
    top: '20px',
    left: '20px',
    zIndex: 1000,
    background: 'rgba(255, 255, 255, 0.9)',
    padding: '15px',
    borderRadius: '10px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    backdropFilter: 'blur(10px)',
  }

  const titleStyle = {
    margin: '0 0 10px 0',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#333',
  }

  const inputStyle = {
    width: '50px',
    height: '30px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginBottom: '10px',
  }

  const presetGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '5px',
  }

  const presetButtonStyle = {
    width: '25px',
    height: '25px',
    border: '2px solid #ddd',
    borderRadius: '3px',
    cursor: 'pointer',
    transition: 'transform 0.1s',
  }

  return (
    <div style={containerStyle}>
      <h3 style={titleStyle}>T-Shirt Color</h3>
      
      {/* Color Input */}
      <input
        type="color"
        value={color}
        onChange={(e) => onChange(e.target.value)}
        style={inputStyle}
      />
      
      {/* Preset Colors */}
      <div style={presetGridStyle}>
        {presetColors.map((presetColor) => (
          <button
            key={presetColor}
            style={{
              ...presetButtonStyle,
              backgroundColor: presetColor,
              borderColor: color === presetColor ? '#333' : '#ddd',
              transform: color === presetColor ? 'scale(1.1)' : 'scale(1)',
            }}
            onClick={() => onChange(presetColor)}
            title={presetColor}
          />
        ))}
      </div>
    </div>
  )
}

export default ColorPicker