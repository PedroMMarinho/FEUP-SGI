import * as THREE from 'three';

class Rock {
    constructor() {
        this.geometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);

        this.material = new THREE.MeshStandardMaterial({
            color: 0x888888,
            roughness: 1,
            metalness: 0.1,
        });
    }
}

export { Rock };
