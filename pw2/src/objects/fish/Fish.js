import * as THREE from 'three';

export class Fish {
	constructor(lowRes, bodyLenRatio = 1, fatFishRatio = 1, finSizeRatio = 1) {
		
		this.bodyGeometry = new THREE.BufferGeometry();
		this.tailGeometry = new THREE.BufferGeometry();
		this.dorsalFinGeometry = new THREE.BufferGeometry();

		// this.fishColor = fishColor;
		this.bodyLenRatio = bodyLenRatio;
		this.fatFishRatio = fatFishRatio;
		this.finSizeRatio = finSizeRatio;
		this.isLowRes = lowRes;

		if (!lowRes) {
			this.initBody();
			this.initTail();
			this.initDorsalFin();
			this.initSkeleton();
			this.addSkinning();
		} else if (lowRes == 1){
			this.initLowResBody();
			this.initLowResTail();
		}

	}

	initLowResBody() {
		const vertices = new Float32Array([
			0, -0.4 * this.fatFishRatio, 0,
			0, 0.4 * this.fatFishRatio, 0,
			0, 0, -1.5 * this.bodyLenRatio
		]);

		const indices = [
			0, 2, 1,
			0, 1, 2,
		];

		this.bodyGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
		this.bodyGeometry.setIndex(indices);
		this.bodyGeometry.computeVertexNormals();
	}

	initBody() {
		// directions according to image on moodle document
		
		const vertices = new Float32Array([
			0, 0, 0.5 * this.bodyLenRatio, // v0 face tip
			0.3 * this.fatFishRatio, 0, -0.1, // v1 right face tip
			0, 0.4 * this.fatFishRatio, 0, // v2 face top
			0, -0.4 * this.fatFishRatio, 0, // v3 face bottom
			-0.3 * this.fatFishRatio, 0, -0.1, // v4 left face tip
			0, 0, -1.5 * this.bodyLenRatio, // v5 back spine tip	
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
		];

		const uv = new Float32Array([
			0.5,1.0,
			1.0,0.6,
			0.5,0.6,
			0.5,0.4,
			0.0, 0.6,
			0.5, 0.0
		])

		this.bodyGeometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));

		this.bodyGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
		this.bodyGeometry.setIndex(indices);
		this.bodyGeometry.computeVertexNormals();


	}

	initTail() {
		const vertices = new Float32Array([
			0, 0, -1.5 * this.bodyLenRatio, // v0 back spine tip
			0, 0, -1.7 * this.finSizeRatio, // v1 tail bone tip
			0, 0.5 * this.finSizeRatio, -2 * this.finSizeRatio, // v2 tail top tip 
			0, -0.5 * this.finSizeRatio, -2 * this.finSizeRatio // v3 tail bottom tip	
		]);

		const indices = [
			0,1,2,
			0,3,1,
			1,0,2,
			1,3,0,
		];
		
		this.tailGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
		this.tailGeometry.setIndex(indices);
		this.tailGeometry.computeVertexNormals();
	}

	initLowResTail() {
		const vertices = new Float32Array([
			0, 0, -1.5 * this.bodyLenRatio,
			0, 0.5 * this.finSizeRatio, -2 * this.finSizeRatio,
			0, -0.5 * this.finSizeRatio, -2 * this.finSizeRatio
		]);

		const indices = [
			0, 2, 1,
			0, 1, 2
		];

		this.tailGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
		this.tailGeometry.setIndex(indices);
		this.tailGeometry.computeVertexNormals();
	}

	initDorsalFin() {
		const vertices = new Float32Array([
			0, 0.4 * this.fatFishRatio, 0, // v0 face top
			0, 0, -1.5 * this.bodyLenRatio, // v1 back spine tip
			0, 0.2, -1.2 * this.bodyLenRatio, // v2 dorsal fin back tip
			0, 0.6, -0.2 * this.bodyLenRatio // v3 dorsal fin front tip
		]);

		const indices = [
			0, 1, 2,
			0, 2, 3,
			0, 3, 2,
			0, 2, 1,
		];
		
		this.dorsalFinGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
		this.dorsalFinGeometry.setIndex(indices);
		this.dorsalFinGeometry.computeVertexNormals();
	}

	// --- Skeleton setup ---
	initSkeleton() {
		const bone0 = new THREE.Bone(); // head
		const bone1 = new THREE.Bone(); // middle
		const bone2 = new THREE.Bone(); // tail

		bone0.position.set(0,0,0);
		bone1.position.set(0,0,-0.75 * this.bodyLenRatio);
		bone2.position.set(0,0,-1.5 * this.bodyLenRatio);

		bone0.add(bone1);
		bone1.add(bone2);

		this.bones = [bone0, bone1, bone2];
		this.skeleton = new THREE.Skeleton(this.bones);
	}

	// --- Assign skin weights to vertices ---
	addSkinning() {
		this.skinBody(this.bodyGeometry);
		this.skinBody(this.tailGeometry);
		this.skinBody(this.dorsalFinGeometry);
	}

	// helper function
	skinBody(geometry) {
		const pos = geometry.getAttribute('position');
		const vertexCount = pos.count;

		const skinIndices = [];
		const skinWeights = [];

		for (let i = 0; i < vertexCount; i++) {
			const z = pos.getZ(i);

			if (z > -0.3) {
				skinIndices.push(0, 1, 0, 0);
				skinWeights.push(1, 0, 0, 0);
			} else if (z > -1.2) {
				skinIndices.push(0, 1, 0, 0);
				skinWeights.push(0.5, 0.5, 0, 0);
			} else {
				skinIndices.push(1, 2, 0, 0);
				skinWeights.push(0.3, 0.7, 0, 0);
			}
		}

		geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinIndices, 4));
		geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(skinWeights, 4));
	}
	
	/* initMaterials() {
		this.material = new THREE.MeshStandardMaterial({
			color: this.fishColor,
			roughness: 0.8,
			metalness: 0.3,
		});
	}

	setFishColor(color) {
		this.fishColor = color;
	} */

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
