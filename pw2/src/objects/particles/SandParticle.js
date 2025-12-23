import * as THREE from "three";
import { TextureManager } from "../../managers/TextureManager.js";

export class SandParticle {
    constructor(particleCount, size = 0.2) {
        this.particleCount = particleCount;

        // 1. Single Geometry
        this.geometry = new THREE.BufferGeometry();
        this.positions = new Float32Array(this.particleCount * 3);
        this.colors = new Float32Array(this.particleCount * 3);

        this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));

        // 2. Single Material
        const textureManager = TextureManager.getInstance();
        const texture = textureManager.getTexture("sand-particle") || null;

        this.material = new THREE.PointsMaterial({
            size: size, 
            map: texture,
            transparent: true,
            opacity: 0.4,
            vertexColors: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            fog: true,
        });

        this.mesh = new THREE.Points(this.geometry, this.material);
        this.mesh.frustumCulled = true; 
    }

    flagUpdates() {
        this.geometry.attributes.position.needsUpdate = true;
        this.geometry.attributes.color.needsUpdate = true;
    }
}
