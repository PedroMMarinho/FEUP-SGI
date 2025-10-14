class KeyManager {
    constructor() {
        this.activeKeys = {};
        this.mouseDelta = { x: 0, y: 0 };
        this.mouseClicked = false;


        const canvas = document.getElementById('canvas');
        canvas.addEventListener('click', () => { this.mouseClicked = true; }, false);        
        document.addEventListener('keydown', (event) => this.processKeyDown(event), false);
        document.addEventListener('keyup', (event) => this.processKeyUp(event), false);
        document.addEventListener('mousemove', (event) => this.processMouseMove(event), false);

        // Debugging: see when lock changes
        document.addEventListener('pointerlockchange', () => {
            console.log('Pointer lock state:', document.pointerLockElement ? 'locked' : 'unlocked');
        });
    }

    processKeyDown(event) {
        this.activeKeys[event.code] = true;
    }

    processKeyUp(event) {
        this.activeKeys[event.code] = false;
    }

    isKeyPressed(keyCode) {
        return this.activeKeys[keyCode] || false;
    }

    processMouseMove(event) {
        // Only capture movement when pointer lock is active
        if (document.pointerLockElement) {
            this.mouseDelta.x += event.movementX || 0;
            this.mouseDelta.y += event.movementY || 0;
        }
    }

    getDelta() {
        const delta = { ...this.mouseDelta };
        this.mouseDelta.x = 0;
        this.mouseDelta.y = 0;
        return delta;
    }

    isMouseClicked() {
        if (this.mouseClicked) {
            this.mouseClicked = false;
            return true;
        }
        return false;
    }
}

export { KeyManager };
