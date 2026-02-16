import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Users, Check, Loader, Award, BookOpen, ChevronDown, Send, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/shared/GlassCard';
import Button from '../components/ui/Button';
import { getFacultyClasses, getClassAssignments, getAssignmentSubmissions, gradeSubmission } from '../firebase/database';

const AssignmentEvaluation = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [grading, setGrading] = useState({});
  const [grades, setGrades] = useState({});
  const [feedbacks, setFeedbacks] = useState({});
  const [gradingSubmissionId, setGradingSubmissionId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchClasses = async () => {
      if (!user?.uid) return;
      setLoading(true);
      const result = await getFacultyClasses(user.uid);
      if (result.success) {
        setClasses(result.classes);
        if (result.classes.length > 0) setSelectedClass(result.classes[0]);
      }
      setLoading(false);
    };
    fetchClasses();
  }, [user]);

  useEffect(() => {
    const fetchAssignments = async () => {
      if (!selectedClass) return;
      const result = await getClassAssignments(selectedClass.id);
      if (result.success) {
        setAssignments(result.assignments);
        setSelectedAssignment(result.assignments.length > 0 ? result.assignments[0] : null);
      }
    };
    fetchAssignments();
  }, [selectedClass]);

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!selectedAssignment) { setSubmissions([]); return; }
      setLoadingSubmissions(true);
      const result = await getAssignmentSubmissions(selectedAssignment.id);
      if (result.success) setSubmissions(result.submissions);
      setLoadingSubmissions(false);
    };
    fetchSubmissions();
  }, [selectedAssignment]);

  const handleGrade = async (submissionId) => {
    const grade = grades[submissionId];
    const feedback = feedbacks[submissionId] || '';
    if (grade === undefined || grade === '') { alert('Please enter a grade'); return; }
    const numGrade = parseFloat(grade);
    if (isNaN(numGrade) || numGrade < 0) { alert('Please enter a valid grade'); return; }

    setGradingSubmissionId(submissionId);
    const result = await gradeSubmission(submissionId, numGrade, feedback);
    if (result.success) {
      setSubmissions(prev => prev.map(s => s.id === submissionId ? { ...s, grade: numGrade, feedback, status: 'graded' } : s));
      setSuccessMsg('Grade saved!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } else {
      alert('Error grading: ' + result.error);
    }
    setGradingSubmissionId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin w-12 h-12 text-blue-600 mx-auto mb-4" />
          <p className="text-lg font-semibold text-slate-700">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 mb-2">Evaluate Assignments 📋</h1>
          <p className="text-lg text-slate-600">Grade student submissions and provide feedback</p>
        </motion.div>

        {successMsg && (
          <div className="p-4 mb-6 bg-green-50 border-2 border-green-200 rounded-xl flex items-center gap-3">
            <Check className="text-green-600" size={20} />
            <p className="text-green-700 font-bold">{successMsg}</p>
          </div>
        )}

        {classes.length === 0 ? (
          <Card className="p-12 text-center">
            <BookOpen size={56} className="text-slate-300 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-slate-900 mb-2">No Classes Found</h3>
            <p className="text-slate-600">Create a class first and then add assignments to evaluate.</p>
          </Card>
        ) : (
          <>
            {/* Filters */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div>
                <label className="text-sm font-bold text-slate-700 mb-2 block">Select Class</label>
                <select
                  value={selectedClass?.id || ''}
                  onChange={e => setSelectedClass(classes.find(c => c.id === e.target.value))}
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl font-medium focus:outline-none focus:border-blue-500"
                >
                  {classes.map(cls => <option key={cls.id} value={cls.id}>{cls.code} - {cls.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-2 block">Select Assignment</label>
                <select
                  value={selectedAssignment?.id || ''}
                  onChange={e => setSelectedAssignment(assignments.find(a => a.id === e.target.value))}
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl font-medium focus:outline-none focus:border-blue-500"
                  disabled={assignments.length === 0}
                >
                  {assignments.length === 0 ? <option>No assignments yet</option> :
                    assignments.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
                </select>
              </div>
            </div>

            {/* Submissions */}
            {loadingSubmissions ? (
              <div className="text-center py-12"><Loader className="animate-spin w-10 h-10 text-blue-600 mx-auto" /></div>
            ) : submissions.length === 0 ? (
              <Card className="p-12 text-center">
                <FileText size={48} className="text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">No Submissions Yet</h3>
                <p className="text-slate-600">Students haven't submitted anything for this assignment yet.</p>
              </Card>
            ) : (
              <div>
                <h2 className="text-2xl font-black text-slate-900 mb-4">
                  Submissions ({submissions.length})
                  <span className="ml-3 text-sm font-semibold text-slate-500">
                    {submissions.filter(s => s.status === 'graded').length} graded · {submissions.filter(s => s.status === 'submitted').length} pending
                  </span>
                </h2>
                <div className="space-y-4">
                  {submissions.map((sub, i) => (
                    <Card key={i} className={`p-6 ${sub.status === 'graded' ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-lg font-black text-slate-900">{sub.studentName || 'Student'}</h3>
                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${sub.status === 'graded' ? 'bg-green-200 text-green-800' : 'bg-orange-100 text-orange-700'}`}>
                              {sub.status === 'graded' ? 'GRADED' : 'PENDING'}
                            </span>
                          </div>
                          <p className="text-sm text-slate-500">Submitted: {new Date(sub.submittedAt).toLocaleString()}</p>
                        </div>
                        {sub.grade !== null && sub.grade !== undefined && (
                          <div className="text-right">
                            <div className="text-3xl font-black text-green-700">{sub.grade}</div>
                            <div className="text-xs text-slate-500">/{selectedAssignment?.totalPoints || 100}</div>
                          </div>
                        )}
                      </div>

                      {sub.submissionText && (
                        <div className="mb-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                          <p className="text-sm font-bold text-slate-700 mb-1">Submission:</p>
                          <p className="text-sm text-slate-700 whitespace-pre-wrap">{sub.submissionText}</p>
                        </div>
                      )}

                      {sub.status !== 'graded' && (
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div>
                            <label className="text-sm font-bold text-slate-700 mb-2 block">
                              Grade (out of {selectedAssignment?.totalPoints || 100})
                            </label>
                            <input type="number" min="0" max={selectedAssignment?.totalPoints || 100}
                              value={grades[sub.id] || ''}
                              onChange={e => setGrades(prev => ({ ...prev, [sub.id]: e.target.value }))}
                              placeholder="Enter grade"
                              className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl font-medium focus:outline-none focus:border-blue-500" />
                          </div>
                          <div>
                            <label className="text-sm font-bold text-slate-700 mb-2 block">Feedback (optional)</label>
                            <input type="text"
                              value={feedbacks[sub.id] || ''}
                              onChange={e => setFeedbacks(prev => ({ ...prev, [sub.id]: e.target.value }))}
                              placeholder="Add feedback..."
                              className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl font-medium focus:outline-none focus:border-blue-500" />
                          </div>
                          <div className="col-span-2">
                            <Button variant="primary" onClick={() => handleGrade(sub.id)} disabled={gradingSubmissionId === sub.id} icon={Send}>
                              {gradingSubmissionId === sub.id ? 'Saving...' : 'Save Grade'}
                            </Button>
                          </div>
                        </div>
                      )}

                      {sub.status === 'graded' && sub.feedback && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-xl">
                          <p className="text-sm font-bold text-blue-700 mb-1">Feedback given:</p>
                          <p className="text-sm text-blue-600">{sub.feedback}</p>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AssignmentEvaluation;