# 3D T-Shirt Viewer

A minimal full-stack application for displaying and customizing 3D t-shirt models using React Three Fiber.

## Features

- 3D t-shirt model display with React Three Fiber
- Interactive color picker with preset colors
- Orbit controls (zoom, pan, rotate)
- Responsive design
- iframe/WebView compatible
- Express server for static file serving

## Tech Stack

- **Backend:** Node.js + Express
- **Frontend:** React + Vite
- **3D:** @react-three/fiber + @react-three/drei + Three.js

## Setup & Installation

1. **Install dependencies:**
   ```bash
   cd render
   npm install
   ```

2. **Add your t-shirt model:**
   - Place a `.glb` file at `public/models/oversized_t-shirt.glb`
   - See `public/models/README.md` for model requirements

## Development

**Option 1: Development mode (recommended for development)**
```bash
# Terminal 1 - Start Vite dev server
npm run dev

# Terminal 2 - Start Express server (optional, for testing production setup)
npm run server
```

**Option 2: Production mode**
```bash
# Build and start production server
npm start
```

## URLs

- **Development:** http://localhost:3000 (Vite dev server)
- **Production:** http://localhost:5001 (Express server)

## Project Structure

```
render/
├── public/
│   └── models/
│       └── tshirt.glb          # Your 3D model goes here
├── src/
│   ├── components/
│   │   ├── TShirtModel.jsx     # 3D model component
│   │   └── ColorPicker.jsx     # Color selection UI
│   ├── App.jsx                 # Main app component
│   └── main.jsx               # React entry point
├── server.js                   # Express server
├── vite.config.js             # Vite configuration
└── package.json               # Dependencies and scripts
```

## Features Details

### 3D Model Display
- Loads GLB models from `/public/models/tshirt.glb`
- Fallback colored cube if no model found
- Automatic centering and lighting

### Color Customization
- Color picker input
- 8 preset colors
- Real-time material color updates

### Controls
- Mouse orbit controls
- Zoom in/out with scroll
- Pan with right-click drag

### iframe Compatibility
- Designed to work in Flutter WebViews
- No external dependencies that might block in iframes
- Minimal, clean interface

## Deployment

For production deployment:

1. Build the React app: `npm run build`
2. Start the Express server: `npm run server`
3. The server will serve the built React app and static files

The app is designed to work seamlessly in iframes and WebViews for integration with Flutter apps.