import * as THREE from 'three';
import { Seaweed } from "./Seaweed.js"; 

class SeaweedLOD extends THREE.LOD {
    constructor(material){
        super();
        this.seaweeds = [];
        this.startDistance = 0;
        this.distanceOffset = 20;
        this.maxComplexity = 6;
        this.material = material
        this.createLODs();
    }
    createLODs(){

        const seaweed = new Seaweed(this.maxComplexity,this.material);
        const seaweedLevels = seaweed.meshes;   

        for(let i = 0; i < this.maxComplexity; i++ ){
            const seaweed = seaweedLevels[seaweedLevels.length - 1 - i];
            this.addLevel(seaweed, this.startDistance + i * this.distanceOffset);
            this.seaweeds.push(seaweed);
        }
        const emptyObject = new THREE.Object3D();
        this.addLevel(emptyObject, this.startDistance + seaweedLevels.length * this.distanceOffset);
    }
    


}

export { SeaweedLOD };