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
		this.sandSystem = null;
        this.useBVH = false;
        this.selected = null;
        this.originalMaterials = new Map();
        this.highlightColor = 'yellow';
        this.highlightIntensity = 0.8;
        this.originalRaycastingMethods = {
            mesh: THREE.Mesh.prototype.raycast,
            batchedMesh: THREE.BatchedMesh.prototype.raycast
        };
        this.meshes = [];
        // --- VISUALIZER STATE ---
        //this.debugGroup = new THREE.Group();
        //this.scene.add(this.debugGroup);
        this.isDebugEnabled = false;
        this.arrowHelpers = [];
        // ------------------------
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
        // Optimization: skip if rootObject but not selectable
        if (object.rootObject && !object.bvhSelectable) return;

        // Handle regular Mesh
        if (object.isMesh) {
            if (object.geometry && object.geometry.computeBoundsTree) {
                object.geometry.computeBoundsTree();
            }
            this.meshes.push(object);
        }

        // Handle BatchedMesh
        else if (object.isBatchedMesh) {
            if (object.computeBoundsTree) {
                object.computeBoundsTree();
            }
            this.meshes.push(object);
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

	// Find the parent of an object with a certain flag
	// WARNING: may return null!
	findAncestorWithFlag(object, flag) {
		let current = object;
		while (current) {
			if (current[flag]) return current;
			current = current.parent;
		}
		return null;
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
            if (object.material.emissive) {
                object.material.emissive.set(color);
                
                object.material.emissiveIntensity = this.highlightIntensity; 
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


        const intersects = raycaster.intersectObjects(this.meshes, true);

        if (intersects.length > 0) {
			const hit = intersects[0];
            const picked = hit.object;
			const seabed = this.findAncestorWithFlag(picked, 'isSeabed');
			if (seabed ) {
                const { _ , inRiftZone }= seabed.getHeightAt(hit.point.x, hit.point.z);
                if (!inRiftZone){
                    const normal = hit.face.normal
					.clone()
					.transformDirection(picked.matrixWorld);

				this.spawnSandPuff(hit.point, normal);
				return;
                }

			}
			const root = this.findRoot(picked);	
            if (root.bvhSelectable) this.selectObject(root);
        } else {
            this.selectObject(null);
        }
    }

	spawnSandPuff(pt, normal) {
		if (this.sandSystem != null) {
			console.log("emitting sand puff!!")
			this.sandSystem.emitPuff({
				position: pt,
				normal: normal
			});
		}
	}

	attachSandSystem(sandsystem) {
		this.sandSystem = sandsystem;
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

    checkBoidCollisions(origin, direction, maxDistance, numRays = 5, spreadAngle = Math.PI / 6) {
        if (!this.useBVH) return [];

        const raycaster = new THREE.Raycaster();
        raycaster.far = maxDistance;
        raycaster.firstHitOnly = true;

        const objectsHit = new Set();

        // 1. Calculate Basis Vectors
        const forward = direction.clone().normalize();
        const up = Math.abs(forward.y) < 0.99 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
        const right = new THREE.Vector3().crossVectors(forward, up).normalize();
        const actualUp = new THREE.Vector3().crossVectors(right, forward).normalize();

        const rayDirections = [];

        // 2. Generate Ray Directions
        if (numRays === 1) {
            rayDirections.push(forward.clone());
        } else {
            rayDirections.push(forward.clone()); // Center ray
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

        // --- UPDATE VISUALIZER IF ENABLED ---
        if (this.isDebugEnabled) {
            this.updateDebugVisuals(origin, rayDirections, maxDistance);
        }
        // ------------------------------------

        // 3. Cast Rays
        for (let i = 0; i < rayDirections.length; i++) {
            raycaster.set(origin, rayDirections[i]);
            const intersects = raycaster.intersectObjects(this.meshes, true);

            if (intersects.length > 0) {
                const hit = intersects[0];
                const root = this.findRoot(hit.object);
				objectsHit.add(root);
                 
                // Optional: Color the hit ray red in debug mode
                if (this.isDebugEnabled && this.arrowHelpers[i]) {
                    this.arrowHelpers[i].setColor(0xff0000); 
                }
            }
        }

        return objectsHit;
    }

    // --- NEW VISUALIZER METHODS ---

    setDebug(enabled) {
        this.isDebugEnabled = enabled;
        this.debugGroup.visible = enabled;
        if (!enabled) {
             // Clean up visuals when disabled to save performance
             this.arrowHelpers.forEach(helper => {
                 this.debugGroup.remove(helper);
                 helper.dispose(); // Important for memory
             });
             this.arrowHelpers = [];
        }
    }

    updateDebugVisuals(origin, directions, length) {
        // 1. Ensure we have enough arrow helpers
        while (this.arrowHelpers.length < directions.length) {
            const arrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), origin, length, 0x00ff00);
            this.arrowHelpers.push(arrow);
            this.debugGroup.add(arrow);
        }

        // 2. Hide unused helpers if we have too many
        for (let i = directions.length; i < this.arrowHelpers.length; i++) {
            this.arrowHelpers[i].visible = false;
        }

        // 3. Update positions and directions
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
