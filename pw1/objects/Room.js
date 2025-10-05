import *as THREE from 'three';

class Room extends THREE.Object3D {
    constructor() {
        super();

        this.initMaterials();
        this.initConstants();
        this.createRoom();
    }

    initMaterials() {
        const wallTexture = new THREE.TextureLoader().load('textures/casinoWall.jpg');
        const floorTexture = new THREE.TextureLoader().load('textures/casinoFloor.jpeg');
        const roofTexture = new THREE.TextureLoader().load('textures/pokerRest.jpg')
        wallTexture.wrapS = wallTexture.wrapT = THREE.RepeatWrapping;
        wallTexture.repeat.set(3, 1);
        floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
        floorTexture.repeat.set(8, 8);
        

        this.wallMaterial = new THREE.MeshPhongMaterial({ map: wallTexture });
        this.floorMaterial = new THREE.MeshPhongMaterial({ map: floorTexture, specular: 0x111111, shininess: 50 });
        this.roofMaterial = new THREE.MeshPhongMaterial({ map: roofTexture, color: 0x8B0000 });
    }
    initConstants() {
        this.roomWidth = 30;
        this.roomHeight = 12;
        this.roomDepth = 40;
        this.windowXPos = 0.85; // Relative position on the window wall (0 to 1)
        this.windowYPos = 0.6; // Relative position on the window wall (0 to 1)
        this.windowWidth = 8;
        this.windowHeight = 5;
    }
    createRoom() {
        // Floor
        const floorGeometry = new THREE.PlaneGeometry(this.roomWidth, this.roomDepth);
        const floor = new THREE.Mesh(floorGeometry, this.floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = 0;
        this.add(floor);

        // Roof
        const roofGeometry = new THREE.PlaneGeometry(this.roomWidth, this.roomDepth);
        const roof = new THREE.Mesh(roofGeometry, this.roofMaterial);
        roof.rotation.x = Math.PI / 2;
        roof.position.y = this.roomHeight;
        this.add(roof);

        // Walls
        const wallGeometry1 = new THREE.PlaneGeometry(this.roomWidth, this.roomHeight);
        const wall1 = new THREE.Mesh(wallGeometry1, this.wallMaterial);
        wall1.position.z = -this.roomDepth / 2;
        wall1.position.y = this.roomHeight / 2;
        this.add(wall1);

        const wallGeometry2 = new THREE.PlaneGeometry(this.roomDepth, this.roomHeight);
        const wall2 = new THREE.Mesh(wallGeometry2, this.wallMaterial);
        wall2.rotation.y = Math.PI / 2;
        wall2.position.x = -this.roomWidth / 2;
        wall2.position.y = this.roomHeight / 2;
        this.add(wall2);

        const wall3 = new THREE.Mesh(wallGeometry1, this.wallMaterial);
        wall3.rotation.y = Math.PI;
        wall3.position.z = this.roomDepth / 2;
        wall3.position.y = this.roomHeight / 2;
        this.add(wall3);


        const windowWall = new THREE.Shape();
        windowWall.moveTo(-this.roomDepth / 2, -this.roomHeight / 2);
        windowWall.lineTo(this.roomDepth / 2, -this.roomHeight / 2);
        windowWall.lineTo(this.roomDepth / 2, this.roomHeight / 2);
        windowWall.lineTo(-this.roomDepth / 2, this.roomHeight / 2);
        windowWall.lineTo(-this.roomDepth / 2, -this.roomHeight / 2);

        // Calculate positions for 3 symmetric windows
        const numWindows = 3;
        const spacing = (this.roomDepth - numWindows * this.windowWidth) / (numWindows + 1);
        const startY = -this.roomHeight / 2 + this.roomHeight * this.windowYPos - this.windowHeight / 2;

        for (let i = 0; i < numWindows; i++) {
            const windowX = -this.roomDepth / 2 + spacing * (i + 1) + this.windowWidth * i;
            const windowHole = new THREE.Path();
            windowHole.moveTo(windowX, startY);
            windowHole.lineTo(windowX + this.windowWidth, startY);
            windowHole.lineTo(windowX + this.windowWidth, startY + this.windowHeight);
            windowHole.lineTo(windowX, startY + this.windowHeight);
            windowHole.lineTo(windowX, startY);
            windowWall.holes.push(windowHole);
        }

        const wallGeometryWithWindow = new THREE.ShapeGeometry(windowWall);
        wallGeometryWithWindow.computeBoundingBox();
        const boundBox = wallGeometryWithWindow.boundingBox;

        const size = new THREE.Vector2();
        size.subVectors(boundBox.max, boundBox.min);

        const uv = wallGeometryWithWindow.attributes.uv;
        const pos = wallGeometryWithWindow.attributes.position;

        for (let i = 0; i < uv.count; i++) {
            const x = pos.getX(i);
            const y = pos.getY(i);

            const u = (x - boundBox.min.x) / size.x;
            const v = (y - boundBox.min.y) / size.y;

            uv.setXY(i, u, v);
        }

        wallGeometryWithWindow.attributes.uv.needsUpdate = true;
        const wallWithWindow = new THREE.Mesh(wallGeometryWithWindow, this.wallMaterial);
        wallWithWindow.rotation.y = -Math.PI / 2;
        wallWithWindow.position.x = this.roomWidth / 2;
        wallWithWindow.position.y = this.roomHeight / 2;
        this.add(wallWithWindow);

    }   

    getRoomDimensions() {
        return {
            width: this.roomWidth,
            height: this.roomHeight,
            depth: this.roomDepth
        };
    }
    getWindowPositions() {
        const windowPositions = [];
        const numWindows = 3;
        const spacing = (this.roomDepth - numWindows * this.windowWidth) / (numWindows + 1);
        const startY =  this.roomHeight * this.windowYPos - this.windowHeight / 2;

        for (let i = 0; i < numWindows; i++) {
            const windowX = -this.roomDepth / 2 + spacing * (i + 1) + this.windowWidth * i;
            windowPositions.push({
                x: this.roomWidth / 2,
                y: startY,
                z: windowX + this.windowWidth / 2
            });
        }
        return windowPositions;
    }
}

export { Room };