import React from 'react'
import { 
  Menu, Save, Download, Upload, Undo, Redo, 
  Palette, Grid, Eye, Sparkles, Settings, Heart,
  Layers, Brush, Scissors, Zap
} from 'lucide-react'

function ArtisticHeader({ 
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
    { 
      id: 'DESIGN', 
      label: 'Design', 
      icon: Palette, 
      description: 'Create and edit designs'
    },
    { 
      id: 'PREVIEW', 
      label: 'Preview', 
      icon: Eye, 
      description: 'Preview your work'
    },
    { 
      id: 'LAYERS', 
      label: 'Layers', 
      icon: Layers, 
      description: 'Manage design layers'
    },
    { 
      id: 'EXPORT', 
      label: 'Export', 
      icon: Download, 
      description: 'Export your design'
    }
  ]

  return (
    <header className="refined-header">
        {/* Mobile menu button */}
        {isMobile && (
          <button 
            className="btn btn--icon tooltip artistic-float"
            onClick={onMenuToggle}
            data-tooltip="Open Creative Menu"
          >
            <Menu size={20} />
          </button>
        )}
        
        {/* Refined Brand */}
        <div className="header__brand">
          <div className="brand__logo">F</div>
          <div className="brand__text">
            <h1 className="brand__title">Fabric Studio</h1>
            <span className="brand__subtitle">Professional Edition</span>
          </div>
        </div>
        
        {/* Professional Navigation */}
        <nav className="header__nav">
          {modes.map((mode) => {
            const Icon = mode.icon
            const isActive = appMode === mode.id
            return (
              <button
                key={mode.id}
                className={`nav__item ${isActive ? 'nav__item--active' : ''} tooltip`}
                onClick={() => onModeChange(mode.id)}
                data-tooltip={mode.description}
              >
                <Icon size={16} />
                <span>{mode.label}</span>
              </button>
            )
          })}
        </nav>
        
        {/* Spacer for layout */}
        <div className="artistic-header__spacer" />
        
        {/* Professional Tools */}
        <div className="header__actions">
          <div className="header__group">
            <button 
              className={`btn btn--icon tooltip ${showGridGuides ? 'btn--selected' : ''}`}
              onClick={onGridToggle}
              data-tooltip="Toggle Grid"
            >
              <Grid size={16} />
            </button>
            
            <button className="btn btn--icon tooltip" data-tooltip="Undo">
              <Undo size={16} />
            </button>
            
            <button className="btn btn--icon tooltip" data-tooltip="Redo">
              <Redo size={16} />
            </button>
          </div>
          
          <div className="header__group">
            <button className="btn btn--secondary tooltip" data-tooltip="Save Project">
              <Save size={16} />
              {!isMobile && <span>Save</span>}
            </button>
            
            <button className="btn btn--primary tooltip" data-tooltip="Export Design">
              <Download size={16} />
              {!isMobile && <span>Export</span>}
            </button>
          </div>
        </div>
      </div>
      
      {/* Artistic bottom glow */}
      <div className="artistic-header__glow"></div>
    </header>
  )
}

export default ArtisticHeader