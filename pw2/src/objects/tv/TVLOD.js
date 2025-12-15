import * as THREE from 'three';
import { TV } from './TV.js';

export class TVLOD extends THREE.LOD {
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

		for (let level = 0; level < lodNumber; level++) {
			const tv = new TV(this.lods[level]);
			tv.rotateX(Math.PI/2);
			tv.position.y += 0.5;
			this.addLevel(tv, this.distanceStart + this.distanceOffset * level);
		}

		const empty = new THREE.Object3D();
		this.addLevel(empty, this.distanceStart + this.distanceOffset * lodNumber);
	}
}
