import * as THREE from 'three';

class TimeManager {
    constructor() {
        if (TimeManager._instance) {
            return TimeManager._instance;
        }

        this.clock = new THREE.Clock();

        TimeManager._instance = this;
    }

    getElapsedTime() {
        return this.clock.getElapsedTime();
    }


    static getInstance() {
        if (!TimeManager._instance) {
            new TimeManager();
        }
        return TimeManager._instance;
    }
}

TimeManager._instance = null;

export { TimeManager };
