import * as THREE from 'three';
import { MyApp } from './MyApp.js';

export class MyCowboyChair extends THREE.Object3D {
	constructor(app, xpos, ypos, zpos, color) {
		super();
		this.app = app;
		this.type = 'Group';
		this.xpos = xpos;
		this.ypos = ypos;
		this.zpos = zpos;
		this.xxLength = 2
		this.zzLength = 2;
		this.color = color;

		// chair seat
		const chairMaterial = new THREE.MeshPhongMaterial({
			color: this.color,
			specular: "#000000",
			emissive: "#000000",
			shininess: 90
		});
		const chairBase = new THREE.BoxGeometry(this.xxLength, 0.3, this.zzLength);
		const baseMesh = new THREE.Mesh(chairBase, chairMaterial);
		baseMesh.position.set(this.xpos, this.ypos, this.zpos);
		this.add(baseMesh);

		//front legs
		this.legOffset = 0.2;
		const fLeg = new THREE.CylinderGeometry(0.15, 0.15, 2, 24);
		const bLeg = new THREE.TorusGeometry(3, 0.15, 14, 14, 1);
		const fl_legMesh = new THREE.Mesh(fLeg, chairMaterial);
		const fr_legMesh = new THREE.Mesh(fLeg, chairMaterial);
		const bl_legMesh = new THREE.Mesh(bLeg, chairMaterial);
		const br_legMesh = new THREE.Mesh(bLeg, chairMaterial);

		fl_legMesh.position.set(- (this.xxLength / 2 - this.legOffset) + xpos, this.ypos / 2 - 0.3, -(this.zzLength / 2 - this.legOffset) + zpos);
		fr_legMesh.position.set((this.xxLength / 2 - this.legOffset) + xpos, this.ypos / 2 - 0.3, -(this.zzLength / 2 - this.legOffset) + zpos);
		this.add(fl_legMesh);
		this.add(fr_legMesh);
		this.add(br_legMesh);
		this.add(bl_legMesh);
	}
}

MyCowboyChair.prototype.isGroup = true;
