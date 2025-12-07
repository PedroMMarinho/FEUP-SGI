import { EffectComposer } from '/lib/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from '/lib/jsm/postprocessing/RenderPass.js';
import { BokehPass } from '/lib/jsm/postprocessing/BokehPass.js';

/**
 * PassManager handles all post-processing passes and effects
 */
class PassManager {
    constructor(renderer, scene) {
        this.renderer = renderer;
        this.scene = scene;
        this.scenarioManager = null;
        
        // Store references to passes
        this.passes = {
            render: null,
            bokeh: null
        };
        
        // Effect composer
        this.composer = null;
        
        // Pass configurations
        this.config = {
            bokeh: {
                focus: 10,
                aperture: 0.0001,
                maxblur: 20
            }
        };
    }


    /**
     * Initialize the composer and all passes
     */
    init(activeCamera) {
        // Create composer
        this.composer = new EffectComposer(this.renderer);
        
        // Setup base render pass
        this.setupRenderPass(activeCamera);
        
        // Setup post-processing passes
        this.setupBokehPass(activeCamera);
    }

    setScenarioManager(scenarioManager) {
        this.scenarioManager = scenarioManager;
    }

    /**
     * Setup the base render pass
     */
    setupRenderPass(activeCamera) {
        this.passes.render = new RenderPass(
            this.scene,
            activeCamera
        );
        
        this.passes.render.renderToScreen = false;
        this.composer.addPass(this.passes.render);
    }

    updateCamera(camera) {
        if (this.passes.render) {
            this.passes.render.camera = camera;
        }
        if (this.passes.bokeh) {
            this.passes.bokeh.camera = camera;
        }
    }

    togglePass(passName, enabled) {
        const pass = this.getPass(passName);
        if (pass) {
            if (passName === 'bokeh' && this.scenarioManager) {
                if (enabled) {
                    this.scenarioManager.changeToBokehLighting();
                } else {
                    this.scenarioManager.changeToNormalLighting();
                }
            }
            pass.enabled = enabled;
        }
    }
    

    /**
     * Setup bokeh (depth of field) pass
     */
    setupBokehPass(activeCamera) {
        this.passes.bokeh = new BokehPass(
            this.scene,
            activeCamera,
            {
                focus: this.config.bokeh.focus,
                aperture: this.config.bokeh.aperture,
                maxblur: this.config.bokeh.maxblur,
            }
        );
        
        this.passes.bokeh.renderToScreen = true;
        this.composer.addPass(this.passes.bokeh);
    }

    /**
     * Get the composer for rendering
     */
    getComposer() {
        return this.composer;
    }

    /**
     * Render the scene with all post-processing
     */
    render() {
        if (this.composer) {
            this.composer.render();
        }
    }

    /**
     * Handle window resize
     */
    onResize(width, height) {
        if (this.composer) {
            this.composer.setSize(width, height);
        }
    }

    /**
     * Add a custom pass to the composer
     */
    addPass(pass, renderToScreen = false) {
        if (this.composer) {
            // Set previous passes to not render to screen
            this.composer.passes.forEach(p => {
                p.renderToScreen = false;
            });
            
            pass.renderToScreen = renderToScreen;
            this.composer.addPass(pass);
        }
    }

    /**
     * Remove a pass from the composer
     */
    removePass(pass) {
        if (this.composer) {
            this.composer.removePass(pass);
            
            // Make sure the last pass renders to screen
            const passes = this.composer.passes;
            if (passes.length > 0) {
                passes[passes.length - 1].renderToScreen = true;
            }
        }
    }

    /**
     * Get a specific pass by name
     */
    getPass(name) {
        return this.passes[name] || null;
    }
}

export { PassManager };