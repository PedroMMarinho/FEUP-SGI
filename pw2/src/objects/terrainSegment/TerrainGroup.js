import * as THREE from 'three';
import { TerrainSegment } from './TerrainSegment.js';

class TerrainGroup extends THREE.Object3D {
    constructor(count = 10) {
        super();
        this.type = 'Group';
        this.count = count;
        this.spread = 20;
        this.init();
    }

    init() {
        const terrainTemplate = new TerrainSegment();

        this.mesh = new THREE.InstancedMesh(
            terrainTemplate.geometry,
            terrainTemplate.material,
            this.count
        );

        this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        this.add(this.mesh);

        const dummy = new THREE.Object3D();

        for (let i = 0; i < this.count; i++) {
            dummy.position.set(
                THREE.MathUtils.randFloatSpread(this.spread),
                -2,
                THREE.MathUtils.randFloatSpread(this.spread)
            );

            dummy.rotation.x = -Math.PI / 2; 
            dummy.updateMatrix();
            this.mesh.setMatrixAt(i, dummy.matrix);
        }

        this.mesh.instanceMatrix.needsUpdate = true;
    }

    
}

TerrainGroup.prototype.isGroup = true;

export { TerrainGroup };
