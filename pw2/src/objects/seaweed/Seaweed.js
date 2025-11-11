import * as THREE from 'three';

export class Seaweed {
    constructor(complexity = 10, material) {
        this.material = material;
        this.meshes = this.createObjects(complexity);
    }

    chooseNextRule(options) {
        const total = options.reduce((sum, o) => sum + o.prob, 0);
        let randomValue = Math.random() * total;
        for (const opt of options) {
            randomValue -= opt.prob;
            if (randomValue <= 0)
                return opt.rule;
        }
        return options[options.length - 1].rule;
    }

    createObjects(complexity) {
        const iterations = complexity;
        const yawAngle = 45 * THREE.MathUtils.DEG2RAD;
        const pitchAngle = 20 * THREE.MathUtils.DEG2RAD;
        const variableAngle = 10 * THREE.MathUtils.DEG2RAD;

        const stochasticRules = {
            'X': [
                { prob: 0.25, rule: 'F[&+FX]A[&X]' },
                { prob: 0.25, rule: 'F[&-FX]A[&-X]' },
                { prob: 0.25, rule: 'F[^++FX]A[^--X]' },
                { prob: 0.25, rule: 'F[^--FX]A[&++X]' },
            ],
            'F': [
                { prob: 0.4, rule: 'FF' },
                { prob: 0.6, rule: 'F' },
            ],
            'A': [
                { prob: 0.5, rule: 'F[&+X][&-X]A' },
                { prob: 0.5, rule: 'F[^+X][^-X]A' },
            ],
        };

        const axiom = 'X';
        let currentString = axiom;
        const allMeshes = []; 

        for (let i = 0; i < iterations; i++) {
            let nextString = '';
            for (const char of currentString) {
                if (char === 'F') {
                    if (iterations - i <= 2) {
                        nextString += this.chooseNextRule(stochasticRules[char]);
                    } else {
                        continue;
                    }
                } else if (stochasticRules[char]) {
                    nextString += this.chooseNextRule(stochasticRules[char]);
                } else {
                    nextString += char;
                }
            }
            currentString = nextString;

            // Generate mesh for this iteration
            const mesh = this.generateGeometryFromString(currentString);
            allMeshes.push(mesh);
        }

        return allMeshes; 
    }

    generateGeometryFromString(currentString) {
        const yawAngle = 45 * THREE.MathUtils.DEG2RAD;
        const pitchAngle = 20 * THREE.MathUtils.DEG2RAD;
        const variableAngle = 10 * THREE.MathUtils.DEG2RAD;
        const axisX = new THREE.Vector3(1, 0, 0);
        const axisY = new THREE.Vector3(0, 1, 0);
        const q = new THREE.Quaternion();

        const randomAngle = (base) => base + (Math.random() * 2 - 1) * variableAngle;

        const stack = [];
        let turtle = {
            position: new THREE.Vector3(0, 0, 0),
            quaternion: new THREE.Quaternion(),
        };

        let branchLength = 0.8;
        const lengthFactor = 0.5;
        const minBranchLength = 0.05;
        const branchMatrices = [];

        for (const char of currentString) {
            switch (char) {
                case 'F': {
                    const startPosition = turtle.position.clone();
                    const forward = new THREE.Vector3(0, 1, 0)
                        .applyQuaternion(turtle.quaternion)
                        .multiplyScalar(branchLength);
                    turtle.position.add(forward);
                    if (branchLength < minBranchLength) break;

                    const instanceMatrix = new THREE.Matrix4();
                    const orientation = new THREE.Quaternion().setFromUnitVectors(
                        new THREE.Vector3(0, 1, 0),
                        forward.clone().normalize()
                    );
                    const scale = new THREE.Vector3(1, branchLength, 1);
                    instanceMatrix.compose(startPosition, orientation, scale);
                    branchMatrices.push(instanceMatrix);
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
                    stack.push({
                        position: turtle.position.clone(),
                        quaternion: turtle.quaternion.clone(),
                        length: branchLength,
                    });
                    branchLength *= lengthFactor;
                    break;
                case ']': {
                    const state = stack.pop();
                    if (!state) break;
                    turtle.position = state.position;
                    turtle.quaternion = state.quaternion;
                    branchLength = state.length;
                    break;
                }
                default:
                    break;
            }
        }

        const branchGeo = new THREE.CylinderGeometry(0.05, 0.05, 1, 3, 4);
        branchGeo.translate(0, 0.5, 0);
        const branchMesh = new THREE.InstancedMesh(branchGeo, this.material, branchMatrices.length);
        for (let i = 0; i < branchMatrices.length; i++) {
            branchMesh.setMatrixAt(i, branchMatrices[i]);
        }
        branchMesh.scale.setScalar(0.4);
        return branchMesh;
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
