import * as THREE from 'three';

class Lamp extends THREE.Object3D {
    constructor(x, y, z, ang = 0) {
        super();

        this.position.set(x, y, z);
        this.rotation.y = ang;

        this.initMaterials();
        this.initConstants();
    }

    initMaterials() {
        this.lampShellMaterial = null
        this.lampSupportMaterial = null
        this.lampInsideMaterial = null
    }

    initConstants() {
        // Shell dimensions
        this.shellTopWidth = 5;
        this.shellHeight = 1;
        this.shellTopDepth = 1;
        this.shellInclineAngle = Math.PI / 6; // 30 degrees
        this.shellThickness = 0.1;
        
        // Support dimensions
        this.upperSupportRadius = 0.05;
        this.lowerSupportRadius = 0.1;
        this.supportHeight = 4;	

        // Light constants and placeholders
		this.spotLight = null;
		this.pointLight = null;
		this.spotPower = 50;
		this.pointPower = 30;

    }

    build() {

        this.lampShellMaterial.side = THREE.FrontSide;
        this.lampInsideMaterial.side = THREE.BackSide;
        // supports of the lamp
        const upperSupportGeometry = new THREE.CylinderGeometry(this.upperSupportRadius, this.upperSupportRadius, this.supportHeight * 4/5, 32);
        const lowerSupportGeometry = new THREE.CapsuleGeometry(this.lowerSupportRadius, this.supportHeight * 1/5, 32, 32);
        const upperSupport1 = new THREE.Mesh(upperSupportGeometry, this.lampSupportMaterial);
        const lowerSupport1 = new THREE.Mesh(lowerSupportGeometry, this.lampSupportMaterial);
        const upperSupport2 = new THREE.Mesh(upperSupportGeometry, this.lampSupportMaterial);
        const lowerSupport2 = new THREE.Mesh(lowerSupportGeometry, this.lampSupportMaterial);
        upperSupport1.position.set( -this.shellTopWidth/2 * 4 / 5, this.supportHeight * 4/5 / 2, 0);
        lowerSupport1.position.set( -this.shellTopWidth/2 * 4 / 5, this.supportHeight * 1/5 / 2, 0);
        upperSupport2.position.set( this.shellTopWidth/2 * 4 / 5, this.supportHeight * 4/5 / 2, 0);
        lowerSupport2.position.set( this.shellTopWidth/2 * 4 / 5, this.supportHeight * 1/5 / 2, 0);

        this.add(upperSupport1);
        this.add(lowerSupport1);
        this.add(upperSupport2);
        this.add(lowerSupport2);
        // shell of the lamp
        const shellTopGeometry = new THREE.BoxGeometry(this.shellTopWidth, this.shellThickness, this.shellTopDepth);
        //console.log(this.lampShellMaterial)
        const shellTop = new THREE.Mesh(shellTopGeometry, this.lampShellMaterial);

        this.add(shellTop);
        const bottomBase = 1 / Math.sqrt(2) + 2 * Math.tan(this.shellInclineAngle) * this.shellHeight ; 
        let shellInclinedGeometry = new THREE.CylinderGeometry(1 / Math.sqrt(2),bottomBase, this.shellHeight , 4,1,true);
        shellInclinedGeometry.rotateY(Math.PI / 4);
        shellInclinedGeometry = shellInclinedGeometry.toNonIndexed();
        shellInclinedGeometry.computeVertexNormals();
        const shellInclined = new THREE.Mesh(shellInclinedGeometry, this.lampShellMaterial);
        shellInclined.scale.set(this.shellTopWidth,this.shellHeight,this.shellTopDepth);
        shellInclined.position.set(0,-this.shellHeight / 2,0);
        this.add(shellInclined);

        // inside of the lamp
        const shellTopInsideGeometry = new THREE.PlaneGeometry(this.shellTopWidth , this.shellTopDepth);
        const shellTopInside = new THREE.Mesh(shellTopInsideGeometry, this.lampInsideMaterial);
        shellTopInside.position.set(0,-this.shellThickness / 2 - 0.01,0);
        shellTopInside.rotateX(- Math.PI / 2);
        this.add(shellTopInside);
        let shellInsideGeometry = new THREE.CylinderGeometry(1 / Math.sqrt(2) ,bottomBase , this.shellHeight , 4,1,true);
        shellInsideGeometry.rotateY(Math.PI / 4);
        shellInsideGeometry = shellInsideGeometry.toNonIndexed();
        shellInsideGeometry.computeVertexNormals();
        const shellInside = new THREE.Mesh(shellInsideGeometry, this.lampInsideMaterial);
        shellInside.scale.set(this.shellTopWidth ,this.shellHeight,this.shellTopDepth);
        shellInside.position.set(0,-this.shellHeight / 2,0);
        this.add(shellInside);

        // SpotLight
        this.spotLight = new THREE.SpotLight(0x7F7F00, 1);
        this.spotLight.position.set(0, - this.shellThickness - 0.20, 0);
        this.spotLight.angle = Math.PI / 4  ;
        this.spotLight.power = this.spotPower;
        this.spotLight.penumbra = 0.1;
        this.spotLight.decay = 1;
        this.spotLight.distance = 50;
        this.spotLight.castShadow = true;
        this.spotLight.shadow.mapSize.width = 512;
        this.spotLight.shadow.mapSize.height = 512;
        this.spotLight.shadow.camera.near = 0.5;
        this.spotLight.shadow.camera.far = 50;
        const target = new THREE.Object3D();
        target.position.set(0, -10, 0);
        this.spotLight.target = target;
        this.add(this.spotLight);
        this.add(this.spotLight.target);
        this.spotLight.target.updateMatrixWorld();

        // Inside light
        this.pointLight = new THREE.PointLight(0xFFFF00, 0.5, 10, 2);
        this.pointLight.power = this.pointPower;
        this.pointLight.position.set(0, - this.shellThickness - 0.20, 0);
        this.add(this.pointLight);


    }

	update() {
		this.pointLight.power = this.pointPower;
		this.spotLight = this.spotPower; 
	}

}

export { Lamp };
