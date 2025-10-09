# 3D Product Customization Platform

A real-time 3D product customization platform built with Flutter (frontend) and Node.js (backend) that allows users to customize t-shirts, hoodies, mugs, and caps with 3D preview.

## Features

- **Real-time 3D Preview**: View products in 3D with realistic lighting
- **Product Customization**: 
  - Change base colors
  - Add custom stickers/images
  - Add text with various fonts and sizes
- **Real-time Collaboration**: WebSocket-based real-time updates
- **High-Quality Rendering**: Export customized designs
- **Multiple Product Types**: Support for various 3D models

## Architecture

- **Frontend**: Flutter with 3D viewer and real-time UI
- **Backend**: Node.js with Express, Socket.IO, and Three.js
- **Communication**: WebSocket for real-time updates, REST API for operations
- **3D Models**: GLB format loaded from server assets

## Quick Start

### Prerequisites

- Flutter SDK (latest stable)
- Node.js (v16 or higher)
- Modern web browser

### 1. Start the Backend Server

```bash
cd server
npm install
npm start
```

The server will start on `http://localhost:3000`

### 2. Start the Flutter App

```bash
flutter pub get
flutter run -d chrome --web-port 8080
```

The app will be available at `http://localhost:8080`

## Project Structure

```
├── lib/                    # Flutter application
│   ├── models/            # Data models
│   ├── services/          # API and WebSocket services
│   ├── screens/           # UI screens
│   ├── widgets/           # Reusable widgets
│   └── main.dart          # App entry point
├── server/                # Node.js backend
│   ├── assets/           # 3D model files (.glb)
│   ├── uploads/          # User uploaded files
│   ├── outputs/          # Rendered textures
│   ├── utils/            # Utility classes
│   ├── renderer/         # 3D rendering logic
│   └── server.js         # Server entry point
└── assets/               # Flutter assets
    └── 3d/              # 3D models for Flutter
```

## Adding 3D Models

1. Place your `.glb` files in the `server/assets/` directory
2. The server automatically detects and loads models on startup
3. Supported naming conventions:
   - `tshirt.glb` → T-shirt product
   - `hoodie.glb` → Hoodie product
   - `mug.glb` → Mug product
   - `cap.glb` → Cap product

## API Endpoints

### Projects
- `POST /api/project/create` - Create new project
- `GET /api/project/:id` - Get project details
- `PUT /api/project/:id/color` - Update project color

### Customization
- `POST /api/sticker/upload` - Upload sticker file
- `POST /api/project/:id/sticker` - Add sticker to project
- `POST /api/project/:id/text` - Add text to project
- `POST /api/project/:id/render` - Render final texture

### Assets
- `GET /api/models` - Get available 3D models

## WebSocket Events

### Client → Server
- `join:project` - Join project room
- `design:transform` - Send element transformations

### Server → Client
- `project:created` - Project creation notification
- `design:update` - Design state changes
- `color:changed` - Color update
- `render:complete` - Render completion
- `element:transformed` - Element transformation

## Current Status

✅ **Completed Features:**
- Node.js server with Express and Socket.IO
- 3D model loading system
- Flutter UI with product catalog
- Design editor with tabs (Color, Stickers, Text, Preview)
- WebSocket real-time communication
- File upload for stickers
- Text customization
- Color picker
- Basic rendering system

🚧 **In Progress:**
- Canvas-based texture generation (simplified version active)
- Advanced 3D transformations
- Multiple view angles
- Enhanced error handling

🔜 **Coming Next:**
- Real 3D model rendering with Three.js
- Advanced color picker
- Design templates
- Export functionality
- User authentication
- Design saving/loading

## Development Notes

### Server Dependencies
- All core dependencies installed except `canvas` (requires native compilation)
- Using simplified texture generation for now
- WebSocket server running and functional

### Flutter Dependencies
- All Flutter packages successfully installed
- 3D viewer integration ready
- Provider state management active

### Testing
1. Server runs on port 3000 ✅
2. Flutter app launches on Chrome ✅
3. WebSocket connection established ✅
4. API endpoints responding ✅

## Troubleshooting

### Server Issues
- If canvas installation fails, the app runs with simplified rendering
- Check Node.js version (requires v16+)
- Ensure port 3000 is available

### Flutter Issues
- Run `flutter doctor` to check setup
- Use Chrome for web development
- Check Flutter channel (stable recommended)

### 3D Models
- Ensure GLB files are properly formatted
- Place models in `server/assets/` directory
- Restart server after adding new models

## Next Steps

1. **Test the complete workflow**:
   - Create a project
   - Add stickers and text
   - Change colors
   - Generate renders

2. **Add sample content**:
   - Download sample GLB models
   - Add test images for stickers

3. **Enhance rendering**:
   - Implement full canvas support
   - Add multiple view angles

4. **Production deployment**:
   - Add environment configuration
   - Implement security measures
   - Add proper error handling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.