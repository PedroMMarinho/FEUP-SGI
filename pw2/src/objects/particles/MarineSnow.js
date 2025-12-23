import * as THREE from "three";
import { TimeManager } from "../../managers/TimeManager.js";
import { SandParticle } from "./SandParticle.js";
import { CollisionManager } from "../../managers/CollisionManager.js";
import { CameraManager } from "../../managers/CameraManager.js";

export class MarineSnow extends THREE.Group {
    constructor(
        particleCount = 1000, 
        bounds = { width: 100, height: 100, depth: 100 }, 
        heightAt = null,
        config = {},
        
    ) {
        super();

        this.bounds = bounds;
        this.heightAt = heightAt;

        // --- CONFIGURATION ---
        this.settings = {
            particleSize: config.particleSize ,
            
            // Speed: [min, max]
            fallSpeed: config.fallSpeed, 
            driftSpeed: config.driftSpeed,
            
            // Meandering (Swaying back and forth)
            swayFrequency: config.swayFrequency,
            swayAmplitude: config.swayAmplitude,        
            
            // Physics
            gravity: config.gravity,        
            bounceRestitution: config.bounce, 
            
            // Life & Fading
            fadeSpeed: config.fadeSpeed,    
            // simulate distance
            simulateDistance: config.simulateDistance,
        };
        this.cameraManager = CameraManager.getInstance();
        this.collisionManager = CollisionManager.getInstance();
        this.obstacles = []

        // 1. Setup Render Data
        this.renderData = new SandParticle(particleCount, this.settings.particleSize);
        this.add(this.renderData.mesh);

        // 2. Setup Time Manager
        this.timeManager = TimeManager.getInstance();
        this.lastTime = this.timeManager.getElapsedTime();
        
        // 3. Setup Particles
        this.particles = []; 
        this.initParticles();
    }

    // Helper to get random number between min and max
    randomRange(min, max) {
        return min + Math.random() * (max - min);
    }

    initParticles() {
        const { width, height, depth } = this.bounds;
        const positions = this.renderData.positions;
        const colors = this.renderData.colors;

        for (let i = 0; i < this.renderData.particleCount; i++) {
            const i3 = i * 3;

            // Start Position
            positions[i3] = (Math.random() - 0.5) * width;
            positions[i3 + 1] = Math.random() * height;
            positions[i3 + 2] = (Math.random() - 0.5) * depth;
            
            // Start Color (White)
            colors[i3] = 1; colors[i3 + 1] = 1; colors[i3 + 2] = 1;

            this.particles.push(this.createParticleData(i3));
        }
    }

    createParticleData(index) {
        // Generate random physics properties
        const fallSpeed = this.randomRange(this.settings.fallSpeed[0], this.settings.fallSpeed[1]);
        const driftX = this.randomRange(this.settings.driftSpeed[0], this.settings.driftSpeed[1]);
        const driftZ = this.randomRange(this.settings.driftSpeed[0], this.settings.driftSpeed[1]);
        const swayFreq = this.randomRange(this.settings.swayFrequency[0], this.settings.swayFrequency[1]);

        return {
            index: index,
            baseFallSpeed: fallSpeed,
            velocity: new THREE.Vector3(0, -fallSpeed, 0),
            drift: new THREE.Vector3(
                Math.random() < 0.5 ? driftX : -driftX, 
                0, 
                Math.random() < 0.5 ? driftZ : -driftZ
            ),
            sway: {
                freq: swayFreq,
                offset: Math.random() * Math.PI 
            },
            isDying: false,
            life: 1.0 
        };
    }

    updateState() {
        if (!this.particles || this.particles.length === 0) return;

        const currentTime = this.timeManager.getElapsedTime();
        let dt = currentTime - this.lastTime;
        this.lastTime = currentTime;

        if (dt > 0.1) dt = 0.1; 

        const positions = this.renderData.positions;
        const colors = this.renderData.colors;
        const halfW = this.bounds.width / 2;
        const halfD = this.bounds.depth / 2;

        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            const i3 = p.index;

            // --- 1. MOVEMENT & PREVIOUS POS ---
            let px = positions[i3];
            let py = positions[i3 + 1];
            let pz = positions[i3 + 2];

            const cameraPosition = this.cameraManager.getActiveCamera().position;

            const xDist = px - cameraPosition.x;
            const zDist = pz - cameraPosition.z;
            const horizontalDist = Math.sqrt(xDist*xDist + zDist*zDist);
            
            if (horizontalDist > this.settings.simulateDistance) {
                continue; 
            }

            

            //const prevX = px;
            //const prevY = py;
            //const prevZ = pz;

            const sway = Math.sin(currentTime * p.sway.freq + p.sway.offset) * this.settings.swayAmplitude * dt;
            px += (p.drift.x * dt) + sway;
            pz += (p.drift.z * dt) + sway;
            py += p.velocity.y * dt;

            // --- 2. WALL COLLISIONS (BOUNCE INSTEAD OF WRAP) ---
            if (px > halfW) { px = halfW; p.drift.x *= -1; }
            else if (px < -halfW) { px = -halfW; p.drift.x *= -1; }

            if (pz > halfD) { pz = halfD; p.drift.z *= -1; }
            else if (pz < -halfD) { pz = -halfD; p.drift.z *= -1; }

            // --- 2.5 OBSTACLE COLLISIONS TODO ---
            //if (!p.isDying) {
            //    for (let o = 0; o < this.obstacles.length; o++) {
            //        const box = this.obstacles[o];
            //        if (px >= box.minX && px <= box.maxX &&
            //            py >= box.minY && py <= box.maxY &&
            //            pz >= box.minZ && pz <= box.maxZ) {
            //            
            //            px = prevX; 
            //            py = prevY; 
            //            pz = prevZ;
            //
            //            p.drift.x *= -0.8;
            //            p.drift.z *= -0.8;
            //            
            //            if (p.velocity.y < 0) p.velocity.y *= -0.3;
            //            
            //            break; 
            //        }
            //    }
            //}

           // --- FLOOR COLLISION & GRAVITY ---
            let floorY = -100;
            let inRift = false;

            if (this.heightAt) {
                const terrainInfo = this.heightAt(px, pz);
                floorY = terrainInfo.height;
                inRift = terrainInfo.inRiftZone;
            }

            const distToFloor = py - floorY;
            const heatThreshold = 4; // The height at which it starts turning orange

            // Proximity Gradient (Heat up over time)
            if (!p.isDying) {
                if (inRift && distToFloor < heatThreshold && distToFloor > 0) {
                    
                    const heatFactor = 1.0 - (distToFloor / heatThreshold);

                    colors[i3]     = 1.0;                           
                    colors[i3 + 1] = 1.0 - (0.5 * heatFactor);       
                    colors[i3 + 2] = 1.0 - (1.0 * heatFactor);       

                } else {
                    colors[i3] = 1; colors[i3+1] = 1; colors[i3+2] = 1;
                }
            }

            // Check Collision
            if (py <= floorY && !p.isDying) {
                
                py = floorY;

                if (inRift) {
                    // --- RIFT BOUNCE LOGIC ---
                    p.isScorched = true; 

                    colors[i3] = 1.0; colors[i3+1] = 0.5; colors[i3+2] = 0.0;

                    p.velocity.y = Math.abs(p.velocity.y) * this.settings.bounceRestitution;
                    
                    p.isDying = true;
                    p.life -= 0.35; 

                } else {
                    // --- NORMAL BOUNCE LOGIC ---
                    p.velocity.y = Math.abs(p.velocity.y) * this.settings.bounceRestitution;
                    p.isDying = true;
                }

            } else if (py > floorY) {
                if (p.isDying) {
                    p.velocity.y -= this.settings.gravity * dt;
                } else {
                    p.velocity.y = -p.baseFallSpeed;
                }
            }

            // --- FADING & RESPAWN ---
            if (p.isDying) {
                const fadeRate = this.settings.fadeSpeed;
                p.life -= fadeRate * dt;

                const displayLife = Math.max(0, p.life);
                
                if (p.isScorched) {
                    colors[i3]     = 1.0 * displayLife; 
                    colors[i3 + 1] = 0.5 * displayLife; 
                    colors[i3 + 2] = 0.0 * displayLife; 
                } else {
                    colors[i3]     = displayLife;
                    colors[i3 + 1] = displayLife;
                    colors[i3 + 2] = displayLife;
                }

                // Respawn
                if (p.life <= 0) {
                    const newData = this.createParticleData(i3);
                    Object.assign(p, newData);

                    // RESET flags
                    p.isScorched = false; 
                    p.isDying = false;

                    px = (Math.random() - 0.5) * this.bounds.width;
                    py = this.bounds.height;
                    pz = (Math.random() - 0.5) * this.bounds.depth;

                    // Reset to White
                    colors[i3] = 1; colors[i3 + 1] = 1; colors[i3 + 2] = 1;
                }
            }

            positions[i3] = px;
            positions[i3 + 1] = py;
            positions[i3 + 2] = pz;
        }

        this.renderData.flagUpdates();
    }
}