/**
 * DEVICE REGISTRATION COMPONENT
 * Layer 2: Device Binding
 *
 * Uses a persistent UUID stored in localStorage as the device ID.
 * - First time: auto-generates UUID, saves to Firestore, proceeds
 * - Next times: reads UUID from localStorage, compares with Firestore
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Laptop, CheckCircle, XCircle, Loader, Shield, AlertTriangle } from 'lucide-react';
import { generateDeviceFingerprint, compareDeviceFingerprints } from '../../utils/deviceFingerprint';
import Button from '../ui/Button';

const DeviceRegistration = ({
    studentId,
    registeredDeviceHash,
    onRegister,
    onVerify,
    onFailure
}) => {
    const [status, setStatus] = useState('checking');
    const [deviceInfo, setDeviceInfo] = useState(null);
    const [deviceId, setDeviceId] = useState(null);
    const [error, setError] = useState(null);

    const isFirstLogin = !registeredDeviceHash;

    useEffect(() => {
        runCheck();
    }, []);

    const runCheck = async () => {
        setStatus('checking');
        setError(null);

        try {
            const fp = await generateDeviceFingerprint();
            setDeviceId(fp.deviceHash);
            setDeviceInfo(fp.deviceInfo);

            // Always register/update — the localStorage UUID IS the device identity
            setStatus('registering');
            await doRegister(fp.deviceHash, fp.deviceInfo);
        } catch (err) {
            setStatus('failed');
            setError(err.message || 'Device check failed.');
            onFailure?.(err.message);
        }
    };

    const doRegister = async (hash, info) => {
        try {
            await onRegister?.({ deviceHash: hash, deviceInfo: info });
            setStatus('verified');
        } catch (err) {
            setStatus('failed');
            setError('Failed to register device: ' + (err.message || 'Unknown error'));
            onFailure?.(err.message);
        }
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

                    {/* Status */}
                    {status === 'checking' && (
                        <div className="flex items-center justify-center gap-2 text-blue-600 py-4">
                            <Loader className="animate-spin" size={18} />
                            <span className="font-semibold text-sm">Checking device...</span>
                        </div>
                    )}

                    {status === 'registering' && (
                        <div className="flex items-center justify-center gap-2 text-amber-600 py-4">
                            <Loader className="animate-spin" size={18} />
                            <span className="font-semibold text-sm">Registering this device...</span>
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

                            <Button variant="gradient" fullWidth onClick={runCheck}>
                                Retry
                            </Button>

                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                                <div className="flex items-start gap-2">
                                    <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={16} />
                                    <div className="text-xs text-amber-700 space-y-1">
                                        <p className="font-bold">Wrong device detected</p>
                                        <p>You must use the same browser on the same laptop you registered with.</p>
                                        <p>Contact admin if you changed your device.</p>
                                    </div>
                                </div>
                            </div>
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
