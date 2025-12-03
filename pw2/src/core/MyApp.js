import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { MyContents } from './MyContents.js';
import { MyGuiInterface } from './MyGuiInterface.js';
import { CameraManager } from '../managers/CameraManager.js';
import { KeyManager } from '../managers/KeyManager.js';
import { EffectComposer } from '/lib/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from '/lib/jsm/postprocessing/RenderPass.js';
import { BokehPass } from '/lib/jsm/postprocessing/BokehPass.js';

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
        this.keyManager = new KeyManager();
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

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor("#000000");
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 0.1;
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        document.getElementById("canvas").appendChild(this.renderer.domElement);

        // Handle window resize
        window.addEventListener('resize', () => this.cameraManager.onResize(this.renderer), false);


        this.cameraManager = new CameraManager(this.aspect,this.keyManager, this.frustumSize);

        this.cameraManager.init();

        this.composer = new EffectComposer(this.renderer);
        this.renderPass = new RenderPass(this.scene, this.cameraManager.getActiveCamera()); // Camera will be set in render loop
        this.composer.addPass(this.renderPass);
        this.bokehPass =  new BokehPass(this.scene, this.cameraManager.getCameraByName('Free Fly') ,{ 	
            focus: 100,
        	aperture: 0.0005,
        	maxblur: 0.01
        });
        this.composer.addPass(this.bokehPass);

        this.cameraManager.setRenderPass(this.renderPass);
        this.cameraManager.setBokehPass(this.bokehPass)



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

        const submarine = this.contents?.aquarium?.submarine
        

        this.cameraManager.update(this.renderer, submarine);

        if (this.contents) this.contents.update();

        this.composer.render(this.scene, this.cameraManager.getActiveCamera());

        requestAnimationFrame(this.render.bind(this));
        this.stats.end();
    }
}

export { MyApp };
