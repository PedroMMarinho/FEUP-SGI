import * as THREE from 'three';

export class Jukebox extends THREE.Object3D {
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
		this.woodMaterial = null;
		this.mainPanel = null;
		this.domePanel = null;

		this.placeholderWood = new THREE.MeshPhongMaterial({
			color: "#800000",
			shininess: 80,
			specular: "#822222"
		});

		this.chromeMat = new THREE.MeshPhongMaterial({
  			color: "#00d483",
  			emissive: "#00d483",
  			emissiveIntensity: 0.5,
  			shininess: 0.8,
  			specular: "#ffffff"

			
			  			
		});
	}

	initConstants() {
		this.jukeWidth = 3;
		this.jukeHeight = 6;
		this.jukeDepth = 2;
		this.topDomeHeight = 2;

		this.tubeRadius = 0.3;
		this.tubeOffset = this.jukeWidth / 2 + 0.05;

		this.arcRadius = this.jukeWidth / 2 + 0.05;
	}

	build() {
		// general shape
		const boxGeo = new THREE.BoxGeometry(this.jukeWidth, this.jukeHeight - this.topDomeHeight, this.jukeDepth);
		const topGeo = new THREE.CylinderGeometry(this.jukeWidth / 2, this.jukeWidth / 2,
											this.jukeDepth, 24, 1, false, 0, Math.PI);
		const mainBox = new THREE.Mesh(boxGeo, this.woodMaterial);
		const topDome = new THREE.Mesh(topGeo, this.woodMaterial);
		mainBox.position.set(this.xpos, this.ypos, this.zpos);
		topDome.position.set(this.xpos, this.ypos + this.topDomeHeight, this.zpos);
		topDome.rotation.z = Math.PI / 2;
		topDome.rotation.y = Math.PI / 2;
		this.add(mainBox);
		this.add(topDome);

		// texture panels
		const planeGeo = new THREE.PlaneGeometry(this.jukeWidth - 0.05, this.jukeHeight - this.topDomeHeight);
		const planeMesh = new THREE.Mesh(planeGeo, this.mainPanel);
		planeMesh.position.set(this.xpos, this.ypos, this.zpos + 0.02 + this.jukeDepth/2);
		this.add(planeMesh);

		const semiCircleGeo = new THREE.CircleGeometry(this.jukeWidth / 2, 30, 0, Math.PI);
		const domePlaneMesh = new THREE.Mesh(semiCircleGeo, this.domePanel);
		domePlaneMesh.position.set(this.xpos, this.ypos + this.topDomeHeight, this.zpos + this.jukeDepth/2 + 0.02);
		this.add(domePlaneMesh);
		
		// side tubes
		const sideGeo = new THREE.CylinderGeometry(this.tubeRadius, this.tubeRadius, this.jukeHeight - this.topDomeHeight, 16);
		const leftTube = new THREE.Mesh(sideGeo, this.chromeMat);
		const rightTube = new THREE.Mesh(sideGeo, this.chromeMat);

		
		leftTube.position.set(this.xpos - this.tubeOffset, this.ypos, this.zpos + this.jukeDepth/2 + 0.01);
		rightTube.position.set(this.xpos + this.tubeOffset, this.ypos, this.zpos + this.jukeDepth/2 + 0.01);

		this.add(leftTube);
		this.add(rightTube);

		// top tube 
		const arcTube = new THREE.TorusGeometry(this.arcRadius, this.tubeRadius, 12, 48, Math.PI);
		const topTube = new THREE.Mesh(arcTube, this.chromeMat);
		topTube.position.set(this.xpos, this.ypos + this.arcRadius + 0.4, this.zpos + this.jukeDepth / 2 + 0.01);

		this.add(topTube);
	}
}

Jukebox.prototype.isGroup = true;
