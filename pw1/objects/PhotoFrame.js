import * as THREE from 'three';

export class PhotoFrame extends THREE.Object3D {
	constructor(x, y, z) {
		super();
		this.type = 'Group';

		this.xpos = x;
		this.ypos = y;
		this.zpos = z;
		
		this.initMaterials();
		this.initConstants();
	}

	initMaterials() {
		this.frameMaterial = null;
		this.photoTexture = null;
	}

	initConstants() {
		this.frameWidth = 7.2;
		this.frameHeight = 4;
		this.frameThickness = 0.3;
	}

	build() {
		// frame 
		const frame1 = new THREE.BoxGeometry(this.frameWidth, this.frameThickness, this.frameThickness);
		const frame2 = new THREE.BoxGeometry(this.frameThickness, this.frameHeight + this.frameThickness, this.frameThickness);

		const upperBorder = new THREE.Mesh(frame1, this.frameMaterial);
		const lowerBorder = new THREE.Mesh(frame1, this.frameMaterial);
		const rightBorder = new THREE.Mesh(frame2, this.frameMaterial);
		const leftBorder = new THREE.Mesh(frame2, this.frameMaterial);

		upperBorder.position.set(this.xpos, this.ypos + this.frameHeight/2, this.zpos);
		lowerBorder.position.set(this.xpos, this.ypos - this.frameHeight/2, this.zpos);
		rightBorder.position.set(this.xpos + this.frameWidth/2, this.ypos, this.zpos);
		leftBorder.position.set(this.xpos - this.frameWidth/2, this.ypos, this.zpos);

		this.add(leftBorder);
		this.add(rightBorder);
		this.add(upperBorder);
		this.add(lowerBorder);

		// photo
		const plane = new THREE.PlaneGeometry(this.frameWidth - this.frameThickness, this.frameHeight - this.frameThickness)
		const photoPlane = new THREE.Mesh(plane, this.frameMaterial);
		// TODO: const photoPlane = new THREE.Mesh(plane, this.photoTexture);
		photoPlane.position.set(this.xpos, this.ypos, this.zpos);
		this.add(photoPlane);
	}
}

PhotoFrame.prototype.isGroup = true;
