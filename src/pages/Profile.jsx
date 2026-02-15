import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Mail, Phone, MapPin, Calendar, Award, 
  BookOpen, TrendingUp, Edit, Camera, Save, X,
  Briefcase, GraduationCap, Star, Target
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/shared/GlassCard';
import Input from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || 'John Doe',
    email: user?.email || 'john.doe@example.com',
    phone: '+91 98765 43210',
    location: 'Chennai, Tamil Nadu',
    bio: 'Passionate about learning and technology. Computer Science student with a keen interest in web development and AI.',
    department: 'Computer Science',
    studentId: 'CS2024001',
    enrollmentYear: '2024',
    gpa: '3.8'
  });

  const stats = [
    { label: 'Courses Enrolled', value: '6', icon: BookOpen, color: 'from-blue-500 to-blue-600' },
    { label: 'Completed', value: '12', icon: Award, color: 'from-green-500 to-emerald-600' },
    { label: 'Current GPA', value: profileData.gpa, icon: TrendingUp, color: 'from-purple-500 to-purple-600' },
    { label: 'Attendance', value: '94%', icon: Target, color: 'from-orange-500 to-red-500' }
  ];

  const achievements = [
    { title: 'Dean\'s List', description: 'Fall 2024 Semester', icon: Star, color: 'text-yellow-600' },
    { title: 'Perfect Attendance', description: 'CS 101 Course', icon: Target, color: 'text-green-600' },
    { title: 'Top Performer', description: 'Database Systems', icon: Award, color: 'text-blue-600' },
    { title: 'Project Excellence', description: 'Web Development', icon: Briefcase, color: 'text-purple-600' }
  ];

  const recentCourses = [
    { code: 'CS 101', name: 'Introduction to Programming', grade: 'A', credits: 4 },
    { code: 'MATH 201', name: 'Discrete Mathematics', grade: 'A-', credits: 3 },
    { code: 'CS 202', name: 'Data Structures', grade: 'B+', credits: 4 },
    { code: 'WEB 301', name: 'Web Development', grade: 'A', credits: 3 }
  ];

  const handleSave = () => {
    // Add your save logic here (API call)
    console.log('Saving profile:', profileData);
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-black text-slate-900 mb-2">
            Profile 👤
          </h1>
          <p className="text-lg text-slate-600">Manage your personal information</p>
        </motion.div>

        {/* Profile Header Card */}
        <Card className="p-8 mb-8">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-32 h-32 bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl flex items-center justify-center text-white text-5xl font-black shadow-2xl">
                {profileData.name.charAt(0)}
              </div>
              <button className="absolute bottom-2 right-2 w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border-2 border-slate-200">
                <Camera size={18} className="text-slate-600" />
              </button>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 mb-2">
                    {profileData.name}
                  </h2>
                  <div className="flex items-center gap-4 text-slate-600 mb-2">
                    <span className="flex items-center gap-1">
                      <GraduationCap size={18} />
                      {profileData.department}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase size={18} />
                      Student ID: {profileData.studentId}
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed max-w-2xl">
                    {profileData.bio}
                  </p>
                </div>
                <Button
                  variant={isEditing ? 'ghost' : 'secondary'}
                  icon={isEditing ? X : Edit}
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-4 mt-6">
                {stats.map((stat, i) => (
                  <div key={i} className="p-4 bg-slate-50 rounded-xl border-2 border-slate-100">
                    <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center mb-2`}>
                      <stat.icon size={20} className="text-white" />
                    </div>
                    <div className="text-2xl font-black text-slate-900 mb-1">{stat.value}</div>
                    <div className="text-xs text-slate-600 font-semibold">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Personal Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-8">
              <h3 className="text-2xl font-black text-slate-900 mb-6">
                Personal Information
              </h3>

              {isEditing ? (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <Input
                      label="Full Name"
                      icon={User}
                      value={profileData.name}
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    />
                    <Input
                      label="Email Address"
                      icon={Mail}
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <Input
                      label="Phone Number"
                      icon={Phone}
                      value={profileData.phone}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    />
                    <Input
                      label="Location"
                      icon={MapPin}
                      value={profileData.location}
                      onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors resize-none"
                      rows="4"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button icon={Save} onClick={handleSave}>
                      Save Changes
                    </Button>
                    <Button variant="ghost" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                    <Mail className="text-blue-600" size={20} />
                    <div>
                      <div className="text-xs text-slate-500 font-semibold">Email</div>
                      <div className="text-sm font-bold text-slate-900">{profileData.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                    <Phone className="text-green-600" size={20} />
                    <div>
                      <div className="text-xs text-slate-500 font-semibold">Phone</div>
                      <div className="text-sm font-bold text-slate-900">{profileData.phone}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                    <MapPin className="text-red-600" size={20} />
                    <div>
                      <div className="text-xs text-slate-500 font-semibold">Location</div>
                      <div className="text-sm font-bold text-slate-900">{profileData.location}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                    <Calendar className="text-purple-600" size={20} />
                    <div>
                      <div className="text-xs text-slate-500 font-semibold">Enrolled Since</div>
                      <div className="text-sm font-bold text-slate-900">{profileData.enrollmentYear}</div>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* Recent Courses */}
            <Card className="p-8">
              <h3 className="text-2xl font-black text-slate-900 mb-6">
                Recent Courses
              </h3>
              <div className="space-y-3">
                {recentCourses.map((course, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <BookOpen size={20} className="text-blue-600" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{course.name}</div>
                        <div className="text-sm text-slate-600">{course.code} • {course.credits} Credits</div>
                      </div>
                    </div>
                    <div className={`text-2xl font-black ${
                      course.grade.startsWith('A') ? 'text-green-600' :
                      course.grade.startsWith('B') ? 'text-blue-600' :
                      'text-orange-600'
                    }`}>
                      {course.grade}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Achievements */}
            <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
              <h3 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                <Award size={24} className="text-amber-600" />
                Achievements
              </h3>
              <div className="space-y-3">
                {achievements.map((achievement, i) => (
                  <div key={i} className="p-3 bg-white rounded-xl border-2 border-amber-100">
                    <div className="flex items-center gap-3 mb-1">
                      <achievement.icon size={18} className={achievement.color} />
                      <div className="font-bold text-slate-900 text-sm">{achievement.title}</div>
                    </div>
                    <div className="text-xs text-slate-600 ml-7">{achievement.description}</div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Academic Progress */}
            <Card className="p-6">
              <h3 className="text-xl font-black text-slate-900 mb-4">
                Academic Progress
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold text-slate-700">Semester Progress</span>
                    <span className="font-black text-slate-900">75%</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full w-[75%]"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold text-slate-700">Assignments Complete</span>
                    <span className="font-black text-slate-900">18/20</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full w-[90%]"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold text-slate-700">Course Completion</span>
                    <span className="font-black text-slate-900">12/15</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full w-[80%]"></div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;