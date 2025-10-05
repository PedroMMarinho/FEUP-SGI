import * as THREE from 'three';
import { MyApp } from './MyApp.js';

export class MyBowlOfSoup extends THREE.Object3D  {

    /**
     * @param {MyApp} app the application object 
     */

    constructor(app){
        super(); 
        this.app = app; 
        this.radius = 0.8;
        this.soupQuantity = 0.8;
        this.type = 'Group';

        // create bowl 
        const bowlMaterial = new THREE.MeshPhongMaterial({color: '#ffffff',specular: "#000000", emissive: "#000000", shininess: 90, side: THREE.DoubleSide });
        const bowl = new THREE.SphereGeometry(this.radius, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const bowlMesh = new THREE.Mesh(bowl, bowlMaterial);
        this.rotation.x = -Math.PI ;
        this.add(bowlMesh)

        const soupMaterial = new THREE.MeshPhongMaterial({color: '#ffa126',specular: "#000000", emissive: "#000000", shininess: 90 });

        const soupHeight = this.radius - this.radius * this.soupQuantity;
        const soupRadius = Math.sqrt(this.radius * this.radius - soupHeight * soupHeight);

        const soup = new THREE.CircleGeometry( soupRadius);
        const soupMesh = new THREE.Mesh(soup, soupMaterial);
        soupMesh.rotation.x = Math.PI / 2;
        soupMesh.position.y = soupHeight;
        //console.log(soupMesh.position.y );
        this.add(soupMesh);
    }

}


MyBowlOfSoup.prototype.isGroup = true;

