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

    this.heightData = null; // Cached pixel data for height lookups

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
      displacementMap,
      displacementScale: this.displacementScale,
      roughness: 1,
      metalness: 0,
      side: THREE.DoubleSide,
    });

    //--- Mesh ---
    this.terrain = new THREE.Mesh(geometry, material);
    this.terrain.position.y = -0.01;
    this.terrain.rotation.x = -Math.PI / 2;
    this.add(this.terrain);

    this.cacheHeightData();
  }

  cacheHeightData() {
    const image = this.displacementMap.image;
    if (!image) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);

    // Only store red channel (since grayscale)
    const imgData = ctx.getImageData(0, 0, image.width, image.height).data;
    const heightData = new Float32Array(image.width * image.height);
    for (let i = 0; i < heightData.length; i++) {
      heightData[i] = imgData[i * 4] / 255; // normalize 0–1
    }

    this.heightData = heightData;
    this.imageWidth = image.width;
    this.imageHeight = image.height;
  }

  /**
   * Returns terrain height (Y) for world-space X, Z coordinates.
   */
  getHeightAt(x, z) {
    if (!this.heightData) return 0;

    const { width, height, imageWidth, imageHeight } = this;

    // Map world position to UV coordinates (0–1 range)
    let u = (x / width + 0.5) * this.displacementRepeat;
    let v = (z / height + 0.5) * this.displacementRepeat;

    // Wrap if repeat wrapping is enabled
    u = u - Math.floor(u);
    v = v - Math.floor(v);

    // Convert to pixel coords
    const ix = Math.floor(u * (imageWidth - 1));
    const iy = Math.floor(v * (imageHeight - 1));
    const index = iy * imageWidth + ix;

    const heightValue = this.heightData[index] * this.displacementScale;

    return heightValue;
  }
}

export { TerrainSegment };
