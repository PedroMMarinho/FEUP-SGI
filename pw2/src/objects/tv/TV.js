import * as THREE from 'three';
import { TextureManager } from '../../managers/TextureManager.js';

class TV extends THREE.Object3D {
    constructor(gltf) {
        super();
        this.gltf = gltf;
        this.textureManager = TextureManager.getInstance();
        this.add(this.getModel());
    }

    getModel() {
        const model = this.gltf.scene.clone();
        // Apply transformations
        model.rotateX(Math.PI/2); 
        model.position.y += 0.6;
        this.changeVideoTexture(model);
        return model;
    }
    // TODO fit the whole screen
   changeVideoTexture(model) {
    model.traverse((child) => {
        if (child.isMesh && child.name === 'screenSurface') {
            const videoTexture = this.textureManager.getTexture('tv-screen2');

            videoTexture.flipY = false;
            videoTexture.center.set(0.5, 0.5);           

            child.material = new THREE.MeshBasicMaterial({
                map: videoTexture,
                toneMapped: false 
            });

            child.material.needsUpdate = true;
        }
    });
}


}

export { TV };