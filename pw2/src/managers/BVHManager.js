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
        this.originalMaterials = new Map(); 
        this.highlightColor = 'yellow';
        this.originalRaycastingMethods = {
            mesh: THREE.Mesh.prototype.raycast,
            batchedMesh: THREE.BatchedMesh.prototype.raycast
        };

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

    // Find the root parent of an object by checking rootObject property
    findRoot(object) {
        let current = object;
        while (current.parent && !current.rootObject) {
            current = current.parent;
        }
        return current;
    }

    // Store original materials recursively
    storeOriginalMaterials(object) {
        if (object.isMesh && object.material) {
            if (!this.originalMaterials.has(object.uuid)) {
                this.originalMaterials.set(object.uuid, {
                    material: object.material,
                    color: object.material.color ? object.material.color.clone() : null
                });
            }
        }

        if (object.children) {
            object.children.forEach(child => this.storeOriginalMaterials(child));
        }
    }

    // Change color of all meshes in an object hierarchy
    changeColorRecursive(object, color) {
        if (object.isMesh && object.material) {
            // Store original if not already stored
            if (!this.originalMaterials.has(object.uuid)) {
                this.originalMaterials.set(object.uuid, {
                    material: object.material,
                    color: object.material.color ? object.material.color.clone() : null
                });
            }

            // Clone material and change color
            object.material = object.material.clone();
            if (object.material.color) {
                object.material.color.set(color);
            }
        }

        if (object.children) {
            object.children.forEach(child => this.changeColorRecursive(child, color));
        }
    }

    // Restore original colors recursively
    restoreOriginalColors(object) {
        if (object.isMesh && object.material) {
            const stored = this.originalMaterials.get(object.uuid);
            if (stored) {
                object.material = stored.material;
            }
        }

        if (object.children) {
            object.children.forEach(child => this.restoreOriginalColors(child));
        }
    }

    raycastSelect() {
        if (!this.keyManager.isMouseDownThisFrame()) return;

        const mouse = this.keyManager.getMousePos();
        const camera = this.cameraManager.getActiveCamera();

        // convert to NDC
        const ndc = {
            x: (mouse.x / window.innerWidth) * 2 - 1,
            y: -(mouse.y / window.innerHeight) * 2 + 1
        };

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(ndc, camera);
        raycaster.firstHitOnly = true;

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
            const root = this.findRoot(picked);
            if (root.bvhSelectable) this.selectObject(root);
        } else {
            this.selectObject(null);
        }
    }

    selectObject(object) {
        // If clicking same object or null, deselect
        if (!object || this.selected === object) {
            if (this.selected) {
                this.restoreOriginalColors(this.selected);
            }
            this.selected = null;
            return;
        }

        // Restore previous selection
        if (this.selected && this.selected !== object) {
            this.restoreOriginalColors(this.selected);
        }

        // Select new object
        if (this.selected !== object) {
            this.changeColorRecursive(object, this.highlightColor);
            this.selected = object;
        }
    }

    toggleBVH(enabled) {
        this.useBVH = enabled;

        if (this.useBVH) {
            THREE.Mesh.prototype.raycast = acceleratedRaycast;
            THREE.BatchedMesh.prototype.raycast = acceleratedRaycast;
        } else {
            THREE.Mesh.prototype.raycast = this.originalRaycastingMethods.mesh;
            THREE.BatchedMesh.prototype.raycast = this.originalRaycastingMethods.batchedMesh;
        }
    }

    isUsingBVH() {
        return this.useBVH;
    }
}

export { BVHManager };