import * as THREE from 'three';
import { RockLOD } from './RockLOD.js';

class RockGroup extends THREE.Object3D {
	constructor(count = 30, spreadX = 15, spreadZ = 15) {
		super();

		if (count <= 0) {
			console.warn("RockGroup: count must be > 0");
			return;
		}

		this.type = 'Group';
		this.count = count;
		this.spreadX = spreadX;
		this.spreadZ = spreadZ;
		this.rocks = [];

		this.init();
	}

	init() {
		for (let i = 0; i < this.count; i++) {
			const rockLOD = new RockLOD();

			// Random position on the aquarium floor
			rockLOD.position.set(
				THREE.MathUtils.randFloatSpread(this.spreadX),
				0, // on the ground
				THREE.MathUtils.randFloatSpread(this.spreadZ)
			);

			// Random rotation
			rockLOD.rotation.y = THREE.MathUtils.randFloat(0, Math.PI * 2);
			rockLOD.rotation.x = THREE.MathUtils.randFloat(0, Math.PI / 8);
			rockLOD.rotation.z = THREE.MathUtils.randFloat(0, Math.PI / 8);

			this.add(rockLOD);
			this.rocks.push(rockLOD);
		}
	}
}

RockGroup.prototype.isGroup = true;

export { RockGroup };
