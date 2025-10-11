import * as THREE from 'three';

/**
 * Main Aquarium class
 */
class Aquarium extends THREE.Object3D {
    constructor() {
        super();
        // Load aquarium features
        this.width = 1000;
        this.height = 1000;
        this.depth = 1000;

        this.init();
    }

    createAquariumGeometry() {
        const geometry = new THREE.BoxGeometry(this.width, this.height, this.depth);
        const material = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, opacity: 0.5, transparent: true, side: THREE.DoubleSide });
        const aquariumMesh = new THREE.Mesh(geometry, material);
        this.add(aquariumMesh);
    }

    /**
     * Initializes and adds all aquarium elements
     */
    init() {
        // Create aquarium geometry and material
        this.createAquariumGeometry();
    }

    
}

export { Aquarium };
