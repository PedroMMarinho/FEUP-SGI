import * as THREE from 'three';

class Ship extends THREE.Object3D {
    constructor(gltf) {
        super();
        this.gltf = gltf;
        this.add(this.getModel());
    }

    getModel() {
        const model = this.gltf.scene.clone();
        return model;
    }
}

export { Ship };
