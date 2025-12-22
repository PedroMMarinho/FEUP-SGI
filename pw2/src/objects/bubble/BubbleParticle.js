import * as THREE from "three";
import { TextureManager } from "../../managers/TextureManager.js";

export class BubbleParticle {
    constructor(particleCount) {
        this.count = particleCount;

        this.geometry = new THREE.BufferGeometry();

        this.positions  = new Float32Array(particleCount * 3);
        this.colors     = new Float32Array(particleCount * 3);
        this.velocities = new Float32Array(particleCount);
        this.ages       = new Float32Array(particleCount);
        this.lifetimes  = new Float32Array(particleCount);

        this.geometry.setAttribute(
            "position",
            new THREE.BufferAttribute(this.positions, 3)
        );

        this.geometry.setAttribute(
            "color",
            new THREE.BufferAttribute(this.colors, 3)
        );

        const texture = TextureManager
            .getInstance()
            .getTexture("bubble-particle");

        this.material = new THREE.PointsMaterial({
            size: 0.2,
            map: texture,
            transparent: true,
            opacity: 0.4,
            vertexColors: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        this.mesh = new THREE.Points(this.geometry, this.material);
        this.mesh.frustumCulled = false;
    }

    flagUpdates() {
        this.geometry.attributes.position.needsUpdate = true;
        this.geometry.attributes.color.needsUpdate = true;
    }
}
