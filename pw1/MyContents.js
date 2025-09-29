import * as THREE from 'three';
import { MyAxis } from './MyAxis.js';
import { PokerTable } from './objects/PokerTable.js';
import { PokerChip, PokerChipValue } from './objects/PokerChip.js';
import { CardDeck } from './objects/CardDeck.js';
import { PokerCard } from './objects/PokerCard.js';

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
        this.cardDeck = new CardDeck();
        this.card1 = this.cardDeck.create_card('D_C',0,this.pokerTable.getTableBase() + PokerCard.DEPTH,0, false);
        this.card1.rotateOnAxis(new THREE.Vector3(0, 0, 1), Math.PI / 2);
        this.pokerChip = new PokerChip(0, 7, 0, 0, PokerChipValue.TWENTY_FIVE);
    }

    initObjects() {
        this.app.scene.add(this.axis);
        this.app.scene.add(this.pokerTable);
        //this.app.scene.add(this.pokerChip);
        this.app.scene.add(this.card1);
    }

    initLights() {
        // Temporary Ambient Light
        this.ambientLight = new THREE.AmbientLight(0x6f6f6f, 1);
        this.app.scene.add(this.ambientLight);

    }

    initPokerTextures() {
        // poker table
        this.poker = new THREE.TextureLoader().load('textures/pokerTable2test3.jpg');
        this.pokerMaterial = new THREE.MeshBasicMaterial({ map: this.poker });
        // poker rest for players
        this.pokerRest = new THREE.TextureLoader().load('textures/pokerRest.jpg');
        this.pokerRest.wrapS = THREE.RepeatWrapping;
        this.pokerRest.wrapT = THREE.RepeatWrapping;
        this.pokerRest.rotation = -Math.PI / 2;
        this.pokerRestMaterial = new THREE.MeshBasicMaterial({
            map: this.pokerRest,
            color: 0xA0522D,  
            side: THREE.DoubleSide
        });
        // poker feel (couro da mesa)
        this.pokerFeel = new THREE.TextureLoader().load('textures/pokerFeel.jpg');
        this.pokerFeel.wrapS = THREE.RepeatWrapping;
        this.pokerFeel.wrapT = THREE.RepeatWrapping;
        this.pokerFeel.rotation = -Math.PI / 2;
        this.pokerFeel.repeat.set(4, 4);
        this.pokerFeelMaterial = new THREE.MeshBasicMaterial({
            map: this.pokerFeel, side: THREE.DoubleSide, color: 0x888888,   
        });

        // assign materials to poker table
        this.pokerTable.pokerFeelMaterial = this.pokerFeelMaterial
        this.pokerTable.pokerTableMaterial = this.pokerMaterial
        this.pokerTable.pokerRestMaterial = this.pokerRestMaterial
        this.pokerTable.pokerLegMaterial = this.pokerRestMaterial
    }

    buildObjects() {
        this.pokerTable.build();
        this.pokerChip.build();
    }

    initTextures() {
        // load textures
        this.initPokerTextures();

    }

    /**
     * initializes the contents
     */
    init() {
        this.initTextures();
        this.buildObjects();
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