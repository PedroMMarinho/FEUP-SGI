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
		} else if (lowRes == 1) {
			this.initLowResBody();
			this.initLowResTail();
		}

	}

	createMesh(bodyMaterial, finMaterial) {
        
        let bodyMesh, tailMesh, dorsalMesh;

        if (this.isLowRes) {
             const group = new THREE.Group();
             group.add(new THREE.Mesh(this.bodyGeometry, bodyMaterial));
             group.add(new THREE.Mesh(this.tailGeometry, finMaterial));
             return group;
        } 

        bodyMesh = new THREE.SkinnedMesh(this.bodyGeometry, bodyMaterial);
        tailMesh = new THREE.SkinnedMesh(this.tailGeometry, finMaterial);
        dorsalMesh = new THREE.SkinnedMesh(this.dorsalFinGeometry, finMaterial);

        // 3. CLONE THE SKELETON
        const skeleton = this.skeleton.clone();
        
        bodyMesh.bind(skeleton);
        tailMesh.bind(skeleton);
        dorsalMesh.bind(skeleton);

        const group = new THREE.Group();
        group.add(bodyMesh, tailMesh, dorsalMesh);
        
        group.add(skeleton.bones[0]); 

        return { mesh: group, skeleton: skeleton };
    }

	initLowResBody() {
		const vertices = new Float32Array([
			0, -0.4 * this.fatFishRatio, 0,  // v0 bottom spine
			0, 0.4 * this.fatFishRatio, 0,   // v1 top spine
			0, 0, -1.5 * this.bodyLenRatio    // v2 back/tail
		]);

		const indices = [
			0, 2, 1,
			0, 1, 2,
		];

		const uvs = new Float32Array([
			0.5, 0.0, // v0 bottom spine
			0.5, 1.0, // v1 top spine
			0.0, 0.5  // v2 back/tail
		]);

		this.bodyGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
		this.bodyGeometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
		this.bodyGeometry.setIndex(indices);
		this.bodyGeometry.computeVertexNormals();
	}


	initBody() {
		const vertices = new Float32Array([
			0, 0, 0.5 * this.bodyLenRatio,    // v0: Nose
			0.3 * this.fatFishRatio, 0, -0.1, // v1: Right fin
			0, 0.4 * this.fatFishRatio, 0,    // v2: Top Spine
			0, -0.4 * this.fatFishRatio, 0,   // v3: Bottom Spine
			-0.3 * this.fatFishRatio, 0, -0.1,// v4: Left fin
			0, 0, -1.5 * this.bodyLenRatio,   // v5: Tail
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

		const uvs = new Float32Array([
			0.5, 1.0, // v0: Nose
			1.0, 0.5, // v1: Right fin
			0.5, 0.75, // v2: Top Spine
			0.5, 0.25, // v3: Bottom Spine
			0.0, 0.5, // v4: Left fin
			0.5, 0.0  // v5: Tail
		]);

		this.bodyGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
		this.bodyGeometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
		this.bodyGeometry.setIndex(indices);
		this.bodyGeometry.computeVertexNormals();
	}

	initTail() {
		const vertices = new Float32Array([
			0, 0, -1.5 * this.bodyLenRatio,           // v0 back spine tip
			0, 0, -1.7 * this.finSizeRatio,           // v1 tail bone tip
			0, 0.5 * this.finSizeRatio, -2 * this.finSizeRatio, // v2 tail top tip 
			0, -0.5 * this.finSizeRatio, -2 * this.finSizeRatio // v3 tail bottom tip	
		]);

		const indices = [
			0, 1, 2,
			0, 3, 1,
			1, 0, 2,
			1, 3, 0,
		];


		const uvs = new Float32Array([
			0.5, 0.5, // v0 back spine tip
			0.5, 0.25, // v1 tail bone tip
			0.5, 1.0, // v2 tail top tip
			0.5, 0.0  // v3 tail bottom tip
		]);

		this.tailGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
		this.tailGeometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
		this.tailGeometry.setIndex(indices);
		this.tailGeometry.computeVertexNormals();
	}


	initLowResTail() {
		const vertices = new Float32Array([
			0, 0, -1.5 * this.bodyLenRatio,          // v0 back spine tip
			0, 0.5 * this.finSizeRatio, -2 * this.finSizeRatio,  // v1 top tip
			0, -0.5 * this.finSizeRatio, -2 * this.finSizeRatio  // v2 bottom tip
		]);

		const indices = [
			0, 2, 1,
			0, 1, 2
		];

		const uvs = new Float32Array([
			0.5, 0.5, // v0 back spine tip
			0.5, 1.0, // v1 top tip
			0.5, 0.0  // v2 bottom tip
		]);

		this.tailGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
		this.tailGeometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
		this.tailGeometry.setIndex(indices);
		this.tailGeometry.computeVertexNormals();
	}

	initDorsalFin() {
		const vertices = new Float32Array([
			0, 0.4 * this.fatFishRatio, 0,       // v0 face top
			0, 0, -1.5 * this.bodyLenRatio,       // v1 back spine tip
			0, 0.2, -1.2 * this.bodyLenRatio,     // v2 dorsal fin back tip
			0, 0.6, -0.2 * this.bodyLenRatio      // v3 dorsal fin front tip
		]);

		const indices = [
			0, 1, 2,
			0, 2, 3,
			0, 3, 2,
			0, 2, 1,
		];

		const uvs = new Float32Array([
			0.5, 1.0, // v0 face top
			0.5, 0.0, // v1 back spine tip
			0.25, 0.25, // v2 dorsal fin back tip
			0.75, 0.75  // v3 dorsal fin front tip
		]);

		this.dorsalFinGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
		this.dorsalFinGeometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
		this.dorsalFinGeometry.setIndex(indices);
		this.dorsalFinGeometry.computeVertexNormals();
	}


	// --- Skeleton setup ---
	initSkeleton() {
		const bone0 = new THREE.Bone(); // head
		const bone1 = new THREE.Bone(); // middle
		const bone2 = new THREE.Bone(); // tail

		bone0.position.set(0, 0, 0);
		bone1.position.set(0, 0, -0.75 * this.bodyLenRatio);
		bone2.position.set(0, 0, -1.5 * this.bodyLenRatio);

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
