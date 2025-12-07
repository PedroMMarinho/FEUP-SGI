
import * as THREE from 'three';

/**
 * Custom shader for color tint effect
 */
const TintShader = {
    uniforms: {
        'tDiffuse': { value: null },
        'tintColor': { value: new THREE.Color(0.2, 0.6, 0.4) }, // Greenish-yellowish
        'intensity': { value: 0.3 }
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
        uniform vec3 tintColor;
        uniform float intensity;
        varying vec2 vUv;
        
        void main() {
            vec4 color = texture2D(tDiffuse, vUv);
            vec3 tinted = mix(color.rgb, color.rgb * tintColor, intensity);
            gl_FragColor = vec4(tinted, color.a);
        }
    `
};

/**
 * Custom shader for lens scratches/dirt overlay
 */
const ScratchesShader = {
    uniforms: {
        'tDiffuse': { value: null },
        'tScratches': { value: null },
        'intensity': { value: 0.5 }
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
        uniform sampler2D tScratches;
        uniform float intensity;
        varying vec2 vUv;
        
        void main() {
            vec4 color = texture2D(tDiffuse, vUv);
            vec4 scratches = texture2D(tScratches, vUv);
            
            // Darken based on scratch pattern
            float scratchFactor = 1.0 - (scratches.r * intensity);
            gl_FragColor = vec4(color.rgb * scratchFactor, color.a);
        }
    `
};

/**
 * Custom shader for crosshair HUD overlay
 */
const HUDShader = {
    uniforms: {
        'tDiffuse': { value: null },
        'crosshairSize': { value: 0.02 },
        'crosshairThickness': { value: 0.002 },
        'crosshairColor': { value: new THREE.Color(0.0, 1.0, 0.0) }
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
        uniform float crosshairSize;
        uniform float crosshairThickness;
        uniform vec3 crosshairColor;
        varying vec2 vUv;
        
        void main() {
            vec4 color = texture2D(tDiffuse, vUv);
            vec2 center = vec2(0.5, 0.5);
            vec2 diff = abs(vUv - center);
            
            // Horizontal line
            bool horizLine = diff.x < crosshairSize && diff.y < crosshairThickness;
            // Vertical line
            bool vertLine = diff.y < crosshairSize && diff.x < crosshairThickness;
            
            if (horizLine || vertLine) {
                gl_FragColor = vec4(mix(color.rgb, crosshairColor, 0.8), color.a);
            } else {
                gl_FragColor = color;
            }
        }
    `
};

/**
 * Custom shader for circular viewport clip
 */
const ClipShader = {
    uniforms: {
        'tDiffuse': { value: null },
        'radius': { value: 0.45 },
        'borderWidth': { value: 0.05 },
        'aspectRatio': { value: 1.0 }
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
        uniform float radius;
        uniform float borderWidth;
        uniform float aspectRatio;
        varying vec2 vUv;
        
        void main() {
            vec2 center = vec2(0.5, 0.5);
            vec2 adjustedUv = vUv - center;
            adjustedUv.x *= aspectRatio;
            float dist = length(adjustedUv);
            
            vec4 color = texture2D(tDiffuse, vUv);
            
            if (dist > radius) {
                // Outside viewport - black
                gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
            } else if (dist > radius - borderWidth) {
                // Border area - dark with slight gradient
                float borderFactor = (radius - dist) / borderWidth;
                gl_FragColor = vec4(color.rgb * borderFactor * 0.3, 1.0);
            } else {
                // Inside viewport
                gl_FragColor = color;
            }
        }
    `
};

export { TintShader, ScratchesShader, HUDShader, ClipShader };