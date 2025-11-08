import * as THREE from 'three';
import { RockGroup } from '../rock/RockGroup.js';
import { CoralGroup } from '../coral/CoralGroup.js';
import { TerrainSegment } from '../terrainSegment/TerrainSegment.js';
import { ShellGroup } from '../shell/ShellGroup.js';

class Seabed extends THREE.Object3D {
	constructor(
		terrainSize = 30,
		rockCount = 30,
		coralCount = 40,
        shellCount = 50,
		rockModels = [],
        shellModels = [],
		distanceRange = [0.005, 0.1],
	) {
		super();
		this.terrain = null;
		this.terrainSize = terrainSize;

        // Counts of various objects
		this.rockCount = rockCount;
        this.shellCount = shellCount;
		this.coralCount = coralCount;


        // Models 
		this.rockModels = rockModels;
		this.shellModels = shellModels;


		this.distanceRange = distanceRange;
		this.marginFactor = 0.96; // to avoid placing objects too close to the edge

		this.globalPositions = [];

		this.init();
	}

	init() {
		this.createTerrain();
		this.createRockGroup();
		this.createCoralGroup();
        this.createShellGroup();
	}

	createTerrain() {
		const terrain = new TerrainSegment(this.terrainSize, this.terrainSize);
		this.terrain = terrain;
		this.add(terrain);
	}

	createRockGroup() {
		const rockPositions = this.computePositions(this.rockCount);
		const rockGroup = new RockGroup(rockPositions, this.rockModels);
		this.add(rockGroup);
		this.globalPositions.push(...rockPositions);
	}

	createCoralGroup() {
		const coralPositions = this.computePositions(this.coralCount);
		const coralGroup = new CoralGroup(coralPositions);
		this.add(coralGroup);
		this.globalPositions.push(...coralPositions);
	}

    createShellGroup() {
        const shellPositions = this.computePositions(this.shellCount);
        const shellGroup = new ShellGroup(shellPositions, this.shellModels);
        this.add(shellGroup);
        this.globalPositions.push(...shellPositions);
    }

	computePositions(count, maxTries = 50) {
		const positions = [];

		// 👇 shrink available placement area by marginFactor
		const effectiveSize = this.terrainSize * this.marginFactor;
		const halfSize = effectiveSize / 2;

		for (let i = 0; i < count; i++) {
			const minDist = THREE.MathUtils.randFloat(...this.distanceRange);
			let pos, tries = 0;

			do {
				const x = THREE.MathUtils.randFloat(-halfSize, halfSize);
				const z = THREE.MathUtils.randFloat(-halfSize, halfSize);
				pos = new THREE.Vector3(
					x,
					this.terrain.getHeightAt(x, z),
					z
				);
				tries++;
			} while (!this.isFarEnough(pos, minDist) && tries < maxTries);

			if (tries < maxTries) positions.push(pos);
		}

		return positions;
	}

	isFarEnough(candidate, minDist) {
		for (const existing of this.globalPositions) {
			if (candidate.distanceTo(existing) < minDist) return false;
		}
		return true;
	}
}

export { Seabed };
