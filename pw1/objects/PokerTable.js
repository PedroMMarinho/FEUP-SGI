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

        this.sideRingMaterial = new THREE.MeshPhongMaterial({
            color: 0xFFD700,
            emissive: new THREE.Color(0xE6C200), 
            emissiveIntensity: 2,
            transparent: true,
            shininess: 100,
            specular: new THREE.Color(0xFFFFFF),
            opacity: 0.8,
            side: THREE.DoubleSide
        });


    }

    initConstants() {
        // Table dimensions
        this.tableRadiusX = 4;
        this.tableRadiusZ = 5;
        this.legRadius = 0.15;
        this.legHeight = 3;
        this.topThickness = 0.2;
        this.lightThickness = this.topThickness / 3;
        this.tableBase = this.legHeight + this.topThickness*2 + this.lightThickness;
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

        let currentHeight = this.legHeight + this.topThickness / 2;

        // From bottom to top
        this.createTableTop(currentHeight, this.topThickness, this.pokerFeelMaterial);

        currentHeight += this.topThickness / 2 + this.lightThickness / 2;
        this.createLight(currentHeight, this.lightThickness);

        // Poker tables base
        currentHeight += this.lightThickness / 2 + this.topThickness / 2;
        this.createTableTop(currentHeight, this.topThickness, [this.pokerFeelMaterial, this.pokerTableMaterial]);

        currentHeight += this.topThickness / 2 + this.lightThickness / 2;
        this.createLight(currentHeight, this.lightThickness);

        currentHeight += this.lightThickness / 2 + this.topThickness / 2;
        this.createHollowTableTop(currentHeight, this.topThickness);

        currentHeight += this.topThickness / 2 + this.lightThickness / 2;
        this.createCoverRest(currentHeight, this.topThickness);

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

        this.traverse( function ( child ) {
            if ( child instanceof THREE.Mesh ) {
                child.castShadow = true;
                child.receiveShadow = true;
            } 
        } );
    }

    getTableBase(){
        return this.tableBase;
    }
}

export { PokerTable };