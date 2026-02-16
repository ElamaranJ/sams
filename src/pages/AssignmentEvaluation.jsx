import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Check, Loader, BookOpen, Send, 
  Download, Eye, CheckCircle, Clock, X, File 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/shared/GlassCard';
import Button from '../components/ui/Button';
import { 
  getFacultyClasses, 
  getClassAssignments, 
  getAssignmentSubmissions, 
  gradeSubmission 
} from '../firebase/database';

const AssignmentEvaluation = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  
  // Tab State: 'pending' vs 'graded'
  const [viewTab, setViewTab] = useState('pending'); 

  // Preview Modal State
  const [previewFile, setPreviewFile] = useState(null);

  const [grades, setGrades] = useState({});
  const [feedback, setFeedback] = useState({});
  const [gradingSubmissionId, setGradingSubmissionId] = useState(null);

  useEffect(() => {
    const fetchClasses = async () => {
      if (!user?.uid) return;
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
        if (result.assignments.length > 0) setSelectedAssignment(result.assignments[0]);
      }
    };
    fetchAssignments();
  }, [selectedClass]);

  const fetchSubmissions = async () => {
    if (!selectedAssignment) return;
    setLoadingSubmissions(true);
    const result = await getAssignmentSubmissions(selectedAssignment.id);
    if (result.success) setSubmissions(result.submissions);
    setLoadingSubmissions(false);
  };

  useEffect(() => { fetchSubmissions(); }, [selectedAssignment]);

  const handleGrade = async (submissionId) => {
    const gradeValue = grades[submissionId];
    if (!gradeValue) { alert('Please enter a grade'); return; }
    setGradingSubmissionId(submissionId);
    const result = await gradeSubmission(submissionId, {
      grade: parseFloat(gradeValue),
      feedback: feedback[submissionId] || '',
      status: 'graded'
    });
    if (result.success) {
      await fetchSubmissions();
      setGradingSubmissionId(null);
    } else {
      alert('Error: ' + result.error);
      setGradingSubmissionId(null);
    }
  };

  const handleDownload = (fileData, fileName) => {
    const link = document.createElement('a');
    link.href = fileData;
    link.download = fileName || 'submission';
    link.click();
  };

  const pendingSubmissions = submissions.filter(s => s.status === 'submitted');
  const gradedSubmissions = submissions.filter(s => s.status === 'graded');

  if (loading) return <div className="p-20 text-center"><Loader className="animate-spin mx-auto" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6 pt-24">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-black text-slate-900 mb-8 text-center">Evaluation Center ✍️</h1>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Card className="p-4">
            <label className="text-xs font-bold text-slate-500 uppercase">Class</label>
            <select value={selectedClass?.id} onChange={e => setSelectedClass(classes.find(c => c.id === e.target.value))} className="w-full bg-transparent font-bold text-lg outline-none cursor-pointer">
              {classes.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
            </select>
          </Card>
          <Card className="p-4">
            <label className="text-xs font-bold text-slate-500 uppercase">Assignment</label>
            <select value={selectedAssignment?.id} onChange={e => setSelectedAssignment(assignments.find(a => a.id === e.target.value))} className="w-full bg-transparent font-bold text-lg outline-none cursor-pointer">
              {assignments.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
            </select>
          </Card>
        </div>

        <div className="flex gap-4 mb-6 border-b-2 border-slate-200">
          <button onClick={() => setViewTab('pending')} className={`pb-3 px-6 font-black transition-all ${viewTab === 'pending' ? 'border-b-4 border-blue-600 text-blue-600' : 'text-slate-400'}`}>
            Pending ({pendingSubmissions.length})
          </button>
          <button onClick={() => setViewTab('graded')} className={`pb-3 px-6 font-black transition-all ${viewTab === 'graded' ? 'border-b-4 border-green-600 text-green-600' : 'text-slate-400'}`}>
            Graded ({gradedSubmissions.length})
          </button>
        </div>

        {loadingSubmissions ? (
          <div className="text-center py-10"><Loader className="animate-spin mx-auto" /></div>
        ) : (
          <div className="grid gap-6">
            {(viewTab === 'pending' ? pendingSubmissions : gradedSubmissions).map(sub => (
              <Card key={sub.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600">{sub.studentName?.charAt(0)}</div>
                    <div>
                      <h3 className="font-black text-slate-900">{sub.studentName}</h3>
                      <p className="text-xs text-slate-500">{sub.studentEmail}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setPreviewFile(sub)} 
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold hover:bg-blue-100 transition-all"
                  >
                    <Eye size={18} /> View File
                  </button>
                </div>

                {viewTab === 'pending' ? (
                  <div className="mt-6 pt-6 border-t border-slate-100 grid md:grid-cols-4 gap-4 items-end">
                    <div className="md:col-span-1">
                      <label className="text-xs font-bold text-slate-500 block mb-1">Grade / {selectedAssignment.totalPoints}</label>
                      <input type="number" value={grades[sub.id] || ''} onChange={e => setGrades({ ...grades, [sub.id]: e.target.value })} className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-500 outline-none font-bold" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs font-bold text-slate-500 block mb-1">Feedback</label>
                      <input type="text" value={feedback[sub.id] || ''} onChange={e => setFeedback({ ...feedback, [sub.id]: e.target.value })} className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-500 outline-none" placeholder="Add feedback..." />
                    </div>
                    <Button variant="primary" fullWidth onClick={() => handleGrade(sub.id)} disabled={gradingSubmissionId === sub.id}>
                      {gradingSubmissionId === sub.id ? 'Saving...' : 'Return Grade'}
                    </Button>
                  </div>
                ) : (
                  <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-100 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-green-600 uppercase">Graded</p>
                      <p className="text-lg font-black text-slate-900">{sub.grade} / {selectedAssignment.totalPoints}</p>
                      {sub.feedback && <p className="text-sm text-slate-600 mt-1 italic">"{sub.feedback}"</p>}
                    </div>
                    <CheckCircle className="text-green-500" size={32} />
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* POP-UP MODAL FOR FILE PREVIEW */}
      <AnimatePresence>
        {previewFile && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setPreviewFile(null)}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><FileText size={20} /></div>
                  <span className="font-bold text-slate-900 truncate max-w-md">{previewFile.fileName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleDownload(previewFile.fileData, previewFile.fileName)}
                    className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2 px-4 shadow-lg"
                  >
                    <Download size={18} /> <span className="text-sm font-bold">Download</span>
                  </button>
                  <button onClick={() => setPreviewFile(null)} className="p-2 hover:bg-slate-200 rounded-xl transition-colors text-slate-500">
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Modal Content - File Display */}
              <div className="flex-1 overflow-auto bg-slate-100 p-6 flex justify-center items-center">
                {previewFile.fileType?.includes('image') ? (
                  <img src={previewFile.fileData} alt="Preview" className="max-w-full h-auto rounded-lg shadow-md" />
                ) : previewFile.fileType === 'application/pdf' ? (
                  <iframe src={previewFile.fileData} className="w-full h-[70vh] rounded-lg" title="PDF Preview" />
                ) : (
                  <div className="text-center p-12 bg-white rounded-2xl border-2 border-dashed border-slate-300">
                    <File size={64} className="text-slate-200 mx-auto mb-4" />
                    <p className="font-bold text-slate-500">Preview not available for this file type.</p>
                    <p className="text-sm text-slate-400 mt-2">Please use the download button above.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AssignmentEvaluation;