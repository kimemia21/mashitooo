// Instructions.jsx (New component)
import React from 'react'

export function Instructions() {
  return (
    <div className="absolute top-4 left-4 z-10 p-4 bg-gray-800 bg-opacity-80 rounded-lg shadow-2xl border-l-4 border-teal-500 max-w-sm font-sans pointer-events-none">
      <h3 className="text-lg font-bold mb-2 text-teal-400">Quick Start: 3D View Controls 🖱️</h3>
      <ul className="text-sm space-y-2 text-gray-300">
        <li className="flex items-center">
          <span className="w-16 font-semibold text-gray-200">Rotate:</span>
          <span className="ml-2">Click & Drag (Mouse) or One Finger Drag (Touch)</span>
        </li>
        <li className="flex items-center">
          <span className="w-16 font-semibold text-gray-200">Zoom:</span>
          <span className="ml-2">Scroll Wheel (Mouse) or Pinch (Touch)</span>
        </li>
        <li className="flex items-center">
          <span className="w-16 font-semibold text-gray-200">Nudge:</span>
          <span className="ml-2">Arrow Keys (Up/Down/Left/Right)</span>
        </li>
      </ul>
      <p className="mt-3 text-xs text-gray-400 border-t border-gray-700 pt-2">
        Customize fabric color and stickers in the **Design Tools** sidebar.
      </p>
    </div>
  )
}
// Remember to import and conditionally render this in DesignAppLayout.jsx