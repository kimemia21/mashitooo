# 🚀 Quick Start Guide

## Installation & Setup

```bash
cd render
npm install
```

## Development Mode

```bash
# Start Vite dev server (hot reload, fast)
npm run dev
# Visit: http://localhost:3000
```

## Production Mode

```bash
# Build and start Express server
npm start
# Visit: http://localhost:5001
```

## What You'll See

✅ **3D Viewer**: A colored cube placeholder (until you add a real .glb model)
✅ **Color Picker**: Interactive color selector with presets
✅ **Orbit Controls**: Mouse controls for zoom, pan, rotate
✅ **Professional Lighting**: Ambient + directional + point lights
✅ **iframe Ready**: Works in Flutter WebViews

## Adding Your T-Shirt Model

1. Get a `.glb` file (from Sketchfab, Blender export, etc.)
2. Place it at: `public/models/tshirt.glb`
3. Restart the app - your model will appear instead of the cube

## Testing iframe Compatibility

```html
<!-- Test in any HTML page -->
<iframe 
  src="http://localhost:5001" 
  width="800" 
  height="600"
  frameborder="0">
</iframe>
```

## Deployment Ready

- ✅ Static file serving
- ✅ Single-page app routing
- ✅ Optimized build
- ✅ No external CDN dependencies
- ✅ WebView compatible

The app is now ready for Flutter iframe integration! 🎉