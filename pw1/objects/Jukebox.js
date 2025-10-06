import * as THREE from 'three';

export class Jukebox extends THREE.Object3D {
	constructor(x, y, z) {
		super();
		this.type = 'Group';
		this.xpos = x;
		this.ypoz = y;
		this.zpos = z;

		this.initMaterials();
		this.initConstants();
	}

	initMaterials() {
		this.woodMaterial = null;

		this.placeholderWood = new THREE.MeshPhongMaterial({
			color: "#800000",
			shininess: 80,
			specular: "#822222"
		});
	}

	initConstants() {
		this.jukeWidth = 10;
		this.jukeHeight = 20;
		this.jukeDepth = 7;
		this.topDomeHeight = 5;
	}

	build() {
		// general shape
		const boxGeo = new THREE.BoxGeometry(10, 10, 10);
		const mainBox = new THREE.Mesh(boxGeo, this.woodMaterial);
		const secondaryBox = new THREE.Mesh(boxGeo, this.woodMaterial);
		mainBox.position.set(this.xpos, this.ypos, this.zpos);
		secondaryBox.position.set(this.xpos + 5, this.ypos, this.zpos + 5);

		this.add(mainBox);
		this.add(secondaryBox);
	}
}

Jukebox.prototype.isGroup = true;
