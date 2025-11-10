import * as THREE from 'three';
import { Shark } from './Shark.js';
import { SharkBehaviour } from './SharkBehaviour.js';

export class SharkLOD extends THREE.LOD {
  constructor(lods, position = new THREE.Vector3(0, 0, 0), texture = null, aiOptions = {}) {
    super();
    this.lods = lods;
    this.distanceOffset = 15;
    this.distanceStart = 40;
    this.animationFrameRateStart = 120;
    this.animationFrameRateOffset = 40;
    this.clock = new THREE.Clock();
    this.globalTime = 0;
    this.timeSinceLastUpdate = 0;
		this.position.copy(position);


    this.animationOffset = Math.random() * Math.PI * 2; 

    this.ai = new SharkBehaviour(this, aiOptions);


    this.initTexture(texture);

    this.setupLODs();
    
  }

  initTexture(texture) {
      if (texture == null) return;
      this.texture = texture;
      this.texture.flipY = false;
      texture.colorSpace = THREE.SRGBColorSpace;
  }

  setupLODs() {
    // Determine how many LOD levels exist for this model
    const lodCount = this.lods.length;

    let distance = this.distanceStart;
    const distanceOffset = this.distanceOffset;


    for (let i = 0; i < lodCount; i++) {
      const shark = new Shark(this.lods[i], i);

      if (this.texture) {
        
        shark.traverse((child) => {
          if (child.isMesh) {
            child.material.map = this.texture;
            child.material.needsUpdate = true;
          }
        });
      }

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

  // Update AI behaviour
  this.ai.update(delta);

  const visibleLOD = this.levels.find(level => level.object.visible);
  const lodIndex = this.levels.indexOf(visibleLOD);

  const targetFrameRate = Math.max(5, this.animationFrameRateStart - lodIndex * this.animationFrameRateOffset);
  const updateInterval = 1 / targetFrameRate;
  this.timeSinceLastUpdate += delta;

  const animSpeedFactor = Math.log10(1 + this.ai.currentSpeed * 2) * 0.6 + 0.15;

  this.levels.forEach(level => {
    const obj = level.object;
    if (!obj.mixer) return;

    const time = this.globalTime + this.animationOffset;

    obj.mixer.setTime(time);

    if (obj === visibleLOD.object && this.timeSinceLastUpdate >= updateInterval) {
      const effectiveDelta = this.timeSinceLastUpdate * animSpeedFactor;
      obj.mixer.update(effectiveDelta);
      this.timeSinceLastUpdate = 0;
    }
  });
}



}