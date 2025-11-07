import * as THREE from 'three';
import { RockLOD } from './RockLOD.js';

class RockGroup extends THREE.Object3D {
	constructor(count = 30, spreadX = 15, spreadZ = 15, rockModels = [], minDistance = 0.5) {
		super();

		this.count = count;
		this.spreadX = spreadX;
		this.spreadZ = spreadZ;
		this.rockModels = rockModels;
		this.minDistance = minDistance;
		this.rocks = [];
		this.positions = []; 

		this.init();
	}

	init() {
		for (let i = 0; i < this.count; i++) {
			const lodSet = this.rockModels[Math.floor(Math.random() * this.rockModels.length)];
			const rockLOD = new RockLOD(lodSet);

			let pos;
			let tries = 0;
			const maxTries = 50;

			do {
				pos = new THREE.Vector3(
					THREE.MathUtils.randFloatSpread(this.spreadX),
					0,
					THREE.MathUtils.randFloatSpread(this.spreadZ)
				);

				tries++;
			} while (!this.isFarEnough(pos) && tries < maxTries);

			this.positions.push(pos);
			rockLOD.position.copy(pos);

			// Random rotation
			rockLOD.rotation.set(
				THREE.MathUtils.randFloat(0, Math.PI / 8),
				THREE.MathUtils.randFloat(0, Math.PI * 2),
				THREE.MathUtils.randFloat(0, Math.PI / 8)
			);

			this.add(rockLOD);
			this.rocks.push(rockLOD);
		}
	}

	isFarEnough(candidate) {
		for (const existing of this.positions) {
			if (candidate.distanceTo(existing) < this.minDistance) return false;
		}
		return true;
	}
}

export { RockGroup };
