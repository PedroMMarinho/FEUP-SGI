import * as THREE from 'three';

export class SharkBehaviour {
  constructor(sharkLOD, options = {}) {
    this.shark = sharkLOD;

    // Movement parameters
    this.baseSpeed = options.speed || 2;
    this.currentSpeed = this.baseSpeed;
    this.maxSpeed = this.baseSpeed * 1.5;
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
    
    // Realistic swimming motion - tail sway only
    this.swimPhase = Math.random() * Math.PI * 2;
    this.swimFrequency = options.swimFrequency || 2.0;
    this.tailSwayAmplitude = options.tailSwayAmplitude || 0.15;
    
    // Banking into turns (subtle, realistic)
    this.currentBank = 0;
    this.maxBankAngle = 0.15; // ~8.5 degrees max
    
    // Vertical movement tracking
    this.targetDepth = this.shark.position.y;
    this.depthChangeRate = 0.5;
    
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
      pathSegments: 0
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
      // Generate targets in a forward arc for natural cruising behavior
      const currentForward = this.smoothedDir.clone();
      
      // Wider angle range but prefer forward movement
      const randomAngle = THREE.MathUtils.randFloat(-Math.PI / 2.5, Math.PI / 2.5);
      const randomDistance = THREE.MathUtils.randFloat(40, 100);
      
      // Rotate forward vector by random angle around Y axis
      const axis = new THREE.Vector3(0, 1, 0);
      currentForward.applyAxisAngle(axis, randomAngle);
      
      newTarget = this.shark.position.clone()
        .add(currentForward.multiplyScalar(randomDistance));
      
      // Subtle lateral variation
      newTarget.x += THREE.MathUtils.randFloat(-15, 15);
      newTarget.z += THREE.MathUtils.randFloat(-15, 15);
      
      // Gradual depth changes - sharks don't yo-yo
      const depthChange = THREE.MathUtils.randFloat(-8, 8);
      this.targetDepth = THREE.MathUtils.clamp(
        this.shark.position.y + depthChange,
        this.minY + this.verticalBoundBuffer,
        this.maxY - this.verticalBoundBuffer
      );
      newTarget.y = this.targetDepth;
    } else {
      // Initial random target
      newTarget = new THREE.Vector3(
        THREE.MathUtils.randFloat(-halfWidth + 20, halfWidth - 20),
        THREE.MathUtils.randFloat(this.minY + this.verticalBoundBuffer, this.maxY - this.verticalBoundBuffer),
        THREE.MathUtils.randFloat(-halfHeight + 20, halfHeight - 20)
      );
      this.targetDepth = newTarget.y;
    }

    // Clamp to bounds with larger buffer
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

  update(delta) {
    if (!this.currentTarget) return;

    const clampedDelta = Math.min(delta, 0.1);

    this.lastPathChange += clampedDelta;
    this.metrics.timeSinceLastTurn += clampedDelta;

    // Check if we need a new target
    if (this.reachedTarget() || this.lastPathChange > this.pathChangeInterval) {
      this.generateNewTarget();
      this.lastPathChange = 0;
      this.metrics.timeSinceLastTurn = 0;
    }

    // Calculate desired *horizontal* direction
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

    // Smoother directional changes - sharks turn gradually
    const turnSharpness = Math.min(this.metrics.turnAngle / 60, 1);
    const adaptiveTurnSpeed = this.turnSpeed * (0.3 + turnSharpness * 0.7);
    this.smoothedDir.lerp(desiredDir, clampedDelta * adaptiveTurnSpeed).normalize();

    // Subtle speed reduction during sharp turns
    this.metrics.targetSpeed = THREE.MathUtils.lerp(
      this.baseSpeed,
      this.baseSpeed * 0.85,
      turnSharpness * 0.5
    );

    // Smooth speed changes
    if (this.currentSpeed < this.metrics.targetSpeed) {
      this.currentSpeed = Math.min(
        this.currentSpeed + this.acceleration * clampedDelta,
        this.metrics.targetSpeed
      );
    } else {
      this.currentSpeed = Math.max(
        this.currentSpeed - this.deceleration * clampedDelta,
        this.metrics.targetSpeed
      );
    }

    // Update swim phase for tail animation
    this.swimPhase += clampedDelta * this.swimFrequency * (this.currentSpeed / this.baseSpeed);

   // Calculate movement with gradual depth change
    const moveDelta = this.smoothedDir.clone().multiplyScalar(this.currentSpeed * clampedDelta);
    
    // Gradual depth adjustment
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


    // Smooth rotation - point in *horizontal* direction of movement
    const targetQuat = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 0, -1), 
      this.smoothedDir             
    );
    

    // Slower rotation for more realistic movement
    this.shark.quaternion.slerp(targetQuat, clampedDelta * 2);

    // Keep within bounds
    this.keepWithinBounds();

    this.metrics.altitude = this.shark.position.y;
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
      this.targetDepth = pos.y + 5; // Aim slightly up
      needsNewTarget = true;
    }

    if (pos.y > this.maxY) {
      pos.y = this.maxY;
      this.targetDepth = pos.y - 5; // Aim slightly down
      needsNewTarget = true;
    }

    if (needsNewTarget) {
      this.smoothedDir.normalize();
      this.generateNewTarget();
      this.lastPathChange = 0;
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