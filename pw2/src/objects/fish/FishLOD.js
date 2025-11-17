import * as THREE from 'three';
import { Fish } from './Fish.js';
import { TimeManager } from '../../managers/TimeManager.js';
import { EntityType } from '../../enums/EntityType.js';
import { DangerLevel } from '../../enums/DangerLevel.js';
import { EntityState } from '../../enums/EntityState.js';

export class FishLOD extends THREE.LOD {
	constructor(bodyColor, finColor, sparseness, baseHeight, maxHeight, boidProperties, collisionManager) {
		super();

		this.collisionManager = collisionManager;
		// Entity properties
		this.type = EntityType.FISH;
		this.dangerLevel = DangerLevel.LOW;

		this.boidProperties = boidProperties;
		this.bodyColor = bodyColor;
		this.finColor = finColor;
		this.distanceStart = 50;
		this.distanceOffset = 20;
		this.size = 1;
		this.sparseness = sparseness;
		this.baseHeight = baseHeight;
		this.maxHeight = maxHeight;

		// boid stuff
		this.pos = new THREE.Vector3(
			THREE.MathUtils.randFloatSpread(sparseness),
			THREE.MathUtils.randFloat(baseHeight, maxHeight),
			THREE.MathUtils.randFloatSpread(sparseness)
		);

		this.acceleration = new THREE.Vector3(0, 0, 0);
		this.velocity = new THREE.Vector3(THREE.MathUtils.randFloat(-1, 1),
			THREE.MathUtils.randFloat(-1, 1),
			THREE.MathUtils.randFloat(-1, 1));
		this.velocity.setLength(Math.random() * (4 - 2) + 2);

		// animation params
		this.timeManager = TimeManager.getInstance();
		this.globalTime = 0;
		this.speed = 1;
		this.animationOffset = Math.random() * Math.PI * 2;

		this.keyframedAnimation = null;

		// BVH parameters
		this.rootObject = true;
		this.bvhSelectable = true;

		this.init();
	}

	init() {
		var pos = new THREE.Vector3(this.pos.x, this.pos.y, this.pos.z);
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
		lowResFish.bodyGeometry.computeBoundingBox();
		var loresCenter = new THREE.Vector3();
		var loresSize = new THREE.Vector3();
		lowResFish.bodyGeometry.boundingBox.getCenter(loresCenter);
		lowResFish.bodyGeometry.boundingBox.getSize(loresSize);

		var loresMin = lowResFish.bodyGeometry.boundingBox.min;
		var loresSca = new THREE.Matrix4();
		var loresTra = new THREE.Matrix4();
		var loresScaleFact = this.size / loresSize.length();
		loresSca.makeScale(loresScaleFact, loresScaleFact, loresScaleFact);
		loresTra.makeTranslation(-loresCenter.x, -loresCenter.y, -loresMin.z);

		const lowMesh = new THREE.Group();
		lowMesh.isSkinned = false;
		const lowResBodyMesh = new THREE.Mesh(lowResFish.bodyGeometry, bodyMaterial);
		const lowResTailMesh = new THREE.Mesh(lowResFish.tailGeometry, finMaterial);
		lowMesh.add(lowResTailMesh, lowResBodyMesh);

		lowMesh.applyMatrix4(loresTra);
		lowMesh.applyMatrix4(loresSca);

		// high res model
		const hiMesh = new THREE.Group();
		hiMesh.isSkinned = true;

		normalFish.bodyGeometry.computeBoundingBox();
		var hiresCenter = new THREE.Vector3();
		var hiresSize = new THREE.Vector3();
		normalFish.bodyGeometry.boundingBox.getCenter(hiresCenter);
		normalFish.bodyGeometry.boundingBox.getSize(hiresSize);

		var hiresMin = lowResFish.bodyGeometry.boundingBox.min;
		var hiresSca = new THREE.Matrix4();
		var hiresTra = new THREE.Matrix4();
		var hiresScaleFact = this.size / hiresSize.length();
		hiresSca.makeScale(hiresScaleFact, hiresScaleFact, hiresScaleFact);
		hiresTra.makeTranslation(-hiresCenter.x, -hiresCenter.y, -hiresMin.z);

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

		hiMesh.applyMatrix4(loresTra);
		hiMesh.applyMatrix4(loresSca);

		this.addLevel(hiMesh, this.distanceStart);
		this.addLevel(lowMesh, this.distanceStart + this.distanceOffset);
		this.addLevel(emptyFish, this.distanceStart + 2 * this.distanceOffset);

		this.position.set(pos.x, pos.y, pos.z);
	}

	viewingAngle(other) {
		let rads = this.pos.angleTo(other);
		return rads < 3.927 || rads > 5.4978;
	}

	attachAnimation(keyframedAnimation) {
		this.keyframedAnimation = keyframedAnimation;
	}

	flock() {
		let alignment = new THREE.Vector3(0, 0, 0);
		let cohesion = new THREE.Vector3(0, 0, 0);
		let separation = new THREE.Vector3(0, 0, 0);
		let avoidance = new THREE.Vector3(0, 0, 0);

		let totalBoids = 0;

		const nearbyEntities = this.collisionManager.getNearbyEntitiesForBoid(
			this,
			this.boidProperties.awareness
		);

		for (let other of nearbyEntities) {
			if (other === this) continue;

			const otherPos = other.pos || other.position;
			let distance = this.pos.distanceTo(otherPos);

			if (distance === 0) continue;

			// Boid flocking with other fish
			if (other.type === EntityType.FISH && this.viewingAngle(other.pos)) {
				alignment.add(other.velocity);
				cohesion.add(other.pos);
				separation.addScaledVector(this.pos.clone().sub(other.pos), 1 / distance);
				totalBoids++;
			}
			// Avoid sharks and submarines
			else if (other.type === EntityType.SHARK || other.type === EntityType.SUBMARINE) {
				const avoidDir = this.pos.clone().sub(otherPos);
				const avoidStrength = 3 / (distance * distance); 
				avoidance.addScaledVector(avoidDir, avoidStrength);
			}
		}

		// Apply boid forces
		if (totalBoids > 0) {
			alignment.setLength(Math.min(this.boidProperties.moveSpeed, this.boidProperties.alignment));

			cohesion.divideScalar(totalBoids);
			cohesion.sub(this.pos);
			cohesion.setLength(Math.min(this.boidProperties.moveSpeed, this.boidProperties.cohesion));

			separation.setLength(Math.min(this.boidProperties.moveSpeed, this.boidProperties.separation));

			this.acceleration.add(alignment);
			this.acceleration.add(cohesion);
			this.acceleration.add(separation);
		}

		// Apply obstacle avoidance
		if (avoidance.lengthSq() > 0) {
			avoidance.setLength(this.boidProperties.moveSpeed * 1.5);
			this.acceleration.add(avoidance);
		}

		let avoidForce = new THREE.Vector3(0, 0, 0);

		const margin = 5;
		const vertMargin = 1;
		const limit = this.sparseness;

		if (this.pos.x < -limit + margin) avoidForce.x = (-limit + margin - this.pos.x) / margin;
		else if (this.pos.x > limit - margin) avoidForce.x = (limit - margin - this.pos.x) / margin;

		if (this.pos.y < this.baseHeight + vertMargin)
			avoidForce.y = (this.baseHeight + vertMargin - this.pos.y) / vertMargin;
		else if (this.pos.y > this.maxHeight - vertMargin)
			avoidForce.y = (this.maxHeight - vertMargin - this.pos.y) / vertMargin;

		if (this.pos.z < -limit + margin) avoidForce.z = (-limit + margin - this.pos.z) / margin;
		else if (this.pos.z > limit - margin) avoidForce.z = (limit - margin - this.pos.z) / margin;

		avoidForce.multiplyScalar(this.boidProperties.moveSpeed * 0.5);
		this.acceleration.add(avoidForce);
	}

	updateState() {
		const now = this.timeManager.getElapsedTime();
		const delta = now - (this.lastTime || now);
		this.lastTime = now;
		this.globalTime += delta;

		// lod
		const visibleLOD = this.levels.find(level => level.object.visible);
		if (!visibleLOD) return;

		const fishGroup = visibleLOD.object;
		const swimFreq = 4.0 * this.speed;

		const time = this.globalTime * swimFreq + this.animationOffset;

		// skelly
		if (fishGroup.isSkinned) {
			const skeleton = fishGroup.children[0].skeleton;
			skeleton.bones[0].rotation.y = Math.sin(time) * 0.2; // front
			skeleton.bones[1].rotation.y = Math.sin(time) * 0.3; // middle
			skeleton.bones[2].rotation.y = Math.sin(time) * 0.4; // tail
		} else {
			fishGroup.rotation.y = Math.sin(time) * 0.2;
		}

		// flocking
		this.pos.addScaledVector(this.velocity, delta);
		this.velocity.add(this.acceleration.multiplyScalar(delta));
		this.velocity.clampLength(-this.boidProperties.moveSpeed, this.boidProperties.moveSpeed);

		this.position.copy(this.pos);
		this.acceleration.set(0, 0, 0);
		let dir = this.pos.clone().add(this.velocity);
		this.lookAt(dir);
	}

	updateAnimation() {
		const delta = this.timeManager.getElapsedTime() - this.globalTime;
		this.globalTime += delta;

		const timeMS = (this.globalTime * 1000);
		const pose = this.keyframedAnimation.getPose(timeMS);

		//set self position and rotation.
		this.position.set(pose.x, pose.y, pose.z);
		this.rotation.y = pose.angle;
	}

}
