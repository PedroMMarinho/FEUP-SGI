import * as THREE from 'three';
import { MyApp } from './MyApp.js';
import { MyAxis } from './MyAxis.js';

export class MyTable extends THREE.Object3D  {

    /**
     * @param {MyApp} app the application object 
     * @param {number} heigth the height of the table
     * @param {number} xxLength the length of the table in the xx axis
     * @param {number} zzLength the length of the table in the zz axis
     * @param {number} color the color of the table 
     */

    constructor( app, height, xxLength, zzLength, color){
        super(); 
        this.app = app; 
        this.type = 'Group';
        this.height = height; 
        this.xxLength = xxLength; 
        this.zzLength = zzLength; 
        this.color = color; 
        this.legOffset = 0.2; 

        // create table top 
        const tableMaterial = new THREE.MeshPhongMaterial({color: this.color,specular: "#000000", emissive: "#000000", shininess: 90 });
        const tableTop = new THREE.BoxGeometry(this.xxLength,0.2,this.zzLength);
        const topMesh = new THREE.Mesh(tableTop, tableMaterial);
        topMesh.position.set(0,this.height, 0);
        this.add(topMesh);
        
        // create legs
        const leg = new THREE.CylinderGeometry(0.2,0.2,this.height);
        const legMesh1 = new THREE.Mesh(leg,tableMaterial);
        const legMesh2 = new THREE.Mesh(leg,tableMaterial);
        const legMesh3 = new THREE.Mesh(leg,tableMaterial);
        const legMesh4 = new THREE.Mesh(leg,tableMaterial);
        legMesh1.position.set(- (this.xxLength / 2 - this.legOffset) , this.height / 2, -(this.zzLength / 2 - this.legOffset));
        legMesh2.position.set( (this.xxLength / 2 - this.legOffset), this.height / 2, -(this.zzLength / 2 - this.legOffset));
        legMesh3.position.set(- (this.xxLength / 2 - this.legOffset), this.height / 2, (this.zzLength / 2 - this.legOffset));
        legMesh4.position.set( (this.xxLength / 2 - this.legOffset), this.height / 2, (this.zzLength / 2 - this.legOffset));

        this.add(legMesh1);
        this.add(legMesh2);
        this.add(legMesh3);
        this.add(legMesh4);









        
    }

}

MyTable.prototype.isGroup = true; 

