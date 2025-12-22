import * as THREE from 'three';
import { Coral } from "./Coral.js";


export class CoralLOD extends THREE.LOD {
    constructor(material){
        super();
        this.corals = [];
        this.startDistance = 0;
        this.distanceOffset = 25;
        this.material = material;

		// BVH parameters
		this.rootObject = true;
		this.bvhSelectable = true;


        this.createLODs();
    }
    createLODs(){
        const lodLevels = [
            { complexity: 5, distance: this.startDistance },
            { complexity: 4, distance: this.startDistance + this.distanceOffset },
            { complexity: 3, distance: this.startDistance + 2 * this.distanceOffset },
        ];

        lodLevels.forEach((level) => {
            const coral = new Coral(level.complexity,this.material);
            this.addLevel(coral, level.distance);
            this.corals.push(coral);
        });
        const emptyObject = new THREE.Object3D();
        this.addLevel(emptyObject, this.startDistance + lodLevels.length * this.distanceOffset);
    }




}