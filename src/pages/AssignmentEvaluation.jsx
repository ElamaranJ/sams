import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Download, Eye, Edit, MessageSquare, Award,
  CheckCircle, XCircle, Clock, AlertCircle, TrendingUp,
  Users, BarChart3, Filter, Search, Calendar, Star,
  Zap, Brain, Target, ThumbsUp, ThumbsDown, Send,
  BookOpen, Hash, Sparkles, ChevronDown, ChevronUp,
  FileCode, Image, File, Trash2, Save, X, Plus,
  Clipboard, ArrowRight, Activity, PieChart, Mail
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Card from '../components/shared/GlassCard';

const AssignmentEvaluation = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('pending'); // pending, graded, analytics
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showGradingModal, setShowGradingModal] = useState(false);
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [rubricScores, setRubricScores] = useState({});
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');

  // Sample data
  const courses = [
    { id: 'all', name: 'All Courses', code: 'ALL' },
    { id: 'cs101', name: 'Data Structures', code: 'CS101' },
    { id: 'cs201', name: 'Machine Learning', code: 'CS201' },
    { id: 'cs301', name: 'Web Development', code: 'CS301' },
  ];

  const [assignments, setAssignments] = useState([
    {
      id: 1,
      title: 'Binary Tree Implementation',
      courseId: 'cs101',
      courseName: 'Data Structures',
      courseCode: 'CS101',
      dueDate: '2026-02-05',
      totalSubmissions: 45,
      gradedSubmissions: 20,
      pendingSubmissions: 25,
      avgGrade: 85,
      maxPoints: 100,
      createdAt: '2026-01-15',
      status: 'active'
    },
    {
      id: 2,
      title: 'Neural Network Research Paper',
      courseId: 'cs201',
      courseName: 'Machine Learning',
      courseCode: 'CS201',
      dueDate: '2026-02-10',
      totalSubmissions: 38,
      gradedSubmissions: 38,
      pendingSubmissions: 0,
      avgGrade: 88,
      maxPoints: 100,
      createdAt: '2026-01-10',
      status: 'closed'
    },
    {
      id: 3,
      title: 'React Dashboard Project',
      courseId: 'cs301',
      courseName: 'Web Development',
      courseCode: 'CS301',
      dueDate: '2026-01-30',
      totalSubmissions: 52,
      gradedSubmissions: 45,
      pendingSubmissions: 7,
      avgGrade: 82,
      maxPoints: 100,
      createdAt: '2026-01-08',
      status: 'active'
    },
  ]);

  const [submissions, setSubmissions] = useState([
    {
      id: 1,
      assignmentId: 1,
      studentId: 'STU001',
      studentName: 'Sarah Johnson',
      studentEmail: 'sarah.j@university.edu',
      studentRollNo: 'CS2023001',
      submittedAt: '2026-02-04 14:30',
      status: 'pending',
      files: [
        { name: 'binary_tree.py', size: '12 KB', type: 'python' },
        { name: 'test_cases.py', size: '8 KB', type: 'python' }
      ],
      plagiarismScore: 98,
      lateSubmission: false,
      attemptNumber: 1,
      grade: null,
      feedback: null,
      rubricScores: null
    },
    {
      id: 2,
      assignmentId: 1,
      studentId: 'STU002',
      studentName: 'Mike Chen',
      studentEmail: 'mike.c@university.edu',
      studentRollNo: 'CS2023002',
      submittedAt: '2026-02-03 10:15',
      status: 'pending',
      files: [
        { name: 'bst_implementation.java', size: '15 KB', type: 'java' }
      ],
      plagiarismScore: 95,
      lateSubmission: false,
      attemptNumber: 2,
      grade: null,
      feedback: null,
      rubricScores: null
    },
    {
      id: 3,
      assignmentId: 1,
      studentId: 'STU003',
      studentName: 'Emma Davis',
      studentEmail: 'emma.d@university.edu',
      studentRollNo: 'CS2023003',
      submittedAt: '2026-02-05 16:45',
      status: 'graded',
      files: [
        { name: 'tree_structure.cpp', size: '18 KB', type: 'cpp' }
      ],
      plagiarismScore: 100,
      lateSubmission: true,
      attemptNumber: 1,
      grade: 'A',
      gradePoints: 92,
      feedback: 'Excellent implementation with proper error handling. Well documented code.',
      rubricScores: {
        implementation: 45,
        documentation: 23,
        testing: 24
      },
      gradedAt: '2026-02-06 09:30',
      gradedBy: user?.name
    },
  ]);

  const rubricTemplate = {
    implementation: { max: 50, label: 'Implementation Quality' },
    documentation: { max: 25, label: 'Documentation & Comments' },
    testing: { max: 25, label: 'Testing & Edge Cases' }
  };

  useEffect(() => {
    if (selectedSubmission) {
      setRubricScores(selectedSubmission.rubricScores || {});
      setGrade(selectedSubmission.grade || '');
      setFeedback(selectedSubmission.feedback || '');
    }
  }, [selectedSubmission]);

  const runAIAnalysis = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      setAiAnalysis({
        overallScore: 88,
        strengths: [
          'Clean and readable code structure',
          'Proper use of object-oriented principles',
          'Comprehensive error handling',
          'Well-documented functions and classes'
        ],
        weaknesses: [
          'Missing edge case for empty tree',
          'Could optimize space complexity',
          'Lacks input validation in some methods'
        ],
        suggestions: [
          'Add unit tests for boundary conditions',
          'Consider implementing iterative versions for better performance',
          'Add more inline comments for complex algorithms'
        ],
        codeQuality: 90,
        documentation: 85,
        complexity: 'Moderate',
        estimatedGrade: 'A-',
        plagiarismRisk: 'Low',
        similarityReport: {
          internet: 2,
          previousSubmissions: 0,
          peerSubmissions: 1
        }
      });
      setIsAnalyzing(false);
    }, 2000);
  };

  const handleGrade = async () => {
    if (!selectedSubmission) return;

    const totalRubricScore = Object.values(rubricScores).reduce((sum, score) => sum + (parseFloat(score) || 0), 0);
    const gradePoints = totalRubricScore;
    
    let letterGrade = 'F';
    if (gradePoints >= 90) letterGrade = 'A';
    else if (gradePoints >= 80) letterGrade = 'B';
    else if (gradePoints >= 70) letterGrade = 'C';
    else if (gradePoints >= 60) letterGrade = 'D';

    const updatedSubmission = {
      ...selectedSubmission,
      status: 'graded',
      grade: letterGrade,
      gradePoints: gradePoints,
      feedback: feedback,
      rubricScores: rubricScores,
      gradedAt: new Date().toISOString(),
      gradedBy: user?.name
    };

    // Update submissions
    setSubmissions(submissions.map(sub => 
      sub.id === selectedSubmission.id ? updatedSubmission : sub
    ));

    // Update assignment stats
    const assignment = assignments.find(a => a.id === selectedSubmission.assignmentId);
    if (assignment) {
      const updatedAssignment = {
        ...assignment,
        gradedSubmissions: assignment.gradedSubmissions + 1,
        pendingSubmissions: assignment.pendingSubmissions - 1
      };
      setAssignments(assignments.map(a => 
        a.id === assignment.id ? updatedAssignment : a
      ));
    }

    setShowGradingModal(false);
    setSelectedSubmission(null);
    alert('Grade submitted successfully! Student will be notified via email.');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-600';
      case 'graded':
        return 'bg-green-100 text-green-600';
      case 'reviewing':
        return 'bg-blue-100 text-blue-600';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  const getGradeColor = (grade) => {
    if (grade === 'A' || grade === 'A+' || grade === 'A-') return 'text-green-600';
    if (grade === 'B' || grade === 'B+' || grade === 'B-') return 'text-blue-600';
    if (grade === 'C' || grade === 'C+' || grade === 'C-') return 'text-orange-600';
    return 'text-red-600';
  };

  const getFileIcon = (type) => {
    if (type.includes('python') || type.includes('java') || type.includes('cpp')) return FileCode;
    if (type.includes('image')) return Image;
    return FileText;
  };

  const filteredAssignments = assignments.filter(assignment => {
    if (selectedCourse !== 'all' && assignment.courseId !== selectedCourse) return false;
    if (activeTab === 'pending' && assignment.pendingSubmissions === 0) return false;
    if (activeTab === 'graded' && assignment.gradedSubmissions === 0) return false;
    return true;
  });

  const filteredSubmissions = submissions.filter(submission => {
    if (!selectedAssignment) return false;
    if (submission.assignmentId !== selectedAssignment.id) return false;
    if (activeTab === 'pending' && submission.status !== 'pending') return false;
    if (activeTab === 'graded' && submission.status !== 'graded') return false;
    if (searchQuery && !submission.studentName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

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
            Assignment Evaluation 📝
          </h1>
          <p className="text-lg text-slate-600">Grade submissions and provide feedback to students</p>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                <Clock size={24} className="text-white" />
              </div>
              <span className="text-sm font-bold text-orange-600">URGENT</span>
            </div>
            <div className="text-3xl font-black text-slate-900 mb-1">
              {submissions.filter(s => s.status === 'pending').length}
            </div>
            <div className="text-sm font-bold text-slate-600">Pending Review</div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <CheckCircle size={24} className="text-white" />
              </div>
              <TrendingUp size={20} className="text-green-600" />
            </div>
            <div className="text-3xl font-black text-slate-900 mb-1">
              {submissions.filter(s => s.status === 'graded').length}
            </div>
            <div className="text-sm font-bold text-slate-600">Graded</div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                <BarChart3 size={24} className="text-white" />
              </div>
              <Star size={20} className="text-blue-600" fill="currentColor" />
            </div>
            <div className="text-3xl font-black text-slate-900 mb-1">87%</div>
            <div className="text-sm font-bold text-slate-600">Avg Score</div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <Users size={24} className="text-white" />
              </div>
              <Activity size={20} className="text-purple-600" />
            </div>
            <div className="text-3xl font-black text-slate-900 mb-1">135</div>
            <div className="text-sm font-bold text-slate-600">Total Students</div>
          </Card>
        </div>

        {/* Tabs and Filters */}
        <div className="bg-white rounded-2xl border-2 border-slate-100 shadow-xl mb-8">
          <div className="p-6 border-b-2 border-slate-100">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('pending')}
                  className={`px-6 py-3 rounded-xl font-bold transition-all ${
                    activeTab === 'pending'
                      ? 'bg-slate-900 text-white shadow-lg'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Pending ({submissions.filter(s => s.status === 'pending').length})
                </button>
                <button
                  onClick={() => setActiveTab('graded')}
                  className={`px-6 py-3 rounded-xl font-bold transition-all ${
                    activeTab === 'graded'
                      ? 'bg-slate-900 text-white shadow-lg'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Graded ({submissions.filter(s => s.status === 'graded').length})
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`px-6 py-3 rounded-xl font-bold transition-all ${
                    activeTab === 'analytics'
                      ? 'bg-slate-900 text-white shadow-lg'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Analytics
                </button>
              </div>

              <div className="flex gap-2">
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="px-4 py-3 border-2 border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-blue-500"
                >
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>

                <div className="relative">
                  <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-blue-500 w-64"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          {activeTab !== 'analytics' ? (
            <div className="p-6">
              {!selectedAssignment ? (
                /* Assignment List */
                <div className="space-y-4">
                  {filteredAssignments.length > 0 ? (
                    filteredAssignments.map((assignment) => (
                      <motion.div
                        key={assignment.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border-2 border-slate-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                        onClick={() => setSelectedAssignment(assignment)}
                      >
                        <div className="p-6 bg-slate-50">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-xl font-black text-slate-900">{assignment.title}</h3>
                                <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg text-xs font-bold">
                                  {assignment.courseCode}
                                </span>
                              </div>
                              <p className="text-sm text-slate-600 mb-4">{assignment.courseName}</p>
                              
                              <div className="grid grid-cols-4 gap-4 text-sm">
                                <div>
                                  <div className="text-slate-500 font-semibold mb-1">Total</div>
                                  <div className="text-2xl font-black text-slate-900">{assignment.totalSubmissions}</div>
                                </div>
                                <div>
                                  <div className="text-slate-500 font-semibold mb-1">Pending</div>
                                  <div className="text-2xl font-black text-orange-600">{assignment.pendingSubmissions}</div>
                                </div>
                                <div>
                                  <div className="text-slate-500 font-semibold mb-1">Graded</div>
                                  <div className="text-2xl font-black text-green-600">{assignment.gradedSubmissions}</div>
                                </div>
                                <div>
                                  <div className="text-slate-500 font-semibold mb-1">Avg Grade</div>
                                  <div className="text-2xl font-black text-blue-600">{assignment.avgGrade}%</div>
                                </div>
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="text-sm font-bold text-slate-500 mb-1">Due Date</div>
                              <div className="text-lg font-black text-slate-900">{assignment.dueDate}</div>
                              <Button variant="primary" size="sm" icon={ArrowRight} className="mt-4">
                                View Submissions
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-4 bg-white flex items-center justify-between">
                          <div className="flex items-center gap-6 text-sm">
                            <span className="flex items-center gap-2 text-slate-600">
                              <Calendar size={16} />
                              Created: {assignment.createdAt}
                            </span>
                            <span className="flex items-center gap-2 text-slate-600">
                              <Hash size={16} />
                              Max Points: {assignment.maxPoints}
                            </span>
                          </div>
                          <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                            assignment.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {assignment.status.toUpperCase()}
                          </span>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <FileText size={40} className="text-slate-400" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">No assignments found</h3>
                      <p className="text-slate-600">
                        {activeTab === 'pending' 
                          ? 'All submissions have been graded!' 
                          : 'No graded submissions yet'}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* Submission List for Selected Assignment */
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <button
                        onClick={() => setSelectedAssignment(null)}
                        className="flex items-center gap-2 text-blue-600 font-bold mb-2 hover:text-blue-700"
                      >
                        ← Back to Assignments
                      </button>
                      <h2 className="text-2xl font-black text-slate-900">{selectedAssignment.title}</h2>
                      <p className="text-slate-600">{selectedAssignment.courseName}</p>
                    </div>
                    <Button variant="secondary" icon={Download}>
                      Export Grades
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {filteredSubmissions.length > 0 ? (
                      filteredSubmissions.map((submission) => (
                        <motion.div
                          key={submission.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="border-2 border-slate-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all"
                        >
                          <div className="p-6 bg-white">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-lg font-black text-slate-900">{submission.studentName}</h3>
                                  <span className={`px-3 py-1 rounded-lg text-xs font-bold ${getStatusColor(submission.status)}`}>
                                    {submission.status.toUpperCase()}
                                  </span>
                                  {submission.lateSubmission && (
                                    <span className="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-xs font-bold">
                                      LATE
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
                                  <span>{submission.studentEmail}</span>
                                  <span>•</span>
                                  <span>Roll: {submission.studentRollNo}</span>
                                  <span>•</span>
                                  <span>Attempt: {submission.attemptNumber}</span>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                  {submission.files.map((file, idx) => {
                                    const FileIcon = getFileIcon(file.type);
                                    return (
                                      <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg">
                                        <FileIcon size={16} className="text-blue-600" />
                                        <span className="text-sm font-semibold text-slate-700">{file.name}</span>
                                        <span className="text-xs text-slate-500">({file.size})</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              <div className="text-right">
                                {submission.status === 'graded' ? (
                                  <div>
                                    <div className="text-sm font-bold text-slate-500 mb-1">Grade</div>
                                    <div className={`text-4xl font-black mb-2 ${getGradeColor(submission.grade)}`}>
                                      {submission.grade}
                                    </div>
                                    <div className="text-sm text-slate-600 mb-2">{submission.gradePoints}/100</div>
                                    <Button variant="secondary" size="sm" icon={Eye}
                                      onClick={() => {
                                        setSelectedSubmission(submission);
                                        setShowGradingModal(true);
                                      }}
                                    >
                                      View Details
                                    </Button>
                                  </div>
                                ) : (
                                  <div>
                                    <div className="text-sm font-bold text-slate-500 mb-2">Submitted</div>
                                    <div className="text-sm text-slate-700 mb-4">{submission.submittedAt}</div>
                                    <Button variant="primary" size="sm" icon={Edit}
                                      onClick={() => {
                                        setSelectedSubmission(submission);
                                        setShowGradingModal(true);
                                        runAIAnalysis();
                                      }}
                                    >
                                      Grade Now
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="pt-4 border-t-2 border-slate-100 flex items-center justify-between">
                              <div className="flex items-center gap-6 text-sm">
                                <div className="flex items-center gap-2">
                                  <Shield className="text-green-600" size={16} />
                                  <span className="font-semibold text-slate-700">
                                    Originality: <span className="text-green-600 font-black">{submission.plagiarismScore}%</span>
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="text-blue-600" size={16} />
                                  <span className="font-semibold text-slate-700">Submitted: {submission.submittedAt}</span>
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <button className="p-2 hover:bg-slate-50 rounded-lg transition-colors">
                                  <Download size={20} className="text-slate-600" />
                                </button>
                                <button className="p-2 hover:bg-slate-50 rounded-lg transition-colors">
                                  <Mail size={20} className="text-slate-600" />
                                </button>
                              </div>
                            </div>

                            {submission.feedback && submission.status === 'graded' && (
                              <div className="mt-4 p-4 bg-blue-50 rounded-xl border-2 border-blue-100">
                                <div className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                                  <MessageSquare size={16} className="text-blue-600" />
                                  Feedback
                                </div>
                                <p className="text-sm text-slate-700">{submission.feedback}</p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <Users size={40} className="text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No submissions found</h3>
                        <p className="text-slate-600">No submissions match your current filters</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Analytics Tab */
            <div className="p-6">
              <h2 className="text-2xl font-black text-slate-900 mb-6">Grading Analytics</h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <Card className="p-6">
                  <h3 className="text-lg font-black text-slate-900 mb-4">Grade Distribution</h3>
                  <div className="space-y-3">
                    {[
                      { grade: 'A', count: 45, percentage: 33 },
                      { grade: 'B', count: 52, percentage: 38 },
                      { grade: 'C', count: 28, percentage: 21 },
                      { grade: 'D', count: 8, percentage: 6 },
                      { grade: 'F', count: 2, percentage: 2 },
                    ].map((item) => (
                      <div key={item.grade}>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-bold text-slate-700">Grade {item.grade}</span>
                          <span className="text-slate-600">{item.count} students ({item.percentage}%)</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${getGradeColor('A').replace('text-', 'bg-')}`}
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-black text-slate-900 mb-4">Submission Timeline</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                      <CheckCircle size={24} className="text-green-600" />
                      <div>
                        <div className="font-bold text-slate-900">On-Time Submissions</div>
                        <div className="text-sm text-slate-600">87% submitted before deadline</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-xl">
                      <Clock size={24} className="text-orange-600" />
                      <div>
                        <div className="font-bold text-slate-900">Late Submissions</div>
                        <div className="text-sm text-slate-600">13% submitted after deadline</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                      <TrendingUp size={24} className="text-blue-600" />
                      <div>
                        <div className="font-bold text-slate-900">Average Turnaround</div>
                        <div className="text-sm text-slate-600">2.3 days grading time</div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              <Card className="p-6">
                <h3 className="text-lg font-black text-slate-900 mb-4">Course Performance Comparison</h3>
                <div className="space-y-4">
                  {assignments.map((assignment) => (
                    <div key={assignment.id} className="p-4 bg-slate-50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="font-bold text-slate-900">{assignment.title}</div>
                          <div className="text-sm text-slate-600">{assignment.courseCode}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-black text-blue-600">{assignment.avgGrade}%</div>
                          <div className="text-xs text-slate-500">Avg Grade</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <span>{assignment.gradedSubmissions} graded</span>
                        <span>•</span>
                        <span>{assignment.pendingSubmissions} pending</span>
                        <span>•</span>
                        <span>{Math.round((assignment.gradedSubmissions / assignment.totalSubmissions) * 100)}% complete</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Grading Modal */}
      <AnimatePresence>
        {showGradingModal && selectedSubmission && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6 overflow-y-auto"
            onClick={() => setShowGradingModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-5xl w-full shadow-2xl my-8"
            >
              {/* Modal Header */}
              <div className="p-8 border-b-2 border-slate-100">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 mb-2">
                      {selectedSubmission.status === 'graded' ? 'View Submission' : 'Grade Submission'}
                    </h2>
                    <p className="text-slate-600">{selectedSubmission.studentName} - {selectedAssignment.title}</p>
                  </div>
                  <button
                    onClick={() => setShowGradingModal(false)}
                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="p-8 max-h-[70vh] overflow-y-auto">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Left Column - Submission Details */}
                  <div className="space-y-6">
                    {/* Student Info */}
                    <Card className="p-6">
                      <h3 className="font-black text-slate-900 mb-4">Student Information</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Name:</span>
                          <span className="font-bold text-slate-900">{selectedSubmission.studentName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Roll No:</span>
                          <span className="font-bold text-slate-900">{selectedSubmission.studentRollNo}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Email:</span>
                          <span className="font-bold text-slate-900">{selectedSubmission.studentEmail}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Submitted:</span>
                          <span className="font-bold text-slate-900">{selectedSubmission.submittedAt}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Attempt:</span>
                          <span className="font-bold text-slate-900">#{selectedSubmission.attemptNumber}</span>
                        </div>
                      </div>
                    </Card>

                    {/* Files */}
                    <Card className="p-6">
                      <h3 className="font-black text-slate-900 mb-4">Submitted Files</h3>
                      <div className="space-y-2">
                        {selectedSubmission.files.map((file, idx) => {
                          const FileIcon = getFileIcon(file.type);
                          return (
                            <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                              <div className="flex items-center gap-3">
                                <FileIcon size={20} className="text-blue-600" />
                                <div>
                                  <div className="font-bold text-slate-900 text-sm">{file.name}</div>
                                  <div className="text-xs text-slate-500">{file.size}</div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
                                  <Eye size={16} className="text-slate-600" />
                                </button>
                                <button className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
                                  <Download size={16} className="text-slate-600" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </Card>

                    {/* AI Analysis */}
                    {aiAnalysis && (
                      <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
                        <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2">
                          <Brain size={20} className="text-purple-600" />
                          AI Analysis
                        </h3>
                        
                        {isAnalyzing ? (
                          <div className="text-center py-8">
                            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-slate-600">Analyzing submission...</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-white rounded-xl">
                              <span className="text-sm font-semibold text-slate-700">Overall Score</span>
                              <span className="text-2xl font-black text-purple-600">{aiAnalysis.overallScore}%</span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                              <div className="p-3 bg-white rounded-xl text-center">
                                <div className="text-xs font-bold text-slate-500 mb-1">Code Quality</div>
                                <div className="text-xl font-black text-green-600">{aiAnalysis.codeQuality}%</div>
                              </div>
                              <div className="p-3 bg-white rounded-xl text-center">
                                <div className="text-xs font-bold text-slate-500 mb-1">Documentation</div>
                                <div className="text-xl font-black text-blue-600">{aiAnalysis.documentation}%</div>
                              </div>
                            </div>

                            <div>
                              <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                                <ThumbsUp size={16} className="text-green-600" />
                                Strengths
                              </h4>
                              <div className="space-y-1">
                                {aiAnalysis.strengths.slice(0, 2).map((strength, idx) => (
                                  <div key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                                    <CheckCircle size={12} className="text-green-600 mt-0.5 flex-shrink-0" />
                                    <span>{strength}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                                <Target size={16} className="text-orange-600" />
                                Areas to Improve
                              </h4>
                              <div className="space-y-1">
                                {aiAnalysis.weaknesses.slice(0, 2).map((weakness, idx) => (
                                  <div key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                                    <AlertCircle size={12} className="text-orange-600 mt-0.5 flex-shrink-0" />
                                    <span>{weakness}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="p-3 bg-white rounded-xl">
                              <div className="text-xs font-bold text-slate-500 mb-1">Suggested Grade</div>
                              <div className="text-2xl font-black text-blue-600">{aiAnalysis.estimatedGrade}</div>
                            </div>
                          </div>
                        )}
                      </Card>
                    )}
                  </div>

                  {/* Right Column - Grading Form */}
                  <div className="space-y-6">
                    {selectedSubmission.status !== 'graded' ? (
                      <>
                        {/* Rubric Scoring */}
                        <Card className="p-6">
                          <h3 className="font-black text-slate-900 mb-4">Rubric-Based Grading</h3>
                          <div className="space-y-4">
                            {Object.entries(rubricTemplate).map(([key, rubric]) => (
                              <div key={key}>
                                <label className="text-sm font-bold text-slate-700 mb-2 block">
                                  {rubric.label} (Max: {rubric.max})
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  max={rubric.max}
                                  value={rubricScores[key] || ''}
                                  onChange={(e) => setRubricScores({
                                    ...rubricScores,
                                    [key]: Math.min(parseFloat(e.target.value) || 0, rubric.max)
                                  })}
                                  className="w-full p-3 border-2 border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-blue-500"
                                  placeholder={`0 - ${rubric.max}`}
                                />
                              </div>
                            ))}
                            
                            <div className="pt-4 border-t-2 border-slate-100">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-bold text-slate-700">Total Score</span>
                                <span className="text-3xl font-black text-blue-600">
                                  {Object.values(rubricScores).reduce((sum, score) => sum + (parseFloat(score) || 0), 0)} / 100
                                </span>
                              </div>
                              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all"
                                  style={{ 
                                    width: `${Object.values(rubricScores).reduce((sum, score) => sum + (parseFloat(score) || 0), 0)}%`
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </Card>

                        {/* Feedback */}
                        <Card className="p-6">
                          <h3 className="font-black text-slate-900 mb-4">Feedback for Student</h3>
                          <textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Provide detailed feedback about the submission..."
                            rows="8"
                            className="w-full p-4 border-2 border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-blue-500 resize-none"
                          />
                          <div className="mt-3 flex gap-2">
                            <button
                              onClick={() => setFeedback(aiAnalysis?.suggestions.join('\n\n') || '')}
                              className="text-sm font-bold text-purple-600 hover:text-purple-700 flex items-center gap-2"
                            >
                              <Sparkles size={16} />
                              Use AI Suggestions
                            </button>
                          </div>
                        </Card>
                      </>
                    ) : (
                      <>
                        {/* View Graded Details */}
                        <Card className="p-6">
                          <h3 className="font-black text-slate-900 mb-4">Rubric Scores</h3>
                          <div className="space-y-3">
                            {selectedSubmission.rubricScores && Object.entries(selectedSubmission.rubricScores).map(([key, score]) => (
                              <div key={key} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                                <span className="font-semibold text-slate-700">{rubricTemplate[key].label}</span>
                                <span className="font-black text-blue-600">{score}/{rubricTemplate[key].max}</span>
                              </div>
                            ))}
                            <div className="pt-3 border-t-2 border-slate-100 flex justify-between items-center">
                              <span className="font-bold text-slate-900">Total Score</span>
                              <span className="text-3xl font-black text-blue-600">{selectedSubmission.gradePoints}/100</span>
                            </div>
                          </div>
                        </Card>

                        <Card className="p-6">
                          <h3 className="font-black text-slate-900 mb-4">Feedback</h3>
                          <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-100">
                            <p className="text-slate-700 whitespace-pre-wrap">{selectedSubmission.feedback}</p>
                          </div>
                        </Card>

                        <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                          <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                              <CheckCircle size={40} className="text-white" />
                            </div>
                            <div className="font-black text-slate-900 text-lg mb-2">Graded Successfully</div>
                            <div className="text-sm text-slate-600 mb-1">Graded by: {selectedSubmission.gradedBy}</div>
                            <div className="text-sm text-slate-600">On: {new Date(selectedSubmission.gradedAt).toLocaleString()}</div>
                          </div>
                        </Card>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              {selectedSubmission.status !== 'graded' && (
                <div className="p-8 border-t-2 border-slate-100">
                  <div className="flex gap-4">
                    <Button
                      variant="ghost"
                      fullWidth
                      onClick={() => setShowGradingModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      fullWidth
                      icon={Send}
                      onClick={handleGrade}
                      disabled={!feedback || Object.keys(rubricScores).length === 0}
                    >
                      Submit Grade & Feedback
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AssignmentEvaluation;