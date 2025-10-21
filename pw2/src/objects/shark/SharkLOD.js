import * as THREE from 'three';
import { Shark } from './Shark.js';

export class SharkLOD extends THREE.LOD {
  constructor(key, lods) {
    super();
    this.key = key;
    this.lods = lods;
    this.distanceOffset = 5;
    this.distanceStart = 10;

    this.setupLODs();
  }

  setupLODs() {
    // Determine how many LOD levels exist for this model
    const lodCount = this.lods.length;

    let distance = this.distanceStart;
    const distanceOffset = this.distanceOffset;

    for (let i = 0; i < lodCount; i++) {
      const shark = new Shark(this.key, this.lods[i], i);
      this.addLevel(shark, distance);
      distance += distanceOffset;
    }

    // Add a final empty LOD to avoid popping
    const emptyObject = new THREE.Object3D();
    this.addLevel(emptyObject, distance);
  }
 
   updateState() {
       const visibleLOD = this.levels.find(level => level.object.visible);
         if (visibleLOD && visibleLOD.object.updateState) {
              visibleLOD.object.updateState();
         }
  }
}