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

        // Shared material for all corals
        this.material = this.createMaterial();

        this.init();
    }

    init() {
        const coralTemplate = new CoralLOD(this.material);

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
            color: 0xff7f50, // coral color
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

                // Inject UV handling
                shader.vertexShader = shader.vertexShader.replace(
                    '#include <uv_vertex>',
                    `#include <uv_vertex>
                    vUv = uv;
                    `
                );

                // Replace vertex transformation logic (same as SeaweedGroup)
                shader.vertexShader = shader.vertexShader.replace(
                    '#include <project_vertex>',
                    `vec4 mvPosition = vec4( transformed, 1.0 );

                    #ifdef USE_BATCHING
                        mvPosition = batchingMatrix * mvPosition;
                    #endif

                    #ifdef USE_INSTANCING
                        mvPosition = instanceMatrix * mvPosition;
                    #endif

                    // Stable per-object random phase using world-space origin
                    vec3 objectIdSeed = mod(modelMatrix[3].xyz, 5.0);
                    float phase = hash(objectIdSeed) * 6.2831853; // 2*PI

                    // Apply waving effect
                    float wave = sin(phase + uFrequency * uTime + mvPosition.y * 0.3) * uAmplitude;

                    // Displace vertices along X axis based on height
                    mvPosition.x += wave * pow(mvPosition.y / 5.0, 2.0);

                    // Standard transformations
                    mvPosition = modelViewMatrix * mvPosition;
                    gl_Position = projectionMatrix * mvPosition;
                    `
                );

                // Keep shader reference for updates
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

CoralGroup.prototype.isGroup = true;

export { CoralGroup };
