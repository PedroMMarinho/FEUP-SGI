import * as THREE from 'three';

class TimeManager {
    constructor() {
        if (TimeManager._instance) {
            return TimeManager._instance;
        }

        this.clock = new THREE.Clock();
        this.elapsedTime = 0;  // total elapsed time in seconds
        this.deltaTime = 0;    // time since last update

        TimeManager._instance = this;
    }

    update() {
        this.deltaTime = this.clock.getDelta();
        this.elapsedTime += this.deltaTime;
    }

    reset() {
        this.clock.start();
        this.elapsedTime = 0;
        this.deltaTime = 0;
    }

    getElapsedTime() {
        return this.elapsedTime;
    }

    getDeltaTime() {
        return this.deltaTime;
    }

    // static method to get the singleton instance
    static getInstance() {
        if (!TimeManager._instance) {
            new TimeManager();
        }
        return TimeManager._instance;
    }
}

TimeManager._instance = null;

export { TimeManager };
