# 3D Product Customization Platform - Development Instructions

## Project Overview
Build a real-time 3D product customization platform where users can edit t-shirts, hoodies, mugs, and caps with a realistic 3D preview. The architecture splits responsibilities between Flutter (UI/UX and product catalog) and a web-based 3D editor (rendering and manipulation).

## Architecture Requirements
## use updated packages we are in 2025 ou can interacte with other folders but flutter create ais already done by me 
## in flutter just create or handle the files in the lib coz i have already run the flutter create so all the core flutter code is present just just deal with the code in lib if needd y
### Frontend: Flutter Application
- **Responsibility**: Main application UI, product catalog, user navigation, order management
- **3D Integration**: Load and display 3D models (.glb format) for product preview
- **Communication**: WebSocket client to receive real-time updates from the 3D editor
- **Embedding**: Display the 3D editor via WebView/iframe integration

### Backend: Node.js 3D Editor Service
- **Responsibility**: 3D model rendering, texture manipulation, sticker placement, text overlay
- **Technology Stack**: Three.js or Babylon.js for 3D rendering
- **Communication**: WebSocket server for bidirectional real-time communication with Flutter
- **Output**: Render updates and broadcast state changes to Flutter client

## Core Features to Implement

### 1. 3D Model Management
- Load base 3D models (.glb) for different products (t-shirts, hoodies, mugs, caps)
- Support model rotation, zoom, and pan controls
- Implement realistic lighting and material properties
- Enable texture mapping on product surfaces

### 2. Customization Tools
- **Sticker System**:
  - Upload and place custom stickers/images on the 3D model
  - Drag, resize, rotate stickers on the product surface
  - Support multiple stickers with layering/z-index control
  - Snap-to-surface functionality for realistic placement

- **Text Editor**:
  - Add custom text with font selection
  - Text color, size, and style customization
  - 3D text placement with surface wrapping
  - Real-time text preview on the model

- **Design Tools**:
  - Color picker for product base color
  - Pattern/texture overlays
  - Undo/redo functionality
  - Design save and load capabilities

### 3. Real-Time Communication (WebSocket)
- **State Synchronization**:
  - Broadcast every design change from Node.js to Flutter
  - Send transformation data (position, rotation, scale) for all elements
  - Transmit color/texture updates instantly
  - Push render completion notifications

- **Events to Implement**:
  - `design:update` - Design state changes
  - `sticker:added` - New sticker placed
  - `sticker:transformed` - Sticker moved/resized/rotated
  - `text:updated` - Text content or style changed
  - `color:changed` - Product color modified
  - `render:complete` - Final render ready
  - `model:loaded` - 3D model initialization complete

### 4. Rendering Pipeline
- High-quality final render generation
- Export options: PNG, JPEG with transparency support
- Multiple view angles (front, back, side views)
- Print-ready file generation (high DPI)

## Technical Implementation Details

### Node.js Service Structure
```
/server
  /assets        - **3D model files (.glb) - LOAD ALL MODELS FROM HERE**
  /textures      - Texture and pattern files
  /uploads       - User-uploaded stickers
  /renderer      - Three.js/Babylon.js rendering engine
  /sockets       - WebSocket connection handlers
  /controllers   - Business logic for customization
  /utils         - Helper functions (image processing, etc.)
```

**IMPORTANT**: All .glb 3D model files should be placed in the `/assets` folder. The application must load models from this directory.

### Flutter Application Structure
```
/lib
  /models        - Data models (Product, Design, Sticker)
  /screens       - UI screens (Catalog, Editor, Preview)
  /widgets       - Reusable widgets (Product card, Editor toolbar)
  /services      - WebSocket client, API calls
  /controllers   - State management (GetX/Riverpod/Bloc)
  /utils         - Constants, helpers
```

## Step-by-Step Implementation Guide

### Phase 1: Setup and Basic 3D Rendering
1. Initialize Node.js project with Express and Socket.io
2. Set up Three.js scene with basic lighting and camera
3. **Load t-shirt .glb model from `/assets` folder** (user will download and place models here)
4. Create model loader utility that reads from `/assets` directory
5. Create Flutter project with WebView integration
6. Establish WebSocket connection between Flutter and Node.js
7. Display 3D editor in Flutter WebView

### Phase 2: Basic Customization
1. Implement color picker and apply to 3D model material
2. Add orbit controls for model rotation
3. Sync rotation state to Flutter via WebSocket
4. Create basic UI in Flutter to trigger color changes
5. Test bidirectional communication

### Phase 3: Sticker System
1. Implement file upload endpoint for stickers
2. Create sticker placement logic with raycasting
3. Add drag-and-drop functionality on 3D surface
4. Implement resize and rotate controls
5. Broadcast sticker transformations via WebSocket
6. Display sticker list in Flutter UI

### Phase 4: Text Editor
1. Add text input with font selection
2. Implement 3D text mesh generation
3. Create text placement system with surface projection
4. Add text styling controls (color, size, bold, italic)
5. Sync text updates in real-time
6. Build text editor UI in Flutter

### Phase 5: Advanced Features
1. Implement undo/redo stack
2. Add design save/load functionality
3. Create multi-view rendering (front/back)
4. Implement high-quality export
5. Add design templates
6. Optimize WebSocket performance

### Phase 6: Polish and Production
1. Error handling and validation
2. Loading states and progress indicators
3. Performance optimization (lazy loading, caching)
4. Security measures (input sanitization, file validation)
5. Responsive design for different screen sizes
6. Testing across devices

## WebSocket Event Schema Examples

```javascript
// Design Update Event
{
  "event": "design:update",
  "data": {
    "designId": "uuid",
    "productType": "tshirt",
    "baseColor": "#FFFFFF",
    "elements": [
      {
        "id": "element-1",
        "type": "sticker",
        "url": "/uploads/sticker.png",
        "position": {"x": 0, "y": 0.5, "z": 0.1},
        "rotation": {"x": 0, "y": 0, "z": 0},
        "scale": {"x": 0.2, "y": 0.2, "z": 1}
      },
      {
        "id": "element-2",
        "type": "text",
        "content": "Custom Text",
        "font": "Arial",
        "fontSize": 24,
        "color": "#000000",
        "position": {"x": 0, "y": -0.3, "z": 0.1}
      }
    ]
  }
}
```

## Key Packages to Use

### Node.js
- `express` - Web server
- `socket.io` - WebSocket communication
- `three` - 3D rendering engine (or `@babylonjs/core` for Babylon.js)
- `canvas` - Image processing
- `multer` - File upload handling
- `sharp` - Image optimization

### Flutter
- `web_socket_channel` - WebSocket client
- `webview_flutter` - Embed web-based editor
- `provider` or `riverpod` - State management
- `http` - API calls
- `file_picker` - Upload files from device

## Performance Considerations
- Implement throttling for real-time events (max 30 updates/second)
- Use binary data for large transfers (rendered images)
- Compress textures and optimize 3D models
- Implement connection recovery and reconnection logic
- Cache frequently used assets
- Use workers for heavy rendering tasks

## Security Requirements
- Validate all file uploads (type, size, content)
- Sanitize user input for text elements
- Implement rate limiting on WebSocket events
- Use secure WebSocket (WSS) in production
- Add authentication tokens to WebSocket connections
- Validate 3D model files before loading

## Expected Deliverables
1. Functioning Node.js 3D editor service
2. Flutter application with integrated WebView
3. Real-time WebSocket communication layer
4. Customization tools (color, stickers, text)
5. High-quality render export functionality
6. Documentation for API and WebSocket events
7. Example .glb models for testing

## Success Criteria
- User can rotate and view 3D model from all angles
- Stickers can be placed and manipulated in real-time
- Text appears correctly on 3D surface
- All changes sync instantly between Node.js and Flutter
- Final render matches the preview exactly
- System handles multiple concurrent users
- Application works on iOS and Android devices

---

## Instructions for AI Assistant

When implementing this project, please:

1. **Start with the basics**: Set up the Node.js server and basic Three.js scene first
2. **CRITICAL - Asset Loading**: All .glb 3D models MUST be loaded from the `/assets` folder in the Node.js project. Create a model loader that specifically reads from this directory. The user will download and place their .glb files there.
3. **Provide complete, working code**: No placeholders or "implement this later" comments
4. **Include error handling**: Every function should handle errors gracefully
5. **Use modern syntax**: ES6+ for JavaScript, latest Flutter best practices
6. **Comment complex logic**: Especially 3D transformations and WebSocket events
7. **Provide setup instructions**: How to install dependencies and run the project
8. **Include example data**: Sample WebSocket messages, example of how to structure the `/assets` folder
9. **Optimize for performance**: Consider mobile device constraints
10. **Make it production-ready**: Include validation, sanitization, and security measures
11. **Test thoroughly**: Provide example test cases and usage scenarios
12. **Asset path configuration**: Create a config file or utility that points to `/assets` as the model directory

### Example Asset Structure to Implement:
```
/server/assets/
  ├── tshirt.glb
  ├── hoodie.glb
  ├── mug.glb
  ├── cap.glb
```

The model loader should scan this directory and make models available to the renderer.

Focus on creating a seamless, real-time experience where the user feels like they're directly manipulating a physical product.