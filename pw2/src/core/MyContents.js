import * as THREE from 'three';
import { MyAxis } from '../objects/MyAxis.js';
import { Aquarium } from '../objects/Aquarium.js';
import { AssetManager } from '../managers/AssetManager.js';
import { CollisionManager } from '../managers/CollisionManager.js';
import { TimeManager } from '../managers/TimeManager.js';
import { BVHManager } from '../managers/BVHManager.js';

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
        this.assetManager = new AssetManager(app.renderer); // Asset Manager
        this.keyManager = this.app.keyManager;
        this.cameraManager = this.app.cameraManager;
        this.bvhManager = new BVHManager(this.app.scene, this.keyManager, this.cameraManager);
        this.collisionManager = new CollisionManager(this.app.scene, this.bvhManager);
        this.timeManager = new TimeManager();
        this.aquarium = new Aquarium(this.assetManager, this.keyManager, this.cameraManager, this.collisionManager, this.bvhManager,this.app.scene); // Main Object of the scene
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
        const ambientLight = new THREE.AmbientLight(0xFFFFFF, 2);
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
        // TODO This needs to be on other place
        this.bvhManager.raycastSelect();
        if (this.aquarium) this.aquarium.update();
        this.keyManager.endOfFrame();
    }

}

export { MyContents };
