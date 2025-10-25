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
		this.init();
	}

	init() {
		const material = new THREE.MeshStandardMaterial({ color: 0xdc143c });
		const finMaterial = new THREE.MeshStandardMaterial({color: 0x00ff55 });
		const fatFish = new Fish(0xdc143c, 0.8, 1.3, 1.2);
		const normalFish = new Fish(0xdc143c);
		const thinFish = new Fish(0xdc143c, 1.3, 0.8, 1.1);

		for (let i = 0; i < this.count; i++) {
			this.createFish(normalFish, material, finMaterial);
		}
	}

	createFish(fishType, bodyMaterial, finMaterial) {
		const bodyMesh = new THREE.Mesh(fishType.bodyGeometry, bodyMaterial);	
		const tailMesh = new THREE.Mesh(fishType.tailGeometry, finMaterial);
		const dorsalMesh = new THREE.Mesh(fishType.dorsalFinGeometry, finMaterial);

		const xpos = THREE.MathUtils.randFloatSpread(10);
		const ypos = THREE.MathUtils.randFloat(-1, 6);
		const zpos = THREE.MathUtils.randFloatSpread(10);
		
		bodyMesh.position.set(xpos, ypos, zpos);
		tailMesh.position.set(xpos, ypos, zpos);
		dorsalMesh.position.set(xpos, ypos, zpos);

		const yRot = THREE.MathUtils.randFloat(0, Math.PI * 2);

		bodyMesh.rotation.y = yRot;
		tailMesh.rotation.y = yRot;
		dorsalMesh.rotation.y = yRot;

		const scale = THREE.MathUtils.randFloat(0.8, 1.2);
		bodyMesh.scale.set(scale, scale, scale);
		tailMesh.scale.set(scale, scale, scale);
		dorsalMesh.scale.set(scale, scale, scale);

		this.add(bodyMesh);
		this.add(tailMesh);
		this.add(dorsalMesh);
		this.fishes.push((bodyMesh, tailMesh, dorsalMesh));
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
