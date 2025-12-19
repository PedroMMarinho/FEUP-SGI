import * as THREE from 'three';
import { TextureManager } from '../../managers/TextureManager.js';

class TerrainSegment extends THREE.Object3D {
  constructor(width = 10, height = 10, widthSegments = 64, heightSegments = 64) {
    super();

    // BVH parameters
    this.rootObject = true;
    this.bvhSelectable = false;

    this.width = width;
    this.height = height;
    this.widthSegments = widthSegments;
    this.heightSegments = heightSegments;

    this.displacementScale = 3.0;
    this.displacementRepeat = 4.0;

    // Rift parameters
    this.riftScale = 10.0;
    this.riftRepeat = 1.0;
    this.riftThreshold = 0.55; // >= means "inside rift"

    // Geometry
    const geometry = new THREE.PlaneGeometry(
      width,
      height,
      widthSegments,
      heightSegments
    );

    // Textures
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

    const riftMap = textureManager.getTexture('rift-map');
    riftMap.wrapS = riftMap.wrapT = THREE.RepeatWrapping;
    riftMap.repeat.set(this.riftRepeat, this.riftRepeat);

    // Material
    const material = new THREE.MeshStandardMaterial({
      map: sandTexture,
      normalMap: sandNormal,
      roughness: 1,
      metalness: 0,
      side: THREE.DoubleSide,
    });

    // Apply CPU displacement
    this.applyDisplacementToGeometry(
      geometry,
      displacementMap,
      riftMap
    );

    // Mesh
    this.terrain = new THREE.Mesh(geometry, material);
    this.terrain.position.y = -0.01;
    this.terrain.rotation.x = -Math.PI / 2;
    this.add(this.terrain);
  }

  applyDisplacementToGeometry(geometry, noiseMap, riftMap) {
    const noiseImage = noiseMap.image;
    if (!noiseImage) {
      console.warn('Noise map not loaded');
      return;
    }

    const noiseData = this._processHeightMap(noiseImage);
    const noiseSample = this._createHeightSampler(
      noiseImage,
      noiseData,
      this.displacementRepeat
    );

    const riftImage = riftMap.image;
    const riftData = riftImage ? this._processHeightMap(riftImage) : null;
    const riftSample = riftImage
      ? this._createHeightSampler(riftImage, riftData, this.riftRepeat)
      : null;

    const pos = geometry.attributes.position;
    const uv = geometry.attributes.uv;

    const heights = new Float32Array(pos.count);
    const riftValues = new Float32Array(pos.count);

    for (let i = 0; i < pos.count; i++) {
      const u = uv.getX(i);
      const v = uv.getY(i);

      let height = 0;

      const noiseH = noiseSample(u, v);
      height += noiseH * this.displacementScale;

      let riftValue = 0;
      if (riftSample) {
        const riftH = riftSample(u, v);
        riftValue = riftH;

        const riftAdjusted = riftH - 1.0;
        height += riftAdjusted * this.riftScale;
      }

      heights[i] = height;
      riftValues[i] = riftValue;

      pos.setZ(i, height);
    }

    pos.needsUpdate = true;
    geometry.computeVertexNormals();

    this.vertexHeights = heights;
    this.vertexRiftValues = riftValues;
    this.geometry = geometry;
  }

  _processHeightMap(image) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);

    const data = ctx.getImageData(
      0,
      0,
      image.width,
      image.height
    ).data;

    const heightData = new Float32Array(image.width * image.height);

    for (let i = 0; i < heightData.length; i++) {
      heightData[i] = data[i * 4] / 255;
    }

    return heightData;
  }

  _createHeightSampler(image, heightData, repeat) {
    const w = image.width;
    const h = image.height;

    return (u, v) => {
      u = (u * repeat) % 1;
      v = (v * repeat) % 1;
      if (u < 0) u += 1;
      if (v < 0) v += 1;

      const x = u * (w - 1);
      const y = v * (h - 1);

      const x0 = Math.floor(x);
      const y0 = Math.floor(y);
      const x1 = (x0 + 1) % w;
      const y1 = (y0 + 1) % h;

      const dx = x - x0;
      const dy = y - y0;

      const i00 = y0 * w + x0;
      const i10 = y0 * w + x1;
      const i01 = y1 * w + x0;
      const i11 = y1 * w + x1;

      const h00 = heightData[i00];
      const h10 = heightData[i10];
      const h01 = heightData[i01];
      const h11 = heightData[i11];

      const h0 = h00 * (1 - dx) + h10 * dx;
      const h1 = h01 * (1 - dx) + h11 * dx;

      return h0 * (1 - dy) + h1 * dy;
    };
  }

  /**
   * Returns terrain height AND rift zone membership
   */
  getHeightAt(x, z) {
    if (!this.vertexHeights || !this.vertexRiftValues) {
      return { height: 0, inRiftZone: false };
    }

    const halfW = this.width / 2;
    const halfH = this.height / 2;

    const lx = ((x + halfW) / this.width) * this.widthSegments;
    const lz = ((z + halfH) / this.height) * this.heightSegments;

    const gx = Math.floor(lx);
    const gz = Math.floor(lz);

    if (
      gx < 0 ||
      gz < 0 ||
      gx >= this.widthSegments ||
      gz >= this.heightSegments
    ) {
      return { height: 0, inRiftZone: false };
    }

    const nx = this.widthSegments + 1;

    const i0 = gz * nx + gx;
    const i1 = gz * nx + (gx + 1);
    const i2 = (gz + 1) * nx + gx;
    const i3 = (gz + 1) * nx + (gx + 1);

    const fx = lx - gx;
    const fz = lz - gz;

    let height, rift;

    if (fx + fz <= 1) {
      height =
        this.vertexHeights[i0] * (1 - fx - fz) +
        this.vertexHeights[i1] * fx +
        this.vertexHeights[i2] * fz;

      rift =
        this.vertexRiftValues[i0] * (1 - fx - fz) +
        this.vertexRiftValues[i1] * fx +
        this.vertexRiftValues[i2] * fz;
    } else {
      height =
        this.vertexHeights[i3] * (fx + fz - 1) +
        this.vertexHeights[i1] * (1 - fz) +
        this.vertexHeights[i2] * (1 - fx);

      rift =
        this.vertexRiftValues[i3] * (fx + fz - 1) +
        this.vertexRiftValues[i1] * (1 - fz) +
        this.vertexRiftValues[i2] * (1 - fx);
    }

    return {
      height,
      inRiftZone: rift <= this.riftThreshold,
    };
  }
}

export { TerrainSegment };
