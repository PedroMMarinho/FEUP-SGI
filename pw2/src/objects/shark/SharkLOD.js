import * as THREE from 'three';
import { Shark } from './Shark.js';
import { SharkBehaviour } from './SharkBehaviour.js';
import { EntityType } from '../../enums/EntityType.js';
import { DangerLevel } from '../../enums/DangerLevel.js';
import { TimeManager } from '../../managers/TimeManager.js';

export class SharkLOD extends THREE.LOD {
  constructor(lods, position = new THREE.Vector3(0, 0, 0), texture = null, aiOptions = {}) {
    super();
    this.lods = lods;
    this.distanceOffset = 15;
    this.distanceStart = 40;
    this.animationFrameRateStart = 120;
    this.animationFrameRateOffset = 40;

    this.timeManager = TimeManager.getInstance();
    this.globalTime = this.timeManager.getElapsedTime();
    this.timeSinceLastUpdate = 0;

    this.position.copy(position);
    this.animationOffset = Math.random() * Math.PI * 2;

    this.ai = new SharkBehaviour(this, aiOptions);

    this.type = EntityType.SHARK;
    this.dangerLevel = DangerLevel.MEDIUM;

    this.initTexture(texture);
    this.setupLODs();
  }

  initTexture(texture) {
    if (!texture) return;
    this.texture = texture;
    this.texture.flipY = false;
    texture.colorSpace = THREE.SRGBColorSpace;
  }

  setupLODs() {
    const lodCount = this.lods.length;
    let distance = this.distanceStart;

    for (let i = 0; i < lodCount; i++) {
      const shark = new Shark(this.lods[i], i);

      if (this.texture) {
        shark.traverse((child) => {
          if (child.isMesh && child.material.name === 'Material') {
            child.material.map = this.texture;
            child.material.needsUpdate = true;
          }
        });
      }

      this.addLevel(shark, distance);
      distance += this.distanceOffset;
    }

    const emptyObject = new THREE.Object3D();
    this.addLevel(emptyObject, distance);
  }

 updateState() {
    const delta = this.timeManager.getElapsedTime() - this.globalTime;
    this.globalTime += delta;

    // Update Shark behaviour
    this.ai.update(delta);

    const visibleLOD = this.levels.find(level => level.object.visible);
    
    const lodIndex = this.levels.indexOf(visibleLOD);

    const targetFrameRate = Math.max(5, this.animationFrameRateStart - lodIndex * this.animationFrameRateOffset);
    const updateInterval = 1 / targetFrameRate;
    this.timeSinceLastUpdate += delta;

    if (this.timeSinceLastUpdate >= updateInterval) {
      
      const animSpeedFactor = Math.log10(1 + this.ai.currentSpeed * 6) * 0.6 + 0.15;
      
      const effectiveDelta = this.timeSinceLastUpdate * animSpeedFactor;

      this.levels.forEach(level => {
        const obj = level.object;
        if (obj.mixer) {
          obj.mixer.update(effectiveDelta);
        }
      });

      this.timeSinceLastUpdate = 0;
    }
  }
}
