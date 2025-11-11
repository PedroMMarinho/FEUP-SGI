import * as THREE from 'three';
import { Coral } from './Coral.js';

export class CoralLOD extends THREE.LOD {
    constructor(material) {
        super();
        this.corals = [];
        this.startDistance = 0;
        this.distanceOffset = 20;
        this.maxComplexity = 5;
        this.material = material;
        this.createLODs();
    }

    createLODs() {
        const coral = new Coral(this.maxComplexity, this.material);
        const coralLevels = coral.meshes;

        for (let i = 0; i < this.maxComplexity; i++) {
            const mesh = coralLevels[coralLevels.length - 1 - i];
            this.addLevel(mesh, this.startDistance + i * this.distanceOffset);
            this.corals.push(mesh);
        }

        const emptyObject = new THREE.Object3D();
        this.addLevel(emptyObject, this.startDistance + coralLevels.length * this.distanceOffset);
    }
}
