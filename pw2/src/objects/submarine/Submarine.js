import * as THREE from 'three';
import propellerData from './propeller_data.js'; // Make sure your bundler can import JSON

export class Submarine extends THREE.Object3D {
	constructor(width = 7.42, height = 1.5, color = 0x000000) {
		super();
		this.width = width;
		this.height = height;
		this.color = color;

		// --- Groups ---
		this.bodyGroup = new THREE.Group();
		this.finGroup = new THREE.Group();
		this.motorGroup = new THREE.Group();

		// Add both groups to the main object
		this.add(this.bodyGroup);
		this.add(this.finGroup);
		this.add(this.motorGroup);

		this.init();
	}

	// ========== INITIALIZATION ==========
	init() {
		this.initMaterials();
		this.createBody();
		this.addRectangleFins();
		this.addEllipticalFins();
		this.createTampSemiCircleRingGeometry();
		this.createMotorPropeller();
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
			this.height / 15,
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
		this.createRectangleFin({ side: "right" });
		this.createRectangleFin({ side: "left" });

		this.createRectangleFin({
			side: "top",
			position: { x: 0, y: -0.34, z: 6.62 },
			rotation: { x: Math.PI / 12, y: 0, z: - Math.PI / 2 },
		});
		this.createRectangleFin({
			side: "bottom",
			position: { x: 0, y: 0.34, z: 6.62 },
			rotation: { x: - Math.PI / 12, y: 0, z: Math.PI / 2 },
		});
		this.createRectangleFin({
			side: "left",
			position: { x: 0.4, y: 0, z: 6.62 },
			rotation: { x: 0, y: Math.PI / 13, z: - Math.PI / 110 },
		});
		this.createRectangleFin({
			side: "right",
			position: { x: -0.4, y: 0, z: 6.62 },
			rotation: { x: 0, y: - Math.PI / 13, z: Math.PI / 110 },
		});
	}

	addEllipticalFins() {
		this.createFinElipticalCylinder({ side: "right" }); // right side
		this.createFinElipticalCylinder({ side: "left" }); // left side

		this.createFinElipticalCylinder({
			side: "left",
			position: { x: 0.4, y: 0, z: 6.62 },
			rotation: { x: 0, y: - Math.PI / 140, z: - Math.PI / 110 },
			scale: { x: 0.6, y: 1.41, z: 4.1 },
		});
		this.createFinElipticalCylinder({
			side: "right",
			position: { x: -0.4, y: 0, z: 6.62 },
			rotation: { x: 0, y: Math.PI / 140, z: Math.PI / 110 },
			scale: { x: 0.6, y: 1.41, z: 4.1 },
		});
		this.createFinElipticalCylinder({
			side: "top",
			position: { x: 0, y: -0.255, z: 6.62 },
			rotation: { x: 0, y: 0, z: 0 },
			scale: { x: 0.6, y: 1.41, z: 4.1 },
		});
		this.createFinElipticalCylinder({
			side: "bottom",
			position: { x: 0, y: 0.255, z: 6.62 },
			rotation: { x: 0, y: 0, z: 0 },
			scale: { x: 0.6, y: 1.41, z: 4.1 },
		});
	}

	createRectangleFin({
		side = "right",
		position = { x: 0, y: 0, z: -3.21 },
		rotation = { x: 0, y: 0, z: 0 },
	}) {
		const shapeWidth = 0.905;
		const shapeHeight = 0.21;
		const borderThickness = 0.03;

		// Create the diamond shape
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

		// Base offset depending on the side
		const offset = this.height / 2 + 0.225;
		switch (side.toLowerCase()) {
			case "right":
				extrudedDiamond.position.set(offset, 0, 0);
				extrudedDiamond.rotation.y = Math.PI / 2;
				break;
			case "left":
				extrudedDiamond.position.set(-offset, 0, 0);
				extrudedDiamond.rotation.y = -Math.PI / 2;
				break;
			case "top":
				extrudedDiamond.position.set(0, offset, 0);
				extrudedDiamond.rotation.x = Math.PI / 2;
				break;
			case "bottom":
				extrudedDiamond.position.set(0, -offset, 0);
				extrudedDiamond.rotation.x = -Math.PI / 2;
				break;
			default:
				console.warn(`Unknown side: ${side}. Defaulting to right.`);
				extrudedDiamond.position.set(offset, 0, 0);
				extrudedDiamond.rotation.y = Math.PI / 2;
		}

		// Apply custom position and rotation overrides
		extrudedDiamond.position.add(new THREE.Vector3(position.x, position.y, position.z));
		extrudedDiamond.rotation.x += rotation.x;
		extrudedDiamond.rotation.y += rotation.y;
		extrudedDiamond.rotation.z += rotation.z;

		this.bodyGroup.add(extrudedDiamond);
	}




	createFinElipticalCylinder({
		side = "right", // "left", "right", "top", "bottom"
		position = { x: 0, y: 0, z: -3.21 },
		rotation = { x: 0, y: 0, z: 0 },
		scale = { x: 0.6, y: 1, z: 4.1 },
	}) {
		const finGeometry = new THREE.CylinderGeometry(
			this.height / 16,
			this.height / 16,
			this.height / 2 + 0.1,
			64
		);
		const finMesh = new THREE.Mesh(finGeometry, this.finMaterial);

		// Base rotation/orientation per side
		const offset = this.height - 0.115;
		switch (side.toLowerCase()) {
			case "right":
				finMesh.position.set(offset, 0, 0);
				finMesh.rotation.z = Math.PI / 2;
				finMesh.rotation.y = 0;
				break;
			case "left":
				finMesh.position.set(-offset, 0, 0);
				finMesh.rotation.z = Math.PI / 2;
				finMesh.rotation.y = Math.PI;
				break;
			case "top":
				finMesh.position.set(0, offset, 0);
				break;
			case "bottom":
				finMesh.position.set(0, -offset, 0);
				break;
			default:
				console.warn(`Unknown side: ${side}. Defaulting to right.`);
				finMesh.position.set(offset, 0, 0);
				finMesh.rotation.z = -Math.PI / 2;
		}

		// Apply custom offsets and transformations
		finMesh.position.add(new THREE.Vector3(position.x, position.y, position.z));
		finMesh.rotation.x += rotation.x;
		finMesh.rotation.y += rotation.y;
		finMesh.rotation.z += rotation.z;
		finMesh.scale.set(scale.x, scale.y, scale.z);
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

	createTampSemiCircleRingGeometry() {
		const shape = new THREE.Shape();
		const radiusOuter = 1;
		const radiusInner = 0.96;
		const angleStart = 3 * Math.PI / 8;
		const angleEnd = 5 * Math.PI / 8;
		shape.absarc(0, 0, radiusOuter, angleStart, angleEnd, false);
		shape.absarc(0, 0, radiusInner, angleEnd, angleStart, true);
		shape.closePath();

		const extrudeSettings = {
			steps: 1,
			depth: 0.6,
			bevelEnabled: false,
		};

		const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
		const mesh = new THREE.Mesh(geometry, this.finMaterial);
		mesh.position.set(0, -0.04, - (this.width / 2 + this.height / 2) - 0.49);
		mesh.rotation.x = - Math.PI / 40;
		this.bodyGroup.add(mesh);
	}

	createMotorPropeller() {
		this.createMotor();
	}

	createMotor() {
		// Motor cylinder
		const motorGeometry = new THREE.CylinderGeometry(
			this.height / 18,
			this.height / 18,
			this.height / 3,
			64
		);
		const motorMesh = new THREE.Mesh(motorGeometry, this.finMaterial);
		motorMesh.rotation.x = Math.PI / 2;
		motorMesh.position.set(0, 0, this.width + (this.height / 6));
		this.motorGroup.add(motorMesh);

		// Propeller support
		const totalHeight = this.height / 2;
		const baseRadius = this.height / 10;

		const points = [
			new THREE.Vector2(0, totalHeight / 2 - 0.55),
			new THREE.Vector2(baseRadius * 0.68, totalHeight / 2 - 0.53),
			new THREE.Vector2(baseRadius * 1.02, totalHeight / 2 - 0.4),
			new THREE.Vector2(baseRadius * 1.1, totalHeight / 2 - 0.3),
			new THREE.Vector2(baseRadius * 1.25, totalHeight / 2 - 0.1),
			new THREE.Vector2(baseRadius * 1.2, totalHeight / 2 - 0.05),
			new THREE.Vector2(this.height / 18, totalHeight / 2),
		];

		const geometry = new THREE.LatheGeometry(points, 64, 0, Math.PI * 2);
		const material = new THREE.MeshStandardMaterial({ color: 0x00ff00, metalness: 0.2, roughness: 0.5, side: THREE.DoubleSide });

		const lathe = new THREE.Mesh(geometry, material);
		lathe.rotation.x = -Math.PI / 2;
		lathe.position.set(0, 0, this.width + baseRadius + 0.67);

		this.motorGroup.add(lathe);
		// Propeller balls 6 around the support
		const ballGeometry = new THREE.SphereGeometry(this.height / 34, 32, 32);
		const ballMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000, metalness: 0.3, roughness: 0.4 });
		const rotationOffset = Math.PI / 5; // To stagger the balls
		const ballRadius = this.height / 10;
		for (let i = 0; i < 6; i++) {
			const angle = (i / 6) * Math.PI * 2 + rotationOffset;
			const x = ballRadius * Math.cos(angle);
			const y = ballRadius * Math.sin(angle);
			const ballMesh = new THREE.Mesh(ballGeometry, ballMaterial);
			ballMesh.position.set(x, y, this.width + baseRadius + 0.646);
			this.motorGroup.add(ballMesh);
		}

		this.createCurvedBlade();

	}

	createCurvedBlade() {
		const vertices = new Float32Array(propellerData.propellerData);
		const indices = new Uint16Array(propellerData.indices);

		const geometry = new THREE.BufferGeometry();
		geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
		geometry.setIndex(new THREE.BufferAttribute(indices, 1));
		geometry.computeVertexNormals();

		geometry.applyMatrix4(new THREE.Matrix4().compose(
			new THREE.Vector3(0.35, 0.397, 8.12),              
			new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, Math.PI / 4 , 0)), 
			new THREE.Vector3(0.369, 0.0704, 0.273)             
		));

		const material = new THREE.MeshStandardMaterial({ color: 0x555555, side: THREE.DoubleSide });
		const bladeMesh = new THREE.Mesh(geometry, material);

		for (let i = 0; i < 5; i++) {
			const bladeClone = bladeMesh.clone();
			const angle = (i / 5) * Math.PI * 2;
			bladeClone.rotation.z = angle;
			this.motorGroup.add(bladeClone);
		}

}



}
