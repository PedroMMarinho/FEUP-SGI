import * as THREE from 'three';
import { CoralLOD } from './CoralLOD.js';

class CoralGroup extends THREE.Object3D {
	constructor(positions = []) {
		super();

		this.type = 'Group';
		this.positions = positions;
		this.corals = [];

		this.init();
	}

	init() {
		if (this.positions.length === 0) {
			console.warn('CoralGroup: No positions provided');
			return;
		}

		for (const position of this.positions) {
			const coral = new CoralLOD();

			coral.position.copy(position);

			coral.rotation.y = THREE.MathUtils.randFloat(0, Math.PI * 2);

			const scale = THREE.MathUtils.randFloat(0.9, 1.2);
			coral.scale.set(scale, scale, scale);

			coral.traverse((child) => {
				if (child.isInstancedMesh) child.instanceMatrix.needsUpdate = true;
			});

			this.add(coral);
			this.corals.push(coral);
		}
	}

	update() {
		// Static for now (could animate later)
	}
}

CoralGroup.prototype.isGroup = true;

export { CoralGroup };
