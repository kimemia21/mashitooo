import React from 'react'

const EditModeUI = ({ onSideSelect, onCancel }) => {
  const containerStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1500,
    color: 'white'
  }

  const titleStyle = {
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '20px',
    textAlign: 'center'
  }

  const subtitleStyle = {
    fontSize: '18px',
    marginBottom: '40px',
    textAlign: 'center',
    opacity: 0.8
  }

  const buttonContainerStyle = {
    display: 'flex',
    gap: '30px',
    marginBottom: '40px'
  }

  const sideButtonStyle = {
    background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
    color: 'white',
    border: 'none',
    padding: '20px 40px',
    borderRadius: '15px',
    fontSize: '20px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 8px 25px rgba(0, 123, 255, 0.3)',
    transition: 'all 0.3s ease',
    minWidth: '150px'
  }

  const cancelButtonStyle = {
    background: 'transparent',
    color: 'white',
    border: '2px solid white',
    padding: '12px 25px',
    borderRadius: '25px',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  }

  const iconStyle = {
    fontSize: '48px',
    marginBottom: '15px',
    display: 'block'
  }

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>Choose T-Shirt Side</h1>
      <p style={subtitleStyle}>Select which side of the t-shirt you want to customize</p>
      
      <div style={buttonContainerStyle}>
        <button 
          style={sideButtonStyle}
          onClick={() => onSideSelect('FRONT')}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-5px)'
            e.target.style.boxShadow = '0 12px 35px rgba(0, 123, 255, 0.4)'
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)'
            e.target.style.boxShadow = '0 8px 25px rgba(0, 123, 255, 0.3)'
          }}
        >
          <span style={iconStyle}>👕</span>
          Front
        </button>
        
        <button 
          style={sideButtonStyle}
          onClick={() => onSideSelect('BACK')}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-5px)'
            e.target.style.boxShadow = '0 12px 35px rgba(0, 123, 255, 0.4)'
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)'
            e.target.style.boxShadow = '0 8px 25px rgba(0, 123, 255, 0.3)'
          }}
        >
          <span style={iconStyle}>🔄</span>
          Back
        </button>
      </div>

      <button 
        style={cancelButtonStyle}
        onClick={onCancel}
        onMouseEnter={(e) => {
          e.target.style.background = 'white'
          e.target.style.color = 'black'
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'transparent'
          e.target.style.color = 'white'
        }}
      >
        Cancel
      </button>

      <div style={{
        position: 'absolute',
        bottom: '30px',
        fontSize: '14px',
        opacity: 0.6,
        textAlign: 'center'
      }}>
        Step 1 of 3: Choose your side
      </div>
    </div>
  )
}

export default EditModeUI