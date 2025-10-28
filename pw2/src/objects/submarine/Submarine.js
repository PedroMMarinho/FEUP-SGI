import * as THREE from 'three';

export class Submarine extends THREE.Object3D {
	constructor(width = 9.5, height = 1.9, color = 0xff0000) {
		super();
		this.width = width;
		this.height = height;
		this.color = color;

		this.init();
        
	}

	init() {
        this.initMaterials();
		this.createBody();
		this.createHatch();
		this.createPeriscope();
		this.createFins();
	}

    initMaterials() {
        this.bodyMaterial = new THREE.MeshPhongMaterial({ color: this.color });
        this.finMaterial = new THREE.MeshPhongMaterial({ color: 0x555555, side: THREE.DoubleSide });
    }


	createBody() {
        // Capsule body
		const bodyGeometry = new THREE.CapsuleGeometry(this.height / 2, this.width, 64, 64, 64);
		const bodyMesh = new THREE.Mesh(bodyGeometry, this.bodyMaterial);
		bodyMesh.rotation.x = Math.PI / 2; 
		this.add(bodyMesh);
		this.body = bodyMesh;
        // Front dome
        const frontGeometry = new THREE.SphereGeometry(this.height/2, 64, 64, 0, Math.PI * 2, 0, Math.PI / 2);
        const frontMesh = new THREE.Mesh(frontGeometry, this.bodyMaterial);
        frontMesh.position.set(0, 0, -this.width / 2);
        frontMesh.rotateX(-Math.PI / 2);
        frontMesh.scale.set(1, 1.6, 1);
        this.add(frontMesh);
        // Back dome
        //const backGeometry = new THREE.SphereGeometry(this.height/2, 32, 32, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
        //const backMesh = new THREE.Mesh(backGeometry, this.bodyMaterial);
        //backMesh.position.set(0, 0, this.width / 2);
        //backMesh.rotateX(-Math.PI / 2);
        //backMesh.scale.set(1, 3, 1);
        //this.add(backMesh);
        // Using a cylinder for the back dome
        const backGeometry = new THREE.CylinderGeometry(this.height / 3, this.height / 2, this.height, 64);
        const backMesh = new THREE.Mesh(backGeometry, this.bodyMaterial);
        backMesh.position.set(0, 0, this.width / 2 + this.height / 3);
        backMesh.rotateX(Math.PI / 2);
        this.add(backMesh);
	}

	createHatch() {
		// Small vertical cylinder on top
		const hatchGeometry = new THREE.CylinderGeometry(this.height / 4, this.height / 4, this.height / 2, 16);
		const hatchMaterial = new THREE.MeshPhongMaterial({ color: 0x666666 });
		const hatchMesh = new THREE.Mesh(hatchGeometry, hatchMaterial);

		hatchMesh.position.set(0, this.height / 1.5, 0);
		this.add(hatchMesh);
		this.hatch = hatchMesh;
	}

	createPeriscope() {
		// Optional L-shaped tube
		const periscopeGroup = new THREE.Group();

		// Vertical part
		const vertical = new THREE.CylinderGeometry(this.height / 12, this.height / 12, this.height, 8);
		const pipeMat = new THREE.MeshPhongMaterial({ color: 0x333333 });
		const verticalPipe = new THREE.Mesh(vertical, pipeMat);
		verticalPipe.position.y = this.height / 2;
		periscopeGroup.add(verticalPipe);

		// Horizontal part
		const horizontal = new THREE.CylinderGeometry(this.height / 12, this.height / 12, this.height / 1.5, 8);
		const horizontalPipe = new THREE.Mesh(horizontal, pipeMat);
		horizontalPipe.rotation.z = Math.PI / 2;
		horizontalPipe.position.set(this.height / 3, this.height, 0);
		periscopeGroup.add(horizontalPipe);

		periscopeGroup.position.set(0, this.height / 1.5, 0);
		this.add(periscopeGroup);
		this.periscope = periscopeGroup;
	}

	createFins() {
		const finMaterial = new THREE.MeshPhongMaterial({ color: 0x555555 });

		// Tail fin (vertical)
		const tailGeom = new THREE.BoxGeometry(this.height / 2, this.height, this.height / 10);
		const tail = new THREE.Mesh(tailGeom, finMaterial);
		tail.position.set(-this.width / 2, 0, 0);
		this.add(tail);

		// Side fins (horizontal)
		const sideFinGeom = new THREE.BoxGeometry(this.height, this.height / 10, this.height / 2);
		const leftFin = new THREE.Mesh(sideFinGeom, finMaterial);
		const rightFin = new THREE.Mesh(sideFinGeom, finMaterial);
		leftFin.position.set(-this.width / 2.5, 0, this.height / 1.2);
		rightFin.position.set(-this.width / 2.5, 0, -this.height / 1.2);
		this.add(leftFin, rightFin);

		this.fins = { tail, leftFin, rightFin };
	}
}
