import * as THREE from 'three';

class MoonSpotlight extends THREE.Object3D {
    constructor(x,y,z) {
        super();

        this.x = x;
        this.y = y;
        this.z = z;
        this.createSpotlight();
    }

    createSpotlight() {
        const spotlight = new THREE.SpotLight(0xffffff, 1);
        spotlight.position.set(this.x, this.y, this.z);
        spotlight.angle = Math.PI / 12;
        spotlight.penumbra = 0;
        spotlight.decay = 1;
        spotlight.distance = 300;

        spotlight.power = 800;

        spotlight.castShadow = true;
        spotlight.shadow.mapSize.width = 512;
        spotlight.shadow.mapSize.height = 512;
        spotlight.shadow.camera.near = 0.5;
        spotlight.shadow.camera.far = 50;

        this.add(spotlight);

        const spotlightHelper = new THREE.SpotLightHelper(spotlight);
        this.add(spotlightHelper);
        spotlightHelper.updateMatrixWorld(true);
        spotlightHelper.update();

        const spotlightTarget = new THREE.Object3D();
        spotlightTarget.position.set(0, 0, 0);
        this.add(spotlightTarget);
        spotlight.target = spotlightTarget;
    }
}

export { MoonSpotlight };