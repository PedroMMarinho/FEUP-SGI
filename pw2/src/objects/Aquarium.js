import * as THREE from 'three';
import { BubbleGroup } from './bubble/BubbleGroup.js';
import { FishGroup } from './fish/FishGroup.js';
import { SharkLOD } from './shark/SharkLOD.js';
import { SubmarineLOD } from './submarine/SubmarineLOD.js';
import { GlassTank } from './glassTank/GlassTank.js';
import { Seabed } from './seabed/Seabed.js';
import { Water } from './water/Water.js';

/**
 * Main Aquarium class
 */
class Aquarium extends THREE.Object3D {
    constructor(assetManager, keyManager, cameraManager, collisionManager, bvhManager, scene) {
        super();
        // Managers
        this.assetManager = assetManager;
        this.keyManager = keyManager;
        this.cameraManager = cameraManager;
        this.collisionManager = collisionManager;
        this.bvhManager = bvhManager;

        // Scene
        this.scene = scene;

        // Terrain dimensions
        this.terrainWidth = 150;
        this.terrainHeight = 50;

        // Camera Manager 
        this.cameraManager.setAquariumHeight(this.terrainHeight);

        this.objects = [];
        this.envMap = null;
    }

    addToAquarium(object) {
        this.objects.push(object);
        this.add(object);
        this.collisionManager.registerObject(object);
    }

    createOutsideEnvironment() {
        const hdri = this.assetManager.getHDRI('fin-hall');
        this.scene.environment = hdri.hdr;
        this.scene.environment.intensity = 0.01;
        this.scene.background = hdri.envMap;
        this.envMap = hdri.envMap;
    }

    createWaterFog() {
        // Blue cyan color
        this.scene.fog = new THREE.FogExp2(0x003d5c, 0.009);
    }

    createTopLight() {
        const topLight = new THREE.DirectionalLight(0xffffff, 10.0);
        topLight.position.set(0, 100, 0);
        topLight.castShadow = true;
        this.addToAquarium(topLight);
    }

    createGlassTank() {
        const glassTank = new GlassTank(this.terrainWidth, this.terrainHeight, this.terrainWidth);
        this.addToAquarium(glassTank);
    }

    createWaterTopLayer() {
        const water = new Water(this.assetManager.getTextureManager().getTexture('water-normal'), this.terrainWidth, 4* this.terrainHeight / 5, this.terrainWidth, this.envMap );
        this.addToAquarium(water);
    }

    /**
     * Initializes and adds all aquarium elements
     */
    init() {
        // Create light
        this.createTopLight();
        // Create outside environment
        this.createOutsideEnvironment();
        // Create aquarium geometry and material
        this.createGlassTank();
        // Create water fog
        this.createWaterFog();
        // Create water top layer
        this.createWaterTopLayer();
        // Create bubbles
        this.createBubbles();
        // create fishes
        this.createFishes();
        // create shark
        this.createShark();
        // create submarine
        this.createSubmarine();
        // create seabed
        this.createSeaBed();
        // Setup bvh for all objects
        this.bvhManager.computeBVH(this.objects);
    }

    createSeaBed() {
        const rockModels = [
            this.assetManager.getBlenderManager().getAllLODs('granite'),
        ];
        const shellModels = [
            this.assetManager.getBlenderManager().getAllLODs('whelk'),
        ];
        const shipModels = [
            this.assetManager.getBlenderManager().getAllLODs('going-merry'),
        ];
        const tvModels = [
            this.assetManager.getBlenderManager().getAllLODs('tv'),
        ];


        const rockCount = 600;
        const coralCount = 120;
        const shellCount = 200;
        const seaweedCount = 120;
        const shipCount = 1;
        const tvCount = 1;


        const seabed = new Seabed(this.terrainWidth, rockCount, coralCount, shellCount, seaweedCount, shipCount, tvCount, rockModels, shellModels, shipModels, tvModels);
        this.cameraManager.setTargetTV(seabed.getTV());
        this.addToAquarium(seabed);
    }

    createBubbles() {
        const bubbleGroup = new BubbleGroup(10);
        this.addToAquarium(bubbleGroup);
    }

    createFishes() {
        /*this.fishGroups = [
            new FishGroup(20),
            new FishGroup(15),
            new FishGroup(10),
        ];
        for (const group of this.fishGroups) {
            const randomCord = () => THREE.MathUtils.randFloat(5, 60);
            group.position.set(randomCord(), 10, randomCord());
            this.addToAquarium(group);
        }*/

        this.boidProps = {
            cohesion: 2,
            separation: 2,
            alignment: 1.4,
            moveSpeed: 4,
            awareness: 10
        };

		this.fishGroups = [
			new FishGroup(400, this.terrainWidth / 2 - 8, this.terrainHeight / 2 + 10, this.boidProps),
		];
		this.fishGroups[0].position.set(0,0,0);
        this.cameraManager.setTargetFish(this.fishGroups[0].getCameraTarget());
		this.addToAquarium(this.fishGroups[0]);
    }

    createShark() {
        const aiOptions = {
            // Bounds
            terrainWidth: this.terrainWidth* 9/10,
            terrainHeight: 4 * this.terrainHeight / 5,
            maxY: this.terrainHeight / 2,
        };
    
        const sharkGLTF1 = this.assetManager.getBlenderManager().getAllLODs('shark1');
        const sharkGLTF2 = this.assetManager.getBlenderManager().getAllLODs('shark2');
        // Blue Shark
        const position1 = new THREE.Vector3(5, 4, 0);
        const blueSharkTex = this.assetManager.getTextureManager().getTexture('shark-blue');
        const shark1 = new SharkLOD(sharkGLTF1, position1, blueSharkTex, aiOptions);
        shark1.scale.set(0.5, 0.5, 0.5);
        this.addToAquarium(shark1);

        // Grey Shark
        const position2 = new THREE.Vector3(5, 6, -10);
        const shark2 = new SharkLOD(sharkGLTF2, position2, null, aiOptions);
        shark2.scale.set(0.5, 0.5, 0.5);
        this.addToAquarium(shark2);
    }

    createSubmarine() {
        const bounds = {
            minX: -this.terrainWidth / 2 - 5,
            maxX: this.terrainWidth  / 2 - 5,
            minY: 5,
            maxY: this.terrainHeight - 8,
            minZ: -this.terrainWidth / 2 - 5,
            maxZ: this.terrainWidth / 2 - 5,
        };
        this.submarine = new SubmarineLOD(this.assetManager.getBlenderManager().getAllLODs('propeller-blade'), this.keyManager, this.cameraManager, bounds);
        this.addToAquarium(this.submarine);
    }


    update() {
        this.collisionManager.update();
        for (const obj of this.objects) {
            if (obj.updateState) obj.updateState();
        }
    }

}

export { Aquarium };
