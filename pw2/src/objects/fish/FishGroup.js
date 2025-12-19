import * as THREE from 'three';
import { FishLOD } from './FishLOD.js';
import { KeyframedAnimation } from './../../properties/KeyframedAnimation.js';
import { Fish } from './Fish.js';
import { TextureManager } from '../../managers/TextureManager.js';
import { clone as cloneSkinnedMesh } from '../../../../node_modules/three/examples/jsm/utils/SkeletonUtils.js';

// NOTE: Using instanced meshes disables the use of different fatFishScale, colors, etc.
// (constructor attributes) per fish. Using an actual different mesh for every fish would be fine 
// until up to 100 fishes maybe, but then would cause great lag.
// If thousands would be required, it would be necessary to revert to instanced matrix and maybe deform
// the fish using shaders instead. I chose the middle ground of having a few different meshes for variation
// and instancing from those. - Ismael Moniz (up202206871@up.pt)

class FishGroup extends THREE.Object3D {
	constructor(count = 30, terrainWidth, terrainHeight, boidProps = null) {
		super();

		if (count < 0) {
			console.warn("FishGroup: count must be > 0");
			return;
		}
		this.type = "Group";

		this.count = count;
		this.fishes = [];
		this.animatedFishes = [];
		this.sparseness = terrainWidth;
		this.baseHeight = 5;
		this.maxHeight = terrainHeight;
		this.fishSize = 1.0;
		this.boidProps = boidProps || 
		{
			cohesion: 2,
			separation: 2,
			alignment: 1.4,
			moveSpeed: 4,
			awareness: 10
		};
		this.init();
	}

	alterColor(hexColor, hueShift = 0.05, satShift = 0.1, lightShift = 0.1) {
        const color = new THREE.Color(hexColor);
        const hsl = {};
        color.getHSL(hsl);

        // Randomize Hue (wrap around 0-1)
        hsl.h += THREE.MathUtils.randFloatSpread(hueShift); 
        if (hsl.h < 0) hsl.h += 1;
        if (hsl.h > 1) hsl.h -= 1;

        // Randomize Saturation (clamp 0-1)
        hsl.s += THREE.MathUtils.randFloatSpread(satShift);
        hsl.s = THREE.MathUtils.clamp(hsl.s, 0, 1);

        // Randomize Lightness (clamp 0-1)
        hsl.l += THREE.MathUtils.randFloatSpread(lightShift);
        hsl.l = THREE.MathUtils.clamp(hsl.l, 0, 1);

        color.setHSL(hsl.h, hsl.s, hsl.l);
        return color.getHex(); 
    }
	// First fish is target
	getCameraTarget() {
        if (this.fishes.length > 0) {
            return this.fishes[0];
        }
        return null;
    }

	initMaterials() {
		this.bodyColor = 0xff7b00; 
		this.finColor = 0x5a2cff;
		this.bodyColor2 = 0xffea00; 
		this.finColor2 = 0xff3bff; 

		this.textureManager = TextureManager.getInstance();
		this.perlinNoiseTex = this.textureManager.getTexture('perlin-noise');
		this.perlinNoiseTex.wrapS = THREE.RepeatWrapping; 
		this.perlinNoiseTex.wrapT = THREE.RepeatWrapping; 
		this.perlinNoiseTex.repeat.set(1, 1);

		this.bodyMaterial = new THREE.MeshPhongMaterial({
            color: this.bodyColor,
            onBeforeCompile: (shader) => {
                shader.uniforms.perlinNoise = { value: this.perlinNoiseTex };
                shader.uniforms.bodyColor = { value: new THREE.Color(this.bodyColor) };
                shader.uniforms.bodyColor2 = { value: new THREE.Color(this.bodyColor2) };
                shader.uniforms.randomOffset = { value: Math.random() * 100 };
                shader.uniforms.uTime = { value: 0 }; 

                this.bodyMaterial.userData.shader = shader; 

                shader.vertexShader = shader.vertexShader.replace(
                    `#include <common>`,
                    `#include <common>
                     varying vec2 vUv;`
                );
                shader.vertexShader = shader.vertexShader.replace(
                    `#include <uv_vertex>`,
                    `#include <uv_vertex>
                     vUv = uv;`
                );
                
                shader.fragmentShader = shader.fragmentShader.replace(
                    `#include <common>`,
                    `
                    #include <common>
                    uniform sampler2D perlinNoise;
                    uniform vec3 bodyColor;
                    uniform vec3 bodyColor2;
                    uniform float randomOffset;
                    uniform float uTime;
                    varying vec2 vUv;
                    `
                );
                
                shader.fragmentShader = shader.fragmentShader.replace(
                    `vec4 diffuseColor = vec4( diffuse, opacity );`,
                    `
                    float scale1 = 2.0; 
                    float scale2 = 5.0;
                    float scale3 = 10.0;
                    
                    float timeShift = uTime * 0.8; 
                    vec2 offset = vec2(randomOffset * 0.01 + timeShift * 0.1);
                    
                    float noise1 = texture2D(perlinNoise, vUv * scale1 + offset).r;
                    float noise2 = texture2D(perlinNoise, vUv * scale2 + offset * 1.3).r;
                    float noise3 = texture2D(perlinNoise, vUv * scale3 + offset * 1.7).r;
                    
                    float noiseValue = noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2;
                    
                    float pulse = 1.0 + (sin(uTime * 2.0) * 0.18); 
                    
                    float threshold = 0.5;
                    float sharpness = 0.1;
                    float colorMix = smoothstep(threshold - sharpness, threshold + sharpness, noiseValue);
                    
                    vec3 mixedColor = mix(bodyColor, bodyColor2, colorMix);
                    mixedColor *= pulse;

                    vec4 diffuseColor = vec4(mixedColor, opacity);
                    `
                );
            },
        });

        this.finMaterial = new THREE.MeshPhongMaterial({
            color: this.finColor,
            onBeforeCompile: (shader) => {
                shader.uniforms.perlinNoise = { value: this.perlinNoiseTex };
                shader.uniforms.finColor = { value: new THREE.Color(this.finColor) };
                shader.uniforms.finColor2 = { value: new THREE.Color(this.finColor2) };
                shader.uniforms.randomOffset = { value: Math.random() * 100 };
                shader.uniforms.uTime = { value: 0 };

                // Save shader reference
                this.finMaterial.userData.shader = shader;

                shader.vertexShader = shader.vertexShader.replace(
                    `#include <common>`,
                    `#include <common>
                    varying vec2 vUv;`
                );

                shader.vertexShader = shader.vertexShader.replace(
                    `#include <uv_vertex>`,
                    `#include <uv_vertex>
                    vUv = uv;`
                );

                shader.fragmentShader = shader.fragmentShader.replace(
                    `#include <common>`,
                    `
                    #include <common>
                    uniform sampler2D perlinNoise;
                    uniform vec3 finColor;
                    uniform vec3 finColor2;
                    uniform float randomOffset;
                    uniform float uTime; // Added uTime
                    varying vec2 vUv;
                    `
                );

                shader.fragmentShader = shader.fragmentShader.replace(
                    `vec4 diffuseColor = vec4( diffuse, opacity );`,
                    `
                    // Add time shift to fins too
                    float timeShift = uTime * 0.8;
                    float noiseValue = texture2D(perlinNoise, vUv + vec2(randomOffset * 0.01 + timeShift * 0.1)).r;

                    vec3 mixedColor = mix(finColor, finColor2, noiseValue);
                    
                    // Add pulse to fins
                    float pulse = 1.0 + (sin(uTime * 2.0) * 0.18);
                    mixedColor *= pulse;

                    vec4 diffuseColor = vec4(mixedColor, opacity);
                    `
                );
            },
        });

        this.bodyMaterial.needsUpdate = true;
        this.finMaterial.needsUpdate = true;

	}

	initializeFishes() {
        // 1. Generate the raw geometry containers using your Fish class
        const normalFish = new Fish(0); // High Res
        const lowResFish = new Fish(1); // Low Res

        // --- PREPARE LOW RES PROTOTYPE ---
        lowResFish.bodyGeometry.computeBoundingBox();
        var loresCenter = new THREE.Vector3();
        var loresSize = new THREE.Vector3();
        lowResFish.bodyGeometry.boundingBox.getCenter(loresCenter);
        lowResFish.bodyGeometry.boundingBox.getSize(loresSize);

        var loresMin = lowResFish.bodyGeometry.boundingBox.min;
        var loresSca = new THREE.Matrix4();
        var loresTra = new THREE.Matrix4();
        var loresScaleFact = this.fishSize / loresSize.length();
        loresSca.makeScale(loresScaleFact, loresScaleFact, loresScaleFact);
        loresTra.makeTranslation(-loresCenter.x, -loresCenter.y, -loresMin.z);

        const lowMesh = new THREE.Group();
        lowMesh.isSkinned = false;

		const lowResBodyMesh = new THREE.Mesh(lowResFish.bodyGeometry, this.bodyMaterial);
        const lowResTailMesh = new THREE.Mesh(lowResFish.tailGeometry, this.finMaterial);
        lowMesh.add(lowResTailMesh, lowResBodyMesh);

        lowMesh.applyMatrix4(loresTra);
        lowMesh.applyMatrix4(loresSca);

        // --- PREPARE HIGH RES PROTOTYPE ---
        const hiMesh = new THREE.Group();
        hiMesh.isSkinned = true;

        normalFish.bodyGeometry.computeBoundingBox();
        var hiresCenter = new THREE.Vector3();
        var hiresSize = new THREE.Vector3();
        normalFish.bodyGeometry.boundingBox.getCenter(hiresCenter);
        normalFish.bodyGeometry.boundingBox.getSize(hiresSize);

        var hiresMin = normalFish.bodyGeometry.boundingBox.min;
        var hiresSca = new THREE.Matrix4();
        var hiresTra = new THREE.Matrix4();
        var hiresScaleFact = this.fishSize / hiresSize.length();
        hiresSca.makeScale(hiresScaleFact, hiresScaleFact, hiresScaleFact);
        hiresTra.makeTranslation(-hiresCenter.x, -hiresCenter.y, -hiresMin.z);

        // Use the SHARED materials
        const highResBodyMesh = new THREE.SkinnedMesh(normalFish.bodyGeometry, this.bodyMaterial);
        const highResTailMesh = new THREE.SkinnedMesh(normalFish.tailGeometry, this.finMaterial);
        const highResDorsalMesh = new THREE.SkinnedMesh(normalFish.dorsalFinGeometry, this.finMaterial);

        const skeleton = normalFish.skeleton;

        // Attach root bone and bind skeleton
        highResBodyMesh.add(skeleton.bones[0]);
        highResBodyMesh.bind(skeleton);

        highResTailMesh.add(skeleton.bones[0]);
        highResTailMesh.bind(skeleton);

        highResDorsalMesh.add(skeleton.bones[0]);
        highResDorsalMesh.bind(skeleton);

        hiMesh.add(highResBodyMesh, highResTailMesh, highResDorsalMesh);

        hiMesh.applyMatrix4(hiresTra); 
        hiMesh.applyMatrix4(hiresSca);

        // SAVE THE PROTOTYPES TO THE CLASS
        this.highResProto = hiMesh;
        this.lowResProto = lowMesh;
    }


	init() {
		this.initMaterials();
		this.initializeFishes();

		for (let i = 0; i < this.count; i++) {
			// Randomly Shaddes of Colors
			//const variedBodyColor = this.alterColor(bodyColor, 0.08, 0.2, 0.2);
			//const variedFinColor = this.alterColor(finColor, 0.05, 0.2, 0.2);
			//const variedBodyColor2 = this.alterColor(bodyColor2, 0.08, 0.2, 0.2);
			//const variedFinColor2 = this.alterColor(finColor2, 0.05, 0.2, 0.2);

			const highResClone = cloneSkinnedMesh(this.highResProto);
			const lowResClone = this.lowResProto.clone();
			const lodPrototypes = [highResClone, lowResClone];
            highResClone.isSkinned = true;
            lowResClone.isSkinned = false;

			const fishLOD = new FishLOD(
                lodPrototypes,
                this.sparseness,
                this.baseHeight, 
                this.maxHeight, 
                this.boidProps,
                1.0 // default bodyLenRatio
            );


			fishLOD.rotation.y = THREE.MathUtils.randFloat(0, Math.PI * 2);
			const scale = THREE.MathUtils.randFloat(0.8, 1.2);
			fishLOD.scale.set(scale, scale, scale);

			this.add(fishLOD);
			this.fishes.push(fishLOD);
		}

		/*const animatedFishesCount = 3;
		for (let i = 0; i < animatedFishesCount; i++) {
			const fishLOD = new FishLOD(0x003465, 0xffffff);

			const animation = new KeyframedAnimation(
				Math.round(Math.random() + 3 * 10000),
				"cubic",
				Math.round(Math.random() * 5 + 3),
				10,
				15,
				15
			);
			fishLOD.attachAnimation(animation);
			this.add(fishLOD);
			this.animatedFishes.push(fishLOD);
		} */
	}
	
	updateState() {
        const now = performance.now() * 0.001; 
        if (this.bodyMaterial.userData.shader) {
            this.bodyMaterial.userData.shader.uniforms.uTime.value = now;
        }
        if (this.finMaterial && this.finMaterial.userData.shader) {
            this.finMaterial.userData.shader.uniforms.uTime.value = now;
        }

		for (const fish of this.fishes) {
			fish.flock(this.fishes);
			fish.updateState();
		}
		for (const fish of this.animatedFishes) {
			fish.updateState();
			fish.updateAnimation();
		}
	}
		
}

FishGroup.prototype.isGroup = true;

export { FishGroup };
