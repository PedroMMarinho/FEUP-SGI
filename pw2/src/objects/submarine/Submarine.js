import * as THREE from 'three';
import { TextureManager } from '../../managers/TextureManager.js';

export class Submarine extends THREE.Object3D {
	constructor(propellerBladeModel, lodLevel, lightControls = null) {
		super();
		this.width = 7.42;
		this.height = 1.5;
		this.color = 0x000000;

		this.propellerBladeObject = propellerBladeModel.scene;
		this.lightControls = lightControls

		this.cutNumber = lodLevel == 0 ? 64 : lodLevel == 1 ? 16 : lodLevel == 2 ? 4 : 1;

		// --- Groups ---
		this.bodyGroup = new THREE.Group();
		this.finGroup = new THREE.Group();
		this.motorGroup = new THREE.Group();
		this.upperBodyGroup = new THREE.Group();


		this.clock = new THREE.Clock();

		// Add both groups to the main object
		this.add(this.bodyGroup);
		this.add(this.finGroup);
		this.add(this.motorGroup);
		this.add(this.upperBodyGroup);

		this.glassDome = null;

		this.init();
	}

	// ========== INITIALIZATION ==========
	init() {
		this.initMaterials();
		this.createBody();
		this.addRectangleFins();
		this.addEllipticalFins();
		this.createMotorPropeller();
		this.createBodyTopDetails();
	}

	initMaterials() {
		this.textureManager = TextureManager.getInstance();
		// Load textures
		const normalTex = this.textureManager.getTexture('metal_NRM');
		const specTex = this.textureManager.getTexture('metal_SPEC');
		const aoTex = this.textureManager.getTexture('metal_OCC');

		const roughnessTex = this.textureManager.getTexture('metal_roughness');
		const metalNormal = this.textureManager.getTexture('metal_normal');
		const metalColor = this.textureManager.getTexture('metal_color');
		const metalMetalness = this.textureManager.getTexture('metal_metalness');

		this.bodyMaterial = new THREE.MeshPhysicalMaterial({
			color: new THREE.Color(0x111111),
			normalMap: normalTex,
			metalnessMap: specTex,
			aoMap: aoTex,
			metalness: 0.1,
			roughness: 0.4,
			normalScale: new THREE.Vector2(0.5, 0.5),
			ior: 1.5,
			side: THREE.DoubleSide,
		});


		this.finMaterial = new THREE.MeshPhysicalMaterial({
			map: metalColor,
			metalnessMap: metalMetalness,
			roughnessMap: roughnessTex,
			normalMap: metalNormal,
			metalness: 0.82,
			ior: 1.5,
			side: THREE.DoubleSide,
		});
		this.motorMaterial = this.finMaterial.clone();

		this.glassMaterial = new THREE.MeshPhysicalMaterial({
			color: 0xffffff,
			transparent: true,
			opacity: 0.15,
			roughness: 0.05,
			metalness: 0.0,
			thickness: 0.2,
			side: THREE.DoubleSide,
		});

		this.yellowLensMaterial = new THREE.MeshPhongMaterial({
			color: this.lightControls.frontLightColor,
			emissive: this.lightControls.frontLightColor,     
			emissiveIntensity: 8,
        });


	}


	// ========== BODY CREATION ==========
	createBody() {
		this.createBodyCore();
		this.createFrontLight();
		this.createBodyRearAssembly();
		this.createTampSemiCircleRingGeometry();
	}

	createFrontLight() {
		this.frontLight = new THREE.SpotLight(
			this.lightControls.frontLightColor,
			this.lightControls.frontLightIntensity
		);

		const domeBaseZ = -(this.width / 2 + this.height / 2);
		const domeRadius = 1.31 * this.height / 2;
		const domeLength = domeRadius * 1.932;
		const tipZ = domeBaseZ - domeLength;

		this.frontLight.castShadow = true;
		this.frontLight.shadow.mapSize.width = 1024;
		this.frontLight.shadow.mapSize.height = 1024;
		this.frontLight.shadow.bias = -0.0001;

		this.frontLight.distance = this.lightControls.frontLightDistance;
		this.frontLight.decay = 0.8;
		this.frontLight.angle = Math.PI / 3;
		this.frontLight.penumbra = 0.5;

		this.frontLight.position.set(0, 0, tipZ - 0.001);

		this.frontLight.target.position.set(0, -6, tipZ - 20 - 0.001);

		// Helpers
		
		//this.frontLightHelper = new THREE.SpotLightHelper(this.frontLight);

		// Add to group
		this.bodyGroup.add(this.frontLight);
		//this.bodyGroup.add(this.frontLightHelper);
		this.bodyGroup.add(this.frontLight.target);


		const mainRadius = this.height / 12;
		const tubeThick = 0.01;
		const ringTipZ = tipZ + 0.006;
		const ringGeo = new THREE.TorusGeometry(mainRadius, tubeThick, this.cutNumber, this.cutNumber);
		const ringMesh = new THREE.Mesh(ringGeo, this.finMaterial);

		ringMesh.position.set(0, 0, ringTipZ);

		this.bodyGroup.add(ringMesh);
		
		const screenRadius = mainRadius - (tubeThick / 2);
		const circleGeo = new THREE.CircleGeometry(screenRadius, this.cutNumber);

		const screenMesh = new THREE.Mesh(circleGeo, this.yellowLensMaterial);

		screenMesh.position.set(0, 0, ringTipZ - tubeThick * 0.8);

		screenMesh.rotation.y = Math.PI;

		this.bodyGroup.add(screenMesh);
	}

	createBodyCore() {
		// Capsule body
		const bodyGeometry = new THREE.CapsuleGeometry(this.height / 2, this.width, this.cutNumber, this.cutNumber, this.cutNumber);
		const bodyMesh = new THREE.Mesh(bodyGeometry, this.bodyMaterial);
		bodyMesh.rotation.x = Math.PI / 2;
		bodyMesh.scale.set(1.31, 1, 1.31);
		bodyMesh.position.set(0, 0, -0.8);
		this.bodyGroup.add(bodyMesh);
		this.body = bodyMesh;

		// Front dome
		const frontGeometry = new THREE.SphereGeometry(1.31 * this.height / 2, this.cutNumber, this.cutNumber, 0, Math.PI * 2, 0, Math.PI / 2);
		const frontMesh = new THREE.Mesh(frontGeometry, this.bodyMaterial);
		frontMesh.position.set(0, 0, -(this.width / 2 + this.height / 2));
		frontMesh.rotation.x = -Math.PI / 2;
		frontMesh.scale.set(1, 1.932, 1);
		this.bodyGroup.add(frontMesh);

		// Back dome
		const backGeometry = new THREE.SphereGeometry(1.31 * this.height / 2, this.cutNumber, this.cutNumber, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
		const backMesh = new THREE.Mesh(backGeometry, this.bodyMaterial);
		backMesh.position.set(0, 0, this.width / 2 - 0.8);
		backMesh.rotation.x = -Math.PI / 2;
		backMesh.scale.set(1, 4.85, 1);
		this.bodyGroup.add(backMesh);
	}

	createBodyRearAssembly() {
		// Cylinder extension
		const cylinderHeight = this.height / 6 + 0.02;
		const backExtensionGeometry = new THREE.CylinderGeometry(
			this.height / 12,
			0.368 * this.height / 2 + 0.008,
			cylinderHeight,
			this.cutNumber
		);
		const backExtensionMesh = new THREE.Mesh(backExtensionGeometry, this.bodyMaterial);
		backExtensionMesh.rotation.x = Math.PI / 2;

		const backDomeRadius = 1.31 * this.height / 2 * 4.85;
		const backDomeEndZ = (this.width / 2 - 0.8) + backDomeRadius;
		backExtensionMesh.position.set(0, 0, backDomeEndZ - cylinderHeight / 4);
		this.bodyGroup.add(backExtensionMesh);

		// Torus ring
		const torusTubeSize = 0.008;
		const torusGeometry = new THREE.TorusGeometry(this.height / 12, torusTubeSize, this.cutNumber, this.cutNumber);
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
			this.cutNumber
		);
		const secondCylinderMesh = new THREE.Mesh(secondCylinderGeometry, this.bodyMaterial);
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
		this.createFinElipticalCylinder({ side: "right" });
		this.createFinElipticalCylinder({ side: "left" });

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

		// Top rear fin
		this.createFinElipticalCylinder({
			side: "right",
			position: { x: -0.618, y: 1.44, z: -2.338 },
			rotation: { x: 0, y: 0, z: 0 },
			scale: { x: 0.6, y: 1, z: 4.1 },
		});
		this.createFinElipticalCylinder({
			side: "left",
			position: { x: 0.618, y: 1.44, z: -2.338 },
			rotation: { x: 0, y: 0, z: 0 },
			scale: { x: 0.6, y: 1, z: 4.1 },
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
			steps: this.cutNumber,
			depth: 0.05,
			bevelEnabled: false,
		});
		extrudeGeometry.computeVertexNormals();
		const extrudedDiamond = new THREE.Mesh(extrudeGeometry, this.bodyMaterial);

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
		side = "right",
		position = { x: 0, y: 0, z: -3.21 },
		rotation = { x: 0, y: 0, z: 0 },
		scale = { x: 0.6, y: 1, z: 4.1 },
	}) {
		const finGeometry = new THREE.CylinderGeometry(
			this.height / 16,
			this.height / 16,
			this.height / 2 + 0.1,
			this.cutNumber
		);
		const finMesh = new THREE.Mesh(finGeometry, this.finMaterial);

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
			steps: this.cutNumber,
			depth: 0.6,
			bevelEnabled: false,

		};

		const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
		geometry.computeVertexNormals();
		const mesh = new THREE.Mesh(geometry, this.bodyMaterial);
		mesh.position.set(0, -0.04, - (this.width / 2 + this.height / 2) - 0.49);
		mesh.rotation.x = - Math.PI / 40;
		this.bodyGroup.add(mesh);
	}

	createMotorPropeller() {
		this.createMotor();
	}

	createMotor() {
		this.createMotorCylinder();
		this.createMotorSupportLathe();
		this.createMotorBalls();
		this.createCurvedBlade();
	}

	createMotorCylinder() {
		const motorGeometry = new THREE.CylinderGeometry(
			this.height / 18,
			this.height / 18,
			this.height / 3,
			this.cutNumber
		);
		const motorMesh = new THREE.Mesh(motorGeometry, this.finMaterial);
		motorMesh.rotation.x = Math.PI / 2;
		motorMesh.position.set(0, 0, this.width + (this.height / 6));
		this.motorGroup.add(motorMesh);
	}

	createMotorSupportLathe() {
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
		const geometry = new THREE.LatheGeometry(points, this.cutNumber, 0, Math.PI * 2);
		const lathe = new THREE.Mesh(geometry, this.motorMaterial);
		lathe.rotation.x = -Math.PI / 2;
		const baseRadiusPos = this.height / 10;
		lathe.position.set(0, 0, this.width + baseRadiusPos + 0.67);
		this.motorGroup.add(lathe);
	}

	createMotorBalls() {
		const ballGeometry = new THREE.SphereGeometry(this.height / 34, this.cutNumber, this.cutNumber);
		const rotationOffset = Math.PI / 5;
		const ballRadius = this.height / 10;

		for (let i = 0; i < 6; i++) {
			const angle = (i / 6) * Math.PI * 2 + rotationOffset;
			const x = ballRadius * Math.cos(angle);
			const y = ballRadius * Math.sin(angle);
			const ballMesh = new THREE.Mesh(ballGeometry, this.motorMaterial);
			ballMesh.position.set(x, y, this.width + ballRadius + 0.646);
			this.motorGroup.add(ballMesh);
		}
	}

	createCurvedBlade() {
		const bladeCount = 5;
		const basePos = new THREE.Vector3(0.324, 0.396, 8.106);
		const spacing = (2 * Math.PI) / bladeCount;

		this.propellerBladeObject.traverse((child) => {
			if (child.isMesh) {
				child.material = this.motorMaterial;
			}
		});

		for (let i = 0; i < bladeCount; i++) {
			const pivot = new THREE.Object3D();
			pivot.position.set(0, 0, 0);

			const blade = this.propellerBladeObject.clone();
			blade.material = this.motorMaterial;
			blade.position.copy(basePos);
			pivot.add(blade);

			pivot.rotation.z = i * spacing;
			this.motorGroup.add(pivot);
		}
	}

	createBodyTopDetails() {
		this.createBodyTopBase();
		this.createTopCylinders();
		this.createFrontCylinder();
		this.createWaterTanks();
		this.createScopeBody();
		this.createVisionScope();
		this.addHatch();
	}

	addHatch() {
		const hatchRadius = this.height / 7;
		const hatchGeometry = new THREE.CylinderGeometry(hatchRadius, hatchRadius, 0.05, this.cutNumber);
		const hatchMesh = new THREE.Mesh(hatchGeometry, this.finMaterial);
		hatchMesh.position.set(0, 1.6, -2.66);
		this.upperBodyGroup.add(hatchMesh);

		// Semicircle using SphereGeometry
		const semicircleRadius = hatchRadius * 0.9;
		const semicircleGeometry = new THREE.SphereGeometry(
			semicircleRadius,
			this.cutNumber,
			this.cutNumber,
			0,
			Math.PI * 2,
			0,
			Math.PI / 2
		);
		const semicircleMesh = new THREE.Mesh(semicircleGeometry, this.finMaterial);
		semicircleMesh.position.set(0, 1.6, -2.66);
		this.upperBodyGroup.add(semicircleMesh);

		const handleGroup = new THREE.Group();
		const outerTorusGeometry = new THREE.TorusGeometry(hatchRadius * 0.58, 0.01, this.cutNumber, this.cutNumber);
		const outerTorus = new THREE.Mesh(outerTorusGeometry, this.finMaterial);
		handleGroup.add(outerTorus);
		const innerTorusGeometry = new THREE.TorusGeometry(hatchRadius * 0.3, 0.01, this.cutNumber, this.cutNumber);
		const innerTorus = new THREE.Mesh(innerTorusGeometry, this.finMaterial);
		handleGroup.add(innerTorus);
		const circleGeometry = new THREE.CircleGeometry(hatchRadius * 0.3, this.cutNumber);
		const circleMesh = new THREE.Mesh(circleGeometry, this.bodyMaterial);
		handleGroup.add(circleMesh);
		const numCylinders = 5;
		const outerRadius = hatchRadius * 0.58;
		const innerRadius = hatchRadius * 0.3;
		const connectionLength = outerRadius - innerRadius;
		for (let i = 0; i < numCylinders; i++) {
			const angle = (i / numCylinders) * Math.PI * 2;
			const cylinderGeometry = new THREE.CylinderGeometry(0.008, 0.008, connectionLength, this.cutNumber);
			const cylinder = new THREE.Mesh(cylinderGeometry, this.bodyMaterial);
			const midRadius = (outerRadius + innerRadius) / 2;
			cylinder.position.x = Math.cos(angle) * midRadius;
			cylinder.position.y = Math.sin(angle) * midRadius;
			cylinder.rotation.z = angle + Math.PI / 2;
			handleGroup.add(cylinder);
		}
		// Position handle at the top of the hemisphere
		handleGroup.position.set(0, 1.6 + semicircleRadius, -2.66);
		handleGroup.rotation.x = Math.PI / 2;
		this.upperBodyGroup.add(handleGroup);
	}

	createVisionScope() {
		// --- Base cylinder ---
		const geometry = new THREE.CylinderGeometry(1, 1, 1, this.cutNumber);
		const visionCylinder = new THREE.Mesh(geometry, this.finMaterial);
		visionCylinder.position.set(0, 2.2, -1.975);
		visionCylinder.scale.set(0.073, 0.97, 0.12);

		// --- Side cylinders ---
		const sideCylinderGeometry = new THREE.CylinderGeometry(1, 1, 1, this.cutNumber);

		const sideCylinder1 = new THREE.Mesh(sideCylinderGeometry, this.finMaterial);
		sideCylinder1.rotation.x = Math.PI / 2;
		sideCylinder1.scale.set(0.45, 1.3, 0.03);
		sideCylinder1.position.set(0.05, 0.32, -1.61);
		visionCylinder.add(sideCylinder1);

		const sideCylinder2 = new THREE.Mesh(sideCylinderGeometry, this.finMaterial);
		sideCylinder2.rotation.x = Math.PI / 2;
		sideCylinder2.scale.set(0.38, 1.3, 0.022);
		sideCylinder2.position.set(0.05, 0.32, -1.7);
		visionCylinder.add(sideCylinder2);

		// --- Transparent glass dome (half-sphere) ---
		const glassGeometry = new THREE.SphereGeometry(1, this.cutNumber, this.cutNumber, 0, Math.PI * 2, 0, Math.PI / 2);

		const glassDome = new THREE.Mesh(glassGeometry, this.glassMaterial);
		glassDome.rotation.x = Math.PI;
		glassDome.position.set(0, -0.35, 0);
		glassDome.scale.set(1.14, 0.38, 1.3);
		sideCylinder2.add(glassDome);
		this.glassDome = glassDome;

		// --- Tube connection to the main body ---
		const tubeGeometry = new THREE.CylinderGeometry(1, 1, 1, this.cutNumber);
		const tubeMesh = new THREE.Mesh(tubeGeometry, this.finMaterial);
		tubeMesh.position.set(0, 0.52, 0.32);
		tubeMesh.scale.set(0.54, 0.52, 0.36);
		visionCylinder.add(tubeMesh);

		this.upperBodyGroup.add(visionCylinder);
	}



	createScopeBody() {
		// --- Base cylinder ---
		const geometry = new THREE.CylinderGeometry(1, 1, 1, this.cutNumber);
		const scopeCylinder = new THREE.Mesh(geometry, this.bodyMaterial);
		scopeCylinder.scale.set(0.39, 1.09, 0.98);
		scopeCylinder.position.set(0, 1.05, -2.33);
		this.upperBodyGroup.add(scopeCylinder);

		// --- Hollow outer shell on top ---
		const shellGeometry = new THREE.CylinderGeometry(1, 1, 1, this.cutNumber, 1, true);
		const shellMesh = new THREE.Mesh(shellGeometry, this.bodyMaterial);
		shellMesh.scale.set(0.39 + 0.00001, 1.5, 0.98 + 0.00001);
		shellMesh.position.set(
			scopeCylinder.position.x,
			scopeCylinder.scale.y,
			scopeCylinder.position.z
		);
		this.upperBodyGroup.add(shellMesh);

		const innerMesh = new THREE.Mesh(shellGeometry, this.bodyMaterial);
		innerMesh.scale.set(0.32, 1.5, 0.85);
		innerMesh.position.copy(shellMesh.position);
		this.upperBodyGroup.add(innerMesh);

		const ringGeometry = new THREE.RingGeometry(0.32, 0.39, this.cutNumber);
		const ringMesh = new THREE.Mesh(ringGeometry, this.bodyMaterial);
		ringMesh.rotation.x = Math.PI / 2;
		ringMesh.scale.set(1, 0.98 / 0.39, 1);
		ringMesh.position.set(
			shellMesh.position.x,
			shellMesh.position.y + (1.5 / 2),
			shellMesh.position.z
		);
		this.upperBodyGroup.add(ringMesh);
	}


	createWaterTanks() {
		const makeTank = () => {
			const group = new THREE.Group();
			const radius = this.height / 8;
			const height = this.height / 2 + 0.2;

			// --- Cylinder core ---
			const cylinderGeometry = new THREE.CylinderGeometry(radius, radius, height, this.cutNumber);
			const cylinderMesh = new THREE.Mesh(cylinderGeometry, this.bodyMaterial);
			group.add(cylinderMesh);

			// --- Top hemisphere ---
			const sphereGeometryTop = new THREE.SphereGeometry(radius, this.cutNumber, this.cutNumber, 0, Math.PI * 2, 0, Math.PI / 2);
			const sphereTop = new THREE.Mesh(sphereGeometryTop, this.bodyMaterial);
			sphereTop.position.y = height / 2;
			group.add(sphereTop);

			// --- Bottom hemisphere ---
			const sphereGeometryBottom = new THREE.SphereGeometry(radius, this.cutNumber, this.cutNumber, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
			const sphereBottom = new THREE.Mesh(sphereGeometryBottom, this.bodyMaterial);
			sphereBottom.position.y = -height / 2;
			group.add(sphereBottom);

			return group;
		};

		const tank1 = makeTank();
		tank1.position.set((this.height / 1.85 + 0.1) / 4, 1.06, -0.18);
		tank1.rotation.x = Math.PI / 2;
		this.upperBodyGroup.add(tank1);

		const tank2 = tank1.clone(true);
		tank2.position.x *= -1;
		this.upperBodyGroup.add(tank2);
	}


	createFrontCylinder() {
		const cylinderHeight = 0.3;
		const cylinderRadius = this.height / 22;

		// --- Cylinder ---
		const geometry = new THREE.CylinderGeometry(
			cylinderRadius,
			cylinderRadius,
			cylinderHeight,
			this.cutNumber
		);
		const frontCylinder = new THREE.Mesh(geometry, this.finMaterial);

		// Position the cylinder
		frontCylinder.position.set(0, 1.03, -4.1);
		this.upperBodyGroup.add(frontCylinder);

		// --- Lathe top cap ---
		const lathePoints = [
			new THREE.Vector2(0, 0.05),
			new THREE.Vector2(cylinderRadius * 0.3, 0.05),
			new THREE.Vector2(cylinderRadius * 1, 0),
		];
		const latheGeometry = new THREE.LatheGeometry(lathePoints, this.cutNumber);
		latheGeometry.computeVertexNormals();

		const latheMesh = new THREE.Mesh(latheGeometry, this.finMaterial);

		const cylinderTopY = 1.03 + cylinderHeight / 2;
		latheMesh.position.set(0, cylinderTopY, -4.1);

		this.upperBodyGroup.add(latheMesh);


		// --- Front smaller cylinder ---
		const semiSphereRadius = this.height / 14;
		const smallCylinderHeight = semiSphereRadius;
		const sphereGeometry = new THREE.CylinderGeometry(
			semiSphereRadius,
			semiSphereRadius,
			smallCylinderHeight,
			this.cutNumber
		);
		const sphereMesh = new THREE.Mesh(sphereGeometry, this.finMaterial);

		// The smaller cylinder's center position
		sphereMesh.position.set(0, cylinderTopY - 0.12, -3.61);
		this.upperBodyGroup.add(sphereMesh);

		const otherLathePoints = [
			new THREE.Vector2(0, 0.07),
			new THREE.Vector2(semiSphereRadius * 0.5, 0.07),
			new THREE.Vector2(semiSphereRadius * 0.7, 0.05),
			new THREE.Vector2(semiSphereRadius * 1, 0),
		];
		const otherLatheGeometry = new THREE.LatheGeometry(otherLathePoints, this.cutNumber);
		otherLatheGeometry.computeVertexNormals();

		const otherLatheMesh = new THREE.Mesh(otherLatheGeometry, this.finMaterial);

		const smallCylinderTopY = sphereMesh.position.y + smallCylinderHeight / 2;
		otherLatheMesh.position.set(0, smallCylinderTopY, -3.61);

		this.upperBodyGroup.add(otherLatheMesh);


	}


	createTopCylinders() {
		const cylinderHeight = 0.05;
		const cylinderRadius = this.height / 18;


		const geometry = new THREE.CylinderGeometry(cylinderRadius, cylinderRadius, cylinderHeight, this.cutNumber);
		// BackMost cylinder
		const blackCylinder = new THREE.Mesh(geometry, this.bodyMaterial);
		blackCylinder.position.set(0, 1.05, 4.14 + cylinderHeight / 2);
		this.upperBodyGroup.add(blackCylinder);

		// Grey cylinders
		const positions = [
			{ x: 0, y: 0, z: 1.864 },
			{ x: 0, y: 0, z: 1.462 },
		];
		positions.forEach((pos) => {
			const greyCylinder = new THREE.Mesh(geometry, this.finMaterial);
			greyCylinder.position.set(pos.x, pos.y + 1.05, pos.z + cylinderHeight / 2);
			this.upperBodyGroup.add(greyCylinder);
		});

	}


	createBodyTopBase() {
		const shapeWidth = this.height / 1.85 + 0.1;
		const shapeHeight = this.width + 0.4;
		const topRadius = shapeWidth / 2;

		const shape = new THREE.Shape();

		shape.moveTo(-topRadius, 0);

		shape.lineTo(topRadius, 0);

		shape.lineTo(topRadius, shapeHeight);

		shape.absarc(0, shapeHeight, topRadius, 0, Math.PI, false);

		shape.lineTo(-topRadius, 0);

		const extrudeSettings = {
			steps: this.cutNumber,
			depth: 0.2,
			bevelEnabled: true,
			bevelSegments: this.cutNumber,
		};

		const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
		geometry.computeVertexNormals();
		geometry.normalizeNormals();

		const mesh = new THREE.Mesh(geometry, this.bodyMaterial);
		mesh.rotation.x = Math.PI / 2;
		mesh.position.set(0, 0.854, -3.78);
		this.upperBodyGroup.add(mesh);
	}

	getSubmarineCameraPosition() {
		const worldPos = this.glassDome.getWorldPosition(new THREE.Vector3());

		const worldQuat = this.getWorldQuaternion(new THREE.Quaternion());

		const forwardOffset = new THREE.Vector3(0, 0, -0.5);
		forwardOffset.applyQuaternion(worldQuat);

		worldPos.add(forwardOffset);

		return worldPos;
	}

	updateLights() {
    const lc = this.lightControls;

    if (this.frontLight) {
		// Change lamp emissive color and intensity
		this.yellowLensMaterial.emissive = new THREE.Color(lc.frontLightColor);
		this.yellowLensMaterial.emissiveIntensity = lc.frontLightIntensity * 0.5;
		this.yellowLensMaterial.color = new THREE.Color(lc.frontLightColor);
		// Update spotlight properties
        this.frontLight.color.set(lc.frontLightColor);
        this.frontLight.intensity = lc.frontLightIntensity;
        this.frontLight.distance = lc.frontLightDistance;
    }

    if (this.warningLight) {
        this.warningLight.intensity = lc.warningLightIntensity;
    }
}

}
