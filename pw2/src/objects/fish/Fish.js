import * as THREE from 'three';

class Fish {
	constructor() {
		this.geometry = new THREE.BoxGeometry(0.2, 0.3, 0.4);
		
		this.material = new THREE.MeshStandardMaterial({
			color: 0x00FFFF,
			roughness: 0.8,
			metalness: 0.3,
		});
	}
}

export { Fish };
