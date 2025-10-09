import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { v4 as uuidv4 } from 'uuid';

// Import custom modules
import { Model3DHandler } from './renderer/Model3DHandler.js';
import { TextureGenerator } from './utils/TextureGenerator.js';
import { AssetLoader } from './utils/AssetLoader.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static file serving
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/outputs', express.static(path.join(__dirname, 'outputs')));

// Create required directories
const createDirectories = async () => {
  const dirs = ['uploads', 'outputs', 'assets', 'textures'];
  for (const dir of dirs) {
    await fs.mkdir(path.join(__dirname, dir), { recursive: true });
  }
};

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { 
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|glb|gltf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || file.mimetype === 'model/gltf-binary';
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// In-memory storage for active projects
const projects = new Map();
const connectedClients = new Map();

// Initialize asset loader
const assetLoader = new AssetLoader(path.join(__dirname, 'assets'));

// API Routes

// Create new project
app.post('/api/project/create', async (req, res) => {
  try {
    const { modelType = 'tshirt', baseColor = '#ffffff' } = req.body;
    const projectId = uuidv4();
    
    // Load 3D model from assets
    const modelPath = await assetLoader.getModelPath(modelType);
    if (!modelPath) {
      return res.status(400).json({ error: `Model type '${modelType}' not found` });
    }
    
    const project = {
      id: projectId,
      modelType,
      modelPath,
      baseColor,
      elements: [],
      createdAt: new Date(),
      lastUpdated: new Date()
    };
    
    projects.set(projectId, project);
    
    // Broadcast project creation to connected clients
    io.emit('project:created', { projectId, project });
    
    res.json({ 
      success: true, 
      projectId,
      project 
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Get project details
app.get('/api/project/:projectId', (req, res) => {
  try {
    const { projectId } = req.params;
    const project = projects.get(projectId);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json({ success: true, project });
  } catch (error) {
    console.error('Error getting project:', error);
    res.status(500).json({ error: 'Failed to get project' });
  }
});

// Upload sticker/texture
app.post('/api/sticker/upload', upload.single('sticker'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const stickerId = uuidv4();
    const stickerUrl = `/uploads/${req.file.filename}`;
    
    res.json({
      success: true,
      stickerId,
      stickerUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Error uploading sticker:', error);
    res.status(500).json({ error: 'Failed to upload sticker' });
  }
});

// Add sticker to project
app.post('/api/project/:projectId/sticker', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { stickerId, stickerUrl, x, y, width, height, rotation = 0 } = req.body;
    
    const project = projects.get(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const element = {
      id: uuidv4(),
      type: 'sticker',
      stickerId,
      stickerUrl,
      position: { x, y, z: 0.1 },
      scale: { x: width / 1000, y: height / 1000, z: 1 },
      rotation: { x: 0, y: 0, z: rotation },
      timestamp: new Date()
    };
    
    project.elements.push(element);
    project.lastUpdated = new Date();
    
    // Broadcast update to connected clients
    io.emit('design:update', {
      projectId,
      element,
      action: 'add'
    });
    
    res.json({ success: true, element });
  } catch (error) {
    console.error('Error adding sticker:', error);
    res.status(500).json({ error: 'Failed to add sticker' });
  }
});

// Add text to project
app.post('/api/project/:projectId/text', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { text, x, y, fontSize = 48, fontFamily = 'Arial', color = '#000000' } = req.body;
    
    const project = projects.get(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const element = {
      id: uuidv4(),
      type: 'text',
      content: text,
      position: { x: x / 1000, y: y / 1000, z: 0.1 },
      fontSize,
      fontFamily,
      color,
      timestamp: new Date()
    };
    
    project.elements.push(element);
    project.lastUpdated = new Date();
    
    // Broadcast update to connected clients
    io.emit('design:update', {
      projectId,
      element,
      action: 'add'
    });
    
    res.json({ success: true, element });
  } catch (error) {
    console.error('Error adding text:', error);
    res.status(500).json({ error: 'Failed to add text' });
  }
});

// Update project color
app.put('/api/project/:projectId/color', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { color } = req.body;
    
    const project = projects.get(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    project.baseColor = color;
    project.lastUpdated = new Date();
    
    // Broadcast update to connected clients
    io.emit('color:changed', {
      projectId,
      color
    });
    
    res.json({ success: true, color });
  } catch (error) {
    console.error('Error updating color:', error);
    res.status(500).json({ error: 'Failed to update color' });
  }
});

// Render final texture
app.post('/api/project/:projectId/render', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { width = 2048, height = 2048 } = req.body;
    
    const project = projects.get(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Generate texture using TextureGenerator
    const textureGenerator = new TextureGenerator(width, height);
    textureGenerator.setBaseColor(project.baseColor);
    
    // Add all elements to texture
    for (const element of project.elements) {
      if (element.type === 'sticker') {
        const stickerPath = path.join(__dirname, element.stickerUrl.replace('/uploads/', 'uploads/'));
        await textureGenerator.addSticker(
          stickerPath,
          element.position.x * width,
          element.position.y * height,
          element.scale.x * width,
          element.scale.y * height,
          element.rotation.z
        );
      } else if (element.type === 'text') {
        await textureGenerator.addText(
          element.content,
          element.position.x * width,
          element.position.y * height,
          element.fontSize,
          element.fontFamily,
          element.color
        );
      }
    }
    
    // Export texture
    const outputPath = path.join(__dirname, 'outputs', `${projectId}-${Date.now()}.png`);
    await textureGenerator.exportTexture(outputPath);
    
    const textureUrl = `/outputs/${path.basename(outputPath)}`;
    
    // Broadcast render completion
    io.emit('render:complete', {
      projectId,
      textureUrl
    });
    
    res.json({
      success: true,
      textureUrl,
      width,
      height
    });
  } catch (error) {
    console.error('Error rendering texture:', error);
    res.status(500).json({ error: 'Failed to render texture' });
  }
});

// Get available models
app.get('/api/models', async (req, res) => {
  try {
    const models = await assetLoader.getAvailableModels();
    res.json({ success: true, models });
  } catch (error) {
    console.error('Error getting models:', error);
    res.status(500).json({ error: 'Failed to get models' });
  }
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  connectedClients.set(socket.id, { connectedAt: new Date() });
  
  // Join project room
  socket.on('join:project', (projectId) => {
    socket.join(projectId);
    console.log(`Client ${socket.id} joined project ${projectId}`);
    
    // Send current project state
    const project = projects.get(projectId);
    if (project) {
      socket.emit('project:state', project);
    }
  });
  
  // Handle real-time design updates
  socket.on('design:transform', (data) => {
    const { projectId, elementId, transform } = data;
    
    // Update project in memory
    const project = projects.get(projectId);
    if (project) {
      const element = project.elements.find(el => el.id === elementId);
      if (element) {
        Object.assign(element, transform);
        project.lastUpdated = new Date();
        
        // Broadcast to other clients in the same project
        socket.to(projectId).emit('element:transformed', {
          elementId,
          transform
        });
      }
    }
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    connectedClients.delete(socket.id);
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Initialize server
async function startServer() {
  try {
    await createDirectories();
    console.log('Created required directories');
    
    await assetLoader.initialize();
    console.log('Asset loader initialized');
    
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Asset directory: ${path.join(__dirname, 'assets')}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();