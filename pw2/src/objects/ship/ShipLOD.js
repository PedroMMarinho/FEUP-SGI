import * as THREE from 'three';
import { Ship } from './Ship.js';
import { EntityType } from '../../enums/EntityType.js';
import { DangerLevel } from '../../enums/DangerLevel.js';

export class ShipLOD extends THREE.LOD {
	constructor(lods) {
		super();
        this.distanceStart = 60;
        this.distanceOffset = 15;
		this.lods = lods;

		// BVH parameters
		this.rootObject = true;
		this.bvhSelectable = true;

		// Entity properties
		this.type = EntityType.STATIC_OBSTACLE;
		this.dangerLevel = DangerLevel.NONE;

		this.init();
	}

	init() {
		const lodNumber = this.lods.length;
		for (let level = 0; level < lodNumber; level++) {
			const ship = new Ship(this.lods[level]);
			this.addLevel(ship, this.distanceStart + this.distanceOffset * level);
		}

		const empty = new THREE.Object3D();
		this.addLevel(empty, this.distanceStart + this.distanceOffset * lodNumber);
	}
}
