import * as THREE from 'three';

class SlotMachine extends THREE.Object3D {
    constructor(x, y, z, ang = 0) {
        super();
        this.position.set(x, y, z);
        this.rotation.y = ang;
        this.initMaterials();
        this.initConstants();
        this.build();
    }

    initMaterials() {
        this.slotMachineMaterial = new THREE.MeshPhongMaterial({ color: 0x8B0000, shininess: 100,
            specular: new THREE.Color(0x555555), side: THREE.DoubleSide });
    }

    initConstants() {
        this.machineWidth = 3;
        this.machineHeight = 5;
        this.machineDepth = 2.5;
    }

   build() {

    // main body
    const machineGeo = new THREE.BoxGeometry(this.machineWidth, this.machineHeight, this.machineDepth);
    const machine = new THREE.Mesh(machineGeo, this.slotMachineMaterial);
    this.add(machine);

    // semicircle shape
    const radius = this.machineWidth / 2; 
    const shape = new THREE.Shape();

    shape.moveTo(-radius, 0);
    shape.absarc(0, 0, radius, Math.PI, 0, false);
    shape.lineTo(radius, 0);
    shape.lineTo(-radius, 0);

    const extrudeSettings = {
        depth: this.machineDepth - 0.1,
        bevelEnabled: false
    };

    const semiGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const semicircle = new THREE.Mesh(semiGeo, this.slotMachineMaterial);
    semicircle.position.set(0, this.machineHeight / 2, -this.machineDepth / 2);
    semicircle.rotation.z = Math.PI; 
    this.add(semicircle);

    // Thin box on the front
    const frontBoxDepth = 0.6;
    const frontBoxGeo = new THREE.BoxGeometry(this.machineWidth , this.machineHeight * 0.9 , frontBoxDepth);
    const frontBox = new THREE.Mesh(frontBoxGeo, this.slotMachineMaterial);

    frontBox.position.set(0, -this.machineHeight * 0.05, this.machineDepth / 2);
    this.add(frontBox);

    // slot panel with hole 
    const panelWidth = this.machineWidth;
    const panelHeight = this.machineHeight * 0.4;

    // outer rectangle
    const panelShape = new THREE.Shape();
    panelShape.moveTo(-panelWidth / 2, -panelHeight / 2);
    panelShape.lineTo(panelWidth / 2, -panelHeight / 2);
    panelShape.lineTo(panelWidth / 2, panelHeight / 2);
    panelShape.lineTo(-panelWidth / 2, panelHeight / 2);
    panelShape.lineTo(-panelWidth / 2, -panelHeight / 2);

    // hole rectangle
    const holeWidth = panelWidth * 0.7;
    const holeHeight = panelHeight * 0.5;
    const hole = new THREE.Path();
    hole.moveTo(-holeWidth / 2, -holeHeight / 2);
    hole.lineTo(holeWidth / 2, -holeHeight / 2);
    hole.lineTo(holeWidth / 2, holeHeight / 2);
    hole.lineTo(-holeWidth / 2, holeHeight / 2);
    hole.lineTo(-holeWidth / 2, -holeHeight / 2);
    panelShape.holes.push(hole);

    const panelExtrudeSettings = {
        depth: 0.1,
        bevelEnabled: false
    };
    const panelGeo = new THREE.ExtrudeGeometry(panelShape, panelExtrudeSettings);
    const panel = new THREE.Mesh(panelGeo, this.slotMachineMaterial);

    panel.position.set(0, this.machineHeight * 0.2, this.machineDepth / 2 + frontBoxDepth - 0.2);
    panel.rotation.x = -Math.PI / 12; 

    this.add(panel);

    const slotPlaneWidth = holeWidth;
    const slotPlaneHeight = holeHeight;

    const slotPlaneGeo = new THREE.PlaneGeometry(slotPlaneWidth, slotPlaneHeight);
    // TODO
    const slotPlaneMat = new THREE.MeshBasicMaterial({
        map: this.slotTexture, 
        side: THREE.DoubleSide
    });
    const slotPlane = new THREE.Mesh(slotPlaneGeo, slotPlaneMat);

    // position the plane inside the hole
    slotPlane.position.set(0, this.machineHeight * 0.2, this.machineDepth / 2 + frontBoxDepth - 0.2 + 0.051); 
    slotPlane.rotation.x = -Math.PI / 12; 

    this.add(slotPlane);


    // left side cover plane
    const sideWidth = 0.4; 
    const sideHeight = panelHeight - 0.2;

    const sideGeo = new THREE.PlaneGeometry(sideWidth, sideHeight);
    const leftSide = new THREE.Mesh(sideGeo, this.slotMachineMaterial);

    leftSide.position.set(-panelWidth / 2, this.machineHeight * 0.2, this.machineDepth / 2 + frontBoxDepth - 0.25);

    leftSide.rotation.y = Math.PI / 2;
    leftSide.rotation.x = -Math.PI / 12; 

    this.add(leftSide);

    // right side cover plane
    const rightSide = new THREE.Mesh(sideGeo, this.slotMachineMaterial);
    rightSide.position.set(panelWidth / 2, this.machineHeight * 0.2, this.machineDepth / 2 + frontBoxDepth - 0.25);

    rightSide.rotation.y = -Math.PI / 2;
    rightSide.rotation.x = -Math.PI / 12;

    this.add(rightSide);


    // Another small box at the front
    const frontButtonBoxDepth = 1.5;
    const smallBoxGeo = new THREE.BoxGeometry(this.machineWidth, this.machineHeight * 0.2, frontButtonBoxDepth);
    const smallBox = new THREE.Mesh(smallBoxGeo, this.slotMachineMaterial);
    smallBox.position.set(0, -this.machineHeight * 0.05, this.machineDepth / 2 + frontBoxDepth - 0.15);
    this.add(smallBox);

    // another front box below the button box
    const lowerBoxDepth = 0.8;
    const lowerBoxGeo = new THREE.BoxGeometry(this.machineWidth, this.machineHeight * 0.6, lowerBoxDepth);
    const lowerBox = new THREE.Mesh(lowerBoxGeo, this.slotMachineMaterial);
    lowerBox.position.set(0, -this.machineHeight * 0.2, this.machineDepth / 2 + frontBoxDepth - 0.15);
    this.add(lowerBox);

    const baseRadius = 0.6;
    const baseHeight = 0.3;
    const baseGeo = new THREE.CylinderGeometry(baseRadius, baseRadius, baseHeight, 16);
    const base = new THREE.Mesh(baseGeo, this.slotMachineMaterial);

    // position base cylinder
    base.rotation.z = Math.PI / 2; 
    base.position.set(this.machineWidth / 2 + baseHeight / 2, -this.machineHeight * 0.05, this.machineDepth *0.1);
    this.add(base);

    // smaller handle cylinder
    const handleRadius = 0.4;
    const handleHeight = 0.2;
    const handleGeo = new THREE.CylinderGeometry(handleRadius, handleRadius, handleHeight, 16);
    const handle = new THREE.Mesh(handleGeo, this.slotMachineMaterial);

    // position handle cylinder at the end of base
    handle.rotation.z = Math.PI / 2; 
    handle.position.set(this.machineWidth / 2 + baseHeight + handleHeight / 2, -this.machineHeight * 0.05, this.machineDepth *0.1);
    this.add(handle);

    // capsule coming out of the handle
    const capsuleRadius = 0.1;
    const capsuleLength = 2;
    const capsuleGeo = new THREE.CapsuleGeometry(capsuleRadius, capsuleLength, 8, 16);
    const capsule = new THREE.Mesh(capsuleGeo, this.slotMachineMaterial);

    // position capsule at the end of handle
    capsule.rotation.z = -Math.PI / 3; 
    capsule.rotation.y = -Math.PI / 2; 
    capsule.position.set(
        this.machineWidth / 2 + baseHeight + handleHeight/2 ,
        this.machineHeight * 0.05,
        this.machineDepth *0.4 
    );
    this.add(capsule);

    // knob sphere at the end of the capsule
    const knobRadius = 0.2;
    const knobGeo = new THREE.SphereGeometry(knobRadius, 16, 16);
    const knob = new THREE.Mesh(knobGeo, this.slotMachineMaterial);

    knob.position.set(
        this.machineWidth / 2 + baseHeight + handleHeight/2 ,
        this.machineHeight * 0.15,
        this.machineDepth * 0.75
    );
    this.add(knob);

}


}

export { SlotMachine };