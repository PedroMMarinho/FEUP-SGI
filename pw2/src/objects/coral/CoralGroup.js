import * as THREE from 'three';
import { CoralLOD } from './CoralLOD.js';
import { TimeManager } from '../../managers/TimeManager.js';
import { TextureManager } from '../../managers/TextureManager.js';

class CoralGroup extends THREE.Object3D {
    constructor(data = []) {
        super();

        this.type = 'Group';
        this.data = data; 
        this.corals = [];
        this.timeManager = TimeManager.getInstance();
        this.textureManager = TextureManager.getInstance();
        this.coralTexture = null;
        
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
            const coral = coralTemplate.clone(true);
            
            coral.position.copy(item.position);
            coral.rotation.copy(item.rotation);
            coral.scale.set(item.scale, item.scale, item.scale);

            this.add(coral);
            this.corals.push({ 
                position: item.position, 
                object: coral 
            });
        }
    }

    createMaterial() {
        this.coralTexture = this.textureManager.getTexture('coral');
        this.coralNormalMap = this.textureManager.getTexture('coral-normal');
        
        // Ensure texture wrapping
        if (this.coralTexture) {
            this.coralTexture.wrapS = THREE.RepeatWrapping;
            this.coralTexture.wrapT = THREE.RepeatWrapping;
        }

        if(this.coralNormalMap){
            this.coralNormalMap.wrapS = this.coralTexture.wrapT = THREE.RepeatWrapping;
        }

        const material = new THREE.MeshPhongMaterial({
            color: 0xff7f50,
            specular: 0x222222,
            shininess: 25,
            map: this.coralTexture,
            flatShading: false, // Ensure smooth shading
            onBeforeCompile: (shader) => {
                shader.uniforms.uTime = { value: 0.0 };
                shader.uniforms.uAmplitude = { value: 0.1 };
                shader.uniforms.uFrequency = { value: 1.0 };
                shader.uniforms.uTexture = { value: this.coralTexture };
                shader.uniforms.uNormalMap = { value: this.coralNormalMap };
                shader.uniforms.uTextureScale = { value: 0.5 }; // Adjusted scale
                shader.uniforms.uNormalScale = { value: 1.0 }; // Normal map strength
                shader.uniforms.uUseTexture = { value: this.coralTexture ? 1.0 : 0.0 };
                shader.uniforms.uUseNormal = { value: this.coralNormalMap ? 1.0 : 0.0 };

                const hashGLSL = `
                    float hash(vec3 p) {
                        p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
                        p *= 17.0;
                        return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
                    }
                `;

                const triplanarGLSL = `
                    vec3 triplanarMapping(sampler2D tex, vec3 worldPos, vec3 worldNormal, float scale) {
                        vec3 blendWeights = abs(worldNormal);
                        blendWeights = pow(blendWeights, vec3(4.0)); // Sharper blend
                        blendWeights = blendWeights / (blendWeights.x + blendWeights.y + blendWeights.z);
                        
                        vec2 uvX = worldPos.yz * scale;
                        vec2 uvY = worldPos.xz * scale;
                        vec2 uvZ = worldPos.xy * scale;
                        
                        vec3 colX = texture2D(tex, uvX).rgb;
                        vec3 colY = texture2D(tex, uvY).rgb;
                        vec3 colZ = texture2D(tex, uvZ).rgb;
                        
                        return colX * blendWeights.x + colY * blendWeights.y + colZ * blendWeights.z;
                    }
                    
                    vec3 triplanarNormal(sampler2D tex, vec3 worldPos, vec3 worldNormal, float scale, float strength) {
                        vec3 blendWeights = abs(worldNormal);
                        blendWeights = pow(blendWeights, vec3(4.0));
                        blendWeights = blendWeights / (blendWeights.x + blendWeights.y + blendWeights.z);
                        
                        vec2 uvX = worldPos.yz * scale;
                        vec2 uvY = worldPos.xz * scale;
                        vec2 uvZ = worldPos.xy * scale;
                        
                        // Sample normal maps
                        vec3 tnormalX = texture2D(tex, uvX).xyz * 2.0 - 1.0;
                        vec3 tnormalY = texture2D(tex, uvY).xyz * 2.0 - 1.0;
                        vec3 tnormalZ = texture2D(tex, uvZ).xyz * 2.0 - 1.0;
                        
                        // Apply strength
                        tnormalX.xy *= strength;
                        tnormalY.xy *= strength;
                        tnormalZ.xy *= strength;
                        
                        // Swizzle to match world axes
                        vec3 worldNormalX = vec3(tnormalX.z, tnormalX.y, tnormalX.x);
                        vec3 worldNormalY = vec3(tnormalY.x, tnormalY.z, tnormalY.y);
                        vec3 worldNormalZ = vec3(tnormalZ.x, tnormalZ.y, tnormalZ.z);
                        
                        // Flip for correct orientation
                        if (worldNormal.x < 0.0) worldNormalX.x = -worldNormalX.x;
                        if (worldNormal.y < 0.0) worldNormalY.y = -worldNormalY.y;
                        if (worldNormal.z < 0.0) worldNormalZ.z = -worldNormalZ.z;
                        
                        // Blend normals
                        vec3 blendedNormal = normalize(
                            worldNormalX * blendWeights.x +
                            worldNormalY * blendWeights.y +
                            worldNormalZ * blendWeights.z
                        );
                        
                        return normalize(worldNormal + blendedNormal);
                    }
                `;

                shader.vertexShader = `
                    uniform float uTime;
                    uniform float uAmplitude;
                    uniform float uFrequency;
                    varying vec2 vUv;
                    varying vec3 vWorldPosition;
                    varying vec3 vWorldNormal;
                    ${hashGLSL}
                ` + shader.vertexShader;

                shader.vertexShader = shader.vertexShader.replace(
                    '#include <uv_vertex>',
                    `#include <uv_vertex>
                    vUv = uv;`
                );

                shader.vertexShader = shader.vertexShader.replace(
                    '#include <beginnormal_vertex>',
                    `vec3 objectNormal = vec3(normal);
                    #ifdef USE_TANGENT
                        vec3 objectTangent = vec3(tangent.xyz);
                    #endif`
                );

                shader.vertexShader = shader.vertexShader.replace(
                    '#include <defaultnormal_vertex>',
                    `vec3 transformedNormal = objectNormal;
                    #ifdef USE_INSTANCING
                        mat3 m = mat3(instanceMatrix);
                        transformedNormal /= vec3(dot(m[0], m[0]), dot(m[1], m[1]), dot(m[2], m[2]));
                        transformedNormal = m * transformedNormal;
                    #endif
                    transformedNormal = normalMatrix * transformedNormal;
                    #ifdef FLIP_SIDED
                        transformedNormal = -transformedNormal;
                    #endif
                    #ifdef USE_TANGENT
                        vec3 transformedTangent = (modelViewMatrix * vec4(objectTangent, 0.0)).xyz;
                        #ifdef FLIP_SIDED
                            transformedTangent = -transformedTangent;
                        #endif
                    #endif`
                );

                shader.vertexShader = shader.vertexShader.replace(
                    '#include <project_vertex>',
                    `// Store original transformed position
                    vec3 transformedPos = transformed;
                    
                    // Calculate world position and normal BEFORE animation
                    vec4 worldPos = modelMatrix * vec4(transformedPos, 1.0);
                    vWorldPosition = worldPos.xyz;
                    vWorldNormal = normalize((modelMatrix * vec4(objectNormal, 0.0)).xyz);
                    
                    // Now apply animation
                    vec4 mvPosition = vec4(transformedPos, 1.0);
                    #ifdef USE_BATCHING
                        mvPosition = batchingMatrix * mvPosition;
                    #endif
                    #ifdef USE_INSTANCING
                        mvPosition = instanceMatrix * mvPosition;
                    #endif
                    
                    vec3 objectIdSeed = mod(modelMatrix[3].xyz, 5.0);
                    float phase = hash(objectIdSeed) * 6.2831853; 
                    float wave = sin(phase + uFrequency * uTime + mvPosition.y * 0.3) * uAmplitude;
                    mvPosition.x += wave * pow(max(0.0, mvPosition.y / 5.0), 2.0);
                    
                    mvPosition = modelViewMatrix * mvPosition;
                    gl_Position = projectionMatrix * mvPosition;`
                );

                shader.fragmentShader = `
                    uniform sampler2D uTexture;
                    uniform sampler2D uNormalMap;
                    uniform float uTextureScale;
                    uniform float uNormalScale;
                    uniform float uUseTexture;
                    uniform float uUseNormal;
                    varying vec3 vWorldPosition;
                    varying vec3 vWorldNormal;
                    ${triplanarGLSL}
                ` + shader.fragmentShader;

                shader.fragmentShader = shader.fragmentShader.replace(
                    '#include <normal_fragment_begin>',
                    `vec3 normal = normalize(vWorldNormal);
                    
                    // Apply triplanar normal mapping if available
                    if (uUseNormal > 0.5) {
                        normal = triplanarNormal(uNormalMap, vWorldPosition, vWorldNormal, uTextureScale, uNormalScale);
                    }
                    
                    // Transform to view space for lighting
                    normal = normalize((viewMatrix * vec4(normal, 0.0)).xyz);
                    
                    #ifdef DOUBLE_SIDED
                        normal = normal * (float(gl_FrontFacing) * 2.0 - 1.0);
                    #endif`
                );

                shader.fragmentShader = shader.fragmentShader.replace(
                    '#include <map_fragment>',
                    `#ifdef USE_MAP
                        if (uUseTexture > 0.5) {
                            vec3 triplanarColor = triplanarMapping(uTexture, vWorldPosition, vWorldNormal, uTextureScale);
                            diffuseColor *= vec4(triplanarColor, 1.0);
                        }
                    #else
                        if (uUseTexture > 0.5) {
                            vec3 triplanarColor = triplanarMapping(uTexture, vWorldPosition, vWorldNormal, uTextureScale);
                            diffuseColor *= vec4(triplanarColor, 1.0);
                        }
                    #endif`
                );

                material.userData.shader = shader;
            }
        });

        return material;
    }

    // Method to update texture scale
    setTextureScale(scale) {
        if (this.material.userData.shader && this.material.userData.shader.uniforms.uTextureScale) {
            this.material.userData.shader.uniforms.uTextureScale.value = scale;
        }
    }
    
    // Method to update normal map strength
    setNormalScale(scale) {
        if (this.material.userData.shader && this.material.userData.shader.uniforms.uNormalScale) {
            this.material.userData.shader.uniforms.uNormalScale.value = scale;
        }
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