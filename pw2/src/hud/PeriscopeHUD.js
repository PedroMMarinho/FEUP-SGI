
import * as THREE from 'three';

/**
 * Custom shader for color tint effect
 */
const TintShader = {
    uniforms: {
        'tDiffuse': { value: null },
        'tintColor': { value: new THREE.Color(0.2, 1.0, 0.4) }, // Greenish-yellowish
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
        'intensity': { value: 0.5 },
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
        uniform sampler2D tScratches;
        uniform float intensity;
        uniform float aspectRatio;
        varying vec2 vUv;
        
        void main() {
            // Aspect-corrected UV for scratches
            vec2 uv = vUv - 0.5;
            uv.x *= aspectRatio;
            uv += 0.5;

            vec4 color = texture2D(tDiffuse, vUv);
            vec4 scratches = texture2D(tScratches, uv);

            float scratchFactor = 1.0 - (scratches.r * intensity);
            gl_FragColor = vec4(color.rgb * scratchFactor, color.a);
        }
    `
};


/**
 * HUD overlay shader using tHud texture
 */
const HUDShader = {
    uniforms: {
        'tDiffuse': { value: null },
        'tHUD': { value: null },      // HUD texture
        'intensity': { value: 1.0 },
        'aspectRatio': { value: 1.0 } // width / height
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
        uniform sampler2D tHUD;
        uniform float intensity;
        uniform float aspectRatio;
        varying vec2 vUv;

        void main() {
            vec4 baseColor = texture2D(tDiffuse, vUv);

            // Aspect-corrected UV for HUD
            vec2 uv = vUv - 0.5;
            uv.x *= aspectRatio;
            uv += 0.5;

            vec4 hudTex = texture2D(tHUD, uv);

            // Multiply HUD texture over the base color
            float factor = hudTex.a * intensity;
            gl_FragColor = mix(baseColor, hudTex, factor);
        }
    `
};

const MAX_CHARS = 64;

const CHAR_MAP = { 
    'A': 0,
    'X': 23,
    'Y': 24, 
    'Z': 25, 
    '0': 27, 
    '1': 28, 
    '2': 29, 
    '3': 30, 
    '4': 31, 
    '5': 32, 
    '6': 33, 
    '7': 34, 
    '8': 35, 
    '9': 36, 
    '-': 37, 
    ':': 38, 
    '.': 39, 
    '/': 40,
    ' ': 41
};

const CoordsShader = {
    uniforms: {
        tDiffuse: { value: null },
        fontMap: { value: null },

        intensity: { value: 1.0 },

        charIndices: { value: new Array(MAX_CHARS).fill(0) },
        charPositions: { value: new Array(MAX_CHARS * 2).fill(0) },

        glyphSize:  { value: new THREE.Vector2(128, 128) },
        atlasSize:  { value: new THREE.Vector2(2048, 1024) },

        numChars: { value: 0 },
        resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        scale: { value: 1.0 }
    },
    vertexShader:`
            varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform sampler2D fontMap;

    uniform int numChars;
    uniform float charIndices[` + MAX_CHARS + `];
    uniform vec2  charPositions[` + MAX_CHARS + `];

    uniform vec2 atlasSize;  
    uniform vec2 glyphSize;  
    uniform float intensity;
    uniform vec2 resolution;
    uniform float scale;

    varying vec2 vUv;

    void main() {
        vec4 color = texture2D(tDiffuse, vUv);

        float cols = atlasSize.x / glyphSize.x;
        vec2 cellUV = glyphSize / atlasSize;

        for (int i = 0; i < ` + MAX_CHARS + `; i++) {
            if (i >= numChars) break;

            float index = charIndices[i];
            vec2 pos = charPositions[i];

            // Scale glyph size to normalized screen space
            vec2 size = vec2(glyphSize.x / resolution.x, glyphSize.y / resolution.y) * scale;


            vec2 diff = vUv - pos;
            if (diff.x >= 0.0 && diff.x <= size.x &&
                diff.y >= 0.0 && diff.y <= size.y) {

                vec2 local = diff / size;

                float col = mod(index, cols);
                float row = floor(index / cols);

                // Inside the glyph sampling
vec2 uv = local * (cellUV * 0.9) + vec2(col * cellUV.x + cellUV.x*0.05,
                                         1.0 - (row + 1.0) * cellUV.y + cellUV.y*0.05);



                vec4 g = texture2D(fontMap, uv);

                color.rgb = mix(color.rgb, vec3(1.0), g.r * intensity);
            }
        }

        gl_FragColor = color;
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


export { TintShader, ScratchesShader, HUDShader, ClipShader, CoordsShader, MAX_CHARS, CHAR_MAP };