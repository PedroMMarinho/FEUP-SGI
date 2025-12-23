import * as THREE from 'three';
import { TVLOD } from './TVLOD.js';

class TVGroup extends THREE.Object3D {
    /**
     * @param {Array} data - Array of { modelLODs, position, rotation, scale }
     */
    constructor(data = []) {
        super();
        this.data = data;
        this.tvs = [];
        this.init();
    }

    init() {
        for (const item of this.data) {
            const tvLOD = new TVLOD(item.modelLODs);
            
            tvLOD.position.copy(item.position);
            tvLOD.rotation.copy(item.rotation);
            tvLOD.scale.set(item.scale, item.scale, item.scale);

            this.add(tvLOD);
            this.tvs.push(tvLOD);
        }
    }
}

export { TVGroup };