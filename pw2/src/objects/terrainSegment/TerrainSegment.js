import * as THREE from 'three';

class TerrainSegment extends THREE.Object3D {

  constructor(width = 10, height = 10, widthSegments = 64, heightSegments = 64) {
    super();
    // Create geometry and material
    const geometry = new THREE.PlaneGeometry(width, height, widthSegments, heightSegments);
    
    const material = new THREE.MeshStandardMaterial({
      color: 0xdeb887,
      roughness: 1,
      metalness: 0,
      side: THREE.DoubleSide
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = -0.01;
    mesh.rotation.x = -Math.PI / 2; 
    
    this.add(mesh);
  }

}

export { TerrainSegment };
