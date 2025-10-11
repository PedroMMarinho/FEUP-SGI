import * as THREE from 'three';

class TerrainSegment {
    constructor() {
        this.geometry = new THREE.PlaneGeometry(10, 10);
        this.material = new THREE.MeshStandardMaterial({
            color: 0xdeb887, 
            roughness: 1,
            metalness: 0,
            side: THREE.DoubleSide
        });
    }
}

export { TerrainSegment };
