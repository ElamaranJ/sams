/**
 * FACE LIVENESS VERIFICATION COMPONENT
 * 
 * Purpose: Fourth verification layer - live face detection with random challenges
 * Prevents photo/video spoofing using motion-based liveness detection
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CheckCircle, XCircle, Loader, Eye, Smile, ArrowLeft, ArrowRight, ArrowDown } from 'lucide-react';
import {
    LivenessDetector,
    generateRandomChallenges,
    isWebcamAvailable
} from '../../utils/livenessDetection';
import Button from '../ui/Button';

const FaceLivenessVerification = ({ onSuccess, onFailure }) => {
    const [status, setStatus] = useState('idle'); // idle, starting, verifying, success, failed
    const [challenges, setChallenges] = useState([]);
    const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
    const [challengeStatus, setChallengeStatus] = useState('waiting'); // waiting, active, passed, failed
    const [motionScore, setMotionScore] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [error, setError] = useState(null);
    const [faceSnapshot, setFaceSnapshot] = useState(null);

    const videoRef = useRef(null);
    const detectorRef = useRef(null);
    const animationFrameRef = useRef(null);

    const currentChallenge = challenges[currentChallengeIndex];

    // Get challenge icon
    const getChallengeIcon = (type) => {
        switch (type) {
            case 'blink': return <Eye size={32} />;
            case 'turnLeft': return <ArrowLeft size={32} />;
            case 'turnRight': return <ArrowRight size={32} />;
            case 'smile': return <Smile size={32} />;
            case 'nod': return <ArrowDown size={32} />;
            default: return <Camera size={32} />;
        }
    };

    // Start verification process
    const startVerification = async () => {
        setStatus('starting');
        setError(null);

        // Allow React to render the video element first
        await new Promise(resolve => setTimeout(resolve, 100));

        // Check webcam availability
        const webcamAvailable = await isWebcamAvailable();
        if (!webcamAvailable) {
            setStatus('failed');
            setError('No webcam detected');
            onFailure?.('No webcam');
            return;
        }

        if (!videoRef.current) {
            // Retry once if ref is missing
            await new Promise(resolve => setTimeout(resolve, 300));
            if (!videoRef.current) {
                setStatus('failed');
                setError('Video initialization failed');
                return;
            }
        }

        // Generate random challenges
        const randomChallenges = generateRandomChallenges(3);
        setChallenges(randomChallenges);
        setCurrentChallengeIndex(0);

        // Initialize detector
        detectorRef.current = new LivenessDetector(videoRef.current);
        const result = await detectorRef.current.start();

        if (!result.success) {
            setStatus('failed');
            setError(result.error);
            onFailure?.(result.error);
            return;
        }

        // Wait for video to be ready
        setTimeout(() => {
            setStatus('verifying');
            startChallenge(0);
        }, 1000);
    };

    // Start a specific challenge
    const startChallenge = (index) => {
        if (!challenges[index]) return;

        setChallengeStatus('active');
        detectorRef.current.startChallenge(challenges[index]);

        // Start animation loop
        updateMotion();
    };

    // Update motion detection
    const updateMotion = () => {
        if (!detectorRef.current || status !== 'verifying') return;

        const motion = detectorRef.current.updateMotion();

        if (motion) {
            setMotionScore(motion.motionScore);
            setTimeRemaining(motion.timeRemaining);

            if (motion.isCompleted) {
                // Challenge passed
                handleChallengeComplete(true);
                return;
            }

            if (motion.timeRemaining <= 0) {
                // Challenge failed - timeout
                handleChallengeComplete(false);
                return;
            }
        }

        // Continue animation loop
        animationFrameRef.current = requestAnimationFrame(updateMotion);
    };

    // Handle challenge completion
    const handleChallengeComplete = (passed) => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }

        if (!passed) {
            // Challenge failed
            setChallengeStatus('failed');
            setTimeout(() => {
                stopVerification();
                setStatus('failed');
                setError('Liveness check failed. Please try again.');
                onFailure?.('Liveness check failed');
            }, 1000);
            return;
        }

        // Challenge passed
        setChallengeStatus('passed');

        setTimeout(() => {
            const nextIndex = currentChallengeIndex + 1;

            if (nextIndex < challenges.length) {
                // Move to next challenge
                setCurrentChallengeIndex(nextIndex);
                setChallengeStatus('waiting');
                setTimeout(() => startChallenge(nextIndex), 500);
            } else {
                // All challenges completed
                completeVerification();
            }
        }, 1000);
    };

    // Complete verification
    const completeVerification = () => {
        // Capture face snapshot
        const snapshot = detectorRef.current.captureFrame();
        setFaceSnapshot(snapshot);

        stopVerification();
        setStatus('success');

        onSuccess?.({
            challenges: challenges.map((c, i) => ({
                type: c.type,
                passed: i <= currentChallengeIndex
            })),
            faceSnapshot: snapshot,
            timestamp: Date.now()
        });
    };

    // Stop verification
    const stopVerification = () => {
        if (detectorRef.current) {
            detectorRef.current.stop();
        }
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
    };

    useEffect(() => {
        return () => stopVerification();
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md mx-auto"
        >
            <div className="neomorph rounded-3xl p-8">
                {/* Header */}
                <div className="text-center mb-6">
                    <motion.div
                        animate={status === 'verifying' ? { scale: [1, 1.05, 1] } : {}}
                        transition={{ duration: 1, repeat: status === 'verifying' ? Infinity : 0 }}
                        className="inline-block"
                    >
                        {status === 'idle' && <Camera size={48} className="text-purple-500 mx-auto mb-4" />}
                        {status === 'starting' && <Loader size={48} className="text-blue-500 mx-auto mb-4 animate-spin" />}
                        {status === 'verifying' && getChallengeIcon(currentChallenge?.type)}
                        {status === 'success' && <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />}
                        {status === 'failed' && <XCircle size={48} className="text-red-500 mx-auto mb-4" />}
                    </motion.div>

                    <h2 className="text-2xl font-black text-slate-900 mb-2">
                        Face Liveness Check
                    </h2>
                    <p className="text-slate-600">
                        Layer 4: Live Face Verification
                    </p>
                </div>

                {/* Content */}
                <div className="space-y-4">
                    {status === 'idle' && (
                        <div className="text-center">
                            <div className="bg-slate-50 rounded-xl p-8 mb-4">
                                <Camera size={64} className="text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-600 text-sm mb-2">
                                    Complete 3 random challenges to verify you're live
                                </p>
                                <div className="text-xs text-slate-500">
                                    Examples: Blink, Turn head, Smile
                                </div>
                            </div>
                            <Button
                                variant="gradient"
                                fullWidth
                                onClick={startVerification}
                                icon={Camera}
                            >
                                Start Liveness Check
                            </Button>
                        </div>
                    )}

                    {(status === 'starting' || status === 'verifying') && (
                        <div>
                            {/* Video Feed */}
                            <div className="relative bg-slate-900 rounded-xl overflow-hidden mb-4">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-64 object-cover mirror"
                                    style={{ transform: 'scaleX(-1)' }}
                                />

                                {/* Challenge Overlay */}
                                {status === 'verifying' && currentChallenge && (
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6">
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-center text-white"
                                        >
                                            <div className="text-4xl mb-2">{currentChallenge.icon}</div>
                                            <div className="font-bold text-lg mb-2">{currentChallenge.instruction}</div>

                                            {/* Progress Bar */}
                                            <div className="w-full bg-white/20 rounded-full h-2 mb-2">
                                                <motion.div
                                                    className="bg-white h-full rounded-full"
                                                    style={{ width: `${(timeRemaining / currentChallenge.duration) * 100}%` }}
                                                />
                                            </div>

                                            {/* Motion Indicator */}
                                            <div className="flex items-center justify-center gap-2 text-sm">
                                                <div className="flex gap-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <div
                                                            key={i}
                                                            className={`w-2 h-8 rounded-full ${i < Math.floor(motionScore / 20)
                                                                ? 'bg-green-400'
                                                                : 'bg-white/20'
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-xs">Motion</span>
                                            </div>
                                        </motion.div>
                                    </div>
                                )}

                                {/* Challenge Status Badge */}
                                {challengeStatus === 'passed' && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute inset-0 flex items-center justify-center bg-green-500/80"
                                    >
                                        <div className="text-center text-white">
                                            <CheckCircle size={64} className="mx-auto mb-2" />
                                            <div className="font-bold text-2xl">Challenge Passed!</div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            {/* Challenge Progress */}
                            <div className="flex justify-center gap-2 mb-4">
                                {challenges.map((_, i) => (
                                    <div
                                        key={i}
                                        className={`w-12 h-2 rounded-full ${i < currentChallengeIndex
                                            ? 'bg-green-500'
                                            : i === currentChallengeIndex
                                                ? 'bg-blue-500'
                                                : 'bg-slate-200'
                                            }`}
                                    />
                                ))}
                            </div>

                            <div className="text-center text-sm text-slate-600">
                                Challenge {currentChallengeIndex + 1} of {challenges.length}
                            </div>
                        </div>
                    )}

                    {status === 'success' && (
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            className="bg-green-50 border-2 border-green-500 rounded-xl p-6 text-center"
                        >
                            <CheckCircle className="text-green-500 mx-auto mb-3" size={40} />
                            <div className="font-bold text-green-700 mb-2">Liveness Verified!</div>
                            <div className="text-sm text-green-600 mb-4">
                                All challenges completed successfully
                            </div>
                            {faceSnapshot && (
                                <img
                                    src={faceSnapshot}
                                    alt="Face snapshot"
                                    className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-green-500"
                                />
                            )}
                        </motion.div>
                    )}

                    {status === 'failed' && (
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            className="bg-red-50 border-2 border-red-500 rounded-xl p-6 text-center"
                        >
                            <XCircle className="text-red-500 mx-auto mb-3" size={40} />
                            <div className="font-bold text-red-700 mb-2">Verification Failed</div>
                            <div className="text-sm text-red-600 mb-4">{error}</div>
                            <Button
                                variant="gradient"
                                fullWidth
                                onClick={() => {
                                    setStatus('idle');
                                    setError(null);
                                    setChallenges([]);
                                    setCurrentChallengeIndex(0);
                                }}
                            >
                                Try Again
                            </Button>
                        </motion.div>
                    )}
                </div>

                {/* Instructions */}
                {status === 'idle' && (
                    <div className="mt-6 bg-purple-50 rounded-xl p-4">
                        <div className="text-sm text-purple-700">
                            <div className="font-semibold mb-2">📋 Instructions:</div>
                            <ul className="space-y-1 text-xs">
                                <li>• Ensure good lighting on your face</li>
                                <li>• Follow each challenge instruction</li>
                                <li>• Complete all 3 challenges to pass</li>
                                <li>• No photos or videos allowed</li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default FaceLivenessVerification;
