import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import * as THREE from 'three';
import { MyApp } from './MyApp.js';
import { MyContents } from './MyContents.js';
import { PeriscopeHUDType } from '../enums/PeriscopeHUDType.js';
import { RenderType } from '../enums/RenderType.js';
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
        // ====================================================================
        // 1. CAMERA & VIEW (Camera selection, HUD, Post-Processing)
        // ====================================================================
        const viewFolder = this.datgui.addFolder('Camera & View');
        
        // --- Camera Selection ---
        const cameraNames = Object.keys(this.app.cameraManager.cameras);
        viewFolder.add(this.app.cameraManager, 'cameraSelection', cameraNames)
            .name('Active Camera')
            .onChange((name) => {
                this.app.cameraManager.setActiveCamera(name);
            });

        // --- Render Mode (Fill/Wireframe) ---
        const renderOptions = { mode: 'Fill' };
        viewFolder.add(renderOptions, 'mode', ['Fill', 'Wireframe'])
            .name('Polygon Mode')
            .onChange((value) => {
                this.contents.setWireframeMode(value === 'Wireframe');
            });

        // --- HUD & Post-Processing ---
        const hudNamesPeriscope = Object.values(PeriscopeHUDType);
        viewFolder.add(this.app.passManager, 'currentPeriscopeHUD', hudNamesPeriscope)
            .name('Periscope HUD')
            .onChange((type) => {
                this.app.passManager.setHUDType(type, this.app.cameraManager.activeCameraName);
            });

        const hudRender = Object.values(RenderType);
        viewFolder.add(this.app.passManager, 'currentRenderType', hudRender)
            .name('Render Type')
            .onChange((type) => {
                this.app.passManager.setRenderType(type);
            });


        // ====================================================================
        // 2. ENVIRONMENT (Lighting, Shadows, Fog)
        // ====================================================================
        const envFolder = this.datgui.addFolder('Environment');
        const scenario = this.contents.scenarioManager;

        if (scenario) {
            const intensities = scenario.originalLightsIntensity;
            envFolder.add(intensities, 'directional', 0, 1, 0.01)
                .name('Sun Intensity')
                .onChange((value) => scenario.updateDirectionalLight(value));
            
            envFolder.add(intensities, 'ambient', 0, 1, 0.01)
                .name('Ambient Intensity')
                .onChange((value) => scenario.updateAmbientLight(value));
            
            envFolder.add(scenario, 'originalFogIntensity', 0, 0.1, 0.001)
                .name('Fog Density')
                .onChange((value) => scenario.updateFogIntensity(value));
        }

        // --- Shadows ---
        envFolder.add(this.contents.aquarium, 'shadowsEnabled')
            .name('Enable Shadows')
            .onChange((enabled) => {
                this.contents.aquarium.setupShadows(enabled);
            });


        // ====================================================================
        // 3. SUBMARINE (Lights, Shield)
        // ====================================================================
        const subFolder = this.datgui.addFolder('Submarine');
        const submarine = this.contents.aquarium.submarine;

        if (submarine) {
            // --- Lights ---
            if (submarine.lightControls) {
                const lightFolder = subFolder.addFolder('Lights System');
                
                lightFolder.addColor(submarine.lightControls, "frontLightColor")
                    .name("Front Light Color")
                    .onChange(() => submarine.applyLightControls());

                lightFolder.add(submarine.lightControls, "frontLightIntensity", 0, 500)
                    .name("Front Intensity")
                    .onChange(() => submarine.applyLightControls());
                
                lightFolder.add(submarine.lightControls, "frontLightDistance", 0.1, 100)
                    .name("Front Distance")
                    .onChange(() => submarine.applyLightControls());

                lightFolder.add(submarine.lightControls, "warningFlashFrequency", 0, 5)
                    .name("Warning Flash Freq")
                    .onChange(() => submarine.applyLightControls());

                lightFolder.add(submarine.lightControls, "warningLightIntensity", 0, 100)
                    .name("Warning Intensity")
                    .onChange(() => submarine.applyLightControls());
            }

            // --- Shield ---
            if (submarine.shieldControls) {
                const shieldFolder = subFolder.addFolder('Shield System');
                
                shieldFolder.add(submarine.shieldControls, "isActive")
                    .name("Activate Shield")
                    .onChange(() => submarine.applyShieldControls());
                
                shieldFolder.addColor(submarine.shieldControls, "shieldGlowColor")
                    .name("Glow Color")
                    .onChange(() => submarine.applyShieldControls());
                
                shieldFolder.add(submarine.shieldControls, "c", 1, 5)
                    .name("Intensity (c)")
                    .onChange(() => submarine.applyShieldControls());

                shieldFolder.add(submarine.shieldControls, "p", 1, 5)
                    .name("Falloff (p)")
                    .onChange(() => submarine.applyShieldControls());
            }
        }


        // ====================================================================
        // 4. ECOSYSTEM (Boids, Particles)
        // ====================================================================
        const ecoFolder = this.datgui.addFolder('Ecosystem');

        // --- Fish / Boids ---
        const boidProperties = this.contents.aquarium.boidProps;
        if (boidProperties) {
            const fishFolder = ecoFolder.addFolder('Fish Behavior');
            
            fishFolder.add(boidProperties, 'cohesion', 0, 5, 0.1).name('Cohesion');
            fishFolder.add(boidProperties, 'separation', 0, 5, 0.1).name('Separation');
            fishFolder.add(boidProperties, 'alignment', 0, 5, 0.1).name('Alignment');
            fishFolder.add(boidProperties, 'moveSpeed', 0, 10, 0.1).name('Speed');
            fishFolder.add(boidProperties, 'awareness', 1, 20, 1).name('Awareness');
        }

        // --- Particles ---
        const particleFolder = ecoFolder.addFolder('Particles');
        particleFolder.add(this.contents.aquarium, 'particlesUseLOD')
            .name('Use Distance LOD')
            .onChange((enabled) => {
                this.contents.aquarium.marineSnow.isUsingLOD = enabled;
                this.contents.aquarium.seabed.bubbleColumns.isUsingLOD = enabled;
            });


        // ====================================================================
        // 5. DEBUG & PERFORMANCE (BVH, Collisions)
        // ====================================================================
        const debugFolder = this.datgui.addFolder('Debug & Performance');
        debugFolder.close(); 

        // --- BVH ---
        const bvhParams = this.contents.bvhManager;
        if (bvhParams) {
            debugFolder.add(bvhParams, 'useBVH')
                .name('Use BVH Acceleration')
                .onChange((enabled) => bvhParams.toggleBVH(enabled));
        }

        // --- Collision Boxes ---
        const collisionManager = this.contents.collisionManager;
        if (collisionManager) {
            const collisionParams = { showBoxes: false };
            debugFolder.add(collisionParams, 'showBoxes')
                .name('Show Collision Boxes')
                .onChange((enabled) => collisionManager.toggleBoxVisualization(enabled));
        }
    }
}

export { MyGuiInterface };
