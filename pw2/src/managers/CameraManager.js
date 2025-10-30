import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

class CameraManager {
    constructor(aspect, keyManager, frustumSize = 20) {

        this.keyManager = keyManager;
        console.log(this.keyManager);
        this.aspect = aspect;
        this.frustumSize = frustumSize;
        this.cameras = {};
        this.activeCameraName = null;
        this.lastCameraName = null;
        this.cameraSelection = "Free Fly"; // default selection
        this.controls = null;

        this.moveSpeed = 0.2;
        this.lookSpeed = 0.01;

        this.yaw = 0;
        this.pitch = 0;

        this.freeFlyActive = false;


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
        const UnderwaterCam = new THREE.PerspectiveCamera(75, this.aspect, 0.1, 1000);
        UnderwaterCam.position.set(0, 2, 5);
        this.cameras['Underwater View'] = UnderwaterCam;

        const submarineCam = new THREE.PerspectiveCamera(75, this.aspect, 0.1, 1000);
        this.cameras['Submarine View'] = submarineCam;

        this.setActiveCamera('Free Fly');
    }

    setActiveCamera(name) {
        console.log("setActiveCamera: " + name);
        console.log("active camera" + this.activeCameraName);
        if (this.activeCameraName === name) return;
        console.log("Changing active camera to: " + name);
        console.log("previous camera was: " + this.lastCameraName);

        const previous = this.activeCameraName; // could be null

        this.lastCameraName = previous;

        console.log(this.lastCameraName);

        this.activeCameraName = name;
        this.activeCamera = this.cameras[name];

        console.log(`Active camera set to: ${name}`);
        console.log("previous camera was: " + previous);

        this.changeCamera(previous, name);
    }


    getActiveCamera() {
        return this.activeCamera;
    }

    update(renderer, submarine) {
        if (this.activeCameraName === 'Underwater View' && !this.controls) {
            this.controls = new OrbitControls(this.activeCamera, renderer.domElement);
            this.controls.target.set(0, 1, 0); // orbit around this point
            this.controls.enableZoom = true;
            this.controls.enablePan = false;
            this.controls.update(); // important!
        } else if (this.activeCameraName !== 'Underwater View') {
            if (this.controls) {
                this.controls.dispose();
                this.controls = null;
            }
        }

        if (this.controls) this.controls.update();
        if (this.activeCameraName === 'Free Fly') this.updateFreeFly();
        if (this.activeCameraName === 'Submarine View' && submarine) this.updateSubmarineFollow(submarine);
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
        // Aquarium is always static
        if (newName === 'Aquarium View') {
            console.log("Aquarium View here");
            const cam = this.cameras['Aquarium View'];
            cam.position.set(0, this.frustumSize / 4, this.frustumSize / 2);
            cam.lookAt(0, 10, 0);
        }

        // Free Fly resets
        if (oldName === 'Free Fly') {
            this.freeFlyActive = false;
        }

    }

    updateSubmarineFollow(submarine) {
        const camera = this.cameras['Submarine View'];

        const offset = new THREE.Vector3(0, 3, 12);

        const relativeOffset = offset.clone().applyMatrix4(submarine.matrixWorld);

        camera.position.lerp(relativeOffset, 0.1);

        const lookAtOffset = new THREE.Vector3(0, 1, -5).applyMatrix4(submarine.matrixWorld);
        camera.lookAt(lookAtOffset);
    }

    updateFreeFly() {

        const keyManager = this.keyManager;

        const camera = this.activeCamera;
        const moveSpeed = this.moveSpeed;

        const { x: deltaX, y: deltaY } = keyManager.getDelta();

        this.yaw = camera.rotation.y;
        this.pitch = camera.rotation.x;

        if (keyManager.isMousePressed()) {
            this.yaw -= deltaX * this.lookSpeed;
            this.pitch -= deltaY * this.lookSpeed;
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
