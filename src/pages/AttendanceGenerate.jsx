import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode, Clock, MapPin, Users, Calendar, Hash, Copy,
  CheckCircle, AlertCircle, Settings, Shield, Zap,
  Download, RefreshCw, Eye, Trash2, Plus, BookOpen,
  Activity, Target, Timer, Lock, Unlock, Radio
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Card from '../components/shared/GlassCard';

const AttendanceGenerate = () => {
  const { user } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [qrDuration, setQrDuration] = useState(10);
  const [generatedQR, setGeneratedQR] = useState(null);
  const [otp, setOtp] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeQRs, setActiveQRs] = useState([]);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [securityLevel, setSecurityLevel] = useState('high');
  const [requireLocation, setRequireLocation] = useState(true);
  const [requireFace, setRequireFace] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);

  const courses = [
    { id: 'cs101', code: 'CS101', name: 'Data Structures', students: 45, color: 'from-blue-500 to-blue-600' },
    { id: 'cs201', code: 'CS201', name: 'Machine Learning', students: 38, color: 'from-purple-500 to-purple-600' },
    { id: 'cs301', code: 'CS301', name: 'Web Development', students: 52, color: 'from-orange-500 to-orange-600' },
  ];

  useEffect(() => {
    // Simulate some session history
    setSessionHistory([
      {
        id: 1,
        course: 'Data Structures',
        code: 'CS101',
        date: '2026-01-27',
        time: '10:00 AM',
        studentsPresent: 42,
        totalStudents: 45,
        duration: '10 min',
        status: 'completed'
      },
      {
        id: 2,
        course: 'Machine Learning',
        code: 'CS201',
        date: '2026-01-26',
        time: '02:00 PM',
        studentsPresent: 36,
        totalStudents: 38,
        duration: '15 min',
        status: 'completed'
      },
    ]);
  }, []);

  // Timer for active QR
  useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setGeneratedQR(null);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeRemaining]);

  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleGenerateQR = () => {
    if (!selectedCourse) {
      alert('Please select a course first');
      return;
    }

    setIsGenerating(true);

    // Simulate QR generation
    setTimeout(() => {
      const newOTP = generateOTP();
      const sessionId = `${selectedCourse.code}-${Date.now()}`;
      
      const qrData = {
        sessionId: sessionId,
        courseId: selectedCourse.id,
        courseCode: selectedCourse.code,
        courseName: selectedCourse.name,
        facultyId: user?.id,
        facultyName: user?.name,
        otp: newOTP,
        validUntil: Date.now() + (qrDuration * 60 * 1000),
        timestamp: Date.now(),
        securityLevel: securityLevel,
        requireLocation: requireLocation,
        requireFace: requireFace,
        allowedLocation: requireLocation ? {
          latitude: 28.7041,
          longitude: 77.1025,
          radius: 50
        } : null
      };

      setGeneratedQR(qrData);
      setOtp(newOTP);
      setTimeRemaining(qrDuration * 60);
      
      // Add to active QRs
      setActiveQRs([...activeQRs, {
        ...qrData,
        studentsMarked: 0,
        createdAt: new Date().toLocaleString()
      }]);

      setIsGenerating(false);
    }, 1500);
  };

  const copyOTP = () => {
    navigator.clipboard.writeText(otp);
    alert('OTP copied to clipboard!');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-600';
      case 'expired':
        return 'bg-red-100 text-red-600';
      case 'completed':
        return 'bg-blue-100 text-blue-600';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-black text-slate-900 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Generate Attendance QR 📱
          </h1>
          <p className="text-lg text-slate-600">Create secure QR codes for students to mark attendance</p>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                <QrCode size={24} className="text-white" />
              </div>
              <Activity size={20} className="text-blue-600" />
            </div>
            <div className="text-3xl font-black text-slate-900 mb-1">
              {activeQRs.length}
            </div>
            <div className="text-sm font-bold text-slate-600">Active Sessions</div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <Users size={24} className="text-white" />
              </div>
              <CheckCircle size={20} className="text-green-600" />
            </div>
            <div className="text-3xl font-black text-slate-900 mb-1">
              {activeQRs.reduce((sum, qr) => sum + qr.studentsMarked, 0)}
            </div>
            <div className="text-sm font-bold text-slate-600">Students Marked</div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <Shield size={24} className="text-white" />
              </div>
              <Lock size={20} className="text-purple-600" />
            </div>
            <div className="text-3xl font-black text-slate-900 mb-1">100%</div>
            <div className="text-sm font-bold text-slate-600">Security Score</div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                <Calendar size={24} className="text-white" />
              </div>
              <Target size={20} className="text-orange-600" />
            </div>
            <div className="text-3xl font-black text-slate-900 mb-1">
              {sessionHistory.length}
            </div>
            <div className="text-sm font-bold text-slate-600">Total Sessions</div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - QR Generator */}
          <div className="lg:col-span-2 space-y-6">
            {!generatedQR ? (
              /* Configuration Panel */
              <Card className="p-8">
                <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                  <Settings size={24} className="text-blue-600" />
                  Configure Attendance Session
                </h2>

                <div className="space-y-6">
                  {/* Course Selection */}
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-3 block">Select Course</label>
                    <div className="grid grid-cols-1 gap-3">
                      {courses.map((course) => (
                        <motion.button
                          key={course.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedCourse(course)}
                          className={`p-4 rounded-xl border-2 transition-all text-left ${
                            selectedCourse?.id === course.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-slate-200 bg-white hover:border-blue-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-3 mb-1">
                                <span className={`px-3 py-1 bg-gradient-to-r ${course.color} text-white rounded-lg text-xs font-bold`}>
                                  {course.code}
                                </span>
                                <span className="font-black text-slate-900">{course.name}</span>
                              </div>
                              <div className="text-sm text-slate-600 flex items-center gap-2">
                                <Users size={14} />
                                {course.students} students enrolled
                              </div>
                            </div>
                            {selectedCourse?.id === course.id && (
                              <CheckCircle size={24} className="text-blue-600" />
                            )}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Duration Selection */}
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-3 block">
                      QR Code Valid Duration
                    </label>
                    <div className="grid grid-cols-4 gap-3">
                      {[5, 10, 15, 20].map((duration) => (
                        <button
                          key={duration}
                          onClick={() => setQrDuration(duration)}
                          className={`p-4 rounded-xl font-bold transition-all ${
                            qrDuration === duration
                              ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          {duration} min
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Security Settings */}
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-3 block">Security Level</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'low', label: 'Low', icon: Unlock },
                        { value: 'medium', label: 'Medium', icon: Shield },
                        { value: 'high', label: 'High', icon: Lock }
                      ].map((level) => (
                        <button
                          key={level.value}
                          onClick={() => setSecurityLevel(level.value)}
                          className={`p-4 rounded-xl font-bold transition-all flex flex-col items-center gap-2 ${
                            securityLevel === level.value
                              ? 'bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          <level.icon size={24} />
                          {level.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Verification Options */}
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-3 block">Verification Methods</label>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                        <input
                          type="checkbox"
                          checked={requireLocation}
                          onChange={(e) => setRequireLocation(e.target.checked)}
                          className="w-5 h-5 text-blue-600 rounded"
                        />
                        <MapPin size={20} className="text-blue-600" />
                        <div className="flex-1">
                          <div className="font-bold text-slate-900">Location Verification</div>
                          <div className="text-xs text-slate-600">Students must be within campus range</div>
                        </div>
                      </label>
                      
                      <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                        <input
                          type="checkbox"
                          checked={requireFace}
                          onChange={(e) => setRequireFace(e.target.checked)}
                          className="w-5 h-5 text-blue-600 rounded"
                        />
                        <Eye size={20} className="text-purple-600" />
                        <div className="flex-1">
                          <div className="font-bold text-slate-900">Face Recognition</div>
                          <div className="text-xs text-slate-600">Verify student identity with photo</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Generate Button */}
                  <Button
                    variant="primary"
                    fullWidth
                    size="lg"
                    icon={isGenerating ? RefreshCw : QrCode}
                    onClick={handleGenerateQR}
                    disabled={!selectedCourse || isGenerating}
                    className={isGenerating ? 'animate-pulse' : ''}
                  >
                    {isGenerating ? 'Generating...' : 'Generate QR Code'}
                  </Button>
                </div>
              </Card>
            ) : (
              /* Generated QR Display */
              <Card className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                    <Radio size={24} className="text-green-600 animate-pulse" />
                    Active Attendance Session
                  </h2>
                  <button
                    onClick={() => {
                      setGeneratedQR(null);
                      setTimeRemaining(null);
                    }}
                    className="text-red-600 hover:text-red-700 font-bold"
                  >
                    End Session
                  </button>
                </div>

                {/* Timer */}
                <div className="mb-8">
                  <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200">
                    <div className="text-sm font-bold text-slate-600 mb-2">Time Remaining</div>
                    <div className="text-6xl font-black text-green-600 mb-2">
                      {timeRemaining !== null ? formatTime(timeRemaining) : '--:--'}
                    </div>
                    <div className="h-2 bg-green-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-1000"
                        style={{ width: `${((timeRemaining || 0) / (qrDuration * 60)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* QR Code Display */}
                <div className="mb-8">
                  <div className="aspect-square bg-white rounded-2xl border-4 border-slate-200 flex items-center justify-center p-8">
                    <div className="text-center">
                      <div className="w-64 h-64 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4">
                        <QrCode size={160} className="text-white" />
                      </div>
                      <p className="text-sm text-slate-600 font-semibold">
                        Students can scan this QR code to mark attendance
                      </p>
                    </div>
                  </div>
                </div>

                {/* Session Details */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <div className="text-xs font-bold text-slate-500 mb-1">COURSE</div>
                    <div className="font-black text-slate-900">{generatedQR.courseName}</div>
                    <div className="text-sm text-slate-600">{generatedQR.courseCode}</div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-xl">
                    <div className="text-xs font-bold text-slate-500 mb-1">SESSION ID</div>
                    <div className="font-mono text-sm text-slate-900 truncate">{generatedQR.sessionId}</div>
                  </div>
                </div>

                {/* OTP Display */}
                <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200 mb-6">
                  <div className="text-center">
                    <div className="text-sm font-bold text-slate-600 mb-2">One-Time Password</div>
                    <div className="text-5xl font-black text-amber-600 tracking-wider mb-4 font-mono">
                      {otp}
                    </div>
                    <Button variant="secondary" size="sm" icon={Copy} onClick={copyOTP}>
                      Copy OTP
                    </Button>
                    <p className="text-xs text-slate-600 mt-3">
                      Students will need to enter this OTP after scanning
                    </p>
                  </div>
                </div>

                {/* Live Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-slate-50 rounded-xl">
                    <div className="text-2xl font-black text-green-600 mb-1">0</div>
                    <div className="text-xs font-bold text-slate-600">Marked Present</div>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-xl">
                    <div className="text-2xl font-black text-blue-600 mb-1">{selectedCourse?.students}</div>
                    <div className="text-xs font-bold text-slate-600">Total Students</div>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-xl">
                    <div className="text-2xl font-black text-purple-600 mb-1">0%</div>
                    <div className="text-xs font-bold text-slate-600">Attendance Rate</div>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Right Column - Session History */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                <Clock size={24} className="text-orange-600" />
                Recent Sessions
              </h3>
              <div className="space-y-3">
                {sessionHistory.map((session) => (
                  <div key={session.id} className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{session.course}</div>
                        <div className="text-xs text-slate-600">{session.code}</div>
                      </div>
                      <span className={`px-2 py-1 rounded-lg text-xs font-bold ${getStatusColor(session.status)}`}>
                        {session.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar size={12} />
                        {session.date} • {session.time}
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={12} />
                        {session.studentsPresent}/{session.totalStudents} present
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={12} />
                        Duration: {session.duration}
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-200">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-600">Attendance Rate</span>
                        <span className="font-black text-green-600">
                          {Math.round((session.studentsPresent / session.totalStudents) * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="ghost" fullWidth size="sm" className="mt-4">
                View All Sessions
              </Button>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
              <h3 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                <Zap size={24} className="text-blue-600" />
                Quick Tips
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2 text-slate-700">
                  <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Use higher security for important exams</span>
                </div>
                <div className="flex items-start gap-2 text-slate-700">
                  <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Enable location check to prevent proxy attendance</span>
                </div>
                <div className="flex items-start gap-2 text-slate-700">
                  <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Shorter duration reduces window for cheating</span>
                </div>
                <div className="flex items-start gap-2 text-slate-700">
                  <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Share OTP via projector or announcement</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceGenerate;