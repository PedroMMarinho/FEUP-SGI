import * as THREE from 'three';
import { EffectComposer } from '/lib/jsm/postprocessing/EffectComposer.js';
import { TextureManager } from './TextureManager.js';
import { RenderPass } from '/lib/jsm/postprocessing/RenderPass.js';
import { BokehPass } from '/lib/jsm/postprocessing/BokehPass.js';
import { ShaderPass } from '/lib/jsm/postprocessing/ShaderPass.js';
import { PeriscopeHUDType } from '../enums/PeriscopeHUDType.js';
import { TintShader, 
        ScratchesShader,
        HUDShader,
        ClipShader,
        CoordsShader,
        MAX_CHARS,
        CHAR_MAP
} from '../hud/PeriscopeHUD.js';


const HUD_STATE_CONFIG = {
    [PeriscopeHUDType.VIEW]:      [],
    [PeriscopeHUDType.DOF]:       ['bokeh'],
    [PeriscopeHUDType.TINT]:      ['bokeh', 'tint'],
    [PeriscopeHUDType.SCRATCHES]: ['bokeh', 'tint', 'scratches'],
    [PeriscopeHUDType.HUD]:       ['bokeh', 'tint', 'scratches', 'hud'],
    [PeriscopeHUDType.COORDS]:   ['bokeh', 'tint', 'scratches', 'hud', 'coords'],
    [PeriscopeHUDType.CLIP]:      ['bokeh', 'tint', 'scratches', 'hud', 'coords', 'clip'],
};

const MANAGED_PASSES = ['bokeh', 'tint', 'scratches', 'hud', 'coords', 'clip'];

/**
 * PassManager handles all post-processing passes and effects
 */
class PassManager {
    constructor(renderer, scene) {
        this.renderer = renderer;
        this.scene = scene;
        this.textureManager = TextureManager.getInstance();
        
        // Store references to passes
        this.passes = {
            render: null,
            bokeh: null,
            tint: null,
            scratches: null,
            hud: null,
            coords: null,
            clip: null
        };
        
        // Effect composer
        this.composer = null;
        
        // Pass configurations
        this.config = {
            bokeh: {
                focus: 10,
                aperture: 0.0001,
                maxblur: 20
            },
            tint: {
                tintColor: new THREE.Color(0.2, 1.0, 0.4),
                intensity: 0.5,
                
            },
            scratches: {
                tScratches: 'scratches', 
                intensity: 0.8,
                
            },
            hud: {
                tHUD: 'hud', 
                intensity: 0.8,
                
            },
            coords:{
                fontMap: 'spritesheet',
                intensity: 1.0,
                glyphSize:  { value: new THREE.Vector2(128, 128) },
                atlasSize:  { value: new THREE.Vector2(3328, 384) },
                horizontalOffset: 0.002,
                verticalOffset: 0.03,
                xPosition: 0.44,
                yPosition: 0.34,
                scale: 0.1
            },
            clip: {
                radius: 0.45,
                borderWidth: 0.05,
            }
        };
        this.currentPeriscopeHUD = PeriscopeHUDType.CLIP;
    }


    /**
     * Initialize the composer and all passes
     */
    init(activeCamera, aquarium) {
        // Create composer
        this.composer = new EffectComposer(this.renderer);
        this.aquarium = aquarium;
        
        // Setup base render pass
        this.setupRenderPass(activeCamera);
        
        // Setup post-processing passes
        this.setupBokehPass(activeCamera);
        this.setupShaderPasses(aquarium);
    }

    setupShaderPasses() {
        this.setupTintPass();
        this.setupScratchesPass();
        this.setupHUDPass();
        this.setupCoordsPass();
        this.setupClipPass();
    }

     setupTintPass() {
        this.passes.tint = new ShaderPass(TintShader);
        this.passes.tint.renderToScreen = false;
        this.passes.tint.enabled = false;
        this.composer.addPass(this.passes.tint);

        this.passes.tint.uniforms['tintColor'].value = this.config.tint.tintColor;
        this.passes.tint.uniforms['intensity'].value = this.config.tint.intensity;
    }

    setupScratchesPass() {
        this.passes.scratches = new ShaderPass(ScratchesShader);

        this.passes.scratches.renderToScreen = false;
        this.passes.scratches.enabled = false;
        this.composer.addPass(this.passes.scratches);
        const tex = this.textureManager.getTexture(this.config.scratches.tScratches)
        console.log(tex)
        this.passes.scratches.uniforms['tScratches'].value = tex;
        this.passes.scratches.uniforms['intensity'].value = this.config.scratches.intensity;
        this.passes.scratches.uniforms['aspectRatio'].value  = window.innerWidth / window.innerHeight;
        
        window.addEventListener('resize', () => {
            this.passes.scratches.uniforms['aspectRatio'].value  = window.innerWidth / window.innerHeight;
        });
    }

    setupHUDPass() {
        this.passes.hud = new ShaderPass(HUDShader);
        this.passes.hud.renderToScreen = false;
        this.passes.hud.enabled = false;
        this.composer.addPass(this.passes.hud);

        this.passes.hud.uniforms['tHUD'].value = this.textureManager.getTexture(this.config.hud.tHUD);
        this.passes.hud.uniforms['intensity'].value = this.config.hud.intensity;
        this.passes.hud.uniforms['aspectRatio'].value  = window.innerWidth / window.innerHeight;

        window.addEventListener('resize', () => {
            this.passes.hud.uniforms['aspectRatio'].value  = window.innerWidth / window.innerHeight;
        });
    }
    setupCoordsPass() {
        const initialCoords = this.aquarium.submarine ? this.aquarium.submarine.position : new THREE.Vector3(0,0,0);

        this.passes.coords = new ShaderPass(CoordsShader);
        this.passes.coords.renderToScreen = false;
        this.passes.coords.enabled = false;
        this.composer.addPass(this.passes.coords);
        const tex = this.textureManager.getTexture(this.config.coords.fontMap)
        tex.magFilter = THREE.NearestFilter;
        tex.minFilter = THREE.NearestFilter;
        console.log(tex)
        this.passes.coords.uniforms['fontMap'].value = this.textureManager.getTexture(this.config.coords.fontMap);
        this.passes.coords.uniforms['intensity'].value = this.config.coords.intensity;
        this.passes.coords.uniforms['glyphSize'].value = this.config.coords.glyphSize.value;
        this.passes.coords.uniforms['atlasSize'].value = this.config.coords.atlasSize.value;
        this.passes.coords.uniforms['resolution'].value  = new THREE.Vector2(window.innerWidth, window.innerHeight);
        this.passes.coords.uniforms['scale'].value = this.config.coords.scale;
        window.addEventListener('resize', () => {
            const res = new THREE.Vector2(window.innerWidth, window.innerHeight);
            if (this.passes.coords) {
                this.passes.coords.material.uniforms.resolution.value.copy(res);
            }
        });

        const coordsText = this.formatCoordsText(initialCoords);
        console.log(coordsText);
        this.setHUDText(
            coordsText,
            this.passes.coords,
            this.config.coords.xPosition,
            this.config.coords.yPosition,
            this.config.coords.horizontalOffset,
            this.config.coords.verticalOffset,
            CHAR_MAP,
            this.config.coords.glyphSize.value
        );

    }

    formatCoordsText(position) {
        const x = position.x.toFixed(3);
        const y = position.y.toFixed(3);
        const z = position.z.toFixed(3);
        return `X: ${x}\nY: ${y}\nZ: ${z}`;
    }

setHUDText(
    text,
    composerPass,
    startX = 0.02,
    startY = 0.92,
    horizontalOffset = 0.0,
    verticalOffset = 0.0,
    glyphSize = new THREE.Vector2(128, 128)
) {
    const uniforms = composerPass.material.uniforms;
    const charIndices = uniforms.charIndices.value;
    const charPositions = uniforms.charPositions.value;
    const scale = uniforms.scale.value ?? 1.0; // use scale uniform

    let cursorX = startX;
    let cursorY = startY;

    const max = Math.min(text.length, MAX_CHARS);
    let count = 0;

    // Convert glyph size to normalized screen-space, factoring in scale
    const normGlyphWidth  = (glyphSize.x / window.innerWidth) * scale;
    const normGlyphHeight = (glyphSize.y / window.innerHeight) * scale;

    for (let i = 0; i < max; i++) {
        const ch = text[i];

        // Handle newline
        if (ch === "\n") {
            cursorX = startX;
            cursorY -= normGlyphHeight + verticalOffset;
            continue;
        }

        const atlasIndex = CHAR_MAP[ch] ?? -1;

        // Skip unsupported characters
        if (atlasIndex < 0) {
            cursorX += normGlyphWidth + horizontalOffset;
            continue;
        }

        // Set glyph index
        charIndices[count] = atlasIndex;

        // Set normalized screen position
        charPositions[count * 2 + 0] = cursorX;
        charPositions[count * 2 + 1] = cursorY;

        // Advance cursor
        cursorX += normGlyphWidth + horizontalOffset;

        count++;
    }

    uniforms.numChars.value = count;
}





    setupClipPass() {
        this.passes.clip = new ShaderPass(ClipShader);
        this.passes.clip.renderToScreen = false;
        this.passes.clip.enabled = false;
        this.composer.addPass(this.passes.clip);

        this.passes.clip.uniforms['radius'].value = this.config.clip.radius;
        this.passes.clip.uniforms['borderWidth'].value = this.config.clip.borderWidth;
        this.passes.clip.uniforms['aspectRatio'].value  = window.innerWidth / window.innerHeight;

        window.addEventListener('resize', () => {
            this.passes.clip.uniforms['aspectRatio'].value  = window.innerWidth / window.innerHeight;
        });
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

    setHUDType(type, cameraName) {
        console.log(`Setting HUD Type to ${type} for camera ${cameraName}`);

        // Guard Clause
        if (cameraName !== 'Submarine View') return;

        const activePasses = HUD_STATE_CONFIG[type] || [];

        MANAGED_PASSES.forEach(passName => {
            const shouldEnable = activePasses.includes(passName);
            this.togglePass(passName, shouldEnable);
        });
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
        if (this.aquarium) {
            // Update coords HUD with submarine position
            const submarine = this.aquarium.submarine;
            if (submarine && this.passes.coords) {
                const position = submarine.position;
                const coordsText = this.formatCoordsText(position);
                this.setHUDText(
                    coordsText,
                    this.passes.coords,
                    this.config.coords.xPosition,
                    this.config.coords.yPosition,
                    this.config.coords.horizontalOffset,
                    this.config.coords.verticalOffset,
                    this.config.coords.glyphSize.value
                );
            }
        }
        if (this.composer) {
            this.composer.render();
        }
    }

    /**
     * Handle window resize
     */
    // Is this even needed?
    onResize(width, height) {
        if (this.composer) {
            this.composer.setSize(width, height);
            if (this.passes.clip) {
                this.passes.clip.uniforms['aspectRatio'].value = width / height;
            }
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