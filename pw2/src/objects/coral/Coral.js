import * as THREE from 'three';

export class Coral {
    constructor(complexity = 5) {
        return this.createObject(complexity)
    }

    chooseNextRule(options) {
        //Sum the weights (probabilities) of all options.
        const total = options.reduce((sum, o) => sum + o.prob, 0);

        //Number between 0 and `total`
        let randomValue = Math.random() * total;

        //The first option that makes `r <= 0` is the winner.
        for (const opt of options) {
            randomValue -= opt.prob;
            if (randomValue <= 0)
                return opt.rule;
        }

        //default: return the last option.
        return options[options.length - 1].rule;
    }

    createObject(complexity) {
        const iterations = complexity;
        const yawAngle = 30 * THREE.MathUtils.DEG2RAD;
        const pitchAngle = 20 * THREE.MathUtils.DEG2RAD;
        const variableAngle = 10 * THREE.MathUtils.DEG2RAD; // random angle variation for more natural trees

        // 'F': Move forward and draw a branch
        // 'X': Draw a leaf at the current position
        // '+','-': Yaw (turn left/right 15 degrees)
        // '&','^': Pitch (turn up/down)
        // '[': Push current state (pos/orientation) to a stack
        // ']': Pop state from the stack
        // --- Stochastic L-System Rules ---
        const stochasticRules = {
            'X': [
                { prob: 0.7, rule: '[&&FFFL]+++[&&FFFL]+++[&&FFFL]+++[&&FFFL]FFFL' },
                { prob: 0.3, rule: '[&&FFFL]++++[&&FFFL]++++[&&FFFL]FFFL' },

            ],
            'L': [
                { prob: 0.3, rule: 'K[&&FFFX]+++[&&FFFX]+++[&&FFFX]+++[&&FFFX]' },
                { prob: 0.3, rule: 'K[&&FFFX]++++[&&FFFX]++++[&&FFFX]' },
                { prob: 0.3, rule: 'K[&&FFFX]+++[&&FFFX]' },
                { prob: 0.1, rule: 'K[&&FFFX]++++[&&FFFX]'}
            ],

            'K': [
                { prob: 0.5, rule: 'F' },
                { prob: 0.2, rule: 'KF' },

            ]

        };

        const axiom = 'X';

        // --- Expand the string ---
        let currentString = axiom;
        for (let i = 0; i < iterations; i++) {
            let nextString = '';
            for (const char of currentString) {
                if (stochasticRules[char]) {
                    nextString += this.chooseNextRule(stochasticRules[char]);
                } else {
                    nextString += char;
                }
            }
            currentString = nextString;
        } 

        // --- Turtle interpretation ---
        const stack = [];
        let turtle = {
            position: new THREE.Vector3(0, 0, 0),
            quaternion: new THREE.Quaternion(),
        };

        let branchLength = 0.8;
        const lengthFactor = 0.5;
        const branchMatrices = [];
        const leafMatrices = [];

        const axisX = new THREE.Vector3(1, 0, 0);
        const axisY = new THREE.Vector3(0, 1, 0);
        const axisZ = new THREE.Vector3(0, 0, 1);
        const q = new THREE.Quaternion();

        const randomAngle = (base) => base + (Math.random() * 2 - 1) * variableAngle;

        for (const char of currentString) {
            switch (char) {
                case 'F': {
                    const startPosition = turtle.position.clone();
                    const forward = new THREE.Vector3(0, 1, 0)
                        .applyQuaternion(turtle.quaternion)
                        .multiplyScalar(branchLength);
                    turtle.position.add(forward);

                    const instanceMatrix = new THREE.Matrix4();
                    const orientation = new THREE.Quaternion().setFromUnitVectors(axisY, forward.clone().normalize());
                    const scale = new THREE.Vector3(1, branchLength, 1);
                    instanceMatrix.compose(startPosition, orientation, scale);
                    branchMatrices.push(instanceMatrix);
                    break;
                }
                case 'X': {
                    break;
                }
                case '+':
                    turtle.quaternion.multiply(q.setFromAxisAngle(axisY, randomAngle(yawAngle)));
                    break;
                case '-':
                    turtle.quaternion.multiply(q.setFromAxisAngle(axisY, -randomAngle(yawAngle)));
                    break;
                case '&':
                    turtle.quaternion.multiply(q.setFromAxisAngle(axisX, randomAngle(pitchAngle)));
                    break;
                case '^':
                    turtle.quaternion.multiply(q.setFromAxisAngle(axisX, -randomAngle(pitchAngle)));
                    break;
                case '[':
                    const state = {
                        position: turtle.position.clone(),
                        quaternion: turtle.quaternion.clone(),
                        length: branchLength
                    };
                    stack.push(state);
                    branchLength *= lengthFactor;
                    break;
                case ']': {
                    
                    const state = stack.pop();
                    console.log(state);
                    console.log('popped');
                    if (!state) break;
                    console.log(state.position);
                    turtle.position = state.position;
                    turtle.quaternion = state.quaternion;
                    branchLength = state.length;
                    break;
                }
                default:
                    break;
            }
        }


        const group = new THREE.Group();

        const branchGeo = new THREE.CylinderGeometry(0.05, 0.05, 1, 8);
        branchGeo.translate(0, 0.5, 0);
        const branchMat = new THREE.MeshStandardMaterial({ color: 0x8B4513, metalness: 0.1, roughness: 0.8 });
        const branchMesh = new THREE.InstancedMesh(branchGeo, branchMat, branchMatrices.length);
        branchMesh.name = "branches";
        for (let i = 0; i < branchMatrices.length; i++) {
            branchMesh.setMatrixAt(i, branchMatrices[i]);
            console.log(branchMatrices[i]);
        }
        group.add(branchMesh);

        if (leafMatrices.length > 0) {
            const leafGeo = new THREE.IcosahedronGeometry(0.2, 0);
            const leafMat = new THREE.MeshStandardMaterial({ color: 0x228B22, metalness: 0, roughness: 0.8 });
            const leafMesh = new THREE.InstancedMesh(leafGeo, leafMat, leafMatrices.length);
            leafMesh.name = "leaves";
            for (let i = 0; i < leafMatrices.length; i++) {
                leafMesh.setMatrixAt(i, leafMatrices[i]);
            }
            group.add(leafMesh);
        }

        group.scale.setScalar(0.4);

        return group;
    }


    applyShading(object, shadingStyle) {
        const isWireframe = shadingStyle === 'wireframe';
        object.children.forEach(child => {
            if (child.material && child.material.hasOwnProperty('wireframe')) {
                child.material.wireframe = isWireframe;
            }
        });
    }

    dispose(object) {
        object.children.forEach(child => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
        });
    }
}
