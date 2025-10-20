import * as THREE from 'three';
import { Coral } from "./Coral.js";

class CoralGroup extends THREE.Object3D {
	constructor(count = 40) {
		super();

		if (count <= 0) {
			console.warn("CoralGroup: count must be > 0");
			return;
		}

		this.type = "Group";
		this.count = count;
		this.corals = [];

		this.init();
	}

    init() {
        // create one template group (Coral returns a Group)
        const coralTemplate = new Coral();

        const dummy = new THREE.Object3D();

        for (let i = 0; i < this.count; i++) {
            // Random position
            const position = new THREE.Vector3(
                THREE.MathUtils.randFloatSpread(15),
                THREE.MathUtils.randFloat(-2, -1.9),
                THREE.MathUtils.randFloatSpread(15)
            );

            // clone the template group (deep clone)
            const coral = coralTemplate.clone(true);
            coral.position.copy(position);
            // if the template uses InstancedMesh, ensure instanceMatrix updates are kept:
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
