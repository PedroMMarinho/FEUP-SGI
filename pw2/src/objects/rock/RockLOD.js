import * as THREE from 'three';
import { Rock } from './Rock.js';

export class RockLOD extends THREE.LOD {
	constructor(lods) {
		super();
        this.distanceStart = 20;
        this.distanceOffset = 15;
		this.lods = lods;
		// BVH parameters
		this.rootObject = true;
		this.bvhSelectable = true;

		this.init();
	}

	init() {
		const lodNumber = this.lods.length;
		for (let level = 0; level < lodNumber; level++) {
			const rock = new Rock(this.lods[level]);
			this.addLevel(rock, this.distanceStart + this.distanceOffset * level);
		}

		const empty = new THREE.Object3D();
		this.addLevel(empty, this.distanceStart + this.distanceOffset * lodNumber);
	}
}
