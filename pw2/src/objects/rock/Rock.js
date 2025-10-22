import * as THREE from 'three';

class Rock {
    constructor(width = 0.3, height = 0.3, depth = 0.3, color = 0x888888) {
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.geometry = new THREE.BoxGeometry(this.width, this.height, this.depth);

        this.material = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 1,
            metalness: 0.1,
        });
    }
}

export { Rock };
