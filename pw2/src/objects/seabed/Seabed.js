import * as THREE from 'three';
import { RockGroup } from '../rock/RockGroup.js';
import { CoralGroup } from '../coral/CoralGroup.js';
import { TerrainSegment } from '../terrainSegment/TerrainSegment.js';
import { ShellGroup } from '../shell/ShellGroup.js';
import { SeaweedGroup } from '../seaweed/SeaweedGroup.js';
import { ShipGroup } from '../ship/ShipGroup.js';
import { TVGroup } from '../tv/TVGroup.js';
import { BubbleColumns } from "../bubble/BubbleColumns.js";

import { CoralLOD } from '../coral/CoralLOD.js';
import { SeaweedLOD } from '../seaweed/SeaweedLOD.js';
import { TreasureChestGroup } from '../treasure/TreasureChestGroup.js';

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
		treasureChestCount = 1,
		rockModels = [],
        shellModels = [],
		shipModels = [],
		tvModels = [],
		treasureChestModel = [],
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
		this.treasureChestCount = treasureChestCount;

        // Models
		this.rockModels = rockModels;
		this.shellModels = shellModels;
		this.shipModels = shipModels;
		this.tvModels = tvModels;
		this.treasureChestModel = treasureChestModel;


		this.distanceRange = [0.005, 0.05];
		this.marginFactor = 0.96; // to avoid placing objects too close to the edge

		this.globalPositions = [];
		this.placedObjects = [];

		this.init();
	}

	createTVGroup() {
        const tvData = [];

        // 1. Pre-calculate base radii 
        const baseRadii = this.tvModels.map(modelLods => this.calculateRadius(modelLods));

        for (let i = 0; i < this.tvCount; i++) {
            // A. DECIDE OBJECT PROPERTIES
            const typeIndex = Math.floor(Math.random() * this.tvModels.length);
            const modelLODs = this.tvModels[typeIndex];
            const baseRadius = baseRadii[typeIndex];

            const scale = THREE.MathUtils.randFloat(1, 1.1); 

            // B. CALCULATE EXACT RADIUS 
            const actualRadius = baseRadius * scale;

            // C. FIND POSITION 
            const positions = this.computePositions(1, actualRadius);

            if (positions.length > 0) {
                const pos = positions[0];
                
                pos.y += THREE.MathUtils.randFloat(0.49, 0.5);

                const rotation = new THREE.Euler(
                    Math.PI /2, 
                    0,
                    0
                );

                // D. STORE DATA
                tvData.push({
                    modelLODs: modelLODs,
                    position: pos,
                    rotation: rotation,
                    scale: scale
                });
            }
        }

        // E. CREATE GROUP
        const tvGroup = new TVGroup(tvData);
        this.add(tvGroup);
        
        // F. SAVE REFERENCE 
        if (tvGroup.tvs.length > 0) {
            this.currentTV = tvGroup.tvs[0];
        }
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
        const chestData = [];
        
        if (!this.treasureChestModel || this.treasureChestModel.length === 0) {
            console.warn("Seabed: No treasure chest models available.");
            return;
        }

        // 1. Pre-calculate base radii 
        const baseRadii = this.treasureChestModel.map(modelLods => this.calculateRadius(modelLods));

        for (let i = 0; i < this.treasureChestCount; i++) {
            
            // A. DECIDE OBJECT PROPERTIES
            const typeIndex = Math.floor(Math.random() * this.treasureChestModel.length);
            const modelLODs = this.treasureChestModel[typeIndex];
            const baseRadius = baseRadii[typeIndex];

            const scale = 1.1;

            const actualRadius = baseRadius * scale;

            // C. FIND POSITION
            const positions = this.computePositions(1, actualRadius, 0.9);

            if (positions.length > 0) {
                const pos = positions[0];
                
                pos.y -= 0.06;

                const rotationY = Math.random() * Math.PI * 2;
                const rotationZ = (Math.random() * 0.1) - 0.05;

                const rotation = new THREE.Euler(
                    0,           
                    rotationY,  
                    rotationZ   
                );

                // D. STORE DATA
                chestData.push({
                    modelLODs: modelLODs,
                    position: pos,
                    rotation: rotation,
                    scale: scale 
                });
            }
        }

        // E. CREATE GROUP
        const chestGroup = new TreasureChestGroup(chestData);
        this.add(chestGroup);

        // F. SAVE REFERENCE
        if (chestGroup.chests.length > 0) {
            this.treasureChest = chestGroup.chests[0];
        }
    }

	createShipGroup() {
        const shipData = [];
        
        // 1. Pre-calculate base radii
        const baseRadii = this.shipModels.map(modelLods => this.calculateRadius(modelLods));

        for (let i = 0; i < this.shipCount; i++) {
            // A. DECIDE OBJECT PROPERTIES
            const typeIndex = Math.floor(Math.random() * this.shipModels.length);
            const modelLODs = this.shipModels[typeIndex];
            const baseRadius = baseRadii[typeIndex];

            const scale = THREE.MathUtils.randFloat(1.2, 1.5);
            
            // B. CALCULATE EXACT RADIUS
            let actualRadius = baseRadius * scale;
			// Scale down a little for collision purposes
			actualRadius = actualRadius * 0.95;
            // C. FIND POSITION 
            const positions = this.computePositions(1, actualRadius, 0.85);

            if (positions.length > 0) {
                const pos = positions[0];
                
                pos.y += THREE.MathUtils.randFloat(-0.5, 0.0); 

                const rotation = new THREE.Euler(
                    THREE.MathUtils.randFloat(0, Math.PI / 16), 
                    THREE.MathUtils.randFloat(0, Math.PI * 2),
                    THREE.MathUtils.randFloat(0, Math.PI / 16)
                );

                shipData.push({
                    modelLODs: modelLODs,
                    position: pos,
                    rotation: rotation,
                    scale: scale
                });
            }
        }

        // E. CREATE GROUP
        const shipGroup = new ShipGroup(shipData);
        this.add(shipGroup);
        
        // F. SAVE REFERENCE
        if (shipGroup.ships.length > 0) {
            this.sunkenShip = shipGroup.ships[0];
        }
    }

	createTerrain() {
		const terrain = new TerrainSegment(this.terrainSize, this.terrainSize);
		this.terrain = terrain;
		this.add(terrain);
	}

	createRockGroup() {
        const rockData = [];
        
        // 1. Pre-calculate base radius for each model type 
        const baseRadii = this.rockModels.map(modelLods => this.calculateRadius(modelLods));

        for(let i = 0; i < this.rockCount; i++) {
            // A. DEFINE THE OBJECT (Model, Scale, Rotation)
            const typeIndex = Math.floor(Math.random() * this.rockModels.length);
            const modelLODs = this.rockModels[typeIndex];
            const baseRadius = baseRadii[typeIndex];

            const scale = THREE.MathUtils.randFloat(0.8, 1.6);
            
            const rotation = new THREE.Euler(
                THREE.MathUtils.randFloat(0, Math.PI / 8),  
                THREE.MathUtils.randFloat(0, Math.PI * 2),  
                THREE.MathUtils.randFloat(0, Math.PI / 8)   
            );

            // B. CALCULATE EXACT RADIUS
            const actualRadius = baseRadius * scale; 

            // C. FIND A POSITION
            const positions = this.computePositions(1, actualRadius);

            if (positions.length > 0) {
                const pos = positions[0];
                
                pos.y += THREE.MathUtils.randFloat(-0.005, 0.04);

                // D. STORE THE FULL DEFINITION
                rockData.push({
                    modelLODs: modelLODs,
                    position: pos,
                    rotation: rotation,
                    scale: scale
                });
            }
        }

        // E. PASS DATA TO GROUP
        this.rockGroup = new RockGroup(rockData);
        this.add(this.rockGroup);
    }

	createCoralGroup() {
        const coralData = [];

		const tempMat = new THREE.MeshBasicMaterial();
        const dummyCoral = new CoralLOD(tempMat);

        const box = new THREE.Box3().setFromObject(dummyCoral);
        const size = new THREE.Vector3();
        box.getSize(size);

        const baseRadius = Math.max(size.x, size.z) * 0.5;

        dummyCoral.clear(); 
        tempMat.dispose();

        console.log("Calculated Coral Base Radius:", baseRadius);

        for (let i = 0; i < this.coralCount; i++) {
            // A. SCALE
            const scale = THREE.MathUtils.randFloat(0.8, 1.4);
            
            // B. ACTUAL RADIUS 
            const actualRadius = baseRadius * scale;

            // C. POSITION
            const positions = this.computePositions(1, actualRadius);

            if (positions.length > 0) {
                const pos = positions[0];
                pos.y += THREE.MathUtils.randFloat(-0.02, 0.02);

                const rotation = new THREE.Euler(
                    0, 
                    THREE.MathUtils.randFloat(0, Math.PI * 2), 
                    0 
                );

                coralData.push({
                    position: pos,
                    rotation: rotation,
                    scale: scale
                });
            }
        }

        this.coralGroup = new CoralGroup(coralData);
        this.add(this.coralGroup);
    }

    createShellGroup() {
        const shellData = [];
        
        // 1. Pre-calculate base radii for the shell models
        const baseRadii = this.shellModels.map(modelLods => this.calculateRadius(modelLods));

        for (let i = 0; i < this.shellCount; i++) {
            const typeIndex = Math.floor(Math.random() * this.shellModels.length);
            const modelLODs = this.shellModels[typeIndex];
            const baseRadius = baseRadii[typeIndex];

            const scale = THREE.MathUtils.randFloat(0.5, 0.8);
            
            // B. CALCULATE EXACT RADIUS
            const actualRadius = baseRadius * scale;

            // C. FIND POSITION
            const positions = this.computePositions(1, actualRadius);

            if (positions.length > 0) {
                const pos = positions[0];
                
                pos.y += THREE.MathUtils.randFloat(0.01, 0.03);

                // D. ROTATION
                const rotation = new THREE.Euler(
                    THREE.MathUtils.degToRad(THREE.MathUtils.randFloat(-10, 10)), 
                    THREE.MathUtils.randFloat(0, Math.PI * 2), 
                    THREE.MathUtils.degToRad(THREE.MathUtils.randFloat(-10, 10))  
                );

                shellData.push({
                    modelLODs: modelLODs,
                    position: pos,
                    rotation: rotation,
                    scale: scale
                });
            }
        }

        // E. CREATE GROUP
        this.shellGroup = new ShellGroup(shellData);
        this.add(this.shellGroup);
    }

	createSeaweedGroup() {
        const seaweedData = [];

        const tempMat = new THREE.MeshBasicMaterial();
        const dummySeaweed = new SeaweedLOD(tempMat);
        
        const box = new THREE.Box3().setFromObject(dummySeaweed);
        const size = new THREE.Vector3();
        box.getSize(size);
        
        const baseRadius = Math.max(size.x, size.z) * 0.5;
        
        dummySeaweed.clear(); 
        tempMat.dispose();

        for (let i = 0; i < this.seaweedCount; i++) {
            // A. SCALE
            const scale = THREE.MathUtils.randFloat(0.7, 1.5);

            // B. RADIUS
            const actualRadius = baseRadius * scale;

            // C. POSITION
            const positions = this.computePositions(1, actualRadius);

            if (positions.length > 0) {
                const pos = positions[0];
                
                const rotation = new THREE.Euler(
                    0, 
                    THREE.MathUtils.randFloat(0, Math.PI * 2), 
                    0
                );

                seaweedData.push({
                    position: pos,
                    rotation: rotation,
                    scale: scale
                });
            }
        }

        this.seaweedGroup = new SeaweedGroup(seaweedData);
        this.add(this.seaweedGroup);
    }

	createBubbleColumns() {
		// Number of rift vents
		const riftPositions = this.computeRiftPositions(this.bubbleColumnsCount);
		console.log('Rift positions for bubble columns:', riftPositions);
		if (riftPositions.length === 0) return;

		this.bubbleColumns = new BubbleColumns(
			riftPositions,
			15,     // max bubble height
			600    // total particles
		);

		this.add(this.bubbleColumns);
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

	// Helper to visualize the collision radius
    addDebugVisual(position, radius, collisionRadius) {
        const geometry = new THREE.RingGeometry(collisionRadius * 0.95, collisionRadius, 32);
		const geometryInner = new THREE.RingGeometry(radius * 0.95, radius, 32);
        
        const material = new THREE.MeshBasicMaterial({ 
            color: 0xff0000, 
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8
        });

		const materialInner = new THREE.MeshBasicMaterial({
			color: 0x00ff00,
			side: THREE.DoubleSide,
			transparent: true,
			opacity: 0.8
		});
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(position);
		const meshInner = new THREE.Mesh(geometryInner, materialInner);
		meshInner.position.copy(position);
        
        mesh.rotation.x = -Math.PI / 2;
		meshInner.rotation.x = -Math.PI / 2;

        mesh.position.y += 0.2; 
		meshInner.position.y += 0.2; 
        this.add(mesh);
		this.add(meshInner);
    }

	calculateRadius(modelsOrModel) {
        const compute = (obj) => {
            if (!obj) return 0;

            // CASE A: Handle Nested Arrays (e.g. LOD lists)
            if (Array.isArray(obj)) {
                 return obj.reduce((max, item) => Math.max(max, compute(item)), 0);
            }

            // CASE B: GLTF Wrapper
            if (obj.scene && !obj.isObject3D) {
                return compute(obj.scene); 
            }

            // CASE C: Valid 3D Object
            if (obj.isObject3D) {
                const box = new THREE.Box3().setFromObject(obj);
                const size = new THREE.Vector3();
                box.getSize(size);
                return Math.max(size.x, size.z) / 2;
            }
            
            return 0;
        };

        return compute(modelsOrModel);
    }

	computePositions(count, objectRadius, marginFactor = 1, maxTries = 100) {
        const positions = [];
        const effectiveSize = this.terrainSize * this.marginFactor * marginFactor;
        const halfSize = effectiveSize / 2;

        for (let i = 0; i < count; i++) {
            let pos, tries = 0;
            let valid = false;

            // 1. Calculate random padding for this specific spot
            // This is the "invisible personal space" around the object
            const padding = THREE.MathUtils.randFloat(...this.distanceRange);
            
            // 2. The Total Radius = The Object + The Padding
            const collisionRadius = objectRadius + padding;

            do {
                const x = THREE.MathUtils.randFloat(-halfSize, halfSize);
                const z = THREE.MathUtils.randFloat(-halfSize, halfSize);
                
                const { height, inRiftZone } = this.terrain.getHeightAt(x, z);

				// Reject rift zones for regular objects
				if (inRiftZone) {
					tries++;
					continue;
				}
                
                pos = new THREE.Vector3(x, height, z);
                
                // CHECK COLLISION using the padded size
                if (this.isLocationFree(pos, collisionRadius)) {
                    valid = true;
                }
                tries++;
            } while (!valid && tries < maxTries);

            if (valid) {
                positions.push(pos);
                
                // IMPORTANT: Store the 'collisionRadius' so future objects
                this.placedObjects.push({ position: pos, radius: collisionRadius });

                // VISUAL DEBUG: Draw the ring for the OBJECT SIZE.
                //this.addDebugVisual(pos, objectRadius, collisionRadius);
            } else {
                console.warn(`Could not place object ${i} after ${maxTries} tries`);
            }
        }
        return positions;
    }

	isLocationFree(candidatePos, candidateRadius) {
        for (const obj of this.placedObjects) {
            const dist = candidatePos.distanceTo(obj.position);
            const minDistance = obj.radius + candidateRadius;
            
            if (dist < minDistance) {
                return false; 
            }
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