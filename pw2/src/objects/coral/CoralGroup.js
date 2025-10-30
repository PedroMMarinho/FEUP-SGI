import * as THREE from 'three';
import { CoralLOD } from "./CoralLOD.js";

class CoralGroup extends THREE.Object3D {
    constructor(count = 40, spreadX = 15, spreadZ = 15) {
        super();

        if (count <= 0) {
            console.warn("CoralGroup: count must be > 0");
            return;
        }

        this.type = "Group";
        this.count = count;
        this.corals = [];

        this.spreadX = spreadX;
        this.spreadZ = spreadZ;
        this.clock = new THREE.Clock();
        this.material = this.createMaterial();
        this.init();
    }

    init() {
        const coralTemplate = new CoralLOD(this.material); // no material yet

        for (let i = 0; i < this.count; i++) {
            const position = new THREE.Vector3(
                THREE.MathUtils.randFloatSpread(this.spreadX),
                0,
                THREE.MathUtils.randFloatSpread(this.spreadZ)
            );

            const coral = coralTemplate.clone(true);
            coral.position.copy(position);


            this.add(coral);
            this.corals.push({ position, object: coral });
        }
    }

    createMaterial() {
        const material = new THREE.MeshPhongMaterial({
            color: 0xff7f50,
            specular: 0x222222,
            shininess: 25,
            onBeforeCompile: (shader) => {
                shader.uniforms.uTime = { value: 0.0 };
                shader.uniforms.uAmplitude = { value: 0.1 };
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

                // Inject after UVs
                shader.vertexShader = shader.vertexShader.replace(
                    '#include <uv_vertex>',
                    `#include <uv_vertex>
                    vUv = uv;
                    `
                );

                // Replace vertex transformation
                shader.vertexShader = shader.vertexShader.replace(
                    '#include <begin_vertex>',
                    `
                    vec3 transformed = vec3(position);

                    // Compute pseudo-random phase based on world-space position
                    vec3 worldPos = (modelMatrix * vec4(position, 1.0)).xyz;
                    float phase = hash(floor(worldPos * 0.5)); // stable per object-ish

                    float heightFactor = smoothstep(0.0, 1.0, position.y + 1.0);
                    float wave = sin(uTime * 2.0 + phase * 6.2831) * uAmplitude * heightFactor;
                    transformed.x += wave;
                    `
                );

                this.material.userData.shader = shader;

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

CoralGroup.prototype.isGroup = true;

export { CoralGroup };
