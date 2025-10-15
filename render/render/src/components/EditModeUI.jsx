import React from 'react';

const EditModeUI = ({ onSideSelect, onCancel }) => {
  const styles = {
    container: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(180deg, #1e1e1e 0%, #2b2b2b 100%)',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1500,
      fontFamily: 'Inter, sans-serif',
      overflow: 'hidden',
      padding: '20px',
    },
    title: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#f0f0f0',
      textAlign: 'center',
      marginBottom: '10px',
    },
    subtitle: {
      fontSize: '1rem',
      color: '#b3b3b3',
      textAlign: 'center',
      marginBottom: '30px',
    },
    buttonContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: '20px',
      width: '100%',
      maxWidth: '500px',
      marginBottom: '30px',
    },
    sideButton: {
      background: 'linear-gradient(180deg, #3a3a3a 0%, #262626 100%)',
      border: '1px solid #4a4a4a',
      borderRadius: '12px',
      color: '#fff',
      fontSize: '1rem',
      fontWeight: '600',
      width: '160px',
      height: '160px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
      cursor: 'pointer',
    },
    sideButtonHover: {
      background: 'linear-gradient(180deg, #454545 0%, #303030 100%)',
      border: '1px solid #5e9cff',
      transform: 'translateY(-4px)',
      boxShadow: '0 8px 25px rgba(94,156,255,0.3)',
    },
    icon: {
      fontSize: '2.5rem',
      marginBottom: '8px',
    },
    cancelButton: {
      background: 'transparent',
      color: '#fff',
      border: '1px solid #888',
      borderRadius: '20px',
      padding: '10px 24px',
      fontSize: '0.9rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    },
    cancelButtonHover: {
      background: '#fff',
      color: '#000',
    },
    stepText: {
      position: 'absolute',
      bottom: '20px',
      textAlign: 'center',
      color: '#999',
      fontSize: '0.85rem',
      opacity: 0.8,
    },
  };

  const [hoveredButton, setHoveredButton] = React.useState(null);
  const [cancelHover, setCancelHover] = React.useState(false);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Choose T-Shirt Side</h1>
      <p style={styles.subtitle}>Select which side of the t-shirt you want to customize</p>

      <div style={styles.buttonContainer}>
        {['FRONT', 'BACK'].map((side) => (
          <button
            key={side}
            style={{
              ...styles.sideButton,
              ...(hoveredButton === side ? styles.sideButtonHover : {}),
            }}
            onClick={() => onSideSelect(side)}
            onMouseEnter={() => setHoveredButton(side)}
            onMouseLeave={() => setHoveredButton(null)}
          >
            <span style={styles.icon}>{side === 'FRONT' ? '👕' : '🔄'}</span>
            {side.charAt(0) + side.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <button
        style={{
          ...styles.cancelButton,
          ...(cancelHover ? styles.cancelButtonHover : {}),
        }}
        onClick={onCancel}
        onMouseEnter={() => setCancelHover(true)}
        onMouseLeave={() => setCancelHover(false)}
      >
        Cancel
      </button>

      <div style={styles.stepText}>Step 1 of 3: Choose your side</div>
    </div>
  );
};

export default EditModeUI;
