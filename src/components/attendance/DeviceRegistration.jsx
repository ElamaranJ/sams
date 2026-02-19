/**
 * DEVICE REGISTRATION COMPONENT — FIXED VERSION
 *
 * Fixes applied:
 * 1. Now actually compares current device UUID against registeredDeviceHash
 *    — if device doesn't match, verification fails with a clear error
 * 2. onRegister is only called on first-time registration (no saved hash)
 * 3. onVerify is called when device matches the saved hash
 * 4. onFailure is properly called when device doesn't match
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Laptop, CheckCircle, XCircle, Loader, Shield, AlertTriangle } from 'lucide-react';
import { generateDeviceFingerprint, compareDeviceFingerprints } from '../../utils/deviceFingerprint';
import Button from '../ui/Button';

const DeviceRegistration = ({
    studentId,
    registeredDeviceHash,   // hash saved in Firestore (null if first time)
    onRegister,             // called on first registration
    onVerify,               // called when device matches
    onFailure               // called when device doesn't match
}) => {
    const [status, setStatus] = useState('checking');
    const [deviceInfo, setDeviceInfo] = useState(null);
    const [deviceId, setDeviceId] = useState(null);
    const [error, setError] = useState(null);
    const [deviceMismatch, setDeviceMismatch] = useState(false);
    const currentFpRef = React.useRef(null); // store fp for re-register

    const isFirstLogin = !registeredDeviceHash;

    const isMounted = React.useRef(true);
    useEffect(() => {
        isMounted.current = true; // reset for React StrictMode double-invoke
        runCheck();
        return () => { isMounted.current = false; };
    }, []);

    const runCheck = async () => {
        console.log("[DeviceReg] runCheck started");
        setStatus('checking');
        setError(null);

        try {
            console.log("[DeviceReg] Generating fingerprint...");
            const fp = await generateDeviceFingerprint();
            console.log("[DeviceReg] Fingerprint generated:", fp.deviceHash);

            if (!isMounted.current) return;
            currentFpRef.current = fp; // save for potential re-register
            setDeviceId(fp.deviceHash);
            setDeviceInfo(fp.deviceInfo);
            setDeviceMismatch(false);

            // Small delay to show the checking state
            console.log("[DeviceReg] Waiting 800ms...");
            await new Promise(r => setTimeout(r, 800));
            if (!isMounted.current) return;

            console.log("[DeviceReg] isFirstLogin:", isFirstLogin);
            if (isFirstLogin) {
                console.log("[DeviceReg] Calling doRegister");
                await doRegister(fp.deviceHash, fp.deviceInfo);
            } else {
                console.log("[DeviceReg] Calling doVerify");
                await doVerify(fp.deviceHash);
            }
        } catch (err) {
            console.error('[DeviceReg] Device check error:', err);
            if (isMounted.current) {
                setStatus('failed');
                setError(err.message || 'Device compatibility check failed.');
                onFailure?.(err.message);
            }
        }
    };

    // First-time registration
    const doRegister = async (hash, info) => {
        try {
            console.log("[DeviceReg] doRegister started");
            if (isMounted.current) setStatus('registering');

            // Wait for parent to process
            if (onRegister) {
                console.log("[DeviceReg] Calling parent onRegister...");
                // Pass isVerified: false so the parent knows this is a NEW registration
                await onRegister({ deviceHash: hash, deviceInfo: info, isVerified: false });
                console.log("[DeviceReg] Parent onRegister finished");
            }

            // Only update if still mounted
            if (isMounted.current) {
                console.log("[DeviceReg] Setting status to verified");
                setStatus('verified');
            }
        } catch (err) {
            console.error("[DeviceReg] Registration error:", err);
            if (isMounted.current) {
                setStatus('failed');
                setError('Failed to bind device. ' + (err.message || ''));
                onFailure?.(err.message);
            }
        }
    };

    const doVerify = async (currentHash) => {
        try {
            console.log("[DeviceReg] doVerify started");
            if (isMounted.current) setStatus('checking');

            // Compare with stored hash
            console.log("[DeviceReg] Comparing fingerprints...");
            const matches = compareDeviceFingerprints(currentHash, registeredDeviceHash);
            console.log("[DeviceReg] Matches:", matches);

            if (!matches) {
                // Device mismatch — show re-register option instead of hard-fail
                if (isMounted.current) {
                    setDeviceMismatch(true);
                    setStatus('failed');
                    setError('This browser is not the one you originally registered with.');
                    onFailure?.('Device mismatch');
                }
                return;
            }

            // Device matched
            if (onVerify) {
                console.log("[DeviceReg] Calling parent onVerify...");
                await onVerify({ deviceHash: currentHash, deviceInfo: null, isVerified: true });
                console.log("[DeviceReg] Parent onVerify finished");
            }

            if (isMounted.current) {
                console.log("[DeviceReg] Setting status to verified");
                setStatus('verified');
            }
        } catch (err) {
            console.error('[DeviceReg] Verification error:', err);
            if (isMounted.current) {
                setStatus('failed');
                setError(err.message);
                onFailure?.(err.message);
            }
        }
    };

    // Re-register: overwrite old device binding with current device
    const handleReregister = async () => {
        const fp = currentFpRef.current;
        if (!fp) return;
        setDeviceMismatch(false);
        await doRegister(fp.deviceHash, fp.deviceInfo);
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md mx-auto">
            <div className="neomorph rounded-3xl p-8">

                {/* Header */}
                <div className="text-center mb-6">
                    <div className="inline-block mb-4">
                        {status === 'checking' && <Loader size={48} className="text-blue-500 animate-spin" />}
                        {status === 'registering' && <Loader size={48} className="text-amber-500 animate-spin" />}
                        {status === 'verified' && <CheckCircle size={48} className="text-green-500" />}
                        {status === 'failed' && <XCircle size={48} className="text-red-500" />}
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-1">Device Verification</h2>
                    <p className="text-slate-500 text-sm">Layer 2: Device Binding</p>
                </div>

                <div className="space-y-3">
                    {/* Device Info */}
                    {deviceInfo && (
                        <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Browser</div>
                                    <div className="font-semibold text-slate-900">{deviceInfo.browser}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">OS</div>
                                    <div className="font-semibold text-slate-900">{deviceInfo.os}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Screen</div>
                                    <div className="font-semibold text-slate-900">{deviceInfo.screenResolution}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Timezone</div>
                                    <div className="font-semibold text-slate-900 text-xs">{deviceInfo.timezone}</div>
                                </div>
                            </div>
                            {deviceId && (
                                <div>
                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Device ID</div>
                                    <div className="font-mono text-xs text-slate-600 break-all bg-white rounded-lg p-2">{deviceId}</div>
                                </div>
                            )}
                        </div>
                    )}

                    {status === 'checking' && (
                        <div className="flex items-center justify-center gap-2 text-blue-600 py-4">
                            <Loader className="animate-spin" size={18} />
                            <span className="font-semibold text-sm">Checking device...</span>
                        </div>
                    )}

                    {status === 'registering' && (
                        <div className="flex items-center justify-center gap-2 text-amber-600 py-4">
                            <Loader className="animate-spin" size={18} />
                            <span className="font-semibold text-sm">
                                {isFirstLogin ? 'Registering this device...' : 'Verifying device...'}
                            </span>
                        </div>
                    )}

                    {status === 'verified' && (
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                            className="bg-green-50 border-2 border-green-500 rounded-xl p-4 text-center">
                            <CheckCircle className="text-green-500 mx-auto mb-2" size={28} />
                            <div className="font-bold text-green-700">
                                {isFirstLogin ? 'Device Registered! ✅' : 'Device Verified! ✅'}
                            </div>
                            <div className="text-sm text-green-600 mt-1">
                                {isFirstLogin ? 'This device is now bound to your account' : 'Using your registered device'}
                            </div>
                        </motion.div>
                    )}

                    {status === 'failed' && (
                        <>
                            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                                className="bg-red-50 border-2 border-red-500 rounded-xl p-4 text-center">
                                <XCircle className="text-red-500 mx-auto mb-2" size={28} />
                                <div className="font-bold text-red-700">Device Check Failed</div>
                                <div className="text-sm text-red-600 mt-1">{error}</div>
                            </motion.div>

                            {deviceMismatch ? (
                                <>
                                    <Button variant="gradient" fullWidth onClick={handleReregister}>
                                        🔁 Re-register This Device
                                    </Button>
                                    <Button variant="outline" fullWidth onClick={runCheck}>
                                        Retry
                                    </Button>
                                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                                        <div className="flex items-start gap-2">
                                            <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={16} />
                                            <div className="text-xs text-amber-700 space-y-1">
                                                <p className="font-bold">Different browser/device detected</p>
                                                <p>Your saved device ID doesn't match. Click <strong>Re-register</strong> to bind this browser as your new device.</p>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Button variant="gradient" fullWidth onClick={runCheck}>
                                        Retry
                                    </Button>
                                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                                        <div className="flex items-start gap-2">
                                            <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={16} />
                                            <div className="text-xs text-amber-700 space-y-1">
                                                <p className="font-bold">Device check error</p>
                                                <p>Something went wrong. Try retrying.</p>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>

                <div className="mt-6 text-center text-xs text-slate-400">
                    🔒 Device ID is stored securely in your browser
                </div>
            </div>
        </motion.div>
    );
};

export default DeviceRegistration;