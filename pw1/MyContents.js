import * as THREE from 'three';
import { MyAxis } from './MyAxis.js';
import { PokerTable } from './objects/PokerTable.js';

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
    }

    initObjects() {
        this.app.scene.add(this.axis);
        this.app.scene.add(this.pokerTable);
    }

    initLights() {
        // Temporary Ambient Light
        this.ambientLight = new THREE.AmbientLight(0x6f6f6f, 1);
        this.app.scene.add(this.ambientLight);

    }

    initTextures() {
        // load textures

        this.poker = new THREE.TextureLoader().load('textures/pokerTable.jpg');
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
        this.pokerFeelMaterial = new THREE.MeshBasicMaterial({
            map: this.pokerFeel, side: THREE.DoubleSide, color: 0x888888,   // darker multiplier
            roughness: 0.9,
            metalness: 0.0
        });


        this.pokerTable.pokerFeelMaterial = this.pokerFeelMaterial
        this.pokerTable.pokerTableMaterial = this.pokerMaterial
        this.pokerTable.pokerRestMaterial = this.pokerRestMaterial
        this.pokerTable.pokerLegMaterial = this.pokerRestMaterial

        this.pokerTable.build()

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