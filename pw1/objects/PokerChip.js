import * as THREE from 'three';


class PokerChip extends THREE.Object3D {
    constructor(x, y, z, ang = 0) {
        super();

        this.position.set(x, y, z);
        this.rotation.y = ang;

        this.initConstants();
    }

    initConstants() {
        this.chipRadius = 0.05;
        this.chipHeight = 0.01;
    }

    build(topMaterial, sideMaterial) {

        const chipGeo = new THREE.CylinderGeometry(this.chipRadius, this.chipRadius, this.chipHeight, 32);
        const chip = new THREE.Mesh(chipGeo, [ sideMaterial, topMaterial, topMaterial]);
        this.add(chip);
        console.log("Poker chip created");
    }

}

export { PokerChip };