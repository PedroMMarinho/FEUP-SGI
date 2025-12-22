class KeyManager {
    constructor() {
        this.activeKeys = {};

        this.mouseDelta = { x: 0, y: 0 };
        this.mousePos = { x: 0, y: 0 };

        this.mouseHeld = false;
        this.mouseDownThisFrame = false;
        this.mouseUpThisFrame = false;

        const canvas = document.getElementById('canvas');

        canvas.addEventListener('mousedown', (e) => this.processMouseDown(e), false);
        canvas.addEventListener('mouseup',   (e) => this.processMouseUp(e), false);
        document.addEventListener('mousemove', (e) => this.processMouseMove(e), false);

        document.addEventListener('keydown', (event) => this.processKeyDown(event), false);
        document.addEventListener('keyup',   (event) => this.processKeyUp(event), false);

        window.addEventListener('blur',  () => this.reset());
        window.addEventListener('focus', () => this.reset());
        window.addEventListener('load',  () => this.reset());
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

        this.mousePos.x = event.clientX;
        this.mousePos.y = event.clientY;
    }

    processMouseDown() {
        this.mouseHeld = true;
        this.mouseDownThisFrame = true;  
    }

    processMouseUp() {
        this.mouseHeld = false;
        this.mouseUpThisFrame = true;     
    }

    getMousePos() {
        return { ...this.mousePos };
    }

    getDelta() {
        const delta = { ...this.mouseDelta };
        this.mouseDelta = { x: 0, y: 0 };
        return delta;
    }

    isMouseDownThisFrame() {
        return this.mouseDownThisFrame;
    }

    isMouseUpThisFrame() {
        return this.mouseUpThisFrame;
    }

    isMouseHeld() {
        return this.mouseHeld;
    }

    endOfFrame() {
        this.mouseDownThisFrame = false;
        this.mouseUpThisFrame = false;
    }

    reset() {
        this.activeKeys = {};
        this.mouseHeld = false;
        this.mouseDownThisFrame = false;
        this.mouseUpThisFrame = false;
        this.mouseDelta = { x: 0, y: 0 };
    }
}

export { KeyManager };
