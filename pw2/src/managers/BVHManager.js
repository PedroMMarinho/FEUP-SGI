import * as THREE from 'three';
import {
    computeBoundsTree, disposeBoundsTree,
    computeBatchedBoundsTree, disposeBatchedBoundsTree, acceleratedRaycast,
} from 'three-mesh-bvh';

class BVHManager {
    constructor(scene, keyManager, cameraManager) {
        this.scene = scene;
        this.keyManager = keyManager;
        this.cameraManager = cameraManager;
        this.useBVH = true;
        this.selected = null;
        this.highlightMaterial = new THREE.MeshBasicMaterial({ color: 'yellow' });

        this.init();
    }


    init() {
        THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
        THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
        THREE.Mesh.prototype.raycast = acceleratedRaycast;

        THREE.BatchedMesh.prototype.computeBoundsTree = computeBatchedBoundsTree;
        THREE.BatchedMesh.prototype.disposeBoundsTree = disposeBatchedBoundsTree;
        THREE.BatchedMesh.prototype.raycast = acceleratedRaycast;
    }
    // TODO baddly registering the objects
    setupBVH(object) {
        if (!object) return;

        // Handle regular Mesh
        if (object.isMesh) {
            if (object.geometry && object.geometry.computeBoundsTree) {
                object.geometry.computeBoundsTree();
            }
        }

        // Handle BatchedMesh
        else if (object.isBatchedMesh) {
            if (object.computeBoundsTree) {
                object.computeBoundsTree();
            }
        }

        // Handle Groups or any Object3D with children
        else if (object.children && object.children.length > 0) {
            object.children.forEach(child => this.setupBVH(child));
        }
    }
    // TOOD check if its correct
    raycastSelect() {
        if (!this.keyManager.isMousePressed()) return;

        const mouse = this.keyManager.getMousePos();
        const camera = this.cameraManager.getActiveCamera();

        // convert to NDC
        const ndc = {
            x: (mouse.x / window.innerWidth) * 2 - 1,
            y: -(mouse.y / window.innerHeight) * 2 + 1
        };

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(ndc, camera);

        // collect all meshes recursively
        const meshes = [];
        const collectMeshes = (obj) => {
            if (obj.isMesh) meshes.push(obj);
            if (obj.children) obj.children.forEach(collectMeshes);
        };
        collectMeshes(this.scene);

        const intersects = raycaster.intersectObjects(meshes, true);

        if (intersects.length > 0) {
            const picked = intersects[0].object;
            this.selectObject(picked);
        } else {
            this.selectObject(null);
        }
    }

    // TODO check if its correct
    selectObject(object) {
    if (this.selected === object) return;

        // restore previous
        if (this.selected) {
            this.selected.material.color = this.selected.userData.originalMaterial.color;
        }

        if (object) {
            if (!object.userData.originalMaterial) {
                object.userData.originalMaterial = object.material;
            }
            object.material.color = this.highlightMaterial.color;
        }

        this.selected = object;
    }


    toggleBVH(enabled) {
        this.useBVH = enabled;
    }

}

export { BVHManager };