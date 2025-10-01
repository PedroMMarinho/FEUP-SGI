import * as THREE from 'three';

class PokerCard extends THREE.Object3D {
    static WIDTH = 0.4;
    static HEIGHT = 0.7;
    static DEPTH = 0.02;

  constructor(name, backTexture, x, y, z, faceUp) {
    super();
    this.name = name;
    
    this.position.set(x, y, z);

    const sideMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });

    let frontMaterial = null;

    if (faceUp){
        frontMaterial = new THREE.MeshPhongMaterial({ map: new THREE.TextureLoader().load(`textures/cards/${name}.png`), shininess: 15,
    specular: new THREE.Color(0x222222)
   });
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
      new THREE.MeshPhongMaterial({ map: backTexture })   // back
    ];

    this.createCard(materials);
  }




  createCard(materials) {
    const cardGeometry = new THREE.BoxGeometry(PokerCard.WIDTH, PokerCard.HEIGHT, PokerCard.DEPTH);
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
