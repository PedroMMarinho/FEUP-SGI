import * as THREE from 'three';
import { RockLOD } from './RockLOD.js';

class RockGroup extends THREE.Object3D {
    /**
     * @param {Array} data - Array of { modelLODs, position, rotation, scale }
     */
    constructor(data = []) {
        super();
        this.data = data;
        this.init();
    }

    init() {
        for (const item of this.data) {
            const rockLOD = new RockLOD(item.modelLODs);
            
            rockLOD.position.copy(item.position);
            rockLOD.rotation.copy(item.rotation);
            rockLOD.scale.set(item.scale, item.scale, item.scale);

            this.add(rockLOD);
        }
    }
}

export { RockGroup };