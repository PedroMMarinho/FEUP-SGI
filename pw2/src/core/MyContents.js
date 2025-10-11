import * as THREE from 'three';
import { MyAxis } from '../objects/MyAxis.js';
import { Aquarium } from '../objects/Aquarium.js';
import { TextureManager } from '../managers/TextureManager.js';

/**
 *  This class contains the contents of out application
 */
class MyContents {

    /**
       constructs the object
       @param {MyApp} app The application object
    */
    constructor(app) {
        this.app = app
        this.axis = new MyAxis(this);
        this.showAxis = true;
        this.aquarium = new Aquarium(this); // Main Object of the scene
        this.textureManager = new TextureManager(); // Texture Manager
    }

    /**
     * initializes the contents
     */
    init() {
        // Load textures
        this.textureManager.loadTextures();
        // Lights TODO
        const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.5);
        this.app.scene.add(ambientLight);
        // Load axis
        this.app.scene.add(this.axis);
        // Load aquarium
        this.app.scene.add(this.aquarium);
    }

    


    enableAxis(value){
        this.axis.visible = value;
    }

    setWireframeMode(wireframe) {
        this.app.scene.traverse((child) => {
            if (child.isMesh && child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(mat => mat.wireframe = wireframe);
                } else {
                    child.material.wireframe = wireframe;
                }
            }
        });
    }
    
    /**
     * updates the contents
     * this method is called from the render method of the app
     * 
     */
    update() {
    }

}

export { MyContents };
