import fs from 'fs/promises';

export class TextureGenerator {
  constructor(width = 2048, height = 2048) {
    this.width = width;
    this.height = height;
    this.layers = [];
    // Note: This is a simplified version without canvas
    // In production, you would use canvas or a browser-based renderer
  }

  setBaseColor(color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    this.layers.push({
      type: 'baseColor',
      color,
      timestamp: new Date()
    });
  }

  async addSticker(stickerPath, x, y, width, height, rotation = 0) {
    try {
      const img = await loadImage(stickerPath);
      this.ctx.save();
      
      // Transform for rotation around center
      this.ctx.translate(x + width / 2, y + height / 2);
      this.ctx.rotate((rotation * Math.PI) / 180);
      this.ctx.drawImage(img, -width / 2, -height / 2, width, height);
      
      this.ctx.restore();
      
      this.layers.push({
        type: 'sticker',
        path: stickerPath,
        x, y, width, height, rotation,
        timestamp: new Date()
      });
      
      return true;
    } catch (error) {
      console.error('Error adding sticker:', error);
      return false;
    }
  }

  async addText(text, x, y, fontSize, fontFamily, color) {
    try {
      this.ctx.font = `${fontSize}px ${fontFamily}`;
      this.ctx.fillStyle = color;
      this.ctx.textAlign = 'left';
      this.ctx.textBaseline = 'top';
      
      // Add text shadow for better visibility
      this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      this.ctx.shadowBlur = 2;
      this.ctx.shadowOffsetX = 1;
      this.ctx.shadowOffsetY = 1;
      
      this.ctx.fillText(text, x, y);
      
      // Reset shadow
      this.ctx.shadowColor = 'transparent';
      this.ctx.shadowBlur = 0;
      this.ctx.shadowOffsetX = 0;
      this.ctx.shadowOffsetY = 0;
      
      this.layers.push({
        type: 'text',
        text, x, y, fontSize, fontFamily, color,
        timestamp: new Date()
      });
      
      return true;
    } catch (error) {
      console.error('Error adding text:', error);
      return false;
    }
  }

  async addPattern(patternPath, opacity = 1, blendMode = 'source-over') {
    try {
      const img = await loadImage(patternPath);
      const oldAlpha = this.ctx.globalAlpha;
      const oldComposite = this.ctx.globalCompositeOperation;
      
      this.ctx.globalAlpha = opacity;
      this.ctx.globalCompositeOperation = blendMode;
      
      // Tile pattern across the canvas
      for (let x = 0; x < this.width; x += img.width) {
        for (let y = 0; y < this.height; y += img.height) {
          this.ctx.drawImage(img, x, y);
        }
      }
      
      // Restore original settings
      this.ctx.globalAlpha = oldAlpha;
      this.ctx.globalCompositeOperation = oldComposite;
      
      this.layers.push({
        type: 'pattern',
        path: patternPath,
        opacity,
        blendMode,
        timestamp: new Date()
      });
      
      return true;
    } catch (error) {
      console.error('Error adding pattern:', error);
      return false;
    }
  }

  async exportTexture(outputPath, format = 'png', quality = 100) {
    try {
      const buffer = this.canvas.toBuffer('image/png');
      
      let sharpInstance = sharp(buffer);
      
      if (format === 'jpeg' || format === 'jpg') {
        sharpInstance = sharpInstance.jpeg({ quality });
      } else {
        sharpInstance = sharpInstance.png({ quality });
      }
      
      await sharpInstance.toFile(outputPath);
      return outputPath;
    } catch (error) {
      console.error('Error exporting texture:', error);
      throw error;
    }
  }

  getBuffer(format = 'png') {
    if (format === 'jpeg' || format === 'jpg') {
      return this.canvas.toBuffer('image/jpeg');
    }
    return this.canvas.toBuffer('image/png');
  }

  getDataURL(format = 'png') {
    return this.canvas.toDataURL(`image/${format}`);
  }

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.layers = [];
  }

  getLayers() {
    return [...this.layers];
  }

  async recreateFromLayers(layers) {
    this.clear();
    
    for (const layer of layers) {
      switch (layer.type) {
        case 'baseColor':
          this.setBaseColor(layer.color);
          break;
        case 'sticker':
          await this.addSticker(
            layer.path, layer.x, layer.y, 
            layer.width, layer.height, layer.rotation
          );
          break;
        case 'text':
          await this.addText(
            layer.text, layer.x, layer.y,
            layer.fontSize, layer.fontFamily, layer.color
          );
          break;
        case 'pattern':
          await this.addPattern(layer.path, layer.opacity, layer.blendMode);
          break;
      }
    }
  }
}