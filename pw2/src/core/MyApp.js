import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { MyContents } from './MyContents.js';
import { MyGuiInterface } from './MyGuiInterface.js';
import { CameraManager } from '../managers/CameraManager.js';

/**
 * This class contains the main application logic
 */
class MyApp {
    constructor() {
        this.scene = null;
        this.stats = null;
        this.renderer = null;
        this.gui = null;
        this.contents = null;

        // Camera-related
        this.aspect = window.innerWidth / window.innerHeight;
        this.frustumSize = 20;
        this.cameraManager = new CameraManager(this.aspect, this.frustumSize);
    }

    /**
     * Initializes the application
     */
    init() {
        // Create the scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x101010);

        // Stats (FPS, etc.)
        this.stats = new Stats();
        this.stats.showPanel(1);
        document.body.appendChild(this.stats.dom);

        // Initialize cameras
        this.cameraManager.init();

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor("#000000");
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        document.getElementById("canvas").appendChild(this.renderer.domElement);

        // Handle window resize
        window.addEventListener('resize', () => this.cameraManager.onResize(this.renderer), false);
    }

    /**
     * Assigns the contents object
     */
    setContents(contents) {
        this.contents = contents;
    }

    /**
     * Assigns the GUI interface
     */
    setGui(gui) {
        this.gui = gui;
    }

    /**
     * Main render loop
     */
    render() {
        this.stats.begin();

        this.cameraManager.update(this.renderer);

        if (this.contents) this.contents.update();

        this.renderer.render(this.scene, this.cameraManager.getActiveCamera());

        requestAnimationFrame(this.render.bind(this));
        this.stats.end();
    }
}

export { MyApp };
