import * as THREE from 'three';

class Door extends THREE.Object3D {
    constructor(x, y, z, ang = 0) {
        super();

        this.position.set(x, y, z);
        this.rotation.y = ang;

        this.initMaterials();
        this.initConstants();
    }

    initMaterials() {
        this.doorMaterial= null
        this.doorFrameMaterial = null
        
    }

    initConstants() {
        
        this.doorWidth = 6;
        this.doorHeight = 8;
        this.doorDepth = 0.1;
        this.doorFrameThickness = 0.2;
    }

    build() {
        // Door
        const doorGeometry = new THREE.BoxGeometry(this.doorWidth, this.doorHeight, this.doorDepth);
        const door = new THREE.Mesh(doorGeometry, this.doorMaterial);
        door.position.y = this.doorHeight / 2;
        door.position.z = this.doorDepth / 2;
        this.add(door);
        
        // Door Frame
        const frameGeometry1 = new THREE.BoxGeometry(this.doorFrameThickness, this.doorHeight + this.doorFrameThickness, this.doorDepth + this.doorFrameThickness);
        const frame1 = new THREE.Mesh(frameGeometry1, this.doorFrameMaterial);
        frame1.position.x = -this.doorWidth / 2 - this.doorFrameThickness / 2;
        frame1.position.y = (this.doorHeight + this.doorFrameThickness) / 2;
        frame1.position.z = this.doorDepth / 2;
        this.add(frame1);

        const frame2 = new THREE.Mesh(frameGeometry1, this.doorFrameMaterial);
        frame2.position.x = this.doorWidth / 2 + this.doorFrameThickness / 2;
        frame2.position.y = (this.doorHeight + this.doorFrameThickness) / 2;
        frame2.position.z = this.doorDepth / 2;
        this.add(frame2);

        const frameGeometry2 = new THREE.BoxGeometry(this.doorWidth + 2 * this.doorFrameThickness, this.doorFrameThickness, this.doorDepth + this.doorFrameThickness);
        const frame3 = new THREE.Mesh(frameGeometry2, this.doorFrameMaterial);
        frame3.position.y = this.doorHeight + this.doorFrameThickness / 2;
        frame3.position.z = this.doorDepth / 2;
        this.add(frame3);

        const frame4 = new THREE.Mesh(frameGeometry2, this.doorFrameMaterial);
        frame4.position.y = this.doorFrameThickness / 2;
        frame4.position.z = this.doorDepth / 2;
        this.add(frame4);

        //console.log(this.doorMaterial)
        //console.log(this.doorFrameMaterial)


        
        
    }

}

export { Door };
        