import * as THREE from 'three';
import { RockGroup } from '../rock/RockGroup.js';
import { CoralGroup } from '../coral/CoralGroup.js';
import { TerrainSegment } from '../terrainSegment/TerrainSegment.js';
import { ShellGroup } from '../shell/ShellGroup.js';
import { SeaweedGroup } from '../seaweed/SeaweedGroup.js';
import { ShipGroup } from '../ship/ShipGroup.js';
import { TVGroup } from '../tv/TVGroup.js';
import { TreasureChestLOD } from '../tresure/TreasureChestLOD.js';
import { BubbleColumns } from "../bubble/BubbleColumns.js";


class Seabed extends THREE.Object3D {
	constructor(
		terrainSize = 30,
		rockCount = 30,
		coralCount = 40,
        shellCount = 50,
        seaweedCount = 20,
		shipCount = 1,
		tvCount = 1,
		bubbleColumnsCount = 5,
		rockModels = [],
        shellModels = [],
		shipModels = [],
		tvModels = [],
		treasureChestModel = null,
		distanceRange = [0.008, 0.1],
	) {
		super();
		this.terrain = null;
		this.terrainSize = terrainSize;

        // Counts of various objects
		this.rockCount = rockCount;
        this.shellCount = shellCount;
		this.coralCount = coralCount;
		this.seaweedCount = seaweedCount;
		this.shipCount = shipCount;
		this.tvCount = tvCount;
		this.bubbleColumnsCount = bubbleColumnsCount;

        // Models
		this.rockModels = rockModels;
		this.shellModels = shellModels;
		this.shipModels = shipModels;
		this.tvModels = tvModels;
		this.treasureChestModel = treasureChestModel;


		this.distanceRange = distanceRange;
		this.marginFactor = 0.96; // to avoid placing objects too close to the edge

		this.globalPositions = [];

		this.init();
	}

	createTVGroup() {
		const tvPositions = this.computeGroundPositions(this.tvCount);
		const tvGroup = new TVGroup(tvPositions, this.tvModels);
		this.add(tvGroup);
		this.globalPositions.push(...tvPositions);
		this.currentTV = tvGroup.tvs[0];
	}

	getTV(){
		return this.currentTV;
	}


	init() {
		this.createTerrain();
		this.createShipGroup();
		this.createTVGroup();
		this.createTreasureChest();
		this.createRockGroup();
		this.createCoralGroup();
        this.createShellGroup();
		this.createSeaweedGroup();
		this.createBubbleColumns();
	}

	createTreasureChest() {
		// Place treasure chest at the center of the seabed
		console.log('Creating treasure chest...');
		const positions = this.computeGroundPositions(1)

		console.log('Treasure chest position:', positions);
		const treasureChest = new TreasureChestLOD(this.treasureChestModel);
		const position = positions[0];
		treasureChest.position.copy(position);
		this.add(treasureChest);
		this.treasureChest = treasureChest;
		this.globalPositions.push(position);
	}

	createShipGroup() {
		const shipPositions = this.computeGroundPositions(this.shipCount, 0.85);
		const shipGroup = new ShipGroup(shipPositions, this.shipModels);
		this.add(shipGroup);
		this.globalPositions.push(...shipPositions);
		this.sunkenShip = shipGroup.ships[0]
	}

	createTerrain() {
		const terrain = new TerrainSegment(this.terrainSize, this.terrainSize);
		this.terrain = terrain;
		this.add(terrain);
	}

	createRockGroup() {
		const rockPositions = this.computeGroundPositions(this.rockCount);
		this.rockGroup = new RockGroup(rockPositions, this.rockModels);
		this.add(this.rockGroup);
		this.globalPositions.push(...rockPositions);
	}

	createCoralGroup() {
		const coralPositions = this.computeGroundPositions(this.coralCount);
		const coralGroup = new CoralGroup(coralPositions);
		this.add(coralGroup);
		this.globalPositions.push(...coralPositions);
	}

    createShellGroup() {
        const shellPositions = this.computeGroundPositions(this.shellCount);
        this.shellGroup = new ShellGroup(shellPositions, this.shellModels);
        this.add(this.shellGroup);
        this.globalPositions.push(...shellPositions);
    }

	createSeaweedGroup() {
		const seaweedPositions = this.computeGroundPositions(this.seaweedCount);
		console.log('Seaweed positions:', seaweedPositions);
		this.seaweedGroup = new SeaweedGroup(seaweedPositions);
		console.log('Created SeaweedGroup:', this.seaweedGroup);
		this.add(this.seaweedGroup);
		this.globalPositions.push(...seaweedPositions);
	}

	createBubbleColumns() {
		// Number of rift vents
		const riftPositions = this.computeRiftPositions(this.bubbleColumnsCount);
		console.log('Rift positions for bubble columns:', riftPositions);
		if (riftPositions.length === 0) return;

		this.bubbleColumns = new BubbleColumns(
			riftPositions,
			20,     // max bubble height
			600    // total particles
		);

		this.add(this.bubbleColumns);
	}


	computeGroundPositions(count, objectMarginFactor = 1, maxTries = 50) {
	const positions = [];

	const effectiveSize = this.terrainSize * this.marginFactor * objectMarginFactor;
	const halfSize = effectiveSize / 2;

	for (let i = 0; i < count; i++) {
		const minDist = THREE.MathUtils.randFloat(...this.distanceRange);
		let pos, tries = 0;

		do {
		const x = THREE.MathUtils.randFloat(-halfSize, halfSize);
		const z = THREE.MathUtils.randFloat(-halfSize, halfSize);

		const { height, inRiftZone } = this.terrain.getHeightAt(x, z);

		// Reject rift zones
		if (inRiftZone) {
			console.warn('Rejected position in rift zone');
			tries++;
			continue;
		}

		pos = new THREE.Vector3(x, height, z);
		tries++;
		} while ((!pos || !this.isFarEnough(pos, minDist)) && tries < maxTries);

		if (pos && tries < maxTries) {
		positions.push(pos);
		}
	}

	return positions;
	}

	computeRiftPositions(count, maxTries = 50) {
		const positions = [];

		const effectiveSize = this.terrainSize * this.marginFactor;
		const minX = -effectiveSize / 2 * 4 / 5;
		const maxX =  effectiveSize / 2 ;
		const minZ = 0;
		const maxZ =  effectiveSize / 2 ;

		for (let i = 0; i < count; i++) {
			let pos, tries = 0;

			do {
				const x = THREE.MathUtils.randFloat(minX, maxX);
				const z = THREE.MathUtils.randFloat(minZ, maxZ);

				const { height, inRiftZone } = this.terrain.getHeightAt(x, z);

				// Accept only rift zones
				if (!inRiftZone) {
					console.warn('Rejected position outside rift zone');
					tries++;
					continue;
				}

				pos = new THREE.Vector3(x, height, z);
				tries++;
			} while ((!pos) && tries < maxTries);

			if (pos && tries < maxTries) {
				positions.push(pos);
			}
		}
		
		return positions;
	}

	isFarEnough(candidate, minDist) {
		for (const existing of this.globalPositions) {
			if (candidate.distanceTo(existing) < minDist) return false;
		}
		return true;
	}

	updateState() {
		// Update seabed elements if needed
		for(const child of this.children) {
			if(child.updateState) {
				child.updateState();
			}
		}
	}

}

export { Seabed };
