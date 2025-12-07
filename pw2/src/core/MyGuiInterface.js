import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import * as THREE from 'three';
import { MyApp } from './MyApp.js';
import { MyContents } from './MyContents.js';
import { PeriscopeHUDType } from '../enums/PeriscopeHUDType.js';
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

        if (cameraFolder) {

            const hudNames = Object.values(PeriscopeHUDType);;
            const hudController = cameraFolder
                .add(this.app.passManager, 'currentPeriscopeHUD', hudNames)
                .name('Periscope HUD Type');

            hudController.onChange((type) => {
                this.app.passManager.setHUDType(type, this.app.cameraManager.activeCameraName);
            });
        }

        // --- Render mode controls (wireframe / fill) ---
        const renderFolder = this.datgui.addFolder('Render Mode');
        const renderOptions = { mode: 'Fill' };

        renderFolder.add(renderOptions, 'mode', ['Fill', 'Wireframe']).name('Polygon Mode').onChange((value) => {
            const wireframe = value === 'Wireframe';
            this.contents.setWireframeMode(wireframe);
        });

        renderFolder.open();

        // --- BVH Acceleration controls ---
        const bvhParams = this.contents.bvhManager;
        if (bvhParams) {
            const accelerationFolder = this.datgui.addFolder('Acceleration');

            accelerationFolder
                .add(bvhParams, 'useBVH')
                .name('Use BVH')
                .onChange((enabled) => {
                    bvhParams.toggleBVH(enabled);
                });

            accelerationFolder.open();
        }
        // --- Collision Box Visualization ---
        const collisionManager = this.contents.collisionManager;
        if (collisionManager) {
            const collisionFolder = this.datgui.addFolder('Collision Boxes');

            const collisionParams = {
                showBoxes: false
            };

            collisionFolder
                .add(collisionParams, 'showBoxes')
                .name('Show Collision Boxes')
                .onChange((enabled) => {
                    collisionManager.toggleBoxVisualization(enabled);
                });

            collisionFolder.open();
        }

        // Boid behavior controls
        const boidProperties = this.contents.aquarium.boidProps;
        if (boidProperties) {
            const boidFolder = this.datgui.addFolder('Boid Behavior');

            boidFolder
                .add(boidProperties, 'cohesion', 0, 5, 0.1)
                .name('Cohesion Strength');
            boidFolder
                .add(boidProperties, 'separation', 0, 5, 0.1)
                .name('Separation Strength');
            boidFolder
                .add(boidProperties, 'alignment', 0, 5, 0.1)
                .name('Alignment Strength');
            boidFolder
                .add(boidProperties, 'moveSpeed', 0, 10, 0.1)
                .name('Movement Speed');
            boidFolder
                .add(boidProperties, 'awareness', 1, 20, 1)
                .name('Awareness Radius');

            boidFolder.open();
        }
        // Enable disable shadows
        
        const shadowFolder = this.datgui.addFolder('Shadows');

        shadowFolder
            .add(this.contents.aquarium, 'shadowsEnabled')
            .name('Enable Shadows')
            .onChange((enabled) => {
                this.contents.aquarium.setupShadows(enabled);
            });

        
        const submarineFolder = this.datgui.addFolder('Submarine Controls');
        // Submarine light controls
        const submarine = this.contents.aquarium.submarine;
        if (submarine && submarine.lightControls) {
            // Chain folders

            const lightFolder = submarineFolder.addFolder('Submarine Lights');

                    lightFolder.addColor(submarine.lightControls, "frontLightColor")
        .onChange(() => submarine.applyLightControls())
        .name("Front Light Color");

        lightFolder.add(submarine.lightControls, "frontLightIntensity", 0, 500)
        .onChange(() => submarine.applyLightControls())
        .name("Front Light Intensity");
        
        lightFolder.add(submarine.lightControls, "frontLightDistance", 0.1, 100)
        .onChange(() => submarine.applyLightControls())
        .name("Front Light Distance");


        lightFolder.add(submarine.lightControls, "warningFlashFrequency", 0, 5)
        .onChange(() => submarine.applyLightControls())
        .name("Warning Flash Freq");

        lightFolder.add(submarine.lightControls, "warningLightIntensity", 0, 100)
        .onChange(() => submarine.applyLightControls())
        .name("Warning Light Intensity");
            lightFolder.open();
        }

        // submarine shield controls
        if (submarine && submarine.shieldControls) {
            const shieldFolder = submarineFolder.addFolder('Submarine Shield');
            shieldFolder.add(submarine.shieldControls, "isActive")
        .name("Activate Shield")
        .onChange(() => submarine.applyShieldControls());

            
            shieldFolder.addColor(submarine.shieldControls, "shieldGlowColor")
        .onChange(() => submarine.applyShieldControls())
        .name("Shield Glow Color");
        
            shieldFolder.add(submarine.shieldControls, "c", 0, 5)
        .onChange(() => submarine.applyShieldControls())
        .name("Shield c Param");

            shieldFolder.add(submarine.shieldControls, "p", 0, 5)
        .onChange(() => submarine.applyShieldControls())
        .name("Shield p Param");
            shieldFolder.open();
        }


    }
}

export { MyGuiInterface };
