import * as THREE from 'three';
import { Fish } from './Fish.js';
import { TimeManager } from '../../managers/TimeManager.js';
import { EntityType } from '../../enums/EntityType.js';
import { DangerLevel } from '../../enums/DangerLevel.js';
import { CollisionManager } from '../../managers/CollisionManager.js';
import { TextureManager } from '../../managers/TextureManager.js';

export class FishLOD extends THREE.LOD {
	constructor(lods, sparseness, baseHeight, maxHeight, boidProperties, bodyLenRatio) {
		super();

		this.collisionManager = CollisionManager.getInstance();
		// Entity properties
		this.type = EntityType.FISH;
		this.dangerLevel = DangerLevel.LOW;
		
		this.bodyLenRatio = bodyLenRatio; // Used for collision radius calculation
		this.boidProperties = boidProperties;
		this.distanceStart = 40;
		this.distanceOffset = 20;
		this.sparseness = sparseness;
		this.baseHeight = baseHeight;
		this.maxHeight = maxHeight;
		// Fish LODs
		this.lods = lods;
		this.distanceStart = 40;
		this.distanceOffset = 20;

		// boid stuff
		this.pos = new THREE.Vector3(
			THREE.MathUtils.randFloatSpread(sparseness),
			THREE.MathUtils.randFloat(baseHeight, maxHeight),
			THREE.MathUtils.randFloatSpread(sparseness)
		);

		this.position.set(this.pos.x, this.pos.y, this.pos.z);

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
		const lodNumber = this.lods.length;

		for (let level = 0; level < lodNumber; level++) {
			const fish = this.lods[level];
			this.addLevel(fish, this.distanceStart + this.distanceOffset * level);
		}
		const emptyFish = new THREE.Object3D();
		this.addLevel(emptyFish, this.distanceStart + this.distanceOffset * lodNumber);
	}

	viewingAngle(other) {
		let rads = this.pos.angleTo(other);
		return rads < 3.927 || rads > 5.4978;
	}

	attachAnimation(keyframedAnimation) {
		this.keyframedAnimation = keyframedAnimation;
	}

	flock() {
        let alignment = new THREE.Vector3();
        let cohesion = new THREE.Vector3();
        let separation = new THREE.Vector3();
        let avoidance = new THREE.Vector3();

        let totalBoids = 0;

        const nearbyEntities = this.collisionManager.getNearbyEntitiesForBoid(
            this,
            this.boidProperties.awareness
        );

        for (let other of nearbyEntities) {
            if (other === this) continue;

            const otherPos = other.pos || other.position;
            const distToCenter = this.pos.distanceTo(otherPos);

            if (distToCenter === 0) continue;

            // --- 1. BOID FLOCKING (Fish to Fish) ---
            if (other.type === EntityType.FISH && this.viewingAngle(other.pos)) {
                alignment.add(other.velocity);
                cohesion.add(other.pos);
                separation.addScaledVector(this.pos.clone().sub(other.pos), 1 / distToCenter);
                totalBoids++;
            }
            
            // --- 2. SUBMARINE: REPULSIVE GRAVITY ---
            else if (other.type === EntityType.SUBMARINE) {
                const pushDir = this.pos.clone().sub(otherPos).normalize();
                
                // Inverse Square Law: Force = Constant / Distance^2
                const safeDist = Math.max(distToCenter, 1.0);
                const repulsionStrength = 350.0; 
                const forceMagnitude = repulsionStrength / (safeDist * safeDist);

                avoidance.addScaledVector(pushDir, forceMagnitude);
            }

            // --- 3. SHARK: FLOW AROUND (Less Aggressive) ---
            else if (other.type === EntityType.SHARK) {
                const objectRadius = this.collisionManager.getEntityRadius(other);
                const detectionRange = objectRadius * 3.0; 

                if (distToCenter < detectionRange) {
                    const awayDir = this.pos.clone().sub(otherPos).normalize();

                    const tangent = new THREE.Vector3().crossVectors(awayDir, new THREE.Vector3(0, 1, 0));

                    if (tangent.dot(this.velocity) < 0) {
                        tangent.negate();
                    }

                    const proximityFactor = 1.0 - (distToCenter / detectionRange);
                    
                    // Mix forces: 
                    // 30% "Push Away" (to ensure they don't clip the model)
                    // 70% "Go Around" (to create the flow effect)
                    avoidance.addScaledVector(awayDir, proximityFactor * 1.5); 
                    avoidance.addScaledVector(tangent, proximityFactor * 4.0); 
                }
            }

            // --- 4. STATIC OBSTACLE AVOIDANCE ---
            else if (other.type === EntityType.STATIC_OBSTACLE) {
                const objectRadius = this.collisionManager.getEntityRadius(other);
                

                if (distToCenter) {
                    const avoidDir = this.pos.clone().sub(otherPos).normalize();

                    const tangent = new THREE.Vector3().crossVectors(avoidDir, new THREE.Vector3(0, 1, 0));
                    if (tangent.dot(this.velocity) < 0) tangent.negate();

                    const distToSurface = distToCenter - objectRadius;
                    
                    const safeDist = Math.max(distToSurface, 0.01);

                    // 1. Repulsion:
                    const repulsionStrength = 4.0 / safeDist; 

                    // 2. Flow:
                    const flowStrength = this.boidProperties.moveSpeed * 3.0;

                    avoidance.addScaledVector(avoidDir, repulsionStrength);
                    avoidance.addScaledVector(tangent, flowStrength);
                }
            }
        }

        // Apply standard boid forces
        if (totalBoids > 0) {
            alignment.setLength(Math.min(this.boidProperties.moveSpeed, this.boidProperties.alignment));
            cohesion.divideScalar(totalBoids).sub(this.pos).setLength(Math.min(this.boidProperties.moveSpeed, this.boidProperties.cohesion));
            separation.setLength(Math.min(this.boidProperties.moveSpeed, this.boidProperties.separation));

            this.acceleration.add(alignment);
            this.acceleration.add(cohesion);
            this.acceleration.add(separation);
        }

        // Apply the accumulated avoidance force
        if (avoidance.lengthSq() > 0) {
            avoidance.clampLength(0, this.boidProperties.moveSpeed * 6.0); 
            this.acceleration.add(avoidance);
        }

        let boundaryForce = new THREE.Vector3();
        const margin = 8;
        const limit = this.sparseness;

        if (this.pos.x < -limit + margin) boundaryForce.x = (-limit + margin - this.pos.x) / margin;
        else if (this.pos.x > limit - margin) boundaryForce.x = (limit - margin - this.pos.x) / margin;
        if (this.pos.y < this.baseHeight + 1) boundaryForce.y = (this.baseHeight + 1 - this.pos.y);
        else if (this.pos.y > this.maxHeight - 1) boundaryForce.y = (this.maxHeight - 1 - this.pos.y);
        if (this.pos.z < -limit + margin) boundaryForce.z = (-limit + margin - this.pos.z) / margin;
        else if (this.pos.z > limit - margin) boundaryForce.z = (limit - margin - this.pos.z) / margin;

        boundaryForce.multiplyScalar(this.boidProperties.moveSpeed);
        this.acceleration.add(boundaryForce);
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
