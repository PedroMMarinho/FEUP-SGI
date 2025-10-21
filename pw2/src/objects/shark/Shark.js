import * as THREE from 'three';
import { GLTFLoader } from 'https://unpkg.com/three@0.164.0/examples/jsm/loaders/GLTFLoader.js';

export class Shark extends THREE.Object3D {
  constructor(url) {
    super();

    this.url = url;
    this.mixer = null;
    this.model = null;
    this.animations = {};
    this.currentAction = null;
    this.clock = new THREE.Clock();

    // Load the model asynchronously
    this.loadModel();
  }

  loadModel() {
    const loader = new GLTFLoader();

    loader.load(
      this.url,
      (gltf) => {
        this.model = gltf.scene;
        this.add(this.model); // Add the shark model to this Object3D

        // Set up model transform
        this.model.scale.set(1, 1, 1);
        this.model.rotation.y = Math.PI;

        // Create animation mixer
        this.mixer = new THREE.AnimationMixer(this.model);

        // Store animation clips by name
        gltf.animations.forEach((clip) => {
          const action = this.mixer.clipAction(clip);
          action.loop = THREE.LoopRepeat;
          action.repetitions = Infinity;
          this.animations[clip.name] = action;
        });

        // Auto-play the first animation at a slower speed
        const firstClip = Object.keys(this.animations)[0];
        if (firstClip) {
          this.play(firstClip, 0.3, 0.6); // smooth fade-in, 60% speed
        }

        console.log('✅ Shark model loaded with animations:', Object.keys(this.animations));
      },
      (xhr) => {
        console.log(`Loading shark: ${(xhr.loaded / xhr.total * 100).toFixed(2)}%`);
      },
      (error) => {
        console.error('❌ Error loading shark model:', error);
      }
    );
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

  update() {
    if (this.mixer) {
      const delta = this.clock.getDelta();
      this.mixer.update(delta);
    }
  }

}