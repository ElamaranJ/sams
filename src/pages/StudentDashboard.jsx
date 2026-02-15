import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, BookOpen, Calendar, QrCode, FileText, 
  Award, CheckCircle, Clock, ArrowRight, Zap
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/shared/GlassCard';
import Chatbot from '../components/shared/Chatbot';
import { dummyData } from '../utils/dummyData';
import { useAuth } from '../context/AuthContext';

const StudentDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-black text-slate-900 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-lg text-slate-600">Ready to continue your learning journey?</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Active Courses', value: '4', icon: BookOpen, color: 'from-blue-500 to-blue-600' },
            { label: 'Assignments Due', value: '3', icon: FileText, color: 'from-orange-500 to-red-500' },
            { label: 'Attendance Rate', value: '94%', icon: CheckCircle, color: 'from-green-500 to-emerald-600' },
            { label: 'Overall Grade', value: 'A-', icon: Award, color: 'from-purple-500 to-pink-600' },
          ].map((stat, i) => (
            <Card key={i} delay={i * 0.1} className="p-6 bg-gradient-to-br hover:shadow-xl transition-shadow">
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                <stat.icon size={24} className="text-white" />
              </div>
              <div className="text-sm font-bold text-slate-500 mb-1">{stat.label}</div>
              <div className="text-3xl font-black text-slate-900">{stat.value}</div>
            </Card>
          ))}
        </div>

        <Card className="p-8 mb-12 bg-gradient-to-br from-amber-400 to-orange-500 text-white">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-lg mb-4">
                <span className="text-sm font-bold">⚡ Quick Action</span>
              </div>
              <h2 className="text-3xl font-black mb-3">Mark Your Attendance</h2>
              <p className="text-white/90 mb-6 text-lg">Scan QR code or enter OTP to mark today's attendance</p>
              <div className="flex gap-3">
                <Button variant="secondary" icon={QrCode}>Scan QR Code</Button>
                <Button variant="ghost" className="bg-white/10 hover:bg-white/20 text-white border-2 border-white/20">
                  Enter OTP
                </Button>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="w-48 h-48 bg-white/10 backdrop-blur-lg rounded-3xl border-4 border-white/20 flex items-center justify-center">
                <QrCode size={96} className="text-white" />
              </div>
            </div>
          </div>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-black text-slate-900 mb-6">Your Courses</h2>
            <div className="space-y-4">
              {dummyData.featuredCourses.map((course, i) => (
                <Card key={i} hover className="p-6">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 rounded-2xl flex-shrink-0" style={{ background: course.image }}></div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-slate-900 mb-1">{course.title}</h3>
                      <p className="text-sm text-slate-600 mb-3">{course.instructor}</p>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Users size={14} /> {course.students} enrolled
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} /> {course.duration}
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" icon={ArrowRight}>
                      Continue
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-black text-slate-900 mb-6">Upcoming</h2>
            <div className="space-y-4">
              <Card className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Calendar size={24} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-slate-900">CS 101 Lecture</div>
                    <div className="text-sm text-slate-500">Today, 10:00 AM</div>
                  </div>
                </div>
                <Button variant="secondary" fullWidth size="sm">Join Now</Button>
              </Card>

              <Card className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <FileText size={24} className="text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-slate-900">Math Assignment</div>
                    <div className="text-sm text-slate-500">Due Feb 3, 2026</div>
                  </div>
                </div>
                <Button variant="secondary" fullWidth size="sm">Submit</Button>
              </Card>

              <Card className="p-5 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                <div className="text-center">
                  <Zap size={32} className="text-purple-600 mx-auto mb-3" />
                  <div className="font-bold text-slate-900 mb-1">Learning Streak</div>
                  <div className="text-3xl font-black text-purple-600 mb-2">7 Days</div>
                  <div className="text-xs text-slate-600">Keep it up! 🔥</div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
};

export default StudentDashboard;