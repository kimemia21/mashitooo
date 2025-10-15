import React from 'react'

const IconButton = ({ 
  icon: Icon, 
  label, 
  onClick, 
  active = false, 
  disabled = false,
  tooltip,
  size = 20,
  className = '',
  ...props 
}) => {
  return (
    <button
      className={`icon-btn ${active ? 'active' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled}
      data-tooltip={tooltip}
      title={tooltip}
      {...props}
    >
      {Icon && <Icon size={size} />}
      {label && <span className="sr-only">{label}</span>}
    </button>
  )
}

export default IconButton