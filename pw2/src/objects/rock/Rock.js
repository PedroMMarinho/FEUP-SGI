import * as THREE from 'three';

class Rock extends THREE.Object3D {
	constructor(gltf) {
		super();
		this.gltf = gltf;
		this.add(this.getModel());
	}

	getModel() {
		const model = this.gltf.scene.clone();
        console.log(this.gltf.scene);
		model.scale.set(0.3, 0.3, 0.3);
		return model;
	}
}

export { Rock };
