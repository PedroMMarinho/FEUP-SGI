import * as THREE from 'three';

class GlassTank extends THREE.Object3D {
    constructor(width, height, depth, position = new THREE.Vector3(0, -5, 0)) {
        super();

        this.width = width;
        this.height = height;
        this.depth = depth;
        // BVH parameters
		this.rootObject = true;
		this.bvhSelectable = false;

        const glassMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            transmission: 1.0,  
            ior: 1.5,           
            roughness: 0.3,     
            metalness: 0.0,
            transparent: true,
            side: THREE.DoubleSide 
        });

        const wallGeoX = new THREE.PlaneGeometry(depth, height); 
        const wallGeoZ = new THREE.PlaneGeometry(width, height); 
        const bottomGeo = new THREE.PlaneGeometry(width, depth);

        const bottom = new THREE.Mesh(bottomGeo, glassMaterial);
        bottom.rotation.x = -Math.PI / 2;

        const backWall = new THREE.Mesh(wallGeoZ, glassMaterial);
        backWall.position.y = height / 2; 
        backWall.position.z = -depth / 2;

        const frontWall = new THREE.Mesh(wallGeoZ, glassMaterial);
        frontWall.position.y = height / 2;
        frontWall.position.z = depth / 2;

        const leftWall = new THREE.Mesh(wallGeoX, glassMaterial);
        leftWall.position.y = height / 2;
        leftWall.position.x = -width / 2;
        leftWall.rotation.y = Math.PI / 2;

        const rightWall = new THREE.Mesh(wallGeoX, glassMaterial);
        rightWall.position.y = height / 2;
        rightWall.position.x = width / 2;
        rightWall.rotation.y = -Math.PI / 2;

        this.add(backWall);
        this.add(frontWall);
        this.add(leftWall);
        this.add(rightWall);
        this.add(bottom);
        this.position.copy(position);
    }
}

export { GlassTank };