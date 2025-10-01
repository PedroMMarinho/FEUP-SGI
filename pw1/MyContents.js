import * as THREE from 'three';
import { MyAxis } from './MyAxis.js';
import { PokerTable } from './objects/PokerTable.js';
import { CardDeck } from './objects/CardDeck.js';
import { PokerCard } from './objects/PokerCard.js';
import { PokerChipHelper, PokerChipValue } from './objects/PokerChipHelper.js';
import { BlackJackTable } from './objects/BlackJackTable.js';

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
        this.blackJackTable = new BlackJackTable(0, 0, 0);

        // Create royal flush cards 
        this.card1 = this.cardDeck.create_card('D_S', 0, this.pokerTable.getTableBase() + PokerCard.DEPTH / 2, 0, true);
        this.card1.rotateOnAxis(new THREE.Vector3(0, 0, 1), Math.PI / 2);

        this.card2 = this.cardDeck.create_card('A_S', 0, this.pokerTable.getTableBase() + PokerCard.DEPTH / 2, 0.66, true);
        this.card2.rotateOnAxis(new THREE.Vector3(0, 0, 1), Math.PI / 2);

        this.card3 = this.cardDeck.create_card('10_S', 0, this.pokerTable.getTableBase() + PokerCard.DEPTH / 2, 1.32, true);
        this.card3.rotateOnAxis(new THREE.Vector3(0, 0, 1), Math.PI / 2);

        this.card4 = this.cardDeck.create_card('V_S', 0, this.pokerTable.getTableBase() + PokerCard.DEPTH / 2, -0.66, true);
        this.card4.rotateOnAxis(new THREE.Vector3(0, 0, 1), Math.PI / 2);

        this.card5 = this.cardDeck.create_card('R_S', 0, this.pokerTable.getTableBase() + PokerCard.DEPTH / 2, -1.32, true);
        this.card5.rotateOnAxis(new THREE.Vector3(0, 0, 1), Math.PI / 2);

        // face down player cards
        this.player1Card1 = this.cardDeck.create_card('7_H', -2.1, this.pokerTable.getTableBase() + PokerCard.DEPTH / 2, 2.8, false);
        this.player1Card1.rotateOnAxis(new THREE.Vector3(0, 0, 1), Math.PI / 6);
        this.player1Card2 = this.cardDeck.create_card('3_C', -2.1, this.pokerTable.getTableBase() + PokerCard.DEPTH / 2 + 0.01, 3, false);
        this.player1Card2.rotateOnAxis(new THREE.Vector3(0, 0, 1), Math.PI / 6);


        this.player2Card1 = this.cardDeck.create_card('5_D', 2.1, this.pokerTable.getTableBase() + PokerCard.DEPTH / 2, 2.8, false);
        this.player2Card1.rotateOnAxis(new THREE.Vector3(0, 0, 1), -Math.PI / 8);
        this.player2Card2 = this.cardDeck.create_card('9_C', 2.1, this.pokerTable.getTableBase() + PokerCard.DEPTH / 2 + 0.01, 3, false);
        this.player2Card2.rotateOnAxis(new THREE.Vector3(0, 0, 1), -Math.PI / 6);


        this.player3Card1 = this.cardDeck.create_card('8_D', 2.1, this.pokerTable.getTableBase() + PokerCard.DEPTH / 2, -2.8, false);
        this.player3Card1.rotateOnAxis(new THREE.Vector3(0, 0, 1), Math.PI / 5);
        this.player3Card2 = this.cardDeck.create_card('4_H', 2.1, this.pokerTable.getTableBase() + PokerCard.DEPTH / 2 + 0.01, -3, false);
        this.player3Card2.rotateOnAxis(new THREE.Vector3(0, 0, 1), Math.PI / 4);

        this.player4Card1 = this.cardDeck.create_card('6_H', -2.1, this.pokerTable.getTableBase() + PokerCard.DEPTH / 2, -2.8, false);
        this.player4Card1.rotateOnAxis(new THREE.Vector3(0, 0, 1), -Math.PI / 6);
        this.player4Card2 = this.cardDeck.create_card('2_S', -2.1, this.pokerTable.getTableBase() + PokerCard.DEPTH / 2 + 0.01, -3, false);
        this.player4Card2.rotateOnAxis(new THREE.Vector3(0, 0, 1), -Math.PI / 6);

        this.cardPile = this.cardDeck.create_card_pile(0, this.pokerTable.getTableBase() + (PokerCard.DEPTH / 2) * 5, -2.2, 46);
        this.cardPile.rotateOnAxis(new THREE.Vector3(0, 0, 1), -Math.PI / 2);
        this.pokerChipHelper = new PokerChipHelper();


        // Black Jack Game

        this.blackJackPlayer1 = this.cardDeck.create_card('8_D', 2.1, this.blackJackTable.getTableBase(), -2.8);

    }

    initObjects() {
        this.app.scene.add(this.axis);
        //this.app.scene.add(this.pokerTable);

        //this.app.scene.add(this.pokerChip);

        // Adding to poker table so when moving they stay on top of it
        this.pokerTable.add(this.card1);
        this.pokerTable.add(this.card2);
        this.pokerTable.add(this.card3);
        this.pokerTable.add(this.card4);
        this.pokerTable.add(this.card5);


        this.pokerTable.add(this.player1Card1);
        this.pokerTable.add(this.player1Card2);
        this.pokerTable.add(this.player2Card1);
        this.pokerTable.add(this.player2Card2);
        this.pokerTable.add(this.player3Card1);
        this.pokerTable.add(this.player3Card2);
        this.pokerTable.add(this.player4Card1);
        this.pokerTable.add(this.player4Card2);

        this.pokerTable.add(this.cardPile);


        // BlackJack Table
        this.app.scene.add(this.blackJackTable);
        this.app.scene.add(this.blackJackPlayer1);
        this.initChips();

    }

    initLights() {
        // Temporary Ambient Light
        this.ambientLight = new THREE.AmbientLight(0x6f6f6f, 1);
        this.app.scene.add(this.ambientLight);

        // Temporary Directional Light
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
        this.directionalLight.position.set(10, 20, 10);
        this.directionalLight.castShadow = true;
        this.directionalLight.shadow.mapSize.width = 512;
        this.directionalLight.shadow.mapSize.height = 512;
        this.directionalLight.shadow.camera.near = 0.5;
        this.directionalLight.shadow.camera.far = 500;
        this.app.scene.add(this.directionalLight);
    }

    initPokerTextures() {
        // poker table
        this.poker = new THREE.TextureLoader().load('textures/pokerTable2.jpg');
        this.pokerMaterial = new THREE.MeshPhongMaterial({
            map: this.poker,
            shininess: 20,
            specular: new THREE.Color(0x222222),
            reflectivity: 0.5
        });
        // poker rest for players
        this.pokerRest = new THREE.TextureLoader().load('textures/pokerRest.jpg');
        this.pokerRest.wrapS = THREE.RepeatWrapping;
        this.pokerRest.wrapT = THREE.RepeatWrapping;
        this.pokerRest.rotation = -Math.PI / 2;
        this.pokerRestMaterial = new THREE.MeshPhongMaterial({
            map: this.pokerRest,
            specular: 0x6f6f6f,
            color: 0xA0522D,
            side: THREE.DoubleSide
        });
        // poker feel (couro da mesa)
        this.pokerFeel = new THREE.TextureLoader().load('textures/pokerFeel.jpg');
        this.pokerFeel.wrapS = THREE.RepeatWrapping;
        this.pokerFeel.wrapT = THREE.RepeatWrapping;
        this.pokerFeel.rotation = -Math.PI / 2;
        this.pokerFeel.repeat.set(4, 4);
        this.pokerFeelMaterial = new THREE.MeshPhongMaterial({
            map: this.pokerFeel, side: THREE.DoubleSide, color: 0x888888, shininess: 40,
            specular: new THREE.Color(0x333333),
            reflectivity: 0.4
        });

        // assign materials to poker table
        this.pokerTable.pokerFeelMaterial = this.pokerFeelMaterial
        this.pokerTable.pokerTableMaterial = this.pokerMaterial
        this.pokerTable.pokerRestMaterial = this.pokerRestMaterial
        this.pokerTable.pokerLegMaterial = this.pokerRestMaterial
    }

    buildObjects() {
        this.pokerTable.build();
        this.buildChips();

        this.pokerChip.build();
        this.blackJackTable.build()
    }

    initBlackJackTextures() {
        this.blackJack = new THREE.TextureLoader().load('textures/blackJack.png');
        this.blackJack.wrapS = THREE.RepeatWrapping;
        this.blackJack.wrapT = THREE.RepeatWrapping;

        this.blackJack.repeat.set(1, 2);
        this.blackJack.offset.set(0, 0.6);
        this.blackJack.center.set(0.5, 0.5);

        this.greenFelt = new THREE.MeshPhongMaterial({ map: this.blackJack,shininess: 5,specular: new THREE.Color(0x111111), reflectivity: 0.1});


        this.blackJackLegs = new THREE.TextureLoader().load('textures/blackMetal.jpg');

        this.blackJackLegsMaterial = new THREE.MeshPhongMaterial({ map: this.blackJackLegs, side: THREE.DoubleSide,
            color: 0xaaaaaa, shininess: 80,   specular: new THREE.Color(0xffffff), reflectivity: 0.8 });

        this.blackJackTable.outerMaterial = this.pokerRestMaterial;
        this.blackJackTable.legMaterial = this.blackJackLegsMaterial;
        this.blackJackTable.tableMaterial = this.greenFelt;
    }

    initTextures() {
        // load textures
        this.initPokerTextures();
        this.initBlackJackTextures();
    }
    
    buildChips(){
        this.p1Tower1 = this.pokerChipHelper.createTower(0,this.pokerTable.getTableBase(),0,PokerChipValue.TWENTY_FIVE,30);
        this.p2Tower1 = this.pokerChipHelper.createTower(0.10,this.pokerTable.getTableBase(),0,PokerChipValue.TWENTY_FIVE,20);
        
        
    }

    initChips(){
        this.app.scene.add(this.p1Tower1);
        this.app.scene.add(this.p2Tower1);
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