import * as THREE from 'three';
import { Coral } from "./Coral.js";

class CoralGroup extends THREE.Object3D {
	constructor(count = 40, spreadX = 15, spreadZ = 15) {
		super();

		if (count <= 0) {
			console.warn("CoralGroup: count must be > 0");
			return;
		}

		this.type = "Group";
		this.count = count;
		this.corals = [];

        this.spreadX = spreadX;
        this.spreadZ = spreadZ;

		this.init();
	}

    init() {
        const coralTemplate = new Coral();

        const dummy = new THREE.Object3D();

        for (let i = 0; i < this.count; i++) {
            const position = new THREE.Vector3(
                THREE.MathUtils.randFloatSpread(this.spreadX),
                0,
                THREE.MathUtils.randFloatSpread(this.spreadZ)
            );

            const coral = coralTemplate.clone(true);
            coral.position.copy(position);
            coral.traverse((child) => {
                if (child.isInstancedMesh) child.instanceMatrix.needsUpdate = true;
            });
            this.add(coral);
            this.corals.push({ position, object: coral });
        }
    }

	update() {
		// Static for now
	}
}

CoralGroup.prototype.isGroup = true;

export { CoralGroup };
