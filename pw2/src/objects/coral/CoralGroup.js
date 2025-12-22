import * as THREE from 'three';
import { CoralLOD } from './CoralLOD.js';
import { TimeManager } from '../../managers/TimeManager.js';

class CoralGroup extends THREE.Object3D {
    /**
     * @param {Array} data - Array of { position, rotation, scale }
     */
    constructor(data = []) {
        super();

        this.type = 'Group';
        this.data = data; 
        this.corals = [];
        this.timeManager = TimeManager.getInstance();
        
        this.material = this.createMaterial();

        this.init();
    }

    init() {
        if (this.data.length === 0) {
            console.warn('CoralGroup: No data provided');
            return;
        }

        const coralTemplate = new CoralLOD(this.material);
        
        for (const item of this.data) {
            // 1. Clone the template
            const coral = coralTemplate.clone(true);
            
            // 2. Apply properties from Seabed
            coral.position.copy(item.position);
            coral.rotation.copy(item.rotation);
            coral.scale.set(item.scale, item.scale, item.scale);

            // 3. Add to scene
            this.add(coral);
            this.corals.push({ 
                position: item.position, 
                object: coral 
            });
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

                shader.vertexShader = shader.vertexShader.replace(
                    '#include <uv_vertex>',
                    `#include <uv_vertex>
                    vUv = uv;
                    `
                );

                shader.vertexShader = shader.vertexShader.replace(
                    '#include <project_vertex>',
                    `vec4 mvPosition = vec4( transformed, 1.0 );
                    #ifdef USE_BATCHING
                        mvPosition = batchingMatrix * mvPosition;
                    #endif
                    #ifdef USE_INSTANCING
                        mvPosition = instanceMatrix * mvPosition;
                    #endif

                    vec3 objectIdSeed = mod(modelMatrix[3].xyz, 5.0);
                    float phase = hash(objectIdSeed) * 6.2831853; 
                    float wave = sin(phase + uFrequency * uTime + mvPosition.y * 0.3) * uAmplitude;
                    mvPosition.x += wave * pow(mvPosition.y / 5.0, 2.0);

                    mvPosition = modelViewMatrix * mvPosition;
                    gl_Position = projectionMatrix * mvPosition;
                    `
                );

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

// Helper to keep prototype chain clean if needed
CoralGroup.prototype.isGroup = true;

export { CoralGroup };