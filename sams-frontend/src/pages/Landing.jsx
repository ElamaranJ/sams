import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, Users, Clock, Star, Award, ArrowRight, Plus,
  PlayCircle, Code, Target, Briefcase, Palette, Settings,
  FileText, GraduationCap
} from 'lucide-react';

const dummyData = {
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
};

const Button = ({ children, variant = 'primary', onClick, className = '', icon: Icon, size = 'md', fullWidth = false, to }) => {
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

  const buttonContent = (
    <>
      {Icon && <Icon size={20} />}
      {children}
    </>
  );

  const buttonClass = `rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`;

  if (to) {
    return (
      <Link to={to}>
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={onClick}
          className={buttonClass}
        >
          {buttonContent}
        </motion.button>
      </Link>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={buttonClass}
    >
      {buttonContent}
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
              <Button variant="primary" size="lg" to="/login">
                Explore classes
              </Button>
              <Button variant="secondary" size="lg" icon={Plus} to="/register">
                Create Account
              </Button>
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

const Landing = () => {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800;900&display=swap');
      `}</style>
      <div className="min-h-screen bg-white">
        <HeroSection />
        <TrustedSection />
        <CategoriesSection />
        <FeaturedCoursesSection />
        <InfoSection />
        <VideoSection />
      </div>
    </>
  );
};

export default Landing;