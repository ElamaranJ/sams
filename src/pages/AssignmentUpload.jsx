import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileText, X, Check, AlertCircle, Clock,
  Award, Loader, BookOpen, Calendar, Send
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/shared/GlassCard';
import Button from '../components/ui/Button';
import { getStudentAssignments, getStudentSubmissions, submitAssignment, autoEnrollNewStudent } from '../firebase/database';

// Max 500 KB — safe for Firestore 1 MB doc limit
const MAX_SIZE_BYTES = 500 * 1024;
const ALLOWED_TYPES = {
  'application/pdf': 'PDF',
  'application/msword': 'DOC',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'image/jpeg': 'JPG',
  'image/png': 'PNG',
  'text/plain': 'TXT',
};

const formatSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const getFileEmoji = (type) => {
  if (type === 'application/pdf') return '📄';
  if (type?.includes('word')) return '📝';
  if (type?.startsWith('image/')) return '🖼️';
  return '📎';
};

const readFileAsBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result); // "data:mime;base64,..."
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const AssignmentUpload = () => {
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [enrolling, setEnrolling] = useState(false);

  const fetchData = async () => {
    if (!user?.uid) return;
    setLoading(true);
    setLoadError('');
    try {
      const [assignRes, subRes] = await Promise.all([
        getStudentAssignments(user.uid),
        getStudentSubmissions(user.uid),
      ]);
      if (assignRes.success) setAssignments(assignRes.assignments);
      else setLoadError('Failed to load assignments: ' + assignRes.error);
      if (subRes.success) setSubmissions(subRes.submissions);
    } catch (err) {
      setLoadError('Unexpected error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [user]);

  const handleForceEnroll = async () => {
    setEnrolling(true);
    await autoEnrollNewStudent(user.uid);
    await fetchData();
    setEnrolling(false);
  };

  const validateAndSet = (file) => {
    setFileError('');
    if (!file) return;
    if (!ALLOWED_TYPES[file.type]) {
      setFileError('Unsupported file type. Please upload PDF, DOC, DOCX, JPG, PNG, or TXT.');
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setFileError('File too large. Max allowed: ' + formatSize(MAX_SIZE_BYTES) + '. Your file: ' + formatSize(file.size));
      return;
    }
    setSelectedFile(file);
  };

  const handleFileInput = (e) => validateAndSet(e.target.files?.[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    validateAndSet(e.dataTransfer.files?.[0]);
  };

  const clearFile = () => {
    setSelectedFile(null);
    setFileError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const openSubmitPanel = (a) => {
    setSelectedAssignment(prev => prev?.id === a.id ? null : a);
    setSubmitError('');
    clearFile();
  };

  const handleSubmit = async (assignment) => {
    if (!selectedFile) { setSubmitError('Please select a file to upload.'); return; }
    setSubmitting(true);
    setSubmitError('');
    try {
      const base64Data = await readFileAsBase64(selectedFile);
      const result = await submitAssignment({
        assignmentId: assignment.id,
        classId: assignment.classId,
        studentId: user.uid,
        studentName: user.name,
        submissionText: null,
        fileName: selectedFile.name,
        fileType: selectedFile.type,
        fileSize: selectedFile.size,
        fileData: base64Data,   // stored in Firestore, no Storage needed
      });
      if (result.success) {
        setSubmitSuccess(true);
        clearFile();
        setSelectedAssignment(null);
        const subRes = await getStudentSubmissions(user.uid);
        if (subRes.success) setSubmissions(subRes.submissions);
        setTimeout(() => setSubmitSuccess(false), 5000);
      } else {
        setSubmitError('Submission failed: ' + result.error);
      }
    } catch (err) {
      setSubmitError('Error reading file: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const hasSubmitted = (id) => submissions.some(s => s.assignmentId === id);
  const getSubmission = (id) => submissions.find(s => s.assignmentId === id);
  const isOverdue = (dueDate) => dueDate && new Date(dueDate) < new Date();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin w-12 h-12 text-blue-600 mx-auto mb-4" />
          <p className="text-lg font-semibold text-slate-700">Loading assignments...</p>
        </div>
      </div>
    );
  }

  const pendingAssignments = assignments.filter(a => !hasSubmitted(a.id) && !isOverdue(a.dueDate));
  const submittedAssignments = assignments.filter(a => hasSubmitted(a.id));
  const overdueAssignments = assignments.filter(a => !hasSubmitted(a.id) && isOverdue(a.dueDate));

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-6 py-24">

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 mb-2">My Assignments 📝</h1>
          <p className="text-lg text-slate-600">Upload your documents and track your progress</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-10">
          {[
            { label: 'Pending',   value: pendingAssignments.length,   color: 'from-orange-500 to-red-500',    icon: Clock },
            { label: 'Submitted', value: submittedAssignments.length, color: 'from-green-500 to-emerald-600', icon: Check },
            { label: 'Overdue',   value: overdueAssignments.length,   color: 'from-red-600 to-red-700',       icon: AlertCircle },
          ].map((stat, i) => (
            <Card key={i} className="p-6">
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-3 shadow-lg`}>
                <stat.icon size={24} className="text-white" />
              </div>
              <div className="text-sm font-bold text-slate-500 mb-1">{stat.label}</div>
              <div className="text-3xl font-black text-slate-900">{stat.value}</div>
            </Card>
          ))}
        </div>

        {submitSuccess && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="p-4 mb-6 bg-green-50 border-2 border-green-200 rounded-xl flex items-center gap-3">
            <Check className="text-green-600" size={24} />
            <div>
              <p className="text-green-700 font-bold">Assignment submitted successfully! 🎉</p>
              <p className="text-green-600 text-sm">Your faculty can now view and download your file.</p>
            </div>
          </motion.div>
        )}

        {loadError && (
          <div className="p-4 mb-6 bg-red-50 border-2 border-red-200 rounded-xl flex items-center gap-3">
            <AlertCircle className="text-red-600 shrink-0" size={20} />
            <p className="text-red-700 font-semibold">{loadError}</p>
          </div>
        )}

        {assignments.length === 0 ? (
          <Card className="p-12 text-center">
            <BookOpen size={56} className="text-slate-300 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-slate-900 mb-2">No Assignments Yet</h3>
            <p className="text-slate-600 mb-6">Assignments will appear here automatically when your faculty creates them.</p>
            <button onClick={handleForceEnroll} disabled={enrolling}
              className="mx-auto flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {enrolling && <Loader className="animate-spin" size={16} />}
              {enrolling ? 'Syncing...' : '🔄 Sync My Enrollments'}
            </button>
            <p className="text-xs text-slate-400 mt-3">Click if your faculty created classes but they aren't showing here.</p>
          </Card>
        ) : (
          <div className="space-y-8">

            {/* PENDING */}
            {pendingAssignments.length > 0 && (
              <section>
                <h2 className="text-2xl font-black text-slate-900 mb-4">Pending ({pendingAssignments.length})</h2>
                <div className="space-y-4">
                  {pendingAssignments.map((a) => (
                    <Card key={a.id} className="overflow-hidden">
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-xs font-bold bg-orange-100 text-orange-700 px-3 py-1 rounded-full">PENDING</span>
                              <span className="text-xs text-slate-500">{a.classCode || a.className}</span>
                            </div>
                            <h3 className="text-xl font-black text-slate-900 mb-1">{a.title}</h3>
                            <p className="text-slate-600 text-sm mb-3">{a.description}</p>
                            <div className="flex items-center gap-4 text-sm text-slate-500">
                              <span className="flex items-center gap-1"><Calendar size={14} /> Due: {a.dueDate ? new Date(a.dueDate).toLocaleString() : 'TBA'}</span>
                              <span className="flex items-center gap-1"><Award size={14} /> {a.totalPoints} points</span>
                            </div>
                          </div>
                          <Button variant="primary" size="sm" onClick={() => openSubmitPanel(a)}>
                            {selectedAssignment?.id === a.id ? 'Cancel' : 'Submit'}
                          </Button>
                        </div>

                        <AnimatePresence>
                          {selectedAssignment?.id === a.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="border-t-2 border-slate-100 pt-5"
                            >
                              {a.instructions && (
                                <div className="mb-5 p-4 bg-blue-50 rounded-xl border border-blue-100">
                                  <p className="text-sm font-bold text-blue-800 mb-1">📋 Instructions:</p>
                                  <p className="text-sm text-blue-700">{a.instructions}</p>
                                </div>
                              )}

                              <p className="text-xs text-slate-400 mb-3 font-medium">
                                Accepted: PDF, DOC, DOCX, JPG, PNG, TXT &nbsp;·&nbsp; Max size: {formatSize(MAX_SIZE_BYTES)}
                              </p>

                              {/* Drop zone */}
                              {!selectedFile ? (
                                <div
                                  onClick={() => fileInputRef.current?.click()}
                                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                  onDragLeave={() => setDragOver(false)}
                                  onDrop={handleDrop}
                                  className={`cursor-pointer border-2 border-dashed rounded-2xl p-10 text-center transition-all
                                    ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50'}`}
                                >
                                  <Upload size={40} className={`mx-auto mb-3 ${dragOver ? 'text-blue-500' : 'text-slate-400'}`} />
                                  <p className="font-bold text-slate-700 mb-1">
                                    {dragOver ? 'Drop it here!' : 'Click to browse or drag & drop your file'}
                                  </p>
                                  <p className="text-sm text-slate-400">Your document will be visible to faculty for download</p>
                                  <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                                    onChange={handleFileInput}
                                    className="hidden"
                                  />
                                </div>
                              ) : (
                                /* File preview */
                                <div className="flex items-center gap-4 p-4 bg-slate-100 rounded-2xl border-2 border-slate-200">
                                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm shrink-0">
                                    {getFileEmoji(selectedFile.type)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-bold text-slate-900 truncate">{selectedFile.name}</p>
                                    <p className="text-sm text-slate-500">
                                      {ALLOWED_TYPES[selectedFile.type]} &nbsp;·&nbsp; {formatSize(selectedFile.size)}
                                    </p>
                                  </div>
                                  <button onClick={clearFile}
                                    className="w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center text-red-600 transition-colors shrink-0">
                                    <X size={16} />
                                  </button>
                                </div>
                              )}

                              {(fileError || submitError) && (
                                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                                  <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                                  <p className="text-sm text-red-700 font-semibold">{fileError || submitError}</p>
                                </div>
                              )}

                              <div className="mt-4">
                                <Button
                                  variant="primary"
                                  onClick={() => handleSubmit(a)}
                                  disabled={submitting || !selectedFile || !!fileError}
                                  icon={submitting ? Loader : Send}
                                >
                                  {submitting ? 'Uploading & Submitting...' : 'Submit Assignment'}
                                </Button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* SUBMITTED */}
            {submittedAssignments.length > 0 && (
              <section>
                <h2 className="text-2xl font-black text-slate-900 mb-4">Submitted ({submittedAssignments.length})</h2>
                <div className="space-y-4">
                  {submittedAssignments.map((a) => {
                    const sub = getSubmission(a.id);
                    return (
                      <Card key={a.id} className="p-6 bg-green-50 border-green-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-xs font-bold bg-green-200 text-green-800 px-3 py-1 rounded-full">SUBMITTED</span>
                              {sub?.status === 'graded' && <span className="text-xs font-bold bg-blue-200 text-blue-800 px-3 py-1 rounded-full">GRADED</span>}
                            </div>
                            <h3 className="text-xl font-black text-slate-900 mb-1">{a.title}</h3>
                            <p className="text-sm text-slate-600 mb-1">{a.className}</p>
                            {sub && <p className="text-xs text-slate-500">Submitted: {new Date(sub.submittedAt).toLocaleString()}</p>}
                            {sub?.fileName && (
                              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-green-200 text-sm text-slate-700">
                                <span>{getFileEmoji(sub.fileType)}</span>
                                <span className="font-medium truncate max-w-xs">{sub.fileName}</span>
                                {sub.fileSize && <span className="text-slate-400 text-xs">({formatSize(sub.fileSize)})</span>}
                              </div>
                            )}
                          </div>
                          {sub?.grade !== null && sub?.grade !== undefined && (
                            <div className="text-center ml-4">
                              <div className="text-3xl font-black text-green-700">{sub.grade}</div>
                              <div className="text-xs text-slate-500">/{a.totalPoints}</div>
                            </div>
                          )}
                        </div>
                        {sub?.feedback && (
                          <div className="mt-4 p-3 bg-white rounded-xl border border-green-200">
                            <p className="text-sm font-bold text-slate-700 mb-1">Faculty Feedback:</p>
                            <p className="text-sm text-slate-600">{sub.feedback}</p>
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </section>
            )}

            {/* OVERDUE */}
            {overdueAssignments.length > 0 && (
              <section>
                <h2 className="text-2xl font-black text-red-700 mb-4">Overdue ({overdueAssignments.length})</h2>
                <div className="space-y-4">
                  {overdueAssignments.map((a) => (
                    <Card key={a.id} className="p-6 bg-red-50 border-red-200">
                      <span className="text-xs font-bold bg-red-200 text-red-800 px-3 py-1 rounded-full">OVERDUE</span>
                      <h3 className="text-xl font-black text-slate-900 mt-2 mb-1">{a.title}</h3>
                      <p className="text-sm text-red-600">Was due: {a.dueDate ? new Date(a.dueDate).toLocaleString() : 'Unknown'}</p>
                    </Card>
                  ))}
                </div>
              </section>
            )}

          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentUpload;