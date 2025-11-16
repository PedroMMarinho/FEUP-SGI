import * as THREE from 'three';
import { TextureManager } from '../../managers/TextureManager.js';

class TerrainSegment extends THREE.Object3D {
  constructor(width = 10, height = 10, widthSegments = 64, heightSegments = 64) {
    super();

    this.width = width;
    this.height = height;
    this.widthSegments = widthSegments;
    this.heightSegments = heightSegments;
    this.displacementScale = 3.0;
    this.displacementRepeat = 4.0;

    // --- Geometry ---
    const geometry = new THREE.PlaneGeometry(width, height, widthSegments, heightSegments);

    // --- Textures ---
    const textureManager = TextureManager.getInstance();

    const sandTexture = textureManager.getTexture('sand');
    sandTexture.wrapS = sandTexture.wrapT = THREE.RepeatWrapping;
    sandTexture.repeat.set(16, 16);

    const sandNormal = textureManager.getTexture('sand-normal');
    sandNormal.wrapS = sandNormal.wrapT = THREE.RepeatWrapping;
    sandNormal.repeat.set(16, 16);

    const displacementMap = textureManager.getTexture('sand-noise');
    displacementMap.wrapS = displacementMap.wrapT = THREE.RepeatWrapping;
    displacementMap.repeat.set(this.displacementRepeat, this.displacementRepeat);
    this.displacementMap = displacementMap;

    // --- Material ---
    const material = new THREE.MeshStandardMaterial({
      map: sandTexture,
      normalMap: sandNormal,
      roughness: 1,
      metalness: 0,
      side: THREE.DoubleSide,
    });

    // --- Apply CPU-side displacement ---
    this.applyDisplacementToGeometry(geometry, displacementMap);

    // --- Mesh ---
    this.terrain = new THREE.Mesh(geometry, material);
    this.terrain.position.y = -0.01;
    this.terrain.rotation.x = -Math.PI / 2;
    this.add(this.terrain);
  }

  applyDisplacementToGeometry(geometry, displacementMap) {
    const image = displacementMap.image;
    if (!image) {
      console.warn('Displacement map not loaded yet.');
      return;
    }

    // Sample height data from image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);
    const imgData = ctx.getImageData(0, 0, image.width, image.height).data;
    const heightData = new Float32Array(image.width * image.height);
    for (let i = 0; i < heightData.length; i++) {
      heightData[i] = imgData[i * 4] / 255; // grayscale value
    }

    // Helper for bilinear sampling
    const sampleHeight = (u, v) => {
      u = (u * this.displacementRepeat) % 1;
      v = (v * this.displacementRepeat) % 1;
      if (u < 0) u += 1;
      if (v < 0) v += 1;

      const x = u * (image.width - 1);
      const y = v * (image.height - 1);
      const x0 = Math.floor(x);
      const y0 = Math.floor(y);
      const x1 = (x0 + 1) % image.width;
      const y1 = (y0 + 1) % image.height;
      const dx = x - x0;
      const dy = y - y0;

      const i00 = y0 * image.width + x0;
      const i10 = y0 * image.width + x1;
      const i01 = y1 * image.width + x0;
      const i11 = y1 * image.width + x1;

      const h00 = heightData[i00];
      const h10 = heightData[i10];
      const h01 = heightData[i01];
      const h11 = heightData[i11];

      const h0 = h00 * (1 - dx) + h10 * dx;
      const h1 = h01 * (1 - dx) + h11 * dx;
      return h0 * (1 - dy) + h1 * dy;
    };

    // Displace vertices in local Y (plane’s Z before rotation)
    const pos = geometry.attributes.position;
    const uv = geometry.attributes.uv;
    const vertex = new THREE.Vector3();
    const displacedHeights = new Float32Array(pos.count);

    for (let i = 0; i < pos.count; i++) {
      const u = uv.getX(i);
      const v = uv.getY(i);
      const h = sampleHeight(u, v) * this.displacementScale;
      displacedHeights[i] = h;
      vertex.fromBufferAttribute(pos, i);
      pos.setZ(i, h);
    }

    pos.needsUpdate = true;
    geometry.computeVertexNormals();

    this.vertexHeights = displacedHeights;
    this.geometry = geometry;
  }

  /**
   * Returns accurate terrain height using actual displaced vertex data.
   */
  getHeightAt(x, z) {
    if (!this.geometry || !this.vertexHeights) return 0;

    // Map world-space (x,z) to local plane coordinates
    const halfW = this.width / 2;
    const halfH = this.height / 2;

    const lx = ((x + halfW) / this.width) * this.widthSegments;
    const lz = ((z + halfH) / this.height) * this.heightSegments;

    const gx = Math.floor(lx);
    const gz = Math.floor(lz);

    // Clamp to grid
    const nx = this.widthSegments + 1;
    const nz = this.heightSegments + 1;
    const i0 = gz * nx + gx;
    const i1 = gz * nx + (gx + 1);
    const i2 = (gz + 1) * nx + gx;
    const i3 = (gz + 1) * nx + (gx + 1);

    if (gx < 0 || gz < 0 || gx + 1 >= nx || gz + 1 >= nz) return 0;

    const fx = lx - gx;
    const fz = lz - gz;

    // Triangle-based interpolation (two tris per grid square)
    let h;
    if (fx + fz <= 1) {
      // Upper-left tri (i0, i1, i2)
      h =
        this.vertexHeights[i0] * (1 - fx - fz) +
        this.vertexHeights[i1] * fx +
        this.vertexHeights[i2] * fz;
    } else {
      // Lower-right tri (i3, i1, i2)
      h =
        this.vertexHeights[i3] * (fx + fz - 1) +
        this.vertexHeights[i1] * (1 - fz) +
        this.vertexHeights[i2] * (1 - fx);
    }

    return h;
  }
}

export { TerrainSegment };
