import * as THREE from 'three';
import { SeaweedLOD } from "./SeaweedLOD.js";

class SeaweedGroup extends THREE.Object3D {
    constructor(count = 40, spreadX = 15, spreadZ = 15) {
        super();

        if (count <= 0) {
            console.warn("SeaweedGroup: count must be > 0");
            return;
        }

        this.type = "Group";
        this.count = count;
        this.seaweeds = [];

        this.spreadX = spreadX;
        this.spreadZ = spreadZ;
        this.clock = new THREE.Clock();

        // Shared material for all seaweeds
        this.material = this.createMaterial();

        this.init();
    }

    init() {
        const seaweedTemplate = new SeaweedLOD(this.material);

        for (let i = 0; i < this.count; i++) {
            const position = new THREE.Vector3(
                THREE.MathUtils.randFloatSpread(this.spreadX),
                0,
                THREE.MathUtils.randFloatSpread(this.spreadZ)
            );

            const seaweed = seaweedTemplate.clone(true);
            seaweed.position.copy(position);

            this.add(seaweed);
            this.seaweeds.push({ position, object: seaweed });
        }
    }

    createMaterial() {
        const material = new THREE.MeshPhongMaterial({
            color: 0x198450, // seaweed green
            specular: 0x222222,
            shininess: 25,
            onBeforeCompile: (shader) => {
                shader.uniforms.uTime = { value: 0.0 };
                shader.uniforms.uAmplitude = { value: 0.08 };
                shader.uniforms.uFrequency = { value: 1.0 };

                // GLSL random helper
                const hashGLSL = `
                    float hash(vec3 p) {
                        p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
                        p *= 17.0;
                        return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
                    }
                `;

                shader.vertexShader = `
                    uniform float uTime;
                    uniform float uAmplitude;
                    uniform float uFrequency;
                    varying vec2 vUv;
                    ${hashGLSL}
                ` + shader.vertexShader;

                // Inject UV handling
                shader.vertexShader = shader.vertexShader.replace(
                    '#include <uv_vertex>',
                    `#include <uv_vertex>
                    vUv = uv;
                    `
                );

                // Replace vertex transformation logic
                shader.vertexShader = shader.vertexShader.replace(
                    '#include <begin_vertex>',
                    `
                    vec3 transformed = vec3(position);

                    // Compute pseudo-random phase based on world-space position
                    vec3 worldPos = (modelMatrix * vec4(position, 1.0)).xyz;
                    float phase = hash(floor(worldPos * 0.5)); // stable per object variation

                    // Weight displacement by height so the base stays anchored
                    float heightFactor = smoothstep(0.0, 1.0, position.y + 1.0);
                    float wave = sin(uTime * 2.0 * uFrequency + phase * 6.2831)
                               * uAmplitude * heightFactor;

                    transformed.x += wave;
                    `
                );

                // Keep shader reference for external updates
                material.userData.shader = shader;
            }
        });

        return material;
    }

    updateState() {
        const elapsed = this.clock.getElapsedTime();
        const shader = this.material.userData.shader;
        if (shader && shader.uniforms?.uTime) {
            shader.uniforms.uTime.value = elapsed;
        }
    }
}

SeaweedGroup.prototype.isGroup = true;

export { SeaweedGroup };
