import * as THREE from 'three';

export class CowboyChair extends THREE.Object3D {
	constructor(xpos, ypos, zpos) {
		super();
		this.type = 'Group';
		this.xpos = xpos;
		this.ypos = ypos;
		this.zpos = zpos;

		this.initMaterials();
		this.initConstants();	
	}

	initMaterials() {
		this.chairMaterial = null;
	}

	initConstants() {
		// dimensions and distances
		this.xxLength = 2
		this.zzLength = 2;
		this.thickness = 0.3;

		this.legOffset = 0.2;
		this.legRadius = 0.15;
		this.legHeight = 2;
		this.legRadialSegments = 24;
		this.backlegRotationFac = 0.08;
		
		this.backstickWidth = 0.3;
		this.backstickHeight = 2;
		this.backstickDepth = 0.3;
		this.backrestHeight = 1.2;
		this.backrestDepth = 0.2;
		this.backrestRotationFac = 0.067;
	}

	build() {
		// chair seat
		const chairSeat = new THREE.BoxGeometry(this.xxLength, this.thickness, this.zzLength);
		const baseMesh = new THREE.Mesh(chairSeat, this.chairMaterial);
		baseMesh.position.set(this.xpos, this.ypos, this.zpos);
		this.add(baseMesh);

		// chair legs and crossbars
		const leg = new THREE.CylinderGeometry(this.legRadius, this.legRadius, this.legHeight, this.legRadialSegments);
		const fl_legMesh = new THREE.Mesh(leg, this.chairMaterial);
		const fr_legMesh = new THREE.Mesh(leg, this.chairMaterial);
		const bl_legMesh = new THREE.Mesh(leg, this.chairMaterial);
		const br_legMesh = new THREE.Mesh(leg, this.chairMaterial);

		const b_crossbarMesh = new THREE.Mesh(leg, this.chairMaterial);
		const r_crossbarMesh = new THREE.Mesh(leg, this.chairMaterial);
		const l_crossbarMesh = new THREE.Mesh(leg, this.chairMaterial);

		fl_legMesh.position.set(- (this.xxLength / 2 - this.legOffset) + this.xpos, this.ypos / 2 - this.thickness, -(this.zzLength / 2 - this.legOffset) + this.zpos);
		fr_legMesh.position.set((this.xxLength / 2 - this.legOffset) + this.xpos, this.ypos / 2 - this.thickness, -(this.zzLength / 2 - this.legOffset) + this.zpos);
		bl_legMesh.position.set(- (this.xxLength / 2 - this.legOffset) + this.xpos, this.ypos / 2 - this.thickness, (this.zzLength / 2 - this.legOffset) + this.zpos + this.thickness);
		br_legMesh.position.set((this.xxLength / 2 - this.legOffset) + this.xpos, this.ypos / 2 - this.thickness, (this.zzLength / 2 - this.legOffset) + this.zpos + this.thickness);
		bl_legMesh.rotation.x = br_legMesh.rotation.x = - Math.PI * this.backlegRotationFac;

		b_crossbarMesh.position.set(this.xpos, this.ypos / 4, (this.zzLength / 2) + this.zpos + 0.1);
		r_crossbarMesh.position.set(this.xpos + this.xxLength / 2 - 0.2, this.ypos / 4, this.zzLength / 4 + this.zpos - this.thickness);
		l_crossbarMesh.position.set(this.xpos - this.xxLength / 2 + 0.2, this.ypos / 4, this.zzLength / 4 + this.zpos - this.thickness);
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
		
		// chair backrest
		const backStick = new THREE.BoxGeometry(this.backstickWidth, this.backstickHeight, this.backstickDepth);
		const backRest = new THREE.BoxGeometry(this.xxLength - this.thickness, this.backrestHeight, this.backrestDepth);
		const l_stickMesh = new THREE.Mesh(backStick, this.chairMaterial);
		const r_stickMesh = new THREE.Mesh(backStick, this.chairMaterial);
		const backRestMesh = new THREE.Mesh(backRest, this.chairMaterial);

		l_stickMesh.position.set( - (this.xxLength / 2 - this.legOffset) + this.xpos, this.ypos + 1, (this.zzLength / 2 - this.legOffset) + this.zpos + 0.2);
		r_stickMesh.position.set(this.xxLength / 2 - this.legOffset + this.xpos, this.ypos + 1, (this.zzLength / 2 - this.legOffset) + this.zpos + 0.2);
		backRestMesh.position.set(this.xpos, this.ypos + 1.2, this.zzLength / 2 - this.legOffset + this.zpos + 0.2);

		l_stickMesh.rotation.x = Math.PI * this.backrestRotationFac;
		r_stickMesh.rotation.x = Math.PI * this.backrestRotationFac;
		backRestMesh.rotation.x = Math.PI * this.backrestRotationFac;

		this.add(l_stickMesh);
		this.add(r_stickMesh);
		this.add(backRestMesh);
	}
}

CowboyChair.prototype.isGroup = true;
