class KeyManager {
    constructor() {
        this.activeKeys = {};
        this.mouseDelta = { x: 0, y: 0 };
        this.mouseHeld = false;


        const canvas = document.getElementById('canvas');
        canvas.addEventListener('mousedown', () => this.processMouseDown(), false);
        canvas.addEventListener('mouseup', () => this.processMouseUp(), false);
        document.addEventListener('keydown', (event) => this.processKeyDown(event), false);
        document.addEventListener('keyup', (event) => this.processKeyUp(event), false);
        document.addEventListener('mousemove', (event) => this.processMouseMove(event), false);
        window.addEventListener('blur', () => this.resetKeys(), false);
        window.addEventListener('focus', () => this.resetKeys(), false);
        window.addEventListener('load', () => this.resetKeys(), false);


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
        this.mouseDelta.x += event.movementX || 0;
        this.mouseDelta.y += event.movementY || 0;
        
    }

    getDelta() {
        const delta = { ...this.mouseDelta };
        this.mouseDelta.x = 0;
        this.mouseDelta.y = 0;
        return delta;
    }

    processMouseDown() {
        this.mouseHeld = true;
    }

    processMouseUp() {
        this.mouseHeld = false;
    }

    isMousePressed() {
        return this.mouseHeld;
    }       
    
    resetKeys() {
        this.activeKeys = {};
        this.mouseHeld = false;
        this.mouseDelta = { x: 0, y: 0 };
    }
}

export { KeyManager };
