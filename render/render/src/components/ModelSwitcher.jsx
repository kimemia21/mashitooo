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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Dynamically discover all .glb files in a category folder
  useEffect(() => {
    const discoverModels = async () => {
      const modelsMap = {};

      for (const category of CATEGORIES) {
        try {
          // Fetch the directory listing (you'll need to implement this based on your setup)
          // For demo purposes, this simulates discovering files
          const models = await fetchModelsInFolder(category.id);
          modelsMap[category.id] = models;
        } catch (error) {
          console.error(`Error loading models for ${category.id}:`, error);
          modelsMap[category.id] = [];
        }
      }

      setAvailableModels(modelsMap);
    };

    discoverModels();
  }, []);

  // Simulated function to fetch models - replace with actual implementation
  const fetchModelsInFolder = async (categoryId) => {
    // In a real implementation, you'd need a backend endpoint that lists files
    // Or use a manifest file that gets auto-generated
    // For now, this is a placeholder that would work with your actual file structure
    
    try {
      // Try to fetch a manifest.json for each category
      const response = await fetch(`/models/${categoryId}/manifest.json`);
      if (response.ok) {
        const data = await response.json();
        return data.files.map(file => ({
          name: file.replace('.glb', ''),
          path: `/models/${categoryId}/${file}`
        }));
      }
    } catch (error) {
      // Fallback: return empty array if manifest doesn't exist
      console.warn(`No manifest found for ${categoryId}`);
    }
    
    return [];
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category.id);
    setSelectedModel(null);
    setIsDropdownOpen(false);
  };

  const handleModelSelect = (model) => {
    setSelectedModel(model);
    setIsDropdownOpen(false);
    onModelChange(selectedCategory, model.path);
  };

  const currentCategoryModels = selectedCategory ? availableModels[selectedCategory] || [] : [];

  return (
    <div
      className="w-full flex flex-col gap-4 p-4 rounded-2xl border border-white/10 backdrop-blur-2xl bg-black/60 shadow-[0_0_25px_rgba(0,0,0,0.6)]"
      style={{ fontFamily: '"Helvetica Neue", Arial, sans-serif' }}
    >
      <div className="text-center mb-1">
        <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-light">
          Select Category
        </p>
        <div className="w-12 h-[1px] mx-auto mt-2 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      </div>

      {/* Category Selection */}
      {CATEGORIES.map((category) => {
        const isActive = selectedCategory === category.id;
        return (
          <button
            key={category.id}
            onClick={() => handleCategorySelect(category)}
            className={`relative group flex items-center justify-between gap-4 px-4 py-3 rounded-xl border transition-all duration-300
              ${
                isActive
                  ? "bg-white/10 border-white/30 scale-[1.02] shadow-[0_0_25px_rgba(255,255,255,0.05)]"
                  : "bg-transparent border-white/10 hover:bg-white/5 hover:border-white/20 hover:scale-[1.01]"
              }`}
          >
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-md overflow-hidden bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center">
                <img
                  src={category.img}
                  alt={category.label}
                  className="w-full h-full object-contain opacity-100 transition-opacity duration-200"
                  style={{ imageRendering: "auto" }}
                />
              </div>

              <span
                className={`text-sm tracking-wide ${
                  isActive ? "text-white font-medium" : "text-gray-300 font-light"
                }`}
              >
                {category.label}
              </span>
            </div>

            {isActive && <span className="text-xs text-emerald-400 opacity-90">●</span>}

            <div
              className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"
              style={{
                background:
                  "radial-gradient(circle at center, rgba(255,255,255,0.12), transparent 70%)",
              }}
            />
          </button>
        );
      })}

      {/* Model Dropdown */}
      {selectedCategory && currentCategoryModels.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="text-center mb-3">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-light">
              Select Model
            </p>
            <div className="w-12 h-[1px] mx-auto mt-2 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          </div>

          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 transition-all duration-300 flex items-center justify-between"
            >
              <span className="text-sm text-gray-300">
                {selectedModel ? selectedModel.name : "Choose a model..."}
              </span>
              <span className={`text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 max-h-48 overflow-y-auto rounded-xl border border-white/20 bg-black/90 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.8)] z-50">
                {currentCategoryModels.map((model, index) => (
                  <button
                    key={index}
                    onClick={() => handleModelSelect(model)}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-white/10 transition-colors duration-200 first:rounded-t-xl last:rounded-b-xl"
                  >
                    {model.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {selectedCategory && currentCategoryModels.length === 0 && (
        <div className="mt-4 pt-4 border-t border-white/10 text-center">
          <p className="text-xs text-gray-500">No models found in this category</p>
        </div>
      )}
    </div>
  );
};

export default ModelSwitcher;