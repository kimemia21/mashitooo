import React from 'react'
import { 
  MousePointer, 
  Move, 
  RotateCw, 
  Maximize2, 
  Edit3,
  Copy,
  Trash2
} from 'lucide-react'

function Toolbar({ 
  selectedTool, 
  onToolChange, 
  vertical = false,
  showLabels = false 
}) {
  const tools = [
    { id: 'SELECT', label: 'Select', icon: MousePointer },
    { id: 'MOVE', label: 'Move', icon: Move },
    { id: 'ROTATE', label: 'Rotate', icon: RotateCw },
    { id: 'SCALE', label: 'Scale', icon: Maximize2 },
    { id: 'EDIT', label: 'Edit', icon: Edit3 },
    { id: 'COPY', label: 'Copy', icon: Copy },
    { id: 'DELETE', label: 'Delete', icon: Trash2 }
  ]

  return (
    <div className={`toolbar ${vertical ? 'toolbar--vertical' : ''}`}>
      {tools.map(tool => {
        const Icon = tool.icon
        const isSelected = selectedTool === tool.id
        
        return (
          <button
            key={tool.id}
            className={`btn btn--icon ${isSelected ? 'btn--selected' : ''}`}
            onClick={() => onToolChange(tool.id)}
            title={tool.label}
          >
            <Icon size={16} />
            {showLabels && <span>{tool.label}</span>}
          </button>
        )
      })}
    </div>
  )
}

export default Toolbar