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
        this.shellTopWidth = 1.5;
        this.shellHeight = 0.5;
        this.shellTopDepth = 1.5;
        this.shellInclineAngle = Math.PI / 6; // 30 degrees
        this.shellThickness = 0.05;
        
        // Support dimensions
        this.upperSupportRadius = 0.05;
        this.lowerSupportRadius = 0.1;
        this.supportHeight = 2;

        // Light constants


    }

    build() {
        // supports of the lamp
        const upperSupportGeometry = new THREE.CylinderGeometry(this.upperSupportRadius, this.upperSupportRadius, this.supportHeight * 4/5, 32);
        const lowerSupportGeometry = new THREE.CylinderGeometry(this.lowerSupportRadius, this.lowerSupportRadius, this.supportHeight * 1/5, 32);
        const upperSupport1 = new THREE.Mesh(upperSupportGeometry, this.lampSupportMaterial);
        const lowerSupport1 = new THREE.Mesh(lowerSupportGeometry, this.lampSupportMaterial);
        const upperSupport2 = new THREE.Mesh(upperSupportGeometry, this.lampSupportMaterial);
        const lowerSupport2 = new THREE.Mesh(lowerSupportGeometry, this.lampSupportMaterial);
        upperSupport1.position.set( -this.shellTopWidth/2 , this.supportHeight * 4/5 / 2, 0);
        lowerSupport1.position.set( -this.shellTopWidth/2 , this.supportHeight * 1/5 / 2, 0);
        upperSupport2.position.set( this.shellTopWidth/2 , this.supportHeight * 4/5 / 2, 0);
        lowerSupport2.position.set( this.shellTopWidth/2 , this.supportHeight * 1/5 / 2, 0);

        this.add(upperSupport1);
        this.add(lowerSupport1);
        this.add(upperSupport2);
        this.add(lowerSupport2);
    }

}

export { Lamp };