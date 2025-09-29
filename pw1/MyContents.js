import * as THREE from 'three';
import { MyAxis } from './MyAxis.js';
import { MyTable } from './MyTable.js';

/**
 *  This class contains the contents of out application
 */
class MyContents {

    /**
       constructs the object
       @param {MyApp} app The application object
    */
    constructor(app) {
        this.app = app
        this.axis = null

        this.planeWidth = 10;
        this.planeHeight = 10;


        // box related attributes
        this.boxMesh = null
        this.boxMeshSize = 1.0
        this.boxEnabled = false;
        this.lastBoxEnabled = null
        this.boxDisplacement = new THREE.Vector3(0, 2, 0)

        // table related attributes

        this.tableObj = null;
        this.tableEnabled = true;
        this.lastTableEnabled = null;

        // walls related attributes

        this.wallsEnabled = true;
        this.lastWallsEnabled = null;
        this.wallMesh1 = null;
        this.wallMesh2 = null;
        this.wallMesh3 = null;
        this.wallMesh4 = null;

        // light related attributes

        //this.pointLightPosition = new THREE.Vector3(0, 20, 0);
        //this.pointLightColor = "#ffffff";

        this.ambientLightColor = "#444444";
        this.ambientLightIntensity = 20.0;

        this.directionalLightColor = "#ffffff";
        this.directionalLightIntensity = 1.0;
        this.directionalLightPosition = new THREE.Vector3(0, 10, 0);
        this.directionalLightTarget = new THREE.Vector3(0, 0, 0);

        // Spot Light
        this.spotLightColor = 0xffffff;
        this.spotLightIntensity = 15;
        this.spotLight = new THREE.SpotLight(
            this.spotLightColor,
            this.spotLightIntensity,
            14,                
            THREE.MathUtils.degToRad(20), 
            0,                 
            0                  
        );
        this.spotLight.position.set(5, 10, 2);
        this.spotLight.target.position.set(1, 0, 1);
        this.app.scene.add(this.spotLight);
        this.app.scene.add(this.spotLight.target);

        // SpotLight Helper
        this.spotHelper = new THREE.SpotLightHelper(this.spotLight);
        this.app.scene.add(this.spotHelper);


        // plane related attributes
        this.diffusePlaneColor = "#00ffff"
        this.specularPlaneColor = "#777777"
        this.planeShininess = 30


        this.planeTexture = new THREE.TextureLoader().load('textures/floor.png');
        this.planeTexture.wrapS = THREE.RepeatWrapping;
        this.planeTexture.wrapT = THREE.RepeatWrapping;
        this.planeTexture.repeat.set(this.planeWidth, this.planeHeight);


        this.planeMaterial = new THREE.MeshPhongMaterial({
            color: this.diffusePlaneColor,
            specular: this.specularPlaneColor, emissive: "#000000", shininess: this.planeShininess,
            map: this.planeTexture
        })

        this.wallTexture = new THREE.TextureLoader().load('textures/floor.png');
        this.wallTexture.wrapS = THREE.MirroredRepeatWrapping;
        this.wallTexture.wrapT = THREE.MirroredRepeatWrapping;
        this.wallTexture.repeat.set(this.planeWidth, this.planeHeight);


        this.newWallTexture = new THREE.TextureLoader().load('textures/window.jpg');
        //this.newWallTexture.rotation = Math.PI;
        /* this.newWallTexture.colorSpace = THREE.SRGBColorSpace;
        this.newWallTexture.generateMipmaps = false;
        this.newWallTexture.minFilter = THREE.LinearFilter; */
        // inside MyContents constructor
        this.wallParams = {
            wrapS: THREE.ClampToEdgeWrapping,
            wrapT: THREE.ClampToEdgeWrapping,
            repeatS: 2,
            repeatT: 2,
        };

        this.newWallTexture.wrapS = this.wallParams.wrapS;
        this.newWallTexture.wrapT = this.wallParams.wrapT;
        this.newWallTexture.repeat.set(this.wallParams.repeatS, this.wallParams.repeatT);
        this.newWallTexture.center.set(0.5, 0.5);
        this.newWallTexture.offset.set(0, 0);

        // Window with landscape
        this.windowTexture = new THREE.TextureLoader().load('textures/windowlandscape.png');
        this.windowTexture.wrapS = this.windowTexture.wrapT = THREE.ClampToEdgeWrapping;
        this.windowTexture.repeatS = this.windowTexture.repeatT = 1;
        this.windowTexture.center.set(0.5, 0.5);
        this.windowTexture.offset.set(0, 0);
    }

    /**
     * builds the box mesh with material assigned
     */
    buildBox() {
        let boxMaterial = new THREE.MeshPhongMaterial({
            color: "#ffff77",
            specular: "#000000", emissive: "#000000", shininess: 90
        })

        // Create a Cube Mesh with basic material
        let box = new THREE.BoxGeometry(this.boxMeshSize, this.boxMeshSize, this.boxMeshSize);
        this.boxMesh = new THREE.Mesh(box, boxMaterial);

        // PW1-A: Invert order of rotation, scale and position to see the difference

        this.boxMesh.position.y = this.boxDisplacement.y;

        this.boxMesh.rotateX(Math.PI / 6);

        this.boxMesh.rotateX(Math.PI / 6);

        this.boxMesh.scale.set(3, 2, 1);

    }
    /**
     * builds the walls around the scene
     */
    buildWalls() {
        let wallsMaterialTextured = new THREE.MeshPhongMaterial({
            color: "#dfdbd4",
            specular: "#000000", emissive: "#000000", shininess: 0,
            map: this.newWallTexture
        })

        let wallsMaterialPlain = new THREE.MeshPhongMaterial({
            color: "#dfdbd4",
            specular: "#000000", emissive: "#000000", shininess: 0,
        })

        // Create the walls
        let wall = new THREE.PlaneGeometry(10, 10);
        this.wallMesh1 = new THREE.Mesh(wall, wallsMaterialTextured);
        this.wallMesh1.position.set(0, 5, -5)
        this.app.scene.add(this.wallMesh1);

        this.wallMesh2 = new THREE.Mesh(wall, wallsMaterialPlain);
        this.wallMesh2.position.set(-5, 5, 0)
        this.wallMesh2.rotateY(Math.PI / 2);
        this.app.scene.add(this.wallMesh2);

        this.wallMesh3 = new THREE.Mesh(wall, wallsMaterialPlain);
        this.wallMesh3.position.set(5, 5, 0)
        this.wallMesh3.rotateY(-Math.PI / 2);
        this.app.scene.add(this.wallMesh3);

        this.wallMesh4 = new THREE.Mesh(wall, wallsMaterialPlain);
        this.wallMesh4.position.set(0, 5, 5)
        this.wallMesh4.rotateY(Math.PI);
        this.app.scene.add(this.wallMesh4);

        this.windowQuad = new THREE.Mesh(
            new THREE.PlaneGeometry(8, 4),
            new THREE.MeshPhongMaterial({map: this.windowTexture, transparent: true })
        );
        this.windowQuad.position.set(0, 5, 4.95);
        this.windowQuad.rotateY(Math.PI);
        this.app.scene.add(this.windowQuad);
    }

    /**
     * initializes the contents
     */
    init() {

        // create once 
        if (this.axis === null) {
            // create and attach the axis to the scene
            this.axis = new MyAxis(this)
            this.app.scene.add(this.axis)
        }

        // add a point light on top of the model
        //this.pointLight = new THREE.PointLight(this.pointLightColor, 500, 0);
        //this.pointLight.position.set(this.pointLightPosition.x, this.pointLightPosition.y, this.pointLightPosition.z);
        //this.app.scene.add(this.pointLight);

        // add a point light helper for the previous point light
        //const sphereSize = 0.5;
        //this.pointLightHelper = new THREE.PointLightHelper(this.pointLight, sphereSize);
        //this.app.scene.add(this.pointLightHelper);

        // add an ambient light
        this.ambientLight = new THREE.AmbientLight(this.ambientLightColor,this.ambientLightIntensity);
        this.app.scene.add(this.ambientLight);

        // add directional light
        this.directionalLight = new THREE.DirectionalLight(this.directionalLightColor, this.directionalLightIntensity);
        this.directionalLight.position.set(this.directionalLightPosition.x, this.directionalLightPosition.y, this.directionalLight.z);
        
        // create target object
        this.directionalLightTargetObj = new THREE.Object3D();
        this.directionalLightTargetObj.position.set(
            this.directionalLightTarget.x,
            this.directionalLightTarget.y,
            this.directionalLightTarget.z
        );
        this.app.scene.add(this.directionalLightTargetObj);
        this.directionalLight.target = this.directionalLightTargetObj;

        // add new directional light source
        this.app.scene.add(this.directionalLight);


        this.directionalLightHelper = new THREE.DirectionalLightHelper(this.directionalLight);
        this.app.scene.add(this.directionalLightHelper);

        this.buildBox()

        this.buildWalls()

        this.tableObj = new MyTable(this.app, 2, 3, 3, '#561212');

        // Create a Plane Mesh with basic material

        let plane = new THREE.PlaneGeometry(this.planeWidth, this.planeHeight);
        this.planeMesh = new THREE.Mesh(plane, this.planeMaterial);
        this.planeMesh.rotation.x = -Math.PI / 2;
        this.planeMesh.position.y = -0;
        this.app.scene.add(this.planeMesh);
    }

    /**
     * updates the diffuse plane color and the material
     * @param {THREE.Color} value 
     */
    updateDiffusePlaneColor(value) {
        this.diffusePlaneColor = value
        this.planeMaterial.color.set(this.diffusePlaneColor)
    }
    /**
     * updates the specular plane color and the material
     * @param {THREE.Color} value 
     */
    updateSpecularPlaneColor(value) {
        this.specularPlaneColor = value
        this.planeMaterial.specular.set(this.specularPlaneColor)
    }
    /**
     * updates the plane shininess and the material
     * @param {number} value 
     */
    updatePlaneShininess(value) {
        this.planeShininess = value
        this.planeMaterial.shininess = this.planeShininess
    }

    /**
     * rebuilds the box mesh if required
     * this method is called from the gui interface
     */
    rebuildBox() {
        // remove boxMesh if exists
        if (this.boxMesh !== undefined && this.boxMesh !== null) {
            this.app.scene.remove(this.boxMesh)
        }
        this.buildBox();
        this.lastBoxEnabled = null
    }

    /**
     * updates the box mesh if required
     * this method is called from the render method of the app
     * updates are trigered by boxEnabled property changes
     */
    updateBoxIfRequired() {
        if (this.boxEnabled !== this.lastBoxEnabled) {
            this.lastBoxEnabled = this.boxEnabled
            if (this.boxEnabled) {
                this.app.scene.add(this.boxMesh)
            }
            else {
                this.app.scene.remove(this.boxMesh)
            }
        }
    }
    updateTableIfRequired() {
        if (this.tableEnabled !== this.lastTableEnabled) {
            this.lastTableEnabled = this.tableEnabled
            if (this.tableEnabled) {
                this.app.scene.add(this.tableObj);
            }
            else {
                this.app.scene.remove(this.tableObj);
            }
        }
    }

    updateWallsIfRequired() {
        if (this.wallsEnabled !== this.lastWallsEnabled) {
            this.lastWallsEnabled = this.wallsEnabled
            if (this.wallsEnabled) {
                this.app.scene.add(this.wallMesh1);
                this.app.scene.add(this.wallMesh2);
                this.app.scene.add(this.wallMesh3);
                this.app.scene.add(this.wallMesh4);
            }
            else {
                this.app.scene.remove(this.wallMesh1);
                this.app.scene.remove(this.wallMesh2);
                this.app.scene.remove(this.wallMesh3);
                this.app.scene.remove(this.wallMesh4);
            }
        }
    }
    updatePointLightPosition(x, y, z) {
        if (x !== null) this.pointLightPosition.x = x;
        if (y !== null) this.pointLightPosition.y = y;
        if (z !== null) this.pointLightPosition.z = z;
        this.pointLight.position.set(this.pointLightPosition.x, this.pointLightPosition.y, this.pointLightPosition.z);
    }
    updatePointLightColor(color) {
        this.pointLightColor = color;
        this.pointLight.color.set(this.pointLightColor);
    }
    updateAmbientLightColor(color) {
        this.ambientLightColor = color;
        this.ambientLight.color.set(this.ambientLightColor);

    }
    
    updateAmbientLightIntensity(value) {
    this.ambientLightIntensity = value;
    this.ambientLight.intensity = value;    
    }


    updateDirectionalLightColor(color){
        this.directionalLightColor = color;
        this.directionalLight.color.set(this.directionalLightColor);

    }
    updateDirectionalLightIntensity(value){
        this.directionalLightIntensity = value;
        this.directionalLight.intensity = value;
    }

    updateDirectionalLightPosition(x,y,z){
         if (x !== null) this.directionalLightPosition.x = x;
        if (y !== null) this.directionalLightPosition.y = y;
        if (z !== null) this.directionalLightPosition.z = z;
        this.directionalLight.position.set(this.directionalLightPosition.x, this.directionalLightPosition.y, this.directionalLightPosition.z);
    }

    updateDirectionalLightTarget(x, y, z) {
    if (x !== null) this.directionalLightTarget.x = x;
    if (y !== null) this.directionalLightTarget.y = y;
    if (z !== null) this.directionalLightTarget.z = z;

    this.directionalLightTargetObj.position.set(
        this.directionalLightTarget.x,
        this.directionalLightTarget.y,
        this.directionalLightTarget.z
    );

    this.directionalLightHelper.update();
    }

    updateDirectionalLightVisibility(value) {
        this.directionalLight.visible = value;
        this.directionalLightHelper.visible = value;
    }

    updateSpotLightColor(value) {
        this.spotLight.color.set(value);
    }

    updateSpotLightIntensity(value) {
        this.spotLight.intensity = value;
    }

    updateSpotLightDistance(value) {
        this.spotLight.distance = value;
        this.spotHelper.update();
    }

    updateSpotLightAngle(value) {
        this.spotLight.angle = THREE.MathUtils.degToRad(value);
        this.spotHelper.update();
    }

    updateSpotLightPenumbra(value) {
        this.spotLight.penumbra = value;
        this.spotHelper.update();
    }

    updateSpotLightDecay(value) {
        this.spotLight.decay = value;
    }

    updateSpotLightPositionY(value) {
        this.spotLight.position.y = value;
        this.spotHelper.update();
    }

    updateSpotLightTargetY(value) {
        this.spotLight.target.position.y = value;
        this.spotHelper.update();
    }

    updateSpotLightVisibility(value) {
        this.spotLight.visible = value;
        this.spotHelper.visible = value;
    }


    updateWallTextureWrapS(value) {
        this.newWallTexture.wrapS = value;
        this.newWallTexture.needsUpdate = true;
    }
    
    updateWallTextureWrapT(value) {
        this.newWallTexture.wrapT = value;
        this.newWallTexture.needsUpdate = true;
    }

    updateWallTextureRepeatS(value) {
        this.newWallTexture.repeat.set(value, this.wallParams.repeatT);
        this.newWallTexture.needsUpdate = true;
    }

    updateWallTextureRepeatT(value) {
        this.newWallTexture.repeat.set(this.wallParams.repeatS, value);
        this.newWallTexture.needsUpdate = true;
    }

    /**
     * updates the contents
     * this method is called from the render method of the app
     * 
     */
    update() {
        // check if box mesh needs to be updated
        this.updateBoxIfRequired()

        this.updateTableIfRequired()

        this.updateWallsIfRequired()

        // sets the box mesh position based on the displacement vector
        this.boxMesh.position.x = this.boxDisplacement.x
        this.boxMesh.position.y = this.boxDisplacement.y
        this.boxMesh.position.z = this.boxDisplacement.z

    }

}

export { MyContents };
