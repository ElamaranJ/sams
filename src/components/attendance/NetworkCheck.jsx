/**
 * NETWORK CHECK COMPONENT
 * Layer 1: Classroom Wi-Fi Lock
 *
 * Uses public IP + ISP validation via CORS-safe APIs.
 * College: Tata Teleservices (AS45820), IP range 111.93.108-109.xxx
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader, AlertTriangle } from 'lucide-react';
import {
    detectLocalIP, validateClassroomNetwork, getSubnetFromIP,
    getFullNetworkInfo, validateByISP
} from '../../utils/networkDetection';
import Button from '../ui/Button';

// ── College config ──────────────────────────────────────────────────────────
const COLLEGE_SUBNETS = ['111.93.108.xxx', '111.93.109.xxx'];
const COLLEGE_KEYWORDS = ['Tata Teleservices', 'AS45820', 'TTML'];
// ────────────────────────────────────────────────────────────────────────────

const NetworkCheck = ({ allowedSubnets, onSuccess, onFailure }) => {
    const [status, setStatus] = useState('checking');
    const [ipAddress, setIP] = useState(null);
    const [isp, setISP] = useState(null);
    const [subnet, setSubnet] = useState(null);
    const [error, setError] = useState(null);
    const [retrying, setRetrying] = useState(false);

    const check = async () => {
        setStatus('checking');
        setError(null);
        setIP(null);
        setISP(null);

        try {
            const info = await getFullNetworkInfo();
            const ip = info?.query;

            if (!ip) throw new Error('All IP detection APIs failed. Check internet connection.');

            setIP(ip);
            setISP(info?.org || null);
            setSubnet(getSubnetFromIP(ip));

            // Validate by subnet OR ISP name
            const subnetOk = validateClassroomNetwork(ip, COLLEGE_SUBNETS);
            const ispOk = validateByISP(info, COLLEGE_KEYWORDS);

            if (subnetOk || ispOk) {
                setStatus('success');
                onSuccess?.({ ip, isValid: true, isp: info?.org });
            } else {
                setStatus('failed');
                setError(`Not on college Wi-Fi. ISP: ${info?.org || 'Unknown'}`);
                onFailure?.('Wrong network');
            }
        } catch (err) {
            setStatus('failed');
            setError(err.message);
            onFailure?.(err.message);
        }
    };

    useEffect(() => { check(); }, []);

    const retry = () => { setRetrying(true); check().finally(() => setRetrying(false)); };
    const skip = () => onSuccess?.({ ip: ipAddress || 'bypassed', isValid: true, bypassed: true });

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md mx-auto">
            <div className="neomorph rounded-3xl p-8">

                {/* Header */}
                <div className="text-center mb-6">
                    <div className="inline-block mb-4">
                        {status === 'checking' && <Loader size={48} className="text-blue-500 animate-spin" />}
                        {status === 'success' && <CheckCircle size={48} className="text-green-500" />}
                        {status === 'failed' && <XCircle size={48} className="text-red-500" />}
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-1">Network Verification</h2>
                    <p className="text-slate-500 text-sm">Layer 1: Classroom Wi-Fi Lock</p>
                </div>

                <div className="space-y-3">

                    {/* Detected IP info */}
                    {ipAddress && (
                        <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                            <div>
                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Your IP</div>
                                <div className="font-mono font-bold text-slate-900">{ipAddress}</div>
                                {subnet && <div className="text-xs text-slate-400 font-mono">{subnet}</div>}
                            </div>
                            {isp && (
                                <div>
                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ISP</div>
                                    <div className="text-sm font-semibold text-slate-700">{isp}</div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* College network info */}
                    <div className="bg-slate-50 rounded-xl p-4">
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">College Network</div>
                        <div className="font-mono text-sm text-slate-700">• 111.93.108.xxx / 111.93.109.xxx</div>
                        <div className="text-xs text-slate-400 mt-1">Tata Teleservices (AS45820)</div>
                    </div>

                    {/* Checking state */}
                    {status === 'checking' && (
                        <div className="flex items-center justify-center gap-2 text-blue-600 py-4">
                            <Loader className="animate-spin" size={18} />
                            <span className="font-semibold text-sm">Detecting your network...</span>
                        </div>
                    )}

                    {/* Success */}
                    {status === 'success' && (
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                            className="bg-green-50 border-2 border-green-500 rounded-xl p-4 text-center">
                            <CheckCircle className="text-green-500 mx-auto mb-2" size={28} />
                            <div className="font-bold text-green-700">College Wi-Fi Verified! ✅</div>
                            <div className="text-xs text-green-600 mt-1 font-mono">{ipAddress}</div>
                        </motion.div>
                    )}

                    {/* Failed */}
                    {status === 'failed' && (
                        <>
                            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                                className="bg-red-50 border-2 border-red-500 rounded-xl p-4 text-center">
                                <XCircle className="text-red-500 mx-auto mb-2" size={28} />
                                <div className="font-bold text-red-700">Network Check Failed</div>
                                <div className="text-sm text-red-600 mt-1">{error}</div>
                            </motion.div>

                            <Button variant="gradient" fullWidth onClick={retry} loading={retrying}>
                                Retry Network Check
                            </Button>

                            <button onClick={skip}
                                className="w-full py-3 text-sm font-semibold text-purple-600 hover:text-purple-800 border-2 border-dashed border-purple-300 hover:border-purple-500 rounded-xl transition-all">
                                Skip Network Check →
                            </button>

                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                                <div className="flex items-start gap-2">
                                    <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={16} />
                                    <div className="text-xs text-amber-700 space-y-1">
                                        <p className="font-bold">Tips to fix:</p>
                                        <p>• Make sure you're on <strong>college Wi-Fi</strong></p>
                                        <p>• Disable any <strong>VPN</strong> or proxy</p>
                                        <p>• Or click <strong>Skip</strong> to continue</p>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default NetworkCheck;
