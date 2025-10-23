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
      className="w-full h-full bg-[#1e1e1e] border-l border-[#333] flex flex-col text-[13px]"
      style={{ fontFamily: '"SF Mono", "Consolas", "Monaco", monospace' }}
    >
      {/* Header */}
      <div className="px-3 py-2 border-b border-[#333] bg-[#252526]">
        <div className="text-[11px] uppercase tracking-wider text-gray-400 font-medium">
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
                className={`w-full px-3 py-2 flex items-center gap-2 hover:bg-[#2a2a2a] transition-colors ${
                  !hasModels ? 'opacity-40 cursor-not-allowed' : ''
                } ${isExpanded ? 'bg-[#2a2a2a]' : ''}`}
              >
                <span className={`text-gray-400 transition-transform text-[10px] ${isExpanded ? 'rotate-90' : ''}`}>
                  ▶
                </span>
                <div className="w-5 h-5 flex items-center justify-center opacity-60">
                  <img src={category.img} alt="" className="w-full h-full object-contain" />
                </div>
                <span className="flex-1 text-left text-gray-300">{category.label}</span>
                <span className="text-[10px] text-gray-600">
                  {models.length}
                </span>
              </button>

              {/* Models List */}
              {isExpanded && hasModels && (
                <div className="bg-[#1e1e1e]">
                  {models.map((model, index) => {
                    const isSelected = selectedModel?.fileName === model.fileName;
                    
                    return (
                      <button
                        key={index}
                        onClick={() => handleModelSelect(model)}
                        className={`w-full px-3 py-1.5 pl-10 text-left flex items-center gap-2 transition-colors ${
                          isSelected 
                            ? 'bg-[#094771] text-white' 
                            : 'text-gray-400 hover:bg-[#2a2a2a] hover:text-gray-300'
                        }`}
                      >
                        <span className="text-[10px] opacity-50">—</span>
                        <span className="flex-1 truncate text-[12px]">{model.name}</span>
                        {isSelected && (
                          <div className="w-1 h-1 rounded-full bg-blue-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Empty State */}
              {isExpanded && !hasModels && (
                <div className="px-3 py-2 pl-10 text-[11px] text-gray-600 italic">
                  No models found
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer - Selected Model Info */}
      {selectedModel && (
        <div className="px-3 py-2 border-t border-[#333] bg-[#252526]">
          <div className="text-[10px] text-gray-500 mb-0.5">SELECTED</div>
          <div className="text-[11px] text-gray-300 truncate">{selectedModel.name}</div>
        </div>
      )}
    </div>
  );
};

export default ModelSwitcher;