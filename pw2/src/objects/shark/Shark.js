import * as THREE from 'three';

export class Shark extends THREE.Object3D {
  /**
   * @param {GLTF} [gltfModel] - optional preloaded GLTF model
   */
  constructor(gltfModel,lodLevel) {
    super();

    this.model = null;
    this.mixer = null;
    this.animations = {};
    this.currentAction = null;
    this.lodLevel = lodLevel;

    this.setModel(gltfModel);
    this.play("Swim");
  }
  /**
   * Set a GLTF model for this shark instance
   * @param {GLTF} gltf
   */
  setModel(gltf) {
    this.model = gltf.scene;
    
    this.add(this.model);
    
    // Setup animation mixer
    this.mixer = new THREE.AnimationMixer(this.model);

    // Store animation clips by name
    gltf.animations.forEach((clip) => {
      const action = this.mixer.clipAction(clip);
      action.loop = THREE.LoopRepeat;
      action.repetitions = Infinity;
      this.animations[clip.name] = action;
    });

  }

  play(name, fadeDuration = 0.3, speed = 1) {
    const action = this.animations[name];
    if (!action) return console.warn(`⚠️ No animation named "${name}"`);

    action.loop = THREE.LoopRepeat;
    action.repetitions = Infinity;
    action.timeScale = speed;

    if (this.currentAction && this.currentAction !== action) {
      this.currentAction.crossFadeTo(action, fadeDuration, true);
    }

    action.play();
    this.currentAction = action;
  }

  stop() {
    if (this.currentAction) {
      this.currentAction.stop();
      this.currentAction = null;
    }
  }

  updateState(delta) {
    if (this.mixer) {
      this.mixer.update(delta);
    }
  }
}