import * as THREE from "three";
import { TimeManager } from "../../managers/TimeManager.js";
import { CollisionManager } from "../../managers/CollisionManager.js";
import { TextureManager } from "../../managers/TextureManager.js";

export class SandSystem {
	constructor({
		maxParticles = 1800,
		particleSize = 0.08,
		gravity = -4.0
	} = {}) {
		this.maxParticles = maxParticles;
        this.gravity = gravity;

		// --- CPU buffers ---
		this.positions = new Float32Array(maxParticles * 3);
		this.velocities = new Float32Array(maxParticles * 3);
		this.colors = new Float32Array(maxParticles * 3);
		this.ages = new Float32Array(maxParticles);
		this.lifetimes = new Float32Array(maxParticles);

		this.nextFree = 0;

		// --- Geometry ---
		this.geometry = new THREE.BufferGeometry();
		this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
		this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));
		this.geometry.setDrawRange(0, maxParticles);

		// --- Material ---

        const textureManager = TextureManager.getInstance();
        const texture = textureManager.getTexture("sand-particle") || null;
		if (texture === null) {
			console.log("No tex available");
		}
		this.material = new THREE.PointsMaterial({
			size: particleSize,
			map: texture,
			transparent: true,
			opacity: 0.6,
			vertexColors: true,
			depthWrite: false,
			blending: THREE.AdditiveBlending,
			fog: true,
		});

		this.points = new THREE.Points(this.geometry, this.material);
		this.points.frustumCulled = false;

		this.timeManager = TimeManager.getInstance();
		this.lastTime = this.timeManager.getElapsedTime();
	}

	addToScene(scene) {
		scene.add(this.points);
	}

	emitPuff({
		position,
		normal,
		count = 600,
		radius = 0.15,
		impulse = 2.5,
		lifetime = [1.5, 3.0]
	}) {
		for (let i = 0; i < count; i++) {
			const id = this.nextFree;
			this.nextFree = (this.nextFree + 1) % this.maxParticles;

			const i3 = id * 3;

			// initial pos with noise 
			const offset = randomInSphere(radius);
			this.positions[i3] = position.x + offset.x;
			this.positions[i3 + 1] = position.y + offset.y;
			this.positions[i3 + 2] = position.z + offset.z; 

			// hemisphere velocity 
			const dir = randomHemisphere(normal);
			const speed = impulse * (0.6 + Math.random() * 0.6);

			this.velocities[i3] = dir.x * speed;
			this.velocities[i3 + 1] = dir.y * speed;
			this.velocities[i3 + 2] = dir.z * speed;

			// Lifetimes
			this.ages[id] = 0;
			this.lifetimes[id] = THREE.MathUtils.lerp(
				lifetime[0],
				lifetime[1],
				Math.random()
			);

			// Color 
			this.colors[i3] = 0.95;
			this.colors[i3 + 1] = 0.85;
			this.colors[i3 + 2] = 0.65;
		}
		this.flagUpdates();
	}

	update() {
		const currentTime = this.timeManager.getElapsedTime();
		let dt = currentTime - this.lastTime;
		this.lastTime = currentTime;

		for (let i = 0; i < this.maxParticles; i++) {
			const i3 = i * 3;
			const age = this.ages[i];
			if (age >= this.lifetimes[i]) {
				this.positions[i3 + 1] = -9999; // move out of view
				continue;
			}

			// gravity 
			this.velocities[i3 + 1] += this.gravity * dt;

			// Integrate
            this.positions[i3]     += this.velocities[i3]     * dt;
            this.positions[i3 + 1] += this.velocities[i3 + 1] * dt;
            this.positions[i3 + 2] += this.velocities[i3 + 2] * dt;

            // Fade
            const lifeRatio = 1.0 - age / this.lifetimes[i];
            this.colors[i3]     *= lifeRatio;
            this.colors[i3 + 1] *= lifeRatio;
            this.colors[i3 + 2] *= lifeRatio;

            this.ages[i] += dt;

		}

		this.flagUpdates();
	}

	flagUpdates() {
		this.geometry.attributes.position.needsUpdate = true;
		this.geometry.attributes.color.needsUpdate = true;
	}

}

function randomHemisphere(normal) {
	const dir = new THREE.Vector3(
		(Math.random() * 2 - 1) * 0.6,
		Math.random() * 1.2,
		(Math.random() * 2 - 1) * 0.6
	).normalize();

	return dir.dot(normal) < 0 ? dir.negate() : dir;
}

function randomInSphere(radius) {
	const v = new THREE.Vector3();
	do {
		v.set(
			Math.random() * 2 - 1,
			Math.random() * 2 - 1,
			Math.random() * 2 - 1
		);
	} while (v.lengthSq() > 1);

	return v.multiplyScalar(radius);
}
