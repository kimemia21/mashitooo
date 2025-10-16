// src/components/ModelSwitcher.jsx
import React from 'react'
import { Shirt, Coat, Mountain } from 'lucide-react'

const ModelSwitcher = ({ models, activeModel, onChange }) => {
  return (
    <div
      className="model-switcher"
      style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        display: 'flex',
        gap: '10px',
        zIndex: 200,
        background: 'rgba(25,25,25,0.7)',
        padding: '8px 12px',
        borderRadius: '12px',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
      }}
    >
      {models.map((model) => (
        <button
          key={model.id}
          onClick={() => onChange(model.id)}
          style={{
            background:
              activeModel === model.id
                ? 'linear-gradient(145deg, #5b9dff, #0042ff)'
                : 'transparent',
            border: 'none',
            color: '#fff',
            borderRadius: '8px',
            padding: '8px 10px',
            cursor: 'pointer',
            transition: '0.3s all ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title={model.name}
        >
          {model.icon === 'shirt' && <Shirt size={18} />}
          {model.icon === 'hoodie' && <Coat size={18} />}
          {model.icon === 'ski' && <Mountain size={18} />}
        </button>
      ))}
    </div>
  )
}

export default ModelSwitcher
