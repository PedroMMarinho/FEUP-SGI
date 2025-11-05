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

            const basePhase = Math.random() * Math.PI * 2;

            seaweed.levels.forEach(level => {
                level.object.onBeforeRender = (renderer, scene, camera, geometry, material, group) => {
                    if (material.userData.shader) {
                        material.userData.shader.uniforms.uBasePhase.value = basePhase;
                    }
                };
            });

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
                shader.uniforms.uAmplitude = { value: 0.8 };
                shader.uniforms.uFrequency = { value: 1.0 };
                shader.uniforms.uBasePhase = { value: 0.0 };

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
                    uniform float uBasePhase;
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
                    '#include <project_vertex>',
                    `vec4 mvPosition = vec4( transformed, 1.0 );

                    #ifdef USE_BATCHING

                        mvPosition = batchingMatrix * mvPosition;

                    #endif

                    #ifdef USE_INSTANCING

                        mvPosition = instanceMatrix * mvPosition;

                    #endif


                    // Apply waving effect
                    float wave = sin(uBasePhase + uFrequency * uTime + mvPosition.y * 0.3) * uAmplitude;

                    // Displace vertices along the X axis based on their Y position
                    mvPosition.x += wave * pow(mvPosition.y / 5.0, 2.0); // Adjust divisor for height influence

                    // Standard transformations 

                    mvPosition = modelViewMatrix * mvPosition;

                    gl_Position = projectionMatrix * mvPosition;
`
                );

                console.log(shader.vertexShader);

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
