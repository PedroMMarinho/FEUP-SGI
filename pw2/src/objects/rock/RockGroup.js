import * as THREE from 'three';
import { Rock } from './Rock.js';

class RockGroup extends THREE.Object3D {
    constructor(count = 30) {
        super();

        if (count <= 0) {
            console.warn("RockGroup: count must be > 0");
            return;
        }
        this.type = 'Group';

        this.count = count;
        this.rocks = [];
        this.init();
    }

    init() {
        const rockTemplate = new Rock();

        // Instanced mesh (shared geometry and material)
        this.mesh = new THREE.InstancedMesh(
            rockTemplate.geometry,
            rockTemplate.material,
            this.count
        );

        this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        this.add(this.mesh);

        const dummy = new THREE.Object3D();

        for (let i = 0; i < this.count; i++) {
            const position = new THREE.Vector3(
                THREE.MathUtils.randFloatSpread(10),
                THREE.MathUtils.randFloat(-2, -1.5), 
                THREE.MathUtils.randFloatSpread(10)
            );

            // Slightly random size and rotation
            const scale = THREE.MathUtils.randFloat(0.2, 0.6);
            dummy.scale.set(scale, scale, scale);
            dummy.rotation.y = THREE.MathUtils.randFloat(0, Math.PI * 2);
            dummy.position.copy(position);

            dummy.updateMatrix();
            this.mesh.setMatrixAt(i, dummy.matrix);

            this.rocks.push({ position, scale });
        }

        this.mesh.instanceMatrix.needsUpdate = true;
    }

}

RockGroup.prototype.isGroup = true;

export { RockGroup };
