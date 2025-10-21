import * as THREE from 'three';

/**
 * Manages texture loading and caching for the entire scene.
 */
class TextureManager {
    constructor() {
        if (TextureManager._instance) {
            return TextureManager._instance;
        }

        this.loader = new THREE.TextureLoader();
        this.textures = new Map();
        this.basePath = './assets/textures/'; 

        TextureManager._instance = this;
    }


    loadTexture(name, filename) {
        if (this.textures.has(name)) {
            return this.textures.get(name);
        }

        const texture = this.loader.load(this.basePath + filename);

        this.textures.set(name, texture);
        return texture;
    }

    getTexture(name) {
        return this.textures.get(name) || null;
    }

    preload(textureMap) {
        for (const [name, filename] of Object.entries(textureMap)) {
            this.loadTexture(name, filename);
        }
    }

    clear() {
        this.textures.forEach((tex) => tex.dispose());
        this.textures.clear();
    }

    static getInstance() {
        if (!TextureManager._instance) {
            new TextureManager();
        }
        return TextureManager._instance;
    }
}

export { TextureManager };
