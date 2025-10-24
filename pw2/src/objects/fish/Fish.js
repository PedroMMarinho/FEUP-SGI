import * as THREE from 'three';

export class Fish extends THREE.Object3D {
	constructor(fishColor, bodyLenRatio = 1, fatFishRatio = 1, finSizeRatio = 1) {
		super();
		this.geometry = new THREE.BufferGeometry();

		this.fishColor = fishColor;
		this.bodyLenRatio = bodyLenRatio;
		this.fatFishRatio = fatFishRatio;
		this.finSizeRatio = finSizeRatio;
		
		// animation parameters
		this.clock = new THREE.Clock();
		this.globalTime = 0;

		this.initBuffers();

		this.initMaterials();

		this.createSkeleton();

		this.addSkinning();

		this.bindSkeleton();
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
		this.geometry.computeVertexNormals();
	}

	createSkeleton() {
		const bone0 = new THREE.Bone(); // Head
		const bone1 = new THREE.Bone(); // Middle
		const bone2 = new THREE.Bone(); // Tail

		bone0.position.set(0, 0, 0);
		bone1.position.set(0, 0, -0.75 * this.bodyLenRatio);
		bone2.position.set(0, 0, -1.5 * this.bodyLenRatio);

		bone0.add(bone1);
		bone1.add(bone2);

		this.bones = [bone0, bone1, bone2];
		this.skeleton = new THREE.Skeleton(this.bones);
	}

	addSkinning() {
		const pos = this.geometry.getAttribute('position');
		const vertexCount = pos.count;

		const skinIndices = [];
		const skinWeights = [];

		for (let i = 0; i < vertexCount; i++) {
			const z = pos.getZ(i);

			// Assign weights based on z position
			if (z > -0.3) {
				// Head area → bone 0
				skinIndices.push(0, 1, 0, 0);
				skinWeights.push(1, 0, 0, 0);
			} else if (z > -1.2) {
				// Middle area → blend bone 0 and 1
				skinIndices.push(0, 1, 0, 0);
				skinWeights.push(0.5, 0.5, 0, 0);
			} else {
				// Tail area → blend bone 1 and 2
				skinIndices.push(1, 2, 0, 0);
				skinWeights.push(0.3, 0.7, 0, 0);
			}
		}

		this.geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinIndices, 4));
		this.geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(skinWeights, 4));
	}

	bindSkeleton() {
		this.mesh = new THREE.SkinnedMesh(this.geometry, this.material);
		this.mesh.add(this.bones[0]);       // attach the root bone
		this.mesh.bind(this.skeleton);
		this.add(this.mesh);
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

	updateState() {
		const delta = this.clock.getDelta();
		this.globalTime += delta;

		this.bones[1].rotation.y = Math.sin(this.globalTime * 2.0) * 0.3;
		this.bones[2].rotation.y = Math.sin(this.globalTime * 2.0 + 0.5) * 0.5;
	}
}
