import * as THREE from 'three';
import { Submarine } from './Submarine.js';

export class SubmarineLOD extends THREE.LOD {
	constructor(propellerBladeModel, keyManager, cameraManager, position = new THREE.Vector3(0, 5, 0)) {
		super();

		this.propellerBladeModel = propellerBladeModel;
		this.keyManager = keyManager;
		this.cameraManager = cameraManager;

		this.distanceOffset = 15;
		this.distanceStart = 40;

		this.position.copy(position);

		this.setupLODs();
	}

	setupLODs() {
		const lodCount = this.lods?.length || 3; 
		let distance = this.distanceStart;

		for (let i = 0; i < lodCount; i++) {
			const submarine = new Submarine(
				this.propellerBladeModel[i],
				this.keyManager,
				this.cameraManager,
                i
			);

			this.addLevel(submarine, distance);
			distance += this.distanceOffset;
		}

		const emptyObject = new THREE.Object3D();
		this.addLevel(emptyObject, distance);
	}

	updateState() {
		const visibleLOD = this.levels.find(level => level.object.visible);
		if (!visibleLOD) return;

		for (const level of this.levels) {
			if (level.object.updateState) {
				level.object.updateState(level.object);
			}
		}
	}
}
