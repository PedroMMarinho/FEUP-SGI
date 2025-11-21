import * as THREE from 'three';
import { EntityState } from '../../enums/EntityState.js';
import { ActionType } from '../../enums/ActionType.js';
import { EntityType } from '../../enums/EntityType.js';

export class SharkBehaviour {
  constructor(sharkLOD, options = {}) {
    this.shark = sharkLOD;
    this.state = EntityState.WANDERING;

    // Movement parameters
    this.baseSpeed = options.speed || 2;
    this.currentSpeed = this.baseSpeed;
    this.maxSpeed = this.baseSpeed * 3.2;

    this.acceleration = options.acceleration || 0.3;
    this.baseAcceleration = this.acceleration;
    this.fleeAcceleration = this.acceleration * 2.2;

    this.deceleration = options.deceleration || 0.4;

    this.turnSpeed = options.turnSpeed || 0.8;

    this.targetSpeed = this.baseSpeed;
    this.adaptiveTurnSpeed = this.turnSpeed;

    // Environment bounds
    this.terrainWidth = options.terrainWidth ?? 180;
    this.terrainHeight = options.terrainHeight ?? 180;
    this.minY = options.minY ?? 0;
    this.maxY = options.maxY ?? 20;
    this.verticalBoundBuffer = options.verticalBoundBuffer ?? 5;

    // Navigation
    this.targetTolerance = options.targetTolerance ?? 5.0;
    this.lastPathChange = 0;
    this.pathChangeIntervalMin = options.pathChangeIntervalMin ?? 6;
    this.pathChangeIntervalMax = options.pathChangeIntervalMax ?? 15;
    this.pathChangeInterval = this.getRandomInterval();

    // Movement smoothing
    this.currentDir = new THREE.Vector3(0, 0, -1);
    this.smoothedDir = this.currentDir.clone();


    // Vertical movement tracking
    this.targetDepth = this.shark.position.y;
    this.depthChangeRate = 0.3;

    // State-specific timers and data
    this.stateTimer = 0;
    this.fleeingDuration = 1.2;
    this.avoidingDuration = 0.5;
    this.actionData = null; // Stores current action data from collision manager

    // Tracking metrics
    this.metrics = {
      currentSpeed: 0,
      targetSpeed: this.baseSpeed,
      distanceToTarget: 0,
      turnAngle: 0,
      altitude: 0,
      timeSinceLastTurn: 0,
      totalDistanceTraveled: 0,
      averageSpeed: 0,
      pathSegments: 0,
      currentState: EntityState.WANDERING
    };

    this.generateNewTarget();
  }


  update(delta) {
    if (!this.currentTarget) return;

    const clampedDelta = Math.min(delta, 0.1);
    this.stateTimer += clampedDelta;

    switch (this.state) {
      case EntityState.WANDERING:
        this.updateWandering(clampedDelta);
        break;
      case EntityState.FLEEING:
        this.updateFleeing(clampedDelta);
        break;
      case EntityState.AVOIDING:
        this.updateAvoiding(clampedDelta);
        break;
    }

    this.applyMovement(clampedDelta);

    // Apply shared logic
    this.keepWithinBounds();
    this.updateMetrics();
  }

  updateWandering(delta) {
    this.acceleration = this.baseAcceleration;

    this.lastPathChange += delta;
    this.metrics.timeSinceLastTurn += delta;

    if (this.reachedTarget() || this.lastPathChange > this.pathChangeInterval) {
      this.generateNewTarget();
      this.lastPathChange = 0;
      this.metrics.timeSinceLastTurn = 0;
    }

    const desiredDir = new THREE.Vector3()
      .subVectors(this.currentTarget, this.shark.position);
    desiredDir.y = 0;
    if (desiredDir.lengthSq() < 0.0001) {
      desiredDir.set(this.smoothedDir.x, 0, this.smoothedDir.z);
    }
    desiredDir.normalize();

    const turnAngle = Math.acos(
      THREE.MathUtils.clamp(this.smoothedDir.dot(desiredDir), -1, 1)
    );
    const turnSharpness = Math.min(turnAngle / (Math.PI / 3), 1);

    this.adaptiveTurnSpeed = this.turnSpeed * (0.3 + turnSharpness * 0.7);
    this.targetSpeed = THREE.MathUtils.lerp(
      this.baseSpeed,
      this.baseSpeed * 0.85,
      turnSharpness * 0.5
    );
  }

  updateFleeing() {
    this.acceleration = this.fleeAcceleration;

    this.targetSpeed = this.maxSpeed;
    this.adaptiveTurnSpeed = this.turnSpeed * 1.2;

    if (this.actionData && this.actionData.action.type === ActionType.FLEE) {
      this.executeFlee();
      this.actionData = null;
    }
  }

  updateAvoiding() {
    this.acceleration = this.baseAcceleration;

    this.targetSpeed = this.baseSpeed * 1.1;
    this.adaptiveTurnSpeed = this.turnSpeed * 1.2;

    if (this.actionData && this.actionData.action.type === ActionType.AVOID) {
      this.executeAvoid();
      this.actionData = null;
    }
  }


  applyMovement(delta) {
    const desiredDir = new THREE.Vector3()
      .subVectors(this.currentTarget, this.shark.position);
    desiredDir.y = 0;

    if (desiredDir.lengthSq() < 0.0001) {
      desiredDir.set(this.smoothedDir.x, 0, this.smoothedDir.z);
    }
    desiredDir.normalize();

    this.metrics.turnAngle = Math.acos(
      THREE.MathUtils.clamp(this.smoothedDir.dot(desiredDir), -1, 1)
    ) * THREE.MathUtils.RAD2DEG;

    this.smoothedDir.lerp(desiredDir, delta * this.adaptiveTurnSpeed).normalize();

    if (this.currentSpeed < this.targetSpeed) {
      this.currentSpeed = Math.min(
        this.currentSpeed + this.acceleration * delta,
        this.targetSpeed
      );
    } else {
      this.currentSpeed = Math.max(
        this.currentSpeed - this.deceleration * delta,
        this.targetSpeed
      );
    }

    const moveDelta = this.smoothedDir.clone().multiplyScalar(this.currentSpeed * delta);

    const depthDiff = this.targetDepth - this.shark.position.y;
    const depthAdjustment = THREE.MathUtils.clamp(
      depthDiff * this.depthChangeRate * delta,
      -this.depthChangeRate * delta,
      this.depthChangeRate * delta
    );
    moveDelta.y = depthAdjustment;

    const previousPos = this.shark.position.clone();
    this.shark.position.add(moveDelta);

    this.metrics.totalDistanceTraveled += previousPos.distanceTo(this.shark.position);
    this.metrics.currentSpeed = this.currentSpeed;

    const targetQuat = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 0, -1),
      this.smoothedDir
    );

    this.shark.quaternion.slerp(targetQuat, delta * 2);
  }



  updateMetrics() {
    this.metrics.altitude = this.shark.position.y;
    this.metrics.currentState = this.state;
    this.metrics.targetSpeed = this.targetSpeed;
    this.metrics.averageSpeed = this.metrics.pathSegments > 0
      ? this.metrics.totalDistanceTraveled / (this.metrics.pathSegments * 10)
      : this.currentSpeed;
  }

  executeFlee() {
    if (!this.actionData) return;
    const action = this.actionData.action;
    const boxSize = this.actionData.boxSize;

    const ePos = this.shark.position;
    const tPos = action.target.position || action.target;
    const distance = action.distance;

    const effectiveRadius = Math.max(boxSize.x, boxSize.y, boxSize.z) / 2;
    const proximityFactor = Math.max(0, 1 - (distance / effectiveRadius));

    const fleeDir = new THREE.Vector3().subVectors(ePos, tPos).normalize();
    fleeDir.y = 0;
    fleeDir.normalize();

    const halfWidth = this.terrainWidth / 2;
    const halfHeight = this.terrainHeight / 2;
    const wallAvoidDir = new THREE.Vector3();

    const wallAvoidStrength = 0.5;
    const safeMargin = 40;

    if (ePos.x > halfWidth - safeMargin) wallAvoidDir.x = -1;
    else if (ePos.x < -halfWidth + safeMargin) wallAvoidDir.x = 1;

    if (ePos.z > halfHeight - safeMargin) wallAvoidDir.z = -1;
    else if (ePos.z < -halfHeight + safeMargin) wallAvoidDir.z = 1;

    if (wallAvoidDir.lengthSq() > 0) {
      wallAvoidDir.normalize();
      fleeDir.addScaledVector(wallAvoidDir, wallAvoidStrength);
      fleeDir.normalize();
    }

    const directionBlend = 0.2;
    this.smoothedDir.lerp(fleeDir, directionBlend);
    this.smoothedDir.normalize();

    const targetDistance = 80 + (proximityFactor * 70);
    this.currentTarget = ePos.clone().add(this.smoothedDir.clone().multiplyScalar(targetDistance));

    this.currentTarget.x = THREE.MathUtils.clamp(this.currentTarget.x, -halfWidth + 30, halfWidth - 30);
    this.currentTarget.y = THREE.MathUtils.clamp(this.currentTarget.y, this.minY + this.verticalBoundBuffer, this.maxY - this.verticalBoundBuffer);
    this.currentTarget.z = THREE.MathUtils.clamp(this.currentTarget.z, -halfHeight + 30, halfHeight - 30);

    this.targetDepth = this.currentTarget.y;
    this.lastPathChange = 0;

    if (!this.isFleeing) {
      this.currentSpeed = this.maxSpeed * 0.45;
      this.isFleeing = true;
    }

    this.targetSpeed = this.maxSpeed;
    this.acceleration = this.fleeAcceleration;
    /*
    console.log('FLEE TARGET:', this.currentTarget.clone());
    console.log('FLEE SPEED:', {
      currentSpeed: this.currentSpeed.toFixed(2),
      targetSpeed: this.targetSpeed.toFixed(2),
      acceleration: this.acceleration.toFixed(2)
    });
    */
  }


  executeAvoid() {
    if (!this.actionData) return;

    const action = this.actionData.action;
    const boxSize = this.actionData.boxSize;

    const ePos = this.shark.position;
    const avoidDir = new THREE.Vector3();

    const effectiveRadius = Math.max(boxSize.x, boxSize.y, boxSize.z) / 2;

    // Separate static obstacles from other entities
    const staticObstacles = action.targets.filter(t => t.type === EntityType.STATIC_OBSTACLE);
    const otherEntities = action.targets.filter(t => t.type !== EntityType.STATIC_OBSTACLE);

    // Handle static obstacles - stronger, more direct avoidance
    if (staticObstacles.length > 0) {
      for (const obstacle of staticObstacles) {
        const distance = ePos.distanceTo(obstacle.position);
        if (distance >= effectiveRadius || distance < 0.1) continue;

        const pushDir = new THREE.Vector3().subVectors(ePos, obstacle.position).normalize();
        const strength = (effectiveRadius - distance) / effectiveRadius;
        avoidDir.addScaledVector(pushDir, strength * 2);
      }
    }

    // Handle same-level entities - gentler avoidance
    if (otherEntities.length > 0) {
      for (const other of otherEntities) {
        const distance = ePos.distanceTo(other.position);
        if (distance >= effectiveRadius || distance < 0.1) continue;

        const pushDir = new THREE.Vector3().subVectors(ePos, other.position).normalize();
        const strength = (effectiveRadius - distance) / effectiveRadius;
        avoidDir.addScaledVector(pushDir, strength);
      }
    }

    if (avoidDir.lengthSq() > 0) {
      avoidDir.normalize();

      // Use longer distance for obstacles, shorter for entities
      const avoidDistance = staticObstacles.length > 0 ? 35 : 20;

      this.currentTarget = ePos.clone().add(avoidDir.multiplyScalar(avoidDistance));

      const halfWidth = this.terrainWidth / 2;
      const halfHeight = this.terrainHeight / 2;
      this.currentTarget.x = THREE.MathUtils.clamp(this.currentTarget.x, -halfWidth + 30, halfWidth - 30);
      this.currentTarget.y = THREE.MathUtils.clamp(this.currentTarget.y, this.minY + this.verticalBoundBuffer, this.maxY - this.verticalBoundBuffer);
      this.currentTarget.z = THREE.MathUtils.clamp(this.currentTarget.z, -halfHeight + 30, halfHeight - 30);

      this.targetDepth = this.currentTarget.y;
      this.lastPathChange = 0;
    }
  }

  checkIfShouldWander() {
    if (this.state === EntityState.FLEEING && this.stateTimer > this.fleeingDuration) {
      this.setState(EntityState.WANDERING);
    } else if (this.state === EntityState.AVOIDING && this.stateTimer > this.avoidingDuration) {
      this.setState(EntityState.WANDERING);
    }
  }

  setState(newState) {
    if (this.state !== newState) {
      this.state = newState;
      this.stateTimer = 0;

      if (newState === EntityState.WANDERING) {
        this.generateNewTarget();
        this.lastPathChange = 0;
      }
    }
  }

  // --- Utility Functions ---
  getRandomInterval() {
    return THREE.MathUtils.randFloat(
      this.pathChangeIntervalMin,
      this.pathChangeIntervalMax
    );
  }

  generateNewTarget() {
    const halfWidth = this.terrainWidth / 2;
    const halfHeight = this.terrainHeight / 2;

    let newTarget;
    if (this.currentTarget) {
      const currentForward = this.smoothedDir.clone();
      const randomAngle = THREE.MathUtils.randFloat(-Math.PI / 2.5, Math.PI / 2.5);
      const randomDistance = THREE.MathUtils.randFloat(40, 100);

      const axis = new THREE.Vector3(0, 1, 0);
      currentForward.applyAxisAngle(axis, randomAngle);

      newTarget = this.shark.position.clone()
        .add(currentForward.multiplyScalar(randomDistance));

      newTarget.x += THREE.MathUtils.randFloat(-15, 15);
      newTarget.z += THREE.MathUtils.randFloat(-15, 15);

      const depthChange = THREE.MathUtils.randFloat(-8, 8);
      this.targetDepth = THREE.MathUtils.clamp(
        this.shark.position.y + depthChange,
        this.minY + this.verticalBoundBuffer,
        this.maxY - this.verticalBoundBuffer
      );
      newTarget.y = this.targetDepth;
    } else {
      newTarget = new THREE.Vector3(
        THREE.MathUtils.randFloat(-halfWidth + 20, halfWidth - 20),
        THREE.MathUtils.randFloat(this.minY + this.verticalBoundBuffer, this.maxY - this.verticalBoundBuffer),
        THREE.MathUtils.randFloat(-halfHeight + 20, halfHeight - 20)
      );
      this.targetDepth = newTarget.y;
    }

    newTarget.x = THREE.MathUtils.clamp(newTarget.x, -halfWidth + 30, halfWidth - 30);
    newTarget.y = THREE.MathUtils.clamp(newTarget.y, this.minY + this.verticalBoundBuffer, this.maxY - this.verticalBoundBuffer);
    newTarget.z = THREE.MathUtils.clamp(newTarget.z, -halfHeight + 30, halfHeight - 30);

    this.currentTarget = newTarget;
    this.pathChangeInterval = this.getRandomInterval();
    this.metrics.pathSegments++;
  }

  reachedTarget() {
    if (!this.currentTarget) return false;
    const dist = this.shark.position.distanceTo(this.currentTarget);
    this.metrics.distanceToTarget = dist;
    return dist < this.targetTolerance;
  }

  updateActionData(action, boxData) {
    this.actionData = {
      action: action,
      boxSize: boxData.size
    };
  }

  keepWithinBounds() {
    const halfWidth = this.terrainWidth / 2;
    const pos = this.shark.position;

    let needsNewTarget = false;

    if (pos.x < -halfWidth) {
      pos.x = -halfWidth;
      this.smoothedDir.x = Math.abs(this.smoothedDir.x);
      needsNewTarget = true;
    }

    if (pos.x > halfWidth) {
      pos.x = halfWidth;
      this.smoothedDir.x = -Math.abs(this.smoothedDir.x);
      needsNewTarget = true;
    }

    if (pos.z < -halfWidth) {
      pos.z = -halfWidth;
      this.smoothedDir.z = Math.abs(this.smoothedDir.z);
      needsNewTarget = true;
    }

    if (pos.z > halfWidth) {
      pos.z = halfWidth;
      this.smoothedDir.z = -Math.abs(this.smoothedDir.z);
      needsNewTarget = true;
    }

    if (pos.y < this.minY) {
      pos.y = this.minY;
      this.targetDepth = pos.y + 5;
      needsNewTarget = true;
    }

    if (pos.y > this.maxY) {
      pos.y = this.maxY;
      this.targetDepth = pos.y - 5;
      needsNewTarget = true;
    }

    if (needsNewTarget) {
      this.smoothedDir.normalize();
      this.generateNewTarget();
      this.lastPathChange = 0;
    }
  }

  resetStateTimer() {
    this.stateTimer = 0;
  }
}