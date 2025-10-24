import React, { useState, useEffect } from "react";

// Only hardcoded part - category definitions
const CATEGORIES = [
  {
    id: "hoodies",
    label: "Hoodie",
    img: "https://upload.wikimedia.org/wikipedia/commons/5/51/Wip-hoodie.png",
  },
  {
    id: "t-shirts",
    label: "T-Shirt",
    img: "https://upload.wikimedia.org/wikipedia/commons/f/f9/T-shirt_silhouette.svg",
  },
  {
    id: "beanie",
    label: "Beanie",
    img: "https://upload.wikimedia.org/wikipedia/commons/6/64/Baseball_cap.png",
  },
  {
    id: "shirts",
    label: "Shirt",
    img: "https://upload.wikimedia.org/wikipedia/commons/f/fd/Black_t-shirt_icon.png",
  },
  {
    id: "caps",
    label: "Cap",
    img: "https://upload.wikimedia.org/wikipedia/commons/6/64/Baseball_cap.png",
  },
];

const ModelSwitcher = ({ currentModel, onModelChange }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [availableModels, setAvailableModels] = useState({});
  const [selectedModel, setSelectedModel] = useState(null);
  const [isHovered, setIsHovered] = useState(false)

  // Automatically discover all .glb files using Vite's import.meta.glob
  useEffect(() => {
    const discoverModels = () => {
      const modelsMap = {};

      const hoodieFiles = import.meta.glob('/public/models/hoodies/*.glb', { eager: true, query: '?url', import: 'default' });
      const tshirtFiles = import.meta.glob('/public/models/t-shirts/*.glb', { eager: true, query: '?url', import: 'default' });
      const beanieFiles = import.meta.glob('/public/models/beanie/*.glb', { eager: true, query: '?url', import: 'default' });
      const shirtFiles = import.meta.glob('/public/models/shirts/*.glb', { eager: true, query: '?url', import: 'default' });
      const capFiles = import.meta.glob('/public/models/caps/*.glb', { eager: true, query: '?url', import: 'default' });

      console.log('🔍 Discovered files:', { hoodieFiles, tshirtFiles, beanieFiles, shirtFiles, capFiles });

      const parseFiles = (files) => {
        return Object.entries(files).map(([path, url]) => {
          const fileName = path.split('/').pop().replace('.glb', '');
          const displayName = fileName
            .replace(/[-_]/g, ' ')
            .replace(/\b\w/g, char => char.toUpperCase());
          
          return {
            name: displayName,
            path: url,
            fileName: fileName
          };
        });
      };

      modelsMap['hoodies'] = parseFiles(hoodieFiles);
      modelsMap['t-shirts'] = parseFiles(tshirtFiles);
      modelsMap['beanie'] = parseFiles(beanieFiles);
      modelsMap['shirts'] = parseFiles(shirtFiles);
      modelsMap['caps'] = parseFiles(capFiles);

      setAvailableModels(modelsMap);
    };

    discoverModels();
  }, []);

  const handleCategorySelect = (category) => {
    setSelectedCategory(selectedCategory === category.id ? null : category.id);
    setSelectedModel(null);
  };

  const handleModelSelect = (model) => {
    setSelectedModel(model);
    onModelChange(selectedCategory, model.path);
  };

  return (
    <div 
      className="w-full h-full flex flex-col text-[13px]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ 
        fontFamily: '"Helvetica Neue", Arial, sans-serif',
        background: 'rgba(26, 26, 26, 0.9)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: isHovered ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        transition: 'all 0.3s ease',
        boxShadow: isHovered 
          ? '0 8px 32px rgba(0, 0, 0, 0.6)' 
          : '0 4px 16px rgba(0, 0, 0, 0.4)'
      }}
    >
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
        backdropFilter: 'blur(8px)',
        borderTopLeftRadius: '8px',
        borderTopRightRadius: '8px'
      }}>
        <div style={{
          fontSize: '11px',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: isHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
          fontWeight: '400',
          fontFamily: '"Helvetica Neue", Arial, sans-serif',
          textShadow: '0 1px 4px rgba(0, 0, 0, 0.3)',
          transition: 'color 0.3s ease'
        }}>
          Models
        </div>
      </div>

      {/* Categories List */}
      <div className="flex-1 overflow-y-auto">
        {CATEGORIES.map((category) => {
          const models = availableModels[category.id] || [];
          const isExpanded = selectedCategory === category.id;
          const hasModels = models.length > 0;

          return (
            <div key={category.id} className="border-b border-[#333]">
              {/* Category Header */}
              <button
                onClick={() => handleCategorySelect(category)}
                disabled={!hasModels}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: isExpanded 
                    ? 'rgba(255, 255, 255, 0.1)' 
                    : 'transparent',
                  border: 'none',
                  cursor: hasModels ? 'pointer' : 'not-allowed',
                  opacity: !hasModels ? 0.4 : 1,
                  transition: 'all 0.3s ease',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  fontFamily: '"Helvetica Neue", Arial, sans-serif'
                }}
                onMouseEnter={(e) => {
                  if (hasModels) {
                    e.target.style.background = 'rgba(255, 255, 255, 0.08)'
                    e.target.style.backdropFilter = 'blur(8px)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (hasModels) {
                    e.target.style.background = isExpanded ? 'rgba(255, 255, 255, 0.1)' : 'transparent'
                    e.target.style.backdropFilter = 'none'
                  }
                }}
              >
                <span style={{
                  color: 'rgba(255, 255, 255, 0.6)',
                  transition: 'transform 0.3s ease',
                  fontSize: '10px',
                  transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)'
                }}>
                  ▶
                </span>
                <div style={{
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0.6
                }}>
                  <img src={category.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <span style={{
                  flex: 1,
                  textAlign: 'left',
                  color: isHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.8)',
                  fontSize: '13px',
                  fontWeight: '400',
                  letterSpacing: '0.01em',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                  transition: 'color 0.3s ease'
                }}>
                  {category.label}
                </span>
                <span style={{
                  fontSize: '10px',
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontFamily: '"Helvetica Neue", Arial, sans-serif'
                }}>
                  {models.length}
                </span>
              </button>

              {/* Models List */}
              {isExpanded && hasModels && (
                <div style={{
                  background: 'rgba(16, 16, 16, 0.8)',
                  backdropFilter: 'blur(8px)'
                }}>
                  {models.map((model, index) => {
                    const isSelected = selectedModel?.fileName === model.fileName;
                    
                    return (
                      <button
                        key={index}
                        onClick={() => handleModelSelect(model)}
                        style={{
                          width: '100%',
                          padding: '8px 16px 8px 40px',
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          transition: 'all 0.3s ease',
                          background: isSelected 
                            ? 'linear-gradient(to right, rgba(86, 128, 194, 0.3), rgba(86, 128, 194, 0.1))' 
                            : 'transparent',
                          color: isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
                          border: 'none',
                          cursor: 'pointer',
                          borderLeft: isSelected ? '3px solid #5680c2' : '3px solid transparent',
                          fontFamily: '"Helvetica Neue", Arial, sans-serif',
                          backdropFilter: isSelected ? 'blur(8px)' : 'none'
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.target.style.background = 'rgba(255, 255, 255, 0.05)'
                            e.target.style.color = 'rgba(255, 255, 255, 0.9)'
                            e.target.style.backdropFilter = 'blur(4px)'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.target.style.background = 'transparent'
                            e.target.style.color = 'rgba(255, 255, 255, 0.7)'
                            e.target.style.backdropFilter = 'none'
                          }
                        }}
                      >
                        <span style={{
                          fontSize: '10px',
                          opacity: 0.5,
                          color: 'rgba(255, 255, 255, 0.5)'
                        }}>—</span>
                        <span style={{
                          flex: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          fontSize: '12px',
                          fontWeight: '300',
                          letterSpacing: '0.01em'
                        }}>{model.name}</span>
                        {isSelected && (
                          <div style={{
                            width: '4px',
                            height: '4px',
                            borderRadius: '50%',
                            background: '#5680c2',
                            boxShadow: '0 0 8px rgba(86, 128, 194, 0.5)'
                          }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Empty State */}
              {isExpanded && !hasModels && (
                <div style={{
                  padding: '12px 16px 12px 40px',
                  fontSize: '11px',
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontStyle: 'italic',
                  fontFamily: '"Helvetica Neue", Arial, sans-serif',
                  background: 'rgba(16, 16, 16, 0.5)'
                }}>
                  No models found
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer - Selected Model Info */}
      {selectedModel && (
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03))',
          backdropFilter: 'blur(8px)',
          borderBottomLeftRadius: '8px',
          borderBottomRightRadius: '8px'
        }}>
          <div style={{
            fontSize: '10px',
            color: 'rgba(255, 255, 255, 0.6)',
            marginBottom: '4px',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontFamily: '"Helvetica Neue", Arial, sans-serif'
          }}>SELECTED</div>
          <div style={{
            fontSize: '11px',
            color: isHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.9)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontWeight: '400',
            letterSpacing: '0.01em',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
            transition: 'color 0.3s ease',
            fontFamily: '"Helvetica Neue", Arial, sans-serif'
          }}>{selectedModel.name}</div>
        </div>
      )}
    </div>
  );
};

export default ModelSwitcher;