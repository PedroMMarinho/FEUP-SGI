import * as THREE from 'three';
import { HDRLoader } from '../../../lib/jsm/loaders/HDRLoader.js';

/**
 * HDRIManager
 * Loads and stores all HDR environment maps (HDRIs), organized by keys.
 */
export class HDRIManager {
  /**
   * @param {THREE.WebGLRenderer} renderer - Required for PMREM generation
   */
  constructor(renderer) {
    this.loader = new HDRLoader();
    this.hdrTextures = new Map(); 
    this.basePath = './assets/HDRIs/';
    this.renderer = renderer;

    this.pmremGenerator = new THREE.PMREMGenerator(renderer);
    this.pmremGenerator.compileEquirectangularShader();
  }

  /**
   * Loads an HDRI and stores it under a key.
   * @param {string} key - Unique identifier for this HDRI (e.g., 'sunset', 'studio')
   * @param {string} url - Path to the HDR file (relative to basePath)
   * @returns {Promise<THREE.Texture>} - The processed HDRI texture (ready for use)
   */
  async loadHDRI(key, url) {
    const texture = await new Promise((resolve, reject) => {
      this.loader.load(
        this.basePath + url,
        (hdrTexture) => resolve(hdrTexture),
        undefined,
        (error) => reject(error)
      );
    });

    texture.mapping = THREE.EquirectangularReflectionMapping;
    texture.colorSpace = THREE.LinearSRGBColorSpace;

    const envMap = this.pmremGenerator.fromEquirectangular(texture).texture;

    const hdri = { hdr: texture, envMap: envMap };

    this.hdrTextures.set(key, hdri);

    console.log(`Loaded HDRI "${key}": ${url}`);
    return hdri;
  }

  /**
   * Returns a stored HDR environment texture.
   * @param {string} key - HDRI key
   * @returns {THREE.Texture|null}
   */
  getHDRI(key) {
    if (!this.hdrTextures.has(key)) {
      console.warn(`⚠️ No HDRI loaded for key "${key}"`);
      return null;
    }
    return this.hdrTextures.get(key);
  }

  /**
   * Disposes all loaded HDRIs and clears memory.
   */
  clear() {
    this.hdrTextures.forEach((texture) => texture.dispose());
    this.hdrTextures.clear();
    this.pmremGenerator.dispose();
    console.log('HDRIManager: cleared all textures');
  }
}
