// Shark.js
import * as THREE from 'three';
import { GLTFLoader } from 'https://unpkg.com/three@0.164.0/examples/jsm/loaders/GLTFLoader.js';

export class Shark {
  constructor(url, scene) {
    this.url = url;
    this.scene = scene;

    this.mixer = null;
    this.model = null;
    this.animations = {};
    this.currentAction = null;
    this.clock = new THREE.Clock();

    this.loadModel();
  }

  loadModel() {
    const loader = new GLTFLoader();

    loader.load(
      this.url,
      (gltf) => {
        this.model = gltf.scene;
        this.scene.add(this.model);

        this.model.scale.set(1, 1, 1);
        this.model.rotation.y = Math.PI;

        // Setup animation mixer
        this.mixer = new THREE.AnimationMixer(this.model);

        // Store animation clips by name
        gltf.animations.forEach((clip) => {
          const action = this.mixer.clipAction(clip);
          action.loop = THREE.LoopRepeat; 
          action.repetitions = Infinity;
          this.animations[clip.name] = action;
        });

        // Auto-play first animation if exists
        const firstClip = Object.keys(this.animations)[0];
        if (firstClip) {
          this.play(firstClip);
        }

        console.log('Shark model loaded with animations:', Object.keys(this.animations));
      },
      (xhr) => {
        console.log(`Loading shark: ${(xhr.loaded / xhr.total * 100).toFixed(2)}%`);
      },
      (error) => {
        console.error('Error loading shark model:', error);
      }
    );
  }

  play(name, fadeDuration = 0.3) {
    if (!this.animations[name]) return console.warn(`No animation named "${name}"`);

    const nextAction = this.animations[name];

    // Make sure it loops infinitely
    nextAction.loop = THREE.LoopRepeat;
    nextAction.repetitions = Infinity;

    if (this.currentAction && this.currentAction !== nextAction) {
      this.currentAction.crossFadeTo(nextAction, fadeDuration, true);
    }

    nextAction.reset().play();
    this.currentAction = nextAction;
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

  setPosition(x, y, z) {
    if (this.model) this.model.position.set(x, y, z);
  }

  setRotation(x, y, z) {
    if (this.model) this.model.rotation.set(x, y, z);
  }

  setScale(s) {
    if (this.model) this.model.scale.set(s, s, s);
  }
}
