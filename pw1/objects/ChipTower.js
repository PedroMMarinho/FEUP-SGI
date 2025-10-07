import * as THREE from 'three';


class ChipTower extends THREE.Object3D {
    constructor(x, y, z, ang = 0) {
        super();

        this.initConstants();
        this.x = x; 
        this.y = y; 
        this.z = z; 

        this.rotation.y = ang;

    }

    initConstants() {
        this.chipRadius = 0.08;
        this.chipHeight = 0.01;
    }

    build(nChips,topMaterial, sideMaterial) {

        const chipGeo = new THREE.CylinderGeometry(this.chipRadius, this.chipRadius, this.chipHeight*nChips, 32,nChips);
        const chip = new THREE.Mesh(chipGeo, [ sideMaterial, topMaterial, topMaterial]);
        this.position.set(this.x, this.y + nChips*this.chipHeight/2 , this.z);

        this.add(chip);
    }

}

export { ChipTower };