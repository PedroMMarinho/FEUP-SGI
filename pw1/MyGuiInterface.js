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
        // add a folder to the gui interface for the box
        const boxFolder = this.datgui.addFolder('Box');
        // note that we are using a property from the contents object 
        boxFolder.add(this.contents, 'boxMeshSize', 0, 10).name("size").onChange(() => { this.contents.rebuildBox() });
        boxFolder.add(this.contents, 'boxEnabled', true).name("enabled");
        boxFolder.add(this.contents.boxDisplacement, 'x', -5, 5)
        boxFolder.add(this.contents.boxDisplacement, 'y', -5, 5)
        boxFolder.add(this.contents.boxDisplacement, 'z', -5, 5)
        boxFolder.open()

        const tableFolder = this.datgui.addFolder('Table');
        tableFolder.add(this.contents, 'tableEnabled', true).name("enabled");

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
        const cameraFolder = this.datgui.addFolder('Camera')
        cameraFolder.add(this.app, 'activeCameraName', ['Perspective', 'Left', 'Top', 'Front', 'Back', 'Right', 'Perspective2']).name("active camera");
        // note that we are using a property from the app 
        cameraFolder.add(this.app.activeCamera.position, 'x', 0, 10).name("x coord")
        cameraFolder.open()

        // Point Light 
        const pointData = {
            'point color': this.contents.pointLightColor
        }

        //const pointLightFolder = this.datgui.addFolder( ' Point Light' );
        //pointLightFolder.add(this.contents.pointLightPosition, 'x', -10, 10).name("x coord").onChange( (value) => { this.contents.updatePointLightPosition(value, null, null) } );
        //pointLightFolder.add(this.contents.pointLightPosition, 'y', -20, 10).name("y coord").onChange( (value) => { this.contents.updatePointLightPosition(null, value, null) } );
        //pointLightFolder.add(this.contents.pointLightPosition, 'z', -10, 10).name("z coord").onChange( (value) => { this.contents.updatePointLightPosition(null, null, value) } );
        //pointLightFolder.addColor( pointData, 'point color' ).name("light color").onChange( (value) => { this.contents.updatePointLightColor(value) } );

        const ambientData = {
            'ambient color': this.contents.ambientLightColor,
            'intensity': this.contents.ambientLightIntensity
        }

        const ambientLightFolder = this.datgui.addFolder(' Ambient Light');
        ambientLightFolder.addColor(ambientData, 'ambient color').name("light color").onChange((value) => { this.contents.updateAmbientLightColor(value) });
        ambientLightFolder.add(ambientData, 'intensity', 0, 20.0).name("intensity").onChange((value) => { this.contents.updateAmbientLightIntensity(value) });


        const directionalLightData = {
            'color': this.contents.directionalLightColor,
            'intensity': this.contents.directionalLightIntensity,
            visible: this.contents.directionalLight.visible

        }

        const directionalLightFolder = this.datgui.addFolder('Directional Light');
        directionalLightFolder.addColor(directionalLightData, 'color').name("color").onChange((value) => { this.contents.updateDirectionalLightColor(value) });
        directionalLightFolder.add(directionalLightData, 'intensity', 0, 20.0).name("intensity").onChange((value) => { this.contents.updateDirectionalLightIntensity(value) });
        directionalLightFolder.add(directionalLightData, 'visible').name("visible").onChange((v) => this.contents.updateDirectionalLightVisibility(v));

        const directionalPositionFolder = directionalLightFolder.addFolder('Light Position');
        directionalPositionFolder.add(this.contents.directionalLight.position, 'x', -10, 10).name("x coord").onChange((value) => { this.contents.updateDirectionalLightPosition(value, null, null) });
        directionalPositionFolder.add(this.contents.directionalLight.position, 'y', -10, 10).name("y coord").onChange((value) => { this.contents.updateDirectionalLightPosition(null, value, null) });
        directionalPositionFolder.add(this.contents.directionalLight.position, 'z', -10, 10).name("z coord").onChange((value) => { this.contents.updateDirectionalLightPosition(null, null, value) });

        const directionalTargetFolder = directionalLightFolder.addFolder('Target Position');
        directionalTargetFolder.add(this.contents.directionalLightTargetObj.position, 'x', -10, 10).name("x coord").onChange((value) => { this.contents.updateDirectionalLightTarget(value, null, null) });
        directionalTargetFolder.add(this.contents.directionalLightTargetObj.position, 'y', -10, 10).name("y coord").onChange((value) => { this.contents.updateDirectionalLightTarget(null, value, null) });
        directionalTargetFolder.add(this.contents.directionalLightTargetObj.position, 'z', -10, 10).name("z coord").onChange((value) => { this.contents.updateDirectionalLightTarget(null, null, value) });


        const spotData = {
            color: this.contents.spotLightColor,
            intensity: this.contents.spotLightIntensity,
            distance: this.contents.spotLight.distance,
            angle: THREE.MathUtils.radToDeg(this.contents.spotLight.angle),
            penumbra: this.contents.spotLight.penumbra,
            decay: this.contents.spotLight.decay,
            posY: this.contents.spotLight.position.y,
            targetY: this.contents.spotLight.target.position.y,
            visible: this.contents.spotLight.visible
        };

        const spotFolder = this.datgui.addFolder('Spot Light');

        spotFolder.addColor(spotData, 'color').name("color").onChange((v) => this.contents.updateSpotLightColor(v));
        spotFolder.add(spotData, 'intensity', 0, 50).name("intensity").onChange((v) => this.contents.updateSpotLightIntensity(v));
        spotFolder.add(spotData, 'distance', 0, 50).name("distance").onChange((v) => this.contents.updateSpotLightDistance(v));
        spotFolder.add(spotData, 'angle', 0, 90).name("angle (°)").onChange((v) => this.contents.updateSpotLightAngle(v));
        spotFolder.add(spotData, 'penumbra', 0, 1).step(0.01).name("penumbra").onChange((v) => this.contents.updateSpotLightPenumbra(v));
        spotFolder.add(spotData, 'decay', 0, 5).step(0.1).name("decay").onChange((v) => this.contents.updateSpotLightDecay(v));
        spotFolder.add(spotData, 'posY', -20, 20).name("Y position").onChange((v) => this.contents.updateSpotLightPositionY(v));
        spotFolder.add(spotData, 'targetY', -20, 20).name("Y target").onChange((v) => this.contents.updateSpotLightTargetY(v));
        spotFolder.add(spotData, 'visible').name("visible").onChange((v) => this.contents.updateSpotLightVisibility(v));


    }
}

export { MyGuiInterface };
