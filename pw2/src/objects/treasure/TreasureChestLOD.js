import * as THREE from 'three';
import { TreasureChest } from './TreasureChest.js';
import { EntityType } from '../../enums/EntityType.js';
import { DangerLevel } from '../../enums/DangerLevel.js';

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

		// Entity properties
		this.type = EntityType.STATIC_OBSTACLE;
		this.dangerLevel = DangerLevel.NONE;
	}

	init() {
		const lodNumber = this.lods.length;
		for (let level = 0; level < lodNumber; level++) {
			const treasureChest = new TreasureChest(this.lods[level]);

			this.addLevel(treasureChest, this.distanceStart + this.distanceOffset * level);
		}

		const empty = new THREE.Object3D();
		this.addLevel(empty, this.distanceStart + this.distanceOffset * lodNumber);
	}
}
