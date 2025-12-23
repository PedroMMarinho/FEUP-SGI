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

    applyFishShader(material, color1Hex, color2Hex, isFin = false) {
        material.onBeforeCompile = (shader) => {
            shader.uniforms.perlinNoise = { value: this.perlinNoiseTex };
            shader.uniforms.color1 = { value: new THREE.Color(color1Hex) };
            shader.uniforms.color2 = { value: new THREE.Color(color2Hex) };
            shader.uniforms.randomOffset = { value: Math.random() * 100 };
            shader.uniforms.uTime = { value: 0 };

            material.userData.shader = shader;

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
                uniform vec3 color1;
                uniform vec3 color2;
                uniform float randomOffset;
                uniform float uTime;
                varying vec2 vUv;
                `
            );

            // Logic differs slightly between Body and Fin
            if (isFin) {
                shader.fragmentShader = shader.fragmentShader.replace(
                    `vec4 diffuseColor = vec4( diffuse, opacity );`,
                    `
                    float timeShift = uTime * 0.8;
                    float noiseValue = texture2D(perlinNoise, vUv + vec2(randomOffset * 0.01 + timeShift * 0.1)).r;
                    vec3 mixedColor = mix(color1, color2, noiseValue);
                    float pulse = 1.0 + (sin(uTime * 2.0) * 0.18);
                    mixedColor *= pulse;
                    vec4 diffuseColor = vec4(mixedColor, opacity);
                    `
                );
            } else {
                // Body Logic
                shader.fragmentShader = shader.fragmentShader.replace(
                    `vec4 diffuseColor = vec4( diffuse, opacity );`,
                    `
                    float scale1 = 2.0; float scale2 = 5.0; float scale3 = 10.0;
                    float timeShift = uTime * 0.8; 
                    vec2 offset = vec2(randomOffset * 0.01 + timeShift * 0.1);
                    float noise1 = texture2D(perlinNoise, vUv * scale1 + offset).r;
                    float noise2 = texture2D(perlinNoise, vUv * scale2 + offset * 1.3).r;
                    float noise3 = texture2D(perlinNoise, vUv * scale3 + offset * 1.7).r;
                    float noiseValue = noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2;
                    float pulse = 1.0 + (sin(uTime * 2.0) * 0.18); 
                    float threshold = 0.5; float sharpness = 0.1;
                    float colorMix = smoothstep(threshold - sharpness, threshold + sharpness, noiseValue);
                    vec3 mixedColor = mix(color1, color2, colorMix);
                    mixedColor *= pulse;
                    vec4 diffuseColor = vec4(mixedColor, opacity);
                    `
                );
            }
        };
    }

	initMaterials() {
		// For boids
		
		this.textureManager = TextureManager.getInstance();
		this.perlinNoiseTex = this.textureManager.getTexture('perlin-noise');
		this.perlinNoiseTex.wrapS = THREE.RepeatWrapping; 
		this.perlinNoiseTex.wrapT = THREE.RepeatWrapping; 
		this.perlinNoiseTex.repeat.set(1, 1);

        this.bodyColor = 0xff7b00; 
		this.finColor = 0x5a2cff;
        this.bodyColor2 = 0xffea00; 
		this.finColor2 = 0xff3bff; 

        this.BoidBodyMaterial = new THREE.MeshPhongMaterial({
            color: this.bodyColor,
        });
        this.BoidFinMaterial = new THREE.MeshPhongMaterial({
            color: this.finColor
        });
        
        this.applyFishShader(this.BoidBodyMaterial, this.bodyColor, this.bodyColor2, false);
        this.applyFishShader(this.BoidFinMaterial, this.finColor, this.finColor2, true);

        // For keyframed animated fish
        this.keyFramedBodyColor = 0x003465;
        this.keyFramedFinColor = 0xffffff;
        this.keyFramedBodyColor2 = 0x00aaff;
        this.keyFramedFinColor2 = 0xaaaaff;

        this.bodyKeyframedMaterial = new THREE.MeshPhongMaterial({
            color: this.keyFramedBodyColor,
        });
        this.finKeyframedMaterial = new THREE.MeshPhongMaterial({
            color: this.keyFramedFinColor
        });
        this.applyFishShader(this.bodyKeyframedMaterial, this.keyFramedBodyColor, this.keyFramedBodyColor2, false);
        this.applyFishShader(this.finKeyframedMaterial, this.keyFramedFinColor, this.keyFramedFinColor2, true);
	}

    createFishMesh(bodyMat, finMat, isHighRes) {
        const fish = new Fish(isHighRes ? 0 : 1);
        
        if (isHighRes) {
            const group = new THREE.Group();
            group.isSkinned = true;
            
            const body = new THREE.SkinnedMesh(fish.bodyGeometry, bodyMat);
            const tail = new THREE.SkinnedMesh(fish.tailGeometry, finMat);
            const dorsal = new THREE.SkinnedMesh(fish.dorsalFinGeometry, finMat);
            
            const skeleton = fish.skeleton;
            body.add(skeleton.bones[0]); body.bind(skeleton);
            tail.add(skeleton.bones[0]); tail.bind(skeleton);
            dorsal.add(skeleton.bones[0]); dorsal.bind(skeleton);
            
            group.add(body, tail, dorsal);
            return group;
        } else {
            const group = new THREE.Group();
            group.isSkinned = false;
            const body = new THREE.Mesh(fish.bodyGeometry, bodyMat);
            const tail = new THREE.Mesh(fish.tailGeometry, finMat);
            group.add(body, tail);
            return group;
        }
    }

    initializePrototypes() {        
        // 1. BOID PROTOTYPES
        this.boidHighProto = this.createFishMesh(this.BoidBodyMaterial, this.BoidFinMaterial, true);
        this.boidLowProto = this.createFishMesh(this.BoidBodyMaterial, this.BoidFinMaterial, false);
        this.applyScaling(this.boidHighProto, true);
        this.applyScaling(this.boidLowProto, false);

        // 2. Keyframed PROTOTYPES
        this.keyFramedHighProto = this.createFishMesh(this.bodyKeyframedMaterial, this.finKeyframedMaterial, true);
        this.keyFramedLowProto = this.createFishMesh(this.bodyKeyframedMaterial, this.finKeyframedMaterial, false);
        this.applyScaling(this.keyFramedHighProto, true);
        this.applyScaling(this.keyFramedLowProto, false);
    }

   applyScaling(mesh, isHighRes) {
        // 1. Get Geometry Data
        const tempFish = new Fish(isHighRes ? 0 : 1); 
        tempFish.bodyGeometry.computeBoundingBox();
        
        const center = new THREE.Vector3();
        const size = new THREE.Vector3();
        tempFish.bodyGeometry.boundingBox.getCenter(center);
        tempFish.bodyGeometry.boundingBox.getSize(size);
        const min = tempFish.bodyGeometry.boundingBox.min;
        
        const scaleFact = this.fishSize / size.length();
        
        const tra = new THREE.Matrix4().makeTranslation(-center.x, -center.y, -min.z);
        const sca = new THREE.Matrix4().makeScale(scaleFact, scaleFact, scaleFact);
        
        mesh.applyMatrix4(tra);
        mesh.applyMatrix4(sca);
    }

	init() {
		this.initMaterials();
        this.initializePrototypes();     

        this.boidCount = Math.floor(this.count * 0.95);

        // Boid fish group
		for (let i = 0; i < this.count; i++) {

			const highResClone = cloneSkinnedMesh(this.boidHighProto);
			const lowResClone = this.boidLowProto.clone();
			const lodPrototypes = [highResClone, lowResClone];
            highResClone.isSkinned = true;
            lowResClone.isSkinned = false;

			const scale = THREE.MathUtils.randFloat(0.8, 1.8);

			const fishLOD = new FishLOD(
                lodPrototypes,
                this.sparseness,
                this.baseHeight, 
                this.maxHeight, 
                this.boidProps,
                scale // default bodyLenRatio
            );


			fishLOD.rotation.y = THREE.MathUtils.randFloat(0, Math.PI * 2);
			fishLOD.scale.set(scale, scale, scale);

			this.add(fishLOD);
			this.fishes.push(fishLOD);
		}

        
       // 2. KEYFRAMED JUMPING FISH
        const animatedFishesCount = this.count - this.boidCount;
        
        for (let i = 0; i < animatedFishesCount; i++) {
            const highResClone = cloneSkinnedMesh(this.keyFramedHighProto);
            const lowResClone = this.keyFramedLowProto.clone();
            highResClone.isSkinned = true; lowResClone.isSkinned = false;
            
            const fishLOD = new FishLOD(
                [highResClone, lowResClone],
                this.sparseness, this.baseHeight, this.maxHeight, null
            );

            // Grouping logic for schools
            const groupIndex = Math.floor(i / 4); 
            const indexInGroup = i % 4;

            const duration = 25 + (Math.random() * 8); 
            
            const baseRadius = (this.sparseness / 2) - 4; 
            
            const jumpHeight = 8 + Math.random() * 2.6; 
            
            const radiusOffset = (indexInGroup * -2.0) - (Math.random() * 2);
            
            const routeData = this.generateJumpingRoute(
                duration, 
                baseRadius, 
                radiusOffset, 
                jumpHeight
            );

            const animation = new KeyframedAnimation(
                routeData, 
                "catmullrom",
                duration,
                true 
            );

            fishLOD.attachAnimation(animation);
            
            const groupStartDelay = groupIndex * 4.0; 
            const internalDelay = indexInGroup * 0.3; 
            fishLOD.animationOffset = groupStartDelay + internalDelay;

            this.add(fishLOD);
            this.animatedFishes.push(fishLOD);
        }
	}

 generateJumpingRoute(duration, baseRadius, radiusOffset, jumpHeight) {
        
        const waterSurface = this.maxHeight; 
        
        const swimDepth = waterSurface + waterSurface * 0.18; 
        
        const positions = [];
        const quaternions = [];
        const times = [];
        const steps = 60; 

        const noiseOffset = Math.random() * 100;

        for (let i = 0; i <= steps; i++) {
            const t = i / steps; 
            times.push(t * duration);

            const angle = t * Math.PI * 2; 

            // --- 1. WIDE LAP (X/Z) ---
            const wiggle = Math.sin(angle * 4 + noiseOffset) * 1.0; 
            const effectiveRadius = baseRadius + radiusOffset + wiggle;

            const x = Math.cos(angle) * effectiveRadius;
            const z = Math.sin(angle) * effectiveRadius;

            // --- 2. JUMP LOGIC (Y) ---
            const jumpCenter = 0.5;
            const jumpWidth = 0.12; 
            
            let y = swimDepth;

            const swimBob = Math.sin(angle * 8 + noiseOffset) * 0.3;

            if (Math.abs(t - jumpCenter) < jumpWidth) {
                // JUMP PHASE
                const phase = (t - (jumpCenter - jumpWidth)) / (jumpWidth * 2);
                
                const xVal = (phase * 2) - 1; 
                
                const jumpCurve = Math.cos(xVal * (Math.PI / 2));
                
                const smoothFactor = Math.pow(jumpCurve, 2.5); 

                const targetY = waterSurface + jumpHeight;
                const rise = targetY - swimDepth;
                
                y = swimDepth + (rise * smoothFactor);

            } else {
                y += swimBob;
            }

            const currentPos = new THREE.Vector3(x, y, z);
            positions.push(currentPos);

            // --- 3. ORIENTATION ---
            let targetQuat = new THREE.Quaternion();
            if (i > 0) {
                const prevPos = positions[i-1];
                const m = new THREE.Matrix4();
                
                const up = new THREE.Vector3(0, 1, 0);

                m.lookAt(currentPos, prevPos, up);
                targetQuat.setFromRotationMatrix(m);
            } else {
                targetQuat.identity();
            }
            quaternions.push(targetQuat);
        }

        if (quaternions.length > 1) quaternions[0].copy(quaternions[quaternions.length - 1]);

        return { times, positions, quaternions };
    }
	
	updateState() {
        const now = performance.now() * 0.001; 
        
        const mats = [this.BoidBodyMaterial, this.BoidFinMaterial, this.bodyKeyframedMaterial, this.finKeyframedMaterial];
        mats.forEach(mat => {
            if (mat.userData.shader) mat.userData.shader.uniforms.uTime.value = now;
        });


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
