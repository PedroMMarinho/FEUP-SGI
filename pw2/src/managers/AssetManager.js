import { TextureManager } from './TextureManager.js';
import { BlenderManager } from './BlenderManager.js';

/**
 * AssetManager
 * Centralized manager for all scene assets (models, textures, sounds, etc).
 * 
 * Responsibilities:
 * - Owns instances of TextureManager and BlenderManager
 * - Handles global asset preloading
 * - Provides convenient access methods for assets
 */
export class AssetManager {
    constructor() {
        // Create specialized loaders
        this.textureManager = new TextureManager();
        this.blenderManager = new BlenderManager();

    }
    // Null means empty model (for LODs)
    initBlenderModels() {
        const modelList = [
            { key: 'grey-shark', url: 'sharks/grey/shark-high.glb', lod: 0 },
        ];
        return modelList;
    }

    async loadBlenderModels() {

        console.log('🌀 Loading Blender models...');
        const modelList = this.initBlenderModels();

        for (const model of modelList) {
            await this.blenderManager.loadModel(model.key, model.url, model.lod);
        }

        console.log('✅ All Blender models loaded.');
    }

    initTextures() {
        //const textureMap = {
        //    'water': 'water.jpg',
        //    'sand': 'sand.jpg',
        //    'rock': 'rock.jpg',
        //    'fish1': 'fish1.png',
        //    'fish2': 'fish2.png',
        //};
        // return textureMap;
    }

    loadTextures() {
        console.log('🌀 Loading textures...');

        //const textureMap = this.initTextures();
        //this.textureManager.preload(textureMap);

        console.log('✅ All textures loaded.');
    }

    async preloadAll() {
        this.loadTextures();
        await this.loadBlenderModels();
    }


    getTexture(name) {
        return this.textureManager.getTexture(name);
    }

    getModel(key, lodLevel = 0) {
        return this.blenderManager.getModel(key, lodLevel);
    }

    /**
     * Clears all loaded assets (useful for scene reloads).
     */
    clear() {
        console.log('🧹 Clearing all loaded assets...');
        this.textureManager.clear();
        this.blenderManager.clear();
    }
}
