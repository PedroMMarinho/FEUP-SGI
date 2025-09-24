import * as THREE from 'three';
import { MyApp } from './MyApp.js';

export class MyChair extends THREE.Object3D  {

    constructor( app, height, xxLength, zzLength, color){
        super(); 
        this.app = app; 
        this.type = 'Group';
        this.height = height; 
        this.xxLength = xxLength; 
        this.zzLength = zzLength; 
        this.color = color; 
        this.legOffset = 0.2; 


        // create chair base 
        const chairMaterial = new THREE.MeshPhongMaterial({color: this.color,specular: "#000000", emissive: "#000000", shininess: 90 });
        const chairBase = new THREE.BoxGeometry(this.xxLength,0.3,this.zzLength);
        const baseMesh = new THREE.Mesh(chairBase, chairMaterial);
        baseMesh.position.set(0,this.height, 0);
        this.add(baseMesh);
        
        // create legs
        const leg = new THREE.CylinderGeometry(0.2,0.2,this.height);
        const legMesh1 = new THREE.Mesh(leg,chairMaterial);
        const legMesh2 = new THREE.Mesh(leg,chairMaterial);
        const legMesh3 = new THREE.Mesh(leg,chairMaterial);
        const legMesh4 = new THREE.Mesh(leg,chairMaterial);
        legMesh1.position.set(- (this.xxLength / 2 - this.legOffset) , this.height / 2, -(this.zzLength / 2 - this.legOffset));
        legMesh2.position.set( (this.xxLength / 2 - this.legOffset), this.height / 2, -(this.zzLength / 2 - this.legOffset));
        legMesh3.position.set(- (this.xxLength / 2 - this.legOffset), this.height / 2, (this.zzLength / 2 - this.legOffset));
        legMesh4.position.set( (this.xxLength / 2 - this.legOffset), this.height / 2, (this.zzLength / 2 - this.legOffset));

        this.add(legMesh1);
        this.add(legMesh2);
        this.add(legMesh3);
        this.add(legMesh4);
        
        // create backrest
        const backrestHeight = this.height * (4/3);
        const backrestzzLength = this.zzLength / 4;
        const backrest = new THREE.BoxGeometry(this.xxLength, backrestHeight, backrestzzLength);
        const backrestMesh = new THREE.Mesh(backrest, chairMaterial);
        backrestMesh.position.set(0,this.height + (backrestHeight / 2), -(this.zzLength / 2) + (backrestzzLength / 2));

        this.add(backrestMesh);
    }

}

MyChair.prototype.isGroup = true;
