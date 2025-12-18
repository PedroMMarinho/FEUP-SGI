import * as THREE from 'three';
import { TreasureChestLOD } from './TreasureChestLOD.js';

class TreasureChestGroup extends THREE.Object3D {
    /**
     * @param {Array} data - Array of { modelLODs, position, rotation, scale }
     */
    constructor(data = []) {
        super();
        this.type = 'Group';
        this.data = data;
        this.chests = [];
        this.init();
    }

    init() {
        if (!this.data || this.data.length === 0) {
            console.warn('TreasureChestGroup: No data provided');
            return;
        }

        for (const item of this.data) {
            const chest = new TreasureChestLOD(item.modelLODs);

            chest.position.copy(item.position);
            chest.rotation.copy(item.rotation);
            chest.scale.set(item.scale, item.scale, item.scale);

            this.add(chest);
            this.chests.push(chest);
        }
    }
}

export { TreasureChestGroup };