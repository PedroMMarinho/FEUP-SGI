import * as THREE from 'three';
import { BubbleGroup } from './bubble/BubbleGroup.js';
import { RockGroup } from './rock/RockGroup.js';
import { CoralGroup } from './coral/CoralGroup.js';
import { FishGroup } from './fish/FishGroup.js';
import { TerrainSegment } from './terrainSegment/TerrainSegment.js';
import { SharkLOD } from './shark/SharkLOD.js';
import { SubmarineLOD } from './submarine/SubmarineLOD.js';
import { GlassTank } from './glassTank/GlassTank.js';

/**
 * Main Aquarium class
 */
class Aquarium extends THREE.Object3D {
    constructor(assetManager, keyManager, cameraManager, scene) {
        super();
        this.assetManager = assetManager;
        this.keyManager = keyManager;
        this.cameraManager = cameraManager;
        this.scene = scene;

        // Terrain dimensions
        this.terrainWidth = 200;
        this.terrainHeight = 200;

        this.objects = [];
    }

    addToAquarium(object) {
        this.objects.push(object);
        this.add(object);
    }

    createWaterFog() {
        // Blue cyan color
        const backgroundColor = 0x003d5c;
        this.scene.background = new THREE.Color(backgroundColor);
        this.scene.fog = new THREE.FogExp2(backgroundColor, 0.009);
    }

    createGlassTank() {
        const glassTank = new GlassTank(this.terrainWidth, this.terrainHeight / 4, this.terrainWidth);
        this.addToAquarium(glassTank);
    }

    createWaterTopLayer() {
        const texture = this.assetManager.getTextureManager().getTexture('water-normal');
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        const water = new Water(texture, this.terrainWidth, this.terrainWidth, this.terrainHeight / 4);

        if (this.scene.environment) {
            water.setEnvMap(this.scene.environment);
        } else {
            console.warn("Water surface has no environment map! Reflections/refractions will be black.");
        }
        this.addToAquarium(water);
    }

    /**
     * Initializes and adds all aquarium elements
     */
    init() {
        // Create aquarium geometry and material
        this.createGlassTank();
        // Create water fog
        this.createWaterFog();
        // Create water top layer
        //this.createWaterTopLayer();
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
        const rockGroup = new RockGroup(1000, this.terrainWidth - this.terrainWidth / 10, this.terrainHeight - this.terrainHeight / 10);
        this.addToAquarium(rockGroup);
    }

    createTerrainSegments() {
        const terrainGroup = new TerrainSegment(this.terrainWidth, this.terrainHeight);
        this.addToAquarium(terrainGroup);
    }

    createCorals() {
        const coralGroup = new CoralGroup(100, this.terrainWidth / 2, this.terrainHeight / 2);
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
        const sharkGLTF1 = this.assetManager.getBlenderManager().getAllLODs('shark1');
        const sharkGLTF2 = this.assetManager.getBlenderManager().getAllLODs('shark2');
        // Blue Shark
        const position1 = new THREE.Vector3(5, 4, 0);
        const blueSharkTex = this.assetManager.getTextureManager().getTexture('shark-blue');
        const shark1 = new SharkLOD(sharkGLTF1, position1, blueSharkTex);
        shark1.scale.set(0.5, 0.5, 0.5);
        this.addToAquarium(shark1);

        // Grey Shark
        const position2 = new THREE.Vector3(5, 6, -10);
        const shark2 = new SharkLOD(sharkGLTF2, position2);
        shark2.scale.set(0.5, 0.5, 0.5);
        this.addToAquarium(shark2);
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
