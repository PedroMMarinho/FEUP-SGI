import * as THREE from 'three';
import { Bubble } from './Bubble.js';

class BubbleGroup extends THREE.Object3D {
    constructor(count = 100) {
        super();

        if (count <= 0) {
            console.warn("BubbleGroup: count must be > 0");
            return;
        }

        this.type = 'Group';
        this.count = count;
        this.bubbles = []; 

        this.init();
    }

    init() {
        const bubbleTemplate = new Bubble();

        // Instanced mesh — all bubbles share same geometry/material
        this.mesh = new THREE.InstancedMesh(
            bubbleTemplate.geometry,
            bubbleTemplate.material,
            this.count
        );
        this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        this.add(this.mesh);

        const dummy = new THREE.Object3D();

        for (let i = 0; i < this.count; i++) {
            // Random position
            const position = new THREE.Vector3(
                THREE.MathUtils.randFloatSpread(6),
                THREE.MathUtils.randFloat(-2, 5),
                THREE.MathUtils.randFloatSpread(6)
            );

            // Store logical bubble data
            this.bubbles.push({ position });

            // Apply transform
            dummy.position.copy(position);
            dummy.updateMatrix();
            this.mesh.setMatrixAt(i, dummy.matrix);
        }

        this.mesh.instanceMatrix.needsUpdate = true;
    }

    update() {
        // Static for now   
    }
}

BubbleGroup.prototype.isGroup = true;


export { BubbleGroup };
