import * as THREE from 'three';

class Coral {
	constructor() {
		this.geometry = new THREE.CylinderGeometry(0.1, 0.15, 0.5, 16);
		this.material = new THREE.MeshStandardMaterial({
			color: 0xFF7F50,
			transparent: false,
			opacity: 1
		});
	}

	update() {
		// Static corals for now
	}
}

export { Coral };
