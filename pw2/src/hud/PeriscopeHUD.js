import * as THREE from 'three';

class PeriscopeHUD {
    constructor(renderer, scene, camera) {
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;
        
        // Create render target for post-processing
        this.renderTarget = new THREE.WebGLRenderTarget(
            window.innerWidth,
            window.innerHeight,
            {
                minFilter: THREE.LinearFilter,
                magFilter: THREE.LinearFilter,
                format: THREE.RGBAFormat
            }
        );

        // Create textures
        this.createTextures();
        
        // Create shader material
        this.createShaderMaterial();
        
        // Create screen quad for post-processing
        this.createScreenQuad();
        
        // Sprite system for coordinates
        this.createSpriteSystem();
        
        // Submarine position for tracking
        this.submarinePosition = new THREE.Vector3(0, 0, 0);
    }

    createTextures() {
        // Lens scratches/dirt texture
        const scratchCanvas = document.createElement('canvas');
        scratchCanvas.width = 512;
        scratchCanvas.height = 512;
        const ctx = scratchCanvas.getContext('2d');
        
        // Draw scratches
        ctx.fillStyle = 'rgba(0, 0, 0, 0)';
        ctx.fillRect(0, 0, 512, 512);
        
        for (let i = 0; i < 50; i++) {
            ctx.strokeStyle = `rgba(255, 255, 255, ${Math.random() * 0.3})`;
            ctx.lineWidth = Math.random() * 2;
            ctx.beginPath();
            ctx.moveTo(Math.random() * 512, Math.random() * 512);
            ctx.lineTo(Math.random() * 512, Math.random() * 512);
            ctx.stroke();
        }
        
        // Add dirt spots
        for (let i = 0; i < 30; i++) {
            ctx.fillStyle = `rgba(100, 100, 100, ${Math.random() * 0.2})`;
            ctx.beginPath();
            ctx.arc(Math.random() * 512, Math.random() * 512, Math.random() * 10, 0, Math.PI * 2);
            ctx.fill();
        }
        
        this.scratchTexture = new THREE.CanvasTexture(scratchCanvas);

        // Crosshair texture
        const crosshairCanvas = document.createElement('canvas');
        crosshairCanvas.width = 256;
        crosshairCanvas.height = 256;
        const crossCtx = crosshairCanvas.getContext('2d');
        
        crossCtx.strokeStyle = 'rgba(255, 255, 0, 0.8)';
        crossCtx.lineWidth = 2;
        
        // Center crosshair
        crossCtx.beginPath();
        crossCtx.moveTo(128, 108);
        crossCtx.lineTo(128, 148);
        crossCtx.moveTo(108, 128);
        crossCtx.lineTo(148, 128);
        crossCtx.stroke();
        
        // Circle
        crossCtx.beginPath();
        crossCtx.arc(128, 128, 30, 0, Math.PI * 2);
        crossCtx.stroke();
        
        this.crosshairTexture = new THREE.CanvasTexture(crosshairCanvas);
    }

    createShaderMaterial() {
        this.shaderMaterial = new THREE.ShaderMaterial({
            uniforms: {
                tDiffuse: { value: null },
                tScratch: { value: this.scratchTexture },
                tCrosshair: { value: this.crosshairTexture },
                resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
                time: { value: 0 },
                focusDistance: { value: 10.0 },
                focalLength: { value: 5.0 },
                tintColor: { value: new THREE.Color(0.7, 0.9, 0.6) }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D tDiffuse;
                uniform sampler2D tScratch;
                uniform sampler2D tCrosshair;
                uniform vec2 resolution;
                uniform float time;
                uniform float focusDistance;
                uniform float focalLength;
                uniform vec3 tintColor;
                
                varying vec2 vUv;
                
                // Depth of field blur
                vec4 getBlurredColor(vec2 uv, float blur) {
                    vec4 color = vec4(0.0);
                    float total = 0.0;
                    
                    for(float x = -4.0; x <= 4.0; x += 1.0) {
                        for(float y = -4.0; y <= 4.0; y += 1.0) {
                            vec2 offset = vec2(x, y) * blur / resolution;
                            color += texture2D(tDiffuse, uv + offset);
                            total += 1.0;
                        }
                    }
                    
                    return color / total;
                }
                
                void main() {
                    vec2 center = vec2(0.5, 0.5);
                    vec2 uv = vUv;
                    
                    // Calculate distance from center for circular clip
                    float dist = distance(uv, center);
                    
                    // Circular vignette with hard edge
                    float circularMask = smoothstep(0.48, 0.45, dist);
                    
                    if (circularMask < 0.01) {
                        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
                        return;
                    }
                    
                    // Depth of field effect (blur edges more)
                    float blurAmount = smoothstep(0.3, 0.45, dist) * 2.0;
                    vec4 sceneColor = getBlurredColor(uv, blurAmount);
                    
                    // Apply color tint (greenish/yellowish)
                    sceneColor.rgb *= tintColor;
                    
                    // Add lens scratches/dirt
                    vec4 scratch = texture2D(tScratch, uv * 2.0 + vec2(sin(time * 0.1) * 0.1, 0.0));
                    sceneColor.rgb = mix(sceneColor.rgb, sceneColor.rgb * 0.8, scratch.r * 0.3);
                    
                    // Add crosshair
                    vec4 crosshair = texture2D(tCrosshair, (uv - center) * 2.0 + 0.5);
                    sceneColor.rgb = mix(sceneColor.rgb, crosshair.rgb, crosshair.a);
                    
                    // Vignette darkening at edges
                    float vignette = smoothstep(0.5, 0.2, dist);
                    sceneColor.rgb *= 0.3 + 0.7 * vignette;
                    
                    // Border effect
                    float borderWidth = 0.02;
                    float border = smoothstep(0.45, 0.45 + borderWidth, dist);
                    sceneColor.rgb = mix(sceneColor.rgb, vec3(0.2, 0.2, 0.1), border);
                    
                    gl_FragColor = sceneColor;
                }
            `
        });
    }

    createScreenQuad() {
        const geometry = new THREE.PlaneGeometry(2, 2);
        this.screenQuad = new THREE.Mesh(geometry, this.shaderMaterial);
        
        this.hudScene = new THREE.Scene();
        this.hudCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        this.hudScene.add(this.screenQuad);
    }

    createSpriteSystem() {
        // Create spritesheet for numbers 0-9, dot, minus, and letters X, Y, Z
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.font = 'bold 48px monospace';
        ctx.fillStyle = '#00FF00';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        
        const chars = '0123456789.-XYZ:';
        const charWidth = 32;
        
        for (let i = 0; i < chars.length; i++) {
            ctx.fillText(chars[i], charWidth * i + charWidth / 2, 32);
        }
        
        this.spriteTexture = new THREE.CanvasTexture(canvas);
        this.charWidth = charWidth;
        this.charHeight = 64;
        this.chars = chars;
        
        // Create coordinate display geometry
        this.coordinateGroup = new THREE.Group();
        this.hudScene.add(this.coordinateGroup);
    }

    getCharUV(char) {
        const index = this.chars.indexOf(char);
        if (index === -1) return null;
        
        const u = index * this.charWidth / 512;
        const uWidth = this.charWidth / 512;
        
        return { u, uWidth };
    }

    updateCoordinates(position) {
        this.submarinePosition.copy(position);
        
        // Clear previous sprites
        while (this.coordinateGroup.children.length > 0) {
            this.coordinateGroup.remove(this.coordinateGroup.children[0]);
        }
        
        // Format coordinates
        const x = position.x.toFixed(1);
        const y = position.y.toFixed(1);
        const z = position.z.toFixed(1);
        
        const text = `X:${x} Y:${y} Z:${z}`;
        
        // Create sprites for each character
        const startX = -0.8;
        const startY = 0.85;
        const scale = 0.04;
        
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const uvData = this.getCharUV(char);
            
            if (!uvData) continue;
            
            const geometry = new THREE.PlaneGeometry(scale, scale);
            const material = new THREE.MeshBasicMaterial({
                map: this.spriteTexture,
                transparent: true,
                side: THREE.DoubleSide
            });
            
            // Set UV coordinates for this character
            const uvs = geometry.attributes.uv;
            uvs.setXY(0, uvData.u, 1);
            uvs.setXY(1, uvData.u + uvData.uWidth, 1);
            uvs.setXY(2, uvData.u, 0);
            uvs.setXY(3, uvData.u + uvData.uWidth, 0);
            
            const sprite = new THREE.Mesh(geometry, material);
            sprite.position.set(startX + i * scale * 0.8, startY, 0);
            this.coordinateGroup.add(sprite);
        }
    }

    render(submarinePosition) {
        // Update coordinates
        if (submarinePosition) {
            this.updateCoordinates(submarinePosition);
        }
        
        // Render scene to texture
        this.renderer.setRenderTarget(this.renderTarget);
        this.renderer.render(this.scene, this.camera);
        
        // Apply post-processing shader
        this.shaderMaterial.uniforms.tDiffuse.value = this.renderTarget.texture;
        this.shaderMaterial.uniforms.time.value += 0.016;
        
        // Render to screen
        this.renderer.setRenderTarget(null);
        this.renderer.render(this.hudScene, this.hudCamera);
    }

    onResize() {
        this.renderTarget.setSize(window.innerWidth, window.innerHeight);
        this.shaderMaterial.uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
    }

    dispose() {
        this.renderTarget.dispose();
        this.shaderMaterial.dispose();
        this.screenQuad.geometry.dispose();
        this.scratchTexture.dispose();
        this.crosshairTexture.dispose();
        this.spriteTexture.dispose();
    }
}

export { PeriscopeHUD };