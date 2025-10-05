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

        /*
        const wallsFolder = this.datgui.addFolder('Walls');
        wallsFolder.add(this.contents, 'wallsEnabled', true).name("enabled");
        
        wallsFolder.add(this.contents.wallParams, 'wrapS', {
            ClampToEdgeWrapping: THREE.ClampToEdgeWrapping,
            RepeatWrapping: THREE.RepeatWrapping,
            MirroredRepeatWrapping: THREE.MirroredRepeatWrapping
        }).name("wrap S").onChange((value) => {
            this.contents.updateWallTextureWrapS(value);
        });

        wallsFolder.add(this.contents.wallParams, 'wrapT', {
            ClampToEdgeWrapping: THREE.ClampToEdgeWrapping,
            RepeatWrapping: THREE.RepeatWrapping,
            MirroredRepeatWrapping: THREE.MirroredRepeatWrapping
        }).name("wrap T").onChange((value) => {
            this.contents.updateWallTextureWrapT(value);
        });

        wallsFolder.add(this.contents.wallParams, 'repeatS', 1, 5, 1).onChange((value) => {
            this.contents.updateWallTextureRepeatS(value);
        });

        wallsFolder.add(this.contents.wallParams, 'repeatT', 1, 5, 1).onChange((value) => {
            this.contents.updateWallTextureRepeatT(value);
        });

        const data = {
            'diffuse color': this.contents.diffusePlaneColor,
            'specular color': this.contents.specularPlaneColor,
        };

        // adds a folder to the gui interface for the plane
        const planeFolder = this.datgui.addFolder('Plane');
        planeFolder.addColor(data, 'diffuse color').onChange((value) => { this.contents.updateDiffusePlaneColor(value) });
        planeFolder.addColor(data, 'specular color').onChange((value) => { this.contents.updateSpecularPlaneColor(value) });
        planeFolder.add(this.contents, 'planeShininess', 0, 1000).name("shininess").onChange((value) => { this.contents.updatePlaneShininess(value) });
        planeFolder.open();

        // adds a folder to the gui interface for the camera
*/
        // const objectFolder = this.datgui.addFolder('Objects');
        const lightFolder = this.datgui.addFolder('Lights');
		lightFolder.add(this.contents, 'lamp1Power', 0, 100).name("Light1 Power").onChange((value) => { this.contents.updateLamp1Power(value); });
		lightFolder.add(this.contents, 'lamp1Power', 0, 100).name("Light2 Power").onChange((value) => { this.contents.updateLamp2Power(value); });

        const cameraFolder = this.datgui.addFolder('Camera')

        cameraFolder.add(this.app, 'activeCameraName', ['Perspective', 'Left', 'Top', 'Front', 'Back', 'Right', 'Perspective2']).name("active camera");
        cameraFolder.add(this.app.activeCamera.position, 'x', 0, 20).name("x coord");
        cameraFolder.open();

    }
}

export { MyGuiInterface };
