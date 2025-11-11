import * as THREE from 'three';
import { FishLOD } from './FishLOD.js';
import { KeyframedAnimation } from './../../properties/KeyframedAnimation.js';

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
		this.animatedFishes = [];
		this.sparseness = 100;
		this.baseHeight = 5;
		this.maxHeight = 35;
		this.init();
	}

	init() {
		let boidProps = {
			cohesion: 2,
			separation: 2,
			alignment: 2,
			moveSpeed: 4,
			awareness: 10,
			colour: new THREE.Color(0,1,1)
		};

		/* const material = new THREE.MeshStandardMaterial({ color: 0xdc143c });
		const finMaterial = new THREE.MeshStandardMaterial({color: 0x00ff55 });
		const fatFish = new Fish(0xdc143c, 0.8, 1.3, 1.2);
		const normalFish = new Fish(0xdc143c);
		const thinFish = new Fish(0xdc143c, 1.3, 0.8, 1.1); */

		for (let i = 0; i < this.count; i++) {
			const fishLOD = new FishLOD(0xdc143c, 0x00ff55, this.sparseness, 
				this.baseHeight, this.maxHeight, boidProps);

			/* fishLOD.position.set(
				THREE.MathUtils.randFloatSpread(this.sparseness),
				THREE.MathUtils.randFloat(-1, this.sparseness),
				THREE.MathUtils.randFloatSpread(this.sparseness)
			); */

			fishLOD.rotation.y = THREE.MathUtils.randFloat(0, Math.PI * 2);
			const scale = THREE.MathUtils.randFloat(0.8, 1.2);
			fishLOD.scale.set(scale, scale, scale);

			this.add(fishLOD);
			this.fishes.push(fishLOD);
		}

		/*const animatedFishesCount = 3;
		for (let i = 0; i < animatedFishesCount; i++) {
			const fishLOD = new FishLOD(0x003465, 0xffffff);

			const animation = new KeyframedAnimation(
				Math.round(Math.random() + 3 * 10000),
				"cubic",
				Math.round(Math.random() * 5 + 3),
				10,
				15,
				15
			);
			fishLOD.attachAnimation(animation);
			this.add(fishLOD);
			this.animatedFishes.push(fishLOD);
		} */
	}

	updateState() {
		for (const fish of this.fishes) {
			fish.flock(this.fishes);
			fish.updateState();
		}
		for (const fish of this.animatedFishes) {
			fish.updateState();
			fish.updateAnimation();
		}
	}
}

FishGroup.prototype.isGroup = true;

export { FishGroup };
