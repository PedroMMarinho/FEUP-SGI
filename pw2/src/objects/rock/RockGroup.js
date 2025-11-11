import * as THREE from 'three';
import { RockLOD } from './RockLOD.js';

class RockGroup extends THREE.Object3D {
	constructor(positions = [], rockModels = []) {
		super();

		this.positions = positions;
		this.rockModels = rockModels;
		this.rocks = [];

		this.init();
	}

	init() {
		for (const pos of this.positions) {
			const lodSet = this.rockModels[Math.floor(Math.random() * this.rockModels.length)];
			const rockLOD = new RockLOD(lodSet);
			const positionYOffset = THREE.MathUtils.randFloat(-0.005, 0.04);
			rockLOD.position.copy(pos);
			rockLOD.position.y += positionYOffset;

			rockLOD.rotation.set(
				THREE.MathUtils.randFloat(0, Math.PI / 8),
				THREE.MathUtils.randFloat(0, Math.PI * 2),
				THREE.MathUtils.randFloat(0, Math.PI / 8)
			);

			const scale = THREE.MathUtils.randFloat(0.2, 0.8);
			rockLOD.scale.set(scale, scale, scale);

			this.add(rockLOD);
			this.rocks.push(rockLOD);
		}
	}
}

export { RockGroup };
