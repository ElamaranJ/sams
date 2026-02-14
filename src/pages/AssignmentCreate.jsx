import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Save, X, Calendar, Clock, FileText, BookOpen,
  Upload, Settings, Eye, CheckCircle, AlertCircle,
  Users, Target, Award, Paperclip, Hash, Link as LinkIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Card from '../components/shared/GlassCard';

const AssignmentCreate = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    dueDate: '',
    dueTime: '23:59',
    maxPoints: 100,
    allowedFormats: [],
    maxFileSize: 50,
    allowLateSubmission: true,
    lateSubmissionPenalty: 10,
    allowMultipleAttempts: false,
    maxAttempts: 1,
    rubricEnabled: true,
    instructions: '',
    resources: []
  });

  const [rubric, setRubric] = useState([
    { id: 1, criterion: 'Implementation Quality', maxPoints: 50, description: '' },
    { id: 2, criterion: 'Documentation', maxPoints: 25, description: '' },
    { id: 3, criterion: 'Testing', maxPoints: 25, description: '' }
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const courses = [
    { id: 'cs101', code: 'CS101', name: 'Data Structures', students: 45 },
    { id: 'cs201', code: 'CS201', name: 'Machine Learning', students: 38 },
    { id: 'cs301', code: 'CS301', name: 'Web Development', students: 52 },
  ];

  const fileFormats = [
    { id: 'pdf', label: 'PDF', ext: '.pdf' },
    { id: 'docx', label: 'Word Document', ext: '.docx' },
    { id: 'txt', label: 'Text File', ext: '.txt' },
    { id: 'zip', label: 'ZIP Archive', ext: '.zip' },
    { id: 'py', label: 'Python', ext: '.py' },
    { id: 'java', label: 'Java', ext: '.java' },
    { id: 'cpp', label: 'C++', ext: '.cpp' },
    { id: 'js', label: 'JavaScript', ext: '.js' },
  ];

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const toggleFileFormat = (format) => {
    const current = formData.allowedFormats;
    if (current.includes(format)) {
      handleInputChange('allowedFormats', current.filter(f => f !== format));
    } else {
      handleInputChange('allowedFormats', [...current, format]);
    }
  };

  const addRubricCriterion = () => {
    setRubric([...rubric, {
      id: rubric.length + 1,
      criterion: '',
      maxPoints: 0,
      description: ''
    }]);
  };

  const updateRubric = (id, field, value) => {
    setRubric(rubric.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const removeRubric = (id) => {
    setRubric(rubric.filter(item => item.id !== id));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.title || !formData.courseId || !formData.dueDate) {
      alert('Please fill in all required fields');
      return;
    }

    if (formData.allowedFormats.length === 0) {
      alert('Please select at least one allowed file format');
      return;
    }

    setIsCreating(true);

    // Simulate API call
    setTimeout(() => {
      alert('Assignment created successfully!');
      setIsCreating(false);
      // Reset form
      setFormData({
        title: '',
        description: '',
        courseId: '',
        dueDate: '',
        dueTime: '23:59',
        maxPoints: 100,
        allowedFormats: [],
        maxFileSize: 50,
        allowLateSubmission: true,
        lateSubmissionPenalty: 10,
        allowMultipleAttempts: false,
        maxAttempts: 1,
        rubricEnabled: true,
        instructions: '',
        resources: []
      });
    }, 1500);
  };

  const selectedCourse = courses.find(c => c.id === formData.courseId);
  const totalRubricPoints = rubric.reduce((sum, item) => sum + (parseFloat(item.maxPoints) || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-black text-slate-900 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Create New Assignment ✏️
          </h1>
          <p className="text-lg text-slate-600">Design and publish assignments for your students</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="p-8">
              <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <FileText size={24} className="text-blue-600" />
                Basic Information
              </h2>

              <div className="space-y-6">
                {/* Assignment Title */}
                <div>
                  <label className="text-sm font-bold text-slate-700 mb-2 block">
                    Assignment Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g., Binary Tree Implementation Project"
                    className="w-full p-4 border-2 border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Course Selection */}
                <div>
                  <label className="text-sm font-bold text-slate-700 mb-2 block">
                    Select Course *
                  </label>
                  <select
                    value={formData.courseId}
                    onChange={(e) => handleInputChange('courseId', e.target.value)}
                    className="w-full p-4 border-2 border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Choose a course...</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.code} - {course.name} ({course.students} students)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="text-sm font-bold text-slate-700 mb-2 block">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Provide a brief overview of the assignment..."
                    rows="4"
                    className="w-full p-4 border-2 border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>

                {/* Detailed Instructions */}
                <div>
                  <label className="text-sm font-bold text-slate-700 mb-2 block">
                    Detailed Instructions
                  </label>
                  <textarea
                    value={formData.instructions}
                    onChange={(e) => handleInputChange('instructions', e.target.value)}
                    placeholder="Provide step-by-step instructions for students..."
                    rows="6"
                    className="w-full p-4 border-2 border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>
              </div>
            </Card>

            {/* Submission Settings */}
            <Card className="p-8">
              <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <Settings size={24} className="text-purple-600" />
                Submission Settings
              </h2>

              <div className="space-y-6">
                {/* Due Date & Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-2 block">
                      Due Date *
                    </label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => handleInputChange('dueDate', e.target.value)}
                      className="w-full p-4 border-2 border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-2 block">
                      Due Time
                    </label>
                    <input
                      type="time"
                      value={formData.dueTime}
                      onChange={(e) => handleInputChange('dueTime', e.target.value)}
                      className="w-full p-4 border-2 border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Max Points */}
                <div>
                  <label className="text-sm font-bold text-slate-700 mb-2 block">
                    Maximum Points
                  </label>
                  <input
                    type="number"
                    value={formData.maxPoints}
                    onChange={(e) => handleInputChange('maxPoints', parseInt(e.target.value))}
                    min="1"
                    className="w-full p-4 border-2 border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Allowed File Formats */}
                <div>
                  <label className="text-sm font-bold text-slate-700 mb-3 block">
                    Allowed File Formats *
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {fileFormats.map(format => (
                      <button
                        key={format.id}
                        onClick={() => toggleFileFormat(format.ext)}
                        className={`p-3 rounded-xl font-bold text-sm transition-all ${
                          formData.allowedFormats.includes(format.ext)
                            ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {format.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Max File Size */}
                <div>
                  <label className="text-sm font-bold text-slate-700 mb-2 block">
                    Maximum File Size (MB)
                  </label>
                  <input
                    type="number"
                    value={formData.maxFileSize}
                    onChange={(e) => handleInputChange('maxFileSize', parseInt(e.target.value))}
                    min="1"
                    max="500"
                    className="w-full p-4 border-2 border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Late Submission */}
                <div className="p-4 bg-slate-50 rounded-xl">
                  <label className="flex items-center gap-3 cursor-pointer mb-3">
                    <input
                      type="checkbox"
                      checked={formData.allowLateSubmission}
                      onChange={(e) => handleInputChange('allowLateSubmission', e.target.checked)}
                      className="w-5 h-5 text-blue-600 rounded"
                    />
                    <div>
                      <div className="font-bold text-slate-900">Allow Late Submissions</div>
                      <div className="text-xs text-slate-600">Students can submit after due date with penalty</div>
                    </div>
                  </label>
                  
                  {formData.allowLateSubmission && (
                    <div>
                      <label className="text-sm font-bold text-slate-700 mb-2 block">
                        Late Penalty (% per day)
                      </label>
                      <input
                        type="number"
                        value={formData.lateSubmissionPenalty}
                        onChange={(e) => handleInputChange('lateSubmissionPenalty', parseInt(e.target.value))}
                        min="0"
                        max="100"
                        className="w-full p-3 border-2 border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  )}
                </div>

                {/* Multiple Attempts */}
                <div className="p-4 bg-slate-50 rounded-xl">
                  <label className="flex items-center gap-3 cursor-pointer mb-3">
                    <input
                      type="checkbox"
                      checked={formData.allowMultipleAttempts}
                      onChange={(e) => handleInputChange('allowMultipleAttempts', e.target.checked)}
                      className="w-5 h-5 text-blue-600 rounded"
                    />
                    <div>
                      <div className="font-bold text-slate-900">Allow Multiple Attempts</div>
                      <div className="text-xs text-slate-600">Students can resubmit their work</div>
                    </div>
                  </label>
                  
                  {formData.allowMultipleAttempts && (
                    <div>
                      <label className="text-sm font-bold text-slate-700 mb-2 block">
                        Maximum Attempts
                      </label>
                      <input
                        type="number"
                        value={formData.maxAttempts}
                        onChange={(e) => handleInputChange('maxAttempts', parseInt(e.target.value))}
                        min="1"
                        max="10"
                        className="w-full p-3 border-2 border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Grading Rubric */}
            <Card className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                  <Award size={24} className="text-orange-600" />
                  Grading Rubric
                </h2>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.rubricEnabled}
                    onChange={(e) => handleInputChange('rubricEnabled', e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <span className="text-sm font-bold text-slate-700">Enable Rubric</span>
                </label>
              </div>

              {formData.rubricEnabled && (
                <div className="space-y-4">
                  {rubric.map((item, index) => (
                    <div key={item.id} className="p-4 bg-slate-50 rounded-xl">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 space-y-3">
                          <input
                            type="text"
                            value={item.criterion}
                            onChange={(e) => updateRubric(item.id, 'criterion', e.target.value)}
                            placeholder="Criterion name"
                            className="w-full p-3 border-2 border-slate-200 rounded-xl font-bold focus:outline-none focus:border-blue-500"
                          />
                          <input
                            type="number"
                            value={item.maxPoints}
                            onChange={(e) => updateRubric(item.id, 'maxPoints', parseFloat(e.target.value))}
                            placeholder="Max points"
                            min="0"
                            className="w-full p-3 border-2 border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-blue-500"
                          />
                          <textarea
                            value={item.description}
                            onChange={(e) => updateRubric(item.id, 'description', e.target.value)}
                            placeholder="Description (optional)"
                            rows="2"
                            className="w-full p-3 border-2 border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-blue-500 resize-none"
                          />
                        </div>
                        <button
                          onClick={() => removeRubric(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    </div>
                  ))}

                  <Button
                    variant="ghost"
                    icon={Plus}
                    onClick={addRubricCriterion}
                    className="w-full"
                  >
                    Add Criterion
                  </Button>

                  <div className="pt-4 border-t-2 border-slate-200 flex justify-between items-center">
                    <span className="font-bold text-slate-700">Total Rubric Points</span>
                    <span className={`text-3xl font-black ${
                      totalRubricPoints === formData.maxPoints ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      {totalRubricPoints} / {formData.maxPoints}
                    </span>
                  </div>
                  {totalRubricPoints !== formData.maxPoints && (
                    <div className="p-3 bg-orange-50 border-2 border-orange-200 rounded-xl flex items-center gap-2 text-sm text-orange-700">
                      <AlertCircle size={16} />
                      <span>Total rubric points should equal maximum points</span>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>

          {/* Right Sidebar - Preview & Actions */}
          <div className="space-y-6">
            {/* Quick Preview */}
            <Card className="p-6 sticky top-24">
              <h3 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                <Eye size={20} className="text-blue-600" />
                Preview
              </h3>

              {formData.title && formData.courseId ? (
                <div className="space-y-4">
                  <div>
                    <div className="text-xs font-bold text-slate-500 mb-1">ASSIGNMENT</div>
                    <div className="font-black text-slate-900">{formData.title}</div>
                  </div>

                  {selectedCourse && (
                    <div>
                      <div className="text-xs font-bold text-slate-500 mb-1">COURSE</div>
                      <div className="font-bold text-slate-900">{selectedCourse.code}</div>
                      <div className="text-sm text-slate-600">{selectedCourse.name}</div>
                    </div>
                  )}

                  {formData.dueDate && (
                    <div>
                      <div className="text-xs font-bold text-slate-500 mb-1">DUE DATE</div>
                      <div className="font-bold text-slate-900">
                        {formData.dueDate} at {formData.dueTime}
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="text-xs font-bold text-slate-500 mb-1">POINTS</div>
                    <div className="text-2xl font-black text-blue-600">{formData.maxPoints}</div>
                  </div>

                  {formData.allowedFormats.length > 0 && (
                    <div>
                      <div className="text-xs font-bold text-slate-500 mb-2">ALLOWED FORMATS</div>
                      <div className="flex flex-wrap gap-1">
                        {formData.allowedFormats.map(format => (
                          <span key={format} className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs font-bold">
                            {format}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t-2 border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Late Submissions</span>
                      <span className={`font-bold ${formData.allowLateSubmission ? 'text-green-600' : 'text-red-600'}`}>
                        {formData.allowLateSubmission ? 'Allowed' : 'Not Allowed'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Multiple Attempts</span>
                      <span className={`font-bold ${formData.allowMultipleAttempts ? 'text-green-600' : 'text-red-600'}`}>
                        {formData.allowMultipleAttempts ? `Up to ${formData.maxAttempts}` : 'Single'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Grading Rubric</span>
                      <span className={`font-bold ${formData.rubricEnabled ? 'text-green-600' : 'text-slate-600'}`}>
                        {formData.rubricEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <FileText size={32} className="text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-600">Fill in the form to see preview</p>
                </div>
              )}
            </Card>

            {/* Action Buttons */}
            <Card className="p-6">
              <div className="space-y-3">
                <Button
                  variant="primary"
                  fullWidth
                  icon={isCreating ? null : Save}
                  onClick={handleSubmit}
                  disabled={isCreating || !formData.title || !formData.courseId || !formData.dueDate || formData.allowedFormats.length === 0}
                  className={isCreating ? 'animate-pulse' : ''}
                >
                  {isCreating ? 'Creating...' : 'Create Assignment'}
                </Button>
                
                <Button variant="ghost" fullWidth>
                  Save as Draft
                </Button>
              </div>
            </Card>

            {/* Tips */}
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
              <h3 className="text-lg font-black text-slate-900 mb-3">💡 Tips</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2 text-slate-700">
                  <CheckCircle size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Clear instructions improve submission quality</span>
                </div>
                <div className="flex items-start gap-2 text-slate-700">
                  <CheckCircle size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Use rubrics for consistent grading</span>
                </div>
                <div className="flex items-start gap-2 text-slate-700">
                  <CheckCircle size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Set realistic deadlines</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentCreate;