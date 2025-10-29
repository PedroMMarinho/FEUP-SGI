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
        this.init();
    }

    init() {
        const seaweedTemplate = new SeaweedLOD();

        for (let i = 0; i < this.count; i++) {
            const position = new THREE.Vector3(
                THREE.MathUtils.randFloatSpread(this.spreadX),
                0,
                THREE.MathUtils.randFloatSpread(this.spreadZ)
            );

            const seaweed = seaweedTemplate.clone(true);
            seaweed.position.copy(position);

            seaweed.userData.phase = Math.random() * Math.PI * 2;

            seaweed.traverse((child) => {
                if (child.isInstancedMesh) {
                    child.instanceMatrix.needsUpdate = true;
                    child.material = this.createMaterial(seaweed.userData.phase);
                } else if (child.isMesh) {
                    child.material = this.createMaterial(seaweed.userData.phase);
                }
            });

            this.add(seaweed);
            this.seaweeds.push({ position, object: seaweed });
        }
    }

    createMaterial(phase = 0) {
        // same shader approach as CoralGroup but with seaweed color 0x198450
        const material = new THREE.MeshPhongMaterial({
            color: 0x198450,
            specular: 0x222222,
            shininess: 25,
            onBeforeCompile: (shader) => {
                shader.uniforms.uTime = { value: 0.0 };
                shader.uniforms.uAmplitude = { value: 0.08 };
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

                    // weight the displacement by height so base stays anchored
                    float heightFactor = smoothstep(0.0, 1.0, position.y + 1.0);
                    float wave = sin(uTime * 2.0 * uFrequency + uPhase) * uAmplitude * heightFactor;
                    transformed.x += wave;
                    `
                );

                shader.fragmentShader = `
                    varying vec2 vUv;\n
                ` + shader.fragmentShader;

                // keep reference so external code can update uniforms
                material.userData.shader = shader;
            }
        });

        return material;
    }

    updateState() {
        const elapsed = this.clock.getElapsedTime();

        this.traverse((child) => {
            if (child.material && child.material.userData && child.material.userData.shader) {
                const shader = child.material.userData.shader;
                if (shader.uniforms && shader.uniforms.uTime) {
                    shader.uniforms.uTime.value = elapsed;
                }
            }
        });
    }


}

SeaweedGroup.prototype.isGroup = true;

export { SeaweedGroup };
