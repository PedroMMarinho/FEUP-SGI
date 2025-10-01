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
		this.thickness = 0.3;
		this.color = color;

		// chair seat
		const chairMaterial = new THREE.MeshPhongMaterial({
			color: this.color,
			specular: "#000000",
			emissive: "#000000",
			shininess: 90
		});
		const chairBase = new THREE.BoxGeometry(this.xxLength, this.thickness, this.zzLength);
		const baseMesh = new THREE.Mesh(chairBase, chairMaterial);
		baseMesh.position.set(this.xpos, this.ypos, this.zpos);
		this.add(baseMesh);

		// legs
		this.legOffset = 0.2;
		const leg = new THREE.CylinderGeometry(0.15, 0.15, 2, 24);
		const fl_legMesh = new THREE.Mesh(leg, chairMaterial);
		const fr_legMesh = new THREE.Mesh(leg, chairMaterial);
		const bl_legMesh = new THREE.Mesh(leg, chairMaterial);
		const br_legMesh = new THREE.Mesh(leg, chairMaterial);

		fl_legMesh.position.set(- (this.xxLength / 2 - this.legOffset) + xpos, this.ypos / 2 - this.thickness, -(this.zzLength / 2 - this.legOffset) + zpos);
		fr_legMesh.position.set((this.xxLength / 2 - this.legOffset) + xpos, this.ypos / 2 - this.thickness, -(this.zzLength / 2 - this.legOffset) + zpos);
		bl_legMesh.position.set(- (this.xxLength / 2 - this.legOffset) + xpos, this.ypos / 2 - this.thickness, (this.zzLength / 2 - this.legOffset) + zpos + this.thickness);
		br_legMesh.position.set((this.xxLength / 2 - this.legOffset) + xpos, this.ypos / 2 - this.thickness, (this.zzLength / 2 - this.legOffset) + zpos + this.thickness);
		bl_legMesh.rotation.x = br_legMesh.rotation.x = - Math.PI / 12;
		this.add(fl_legMesh);
		this.add(fr_legMesh);
		this.add(bl_legMesh);
		this.add(br_legMesh);
	}
}

MyCowboyChair.prototype.isGroup = true;
