import * as THREE from 'three';
import { Rock } from './Rock.js';

export class RockLOD extends THREE.LOD {
	constructor(lods) {
		super();
        this.distanceStart = 50;
        this.distanceOffset = 10;
		this.lods = lods;
		this.init();
	}

	init() {
		const randomScale = THREE.MathUtils.randFloat(0.2, 0.8);
		for (const level of this.lods) {
			const rock = new Rock(level);
			rock.scale.set(randomScale, randomScale, randomScale);
			this.addLevel(rock, this.distanceStart + this.distanceOffset * this.lods.indexOf(level));
		}

		const empty = new THREE.Object3D();
		this.addLevel(empty, this.distanceStart + this.distanceOffset * 3);
	}
}
