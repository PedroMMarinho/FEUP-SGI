import * as THREE from 'three';
import { Seaweed } from "./Seaweed.js"; 

class SeaweedLOD extends THREE.LOD {
    constructor(){
        super();
        this.seaweeds = [];
        this.startDistance = 0;
        this.distanceOffset = 20;
        this.createLODs();
    }
    createLODs(){
        const lodLevels = [
            { complexity: 6, distance: this.startDistance },
            { complexity: 5, distance: this.startDistance + this.distanceOffset },
            { complexity: 4, distance: this.startDistance + 2 * this.distanceOffset },
        ];

        lodLevels.forEach((level) => {
            const seaweed = new Seaweed(level.complexity);
            this.addLevel(seaweed, level.distance);
            this.seaweeds.push(seaweed);
        });
        const emptyObject = new THREE.Object3D();
        this.addLevel(emptyObject, this.startDistance + lodLevels.length * this.distanceOffset);
    }


}

export { SeaweedLOD };