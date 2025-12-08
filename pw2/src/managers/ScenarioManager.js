import * as THREE from 'three';

/**
 * ScenarioManager handles all lighting and environment scenarios
 */
class ScenarioManager {
    constructor(scene, assetManager, terrainWidth, terrainHeight) {
        this.scene = scene;
        this.assetManager = assetManager;
        this.terrainWidth = terrainWidth;
        this.terrainHeight = terrainHeight;
        
        this.lights = {};

        this.envMap = null;
        this.originalLightsIntensity = {
            directional: 0.3,
            ambient: 0.6
        };
        this.originalFogIntensity = 0.018;
    }

    /**
     * Initialize the default scenario
     */
    init() {
        this.createOutsideEnvironment();
        this.createWaterFog();
        this.createTopLight();
        this.createAmbientLight();
    }

    /**
     * Creates the outside HDRI environment
     */
    createOutsideEnvironment() {
        const hdri = this.assetManager.getHDRI('fin-hall');
        this.scene.environment = hdri.envMap;
        this.scene.background = hdri.envMap;
        this.envMap = hdri.envMap;
        
        this.scene.environmentIntensity = 0.02; 
        this.scene.backgroundIntensity = 0.5;
    }

    /**
     * Creates water fog effect
     */
    createWaterFog() {
        // Blue cyan color for underwater atmosphere
        this.scene.fog = new THREE.FogExp2(0x003d5c, this.originalFogIntensity);
    }

    /**
     * Creates the main directional light (top light)
     */
    createTopLight() {
        const topLight = new THREE.DirectionalLight(0xffffff, this.originalLightsIntensity.directional);

        topLight.position.set(30, 100, 20);
        topLight.castShadow = true;

        topLight.shadow.mapSize.width = 1024;
        topLight.shadow.mapSize.height = 1024;

        const d = 4 * this.terrainWidth / 5;
        topLight.shadow.camera.left = -d;
        topLight.shadow.camera.right = d;
        topLight.shadow.camera.top = d;
        topLight.shadow.camera.bottom = -d;

        topLight.shadow.camera.near = 0.1;
        topLight.shadow.camera.far = this.terrainHeight * 3;

        topLight.shadow.bias = -0.001;
        
        // Uncomment to debug shadow camera
        // const helper = new THREE.CameraHelper(topLight.shadow.camera);
        // this.add(helper);
        
        this.lights.directional = topLight;
        this.scene.add(topLight);
        
        return topLight;
    }

    /**
     * Creates ambient light
     */
    createAmbientLight() {
        const ambientLight = new THREE.AmbientLight(0xFFFFFF, this.originalLightsIntensity.ambient);
        this.lights.ambient = ambientLight;
        this.scene.add(ambientLight);
        
        return ambientLight;
    }

    changeToBokehLighting() {
        // Starting Lights
        if (this.lights.ambient) this.lights.ambient.intensity = this.originalLightsIntensity.ambient;
        if (this.lights.directional) this.lights.directional.intensity = this.originalLightsIntensity.directional;
        if (this.scene.fog) this.scene.fog.density = this.originalFogIntensity;
    }
    
    changeToNormalLighting() {
        // Other lights when changing camera
        if (this.lights.ambient) this.lights.ambient.intensity = this.originalLightsIntensity.ambient * 2;
        if (this.lights.directional) this.lights.directional.intensity = this.originalLightsIntensity.directional * 2;
        if (this.scene.fog) this.scene.fog.density = this.originalFogIntensity  - this.originalFogIntensity / 4;
    }

    
}

export { ScenarioManager };