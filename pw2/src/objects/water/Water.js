import * as THREE from 'three'; 

class Water extends THREE.Object3D {
    constructor(heightMap, width, height, depth, envMap) {
        super();
        this.clock = new THREE.Clock(); 
        const geometry = new THREE.PlaneGeometry(width, depth,64,64);
        heightMap.wrapS = heightMap.wrapT = THREE.RepeatWrapping;
        heightMap.repeat.set(4, 4);
        this.material = new THREE.MeshStandardMaterial({
            color: 0x1ca3ec,
            metalness: 0,
            roughness: 0.1,
            transparent: true,
            opacity: 0.8,
            envMap: envMap, // works with PMREM texture
            envMapIntensity: 1.0,
            side: THREE.DoubleSide,
            onBeforeCompile: (shader) => {
                shader.uniforms.time = { value: 0 };
                shader.uniforms.heightMap = { value: heightMap };
                shader.uniforms.uMaxOffset = { value: 6.0 };

                shader.vertexShader = `
                    uniform float time;
                    uniform sampler2D heightMap;
                    uniform float uMaxOffset;
                    varying vec2 vUv;

                    ${shader.vertexShader}
                `.replace(
                    `#include <uv_vertex>`,
                    `#include <uv_vertex>
                     vUv = uv;`
                
                ).replace(
                    '#include <begin_vertex>',
                    `
                    #include <begin_vertex>
                    vec3 color = texture2D(heightMap, uv + vec2(time * 0.005, time * 0.005)).rgb;

                    float offsetR = (color.r - 0.5) * uMaxOffset;
                    float offsetG = (color.g - 0.5) * uMaxOffset * 0.5; 
                    float offsetB = (color.b - 0.5) * uMaxOffset * 0.8;

                    transformed += normal * (offsetR + offsetG + offsetB);`
                );

                this.material.userData.shader = shader;

            }
        });
        this.waterSurface = new THREE.Mesh(geometry, this.material);
        this.add(this.waterSurface);
        this.position.set(0, height , 0);
        this.rotation.x = -Math.PI / 2;
    }
    updateState(){
        const elapsed = this.clock.getElapsedTime();
        if(this.material.userData.shader) {
            this.material.userData.shader.uniforms.time.value = elapsed;
        }
    }
}

export { Water };
