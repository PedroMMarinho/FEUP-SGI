import * as THREE from 'three';
import { BubbleGroup } from './bubble/BubbleGroup.js';
import { RockGroup } from './rock/RockGroup.js';
import { CoralGroup } from './coral/CoralGroup.js';
import { FishGroup } from './fish/FishGroup.js';
import { Shark } from './shark/Shark.js';
import { TerrainSegment } from './terrainSegment/TerrainSegment.js';

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

        this.objects = [];
        this.init();
    }

    addToAquarium(object) {
        this.objects.push(object);
        this.add(object);
    }

    createAquariumGeometry() {
        const geometry = new THREE.BoxGeometry(this.width, this.height, this.depth);
        const material = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, opacity: 0.5, transparent: true, side: THREE.DoubleSide });
        const aquariumMesh = new THREE.Mesh(geometry, material);
        this.addToAquarium(aquariumMesh);
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
        // create shark
        this.createShark();
    }

    createBubbles() {
        const bubbleGroup = new BubbleGroup(10);
        this.addToAquarium(bubbleGroup);
    }


    createRocks() {
        const rockGroup = new RockGroup(80);
        this.addToAquarium(rockGroup);
    }

    createTerrainSegments() {
        const terrainGroup = new TerrainSegment(100,100);
        this.addToAquarium(terrainGroup);
    }

	createCorals() {
		const coralGroup = new CoralGroup(40);
		this.addToAquarium(coralGroup);
	}

	createFishes() {
		const fishGroup = new FishGroup(35);
		this.addToAquarium(fishGroup);
	}

    createShark() {
        const shark = new Shark('./assets/models/shark-grey.glb', this);
        shark.position.set(0, 10, 0);
        this.addToAquarium(shark);
    }

    update() {
        for (const obj of this.objects) {
            if (obj.update) obj.update();
        }
    }

}

export { Aquarium };
