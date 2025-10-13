import * as THREE from 'three';
import { Coral } from "./Coral.js";

class CoralGroup extends THREE.Object3D {
	constructor(count = 40) {
		super();

		if (count <= 0) {
			console.warn("CoralGroup: count must be > 0");
			return;
		}

		this.type = "Group";
		this.count = count;
		this.corals = [];

		this.init();
	}

	init() {
		const coralTemplate = new Coral();

		// Instanced mesh - all corals share the same geometry/material
		this.mesh = new THREE.InstancedMesh(
			coralTemplate.geometry,
			coralTemplate.material,
			this.count
		);
		this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
		this.add(this.mesh);

		const dummy = new THREE.Object3D();

		for (let i = 0; i < this.count; i++) {
			// Random position
			const position = new THREE.Vector3(
				THREE.MathUtils.randFloatSpread(15),
				THREE.MathUtils.randFloat(-2, -1.9),
				THREE.MathUtils.randFloatSpread(15)
			);
			
			// Store logical coral data
			this.corals.push({ position })

			// Apply transform
			dummy.position.copy(position);
			dummy.updateMatrix();
			this.mesh.setMatrixAt(i, dummy.matrix);
		}

		this.mesh.instanceMatrix.needsUpdate = true;
	}

	update() {
		// Static for now
	}
}

CoralGroup.prototype.isGroup = true;

export { CoralGroup };
