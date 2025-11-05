import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

class CameraManager {
    constructor(aspect, keyManager, frustumSize = 20) {
        this.keyManager = keyManager;
        this.aspect = aspect;
        this.frustumSize = frustumSize;
        this.cameras = {};
        this.activeCameraName = null;
        this.lastCameraName = null;
        this.cameraSelection = "Free Fly";
        this.controls = null;

        this.moveSpeed = 6; 
        this.lookSpeed = 0.5; 

        this.yaw = 0;
        this.pitch = 0;

        this.freeFlyActive = false;
        this.clock = new THREE.Clock(); 

        // Orthographic parameters
        this.left = -frustumSize / 2 * aspect;
        this.right = frustumSize / 2 * aspect;
        this.top = frustumSize / 2;
        this.bottom = -frustumSize / 2;
        this.near = -frustumSize / 2;
        this.far = frustumSize;
    }

    init() {
        const perspective = new THREE.PerspectiveCamera(75, this.aspect, 0.1, 1000);
        perspective.position.set(10, 10, 3);
        this.cameras['Free Fly'] = perspective;

        const aquariumCam = new THREE.OrthographicCamera(
            this.left, this.right, this.top, this.bottom, this.near, this.far
        );
        aquariumCam.position.set(0, this.frustumSize / 4, this.frustumSize / 2);
        aquariumCam.lookAt(new THREE.Vector3(0, 0, 0));
        this.cameras['Aquarium View'] = aquariumCam;

        const UnderwaterCam = new THREE.PerspectiveCamera(75, this.aspect, 0.1, 1000);
        UnderwaterCam.position.set(0, 2, 5);
        this.cameras['Underwater View'] = UnderwaterCam;

        const submarineCam = new THREE.PerspectiveCamera(100, this.aspect, 0.1, 1000);
        this.cameras['Submarine View'] = submarineCam;

        this.setActiveCamera('Free Fly');
    }

    setActiveCamera(name) {
        if (this.activeCameraName === name) return;
        const previous = this.activeCameraName;
        this.lastCameraName = previous;
        this.activeCameraName = name;
        this.activeCamera = this.cameras[name];
        console.log("Last position:", this.cameras[this.lastCameraName]?.position);
        this.changeCamera(previous, name);
    }

    getActiveCamera() {
        return this.activeCamera;
    }

    update(renderer, submarine) {
        const deltaTime = this.clock.getDelta(); 

        if (this.activeCameraName === 'Underwater View' && !this.controls) {
            this.controls = new OrbitControls(this.activeCamera, renderer.domElement);
            this.controls.target.set(0, 1, 0);
            this.controls.enableZoom = true;
            this.controls.enablePan = false;
            this.controls.update();
        } else if (this.activeCameraName !== 'Underwater View') {
            if (this.controls) {
                this.controls.dispose();
                this.controls = null;
            }
        }

        if (this.controls) this.controls.update();
        if (this.activeCameraName === 'Free Fly') this.updateFreeFly(deltaTime);
        if (this.activeCameraName === 'Submarine View') this.updateSubmarineView(submarine, deltaTime);

    }

     updateSubmarineView(submarine, deltaTime) {
        const camera = this.cameras['Submarine View'];

        const offset = new THREE.Vector3(0, 3, 2);
        const relativeOffset = offset.clone().applyMatrix4(submarine.matrixWorld);

        camera.position.lerp(relativeOffset, 2 * deltaTime);
        const lookAtOffset = new THREE.Vector3(0, 1, -5).applyMatrix4(submarine.matrixWorld);
        camera.lookAt(lookAtOffset);
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

    changeCamera(oldName, newName) {
        if (newName === 'Aquarium View') {
            const cam = this.cameras['Aquarium View'];
            cam.position.set(0, this.frustumSize / 4, this.frustumSize / 2);
            cam.lookAt(0, 10, 0);
        }

        if (oldName === 'Free Fly') {
            this.freeFlyActive = false;
        }
    }

    updateSubmarineFollow(submarine, deltaTime) {
        const camera = this.cameras['Submarine View'];
        const offset = new THREE.Vector3(0, 3, 12);
        const relativeOffset = offset.clone().applyMatrix4(submarine.matrixWorld);
        camera.position.lerp(relativeOffset, 2 * deltaTime);


        const lookAtOffset = new THREE.Vector3(0, 1, -5).applyMatrix4(submarine.matrixWorld);
        camera.lookAt(lookAtOffset);
    }

    updateFreeFly(deltaTime) {
        const keyManager = this.keyManager;
        const camera = this.activeCamera;
        const moveSpeed = this.moveSpeed * deltaTime; 

        const { x: deltaX, y: deltaY } = keyManager.getDelta();

        this.yaw = camera.rotation.y;
        this.pitch = camera.rotation.x;

        if (keyManager.isMousePressed()) {
            this.yaw -= deltaX * this.lookSpeed * deltaTime;
            this.pitch -= deltaY * this.lookSpeed * deltaTime;
        }

        const limit = Math.PI / 2 - 0.01;
        this.pitch = Math.max(-limit, Math.min(limit, this.pitch));

        camera.rotation.order = 'YXZ';
        camera.rotation.y = this.yaw;
        camera.rotation.x = this.pitch;

        const forward = new THREE.Vector3();
        const right = new THREE.Vector3();

        camera.getWorldDirection(forward);
        forward.normalize();
        right.crossVectors(forward, camera.up).normalize();

        if (keyManager.isKeyPressed('KeyW')) camera.position.addScaledVector(forward, moveSpeed);
        if (keyManager.isKeyPressed('KeyS')) camera.position.addScaledVector(forward, -moveSpeed);
        if (keyManager.isKeyPressed('KeyA')) camera.position.addScaledVector(right, -moveSpeed);
        if (keyManager.isKeyPressed('KeyD')) camera.position.addScaledVector(right, moveSpeed);
        if (keyManager.isKeyPressed('Space')) camera.position.y += moveSpeed;
        if (keyManager.isKeyPressed('ShiftLeft')) camera.position.y -= moveSpeed;
    }

    togglePointerLock() {
        const canvas = document.getElementById('canvas');
        if (document.pointerLockElement === canvas) {
            document.exitPointerLock();
        } else {
            canvas.requestPointerLock();
        }
    }
}

export { CameraManager };
