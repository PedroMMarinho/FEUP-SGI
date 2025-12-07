import * as THREE from 'three';

export class SubmarineShield {
    constructor(cameraManager, parentObject, cuts) {
        this.cameraManager = cameraManager;
        this.parent = parentObject;
        this.isActive = false;
        this.cuts = cuts;


        this.initMaterial();
        this.initGeometry();
        this.activate();
    }

    initGeometry() {
        const geometry = new THREE.SphereGeometry(
            1,
            this.cuts,
            this.cuts
        );

        this.mesh = new THREE.Mesh(geometry, this.material);
        this.mesh.scale.set(2.6, 3.05, 8.0);
        this.mesh.visible = this.isActive;

        this.mesh.translateZ(1.0);
        this.mesh.translateY(0.15);
        this.mesh.cannotCastShadow = true;
    }

    updateShieldParams(params) {
    if (!params) return;

    if ('shieldGlowColor' in params)
        this.uniforms.glowColor.value.set(params.shieldGlowColor);

    if ('c' in params)
        this.uniforms.c.value = params.c;

    if ('p' in params)
        this.uniforms.p.value = params.p;

    if ('isActive' in params)
        this.mesh.visible = params.isActive;


    }   
    


    initMaterial() {
        // === STEMKOSKI SHADER UNIFORMS ===
        this.uniforms = {
            c: { value: 1.0 },
            p: { value: 1.4 },
            glowColor: { value: new THREE.Color(0xffff00) },
            viewVector: { value: new THREE.Vector3() }
        };

        // === STEMKOSKI VERTEX SHADER ===
        const vertexShader = `
            uniform vec3 viewVector;
            uniform float c;
            uniform float p;
            varying float intensity;

            void main() {
                vec3 vNormal = normalize(normalMatrix * normal);

               
                vec3 vNormel = normalize(normalMatrix * viewVector);

                intensity = pow(c - dot(vNormal, vNormel), p);

                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }

        `;

        // === STEMKOSKI FRAGMENT SHADER ===
        const fragmentShader = `
            uniform vec3 glowColor;
            varying float intensity;

            void main() {
                vec3 glow = glowColor * intensity;
                gl_FragColor = vec4(glow, 1.0);
            }
        `;

        // === MATERIAL ===
        this.material = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader,
            fragmentShader,
            side: THREE.FrontSide,
            blending: THREE.AdditiveBlending,
            transparent: true,
            depthWrite: false,
        });
    }

    attachTo(object3D) {
        object3D.add(this.mesh);
        this.parent = object3D;
    }

    activate() {
        this.isActive = true;
        this.mesh.visible = this.isActive;
    }

    deactivate() {
        this.isActive = false;
        this.mesh.visible = this.isActive;
    }

    update() {
        if (!this.isActive || !this.parent) return;

        const camera = this.cameraManager.getActiveCamera();

        // Parent Position in View Space
        const parentWorldPos = this.parent.getWorldPosition(new THREE.Vector3());
        const cameraWorldPos = camera.getWorldPosition(new THREE.Vector3());

        // Subvector
        const shieldViewToParentView = new THREE.Vector3().subVectors(cameraWorldPos, parentWorldPos);


        this.uniforms.viewVector.value.copy(shieldViewToParentView);
    }

}
