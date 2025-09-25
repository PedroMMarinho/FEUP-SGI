import * as THREE from 'three';
import { MyApp } from './MyApp.js';
import { MyBowlOfSoup } from './MyBowlOfSoup.js';
import { MyChair } from './MyChair.js';
import { MySpoon } from './MySpoon.js';

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

        this.soup = null;

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

        // add bowl of soup
        this.soup = new MyBowlOfSoup(this.app);
        this.soup.position.set(0,this.height + this.soup.radius,0);
        this.add(this.soup);

        // Add chairs around the table
        const chairHeight = this.height * (3/5);
        const chairxxLength = this.xxLength / 2;
        const chairzzLength = this.zzLength / 2;
        const chairColor = "#7777ff";
        const chair1 = new MyChair(this.app, chairHeight, chairxxLength, chairzzLength, chairColor);
        const chair2 = new MyChair(this.app, chairHeight, chairxxLength, chairzzLength, chairColor);
        
        chair1.position.set(-(this.xxLength/2 + 1), 0, 0);
        chair1.rotation.y = Math.PI / 2;
        chair2.position.set((this.xxLength/2 + 1), 0, 0);
        chair2.rotation.y = -Math.PI / 2;
        
        this.add(chair1);
        this.add(chair2);

        // Add two spoons on the table
        const spoonHeight = 0.1;
        const spoonxxLength = 0.1;
        const spoonzzLength = 0.8;
        const spoonColor = "#ffff00";
        const spoon1 = new MySpoon(this.app, spoonHeight, spoonxxLength, spoonzzLength, spoonColor);
        const spoon2 = new MySpoon(this.app, spoonHeight, spoonxxLength, spoonzzLength, spoonColor);

        spoon1.position.set(-xxLength/4 - spoonxxLength/2,this.height + 0.2,zzLength/4);
        spoon2.position.set(xxLength/4 + spoonxxLength/2,this.height + 0.2,-zzLength/4);
        spoon1.rotation.z = -Math.PI /2 ;
        spoon1.rotation.y = -Math.PI;
        spoon2.rotation.z = -Math.PI / 2;
        this.add(spoon1);
        this.add(spoon2);




        
    }

}

MyTable.prototype.isGroup = true; 

