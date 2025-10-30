import * as THREE from 'three';
import { BubbleGroup } from './bubble/BubbleGroup.js';
import { RockGroup } from './rock/RockGroup.js';
import { CoralGroup } from './coral/CoralGroup.js';
import { FishGroup } from './fish/FishGroup.js';
import { TerrainSegment } from './terrainSegment/TerrainSegment.js';
import { SharkLOD } from './shark/SharkLOD.js';
import { Submarine } from './submarine/Submarine.js';

/**
 * Main Aquarium class
 */
class Aquarium extends THREE.Object3D {
    constructor(assetManager, keyManager) {
        super();
        this.assetManager = assetManager;
        this.keyManager = keyManager;
        // Load aquarium features
        this.width = 1000;
        this.height = 1000;
        this.depth = 1000;

        this.objects = [];
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
        ////create terrain
        //this.createTerrainSegments();
        //// Create bubbles
        //this.createBubbles();
        //// create rocks
        //this.createRocks();
		//// create corals
		//this.createCorals();
		//// create fishes
		//this.createFishes();
        //// create shark
        this.createShark();
        // create submarine
        this.createSubmarine();
    }

    createBubbles() {
        const bubbleGroup = new BubbleGroup(10);
        this.addToAquarium(bubbleGroup);
    }


    createRocks() {
        const rockGroup = new RockGroup(180, this.terrainWidth, this.terrainHeight);
        this.addToAquarium(rockGroup);
    }

    createTerrainSegments() {
        this.terrainWidth = 100;
        this.terrainHeight = 100;
        const terrainGroup = new TerrainSegment(this.terrainWidth, this.terrainHeight);
        this.addToAquarium(terrainGroup);
    }

	createCorals() {
		const coralGroup = new CoralGroup(40, this.terrainWidth/2, this.terrainHeight/2);
		this.addToAquarium(coralGroup);
	}

	createFishes() {
		const fishGroup = new FishGroup(30);
		this.addToAquarium(fishGroup);
	}

    createShark() {
        const sharks = new SharkLOD('grey-shark', this.assetManager.getBlenderManager().getAllLODs('grey-shark'));
        this.addToAquarium(sharks);
        

    }
    createSubmarine() {
        this.submarine = new Submarine(this.assetManager.getBlenderManager().getAllLODs('propeller-blade')[0],this.keyManager);
        this.submarine.position.set(0, 0, 0);
        this.addToAquarium(this.submarine);
    }

    update() {
        for (const obj of this.objects) {
            if (obj.updateState) obj.updateState();
        }
    }

}

export { Aquarium };
