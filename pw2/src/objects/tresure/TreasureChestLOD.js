import * as THREE from 'three';
import { TreasureChest } from './TreasureChest.js';

export class TreasureChestLOD extends THREE.LOD {
	constructor(lods) {
		super();
        this.distanceStart = 50;
        this.distanceOffset = 10;
		this.lods = lods;
		this.init();


		// BVH parameters
		this.rootObject = true;
		this.bvhSelectable = true;
	}

	init() {
		const lodNumber = this.lods.length;

        let rotationY = Math.random() * Math.PI * 2;
        let rotationZ = Math.random() * 0.1 - 0.05;

		for (let level = 0; level < lodNumber; level++) {
			const treasureChest = new TreasureChest(this.lods[level]);
			// Apply transformations
			treasureChest.rotation.y = rotationY;
			treasureChest.rotation.z = rotationZ;
			treasureChest.position.y -= 0.06;
			treasureChest.scale.set(0.04, 0.04, 0.04);

			this.addLevel(treasureChest, this.distanceStart + this.distanceOffset * level);
		}

		const empty = new THREE.Object3D();
		this.addLevel(empty, this.distanceStart + this.distanceOffset * lodNumber);
	}
}
