import * as THREE from 'three';
import { EntityType } from '../enums/EntityType.js';
import { ActionType } from '../enums/ActionType.js';
import { EntityState } from '../enums/EntityState.js';
import { DangerLevel } from '../enums/DangerLevel.js';
import { OBB } from '../../../lib/jsm/math/OBB.js';

class CollisionManager {
    constructor(scene, bvhManager) {
        if (CollisionManager._instance) {
            return CollisionManager._instance;
        }
        this.entities = [];
        this.fleeRadiusBase = 1.2;
        this.awarenessBoxes = new Map();
        this.scene = scene;
        this.bvhManager = bvhManager;

        // Spatial grid for optimization
        this.gridCellSize = 40;
        this.spatialGrid = new Map();
        
        // Visualization toggle
        this.showBoxes = false;
        
        CollisionManager._instance = this;
    }

    static getInstance() {
        if (!CollisionManager._instance) {
            new CollisionManager();
        }
        return CollisionManager._instance;
    }

    // Toggle collision box visualization
    toggleBoxVisualization(enabled) {
        this.showBoxes = enabled;
        
        for (const [entity, boxData] of this.awarenessBoxes.entries()) {
            if (boxData.mesh) {
                if (enabled) {
                    this.scene.add(boxData.mesh);
                } else {
                    this.scene.remove(boxData.mesh);
                }
                boxData.mesh.visible = enabled;
            }
        }
    }

    // for fish boid awareness
    getNearbyEntitiesForBoid(boid, radius) {
        if (this.bvhManager.isUsingBVH()) {
            return this.getNearbySpatialGrid(boid, radius);
        } else {
            return this.getNearbyBruteForce(boid.pos, radius);
        }
    }

    // BVH-based detection using raycasting - unfeasible
    getNearbyBVH(boid, radius) {
        const nearby = [];
        const numRays = 5;
        const spreadAngle = Math.PI / 4;

        // Get boid's forward direction
        const direction = new THREE.Vector3(0, 0, 1);
        direction.applyQuaternion(boid.quaternion);

        // Check for collisions using BVH
        const collisions = this.bvhManager.checkBoidCollisions(
            boid.pos,
            direction,
            radius,
            numRays,
            spreadAngle
        );

        const radiusSq = radius * radius;
        const processedEntities = new Set();

        for (const collision of collisions) {
            const entity = collision.object;

            if (entity && !processedEntities.has(entity)) {
                const distSq = boid.pos.distanceToSquared(entity.position);

                if (distSq <= radiusSq) {
                    nearby.push(entity);
                    processedEntities.add(entity);
                }
            }
        }

        return nearby;
    }


    // Spatial grid approach - check nearby cells only
    getNearbySpatialGrid(position, radius) {
        const nearby = [];
        const radiusSq = radius * radius;
        const nearbyCells = this.getNearbyCells(position);

        for (const cellKey of nearbyCells) {
            const cellEntities = this.spatialGrid.get(cellKey);
            if (!cellEntities) continue;

            for (const entity of cellEntities) {
                const entityPos = entity.pos || entity.position;
                const distSq = position.distanceToSquared(entityPos);

                if (distSq <= radiusSq) {
                    nearby.push(entity);
                }
            }
        }

        return nearby;
    }

    // Brute force approach - check all entities
    getNearbyBruteForce(position, radius) {
        const nearby = [];
        const radiusSq = radius * radius;

        for (const entity of this.entities) {
            const entityPos = entity.pos || entity.position;
            const distSq = position.distanceToSquared(entityPos);

            if (distSq <= radiusSq) {
                nearby.push(entity);
            }
        }

        return nearby;
    }

    registerObject(object) {
        // Recursively traverse and register
        const traverse = (obj) => {
            if (obj.type === EntityType.SHARK || 
                obj.type === EntityType.SUBMARINE || 
                obj.type === EntityType.FISH || 
                obj.type === EntityType.STATIC_OBSTACLE) {
                this.entities.push(obj);
                this.createAwarenessBox(obj);
            }

            // Traverse children
            if (obj.children && obj.children.length > 0) {
                for (const child of obj.children) {
                    traverse(child);
                }
            }
        };

        traverse(object);
    }

    createAwarenessBox(object) {
        const danger = object.dangerLevel;

        const bbox = new THREE.Box3().setFromObject(object);
        const objectSize = new THREE.Vector3();
        bbox.getSize(objectSize);

        const offsetMultiplier = this.fleeRadiusBase * (1 + 0.8 * (danger - 1));

        const boxSize = new THREE.Vector3(
            objectSize.x + offsetMultiplier,
            objectSize.y + offsetMultiplier,
            objectSize.z + offsetMultiplier
        );

        // Visual representation of Boxes
        const color =
            danger === DangerLevel.NONE
                ? 0x808080      // Gray - static obstacles
                : danger === DangerLevel.LOW
                    ? 0x00ff00  // Green - fish
                    : danger === DangerLevel.MEDIUM
                        ? 0xffff00  // Yellow - sharks
                        : 0xff0000; // Red - submarine

        const geometry = new THREE.BoxGeometry(boxSize.x, boxSize.y, boxSize.z);
        const material = new THREE.MeshBasicMaterial({
            color,
            wireframe: true,
            transparent: true,
            opacity: 0.25,
        });

        const box = new THREE.Mesh(geometry, material);

        // Collision OBB
        const collisionBox = new OBB();
        collisionBox.center = new THREE.Vector3();
        collisionBox.halfSize = new THREE.Vector3();
        collisionBox.rotation = new THREE.Matrix4();

        collisionBox.halfSize.copy(boxSize.clone().multiplyScalar(0.5));
        collisionBox.rotation.copy(object.matrix);
        collisionBox.center.copy(object.position);

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

        // If no threats, same-level entities, or obstacles, return to wandering
        if (nearbyEntities.threats.length === 0 && 
            nearbyEntities.sameLevel.length === 0 && 
            nearbyEntities.obstacles.length === 0) {
            if (entity.ai && entity.ai.state !== EntityState.WANDERING) {
                entity.ai.checkIfShouldWander();
            }
            return;
        }

        const actions = this.analyzeThreats(entity, nearbyEntities);
        this.executeAction(entity, actions, boxData);
    }

    findNearbyEntities(entity) {
        const threats = [];
        const sameLevel = [];
        const obstacles = [];
        const nearbyCells = this.getNearbyCells(entity.position);

        const entityBoxData = this.awarenessBoxes.get(entity);
        if (!entityBoxData) return { threats, sameLevel, obstacles };

        for (const cellKey of nearbyCells) {
            const cellEntities = this.spatialGrid.get(cellKey);
            if (!cellEntities) continue;

            for (const other of cellEntities) {
                if (other === entity) continue;

                const otherBoxData = this.awarenessBoxes.get(other);
                if (!otherBoxData) continue;

                if (entityBoxData.collisionBox.intersectsOBB(otherBoxData.collisionBox)) {
                    // Handle static obstacles separately
                    if (other.type === EntityType.STATIC_OBSTACLE) {
                        obstacles.push(other);
                    }
                    // Handle threats and same-level entities
                    else if (other.dangerLevel > entity.dangerLevel) {
                        threats.push(other);
                    } else if (other.dangerLevel === entity.dangerLevel) {
                        sameLevel.push(other);
                    }
                }
            }
        }

        return { threats, sameLevel, obstacles };
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

        if (nearbyEntities.obstacles.length > 0) {
            actions.push({
                type: ActionType.AVOID,
                targets: nearbyEntities.obstacles
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

            // Update visual box position and rotation
            if (boxData.mesh) {
                boxData.mesh.position.copy(entity.position);
                boxData.mesh.quaternion.copy(entity.quaternion);
            }

            // Update collision OBB
            boxData.collisionBox.center.copy(entity.position);
            boxData.collisionBox.halfSize.copy(boxData.size.clone().multiplyScalar(0.5));
            boxData.collisionBox.rotation.makeRotationFromQuaternion(entity.quaternion);

            this.checkForDangers(entity, boxData);
        }
    }
}

export { CollisionManager };