import * as THREE from 'three';

class BlackJackTable extends THREE.Object3D {
  constructor(x, y, z, ang = 0) {
    super();
    this.position.set(x, y, z);
    this.rotation.y = ang;
    this.initMaterials();
    this.initConstants();
  }

  initMaterials() {
    this.tableMaterial = null;
    this.outerMaterial = null
    this.legMaterial = null
  }

  initConstants() {
    this.tableRadius = 4;
    this.tableThickness = 0.2; 
    this.ringWidth = 0.4; 
    this.torusTube = 0.15;
    this.legHeight = 3;
    this.tableFeltBase = this.legHeight + this.tableThickness + 0.01;
  }

  getTableBase(){
    return this.tableFeltBase;
  }

  build() {
    // --- Felt Surface ---
    const feltGeom = new THREE.CircleGeometry(this.tableRadius + 0.02, 64, 0, Math.PI); 
    const felt = new THREE.Mesh(feltGeom, this.tableMaterial);
    felt.rotation.x = -Math.PI / 2;
    felt.position.y = this.tableFeltBase;
    this.add(felt);

    // --- Outer Wooden Ring 
    const outerRingShape = new THREE.Shape();
    outerRingShape.absarc(0, 0, this.tableRadius + this.ringWidth, 0, Math.PI, false);
    outerRingShape.lineTo(-this.tableRadius - this.ringWidth, 0);
    
    const hole = new THREE.Path();
    hole.absarc(0, 0, this.tableRadius, 0, Math.PI, false);
    hole.lineTo(-this.tableRadius, 0);
    outerRingShape.holes.push(hole);
    
    const extrudeSettings = {
      steps: 1,
      depth: this.tableThickness,
      bevelEnabled: false,
    };

    const ringGeom = new THREE.ExtrudeGeometry(outerRingShape, extrudeSettings);
    const ring = new THREE.Mesh(ringGeom, this.outerMaterial);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = this.legHeight + this.tableThickness;
    ring.position.z -= 0.01;
    this.add(ring);

    // --- Outer Wooden Rim 
    const torusGeom = new THREE.TorusGeometry(
      this.tableRadius + this.ringWidth - this.ringWidth/3 + 0.04,
      this.torusTube,
      16,
      100,
      Math.PI
    );
    
    const torus = new THREE.Mesh(torusGeom, this.outerMaterial);
    torus.rotation.x = -Math.PI / 2;
    torus.position.y = this.legHeight + 3 * this.tableThickness / 2;
    this.add(torus);

    // --- Straight Edge Trim ---
    const edgeGeom = new THREE.BoxGeometry((this.tableRadius + this.ringWidth) * 2 + 0.1,
      this.tableThickness,
      this.torusTube * 2
    );
    const edge = new THREE.Mesh(edgeGeom, this.outerMaterial);
    edge.rotation.x = Math.PI / 2;
    edge.position.y = this.legHeight + this.torusTube * 2;
    this.add(edge);

    // --- Table Support
    const extrudeSettingsUnderFelt = {
      steps: 1,
      depth: -this.legHeight,
      bevelEnabled: false,
    };

    const underFeltShape = new THREE.Shape();
    underFeltShape.absarc(0, 0, this.tableRadius, 0, Math.PI, false);
    underFeltShape.lineTo(-this.tableRadius, 0);

    const underFeltGeom = new THREE.ExtrudeGeometry(underFeltShape, extrudeSettingsUnderFelt);
    const underFelt = new THREE.Mesh(underFeltGeom, this.legMaterial);
    underFelt.rotation.x = -Math.PI / 2;
    underFelt.position.y = this.legHeight + this.tableThickness;
    this.add(underFelt);
  }
}

export { BlackJackTable };
