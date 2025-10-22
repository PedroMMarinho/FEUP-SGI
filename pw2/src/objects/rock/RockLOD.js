import * as THREE from 'three';
import { Rock } from './Rock.js';

export class RockLOD extends THREE.LOD {
	constructor() {
		super();
        this.distanceStart = 50;
        this.distanceOffset = 10;
		this.init();
	}

	init() {
		// Define LOD levels with simpler geometries at greater distances
		const lodLevels = [
			{ width: 0.4, height: 0.3, depth: 0.4, color: 0x888888, distance: this.distanceStart },  // high detail
			{ width: 0.35, height: 0.25, depth: 0.35, color: 0x777777, distance: this.distanceStart + this.distanceOffset }, // medium
			{ width: 0.3, height: 0.2, depth: 0.3, color: 0x666666, distance: this.distanceStart + this.distanceOffset * 2 }     // low
		];

		for (const level of lodLevels) {
			const rock = new Rock(level.width, level.height, level.depth, level.color);
			const mesh = new THREE.Mesh(rock.geometry, rock.material);
			this.addLevel(mesh, level.distance);
		}

		const empty = new THREE.Object3D();
		this.addLevel(empty, this.distanceStart + this.distanceOffset * 3);
	}
}
