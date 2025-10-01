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
        console.log(sideMaterial)
        console.log("ball")
        console.log(topMaterial)
        const sideTex = sideMaterial.map.clone();
        sideTex.repeat.set(6,nChips);
        sideMaterial.map = sideTex;
        const chip = new THREE.Mesh(chipGeo, [ sideMaterial, topMaterial, topMaterial]);
        this.position.set(this.x, this.y + nChips*this.chipHeight/2 , this.z);

        this.add(chip);
        console.log("Chip tower created");
    }

}

export { ChipTower };