import * as THREE from 'three';
import { Fish } from './Fish.js';

// NOTE: Using instanced meshes disables the use of different fatFishScale, colors, etc.
// (constructor attributes) per fish. Using an actual different mesh for every fish would be fine 
// until up to 100 fishes maybe, but then would cause great lag.
// If thousands would be required, it would be necessary to revert to instanced matrix and maybe deform
// the fish using shaders instead. I chose the middle ground of having a few different meshes for variation
// and instancing from those. - Ismael Moniz (up202206871@up.pt)

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
		this.meshGroups = [];
		this.init();
	}

	init() {
		const fishTemplates = [
			new Fish(0xdc143c, 1.0, 1.0, 1.0), // normal fish 
			new Fish(0xba55d3, 1.2, 0.8, 1.0), // long fish
			new Fish(0x7fff00, 0.8, 1.3, 1.2), // fat fish
		];

		const numTypes = fishTemplates.length;
		const fishesPerType = Math.ceil(this.count / numTypes);

		const dummy = new THREE.Object3D();

		for (let t = 0; t < numTypes; t++) {
			const template = fishTemplates[t];
			
			const mesh = new THREE.InstancedMesh(
				template.geometry,
				template.material,
				fishesPerType
			);

			mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

			for (let i = 0; i < fishesPerType; i++) {
				const position = new THREE.Vector3(
					THREE.MathUtils.randFloatSpread(10),
					THREE.MathUtils.randFloat(-1, 6),
					THREE.MathUtils.randFloatSpread(10)
				);

				const scale = THREE.MathUtils.randFloat(0.8, 1.2);
				dummy.scale.set(scale, scale, scale);
				dummy.rotation.y = THREE.MathUtils.randFloat(0, Math.PI * 2);
				dummy.position.copy(position);

				dummy.updateMatrix();
				mesh.setMatrixAt(i, dummy.matrix);
			}

			mesh.instanceMatrix.needsUpdate = true;
			this.add(mesh);
			this.meshGroups.push(mesh);
		}
	}

}

FishGroup.prototype.isGroup = true;

export { FishGroup };

// old approach:
/* init() {
		const fishTemplate = new Fish(0xdc143c);

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
*/
