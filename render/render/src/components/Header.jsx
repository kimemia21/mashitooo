import React from 'react'
import { Menu, Save, Download, Upload, Undo, Redo } from 'lucide-react'

function Header({ appMode, onModeChange, isMobile, onMenuToggle }) {
  const modes = [
    { id: 'VIEW', label: 'View', icon: '👁️' },
    { id: 'DESIGN', label: 'Design', icon: '🎨' },
    { id: 'PREVIEW', label: 'Preview', icon: '📱' }
  ]

  return (
    <header className="header">
      {isMobile && (
        <button 
          className="btn btn--icon"
          onClick={onMenuToggle}
          title="Menu"
        >
          <Menu size={20} />
        </button>
      )}
      
      <div className="header__logo">
        Fabric Editor
      </div>
      
      <nav className="header__nav">
        {modes.map(mode => (
          <button
            key={mode.id}
            className={`btn ${appMode === mode.id ? 'btn--selected' : ''}`}
            onClick={() => onModeChange(mode.id)}
          >
            <span>{mode.icon}</span>
            {!isMobile && mode.label}
          </button>
        ))}
      </nav>
      
      <div className="header__spacer" />
      
      <div className="header__actions">
        <button className="btn btn--icon" title="Undo">
          <Undo size={16} />
        </button>
        <button className="btn btn--icon" title="Redo">
          <Redo size={16} />
        </button>
        <button className="btn btn--icon" title="Save">
          <Save size={16} />
        </button>
        <button className="btn btn--icon" title="Export">
          <Download size={16} />
        </button>
        <button className="btn btn--icon" title="Import">
          <Upload size={16} />
        </button>
      </div>
    </header>
  )
}

export default Header