/**
 * FACULTY QR GENERATOR COMPONENT
 * 
 * Purpose: Faculty dashboard component to generate rotating QR codes
 * QR refreshes every 10 seconds with encrypted session data
 * 
 * Features:
 * - Start/stop attendance session
 * - Auto-rotating QR code (10s interval)
 * - Live attendance monitoring
 * - Session configuration
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, Play, Square, Users, Clock, CheckCircle, XCircle, Settings } from 'lucide-react';
import { generateQRPayload, startQRRotation } from '../../utils/qrGenerator';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { collection, addDoc, query, where, onSnapshot } from 'firebase/firestore';

const QRGenerator = () => {
    const { user } = useAuth();
    const [sessionActive, setSessionActive] = useState(false);
    const [qrData, setQrData] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState(10);
    const [attendanceCount, setAttendanceCount] = useState(0);
    const [sessionId, setSessionId] = useState(null);
    const [sessionConfig, setSessionConfig] = useState({
        subjectId: 'CS101',
        classroomId: 'CS-LAB-1',
        subjectName: 'Data Structures',
        section: 'A'
    });

    const stopRotationRef = useRef(null);
    const timerRef = useRef(null);

    const qrSecretKey = 'your-secret-key-here'; // Should be from environment variable

    // Start attendance session
    const startSession = async () => {
        try {
            // Create session in Firestore
            const sessionDoc = await addDoc(collection(db, 'attendanceSessions'), {
                facultyId: user.uid,
                facultyName: user.name,
                subjectId: sessionConfig.subjectId,
                subjectName: sessionConfig.subjectName,
                classroomId: sessionConfig.classroomId,
                section: sessionConfig.section,
                startTime: new Date(),
                endTime: null,
                isActive: true,
                qrSecret: qrSecretKey,
                createdAt: new Date()
            });

            const newSessionId = sessionDoc.id;
            setSessionId(newSessionId);

            // Start QR rotation
            const classData = {
                ...sessionConfig,
                facultyId: user.uid,
                sessionId: newSessionId
            };

            stopRotationRef.current = startQRRotation(classData, qrSecretKey, (qr) => {
                setQrData(qr);
                setTimeRemaining(10);
            });

            // Start countdown timer
            startCountdown();

            setSessionActive(true);
            setAttendanceCount(0);

            // Listen to attendance records
            listenToAttendance(newSessionId);

        } catch (error) {
            console.error('Failed to start session:', error);
        }
    };

    // Stop attendance session
    const stopSession = () => {
        if (stopRotationRef.current) {
            stopRotationRef.current();
        }
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        setSessionActive(false);
        setQrData(null);
        setSessionId(null);

        // Update session in Firestore
        // updateDoc(doc(db, 'attendanceSessions', sessionId), {
        //   endTime: new Date(),
        //   isActive: false
        // });
    };

    // Countdown timer
    const startCountdown = () => {
        timerRef.current = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    return 10;
                }
                return prev - 1;
            });
        }, 1000);
    };

    // Listen to attendance records
    const listenToAttendance = (sessionId) => {
        const q = query(
            collection(db, 'attendanceRecords'),
            where('sessionId', '==', sessionId)
        );

        onSnapshot(q, (snapshot) => {
            setAttendanceCount(snapshot.size);
        });
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (stopRotationRef.current) {
                stopRotationRef.current();
            }
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl font-black text-slate-900 mb-3">
                        QR Attendance Generator
                    </h1>
                    <p className="text-slate-600">
                        Generate rotating QR codes for secure attendance
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Left: QR Display */}
                    <div>
                        <div className="neomorph rounded-3xl p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-black text-slate-900">QR Code</h2>
                                <div className={`px-4 py-2 rounded-full text-sm font-bold ${sessionActive
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-slate-100 text-slate-500'
                                    }`}>
                                    {sessionActive ? '🟢 Active' : '⚫ Inactive'}
                                </div>
                            </div>

                            {/* QR Display Area */}
                            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-4 mb-6">
                                <div className="bg-white rounded-xl p-8 aspect-square flex items-center justify-center">
                                    <AnimatePresence mode="wait">
                                        {sessionActive && qrData ? (
                                            <motion.div
                                                key={qrData.encrypted}
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.8 }}
                                                transition={{ duration: 0.3 }}
                                                className="text-center w-full"
                                            >
                                                <img
                                                    src={qrData.qrImageUrl}
                                                    alt="Attendance QR"
                                                    className="w-full h-full object-contain"
                                                />
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="text-center"
                                            >
                                                <QrCode size={80} className="text-slate-300 mx-auto mb-4" />
                                                <div className="text-slate-400 font-semibold">
                                                    {sessionActive ? 'Generating QR...' : 'Start session to generate QR'}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Timer */}
                            {sessionActive && (
                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-slate-600">Refreshing in:</span>
                                        <span className="text-2xl font-black text-purple-600">{timeRemaining}s</span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-2">
                                        <motion.div
                                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full"
                                            style={{ width: `${(timeRemaining / 10) * 100}%` }}
                                            transition={{ duration: 0.1 }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Controls */}
                            <div className="space-y-3">
                                {!sessionActive ? (
                                    <Button
                                        variant="gradient"
                                        fullWidth
                                        size="lg"
                                        icon={Play}
                                        onClick={startSession}
                                    >
                                        Start Attendance Session
                                    </Button>
                                ) : (
                                    <Button
                                        variant="danger"
                                        fullWidth
                                        size="lg"
                                        icon={Square}
                                        onClick={stopSession}
                                    >
                                        Stop Session
                                    </Button>
                                )}
                            </div>

                            {/* Session Info */}
                            {sessionActive && (
                                <div className="mt-6 bg-blue-50 rounded-xl p-4">
                                    <div className="text-sm text-blue-700">
                                        <div className="font-semibold mb-2">📋 Session Info:</div>
                                        <div className="space-y-1 text-xs">
                                            <div>Subject: {sessionConfig.subjectName}</div>
                                            <div>Classroom: {sessionConfig.classroomId}</div>
                                            <div>Section: {sessionConfig.section}</div>
                                            <div>QR Rotation: Every 10 seconds</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Session Config & Stats */}
                    <div className="space-y-6">
                        {/* Session Configuration */}
                        <div className="neomorph rounded-3xl p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <Settings className="text-purple-500" size={24} />
                                <h2 className="text-2xl font-black text-slate-900">Session Config</h2>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-semibold text-slate-700 mb-2 block">
                                        Subject
                                    </label>
                                    <select
                                        value={sessionConfig.subjectId}
                                        onChange={(e) => setSessionConfig(prev => ({
                                            ...prev,
                                            subjectId: e.target.value,
                                            subjectName: e.target.options[e.target.selectedIndex].text
                                        }))}
                                        disabled={sessionActive}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none disabled:opacity-50"
                                    >
                                        <option value="CS101">Data Structures</option>
                                        <option value="CS102">Algorithms</option>
                                        <option value="CS103">Database Systems</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-sm font-semibold text-slate-700 mb-2 block">
                                        Classroom
                                    </label>
                                    <select
                                        value={sessionConfig.classroomId}
                                        onChange={(e) => setSessionConfig(prev => ({ ...prev, classroomId: e.target.value }))}
                                        disabled={sessionActive}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none disabled:opacity-50"
                                    >
                                        <option value="CS-LAB-1">CS Lab 1</option>
                                        <option value="CS-LAB-2">CS Lab 2</option>
                                        <option value="ROOM-301">Room 301</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-sm font-semibold text-slate-700 mb-2 block">
                                        Section
                                    </label>
                                    <select
                                        value={sessionConfig.section}
                                        onChange={(e) => setSessionConfig(prev => ({ ...prev, section: e.target.value }))}
                                        disabled={sessionActive}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none disabled:opacity-50"
                                    >
                                        <option value="A">Section A</option>
                                        <option value="B">Section B</option>
                                        <option value="C">Section C</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Live Stats */}
                        <div className="neomorph rounded-3xl p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <Users className="text-green-500" size={24} />
                                <h2 className="text-2xl font-black text-slate-900">Live Stats</h2>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
                                    <div className="text-4xl font-black mb-2">{attendanceCount}</div>
                                    <div className="text-sm opacity-90">Present</div>
                                </div>

                                <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-6 text-white">
                                    <div className="text-4xl font-black mb-2">
                                        {sessionActive ? <Clock className="animate-pulse" size={40} /> : '0'}
                                    </div>
                                    <div className="text-sm opacity-90">Active Session</div>
                                </div>
                            </div>

                            {/* Recent Attendance */}
                            {sessionActive && (
                                <div className="mt-6">
                                    <div className="text-sm font-semibold text-slate-700 mb-3">Recent Check-ins:</div>
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {[...Array(attendanceCount)].map((_, i) => (
                                            <div key={i} className="flex items-center gap-3 bg-slate-50 rounded-lg p-3">
                                                <CheckCircle className="text-green-500" size={16} />
                                                <div className="flex-1">
                                                    <div className="font-semibold text-sm">Student {i + 1}</div>
                                                    <div className="text-xs text-slate-500">Just now</div>
                                                </div>
                                            </div>
                                        ))}
                                        {attendanceCount === 0 && (
                                            <div className="text-center text-slate-400 py-8 text-sm">
                                                Waiting for students to mark attendance...
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QRGenerator;
