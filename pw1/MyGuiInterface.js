import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { MyApp } from './MyApp.js';
import { MyContents } from './MyContents.js';

/**
    This class customizes the gui interface for the app
*/
class MyGuiInterface  {

    /**
     * 
     * @param {MyApp} app The application object 
     */
    constructor(app) {
        this.app = app
        this.datgui =  new GUI();
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
        const boxFolder = this.datgui.addFolder( 'Box' );
        // note that we are using a property from the contents object 
        boxFolder.add(this.contents, 'boxMeshSize', 0, 10).name("size").onChange( () => { this.contents.rebuildBox() } );
        boxFolder.add(this.contents, 'boxEnabled', true).name("enabled");
        boxFolder.add(this.contents.boxDisplacement, 'x', -5, 5)
        boxFolder.add(this.contents.boxDisplacement, 'y', -5, 5)
        boxFolder.add(this.contents.boxDisplacement, 'z', -5, 5)
        boxFolder.open()

        const tableFolder = this.datgui.addFolder( 'Table' );
        tableFolder.add(this.contents, 'tableEnabled', true).name("enabled");

        const wallsFolder = this.datgui.addFolder( 'Walls' );
        wallsFolder.add(this.contents, 'wallsEnabled', true).name("enabled");
        
        const data = {  
            'diffuse color': this.contents.diffusePlaneColor,
            'specular color': this.contents.specularPlaneColor,
        };

        // adds a folder to the gui interface for the plane
        const planeFolder = this.datgui.addFolder( 'Plane' );
        planeFolder.addColor( data, 'diffuse color' ).onChange( (value) => { this.contents.updateDiffusePlaneColor(value) } );
        planeFolder.addColor( data, 'specular color' ).onChange( (value) => { this.contents.updateSpecularPlaneColor(value) } );
        planeFolder.add(this.contents, 'planeShininess', 0, 1000).name("shininess").onChange( (value) => { this.contents.updatePlaneShininess(value) } );
        planeFolder.open();

        // adds a folder to the gui interface for the camera
        const cameraFolder = this.datgui.addFolder('Camera')
        cameraFolder.add(this.app, 'activeCameraName', [ 'Perspective', 'Left', 'Top', 'Front', 'Back', 'Right','Perspective2' ] ).name("active camera");
        // note that we are using a property from the app 
        cameraFolder.add(this.app.activeCamera.position, 'x', 0, 10).name("x coord")
        cameraFolder.open()

        const pointData = {
            'point color': this.contents.pointLightColor
        }

        const pointLightFolder = this.datgui.addFolder( ' Point Light' );
        pointLightFolder.add(this.contents.pointLightPosition, 'x', -10, 10).name("x coord").onChange( (value) => { this.contents.updatePointLightPosition(value, null, null) } );
        pointLightFolder.add(this.contents.pointLightPosition, 'y', -20, 10).name("y coord").onChange( (value) => { this.contents.updatePointLightPosition(null, value, null) } );
        pointLightFolder.add(this.contents.pointLightPosition, 'z', -10, 10).name("z coord").onChange( (value) => { this.contents.updatePointLightPosition(null, null, value) } );
        pointLightFolder.addColor( pointData, 'point color' ).name("light color").onChange( (value) => { this.contents.updatePointLightColor(value) } );

        const ambientData = {
            'ambient color': this.contents.ambientLightColor
        }

        const ambientLightFolder = this.datgui.addFolder( ' Ambient Light' );
        ambientLightFolder.addColor( ambientData, 'ambient color' ).name("light color").onChange( (value) => { this.contents.updateAmbientLightColor(value) } );


    }
}

export { MyGuiInterface };
