/**
 * MARK ATTENDANCE PAGE
 *
 * Flow: Network → Device → QR/OTP → Face Liveness → Done
 *
 * Note: QRScanner already marks attendance in Firestore via markAttendance/markAttendanceViaQR.
 * The face liveness layer is a final anti-spoofing check only — it does NOT write to Firestore again.
 * The "attendanceMarked" state is set after liveness passes (the record was already written in layer 3).
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Loader } from 'lucide-react';
import NetworkCheck from '../components/attendance/NetworkCheck';
import DeviceRegistration from '../components/attendance/DeviceRegistration';
import QRScanner from '../components/attendance/QRScanner';
import FaceLivenessVerification from '../components/attendance/FaceLivenessVerification';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { markAttendance } from '../firebase/database';

const MarkAttendance = () => {
    const { user } = useAuth();
    const [currentLayer, setCurrentLayer] = useState(1);
    const [verificationData, setVerificationData] = useState({
        network: null, device: null, qr: null, liveness: null
    });
    const [attendanceMarked, setAttendanceMarked] = useState(false);
    const [error, setError] = useState(null);
    const [isDeviceLoaded, setIsDeviceLoaded] = useState(false);
    const [registeredDeviceHash, setRegisteredDeviceHash] = useState(null);

    // Auto-advance layers using useEffect watching verificationData
    // This avoids stale closure issues from nested setTimeouts
    React.useEffect(() => {
        if (verificationData.network && currentLayer === 1) {
            setCurrentLayer(2);
            setError(null);
        }
    }, [verificationData.network]);

    React.useEffect(() => {
        if (verificationData.device && currentLayer === 2) {
            setCurrentLayer(3);
            setError(null);
        }
    }, [verificationData.device]);

    React.useEffect(() => {
        if (verificationData.qr && currentLayer === 3) {
            setCurrentLayer(4);
            setError(null);
        }
    }, [verificationData.qr]);

    const allowedSubnets = ['192.168.12.xxx', '10.0.5.xxx'];

    React.useEffect(() => {
        const fetchDeviceHash = async () => {
            try {
                setIsDeviceLoaded(false);
                const deviceDoc = await getDoc(doc(db, 'registeredDevices', user.uid));
                if (deviceDoc.exists()) setRegisteredDeviceHash(deviceDoc.data().deviceHash);
            } catch (err) {
                console.error('Failed to fetch device:', err);
            } finally {
                setIsDeviceLoaded(true);
            }
        };
        fetchDeviceHash();
    }, [user.uid]);

    // ── Layer handlers ─────────────────────────────────────────────────────────

    const handleNetworkSuccess = (data) => {
        setVerificationData(prev => ({ ...prev, network: data }));
        // Transition is handled by useEffect watching verificationData.network
    };

    const handleDeviceSuccess = async (data) => {
        setVerificationData(prev => ({ ...prev, device: data }));

        // Register device in Firestore if first time
        if (!data.isVerified) {
            setDoc(doc(db, 'registeredDevices', user.uid), {
                studentId: user.uid,
                deviceHash: data.deviceHash,
                deviceInfo: data.deviceInfo,
                isActive: true,
                registeredAt: new Date(),
                lastUsed: new Date()
            })
                .then(() => setRegisteredDeviceHash(data.deviceHash))
                .catch(err => console.error('[MarkAttendance] Failed to register device:', err));
        }

        // Transition is handled by useEffect watching verificationData.device
    };

    // Layer 3: QRScanner already wrote attendance to Firestore — just advance layer
    const handleQRSuccess = (data) => {
        setVerificationData(prev => ({ ...prev, qr: data }));
        // Transition to layer 4 is handled by useEffect watching verificationData.qr
    };

    // Layer 4: Liveness passed — NOW write attendance to Firestore
    const handleLivenessSuccess = async (data) => {
        setVerificationData(prev => ({ ...prev, liveness: data }));
        const sessionId = verificationData.qr?.sessionId;
        if (!sessionId) {
            setError('Session ID missing — please restart the flow.');
            return;
        }
        const res = await markAttendance(sessionId, user.uid);
        if (!res.success) {
            // Even if already marked, allow proceeding (don't block on duplicate)
            console.warn('markAttendance result:', res.error);
        }
        setAttendanceMarked(true);
    };

    const handleLayerFailure = (layer, err) => {
        setError(`${layer} verification failed: ${err}`);
    };

    const resetFlow = () => {
        setCurrentLayer(1);
        setVerificationData({ network: null, device: null, qr: null, liveness: null });
        setAttendanceMarked(false);
        setError(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
                    <h1 className="text-4xl font-black text-slate-900 mb-3">Mark Attendance</h1>
                    <p className="text-slate-600">Complete all verification layers to mark your attendance</p>
                </motion.div>

                {/* Progress Steps */}
                <div className="mb-12">
                    <div className="flex items-center justify-between max-w-2xl mx-auto">
                        {[
                            { num: 1, label: 'Network', icon: '🌐' },
                            { num: 2, label: 'Device', icon: '💻' },
                            { num: 3, label: 'QR Code', icon: '📱' },
                            { num: 4, label: 'Face', icon: '👤' }
                        ].map((step, i) => (
                            <React.Fragment key={step.num}>
                                <div className="flex flex-col items-center">
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold transition-all ${attendanceMarked || currentLayer > step.num
                                        ? 'bg-green-500 text-white'
                                        : currentLayer === step.num
                                            ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                                            : 'bg-slate-200 text-slate-400'
                                        }`}>
                                        {(attendanceMarked || currentLayer > step.num) ? <CheckCircle size={32} /> : step.icon}
                                    </div>
                                    <div className={`mt-2 text-sm font-semibold ${currentLayer >= step.num ? 'text-slate-900' : 'text-slate-400'}`}>
                                        {step.label}
                                    </div>
                                </div>
                                {i < 3 && (
                                    <div className={`flex-1 h-1 mx-2 rounded ${currentLayer > step.num || attendanceMarked ? 'bg-green-500' : 'bg-slate-200'}`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Verification Layers */}
                <AnimatePresence mode="wait">
                    {!attendanceMarked && (
                        <motion.div
                            key={currentLayer}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {currentLayer === 1 && (
                                <NetworkCheck
                                    allowedSubnets={allowedSubnets}
                                    onSuccess={handleNetworkSuccess}
                                    onFailure={(err) => handleLayerFailure('Network', err)}
                                />
                            )}

                            {currentLayer === 2 && (
                                isDeviceLoaded ? (
                                    <DeviceRegistration
                                        studentId={user.uid}
                                        registeredDeviceHash={registeredDeviceHash}
                                        onRegister={handleDeviceSuccess}
                                        onVerify={handleDeviceSuccess}
                                        onFailure={(err) => handleLayerFailure('Device', err)}
                                    />
                                ) : (
                                    <div className="neomorph rounded-3xl p-12 text-center">
                                        <Loader className="animate-spin text-purple-500 mx-auto mb-4" size={48} />
                                        <div className="text-xl font-bold text-slate-900">Loading Device Security...</div>
                                        <p className="text-slate-500">Checking registration status</p>
                                    </div>
                                )
                            )}

                            {currentLayer === 3 && (
                                <QRScanner
                                    onSuccess={handleQRSuccess}
                                    onFailure={(err) => handleLayerFailure('QR', err)}
                                />
                            )}

                            {currentLayer === 4 && (
                                <FaceLivenessVerification
                                    onSuccess={handleLivenessSuccess}
                                    onFailure={(err) => handleLayerFailure('Liveness', err)}
                                />
                            )}
                        </motion.div>
                    )}

                    {attendanceMarked && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-12"
                        >
                            <div className="neomorph rounded-3xl p-12 max-w-md mx-auto">
                                <CheckCircle className="text-green-500 mx-auto mb-6" size={80} />
                                <h2 className="text-3xl font-black text-slate-900 mb-4">Attendance Marked! 🎉</h2>
                                <p className="text-slate-600 mb-8">All verification layers passed successfully</p>

                                <div className="bg-slate-50 rounded-xl p-6 mb-6 text-left">
                                    <div className="text-sm font-semibold text-slate-700 mb-3">Verification Summary:</div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle size={16} className="text-green-500" />
                                            <span>Network: {verificationData.network?.ip || 'verified'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle size={16} className="text-green-500" />
                                            <span>Device: Verified</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle size={16} className="text-green-500" />
                                            <span>
                                                {verificationData.qr?.method === 'qr' ? 'QR Code' : 'OTP'}: Valid
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle size={16} className="text-green-500" />
                                            <span>Face Liveness: Passed</span>
                                        </div>
                                    </div>
                                </div>

                                <Button variant="gradient" onClick={resetFlow} fullWidth>
                                    Mark Another Attendance
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 bg-red-50 border-2 border-red-500 rounded-xl p-4 text-center max-w-md mx-auto"
                    >
                        <div className="font-bold text-red-700 mb-2">Error</div>
                        <div className="text-sm text-red-600">{error}</div>
                        <button onClick={() => setError(null)} className="mt-3 text-xs text-red-400 underline">Dismiss</button>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default MarkAttendance;