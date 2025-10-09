import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class Model3DHandler {
  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    this.renderer = null;
    this.model = null;
    this.originalMaterial = null;
    
    this.setupScene();
  }

  setupScene() {
    // Camera position
    this.camera.position.set(0, 0, 5);
    this.camera.lookAt(0, 0, 0);

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(-5, 5, 5);
    this.scene.add(pointLight);

    // Background
    this.scene.background = new THREE.Color(0xf0f0f0);
  }

  async loadModel(modelPath) {
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader();
      
      loader.load(
        modelPath,
        (gltf) => {
          // Remove existing model
          if (this.model) {
            this.scene.remove(this.model);
          }

          this.model = gltf.scene;
          
          // Center and scale the model
          const box = new THREE.Box3().setFromObject(this.model);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());
          
          // Center the model
          this.model.position.sub(center);
          
          // Scale to fit in view
          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = 3 / maxDim;
          this.model.scale.setScalar(scale);

          // Store original materials for color changes
          this.storeMaterials();
          
          this.scene.add(this.model);
          resolve(this.model);
        },
        (progress) => {
          console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%');
        },
        (error) => {
          console.error('Error loading model:', error);
          reject(error);
        }
      );
    });
  }

  storeMaterials() {
    if (!this.model) return;

    this.originalMaterials = new Map();
    
    this.model.traverse((child) => {
      if (child.isMesh && child.material) {
        this.originalMaterials.set(child.uuid, child.material.clone());
      }
    });
  }

  updateColor(color) {
    if (!this.model) return;

    const colorObject = new THREE.Color(color);
    
    this.model.traverse((child) => {
      if (child.isMesh && child.material) {
        // For different material types
        if (child.material.color) {
          child.material.color.copy(colorObject);
        }
        if (child.material.emissive) {
          child.material.emissive.copy(colorObject).multiplyScalar(0.1);
        }
        child.material.needsUpdate = true;
      }
    });
  }

  applyTexture(textureUrl) {
    if (!this.model) return;

    const loader = new THREE.TextureLoader();
    
    loader.load(textureUrl, (texture) => {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.flipY = false;

      this.model.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material.map = texture;
          child.material.needsUpdate = true;
        }
      });
    });
  }

  resetMaterials() {
    if (!this.model || !this.originalMaterials) return;

    this.model.traverse((child) => {
      if (child.isMesh && this.originalMaterials.has(child.uuid)) {
        child.material = this.originalMaterials.get(child.uuid).clone();
      }
    });
  }

  setRotation(x, y, z) {
    if (this.model) {
      this.model.rotation.set(x, y, z);
    }
  }

  getRotation() {
    return this.model ? this.model.rotation : { x: 0, y: 0, z: 0 };
  }

  setPosition(x, y, z) {
    if (this.model) {
      this.model.position.set(x, y, z);
    }
  }

  getPosition() {
    return this.model ? this.model.position : { x: 0, y: 0, z: 0 };
  }

  setScale(scale) {
    if (this.model) {
      this.model.scale.setScalar(scale);
    }
  }

  getScale() {
    return this.model ? this.model.scale.x : 1;
  }

  // Get scene for external rendering
  getScene() {
    return this.scene;
  }

  getCamera() {
    return this.camera;
  }

  // Create a simple placeholder model if no .glb file is available
  createPlaceholderModel(type = 'tshirt') {
    let geometry;
    
    switch (type) {
      case 'tshirt':
        geometry = new THREE.BoxGeometry(2, 3, 0.1);
        break;
      case 'hoodie':
        geometry = new THREE.BoxGeometry(2.2, 3.2, 0.15);
        break;
      case 'mug':
        geometry = new THREE.CylinderGeometry(0.5, 0.7, 1.5, 32);
        break;
      case 'cap':
        geometry = new THREE.SphereGeometry(1, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.6);
        break;
      default:
        geometry = new THREE.BoxGeometry(2, 3, 0.1);
    }

    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.7,
      metalness: 0.1
    });

    this.model = new THREE.Mesh(geometry, material);
    this.scene.add(this.model);
    
    this.storeMaterials();
    
    return this.model;
  }

  dispose() {
    if (this.model) {
      this.scene.remove(this.model);
      this.model = null;
    }
    
    if (this.originalMaterials) {
      this.originalMaterials.clear();
    }
  }
}