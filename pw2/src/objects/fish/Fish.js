import * as THREE from 'three';

export class Fish {
	constructor(fishColor, bodyLenRatio = 1, fatFishRatio = 1, finSizeRatio = 1) {
		
		this.geometry = new THREE.BufferGeometry();

		this.fishColor = fishColor;
		this.bodyLenRatio = bodyLenRatio;
		this.fatFishRatio = fatFishRatio;
		this.finSizeRatio = finSizeRatio;

		this.initBuffers();

		this.initMaterials();	
	}

	initBuffers() {
		// directions according to image on moodle document
		
		const vertices = new Float32Array([
			0, 0, 0.5 * this.bodyLenRatio, // v0 face tip
			0.3 * this.fatFishRatio, 0, -0.1, // v1 right face tip
			0, 0.4 * this.fatFishRatio, 0, // v2 face top
			0, -0.4 * this.fatFishRatio, 0, // v3 face bottom
			-0.3 * this.fatFishRatio, 0, -0.1, // v4 left face tip
			0, 0, -1.5 * this.bodyLenRatio, // v5 back spine tip
			0, 0, -1.7 * this.finSizeRatio, // v6 tail bone tip
			0, 0.5 * this.finSizeRatio, -2 * this.finSizeRatio, // v7 tail top tip 
			0, -0.5 * this.finSizeRatio, -2 * this.finSizeRatio // v8 tail bottom tip
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
	}
	
	initMaterials() {
		this.material = new THREE.MeshStandardMaterial({
			color: this.fishColor,
			roughness: 0.8,
			metalness: 0.3,
		});
	}

	setFishColor(color) {
		this.fishColor = color;
	}

	setBodyLenRatio(r) {
		this.bodyLenRatio = r;
	}

	setFatFishRatio(r) {
		this.fatFishRatio = r;
	}

	setFinSizeRatio(r) {
		this.finSizeRatio = r;
	}
}
