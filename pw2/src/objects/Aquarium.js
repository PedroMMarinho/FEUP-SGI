import * as THREE from 'three';
import { BubbleGroup } from './bubble/BubbleGroup.js';
import { RockGroup } from './rock/RockGroup.js';
import { TerrainGroup } from './terrainSegment/TerrainGroup.js';
import { CoralGroup } from './coral/CoralGroup.js';
import { FishGroup } from './fish/FishGroup.js';

/**
 * Main Aquarium class
 */
class Aquarium extends THREE.Object3D {
    constructor() {
        super();
        // Load aquarium features
        this.width = 1000;
        this.height = 1000;
        this.depth = 1000;

        this.init();
    }

    createAquariumGeometry() {
        const geometry = new THREE.BoxGeometry(this.width, this.height, this.depth);
        const material = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, opacity: 0.5, transparent: true, side: THREE.DoubleSide });
        const aquariumMesh = new THREE.Mesh(geometry, material);
        this.add(aquariumMesh);
    }

    /**
     * Initializes and adds all aquarium elements
     */
    init() {
        // Create aquarium geometry and material
        this.createAquariumGeometry();
        // Create bubbles
        this.createBubbles();
        // create rocks
        this.createRocks();
        // create terrain
        this.createTerrainSegments();
		// create corals
		this.createCorals();
		// create fishes
		this.createFishes();
    }

    createBubbles() {
        const bubbleGroup = new BubbleGroup(10);
        this.add(bubbleGroup);
    }


    createRocks() {
        const rockGroup = new RockGroup(80);
        this.add(rockGroup);
    }

    createTerrainSegments() {
        const terrainGroup = new TerrainGroup(100);
        this.add(terrainGroup);
    }

	createCorals() {
		const coralGroup = new CoralGroup(40);
		this.add(coralGroup);
	}

	createFishes() {
		const fishGroup = new FishGroup(35);
		this.add(fishGroup);
	}

}

export { Aquarium };
