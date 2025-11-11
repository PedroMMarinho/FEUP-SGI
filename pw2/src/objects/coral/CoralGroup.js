import * as THREE from 'three';
import { CoralLOD } from './CoralLOD.js';
import { TimeManager } from '../../managers/TimeManager.js';

class CoralGroup extends THREE.Object3D {
	constructor(positions = []) {
		super();

		this.type = 'Group';
		this.positions = positions;
		this.corals = [];
        this.material = this.createMaterial();
		this.timeManager = TimeManager.getInstance();

		this.init();
	}

	init() {
		if (this.positions.length === 0) {
			console.warn('CoralGroup: No positions provided');
			return;
		}

		const coralTemplate = new CoralLOD(this.material);
		
		for (const position of this.positions) {
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
        const elapsed = this.timeManager.getElapsedTime();
        const shader = this.material.userData.shader;
        if (shader && shader.uniforms?.uTime) {
            shader.uniforms.uTime.value = elapsed;
        }
    }
}


CoralGroup.prototype.isGroup = true;

export { CoralGroup };
