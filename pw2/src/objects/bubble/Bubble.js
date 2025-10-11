import * as THREE from 'three';


class Bubble {
    constructor() {
        this.geometry = new THREE.SphereGeometry(0.1, 32, 32);
        this.material = new THREE.MeshStandardMaterial({
            color: 0x99ccff,
            transparent: true,
            opacity: 0.6
        });
    }

    update() {
        // Static bubble for now
    }
}

export { Bubble };
