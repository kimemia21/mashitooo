import React from 'react'
import { 
  Menu, Save, Download, Upload, Undo, Redo, 
  Palette, Grid, Eye, Sparkles, Settings 
} from 'lucide-react'

function CreativeHeader({ 
  appMode, 
  onModeChange, 
  isMobile, 
  onMenuToggle,
  isCreativeMode,
  onCreativeModeToggle,
  showGridGuides,
  onGridToggle
}) {
  const modes = [
    { id: 'VIEW', label: 'View', icon: Eye, color: '#06b6d4' },
    { id: 'DESIGN', label: 'Design', icon: Palette, color: '#8b5cf6' },
    { id: 'PREVIEW', label: 'Preview', icon: Sparkles, color: '#ec4899' }
  ]

  return (
    <header className="header">
      {isMobile && (
        <button 
          className="btn btn--icon tooltip"
          onClick={onMenuToggle}
          data-tooltip="Open Menu"
        >
          <Menu size={20} />
        </button>
      )}
      
      <div className="header__logo">
        <span style={{ fontSize: '24px' }}>✨</span>
        <span>Fabric Studio</span>
        <span style={{ 
          fontSize: '10px', 
          background: var(--gradient-orange),
          color: 'white',
          padding: '2px 6px',
          borderRadius: '8px',
          marginLeft: '8px',
          fontWeight: 'bold'
        }}>PRO</span>
      </div>
      
      <nav className="header__nav">
        {modes.map(mode => {
          const Icon = mode.icon
          return (
            <button
              key={mode.id}
              className={`btn ${appMode === mode.id ? 'btn--selected' : ''}`}
              onClick={() => onModeChange(mode.id)}
              style={appMode === mode.id ? { 
                background: `linear-gradient(135deg, ${mode.color}, ${mode.color}dd)`,
                color: 'white',
                borderColor: mode.color
              } : {}}
            >
              <Icon size={16} />
              {!isMobile && mode.label}
            </button>
          )
        })}
      </nav>
      
      <div className="header__spacer" />
      
      <div className="header__actions">
        {/* Creative Tools */}
        <button 
          className={`btn btn--icon tooltip ${showGridGuides ? 'btn--selected' : ''}`}
          onClick={onGridToggle}
          data-tooltip="Toggle Grid Guides"
        >
          <Grid size={16} />
        </button>
        
        {/* Standard Actions */}
        <button className="btn btn--icon tooltip" data-tooltip="Undo (Ctrl+Z)">
          <Undo size={16} />
        </button>
        <button className="btn btn--icon tooltip" data-tooltip="Redo (Ctrl+Y)">
          <Redo size={16} />
        </button>
        
        {/* Export Actions */}
        <div className="header__export-group">
          <button className="btn btn--secondary" title="Save Project">
            <Save size={16} />
            {!isMobile && 'Save'}
          </button>
          <button className="btn btn--primary" title="Export Design">
            <Download size={16} />
            {!isMobile && 'Export'}
          </button>
        </div>
      </div>
    </header>
  )
}

export default CreativeHeader