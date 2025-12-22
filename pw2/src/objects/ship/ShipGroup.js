import * as THREE from 'three';
import { ShipLOD } from './ShipLOD.js';

class ShipGroup extends THREE.Object3D {
    /**
     * @param {Array} data - Array of { modelLODs, position, rotation, scale }
     */
    constructor(data = []) {
        super();
        this.data = data;
        this.ships = [];
        this.init();
    }

    init() {
        for (const item of this.data) {
            const shipLOD = new ShipLOD(item.modelLODs);
            
            shipLOD.position.copy(item.position);
            shipLOD.rotation.copy(item.rotation);
            shipLOD.scale.set(item.scale, item.scale, item.scale);

            this.add(shipLOD);
            this.ships.push(shipLOD);
        }
    }
}

export { ShipGroup };