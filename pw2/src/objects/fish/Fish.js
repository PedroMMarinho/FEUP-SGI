import * as THREE from 'three';

export class Fish {
	constructor() {
		this.geometry = new THREE.BufferGeometry();
		
		// directions according to image on moodle document

		const vertices = new Float32Array([
			0, 0, 0.5, // v0 face tip
			0.3, 0, -0.1, // v1 right face tip
			0, 0.4, 0, // v2 face top
			0, -0.4, 0, // v3 face bottom
			-0.3, 0, -0.1, // v4 left face tip
			0, 0, -1.5, // v5 back spine tip
			0, 0, -1.7, // v6 tail bone tip
			0, 0.5, -2, // v7 tail top tip 
			0, -0.5, -2 // v8 tail bottom tip
		]);

		const indices = [
			0, 1, 2, // right face top
			0, 3, 1, // right face bottom
			4, 0, 2, // left face top
			4, 3, 0, // left face bottom
			1, 5, 2, // body right top 
			1, 3, 5, // body right bottom 
			5, 4, 2, // body left top 
			5, 3, 4, // body left bottom
			5, 6, 7, // tail right top 
			5, 8, 6, // tail right bottom 
			6, 5, 7, // tail left top 
			6, 8, 5, // tail left bottom
		];

		this.geometry.setIndex(indices);
		this.geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
		
		this.material = new THREE.MeshStandardMaterial({
			color: 0xdc143c,
			roughness: 0.8,
			metalness: 0.3,
		});
	}
}
