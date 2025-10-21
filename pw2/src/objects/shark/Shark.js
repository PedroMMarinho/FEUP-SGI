import * as THREE from 'three';

export class Shark extends THREE.Object3D {
  /**
   * @param {string} key - model identifier (for logging)
   * @param {GLTF} [gltfModel] - optional preloaded GLTF model
   */
  constructor(key, gltfModel) {
    super();

    this.key = key;
    this.model = null;
    this.mixer = null;
    this.animations = {};
    this.currentAction = null;
    this.clock = new THREE.Clock();

    this.setModel(gltfModel);
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

    this.play("Swim");
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

    action.reset().play();
    this.currentAction = action;
  }

  stop() {
    if (this.currentAction) {
      this.currentAction.stop();
      this.currentAction = null;
    }
  }

  updateState() {
    if (this.mixer) {
      const delta = this.clock.getDelta();
      this.mixer.update(delta);
    }
  }
}