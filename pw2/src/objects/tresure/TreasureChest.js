import * as THREE from 'three';
import { TextureManager } from '../../managers/TextureManager.js';

class TreasureChest extends THREE.Object3D {
    constructor(gltf) {
        super();
        this.gltf = gltf;
        this.textureManager = TextureManager.getInstance();
        this.add(this.getModel());
    }

    getModel() {
        const model = this.gltf.scene.clone();
        model.position.y -= 0.06;
        model.scale.set(0.04, 0.04, 0.04);
        // apply random rotation around Y axis
        model.rotation.y = Math.random() * Math.PI * 2;
        // slight tilt for more natural look
        model.rotation.z = Math.random() * 0.1 - 0.05;
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