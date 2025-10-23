import React from "react";
import { ModelType } from "../enums/AppEnums";

const ModelSwitcher = ({ currentModel, onModelChange }) => {
  const models = [
    {
      type: ModelType.HOODIE,
      label: "Hoodie",
      img: "https://upload.wikimedia.org/wikipedia/commons/5/51/Wip-hoodie.png",
      path: "/models/uploads_files_6392619_Hoodie.glb",
    },
    {
      type: ModelType.TSHIRT,
      label: "T-Shirt",
      img: "https://upload.wikimedia.org/wikipedia/commons/f/f9/T-shirt_silhouette.svg",
      path: "/models/uploads_files_6392619_Hoodie.glb",
    },
    {
      type: ModelType.SHIRT,
      label: "Shirt",
      img: "https://upload.wikimedia.org/wikipedia/commons/f/fd/Black_t-shirt_icon.png",
      path: "/models/uploads_files_6392619_Hoodie.glb",
    },
    {
      type: ModelType.CAP,
      label: "Cap",
      img: "https://upload.wikimedia.org/wikipedia/commons/6/64/Baseball_cap.png",
      path: "/models/uploads_files_6392619_Hoodie.glb",
    },
  ];

  return (
    <div
      className="w-full flex flex-col gap-4 p-4 rounded-2xl border border-white/10 backdrop-blur-2xl bg-black/60 shadow-[0_0_25px_rgba(0,0,0,0.6)]"
      style={{ fontFamily: '"Helvetica Neue", Arial, sans-serif' }}
    >
      <div className="text-center mb-1">
        <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-light">
          Select Model
        </p>
        <div className="w-12 h-[1px] mx-auto mt-2 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      </div>

      {models.map((model) => {
        const isActive = currentModel === model.type;
        return (
          <button
            key={model.type}
            onClick={() => onModelChange(model.type, model.path)}
            className={`relative group flex items-center justify-between gap-4 px-4 py-3 rounded-xl border transition-all duration-300
              ${
                isActive
                  ? "bg-white/10 border-white/30 scale-[1.02] shadow-[0_0_25px_rgba(255,255,255,0.05)]"
                  : "bg-transparent border-white/10 hover:bg-white/5 hover:border-white/20 hover:scale-[1.01]"
              }`}
          >
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-md overflow-hidden bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center">
                {/* keep images sharp (no blur) */}
                <img
                  src={model.img}
                  alt={model.label}
                  className="w-full h-full object-contain opacity-100 transition-opacity duration-200"
                  style={{ imageRendering: "auto" }}
                />
              </div>

              <span
                className={`text-sm tracking-wide ${
                  isActive ? "text-white font-medium" : "text-gray-300 font-light"
                }`}
              >
                {model.label}
              </span>
            </div>

            {isActive && <span className="text-xs text-emerald-400 opacity-90">●</span>}

            {/* Hover glow overlay */}
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
    </div>
  );
};

export default ModelSwitcher;
