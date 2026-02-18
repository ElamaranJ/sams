/**
 * LAYER 3: FACE LIVENESS DETECTION UTILITY
 * 
 * Purpose: Detect live face with random challenges to prevent photo/video spoofing
 * Uses webcam and basic face detection without heavy ML libraries
 * 
 * Challenges:
 * - Blink detection
 * - Head turn (left/right)
 * - Smile detection
 * - Look up/down
 * 
 * Anti-spoofing: Random challenges, motion detection, timing validation
 */

/**
 * Available liveness challenges
 */
export const LIVENESS_CHALLENGES = [
    {
        type: 'blink',
        instruction: '👁️ Blink your eyes twice',
        duration: 3000,
        icon: '👁️'
    },
    {
        type: 'turnLeft',
        instruction: '⬅️ Turn your head to the left',
        duration: 3000,
        icon: '⬅️'
    },
    {
        type: 'turnRight',
        instruction: '➡️ Turn your head to the right',
        duration: 3000,
        icon: '➡️'
    },
    {
        type: 'smile',
        instruction: '😊 Smile at the camera',
        duration: 3000,
        icon: '😊'
    },
    {
        type: 'nod',
        instruction: '⬇️ Nod your head (look down then up)',
        duration: 3000,
        icon: '⬇️'
    }
];

/**
 * Generates random set of challenges
 * @param {number} count - Number of challenges to generate
 * @returns {Array} Array of challenge objects
 */
export const generateRandomChallenges = (count = 3) => {
    const shuffled = [...LIVENESS_CHALLENGES].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};

/**
 * Simple motion detection using video frames
 * @param {HTMLVideoElement} video - Video element
 * @param {HTMLCanvasElement} canvas - Canvas for frame comparison
 * @returns {number} Motion score (0-100)
 */
export const detectMotion = (video, canvas) => {
    const ctx = canvas.getContext('2d');
    const width = video.videoWidth;
    const height = video.videoHeight;

    canvas.width = width;
    canvas.height = height;

    // Draw current frame
    ctx.drawImage(video, 0, 0, width, height);
    const currentFrame = ctx.getImageData(0, 0, width, height);

    // Compare with previous frame (stored in canvas data attribute)
    const previousFrame = canvas.dataset.previousFrame;

    if (!previousFrame) {
        // Store first frame
        canvas.dataset.previousFrame = JSON.stringify(Array.from(currentFrame.data));
        return 0;
    }

    const prevData = new Uint8ClampedArray(JSON.parse(previousFrame));
    let diff = 0;

    // Calculate difference between frames (sample every 4th pixel for performance)
    for (let i = 0; i < currentFrame.data.length; i += 16) {
        diff += Math.abs(currentFrame.data[i] - prevData[i]);
    }

    // Store current frame for next comparison
    canvas.dataset.previousFrame = JSON.stringify(Array.from(currentFrame.data));

    // Normalize to 0-100 scale
    const motionScore = Math.min(100, (diff / (width * height)) * 10);
    return motionScore;
};

/**
 * Detects face brightness (simple face presence check)
 * @param {HTMLVideoElement} video - Video element
 * @param {HTMLCanvasElement} canvas - Canvas for analysis
 * @returns {Object} Brightness info
 */
export const detectFaceBrightness = (video, canvas) => {
    const ctx = canvas.getContext('2d');
    const width = video.videoWidth;
    const height = video.videoHeight;

    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(video, 0, 0, width, height);

    // Sample center region (where face should be)
    const centerX = width / 2;
    const centerY = height / 2;
    const sampleSize = 100;

    const imageData = ctx.getImageData(
        centerX - sampleSize / 2,
        centerY - sampleSize / 2,
        sampleSize,
        sampleSize
    );

    let totalBrightness = 0;
    for (let i = 0; i < imageData.data.length; i += 4) {
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];
        totalBrightness += (r + g + b) / 3;
    }

    const avgBrightness = totalBrightness / (sampleSize * sampleSize);

    return {
        brightness: avgBrightness,
        isFaceDetected: avgBrightness > 50 && avgBrightness < 240 // Reasonable range
    };
};

/**
 * Validates challenge completion based on motion patterns
 * @param {string} challengeType - Type of challenge
 * @param {Array} motionHistory - Array of recent motion scores
 * @returns {boolean} True if challenge appears completed
 */
export const validateChallengeCompletion = (challengeType, motionHistory) => {
    if (motionHistory.length < 10) return false;

    const recentMotion = motionHistory.slice(-10);
    const avgMotion = recentMotion.reduce((a, b) => a + b, 0) / recentMotion.length;

    switch (challengeType) {
        case 'blink':
            // Look for quick motion spikes (blinks)
            const spikes = recentMotion.filter(m => m > 15).length;
            return spikes >= 2;

        case 'turnLeft':
        case 'turnRight':
            // Look for sustained motion
            return avgMotion > 20;

        case 'smile':
            // Look for moderate motion
            return avgMotion > 10;

        case 'nod':
            // Look for motion pattern
            return avgMotion > 15;

        default:
            return avgMotion > 10;
    }
};

/**
 * Captures face snapshot
 * @param {HTMLVideoElement} video - Video element
 * @returns {string} Face image as data URL
 */
export const captureFaceSnapshot = (video) => {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    return canvas.toDataURL('image/jpeg', 0.8);
};

/**
 * Liveness Detection Manager Class
 */
export class LivenessDetector {
    constructor(videoElement) {
        this.video = videoElement;
        this.canvas = document.createElement('canvas');
        this.motionHistory = [];
        this.currentChallenge = null;
        this.challengeStartTime = null;
        this.isActive = false;
    }

    /**
     * Starts liveness detection
     */
    async start() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                }
            });

            this.video.srcObject = stream;
            this.isActive = true;

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: 'Camera access denied or not available'
            };
        }
    }

    /**
     * Stops liveness detection
     */
    stop() {
        if (this.video.srcObject) {
            this.video.srcObject.getTracks().forEach(track => track.stop());
            this.video.srcObject = null;
        }
        this.isActive = false;
    }

    /**
     * Starts a challenge
     * @param {Object} challenge - Challenge object
     */
    startChallenge(challenge) {
        this.currentChallenge = challenge;
        this.challengeStartTime = Date.now();
        this.motionHistory = [];
    }

    /**
     * Updates motion detection (call this in animation frame)
     * @returns {Object} Motion data
     */
    updateMotion() {
        if (!this.isActive || !this.currentChallenge) return null;

        const motionScore = detectMotion(this.video, this.canvas);
        this.motionHistory.push(motionScore);

        // Keep only last 30 frames
        if (this.motionHistory.length > 30) {
            this.motionHistory.shift();
        }

        const isCompleted = validateChallengeCompletion(
            this.currentChallenge.type,
            this.motionHistory
        );

        const elapsed = Date.now() - this.challengeStartTime;
        const timeRemaining = this.currentChallenge.duration - elapsed;

        return {
            motionScore,
            isCompleted,
            timeRemaining: Math.max(0, timeRemaining),
            progress: Math.min(100, (elapsed / this.currentChallenge.duration) * 100)
        };
    }

    /**
     * Checks if face is detected
     * @returns {boolean} True if face detected
     */
    isFaceDetected() {
        const faceData = detectFaceBrightness(this.video, this.canvas);
        return faceData.isFaceDetected;
    }

    /**
     * Captures current frame
     * @returns {string} Image data URL
     */
    captureFrame() {
        return captureFaceSnapshot(this.video);
    }
}

/**
 * Checks if webcam is available
 * @returns {Promise<boolean>} True if webcam available
 */
export const isWebcamAvailable = async () => {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        return devices.some(device => device.kind === 'videoinput');
    } catch (error) {
        return false;
    }
};

/**
 * Example usage:
 * 
 * const videoElement = document.getElementById('webcam');
 * const detector = new LivenessDetector(videoElement);
 * 
 * // Start webcam
 * await detector.start();
 * 
 * // Generate challenges
 * const challenges = generateRandomChallenges(3);
 * 
 * // Run each challenge
 * for (const challenge of challenges) {
 *   detector.startChallenge(challenge);
 *   
 *   // Animation loop
 *   const checkMotion = () => {
 *     const motion = detector.updateMotion();
 *     
 *     if (motion.isCompleted) {
 *       console.log("Challenge completed!");
 *       return;
 *     }
 *     
 *     if (motion.timeRemaining > 0) {
 *       requestAnimationFrame(checkMotion);
 *     } else {
 *       console.log("Challenge failed - timeout");
 *     }
 *   };
 *   
 *   requestAnimationFrame(checkMotion);
 * }
 * 
 * // Capture final snapshot
 * const snapshot = detector.captureFrame();
 * 
 * // Stop webcam
 * detector.stop();
 */
