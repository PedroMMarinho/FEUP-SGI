import * as THREE from 'three';
import { MyAxis } from './MyAxis.js';
import { PokerTable } from './objects/PokerTable.js';
import { PokerChip, PokerChipValue } from './objects/PokerChip.js';

/**
 *  This class contains the contents of out application
 */
class MyContents {

    /**
       constructs the object
       @param {MyApp} app The application object
    */
    constructor(app) {
        this.app = app
        this.axis = new MyAxis(this);
        this.pokerTable = new PokerTable(0, 0, 0);
        this.pokerChips = []
        this.pokerChips[PokerChipValue.TWENTY_FIVE] = new PokerChip(0, 5, 0, 0);
        this.pokerChips[PokerChipValue.FIFTY] = new PokerChip(0, 7, 0, 0);
        this.pokerChips[PokerChipValue.ONE_HUNDRED] = new PokerChip(0, 9, 0, 0);
        this.pokerChips[PokerChipValue.FIVE_HUNDRED] = new PokerChip(0, 11, 0, 0);
        this.chipTopMaterials = []
        this.chipSideMaterials = []
    }

    initObjects() {
        this.app.scene.add(this.axis);
        this.app.scene.add(this.pokerTable);
        for (let i = 0; i < 4; i++) {
            this.app.scene.add(this.pokerChips[i]);
        }
    }

    initLights() {
        // Temporary Ambient Light
        this.ambientLight = new THREE.AmbientLight(0x6f6f6f, 1);
        this.app.scene.add(this.ambientLight);

    }

    initTextures() {
        // load textures

        this.poker = new THREE.TextureLoader().load('textures/pokerTable2.jpg');
        this.pokerMaterial = new THREE.MeshBasicMaterial({ map: this.poker });

        this.pokerRest = new THREE.TextureLoader().load('textures/pokerRest.jpg');
        this.pokerRest.wrapS = THREE.RepeatWrapping;
        this.pokerRest.wrapT = THREE.RepeatWrapping;
        this.pokerRest.rotation = -Math.PI / 2;
        this.pokerRestMaterial = new THREE.MeshBasicMaterial({
            map: this.pokerRest,
            color: 0xA0522D,  // darker multiplier
            side: THREE.DoubleSide
        });
        this.pokerFeel = new THREE.TextureLoader().load('textures/pokerFeel.jpg');
        this.pokerFeel.wrapS = THREE.RepeatWrapping;
        this.pokerFeel.wrapT = THREE.RepeatWrapping;
        this.pokerFeel.rotation = -Math.PI / 2;
        this.pokerFeel.repeat.set(4, 4);
        this.pokerFeelMaterial = new THREE.MeshBasicMaterial({
            map: this.pokerFeel, side: THREE.DoubleSide, color: 0x888888,   // darker multiplier
            roughness: 0.9,
            metalness: 0.0
        });



        this.pokerTable.pokerFeelMaterial = this.pokerFeelMaterial
        this.pokerTable.pokerTableMaterial = this.pokerMaterial
        this.pokerTable.pokerRestMaterial = this.pokerRestMaterial
        this.pokerTable.pokerLegMaterial = this.pokerRestMaterial

        this.initChipTextures();

        this.pokerChips.forEach(chip => {
            chip.build()
        });

        this.pokerTable.build()

    }
    initChipTextures() {
        this.chipTopMaterials = []
        this.chipSideMaterials = []
        for (let i = 0; i < 4; i++) {
            let sideTexture = new THREE.TextureLoader().load(`textures/chipSide${i}.png`);
            sideTexture.wrapS = THREE.RepeatWrapping;
            sideTexture.wrapT = THREE.RepeatWrapping;
            sideTexture.repeat.set(6, 1);
            this.chipSideMaterials.push(new THREE.MeshStandardMaterial({ map: sideTexture }));

            let topTexture = new THREE.TextureLoader().load(`textures/chipTop${i}.png`);
            topTexture.wrapS = THREE.RepeatWrapping;
            topTexture.wrapT = THREE.RepeatWrapping;
            topTexture.repeat.set(1, 1);
            this.chipTopMaterials.push(new THREE.MeshStandardMaterial({ map: topTexture }));

            this.pokerChips[i].sideMaterial = this.chipSideMaterials[i];
            this.pokerChips[i].topMaterial = this.chipTopMaterials[i];
        }
    }


    /**
     * initializes the contents
     */
    init() {
        this.initTextures();
        this.initLights();
        this.initObjects();
    }


    /**
     * updates the contents
     * this method is called from the render method of the app
     * 
     */
    update() {
    }

}

export { MyContents };