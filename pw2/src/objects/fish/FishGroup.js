import * as THREE from 'three';
import { Fish } from './Fish.js';

class FishGroup extends THREE.Object3D {
	constructor(count = 30) {
		super();

		if (count < 0) {
			console.warn("FishGroup: count must be > 0");
			return;
		}
		this.type = "Group";

		this.count = count;
		this.fishes = [];
		this.init();
	}

	init() {
		const fishTemplate = new Fish();

		// Instanced mesh (shared geometry and material)
		this.mesh = new THREE.InstancedMesh(
			fishTemplate.geometry,
			fishTemplate.material,
			this.count
		);
		
		this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
		this.add(this.mesh);

		const dummy = new THREE.Object3D();

		for (let i = 0; i < this.count; i++) {
			const position = new THREE.Vector3(
				THREE.MathUtils.randFloatSpread(10),
				THREE.MathUtils.randFloat(-1, 6),
				THREE.MathUtils.randFloatSpread(10)
			);

			// Slightly random size and rotation
			const scale = THREE.MathUtils.randFloat(0.8, 1.2);
			dummy.scale.set(scale, scale, scale);
			dummy.rotation.y = THREE.MathUtils.randFloat(0, Math.PI * 2);
			dummy.position.copy(position);

			dummy.updateMatrix();
			this.mesh.setMatrixAt(i, dummy.matrix);
			
			this.fishes.push({ position, scale });
		}

		this.mesh.instanceMatrix.needUpdate = true;
	}
}

FishGroup.prototype.isGroup = true;

export { FishGroup };
