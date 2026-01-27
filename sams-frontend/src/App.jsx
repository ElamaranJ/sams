import React, { useState, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, Users, BookOpen, Calendar, QrCode, FileText, BarChart3, 
  Settings, User, Bell, Menu, X, Upload, CheckCircle, Clock,
  Award, TrendingUp, Target, GraduationCap, LogOut, Search,
  Mail, Lock, Eye, EyeOff, ChevronRight, Download, Filter,
  Camera, MapPin, Smartphone, Shield, Activity, Star, Plus,
  Video, MessageSquare, PlayCircle, ArrowRight, Zap, Globe,
  Briefcase, Code, Palette, PenTool, CheckSquare, AlertCircle
} from 'lucide-react';

// ============= CONTEXT =============
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

// ============= DUMMY DATA =============
const dummyData = {
  stats: {
    totalClasses: 4,
    activeStudents: 320,
    completedAssignments: 180,
    avgAttendance: 94
  },
  categories: [
    { id: 1, name: 'Computer Science', icon: Code, color: 'bg-blue-500', courses: 120 },
    { id: 2, name: 'Mathematics', icon: Target, color: 'bg-purple-500', courses: 85 },
    { id: 3, name: 'Business', icon: Briefcase, color: 'bg-green-500', courses: 95 },
    { id: 4, name: 'Design', icon: Palette, color: 'bg-orange-500', courses: 70 },
    { id: 5, name: 'Engineering', icon: Settings, color: 'bg-red-500', courses: 110 },
  ],
  featuredCourses: [
    { 
      id: 1, 
      title: 'Advanced Data Structures', 
      instructor: 'Dr. Sarah Miller',
      students: 45,
      rating: 4.8,
      price: 'Free',
      duration: '12 weeks',
      level: 'Advanced',
      image: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    { 
      id: 2, 
      title: 'Machine Learning Fundamentals', 
      instructor: 'Prof. John Davis',
      students: 38,
      rating: 4.9,
      price: 'Free',
      duration: '10 weeks',
      level: 'Intermediate',
      image: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    { 
      id: 3, 
      title: 'Web Development Bootcamp', 
      instructor: 'Ms. Emily Chen',
      students: 62,
      rating: 4.7,
      price: 'Free',
      duration: '16 weeks',
      level: 'Beginner',
      image: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
  ],
  universities: [
    { name: 'Stanford', logo: '🎓' },
    { name: 'MIT', logo: '🏛️' },
    { name: 'Harvard', logo: '📚' },
    { name: 'Duke', logo: '👨‍🎓' },
    { name: 'Penn', logo: '🎯' },
  ]
};

// ============= SHARED COMPONENTS =============
const Button = ({ children, variant = 'primary', onClick, className = '', icon: Icon, size = 'md', fullWidth = false }) => {
  const variants = {
    primary: 'bg-slate-800 hover:bg-slate-900 text-white shadow-lg shadow-slate-800/30',
    secondary: 'bg-white hover:bg-gray-50 text-slate-800 border-2 border-slate-200',
    accent: 'bg-amber-400 hover:bg-amber-500 text-slate-900 shadow-lg shadow-amber-400/30',
    ghost: 'hover:bg-slate-100 text-slate-700',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {Icon && <Icon size={20} />}
      {children}
    </motion.button>
  );
};

const Card = ({ children, className = '', hover = false, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className={`bg-white rounded-2xl border-2 border-slate-100 ${hover ? 'hover:shadow-xl hover:border-slate-200 transition-all duration-300 cursor-pointer' : ''} ${className}`}
  >
    {children}
  </motion.div>
);

// ============= NAVBAR =============
const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b-2 border-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-slate-800 to-slate-600 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden">
            <img 
              src="/logo.png"
              alt="SAMS Logo" 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = '<svg class="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/></svg>';
              }}
            />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
              SAMS
            </h1>
            <p className="text-xs text-slate-500 font-medium">Academic Management</p>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <button className="text-slate-700 hover:text-slate-900 font-semibold transition-colors">
            Online Degrees
          </button>
          <button className="text-slate-700 hover:text-slate-900 font-semibold transition-colors">
            Find your New Career
          </button>
          <button className="text-slate-700 hover:text-slate-900 font-semibold transition-colors">
            Blog
          </button>
          <button className="text-slate-700 hover:text-slate-900 font-semibold transition-colors">
            Contact
          </button>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <button className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors">
                <Search size={20} className="text-slate-700" />
              </button>
              <button className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors relative">
                <Bell size={20} className="text-slate-700" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowProfile(!showProfile)}
                  className="flex items-center gap-2 pl-2 pr-3 py-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <ChevronRight size={16} className="text-slate-400" />
                </button>

                {showProfile && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 mt-2 w-64 bg-white rounded-xl border-2 border-slate-100 shadow-xl overflow-hidden"
                  >
                    <div className="p-4 bg-gradient-to-br from-slate-50 to-blue-50 border-b-2 border-slate-100">
                      <p className="font-bold text-slate-900">{user?.name}</p>
                      <p className="text-sm text-slate-600">{user?.email}</p>
                      <p className="text-xs text-blue-600 mt-1 font-semibold capitalize">{user?.role}</p>
                    </div>
                    
                    <button className="w-full text-left px-4 py-3 hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-3 transition-colors">
                      <User size={18} /> Profile
                    </button>
                    
                    <button className="w-full text-left px-4 py-3 hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-3 transition-colors">
                      <Settings size={18} /> Settings
                    </button>
                    
                    <button 
                      onClick={() => {
                        logout();
                        navigate('/');
                        setShowProfile(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-red-50 text-red-600 font-medium flex items-center gap-3 transition-colors border-t-2 border-slate-100"
                    >
                      <LogOut size={18} /> Sign out
                    </button>
                  </motion.div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

// ============= HERO SECTION =============
const HeroSection = () => {
  return (
    <div className="relative min-h-[600px] bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 overflow-hidden">
      <div className="absolute top-20 right-10 w-72 h-72 bg-amber-200 rounded-full blur-3xl opacity-20"></div>
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-20"></div>
      
      <div className="relative max-w-7xl mx-auto px-6 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-block px-4 py-2 bg-amber-100 rounded-full mb-6">
              <span className="text-amber-800 font-bold text-sm">🎯 Smart Learning Platform</span>
            </div>
            
            <h1 className="text-6xl font-black text-slate-900 mb-6 leading-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Update your skills
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">
                without limits
              </span>
            </h1>
            
            <p className="text-lg text-slate-600 mb-8 max-w-md leading-relaxed">
              Master academic management with QR attendance, smart assignments, and real-time analytics. Learn from anywhere, anytime.
            </p>
            
            <div className="flex items-center gap-4 mb-12">
              <Link to="/login">
                <Button variant="primary" size="lg">
                  Explore classes
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="secondary" size="lg" icon={Plus}>
                  Create Account
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-8">
              <div>
                <div className="text-3xl font-black text-slate-900">320 K</div>
                <div className="text-sm text-slate-500">Active Students</div>
              </div>
              <div>
                <div className="text-3xl font-black text-slate-900">100%</div>
                <div className="text-sm text-slate-500">Success Rate</div>
              </div>
              <div>
                <div className="text-3xl font-black text-slate-900">98Q</div>
                <div className="text-sm text-slate-500">Total Courses</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="relative bg-gradient-to-br from-amber-400 to-orange-500 rounded-[40px] p-8 shadow-2xl">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border-2 border-white/20">
                <div className="aspect-[4/3] bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen size={48} className="text-white" />
                    </div>
                    <p className="text-white font-bold text-xl">Interactive Learning</p>
                  </div>
                </div>
              </div>
              
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-6 -right-6 bg-white rounded-2xl p-4 shadow-xl"
              >
                <Star className="text-amber-500" size={32} fill="currentColor" />
              </motion.div>
              
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="absolute -bottom-4 -left-4 bg-slate-800 rounded-2xl p-4 shadow-xl"
              >
                <Award className="text-amber-400" size={28} />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// ============= TRUSTED UNIVERSITIES =============
const TrustedSection = () => {
  return (
    <div className="py-16 bg-white border-y-2 border-slate-100">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-sm font-bold text-slate-500 mb-8 uppercase tracking-wider">
          Learn from more than 100 member universities
        </p>
        <div className="flex flex-wrap items-center justify-center gap-12">
          {['Stanford', 'MIT', 'Duke', 'Illinois', 'Penn'].map((uni, i) => (
            <motion.div
              key={uni}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="text-2xl font-black text-slate-300 hover:text-slate-600 transition-colors cursor-pointer"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              {uni}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============= CATEGORIES SECTION =============
const CategoriesSection = () => {
  return (
    <div className="py-20 bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-slate-900 mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
            More Courses from Categories
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Explore diverse subjects from world-class institutions
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {dummyData.categories.map((cat, i) => (
            <Card key={cat.id} hover delay={i * 0.1}>
              <div className="p-6 text-center">
                <div className={`w-16 h-16 ${cat.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                  <cat.icon size={32} className="text-white" />
                </div>
                <h3 className="font-bold text-slate-900 mb-1">{cat.name}</h3>
                <p className="text-sm text-slate-500">{cat.courses} Courses</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============= FEATURED COURSES =============
const FeaturedCoursesSection = () => {
  return (
    <div className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl font-black text-slate-900 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Featured Courses
            </h2>
            <p className="text-slate-600">Popular programs designed by experts</p>
          </div>
          <Button variant="ghost" icon={ArrowRight}>View All</Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {dummyData.featuredCourses.map((course, i) => (
            <Card key={course.id} hover delay={i * 0.1}>
              <div className="h-48 rounded-t-2xl" style={{ background: course.image }}></div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-lg text-xs font-bold">
                    {course.level}
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-xs font-bold">
                    {course.price}
                  </span>
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">{course.title}</h3>
                <p className="text-sm text-slate-600 mb-4">{course.instructor}</p>
                
                <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                  <span className="flex items-center gap-1">
                    <Users size={14} /> {course.students}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} /> {course.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star size={14} fill="currentColor" className="text-amber-500" /> {course.rating}
                  </span>
                </div>

                <Button variant="secondary" fullWidth size="sm">
                  Enroll Now
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============= INFO SECTION =============
const InfoSection = () => {
  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="p-8">
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
              <BookOpen size={28} className="text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Best University</h3>
            <p className="text-slate-600 text-sm mb-4">
              Learn from top-ranked institutions with world-class faculty
            </p>
            <button className="text-blue-600 font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">
              Learn More <ArrowRight size={16} />
            </button>
          </Card>

          <Card className="p-8">
            <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-4">
              <FileText size={28} className="text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Great materials</h3>
            <p className="text-slate-600 text-sm mb-4">
              Access comprehensive resources and study materials
            </p>
            <button className="text-purple-600 font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">
              Explore <ArrowRight size={16} />
            </button>
          </Card>

          <Card className="p-8">
            <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mb-4">
              <Award size={28} className="text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Professional Course</h3>
            <p className="text-slate-600 text-sm mb-4">
              Industry-recognized certifications and career advancement
            </p>
            <button className="text-green-600 font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">
              Get Started <ArrowRight size={16} />
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
};

// ============= VIDEO SECTION =============
const VideoSection = () => {
  return (
    <div className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(251,191,36,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>
      
      <div className="relative max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-5xl font-black text-white mb-6" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Watch our promo video
          </h2>
          <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto">
            Discover how SAMS transforms academic management with smart technology
          </p>

          <div className="relative aspect-video bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl overflow-hidden shadow-2xl">
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl"
              >
                <PlayCircle size={48} className="text-slate-900 ml-1" fill="currentColor" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// ============= LANDING PAGE =============
const Landing = () => {
  return (
    <>
      <HeroSection />
      <TrustedSection />
      <CategoriesSection />
      <FeaturedCoursesSection />
      <InfoSection />
      <VideoSection />
    </>
  );
};

// ============= SIDEBAR =============
const Sidebar = ({ role, activePage, setActivePage }) => {
  return (
    <div className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r-2 border-slate-100 overflow-y-auto">
      <div className="p-4 space-y-2">
        <button
          onClick={() => setActivePage('home')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
            activePage === 'home'
              ? 'bg-slate-900 text-white'
              : 'text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Home size={20} />
          <span>Dashboard</span>
        </button>
        
        <button
          onClick={() => setActivePage('assignments')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
            activePage === 'assignments'
              ? 'bg-slate-900 text-white'
              : 'text-slate-700 hover:bg-slate-50'
          }`}
        >
          <FileText size={20} />
          <span>Assignments</span>
        </button>
      </div>
    </div>
  );
};

// ============= LOGIN PAGE =============
const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    email: 'student@sams.edu', 
    password: '', 
    role: 'student' 
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    login({ 
      name: formData.role === 'student' ? 'Alex Johnson' : formData.role === 'faculty' ? 'Dr. Sarah Miller' : 'Admin User',
      email: formData.email,
      role: formData.role,
    });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center px-6 py-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="p-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg overflow-hidden">
              <img 
                src="/logo.png" 
                alt="SAMS Logo" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/></svg>';
                }}
              />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Welcome Back
            </h2>
            <p className="text-slate-600">Sign in to continue learning</p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="text-sm font-bold text-slate-700 mb-2 block">Select Your Role</label>
              <div className="grid grid-cols-3 gap-2">
                {['student', 'faculty', 'admin'].map(role => (
                  <button
                    key={role}
                    onClick={() => setFormData({...formData, role, email: `${role}@sams.edu`})}
                    className={`py-3 px-4 rounded-xl font-bold capitalize transition-all ${
                      formData.role === role
                        ? 'bg-slate-800 text-white shadow-lg'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700 mb-2 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-slate-800 transition-colors"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700 mb-2 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-slate-800 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button onClick={handleLogin} variant="primary" fullWidth className="mt-6">
              Sign In
            </Button>

            <p className="text-center text-sm text-slate-600 mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-slate-900 font-bold hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

// ============= REGISTER PAGE =============
const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    name: '',
    email: '', 
    password: '', 
    confirmPassword: '',
    role: 'student' 
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = () => {
    setError('');
    
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    login({ 
      name: formData.name,
      email: formData.email,
      role: formData.role,
    });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center px-6 py-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="p-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <GraduationCap size={32} className="text-white" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Create Account
            </h2>
            <p className="text-slate-600">Join SAMS and start learning today</p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="text-sm font-bold text-slate-700 mb-2 block">Select Your Role</label>
              <div className="grid grid-cols-3 gap-2">
                {['student', 'faculty', 'admin'].map(role => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setFormData({...formData, role})}
                    className={`py-3 px-4 rounded-xl font-bold capitalize transition-all ${
                      formData.role === role
                        ? 'bg-slate-800 text-white shadow-lg'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700 mb-2 block">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-slate-800 transition-colors"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700 mb-2 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-slate-800 transition-colors"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700 mb-2 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-slate-800 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700 mb-2 block">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-slate-800 transition-colors"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border-2 border-red-200 rounded-xl">
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            <Button onClick={handleRegister} variant="primary" fullWidth className="mt-6">
              Create Account
            </Button>

            <p className="text-center text-sm text-slate-600 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-slate-900 font-bold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

// ============= DASHBOARD (STUDENT VIEW) =============
const Dashboard = () => {
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
    </div>
  );
};

// ============= HOME PAGE =============
const HomePage = ({ role }) => {
  return <Dashboard />;
};

// ============= ASSIGNMENTS PAGE =============
const AssignmentsPage = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-black text-slate-900 mb-6">Assignments</h1>
      <p className="text-slate-600">Assignments page coming soon...</p>
    </div>
  );
};

// ============= PROTECTED ROUTE =============
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// ============= MAIN APP =============
const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

// ============= PAGE WRAPPERS =============
const LandingPage = () => {
  return (
    <>
      <Navbar />
      <Landing />
    </>
  );
};

const LoginPage = () => {
  return (
    <>
      <Navbar />
      <Login />
    </>
  );
};

const RegisterPage = () => {
  return (
    <>
      <Navbar />
      <Register />
    </>
  );
};

const DashboardPage = () => {
  const { user } = useAuth();
  const [activePage, setActivePage] = useState('home');

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <Sidebar role={user?.role} activePage={activePage} setActivePage={setActivePage} />
      <div className="ml-64 pt-16">
        {activePage === 'home' && <HomePage role={user?.role} />}
        {activePage === 'assignments' && <AssignmentsPage />}
      </div>
    </div>
  );
};

export default App;