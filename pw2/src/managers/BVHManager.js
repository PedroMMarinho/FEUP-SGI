import * as THREE from 'three';
import { MeshBVH } from 'three-mesh-bvh';

class BVHManager {
    constructor(scene) {
        this.scene = scene;
        this.entities = [];
        this.useBVH = true;
    }

    register(object) {
        this.entities.push(object);
        this.buildBVH(object);
    }

    buildBVH(object) {
        if (!object.geometry) return;

        // Important: geometry must be indexed!
        object.geometry.computeBoundsTree = MeshBVH;
        object.geometry.boundsTree = new MeshBVH(object.geometry);
    }

    toggleBVH(enabled) {
        this.useBVH = enabled;
    }

    getNeighbors(entity, radius) {
        if (!this.useBVH) return null;

        const neighbors = [];
        const sphere = new THREE.Sphere(entity.position, radius);

        for (const obj of this.entities) {
            if (obj !== entity && obj.geometry?.boundsTree) {
                obj.geometry.boundsTree.shapecast({
                    intersectsBounds: (box) => box.intersectsSphere(sphere),
                    intersectsTriangle: () => {
                        neighbors.push(obj);
                        return true;
                    }
                });
            }
        }

        return neighbors;
    }

    raycast(raycaster) {
        if (!this.useBVH) return null;

        let closest = null;
        let minDist = Infinity;

        for (const obj of this.entities) {
            const hits = raycaster.intersectObject(obj, true);
            if (hits.length > 0 && hits[0].distance < minDist) {
                closest = obj;
                minDist = hits[0].distance;
            }
        }

        return closest;
    }
}

export { BVHManager };
