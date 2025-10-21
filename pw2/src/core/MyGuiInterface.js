import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import * as THREE from 'three';
import { MyApp } from './MyApp.js';
import { MyContents } from './MyContents.js';

/**
 * Custom GUI interface for the app
 */
class MyGuiInterface {
    /**
     * @param {MyApp} app The application object
     */
    constructor(app) {
        this.app = app;
        this.datgui = new GUI();
        this.contents = null;
    }

    /**
     * Set the contents object
     * @param {MyContents} contents the contents object
     */
    setContents(contents) {
        this.contents = contents;
    }

    /**
     * Initialize the GUI interface
     */
    init() {
        // --- Axis controls ---
        const axisFolder = this.datgui.addFolder('Axis');
        axisFolder
            .add(this.contents, 'showAxis')
            .name('Show Axis')
            .onChange((value) => {
                this.contents.enableAxis(value);
            });

        // --- Camera controls ---
        const cameraFolder = this.datgui.addFolder('Camera');
        const cameraNames = Object.keys(this.app.cameraManager.cameras);

        const cameraController = cameraFolder
            .add(this.app.cameraManager, 'cameraSelection', cameraNames)
            .name('Active Camera');

        cameraController.onChange((name) => {
            this.app.cameraManager.setActiveCamera(name);
        });

        cameraFolder.open();

        // --- Render mode controls (wireframe / fill) ---
        const renderFolder = this.datgui.addFolder('Render Mode');
        const renderOptions = { mode: 'Fill' };

        renderFolder.add(renderOptions, 'mode', ['Fill', 'Wireframe']).name('Polygon Mode').onChange((value) => {
            const wireframe = value === 'Wireframe';
            this.contents.setWireframeMode(wireframe);
        });

        renderFolder.open();
    }
}

export { MyGuiInterface };
