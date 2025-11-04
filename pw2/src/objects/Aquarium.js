import * as THREE from 'three';
import { BubbleGroup } from './bubble/BubbleGroup.js';
import { RockGroup } from './rock/RockGroup.js';
import { CoralGroup } from './coral/CoralGroup.js';
import { FishGroup } from './fish/FishGroup.js';
import { TerrainSegment } from './terrainSegment/TerrainSegment.js';
import { SharkLOD } from './shark/SharkLOD.js';
import { SubmarineLOD } from './submarine/SubmarineLOD.js';

/**
 * Main Aquarium class
 */
class Aquarium extends THREE.Object3D {
    constructor(assetManager, keyManager, cameraManager) {
        super();
        this.assetManager = assetManager;
        this.keyManager = keyManager;
        this.cameraManager = cameraManager;
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
        //create terrain
        this.createTerrainSegments();
        // Create bubbles
        this.createBubbles();
        // create rocks
        this.createRocks();
		// create corals
		this.createCorals();
		// create fishes
		this.createFishes();
        // create shark
        this.createShark();
        // create submarine
        this.createSubmarine();
    }

    createBubbles() {
        const bubbleGroup = new BubbleGroup(10);
        this.addToAquarium(bubbleGroup);
    }


    createRocks() {
        const rockGroup = new RockGroup(1500, this.terrainWidth, this.terrainHeight);
        this.addToAquarium(rockGroup);
    }

    createTerrainSegments() {
        this.terrainWidth = 300;
        this.terrainHeight = 300;
        const terrainGroup = new TerrainSegment(this.terrainWidth, this.terrainHeight);
        this.addToAquarium(terrainGroup);
    }

	createCorals() {
		const coralGroup = new CoralGroup(100, this.terrainWidth/2, this.terrainHeight/2);
		this.addToAquarium(coralGroup);
	}

	createFishes() {
        this.fishGroups = [
            new FishGroup(20),
            new FishGroup(15),
            new FishGroup(10),
        ];
		for (const group of this.fishGroups) {
            const randomCord = () => THREE.MathUtils.randFloat(5, 60);
            group.position.set(randomCord(), 10, randomCord());
            this.addToAquarium(group);
        }
	}

    createShark() {
        const position = new THREE.Vector3(0, 0, 0);
        this.blueSharkTex = this.assetManager.getTextureManager().getTexture('shark-blue');
        const shark = new SharkLOD( this.assetManager.getBlenderManager().getAllLODs('shark'), position, this.blueSharkTex);
        shark.scale.set(0.5, 0.5, 0.5);
        this.addToAquarium(shark);
    }

    createSubmarine() {
        this.submarine = new SubmarineLOD(this.assetManager.getBlenderManager().getAllLODs('propeller-blade'), this.keyManager, this.cameraManager);
        this.addToAquarium(this.submarine);
    }

    update() {
        for (const obj of this.objects) {
            if (obj.updateState) obj.updateState();
        }
    }

}

export { Aquarium };
