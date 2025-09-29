import * as THREE from 'three';

export const PokerChipValue = {
    TWENTY_FIVE: 0,
    FIFTY: 1,
    ONE_HUNDRED: 2,
    FIVE_HUNDRED: 3
};

class PokerChip extends THREE.Object3D {
    constructor(x, y, z, ang = 0) {
        super();

        this.position.set(x, y, z);
        this.rotation.y = ang;

        this.initMaterials();
        this.initConstants();
    }
    initMaterials() {
        this.topMaterial = null;
        this.sideMaterial = null;
    }

    initConstants() {
        this.chipRadius = 2;
        this.chipHeight = 0.3;
    }

    build() {

        const chipGeo = new THREE.CylinderGeometry(this.chipRadius, this.chipRadius, this.chipHeight, 32);
        const chip = new THREE.Mesh(chipGeo, [this.sideMaterial, this.topMaterial, this.topMaterial]);
        this.add(chip);
        console.log("Poker chip created");
    }

}

export { PokerChip };