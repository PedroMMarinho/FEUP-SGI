import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TimeManager } from './TimeManager.js';
import { PeriscopeHUDType } from '../enums/PeriscopeHUDType.js';

class CameraManager {
    constructor(aspect, keyManager, frustumSize = 20, passManager) {
        this.keyManager = keyManager;
        this.aspect = aspect;
        this.frustumSize = frustumSize;
        this.cameras = {};
        this.activeCameraName = null;
        this.lastCameraName = null;
        this.cameraSelection = "Free Fly";
        this.controls = null;
        this.passManager = passManager;

        this.moveSpeed = 6; 
        this.lookSpeed = 0.5; 

        this.yaw = 0;
        this.pitch = 0;

        this.timeManager = TimeManager.getInstance();
        this.globalTime = this.timeManager.getElapsedTime();

        // Orthographic parameters
        this.left = -frustumSize / 2 * aspect;
        this.right = frustumSize / 2 * aspect;
        this.top = frustumSize / 2;
        this.bottom = -frustumSize / 2;
        this.near = -frustumSize / 2;
        this.far = frustumSize;
        this.canvasDiv = document.getElementById('canvas');    

        // Special Cameras
        this.targetFish = null;
        this.targetTelevision = null;
        this.aquariumHeight = null;
        this.sunkenShip = null;
    }

    setAquariumHeight(height){
        this.aquariumHeight = height;
    }

    setTargetShip(shipObject) {
        this.sunkenShip = shipObject;
    }

    setTargetTV(tv){
        this.targetTelevision = tv;
    }

    init() {
        const perspective = new THREE.PerspectiveCamera(75, this.aspect, 0.1, 1000);
        perspective.position.set(10, 10, 3);
        this.cameras['Free Fly'] = perspective;

        const aquariumCam = new THREE.PerspectiveCamera(60, this.aspect, 0.1, 2000);
        this.cameras['Aquarium View'] = aquariumCam;

        const UnderwaterCam = new THREE.PerspectiveCamera(75, this.aspect, 0.1, 1000);
        UnderwaterCam.position.set(0, 2, 5);
        this.cameras['Ship View'] = UnderwaterCam;

        const submarineCam = new THREE.PerspectiveCamera(100, this.aspect, 0.1, 1000);
        this.cameras['Submarine View'] = submarineCam;

        const fishCam = new THREE.PerspectiveCamera(90, this.aspect, 0.1, 1000);
        this.cameras['Fish View'] = fishCam;

        const tvSize = 5;
        const tvCam = new THREE.OrthographicCamera(
            -tvSize * this.aspect / 2,  
             tvSize * this.aspect / 2,  
             tvSize / 2,               
            -tvSize / 2,                
             0.01,                       
             50                         
        );
        this.cameras['TV View'] = tvCam;

        this.setActiveCamera('Free Fly');
    }

    setTargetFish(fishObject) {
        this.targetFish = fishObject;
    }

    setActiveCamera(name) {
        if (this.activeCameraName === name) return;
        const previous = this.activeCameraName;
        this.lastCameraName = previous;
        this.activeCameraName = name;
        this.activeCamera = this.cameras[name];
        this.passManager.updateCamera(this.activeCamera);
        this.changeCamera(previous, name);
    }

    getActiveCamera() {
        return this.activeCamera;
    }

    getCameraByName(cameraName){
        return this.cameras[cameraName];
    }

    update(renderer, submarine) {
        const deltaTime = this.timeManager.getElapsedTime() - this.globalTime;
        this.globalTime += deltaTime;

        if (this.activeCameraName === 'Ship View' && !this.controls) {
            this.controls = new OrbitControls(this.activeCamera, renderer.domElement);
            if (this.sunkenShip) {
                this.controls.target.copy(this.sunkenShip.position);
            } else {
                this.controls.target.set(0, 1, 0);
            }            
            this.controls.enableZoom = true;
            this.controls.enablePan = false;
            this.controls.update();
        } else if (this.activeCameraName !== 'Ship View') {
            if (this.controls) {
                this.controls.dispose();
                this.controls = null;
            }
        }

        if (this.controls) this.controls.update();
        if (this.activeCameraName === 'Free Fly') this.updateFreeFly(deltaTime);
        if (this.activeCameraName === 'Submarine View') this.updateSubmarineView(submarine);
        if (this.activeCameraName === 'Fish View') this.updateFishView();
        if (this.activeCameraName === 'TV View') this.updateTVView();
    }

    updateFishView() {
        if (!this.targetFish) return;

        const camera = this.cameras['Fish View'];
        const fish = this.targetFish;

        camera.position.copy(fish.position);
        
        camera.quaternion.copy(fish.quaternion);

        camera.rotateY(Math.PI);
 
        camera.translateZ(1.5); 
        camera.translateY(1.0);

        camera.rotateX(-0.2); 
    }

    updateSubmarineView(submarine) {
        const camera = this.cameras['Submarine View'];

        const position = submarine.getSubmarineCameraPosition();
        camera.position.copy(position);

        const orientation = submarine.getSubmarineOrientation();    
        const lookAt = new THREE.Vector3().addVectors(position, orientation.forward);
        camera.lookAt(lookAt);

    }

    updateTVView() {
        if (!this.targetTelevision) return;

        const camera = this.cameras['TV View'];
        const tv = this.targetTelevision;
        camera.position.copy(tv.position);
        
        camera.quaternion.copy(tv.quaternion);
        camera.translateY(1.2);
        camera.translateZ(-1);

        camera.lookAt(tv.position);
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
            cam.position.set(-50, this.aquariumHeight + 10, -50);
            cam.lookAt(8, 0, 8);
        }

        if (newName === 'Ship View' && this.sunkenShip) {
            const cam = this.cameras['Ship View'];
            cam.position.copy(this.sunkenShip.position);
            cam.position.y += 15; 
            cam.position.z += 5;  
            cam.lookAt(this.sunkenShip.position);
        }

        if (newName === 'Submarine View') {
            this.passManager.setHUDType(this.passManager.currentPeriscopeHUD, newName);
        } else if (newName === 'Free Fly') {
            // CleanUp lingering submarine HUD
            this.passManager.setHUDType(PeriscopeHUDType.VIEW, 'Submarine View');
            this.passManager.togglePass('bokeh', true);
        }else {
            this.passManager.setHUDType(PeriscopeHUDType.VIEW, 'Submarine View');
        }


    }

    updateFreeFly(deltaTime) {
        const keyManager = this.keyManager;
        const camera = this.activeCamera;
        const moveSpeed = this.moveSpeed * deltaTime; 

        const { x: deltaX, y: deltaY } = keyManager.getDelta();

        this.yaw = camera.rotation.y;
        this.pitch = camera.rotation.x;

        if (keyManager.isMouseHeld()) {
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
