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
        console.log(this.textureManager);
        this.blenderManager = new BlenderManager();

    }

    initBlenderModels() {
        const modelList = [
            { key: 'grey-shark', url: 'submarine.glb', lod: 0 },
            { key: 'grey-shark', url: 'sharks/grey/shark-medium.glb', lod: 1 },
            { key: 'grey-shark', url: 'sharks/grey/shark-low.glb', lod: 2 },
            // Submarine Propeller Blade
            { key: 'propeller-blade', url: 'submarine/propeller-blade-high.glb', lod: 0 },
            //{ key: 'submarine-propeller-blade', url: 'submarine/propeller-blade-medium.glb', lod: 1 },
            //{ key: 'submarine-propeller-blade', url: 'submarine/propeller-blade-low.glb', lod: 2 },
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
        const textureMap = {
            // Submarine Textures
            'metal_color': 'submarine/Metal_2K_Color.jpg',
            'metal_metalness': 'submarine/Metal_2K_Metalness.jpg',
            'metal_roughness': 'submarine/Metal_2K_Roughness.jpg',
            'metal_normal': 'submarine/Metal_2K_Normal.jpg',
            'metal_NRM': 'submarine/MetalFasterners_NRM.png',
            'metal_OCC': 'submarine/MetalFasterners_OCC.png',
            'metal_SPEC': 'submarine/MetalFasterners_SPEC.png',
        };
        return textureMap;
    }

    loadTextures() {
        console.log('🌀 Loading textures...');

        const textureMap = this.initTextures();
        this.textureManager.preload(textureMap);

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

    getBlenderManager() {
        return this.blenderManager;
    }

    getTextureManager() {
        return this.textureManager;
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
