import * as THREE from "three";
import { TimeManager } from "../../managers/TimeManager.js";
import { TextureManager } from "../../managers/TextureManager.js";

export class MarineSnow extends THREE.Group {
  constructor(particleCount = 1000, bounds = { width: 100, height: 100, depth: 100 }, heightAt = null) {
    super();

    this.bounds = bounds;
    this.particleCount = particleCount; 
    
    this.getHeightAt = heightAt; 

    this.timeManager = TimeManager.getInstance();
    this.textureManager = TextureManager.getInstance();
    
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    this._particleData = [];

    // Initialize particles
    for (let i = 0; i < this.particleCount; i++) {
      const x = (Math.random() - 0.5) * this.bounds.width;
      const z = (Math.random() - 0.5) * this.bounds.depth;
      const y = Math.random() * this.bounds.height; 
      
      positions.push(x, y, z);

      // Store separate drift components so we can reverse them individually
      this._particleData.push({
        velocityY: 0.2 + Math.random() * 0.5,
        driftX: (Math.random() - 0.5) * 0.2, 
        driftZ: (Math.random() - 0.5) * 0.2, 
        swayFreq: 0.5 + Math.random(),
        swayOffset: Math.random() * Math.PI
      });
    }
    
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    
    const texture = this.textureManager.getTexture("sand-particle") || null;
    const material = new THREE.PointsMaterial({
      color: 0xffffff, size: 0.2, map: texture, transparent: true, 
      opacity: 0.6, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    
    this.points = new THREE.Points(geometry, material);
    this.add(this.points);
  }

  updateState() {
    if (!this.points) return;

    const positions = this.points.geometry.attributes.position.array;
    const timeScale = this.timeManager.getElapsedTime() * 0.001;

    const halfWidth = this.bounds.width / 2;
    const halfDepth = this.bounds.depth / 2;
    const topY = this.bounds.height;

    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3;
      
      let px = positions[i3];
      let py = positions[i3 + 1];
      let pz = positions[i3 + 2];

      const data = this._particleData[i];

      // --- 1. MOVEMENT ---
      // Gravity
      py -= data.velocityY;

      // Base Drift (Directional movement)
      px += data.driftX;
      pz += data.driftZ;

      // Sway (Visual noise on top of drift)
      // Note: We add sway only to position, not drift, so it doesn't affect reflection logic
      const sway = Math.sin(timeScale * data.swayFreq + data.swayOffset) * 0.05;
      px += sway;
      pz += sway;

      // --- 2. WALL REFLECTION (Bounce) ---
      // Check X walls
      if (px > halfWidth) {
        px = halfWidth;       
        data.driftX *= -1;    
      } else if (px < -halfWidth) {
        px = -halfWidth;
        data.driftX *= -1;
      }

      // Check Z walls
      if (pz > halfDepth) {
        pz = halfDepth;
        data.driftZ *= -1;
      } else if (pz < -halfDepth) {
        pz = -halfDepth;
        data.driftZ *= -1;
      }

      let floorY = 0; 
      if (this.getHeightAt) {
          floorY = this.getHeightAt(px, pz);
      }

      if (py < floorY) {
        py = topY; 
        
        px = (Math.random() - 0.5) * this.bounds.width;
        pz = (Math.random() - 0.5) * this.bounds.depth;
        
        data.driftX = (Math.random() - 0.5) * 0.2;
        data.driftZ = (Math.random() - 0.5) * 0.2;
      }

      // --- 4. UPDATE ARRAY ---
      positions[i3] = px;
      positions[i3 + 1] = py;
      positions[i3 + 2] = pz;
    }

    this.points.geometry.attributes.position.needsUpdate = true;
  }
}