import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

class CameraManager {
    constructor(aspect, frustumSize = 20) {
        this.aspect = aspect;
        this.frustumSize = frustumSize;
        this.cameras = {};
        this.activeCameraName = null;
        this.lastCameraName = null;
        this.controls = null;

        // Orthographic parameters
        this.left = -frustumSize / 2 * aspect;
        this.right = frustumSize / 2 * aspect;
        this.top = frustumSize / 2;
        this.bottom = -frustumSize / 2;
        this.near = -frustumSize / 2;
        this.far = frustumSize;
    }

    init() {
        //TODO: CHANGE
        const perspective = new THREE.PerspectiveCamera(75, this.aspect, 0.1, 1000);
        perspective.position.set(10, 10, 3);
        this.cameras['Free Fly'] = perspective;

        //TODO: CHANGE
        const aquariumCam = new THREE.OrthographicCamera(
            this.left, this.right, this.top, this.bottom, this.near, this.far
        );
        aquariumCam.position.set(0, this.frustumSize / 4, this.frustumSize / 2);
        aquariumCam.lookAt(new THREE.Vector3(0, 0, 0));
        this.cameras['Aquarium View'] = aquariumCam;

        //TODO: CHANGE
        const submarineCam = new THREE.PerspectiveCamera(75, this.aspect, 0.1, 1000);
        submarineCam.position.set(0, 1, 0);
        this.cameras['Submarine View'] = submarineCam;

        this.setActiveCamera('Free Fly');
    }

    setActiveCamera(name) {
        this.activeCameraName = name;
        this.activeCamera = this.cameras[name];
    }

    getActiveCamera() {
        return this.activeCamera;
    }

    update(renderer) {
        if (this.lastCameraName !== this.activeCameraName) {
            this.lastCameraName = this.activeCameraName;

            // Create or update OrbitControls
            if (!this.controls) {
                this.controls = new OrbitControls(this.activeCamera, renderer.domElement);
                this.controls.enableZoom = true;
            } else {
                this.controls.object = this.activeCamera;
            }

            this.onResize(renderer);
        }

        if (this.controls) this.controls.update();
    }

    onResize(renderer) {
        if (!this.activeCamera) return;

        const width = window.innerWidth;
        const height = window.innerHeight;

        if (this.activeCamera.isPerspectiveCamera) {
            this.activeCamera.aspect = width / height;
        } else if (this.activeCamera.isOrthographicCamera) {
            const aspect = width / height;
            this.activeCamera.left = -this.frustumSize / 2 * aspect;
            this.activeCamera.right = this.frustumSize / 2 * aspect;
            this.activeCamera.top = this.frustumSize / 2;
            this.activeCamera.bottom = -this.frustumSize / 2;
        }

        this.activeCamera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }
}

export { CameraManager };
