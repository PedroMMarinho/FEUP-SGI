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

	initSmallLamps() {
		// SpotLight
		const spotLight = new THREE.SpotLight(0x7F7F00, 1);
		spotLight.position.set(this.xpos - this.frameWidth/3 + 0.4, this.ypos + this.frameHeight/2 + 0.05, this.zpos + this.frameThickness/2 );
		spotLight.angle = Math.PI / 5  ;
		spotLight.power = 200;
		spotLight.penumbra = 0.5;
		spotLight.decay = 1;
		spotLight.distance = 3/2*this.frameHeight;
		spotLight.castShadow = true;
		spotLight.shadow.mapSize.width = 512;
		spotLight.shadow.mapSize.height = 512;
		spotLight.shadow.camera.near = 0.5;
		spotLight.shadow.camera.far = 50;
		const target = new THREE.Object3D();
		target.position.set(this.xpos - this.frameWidth/3 + 0.4 , this.ypos - this.frameHeight/2, this.zpos + this.frameThickness/2);
		spotLight.target = target;
		this.add(spotLight);
		this.add(spotLight.target);
		spotLight.target.updateMatrixWorld();




		// SpotLight 2
		const spotLight2 = new THREE.SpotLight(0x7F7F00, 1);
		spotLight2.position.set(this.xpos + this.frameWidth/3 - 0.3, this.ypos + this.frameHeight/2 + 0.05, this.zpos + this.frameThickness/2 );
		spotLight2.angle = Math.PI / 5  ;
		spotLight2.power = 200;
		spotLight2.penumbra = 0.5;
		spotLight2.decay = 1;
		spotLight2.distance = 3/2*this.frameHeight;
		spotLight2.castShadow = true;
		spotLight2.shadow.mapSize.width = 512;
		spotLight2.shadow.mapSize.height = 512;
		spotLight2.shadow.camera.near = 0.5;
		spotLight2.shadow.camera.far = 50;
		const target2 = new THREE.Object3D();
		target2.position.set(this.xpos + this.frameWidth/3 - 0.3  , this.ypos - this.frameHeight/2, this.zpos + this.frameThickness/2);
		spotLight2.target = target2;
		this.add(spotLight2);
		this.add(spotLight2.target);
		spotLight2.target.updateMatrixWorld();




		// SpotLight 3
		const spotLight3 = new THREE.SpotLight(0x7F7F00, 1);
		spotLight3.position.set(this.xpos , this.ypos + this.frameHeight/2 + 0.05, this.zpos + this.frameThickness/2 );
		spotLight3.angle = Math.PI / 5  ;
		spotLight3.power = 200;
		spotLight3.penumbra = 0.5;
		spotLight3.decay = 1;
		spotLight3.distance = 3/2*this.frameHeight;
		spotLight3.castShadow = true;
		spotLight3.shadow.mapSize.width = 512;
		spotLight3.shadow.mapSize.height = 512;
		spotLight3.shadow.camera.near = 0.5;
		spotLight3.shadow.camera.far = 50;
		const target3 = new THREE.Object3D();
		target3.position.set(this.xpos  , this.ypos - this.frameHeight/2, this.zpos + this.frameThickness/2);
		spotLight3.target = target3;
		this.add(spotLight3);
		this.add(spotLight3.target);
		spotLight3.target.updateMatrixWorld();



		// Add geometry of lights
		const cylinderGeometry = new THREE.CylinderGeometry(this.frameThickness/4 , this.frameThickness/4, 0.001, 32);
		const cylinderMaterial = new THREE.MeshStandardMaterial({
		color: 0xFFFF00,
		emissive: 0xFFFF00,
		emissiveIntensity: 5,
		roughness: 0.2,
		metalness: 0.5});
		
		const light1 = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
		light1.position.set(spotLight.position.x, this.ypos + this.frameHeight/2 - this.frameThickness/2, spotLight.position.z - this.frameThickness/4);

		const light2 = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
		light2.position.set(spotLight2.position.x, this.ypos + this.frameHeight/2 - this.frameThickness/2, spotLight2.position.z - this.frameThickness/4);

		const light3 = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
		light3.position.set(spotLight3.position.x, this.ypos + this.frameHeight/2 - this.frameThickness/2, spotLight3.position.z - this.frameThickness/4);

		this.add(light1);
		this.add(light2);
		this.add(light3);
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
		const photoPlane = new THREE.Mesh(plane, this.photoTexture);
		photoPlane.position.set(this.xpos, this.ypos, this.zpos);
		this.add(photoPlane);

		this.initSmallLamps();
	}
}

PhotoFrame.prototype.isGroup = true;
