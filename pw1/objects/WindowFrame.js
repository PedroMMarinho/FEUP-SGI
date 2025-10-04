import * as THREE from 'three';

class WindowFrame extends THREE.Object3D {
    constructor(x, y, z, ang = 0) {
        super();

        this.position.set(x, y, z);
        this.rotation.y = ang;

        this.initMaterials();
        this.initConstants();
    }

    initMaterials() {
        this.frameMaterial= null
        this.windowMaterial = null
        
    }

    initConstants() {
        
        this.frameWidth = 8;
        this.frameHeight =5;
        this.frameThickness = 0.3;
        this.sillThickness = 0.5;
        this.sillDepth = 1;
    }

    build() {

        // outer frame
        const frameGeometry1 = new THREE.BoxGeometry(this.frameWidth, this.frameThickness, this.frameThickness);
        const frame1 = new THREE.Mesh(frameGeometry1, this.frameMaterial);
        this.add(frame1);
        frame1.position.y = this.frameHeight - this.frameThickness / 2;
        const frameGeometry2 = new THREE.BoxGeometry(this.frameThickness, this.frameHeight - 2 * this.frameThickness, this.frameThickness);
        const frame2 = new THREE.Mesh(frameGeometry2, this.frameMaterial);
        this.add(frame2);
        frame2.position.x = -this.frameWidth / 2 + this.frameThickness / 2;
        frame2.position.y = this.frameHeight / 2;
        const frame3 = new THREE.Mesh(frameGeometry2, this.frameMaterial);
        this.add(frame3);
        frame3.position.x = this.frameWidth / 2 - this.frameThickness / 2;
        frame3.position.y = this.frameHeight / 2;
        const frameGeometry4 = new THREE.BoxGeometry(this.frameWidth, this.frameThickness, this.frameThickness);
        const frame4 = new THREE.Mesh(frameGeometry4, this.frameMaterial);
        this.add(frame4);
        frame4.position.y = this.frameThickness / 2;
        // inner frame
        const frameGeometry5 = new THREE.BoxGeometry(this.frameWidth - 2 * this.frameThickness, this.frameThickness, this.frameThickness / 2);
        const frame5 = new THREE.Mesh(frameGeometry5, this.frameMaterial);
        this.add(frame5);
        frame5.position.y = this.frameHeight / 2;
        const frameGeometry6 = new THREE.BoxGeometry(this.frameThickness , this.frameHeight / 2 - this.frameThickness, this.frameThickness / 2);
        const frame6 = new THREE.Mesh(frameGeometry6, this.frameMaterial);
        this.add(frame6);
        frame6.position.y = 3 * this.frameHeight / 4 ;
        const frame7 = new THREE.Mesh(frameGeometry6, this.frameMaterial);
        this.add(frame7);
        frame7.position.y = this.frameHeight / 4 ;

        // windows 
        const window= new THREE.Shape();
        window.moveTo( -this.frameWidth/2 + this.frameThickness, this.frameHeight - this.frameThickness);
        window.lineTo(  - this.frameThickness / 2, this.frameHeight - this.frameThickness);
        window.lineTo( - this.frameThickness / 2, this.frameThickness / 2 + this.frameHeight / 2);
        window.lineTo( -this.frameWidth/2 + this.frameThickness, this.frameThickness / 2 + this.frameHeight / 2);
        window.lineTo( -this.frameWidth/2 + this.frameThickness, this.frameHeight - this.frameThickness);
        const extrudeSettings = {
            steps: 1,
            depth: this.frameThickness / 6,
            bevelEnabled: true,
            bevelThickness: this.frameThickness / 8,
            bevelSize: 0.18,
            bevelOffset: -0.15,
            bevelSegments: 1
        };
        const windowGeometry = new THREE.ExtrudeGeometry( window, extrudeSettings );
        const windowMesh1 = new THREE.Mesh( windowGeometry, this.windowMaterial );
        this.add( windowMesh1 );
        const windowMesh2 = new THREE.Mesh( windowGeometry, this.windowMaterial );
        this.add( windowMesh2 );
        windowMesh2.position.x = this.frameWidth/2 - this.frameThickness / 2;
        const windowMesh3 = new THREE.Mesh( windowGeometry, this.windowMaterial );
        this.add( windowMesh3 );
        windowMesh3.position.x = 0;
        windowMesh3.position.y = - this.frameHeight / 2 + this.frameThickness / 2;
        const windowMesh4 = new THREE.Mesh( windowGeometry, this.windowMaterial );
        this.add( windowMesh4 );
        windowMesh4.position.x = this.frameWidth/2 - this.frameThickness / 2;
        windowMesh4.position.y = - this.frameHeight / 2 + this.frameThickness / 2;

        // sill
        const sillGeometry = new THREE.BoxGeometry(this.frameWidth + this.sillDepth, this.sillThickness, this.sillDepth);
        const sill = new THREE.Mesh(sillGeometry, this.frameMaterial);
        this.add(sill);
        sill.position.y = - this.sillThickness / 2;
        sill.position.z =  this.sillDepth / 2;
        

        
        


    }

}

export { WindowFrame };
        