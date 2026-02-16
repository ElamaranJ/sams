import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileText, X, Check, AlertCircle, Clock,
  Award, Loader, BookOpen, Calendar, ChevronDown, Send
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/shared/GlassCard';
import Button from '../components/ui/Button';
import { getStudentAssignments, getStudentSubmissions, submitAssignment, autoEnrollNewStudent } from '../firebase/database';

const AssignmentUpload = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitText, setSubmitText] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [enrolling, setEnrolling] = useState(false);

  const fetchData = async () => {
      if (!user?.uid) {
        console.warn('AssignmentUpload: No user uid yet');
        return;
      }
      setLoading(true);
      setLoadError('');
      console.log('=== LOADING ASSIGNMENTS FOR STUDENT ===');
      console.log('Student UID:', user.uid);
      try {
        const [assignRes, subRes] = await Promise.all([
          getStudentAssignments(user.uid),
          getStudentSubmissions(user.uid)
        ]);
        console.log('Assignment result:', assignRes);
        console.log('Submissions result:', subRes);
        if (assignRes.success) {
          console.log('Assignments count:', assignRes.assignments.length);
          setAssignments(assignRes.assignments);
        } else {
          console.error('Failed to load assignments:', assignRes.error);
          setLoadError('Failed to load assignments: ' + assignRes.error);
        }
        if (subRes.success) setSubmissions(subRes.submissions);
      } catch (err) {
        console.error('Error loading assignments:', err);
        setLoadError('Unexpected error: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleForceEnroll = async () => {
    setEnrolling(true);
    console.log('Force enrolling student:', user.uid);
    const result = await autoEnrollNewStudent(user.uid);
    console.log('Enroll result:', result);
    await fetchData();
    setEnrolling(false);
  };

  const hasSubmitted = (assignmentId) => submissions.some(s => s.assignmentId === assignmentId);

  const getSubmission = (assignmentId) => submissions.find(s => s.assignmentId === assignmentId);

  const isOverdue = (dueDate) => dueDate && new Date(dueDate) < new Date();

  const handleSubmit = async (assignment) => {
    if (!submitText.trim()) { setSubmitError('Please write your answer or submission text.'); return; }
    setSubmitting(true);
    setSubmitError('');

    const result = await submitAssignment({
      assignmentId: assignment.id,
      classId: assignment.classId,
      studentId: user.uid,
      studentName: user.name,
      submissionText: submitText,
      fileName: null
    });

    if (result.success) {
      setSubmitSuccess(true);
      setSubmitText('');
      setSelectedAssignment(null);
      // Refresh submissions
      const subRes = await getStudentSubmissions(user.uid);
      if (subRes.success) setSubmissions(subRes.submissions);
      setTimeout(() => setSubmitSuccess(false), 4000);
    } else {
      setSubmitError('Submission failed: ' + result.error);
    }
    setSubmitting(false);
  };

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
          <p className="text-lg text-slate-600">Submit your assignments and track your progress</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-10">
          {[
            { label: 'Pending', value: pendingAssignments.length, color: 'from-orange-500 to-red-500', icon: Clock },
            { label: 'Submitted', value: submittedAssignments.length, color: 'from-green-500 to-emerald-600', icon: Check },
            { label: 'Overdue', value: overdueAssignments.length, color: 'from-red-600 to-red-700', icon: AlertCircle }
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
            <p className="text-green-700 font-bold">Assignment submitted successfully! 🎉</p>
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
            <p className="text-slate-600 mb-6">
              Assignments will appear here automatically when your faculty creates them.
            </p>
            <button
              onClick={handleForceEnroll}
              disabled={enrolling}
              className="mx-auto flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {enrolling ? <Loader className="animate-spin" size={16} /> : null}
              {enrolling ? 'Syncing...' : '🔄 Sync My Enrollments'}
            </button>
            <p className="text-xs text-slate-400 mt-3">
              Click this if your faculty already created classes/assignments but they aren't showing here.
            </p>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Pending Assignments */}
            {pendingAssignments.length > 0 && (
              <div>
                <h2 className="text-2xl font-black text-slate-900 mb-4">Pending ({pendingAssignments.length})</h2>
                <div className="space-y-4">
                  {pendingAssignments.map((a, i) => (
                    <Card key={i} className="overflow-hidden">
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
                          <Button variant="primary" size="sm" onClick={() => setSelectedAssignment(selectedAssignment?.id === a.id ? null : a)}>
                            {selectedAssignment?.id === a.id ? 'Cancel' : 'Submit'}
                          </Button>
                        </div>

                        {/* Submission Form */}
                        <AnimatePresence>
                          {selectedAssignment?.id === a.id && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                              className="border-t-2 border-slate-100 pt-4">
                              {a.instructions && (
                                <div className="mb-4 p-4 bg-blue-50 rounded-xl">
                                  <p className="text-sm font-bold text-blue-800 mb-1">Instructions:</p>
                                  <p className="text-sm text-blue-700">{a.instructions}</p>
                                </div>
                              )}
                              <label className="text-sm font-bold text-slate-700 mb-2 block">Your Answer / Submission</label>
                              <textarea
                                value={submitText}
                                onChange={e => setSubmitText(e.target.value)}
                                placeholder="Type your answer or describe your submission here..."
                                rows={5}
                                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 mb-3"
                              />
                              {submitError && <p className="text-red-600 text-sm mb-3 font-semibold">{submitError}</p>}
                              <Button variant="primary" onClick={() => handleSubmit(a)} disabled={submitting} icon={Send}>
                                {submitting ? 'Submitting...' : 'Submit Assignment'}
                              </Button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Submitted Assignments */}
            {submittedAssignments.length > 0 && (
              <div>
                <h2 className="text-2xl font-black text-slate-900 mb-4">Submitted ({submittedAssignments.length})</h2>
                <div className="space-y-4">
                  {submittedAssignments.map((a, i) => {
                    const sub = getSubmission(a.id);
                    return (
                      <Card key={i} className="p-6 bg-green-50 border-green-200">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-xs font-bold bg-green-200 text-green-800 px-3 py-1 rounded-full">SUBMITTED</span>
                              {sub?.status === 'graded' && <span className="text-xs font-bold bg-blue-200 text-blue-800 px-3 py-1 rounded-full">GRADED</span>}
                            </div>
                            <h3 className="text-xl font-black text-slate-900 mb-1">{a.title}</h3>
                            <p className="text-sm text-slate-600">{a.className}</p>
                            {sub && <p className="text-xs text-slate-500 mt-1">Submitted: {new Date(sub.submittedAt).toLocaleString()}</p>}
                          </div>
                          {sub?.grade !== null && sub?.grade !== undefined && (
                            <div className="text-center">
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
              </div>
            )}

            {/* Overdue */}
            {overdueAssignments.length > 0 && (
              <div>
                <h2 className="text-2xl font-black text-red-700 mb-4">Overdue ({overdueAssignments.length})</h2>
                <div className="space-y-4">
                  {overdueAssignments.map((a, i) => (
                    <Card key={i} className="p-6 bg-red-50 border-red-200">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-bold bg-red-200 text-red-800 px-3 py-1 rounded-full">OVERDUE</span>
                      </div>
                      <h3 className="text-xl font-black text-slate-900 mb-1">{a.title}</h3>
                      <p className="text-sm text-red-600">Was due: {a.dueDate ? new Date(a.dueDate).toLocaleString() : 'Unknown'}</p>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentUpload;