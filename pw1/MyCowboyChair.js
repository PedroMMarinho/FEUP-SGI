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

		const b_crossbarMesh = new THREE.Mesh(leg, chairMaterial);
		const r_crossbarMesh = new THREE.Mesh(leg, chairMaterial);
		const l_crossbarMesh = new THREE.Mesh(leg, chairMaterial);

		fl_legMesh.position.set(- (this.xxLength / 2 - this.legOffset) + xpos, this.ypos / 2 - this.thickness, -(this.zzLength / 2 - this.legOffset) + zpos);
		fr_legMesh.position.set((this.xxLength / 2 - this.legOffset) + xpos, this.ypos / 2 - this.thickness, -(this.zzLength / 2 - this.legOffset) + zpos);
		bl_legMesh.position.set(- (this.xxLength / 2 - this.legOffset) + xpos, this.ypos / 2 - this.thickness, (this.zzLength / 2 - this.legOffset) + zpos + this.thickness);
		br_legMesh.position.set((this.xxLength / 2 - this.legOffset) + xpos, this.ypos / 2 - this.thickness, (this.zzLength / 2 - this.legOffset) + zpos + this.thickness);
		bl_legMesh.rotation.x = br_legMesh.rotation.x = - Math.PI / 12;

		b_crossbarMesh.position.set(xpos, this.ypos / 4, (this.zzLength / 2) + zpos + 0.1);
		r_crossbarMesh.position.set(xpos + this.xxLength / 2 - 0.2, this.ypos / 4, this.zzLength / 4 + zpos - this.thickness);
		l_crossbarMesh.position.set(xpos - this.xxLength / 2 + 0.2, this.ypos / 4, this.zzLength / 4 + zpos - this.thickness);
		b_crossbarMesh.rotation.z = Math.PI / 2;
	    r_crossbarMesh.rotation.z = Math.PI / 2;
		r_crossbarMesh.rotation.y = Math.PI / 2;
		l_crossbarMesh.rotation.z = Math.PI / 2;
		l_crossbarMesh.rotation.y = Math.PI / 2;
		b_crossbarMesh.scale.setY(0.9);

		this.add(fl_legMesh);
		this.add(fr_legMesh);
		this.add(bl_legMesh);
		this.add(br_legMesh);

		this.add(b_crossbarMesh);
		this.add(r_crossbarMesh);
		this.add(l_crossbarMesh);

		// backrest
		const backStick = new THREE.BoxGeometry(0.3, 2, 0.3);
		const backRest = new THREE.BoxGeometry(this.xxLength - this.thickness, 1.2, 0.2);
		const l_stickMesh = new THREE.Mesh(backStick, chairMaterial);
		const r_stickMesh = new THREE.Mesh(backStick, chairMaterial);
		const backRestMesh = new THREE.Mesh(backRest, chairMaterial);

		l_stickMesh.position.set( - (this.xxLength / 2 - this.legOffset) + xpos, this.ypos + 1, (this.zzLength / 2 - this.legOffset) + zpos + 0.2);
		r_stickMesh.position.set(this.xxLength / 2 - this.legOffset + xpos, this.ypos + 1, (this.zzLength / 2 - this.legOffset) + zpos + 0.2);
		backRestMesh.position.set(xpos, this.ypos + 1.2, this.zzLength / 2 - this.legOffset + zpos + 0.2);

		l_stickMesh.rotation.x = Math.PI / 15;
		r_stickMesh.rotation.x = Math.PI / 15;
		backRestMesh.rotation.x = Math.PI / 15;

		this.add(l_stickMesh);
		this.add(r_stickMesh);
		this.add(backRestMesh);
	}
}

MyCowboyChair.prototype.isGroup = true;
