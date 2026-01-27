import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, File, FileText, Image, FileCode, FileVideo, Music,
  X, Check, AlertCircle, Clock, TrendingUp, Award, Eye,
  Download, Trash2, RefreshCw, Zap, Shield, Search, Copy,
  CheckCircle, XCircle, Loader, ArrowUp, BarChart3, Brain,
  Sparkles, Target, Users, Calendar, Hash, Link as LinkIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AssignmentUpload = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [uploadState, setUploadState] = useState('idle'); // idle, dragging, uploading, analyzing, success, error
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [activeTab, setActiveTab] = useState('upload'); // upload, history, analytics
  const [showAIFeedback, setShowAIFeedback] = useState(false);
  const [aiFeedback, setAiFeedback] = useState(null);
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  // Simulated assignments data
  useEffect(() => {
    setAssignments([
      {
        id: 1,
        title: 'Data Structures Project',
        course: 'CS101',
        dueDate: '2026-02-05',
        status: 'open',
        maxSize: 50, // MB
        allowedFormats: ['.pdf', '.docx', '.zip', '.py', '.java'],
        submittedOn: null,
        grade: null,
        submissions: []
      },
      {
        id: 2,
        title: 'Machine Learning Research Paper',
        course: 'CS201',
        dueDate: '2026-02-10',
        status: 'open',
        maxSize: 25,
        allowedFormats: ['.pdf', '.docx'],
        submittedOn: '2026-01-26',
        grade: 'A',
        submissions: [
          {
            id: 1,
            version: 1,
            files: [{name: 'ml_paper_v1.pdf', size: 2.4, type: 'application/pdf'}],
            uploadedAt: '2026-01-26 14:30',
            status: 'graded',
            plagiarismScore: 98,
            grade: 'A'
          }
        ]
      },
      {
        id: 3,
        title: 'Algorithm Analysis Assignment',
        course: 'CS102',
        dueDate: '2026-01-30',
        status: 'submitted',
        maxSize: 10,
        allowedFormats: ['.pdf', '.md'],
        submittedOn: '2026-01-25',
        grade: null,
        submissions: [
          {
            id: 1,
            version: 1,
            files: [{name: 'algorithm_analysis.pdf', size: 1.8, type: 'application/pdf'}],
            uploadedAt: '2026-01-25 10:15',
            status: 'reviewing',
            plagiarismScore: 96
          }
        ]
      }
    ]);
  }, []);

  const getFileIcon = (type) => {
    if (type.includes('pdf')) return FileText;
    if (type.includes('image')) return Image;
    if (type.includes('video')) return FileVideo;
    if (type.includes('audio')) return Music;
    if (type.includes('code') || type.includes('text')) return FileCode;
    return File;
  };

  const getFileColor = (type) => {
    if (type.includes('pdf')) return 'from-red-500 to-red-600';
    if (type.includes('image')) return 'from-purple-500 to-purple-600';
    if (type.includes('video')) return 'from-blue-500 to-blue-600';
    if (type.includes('audio')) return 'from-green-500 to-green-600';
    if (type.includes('code') || type.includes('text')) return 'from-orange-500 to-orange-600';
    return 'from-slate-500 to-slate-600';
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setUploadState('dragging');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.target === dropZoneRef.current) {
      setUploadState('idle');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setUploadState('idle');

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = async (files) => {
    if (!selectedAssignment) {
      alert('Please select an assignment first');
      return;
    }

    // Validate files
    const validFiles = [];
    const errors = [];

    for (const file of files) {
      // Check file size
      const maxSizeBytes = selectedAssignment.maxSize * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        errors.push(`${file.name} exceeds maximum size of ${selectedAssignment.maxSize}MB`);
        continue;
      }

      // Check file format
      const fileExt = '.' + file.name.split('.').pop().toLowerCase();
      if (!selectedAssignment.allowedFormats.includes(fileExt)) {
        errors.push(`${file.name} format not allowed. Allowed: ${selectedAssignment.allowedFormats.join(', ')}`);
        continue;
      }

      validFiles.push(file);
    }

    if (errors.length > 0) {
      alert('Some files were rejected:\n' + errors.join('\n'));
    }

    if (validFiles.length > 0) {
      uploadFiles(validFiles);
    }
  };

  const uploadFiles = async (files) => {
    setUploadState('uploading');
    setUploadedFiles([]);
    setUploadProgress(0);

    // Simulate file upload with progress
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setUploadProgress(progress);
      }

      setUploadedFiles(prev => [
        ...prev,
        {
          name: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString()
        }
      ]);
    }

    // Start analysis
    setUploadState('analyzing');
    await analyzeSubmission(files);
  };

  const analyzeSubmission = async (files) => {
    // Simulate various analysis checks
    const checks = [
      { name: 'File Integrity', duration: 500 },
      { name: 'Virus Scan', duration: 800 },
      { name: 'Plagiarism Check', duration: 1500 },
      { name: 'Format Validation', duration: 600 },
      { name: 'AI Content Detection', duration: 1200 },
      { name: 'Metadata Analysis', duration: 400 }
    ];

    for (const check of checks) {
      await new Promise(resolve => setTimeout(resolve, check.duration));
    }

    // Generate analysis results
    const results = {
      overallScore: 94,
      plagiarismScore: 98,
      aiContentScore: 95,
      formatCompliance: 100,
      readabilityScore: 87,
      wordCount: 2847,
      estimatedReadTime: 12,
      issues: [],
      suggestions: [
        'Consider adding more citations in section 3',
        'Some paragraphs could be more concise',
        'Excellent structure and organization'
      ],
      similarDocuments: [
        { title: 'Similar Paper 2024', similarity: 12 },
        { title: 'Reference Document', similarity: 8 }
      ]
    };

    setAnalysisResults(results);
    setUploadState('success');

    // Update assignment submissions
    const newSubmission = {
      id: Date.now(),
      version: (selectedAssignment.submissions?.length || 0) + 1,
      files: uploadedFiles.map(f => ({
        name: f.name,
        size: f.size / (1024 * 1024),
        type: f.type
      })),
      uploadedAt: new Date().toLocaleString(),
      status: 'reviewing',
      plagiarismScore: results.plagiarismScore,
      analysisResults: results
    };

    setAssignments(prev =>
      prev.map(a =>
        a.id === selectedAssignment.id
          ? {
              ...a,
              status: 'submitted',
              submittedOn: new Date().toLocaleDateString(),
              submissions: [...(a.submissions || []), newSubmission]
            }
          : a
      )
    );

    // Generate AI feedback
    generateAIFeedback(results);
  };

  const generateAIFeedback = async (results) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setAiFeedback({
      overallAssessment: 'Your submission demonstrates strong understanding of the core concepts. The structure is logical and well-organized.',
      strengths: [
        'Clear and concise writing style',
        'Well-structured arguments',
        'Appropriate use of technical terminology',
        'Good citation practices'
      ],
      areasForImprovement: [
        'Consider expanding the analysis in section 2.3',
        'Add more real-world examples to support theoretical concepts',
        'Some figures could benefit from more detailed captions'
      ],
      technicalQuality: {
        codeQuality: 88,
        documentation: 92,
        testCoverage: 85
      },
      estimatedGrade: 'A-',
      confidence: 87
    });
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const resetUpload = () => {
    setUploadState('idle');
    setUploadedFiles([]);
    setUploadProgress(0);
    setAnalysisResults(null);
    setShowAIFeedback(false);
    setAiFeedback(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'text-blue-600 bg-blue-50';
      case 'submitted':
        return 'text-orange-600 bg-orange-50';
      case 'graded':
        return 'text-green-600 bg-green-50';
      case 'overdue':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-slate-600 bg-slate-50';
    }
  };

  const getGradeColor = (grade) => {
    if (!grade) return 'text-slate-600';
    if (grade.startsWith('A')) return 'text-green-600';
    if (grade.startsWith('B')) return 'text-blue-600';
    if (grade.startsWith('C')) return 'text-orange-600';
    return 'text-red-600';
  };

  const getDaysRemaining = (dueDate) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-slate-900 mb-2">Assignment Submission</h1>
          <p className="text-slate-600">Upload your work with AI-powered analysis and feedback</p>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border-2 border-slate-100 p-6 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <FileText size={24} className="text-white" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-500">Total</div>
                <div className="text-2xl font-black text-slate-900">{assignments.length}</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border-2 border-slate-100 p-6 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <CheckCircle size={24} className="text-white" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-500">Submitted</div>
                <div className="text-2xl font-black text-slate-900">
                  {assignments.filter(a => a.status === 'submitted' || a.status === 'graded').length}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border-2 border-slate-100 p-6 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Award size={24} className="text-white" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-500">Avg Grade</div>
                <div className="text-2xl font-black text-slate-900">A-</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl border-2 border-slate-100 p-6 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <Clock size={24} className="text-white" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-500">Pending</div>
                <div className="text-2xl font-black text-slate-900">
                  {assignments.filter(a => a.status === 'open').length}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'upload'
                ? 'bg-slate-900 text-white shadow-lg'
                : 'bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Upload className="inline mr-2" size={20} />
            Upload
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'history'
                ? 'bg-slate-900 text-white shadow-lg'
                : 'bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Clock className="inline mr-2" size={20} />
            Submissions
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'analytics'
                ? 'bg-slate-900 text-white shadow-lg'
                : 'bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <BarChart3 className="inline mr-2" size={20} />
            Analytics
          </button>
        </div>

        {/* Main Content */}
        {activeTab === 'upload' && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left: Assignment Selection */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border-2 border-slate-100 shadow-lg overflow-hidden">
                <div className="p-6 border-b-2 border-slate-100">
                  <h2 className="text-xl font-black text-slate-900">Select Assignment</h2>
                </div>
                <div className="max-h-[600px] overflow-y-auto p-4 space-y-3">
                  {assignments.filter(a => a.status === 'open' || a.status === 'submitted').map((assignment) => {
                    const daysRemaining = getDaysRemaining(assignment.dueDate);
                    return (
                      <motion.button
                        key={assignment.id}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setSelectedAssignment(assignment)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                          selectedAssignment?.id === assignment.id
                            ? 'border-slate-900 bg-slate-50 shadow-lg'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-bold text-slate-900">{assignment.title}</h3>
                          <span className={`text-xs font-bold px-2 py-1 rounded-lg ${getStatusColor(assignment.status)}`}>
                            {assignment.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{assignment.course}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            Due: {assignment.dueDate}
                          </span>
                          {daysRemaining >= 0 && (
                            <span className={`font-bold ${daysRemaining <= 2 ? 'text-red-600' : 'text-green-600'}`}>
                              {daysRemaining}d left
                            </span>
                          )}
                        </div>
                        {assignment.grade && (
                          <div className="mt-2 pt-2 border-t border-slate-200">
                            <span className="text-xs text-slate-500">Grade: </span>
                            <span className={`text-sm font-black ${getGradeColor(assignment.grade)}`}>
                              {assignment.grade}
                            </span>
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Assignment Details */}
              {selectedAssignment && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 bg-blue-50 rounded-2xl border-2 border-blue-200 p-6"
                >
                  <h3 className="font-black text-slate-900 mb-4">Requirements</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-slate-600">Max Size:</span>
                      <span className="ml-2 font-bold text-slate-900">{selectedAssignment.maxSize}MB</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Formats:</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {selectedAssignment.allowedFormats.map(format => (
                          <span key={format} className="px-2 py-1 bg-white rounded-lg text-xs font-bold text-slate-700">
                            {format}
                          </span>
                        ))}
                      </div>
                    </div>
                    {selectedAssignment.submissions && selectedAssignment.submissions.length > 0 && (
                      <div className="pt-2 border-t border-blue-300">
                        <span className="text-slate-600">Submissions:</span>
                        <span className="ml-2 font-bold text-slate-900">
                          {selectedAssignment.submissions.length} version(s)
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Right: Upload Area */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {uploadState === 'idle' || uploadState === 'dragging' ? (
                  <motion.div
                    key="upload"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    ref={dropZoneRef}
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`bg-white rounded-3xl border-4 border-dashed p-16 text-center transition-all ${
                      uploadState === 'dragging'
                        ? 'border-blue-500 bg-blue-50 shadow-2xl scale-105'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <motion.div
                      animate={uploadState === 'dragging' ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ repeat: uploadState === 'dragging' ? Infinity : 0, duration: 1 }}
                      className={`w-32 h-32 rounded-3xl flex items-center justify-center mx-auto mb-6 ${
                        uploadState === 'dragging'
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-2xl'
                          : 'bg-gradient-to-br from-slate-200 to-slate-300'
                      }`}
                    >
                      <Upload size={64} className={uploadState === 'dragging' ? 'text-white' : 'text-slate-600'} />
                    </motion.div>
                    
                    {!selectedAssignment ? (
                      <>
                        <h2 className="text-3xl font-black text-slate-900 mb-3">Select an Assignment First</h2>
                        <p className="text-slate-600 text-lg">
                          Choose an assignment from the left panel to start uploading
                        </p>
                      </>
                    ) : (
                      <>
                        <h2 className="text-3xl font-black text-slate-900 mb-3">
                          {uploadState === 'dragging' ? 'Drop Files Here' : 'Upload Your Work'}
                        </h2>
                        <p className="text-slate-600 text-lg mb-8">
                          Drag and drop your files or click to browse
                        </p>
                        
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          onChange={handleFileSelect}
                          accept={selectedAssignment.allowedFormats.join(',')}
                          className="hidden"
                        />
                        
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="px-12 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-xl transition-all text-lg"
                        >
                          <Upload className="inline mr-2" size={24} />
                          Choose Files
                        </button>

                        <div className="mt-8 pt-8 border-t-2 border-slate-100">
                          <div className="flex items-center justify-center gap-6 text-sm text-slate-600">
                            <span className="flex items-center gap-2">
                              <Shield size={16} className="text-green-600" />
                              Secure Upload
                            </span>
                            <span className="flex items-center gap-2">
                              <Brain size={16} className="text-purple-600" />
                              AI Analysis
                            </span>
                            <span className="flex items-center gap-2">
                              <Zap size={16} className="text-blue-600" />
                              Instant Feedback
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </motion.div>
                ) : uploadState === 'uploading' ? (
                  <motion.div
                    key="uploading"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white rounded-3xl border-2 border-slate-100 p-12 shadow-xl"
                  >
                    <div className="text-center mb-8">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                        className="w-24 h-24 border-8 border-blue-500 border-t-transparent rounded-full mx-auto mb-6"
                      />
                      <h2 className="text-3xl font-black text-slate-900 mb-3">Uploading Files...</h2>
                      <p className="text-slate-600 text-lg">Please wait while we securely upload your files</p>
                    </div>

                    <div className="max-w-2xl mx-auto">
                      <div className="mb-4">
                        <div className="flex justify-between text-sm font-bold mb-2">
                          <span className="text-slate-600">Progress</span>
                          <span className="text-blue-600">{uploadProgress}%</span>
                        </div>
                        <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${uploadProgress}%` }}
                            transition={{ duration: 0.3 }}
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        {uploadedFiles.map((file, index) => {
                          const Icon = getFileIcon(file.type);
                          return (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl"
                            >
                              <div className={`w-10 h-10 bg-gradient-to-br ${getFileColor(file.type)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                <Icon size={20} className="text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-bold text-slate-900 truncate">{file.name}</div>
                                <div className="text-xs text-slate-500">{formatFileSize(file.size)}</div>
                              </div>
                              <CheckCircle size={20} className="text-green-600" />
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                ) : uploadState === 'analyzing' ? (
                  <motion.div
                    key="analyzing"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl border-2 border-purple-200 p-12 shadow-xl"
                  >
                    <div className="text-center mb-8">
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          rotate: [0, 360]
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 2
                        }}
                        className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl"
                      >
                        <Brain size={48} className="text-white" />
                      </motion.div>
                      <h2 className="text-3xl font-black text-slate-900 mb-3">AI Analysis in Progress</h2>
                      <p className="text-slate-600 text-lg">Running comprehensive checks on your submission</p>
                    </div>

                    <div className="max-w-2xl mx-auto space-y-3">
                      {[
                        { name: 'File Integrity Check', icon: Shield },
                        { name: 'Virus Scanning', icon: Shield },
                        { name: 'Plagiarism Detection', icon: Search },
                        { name: 'Format Validation', icon: CheckCircle },
                        { name: 'AI Content Analysis', icon: Brain },
                        { name: 'Readability Assessment', icon: Eye }
                      ].map((check, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.2 }}
                          className="flex items-center gap-3 p-4 bg-white rounded-xl border-2 border-purple-200"
                        >
                          <check.icon size={20} className="text-purple-600" />
                          <span className="flex-1 font-bold text-slate-900">{check.name}</span>
                          <Loader size={20} className="text-purple-600 animate-spin" />
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ) : uploadState === 'success' ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="space-y-6"
                  >
                    {/* Success Banner */}
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-3xl border-2 border-green-400 p-12 shadow-2xl text-center text-white">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.5 }}
                        className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl"
                      >
                        <CheckCircle size={60} className="text-green-600" />
                      </motion.div>
                      <h2 className="text-4xl font-black mb-3">Submission Successful!</h2>
                      <p className="text-xl text-green-50 mb-6">
                        Your assignment has been uploaded and analyzed
                      </p>
                      <div className="flex gap-4 justify-center">
                        <button
                          onClick={() => setShowAIFeedback(true)}
                          className="px-8 py-3 bg-white text-green-600 font-bold rounded-xl hover:bg-green-50 transition-all flex items-center gap-2"
                        >
                          <Sparkles size={20} />
                          View AI Feedback
                        </button>
                        <button
                          onClick={resetUpload}
                          className="px-8 py-3 bg-white/10 backdrop-blur-lg text-white font-bold rounded-xl hover:bg-white/20 transition-all"
                        >
                          Upload Another
                        </button>
                      </div>
                    </div>

                    {/* Analysis Results */}
                    {analysisResults && (
                      <div className="bg-white rounded-3xl border-2 border-slate-100 p-8 shadow-xl">
                        <h3 className="text-2xl font-black text-slate-900 mb-6">Analysis Report</h3>
                        
                        {/* Score Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl">
                            <div className="text-3xl font-black text-blue-600 mb-1">{analysisResults.overallScore}%</div>
                            <div className="text-sm font-bold text-slate-700">Overall Score</div>
                          </div>
                          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl">
                            <div className="text-3xl font-black text-green-600 mb-1">{analysisResults.plagiarismScore}%</div>
                            <div className="text-sm font-bold text-slate-700">Original</div>
                          </div>
                          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl">
                            <div className="text-3xl font-black text-purple-600 mb-1">{analysisResults.aiContentScore}%</div>
                            <div className="text-sm font-bold text-slate-700">AI Score</div>
                          </div>
                          <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl">
                            <div className="text-3xl font-black text-orange-600 mb-1">{analysisResults.readabilityScore}%</div>
                            <div className="text-sm font-bold text-slate-700">Readability</div>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-black text-slate-900 mb-3 flex items-center gap-2">
                              <FileText size={18} />
                              Document Stats
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-slate-600">Word Count:</span>
                                <span className="font-bold text-slate-900">{analysisResults.wordCount}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-600">Read Time:</span>
                                <span className="font-bold text-slate-900">{analysisResults.estimatedReadTime} min</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-600">Format:</span>
                                <span className="font-bold text-green-600">✓ Compliant</span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-black text-slate-900 mb-3 flex items-center gap-2">
                              <Target size={18} />
                              Suggestions
                            </h4>
                            <ul className="space-y-2 text-sm text-slate-700">
                              {analysisResults.suggestions.slice(0, 3).map((suggestion, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-blue-600 mt-1">•</span>
                                  <span>{suggestion}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* AI Feedback Modal */}
                    {showAIFeedback && aiFeedback && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowAIFeedback(false)}
                      >
                        <motion.div
                          initial={{ scale: 0.9 }}
                          animate={{ scale: 1 }}
                          onClick={(e) => e.stopPropagation()}
                          className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                        >
                          <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-3xl">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Brain size={32} />
                                <div>
                                  <h3 className="text-2xl font-black">AI-Powered Feedback</h3>
                                  <p className="text-purple-100">Personalized insights for your submission</p>
                                </div>
                              </div>
                              <button
                                onClick={() => setShowAIFeedback(false)}
                                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                              >
                                <X size={24} />
                              </button>
                            </div>
                          </div>

                          <div className="p-8 space-y-6">
                            {/* Overall Assessment */}
                            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border-2 border-blue-200">
                              <h4 className="font-black text-slate-900 mb-3 flex items-center gap-2">
                                <Sparkles size={20} className="text-blue-600" />
                                Overall Assessment
                              </h4>
                              <p className="text-slate-700">{aiFeedback.overallAssessment}</p>
                            </div>

                            {/* Estimated Grade */}
                            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200">
                              <div>
                                <div className="text-sm font-bold text-slate-600 mb-1">Estimated Grade</div>
                                <div className="text-4xl font-black text-green-600">{aiFeedback.estimatedGrade}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-bold text-slate-600 mb-1">Confidence</div>
                                <div className="text-2xl font-black text-slate-900">{aiFeedback.confidence}%</div>
                              </div>
                            </div>

                            {/* Strengths */}
                            <div>
                              <h4 className="font-black text-slate-900 mb-3 flex items-center gap-2">
                                <CheckCircle size={20} className="text-green-600" />
                                Strengths
                              </h4>
                              <div className="space-y-2">
                                {aiFeedback.strengths.map((strength, i) => (
                                  <div key={i} className="flex items-start gap-2 p-3 bg-green-50 rounded-xl">
                                    <Check size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-slate-700">{strength}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Areas for Improvement */}
                            <div>
                              <h4 className="font-black text-slate-900 mb-3 flex items-center gap-2">
                                <Target size={20} className="text-orange-600" />
                                Areas for Improvement
                              </h4>
                              <div className="space-y-2">
                                {aiFeedback.areasForImprovement.map((area, i) => (
                                  <div key={i} className="flex items-start gap-2 p-3 bg-orange-50 rounded-xl">
                                    <ArrowUp size={18} className="text-orange-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-slate-700">{area}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Technical Quality */}
                            {aiFeedback.technicalQuality && (
                              <div>
                                <h4 className="font-black text-slate-900 mb-3 flex items-center gap-2">
                                  <FileCode size={20} className="text-purple-600" />
                                  Technical Quality
                                </h4>
                                <div className="grid grid-cols-3 gap-4">
                                  <div className="text-center p-4 bg-purple-50 rounded-xl">
                                    <div className="text-2xl font-black text-purple-600 mb-1">{aiFeedback.technicalQuality.codeQuality}%</div>
                                    <div className="text-xs font-bold text-slate-600">Code Quality</div>
                                  </div>
                                  <div className="text-center p-4 bg-blue-50 rounded-xl">
                                    <div className="text-2xl font-black text-blue-600 mb-1">{aiFeedback.technicalQuality.documentation}%</div>
                                    <div className="text-xs font-bold text-slate-600">Documentation</div>
                                  </div>
                                  <div className="text-center p-4 bg-green-50 rounded-xl">
                                    <div className="text-2xl font-black text-green-600 mb-1">{aiFeedback.technicalQuality.testCoverage}%</div>
                                    <div className="text-xs font-bold text-slate-600">Test Coverage</div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-2xl border-2 border-slate-100 shadow-xl overflow-hidden">
            <div className="p-6 border-b-2 border-slate-100">
              <h2 className="text-2xl font-black text-slate-900">Submission History</h2>
            </div>
            <div className="p-6 space-y-4">
              {assignments
                .filter(a => a.submissions && a.submissions.length > 0)
                .map(assignment => (
                  <div key={assignment.id} className="border-2 border-slate-100 rounded-2xl overflow-hidden">
                    <div className="bg-slate-50 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-black text-slate-900">{assignment.title}</h3>
                          <p className="text-sm text-slate-600">{assignment.course}</p>
                        </div>
                        {assignment.grade && (
                          <div className="text-right">
                            <div className="text-sm font-bold text-slate-500">Final Grade</div>
                            <div className={`text-3xl font-black ${getGradeColor(assignment.grade)}`}>
                              {assignment.grade}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="p-4 space-y-3">
                      {assignment.submissions.map((submission, idx) => (
                        <div key={submission.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-black flex-shrink-0">
                            v{submission.version}
                          </div>
                          <div className="flex-1">
                            <div className="font-bold text-slate-900 mb-1">
                              {submission.files.map(f => f.name).join(', ')}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-slate-600">
                              <span>{submission.uploadedAt}</span>
                              <span className={`px-2 py-1 rounded-lg font-bold ${getStatusColor(submission.status)}`}>
                                {submission.status.toUpperCase()}
                              </span>
                              {submission.plagiarismScore && (
                                <span className="text-green-600 font-bold">
                                  {submission.plagiarismScore}% Original
                                </span>
                              )}
                            </div>
                          </div>
                          {submission.grade && (
                            <div className={`text-2xl font-black ${getGradeColor(submission.grade)}`}>
                              {submission.grade}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border-2 border-slate-100 p-8 shadow-xl">
              <h3 className="text-xl font-black text-slate-900 mb-6">Submission Trends</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-600">On-Time Submissions</span>
                    <span className="font-bold text-green-600">92%</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full w-[92%] bg-gradient-to-r from-green-500 to-green-600 rounded-full"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-600">Average Grade</span>
                    <span className="font-bold text-blue-600">87%</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full w-[87%] bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-600">Originality Score</span>
                    <span className="font-bold text-purple-600">96%</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full w-[96%] bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border-2 border-slate-100 p-8 shadow-xl">
              <h3 className="text-xl font-black text-slate-900 mb-6">Performance Insights</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                  <TrendingUp size={24} className="text-green-600" />
                  <div>
                    <div className="font-bold text-slate-900">Improving Trend</div>
                    <div className="text-sm text-slate-600">Grades up 12% this month</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                  <Award size={24} className="text-blue-600" />
                  <div>
                    <div className="font-bold text-slate-900">Top Performer</div>
                    <div className="text-sm text-slate-600">In top 15% of class</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
                  <Target size={24} className="text-purple-600" />
                  <div>
                    <div className="font-bold text-slate-900">Consistent Quality</div>
                    <div className="text-sm text-slate-600">All submissions on time</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentUpload;