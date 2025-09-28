import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { MyApp } from './MyApp.js';
import { MyContents } from './MyContents.js';
import * as THREE from 'three';
/**
    This class customizes the gui interface for the app
*/
class MyGuiInterface {

    /**
     * 
     * @param {MyApp} app The application object 
     */
    constructor(app) {
        this.app = app
        this.datgui = new GUI();
        this.contents = null
    }

    /**
     * Set the contents object
     * @param {MyContents} contents the contents objects 
     */
    setContents(contents) {
        this.contents = contents
    }

    /**
     * Initialize the gui interface
     */
    init() {


        const objectFolder = this.datgui.addFolder('Objects');
        const lightFolder = this.datgui.addFolder('Lights');
        const cameraFolder = this.datgui.addFolder('Camera')

        cameraFolder.add(this.app, 'activeCameraName', ['Perspective', 'Left', 'Top', 'Front', 'Back', 'Right', 'Perspective2']).name("active camera");
        cameraFolder.add(this.app.activeCamera.position, 'x', 0, 20).name("x coord");
        cameraFolder.open();

    }
}

export { MyGuiInterface };
