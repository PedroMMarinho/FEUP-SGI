import * as THREE from 'three';
import { ShellLOD } from './ShellLOD.js';

class ShellGroup extends THREE.Object3D {
	constructor(positions = [], lods = []) {
		super();

		this.type = 'Group';
		this.positions = positions;
		this.lods = lods;
		this.shells = [];


		this.init();
	}

	init() {
		if (this.positions.length === 0) {
			console.warn('ShellGroup: No positions provided');
			return;
		}

		for (const position of this.positions) {
            const lodSets = this.lods[Math.floor(Math.random() * this.lods.length)];
			const shell = new ShellLOD(lodSets);
            const positionYOffset = THREE.MathUtils.randFloat(-0.005, 0.08);

			shell.position.copy(position);
            shell.position.y += positionYOffset;

			shell.rotation.y = THREE.MathUtils.randFloat(0, Math.PI * 2);
			shell.rotation.x = THREE.MathUtils.degToRad(THREE.MathUtils.randFloat(-10, 10));
			shell.rotation.z = THREE.MathUtils.degToRad(THREE.MathUtils.randFloat(-10, 10));

			const scale = THREE.MathUtils.randFloat(0.1, 0.6);
			shell.scale.set(scale, scale, scale);

			this.add(shell);
			this.shells.push(shell);
		}
	}
	
}

ShellGroup.prototype.isGroup = true;

export { ShellGroup };
