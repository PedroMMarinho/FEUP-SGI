import * as THREE from 'three';
import { Fish } from './Rock.js';

export class FishLOD extends THREE.LOD {
	constructor(bodyColor, finColor) {
		super();
		this.bodyColor = bodyColor;
		this.finColor = finColor;
		this.distanceStart = 70;
		this.distanceOffset = 20;
		this.init();
	}

	init() {
		const normalFish = new Fish(0);
		const lowResFish = new Fish(1);

		const bodyMaterial = new THREE.MeshStandardMaterial(this.bodyColor);
		const finMaterial = new THREE.MeshStandardMaterial(this.bodyColor);

		// low res model
		const lowMesh = THREE.Group();
		const lowResBodyMesh = new THREE.Mesh(lowResFish.bodyGeometry, bodyMaterial);
		const lowResTailMesh = new THREE.Mesh(lowResFish.tailGeometry, finMaterial);
		lowMesh.add(lowResTailMesh, lowResBodyMesh);
		
		// high res model
		const hiMesh = THREE.Group();
		const highResBodyMesh = new THREE.Mesh(normalFish.bodyGeometry, bodyMaterial);
		const highResTailMesh = new THREE.Mesh(normalFish.tailGeometry, finMaterial);
		const highResDorsalMesh = new THREE.Mesh(normalFish.dorsalFinGeometry, finMaterial);
		hiMesh.add(highResBodyMesh, highResTailMesh, highResDorsalMesh);

		this.addLevel(hiMesh, this.distanceStart);
		this.addLevel(lowMesh, this.distanceStart + this.distanceOffset);
	}
}
