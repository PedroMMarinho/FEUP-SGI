import * as THREE from 'three';
import { MyApp } from '../MyApp.js';

export class MySpoon extends THREE.Object3D  {

    constructor( app, height, xxLength, zzLength, color){
        super(); 
        this.app = app; 
        this.type = 'Group';
        this.height = height;
        this.xxLength = xxLength; 
        this.zzLength = zzLength; 
        this.color = color; 

        // create spoon handle 
        const spoonMaterial = new THREE.MeshPhongMaterial({color: this.color,specular: "#000000", emissive: "#000000", shininess: 90, side: THREE.DoubleSide });
        const spoonHandle = new THREE.BoxGeometry(zzLength,height,height);
        const handleMesh = new THREE.Mesh(spoonHandle, spoonMaterial);
        handleMesh.position.set(0.05,this.height / 3, 0);
        handleMesh.rotation.z = -Math.PI / 2;
        this.add(handleMesh);
        
        // create spoon bowl
        const bowlRadius = this.xxLength * 1.5;
        const spoonBowl = new THREE.SphereGeometry(bowlRadius,32,16,0,Math.PI * 2,0,Math.PI / 2);
        const bowlMesh = new THREE.Mesh(spoonBowl, spoonMaterial);
        bowlMesh.position.set(0,this.height - zzLength/1.6, 0);
        bowlMesh.rotation.z = 3/2*Math.PI;
        bowlMesh.rotation.x = Math.PI;
        this.add(bowlMesh);

        // create spoon bowl plane cut
        const spoonBowlPlane = new THREE.CircleGeometry(bowlRadius);
        const bowlPlaneMesh = new THREE.Mesh(spoonBowlPlane, spoonMaterial);
        bowlPlaneMesh.position.set(0,this.height - zzLength/1.6, 0);
        bowlPlaneMesh.rotation.x = Math.PI / 2;
        bowlPlaneMesh.rotation.y = Math.PI/2;
        this.add(bowlPlaneMesh);
    }


}

MySpoon.prototype.isGroup = true;
