import * as THREE from 'three';
import { FishGroup } from './fish/FishGroup.js';
import { SharkLOD } from './shark/SharkLOD.js';
import { SubmarineLOD } from './submarine/SubmarineLOD.js';
import { GlassTank } from './glassTank/GlassTank.js';
import { Seabed } from './seabed/Seabed.js';
import { Water } from './water/Water.js';
import { BubbleColumns } from './bubble/BubbleColumns.js';
import { MarineSnow } from './particles/MarineSnow.js';

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
        this.terrainWidth = 80;
        this.terrainHeight = 30;

        // Camera Manager 
        this.cameraManager.setAquariumHeight(this.terrainHeight);
        this.cameraManager.setAquariumWidth(this.terrainWidth);

        this.shadowsEnabled = true;
        this.particlesUseLOD = false;

        this.objects = [];
        this.envMap = null;
    }

    addToAquarium(object) {
        this.objects.push(object);
        this.add(object);
        this.collisionManager.registerObject(object);
    }

    enableShadows(object, cast = true, receive = true) {
        if (!object) return;

        object.traverse((child) => {
            if (child.isMesh) {
                if (child.cannotCastShadow !== undefined) return;
                child.castShadow = cast;
                child.receiveShadow = receive;

                if (child.material) {
                    child.material.needsUpdate = true;
                }
            }
        });
    }


    createGlassTank() {
        const glassTank = new GlassTank(this.terrainWidth, this.terrainHeight, this.terrainWidth);
        this.addToAquarium(glassTank);
    }

    createWaterTopLayer() {
        const water = new Water(this.assetManager.getTextureManager().getTexture('water-normal'), this.terrainWidth, 4 * this.terrainHeight / 5 - 5, this.terrainWidth, this.envMap);
        this.addToAquarium(water);
    }

    /**
     * Initializes and adds all aquarium elements
     */
    init() {
        // Create aquarium geometry and material
        this.createGlassTank();
        // Create water top layer
        this.createWaterTopLayer();

        // create fishes
        this.createFishes();
        // create shark
        this.createShark();
        // create submarine
        this.createSubmarine();
        // create seabed
        this.createSeaBed();
        // Setup bvh for all objects
        this.setupBVH();
        // Setup Shadows
        this.setupShadows();
        // Add Marine Snow
        this.addMarineSnow();
    }

    addMarineSnow() {
    this.marineSnow = new MarineSnow(
        600, 
        {
            width: this.terrainWidth,
            height: this.terrainHeight - this.terrainHeight / 3,
            depth: this.terrainWidth
        },
        (x, z) => this.seabed.terrain.getHeightAt(x, z),
        {
            // YOUR CUSTOM SETTINGS
            particleSize: 0.15,
            fallSpeed: [0.1, 0.5],       // Random speed between 0.5 and 2.0
            driftSpeed: [0.04, 0.01],      // Horizontal drift speed
            swayFrequency: [0.5, 2.0],   // Faster swaying
            swayAmplitude: 0.2,          // More pronounced sway
            gravity: 0.1,                // Reduced gravity effect
            bounce: 0.9,      // Less bounce
            fadeSpeed: 0.8,              // Fades fast 
            simulateDistance: 50,
        },
    );
    this.addToAquarium(this.marineSnow);
    }

    setupBVH() {
        this.bvhManager.computeBVH(this.objects);
    }

    createSeaBed() {
        const rockModels = [
            this.assetManager.getBlenderManager().getAllLODs('granite'),
            this.assetManager.getBlenderManager().getAllLODs('dark-stone'),
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

        const treasureChestModel = [this.assetManager.getBlenderManager().getAllLODs('treasure-chest')];


        const rockCount = 70;
        const coralCount = 35;
        const shellCount = 15;
        const seaweedCount = 35;
        const shipCount = 1;
        const tvCount = 1;
        const bubbleColumnsCount = 20;
        const treasureChestCount = 1;


        this.seabed = new Seabed(this.terrainWidth, rockCount, coralCount, shellCount, seaweedCount, shipCount, tvCount, bubbleColumnsCount ,treasureChestCount, rockModels, shellModels, shipModels, tvModels, treasureChestModel);
        this.cameraManager.setTargetTV(this.seabed.getTV());
        this.cameraManager.setTargetShip(this.seabed.sunkenShip);
        this.cameraManager.setTreasureChest(this.seabed.treasureChest);
        this.addToAquarium(this.seabed);
    }

    setupShadows() {
        if (this.shadowsEnabled) {
            this.enableShadows(this.seabed)
            this.enableShadows(this.submarine)
            this.enableShadows(this.seabed.terrain, false, true)

            for (const fishGroup of this.fishGroups) {
                this.enableShadows(fishGroup)
            }
            for (const shark of this.sharks) {
                this.enableShadows(shark)
            }
        } else {
            this.enableShadows(this.seabed, false, false)
            this.enableShadows(this.submarine, false, false)
            this.enableShadows(this.seabed.terrain, false, false)

            for (const fishGroup of this.fishGroups) {
                this.enableShadows(fishGroup, false, false)
            }
            for (const shark of this.sharks) {
                this.enableShadows(shark, false, false)
            }
        }

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
            separation: 2.7,
            alignment: 1.4,
            moveSpeed: 3.6,
            awareness: 8
        };

        this.fishGroups = [
            new FishGroup(400, this.terrainWidth / 2 - 5, this.terrainHeight / 2, this.boidProps),
        ];
        this.fishGroups[0].position.set(0, 0, 0);
        this.cameraManager.setTargetBoid(this.fishGroups[0].getCameraTarget());
        this.cameraManager.setTargetJumpingFish(this.fishGroups[0].animatedFishes[0]);
        this.addToAquarium(this.fishGroups[0]);
    }

    createShark() {
        const aiOptions = {
            // Bounds
            terrainWidth: this.terrainWidth * 9 / 10,
            terrainHeight: 4 * this.terrainHeight / 5,
            maxY: this.terrainHeight / 2,
        };

        const sharkGLTF1 = this.assetManager.getBlenderManager().getAllLODs('shark1');
        const sharkGLTF2 = this.assetManager.getBlenderManager().getAllLODs('shark2');
        // Blue Shark
        const position1 = new THREE.Vector3(-5, 8, 0);
        const blueSharkTex = this.assetManager.getTextureManager().getTexture('shark-blue');
        const shark1 = new SharkLOD(sharkGLTF1, position1, blueSharkTex, aiOptions);
        shark1.scale.set(0.5, 0.5, 0.5);
        this.addToAquarium(shark1);

        // Grey Shark
        const position2 = new THREE.Vector3(5, 10, -15);
        const shark2 = new SharkLOD(sharkGLTF2, position2, null, aiOptions);
        shark2.scale.set(0.45, 0.45, 0.45);

        this.sharks = [
            shark1,
            shark2
        ]

        this.addToAquarium(shark2);
    }

    createSubmarine() {
        const bounds = {
            minX: -this.terrainWidth / 2 + 8,
            maxX: this.terrainWidth / 2 - 8,
            minY: 5,
            maxY: this.terrainHeight - 8,
            minZ: -this.terrainWidth / 2 + 8,
            maxZ: this.terrainWidth / 2 - 8,
        };
        const initialPos = new THREE.Vector3(this.terrainWidth / 8 , this.terrainHeight / 2, this.terrainWidth / 4 );
        this.submarine = new SubmarineLOD(this.assetManager.getBlenderManager().getAllLODs('propeller-blade'), this.keyManager, this.cameraManager, bounds, initialPos);
        this.submarine.scale.set(0.9, 0.9, 0.9);
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
