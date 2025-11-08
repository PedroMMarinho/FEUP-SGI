import * as THREE from 'three';
import { EntityType } from '../enums/EntityType.js';
import { DangerLevel } from '../enums/DangerLevel.js';
import { ActionType } from '../enums/ActionType.js';
import { EntityState } from '../enums/EntityState.js';

class CollisionManager {
    constructor(scene) {
        this.entities = [];
        this.fleeRadiusBase = 2;
        this.awarenessBoxes = new Map();
        this.scene = scene;
        
        // Spatial grid for optimization
        this.gridCellSize = 40;
        this.spatialGrid = new Map();
    }

    registerObject(object) {
        if (object.type === EntityType.SHARK || object.type === EntityType.SUBMARINE) {
            this.entities.push(object);
            this.createAwarenessBox(object);
        }
    }

    createAwarenessBox(object) {
        const danger = object.dangerLevel;
        
        const bbox = new THREE.Box3().setFromObject(object);
        const objectSize = new THREE.Vector3();
        bbox.getSize(objectSize);
        
        const offsetMultiplier = this.fleeRadiusBase * (1 + 2 * (danger - 1));
        
        const boxSize = new THREE.Vector3(
            objectSize.x + offsetMultiplier,
            objectSize.y + offsetMultiplier,
            objectSize.z + offsetMultiplier
        );

        const color =
            danger === DangerLevel.LOW
                ? 0x00ff00
                : danger === DangerLevel.MEDIUM
                ? 0xffff00
                : 0xff0000;

        const geometry = new THREE.BoxGeometry(boxSize.x, boxSize.y, boxSize.z);
        const material = new THREE.MeshBasicMaterial({
            color,
            wireframe: true,
            transparent: true,
            opacity: 0.25,
        });

        const box = new THREE.Mesh(geometry, material);
        this.scene.add(box);
        
        const collisionBox = new THREE.Box3();
        
        this.awarenessBoxes.set(object, { 
            mesh: box, 
            size: boxSize,
            collisionBox: collisionBox
        });
    }

    getGridKey(position) {
        const x = Math.floor(position.x / this.gridCellSize);
        const y = Math.floor(position.y / this.gridCellSize);
        const z = Math.floor(position.z / this.gridCellSize);
        return `${x},${y},${z}`;
    }

    getNearbyCells(position) {
        const cells = [];
        const baseX = Math.floor(position.x / this.gridCellSize);
        const baseY = Math.floor(position.y / this.gridCellSize);
        const baseZ = Math.floor(position.z / this.gridCellSize);

        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                for (let z = -1; z <= 1; z++) {
                    cells.push(`${baseX + x},${baseY + y},${baseZ + z}`);
                }
            }
        }
        return cells;
    }

    updateSpatialGrid() {
        this.spatialGrid.clear();
        
        for (const entity of this.entities) {
            const key = this.getGridKey(entity.position);
            if (!this.spatialGrid.has(key)) {
                this.spatialGrid.set(key, []);
            }
            this.spatialGrid.get(key).push(entity);
        }
    }

    checkForDangers(entity, boxData) {
        const nearbyEntities = this.findNearbyEntities(entity);
        
        // If no threats or same-level entities, return to wandering
        if (nearbyEntities.threats.length === 0 && nearbyEntities.sameLevel.length === 0) {
            if (entity.ai && entity.ai.state !== EntityState.WANDERING) {
                entity.ai.checkIfShouldWander(); // Added this to check before changing state
            }
            return;
        }

        const actions = this.analyzeThreats(entity, nearbyEntities);
        this.executeAction(entity, actions, boxData);
    }

    findNearbyEntities(entity) {
        const threats = [];
        const sameLevel = [];
        const nearbyCells = this.getNearbyCells(entity.position);
        
        const entityBoxData = this.awarenessBoxes.get(entity);
        if (!entityBoxData) return { threats, sameLevel };

        for (const cellKey of nearbyCells) {
            const cellEntities = this.spatialGrid.get(cellKey);
            if (!cellEntities) continue;

            for (const other of cellEntities) {
                if (other === entity) continue;
                
                const otherBoxData = this.awarenessBoxes.get(other);
                if (!otherBoxData) continue;
                
                if (entityBoxData.collisionBox.intersectsBox(otherBoxData.collisionBox)) {
                    if (other.dangerLevel > entity.dangerLevel) {
                        threats.push(other);
                    } else if (other.dangerLevel === entity.dangerLevel) {
                        sameLevel.push(other);
                    }
                }
            }
        }

        return { threats, sameLevel };
    }

    analyzeThreats(entity, nearbyEntities) {
        const actions = [];

        if (nearbyEntities.threats.length > 0) {
            let closestThreat = null;
            let minDistance = Infinity;

            for (const threat of nearbyEntities.threats) {
                const distance = entity.position.distanceTo(threat.position);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestThreat = threat;
                }
            }

            actions.push({
                type: ActionType.FLEE,
                target: closestThreat,
                distance: minDistance
            });
        }

        if (nearbyEntities.sameLevel.length > 0) {
            actions.push({
                type: ActionType.AVOID,
                targets: nearbyEntities.sameLevel
            });
        }

        return actions;
    }

    executeAction(entity, actions, boxData) {
        if (!entity.ai) return;

        // Prioritize fleeing over avoiding
        for (const action of actions) {
            switch (action.type) {
                case ActionType.FLEE:
                    entity.ai.setState(EntityState.FLEEING);
                    entity.ai.updateActionData(action, boxData);
                    entity.ai.resetStateTimer();
                    return; 
                    
                case ActionType.AVOID:
                    entity.ai.setState(EntityState.AVOIDING);
                    entity.ai.updateActionData(action, boxData);
                    entity.ai.resetStateTimer();
                    
                    break;
            }
        }
    }

    update() {
        this.updateSpatialGrid();

        for (const entity of this.entities) {
            const boxData = this.awarenessBoxes.get(entity);

            boxData.mesh.position.copy(entity.position);
            boxData.collisionBox.setFromCenterAndSize(entity.position, boxData.size);
            

            this.checkForDangers(entity, boxData);
        }
    }
}

export { CollisionManager };