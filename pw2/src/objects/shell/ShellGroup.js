import * as THREE from 'three';
import { ShellLOD } from './ShellLOD.js';

class ShellGroup extends THREE.Object3D {
    /**
     * @param {Array} data - Array of { modelLODs, position, rotation, scale }
     */
    constructor(data = []) {
        super();
        this.type = 'Group';
        this.data = data;
        this.shells = [];
        this.init();
    }

    init() {
        if (!this.data || this.data.length === 0) {
            console.warn('ShellGroup: No data provided');
            return;
        }

        for (const item of this.data) {
            const shell = new ShellLOD(item.modelLODs);

            shell.position.copy(item.position);
            shell.rotation.copy(item.rotation);
            shell.scale.set(item.scale, item.scale, item.scale);

            this.add(shell);
            this.shells.push(shell);
        }
    }
}

ShellGroup.prototype.isGroup = true;

export { ShellGroup };