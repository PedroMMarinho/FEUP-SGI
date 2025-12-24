import { TextureManager } from './TextureManager.js';
import { BlenderManager } from './BlenderManager.js';
import { HDRIManager } from './HDRIManager.js';

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
    constructor(renderer) {
        // Create specialized loaders
        this.textureManager = new TextureManager(renderer.capabilities.getMaxAnisotropy());
        this.blenderManager = new BlenderManager();
        this.hdriManager = new HDRIManager(renderer);

    }

    initBlenderModels() {
        const modelList = [
            // Sharks
            { key: 'shark1', url: 'sharks/shark-high.glb', lod: 0 },
            { key: 'shark1', url: 'sharks/shark-medium.glb', lod: 1 },
            { key: 'shark1', url: 'sharks/shark-low.glb', lod: 2 },

            { key: 'shark2', url: 'sharks/shark-high.glb', lod: 0 },
            { key: 'shark2', url: 'sharks/shark-medium.glb', lod: 1 },
            { key: 'shark2', url: 'sharks/shark-low.glb', lod: 2 },

            // Submarine Propeller Blade
            { key: 'propeller-blade', url: 'submarine/propeller-blade-high.glb', lod: 0 },
            { key: 'propeller-blade', url: 'submarine/propeller-blade-medium.glb', lod: 1 },
            { key: 'propeller-blade', url: 'submarine/propeller-blade-low.glb', lod: 2 },

            // Rocks
            { key: 'granite', url: 'rocks/granite-high.glb', lod: 0 },
            { key: 'granite', url: 'rocks/granite-medium.glb', lod: 1 },
            { key: 'granite', url: 'rocks/granite-low.glb', lod: 2 },
            
            { key: 'dark-stone', url: 'rocks/dark-stone-high.glb', lod: 0 },
            { key: 'dark-stone', url: 'rocks/dark-stone-medium.glb', lod: 1 },
            { key: 'dark-stone', url: 'rocks/dark-stone-low.glb', lod: 2 },

            // Shells
            { key: 'whelk', url: 'shells/whelk-high.glb', lod: 0 },
            { key: 'whelk', url: 'shells/whelk-medium.glb', lod: 1 },
            { key: 'whelk', url: 'shells/whelk-low.glb', lod: 2 },

            // Sunken Ship
            { key: 'going-merry', url: 'ship/going-merry-high.glb', lod: 0 },
            { key: 'going-merry', url: 'ship/going-merry-medium.glb', lod: 1 },
            { key: 'going-merry', url: 'ship/going-merry-low.glb', lod: 2 },
            
            // TV Screen
            { key: 'tv', url: 'tvs/TV-high.glb', lod: 0 },
            { key: 'tv', url: 'tvs/TV-medium.glb', lod: 1 },
            { key: 'tv', url: 'tvs/TV-low.glb', lod: 2 }, 

            // Treasure Chest
            { key: 'treasure-chest', url: 'treasure_chest/treasure-chest-high.glb', lod: 0 },
            { key: 'treasure-chest', url: 'treasure_chest/treasure-chest-medium.glb', lod: 1 },
            { key: 'treasure-chest', url: 'treasure_chest/treasure-chest-low.glb', lod: 2 },

        ];
        return modelList;
    }

    async loadBlenderModels() {

        //console.log('🌀 Loading Blender models...');
        const modelList = this.initBlenderModels();

        for (const model of modelList) {
            await this.blenderManager.loadModel(model.key, model.url, model.lod);
        }

        //console.log('✅ All Blender models loaded.');
    }

    initTextures() {
        const textureMap = {
            // Submarine Textures
            'metal_color': 'submarine/Metal_1K_Color.jpg',
            'metal_metalness': 'submarine/Metal_1K_Metalness.jpg',
            'metal_roughness': 'submarine/Metal_1K_Roughness.jpg',
            'metal_normal': 'submarine/Metal_1K_Normal.jpg',
            'metal_NRM': 'submarine/MetalFasterners_NRM.png',
            'metal_OCC': 'submarine/MetalFasterners_OCC.png',
            'metal_SPEC': 'submarine/MetalFasterners_SPEC.png',
            // Shark Textures
            'shark-blue': 'shark/shark-blue.png',
            // Water Texture
            'water-normal': 'water/waternormals.jpg',
            // Terrain Textures
            'sand': 'sand/sandwaves.png',
            'sand-normal': 'sand/sandwavesNormal.png',
            'sand-noise': 'sand/sandNoise.png',
            'rift-map': 'sand/riftMap.png',
            'rift-rock': 'sand/riftRock.jpg',
            'rift-rock-normal':  'sand/riftRockNormal.png',
            'magma': 'sand/magma.png',
            'magma-normal': 'sand/magmaNormal.png',
            // TV Screen Video Texture
            'tv-screen3': 'tv/spongebob.mp4',
            // perlin noise  
            'perlin-noise': 'noise/perlin_noise.png',
            // Periscope Textures
            'scratches': 'periscope/scratches.jpg',
            'hud': 'periscope/hud.png',
            'spritesheet': 'periscope/spritesheet.png',
            // Treasure Chest Textures
            'treasure-gold' : 'treasure_chest/gold.mp4',
            // bubble texture
            'bubble-particle': 'bubbles/bubble.png',
            // Particle Textures
            'sand-particle': 'particle/sand-particle.png',
        };
        return textureMap;
    }

    loadTextures() {
        //console.log('🌀 Loading textures...');

        const textureMap = this.initTextures();
        this.textureManager.preload(textureMap);

        //console.log('✅ All textures loaded.');
    }

    initHDRIs() {
        const hdriList = [
            { key: 'fin-hall', url: 'hall_of_finfish_1k.hdr' },
        ];
        return hdriList;
    }

    async loadHDRIs() {
        //console.log('🌀 Loading HDRIs...')
        const hdriList = this.initHDRIs()
        for (const hdri of hdriList) {
            await this.hdriManager.loadHDRI(hdri.key, hdri.url);
        }
        //console.log('✅ All HDRIs loaded.');
    }

    async preloadAll() {
        this.loadTextures();
        await this.loadBlenderModels();
        await this.loadHDRIs();
    }


    getTexture(name) {
        return this.textureManager.getTexture(name);
    }

    getModel(key, lodLevel = 0) {
        return this.blenderManager.getModel(key, lodLevel);
    }
    getHDRI(key) {
        return this.hdriManager.getHDRI(key);
    }

    getBlenderManager() {
        return this.blenderManager;
    }

    getTextureManager() {
        return this.textureManager;
    }
    getHDRIManager() {
        return this.hdriManager;
    }

    /**
     * Clears all loaded assets (useful for scene reloads).
     */
    clear() {
        //console.log('🧹 Clearing all loaded assets...');
        this.textureManager.clear();
        this.blenderManager.clear();
        this.hdriManager.clear();
    }
}
