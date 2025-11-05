import * as THREE from 'three';
import { Submarine } from './Submarine.js';

export class SubmarineLOD extends THREE.LOD {
	constructor(propellerBladeModel, keyManager, cameraManager, position = new THREE.Vector3(0, 5, 0)) {
		super();

		this.propellerBladeModel = propellerBladeModel;
		this.keyManager = keyManager;
		this.cameraManager = cameraManager;

		this.distanceOffset = 15;
		this.distanceStart = 40;

		this.position.copy(position);

		this.setupLODs();
		this.clock = new THREE.Clock();
this.currentSpeed = 0;
this.rotorSpeed = 0;
this.GLOBAL_SPEED = 1;
this.BASE_SPEED = 0.1;
this.TURN_RATE = 0.6;
this.VERTICAL_RATE = 0.8;
this.ACCELERATION_RATE = 1.4;
this.DECELERATION_RATE = 1.8;
this.MAX_SPEED = 7;
this.REVERSE_SPEED = 3;
this.ROTOR_ACCEL = 2.78;
this.ROTOR_DECEL = 9.5;
this.ROTOR_MAX = 9;

	}

	setupLODs() {
		const lodCount = this.lods?.length || 3; 
		let distance = this.distanceStart;

		for (let i = 0; i < lodCount; i++) {
			const submarine = new Submarine(
				this.propellerBladeModel[i],
				this.keyManager,
				this.cameraManager,
                i
			);

			this.addLevel(submarine, distance);
			distance += this.distanceOffset;
		}

		const emptyObject = new THREE.Object3D();
		this.addLevel(emptyObject, distance);
	}

updateState() {
    if (this.cameraManager.activeCameraName !== 'Submarine View') return;

    const delta = this.clock.getDelta();

    let isAccelerating = false;

    // --- FORWARD / BACKWARD ---
    if (this.keyManager.isKeyPressed('KeyW')) {
        this.currentSpeed = Math.min(
            this.currentSpeed + this.ACCELERATION_RATE * delta,
            this.MAX_SPEED
        );
        isAccelerating = true;
    } else if (this.keyManager.isKeyPressed('KeyS')) {
        this.currentSpeed = Math.max(
            this.currentSpeed - this.ACCELERATION_RATE * delta,
            -this.REVERSE_SPEED
        );
        isAccelerating = true;
    } else {
        if (this.currentSpeed > 0)
            this.currentSpeed = Math.max(this.currentSpeed - this.DECELERATION_RATE * delta, 0);
        else if (this.currentSpeed < 0)
            this.currentSpeed = Math.min(this.currentSpeed + this.DECELERATION_RATE * delta, 0);
    }

    // Move the whole LOD
    this.translateZ(-this.currentSpeed * delta * this.GLOBAL_SPEED);

    // --- TURNING (A/D) ---
    if (this.keyManager.isKeyPressed('KeyA')) {
        this.rotation.y += this.TURN_RATE * delta;
    }
    if (this.keyManager.isKeyPressed('KeyD')) {
        this.rotation.y -= this.TURN_RATE * delta;
    }

    // --- ASCEND / DESCEND (P/L) ---
    if (this.keyManager.isKeyPressed('KeyP')) {
        this.position.y += this.VERTICAL_RATE * delta;
    }
    if (this.keyManager.isKeyPressed('KeyL')) {
        this.position.y -= this.VERTICAL_RATE * delta;
    }

    // --- UPDATE ROTORS ONLY on visible LOD ---
    const visibleLevel = this.levels.find(l => l.object.visible);
    if (visibleLevel && visibleLevel.object.motorGroup) {
        const motorGroup = visibleLevel.object.motorGroup;

        if (Math.abs(this.currentSpeed) > 0.0001 || isAccelerating) {
            const targetDirection = this.currentSpeed >= 0 ? 1 : -1;

            if (Math.sign(this.rotorSpeed) !== targetDirection && Math.abs(this.rotorSpeed) > 0.0001) {
                this.rotorSpeed -= Math.sign(this.rotorSpeed) * this.ROTOR_DECEL * delta;
            } else {
                const accel = this.ROTOR_ACCEL * (this.currentSpeed !== 0 ? 1 : 0.5);
                this.rotorSpeed += targetDirection * accel * delta;
            }

            this.rotorSpeed = Math.max(-this.ROTOR_MAX, Math.min(this.rotorSpeed, this.ROTOR_MAX));
            motorGroup.rotateZ(this.rotorSpeed * delta);
        } else {
            if (Math.abs(this.rotorSpeed) > 0.00001) {
                this.rotorSpeed -= Math.sign(this.rotorSpeed) * this.ROTOR_DECEL * delta;
                motorGroup.rotateZ(this.rotorSpeed * delta);
            } else {
                this.rotorSpeed = 0;
            }
        }
    }
}

}
