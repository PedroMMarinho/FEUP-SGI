import * as THREE from 'three';
import { Fish } from './Fish.js';
import { TimeManager } from '../../managers/TimeManager.js';

export class FishLOD extends THREE.LOD {
    constructor(bodyColor, finColor) {
        super();
        this.bodyColor = bodyColor;
        this.finColor = finColor;
        this.distanceStart = 20;
        this.distanceOffset = 10;

        // animation params
        this.timeManager = TimeManager.getInstance();
        this.speed = 1;
        this.animationOffset = Math.random() * Math.PI * 2;

        this.init();
    }

    init() {
        const normalFish = new Fish(0);
        const lowResFish = new Fish(1);
        const emptyFish = new THREE.Object3D();

        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: this.bodyColor,
        });
        const finMaterial = new THREE.MeshPhongMaterial({
            color: this.finColor,
        });

        // low res model
        const lowMesh = new THREE.Group();
        lowMesh.isSkinned = false;
        const lowResBodyMesh = new THREE.Mesh(lowResFish.bodyGeometry, bodyMaterial);
        const lowResTailMesh = new THREE.Mesh(lowResFish.tailGeometry, finMaterial);
        lowMesh.add(lowResTailMesh, lowResBodyMesh);

        // high res model
        const hiMesh = new THREE.Group();
        hiMesh.isSkinned = true;

        const highResBodyMesh = new THREE.SkinnedMesh(normalFish.bodyGeometry, bodyMaterial);
        const highResTailMesh = new THREE.SkinnedMesh(normalFish.tailGeometry, finMaterial);
        const highResDorsalMesh = new THREE.SkinnedMesh(normalFish.dorsalFinGeometry, finMaterial);

        const skeleton = normalFish.skeleton;

        // Attach root bone and bind skeleton
        highResBodyMesh.add(skeleton.bones[0]);
        highResBodyMesh.bind(skeleton);

        highResTailMesh.add(skeleton.bones[0]);
        highResTailMesh.bind(skeleton);

        highResDorsalMesh.add(skeleton.bones[0]);
        highResDorsalMesh.bind(skeleton);

        hiMesh.add(highResBodyMesh, highResTailMesh, highResDorsalMesh);

        this.addLevel(hiMesh, this.distanceStart);
        this.addLevel(lowMesh, this.distanceStart + this.distanceOffset);
        this.addLevel(emptyFish, this.distanceStart + 2 * this.distanceOffset);
    }

    updateState() {
        this.globalTime = this.timeManager.getElapsedTime();
        

        const visibleLOD = this.levels.find(level => level.object.visible);
        if (!visibleLOD) return;

        const fishGroup = visibleLOD.object;
        const swimFreq = 4.0 * this.speed;
        const time = this.globalTime * swimFreq + this.animationOffset;

        if (fishGroup.isSkinned) {
            const skeleton = fishGroup.children[0].skeleton;
            skeleton.bones[0].rotation.y = Math.sin(time) * 0.2; // front
            skeleton.bones[1].rotation.y = Math.sin(time) * 0.3; // middle
            skeleton.bones[2].rotation.y = Math.sin(time) * 0.4; // tail
        } else {
            fishGroup.rotation.y = Math.sin(time) * 0.2;
        }
    }
}
