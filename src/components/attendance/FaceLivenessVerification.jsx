/**
 * FACE LIVENESS VERIFICATION — REWRITTEN
 *
 * Key fix: the RAF motion loop now ONLY reads refs, never React state.
 * React state is only read/written in event handlers and setup functions.
 *
 * How it works:
 * - Student must perform 3 random actions (blink, turn, smile, nod)
 * - Motion is measured by pixel diff between consecutive video frames
 * - Each challenge needs avgMotion > threshold within 5 seconds
 * - On success, moves to next challenge. On timeout, fails.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Camera, CheckCircle, XCircle, Loader, Eye, Smile, ArrowLeft, ArrowRight, ArrowDown } from 'lucide-react';
import Button from '../ui/Button';

// ── Challenge definitions ──────────────────────────────────────────────────────
const CHALLENGES = [
    { type: 'blink', label: '👁️ Blink your eyes twice', icon: '👁️', threshold: 5, duration: 5000 },
    { type: 'turnLeft', label: '⬅️ Turn your head to the left', icon: '⬅️', threshold: 10, duration: 5000 },
    { type: 'turnRight', label: '➡️ Turn your head to the right', icon: '➡️', threshold: 10, duration: 5000 },
    { type: 'smile', label: '😊 Smile at the camera', icon: '😊', threshold: 4, duration: 5000 },
    { type: 'nod', label: '⬇️ Nod your head down then up', icon: '⬇️', threshold: 8, duration: 5000 },
];

function pickChallenges(n = 3) {
    return [...CHALLENGES].sort(() => Math.random() - 0.5).slice(0, n);
}

// ── Motion score between two frames ──────────────────────────────────────────
function motionScore(prev, curr, len) {
    if (!prev || !curr || prev.length !== curr.length) return 0;
    let diff = 0;
    for (let i = 0; i < len; i += 4) diff += Math.abs(curr[i + 1] - prev[i + 1]);
    return Math.min(100, (diff / (len / 4 * 255)) * 100 * 6);
}

// ── Component ──────────────────────────────────────────────────────────────────
const FaceLivenessVerification = ({ onSuccess, onFailure }) => {
    // UI state only — never read inside RAF loop
    const [phase, setPhase] = useState('idle');  // idle | starting | challenge | success | failed
    const [challengeIdx, setChallengeIdx] = useState(0);
    const [timeLeft, setTimeLeft] = useState(5000);
    const [motion, setMotion] = useState(0);
    const [challengePass, setChallengePass] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [snapshot, setSnapshot] = useState(null);
    const [challenges, setChallenges] = useState([]);

    // Refs for the loop (never stale)
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const rafRef = useRef(null);
    const loopActiveRef = useRef(false);
    const prevFrameRef = useRef(null);
    const motionHistoryRef = useRef([]);
    const challengeStartRef = useRef(0);
    const challengeIdxRef = useRef(0);   // mirrors challengeIdx but always current
    const challengeListRef = useRef([]); // mirrors challenges but always current
    const streamRef = useRef(null);

    useEffect(() => { return stopCamera; }, []);

    // Auto-start liveness when component mounts (no button click needed)
    useEffect(() => {
        const timer = setTimeout(() => beginVerification(), 500);
        return () => clearTimeout(timer);
    }, []);

    // ── Camera helpers ──────────────────────────────────────────────────────────
    const stopCamera = () => {
        loopActiveRef.current = false;
        if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
        if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
        if (videoRef.current) videoRef.current.srcObject = null;
    };

    // ── RAF loop — reads ONLY refs ──────────────────────────────────────────────
    const rafLoop = useCallback(() => {
        if (!loopActiveRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas || video.readyState < 2) {
            rafRef.current = requestAnimationFrame(rafLoop);
            return;
        }

        const W = 160, H = 120;
        canvas.width = W; canvas.height = H;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(video, 0, 0, W, H);
        const frame = ctx.getImageData(0, 0, W, H);
        const curr = frame.data;
        const score = motionScore(prevFrameRef.current, curr, curr.length);
        prevFrameRef.current = new Uint8ClampedArray(curr);

        motionHistoryRef.current.push(score);
        if (motionHistoryRef.current.length > 60) motionHistoryRef.current.shift();

        // Update UI state (safe to call from RAF)
        setMotion(Math.round(score));

        const elapsed = Date.now() - challengeStartRef.current;
        const challenge = challengeListRef.current[challengeIdxRef.current];
        const remaining = (challenge?.duration || 5000) - elapsed;
        setTimeLeft(Math.max(0, remaining));

        // Check completion
        const recent = motionHistoryRef.current.slice(-15);
        const avg = recent.length ? recent.reduce((a, b) => a + b, 0) / recent.length : 0;
        const threshold = challenge?.threshold || 5;
        const passed = motionHistoryRef.current.length >= 8 && avg > threshold;

        if (passed) {
            loopActiveRef.current = false;
            handleChallengeResult(true);
            return;
        }

        if (remaining <= 0) {
            loopActiveRef.current = false;
            handleChallengeResult(false);
            return;
        }

        rafRef.current = requestAnimationFrame(rafLoop);
    }, []); // NO deps — uses only refs

    // ── Challenge result handler (called from RAF, outside React) ────────────
    const handleChallengeResult = (passed) => {
        if (!passed) {
            setChallengePass(false);
            setTimeout(() => {
                stopCamera();
                setPhase('failed');
                setErrorMsg('Liveness check failed — please try again.');
                onFailure?.('timeout');
            }, 600);
            return;
        }

        setChallengePass(true);
        const next = challengeIdxRef.current + 1;
        const total = challengeListRef.current.length;

        setTimeout(() => {
            setChallengePass(false);
            if (next < total) {
                challengeIdxRef.current = next;
                setChallengeIdx(next);
                startChallenge(next);
            } else {
                // All done—capture snapshot
                const snap = captureSnapshot();
                setSnapshot(snap);
                stopCamera();
                setPhase('success');
                onSuccess?.({
                    challenges: challengeListRef.current.map(c => c.type),
                    snapshot: snap,
                    ts: Date.now()
                });
            }
        }, 900);
    };

    const captureSnapshot = () => {
        try {
            const v = videoRef.current;
            const c = document.createElement('canvas');
            c.width = v.videoWidth; c.height = v.videoHeight;
            c.getContext('2d').drawImage(v, 0, 0);
            return c.toDataURL('image/jpeg', 0.7);
        } catch { return null; }
    };

    // ── Start a specific challenge ─────────────────────────────────────────────
    const startChallenge = (idx) => {
        motionHistoryRef.current = [];
        prevFrameRef.current = null;
        challengeStartRef.current = Date.now();
        loopActiveRef.current = true;
        setTimeLeft(5000);
        setMotion(0);
        rafRef.current = requestAnimationFrame(rafLoop);
    };

    // ── Main start ─────────────────────────────────────────────────────────────
    const beginVerification = async () => {
        setPhase('starting');
        setErrorMsg('');
        setChallengeIdx(0);
        challengeIdxRef.current = 0;

        const list = pickChallenges(3);
        setChallenges(list);
        challengeListRef.current = list;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }
            });
            streamRef.current = stream;

            await new Promise(r => setTimeout(r, 200)); // wait for video element
            if (!videoRef.current) throw new Error('Camera not ready');
            videoRef.current.srcObject = stream;
            await videoRef.current.play().catch(() => { });

            await new Promise(r => setTimeout(r, 800)); // let camera stabilize
            setPhase('challenge');
            startChallenge(0);
        } catch (err) {
            setPhase('failed');
            setErrorMsg('Camera access denied. Allow camera permissions and try again.');
            onFailure?.(err.message);
        }
    };

    const restart = () => {
        stopCamera();
        setPhase('idle');
        setErrorMsg('');
        setChallengeIdx(0);
        setChallenges([]);
    };

    // ── Current challenge data ────────────────────────────────────────────────
    const currentChallenge = challenges[challengeIdx];
    const motionBars = Math.min(5, Math.floor(motion / 8));

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md mx-auto">
            <div className="neomorph rounded-3xl p-8">
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="mb-3">
                        {phase === 'idle' && <Camera size={48} className="text-purple-500 mx-auto" />}
                        {phase === 'starting' && <Loader size={48} className="text-blue-500 mx-auto animate-spin" />}
                        {phase === 'challenge' && currentChallenge && (
                            <span className="text-5xl">{currentChallenge.icon}</span>
                        )}
                        {phase === 'success' && <CheckCircle size={48} className="text-green-500 mx-auto" />}
                        {phase === 'failed' && <XCircle size={48} className="text-red-500 mx-auto" />}
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-1">Face Liveness Check</h2>
                    <p className="text-slate-500 text-sm">Layer 4: Anti-Spoofing Verification</p>
                </div>

                {/* Idle */}
                {phase === 'idle' && (
                    <div>
                        <div className="bg-slate-50 rounded-xl p-6 text-center mb-5">
                            <Camera size={48} className="text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-600 text-sm mb-1">You'll be asked to do 3 simple actions</p>
                            <p className="text-slate-400 text-xs">Examples: Blink · Turn head · Smile · Nod</p>
                        </div>
                        <Button variant="gradient" fullWidth onClick={beginVerification} icon={Camera}>
                            Start Liveness Check
                        </Button>
                        <div className="mt-4 bg-purple-50 rounded-xl p-4 text-xs text-purple-700 space-y-1">
                            <div>• Ensure good lighting on your face</div>
                            <div>• Follow each instruction promptly</div>
                            <div>• 5 seconds per challenge</div>
                        </div>
                    </div>
                )}

                {/* Starting */}
                {phase === 'starting' && (
                    <div className="text-center py-8">
                        <Loader className="animate-spin text-blue-500 mx-auto mb-3" size={40} />
                        <p className="text-slate-600 font-semibold">Starting camera…</p>
                    </div>
                )}

                {/* Challenge */}
                {phase === 'challenge' && (
                    <div>
                        {/* Video + overlay */}
                        <div className="relative bg-slate-900 rounded-xl overflow-hidden mb-4">
                            <video ref={videoRef} autoPlay playsInline muted
                                className="w-full h-56 object-cover"
                                style={{ transform: 'scaleX(-1)' }} />
                            <canvas ref={canvasRef} className="hidden" />

                            {/* Instruction overlay */}
                            {currentChallenge && !challengePass && (
                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-4 text-center text-white">
                                    <div className="text-2xl mb-1">{currentChallenge.label}</div>
                                    {/* Timer bar */}
                                    <div className="w-full bg-white/20 rounded-full h-1.5 mb-2">
                                        <div className="bg-white h-full rounded-full transition-all"
                                            style={{ width: `${(timeLeft / (currentChallenge.duration)) * 100}%` }} />
                                    </div>
                                    {/* Motion bars */}
                                    <div className="flex items-center justify-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <div key={i} className={`w-2 h-5 rounded-full ${i < motionBars ? 'bg-green-400' : 'bg-white/20'}`} />
                                        ))}
                                        <span className="ml-2 text-xs opacity-70">motion</span>
                                    </div>
                                </div>
                            )}

                            {/* Pass flash */}
                            {challengePass && (
                                <div className="absolute inset-0 bg-green-500/80 flex items-center justify-center">
                                    <div className="text-center text-white">
                                        <CheckCircle size={56} className="mx-auto mb-2" />
                                        <div className="font-bold text-xl">✓ Done!</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Progress dots */}
                        <div className="flex justify-center gap-3 mb-3">
                            {challenges.map((_, i) => (
                                <div key={i} className={`w-10 h-2 rounded-full ${i < challengeIdx ? 'bg-green-500' : i === challengeIdx ? 'bg-blue-500' : 'bg-slate-200'}`} />
                            ))}
                        </div>
                        <p className="text-center text-sm text-slate-500">Challenge {challengeIdx + 1} of {challenges.length}</p>
                    </div>
                )}

                {/* Success */}
                {phase === 'success' && (
                    <div className="bg-green-50 border-2 border-green-500 rounded-xl p-6 text-center">
                        <CheckCircle className="text-green-500 mx-auto mb-3" size={40} />
                        <div className="font-bold text-green-700 text-lg">Liveness Verified! 🎉</div>
                        <div className="text-sm text-green-600 mt-1">All 3 challenges completed</div>
                        {snapshot && (
                            <img src={snapshot} alt="snapshot"
                                className="w-24 h-24 rounded-full mx-auto mt-4 object-cover border-4 border-green-400" />
                        )}
                    </div>
                )}

                {/* Failed */}
                {phase === 'failed' && (
                    <div className="space-y-4">
                        <div className="bg-red-50 border-2 border-red-500 rounded-xl p-5 text-center">
                            <XCircle className="text-red-500 mx-auto mb-2" size={36} />
                            <div className="font-bold text-red-700">Verification Failed</div>
                            <div className="text-sm text-red-600 mt-1">{errorMsg}</div>
                        </div>
                        <Button variant="gradient" fullWidth onClick={restart}>Try Again</Button>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default FaceLivenessVerification;
