import { PokerCard } from './PokerCard.js';
import * as THREE from 'three';

class CardDeck {
  constructor() {
    this.suits = ['D', 'H', 'S', 'C'];
    this.values = ['R', 'D', 'V', '10', '9', '8', '7', '6', '5', '4', '3', '2', 'A'];
    this.availableCards = [];
    this.backCardTexture = new THREE.TextureLoader().load(`textures/cards/back.png`);

    for (let suit of this.suits) {
      for (let value of this.values) {
        this.availableCards.push(`${value}_${suit}`);
      }
    }
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
