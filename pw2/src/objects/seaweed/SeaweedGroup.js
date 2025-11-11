import * as THREE from 'three';
import { SeaweedLOD } from "./SeaweedLOD.js";
import { TimeManager } from '../../managers/TimeManager.js';

class SeaweedGroup extends THREE.Object3D {
    constructor(positions = []) {
        super();

        if (positions.length === 0) {
            console.warn("SeaweedGroup: positions array must not be empty");
            return;
        }

        this.type = "Group";
        this.seaweeds = [];

    	this.positions = positions;
		this.corals = [];
        this.material = this.createMaterial();
        this.timeManager = TimeManager.getInstance();

        this.init();
    }

    init() {
        const seaweedTemplate = new SeaweedLOD(this.material);

        for (const position of this.positions) {
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
                shader.uniforms.uAmplitude = { value: 0.4 };
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
                    '#include <project_vertex>',
                    `vec4 mvPosition = vec4( transformed, 1.0 );

                    #ifdef USE_BATCHING

                        mvPosition = batchingMatrix * mvPosition;

                    #endif

                    #ifdef USE_INSTANCING

                        mvPosition = instanceMatrix * mvPosition;

                    #endif

                    // Quantize the seaweed's base position to ensure stable per-object randomness
                    vec3 objectIdSeed = mod(modelMatrix[3].xyz, 5.0);
                    float phase = hash(objectIdSeed) * 6.2831853; // 2*PI

                    // Apply waving effect
                    float wave = sin( phase + uFrequency * uTime + mvPosition.y * 0.3) * uAmplitude;

                    // Displace vertices along the X axis based on their Y position
                    mvPosition.x += wave * pow(mvPosition.y / 5.0, 2.0); // Adjust divisor for height influence

                    // Standard transformations 

                    mvPosition = modelViewMatrix * mvPosition;

                    gl_Position = projectionMatrix * mvPosition;
`
                );


                // Keep shader reference for external updates
                material.userData.shader = shader;
            }
        });

        return material;
    }

    updateState() {
        const elapsed = this.timeManager.getElapsedTime();
        const shader = this.material.userData.shader;
        if (shader && shader.uniforms?.uTime) {
            shader.uniforms.uTime.value = elapsed;
        }
    }
}

SeaweedGroup.prototype.isGroup = true;

export { SeaweedGroup };
