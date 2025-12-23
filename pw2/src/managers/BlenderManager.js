import * as THREE from 'three';
import { GLTFLoader } from '../../../lib/jsm/loaders/GLTFLoader.js';

/**
 * BlenderManager
 * Loads and stores all Blender-exported GLTF/GLB models, organized by keys.
 * Each key can store multiple LOD (Level of Detail) versions.
 */
export class BlenderManager {

  constructor() {
    this.loader = new GLTFLoader();
    this.models = new Map(); 
    this.basePath = './assets/models/';
  }

  /**
   * Loads a model and stores it under a key.
   * @param {string} key - Model identifier (
   * @param {string} url - Path to the GLB/GLTF file
   * @param {number} [lodLevel=0] - LOD index (0 = highest quality)
   * @returns {Promise<GLTF>}
   */
  async loadModel(key, url, lodLevel = 0) {
    const gltf = await new Promise((resolve, reject) => {
      this.loader.load(
        this.basePath + url,
        (gltf) => resolve(gltf),
        undefined,
        (error) => reject(error)
      );
    });

    if (!this.models.has(key)) {
      this.models.set(key, []);
    }

    const lodArray = this.models.get(key);
    lodArray[lodLevel] = gltf;

    //console.log(`✅ Loaded ${key} (LOD ${lodLevel}): ${url}`);
    return gltf;
  }

  /**
   * Returns a cloned version of the model for a specific LOD level.
   * @param {string} key - Model key
   * @param {number} [lodLevel=0] - Desired LOD index (defaults to 0)
   * @returns {THREE.Object3D|null}
   */
  getModel(key, lodLevel = 0) {
    const lodArray = this.models.get(key);
    if (!lodArray || lodArray.length === 0) {
      console.warn(`⚠️ No models loaded for key "${key}"`);
      return null;
    }

    const gltf = lodArray[lodLevel] || lodArray[0]; 
    if (!gltf) {
      console.warn(`⚠️ No LOD ${lodLevel} for "${key}", using LOD0`);
      return lodArray[0]?.scene.clone(true) || null;
    }

    const clone = gltf.scene.clone(true);
    return clone;
  }

  /**
   * Returns the total number of LOD levels for a given model.
   * @param {string} key
   * @returns {number}
   */
  getLODCount(key) {
    const lodArray = this.models.get(key);
    return lodArray ? lodArray.length : 0;
  }

  /**
   * Returns all GLTF objects for a model key (for building LODGroup)
   * @param {string} key
   * @returns {Array<GLTF>}
   */
  getAllLODs(key) {
    return this.models.get(key) || [];
  }
}
