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

	static properties = ["x", "y", "z", "angle"];

	constructor(
		animLengthMS,
		interpType = "linear",
		stepNr = 6, 
		animationYDelta = 30,
		animationXDelta = 30, 
		animationZDelta = 30, 
		keyframes = null
	) {
		this.animLength = animLengthMS;
		this.stepNr = stepNr;
		this.keyframes = keyframes ?? [];
		this.interpType = interpType;

		this.selectedKeyframeIndex = null;
		this.draggedProperty = null;
		this.isDragging = null;
		this.isRotating = null;
		this.isDraggingChart = null;

		this.animationYDelta = animationYDelta;
		this.animationXDelta = animationXDelta;
		this.animationZDelta = animationZDelta;

		if (!keyframes) {
			console.warn("No keyframes provided; will use random keyframe generation.");
			this.generateKeyframes();
		}
	}

	generateKeyframes() {
		const step = this.animLength / this.stepNr;
		const times = Array.from(
			{ length: this.stepNr},
			(_, index) => 0 + index * step
		);

		this.keyframes = times.map((time, _) => ({
			time,
			x: Math.random() * this.animationXDelta,
			y: Math.random() * this.animationYDelta,
			z: Math.random() * this.animationZDelta,
			angle: Math.random() * Math.PI * 2,
		}));
	}
	
	// get keyframe segment progress for animation time
	// returns: { startFrame, endFrame, progressFraction, segmentNr }
	getSegment(time) {
		if (this.keyframes.length < 2) {
			const only = this.keyframes[0] ?? {};
			return {start: only, end: only, progress: 1, i: 0};
		}
		
		time = time % this.animLength; // wrap around to start of animation

		for (let i = 0; i < this.keyframes.length - 1; i++) {
			if (time >= this.keyframes[i].time && time < this.keyframes[i+1].time) {
				const start = this.keyframes[i];				
				const end = this.keyframes[i+1];
				const duration = end.time - start.time;
				const progress = duration === 0 ? 1 : (time - start.time) / duration;
				return { start, end, progress, i };
			}
		}
		/*return {
			start: this.keyframes[this.keyframes.length - 1],
			end: this.keyframes[this.keyframes.length - 1], 
			progress: 1, 
			i: this.keyframes.length - 2 
		};*/
		// Wrap-around: last → first
		const start = this.keyframes[this.keyframes.length - 1];
		const end = this.keyframes[0];
		const duration = this.animLength - start.time;
		const progress = duration === 0 ? 1 : (time - start.time) / duration;
		return { start, end, progress, i: this.keyframes.length - 1 };
	}

	getInterpolatedValue(time, property) {
		if (this.interpType === "discrete" && time >= this.animLength) {
			return this.keyframes[this.keyframes.length - 1][property];
		}

		const { start, end, progress, i } = this.getSegment(time);

		if (this.interpType === "cubic") {
			const p0 = this.keyframes[i > 0 ? i - 1 : 0][property];
			const p1 = start[property];
			const p2 = end[property];
			const p3 = this.keyframes[i < this.keyframes.length - 2 ? i + 2 : this.keyframes.length - 1][property];
			return KeyframedAnimation.interpolationFunctions.cubic(p0, p1, p2, p3, progress);
		}

		if (this.interpType !== "linear" && this.interpType !== "quadratic") {
			this.interpType = "linear";
			console.warn("Invalid interpolation method provided. Selecting 'linear' instead.");
		}
		return KeyframedAnimation.interpolationFunctions[this.interpType](start[property], end[property], progress);
	}

	getPose(time) {
		const pose = {};
		for (const prop of KeyframedAnimation.properties) {
			pose[prop] = this.getInterpolatedValue(time, prop);
		}
		return pose;
	}
}
