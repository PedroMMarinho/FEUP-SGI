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
        this.init();
    }

    init() {
        const coralTemplate = new CoralLOD(); // no material yet

        for (let i = 0; i < this.count; i++) {
            const position = new THREE.Vector3(
                THREE.MathUtils.randFloatSpread(this.spreadX),
                0,
                THREE.MathUtils.randFloatSpread(this.spreadZ)
            );

            const coral = coralTemplate.clone(true);
            coral.position.copy(position);

            coral.userData.phase = Math.random() * Math.PI * 2;

            coral.traverse((child) => {
                if (child.isMesh) {
                    child.material = this.createMaterial(coral.userData.phase);
                }
            });

            this.add(coral);
            this.corals.push({ position, object: coral });
        }
    }

    createMaterial(phase = 0) {
        const material = new THREE.MeshPhongMaterial({
            color: 0xff7f50,
            specular: 0x222222,
            shininess: 25,
            onBeforeCompile: (shader) => {
                shader.uniforms.uTime = { value: 0.0 };
                shader.uniforms.uAmplitude = { value: 0.1 };  
                shader.uniforms.uFrequency = { value: 1.0 };   
                shader.uniforms.uPhase = { value: phase };    

                shader.vertexShader = `
                    uniform float uTime;
                    uniform float uAmplitude;
                    uniform float uFrequency;
                    uniform float uPhase;
                    varying vec2 vUv;\n
                ` + shader.vertexShader;

                shader.vertexShader = shader.vertexShader.replace(
                    '#include <uv_vertex>',
                    `#include <uv_vertex>
                     vUv = uv;\n`
                );

                shader.vertexShader = shader.vertexShader.replace(
                    '#include <begin_vertex>',
                    `
                    vec3 transformed = vec3(position);

                    float heightFactor = smoothstep(0.0, 1.0, position.y + 1.0); // taper from bottom to top
                    float wave = sin(uTime * 2.0 + uPhase) * uAmplitude * heightFactor;
                    transformed.x += wave;
                    `
                );

                shader.fragmentShader = `
                    varying vec2 vUv;\n
                ` + shader.fragmentShader;

                material.userData.shader = shader;
            }
        });

        return material;
    }

    updateState() {
        const elapsed = this.clock.getElapsedTime();



        this.traverse((child) => {
            if (child.material && child.material.userData && child.material.userData.shader) {
                child.material.userData.shader.uniforms.uTime.value = elapsed;
            }
        });
    }
}

CoralGroup.prototype.isGroup = true;

export { CoralGroup };
