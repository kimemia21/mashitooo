import fs from 'fs/promises';
import path from 'path';

export class AssetLoader {
  constructor(assetsPath) {
    this.assetsPath = assetsPath;
    this.availableModels = new Map();
  }

  async initialize() {
    try {
      // Scan for .glb files in assets directory
      await this.scanForModels();
      console.log(`Loaded ${this.availableModels.size} 3D models`);
    } catch (error) {
      console.error('Error initializing asset loader:', error);
    }
  }

  async scanForModels() {
    try {
      const files = await fs.readdir(this.assetsPath, { withFileTypes: true });
      
      for (const file of files) {
        if (file.isFile() && file.name.endsWith('.glb')) {
          const modelName = path.parse(file.name).name;
          const modelPath = path.join(this.assetsPath, file.name);
          
          // Map common model names to product types
          let productType = this.inferProductType(modelName);
          
          this.availableModels.set(productType, {
            name: modelName,
            path: modelPath,
            filename: file.name,
            type: productType
          });
        }
      }
      
      // If no specific product models found, use available models as generic products
      if (this.availableModels.size === 0) {
        console.warn('No .glb models found in assets directory. Please add product models.');
      }
    } catch (error) {
      console.error('Error scanning for models:', error);
    }
  }

  inferProductType(modelName) {
    const name = modelName.toLowerCase();
    
    if (name.includes('tshirt') || name.includes('t-shirt') || name.includes('shirt')) {
      return 'tshirt';
    } else if (name.includes('hoodie') || name.includes('sweatshirt')) {
      return 'hoodie';
    } else if (name.includes('mug') || name.includes('cup')) {
      return 'mug';
    } else if (name.includes('cap') || name.includes('hat')) {
      return 'cap';
    } else {
      // Use the filename as product type for unknown models
      return name.replace(/[^a-z0-9]/gi, '');
    }
  }

  async getModelPath(productType) {
    const model = this.availableModels.get(productType);
    if (model) {
      return model.path;
    }
    
    // If exact type not found, return first available model
    if (this.availableModels.size > 0) {
      const firstModel = this.availableModels.values().next().value;
      console.warn(`Product type '${productType}' not found, using '${firstModel.name}' instead`);
      return firstModel.path;
    }
    
    return null;
  }

  getAvailableModels() {
    return Array.from(this.availableModels.entries()).map(([type, model]) => ({
      productType: type,
      name: model.name,
      filename: model.filename
    }));
  }

  async copyAssetToUploads(assetFilename) {
    const sourcePath = path.join(this.assetsPath, assetFilename);
    const destPath = path.join(path.dirname(this.assetsPath), 'uploads', assetFilename);
    
    try {
      await fs.copyFile(sourcePath, destPath);
      return `/uploads/${assetFilename}`;
    } catch (error) {
      console.error('Error copying asset:', error);
      return null;
    }
  }
}