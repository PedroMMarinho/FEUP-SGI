import * as THREE from 'three';
import { Shark } from './Shark.js';

export class SharkLOD extends THREE.LOD {
  constructor(key, lods) {
    super();
    this.key = key;
    this.lods = lods;
    this.distanceOffset = 10;
    this.distanceStart = 15;
    this.animationFrameRateStart = 120;
    this.animationFrameRateOffset = 40;
    this.clock = new THREE.Clock();
    this.globalTime = 0;
    this.timeSinceLastUpdate = 0;

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
  const delta = this.clock.getDelta();
  this.globalTime += delta;

  const visibleLOD = this.levels.find(level => level.object.visible);
  const lodIndex = this.levels.indexOf(visibleLOD);

  const targetFrameRate = Math.max(5, this.animationFrameRateStart - lodIndex * this.animationFrameRateOffset);
  const updateInterval = 1 / targetFrameRate;
  this.timeSinceLastUpdate += delta;

  this.levels.forEach(level => {
    const obj = level.object;
    if (!obj.mixer) return;

    obj.mixer.setTime(this.globalTime);

    if (obj === visibleLOD.object && this.timeSinceLastUpdate >= updateInterval) {
      const effectiveDelta = this.timeSinceLastUpdate;
      obj.mixer.update(effectiveDelta); // advance bones
      this.timeSinceLastUpdate = 0;
    }
  });
}


}