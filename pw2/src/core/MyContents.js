import * as THREE from 'three';
import { MyAxis } from '../objects/MyAxis.js';
import { Aquarium } from '../objects/Aquarium.js';
import { AssetManager } from '../managers/AssetManager.js';
import { CollisionManager } from '../managers/CollisionManager.js';
import { TimeManager } from '../managers/TimeManager.js';

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
        this.assetManager = new AssetManager(); // Asset Manager
        this.keyManager = this.app.keyManager;
        this.cameraManager = this.app.cameraManager;
        this.collisionManager = new CollisionManager(this.app.scene);
        this.timeManager = new TimeManager();
        this.aquarium = new Aquarium(this.assetManager, this.keyManager, this.cameraManager, this.collisionManager, this.app.scene); // Main Object of the scene
    }

    /**
     * initializes the contents
     */
    async init() {
        // asset loading
        await this.assetManager.preloadAll();
        // Initialize aquarium
        this.aquarium.init();

        
        // Lights TODO
        const ambientLight = new THREE.AmbientLight(0xFFFFFF, 2.5);
        const pointLight = new THREE.PointLight(0xFFFFFF, 40);
        const pointLightHelper = new THREE.PointLightHelper(pointLight, 0.5);
        pointLight.position.set(5, 5, 5);
        this.app.scene.add(ambientLight);
        this.app.scene.add(pointLight);
        this.app.scene.add(pointLightHelper);


        // Load axis
        this.app.scene.add(this.axis);
        // Load aquarium
        this.app.scene.add(this.aquarium);
    }

    enableAxis(value){
        this.axis.visible = value;
    }

    setWireframeMode(wireframe) {
        this.aquarium.traverse((child) => {
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
        if (this.aquarium) this.aquarium.update();
    }

}

export { MyContents };
