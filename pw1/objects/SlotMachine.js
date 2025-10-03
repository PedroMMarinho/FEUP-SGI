import * as THREE from 'three';

class SlotMachine extends THREE.Object3D {
    constructor(x, y, z, ang = 0) {
        super();
        this.position.set(x, y, z);
        this.rotation.y = ang;
        this.initMaterials();
        this.initConstants();
    }

    initMaterials() {
        this.slotMachineMaterial = new THREE.MeshPhongMaterial({ color: 0x8B0000, shininess: 100 });
        this.slotLeverMaterial = new THREE.MeshPhongMaterial({ color: 0x222222, shininess: 100, specular: 0x555555 });
        this.slotKnobMaterial = new THREE.MeshPhongMaterial({
            color: 0xff0000,
            shininess: 50,
            specular: 0xffffff,
            reflectivity: 0.1
        });
        this.slotCylinderMaterial = new THREE.MeshPhongMaterial({
            color: 0x555555,
            shininess: 120,
            specular: new THREE.Color(0xaaaaaa),
            reflectivity: 0.6
        });
        this.topShinyLightMaterial = new THREE.MeshPhongMaterial({
            color: 0xffff00,
            shininess: 150,
            specular: new THREE.Color(0xffffff),
            reflectivity: 0.9,
            emissive: new THREE.Color(0xffff00),
            emissiveIntensity: 0.5
        });
        this.glassMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            metalness: 0,
            roughness: 0,
            transparent: true,
            opacity: 0.4,
            transmission: 1.0,
            thickness: 0.1,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1,
            side: THREE.DoubleSide
        });
        this.buttonGlowMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,                  
            emissive: 0xffffff,               
            emissiveIntensity: 0.6,           
        });

        this.oneLineMaterial = null;
        this.threeLinesMaterial = null;
        this.fiveLinesMaterial = null;
        this.sevenLinesMaterial = null;
        this.nineLinesMaterial = null;
        this.repeatBetMaterial = null;
        this.slotGoldMaterial = null;
        this.slotMachineBodyMaterial = null;
        this.slotMachineScreenMaterial = null;
        this.slotMachineMetalMaterial = null;
        this.slotMachineTopMaterial = null;
        this.slotMachineBottomMaterial = null;

    }

    initConstants() {
        this.machineWidth = 3;
        this.machineHeight = 5;
        this.machineDepth = 2.5;
    }

    initButtons() {


        const createButton = (buttonTopMaterial, buttonWidth = 0.15, buttonHeight = 0.08, buttonDepth = 0.15) => {
            const buttonGroup = new THREE.Group();

            const bottomPart = new THREE.Mesh(
                new THREE.BoxGeometry(buttonWidth + buttonWidth * 0.15, buttonHeight, buttonDepth + buttonDepth * 0.15),
                this.slotMachineBodyMaterial
            );

            const topPart = new THREE.Mesh(
                new THREE.BoxGeometry(buttonWidth, buttonHeight, buttonDepth),
                this.buttonGlowMaterial
            );

            const topGeo = new THREE.PlaneGeometry(buttonWidth, buttonDepth);
            const topText = new THREE.Mesh(topGeo, buttonTopMaterial);

            bottomPart.position.set(0, 0, 0);
            topPart.position.set(0, buttonHeight / 2, 0);

            topText.position.set(0, buttonHeight + 0.001, 0);  
            topText.rotation.x = -Math.PI / 2;
            buttonGroup.add(bottomPart);
            buttonGroup.add(topPart);
            buttonGroup.add(topText);

            return buttonGroup;
        };

        // Get positioning based on smallBox
        const currentY = -this.machineHeight * 0.05 + this.machineHeight * 0.2 / 2 + 0.08 / 2;
        const buttonZ = this.machineDepth / 2 + 0.15 + 1.8 / 2 + 0.05;
        const buttonX = this.machineWidth / 2;

        // Create three buttons
        const button1 = createButton(this.oneLineMaterial);
        const button2 = createButton(this.threeLinesMaterial);
        const button3 = createButton(this.fiveLinesMaterial);
        const button4 = createButton(this.sevenLinesMaterial);
        const button5 = createButton(this.nineLinesMaterial);
        const button6 = createButton(this.repeatBetMaterial , 0.3, 0.1, 0.3);

        const buttonWidth = 0.15;

        button1.position.set(-buttonX + 2 * buttonWidth, currentY, buttonZ);
        button2.position.set(-buttonX + 4 * buttonWidth, currentY, buttonZ);
        button3.position.set(-buttonX + 8 * buttonWidth, currentY, buttonZ);
        button4.position.set(-buttonX + 6 * buttonWidth, currentY, buttonZ);
        button5.position.set(-buttonX + 10 * buttonWidth, currentY, buttonZ);
        button6.position.set(-buttonX + 18 * buttonWidth, currentY, buttonZ);

        this.add(button1);
        this.add(button2);
        this.add(button3);
        this.add(button4);
        this.add(button5);
        this.add(button6);
    }


    initTopLigth() {
        const bigCylinderRadius = 0.22;
        const bigCylinderHeight = 0.3;

        const smallCylinderRadius = 0.15;
        const smallCylinderHeight = 0.2;

        const smallCylinderLightRadius = smallCylinderRadius + 0.01;

        const bigCylinderGeo = new THREE.CylinderGeometry(bigCylinderRadius, bigCylinderRadius, bigCylinderHeight, 32);
        const smallCylinderGeo = new THREE.CylinderGeometry(smallCylinderRadius, smallCylinderRadius, smallCylinderHeight, 32);
        const CylinderGeoLight = new THREE.CylinderGeometry(smallCylinderLightRadius, smallCylinderLightRadius, smallCylinderHeight, 32);



        const bigCylinder = new THREE.Mesh(bigCylinderGeo, this.slotGoldMaterial);
        const smallCylinder1 = new THREE.Mesh(smallCylinderGeo, this.slotKnobMaterial);
        const smallCylinder2 = new THREE.Mesh(CylinderGeoLight, this.topShinyLightMaterial);

        const baseY = this.machineHeight / 2 + this.machineWidth / 2;
        let currentY = baseY;

        bigCylinder.position.set(0, currentY, 0);


        currentY += bigCylinderHeight / 2 + smallCylinderHeight / 2;
        smallCylinder1.position.set(0, currentY, 0);

        currentY += smallCylinderHeight / 2 + smallCylinderHeight / 2;
        smallCylinder2.position.set(0, currentY, 0);

        // Two torus rings 
        const torusRadius = smallCylinderLightRadius;
        const tubeRadius = 0.02;
        const torusGeo = new THREE.TorusGeometry(torusRadius, tubeRadius, 16, 100);

        const torus1 = new THREE.Mesh(torusGeo, this.slotMachineMetalMaterial);
        const torus2 = new THREE.Mesh(torusGeo, this.slotMachineMetalMaterial);

        torus1.rotation.x = Math.PI / 2;
        torus2.rotation.x = Math.PI / 2;

        torus1.position.set(0, currentY + smallCylinderHeight * 0.5, 0);
        torus2.position.set(0, currentY - smallCylinderHeight * 0.5, 0);


        const topCircleGeo = new THREE.CircleGeometry(torusRadius - tubeRadius + 0.01, 32);
        const topCircle = new THREE.Mesh(topCircleGeo, this.slotMachineMetalMaterial);
        topCircle.rotation.x = -Math.PI / 2;
        topCircle.position.set(0, currentY + smallCylinderHeight / 2 + 0.01, 0);


        const glassGeo = new THREE.CylinderGeometry(
            smallCylinderLightRadius + 0.01,
            smallCylinderLightRadius + 0.01,
            smallCylinderHeight,
            32,
            1,
            true
        );


        const glassCylinder = new THREE.Mesh(glassGeo, this.glassMaterial);
        glassCylinder.position.set(0, currentY, 0);

        this.add(glassCylinder);


        this.add(topCircle);

        this.add(bigCylinder);
        this.add(smallCylinder1);
        this.add(smallCylinder2);
        this.add(torus1);
        this.add(torus2);



        this.add(bigCylinder);
        this.add(smallCylinder1);
        this.add(smallCylinder2);
    }



    build() {

        // main body
        const machineGeo = new THREE.BoxGeometry(this.machineWidth + 0.02, this.machineHeight, this.machineDepth);
        const machine = new THREE.Mesh(machineGeo, this.slotMachineBodyMaterial);
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
            bevelEnabled: false,
            curveSegments: 64
        };

        const semiGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        const semicircle = new THREE.Mesh(semiGeo, this.slotMachineBodyMaterial);
        semicircle.position.set(0, this.machineHeight / 2, -this.machineDepth / 2);
        semicircle.rotation.z = Math.PI;
        this.add(semicircle);


        const frontRadius = this.machineWidth / 2;

        const frontGeo = new THREE.CircleGeometry(frontRadius, 64, Math.PI, Math.PI);


        const frontSemi = new THREE.Mesh(frontGeo, this.slotMachineTopMaterial);

        frontSemi.position.set(0, this.machineHeight / 2, this.machineDepth / 2 - 0.09);

        frontSemi.rotation.x = Math.PI;
        frontSemi.rotation.y = Math.PI;

        this.add(frontSemi);

        // Thin box on the front
        const frontBoxDepth = 0.6;
        const frontBoxGeo = new THREE.BoxGeometry(this.machineWidth + 0.03, this.machineHeight * 0.9 + 0.01, frontBoxDepth);
        const frontBox = new THREE.Mesh(frontBoxGeo, this.slotMachineBodyMaterial);

        frontBox.position.set(0, -this.machineHeight * 0.05, this.machineDepth / 2);
        this.add(frontBox);

        // slot panel with hole 
        const panelWidth = this.machineWidth - 0.01;
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
        const panel = new THREE.Mesh(panelGeo, this.slotMachineMetalMaterial);

        panel.position.set(0, this.machineHeight * 0.2, this.machineDepth / 2 + frontBoxDepth - 0.2);
        panel.rotation.x = -Math.PI / 12;

        this.add(panel);

        const slotPlaneWidth = holeWidth;
        const slotPlaneHeight = holeHeight;

        const slotPlaneGeo = new THREE.PlaneGeometry(slotPlaneWidth, slotPlaneHeight);

        const slotPlane = new THREE.Mesh(slotPlaneGeo, this.slotMachineScreenMaterial);

        // position the plane inside the hole
        slotPlane.position.set(0, this.machineHeight * 0.2, this.machineDepth / 2 + frontBoxDepth - 0.2 + 0.051);
        slotPlane.rotation.x = -Math.PI / 12;

        this.add(slotPlane);


        // left side cover plane
        const sideWidth = 0.4;
        const sideHeight = panelHeight - 0.2;

        const sideGeo = new THREE.PlaneGeometry(sideWidth, sideHeight);
        const leftSide = new THREE.Mesh(sideGeo, this.slotMachineMetalMaterial);

        leftSide.position.set(-panelWidth / 2 - 0.01, this.machineHeight * 0.2, this.machineDepth / 2 + frontBoxDepth - 0.26);

        leftSide.rotation.y = Math.PI / 2;
        leftSide.rotation.x = -Math.PI / 12;

        this.add(leftSide);

        // right side cover plane
        const rightSide = new THREE.Mesh(sideGeo, this.slotMachineMetalMaterial);
        rightSide.position.set(panelWidth / 2 + 0.01, this.machineHeight * 0.2, this.machineDepth / 2 + frontBoxDepth - 0.26);

        rightSide.rotation.y = -Math.PI / 2;
        rightSide.rotation.x = -Math.PI / 12;

        this.add(rightSide);


        // Another small box at the front
        const frontButtonBoxDepth = 1.8;
        const smallBoxGeo = new THREE.BoxGeometry(this.machineWidth, this.machineHeight * 0.2, frontButtonBoxDepth);
        const smallBox = new THREE.Mesh(smallBoxGeo, this.slotMachineMaterial);
        smallBox.position.set(0, -this.machineHeight * 0.05, this.machineDepth / 2 + frontBoxDepth - 0.15);
        this.add(smallBox);

        // another front box below the button box
        const lowerBoxDepth = 0.8;
        const lowerBoxGeo = new THREE.BoxGeometry(this.machineWidth + 0.02, this.machineHeight * 0.6, lowerBoxDepth);
        const lowerBox = new THREE.Mesh(lowerBoxGeo, this.slotMachineBodyMaterial);
        lowerBox.position.set(0, -this.machineHeight * 0.2, this.machineDepth / 2 + frontBoxDepth - 0.15);
        this.add(lowerBox);


        // plane in front of the lower box
        const planeWidth = this.machineWidth + 0.02;
        const planeHeight = this.machineHeight * 0.35;

        const lowerBoxPlaneGeo = new THREE.PlaneGeometry(planeWidth, planeHeight);
        const lowerBoxPlane = new THREE.Mesh(lowerBoxPlaneGeo, this.slotMachineBottomMaterial);

        lowerBoxPlane.position.set(
            0,
            -this.machineHeight * 0.325,
            this.machineDepth / 2 + frontBoxDepth - 0.15 + lowerBoxDepth / 2 + 0.01
        );

        this.add(lowerBoxPlane);


        // big cylinder support
        const baseRadius = 0.6;
        const baseHeight = 0.3;
        const baseGeo = new THREE.CylinderGeometry(baseRadius, baseRadius, baseHeight, 16);
        const base = new THREE.Mesh(baseGeo, this.slotCylinderMaterial);

        base.rotation.z = Math.PI / 2;
        base.position.set(this.machineWidth / 2 + baseHeight / 2, -this.machineHeight * 0.05, this.machineDepth * 0.1);
        this.add(base);

        // smaller handle cylinder
        const handleRadius = 0.4;
        const handleHeight = 0.2;
        const handleGeo = new THREE.CylinderGeometry(handleRadius, handleRadius, handleHeight, 16);
        const handle = new THREE.Mesh(handleGeo, this.slotGoldMaterial);

        handle.rotation.z = Math.PI / 2;
        handle.position.set(this.machineWidth / 2 + baseHeight + handleHeight / 2, -this.machineHeight * 0.05, this.machineDepth * 0.1);
        this.add(handle);

        // capsule coming out of the handle
        const capsuleRadius = 0.1;
        const capsuleLength = 2;
        const capsuleGeo = new THREE.CapsuleGeometry(capsuleRadius, capsuleLength, 8, 16);
        const capsule = new THREE.Mesh(capsuleGeo, this.slotLeverMaterial);

        capsule.rotation.z = -Math.PI / 3;
        capsule.rotation.y = -Math.PI / 2;
        capsule.position.set(
            this.machineWidth / 2 + baseHeight + handleHeight / 2,
            this.machineHeight * 0.05,
            this.machineDepth * 0.4
        );
        this.add(capsule);

        // knob sphere at the end of the capsule
        const knobRadius = 0.2;
        const knobGeo = new THREE.SphereGeometry(knobRadius, 16, 16);
        const knob = new THREE.Mesh(knobGeo, this.slotKnobMaterial);

        knob.position.set(
            this.machineWidth / 2 + baseHeight + handleHeight / 2,
            this.machineHeight * 0.15,
            this.machineDepth * 0.75
        );
        this.add(knob);

        this.initTopLigth();
        this.initButtons();
    }


}

export { SlotMachine };