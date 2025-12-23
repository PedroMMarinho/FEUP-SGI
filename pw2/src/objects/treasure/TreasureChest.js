import * as THREE from 'three';
import { TextureManager } from '../../managers/TextureManager.js';

class TreasureChest extends THREE.Object3D {
    constructor(gltf) {
        super();
        //console.log('Creating TreasureChest');
        //console.log(gltf);
        this.gltf = gltf;
        this.textureManager = TextureManager.getInstance();
        this.add(this.getModel());
    }

    getModel() {
        const model = this.gltf.scene.clone();
        this.changeVideoTexture(model);
        return model;
    }

    changeVideoTexture(model) {
    model.traverse((child) => {
        if (child.isMesh && child.name === 'chest_inside') {
            const {texture: videoTexture, video: video} = this.textureManager.getVideoTexture('treasure-gold');

            if (!videoTexture || !video) return;

            videoTexture.flipY = false;
            videoTexture.center.set(0.5, 0.5);

            child.material = new THREE.MeshBasicMaterial({
                map: videoTexture,
                toneMapped: false,
                side: THREE.DoubleSide
            });

            child.material.needsUpdate = true;
            video.play().catch(err => {
                console.warn('Video playback blocked until user gesture:', err);
            });
        }
    });
}


}

export { TreasureChest };