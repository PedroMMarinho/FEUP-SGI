import * as THREE from 'three';
import { ShipLOD } from './ShipLOD.js';

class ShipGroup extends THREE.Object3D {
    constructor(positions = [], shipModels = []) {
        super();

        this.positions = positions;
        this.shipModels = shipModels;
        this.ships = [];

        this.init();
    }

    init() {
        for (const pos of this.positions) {
            const lodSet = this.shipModels[Math.floor(Math.random() * this.shipModels.length)];
            const shipLOD = new ShipLOD(lodSet);
            const positionYOffset = THREE.MathUtils.randFloat(-0.005, 0.04);
            shipLOD.position.copy(pos);
            shipLOD.position.y += positionYOffset;

            shipLOD.rotation.set(
                THREE.MathUtils.randFloat(0, Math.PI / 8),
                THREE.MathUtils.randFloat(0, Math.PI * 2),
                THREE.MathUtils.randFloat(0, Math.PI / 8)
            );

            const scale = THREE.MathUtils.randFloat(7.2, 7.8);
            shipLOD.scale.set(scale, scale, scale);

            this.add(shipLOD);
            this.ships.push(shipLOD);
        }
    }
}

export { ShipGroup };
