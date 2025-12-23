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
        this.useBVH = false;
        this.selected = null;
        this.originalMaterials = new Map();
        this.highlightColor = new THREE.Color('yellow');
        this.highlightIntensity = 0.8;
        this.originalRaycastingMethods = {
            mesh: THREE.Mesh.prototype.raycast,
            batchedMesh: THREE.BatchedMesh.prototype.raycast
        };
        this.meshes = [];
        this.isDebugEnabled = false;
        this.arrowHelpers = [];
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

    computeBVH(objects) {
        objects.forEach(object => {
            this.setupBVH(object);
        });
    }

    setupBVH(object) {
        if (!object) return;
        if (object.rootObject && !object.bvhSelectable) return;

        if (object.isMesh) {
            if (object.geometry && object.geometry.computeBoundsTree) {
                object.geometry.computeBoundsTree();
            }
            this.meshes.push(object);
        }
        else if (object.isBatchedMesh) {
            if (object.computeBoundsTree) {
                object.computeBoundsTree();
            }
            this.meshes.push(object);
        }
        else if (object.children && object.children.length > 0) {
            object.children.forEach(child => this.setupBVH(child));
        }
    }

    findRoot(object) {
        let current = object;
        while (current.parent && !current.rootObject) {
            current = current.parent;
        }
        return current;
    }

    /**
     * ✨ NEW: Safe material cloning that handles custom shaders
     */
    cloneMaterialSafely(material) {
        // Check if material has custom shader from onBeforeCompile
        const hasCustomShader = material.userData.shader !== undefined;
        
        if (hasCustomShader) {
            // For materials with custom shaders, create a new material with same base properties
            // but DON'T use .clone() to avoid shader serialization issues
            const newMaterial = new THREE.MeshPhongMaterial({
                color: material.color ? material.color.clone() : new THREE.Color(0xffffff),
                emissive: material.emissive ? material.emissive.clone() : new THREE.Color(0x000000),
                emissiveIntensity: material.emissiveIntensity || 0,
                specular: material.specular ? material.specular.clone() : new THREE.Color(0x111111),
                shininess: material.shininess || 30,
                map: material.map,
                normalMap: material.normalMap,
                flatShading: material.flatShading,
                side: material.side,
                transparent: material.transparent,
                opacity: material.opacity,
                // Copy the onBeforeCompile function
                onBeforeCompile: material.onBeforeCompile
            });
            
            return newMaterial;
        } else {
            // Safe to use regular clone for materials without custom shaders
            return material.clone();
        }
    }

    /**
     * ✨ UPDATED: Change color with safe material cloning
     */
    changeColorRecursive(object, color) {
        if (object.isMesh && object.material) {
            // Store original if not already stored
            if (!this.originalMaterials.has(object.uuid)) {
                this.originalMaterials.set(object.uuid, {
                    material: object.material
                });
            }

            // Clone material safely
            object.material = this.cloneMaterialSafely(object.material);
            
            // Change color
            if (object.material.color) {
                object.material.color.set(color);
            }
            if (object.material.emissive) {
                object.material.emissive.set(color);
                object.material.emissiveIntensity = this.highlightIntensity;
            }
            
            object.material.needsUpdate = true;
        }

        if (object.children) {
            object.children.forEach(child => this.changeColorRecursive(child, color));
        }
    }

    /**
     * ✨ FIXED: Restore original materials and dispose clones
     */
    restoreOriginalColors(object) {
        if (object.isMesh && object.material) {
            const stored = this.originalMaterials.get(object.uuid);
            if (stored) {
                // Dispose the cloned material to free memory
                if (object.material !== stored.material) {
                    object.material.dispose();
                }
                
                // Restore original material
                object.material = stored.material;
                
                // Clean up stored data
                this.originalMaterials.delete(object.uuid);
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

        const ndc = {
            x: (mouse.x / window.innerWidth) * 2 - 1,
            y: -(mouse.y / window.innerHeight) * 2 + 1
        };

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(ndc, camera);
        raycaster.firstHitOnly = true;

        const intersects = raycaster.intersectObjects(this.meshes, true);

        if (intersects.length > 0) {
            const picked = intersects[0].object;
            
            // Handle collision meshes
            let targetObject = picked;
            if (picked.userData.isCollisionMesh && picked.userData.visualMesh) {
                targetObject = picked.userData.visualMesh;
            }
            
            const root = this.findRoot(targetObject);
            if (root.bvhSelectable) {
                this.selectObject(root);
            }
        } else {
            this.selectObject(null);
        }
    }

    /**
     * ✨ FIXED: Proper deselect logic
     */
    selectObject(object) {
        // Clicking on nothing - deselect
        if (!object) {
            if (this.selected) {
                this.restoreOriginalColors(this.selected);
                this.selected = null;
            }
            return;
        }

        // Clicking same object - toggle off (deselect)
        if (this.selected === object) {
            this.restoreOriginalColors(this.selected);
            this.selected = null;
            return;
        }

        // Clicking different object - switch selection
        if (this.selected && this.selected !== object) {
            this.restoreOriginalColors(this.selected);
        }

        // Select new object
        this.changeColorRecursive(object, this.highlightColor);
        this.selected = object;
    }

    checkBoidCollisions(origin, direction, maxDistance, numRays = 5, spreadAngle = Math.PI / 6) {
        if (!this.useBVH) return [];

        const raycaster = new THREE.Raycaster();
        raycaster.far = maxDistance;
        raycaster.firstHitOnly = true;

        const objectsHit = new Set();

        const forward = direction.clone().normalize();
        const up = Math.abs(forward.y) < 0.99 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
        const right = new THREE.Vector3().crossVectors(forward, up).normalize();
        const actualUp = new THREE.Vector3().crossVectors(right, forward).normalize();

        const rayDirections = [];

        if (numRays === 1) {
            rayDirections.push(forward.clone());
        } else {
            rayDirections.push(forward.clone());
            const angleStep = (Math.PI * 2) / (numRays - 1);
            for (let i = 0; i < numRays - 1; i++) {
                const angle = angleStep * i;
                const offsetRight = Math.cos(angle) * Math.sin(spreadAngle);
                const offsetUp = Math.sin(angle) * Math.sin(spreadAngle);
                const offsetForward = Math.cos(spreadAngle);

                const rayDir = new THREE.Vector3()
                    .addScaledVector(forward, offsetForward)
                    .addScaledVector(right, offsetRight)
                    .addScaledVector(actualUp, offsetUp)
                    .normalize();

                rayDirections.push(rayDir);
            }
        }

        if (this.isDebugEnabled) {
            this.updateDebugVisuals(origin, rayDirections, maxDistance);
        }

        for (let i = 0; i < rayDirections.length; i++) {
            raycaster.set(origin, rayDirections[i]);
            const intersects = raycaster.intersectObjects(this.meshes, true);

            if (intersects.length > 0) {
                const hit = intersects[0];
                const root = this.findRoot(hit.object);
                
                objectsHit.add(root);
                
                if (this.isDebugEnabled && this.arrowHelpers[i]) {
                    this.arrowHelpers[i].setColor(0xff0000); 
                }
            }
        }

        return objectsHit;
    }

    setDebug(enabled) {
        this.isDebugEnabled = enabled;
        if (this.debugGroup) {
            this.debugGroup.visible = enabled;
        }
        if (!enabled) {
            this.arrowHelpers.forEach(helper => {
                if (this.debugGroup) {
                    this.debugGroup.remove(helper);
                }
                helper.dispose();
            });
            this.arrowHelpers = [];
        }
    }

    updateDebugVisuals(origin, directions, length) {
        if (!this.debugGroup) return;
        
        while (this.arrowHelpers.length < directions.length) {
            const arrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), origin, length, 0x00ff00);
            this.arrowHelpers.push(arrow);
            this.debugGroup.add(arrow);
        }

        for (let i = directions.length; i < this.arrowHelpers.length; i++) {
            this.arrowHelpers[i].visible = false;
        }

        for (let i = 0; i < directions.length; i++) {
            const arrow = this.arrowHelpers[i];
            arrow.visible = true;
            arrow.position.copy(origin);
            arrow.setDirection(directions[i]);
            arrow.setLength(length);
            arrow.setColor(0x00ff00); 
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