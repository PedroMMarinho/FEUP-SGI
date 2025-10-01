import { PokerCard } from './PokerCard.js';
import * as THREE from 'three';

class CardDeck {
  constructor() {
    this.suits = ['D', 'H', 'S', 'C'];
    this.values = ['R', 'D', 'V', '10', '9', '8', '7', '6', '5', '4', '3', '2', 'A'];
    this.availableCards = [];
    this.backCardTexture = new THREE.TextureLoader().load(`textures/cards/back.png`);

    this.cardPileSideTexture = new THREE.TextureLoader().load(`textures/cards/side.png`);
    this.cardPileSideTexture.wrapS = THREE.RepeatWrapping;
    this.cardPileSideTexture.wrapT = THREE.RepeatWrapping;
    this.cardPileSideTexture.minFilter = THREE.LinearFilter; 
    this.cardPileSideTexture.magFilter = THREE.NearestFilter; 
    this.cardPileSideTexture.anisotropy = 16;

    this.cardPileSideTextureRotated = this.cardPileSideTexture.clone();
    this.cardPileSideTextureRotated.rotation = Math.PI / 2;
    

    for (let suit of this.suits) {
      for (let value of this.values) {
        this.availableCards.push(`${value}_${suit}`);
      }
    }
  }

  create_card_pile(x, y, z) {

  if (this.availableCards.length === 0) {
    console.warn("No cards available to create a pile!");
    return null;
  }
  
  const cardCount = Math.floor(this.availableCards.length / 8);

  this.cardPileSideTexture.repeat.set(cardCount - 1, cardCount - 1);
  this.cardPileSideTextureRotated.repeat.set(cardCount - 1, cardCount - 1);

  

  const pileDepth = PokerCard.DEPTH * cardCount;
  const pileGeometry = new THREE.BoxGeometry(PokerCard.WIDTH, PokerCard.HEIGHT, pileDepth);


  const sideMaterial = new THREE.MeshPhongMaterial({ map: this.cardPileSideTexture,shininess: 10, 
    specular: new THREE.Color(0x222222), 
    side: THREE.DoubleSide });

  const backMaterial = new THREE.MeshPhongMaterial({ map: this.backCardTexture, shininess: 15,
    specular: new THREE.Color(0x333333) });

  const sideMaterialRotated = new THREE.MeshPhongMaterial({ map: this.cardPileSideTextureRotated,shininess: 10,
    specular: new THREE.Color(0x222222) });

  const bottomMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });

  const materials = [
    sideMaterialRotated, // left
    sideMaterialRotated, // right
    sideMaterial, // top edge
    sideMaterial, // bottom edge
    backMaterial, // top 
    bottomMaterial // bottom
  ];

  const pileMesh = new THREE.Mesh(pileGeometry, materials);
  pileMesh.rotation.x = -Math.PI / 2;
  pileMesh.position.set(x, y, z);

  return pileMesh;
}


  create_card(name = null, x, y, z, faceUp = true) {
    let cardName;

    if (!name) {
      if (this.availableCards.length === 0) {
        console.warn("No cards left in the deck!");
        return null;
      }
      const idx = Math.floor(Math.random() * this.availableCards.length);
      cardName = this.availableCards.splice(idx, 1)[0];
    } else {
      const idx = this.availableCards.indexOf(name);
      if (idx === -1) {
        console.warn(`Card ${name} is not available!`);
        return null;
      }
      this.availableCards.splice(idx, 1); 
      cardName = name;
    }

    // Create card
    const myCard = new PokerCard(cardName, this.backCardTexture, x,y,z, faceUp );

    
    return myCard;
  }
}

export { CardDeck };
