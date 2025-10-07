import * as THREE from 'three';
import { MyAxis } from './MyAxis.js';
import { PokerTable } from './objects/PokerTable.js';
import { CardDeck } from './objects/CardDeck.js';
import { PokerCard } from './objects/PokerCard.js';
import { PokerChipHelper, PokerChipValue } from './objects/PokerChipHelper.js';
import { BlackJackTable } from './objects/BlackJackTable.js';
import { Room } from './objects/Room.js';
import { Lamp } from './objects/Lamp.js';
import { Door } from './objects/Door.js';
import { WindowFrame } from './objects/WindowFrame.js';
import { SlotMachine } from './objects/SlotMachine.js';
import { CowboyChair } from './objects/CowboyChair.js';
import { PhotoFrame } from './objects/PhotoFrame.js';
import { MoonSpotlight } from './objects/MoonSpotlight.js';
import { Jukebox } from './objects/Jukebox.js';

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

        this.room = new Room();

        const roomDimensions = this.room.getRoomDimensions();
        this.axis = new MyAxis(this);
        this.showAxis = true;
        this.pokerTable = new PokerTable(0, 0, -roomDimensions.depth / 4, -Math.PI / 2);

        this.pokerChair1 = new CowboyChair(0,0,0);
        this.pokerChair1.position.set(-roomDimensions.width / 2 * 0.4, this.pokerChair1.legHeight, -roomDimensions.depth / 4 - this.pokerTable.tableRadiusZ / 2 - this.pokerChair1.xxLength / 2 );
        this.pokerChair1.rotation.y = - 4 * Math.PI / 6;
        this.pokerChair2 = new CowboyChair(0,0,0);
        this.pokerChair2.position.set(roomDimensions.width / 2 * 0.4, this.pokerChair2.legHeight, -roomDimensions.depth / 4 + this.pokerTable.tableRadiusZ / 2 +this.pokerChair2.xxLength / 2);
        this.pokerChair2.rotation.y = 2* Math.PI / 6;
        this.pokerChair3 = new CowboyChair(0,0,0);
        this.pokerChair3.position.set(- roomDimensions.width / 2 * 0.4, this.pokerChair3.legHeight, -roomDimensions.depth / 4 + this.pokerTable.tableRadiusZ / 2 + this.pokerChair3.xxLength / 2 );
        this.pokerChair3.rotation.y = -2 * Math.PI / 6;
        this.pokerChair4 = new CowboyChair(0,0,0);
        this.pokerChair4.position.set(roomDimensions.width / 2 * 0.4, this.pokerChair4.legHeight, -roomDimensions.depth / 4 - this.pokerTable.tableRadiusZ / 2 - this.pokerChair4.xxLength  / 2);
        this.pokerChair4.rotation.y = 4 * Math.PI / 6;

        this.cardDeck = new CardDeck();
        this.blackJackTable = new BlackJackTable(roomDimensions.width / 2 *0.7, 0, roomDimensions.depth / 2 * 0.6, Math.PI / 2);

        this.blackJackChair1 = new CowboyChair(0,0,0);
        this.blackJackChair1.position.set(roomDimensions.width / 2 * 0.35, this.blackJackChair1.legHeight, roomDimensions.depth / 2 * 0.75);
        this.blackJackChair1.rotation.y = -Math.PI / 6;
        this.blackJackChair2 = new CowboyChair(0,0,0);
        this.blackJackChair2.position.set(roomDimensions.width / 2 * 0.3, this.blackJackChair2.legHeight, roomDimensions.depth / 2 * 0.45);
        this.blackJackChair2.rotation.y = -4* Math.PI / 6;
        this.blackJackChair3 = new CowboyChair(0,0,0);
        this.blackJackChair3.position.set(roomDimensions.width / 2 * 0.8, this.blackJackChair3.legHeight, roomDimensions.depth / 2 * 0.6);
        this.blackJackChair3.rotation.y = 3* Math.PI / 6;
        

       	this.photoFrame = new PhotoFrame(0, 8, -19.7);
            

        this.windowFrames = [];
        const windowPositions = this.room.getWindowPositions();

        for(let i = 0; i < windowPositions.length; i++) {
            const pos = windowPositions[i];
            const windowFrame = new WindowFrame(pos.x, pos.y, pos.z, - Math.PI / 2);
            this.windowFrames.push(windowFrame);
        }

        this.slotMachine = new SlotMachine(0,0,0);
        this.slotMachine.position.set(-roomDimensions.width / 2  + this.slotMachine.machineWidth / 2, this.slotMachine.machineHeight / 2, roomDimensions.depth * 0.45);
        this.slotMachine.rotation.y = Math.PI / 2;
        this.slotMachine2 = new SlotMachine(0, 0, 0);
        this.slotMachine2.position.set(-roomDimensions.width / 2  + this.slotMachine2.machineWidth / 2, this.slotMachine2.machineHeight / 2, roomDimensions.depth * 0.35);
        this.slotMachine2.rotation.y = Math.PI / 2;
        this.slotMachine3 = new SlotMachine(0, 0, 0);
        this.slotMachine3.position.set(-roomDimensions.width / 2  + this.slotMachine3.machineWidth / 2, this.slotMachine3.machineHeight / 2, roomDimensions.depth * 0.25);
        this.slotMachine3.rotation.y = Math.PI / 2;

		this.jukebox = new Jukebox(-3, 2, -14);
		this.jukebox.rotateY(Math.PI/2);

        this.slotChair1 = new CowboyChair(0,0,0);
        this.slotChair1.position.set(- roomDimensions.width / 2 + this.slotMachine.machineDepth * 2 + this.slotChair1.xxLength / 2, this.slotChair1.legHeight, roomDimensions.depth * 0.45);
        this.slotChair1.rotation.y = Math.PI / 2;
        this.slotChair2 = new CowboyChair(0,0,0);
        this.slotChair2.position.set(- roomDimensions.width / 2 + this.slotMachine2.machineDepth* 2 + this.slotChair2.xxLength / 2, this.slotChair2.legHeight, roomDimensions.depth * 0.35);
        this.slotChair2.rotation.y = Math.PI / 2;
        this.slotChair3 = new CowboyChair(0,0,0);
        this.slotChair3.position.set(- roomDimensions.width / 2 + this.slotMachine3.machineDepth* 2 + this.slotChair3.xxLength / 2, this.slotChair3.legHeight, roomDimensions.depth * 0.25);
        //console.log(this.slotChair3.position)
        this.slotChair3.rotation.y = Math.PI / 2;


        this.door = new Door(-roomDimensions.width / 2 + 0.1 , 0, - roomDimensions.depth / 2 * 0.7, - Math.PI / 2);

        this.lamp1 = new Lamp(0, 3*roomDimensions.height / 4, roomDimensions.depth / 4);
        this.lamp2 = new Lamp(0, 3*roomDimensions.height / 4, -roomDimensions.depth / 4);

       	this.lamp1Power = 50;
		this.lamp2Power = 50;

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

        /*

        this.newWallTexture = new THREE.TextureLoader().load('textures/window.jpg');
        this.newWallTexture.rotation = Math.PI;
        this.newWallTexture.colorSpace = THREE.SRGBColorSpace;
        this.newWallTexture.generateMipmaps = false;
        this.newWallTexture.minFilter = THREE.LinearFilter; 
        // inside MyContents constructor
        this.wallParams = {
            wrapS: THREE.ClampToEdgeWrapping,
            wrapT: THREE.ClampToEdgeWrapping,
            repeatS: 2,
            repeatT: 2,
        };

        this.newWallTexture.wrapS = this.wallParams.wrapS;
        this.newWallTexture.wrapT = this.wallParams.wrapT;
        this.newWallTexture.repeat.set(this.wallParams.repeatS, this.wallParams.repeatT);
        this.newWallTexture.center.set(0.5, 0.5);
        this.newWallTexture.offset.set(0, 0);

        this.windowTexture = new THREE.TextureLoader().load('textures/windowlandscape.png');
        this.windowTexture.wrapS = this.windowTexture.wrapT = THREE.ClampToEdgeWrapping;
        this.windowTexture.repeatS = this.windowTexture.repeatT = 1;
        this.windowTexture.center.set(0.5, 0.5);
        this.windowTexture.offset.set(0, 0);

        */
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
        const blackJackY = this.blackJackTable.getTableBase() + (PokerCard.DEPTH / 2);

        this.blackJackPlayer1 = this.cardDeck.create_card('8_D', 2.1, this.blackJackTable.getTableBase(), -2.8);
        this.windowFrame = new WindowFrame(1,0,0);
        // Dealer
        this.dealerCard1 = this.cardDeck.create_card('10_S', -0.2, blackJackY, -0.8, true);
        this.dealerCard2 = this.cardDeck.create_card(null, 0.3, blackJackY, -0.8, false);

        // Player 1 
        this.blackJackPlayer1Card1 = this.cardDeck.create_card('8_D', -1.4, blackJackY, -2.3, true);
        this.blackJackPlayer1Card1.rotateOnAxis(new THREE.Vector3(0, 0, 1), Math.PI / 8);
        this.blackJackPlayer1Card2 = this.cardDeck.create_card('R_H', -1.6, blackJackY + (PokerCard.DEPTH), -2.5, true);
        this.blackJackPlayer1Card2.rotateOnAxis(new THREE.Vector3(0, 0, 1), Math.PI / 8);

        // Player 2 
        this.blackJackPlayer2Card1 = this.cardDeck.create_card('R_D', 1.4, blackJackY, -2.5, true);
        this.blackJackPlayer2Card1.rotateOnAxis(new THREE.Vector3(0, 0, 1), -Math.PI / 8);
        this.blackJackPlayer2Card2 = this.cardDeck.create_card('A_S', 1.5, blackJackY + (PokerCard.DEPTH), -2.3, true);
        this.blackJackPlayer2Card2.rotateOnAxis(new THREE.Vector3(0, 0, 1), -Math.PI / 8);

        this.moonSpotlight = new MoonSpotlight(roomDimensions.width*4, roomDimensions.height*8, 0);

        // Missing Poker Chips
    }

    initObjects() {
        this.app.scene.add(this.axis);
        this.app.scene.add(this.room);
        
        this.app.scene.add(this.pokerTable);
		this.app.scene.add(this.jukebox);

        this.app.scene.add(this.pokerChair1);
        this.app.scene.add(this.pokerChair2);
        this.app.scene.add(this.pokerChair3);
        this.app.scene.add(this.pokerChair4);


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

        this.app.scene.add(this.blackJackChair1);
        this.app.scene.add(this.blackJackChair2);
        this.app.scene.add(this.blackJackChair3);

        this.blackJackTable.add(this.dealerCard1);
        this.blackJackTable.add(this.dealerCard2);
        this.blackJackTable.add(this.blackJackPlayer1Card1);
        this.blackJackTable.add(this.blackJackPlayer1Card2);
        this.blackJackTable.add(this.blackJackPlayer2Card1);
        this.blackJackTable.add(this.blackJackPlayer2Card2);

        // Add slot machines
        this.app.scene.add(this.slotMachine);
        this.app.scene.add(this.slotMachine2);
        this.app.scene.add(this.slotMachine3);

        this.app.scene.add(this.slotChair1);
        this.app.scene.add(this.slotChair2);
        this.app.scene.add(this.slotChair3);

		this.app.scene.add(this.photoFrame);


        for(let i = 0; i < this.windowFrames.length; i++) {
            //console.log(this.windowFrames[i]);
            this.app.scene.add(this.windowFrames[i]);
        }

        this.initChips();
        
       //this.lamp.position.set(0,5,0);
       this.app.scene.add(this.lamp1);
       this.app.scene.add(this.lamp2);
       this.app.scene.add(this.door);
       //this.app.scene.add(this.windowFrame);   

    	//this.app.scene.add(this.pokerChip);
        //this.app.scene.add(this.card1);

        this.app.scene.add(this.moonSpotlight);
    }

    initLights() {
        // Temporary Ambient Light
        this.ambientLight = new THREE.AmbientLight(0x3f3f3f, 1);
        this.app.scene.add(this.ambientLight);

        // Temporary Directional Light
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        this.directionalLight.position.set(5, 10, 0);
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
    /*
    buildWalls() {
        let wallsMaterialTextured = new THREE.MeshPhongMaterial({
            color: "#dfdbd4",
            specular: "#000000", emissive: "#000000", shininess: 0,
            map: this.newWallTexture
        })

        let wallsMaterialPlain = new THREE.MeshPhongMaterial({
            color: "#dfdbd4",
            specular: "#000000", emissive: "#000000", shininess: 0,
        })

        // Create the walls
        let wall = new THREE.PlaneGeometry(10, 10);
        this.wallMesh1 = new THREE.Mesh(wall, wallsMaterialTextured);
        this.wallMesh1.position.set(0, 5, -5)
        this.app.scene.add(this.wallMesh1);

        this.wallMesh2 = new THREE.Mesh(wall, wallsMaterialPlain);
        this.wallMesh2.position.set(-5, 5, 0)
        this.wallMesh2.rotateY(Math.PI / 2);
        this.app.scene.add(this.wallMesh2);

        this.wallMesh3 = new THREE.Mesh(wall, wallsMaterialPlain);
        this.wallMesh3.position.set(5, 5, 0)
        this.wallMesh3.rotateY(-Math.PI / 2);
        this.app.scene.add(this.wallMesh3);

        this.wallMesh4 = new THREE.Mesh(wall, wallsMaterialPlain);
        this.wallMesh4.position.set(0, 5, 5)
        this.wallMesh4.rotateY(Math.PI);
        this.app.scene.add(this.wallMesh4);

        this.windowQuad = new THREE.Mesh(
            new THREE.PlaneGeometry(8, 4),
            new THREE.MeshPhongMaterial({map: this.windowTexture, transparent: true })
        );
        this.windowQuad.position.set(0, 5, 4.95);
        this.windowQuad.rotateY(Math.PI);
        this.app.scene.add(this.windowQuad);
    }
    */
    initChairTextures(){
        this.pokerChair1.chairMaterial = this.pokerRestMaterial;
        this.pokerChair2.chairMaterial = this.pokerRestMaterial;
        this.pokerChair3.chairMaterial = this.pokerRestMaterial;
        this.pokerChair4.chairMaterial = this.pokerRestMaterial;
        this.slotChair1.chairMaterial = this.pokerRestMaterial;
        this.slotChair2.chairMaterial = this.pokerRestMaterial;
        this.slotChair3.chairMaterial = this.pokerRestMaterial;
        this.blackJackChair1.chairMaterial = this.pokerRestMaterial;
        this.blackJackChair2.chairMaterial = this.pokerRestMaterial;
        this.blackJackChair3.chairMaterial = this.pokerRestMaterial;
    }

    buildObjects() {
        this.pokerTable.build();
        this.pokerChair1.build();   
        this.pokerChair2.build();
        this.pokerChair3.build();
        this.pokerChair4.build();
        this.buildChips();
        this.blackJackTable.build()
        this.lamp1.build();
        this.lamp2.build();
        this.door.build();
        this.windowFrame.build();
        this.slotMachine.build();
        this.slotMachine2.build();
        this.slotMachine3.build();
        this.slotChair1.build();
        this.slotChair2.build();
        this.slotChair3.build();
        this.blackJackChair1.build();
        this.blackJackChair2.build();
        this.blackJackChair3.build();

		this.jukebox.build();

		this.photoFrame.build();

        for(let i = 0; i < this.windowFrames.length; i++) {
            this.windowFrames[i].build();
        }
    }
    initBlackJackTextures() {
        this.blackJack = new THREE.TextureLoader().load('textures/blackJack2.png');
        this.blackJack.wrapS = THREE.RepeatWrapping;
        this.blackJack.wrapT = THREE.RepeatWrapping;

        this.blackJack.repeat.set(1, 2);
        this.blackJack.offset.set(0, 0.55);
        this.blackJack.center.set(0.5, 0.5);

        this.greenFelt = new THREE.MeshPhongMaterial({ map: this.blackJack, shininess: 5, specular: new THREE.Color(0x111111), reflectivity: 0.1 });


        this.blackJackLegs = new THREE.TextureLoader().load('textures/blackMetal.jpg');

        this.blackMetalMaterial = new THREE.MeshPhongMaterial({ map: this.blackJackLegs, side: THREE.DoubleSide,
            color: 0xaaaaaa, shininess: 80,   specular: new THREE.Color(0xffffff), reflectivity: 0.8 });

        this.blackJackTable.outerMaterial = this.pokerRestMaterial;
        this.blackJackTable.legMaterial = this.blackMetalMaterial;
        this.blackJackTable.tableMaterial = this.greenFelt;
    }

    initSlotMachineTextures() {
        //  ---- Slot machine screens 
        this.slotMachineScreenTexture = new THREE.TextureLoader().load('textures/slotMachineScreen.jpg');

        this.slotMachineScreenMaterial = new THREE.MeshPhongMaterial({
            map: this.slotMachineScreenTexture, side: THREE.DoubleSide,
            color: 0xffffff, shininess: 10, specular: new THREE.Color(0x555555), reflectivity: 0.2
        });

        this.slotMachineScreenTexture2 = new THREE.TextureLoader().load('textures/slotMachineEmpireScreen.jpg');

        this.slotMachineScreenMaterial2 = new THREE.MeshPhongMaterial({
            map: this.slotMachineScreenTexture2, side: THREE.DoubleSide,
            color: 0xffffff, shininess: 10, specular: new THREE.Color(0x555555), reflectivity: 0.2
        });

        this.slotMachineScreenTexture3 = new THREE.TextureLoader().load('textures/cosmicQuestScreen.jpg');

        this.slotMachineScreenMaterial3 = new THREE.MeshPhongMaterial({
            map: this.slotMachineScreenTexture3, side: THREE.DoubleSide,
            color: 0xffffff, shininess: 10, specular: new THREE.Color(0x555555), reflectivity: 0.2
        });

        // ----

        this.slotMachineMetalTexture = new THREE.TextureLoader().load('textures/brushedMetal.jpg');

        this.slotMachineMetalMaterial = new THREE.MeshPhongMaterial({
            map: this.slotMachineMetalTexture, side: THREE.DoubleSide,
            color: 0xaaaaaa, shininess: 80, specular: new THREE.Color(0xffffff), reflectivity: 0.8
        });


        this.slotMachineBodyTexture = new THREE.TextureLoader().load('textures/matteBlack.jpg');

        this.slotMachineBodyMaterial = new THREE.MeshPhongMaterial({
            map: this.slotMachineBodyTexture, side: THREE.DoubleSide,
            color: 0x000000, specular: new THREE.Color(0xffffff), reflectivity: 0.9
        });


        // slot machine tops
        this.slotMachineTopTexture = new THREE.TextureLoader().load('textures/topSlotMachine1.png');

        this.slotMachineTopTexture.wrapS = THREE.RepeatWrapping;
        this.slotMachineTopTexture.wrapT = THREE.RepeatWrapping;

        this.slotMachineTopTexture.repeat.set(1, 2);
        this.slotMachineTopTexture.offset.set(0, 0.5);
        this.slotMachineTopTexture.center.set(0.5, 0.5);

        this.slotMachineTopMaterial = new THREE.MeshPhongMaterial({
            map: this.slotMachineTopTexture, transparent: true,
            shininess: 10, specular: new THREE.Color(0x555555), reflectivity: 0.2
        });


        this.slotMachineTopTexture2 = new THREE.TextureLoader().load('textures/goldenEmpireTop.png');
        this.slotMachineTopTexture2.wrapS = THREE.RepeatWrapping;
        this.slotMachineTopTexture2.wrapT = THREE.RepeatWrapping;

        this.slotMachineTopTexture2.repeat.set(1, 2);
        this.slotMachineTopTexture2.offset.set(0, 0.5);
        this.slotMachineTopTexture2.center.set(0.5, 0.5);

        this.slotMachineTopMaterial2 = new THREE.MeshPhongMaterial({
            map: this.slotMachineTopTexture2, transparent: true,
            shininess: 10, specular: new THREE.Color(0x555555), reflectivity: 0.2
        });

        this.slotMachineTopTexture3 = new THREE.TextureLoader().load('textures/comiscQuestTop.jpg');
        this.slotMachineTopTexture3.wrapS = THREE.RepeatWrapping;
        this.slotMachineTopTexture3.wrapT = THREE.RepeatWrapping;

        this.slotMachineTopTexture3.repeat.set(1, 2);
        this.slotMachineTopTexture3.offset.set(0, 0.5);
        this.slotMachineTopTexture3.center.set(0.5, 0.5);

        this.slotMachineTopMaterial3 = new THREE.MeshPhongMaterial({
            map: this.slotMachineTopTexture3, transparent: true,
            shininess: 10, specular: new THREE.Color(0x555555), reflectivity: 0.2
        });



        // ----

        // bottom slot machines
        this.slotMachineBottomTexture = new THREE.TextureLoader().load('textures/bottomSlotMachine.png');

        this.slotMachineBottomMaterial = new THREE.MeshPhongMaterial({
            map: this.slotMachineBottomTexture, side: THREE.DoubleSide,
            color: 0xaaaaaa, shininess: 80, specular: new THREE.Color(0xffffff), reflectivity: 0.8,
        });

        this.slotMachineBottomTexture2 = new THREE.TextureLoader().load('textures/goldenEmpireBottomSlotMachine.jpg');

        this.slotMachineBottomMaterial2 = new THREE.MeshPhongMaterial({
            map: this.slotMachineBottomTexture2, side: THREE.DoubleSide,
            color: 0xaaaaaa, shininess: 80, specular: new THREE.Color(0xffffff), reflectivity: 0.8
        });

        this.slotMachineBottomTexture3 = new THREE.TextureLoader().load('textures/cosmicQuestBottom.jpg');

        this.slotMachineBottomMaterial3 = new THREE.MeshPhongMaterial({
            map: this.slotMachineBottomTexture3, side: THREE.DoubleSide,
            color: 0xaaaaaa, shininess: 80, specular: new THREE.Color(0xffffff), reflectivity: 0.8
        });
        // ----

        this.slotMachineGoldTexture = new THREE.TextureLoader().load('textures/slotGold.jpg');


        this.slotMachineGoldMaterial = new THREE.MeshPhongMaterial({
            map: this.slotMachineGoldTexture,
            side: THREE.DoubleSide,
            color: 0xffff00,
            shininess: 80,
            specular: new THREE.Color(0xffffff),
            reflectivity: 0.8,
        });


        this.oneLineTexture = new THREE.TextureLoader().load('textures/oneLine.png');

        this.oneLineMaterial = new THREE.MeshPhongMaterial({
            map: this.oneLineTexture,
            transparent: true,
            color: 0xffffff,
            alphaTest: 0.2,
            side: THREE.DoubleSide,
        });

        this.threeLinesTexture = new THREE.TextureLoader().load('textures/threeLine.png');

        this.threeLinesMaterial = new THREE.MeshPhongMaterial({
            map: this.threeLinesTexture,
            transparent: true,
            color: 0xffffff,
            alphaTest: 0.2,
            side: THREE.DoubleSide,
        });


        this.fiveLinesTexture = new THREE.TextureLoader().load('textures/fiveLine.png');
        
        this.fiveLinesMaterial = new THREE.MeshPhongMaterial({
            map: this.fiveLinesTexture,
            transparent: true,
            color: 0xffffff,
            alphaTest: 0.2,
            side: THREE.DoubleSide,
        });

        this.sevenLinesTexture = new THREE.TextureLoader().load('textures/sevenLine.png');
        
        this.sevenLinesMaterial = new THREE.MeshPhongMaterial({
            map: this.sevenLinesTexture,
            transparent: true,
            color: 0xffffff,
            alphaTest: 0.2,
            side: THREE.DoubleSide,
        });

        this.nineLinesTexture = new THREE.TextureLoader().load('textures/nineLine.png');
        
        this.nineLinesMaterial = new THREE.MeshPhongMaterial({
            map: this.nineLinesTexture,
            transparent: true,
            color: 0xffffff,
            alphaTest: 0.2,
            side: THREE.DoubleSide,
        });

        this.repeatBetTexture = new THREE.TextureLoader().load('textures/repeatBet.png');

        this.repeatBetMaterial = new THREE.MeshPhongMaterial({
            map: this.repeatBetTexture,
            transparent: true,
            color: 0xffffff,
            alphaTest: 0.2,
            side: THREE.DoubleSide,
        });

        this.insertBillsTexture = new THREE.TextureLoader().load('textures/inserTicketsText.png');
        this.insertBillsMaterial = new THREE.MeshPhongMaterial({
            map: this.insertBillsTexture,
            transparent: true,
            color: 0xffffff,
            alphaTest: 0.2,
            side: THREE.DoubleSide,
        });

        this.slotMachine.slotMachineTopMaterial = this.slotMachineTopMaterial;
        this.slotMachine.slotMachineScreenMaterial = this.slotMachineScreenMaterial;
        this.slotMachine.slotMachineBottomMaterial = this.slotMachineBottomMaterial;

        this.slotMachine2.slotMachineTopMaterial = this.slotMachineTopMaterial2;
        this.slotMachine2.slotMachineScreenMaterial = this.slotMachineScreenMaterial2;
        this.slotMachine2.slotMachineBottomMaterial = this.slotMachineBottomMaterial2;
        

        this.slotMachine3.slotMachineTopMaterial = this.slotMachineTopMaterial3;
        this.slotMachine3.slotMachineScreenMaterial = this.slotMachineScreenMaterial3;
        this.slotMachine3.slotMachineBottomMaterial = this.slotMachineBottomMaterial3;

        // Assign materials to slot machine 1
        this.slotMachine.insertBillsMaterial = this.insertBillsMaterial;
        this.slotMachine.repeatBetMaterial = this.repeatBetMaterial;
        this.slotMachine.oneLineMaterial = this.oneLineMaterial;
        this.slotMachine.threeLinesMaterial = this.threeLinesMaterial;
        this.slotMachine.fiveLinesMaterial = this.fiveLinesMaterial;
        this.slotMachine.sevenLinesMaterial = this.sevenLinesMaterial;
        this.slotMachine.nineLinesMaterial = this.nineLinesMaterial;

        this.slotMachine.slotGoldMaterial = this.slotMachineGoldMaterial;
        this.slotMachine.slotMachineBodyMaterial = this.slotMachineBodyMaterial;
        this.slotMachine.slotMachineMetalMaterial = this.slotMachineMetalMaterial;

        // Assign materials to slot machine 2
        this.slotMachine2.insertBillsMaterial = this.insertBillsMaterial;
        this.slotMachine2.repeatBetMaterial = this.repeatBetMaterial;
        this.slotMachine2.oneLineMaterial = this.oneLineMaterial;
        this.slotMachine2.threeLinesMaterial = this.threeLinesMaterial;
        this.slotMachine2.fiveLinesMaterial = this.fiveLinesMaterial;
        this.slotMachine2.sevenLinesMaterial = this.sevenLinesMaterial;
        this.slotMachine2.nineLinesMaterial = this.nineLinesMaterial;
        
        this.slotMachine2.slotGoldMaterial = this.slotMachineGoldMaterial;
        this.slotMachine2.slotMachineBodyMaterial = this.slotMachineBodyMaterial;
        this.slotMachine2.slotMachineMetalMaterial = this.slotMachineMetalMaterial;

        // Assign materials to slot machine 3
        this.slotMachine3.insertBillsMaterial = this.insertBillsMaterial;
        this.slotMachine3.repeatBetMaterial = this.repeatBetMaterial;
        this.slotMachine3.oneLineMaterial = this.oneLineMaterial;
        this.slotMachine3.threeLinesMaterial = this.threeLinesMaterial;
        this.slotMachine3.fiveLinesMaterial = this.fiveLinesMaterial;
        this.slotMachine3.sevenLinesMaterial = this.sevenLinesMaterial;
        this.slotMachine3.nineLinesMaterial = this.nineLinesMaterial;

        this.slotMachine3.slotGoldMaterial = this.slotMachineGoldMaterial;
        this.slotMachine3.slotMachineBodyMaterial = this.slotMachineBodyMaterial;
        this.slotMachine3.slotMachineMetalMaterial = this.slotMachineMetalMaterial;
    }

	initJukeboxTextures() {
		this.jukebox.woodMaterial = this.pokerRestMaterial;
		this.jukeMainPanel = new THREE.TextureLoader().load('textures/mainpanel.jpg');
        this.mainPanelMaterial = new THREE.MeshPhongMaterial({
            map: this.jukeMainPanel,
			transparent: true,
            color: 0xffffff,
            alphaTest: 0.2,
            side: THREE.DoubleSide,
        });
		this.jukeDomePanel = new THREE.TextureLoader().load('textures/dome.png');
		this.jukeDomePanel.wrapS = THREE.RepeatWrapping;
        this.jukeDomePanel.wrapT = THREE.RepeatWrapping;

        this.jukeDomePanel.repeat.set(1, 2);
        this.jukeDomePanel.offset.set(0, 0.55);
        this.jukeDomePanel.center.set(0.5, 0.5);

        this.domePanelMaterial = new THREE.MeshPhongMaterial({
            map: this.jukeDomePanel,
			transparent: true,
            color: 0xffffff,
            alphaTest: 0.2,
        });

		this.jukebox.mainPanel = this.mainPanelMaterial;
		this.jukebox.domePanel = this.domePanelMaterial;
	}

    initTextures() {
        // load textures
        this.initPokerTextures();
        this.initBlackJackTextures();
        this.initLampTextures(); 
        this.initDoorTextures();
        this.initSlotMachineTextures();
        this.initWindowTextures();
        this.initChairTextures();
		this.initPhotoFrameTextures();
		this.initJukeboxTextures();
    }
    initLampTextures(){
        this.lampShellTexture = new THREE.TextureLoader().load('textures/outerLamp.jpeg');
        this.lampShellTexture.wrapS = THREE.RepeatWrapping;
        this.lampShellTexture.wrapT = THREE.RepeatWrapping;
        this.lampShellTexture.repeat.set(4, 1);
        this.lampShellMaterial = new THREE.MeshPhongMaterial({ map: this.lampShellTexture, side: THREE.DoubleSide,
            color: 0xffffff, shininess: 80,   specular: new THREE.Color(0xffffff), reflectivity: 0.5 });

        this.lampInsideMaterial = new THREE.TextureLoader().load('textures/innerLamp.jpg');
        this.lampInsideMaterial.wrapS = THREE.RepeatWrapping;
        this.lampInsideMaterial.wrapT = THREE.RepeatWrapping;
        this.lampInsideMaterial.repeat.set(16, 16);
        this.lampInsideMaterial = new THREE.MeshPhongMaterial({ map: this.lampInsideMaterial, side: THREE.DoubleSide,
            color: 0xfcf27e, shininess: 80,   specular: new THREE.Color(0xffffff), reflectivity: 0.9, emissive: new THREE.Color(0xfcf9cc), emissiveIntensity: 0.3 });

        this.lamp1.lampShellMaterial = this.lampShellMaterial;
        this.lamp1.lampInsideMaterial = this.lampInsideMaterial;
        this.lamp1.lampSupportMaterial = this.blackMetalMaterial;

        this.lamp2.lampShellMaterial = this.lampShellMaterial;
        this.lamp2.lampInsideMaterial = this.lampInsideMaterial;
        this.lamp2.lampSupportMaterial = this.blackMetalMaterial;
    }

    initDoorTextures(){
        this.doorTexture = new THREE.TextureLoader().load('textures/door.png');
        this.doorTexture.wrapS = THREE.MirroredRepeatWrapping;
        this.doorTexture.wrapT = THREE.RepeatWrapping;
        this.doorTexture.repeat.set(2, 1);
        this.doorTexture.offset.set(1, 0);
        this.doorMaterial = new THREE.MeshPhongMaterial({ map: this.doorTexture, side: THREE.DoubleSide,
            color: 0x964B00, shininess: 80,   specular: new THREE.Color(0xffffff), reflectivity: 0.5 });
        this.door.doorMaterial = this.doorMaterial;
        this.door.doorFrameMaterial = this.pokerRestMaterial;
        
    }

    initPanorama(){
        const panoramaTexture = new THREE.CubeTextureLoader().load([
            'textures/night.png',
            'textures/night.png',
            'textures/night.png',
            'textures/night.png',
            'textures/night.png',
            'textures/night.png'
        ]);

        this.app.scene.background = panoramaTexture;
    }

    initWindowTextures(){
        this.windowFrameMaterial = this.pokerRestMaterial;
        for(let i = 0; i < this.windowFrames.length; i++) {
            this.windowFrames[i].frameMaterial = this.windowFrameMaterial;
        }
    }

	initPhotoFrameTextures() {
        this.photoFrameTexture = new THREE.TextureLoader().load('textures/casinoWantedPoster.png');

        this.photoFrameMaterial = new THREE.MeshPhongMaterial({
            map: this.photoFrameTexture,
            color: 0xffffff, shininess: 10, specular: new THREE.Color(0x555555),
        });

		this.photoFrame.frameMaterial = this.pokerRestMaterial;
		this.photoFrame.photoTexture = this.photoFrameMaterial;
	}

    
    buildChips(){
        // poker chips
        // player 1
        this.pokerP1Tower1 = this.pokerChipHelper.createTower(1.5,this.pokerTable.getTableBase(),2.8,PokerChipValue.TWENTY_FIVE,30, Math.PI/4);
        this.pokerP1Tower2 = this.pokerChipHelper.createTower(1.6,this.pokerTable.getTableBase(),2.6,PokerChipValue.ONE_HUNDRED,10,Math.PI/4*3);
        this.pokerP1Tower3 = this.pokerChipHelper.createTower(1.4,this.pokerTable.getTableBase(),2.6,PokerChipValue.FIVE_HUNDRED,5);
        this.pokerP1SingleChip1 = this.pokerChipHelper.createSingle(1.35,this.pokerTable.getTableBase() + 0.05,2.55,PokerChipValue.FIFTY, Math.PI);
        this.pokerP1SingleChip1.rotateOnAxis(new THREE.Vector3(1,0,-1), Math.PI/8);
        // player 2
        this.pokerP2Tower1 = this.pokerChipHelper.createTower(1.5,this.pokerTable.getTableBase(),-2.5,PokerChipValue.TWENTY_FIVE,20, Math.PI/4);
        this.pokerP2Tower2 = this.pokerChipHelper.createTower(1.6,this.pokerTable.getTableBase(),-2.7,PokerChipValue.FIFTY,30, Math.PI/4*3);
        this.pokerP2Tower3 = this.pokerChipHelper.createTower(1.4,this.pokerTable.getTableBase(),-2.7,PokerChipValue.ONE_HUNDRED,15);
        // player 3
        this.pokerP3Tower1 = this.pokerChipHelper.createTower(-1.5, this.pokerTable.getTableBase(), -2.5, PokerChipValue.FIFTY, 60, Math.PI/3);
        this.pokerP3Tower2 = this.pokerChipHelper.createTower(-1.6, this.pokerTable.getTableBase(), -2.7, PokerChipValue.ONE_HUNDRED, 30, Math.PI/3*2);
        // player 4
        this.pokerP4Tower1 = this.pokerChipHelper.createTower(-1.5, this.pokerTable.getTableBase(), 2.6, PokerChipValue.FIFTY, 10, Math.PI/3);
        this.pokerP4Tower2 = this.pokerChipHelper.createTower(-1.55, this.pokerTable.getTableBase(), 2.85, PokerChipValue.ONE_HUNDRED, 5, Math.PI/3*2);
        this.pokerP4Tower3 = this.pokerChipHelper.createTower(-1.35, this.pokerTable.getTableBase(), 2.7, PokerChipValue.FIVE_HUNDRED, 2, Math.PI/3*3);
        this.pokerP4Tower4 = this.pokerChipHelper.createTower(-1.7, this.pokerTable.getTableBase(), 2.7, PokerChipValue.TWENTY_FIVE, 20, Math.PI/3*4);

        // black jack table
        this.blackJackP1Tower1 = this.pokerChipHelper.createTower(-2.5,this.blackJackTable.getTableBase(),-2.7,PokerChipValue.TWENTY_FIVE,20, Math.PI/4);
        this.blackJackP1Tower2 = this.pokerChipHelper.createTower(-2.5,this.blackJackTable.getTableBase(),-2.5,PokerChipValue.ONE_HUNDRED,40, Math.PI/4*3);
        this.blackJackP1Tower3 = this.pokerChipHelper.createTower(-2.3,this.blackJackTable.getTableBase(),-2.7,PokerChipValue.FIFTY,24);
        this.blackJackSingleChip1 = this.pokerChipHelper.createSingle(-1.70,this.blackJackTable.getTableBase() + 0.05,-3.1,PokerChipValue.FIFTY, Math.PI);
        this.blackJackSingleChip1.rotateOnAxis(new THREE.Vector3(1,0,-1), Math.PI/12);
        this.blackJackSingleChip2 = this.pokerChipHelper.createSingle(-1.65,this.blackJackTable.getTableBase() + 0.05,-3.0,PokerChipValue.ONE_HUNDRED, Math.PI);


        this.blackJackP2Tower1 = this.pokerChipHelper.createTower(2.2,this.blackJackTable.getTableBase(),-2.5,PokerChipValue.TWENTY_FIVE,16, Math.PI/4);
        this.blackJackP2Tower2 = this.pokerChipHelper.createTower(2.4,this.blackJackTable.getTableBase(),-2.7,PokerChipValue.FIFTY,8, Math.PI/4*3);
        this.blackJackP2Tower3 = this.pokerChipHelper.createTower(2.2,this.blackJackTable.getTableBase(),-2.7,PokerChipValue.ONE_HUNDRED,4);
        this.blackJackP2Tower4 = this.pokerChipHelper.createTower(1.5,this.blackJackTable.getTableBase(),-2.9,PokerChipValue.FIVE_HUNDRED,30);
        this.blackJackP2Tower5 = this.pokerChipHelper.createTower(1.7,this.blackJackTable.getTableBase(),-3.05,PokerChipValue.ONE_HUNDRED,10);
        this.blackJackSingleChip3 = this.pokerChipHelper.createSingle(1.6,this.blackJackTable.getTableBase() + 0.05,-3.15,PokerChipValue.ONE_HUNDRED, Math.PI);
        this.blackJackSingleChip3.rotateOnAxis(new THREE.Vector3(1,0,-1), Math.PI/6);


    }

    initChips(){

        // player 1
        this.pokerTable.add(this.pokerP1Tower1);
        this.pokerTable.add(this.pokerP1Tower2);
        this.pokerTable.add(this.pokerP1Tower3);
        this.pokerTable.add(this.pokerP1SingleChip1);
        // player 2
        this.pokerTable.add(this.pokerP2Tower1);
        this.pokerTable.add(this.pokerP2Tower2);
        this.pokerTable.add(this.pokerP2Tower3);
        // player 3
        this.pokerTable.add(this.pokerP3Tower1);
        this.pokerTable.add(this.pokerP3Tower2);
        // player 4
        this.pokerTable.add(this.pokerP4Tower1);
        this.pokerTable.add(this.pokerP4Tower2);
        this.pokerTable.add(this.pokerP4Tower3);
        this.pokerTable.add(this.pokerP4Tower4);


        // black jack table
        this.blackJackTable.add(this.blackJackP1Tower1);
        this.blackJackTable.add(this.blackJackP1Tower2);
        this.blackJackTable.add(this.blackJackP1Tower3);
        this.blackJackTable.add(this.blackJackSingleChip1);
        this.blackJackTable.add(this.blackJackSingleChip2);

        this.blackJackTable.add(this.blackJackP2Tower1);
        this.blackJackTable.add(this.blackJackP2Tower2);
        this.blackJackTable.add(this.blackJackP2Tower3);
        this.blackJackTable.add(this.blackJackP2Tower4);
        this.blackJackTable.add(this.blackJackP2Tower5);
        this.blackJackTable.add(this.blackJackSingleChip3);

    }


    /**
     * initializes the contents
     */
    init() {
        this.initTextures();
        this.buildObjects();
        this.initLights();
        this.initObjects();
        this.initPanorama();
    }

    enableAxis(value){
        this.axis.visible = value;
    }


    updateWallTextureRepeatS(value) {
        this.newWallTexture.repeat.set(value, this.wallParams.repeatT);
        this.newWallTexture.needsUpdate = true;
    }

    updateWallTextureRepeatT(value) {
        this.newWallTexture.repeat.set(this.wallParams.repeatS, value);
        this.newWallTexture.needsUpdate = true;
    }

	updateLamp1Power(value) {
		this.lamp1.spotLight.power = value;
		this.lamp1.pointLight.power = value * 0.6;
		// this.lamp1.needsUpdate = true;
	}

	updateLamp2Power(value) {
		this.lamp2.spotLight.power = value;
		this.lamp2.pointLight.power = value * 0.6;
		// this.lamp2.needsUpdate = true;
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
