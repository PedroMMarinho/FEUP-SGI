import * as THREE from 'three';
import { Shell } from './Shell.js';

export class ShellLOD extends THREE.LOD {
	constructor(lods) {
		super();
        this.distanceStart = 50;
        this.distanceOffset = 10;
		this.lods = lods;
		// BVH parameters
		this.rootObject = true;
		this.bvhSelectable = true;

		this.init();
	}

	init() {
		const lodNumber = this.lods.length;
		for (let level = 0; level < lodNumber; level++) {
			const shell = new Shell(this.lods[level]);
			this.addLevel(shell, this.distanceStart + this.distanceOffset * level);
		}

		const empty = new THREE.Object3D();
		this.addLevel(empty, this.distanceStart + this.distanceOffset * lodNumber);
	}
}
