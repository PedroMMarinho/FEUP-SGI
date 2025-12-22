import * as THREE from "three";
import { BubbleParticle } from "./BubbleParticle.js";
import { TimeManager } from "../../managers/TimeManager.js";

export class BubbleColumns extends THREE.Object3D {
    constructor(columns = [], maxHeight = 6, particleCount = 200) {
        super();
        this.timeManager = TimeManager.getInstance();
        this.columns = columns;
        this.maxHeight = maxHeight;
        this.lastTime = this.timeManager.getElapsedTime();

        this.particles = new BubbleParticle(particleCount);
        this.add(this.particles.mesh);

        this._init();
    }

    _init() {
        for (let i = 0; i < this.particles.count; i++) {
            this._respawn(i, true);
        }
        this.particles.flagUpdates();
    }

    _respawn(i, randomHeight = false) {
        const p = this.particles;
        const i3 = i * 3;

        const column =
            this.columns.length > 0
                ? this.columns[Math.floor(Math.random() * this.columns.length)]
                : new THREE.Vector3();

        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 0.4;

        p.positions[i3]     = column.x + Math.cos(angle) * radius;
        p.positions[i3 + 1] = column.y + (randomHeight ? Math.random() * this.maxHeight : 0);
        p.positions[i3 + 2] = column.z + Math.sin(angle) * radius;

        const sizeFactor = 4 + Math.random() * 4;

        p.velocities[i] = 0.05 + sizeFactor*sizeFactor * 0.03;


        p.ages[i] = 0;
        p.lifetimes[i] = 2 + Math.random() * 20;

        p.colors[i3] = 1.0;
        p.colors[i3+1] = 1.0;
        p.colors[i3+2] = 1.0;
    }

    updateState() {
        const p = this.particles;

        const currentTime = this.timeManager.getElapsedTime();
        let delta = currentTime - this.lastTime;
        this.lastTime = currentTime;


        for (let i = 0; i < p.count; i++) {
            const i3 = i * 3;

            p.positions[i3 + 1] += p.velocities[i] * delta;
            p.ages[i] += delta;

            if (
                p.ages[i] > p.lifetimes[i] ||
                p.positions[i3 + 1] > this.maxHeight
            ) {
                this._respawn(i);
            }
        }

        p.flagUpdates();
    }
}
