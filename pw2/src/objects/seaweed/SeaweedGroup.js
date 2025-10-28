import * as THREE from 'three';
import { SeaweedLOD } from "./SeaweedLOD.js";

class SeaweedGroup extends THREE.Object3D {
    constructor(count = 40, spreadX = 15, spreadZ = 15) {
        super();

        if (count <= 0) {
            console.warn("SeaweedGroup: count must be > 0");
            return;
        }

        this.type = "Group";
        this.count = count;
        this.seaweeds = [];

        this.spreadX = spreadX;
        this.spreadZ = spreadZ;

        this.init();
    }

    init() {
        const seaweedTemplate = new SeaweedLOD();

        const dummy = new THREE.Object3D();

        for (let i = 0; i < this.count; i++) {
            const position = new THREE.Vector3(
                THREE.MathUtils.randFloatSpread(this.spreadX),
                0,
                THREE.MathUtils.randFloatSpread(this.spreadZ)
            );

            const seaweed = seaweedTemplate.clone(true);
            seaweed.position.copy(position);
            seaweed.traverse((child) => {
                if (child.isInstancedMesh) child.instanceMatrix.needsUpdate = true;
            });
            this.add(seaweed);
            this.seaweeds.push({ position, object: seaweed });
        }
    }

    update() {
        // Static for now
    }
}

SeaweedGroup.prototype.isGroup = true;

export { SeaweedGroup };
