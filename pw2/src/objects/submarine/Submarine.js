import * as THREE from 'three';

export class Submarine extends THREE.Object3D {
	constructor(width = 7.42, height = 1.5, color = 0x000000) {
		super();
		this.width = width;
		this.height = height;
		this.color = color;

		// --- Groups ---
		this.bodyGroup = new THREE.Group();
		this.finGroup = new THREE.Group();

		// Add both groups to the main object
		this.add(this.bodyGroup);
		this.add(this.finGroup);

		this.init();
	}

	// ========== INITIALIZATION ==========
	init() {
		this.initMaterials();
		this.createBody();
		this.addRectangleFins();
		this.addEllipticalFins();
	}

	initMaterials() {
		this.bodyMaterial = new THREE.MeshPhongMaterial({ color: this.color });
		this.finMaterial = new THREE.MeshPhongMaterial({
			color: 0x555555,
			side: THREE.DoubleSide,
		});
	}

	// ========== BODY CREATION ==========
	createBody() {
		// Capsule body
		const bodyGeometry = new THREE.CapsuleGeometry(this.height / 2, this.width, 64, 64, 64);
		const bodyMesh = new THREE.Mesh(bodyGeometry, this.bodyMaterial);
		bodyMesh.rotation.x = Math.PI / 2;
		bodyMesh.scale.set(1.31, 1, 1.31);
		bodyMesh.position.set(0, 0, -0.8);
		this.bodyGroup.add(bodyMesh);
		this.body = bodyMesh;

		// Front dome
		const frontGeometry = new THREE.SphereGeometry(1.31 * this.height / 2, 64, 64, 0, Math.PI * 2, 0, Math.PI / 2);
		const frontMesh = new THREE.Mesh(frontGeometry, this.bodyMaterial);
		frontMesh.position.set(0, 0, -(this.width / 2 + this.height / 2));
		frontMesh.rotation.x = -Math.PI / 2;
		frontMesh.scale.set(1, 1.932, 1);
		this.bodyGroup.add(frontMesh);

		// Back dome
		const backGeometry = new THREE.SphereGeometry(1.31 * this.height / 2, 64, 64, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
		const backMesh = new THREE.Mesh(backGeometry, this.bodyMaterial);
		backMesh.position.set(0, 0, this.width / 2 - 0.8);
		backMesh.rotation.x = -Math.PI / 2;
		backMesh.scale.set(1, 4.85, 1);
		this.bodyGroup.add(backMesh);

		// Cylinder extension
		const cylinderHeight = this.height / 6 + 0.02;
		const backExtensionGeometry = new THREE.CylinderGeometry(
			this.height / 12,
			0.368 * this.height / 2 + 0.008,
			cylinderHeight,
			64
		);
		const backExtensionMesh = new THREE.Mesh(backExtensionGeometry, this.finMaterial);
		backExtensionMesh.rotation.x = Math.PI / 2;

		const backDomeRadius = 1.31 * this.height / 2 * 4.85;
		const backDomeEndZ = (this.width / 2 - 0.8) + backDomeRadius;
		backExtensionMesh.position.set(0, 0, backDomeEndZ - cylinderHeight / 4);
		this.bodyGroup.add(backExtensionMesh);

		// Torus ring
		const torusTubeSize = 0.008;
		const torusGeometry = new THREE.TorusGeometry(this.height / 12, torusTubeSize, 16, 100);
		const torusMesh = new THREE.Mesh(torusGeometry, this.bodyMaterial);
		const firstCylinderEndZ = backExtensionMesh.position.z + cylinderHeight / 2;
		torusMesh.position.set(0, 0, firstCylinderEndZ);
		this.bodyGroup.add(torusMesh);

		// Second cylinder
		const secondCylinderHeight = this.height / 8;
		const secondCylinderGeometry = new THREE.CylinderGeometry(
			this.height / 16,
			this.height / 12,
			secondCylinderHeight,
			64
		);
		const secondCylinderMesh = new THREE.Mesh(secondCylinderGeometry, this.finMaterial);
		secondCylinderMesh.rotation.x = Math.PI / 2;
		secondCylinderMesh.position.set(0, 0, firstCylinderEndZ - secondCylinderHeight / 2 + torusTubeSize);
		this.bodyGroup.add(secondCylinderMesh);
	}

	// ========== FIN MANAGEMENT ==========
	addRectangleFins() {
		this.createRectangleFin(+1); // right side
		this.createRectangleFin(-1); // left side
	}

	addEllipticalFins() {
		this.createFinElipticalCylinder(+1); // right side
		this.createFinElipticalCylinder(-1); // left side
	}

	createRectangleFin(side = 1) {
		const shapeWidth = 0.905;
		const shapeHeight = 0.21;
		const borderThickness = 0.03;

		const diamondShape = this.createHollowDiamondShape(shapeWidth, shapeHeight, borderThickness);
		const extrudeGeometry = new THREE.ExtrudeGeometry(diamondShape, {
			steps: 1,
			depth: 0.05,
			bevelEnabled: false,
		});

		const extrudeMaterial = new THREE.MeshStandardMaterial({
			color: 0x007bff,
			roughness: 0.5,
			metalness: 0.3,
			side: THREE.DoubleSide,
		});

		const extrudedDiamond = new THREE.Mesh(extrudeGeometry, extrudeMaterial);
		extrudedDiamond.position.set(side * (this.height / 2 + 0.225), 0, -3.21);
		extrudedDiamond.rotation.y = Math.PI / 2 * side;
		extrudedDiamond.rotateX(-Math.PI / 50);

		this.finGroup.add(extrudedDiamond);
	}

	createFinElipticalCylinder(side = 1) {
		const finGeometry = new THREE.CylinderGeometry(this.height / 16, this.height / 16, this.height / 2 + 0.1, 64);
		const finMesh = new THREE.Mesh(finGeometry, this.finMaterial);

		finMesh.rotation.z = Math.PI / 2;
		finMesh.rotation.y = side === -1 ? Math.PI : 0;

		finMesh.position.set(side * (this.height - 0.115), -0.01, -3.21);
		finMesh.scale.set(0.6, 1, 4.1);

		this.finGroup.add(finMesh);
	}

	createHollowDiamondShape(width, height, thickness) {
		const w2 = width / 2;
		const h2 = height / 2;
		const cornerX = width / 2.3;

		const shape = new THREE.Shape();
		shape.moveTo(-w2, 0);
		shape.lineTo(-cornerX, h2);
		shape.lineTo(cornerX, h2);
		shape.lineTo(w2, 0);
		shape.lineTo(cornerX, -h2);
		shape.lineTo(-cornerX, -h2);
		shape.closePath();

		const inner = new THREE.Path();
		const innerW2 = w2 - thickness;
		const innerH2 = h2 - thickness;
		const innerCornerX = cornerX - thickness * 0.7;

		inner.moveTo(-innerW2, 0);
		inner.lineTo(-innerCornerX, innerH2);
		inner.lineTo(innerCornerX, innerH2);
		inner.lineTo(innerW2, 0);
		inner.lineTo(innerCornerX, -innerH2);
		inner.lineTo(-innerCornerX, -innerH2);
		inner.closePath();

		shape.holes.push(inner);
		return shape;
	}
}
