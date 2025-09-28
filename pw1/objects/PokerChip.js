import * as THREE from 'three';

export const PokerChipValue = {
    TWENTY_FIVE: 25,
    FIFTY: 50,
    ONE_HUNDRED: 100,
    FIVE_HUNDRED: 500
};

class PokerChip extends THREE.Object3D {
    constructor(x, y, z, ang = 0, value = PokerChipValue.TWENTY_FIVE) {
        super();

        this.position.set(x, y, z);
        this.rotation.y = ang;
        this.value = value;

        this.initMaterials();
        this.initConstants();
    }

    initMaterials() {
        this.sideTexture = null;
        this.topTexture = null;
        switch (this.value) {
            case PokerChipValue.TWENTY_FIVE:
                this.sideTexture = new THREE.TextureLoader().load('textures/chipSide.png');
                this.topTexture = new THREE.TextureLoader().load('textures/chipTop.png');
                this.sideTexture.wrapS = THREE.RepeatWrapping;
                this.sideTexture.wrapT = THREE.RepeatWrapping;
                this.topTexture.wrapS = THREE.RepeatWrapping;
                this.topTexture.wrapT = THREE.RepeatWrapping;
                this.sideTexture.repeat.set(6, 1);
                break;
            case PokerChipValue.FIFTY:
                break;

            case PokerChipValue.ONE_HUNDRED:
                break;
            case PokerChipValue.FIVE_HUNDRED:
                break;
        }
        this.sideMaterial = new THREE.MeshStandardMaterial({ map: this.sideTexture });
        this.topMaterial = new THREE.MeshStandardMaterial({ map: this.topTexture });
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