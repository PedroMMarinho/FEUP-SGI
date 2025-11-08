import * as THREE from 'three';
import { EntityState } from '../../enums/EntityState.js';
import { ActionType } from '../../enums/ActionType.js';

export class SharkBehaviour {
  constructor(sharkLOD, options = {}) {
    this.shark = sharkLOD;
    this.state = EntityState.WANDERING;

    // Movement parameters
    this.baseSpeed = options.speed || 2;
    this.currentSpeed = this.baseSpeed;
    this.maxSpeed = this.baseSpeed * 10.5;
    this.acceleration = options.acceleration || 0.3;
    this.deceleration = options.deceleration || 0.4;
    
    this.turnSpeed = options.turnSpeed || 0.8;
    this.maxTurnRate = options.maxTurnRate || 1.5;
    this.wanderRadius = options.wanderRadius || 120;
    
    // Environment bounds
    this.terrainWidth = options.terrainWidth ?? 120;
    this.terrainHeight = options.terrainHeight ?? 120;
    this.minY = options.minY ?? 0;
    this.maxY = options.maxY ?? 20;
    this.horizontalBoundBuffer = options.horizontalBoundBuffer ?? 10;
    this.verticalBoundBuffer = options.verticalBoundBuffer ?? 5;

    // Navigation
    this.targetTolerance = options.targetTolerance ?? 5.0;
    this.visionWidth = options.visionWidth ?? 80;
    this.visionDepth = options.visionDepth ?? 100;
    this.lastPathChange = 0;
    this.pathChangeIntervalMin = options.pathChangeIntervalMin ?? 6;
    this.pathChangeIntervalMax = options.pathChangeIntervalMax ?? 15;
    this.pathChangeInterval = this.getRandomInterval();

    // Movement smoothing
    this.currentDir = new THREE.Vector3(0, 0, -1);
    this.smoothedDir = this.currentDir.clone();
    
    // Realistic swimming motion
    this.swimPhase = Math.random() * Math.PI * 2;
    this.swimFrequency = options.swimFrequency || 2.0;
    this.tailSwayAmplitude = options.tailSwayAmplitude || 0.15;
    
    // Banking into turns
    this.currentBank = 0;
    this.maxBankAngle = 0.15;
    
    // Vertical movement tracking
    this.targetDepth = this.shark.position.y;
    this.depthChangeRate = 0.5;
    
    // State-specific timers and data
    this.stateTimer = 0;
    this.fleeingDuration = 3.0;
    this.avoidingDuration = 1.5;
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

  // Called by CollisionManager to pass action data
  updateActionData(action, boxData) {
    this.actionData = {
      action: action,
      boxSize: boxData.size
    };
  }

  // Called by CollisionManager when no threats detected
  checkIfShouldWander() {
    if (this.state === EntityState.FLEEING && this.stateTimer > this.fleeingDuration) {
      this.setState(EntityState.WANDERING);
    } else if (this.state === EntityState.AVOIDING && this.stateTimer > this.avoidingDuration) {
      this.setState(EntityState.WANDERING);
    }
  }

  update(delta) {
    if (!this.currentTarget) return;

    const clampedDelta = Math.min(delta, 0.1);
    this.stateTimer += clampedDelta;

    // Handle state-specific behaviors
    switch (this.state) {
      case EntityState.FLEEING:
        if (this.actionData && this.actionData.action.type === ActionType.FLEE) {
          this.executeFlee();
          this.actionData = null; // Clear after use
        }
        break;

      case EntityState.AVOIDING:
        if (this.actionData && this.actionData.action.type === ActionType.AVOID) {
          this.executeAvoid();
          this.actionData = null; // Clear after use
        }
        break;

      case EntityState.WANDERING:
        // Normal wandering behavior
        this.lastPathChange += clampedDelta;
        this.metrics.timeSinceLastTurn += clampedDelta;

        if (this.reachedTarget() || this.lastPathChange > this.pathChangeInterval) {
          this.generateNewTarget();
          this.lastPathChange = 0;
          this.metrics.timeSinceLastTurn = 0;
        }
        break;
    }

    // Calculate desired horizontal direction
    const desiredDir = new THREE.Vector3()
      .subVectors(this.currentTarget, this.shark.position);
    desiredDir.y = 0; 

    if (desiredDir.lengthSq() < 0.0001) {
      desiredDir.set(this.smoothedDir.x, 0, this.smoothedDir.z);
    }
    desiredDir.normalize();

    // Calculate turn angle
    this.metrics.turnAngle = Math.acos(
      THREE.MathUtils.clamp(this.smoothedDir.dot(desiredDir), -1, 1)
    ) * THREE.MathUtils.RAD2DEG;

    // Adjust turn speed based on state
    const turnSharpness = Math.min(this.metrics.turnAngle / 60, 1);
    let adaptiveTurnSpeed = this.turnSpeed * (0.3 + turnSharpness * 0.7);
    
    if (this.state === EntityState.FLEEING) {
      adaptiveTurnSpeed *= 1.5;
    } else if (this.state === EntityState.AVOIDING) {
      adaptiveTurnSpeed *= 1.2;
    }

    this.smoothedDir.lerp(desiredDir, clampedDelta * adaptiveTurnSpeed).normalize();

    // Speed adjustments based on state
    let targetSpeed = this.baseSpeed;
    if (this.state === EntityState.FLEEING) {
      targetSpeed = this.maxSpeed;
    } else if (this.state === EntityState.AVOIDING) {
      targetSpeed = this.baseSpeed * 1.1;
    } else {
      targetSpeed = THREE.MathUtils.lerp(
        this.baseSpeed,
        this.baseSpeed * 0.85,
        turnSharpness * 0.5
      );
    }
    this.metrics.targetSpeed = targetSpeed;

    // Smooth speed changes
    if (this.currentSpeed < targetSpeed) {
      this.currentSpeed = Math.min(
        this.currentSpeed + this.acceleration * clampedDelta,
        targetSpeed
      );
    } else {
      this.currentSpeed = Math.max(
        this.currentSpeed - this.deceleration * clampedDelta,
        targetSpeed
      );
    }

    // Update swim phase
    this.swimPhase += clampedDelta * this.swimFrequency * (this.currentSpeed / this.baseSpeed);

    // Calculate movement with gradual depth change
    const moveDelta = this.smoothedDir.clone().multiplyScalar(this.currentSpeed * clampedDelta);
    
    const depthDiff = this.targetDepth - this.shark.position.y;
    const depthAdjustment = THREE.MathUtils.clamp(
      depthDiff * this.depthChangeRate * clampedDelta,
      -this.depthChangeRate * clampedDelta,
      this.depthChangeRate * clampedDelta
    );
    moveDelta.y = depthAdjustment;

    // Apply movement
    const previousPos = this.shark.position.clone();
    this.shark.position.add(moveDelta);
    
    // Track distance
    this.metrics.totalDistanceTraveled += previousPos.distanceTo(this.shark.position);
    this.metrics.currentSpeed = this.currentSpeed;

    // Smooth rotation
    const targetQuat = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 0, -1), 
      this.smoothedDir             
    );
    
    this.shark.quaternion.slerp(targetQuat, clampedDelta * 2);

    // Keep within bounds
    this.keepWithinBounds();

    this.metrics.altitude = this.shark.position.y;
    this.metrics.currentState = this.state;
    this.metrics.averageSpeed = this.metrics.pathSegments > 0 
      ? this.metrics.totalDistanceTraveled / (this.metrics.pathSegments * 10)
      : this.currentSpeed;
  }

  keepWithinBounds() {
    const halfWidth = this.terrainWidth / 2;
    const halfHeight = this.terrainHeight / 2;
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

    if (pos.z < -halfHeight) {
      pos.z = -halfHeight;
      this.smoothedDir.z = Math.abs(this.smoothedDir.z);
      needsNewTarget = true;
    }

    if (pos.z > halfHeight) {
      pos.z = halfHeight;
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

  executeFlee() {
    if (!this.actionData) return;
    const action = this.actionData.action;
    const boxSize = this.actionData.boxSize;
    
    const ePos = this.shark.position;
    const tPos = action.target.position;
    const distance = action.distance;
    
    const effectiveRadius = Math.max(boxSize.x, boxSize.y, boxSize.z) / 2;
    const proximityFactor = Math.max(0, 1 - (distance / effectiveRadius));
    
    const fleeDir = new THREE.Vector3().subVectors(ePos, tPos).normalize();
    
    const baseFleeSpeed = distance > 0 
        ? THREE.MathUtils.clamp((effectiveRadius - distance) / effectiveRadius, 0.05, 0.4)
        : 0.4; 

    const speedMultiplier = 2.0 + (proximityFactor * 100.0);
    const fleeSpeed = baseFleeSpeed * speedMultiplier;

    // Apply flee movement
    ePos.addScaledVector(fleeDir, fleeSpeed);

    const directionBlend = 0.3 + (proximityFactor * 0.4); 
    this.smoothedDir.lerp(fleeDir, directionBlend);
    this.smoothedDir.normalize();
    
    const targetDistance = 50 + (proximityFactor * 50); 
    this.currentTarget = ePos.clone().add(fleeDir.multiplyScalar(targetDistance));
    this.lastPathChange = 0;
    
    this.currentSpeed = Math.min(this.maxSpeed, this.baseSpeed * (1 + proximityFactor));
    
    // Reset state timer when actively fleeing
    this.stateTimer = 0;
  }

  executeAvoid() {
    if (!this.actionData) return;

    const action = this.actionData.action;
    const boxSize = this.actionData.boxSize;
    
    const ePos = this.shark.position;
    const avoidDir = new THREE.Vector3();
    
    const effectiveRadius = Math.max(boxSize.x, boxSize.y, boxSize.z) / 2;

    // Calculate average avoidance direction
    for (const other of action.targets) {
        const distance = ePos.distanceTo(other.position);
        if (distance >= effectiveRadius || distance < 0.1) continue;

        const pushDir = new THREE.Vector3().subVectors(ePos, other.position).normalize();
        const strength = (effectiveRadius - distance) / effectiveRadius;
        avoidDir.addScaledVector(pushDir, strength);
    }

    if (avoidDir.lengthSq() > 0) {
        avoidDir.normalize();
        const avoidSpeed = 0.1;
        ePos.addScaledVector(avoidDir, avoidSpeed);
        
        this.smoothedDir.lerp(avoidDir, 0.1);
        this.smoothedDir.normalize();
        
        // Reset state timer when actively avoiding
        this.stateTimer = 0;
    }
  }

  setState(newState) {
    if (this.state !== newState) {
      this.state = newState;
      this.stateTimer = 0;
      
      // When returning to wandering, generate a new target
      if (newState === EntityState.WANDERING) {
        this.generateNewTarget();
        this.lastPathChange = 0;
      }
    }
  }

  getVisionArea() {
    const sharkDir = new THREE.Vector3(0, 0, -1)
      .applyQuaternion(this.shark.quaternion)
      .normalize();
    const center = this.shark.position.clone()
      .addScaledVector(sharkDir, this.visionDepth / 2);

    return {
      center,
      width: this.visionWidth,
      depth: this.visionDepth,
      direction: sharkDir.clone(),
    };
  }

  getMetrics() {
    return { ...this.metrics };
  }

  resetMetrics() {
    this.metrics.totalDistanceTraveled = 0;
    this.metrics.pathSegments = 0;
    this.metrics.averageSpeed = 0;
  }
}