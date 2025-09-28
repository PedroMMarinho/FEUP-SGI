import * as THREE from 'three';

class PokerTable extends THREE.Object3D {
    constructor(x, y, z, ang = 0) {
        super();

        this.position.set(x, y, z);
        this.rotation.y = ang;

        this.initMaterials();
        this.initConstants();
    }

    initMaterials() {
        this.pokerFeelMaterial = null
        this.pokerTableMaterial = null
        this.pokerRestMaterial = null
        this.pokerLegMaterial = null

        this.sideRingMaterial = new THREE.MeshStandardMaterial({
            color: 0x050518,
            metalness: 0.5,
            roughness: 0.3,
            emissive: new THREE.Color(0x0088ff), 
            emissiveIntensity: 2.5,             
            side: THREE.DoubleSide               
        });

    }

    initConstants() {
        // Table dimensions
        this.tableRadiusX = 4;
        this.tableRadiusZ = 5;
        this.legRadius = 0.15;
        this.legHeight = 2;
    }

    createLight(y, thickness) {
        const outerLightGeo = new THREE.CylinderGeometry(1, 1, thickness, 64, 1, true);
        const outerLight = new THREE.Mesh(outerLightGeo, this.sideRingMaterial);
        outerLight.scale.set(this.tableRadiusX, 1, this.tableRadiusZ);
        outerLight.position.y = y;
        this.add(outerLight);

        const innerLightGeo = new THREE.CylinderGeometry(1, 1, thickness, 64, 1, true);
        const innerLight = new THREE.Mesh(innerLightGeo, this.sideRingMaterial);
        innerLight.scale.set(this.tableRadiusX * 0.95, 1, this.tableRadiusZ * 0.95);
        innerLight.position.y = y;
        this.add(innerLight);
    }

    createTableTop(y, thickness, material = this.pokerTableMaterial) {
        const tableTopGeo = new THREE.CylinderGeometry(1, 1, thickness, 64);
        const tableTop = new THREE.Mesh(tableTopGeo, material);
        tableTop.scale.set(this.tableRadiusX, 1, this.tableRadiusZ);
        tableTop.position.y = y;
        this.add(tableTop);
    }

    createHollowTableTop(y, thickness, material = this.pokerFeelMaterial) {
        const outerTopGeometry = new THREE.CylinderGeometry(1, 1, thickness, 64, 1, true);
        const outerTop = new THREE.Mesh(outerTopGeometry, material);
        outerTop.scale.set(this.tableRadiusX, 1, this.tableRadiusZ);
        outerTop.position.y = y;
        this.add(outerTop);

        const innerTopGeometry = new THREE.CylinderGeometry(1, 1, thickness, 64, 1, true);
        const innerTop = new THREE.Mesh(innerTopGeometry, material);
        innerTop.scale.set(this.tableRadiusX * 0.95, 1, this.tableRadiusZ * 0.95);
        innerTop.position.y = y;
        this.add(innerTop);

        const ringGeometry = new THREE.RingGeometry(
            0.95,
            1,
            64
        );

        const topRing = new THREE.Mesh(ringGeometry, material);
        topRing.scale.set(this.tableRadiusX, this.tableRadiusZ, 1);
        topRing.position.y = y + thickness / 2;
        topRing.rotation.x = -Math.PI / 2;
        this.add(topRing);
    }

    createCoverRest(y, thickness, material = this.pokerRestMaterial) {

        const railGeometry = new THREE.TorusGeometry(
            1,
            0.05,
            16,
            64
        );

        const armRail = new THREE.Mesh(railGeometry, material);
        armRail.scale.set(this.tableRadiusX, this.tableRadiusZ + thickness / 2, 1);
        armRail.position.y = y;
        armRail.rotation.x = Math.PI / 2;
        this.add(armRail);
    }

    build() {
        const topThickness = 0.2;
        const lightThickness = topThickness / 3;

        let currentHeight = this.legHeight + topThickness / 2;

        // From bottom to top
        this.createTableTop(currentHeight, topThickness, this.pokerFeelMaterial);

        currentHeight += topThickness / 2 + lightThickness / 2;
        this.createLight(currentHeight, lightThickness);

        currentHeight += lightThickness / 2 + topThickness / 2;
        this.createTableTop(currentHeight, topThickness, [this.pokerFeelMaterial, this.pokerTableMaterial]);

        currentHeight += topThickness / 2 + lightThickness / 2;
        this.createLight(currentHeight, lightThickness);

        currentHeight += lightThickness / 2 + topThickness / 2;
        this.createHollowTableTop(currentHeight, topThickness);

        currentHeight += topThickness / 2 + lightThickness / 2;
        this.createCoverRest(currentHeight, topThickness);

        // Legs
        const legGeo = new THREE.CylinderGeometry(this.legRadius, this.legRadius, this.legHeight, 32);
        const offsetX = this.tableRadiusX * 0.6;
        const offsetZ = this.tableRadiusZ * 0.6;

        const offsets = [
            [offsetX, 0, offsetZ],
            [offsetX, 0, -offsetZ],
            [-offsetX, 0, offsetZ],
            [-offsetX, 0, -offsetZ]
        ];

        offsets.forEach(([x, _, z]) => {
            const leg = new THREE.Mesh(legGeo, this.pokerLegMaterial);
            leg.position.set(x, this.legHeight / 2, z);
            this.add(leg);
        });
    }
}

export { PokerTable };