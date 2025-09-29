import * as THREE from 'three';

class PokerCard extends THREE.Object3D {
  constructor(name, backTexture, x, y, z, faceUp) {
    super();
    this.name = name;

    this.position.set(x, y, z);

    this.initConstants();

    const sideMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

    let frontMaterial = null;

    if (faceUp){
        frontMaterial = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load(`textures/cards/${name}.png`) });
        this.rotation.x = -Math.PI/2;
    }else {
      frontMaterial = sideMaterial;
      this.rotation.x = Math.PI/2;
    }
    
    

    const materials = [
      sideMaterial,
      sideMaterial,
      sideMaterial,
      sideMaterial,
      frontMaterial,
      new THREE.MeshBasicMaterial({ map: backTexture })   // back
    ];

    this.createCard(materials);
  }


  initConstants(){
    this.width = 0.8;
    this.height = 1.4;
    this.depth = 0.02;
  }


  createCard(materials) {
    const cardGeometry = new THREE.BoxGeometry(this.width, this.height, this.depth);
    this.mesh = new THREE.Mesh(cardGeometry, materials);
    this.add(this.mesh);
  }

  getMesh(){
    return this.mesh;
  }


  getName() {
    return this.name;
  }

}

export { PokerCard };
