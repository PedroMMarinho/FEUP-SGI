import * as THREE from 'three';
import { TVLOD } from './TVLOD.js';

class TVGroup extends THREE.Object3D {
    constructor(positions = [], tvModels = []) {
        super();

        this.positions = positions;
        this.tvModels = tvModels;
        this.tvs = [];

        this.init();
    }

    init() {
        for (const pos of this.positions) {
            const lodSet = this.tvModels[Math.floor(Math.random() * this.tvModels.length)];
            const tvLOD = new TVLOD(lodSet);
            const positionYOffset = THREE.MathUtils.randFloat(-0.005, 0.04);
            tvLOD.position.copy(pos);
            tvLOD.position.y += positionYOffset;

            tvLOD.rotation.set(
                THREE.MathUtils.randFloat(0, Math.PI / 16),
                THREE.MathUtils.randFloat(0, Math.PI * 2),
                THREE.MathUtils.randFloat(0, Math.PI / 16)
            );

            this.add(tvLOD);
            this.tvs.push(tvLOD);
        }
    }
}

export { TVGroup };
