import * as THREE from 'three';

export class KeyframedAnimation {
    static interpolationFunctions = {
        discrete: (start, end, progress) => start,
        linear: (start, end, progress) => start + (end - start) * progress,
        quadratic: (start, end, progress) => {
            const p = progress < 0.5
                ? 2 * progress * progress 
                : 1 - Math.pow(-2 * progress + 2, 2) / 2;
            return start + (end - start) * p;
        },
        // Catmull-Rom Spline
        cubic: (p0, p1, p2, p3, progress) => {
            const t = progress;
            const t2 = t * t;
            const t3 = t2 * t;
            return 0.5 * (
                (2 * p1) +
                (-p0 + p2) * t +
                (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
                (-p0 + 3 * p1 - 3 * p2 + p3) * t3
            );
        }
    };

    constructor(inputData, interpType = "linear", durationOrSteps = 10, loop = true) {
        
        if (typeof inputData === 'object' && inputData.positions) {
            this.mode = 'route';
            this.keyframes = [];
            this.animLength = durationOrSteps; 
            this.loop = loop;
            this.interpType = interpType === "catmullrom" ? "cubic" : interpType;

            const count = inputData.times.length;
            for(let i=0; i<count; i++) {
                this.keyframes.push({
                    time: inputData.times[i],
                    position: inputData.positions[i],    
                    quaternion: inputData.quaternions[i]  
                });
            }
        } 
        else {
            this.mode = 'random';
            this.animLength = inputData; 
            this.loop = true;
            this.interpType = interpType;
            this.stepNr = durationOrSteps || 6;
            
            this.animationYDelta = 30;
            this.animationXDelta = 30;
            this.animationZDelta = 30;
            
            this.keyframes = [];
            this.generateRandomKeyframes();
        }
    }

    generateRandomKeyframes() {
        const step = this.animLength / this.stepNr;
        const times = Array.from({ length: this.stepNr}, (_, index) => index * step);

        this.keyframes = times.map(time => ({
            time,
            position: new THREE.Vector3(
                Math.random() * this.animationXDelta,
                Math.random() * this.animationYDelta,
                Math.random() * this.animationZDelta
            ),
            quaternion: new THREE.Quaternion().setFromAxisAngle(
                new THREE.Vector3(0, 1, 0), 
                Math.random() * Math.PI * 2
            )
        }));
    }

    getSegment(time) {
        if (this.loop) {
            time = time % this.animLength;
            if (time < 0) time += this.animLength;
        } else {
            if (time >= this.animLength) time = this.animLength - 0.001;
            if (time < 0) time = 0;
        }

        for (let i = 0; i < this.keyframes.length - 1; i++) {
            if (time >= this.keyframes[i].time && time < this.keyframes[i+1].time) {
                const start = this.keyframes[i];                
                const end = this.keyframes[i+1];
                const duration = end.time - start.time;
                const progress = duration === 0 ? 1 : (time - start.time) / duration;
                return { start, end, progress, i };
            }
        }

        if (this.loop) {
            const start = this.keyframes[this.keyframes.length - 1];
            const end = this.keyframes[0];
            const duration = this.animLength - start.time; 
            
            let progress = 0;
            if (duration > 0.0001) {
                progress = (time - start.time) / duration;
            }
            return { start, end, progress, i: this.keyframes.length - 1 };
        }

        const last = this.keyframes[this.keyframes.length - 1];
        return { start: last, end: last, progress: 1, i: this.keyframes.length - 1 };
    }

    getWrappedIndex(index) {
        const len = this.keyframes.length;
        return ((index % len) + len) % len;
    }

    update(time) {
        return this.getPose(time);
    }

    getPose(time) {
        if (this.keyframes.length === 0) return null;

        const { start, end, progress, i } = this.getSegment(time);
        
        const resultPos = new THREE.Vector3();
        const resultQuat = new THREE.Quaternion();

        // --- 1. POSITION INTERPOLATION ---
        if (this.interpType === "cubic") {
            const p0 = this.keyframes[this.getWrappedIndex(i - 1)].position;
            const p1 = start.position;
            const p2 = end.position;
            const p3 = this.keyframes[this.getWrappedIndex(i + 2)].position;

            resultPos.x = KeyframedAnimation.interpolationFunctions.cubic(p0.x, p1.x, p2.x, p3.x, progress);
            resultPos.y = KeyframedAnimation.interpolationFunctions.cubic(p0.y, p1.y, p2.y, p3.y, progress);
            resultPos.z = KeyframedAnimation.interpolationFunctions.cubic(p0.z, p1.z, p2.z, p3.z, progress);
        } 
        else {
            // Linear / Quadratic / Discrete
            const func = KeyframedAnimation.interpolationFunctions[this.interpType] || KeyframedAnimation.interpolationFunctions.linear;
            resultPos.x = func(start.position.x, end.position.x, progress);
            resultPos.y = func(start.position.y, end.position.y, progress);
            resultPos.z = func(start.position.z, end.position.z, progress);
        }

        // --- 2. ROTATION INTERPOLATION ---
        resultQuat.copy(start.quaternion).slerp(end.quaternion, progress);

        return { position: resultPos, quaternion: resultQuat };
    }
}